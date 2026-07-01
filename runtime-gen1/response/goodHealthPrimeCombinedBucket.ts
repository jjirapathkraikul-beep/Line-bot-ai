import type { ExecutionContext } from '../context/contextTypes';
import type { ConversationTurnContext } from '../core/types';

export const GHP_COMBINED_BUCKET_DIRECT_ANSWER =
  'ได้ครับ หมวดนี้เป็นวงเงินรวมต่อปี ใช้ได้กับ ตรวจสุขภาพ หรือ รักษาผู้ป่วยนอก หรือ ฉีดวัคซีน ตามวงเงินของแผนที่เลือกครับ';

export const GHP_OPD_DIRECT_ANSWER = [
  'มีครับ แต่ไม่ใช่ OPD เหมาจ่ายทั่วไปทุกครั้งที่ไปหาหมอ',
  '',
  'Good Health Prime มี OPD/ผู้ป่วยนอกใน 3 ส่วนหลัก:',
  '1. OPD หลังนอนโรงพยาบาล ภายใน 31 วัน ไม่เกิน 2 ครั้ง',
  '2. OPD อุบัติเหตุ ภายใน 24 ชั่วโมง',
  '3. วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี ตามแผนที่เลือก',
  '',
  'วงเงินย่อยหมวดนี้ตามแผน:',
  '- แผนค่าห้อง 2,000: 3,000 บาท/ปี',
  '- แผนค่าห้อง 4,000: 5,000 บาท/ปี',
  '- แผนค่าห้อง 6,000: 10,000 บาท/ปี',
  '- แผนค่าห้อง 8,000: 15,000 บาท/ปี',
  '- แผนค่าห้อง 10,000 และ 12,000: 20,000 บาท/ปี',
  '',
  'ถ้าบอกแผนที่สนใจ ผมช่วยดูวงเงินหมวดนี้ให้ได้ครับ',
].join('\n');

export interface GoodHealthPrimeCombinedBucketInput {
  executionContext: ExecutionContext;
  conversationHistory?: ConversationTurnContext[];
}

function norm(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

function hasGoodHealthPrimeContext(ctx: ExecutionContext, history: ConversationTurnContext[] = []): boolean {
  const haystack = [
    ctx.request.rawInput,
    ctx.request.normalizedInput,
    ...ctx.memory.knownFacts.map((f) => `${f.field}:${f.value}`),
    ...ctx.knowledge.sources.map((s) => `${s.sourceId} ${s.fullPath} ${s.excerpt}`),
    ...history.map((t) => `${t.userMessage} ${t.assistantResponse}`),
  ].join('\n');

  const n = norm(haystack);
  return n.includes('good health prime') || n.includes('good_health_prime') || n.includes('health prime');
}

export function isGoodHealthPrimeCombinedBucketQuestion(text: string): boolean {
  const n = norm(text);
  const mentionsOpd = n.includes('opd') || n.includes('ผู้ป่วยนอก') || n.includes('วงเงินนี้') || n.includes('หมวดนี้');
  const mentionsCheckup = n.includes('ตรวจสุขภาพ');
  const mentionsVaccine = n.includes('วัคซีน') || n.includes('ฉีดวัคซีน');
  const asksSameBucket = n.includes('วงเงินเดียวกัน') || n.includes('ใช้วงเงินเดียวกัน') || n.includes('รวมกัน');
  const asksReuse = n.includes('เอาไป') ||
    (n.includes('เอา') && n.includes('ไป')) ||
    n.includes('ใช้') ||
    n.includes('ไม่ได้ใช้') ||
    n.includes('ทำอะไรได้บ้าง');

  if (mentionsOpd && (mentionsCheckup || mentionsVaccine) && asksReuse) return true;
  if (mentionsCheckup && mentionsVaccine && asksSameBucket) return true;
  if (mentionsOpd && n.includes('ทำอะไรได้บ้าง')) return true;
  if ((n.includes('วงเงินนี้') || n.includes('หมวดนี้')) && (mentionsCheckup || mentionsVaccine) && asksReuse) return true;

  return false;
}

function isGoodHealthPrimeOpdQuestion(text: string): boolean {
  const n = norm(text);
  const mentionsOpd = n.includes('opd') || n.includes('ผู้ป่วยนอก');
  if (!mentionsOpd) return false;
  return n.includes('มี') ||
    n.includes('ไหม') ||
    n.includes('มั้ย') ||
    n.includes('คุ้มครอง') ||
    n.includes('ได้ไหม');
}

export function getGoodHealthPrimeCombinedBucketDirectAnswer(
  input: GoodHealthPrimeCombinedBucketInput,
): string | null {
  const { executionContext: ctx, conversationHistory = [] } = input;
  if (!hasGoodHealthPrimeContext(ctx, conversationHistory)) return null;
  if (ctx.decision.action === 'handoff' || ctx.decision.shouldEscalate) return null;
  if (isGoodHealthPrimeCombinedBucketQuestion(ctx.request.rawInput)) return GHP_COMBINED_BUCKET_DIRECT_ANSWER;
  if (isGoodHealthPrimeOpdQuestion(ctx.request.rawInput)) return GHP_OPD_DIRECT_ANSWER;
  return null;
}
