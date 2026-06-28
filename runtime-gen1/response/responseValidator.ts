// Gen1 Response Validator — Phase 10.7
// Post-LLM validation: catches safety violations in the generated text.
// HARD failures → replace with safe fallback text.
// SOFT failures → log warning, return original text.

import type { ExecutionContext } from '../context/contextTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResponseValidatorInput {
  text: string;
  executionContext: ExecutionContext;
}

export interface ResponseValidatorResult {
  passed: boolean;
  text: string;              // Original or safe fallback
  failures: string[];        // HARD failures
  warnings: string[];        // SOFT warnings
  usedFallback: boolean;
  wordCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const RESPONSE_SAFE_FALLBACK_TEXT =
  'ขอโทษด้วยนะครับ ตอนนี้ระบบกำลังปรับปรุงอยู่ครับ มีอะไรให้ช่วยเพิ่มเติมไหมครับ?';

// Phone/contact request patterns (Thai)
const PHONE_REQUEST_PATTERNS = [
  'เบอร์โทร', 'เบอร์มือถือ', 'เบอร์ติดต่อ', 'หมายเลขโทรศัพท์',
  'ฝากเบอร์', 'ทิ้งเบอร์', 'ให้เบอร์',
];
const PHONE_SHORT_PATTERNS = ['เบอร์'];   // Shorter — only counted with question context

// Question indicators (Thai + universal)
const QUESTION_MARKERS = ['?', 'ไหมครับ', 'ไหมคะ', 'ได้ไหม', 'มั้ยครับ', 'มั้ยคะ', 'ได้เลยครับ'];

// Medical acceptance guarantee patterns
const MEDICAL_GUARANTEE_PATTERNS = [
  'การันตีว่าจะผ่าน',
  'รับประกันว่าจะผ่าน',
  'ยืนยันว่าจะผ่านการพิจารณา',
  'ผ่านแน่นอน',
  'รับได้แน่นอน',
  'การันตีได้เลยว่าผ่าน',
];

// Investment return guarantee patterns
const INVESTMENT_RETURN_PATTERNS = [
  'ผลตอบแทนการันตี',
  'ผลตอบแทนเฉลี่ย',   // paired with a % figure is the full prohibition phrase
  'การันตีผลตอบแทน',
  'รับประกันผลตอบแทน',
  'ผลตอบแทนแน่นอน',
  'ผลตอบแทนรับประกัน',
];

// Global prohibited phrases (must match contextBuilder.ts list exactly)
const GLOBAL_PROHIBITED = [
  'ผมการันตีว่าจะผ่านการพิจารณา',
  'ราคาถูกที่สุด',
  'บริษัทอื่นด้อยกว่า',
  'ต้องตัดสินใจวันนี้เท่านั้น',
  'ไม่ใช่มิจฉาชีพครับ',
];

// Disclaimer markers for medical context
const DISCLAIMER_MARKERS = [
  'รายกรณี', 'case-by-case', 'ไม่สามารถการันตี',
  'พิจารณาเป็นรายกรณี', 'ขึ้นอยู่กับสภาวะสุขภาพ',
];

// Word count limit by response length target
const MAX_WORDS_BY_LENGTH: Record<string, number> = {
  short:  80,
  medium: 200,
  long:   400,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function approximateWordCount(text: string): number {
  // Approximate: for Thai mixed with spaces, count space-separated tokens
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasPhoneAsk(text: string): boolean {
  const hasLongPattern = PHONE_REQUEST_PATTERNS.some((p) => text.includes(p));
  const hasShortPattern = PHONE_SHORT_PATTERNS.some((p) => text.includes(p));
  const hasQuestion = QUESTION_MARKERS.some((q) => text.includes(q));
  return (hasLongPattern || hasShortPattern) && hasQuestion;
}

function countQuestions(text: string): number {
  const q  = (text.match(/\?/g)             || []).length;
  const th = (text.match(/ไหมครับ|ไหมคะ/g)  || []).length;
  return Math.max(q, th);
}

function findGlobalProhibition(text: string): string | null {
  for (const phrase of GLOBAL_PROHIBITED) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateResponse(input: ResponseValidatorInput): ResponseValidatorResult {
  const { text, executionContext: ctx } = input;
  const failures: string[] = [];
  const warnings: string[] = [];
  const wordCount = approximateWordCount(text);

  // ── HARD-01: Empty response ────────────────────────────────────────────────
  if (!text || text.trim().length === 0) {
    failures.push('RESP-HARD-01: Generated response is empty');
    return {
      passed: false, text: RESPONSE_SAFE_FALLBACK_TEXT,
      failures, warnings, usedFallback: true, wordCount: 0,
    };
  }

  // ── HARD-02: Trust concern + phone ask ────────────────────────────────────
  if (ctx.trustPolicy.trustConcernActive && hasPhoneAsk(text)) {
    failures.push('RESP-HARD-02: Personal data (phone) requested during active trust concern — ACP-08 violation');
  }

  // ── HARD-03: Medical signal + guarantee language ───────────────────────────
  if (ctx.intent.isMedicalSignal || ctx.medicalPolicy.medicalConcernActive) {
    if (MEDICAL_GUARANTEE_PATTERNS.some((p) => text.includes(p))) {
      failures.push('RESP-HARD-03: Medical acceptance guarantee detected — prohibited by ACP-04');
    }
  }

  // ── HARD-04: Investment intent + return guarantee ─────────────────────────
  if (ctx.intent.primary === 'investment_linked') {
    if (INVESTMENT_RETURN_PATTERNS.some((p) => text.includes(p))) {
      failures.push('RESP-HARD-04: Investment return guarantee detected — prohibited by ACP-07');
    }
  }

  // ── HARD-05: Global prohibited phrases ────────────────────────────────────
  const prohibited = findGlobalProhibition(text);
  if (prohibited) {
    failures.push(`RESP-HARD-05: Global prohibited phrase detected: "${prohibited}"`);
  }

  // ── On any HARD failure → safe fallback ───────────────────────────────────
  if (failures.length > 0) {
    return {
      passed: false, text: RESPONSE_SAFE_FALLBACK_TEXT,
      failures, warnings, usedFallback: true, wordCount,
    };
  }

  // ── SOFT-01: Response too long ────────────────────────────────────────────
  const maxWords = MAX_WORDS_BY_LENGTH[ctx.responseProfile.length] ?? 200;
  if (wordCount > maxWords) {
    warnings.push(
      `RESP-SOFT-01: Word count ${wordCount} exceeds recommended ${maxWords} for length="${ctx.responseProfile.length}"`,
    );
  }

  // ── SOFT-02: Too many questions ───────────────────────────────────────────
  const qCount = countQuestions(text);
  if (ctx.responseProfile.questionStrategy === 'one_question' && qCount > 1) {
    warnings.push(
      `RESP-SOFT-02: question_strategy=one_question but ~${qCount} question patterns detected`,
    );
  }
  if (ctx.responseProfile.questionStrategy === 'no_question' && qCount > 0) {
    warnings.push('RESP-SOFT-03: question_strategy=no_question but question pattern detected in response');
  }

  // ── SOFT-04: Missing required disclaimer (medical) ────────────────────────
  if (ctx.responseProfile.mustIncludeDisclaimer) {
    const hasDisclaimer = DISCLAIMER_MARKERS.some((m) => text.includes(m));
    if (!hasDisclaimer) {
      warnings.push('RESP-SOFT-04: mustIncludeDisclaimer=true but no standard uncertainty language found');
    }
  }

  // ── SOFT-05: Re-asking known fields ───────────────────────────────────────
  const FIELD_PATTERNS: Record<string, string[]> = {
    real_name:   ['ชื่อจริง', 'ชื่อ'],
    phone:       ['เบอร์', 'โทรศัพท์'],
    age:         ['อายุ'],
    budget_annual: ['งบประมาณ', 'งบ'],
    interest_category: ['ประกันประเภทไหน', 'สนใจอะไร'],
  };
  if (ctx.leadPolicy.knownFields.length > 0) {
    for (const field of ctx.leadPolicy.knownFields) {
      const patterns = FIELD_PATTERNS[field] ?? [field];
      const textContainsField = patterns.some((p) => text.includes(p));
      const hasQuestion = QUESTION_MARKERS.some((q) => text.includes(q));
      if (textContainsField && hasQuestion) {
        warnings.push(`RESP-SOFT-05: May be re-asking known field "${field}" — CP-05 soft warning`);
        break;
      }
    }
  }

  return {
    passed: true, text, failures, warnings, usedFallback: false, wordCount,
  };
}
