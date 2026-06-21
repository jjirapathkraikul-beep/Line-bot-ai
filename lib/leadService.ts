import {
  getLeadData,
  hasPhone,
  getMissingFields,
  getLeadCompleteness,
  buildHandoffSummary,
  buildQuoteSummary,
  buildStatePayload,
  startFieldCapture,
  HANDOFF_REQUIRED_FIELDS,
  type QuickReplyOption,
} from './leadCapture';
import { upsertLead } from './lead';
import { notifyAdminIfNeeded, shouldNotifyHighScore } from './adminNotify';

// Passed in from route.ts so leadService never imports LINE client directly
export type SendReplyFn = (text: string, qr?: QuickReplyOption[]) => Promise<void>;

// ─── Shared all-captured handler ─────────────────────────────────────────────

export async function handleAllCaptured(
  mode: string | undefined,
  userId: string,
  displayName: string,
  lastMsg: string,
  sendReply: SendReplyFn
): Promise<void> {
  if (mode === 'handoff') {
    const data = getLeadData(userId);
    await sendReply(buildHandoffSummary(data));
    await saveHandoffCrm(userId, displayName, lastMsg);
    return;
  }
  if (mode === 'premium_quote') {
    const data = getLeadData(userId);
    await sendReply(buildQuoteSummary(data));
    await saveQuoteCrm(userId, displayName, lastMsg);
    return;
  }
  // general / unknown — check if handoff fields are still missing
  const missingHandoff = getMissingFields(userId, HANDOFF_REQUIRED_FIELDS);
  if (missingHandoff.length > 0) {
    const msg    = `รับข้อมูลแล้วครับ 😊 ยังขาดอีก ${missingHandoff.length} ข้อ`;
    const fieldQ = startFieldCapture(userId, missingHandoff, msg, 'handoff');
    await sendReply(fieldQ.reply, fieldQ.quickReply);
  } else {
    const data = getLeadData(userId);
    await sendReply(buildHandoffSummary(data));
    await saveHandoffCrm(userId, displayName, lastMsg);
  }
}

// ─── CRM save helpers ─────────────────────────────────────────────────────────

export async function saveHandoffCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  console.log(`[CRM] handoff save uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question:    lastMsg.substring(0, 300),
    purchase_objective: data.purchase_objective || 'ขอให้ติดต่อกลับ',
    follow_up_status: 'Contact Requested',
    lead_status:      'hot',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
  // Admin notification — fire-and-forget, never blocks customer reply
  notifyAdminIfNeeded(userId, displayName, data, 'handoff_complete').catch(logNotifyErr);
}

export async function saveQuoteCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  console.log(`[CRM] quote save uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question:      lastMsg.substring(0, 300),
    purchase_objective: 'เช็กเบี้ย/ขอใบเสนอราคา',
    follow_up_status:   'Quotation Requested',
    lead_status:        data.phone ? 'hot' : 'warm',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
}

export async function saveCrm(userId: string, displayName: string, lastMsg: string): Promise<void> {
  const data = getLeadData(userId);
  const { score, total } = getLeadCompleteness(userId);
  console.log(`[CRM] save score=${score}/${total} uid=${userId.substring(0, 8)}***`);
  await upsertLead({
    line_user_id: userId, display_name: displayName,
    ...data,
    last_question: lastMsg.substring(0, 300),
    lead_status:   hasPhone(userId) ? 'qualified' : 'new',
    ...buildStatePayload(userId),
  }).catch(logCrmErr);
  // Notify admin if lead score crosses 70 for the first time
  if (shouldNotifyHighScore(data)) {
    notifyAdminIfNeeded(userId, displayName, data, 'score_high').catch(logNotifyErr);
  }
}

export function logCrmErr(err: unknown): void {
  console.error(`[CRM] save error: ${err instanceof Error ? err.message : String(err)}`);
}

export function logNotifyErr(err: unknown): void {
  console.error(`[Handoff] notify error: ${err instanceof Error ? err.message : String(err)}`);
}
