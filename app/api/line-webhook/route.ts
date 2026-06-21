import { NextRequest, NextResponse } from 'next/server';
import { Client, validateSignature } from '@line/bot-sdk';
import type { WebhookRequestBody, MessageEvent, TextEventMessage, TextMessage } from '@line/bot-sdk';
import { fetchFaq } from '@/lib/sheet';
import { buildSystemPrompt } from '@/lib/prompt';
import { getChatReply } from '@/lib/openai';
import { upsertLead } from '@/lib/lead';
import { isAdmin, isAdminCommand, handleAdminCommand } from '@/lib/admin';
import { notifyAdminIfNeeded, shouldNotifyHighScore } from '@/lib/adminNotify';
import {
  extractFromText,
  accumulateLeadData,
  getLeadData,
  hasPhone,
  getMissingFields,
  getLeadCompleteness,
  getCurrentState,
  getStateDebugInfo,
  setLastIntent,
  buildStatePayload,
  isContactTrigger,
  isQuoteTrigger,
  isInterestTrigger,
  isAnyTrigger,
  PREMIUM_QUOTE_FIELDS,
  isAwaitingPhone,
  handlePhoneAwait,
  isAwaitingGoal,
  handleGoalAwait,
  isAwaitingField,
  startFieldCapture,
  handleFieldCapture,
  isAwaitingCategory,
  startCategoryFlow,
  handleCategoryAwait,
  isAwaitingResume,
  startResumeFlow,
  handleResumeAwait,
  hasExpiredStateForResume,
  trySmartResume,
  cancelFieldCapture,
  cancelAwaitingPhone,
  buildLeadPayload,
  buildQuoteSummary,
  buildHandoffSummary,
  extractProductFromText,
  isHandoffTrigger,
  HANDOFF_REQUIRED_FIELDS,
  QR_INSURANCE_CATEGORIES,
  type QuickReplyOption,
} from '@/lib/leadCapture';

export const dynamic    = 'force-dynamic';
export const maxDuration = 30;

// ─── Version probe ────────────────────────────────────────────────────────────
const CODE_VERSION = 'v11-admin-notify';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, version: CODE_VERSION, ts: new Date().toISOString() });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap     = new Map<string, { count: number; resetAt: number }>();
const displayNameCache = new Map<string, string>();

function isRateLimited(userId: string): boolean {
  const now   = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

function getLineClient(): Client {
  return new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret:      process.env.LINE_CHANNEL_SECRET!,
  });
}

async function getDisplayName(client: Client, userId: string): Promise<string> {
  if (displayNameCache.has(userId)) return displayNameCache.get(userId)!;
  try {
    const p = await client.getProfile(userId);
    displayNameCache.set(userId, p.displayName);
    return p.displayName;
  } catch { return ''; }
}

// replyToken is one-time-use per LINE event → always ONE call per event
async function sendReply(
  client: Client,
  replyToken: string,
  text: string,
  quickReply?: QuickReplyOption[]
): Promise<void> {
  const msg: TextMessage = { type: 'text', text };
  if (quickReply?.length) {
    msg.quickReply = {
      items: quickReply.map((o) => ({
        type: 'action' as const,
        action: { type: 'message' as const, label: o.label, text: o.text },
      })),
    };
  }
  try {
    await client.replyMessage(replyToken, msg);
  } catch (err) {
    console.error('[Webhook] replyMessage failed:', err);
  }
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.error('[Webhook] LINE_CHANNEL_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const rawBody   = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';
  let signatureValid = false;
  try { signatureValid = validateSignature(rawBody, channelSecret, signature); } catch { /* */ }

  if (!signatureValid) {
    console.warn('[Webhook] Invalid LINE signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const body   = JSON.parse(rawBody) as WebhookRequestBody;
  const client = getLineClient();

  await Promise.all(
    body.events.map(async (event) => {
      if (event.type !== 'message' || event.message.type !== 'text') return;

      const msgEvent   = event as MessageEvent;
      const textMsg    = msgEvent.message as TextEventMessage;
      const userId     = msgEvent.source.userId ?? 'unknown';
      const replyToken = msgEvent.replyToken;

      const userMessage = textMsg.text?.trim() ?? '';
      if (!userMessage || userMessage.length > 2000) return;

      if (isRateLimited(userId)) {
        await sendReply(client, replyToken, 'ขออภัยครับ ส่งมาถี่เกินไป รอสักครู่แล้วลองใหม่ครับ');
        return;
      }

      // ── 1. Passive extraction ─────────────────────────────────────────────
      accumulateLeadData(userId, extractFromText(userMessage));
      const displayName = await getDisplayName(client, userId);

      // ── 2. Admin commands (#reset / #debug / #whoami / #help) ─────────────
      if (isAdminCommand(userMessage)) {
        if (isAdmin(userId)) {
          const result = handleAdminCommand(userId, userMessage, displayName);
          await sendReply(client, replyToken, result.reply);
        } else {
          await sendReply(client, replyToken, 'คำสั่งนี้ใช้ได้เฉพาะผู้ดูแลระบบครับ');
        }
        return;
      }

      // ── 3. Debug logging ──────────────────────────────────────────────────
      const { score, total }          = getLeadCompleteness(userId);
      const missingHandoff            = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
      const dbg                       = getStateDebugInfo(userId);
      const isQT                      = isQuoteTrigger(userMessage);
      const isCT                      = isContactTrigger(userMessage);
      const isIT                      = isInterestTrigger(userMessage);
      const isHT                      = isHandoffTrigger(userMessage);
      const maskedId                  = `${userId.substring(0, 8)}***`;
      console.log(
        `[Lead] v=${CODE_VERSION}` +
        ` uid=${maskedId}` +
        ` current_state=${dbg.currentState}` +
        ` last_state=${dbg.lastState}` +
        ` last_intent=${dbg.lastIntent}` +
        ` state_age_min=${dbg.stateAgeMinutes}` +
        ` score=${score}/${total}` +
        ` missing_handoff=${missingHandoff.join(',') || 'none'}` +
        ` isHandoff=${isHT} isQuote=${isQT} isContact=${isCT} isInterest=${isIT}` +
        ` msg="${userMessage.substring(0, 40)}"`
      );

      // ── 4. Resume prompt response ─────────────────────────────────────────
      if (isAwaitingResume(userId)) {
        const result = handleResumeAwait(userId, userMessage);
        if (!result.fallthrough) {
          if (result.reply) await sendReply(client, replyToken, result.reply, result.quickReply);
          if (result.resumed && result.reply) return; // already replied with next field
          if (result.reset) return;
          if (result.resumed) { /* fall through to field capture if reply was empty */ }
          else return;
        }
        // fallthrough: intent detected mid-resume → continue below
      }

      // ── 5. Expired-state smart resume ─────────────────────────────────────
      // If field capture expired but stateMetadata shows pending field within 7d:
      //   a) If user's message directly answers the pending field → auto-restore silently
      //   b) If not an intent trigger → show "คุยต่อ / เริ่มใหม่?" prompt
      if (!isAwaitingField(userId) && !isAwaitingResume(userId) && hasExpiredStateForResume(userId)) {
        const autoResult = trySmartResume(userId, userMessage);
        if (autoResult) {
          // Auto-resumed: user's message was a valid field answer
          if (autoResult.reply) {
            await sendReply(client, replyToken, autoResult.reply, autoResult.quickReply);
          } else if (autoResult.done && autoResult.allCaptured) {
            await handleAllCaptured(autoResult.mode, userId, displayName, userMessage, client, replyToken);
          }
          return;
        }

        // Can't auto-resume → if not an intent trigger, show resume prompt
        if (!isAnyTrigger(userMessage)) {
          setLastIntent(userId, 'resume_prompt');
          const prompt = startResumeFlow(userId);
          await sendReply(client, replyToken, prompt.reply, prompt.quickReply);
          return;
        }
        // Intent trigger → skip resume prompt, fall through to intent handlers
      }

      // ── 6. Targeted field capture ─────────────────────────────────────────
      if (isAwaitingField(userId)) {
        if (isAnyTrigger(userMessage)) {
          console.log('[Lead] intent switch while awaiting_field — cancelling');
          cancelFieldCapture(userId);
          // fall through to intent handlers
        } else {
          const result = handleFieldCapture(userId, userMessage);

          if (result.reply) {
            await sendReply(client, replyToken, result.reply, result.quickReply);
            // Partial CRM + admin notification after phone is captured mid-flow
            if (result.capturedField === 'phone') {
              const d = getLeadData(userId);
              await upsertLead({
                line_user_id: userId, display_name: displayName,
                phone: d.phone ?? '', follow_up_status: 'Collecting Info',
                ...buildStatePayload(userId),
              }).catch(logCrmErr);
              notifyAdminIfNeeded(userId, displayName, d, 'phone_first').catch(logNotifyErr);
            }
          } else if (result.done && result.allCaptured) {
            await handleAllCaptured(result.mode, userId, displayName, userMessage, client, replyToken);
          } else if (result.done && result.cancelled) {
            await sendReply(client, replyToken, result.reply);
          }
          return;
        }
      }

      // ── 7. Category await ─────────────────────────────────────────────────
      if (isAwaitingCategory(userId) && !isAnyTrigger(userMessage)) {
        const catResult = handleCategoryAwait(userId, userMessage);
        if (catResult.cancelled) {
          await sendReply(client, replyToken, catResult.reply);
          return;
        }
        const category = getLeadData(userId).product_interest ?? userMessage;
        const missing  = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
        if (missing.length > 0) {
          const intro  = `😊 ${category}\n\nขอข้อมูลเพิ่มเล็กน้อยนะครับ`;
          const fieldQ = startFieldCapture(userId, missing, intro, 'handoff');
          await sendReply(client, replyToken, fieldQ.reply, fieldQ.quickReply);
        } else {
          const data = getLeadData(userId);
          await sendReply(client, replyToken, buildHandoffSummary(data));
          await saveHandoffCrm(userId, displayName, userMessage);
        }
        await saveCrm(userId, displayName, userMessage);
        return;
      }

      // ── 8. Goal capture ───────────────────────────────────────────────────
      if (isAwaitingGoal(userId) && !isQuoteTrigger(userMessage)) {
        const result = handleGoalAwait(userId, userMessage, displayName);
        await sendReply(client, replyToken, result.reply, result.quickReply);
        if (result.done && !result.cancelled) {
          const data    = getLeadData(userId);
          const payload = buildLeadPayload(userId, displayName, data);
          await upsertLead({
            ...payload,
            last_question: userMessage.substring(0, 300),
            ...buildStatePayload(userId),
          }).catch(logCrmErr);
        }
        return;
      }

      // ── 9. Phone capture ──────────────────────────────────────────────────
      if (isAwaitingPhone(userId)) {
        if (isQuoteTrigger(userMessage) || isInterestTrigger(userMessage)) {
          cancelAwaitingPhone(userId);
          // fall through
        } else {
          const result = handlePhoneAwait(userId, userMessage);
          if (result.reply) {
            await sendReply(client, replyToken, result.reply, result.quickReply);
            if (result.phoneCaptured) {
              await upsertLead({
                line_user_id: userId, display_name: displayName,
                phone: result.phoneCaptured, lead_status: 'interested',
                follow_up_status: 'awaiting_goal',
                ...buildStatePayload(userId),
              }).catch(logCrmErr);
            }
            return;
          }
          // No phone detected → fall through to OpenAI
        }
      }

      // ── 10. Interest trigger → 6-category Quick Reply ─────────────────────
      if (isInterestTrigger(userMessage)) {
        setLastIntent(userId, 'interest');
        const result = startCategoryFlow(userId);
        await sendReply(client, replyToken, result.reply, result.quickReply);
        return;
      }

      // ── 11. Handoff trigger → collect 6 required fields → summary ────────
      // Covers: เช็กเบี้ย, ค่าเบี้ยเท่าไร, ขอใบเสนอราคา, สนใจสมัคร, ให้ติดต่อกลับ, etc.
      if (isHandoffTrigger(userMessage)) {
        setLastIntent(userId, 'handoff');
        cancelAwaitingPhone(userId);
        const data    = getLeadData(userId);
        const missing = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
        console.log(`[Lead] intent=handoff missing=${missing.join(',') || 'none'}`);

        // Immediate admin alert for high-intent trigger words
        const msgN = userMessage.normalize('NFC').toLowerCase();
        const HIGH_INTENT = ['สมัครเลย', 'คุยกับคุณจิราวัฒน์'];
        if (HIGH_INTENT.some((w) => msgN.includes(w.normalize('NFC').toLowerCase()))) {
          notifyAdminIfNeeded(userId, displayName, data, 'trigger_word').catch(logNotifyErr);
        }

        if (missing.length === 0) {
          await sendReply(client, replyToken, buildHandoffSummary(data));
          await saveHandoffCrm(userId, displayName, userMessage);
        } else {
          const fieldQ = startFieldCapture(userId, missing, undefined, 'handoff');
          await sendReply(client, replyToken, fieldQ.reply, fieldQ.quickReply);
        }
        return;
      }

      // ── 12. Product mention → premium quote (age/gender/budget) ──────────
      // Catches: "ประกันสุขภาพ", "Good Health Prime", etc. without a trigger prefix.
      const mentionedProduct = extractProductFromText(userMessage);
      if (mentionedProduct) {
        setLastIntent(userId, 'product_mention');
        accumulateLeadData(userId, { product_interest: mentionedProduct });
        const missing = getMissingFields(userId, PREMIUM_QUOTE_FIELDS);
        console.log(`[Lead] intent=product_mention product=${mentionedProduct} missing=${missing.join(',') || 'none'}`);
        if (missing.length === 0) {
          await sendReply(client, replyToken, buildQuoteSummary(getLeadData(userId)));
          await saveQuoteCrm(userId, displayName, userMessage);
        } else {
          const fieldQ = startFieldCapture(userId, missing, undefined, 'premium_quote');
          await sendReply(client, replyToken, fieldQ.reply, fieldQ.quickReply);
        }
        return;
      }

      // ── 13. Normal OpenAI flow ─────────────────────────────────────────────
      setLastIntent(userId, 'openai');
      const faqs         = await fetchFaq();
      const systemPrompt = buildSystemPrompt(faqs, userMessage);
      const reply        = await getChatReply(userId, systemPrompt, userMessage);
      await sendReply(client, replyToken, reply);

      await saveCrm(userId, displayName, userMessage);
    })
  );

  return NextResponse.json({ ok: true });
}

// ─── Shared allCaptured handler ───────────────────────────────────────────────
// Called from both regular and auto-resume field capture completion paths.
async function handleAllCaptured(
  mode: string | undefined,
  userId: string, displayName: string, lastMsg: string,
  client: Client, replyToken: string
): Promise<void> {
  if (mode === 'handoff') {
    const data = getLeadData(userId);
    await sendReply(client, replyToken, buildHandoffSummary(data));
    await saveHandoffCrm(userId, displayName, lastMsg);
    return;
  }
  if (mode === 'premium_quote') {
    const data = getLeadData(userId);
    await sendReply(client, replyToken, buildQuoteSummary(data));
    await saveQuoteCrm(userId, displayName, lastMsg);
    return;
  }
  // general / unknown — check if handoff fields are still missing
  const missingHandoff = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
  if (missingHandoff.length > 0) {
    const msg    = `รับข้อมูลแล้วครับ 😊 ยังขาดอีก ${missingHandoff.length} ข้อ`;
    const fieldQ = startFieldCapture(userId, missingHandoff, msg, 'handoff');
    await sendReply(client, replyToken, fieldQ.reply, fieldQ.quickReply);
  } else {
    const data = getLeadData(userId);
    await sendReply(client, replyToken, buildHandoffSummary(data));
    await saveHandoffCrm(userId, displayName, lastMsg);
  }
}

// ─── CRM save helpers ─────────────────────────────────────────────────────────

async function saveQuoteCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  console.log(`[CRM] quote save uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question: lastMsg.substring(0, 300),
    purchase_objective: 'เช็กเบี้ย/ขอใบเสนอราคา',
    follow_up_status: 'Quotation Requested',
    lead_status: data.phone ? 'hot' : 'warm',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
}

async function saveHandoffCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  console.log(`[CRM] handoff save uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question: lastMsg.substring(0, 300),
    purchase_objective: data.purchase_objective || 'ขอให้ติดต่อกลับ',
    follow_up_status: 'Contact Requested',
    lead_status: 'hot',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
  // Admin notification — fire-and-forget, never blocks customer reply
  notifyAdminIfNeeded(userId, displayName, data, 'handoff_complete').catch(logNotifyErr);
}

async function saveCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  const { score, total } = getLeadCompleteness(userId);
  console.log(`[CRM] save score=${score}/${total} uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question: lastMsg.substring(0, 300),
    lead_status: hasPhone(userId) ? 'qualified' : 'new',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
  // Notify admin if lead score crosses 70 for the first time
  if (shouldNotifyHighScore(data)) {
    notifyAdminIfNeeded(userId, displayName, data, 'score_high').catch(logNotifyErr);
  }
}

function logCrmErr(err: unknown): void {
  console.error(`[CRM] save error: ${err instanceof Error ? err.message : String(err)}`);
}

function logNotifyErr(err: unknown): void {
  console.error(`[Handoff] notify error: ${err instanceof Error ? err.message : String(err)}`);
}
