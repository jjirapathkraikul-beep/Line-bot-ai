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

export type LeadField = keyof ExtractedData;

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
  resumed?: boolean;
  reset?: boolean;
  fallthrough?: boolean;
  mode?: string;
}

// ─── Field labels (Thai) ──────────────────────────────────────────────────────

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

// ─── Quick reply sets ─────────────────────────────────────────────────────────

export const QR_GOALS: QuickReplyOption[] = [
  { label: '1️⃣ ลดหย่อนภาษี', text: 'ลดหย่อนภาษี' },
  { label: '2️⃣ สุขภาพ',       text: 'ประกันสุขภาพ' },
  { label: '3️⃣ มะเร็ง',       text: 'ประกันมะเร็ง' },
  { label: '4️⃣ ลงทุน',        text: 'ลงทุนระยะยาว' },
];

export const QR_PRODUCTS: QuickReplyOption[] = [
  { label: 'Tokyo SuperTax',    text: 'Tokyo SuperTax' },
  { label: 'Good Health Prime', text: 'Good Health Prime' },
  { label: 'Tokio Cancer Care', text: 'Tokio Cancer Care' },
  { label: 'Tokyo Beyond',      text: 'Tokyo Beyond' },
  { label: 'ยังไม่แน่ใจ',      text: 'ยังไม่แน่ใจ' },
];

export const QR_GENDER: QuickReplyOption[] = [
  { label: '👨 ชาย',  text: 'ชาย' },
  { label: '👩 หญิง', text: 'หญิง' },
  { label: 'ไม่ระบุ', text: 'ไม่ระบุ' },
];

export const QR_AGE: QuickReplyOption[] = [
  { label: 'น้อยกว่า 30 ปี', text: 'ต่ำกว่า 30' },
  { label: '30–39 ปี',        text: '30-39' },
  { label: '40–49 ปี',        text: '40-49' },
  { label: '50 ปีขึ้นไป',    text: '50+' },
];

export const QR_INSURANCE_CATEGORIES: QuickReplyOption[] = [
  { label: '1️⃣ สะสมทรัพย์',  text: 'ประกันชีวิตสะสมทรัพย์' },
  { label: '2️⃣ ลดหย่อนภาษี', text: 'ประกันลดหย่อนภาษี' },
  { label: '3️⃣ เกษียณ',       text: 'ประกันเกษียณ' },
  { label: '4️⃣ สุขภาพ',       text: 'ประกันสุขภาพ' },
  { label: '5️⃣ โรคมะเร็ง',    text: 'ประกันมะเร็งและโรคร้ายแรง' },
  { label: '6️⃣ Unit Linked',  text: 'ประกันควบการลงทุน Unit Linked' },
];

export const QR_RESUME: QuickReplyOption[] = [
  { label: '✅ คุยต่อ',    text: 'คุยต่อ' },
  { label: '🔄 เริ่มใหม่', text: 'เริ่มใหม่' },
];

// ─── Trigger keyword groups ───────────────────────────────────────────────────

export const CONTACT_TRIGGERS = [
  'ติดต่อคุณจิราวัฒน์', 'ขอใบเสนอราคา', 'สนใจสมัคร',
  'ขอนัดคุย', 'ขอรายละเอียด', 'ให้ติดต่อกลับ', 'ติดต่อกลับ', 'นัดคุย',
];

export const QUOTE_TRIGGERS = [
  'ค่าเบี้ย', 'เช็กเบี้ย', 'เบี้ยเท่าไร', 'ราคาเท่าไร',
  'จ่ายเดือนละ', 'เบี้ยประกัน', 'ขอเบี้ย', 'คำนวณเบี้ย', 'ดูเบี้ย',
  'quote', 'quotation',
];

export const INTEREST_TRIGGERS = [
  'สนใจทำประกัน', 'อยากทำประกัน', 'แนะนำประกัน', 'ประกันอะไรดี',
  'สนใจประกัน', 'อยากได้ประกัน',
];

export const QUOTE_REQUIRED_FIELDS: LeadField[] = ['age', 'gender', 'product_interest'];
export const PREMIUM_QUOTE_FIELDS: LeadField[]  = ['product_interest', 'age', 'gender', 'budget'];
export const SCORED_FIELDS: LeadField[]         = ['age', 'gender', 'phone', 'product_interest', 'budget'];

// State durations
const TIMEOUT_MS           = 24 * 60 * 60 * 1000;  // 24h — field capture active window
const STALE_STATE_MS       = 7  * 24 * 60 * 60 * 1000; // 7d — resume prompt eligibility
const RESUME_PROMPT_MS     = 5  * 60 * 1000;        // 5min — user must respond to resume prompt

const CANCEL_KEYWORDS = ['ยกเลิก', 'cancel', 'หยุด', 'ออก'];
const ALL_INTENT_TRIGGERS = [...QUOTE_TRIGGERS, ...CONTACT_TRIGGERS, ...INTEREST_TRIGGERS];

// ─── In-memory state ──────────────────────────────────────────────────────────
// NOTE: All Maps are wiped on Vercel cold start (every ~few min of inactivity).
// Field-level data (product/age/gender) is lost too.
// Permanent solution: migrate to Vercel KV (see requirement 7 plan).

const userLeadData     = new Map<string, ExtractedData>();
const awaitingPhone    = new Map<string, { startedAt: number }>();
const awaitingGoal     = new Map<string, { startedAt: number }>();
const awaitingCategory = new Map<string, { startedAt: number }>();
const awaitingResume   = new Map<string, { startedAt: number }>();
const awaitingField    = new Map<string, {
  field: LeadField;
  queue: LeadField[];
  startedAt: number;
  mode: 'general' | 'premium_quote';
}>();

// stateMetadata survives cancelAllCapture so resume works after flow ends
interface StateMetadata {
  lastState:    string;
  lastIntent:   string;
  stateUpdatedAt: number;
  pendingField?:  LeadField;
  pendingQueue?:  LeadField[];
  pendingMode?:   'general' | 'premium_quote';
}
const stateMetadata = new Map<string, StateMetadata>();

function alive(entry: { startedAt: number }, ms = TIMEOUT_MS): boolean {
  return Date.now() - entry.startedAt < ms;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normTH(s: string): string {
  return s.normalize('NFC').toLowerCase();
}

// ─── State metadata helpers ───────────────────────────────────────────────────

function saveStateMetadata(userId: string, updates: Partial<StateMetadata>): void {
  const cur = stateMetadata.get(userId) ?? {
    lastState: 'idle', lastIntent: 'none', stateUpdatedAt: Date.now(),
  };
  stateMetadata.set(userId, { ...cur, ...updates, stateUpdatedAt: Date.now() });
}

// Route.ts calls this when detecting an intent to keep lastIntent current
export function setLastIntent(userId: string, intent: string): void {
  saveStateMetadata(userId, { lastIntent: intent, lastState: getCurrentState(userId) });
}

export function getStateDebugInfo(userId: string): {
  currentState:    string;
  lastState:       string;
  lastIntent:      string;
  stateAgeMinutes: number;
} {
  const currentState = getCurrentState(userId);
  const meta = stateMetadata.get(userId);
  return {
    currentState,
    lastState:       meta?.lastState ?? 'unknown',
    lastIntent:      meta?.lastIntent ?? 'unknown',
    stateAgeMinutes: meta ? Math.round((Date.now() - meta.stateUpdatedAt) / 60000) : 0,
  };
}

// ─── State introspection ──────────────────────────────────────────────────────

export function isAwaitingField(userId: string): boolean {
  const e = awaitingField.get(userId);
  if (!e) return false;
  if (!alive(e, TIMEOUT_MS)) { awaitingField.delete(userId); return false; }
  return true;
}

export function isAwaitingPhone(userId: string): boolean {
  const e = awaitingPhone.get(userId);
  if (!e) return false;
  if (!alive(e, TIMEOUT_MS)) { awaitingPhone.delete(userId); return false; }
  return true;
}

export function isAwaitingGoal(userId: string): boolean {
  const e = awaitingGoal.get(userId);
  if (!e) return false;
  if (!alive(e, TIMEOUT_MS)) { awaitingGoal.delete(userId); return false; }
  return true;
}

export function isAwaitingCategory(userId: string): boolean {
  const e = awaitingCategory.get(userId);
  if (!e) return false;
  if (!alive(e, TIMEOUT_MS)) { awaitingCategory.delete(userId); return false; }
  return true;
}

export function isAwaitingResume(userId: string): boolean {
  const e = awaitingResume.get(userId);
  if (!e) return false;
  if (!alive(e, RESUME_PROMPT_MS)) { awaitingResume.delete(userId); return false; }
  return true;
}

export function getCurrentState(userId: string): string {
  if (isAwaitingField(userId))    return `awaiting_field:${awaitingField.get(userId)?.field ?? ''}`;
  if (isAwaitingResume(userId))   return 'awaiting_resume';
  if (isAwaitingCategory(userId)) return 'awaiting_category';
  if (isAwaitingGoal(userId))     return 'awaiting_goal';
  if (isAwaitingPhone(userId))    return 'awaiting_phone';
  return 'idle';
}

// ─── Stale-state resume detection ────────────────────────────────────────────

// True when: no active field capture, but stateMetadata has recent (≤7d) pending field
export function hasExpiredStateForResume(userId: string): boolean {
  if (isAwaitingField(userId)) return false;
  if (isAwaitingResume(userId)) return false;
  const meta = stateMetadata.get(userId);
  if (!meta?.pendingField) return false;
  return Date.now() - meta.stateUpdatedAt < STALE_STATE_MS;
}

// Try to silently auto-resume if user's message directly answers the pending field
export function trySmartResume(userId: string, text: string): CaptureResponse | null {
  if (isAwaitingField(userId)) return null;
  const meta = stateMetadata.get(userId);
  if (!meta?.pendingField) return null;
  if (Date.now() - meta.stateUpdatedAt >= STALE_STATE_MS) return null;
  if (!validateFieldInput(meta.pendingField, text)) return null;

  // Silently restore field state and process the answer
  awaitingField.set(userId, {
    field: meta.pendingField,
    queue: meta.pendingQueue ?? [],
    startedAt: Date.now(),
    mode: meta.pendingMode ?? 'general',
  });
  return handleFieldCapture(userId, text);
}

// Show the "คุยต่อ / เริ่มใหม่?" prompt
export function startResumeFlow(userId: string): CaptureResponse {
  awaitingResume.set(userId, { startedAt: Date.now() });
  const meta = stateMetadata.get(userId);
  const ageMs = meta ? Date.now() - meta.stateUpdatedAt : 0;
  const ageH  = Math.round(ageMs / 3_600_000);
  const ageD  = Math.round(ageH / 24);
  const ageText = ageH < 1 ? 'เมื่อกี้' : ageH < 24 ? `${ageH} ชั่วโมงที่แล้ว` : `${ageD} วันที่แล้ว`;
  const data    = userLeadData.get(userId) ?? {};
  const product = data.product_interest ? ` (${data.product_interest})` : '';
  const field   = meta?.pendingField ? ` กำลังถามเรื่อง${FIELD_LABELS[meta.pendingField]}` : '';

  return {
    reply: `ยังมีข้อมูลที่คุยค้างไว้ ${ageText}นะครับ${product}${field}\n\nคุณต้องการคุยต่อจากข้อมูลเดิม หรือเริ่มใหม่ครับ?`,
    quickReply: QR_RESUME,
  };
}

// Handle user's answer to the resume prompt
export function handleResumeAwait(userId: string, text: string): CaptureResponse {
  // Intent trigger while in resume prompt → cancel prompt, fall through
  if (isAnyTrigger(text)) {
    awaitingResume.delete(userId);
    return { reply: '', fallthrough: true };
  }

  const n = normTH(text);
  const isContinue = ['ต่อ', 'คุยต่อ', 'ต่อได้', 'ต่อเลย', 'yes', 'ใช่', 'ดำเนินการ'].some((kw) => n.includes(kw));
  const isReset    = ['ใหม่', 'เริ่มใหม่', 'reset', 'no', 'ไม่', 'ล้าง'].some((kw) => n.includes(kw));

  if (isContinue) {
    awaitingResume.delete(userId);
    const meta = stateMetadata.get(userId);
    if (meta?.pendingField) {
      awaitingField.set(userId, {
        field:     meta.pendingField,
        queue:     meta.pendingQueue ?? [],
        startedAt: Date.now(),
        mode:      meta.pendingMode ?? 'general',
      });
      const q = buildFieldQuestion(meta.pendingField, meta.pendingMode ?? 'general', userId);
      return { ...q, resumed: true };
    }
    return { reply: 'รับทราบครับ ลองใหม่ได้เลยครับ 😊', done: true, resumed: true };
  }

  if (isReset) {
    awaitingResume.delete(userId);
    cancelAllCapture(userId);
    clearLeadData(userId);
    stateMetadata.delete(userId);
    return { reply: 'รับทราบครับ 😊 เริ่มใหม่ได้เลยครับ!', reset: true, done: true };
  }

  // Unrecognised → cancel resume, fall through to normal processing
  awaitingResume.delete(userId);
  return { reply: '', fallthrough: true };
}

// ─── State management ─────────────────────────────────────────────────────────

export function cancelFieldCapture(userId: string): void {
  const state = awaitingField.get(userId);
  if (state) {
    saveStateMetadata(userId, { lastState: `awaiting_field:${state.field}`, pendingField: undefined });
  }
  awaitingField.delete(userId);
}

export function cancelAwaitingPhone(userId: string): void { awaitingPhone.delete(userId); }

export function cancelAllCapture(userId: string): void {
  const curState = getCurrentState(userId);
  saveStateMetadata(userId, { lastState: curState, pendingField: undefined });
  awaitingField.delete(userId);
  awaitingPhone.delete(userId);
  awaitingGoal.delete(userId);
  awaitingCategory.delete(userId);
  awaitingResume.delete(userId);
}

export function clearLeadData(userId: string): void    { userLeadData.delete(userId); }
export function clearStateMetadata(userId: string): void { stateMetadata.delete(userId); }

// ─── Lead completeness ────────────────────────────────────────────────────────

export function getMissingFields(userId: string, required: LeadField[]): LeadField[] {
  const data = userLeadData.get(userId) ?? {};
  return required.filter((f) => !data[f]);
}

export function getLeadCompleteness(userId: string): { score: number; total: number; missing: LeadField[] } {
  const missing = getMissingFields(userId, SCORED_FIELDS);
  return { score: SCORED_FIELDS.length - missing.length, total: SCORED_FIELDS.length, missing };
}

export function isLeadComplete(userId: string): boolean {
  return getMissingFields(userId, SCORED_FIELDS).length === 0;
}

// ─── Data extraction ──────────────────────────────────────────────────────────

export function detectPhone(text: string): string | null {
  const m = text.match(/0[689]\d[-\s]?\d{3,4}[-\s]?\d{3,4}/) ?? text.match(/0\d{9}/);
  return m ? m[0].replace(/[-\s]/g, '') : null;
}

export function extractFromText(text: string): Partial<ExtractedData> {
  const r: Partial<ExtractedData> = {};

  const ageM = text.match(/อายุ\s*(\d{1,3})/) ?? text.match(/(\d{1,3})\s*ปี\b/);
  if (ageM) r.age = ageM[1];

  const incM = text.match(/รายได้\s*([\d,]+)/) ?? text.match(/เงินเดือน\s*([\d,]+)/);
  if (incM) r.monthly_income = incM[1].replace(/,/g, '');

  const bdgM =
    text.match(/งบประมาณ\s*([\d,]+)/) ??
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

export function isContactTrigger(text: string): boolean {
  const n = normTH(text);
  return CONTACT_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

export function isQuoteTrigger(text: string): boolean {
  const n = normTH(text);
  return QUOTE_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

export function isInterestTrigger(text: string): boolean {
  const n = normTH(text);
  return INTEREST_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

export function isAnyTrigger(text: string): boolean {
  const n = normTH(text);
  return ALL_INTENT_TRIGGERS.some((kw) => n.includes(normTH(kw)));
}

// ─── Existing data summary ────────────────────────────────────────────────────

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

function buildGeneralFieldQuestion(field: LeadField): CaptureResponse {
  switch (field) {
    case 'age':
      return { reply: '😊 ขอทราบอายุด้วยครับ\n\nประมาณกี่ปีครับ?', quickReply: QR_AGE };
    case 'gender':
      return { reply: '😊 ขอทราบเพศด้วยครับ', quickReply: QR_GENDER };
    case 'product_interest':
      return { reply: '😊 สนใจแผนไหนครับ?', quickReply: QR_INSURANCE_CATEGORIES };
    case 'phone':
      return { reply: '😊 ขอเบอร์ที่สะดวกรับสายด้วยครับ' };
    case 'budget':
      return { reply: '😊 งบประมาณต่อปีประมาณเท่าไรครับ?\n\nเช่น 20,000 / 50,000 บาท/ปี' };
    default:
      return { reply: '' };
  }
}

function buildPremiumQuoteFieldQuestion(field: LeadField, data: ExtractedData): CaptureResponse {
  const product = data.product_interest;
  switch (field) {
    case 'product_interest':
      return {
        reply: 'ได้เลยครับ 😊\nขอทราบก่อนว่าสนใจแผนไหนครับ?',
        quickReply: QR_INSURANCE_CATEGORIES,
      };
    case 'age': {
      const productLine = product ? `สำหรับ ${product} เบี้ยขึ้นกับอายุและเพศ\n\n` : '';
      return {
        reply: `ได้เลยครับ 😊\n${productLine}ขอทราบอายุของผู้เอาประกันก่อนครับ (เช่น 35)`,
        quickReply: QR_AGE,
      };
    }
    case 'gender':
      return { reply: 'กรุณาเลือกเพศครับ', quickReply: QR_GENDER };
    case 'budget':
      return { reply: 'ขอทราบงบประมาณต่อปีครับ?\n\nเช่น 20,000 / 50,000 บาท/ปี' };
    default:
      return buildGeneralFieldQuestion(field);
  }
}

function buildFieldQuestion(
  field: LeadField,
  mode: 'general' | 'premium_quote',
  userId: string
): CaptureResponse {
  if (mode === 'premium_quote') {
    return buildPremiumQuoteFieldQuestion(field, userLeadData.get(userId) ?? {});
  }
  return buildGeneralFieldQuestion(field);
}

function validateFieldInput(field: LeadField, text: string): boolean {
  switch (field) {
    case 'age':
      return /\d/.test(text) || ['ต่ำกว่า 30', '30-39', '40-49', '50+'].some((r) => text.includes(r));
    case 'gender':
      return text.includes('ชาย') || text.includes('หญิง') || text.includes('ไม่ระบุ');
    default:
      return text.length > 0 && text.length < 200;
  }
}

const PRODUCT_MAP: Record<string, string> = {
  '1': 'ประกันชีวิตสะสมทรัพย์',
  '2': 'ประกันลดหย่อนภาษี',
  '3': 'ประกันเกษียณ',
  '4': 'ประกันสุขภาพ',
  '5': 'ประกันมะเร็งและโรคร้ายแรง',
  '6': 'ประกันควบการลงทุน Unit Linked',
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
    return text.replace('ปี', '').trim();
  }
  return text.trim();
}

export function startFieldCapture(
  userId: string,
  missingFields: LeadField[],
  intro?: string,
  mode: 'general' | 'premium_quote' = 'general'
): CaptureResponse {
  if (missingFields.length === 0) return { reply: '', done: true, mode };
  const [first, ...rest] = missingFields;
  awaitingField.set(userId, { field: first, queue: rest, startedAt: Date.now(), mode });
  saveStateMetadata(userId, {
    lastState:    `awaiting_field:${first}`,
    pendingField: first,
    pendingQueue: rest,
    pendingMode:  mode,
  });
  const q     = buildFieldQuestion(first, mode, userId);
  const reply = intro ? `${intro}\n\n${q.reply}` : q.reply;
  return { ...q, reply };
}

export function handleFieldCapture(userId: string, text: string): CaptureResponse {
  const state = awaitingField.get(userId);
  if (!state) return { reply: '', done: true };

  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingField.delete(userId);
    saveStateMetadata(userId, { lastState: `awaiting_field:${state.field}`, pendingField: undefined });
    return { reply: 'รับทราบครับ 😊', cancelled: true, done: true, mode: state.mode };
  }

  if (!validateFieldInput(state.field, text)) {
    return buildFieldQuestion(state.field, state.mode, userId);
  }

  const value = normalizeFieldValue(state.field, text);
  accumulateLeadData(userId, { [state.field]: value });

  if (state.queue.length > 0) {
    const [next, ...remaining] = state.queue;
    awaitingField.set(userId, { ...state, field: next, queue: remaining, startedAt: Date.now() });
    saveStateMetadata(userId, {
      lastState:    `awaiting_field:${next}`,
      pendingField: next,
      pendingQueue: remaining,
      pendingMode:  state.mode,
    });
    return buildFieldQuestion(next, state.mode, userId);
  }

  awaitingField.delete(userId);
  saveStateMetadata(userId, { lastState: `field_complete`, pendingField: undefined });
  return { reply: '', done: true, allCaptured: true, mode: state.mode };
}

// ─── Interest → Category flow ─────────────────────────────────────────────────

export function startCategoryFlow(userId: string): CaptureResponse {
  awaitingCategory.set(userId, { startedAt: Date.now() });
  return {
    reply: '😊 ยินดีให้คำแนะนำครับ\n\nสนใจแผนไหนเป็นพิเศษครับ?',
    quickReply: QR_INSURANCE_CATEGORIES,
  };
}

export function handleCategoryAwait(userId: string, text: string): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingCategory.delete(userId);
    return { reply: 'รับทราบครับ 😊', cancelled: true };
  }
  awaitingCategory.delete(userId);
  const category = PRODUCT_MAP[text.trim()] ?? text.trim();
  accumulateLeadData(userId, { product_interest: category });
  return { reply: '' };
}

// ─── Phone → Goal flow ────────────────────────────────────────────────────────

export function startPhoneAwait(userId: string): CaptureResponse {
  awaitingPhone.set(userId, { startedAt: Date.now() });
  return { reply: '😊 ขอเบอร์ที่สะดวกรับสายด้วยครับ' };
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
    reply: 'ขอบคุณครับ 🙏\n\nสนใจวางแผนเรื่องไหนครับ?',
    quickReply: QR_GOALS,
  };
}

const GOAL_MAP: Record<string, string> = {
  '1': 'ลดหย่อนภาษี', '2': 'ประกันสุขภาพ',
  '3': 'ประกันมะเร็ง', '4': 'ลงทุนระยะยาว',
};

export function handleGoalAwait(userId: string, text: string, displayName: string): CaptureResponse {
  if (CANCEL_KEYWORDS.some((kw) => text.includes(kw))) {
    awaitingGoal.delete(userId);
    return { reply: 'รับทราบครับ 😊', cancelled: true, done: true };
  }
  const goal = GOAL_MAP[text.trim()] ?? text.trim();
  accumulateLeadData(userId, { purchase_objective: goal });
  awaitingGoal.delete(userId);
  const data = getLeadData(userId);
  const { score, total } = getLeadCompleteness(userId);
  return { reply: buildSummary(displayName, data, score, total), done: true };
}

// ─── Summary builders ─────────────────────────────────────────────────────────

export function buildSummary(
  displayName: string,
  data: ExtractedData,
  score?: number,
  total?: number
): string {
  const f   = (v?: string) => v || '-';
  const inc = data.monthly_income ? `${Number(data.monthly_income).toLocaleString('th-TH')} บาท/เดือน` : '-';
  const bdg = data.budget         ? `${Number(data.budget).toLocaleString('th-TH')} บาท` : '-';
  const sc  = score !== undefined ? ` (${score}/${total})` : '';

  return (
    `📋 สรุปข้อมูล${sc}\n\n` +
    `👤 ชื่อ: ${f(displayName || data.real_name)}\n` +
    `🎂 อายุ: ${f(data.age)}\n` +
    `⚧ เพศ: ${f(data.gender)}\n` +
    `💰 รายได้: ${inc}\n` +
    `🎯 เป้าหมาย: ${f(data.purchase_objective)}\n` +
    `📄 แผนที่สนใจ: ${f(data.product_interest)}\n` +
    `💵 งบประมาณ: ${bdg}\n` +
    `📞 เบอร์โทร: ${f(data.phone)}\n` +
    `🕒 เวลาสะดวก: ${f(data.preferred_contact_time)}\n\n` +
    'คุณจิราวัฒน์จะติดต่อกลับเร็วๆ นี้ครับ 🙏'
  );
}

export function buildQuoteSummary(data: ExtractedData): string {
  const f   = (v?: string) => v || '-';
  const bdg = data.budget ? `${Number(data.budget).toLocaleString('th-TH')} บาท/ปี` : '-';
  return [
    '📋 ข้อมูลสำหรับเช็กเบี้ย',
    '',
    `• แผนที่สนใจ: ${f(data.product_interest)}`,
    `• อายุ: ${data.age ? data.age + ' ปี' : '-'}`,
    `• เพศ: ${f(data.gender)}`,
    `• งบประมาณ: ${bdg}`,
    `• เบอร์โทร: ${f(data.phone)}`,
    `• เวลาสะดวก: ${f(data.preferred_contact_time)}`,
    '',
    'ผมจะส่งต่อให้คุณจิราวัฒน์ช่วยเช็กเบี้ยและติดต่อกลับครับ 😊',
  ].join('\n');
}

// ─── Lead payload ─────────────────────────────────────────────────────────────

export function buildLeadPayload(userId: string, displayName: string, data: ExtractedData): LeadUpsert {
  const today = new Date().toISOString().split('T')[0];
  return {
    line_user_id: userId, display_name: displayName,
    real_name: data.real_name ?? '', age: data.age ?? '', gender: data.gender ?? '',
    phone: data.phone ?? '', monthly_income: data.monthly_income ?? '',
    purchase_objective: data.purchase_objective ?? '', product_interest: data.product_interest ?? '',
    budget: data.budget ?? '', preferred_contact_time: data.preferred_contact_time ?? '',
    lead_status: 'qualified', follow_up_status: 'pending',
    last_contact_date: today, first_contact_date: today,
  };
}

// Convenience: build CRM state fields for any upsert call
export function buildStatePayload(userId: string): Pick<LeadUpsert, 'current_state' | 'last_intent' | 'state_updated_at'> {
  const debug = getStateDebugInfo(userId);
  return {
    current_state:    debug.currentState,
    last_intent:      debug.lastIntent,
    state_updated_at: new Date().toISOString(),
  };
}
