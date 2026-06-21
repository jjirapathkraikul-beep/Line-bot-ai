import type { LeadUpsert } from '@/types/faq';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedData {
  real_name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  monthly_income?: string;
  purchase_objective?: string;
  product_interest?: string;
  budget?: string;
  preferred_contact_time?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHONE_AWAIT_TIMEOUT_MS = 30 * 60 * 1000;

export const HANDOFF_TRIGGERS = [
  'ติดต่อคุณจิราวัฒน์',
  'ขอใบเสนอราคา',
  'สนใจสมัคร',
  'เช็กเบี้ย',
  'ขอนัดคุย',
  'ขอรายละเอียด',
  'ให้ติดต่อกลับ',
  'ติดต่อกลับ',
  'นัดคุย',
];

const CANCEL_KEYWORDS = ['ยกเลิก', 'cancel', 'หยุด', 'ออก'];

// ─── Per-user in-memory state ─────────────────────────────────────────────────

// Accumulated data extracted from conversation
const userLeadData = new Map<string, ExtractedData>();

// Users currently waiting to provide phone number
const awaitingPhone = new Map<string, { startedAt: number }>();

// ─── Extraction ───────────────────────────────────────────────────────────────

export function detectPhone(text: string): string | null {
  const m = text.match(/0[689]\d[-\s]?\d{3,4}[-\s]?\d{3,4}/) ??
            text.match(/0\d{9}/);
  return m ? m[0].replace(/[-\s]/g, '') : null;
}

export function extractFromText(text: string): Partial<ExtractedData> {
  const result: Partial<ExtractedData> = {};

  // Age: "อายุ 39" or "39 ปี"
  const ageM = text.match(/อายุ\s*(\d{1,3})/) ?? text.match(/(\d{1,3})\s*ปี\b/);
  if (ageM) result.age = ageM[1];

  // Monthly income
  const incomeM = text.match(/รายได้\s*([\d,]+)/) ?? text.match(/เงินเดือน\s*([\d,]+)/);
  if (incomeM) result.monthly_income = incomeM[1].replace(/,/g, '');

  // Budget: "งบประมาณ 5000", "งบ 5000", "5000 บาท/เดือน"
  const budgetM = text.match(/งบประมาณ\s*([\d,]+)/) ??
                  text.match(/งบ\s+([\d,]+)/) ??
                  text.match(/([\d,]+)\s*บาท\/(?:เดือน|ปี)/);
  if (budgetM) result.budget = budgetM[1].replace(/,/g, '');

  // Purchase objective: capture text after "เป้าหมาย" until next keyword or end
  const objM = text.match(/เป้าหมาย([฀-๿\d\s/]+?)(?=\s*(?:งบประมาณ|งบ\s|รายได้|อายุ|เงินเดือน|$))/);
  if (objM) result.purchase_objective = `เป้าหมาย${objM[1].trim()}`.replace(/\s+/g, ' ');

  // Gender
  if (/\bชาย\b/.test(text)) result.gender = 'ชาย';
  else if (/\bหญิง\b/.test(text)) result.gender = 'หญิง';

  // Phone
  const phone = detectPhone(text);
  if (phone) result.phone = phone;

  return result;
}

// ─── Accumulated data per user ────────────────────────────────────────────────

export function accumulateLeadData(userId: string, incoming: Partial<ExtractedData>): void {
  const current = userLeadData.get(userId) ?? {};
  for (const [k, v] of Object.entries(incoming)) {
    if (v && v !== '') (current as Record<string, string>)[k] = v;
  }
  userLeadData.set(userId, current);
}

export function getLeadData(userId: string): ExtractedData {
  return userLeadData.get(userId) ?? {};
}

export function hasPhone(userId: string): boolean {
  return !!(userLeadData.get(userId)?.phone);
}

// ─── Handoff + phone capture flow ────────────────────────────────────────────

export function isHandoffTrigger(text: string): boolean {
  return HANDOFF_TRIGGERS.some((kw) => text.includes(kw));
}

export function isAwaitingPhone(userId: string): boolean {
  const entry = awaitingPhone.get(userId);
  if (!entry) return false;
  if (Date.now() - entry.startedAt > PHONE_AWAIT_TIMEOUT_MS) {
    awaitingPhone.delete(userId);
    return false;
  }
  return true;
}

export function startPhoneAwait(userId: string): string {
  awaitingPhone.set(userId, { startedAt: Date.now() });
  return (
    'ได้เลยครับ 😊 เพื่อให้คุณจิราวัฒน์ติดต่อกลับและแนะนำได้ตรงที่สุด\n' +
    'รบกวนฝากเบอร์โทรที่สะดวกไว้ได้ไหมครับ?'
  );
}

export function clearPhoneAwait(userId: string): void {
  awaitingPhone.delete(userId);
}

// Returns { handled, reply } — if handled=true, route.ts should skip OpenAI
export function handlePhoneAwait(
  userId: string,
  text: string,
  displayName: string
): { handled: boolean; reply: string; phoneCaptured?: string } {
  const trimmed = text.trim();

  // Cancel
  if (CANCEL_KEYWORDS.some((kw) => trimmed.includes(kw))) {
    clearPhoneAwait(userId);
    return {
      handled: true,
      reply: 'รับทราบครับ หากต้องการติดต่อในภายหลัง พิมพ์ "ติดต่อคุณจิราวัฒน์" ได้เลยครับ 😊',
    };
  }

  const phone = detectPhone(trimmed);
  if (!phone) {
    // No phone detected — let OpenAI reply naturally (don't block)
    return { handled: false, reply: '' };
  }

  // Phone captured
  clearPhoneAwait(userId);
  accumulateLeadData(userId, { phone });
  const data = getLeadData(userId);
  const summary = buildSummary(displayName, data);

  return { handled: true, reply: summary, phoneCaptured: phone };
}

// ─── Summary + lead payload ───────────────────────────────────────────────────

export function buildSummary(displayName: string, data: ExtractedData): string {
  const fmt = (v?: string) => v || '-';
  const income = data.monthly_income
    ? `${Number(data.monthly_income).toLocaleString('th-TH')} บาท/เดือน`
    : '-';
  const budget = data.budget
    ? `${Number(data.budget).toLocaleString('th-TH')} บาท`
    : '-';

  return (
    'ขอบคุณครับ 😊 ผมสรุปข้อมูลให้นะครับ\n\n' +
    `ชื่อ: ${fmt(displayName || data.real_name)}\n` +
    `อายุ: ${fmt(data.age)}\n` +
    `รายได้: ${income}\n` +
    `เป้าหมาย: ${fmt(data.purchase_objective)}\n` +
    `แผนที่สนใจ: ${fmt(data.product_interest)}\n` +
    `งบประมาณ: ${budget}\n` +
    `เบอร์ติดต่อ: ${fmt(data.phone)}\n` +
    `เวลาสะดวก: ${fmt(data.preferred_contact_time)}\n\n` +
    'ผมจะส่งข้อมูลให้คุณจิราวัฒน์ติดต่อกลับโดยเร็วที่สุดครับ 🙏'
  );
}

export function buildLeadPayload(
  userId: string,
  displayName: string,
  data: ExtractedData
): LeadUpsert {
  const today = new Date().toISOString().split('T')[0];
  return {
    line_user_id: userId,
    display_name: displayName,
    real_name: data.real_name ?? '',
    age: data.age ?? '',
    gender: data.gender ?? '',
    phone: data.phone ?? '',
    monthly_income: data.monthly_income ?? '',
    purchase_objective: data.purchase_objective ?? '',
    product_interest: data.product_interest ?? '',
    budget: data.budget ?? '',
    preferred_contact_time: data.preferred_contact_time ?? '',
    lead_status: 'qualified',
    follow_up_status: 'pending',
    last_contact_date: today,
    first_contact_date: today,
  };
}
