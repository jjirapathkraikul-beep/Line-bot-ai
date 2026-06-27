export interface IntentFlags {
  isTrustSignal: boolean;
  isMedicalSignal: boolean;
  isEmergency: boolean;
  isHumanRequest: boolean;
  isProductIntent: boolean;
  isPriceIntent: boolean;
  isRecommendationIntent: boolean;
}

export interface IntentDetectorResult {
  intent: string;
  confidence: number;
  flags: IntentFlags;
  matchedKeywords: string[];
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export function normTH(text: string): string {
  return text.normalize('NFC').trim().toLowerCase();
}

function matches(norm: string, keywords: readonly string[]): string[] {
  return keywords.filter((kw) => norm.includes(normTH(kw)));
}

// ─── Keyword tables (Thai NFC — source of truth for Gen1) ────────────────────
// Priority order: trust/fraud > claim/hospital > medical > human > product > price > recommendation > unknown
// Ported from lib/trustEngine.ts + lib/leadCapture.ts + medicalEngine.ts, then extended.

const TRUST_KEYWORDS = [
  'มิจฉาชีพ', 'น่าเชื่อถือไหม', 'น่าเชื่อถือมั้ย',
  'ไว้ใจได้ไหม', 'ไว้ใจได้มั้ย', 'ของจริงไหม',
  'จริงมั้ย', 'จริงไหม',
] as const;

const FRAUD_KEYWORDS = [
  'โกง', 'หลอก', 'ต้มตุ๋น', 'ปลอม', 'แอบอ้าง',
  'scam', 'fraud', 'โกงหรือเปล่า', 'กลัวโดนโกง',
] as const;

const CLAIM_KEYWORDS = [
  'เคลมประกัน', 'แจ้งเคลม', 'เอกสารเคลม',
  'ขอเคลม', 'ขั้นตอนเคลม', 'เคลมได้ไหม', 'เคลม',
] as const;

// "เข้าโรงพยาบาล" intentionally excluded — it's sometimes part of medical underwriting context.
// Checking hospital network or costs → hospital_question.
const HOSPITAL_KEYWORDS = [
  'โรงพยาบาลในเครือ', 'ตรวจสอบโรงพยาบาล', 'รพ.ในเครือ',
  'โรงพยาบาลไหน', 'รพ.ไหน', 'คลินิกไหน',
  'ค่ารักษาพยาบาล', 'ค่ารักษา',
] as const;

// Immediate distress / emergency — separate flag, not a standalone intent.
const EMERGENCY_KEYWORDS = [
  'ฉุกเฉิน', 'อุบัติเหตุ', 'icu', 'ห้องฉุกเฉิน',
  'ป่วยหนัก', 'อาการหนัก', 'กำลังเข้าโรงพยาบาล',
] as const;

const MEDICAL_KEYWORDS = [
  'เป็นมะเร็ง', 'เคยเป็นมะเร็ง', 'เป็นโรค', 'โรคประจำตัว',
  'เบาหวาน', 'ความดันโลหิต', 'ความดันสูง', 'ไขมันในเลือด',
  'เคยผ่าตัด', 'ทำประกันได้ไหม', 'รับประกันไหม',
  'ประวัติสุขภาพ', 'ตรวจสุขภาพ', 'สุขภาพไม่ดี', 'หัวใจ', 'ไขมัน',
] as const;

const HUMAN_HANDOFF_KEYWORDS = [
  'ติดต่อคุณจิราวัฒน์', 'คุยกับคุณจิราวัฒน์',
  'ขอนัดคุย', 'นัดคุย', 'ขอปรึกษาคุณจิราวัฒน์',
  'ติดต่อตัวแทน', 'ขอพูดคุยกับ', 'ให้ติดต่อกลับ',
  'ติดต่อกลับ', 'สนใจสมัคร', 'คุยกับตัวแทน',
] as const;

// Products — order matters within product group (more specific first)
const HEALTH_KEYWORDS     = ['good health prime', 'good health', 'health prime', 'ประกันสุขภาพ'] as const;
const CANCER_KEYWORDS     = ['tokio cancer care', 'cancer care', 'ประกันมะเร็งและโรคร้ายแรง', 'ประกันมะเร็ง', 'มะเร็ง'] as const;
const TAX_KEYWORDS        = ['tokyo supertax', 'supertax', 'ประกันลดหย่อนภาษี', 'ลดหย่อนภาษี', 'ลดภาษี'] as const;
const RETIREMENT_KEYWORDS = ['ประกันเกษียณ', 'วางแผนเกษียณ', 'เกษียณ', 'retirement'] as const;
const INVESTMENT_KEYWORDS = ['unit linked', 'unitlinked', 'ประกันควบการลงทุน', 'tokyo beyond', 'beyond'] as const;

const PREMIUM_KEYWORDS = [
  'ค่าเบี้ย', 'เบี้ยเท่าไร', 'เบี้ยประกัน', 'ราคาเท่าไร',
  'จ่ายเดือนละ', 'คำนวณเบี้ย', 'ดูเบี้ย', 'ขอเบี้ย',
  'เช็กเบี้ย', 'quotation',
] as const;

const RECOMMENDATION_KEYWORDS = [
  'ประกันอะไรดี', 'แนะนำประกัน', 'แนะนำให้', 'ควรทำประกัน',
  'อยากได้ประกัน', 'สนใจทำประกัน', 'อยากทำประกัน',
  'สนใจประกัน', 'อยากรู้เรื่องประกัน',
] as const;

const EXISTING_POLICY_KEYWORDS = [
  'มีประกันอยู่แล้ว', 'ทำอยู่แล้ว', 'ประกันอยู่แล้ว',
  'ทำไปแล้ว', 'มีอยู่แล้ว',
] as const;

const PRICE_OBJECTION_KEYWORDS = [
  'แพงเกินไป', 'ราคาแพง', 'งบน้อย', 'ไม่มีเงิน',
  'แพงไป', 'ถูกกว่า', 'งบไม่พอ',
] as const;

const GREETING_KEYWORDS = [
  'สวัสดีครับ', 'สวัสดีค่ะ', 'สวัสดี', 'หวัดดีครับ', 'หวัดดี',
  'ดีครับ', 'ดีค่ะ', 'hello', 'hi',
] as const;

// ─── Detector ─────────────────────────────────────────────────────────────────

export function detectIntent(text: string): IntentDetectorResult {
  const n = normTH(text);

  // Collect emergency flag first (does not affect intent directly)
  const emergencyMatches = matches(n, EMERGENCY_KEYWORDS);
  const isEmergency = emergencyMatches.length > 0;

  // Priority 1: trust/fraud (CRITICAL)
  const trustKw = matches(n, TRUST_KEYWORDS);
  if (trustKw.length > 0) {
    return makeResult('trust_concern', 0.95, trustKw, {
      isTrustSignal: true, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const fraudKw = matches(n, FRAUD_KEYWORDS);
  if (fraudKw.length > 0) {
    return makeResult('fraud_concern', 0.95, fraudKw, {
      isTrustSignal: true, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 2: claim/hospital (HIGH)
  const claimKw = matches(n, CLAIM_KEYWORDS);
  if (claimKw.length > 0) {
    return makeResult('claim_question', 0.90, claimKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const hospitalKw = matches(n, HOSPITAL_KEYWORDS);
  if (hospitalKw.length > 0) {
    return makeResult('hospital_question', 0.88, hospitalKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 3: medical underwriting
  const medKw = matches(n, MEDICAL_KEYWORDS);
  if (medKw.length > 0) {
    return makeResult('medical_underwriting', 0.90, medKw, {
      isTrustSignal: false, isMedicalSignal: true, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 4: human handoff
  const humanKw = matches(n, HUMAN_HANDOFF_KEYWORDS);
  if (humanKw.length > 0) {
    return makeResult('human_handoff', 0.92, humanKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: true, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 5: specific products
  const healthKw = matches(n, HEALTH_KEYWORDS);
  if (healthKw.length > 0) {
    return makeResult('health_insurance', 0.88, healthKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: true,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const cancerKw = matches(n, CANCER_KEYWORDS);
  if (cancerKw.length > 0) {
    return makeResult('cancer_insurance', 0.88, cancerKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: true,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const taxKw = matches(n, TAX_KEYWORDS);
  if (taxKw.length > 0) {
    return makeResult('tax_planning', 0.88, taxKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: true,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const retirementKw = matches(n, RETIREMENT_KEYWORDS);
  if (retirementKw.length > 0) {
    return makeResult('retirement_planning', 0.88, retirementKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: true,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const investmentKw = matches(n, INVESTMENT_KEYWORDS);
  if (investmentKw.length > 0) {
    return makeResult('investment_linked', 0.88, investmentKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: true,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 6: premium question
  const premiumKw = matches(n, PREMIUM_KEYWORDS);
  if (premiumKw.length > 0) {
    return makeResult('premium_question', 0.85, premiumKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: true, isRecommendationIntent: false,
    });
  }

  // Priority 7: recommendation
  const recKw = matches(n, RECOMMENDATION_KEYWORDS);
  if (recKw.length > 0) {
    return makeResult('recommendation_request', 0.82, recKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: true,
    });
  }

  // Priority 8: existing policy / price objection
  const existingKw = matches(n, EXISTING_POLICY_KEYWORDS);
  if (existingKw.length > 0) {
    return makeResult('existing_policy', 0.80, existingKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  const priceKw = matches(n, PRICE_OBJECTION_KEYWORDS);
  if (priceKw.length > 0) {
    return makeResult('price_objection', 0.80, priceKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Priority 9: greeting
  const greetingKw = matches(n, GREETING_KEYWORDS);
  if (greetingKw.length > 0) {
    return makeResult('greeting', 0.75, greetingKw, {
      isTrustSignal: false, isMedicalSignal: false, isEmergency,
      isHumanRequest: false, isProductIntent: false,
      isPriceIntent: false, isRecommendationIntent: false,
    });
  }

  // Unknown
  return makeResult('unknown', 0.50, [], {
    isTrustSignal: false, isMedicalSignal: false, isEmergency,
    isHumanRequest: false, isProductIntent: false,
    isPriceIntent: false, isRecommendationIntent: false,
  });
}

function makeResult(
  intent: string,
  confidence: number,
  matchedKeywords: string[],
  flags: IntentFlags,
): IntentDetectorResult {
  return { intent, confidence, flags, matchedKeywords };
}
