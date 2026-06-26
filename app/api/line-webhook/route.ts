import { NextRequest, NextResponse } from 'next/server';
import { Client, validateSignature } from '@line/bot-sdk';
import type { WebhookRequestBody, MessageEvent, TextEventMessage, TextMessage, PostbackEvent } from '@line/bot-sdk';
import { fetchFaq } from '@/lib/sheet';
import { buildSystemPrompt } from '@/lib/prompt';
import { getChatReply } from '@/lib/openai';
import { upsertLead } from '@/lib/lead';
import { isAdmin, isAdminCommand, handleAdminCommand } from '@/lib/admin';
import { notifyAdminIfNeeded } from '@/lib/adminNotify';
import { hydrateAll, dehydrateAll, saveSession, deleteSession } from '@/lib/session';
import { isTrustTrigger, buildTrustResponse } from '@/lib/trustEngine';
import { buildMedicalResponse } from '@/lib/medicalEngine';
import { logAuditEvent } from '@/lib/conversationAudit';
import { aboutJirawatMessage } from '@/lib/richMessages';
import {
  handleAllCaptured,
  saveHandoffCrm,
  saveQuoteCrm,
  saveCrm,
  saveUnderwritingCrm,
  logNotifyErr,
} from '@/lib/leadService';
import {
  extractFromText,
  accumulateLeadData,
  getLeadData,
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
  isUnderwritingTrigger,
  detectRichMenuCommand,
  PREMIUM_QUOTE_FIELDS,
  CONTACT_FLOW_FIELDS,
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
  buildQuoteSummary,
  buildHandoffSummary,
  extractProductFromText,
  HANDOFF_REQUIRED_FIELDS,
  cancelAllCapture,
  clearLeadData,
  clearStateMetadata,
  type QuickReplyOption,
} from '@/lib/leadCapture';

export const dynamic    = 'force-dynamic';
export const maxDuration = 30;

// ─── Version probe ────────────────────────────────────────────────────────────
const CODE_VERSION = 'v1.9-stability';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, version: CODE_VERSION, ts: new Date().toISOString() });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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

async function getDisplayName(client: Client, userId: string, cachedName?: string): Promise<string> {
  if (cachedName) return cachedName;
  try {
    const p = await client.getProfile(userId);
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

  let body: WebhookRequestBody;
  try {
    body = JSON.parse(rawBody) as WebhookRequestBody;
  } catch {
    console.error('[Webhook] Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const client = getLineClient();

  await Promise.all(
    body.events.map(async (event) => {
      // ── Postback events ────────────────────────────────────────────────────
      if (event.type === 'postback') {
        const pb       = event as PostbackEvent;
        const uid      = pb.source.userId ?? 'unknown';
        const pbAction = pb.postback.data;
        const maskedPbId = `${uid.substring(0, 8)}***`;

        console.log(`[Webhook] postback action=${pbAction} uid=${maskedPbId}`);

        if (pbAction === 'action=about_jirawat') {
          try { await client.replyMessage(pb.replyToken, aboutJirawatMessage); } catch { /* */ }
          return;
        }

        // Rich Menu postbacks that require state management
        const PB_RICH_CMD: Record<string, string> = {
          'action=contact_jirawat':       'contact_jirawat',
          'action=health_insurance':      'health_insurance',
          'action=cancer_insurance':      'cancer_insurance',
          'action=tax_planning':          'tax_planning',
          'action=investment_retirement': 'investment_retirement',
        };
        const pbRichCmd = PB_RICH_CMD[pbAction];
        if (pbRichCmd) {
          const pbSess = await hydrateAll(uid);
          cancelAllCapture(uid);
          setLastIntent(uid, `rich_menu:${pbRichCmd}`);
          console.log(`[Intent] postback uid=${maskedPbId} detected_intent=rich_menu cmd=${pbRichCmd}`);

          let replyText = '';
          let replyQR: QuickReplyOption[] | undefined;

          if (pbRichCmd === 'contact_jirawat') {
            const pbLeadData = getLeadData(uid);
            const missing    = getMissingFields(uid, CONTACT_FLOW_FIELDS);
            if (missing.length === 0) {
              replyText = buildHandoffSummary(pbLeadData);
            } else {
              const intro  = 'ยินดีให้บริการครับ 😊\n\nเพื่อให้คุณจิราวัฒน์ติดต่อกลับตามเวลาที่สะดวก';
              const fieldQ = startFieldCapture(uid, missing, intro, 'handoff');
              replyText = fieldQ.reply;
              replyQR   = fieldQ.quickReply;
            }
          } else {
            const PB_PRODUCT: Record<string, string> = {
              health_insurance:      'ประกันสุขภาพ',
              cancer_insurance:      'ประกันมะเร็งและโรคร้ายแรง',
              tax_planning:          'ประกันลดหย่อนภาษี',
              investment_retirement: 'ประกันควบการลงทุน Unit Linked',
            };
            const product = PB_PRODUCT[pbRichCmd];
            accumulateLeadData(uid, { product_interest: product });
            const missing = getMissingFields(uid, PREMIUM_QUOTE_FIELDS);
            const fieldQ  = startFieldCapture(uid, missing, undefined, 'premium_quote');
            replyText = fieldQ.reply;
            replyQR   = fieldQ.quickReply;
          }

          if (replyText) {
            const msg: TextMessage = { type: 'text', text: replyText };
            if (replyQR?.length) {
              msg.quickReply = {
                items: replyQR.map((o) => ({
                  type: 'action' as const,
                  action: { type: 'message' as const, label: o.label, text: o.text },
                })),
              };
            }
            try { await client.replyMessage(pb.replyToken, msg); } catch { /* */ }
          }
          await saveSession(uid, dehydrateAll(uid, { ...pbSess })).catch(logSessionErr);
        }

        return;
      }

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

      // ── 1. Load session from KV + hydrate all in-memory Maps ─────────────
      const session     = await hydrateAll(userId);
      const displayName = await getDisplayName(client, userId, session.displayName);

      // Helper to send + persist state in one step
      const reply = (text: string, qr?: QuickReplyOption[]) =>
        sendReply(client, replyToken, text, qr);

      // ── 2. Passive extraction ──────────────────────────────────────────────
      accumulateLeadData(userId, extractFromText(userMessage));

      // ── 3. Admin commands ──────────────────────────────────────────────────
      if (isAdminCommand(userMessage)) {
        if (!isAdmin(userId)) {
          await reply('คำสั่งนี้ใช้ได้เฉพาะผู้ดูแลระบบครับ');
          return;
        }

        // #testnotify — async, handled before the sync handler
        if (userMessage.trim().toLowerCase() === '#testnotify') {
          console.log(`[Admin] command=#testnotify userId=${userId.substring(0, 8)}***`);
          const mockData = {
            real_name: 'ทดสอบระบบ', age: '35', gender: 'ชาย',
            phone: '0812345678', preferred_contact_time: 'ช่วงเช้า 09:00-12:00',
            product_interest: 'ประกันสุขภาพ', budget: '5000',
          };
          const adminId = process.env.ADMIN_LINE_USER_ID ?? '';
          const token   = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';
          if (!adminId || !token) {
            await reply('❌ ADMIN_LINE_USER_ID หรือ LINE_CHANNEL_ACCESS_TOKEN ยังไม่ได้ตั้งค่าครับ');
            return;
          }
          try {
            const lc   = new Client({ channelAccessToken: token });
            const text = [
              '🔥 HOT LEAD เข้าใหม่ [TEST]', '',
              `👤 ชื่อ: ${mockData.real_name}`,
              `🎂 อายุ: ${mockData.age} ปี`,
              `🚻 เพศ: ${mockData.gender}`,
              `📞 เบอร์: ${mockData.phone}`,
              `🕒 เวลาสะดวก: ${mockData.preferred_contact_time}`,
              `📌 สนใจ: ${mockData.product_interest}`,
              `⭐ Lead Score: 80/100`,
              `📍 Lead Status: HOT`, '',
              '📝 สรุป:',
              'สนใจ: ประกันสุขภาพ | ช่วงเวลา: ช่วงเช้า 09:00-12:00 | ทดสอบระบบแจ้งเตือน', '',
              '✅ แนะนำให้ติดต่อกลับทันที',
            ].join('\n');
            await lc.pushMessage(adminId, { type: 'text', text });
            await reply('✅ ส่งการแจ้งเตือนทดสอบไปแล้วครับ\n\nตรวจสอบ LINE ส่วนตัวของ Admin ได้เลยครับ');
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[Admin] #testnotify failed: ${msg}`);
            await reply(`❌ ส่งไม่สำเร็จ: ${msg}`);
          }
          return;
        }

        // #reset — also clears KV session
        if (userMessage.trim().toLowerCase() === '#reset') {
          cancelAllCapture(userId);
          clearLeadData(userId);
          clearStateMetadata(userId);
          await deleteSession(userId).catch((e) =>
            console.error('[Admin] deleteSession error:', e instanceof Error ? e.message : String(e))
          );
          await reply(
            '🔄 รีเซ็ตข้อมูลการทดสอบเรียบร้อยแล้วครับ\n\n' +
            'สิ่งที่ถูกล้าง:\n' +
            '• State (field capture)\n' +
            '• Lead data ใน memory + KV\n\n' +
            'พร้อมเริ่มทดสอบใหม่ครับ 🧪'
          );
          return;
        }

        const result = handleAdminCommand(userId, userMessage, displayName);
        await reply(result.reply);
        return;
      }

      // ── 4. Debug logging ──────────────────────────────────────────────────
      const { score, total }          = getLeadCompleteness(userId);
      const missingHandoff            = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
      const dbg                       = getStateDebugInfo(userId);
      const isQT                      = isQuoteTrigger(userMessage);
      const isCT                      = isContactTrigger(userMessage);
      const isIT                      = isInterestTrigger(userMessage);
      const isUWT                     = isUnderwritingTrigger(userMessage);
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
        ` isQuote=${isQT} isContact=${isCT} isInterest=${isIT} isUnderwriting=${isUWT}` +
        ` msg="${userMessage.substring(0, 40)}"`
      );

      // ─── Intent Priority Router ────────────────────────────────────────────
      // Runs BEFORE state handlers. High-priority intents override current state.
      // Priority: B(RichMenu) > C(Underwriting) > D(Contact) > E(Product) > F(Quote) > G(Interest)
      // Each matched branch: cancelAllCapture → set intent → handle → return early

      const stateBefore = getCurrentState(userId);
      const logIntentDone = (priority: string, intent: string) =>
        console.log(
          `[Intent:done] v=${CODE_VERSION} uid=${maskedId}` +
          ` priority=${priority} intent=${intent} state_after=${getCurrentState(userId)}`
        );

      // ── Priority B: Rich Menu text commands ──────────────────────────────
      const richCmd = detectRichMenuCommand(userMessage);
      if (richCmd) {
        cancelAllCapture(userId);
        setLastIntent(userId, `rich_menu:${richCmd}`);
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=rich_menu intent_priority=B cmd=${richCmd} action=route_rich_menu`
        );

        if (richCmd === 'about_jirawat') {
          await client.replyMessage(replyToken, aboutJirawatMessage);
          logIntentDone('B', 'rich_menu:about_jirawat');
          await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
          return;
        }

        if (richCmd === 'contact_jirawat') {
          const data    = getLeadData(userId);
          const missing = getMissingFields(userId, CONTACT_FLOW_FIELDS);
          if (missing.length === 0) {
            await reply(buildHandoffSummary(data));
            await saveHandoffCrm(userId, displayName, userMessage);
          } else {
            const intro  = 'ยินดีให้บริการครับ 😊\n\nเพื่อให้คุณจิราวัฒน์ติดต่อกลับตามเวลาที่สะดวก';
            const fieldQ = startFieldCapture(userId, missing, intro, 'handoff');
            await reply(fieldQ.reply, fieldQ.quickReply);
          }
          logIntentDone('B', 'rich_menu:contact_jirawat');
          await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
          return;
        }

        const RICH_MENU_PRODUCT: Record<string, string> = {
          health_insurance:      'ประกันสุขภาพ',
          cancer_insurance:      'ประกันมะเร็งและโรคร้ายแรง',
          tax_planning:          'ประกันลดหย่อนภาษี',
          investment_retirement: 'ประกันควบการลงทุน Unit Linked',
        };
        const rmProduct = RICH_MENU_PRODUCT[richCmd];
        if (rmProduct) {
          accumulateLeadData(userId, { product_interest: rmProduct });
          const missing = getMissingFields(userId, PREMIUM_QUOTE_FIELDS);
          const fieldQ  = startFieldCapture(userId, missing, undefined, 'premium_quote');
          await reply(fieldQ.reply, fieldQ.quickReply);
          logIntentDone('B', `rich_menu:${richCmd}`);
          await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
          return;
        }
      }

      // ── Priority C: Trust / Fraud concern (v2) ──────────────────────────
      // Must fire BEFORE underwriting/contact — never ask phone after trust concern.
      if (isTrustTrigger(userMessage)) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'trust_concern');
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=trust_concern intent_priority=C action=build_trust`
        );

        await reply(buildTrustResponse(userMessage));

        logIntentDone('C', 'trust_concern');
        const trustData = getLeadData(userId);
        logAuditEvent({
          userId: maskedId, message: userMessage.substring(0, 100),
          detected_intent: 'trust_concern', priority: 'C',
          current_state_before: stateBefore, action_taken: 'build_trust',
          current_state_after: getCurrentState(userId),
          lead_fields_known: Object.keys(trustData).filter((k) => !!(trustData as Record<string, unknown>)[k]),
          handoff_triggered: false, timestamp: new Date().toISOString(),
        });
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── Priority D: Underwriting / Medical condition intent ──────────────
      // v2: Answer medical question FIRST (AIOS: Answer Before Asking).
      // Do NOT start field capture. Ask one medical follow-up. CRM saves available data.
      if (isUnderwritingTrigger(userMessage)) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'medical_inquiry');
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=medical_inquiry intent_priority=D action=answer_medical_first`
        );

        // Answer the medical question carefully + ask one relevant follow-up
        await reply(buildMedicalResponse(userMessage));

        // CRM + admin notify with whatever data we have (phone may be missing — OK)
        await saveUnderwritingCrm(userId, displayName, userMessage);

        logIntentDone('D', 'medical_inquiry');
        const medData = getLeadData(userId);
        logAuditEvent({
          userId: maskedId, message: userMessage.substring(0, 100),
          detected_intent: 'medical_inquiry', priority: 'D',
          current_state_before: stateBefore, action_taken: 'answer_medical_first',
          current_state_after: getCurrentState(userId),
          lead_fields_known: Object.keys(medData).filter((k) => !!(medData as Record<string, unknown>)[k]),
          handoff_triggered: false, timestamp: new Date().toISOString(),
        });
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── Priority D: Contact trigger → name / phone / time only ──────────
      if (isContactTrigger(userMessage)) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'contact');
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=contact intent_priority=D action=contact_flow`
        );

        const data    = getLeadData(userId);
        const missing = getMissingFields(userId, CONTACT_FLOW_FIELDS);

        const msgN = userMessage.normalize('NFC').toLowerCase();
        const HIGH_INTENT = ['สมัครเลย', 'คุยกับคุณจิราวัฒน์'];
        if (HIGH_INTENT.some((w) => msgN.includes(w.normalize('NFC').toLowerCase()))) {
          notifyAdminIfNeeded(userId, displayName, data, 'trigger_word').catch(logNotifyErr);
        }

        if (missing.length === 0) {
          await reply(buildHandoffSummary(data));
          await saveHandoffCrm(userId, displayName, userMessage);
        } else {
          const intro  = 'ยินดีให้บริการครับ 😊\n\nเพื่อให้คุณจิราวัฒน์ติดต่อกลับ รบกวนขอข้อมูลเล็กน้อยครับ';
          const fieldQ = startFieldCapture(userId, missing, intro, 'handoff');
          await reply(fieldQ.reply, fieldQ.quickReply);
        }
        await saveCrm(userId, displayName, userMessage);
        logIntentDone('D', 'contact');
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── Priority E: Product mention → premium quote (moved before interest) ─
      const mentionedProduct = extractProductFromText(userMessage);
      if (mentionedProduct) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'product_mention');
        accumulateLeadData(userId, { product_interest: mentionedProduct });
        const missing = getMissingFields(userId, PREMIUM_QUOTE_FIELDS);
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=product_mention intent_priority=E` +
          ` product=${mentionedProduct} missing=${missing.join(',') || 'none'}`
        );

        if (missing.length === 0) {
          await reply(buildQuoteSummary(getLeadData(userId)));
          await saveQuoteCrm(userId, displayName, userMessage);
        } else {
          const fieldQ = startFieldCapture(userId, missing, undefined, 'premium_quote');
          await reply(fieldQ.reply, fieldQ.quickReply);
        }
        logIntentDone('E', `product_mention:${mentionedProduct}`);
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── Priority F: Quote trigger → full handoff (age/gender/product/contact)
      if (isQuoteTrigger(userMessage)) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'quote');
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=quote intent_priority=F action=handoff_flow`
        );

        const data    = getLeadData(userId);
        const missing = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
        console.log(`[Lead] intent=quote missing=${missing.join(',') || 'none'}`);

        if (missing.length === 0) {
          await reply(buildHandoffSummary(data));
          await saveHandoffCrm(userId, displayName, userMessage);
        } else {
          const fieldQ = startFieldCapture(userId, missing, undefined, 'handoff');
          await reply(fieldQ.reply, fieldQ.quickReply);
        }
        logIntentDone('F', 'quote');
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── Priority G: Interest trigger → 6-category Quick Reply ───────────
      if (isInterestTrigger(userMessage)) {
        cancelAllCapture(userId);
        setLastIntent(userId, 'interest');
        console.log(
          `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
          ` detected_intent=interest intent_priority=G action=category_flow`
        );

        const result = startCategoryFlow(userId);
        await reply(result.reply, result.quickReply);
        logIntentDone('G', 'interest');
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ─── State Handlers ─────────────────────────────────────────────────────
      // Reached only when no priority intent matched — process as state continuation.
      console.log(
        `[Intent] v=${CODE_VERSION} uid=${maskedId} state_before=${stateBefore}` +
        ` detected_intent=none intent_priority=state_handler`
      );

      // ── 5. Resume prompt response ──────────────────────────────────────────
      if (isAwaitingResume(userId)) {
        const result = handleResumeAwait(userId, userMessage);
        if (!result.fallthrough) {
          if (result.reply) await reply(result.reply, result.quickReply);
          if (result.reset) {
            await deleteSession(userId).catch(logSessionErr);
            return;
          }
          if (result.resumed && result.reply) {
            await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
            return;
          }
          if (result.resumed) { /* fall through to field capture */ }
          else return;
        }
      }

      // ── 6. Expired-state smart resume ─────────────────────────────────────
      if (!isAwaitingField(userId) && !isAwaitingResume(userId) && hasExpiredStateForResume(userId)) {
        const autoResult = trySmartResume(userId, userMessage);
        if (autoResult) {
          if (autoResult.reply) {
            await reply(autoResult.reply, autoResult.quickReply);
          } else if (autoResult.done && autoResult.allCaptured) {
            await handleAllCaptured(autoResult.mode, userId, displayName, userMessage, reply);
          }
          return;
        }
        setLastIntent(userId, 'resume_prompt');
        const prompt = startResumeFlow(userId);
        await reply(prompt.reply, prompt.quickReply);
        return;
      }

      // ── 7. Targeted field capture (no intent match → treat as field answer) ─
      if (isAwaitingField(userId)) {
        const result = handleFieldCapture(userId, userMessage);

        if (result.reply) {
          await reply(result.reply, result.quickReply);
          if (result.capturedField === 'phone') {
            const d = getLeadData(userId);
            await upsertLead({
              line_user_id: userId, display_name: displayName,
              phone: d.phone ?? '', follow_up_status: 'Collecting Info',
              ...buildStatePayload(userId),
            }).catch((e) => console.error('[CRM] partial phone save:', e instanceof Error ? e.message : String(e)));
            notifyAdminIfNeeded(userId, displayName, d, 'phone_first').catch(logNotifyErr);
          }
        } else if (result.done && result.allCaptured) {
          await handleAllCaptured(result.mode, userId, displayName, userMessage, reply);
        } else if (result.done && result.cancelled) {
          await reply(result.reply);
        }

        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── 8. Category await ─────────────────────────────────────────────────
      if (isAwaitingCategory(userId) && !isAnyTrigger(userMessage)) {
        const catResult = handleCategoryAwait(userId, userMessage);
        if (catResult.cancelled) {
          await reply(catResult.reply);
          return;
        }
        const category = getLeadData(userId).product_interest ?? userMessage;
        const missing  = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
        if (missing.length > 0) {
          const intro  = `😊 ${category}\n\nขอข้อมูลเพิ่มเล็กน้อยนะครับ`;
          const fieldQ = startFieldCapture(userId, missing, intro, 'handoff');
          await reply(fieldQ.reply, fieldQ.quickReply);
        } else {
          const data = getLeadData(userId);
          await reply(buildHandoffSummary(data));
          await saveHandoffCrm(userId, displayName, userMessage);
        }
        await saveCrm(userId, displayName, userMessage);
        await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
        return;
      }

      // ── 12. Normal OpenAI flow ─────────────────────────────────────────────
      setLastIntent(userId, 'openai');
      const faqs         = await fetchFaq();
      // Pass known lead data so OpenAI does not re-ask fields already captured
      const systemPrompt = buildSystemPrompt(faqs, userMessage, getLeadData(userId));
      const aiReply      = await getChatReply(userId, systemPrompt, userMessage);
      await reply(aiReply);
      logIntentDone('H', 'openai_fallback');

      await saveCrm(userId, displayName, userMessage);
      await saveSession(userId, dehydrateAll(userId, { ...session, displayName })).catch(logSessionErr);
    })
  );

  return NextResponse.json({ ok: true });
}

function logSessionErr(err: unknown): void {
  console.error(`[Session] save error: ${err instanceof Error ? err.message : String(err)}`);
}
