import type { ExecutionContext } from '../context/contextTypes';
import type { ConversationTurnContext } from '../core/types';

export const HEALTH_INTEREST_DIRECT_ANSWER = [
  'ได้ครับ ถ้าเป็นประกันสุขภาพ ผมช่วยดูให้ได้ครับ',
  '',
  'หลัก ๆ เราจะดู 3 เรื่องก่อน:',
  '1. ปกติเข้าโรงพยาบาลไหน',
  '2. อยากได้ค่าห้องประมาณเท่าไหร่',
  '3. อยากเน้นแค่ IPD หรืออยากมี OPD/ตรวจสุขภาพ/วัคซีนด้วย',
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
