import { NextRequest, NextResponse } from 'next/server';
import { Client, validateSignature } from '@line/bot-sdk';
import type { WebhookRequestBody, MessageEvent, TextEventMessage } from '@line/bot-sdk';
import { fetchFaq } from '@/lib/sheet';
import { buildSystemPrompt } from '@/lib/prompt';
import { getChatReply } from '@/lib/openai';
import { upsertLead } from '@/lib/lead';
import {
  extractFromText,
  accumulateLeadData,
  getLeadData,
  hasPhone,
  isHandoffTrigger,
  isAwaitingPhone,
  startPhoneAwait,
  handlePhoneAwait,
  buildLeadPayload,
} from '@/lib/leadCapture';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cache display names to avoid repeated LINE Profile API calls
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
    const profile = await client.getProfile(userId);
    displayNameCache.set(userId, profile.displayName);
    return profile.displayName;
  } catch {
    return '';
  }
}

async function replyText(client: Client, replyToken: string, text: string): Promise<void> {
  try {
    await client.replyMessage(replyToken, { type: 'text', text });
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
  try {
    signatureValid = validateSignature(rawBody, channelSecret, signature);
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    console.warn('[Webhook] Invalid LINE signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const body = JSON.parse(rawBody) as WebhookRequestBody;
  const client = getLineClient();

  await Promise.all(
    body.events.map(async (event) => {
      if (event.type !== 'message' || event.message.type !== 'text') return;

      const msgEvent = event as MessageEvent;
      const textMsg = msgEvent.message as TextEventMessage;
      const userId = msgEvent.source.userId ?? 'unknown';
      const replyToken = msgEvent.replyToken;

      const userMessage = textMsg.text?.trim() ?? '';
      if (!userMessage || userMessage.length > 2000) return;

      console.log(`[Webhook] userId=${userId} msg="${userMessage.substring(0, 60)}"`);

      if (isRateLimited(userId)) {
        await replyText(client, replyToken, 'ขออภัยครับ ส่งข้อความมาถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ครับ');
        return;
      }

      // ── 1. Extract data passively from every message ─────────────────────
      const extracted = extractFromText(userMessage);
      accumulateLeadData(userId, extracted);

      // ── 2. Get display name (cached) ──────────────────────────────────────
      const displayName = await getDisplayName(client, userId);
      if (displayName) accumulateLeadData(userId, {});

      // ── 3. Phone capture: awaiting phone from previous handoff ────────────
      if (isAwaitingPhone(userId)) {
        const result = handlePhoneAwait(userId, userMessage, displayName);

        if (result.handled) {
          await replyText(client, replyToken, result.reply);

          if (result.phoneCaptured) {
            const leadData = getLeadData(userId);
            const leadPayload = buildLeadPayload(userId, displayName, leadData);
            await upsertLead({
              ...leadPayload,
              last_question: userMessage.substring(0, 300),
            }).catch((err: unknown) => {
              console.error('[Webhook] CRM save after phone capture failed:', err);
            });
          }
          return;
        }
        // Phone not detected — fall through to OpenAI (bot will naturally re-ask)
      }

      // ── 4. Handoff trigger: ask for phone if not yet captured ─────────────
      if (isHandoffTrigger(userMessage) && !hasPhone(userId)) {
        const msg = startPhoneAwait(userId);
        await replyText(client, replyToken, msg);
        await upsertLead({
          line_user_id: userId,
          display_name: displayName,
          last_question: userMessage.substring(0, 300),
          lead_status: 'interested',
          follow_up_status: 'awaiting_phone',
        }).catch(() => {});
        return;
      }

      // ── 5. Normal OpenAI flow ──────────────────────────────────────────────
      const faqs = await fetchFaq();
      const systemPrompt = buildSystemPrompt(faqs, userMessage);
      const reply = await getChatReply(userId, systemPrompt, userMessage);

      await replyText(client, replyToken, reply);

      // Save partial CRM data after each message
      const currentData = getLeadData(userId);
      await upsertLead({
        line_user_id: userId,
        display_name: displayName,
        ...currentData,
        last_question: userMessage.substring(0, 300),
        lead_status: hasPhone(userId) ? 'qualified' : 'new',
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Webhook] CRM save failed: ${msg}`);
      });
    })
  );

  return NextResponse.json({ ok: true });
}
