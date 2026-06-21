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
  label: string;
  text: string;
}

export interface CaptureResponse {
  reply: string;
  quickReply?: QuickReplyOption[];
  phoneCaptured?: string;
  allCaptured?: boolean;
  done?: boolean;
  cancelled?: boolean;
}

// ─── Quick reply sets ─────────────────────────────────────────────────────────

export const QR_GOALS: QuickReplyOption[] = [
  { label: '1️⃣ ลดหย่อนภาษี',    text: 'ลดหย่อนภาษี' },
  { label: '2️⃣ ประกันสุขภาพ',    text: 'ประกันสุขภาพ' },
  { label: '3️⃣ ประกันมะเร็ง',     text: 'ประกันมะเร็ง' },
  { label: '4️⃣ ลงทุนระยะยาว',    text: 'ลงทุนระยะยาว' },
];

export const QR_PRODUCTS: QuickReplyOption[] = [
  { label: 'Tokyo SuperTax',    text: 'Tokyo SuperTax' },
  { label: 'Good Health Prime', text: 'Good Health Prime' },
  { label: 'Tokio Cancer Care', text: 'Tokio Cancer Care' },
  { label: 'Tokyo Beyond',      text: 'Tokyo Beyond' },
  { label: 'ยังไม่แน่ใจ',       text: 'ยังไม่แน่ใจ' },
];

export const QR_GENDER: QuickReplyOption[] = [
  { label: '👨 ชาย',  text: 'ชาย' },
  { label: '👩 หญิง', text: 'หญิง' },
  { label: 'ไม่ระบุ', text: 'ไม่ระบุ' },
];

export const QR_AGE: QuickReplyOption[] = [
  { label: 'ต่ำกว่า 30 ปี', text: 'ต่ำกว่า 30' },
  { label: '30–39 ปี',       text: '30-39' },
  { label: '40–49 ปี',       text: '40-49' },
  { label: '50 ปีขึ้นไป',    text: '50+' },
];

// ─── Lead field type & labels ─────────────────────────────────────────────────

export type LeadField = keyof ExtractedData;

export const FIELD_LABELS: Record<LeadField, string> = {
  real_name:              'ชื่อ',
  age:                    'อายุ',
  gender:                 'เพศ',
  phone:                  'เบอร์โทร',
  monthly_income:         'รายได้',
  purchase_objective:     'เป้าหมาย',
  product_interest:       'แผนที่สนใจ',
  budget:                 'งบประมาณ',
  preferred_contact_time: 'เวลาสะดวก',
};

// ─── Trigger keyword groups ───────────────────────────────────────────────────

// Contact triggers → need phone number
export const CONTACT_TRIGGERS = [
  'ติดต่อคุณจิราวัฒน์',
  'ขอใบเสนอราคา',
  'สนใจสมัคร',
  'ขอนัดคุย',
  'ขอรายละเอียด',
  'ให้ติดต่อกลับ',
  'ติดต่อกลับ',
  'นัดคุย',
];

// Quote triggers → need age + gender + product_interest (NOT phone)
export const QUOTE_TRIGGERS = [
  'เช็กเบี้ย',
  'คำนวณเบี้ย',
  'เบี้ยประกัน',
  'ดูเบี้ย',
];

// Minimum required for premium quote
export const QUOTE_REQUIRED_FIELDS: LeadField[] = [
  'age', 'gender', 'product_interest',
];

// Fields scored for lead completeness (each = 1 point, max 5/5)
export const SCORED_FIELDS: LeadField[] = [
  'age', 'gender', 'phone', 'product_interest', 'budget',
];

const TIMEOUT_MS = 30 * 60 * 1000;
const CANCEL_KEYWORDS = ['ยกเลิก', 'cancel', 'หยุด', 'ออก'];

// All intent triggers — used to detect intent switches mid-flow
const ALL_INTENT_TRIGGERS = [...QUOTE_TRIGGERS, ...CONTACT_TRIGGERS];

// ─── In-memory state ──────────────────────────────────────────────────────────

const userLeadData  = new Map<string, ExtractedData>();
const awaitingPhone = new Map<string, { startedAt: number }>();
const awaitingGoal  = new Map<string, { startedAt: number }>();
const awaitingField = new Map<string, {
  field: LeadField;
  queue: LeadField[];
  startedAt: number;
}>();

function alive(entry: { startedAt: number }): boolean {
  return Date.now() - entry.startedAt < TIMEOUT_MS;
}

// ─── State introspection ──────────────────────────────────────────────────────

export function isAwaitingField(userId: string): boolean {
  const e = awaitingField.get(userId);
  if (!e) return false;
  if (!alive(e)) { awaitingField.delete(userId); return false; }
  return true;
}

export function isAwaitingPhone(userId: string): boolean {
  const e = awaitingPhone.get(userId);
  if (!e) return false;
  if (!alive(e)) { awaitingPhone.delete(userId); return false; }
  return true;
}

export function isAwaitingGoal(userId: string): boolean {
  const e = awaitingGoal.get(userId);
  if (!e) return false;
  if (!alive(e)) { awaitingGoal.delete(userId); return false; }
  return true;
}

export function getCurrentState(userId: string): string {
  if (isAwaitingField(userId)) return 'awaiting_field';
  if (isAwaitingGoal(userId))  return 'awaiting_goal';
  if (isAwaitingPhone(userId)) return 'awaiting_phone';
  return 'idle';
}

// ─── State management ─────────────────────────────────────────────────────────

export function cancelFieldCapture(userId: string): void {
  awaitingField.delete(userId);
}

export function cancelAwaitingPhone(userId: string): void {
  awaitingPhone.delete(userId);
}

export function cancelAllCapture(userId: string): void {
  awaitingField.delete(userId);
  awaitingPhone.delete(userId);
  awaitingGoal.delete(userId);
}

// ─── Lead completeness ────────────────────────────────────────────────────────

export function getMissingFields(
  userId: string,
  required: LeadField[]
): LeadField[] {
  const data = userLeadData.get(userId) ?? {};
  return required.filter((f) => !data[f]);
}

export function getLeadCompleteness(userId: string): {
  score: number;
  total: number;
  missing: LeadField[];
} {
  const missing = getMissingFields(userId, SCORED_FIELDS);
  return { score: SCORED_FIELDS.length - missing.length, total: SCORED_FIELDS.length, missing };
}

export function isLeadComplete(userId: string): boolean {
  return getMissingFields(userId, SCORED_FIELDS).length === 0;
}

// ─── Data extraction ──────────────────────────────────────────────────────────

export function detectPhone(text: string): string | null {
  const m = text.match(/0[689]\d[-\s]?\d{3,4}[-\s]?\d{3,4}/) ??
            text.match(/0\d{9}/);
  return m ? m[0].replace(/[-\s]/g, '') : null;
}

export function extractFromText(text: string): Partial<ExtractedData> {
  const r: Partial<ExtractedData> = {};

  const ageM = text.match(/อายุ\s*(\d{1,3})/) ?? text.match(/(\d{1,3})\s*ปี\b/);
  if (ageM) r.age = ageM[1];

  const incM = text.match(/รายได้\s*([\d,]+)/) ?? text.match(/เงินเดือน\s*([\d,]+)/);
  if (incM) r.monthly_income = incM[1].replace(/,/g, '');

  const bdgM = text.match(/งบประมาณ\s*([\d,]+)/) ??
               text.match(/งบ\s+([\d,]+)/) ??
               text.match(/([\d,]+)\s*บาท\/(?:เดือน|ปี)/);
  if (bdgM) r.budget = bdgM[1].replace(/,/g, '');

  const objM = text.match(/เป้าหมาย([฀-๿\d\s/]+?)(?=\s*(?:งบประมาณ|งบ\s|รายได้|อายุ|เงินเดือน|$))/);
  if (objM) r.purchase_objective = `เป้าหมาย${objM[1].trim()}`;

  if (/\bชาย\b/.test(text)) r.gender = 'ชาย';
  else if (/\bหญิง\b/.test(text)) r.gender = 'หญิง';

  const phone = detectPhone(text);
  if (phone) r.phone = phone;

  return r;
}

export function accumulateLeadData(userId: string, incoming: Partial<ExtractedData>): void {
  const cur = userLeadData.get(userId) ?? {};
  for (const [k, v] of Object.entries(incoming)) {
    if (v && v !== '') (cur as Record<string, string>)[k] = v;
  }
  userLeadData.set(userId, cur);
}

export function getLeadData(userId: string): ExtractedData {
  return userLeadData.get(userId) ?? {};
}

export function hasPhone(userId: string): boolean {
  return !!(userLeadData.get(userId)?.phone);
}

// ─── Trigger checks ───────────────────────────────────────────────────────────

function normTH(s: string): string {
  return s.normalize('NFC').toLowerCase();
}

export function isContactTrigger(text: string): boolean {
  const n = normTH(text);
  return CONTACT_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

export function isQuoteTrigger(text: string): boolean {
  const n = normTH(text);
  return QUOTE_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

export function isAnyTrigger(text: string): boolean {
  const n = normTH(text);
  return ALL_INTENT_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

// ─── Existing data summary (shown before asking missing fields) ───────────────

export function buildExistingDataSummary(data: ExtractedData): string {
  const lines: string[] = [];
  if (data.age)              lines.push(`• อายุ ${data.age} ปี`);
  if (data.gender)           lines.push(`• เพศ${data.gender}`);
  if (data.product_interest) lines.push(`• สนใจ ${data.product_interest}`);
  if (data.budget)           lines.push(`• งบประมาณ ${Number(data.budget).toLocaleString('th-TH')} บาท`);
  if (data.phone)            lines.push(`• เบอร์โทร ${data.phone}`);
  return lines.join('\n');
}

// ─── Targeted field capture ───────────────────────────────────────────────────

function buildFieldQuestion(field: LeadField): CaptureResponse {
  switch (field) {
    case 'age':
      return { reply: 'ขอทราบอายุประมาณเท่าไรครับ?', quickReply: QR_AGE };
    case 'gender':
      return { reply: 'กรุณาเลือกเพศครับ', quickReply: QR_GENDER };
    case 'product_interest':
      return {
        reply: 'สนใจแผนไหนครับ?\n\n1. Tokyo SuperTax\n2. Good Health Prime\n3. Tokio Cancer Care\n4. Tokyo Beyond',
        quickReply: QR_PRODUCTS,
      };
    case 'phone':
      return { reply: 'ขอเบอร์ที่สะดวกรับสายด้วยครับ 😊' };
    case 'budget':
      return { reply: 'งบประมาณที่วางแผนไว้ประมาณเท่าไรครับ?\nเช่น 3,000/เดือน หรือ 50,000/ปี' };
    default:
      return { reply: '' };
  }
}

function validateFieldInput(field: LeadField, text: string): boolean {
  switch (field) {
    case 'age':
      return /\d/.test(text) || ['ต่ำกว่า 30', '30-39', '40-49', '50+'].some((r) => text.includes(r));
    case 'gender':
      return text.includes('ชาย') || text.includes('หญิง') || text.includes('ไม่ระบุ');
    case 'product_interest':
      return text.length > 0 && text.length < 100;
    default:
      return text.length > 0;
  }
}

const PRODUCT_MAP: Record<string, string> = {
  '1': 'Tokyo SuperTax',
  '2': 'Good Health Prime',
  '3': 'Tokio Cancer Care',
  '4': 'Tokyo Beyond',
  '5': 'ยังไม่แน่ใจ',
};

function normalizeFieldValue(field: LeadField, text: string): string {
  if (field === 'product_interest') return PRODUCT_MAP[text.trim()] ?? text.trim();
  if (field === 'gender') {
    if (text.includes('ชาย'))    return 'ชาย';
    if (text.includes('หญิง'))   return 'หญิง';
    if (text.includes('ไม่ระบุ')) return 'ไม่ระบุ';
  }
  if (field === 'age') {
    const m = text.match(/\d{1,3}/);
    if (m) return m[0];
    // QR labels like "ต่ำกว่า 30", "30-39"
    return text.replace('ปี', '').trim();
  }
  return text.trim();
}

export function startFieldCapture(
  userId: string,
  missingFields: LeadField[]
): CaptureResponse {
  if (missingFields.length === 0) return { reply: '', done: true };
  const [first, ...rest] = missingFields;
  awaitingField.set(userId, { field: first, queue: rest, startedAt: Date.now() });
  return buildFieldQuestion(first);
}

export function handleFieldCapture(
  userId: string,
  text: string
): CaptureResponse {
  const state = awaitingField.get(userId);
  if (!state) return { reply: '', done: true };

  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingField.delete(userId);
    return { reply: 'รับทราบครับ 😊', cancelled: true, done: true };
  }

  // Invalid input — re-ask the same question
  if (!validateFieldInput(state.field, text)) {
    return buildFieldQuestion(state.field);
  }

  const value = normalizeFieldValue(state.field, text);
  accumulateLeadData(userId, { [state.field]: value });

  if (state.queue.length > 0) {
    const [next, ...remaining] = state.queue;
    awaitingField.set(userId, { field: next, queue: remaining, startedAt: Date.now() });
    return buildFieldQuestion(next);
  }

  awaitingField.delete(userId);
  return { reply: '', done: true, allCaptured: true };
}

// ─── Phone → Goal flow ────────────────────────────────────────────────────────

export function startPhoneAwait(userId: string): CaptureResponse {
  awaitingPhone.set(userId, { startedAt: Date.now() });
  return { reply: 'ขอเบอร์ที่สะดวกรับสายด้วยครับ 😊' };
}

export function handlePhoneAwait(userId: string, text: string): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingPhone.delete(userId);
    return {
      reply: 'รับทราบครับ 😊\nพิมพ์ "ติดต่อคุณจิราวัฒน์" ได้เลยถ้าต้องการนัดคุยภายหลัง',
      cancelled: true,
    };
  }

  const phone = detectPhone(text);
  if (!phone) return { reply: '' };

  awaitingPhone.delete(userId);
  accumulateLeadData(userId, { phone });

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

const GOAL_MAP: Record<string, string> = {
  '1': 'ลดหย่อนภาษี',
  '2': 'ประกันสุขภาพ',
  '3': 'ประกันมะเร็ง',
  '4': 'ลงทุนระยะยาว',
};

export function handleGoalAwait(
  userId: string,
  text: string,
  displayName: string
): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingGoal.delete(userId);
    return { reply: 'รับทราบครับ 😊', cancelled: true, done: true };
  }

  const goal = GOAL_MAP[text.trim()] ?? text.trim();
  accumulateLeadData(userId, { purchase_objective: goal });
  awaitingGoal.delete(userId);

  const data = getLeadData(userId);
  const { score, total } = getLeadCompleteness(userId);
  return {
    reply: buildSummary(displayName, data, score, total),
    done: true,
  };
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function buildSummary(
  displayName: string,
  data: ExtractedData,
  score?: number,
  total?: number
): string {
  const f = (v?: string) => v || '-';
  const income = data.monthly_income
    ? `${Number(data.monthly_income).toLocaleString('th-TH')} บาท/เดือน`
    : '-';
  const budget = data.budget
    ? `${Number(data.budget).toLocaleString('th-TH')} บาท`
    : '-';
  const scoreStr = score !== undefined ? ` (${score}/${total})` : '';

  return (
    `📋 สรุปข้อมูล${scoreStr}\n\n` +
    `👤 ชื่อ: ${f(displayName || data.real_name)}\n` +
    `🎂 อายุ: ${f(data.age)}\n` +
    `⚧ เพศ: ${f(data.gender)}\n` +
    `💰 รายได้: ${income}\n` +
    `🎯 เป้าหมาย: ${f(data.purchase_objective)}\n` +
    `📄 แผนที่สนใจ: ${f(data.product_interest)}\n` +
    `💵 งบประมาณ: ${budget}\n` +
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
