import { Client } from '@line/bot-sdk';
import { upsertLead } from './lead';
import type { ExtractedData } from './leadCapture';
import { computeLeadScore } from './scorer';

export type NotifyReason = 'phone_first' | 'handoff_complete' | 'score_high' | 'trigger_word' | 'underwriting' | 'gen1_handoff';

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
    gen1_handoff:     'Gen1 — ลูกค้าพร้อม handoff',
  };
  parts.push(reasonLabel[reason]);
  return parts.join(' | ');
}

// ─── Gen1 notification format ─────────────────────────────────────────────────
// Used by CRM Flow Gen1 (crmFlowGen1.ts) for richer handoff notifications.

export interface Gen1NotifyOptions {
  displayName: string;
  leadStatus:     string;
  followUpStatus: string;
  jpStatus:       string;
  productInterest?: string;
  interestCategory?: string;
  budgetAnnual?: string;
  phone?: string;
  realName?: string;
  preferredContactTime?: string;
  pendingIssue?: string;
  conversationSummary?: string;
}

export function buildGen1NotifyText(opts: Gen1NotifyOptions): string {
  const f = (v?: string, fallback = 'ไม่ระบุ') => v?.trim() || fallback;
  const lines: string[] = [
    '🔥 Lead ใหม่ — ต้องติดต่อกลับ',
    '',
    `ชื่อ: ${f(opts.realName, opts.displayName)}`,
    `เบอร์: ${f(opts.phone)}`,
    `เวลาที่สะดวก: ${f(opts.preferredContactTime, 'สะดวกตลอดเวลา')}`,
    '',
    `สนใจ: ${f(opts.interestCategory)}`,
    `ผลิตภัณฑ์: ${f(opts.productInterest)}`,
    opts.budgetAnnual ? `งบ: ${Number(opts.budgetAnnual).toLocaleString('th-TH')} บาท/ปี` : '',
    '',
    `สถานะ Lead: ${f(opts.leadStatus)}`,
    `Follow-up: ${f(opts.followUpStatus)}`,
    `JP Status: ${f(opts.jpStatus, 'Open')}`,
  ];

  if (opts.pendingIssue) {
    lines.push('', 'ประเด็นที่ต้องให้จิราวัฒน์ดู:', opts.pendingIssue);
  }
  if (opts.conversationSummary) {
    lines.push('', 'สรุปการสนทนา:', opts.conversationSummary);
  }

  return lines.filter((l) => l !== undefined).join('\n');
}

export async function notifyGen1Handoff(
  userId: string,
  opts: Gen1NotifyOptions,
): Promise<void> {
  const adminUserId  = process.env.ADMIN_LINE_USER_ID;
  const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!adminUserId || !channelToken) {
    console.warn('[Handoff] ADMIN_LINE_USER_ID or LINE_CHANNEL_ACCESS_TOKEN not set — skipping');
    return;
  }
  const reason: NotifyReason = 'gen1_handoff';
  if (alreadySent(userId, reason)) {
    console.log(`[Handoff] Gen1 skipped duplicate notification uid=${userId.substring(0, 8)}***`);
    return;
  }
  const text = buildGen1NotifyText(opts);
  const lineClient = new Client({ channelAccessToken: channelToken });
  try {
    await lineClient.pushMessage(adminUserId, { type: 'text', text });
    markSent(userId, reason);
    console.log(`[Handoff] Gen1 notified admin uid=${userId.substring(0, 8)}***`);
    upsertLead({
      line_user_id:        userId,
      handoff_notified_at: new Date().toISOString(),
      handoff_reason:      reason,
    }).catch((err) =>
      console.error(`[Handoff] Gen1 CRM metadata failed: ${err instanceof Error ? err.message : String(err)}`)
    );
  } catch (err) {
    console.error(`[Handoff] Gen1 notify failed: ${err instanceof Error ? err.message : String(err)}`);
  }
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
