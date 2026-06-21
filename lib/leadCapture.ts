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

export interface QuickReplyOption {
  label: string; // shown on button (max 20 chars)
  text: string;  // sent as message when tapped
}

export interface CaptureResponse {
  reply: string;
  quickReply?: QuickReplyOption[];
  phoneCaptured?: string;
  goalCaptured?: string;
  done?: boolean;
  cancelled?: boolean;
}

// ─── Quick reply option sets ──────────────────────────────────────────────────

export const QR_GOALS: QuickReplyOption[] = [
  { label: '1️⃣ ลดหย่อนภาษี', text: 'ลดหย่อนภาษี' },
  { label: '2️⃣ ประกันสุขภาพ', text: 'ประกันสุขภาพ' },
  { label: '3️⃣ ประกันมะเร็ง', text: 'ประกันมะเร็ง' },
  { label: '4️⃣ ลงทุนระยะยาว', text: 'ลงทุนระยะยาว' },
];

export const QR_PRODUCTS: QuickReplyOption[] = [
  { label: 'Tokyo SuperTax', text: 'Tokyo SuperTax' },
  { label: 'Good Health Prime', text: 'Good Health Prime' },
  { label: 'Tokio Cancer Care', text: 'Tokio Cancer Care' },
  { label: 'Tokyo Beyond', text: 'Tokyo Beyond' },
  { label: 'ยังไม่แน่ใจ', text: 'ยังไม่แน่ใจ' },
];

export const QR_GENDER: QuickReplyOption[] = [
  { label: '👨 ชาย', text: 'ชาย' },
  { label: '👩 หญิง', text: 'หญิง' },
  { label: 'ไม่ระบุ', text: 'ไม่ระบุ' },
];

export const QR_AGE: QuickReplyOption[] = [
  { label: 'ต่ำกว่า 30 ปี', text: 'ต่ำกว่า 30' },
  { label: '30–39 ปี', text: '30-39' },
  { label: '40–49 ปี', text: '40-49' },
  { label: '50 ปีขึ้นไป', text: '50+' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 30 * 60 * 1000;

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

const OBJECTIVE_MAP: Record<string, string> = {
  '1': 'ลดหย่อนภาษี',
  '2': 'ประกันสุขภาพ',
  '3': 'ประกันมะเร็ง',
  '4': 'ลงทุนระยะยาว',
};

// ─── In-memory state ──────────────────────────────────────────────────────────

const userLeadData = new Map<string, ExtractedData>();
const awaitingPhone = new Map<string, { startedAt: number }>();
const awaitingGoal  = new Map<string, { startedAt: number }>();

function isExpired(entry: { startedAt: number }): boolean {
  return Date.now() - entry.startedAt > TIMEOUT_MS;
}

// ─── Extraction ───────────────────────────────────────────────────────────────

export function detectPhone(text: string): string | null {
  const m = text.match(/0[689]\d[-\s]?\d{3,4}[-\s]?\d{3,4}/) ??
            text.match(/0\d{9}/);
  return m ? m[0].replace(/[-\s]/g, '') : null;
}

export function extractFromText(text: string): Partial<ExtractedData> {
  const result: Partial<ExtractedData> = {};

  const ageM = text.match(/อายุ\s*(\d{1,3})/) ?? text.match(/(\d{1,3})\s*ปี\b/);
  if (ageM) result.age = ageM[1];

  const incomeM = text.match(/รายได้\s*([\d,]+)/) ?? text.match(/เงินเดือน\s*([\d,]+)/);
  if (incomeM) result.monthly_income = incomeM[1].replace(/,/g, '');

  const budgetM = text.match(/งบประมาณ\s*([\d,]+)/) ??
                  text.match(/งบ\s+([\d,]+)/) ??
                  text.match(/([\d,]+)\s*บาท\/(?:เดือน|ปี)/);
  if (budgetM) result.budget = budgetM[1].replace(/,/g, '');

  const objM = text.match(/เป้าหมาย([฀-๿\d\s/]+?)(?=\s*(?:งบประมาณ|งบ\s|รายได้|อายุ|เงินเดือน|$))/);
  if (objM) result.purchase_objective = `เป้าหมาย${objM[1].trim()}`.replace(/\s+/g, ' ');

  if (/\bชาย\b/.test(text)) result.gender = 'ชาย';
  else if (/\bหญิง\b/.test(text)) result.gender = 'หญิง';

  const phone = detectPhone(text);
  if (phone) result.phone = phone;

  return result;
}

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

// ─── Handoff + phone flow ─────────────────────────────────────────────────────

export function isHandoffTrigger(text: string): boolean {
  return HANDOFF_TRIGGERS.some((kw) => text.includes(kw));
}

export function isAwaitingPhone(userId: string): boolean {
  const e = awaitingPhone.get(userId);
  if (!e) return false;
  if (isExpired(e)) { awaitingPhone.delete(userId); return false; }
  return true;
}

export function startPhoneAwait(userId: string): CaptureResponse {
  awaitingPhone.set(userId, { startedAt: Date.now() });
  return {
    reply: 'ขอเบอร์ที่สะดวกรับสายด้วยครับ 😊',
  };
}

export function handlePhoneAwait(
  userId: string,
  text: string
): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingPhone.delete(userId);
    return { reply: 'รับทราบครับ 😊\nพิมพ์ "ติดต่อคุณจิราวัฒน์" ได้เลยถ้าต้องการนัดคุยภายหลัง', cancelled: true };
  }

  const phone = detectPhone(text);
  if (!phone) return { reply: '' }; // No phone — fall through to OpenAI

  awaitingPhone.delete(userId);
  accumulateLeadData(userId, { phone });

  // Phone captured → ask goal next
  awaitingGoal.set(userId, { startedAt: Date.now() });
  return {
    phoneCaptured: phone,
    reply:
      'ขอบคุณครับ 🙏\n\n' +
      'สนใจวางแผนเรื่องไหนครับ?\n\n' +
      '1️⃣ ลดหย่อนภาษี\n' +
      '2️⃣ ประกันสุขภาพ\n' +
      '3️⃣ ประกันมะเร็ง\n' +
      '4️⃣ ลงทุนระยะยาว',
    quickReply: QR_GOALS,
  };
}

// ─── Goal flow (after phone) ──────────────────────────────────────────────────

export function isAwaitingGoal(userId: string): boolean {
  const e = awaitingGoal.get(userId);
  if (!e) return false;
  if (isExpired(e)) { awaitingGoal.delete(userId); return false; }
  return true;
}

export function handleGoalAwait(
  userId: string,
  text: string,
  displayName: string
): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingGoal.delete(userId);
    return { reply: 'รับทราบครับ 😊', cancelled: true, done: true };
  }

  // Map number shortcut or plain text
  const goal = OBJECTIVE_MAP[text.trim()] ?? text.trim();
  accumulateLeadData(userId, { purchase_objective: goal });
  awaitingGoal.delete(userId);

  const data = getLeadData(userId);
  return {
    goalCaptured: goal,
    reply: buildSummary(displayName, data),
    done: true,
  };
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function buildSummary(displayName: string, data: ExtractedData): string {
  const f = (v?: string) => v || '-';
  const income = data.monthly_income
    ? `${Number(data.monthly_income).toLocaleString('th-TH')} บาท/เดือน`
    : '-';
  const budget = data.budget
    ? `${Number(data.budget).toLocaleString('th-TH')} บาท`
    : '-';

  return (
    '📋 สรุปข้อมูล\n\n' +
    `👤 ชื่อ: ${f(displayName || data.real_name)}\n` +
    `🎂 อายุ: ${f(data.age)}\n` +
    `💰 รายได้: ${income}\n` +
    `🎯 เป้าหมาย: ${f(data.purchase_objective)}\n` +
    `📄 แผนที่สนใจ: ${f(data.product_interest)}\n` +
    `📞 เบอร์โทร: ${f(data.phone)}\n` +
    `🕒 เวลาสะดวก: ${f(data.preferred_contact_time)}\n\n` +
    'คุณจิราวัฒน์จะติดต่อกลับเร็วๆ นี้ครับ 🙏'
  );
}

// ─── Lead payload ─────────────────────────────────────────────────────────────

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
