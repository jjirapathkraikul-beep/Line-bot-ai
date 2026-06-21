import { NextRequest, NextResponse } from 'next/server';
import { Client, validateSignature } from '@line/bot-sdk';
import type { WebhookRequestBody, MessageEvent, TextEventMessage, TextMessage } from '@line/bot-sdk';
import { fetchFaq } from '@/lib/sheet';
import { buildSystemPrompt } from '@/lib/prompt';
import { getChatReply } from '@/lib/openai';
import { upsertLead } from '@/lib/lead';
import {
  extractFromText,
  accumulateLeadData,
  getLeadData,
  hasPhone,
  getMissingFields,
  getLeadCompleteness,
  getCurrentState,
  isContactTrigger,
  isQuoteTrigger,
  isAnyTrigger,
  QUOTE_REQUIRED_FIELDS,
  isAwaitingPhone,
  startPhoneAwait,
  handlePhoneAwait,
  isAwaitingGoal,
  handleGoalAwait,
  isAwaitingField,
  startFieldCapture,
  handleFieldCapture,
  cancelFieldCapture,
  cancelAwaitingPhone,
  buildLeadPayload,
  buildExistingDataSummary,
  type QuickReplyOption,
} from '@/lib/leadCapture';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CODE_VERSION = 'b8e5698-v4';

// GET: version probe — curl this to verify which code is deployed
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, version: CODE_VERSION, ts: new Date().toISOString() });
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap     = new Map<string, { count: number; resetAt: number }>();
const displayNameCache = new Map<string, string>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
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
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
  });
}

async function getDisplayName(client: Client, userId: string): Promise<string> {
  if (displayNameCache.has(userId)) return displayNameCache.get(userId)!;
  try {
    const p = await client.getProfile(userId);
    displayNameCache.set(userId, p.displayName);
    return p.displayName;
  } catch {
    return '';
  }
}

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.error('[Webhook] LINE_CHANNEL_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const rawBody = await req.text();
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

      // ── 2. Log current state ──────────────────────────────────────────────
      const { score, total, missing: missingScored } = getLeadCompleteness(userId);
      const state = getCurrentState(userId);
      const isQT  = isQuoteTrigger(userMessage);
      const isCT  = isContactTrigger(userMessage);
      const msgHex = Buffer.from(userMessage, 'utf8').toString('hex').substring(0, 60);
      console.log(
        `[Lead] v=${CODE_VERSION} state=${state} score=${score}/${total}` +
        ` isQuote=${isQT} isContact=${isCT}` +
        ` missing_scored=${missingScored.join(',') || 'none'}` +
        ` msg="${userMessage.substring(0, 40)}"` +
        ` hex=${msgHex}`
      );

      // ── 3. Targeted field capture ─────────────────────────────────────────
      if (isAwaitingField(userId)) {
        // If user changed intent mid-flow, cancel capture and process new intent
        if (isAnyTrigger(userMessage)) {
          console.log(`[Lead] intent switch detected while awaiting_field — cancelling capture`);
          cancelFieldCapture(userId);
          // fall through to handle new intent
        } else {
          const result = handleFieldCapture(userId, userMessage);

          if (result.reply) {
            await sendReply(client, replyToken, result.reply, result.quickReply);
          }

          if (result.done && result.allCaptured) {
            const { score: s, total: t } = getLeadCompleteness(userId);
            await sendReply(
              client, replyToken,
              `ขอบคุณครับ ✅ ข้อมูลครบแล้ว (${s}/${t})\nสอบถามเรื่องเบี้ยหรือแผนประกันได้เลยครับ 😊`
            );
            await saveCrm(userId, displayName, userMessage);
          }
          return;
        }
      }

      // ── 4. Goal capture (after phone) ─────────────────────────────────────
      if (isAwaitingGoal(userId) && !isQuoteTrigger(userMessage)) {
        const result = handleGoalAwait(userId, userMessage, displayName);
        await sendReply(client, replyToken, result.reply, result.quickReply);

        if (result.done && !result.cancelled) {
          const data    = getLeadData(userId);
          const payload = buildLeadPayload(userId, displayName, data);
          await upsertLead({ ...payload, last_question: userMessage.substring(0, 300) }).catch(logCrmErr);
        }
        return;
      }

      // ── 5. Phone capture ──────────────────────────────────────────────────
      if (isAwaitingPhone(userId)) {
        // If user switched to quote intent, clear phone state and fall through
        if (isQuoteTrigger(userMessage)) {
          console.log(`[Lead] intent switch to quote — cancelling phone await`);
          cancelAwaitingPhone(userId);
          // fall through to quote handling
        } else {
          const result = handlePhoneAwait(userId, userMessage);

          if (result.reply) {
            await sendReply(client, replyToken, result.reply, result.quickReply);
            if (result.phoneCaptured) {
              await upsertLead({
                line_user_id: userId, display_name: displayName,
                phone: result.phoneCaptured,
                lead_status: 'interested', follow_up_status: 'awaiting_goal',
              }).catch(logCrmErr);
            }
            return;
          }
          // No phone detected — fall through to OpenAI
        }
      }

      // ── 6. Quote trigger: เช็กเบี้ย / คำนวณเบี้ย ─────────────────────────
      if (isQuoteTrigger(userMessage)) {
        cancelAwaitingPhone(userId); // Clear any stale phone-await state

        const data    = getLeadData(userId);
        const missing = getMissingFields(userId, QUOTE_REQUIRED_FIELDS);
        const { score: qs, total: qt } = getLeadCompleteness(userId);

        console.log(
          `[Lead] intent=quote missing_required=${missing.join(',') || 'none'} score=${qs}/${qt}`
        );

        if (missing.length === 0) {
          // ✅ All required fields present — go to OpenAI quotation flow
          console.log(`[Lead] Quote request complete — routing to OpenAI`);
          // fall through to OpenAI
        } else {
          // Show existing data + ask only for what's missing
          const existingSummary = buildExistingDataSummary(data);
          const missingLabel = missing
            .map((f) => ({ age: 'อายุ', gender: 'เพศ', product_interest: 'แผนที่สนใจ' }[f] ?? f))
            .join(', ');

          let introText: string;
          if (existingSummary) {
            introText =
              `📋 ข้อมูลที่มีอยู่แล้ว\n${existingSummary}\n\n` +
              `เพื่อคำนวณเบี้ยเพิ่มเติม ขอข้อมูล: ${missingLabel}`;
          } else {
            introText = `เช็กเบี้ยให้ได้เลยครับ 😊\nขอข้อมูลเพิ่มนิดนึงครับ (${missingLabel})`;
          }

          const fieldQ = startFieldCapture(userId, missing);
          await sendReply(client, replyToken, introText);
          if (fieldQ.reply) {
            await sendReply(client, replyToken, fieldQ.reply, fieldQ.quickReply);
          }
          return;
        }
      }

      // ── 7. Contact trigger → ask phone (only if not already captured) ─────
      if (isContactTrigger(userMessage) && !hasPhone(userId)) {
        const result = startPhoneAwait(userId);
        await sendReply(client, replyToken, result.reply);
        await upsertLead({
          line_user_id: userId, display_name: displayName,
          last_question: userMessage.substring(0, 300),
          lead_status: 'interested', follow_up_status: 'awaiting_phone',
        }).catch(logCrmErr);
        return;
      }

      // ── 8. Normal OpenAI flow ─────────────────────────────────────────────
      const faqs = await fetchFaq();
      const systemPrompt = buildSystemPrompt(faqs, userMessage);
      const reply = await getChatReply(userId, systemPrompt, userMessage);
      await sendReply(client, replyToken, reply);

      await saveCrm(userId, displayName, userMessage);
    })
  );

  return NextResponse.json({ ok: true });
}

async function saveCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  const { score, total } = getLeadCompleteness(userId);
  console.log(`[CRM] save score=${score}/${total} userId=${userId}`);
  await upsertLead({
    line_user_id: userId,
    display_name: displayName,
    ...data,
    last_question: lastMsg.substring(0, 300),
    lead_status: hasPhone(userId) ? 'qualified' : 'new',
  }).catch(logCrmErr);
}

function logCrmErr(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[CRM] save error: ${msg}`);
}
