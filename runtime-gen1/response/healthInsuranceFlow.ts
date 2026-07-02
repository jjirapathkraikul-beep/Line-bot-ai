import type { ExecutionContext } from '../context/contextTypes';
import type { ConversationTurnContext } from '../core/types';

export const HEALTH_INTEREST_DIRECT_ANSWER = [
  'ได้ครับ ถ้าเป็นประกันสุขภาพ ผมช่วยดูให้ได้ครับ',
  '',
  'หลัก ๆ เราจะดู 4 เรื่องก่อน:',
  '1. ปกติเข้าโรงพยาบาลไหน',
  '2. อยากได้ค่าห้องประมาณเท่าไหร่',
  '3. อายุผู้เอาประกัน',
  '4. งบประมาณต่อปีที่อยากวางไว้',
  '',
  'ขอถามก่อนครับ ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ?',
].join('\n');

export const HEALTH_OPTIONS_DIRECT_ANSWER = [
  'ถ้าพูดเฉพาะประกันสุขภาพ หลัก ๆ จะเลือกได้ประมาณนี้ครับ',
  '',
  '1. แผนเน้น IPD',
  'เหมาะกับคนที่อยากคุมค่ารักษาเวลานอนโรงพยาบาลเป็นหลัก',
  '',
  '2. แผนที่มี OPD / ตรวจสุขภาพ / วัคซีน',
  'เหมาะกับคนที่อยากมีวงเงินสำหรับผู้ป่วยนอกหรือดูแลสุขภาพประจำปีเพิ่ม',
  '',
  '3. แผนเสริมโรคร้ายแรง / มะเร็ง',
  'เหมาะกับคนที่กังวลค่าใช้จ่ายก้อนใหญ่จากโรคหนัก',
  '',
  'ถ้าจะเลือกให้ตรง ผมขอถามก่อนครับ ปกติเข้าโรงพยาบาลไหนเป็นหลัก?',
].join('\n');

export const HEALTH_CATEGORY_CONFIRMATION_DIRECT_ANSWER = [
  'โอเคครับ งั้นเราดูฝั่งประกันสุขภาพกัน',
  '',
  'ผมขอเริ่มจากคำถามที่ใช้เลือกแผนได้แม่นที่สุดก่อนนะครับ: ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ?',
].join('\n');

export interface HealthInsuranceFlowInput {
  executionContext: ExecutionContext;
  conversationHistory?: ConversationTurnContext[];
}

export interface HealthAdvisorySlots {
  preferred_hospital?: string;
  desired_room_amount?: number;
  wants_opd?: boolean;
  age?: number;
  budget_annual?: number;
  interest_category?: string;
  product_interest?: string;
}

const GHP_ROOM_PLAN_TIERS = [2000, 3000, 4000, 6000, 8000, 10000, 12000];

function norm(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

function hasHealthContext(ctx: ExecutionContext, history: ConversationTurnContext[] = []): boolean {
  const haystack = [
    ctx.request.rawInput,
    ctx.request.normalizedInput,
    ...ctx.memory.knownFacts.map((f) => `${f.field}:${f.value}`),
    ...history.map((t) => `${t.userMessage} ${t.assistantResponse} ${t.intent}`),
  ].join('\n');

  const n = norm(haystack);
  return n.includes('ประกันสุขภาพ') ||
    n.includes('health_insurance') ||
    n.includes('health insurance') ||
    n.includes('good health prime');
}

function isBenefitDetailQuestion(normalized: string): boolean {
  return normalized.includes('opd') ||
    normalized.includes('ผู้ป่วยนอก') ||
    normalized.includes('ตรวจสุขภาพ') ||
    normalized.includes('วัคซีน') ||
    normalized.includes('ฉีดวัคซีน');
}

function isSpecificAdvisoryQuestion(normalized: string): boolean {
  return normalized.includes('แนะนำ') ||
    normalized.includes('เบี้ย') ||
    normalized.includes('ราคา') ||
    normalized.includes('เท่าไร') ||
    normalized.includes('เท่าไหร่') ||
    normalized.includes('คุ้มครองอะไร') ||
    normalized.includes('คืออะไร');
}

function isOpdPreferenceStatement(normalized: string): boolean {
  return normalized.includes('ไม่เอา opd') ||
    normalized.includes('ไม่ต้องการ opd') ||
    normalized.includes('ไม่อยากมี opd') ||
    normalized.includes('เอาแบบมี opd') ||
    normalized.includes('มี opd') ||
    normalized.includes('opd ด้วย');
}

function parseIntegerAmount(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  const amount = Number.parseInt(digits, 10);
  return Number.isFinite(amount) ? amount : undefined;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US');
}

export function mapRoomAmountToGhpPlan(amount: number): number {
  return GHP_ROOM_PLAN_TIERS.find((tier) => amount <= tier) ?? GHP_ROOM_PLAN_TIERS[GHP_ROOM_PLAN_TIERS.length - 1];
}

function extractHospital(text: string): string | undefined {
  const raw = text.normalize('NFC').trim();
  const normalized = norm(raw);
  if (!raw) return undefined;

  if (normalized.includes('นนทเวช')) return 'นนทเวช';

  const hospitalMatch = raw.match(/(?:เข้าที่|ใช้|ไป|เข้า)?\s*(?:รพ\.?|โรงพยาบาล)\s*([ก-๙A-Za-z0-9 .-]{2,40})/i);
  const hospital = hospitalMatch?.[1]?.trim()
    .replace(/[?.!]+$/g, '')
    .replace(/\s+/g, ' ');

  if (!hospital) return undefined;
  if (norm(hospital).includes('ไหน')) return undefined;
  return hospital;
}

function extractSlotsFromText(text: string): HealthAdvisorySlots {
  const normalized = norm(text);
  const slots: HealthAdvisorySlots = {};

  const hospital = extractHospital(text);
  if (hospital) slots.preferred_hospital = hospital;

  const roomMatch = normalized.match(/ค่าห้อง\s*(\d[\d,]*)/);
  const roomAmount = parseIntegerAmount(roomMatch?.[1]);
  if (roomAmount) slots.desired_room_amount = roomAmount;

  if (
    normalized.includes('ไม่เอา opd') ||
    normalized.includes('ไม่ต้องการ opd') ||
    normalized.includes('ไม่อยากมี opd')
  ) {
    slots.wants_opd = false;
  } else if (
    normalized.includes('เอาแบบมี opd') ||
    normalized.includes('มี opd') ||
    normalized.includes('opd ด้วย')
  ) {
    slots.wants_opd = true;
  }

  const ageMatch = normalized.match(/อายุ\s*(\d{1,2})/) ?? normalized.match(/(\d{1,2})\s*ปี/);
  const age = parseIntegerAmount(ageMatch?.[1]);
  if (age && age > 0 && age < 100) slots.age = age;

  const budgetMatch = normalized.match(/(?:งบ|ปีละ)\s*(\d[\d,]*)/);
  const budget = parseIntegerAmount(budgetMatch?.[1]);
  if (budget) slots.budget_annual = budget;

  return slots;
}

function extractSlotsFromKnownFacts(ctx: ExecutionContext): HealthAdvisorySlots {
  const slots: HealthAdvisorySlots = {};

  for (const fact of ctx.memory.knownFacts) {
    const field = norm(String(fact.field));
    const value = String(fact.value ?? '').trim();
    if (!value) continue;

    if (field === 'age') {
      const age = parseIntegerAmount(value);
      if (age) slots.age = age;
    } else if (field === 'budget_annual') {
      const budget = parseIntegerAmount(value);
      if (budget) slots.budget_annual = budget;
    } else if (field === 'interest_category') {
      slots.interest_category = value;
    } else if (field === 'product_interest') {
      slots.product_interest = value;
    }
  }

  return slots;
}

function mergeSlots(base: HealthAdvisorySlots, incoming: HealthAdvisorySlots): HealthAdvisorySlots {
  return { ...base, ...Object.fromEntries(Object.entries(incoming).filter(([, value]) => value !== undefined)) };
}

export function resolveHealthAdvisorySlots(input: HealthInsuranceFlowInput): HealthAdvisorySlots {
  const { executionContext: ctx, conversationHistory = [] } = input;
  let slots: HealthAdvisorySlots = {};

  for (const turn of conversationHistory) {
    slots = mergeSlots(slots, extractSlotsFromText(turn.userMessage));
  }

  slots = mergeSlots(slots, extractSlotsFromKnownFacts(ctx));
  slots = mergeSlots(slots, extractSlotsFromText(ctx.request.rawInput));

  return slots;
}

function buildHealthSlotContinuationAnswer(input: HealthInsuranceFlowInput): string | null {
  const { executionContext: ctx, conversationHistory = [] } = input;
  const normalized = norm(ctx.request.rawInput);
  const currentSlots = extractSlotsFromText(ctx.request.rawInput);
  const slots = resolveHealthAdvisorySlots(input);
  const activeHealthContext = hasHealthContext(ctx, conversationHistory);

  if (!activeHealthContext && !isHealthCategorySelection(normalized)) return null;
  if (isSpecificAdvisoryQuestion(normalized)) return null;
  if (isBenefitDetailQuestion(normalized) && !isOpdPreferenceStatement(normalized)) return null;

  if (!slots.preferred_hospital) {
    if (isHealthOptionsQuestion(normalized)) return null;
    if (isHealthCategorySelection(normalized)) return null;
    return null;
  }

  if (!slots.desired_room_amount) {
    const acknowledgement = currentSlots.preferred_hospital
      ? `ได้ครับ ถ้าใช้โรงพยาบาล${slots.preferred_hospital}เป็นหลัก ผมจะใช้โรงพยาบาลนี้เป็นตัวเทียบแผนให้ครับ`
      : slots.wants_opd === true
      ? 'ได้ครับ ถ้าอยากมี OPD ด้วย ผมจะเก็บเป็นเงื่อนไขในการเทียบแผนให้ครับ'
      : slots.wants_opd === false
      ? 'ได้ครับ ถ้าไม่เน้น OPD ผมจะใช้โจทย์นี้เทียบแผนฝั่ง IPD ให้ครับ'
      : `ได้ครับ ถ้าใช้โรงพยาบาล${slots.preferred_hospital}เป็นหลัก ผมจะใช้โรงพยาบาลนี้เป็นตัวเทียบแผนให้ครับ`;

    return [
      acknowledgement,
      '',
      'อยากดูค่าห้องประมาณเท่าไหร่ครับ เช่น 4,000 / 6,000 / 8,000 บาท?',
    ].join('\n');
  }

  if (slots.desired_room_amount) {
    const planAmount = mapRoomAmountToGhpPlan(slots.desired_room_amount);
    const planIntro = `ได้ครับ ถ้าต้องการประกันสุขภาพค่าห้อง ${formatAmount(slots.desired_room_amount)} Good Health Prime แผนค่าห้อง ${formatAmount(planAmount)} ตรงกับโจทย์นี้ครับ`;
    const valueAddedLines = slots.wants_opd === true
      ? [
        '',
        'จุดเด่นคือแผนนี้ไม่ได้มีแค่ค่ารักษาเวลานอนโรงพยาบาล แต่ยังมีวงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปีด้วย',
        '',
        'ตรงนี้ช่วยเพิ่มความคุ้มค่า เพราะถึงไม่ป่วยก็ยังมีโอกาสใช้กับการตรวจสุขภาพหรือวัคซีนได้ครับ',
      ]
      : slots.wants_opd === false
      ? [
        '',
        'ถ้าไม่เน้น OPD เราจะใช้ค่าห้องและโรงพยาบาลหลักเป็นโจทย์ตั้งต้นก่อน แล้วค่อยดูว่าแผนไหนคุ้มกับงบที่สุดครับ',
      ]
      : [
        '',
        'แผนนี้มีความคุ้มครองค่ารักษาเวลานอนโรงพยาบาล และมีวงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปีเป็นประโยชน์เสริมของแผน',
      ];

    const nextQuestion = !slots.age
      ? 'ขอทราบอายุผู้เอาประกันหน่อยครับ จะได้ช่วยดูเบี้ยคร่าว ๆ ต่อได้ครับ'
      : !slots.budget_annual
      ? 'ขอทราบงบประมาณต่อปีที่อยากวางไว้คร่าว ๆ หน่อยครับ'
      : 'ข้อมูลหลักครบแล้วครับ เดี๋ยวขั้นถัดไปควรให้คุณจิราวัฒน์ช่วยดูเบี้ยและความเหมาะสมของแผนให้ตรงเคสครับ';

    return [
      planIntro,
      ...valueAddedLines,
      '',
      `ถ้าใช้โรงพยาบาล${slots.preferred_hospital}เป็นหลัก ผมจะใช้โรงพยาบาลนี้เป็นตัวเทียบแผนให้ครับ`,
      '',
      nextQuestion,
    ].join('\n');
  }

  return null;
}

export function isHealthCategorySelection(text: string): boolean {
  const n = norm(text);
  return n === 'ประกันสุขภาพ' ||
    n === 'สุขภาพ' ||
    n === 'แบบสุขภาพ' ||
    n.includes('สนใจประกันสุขภาพ') ||
    n.includes('อยากดูประกันสุขภาพ') ||
    n.includes('อยากได้ประกันสุขภาพ') ||
    n.includes('สนใจทำประกันสุขภาพ');
}

export function isHealthOptionsQuestion(text: string): boolean {
  const n = norm(text);
  return n.includes('มีแบบไหนให้เลือกบ้าง') ||
    n.includes('มีแบบไหนบ้าง') ||
    n.includes('แบบไหนให้เลือกบ้าง') ||
    n.includes('เลือกแบบไหนได้บ้าง') ||
    n.includes('มีแผนแบบไหนบ้าง');
}

export function getHealthInsuranceFlowDirectAnswer(input: HealthInsuranceFlowInput): string | null {
  const { executionContext: ctx, conversationHistory = [] } = input;
  if (ctx.decision.action === 'handoff' || ctx.decision.shouldEscalate) return null;

  const normalized = norm(ctx.request.rawInput);
  const slotContinuationAnswer = buildHealthSlotContinuationAnswer(input);
  if (slotContinuationAnswer) return slotContinuationAnswer;

  if (isBenefitDetailQuestion(normalized)) return null;
  if (isSpecificAdvisoryQuestion(normalized)) return null;

  if (isHealthOptionsQuestion(normalized) && hasHealthContext(ctx, conversationHistory)) {
    return HEALTH_OPTIONS_DIRECT_ANSWER;
  }

  if (isHealthCategorySelection(normalized)) {
    if (normalized === 'ประกันสุขภาพ' || normalized === 'สุขภาพ' || normalized === 'แบบสุขภาพ') {
      return HEALTH_CATEGORY_CONFIRMATION_DIRECT_ANSWER;
    }
    return HEALTH_INTEREST_DIRECT_ANSWER;
  }

  return null;
}
