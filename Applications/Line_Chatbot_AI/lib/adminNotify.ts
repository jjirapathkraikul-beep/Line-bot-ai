import { Client } from '@line/bot-sdk';
import { upsertLead } from './lead';
import type { ExtractedData } from './leadCapture';
import { computeLeadScore } from './scorer';

export type NotifyReason = 'phone_first' | 'handoff_complete' | 'score_high' | 'trigger_word' | 'underwriting';

// In-memory dedup — hydrated from KV session at request start via injectNotifiedReasons
const sentMap = new Map<string, Set<string>>();

// ─── Session bridge ───────────────────────────────────────────────────────────
export function injectNotifiedReasons(userId: string, reasons: string[]): void {
  if (reasons.length > 0) sentMap.set(userId, new Set(reasons));
  else sentMap.delete(userId);
}
export function extractNotifiedReasons(userId: string): string[] {
  return Array.from(sentMap.get(userId) ?? []);
}

function alreadySent(userId: string, reason: NotifyReason): boolean {
  return sentMap.get(userId)?.has(reason) ?? false;
}

function markSent(userId: string, reason: NotifyReason): void {
  if (!sentMap.has(userId)) sentMap.set(userId, new Set());
  sentMap.get(userId)!.add(reason);
}

function buildSummaryLine(data: ExtractedData, reason: NotifyReason): string {
  const parts: string[] = [];
  if (data.product_interest) parts.push(`สนใจ: ${data.product_interest}`);
  if (data.preferred_contact_time) parts.push(`ช่วงเวลา: ${data.preferred_contact_time}`);
  const reasonLabel: Record<NotifyReason, string> = {
    phone_first:      'ลูกค้าเพิ่งให้เบอร์โทรครั้งแรก',
    handoff_complete: 'ข้อมูลครบ — พร้อม handoff',
    score_high:       'Lead Score ถึงเกณฑ์ ≥70',
    trigger_word:     'ลูกค้าพร้อมสมัคร / ขอคุย',
    underwriting:     'มีโรคประจำตัว — ต้องพิจารณาเป็นรายกรณี',
  };
  parts.push(reasonLabel[reason]);
  return parts.join(' | ');
}

function buildNotifyText(
  displayName: string,
  data: ExtractedData,
  score: number,
  reason: NotifyReason
): string {
  const f = (v?: string) => v?.trim() || '-';
  return [
    '🔥 HOT LEAD เข้าใหม่',
    '',
    `👤 ชื่อ: ${f(data.real_name)} (${displayName})`,
    `🎂 อายุ: ${data.age ? data.age + ' ปี' : '-'}`,
    `🚻 เพศ: ${f(data.gender)}`,
    `📞 เบอร์: ${f(data.phone)}`,
    `🕒 เวลาสะดวก: ${f(data.preferred_contact_time)}`,
    `📌 สนใจ: ${f(data.product_interest)}`,
    `⭐ Lead Score: ${score}/100`,
    `📍 Lead Status: HOT`,
    '',
    '📝 สรุป:',
    buildSummaryLine(data, reason),
    '',
    '✅ แนะนำให้ติดต่อกลับทันที',
  ].join('\n');
}

export async function notifyAdminIfNeeded(
  userId: string,
  displayName: string,
  data: ExtractedData,
  reason: NotifyReason
): Promise<void> {
  const adminUserId  = process.env.ADMIN_LINE_USER_ID;
  const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!adminUserId || !channelToken) {
    console.warn('[Handoff] ADMIN_LINE_USER_ID or LINE_CHANNEL_ACCESS_TOKEN not set — skipping');
    return;
  }

  if (alreadySent(userId, reason)) {
    console.log(`[Handoff] skipped duplicate notification uid=${userId.substring(0, 8)}*** reason=${reason}`);
    return;
  }

  const score = computeLeadScore(data);
  const text  = buildNotifyText(displayName, data, score, reason);

  const lineClient = new Client({ channelAccessToken: channelToken });

  try {
    await lineClient.pushMessage(adminUserId, { type: 'text', text });
    markSent(userId, reason);
    console.log(`[Handoff] notified admin uid=${userId.substring(0, 8)}*** reason=${reason} score=${score}`);

    // Update CRM with notification metadata (fire-and-forget, never blocks customer reply)
    upsertLead({
      line_user_id:        userId,
      handoff_notified_at: new Date().toISOString(),
      handoff_reason:      reason,
    }).catch((err) =>
      console.error(`[Handoff] CRM metadata update failed: ${err instanceof Error ? err.message : String(err)}`)
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Handoff] failed reason=${msg}`);
  }
}

export function shouldNotifyHighScore(data: ExtractedData): boolean {
  return computeLeadScore(data) >= 70;
}
