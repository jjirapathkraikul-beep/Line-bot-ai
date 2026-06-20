import { NextRequest, NextResponse } from 'next/server';
import { Client, validateSignature } from '@line/bot-sdk';
import type { WebhookRequestBody, MessageEvent, TextEventMessage } from '@line/bot-sdk';
import { fetchFaq } from '@/lib/sheet';
import { buildSystemPrompt } from '@/lib/prompt';
import { getChatReply } from '@/lib/openai';
import { upsertLead } from '@/lib/lead';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

// In-memory rate limit tracker: userId → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';

  if (!validateSignature(rawBody, process.env.LINE_CHANNEL_SECRET!, signature)) {
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

      const rawText = textMsg.text?.trim() ?? '';
      if (!rawText || rawText.length > 2000) return;

      const userMessage = rawText;

      console.log(`[Webhook] userId=${userId} ts=${Date.now()} msg="${userMessage.substring(0, 60)}"`);

      if (isRateLimited(userId)) {
        try {
          await client.replyMessage(replyToken, {
            type: 'text',
            text: 'ขออภัยครับ ส่งข้อความมาถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ครับ',
          });
        } catch (err) {
          console.error('[Webhook] Rate-limit reply failed:', err);
        }
        return;
      }

      const faqs = await fetchFaq();
      const systemPrompt = buildSystemPrompt(faqs, userMessage);
      const reply = await getChatReply(userId, systemPrompt, userMessage);

      try {
        await client.replyMessage(replyToken, { type: 'text', text: reply });
      } catch (err) {
        console.error('[Webhook] LINE reply failed:', err);
      }

      // Update CRM — fire and forget, never block the reply
      upsertLead({
        line_user_id: userId,
        last_question: userMessage.substring(0, 500),
      }).catch(() => {});
    })
  );

  return NextResponse.json({ ok: true });
}
