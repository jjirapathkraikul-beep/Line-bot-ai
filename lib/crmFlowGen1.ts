// CRM Flow Gen1 — Phase 19B
// Implements the Gen1 conversation-first CRM behavior:
//   • Answer before capture
//   • Interruptible lead capture
//   • budget normalization (monthly → annual)
//   • Follow_up(Interest) for no-phone leads
//   • pending_issue for human-required questions
//   • JP Status protection (never overwrite Jirawat's manual edits)
//   • Deduplicated Jirawat notification via existing adminNotify mechanism

import { upsertLead } from './lead';
import { getLeadData, detectPhone } from './leadCapture';
import { computeLeadScore } from './scorer';
import { notifyGen1Handoff } from './adminNotify';
import type { ExtractedData } from './leadCapture';

// ─── Budget normalization ─────────────────────────────────────────────────────

/**
 * Detects whether a raw budget string from user message is monthly or annual
 * and returns the annual amount. If uncertain, treats as annual.
 *
 * Examples:
 *   "งบเดือนละ 3,000"  → 36000
 *   "3000 บาท/เดือน"   → 36000
 *   "งบ 30,000 บาท/ปี" → 30000
 *   "งบ 2500"           → 2500 (ambiguous → treated as annual)
 */
export function normalizeBudgetToAnnual(text: string, rawAmount: string): number {
  const amount = Number(rawAmount.replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return 0;

  // Detect monthly signals anywhere in the original text
  const isMonthly = /เดือน|\/เดือน|ต่อเดือน|per\s*month/i.test(text);
  if (isMonthly) return amount * 12;

  // If the amount is very small (< 5,000) and there's no explicit annual signal,
  // assume it's monthly (e.g., user says "งบ 3,000" without specifying).
  const hasAnnualSignal = /ปี|\/ปี|ต่อปี|per\s*year/i.test(text);
  if (!hasAnnualSignal && amount > 0 && amount < 5_000) return amount * 12;

  return amount;
}

/**
 * Extracts budget from free-form user text and returns annual amount.
 * Returns null if no budget mention is found.
 */
export function extractBudgetAnnual(text: string): string | null {
  const m =
    text.match(/งบประมาณ\s*([\d,]+)/) ??
    text.match(/งบ\s+([\d,]+)/)        ??
    text.match(/([\d,]+)\s*บาท\/(?:เดือน|ปี)/);
  if (!m) return null;
  const annual = normalizeBudgetToAnnual(text, m[1]);
  return annual > 0 ? String(annual) : null;
}

// ─── Conversation summary ─────────────────────────────────────────────────────

/**
 * Builds a Thai-language conversation summary from available lead data.
 * Used when handing off to Jirawat.
 */
export function buildGen1ConversationSummary(data: ExtractedData, intent: string): string {
  const parts: string[] = [];

  if (data.product_interest) parts.push(`สนใจ: ${data.product_interest}`);
  else if (intent.includes('health'))    parts.push('สนใจ: ประกันสุขภาพ');
  else if (intent.includes('cancer'))   parts.push('สนใจ: ประกันมะเร็ง');
  else if (intent.includes('tax'))      parts.push('สนใจ: ลดหย่อนภาษี');
  else if (intent.includes('retire'))   parts.push('สนใจ: เกษียณ');
  else if (intent.includes('invest'))   parts.push('สนใจ: ลงทุน');

  if (data.age)           parts.push(`อายุ ${data.age} ปี`);
  if (data.gender)        parts.push(`เพศ${data.gender}`);
  if (data.budget)        parts.push(`งบ ${Number(data.budget).toLocaleString('th-TH')} บาท`);

  return parts.length > 0 ? parts.join(' | ') : 'ลูกค้าสนใจประกัน';
}

// ─── Intent → interest_category mapping ──────────────────────────────────────

const INTENT_TO_CATEGORY: Record<string, string> = {
  health_insurance:     'health_insurance',
  cancer_insurance:     'cancer_insurance',
  tax_planning:         'tax_planning',
  retirement_insurance: 'retirement',
  investment_linked:    'investment',
  life_insurance:       'life_insurance',
  medical_underwriting: 'health_insurance',
  claim_question:       'claim',
  hospital_question:    'health_insurance',
  recommendation_request: 'general',
};

export function intentToCategory(intent: string): string {
  return INTENT_TO_CATEGORY[intent] ?? 'general';
}

// ─── JP Status protection ─────────────────────────────────────────────────────

/**
 * Builds the jp_status field for a CRM payload.
 * Returns 'Open' only if gen1_jp_initialized is NOT set on this lead's session.
 * Once set, subsequent syncs omit jp_status entirely to preserve Jirawat's edits.
 *
 * @param data   Current lead data
 * @returns 'Open' | undefined
 */
function getJpStatusForPayload(data: ExtractedData & { gen1_jp_initialized?: string }): string | undefined {
  if (data.gen1_jp_initialized === 'true') return undefined; // already initialized — do not overwrite
  return 'Open';
}

// ─── CRM save functions ───────────────────────────────────────────────────────

/**
 * RULE 4 / RULE 5: Customer is interested but has not provided a phone number.
 * Save as Follow_up(Interest) — never mark as lost.
 */
export async function saveInterestLeadGen1(
  userId: string,
  displayName: string,
  intent: string,
): Promise<void> {
  const data = getLeadData(userId);
  const budgetAnnual = data.budget ? normalizeBudgetToAnnual('', data.budget) : 0;

  console.log(`[CRM:Gen1] interest uid=${userId.substring(0, 8)}*** intent=${intent}`);

  await upsertLead({
    line_user_id:        userId,
    display_name:        displayName,
    interest_category:   intentToCategory(intent),
    product_interest:    data.product_interest ?? '',
    budget_annual:       budgetAnnual > 0 ? String(budgetAnnual) : undefined,
    lead_status:         'Follow_up(Interest)',
    conversation_summary: buildGen1ConversationSummary(data, intent),
    source:              'LINE OA',
  } as Parameters<typeof upsertLead>[0]).catch((e) =>
    console.error(`[CRM:Gen1] interest save error: ${e instanceof Error ? e.message : String(e)}`)
  );
}

/**
 * RULE 3: Customer has provided a phone number.
 * Save full handoff payload, set JP Status = Open (if first time), notify Jirawat.
 *
 * @param pendingIssue   Optional issue Jirawat must handle (rule 6)
 */
export async function saveHandoffGen1(
  userId: string,
  displayName: string,
  intent: string,
  pendingIssue?: string,
): Promise<void> {
  const data = getLeadData(userId) as ExtractedData & { gen1_jp_initialized?: string };
  const budgetAnnual = data.budget ? normalizeBudgetToAnnual('', data.budget) : 0;
  const jpStatus     = getJpStatusForPayload(data);
  const summary      = buildGen1ConversationSummary(data, intent);
  const preferredTime = data.preferred_contact_time || 'สะดวกตลอดเวลา';
  const score        = computeLeadScore(data);

  console.log(`[CRM:Gen1] handoff uid=${userId.substring(0, 8)}*** score=${score} jp_initialized=${data.gen1_jp_initialized ?? 'no'}`);

  const payload: Parameters<typeof upsertLead>[0] = {
    line_user_id:         userId,
    display_name:         displayName,
    real_name:            data.real_name,
    phone:                data.phone,
    age:                  data.age,
    gender:               data.gender,
    interest_category:    intentToCategory(intent),
    product_interest:     data.product_interest,
    budget_annual:        budgetAnnual > 0 ? String(budgetAnnual) : undefined,
    preferred_contact_time: preferredTime,
    lead_status:          'handoff',
    follow_up_status:     'pending',
    conversation_summary: summary,
    last_question:        data.product_interest ? `สนใจ ${data.product_interest}` : undefined,
    source:               'LINE OA',
    ...(pendingIssue ? { pending_issue: pendingIssue } : {}),
    ...(jpStatus ? { jp_status: jpStatus } : {}),
    ...(jpStatus ? { gen1_jp_initialized: 'true' } : {}),
  };

  await upsertLead(payload).catch((e) =>
    console.error(`[CRM:Gen1] handoff save error: ${e instanceof Error ? e.message : String(e)}`)
  );

  // Notify Jirawat — uses existing dedup mechanism (one notification per gen1_handoff reason)
  notifyGen1Handoff(userId, {
    displayName,
    leadStatus:          'handoff',
    followUpStatus:      'pending',
    jpStatus:            jpStatus ?? 'Open',
    productInterest:     data.product_interest,
    interestCategory:    intentToCategory(intent),
    budgetAnnual:        budgetAnnual > 0 ? String(budgetAnnual) : undefined,
    phone:               data.phone,
    realName:            data.real_name,
    preferredContactTime: preferredTime,
    pendingIssue,
    conversationSummary: summary,
  }).catch((e) =>
    console.error(`[CRM:Gen1] notify error: ${e instanceof Error ? e.message : String(e)}`)
  );
}

/**
 * RULE 6: Question the bot cannot safely answer.
 * Save pending_issue. If phone is provided, escalate to full handoff.
 */
export async function savePendingIssueGen1(
  userId: string,
  displayName: string,
  intent: string,
  userMessage: string,
): Promise<void> {
  const data = getLeadData(userId);
  const pendingIssue = buildPendingIssue(intent, userMessage);

  if (data.phone) {
    // Phone already known — treat as full handoff with pending_issue
    await saveHandoffGen1(userId, displayName, intent, pendingIssue);
  } else {
    // No phone yet — save issue for later; leave door open for contact
    console.log(`[CRM:Gen1] pending_issue (no phone) uid=${userId.substring(0, 8)}***`);
    await upsertLead({
      line_user_id:     userId,
      display_name:     displayName,
      interest_category: intentToCategory(intent),
      lead_status:      'Follow_up(Interest)',
      pending_issue:    pendingIssue,
      source:           'LINE OA',
    } as Parameters<typeof upsertLead>[0]).catch((e) =>
      console.error(`[CRM:Gen1] pending_issue save error: ${e instanceof Error ? e.message : String(e)}`)
    );
  }
}

/**
 * Generates a Thai-language pending_issue description from intent + user message.
 * Describes the issue Jirawat must handle — not just a copy of the user message.
 */
export function buildPendingIssue(intent: string, userMessage: string): string {
  const preview = userMessage.substring(0, 120);

  if (intent === 'medical_underwriting')
    return `ลูกค้ามีประเด็น underwriting / โรคประจำตัว ต้องให้จิราวัฒน์ประเมิน: "${preview}"`;

  if (intent === 'claim_question')
    return `ลูกค้าถามเรื่องการเคลม ต้องให้จิราวัฒน์ชี้แจงรายละเอียด: "${preview}"`;

  if (intent === 'tax_planning')
    return `ลูกค้าถามแผนการลดหย่อนภาษีเฉพาะราย ต้องให้จิราวัฒน์วางแผนให้: "${preview}"`;

  return `ลูกค้ามีคำถามที่ต้องการผู้เชี่ยวชาญตอบ: "${preview}"`;
}

export function isValidationRiskQuestion(userMessage: string): boolean {
  const n = userMessage.normalize('NFC').trim().toLowerCase();
  return [
    'ไม่คุ้มครอง', 'ยกเว้น', 'ข้อยกเว้น', 'exclusion',
    '120 วัน', '120-day', '120 day', 'โรคที่รอคอย', 'โรครอคอย',
    'รายชื่อโรครอคอย', 'ระยะเวลารอคอย', 'waiting period',
    'มะเร็งไม่คุ้มครอง', 'เนื้องอก', 'ถุงน้ำ', 'cyst',
    'รายการโรค', 'เงื่อนไขกรมธรรม์', 'นิยามโรคร้ายแรง', 'นิยาม ci',
    'เอกสารเคลม', 'ระยะเวลาเคลม', 'ผ่าตัด', 'ไส้เลื่อน', 'ต้อกระจก',
    'ริดสีดวง', 'นิ่ว', 'ต่อมทอนซิล', 'อะดีนอยด์', 'เส้นเลือดขอด',
    'เยื่อบุโพรงมดลูก', 'adenoid', 'critical illness', 'underwriting',
  ].some((kw) => n.includes(kw.normalize('NFC').toLowerCase()));
}

// ─── Main Gen1 CRM dispatcher ─────────────────────────────────────────────────

export interface Gen1CrmContext {
  userId:         string;
  displayName:    string;
  intent:         string;         // detected intent from Gen1 pipeline
  action:         string;         // pipeline decision (educate, answer_then_ask, handoff, etc.)
  userMessage:    string;
  hadPhoneBefore: boolean;        // phone status BEFORE this turn's extraction
}

/**
 * Central dispatcher: decide which CRM save to execute after a Gen1 turn.
 *
 * Call this after runGen1LineAdapter() completes, fire-and-forget.
 * Never throws — any error is logged and swallowed so the customer response is unaffected.
 */
export async function dispatchGen1Crm(ctx: Gen1CrmContext): Promise<void> {
  const { userId, displayName, intent, action, userMessage, hadPhoneBefore } = ctx;
  const data = getLeadData(userId);
  const phoneNow = !!(data.phone);
  const validationRisk = action === 'handoff' && isValidationRiskQuestion(userMessage);

  // RULE 3: Phone was provided THIS turn (newly detected)
  if (!hadPhoneBefore && phoneNow) {
    if (validationRisk) {
      await saveHandoffGen1(userId, displayName, intent, buildPendingIssue(intent, userMessage));
    } else {
      await saveHandoffGen1(userId, displayName, intent);
    }
    return;
  }

  // Human-required question (underwriting, claim, complex tax, policy validation risk)
  if ((action === 'answer_then_ask' && intent === 'medical_underwriting') || validationRisk) {
    await savePendingIssueGen1(userId, displayName, intent, userMessage);
    return;
  }

  // RULE 4: Interest without phone — save as nurture
  const isProductIntent = [
    'health_insurance', 'cancer_insurance', 'tax_planning',
    'retirement_insurance', 'investment_linked', 'life_insurance',
    'recommendation_request',
  ].includes(intent);

  if (isProductIntent && !phoneNow) {
    await saveInterestLeadGen1(userId, displayName, intent);
    return;
  }

  // Phone already known from a previous turn — re-confirm CRM with any new data
  if (phoneNow && isProductIntent) {
    await saveHandoffGen1(userId, displayName, intent);
    return;
  }

  // Greeting / unknown / non-product — lightweight passive touch (no status change)
  if (data.product_interest || data.age || data.phone) {
    await upsertLead({
      line_user_id: userId,
      display_name: displayName,
      source:       'LINE OA',
    }).catch((e) =>
      console.error(`[CRM:Gen1] passive save error: ${e instanceof Error ? e.message : String(e)}`)
    );
  }
}
