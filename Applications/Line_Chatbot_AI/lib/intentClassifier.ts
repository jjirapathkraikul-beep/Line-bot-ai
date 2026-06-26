// Intent classification for AIOS LINE Adapter v2
// Maps Thai customer messages to structured intents with priority routing hints.
// Priority order mirrors the route.ts intent priority router.

export type Intent =
  | 'greeting'
  | 'product_health'
  | 'product_cancer'
  | 'product_tax'
  | 'product_retirement'
  | 'product_investment'
  | 'ask_premium'
  | 'ask_recommendation'
  | 'trust_concern'
  | 'fraud_concern'
  | 'medical_condition'
  | 'underwriting_question'
  | 'contact_request'
  | 'wants_human'
  | 'ready_to_buy'
  | 'objection_price'
  | 'unclear';

export type IntentPriority =
  | 'trust_fraud'   // Priority C — highest override
  | 'medical'       // Priority D
  | 'contact'       // Priority E
  | 'product'       // Priority F
  | 'quote'         // Priority G
  | 'interest'      // Priority H
  | 'state'         // State continuation
  | 'fallback';     // OpenAI fallback

export interface IntentResult {
  intent: Intent;
  priority: IntentPriority;
  confidence: number;
}

function norm(s: string): string {
  return s.normalize('NFC').toLowerCase();
}

function matchesAny(text: string, keywords: string[]): boolean {
  const n = norm(text);
  return keywords.some((kw) => n.includes(norm(kw)));
}

// ─── Keyword sets per intent ──────────────────────────────────────────────────

const FRAUD_KW = [
  'มิจฉาชีพ', 'โกง', 'หลอก', 'ต้มตุ๋น', 'scam', 'fraud',
  'ปลอม', 'แอบอ้าง', 'โกงหรือเปล่า', 'กลัวโดนโกง',
];

const TRUST_KW = [
  'น่าเชื่อถือไหม', 'น่าเชื่อถือมั้ย', 'ไว้ใจได้ไหม', 'ไว้ใจได้มั้ย',
  'จริงไหม', 'ของจริงไหม', 'ตรวจสอบได้', 'ยืนยัน', 'รับรอง',
  'legitimate', 'verify', 'กังวล', 'กลัว',
];

const MEDICAL_KW = [
  'มะเร็ง', 'เบาหวาน', 'ความดัน', 'ไขมัน', 'โรคประจำตัว', 'โรคเรื้อรัง',
  'ผ่าตัด', 'เคยผ่าตัด', 'ประวัติสุขภาพ', 'โรคร้ายแรง', 'เป็นโรค',
  'ทำประกันได้ไหม', 'รับประกันไหม', 'เคลมได้ไหม', 'underwriting',
  'ไขมันในเลือด', 'หัวใจ', 'โรคหัวใจ', 'ลิ่มเลือด',
];

const HEALTH_KW    = ['ประกันสุขภาพ', 'good health', 'สุขภาพ'];
const CANCER_KW    = ['ประกันมะเร็ง', 'cancer care', 'โรคร้ายแรง'];
const TAX_KW       = ['ลดหย่อนภาษี', 'supertax', 'ภาษี'];
const RETIREMENT_KW = ['เกษียณ', 'retirement', 'วางแผนเกษียณ'];
const INVESTMENT_KW = ['unit linked', 'unitlinked', 'ลงทุน', 'investment'];

const PREMIUM_KW      = ['เบี้ย', 'ราคา', 'quote', 'quotation', 'คำนวณ', 'ดูเบี้ย'];
const RECOMMEND_KW    = ['แนะนำ', 'เหมาะสม', 'ควรทำอะไร', 'ดีที่สุด', 'เหมาะกับ'];
const GREETING_KW     = ['สวัสดี', 'hello', 'hi', 'หวัดดี', 'เฮ้'];
const CONTACT_KW      = ['ติดต่อ', 'คุยกับ', 'นัดคุย', 'ให้โทร', 'จิราวัฒน์'];
const HUMAN_KW        = ['คุยกับคน', 'คนจริง', 'ขอคุยกับเจ้าหน้าที่', 'real person'];
const BUY_KW          = ['สมัครเลย', 'ซื้อเลย', 'ทำเลย', 'สนใจสมัคร', 'ตกลง'];
const PRICE_OBJECTION = ['แพงเกินไป', 'แพงมาก', 'ราคาสูง', 'งบไม่พอ', 'ไม่มีเงิน'];

// ─── Classifier ───────────────────────────────────────────────────────────────

export function classifyIntent(text: string): IntentResult {
  if (matchesAny(text, FRAUD_KW)) {
    return { intent: 'fraud_concern', priority: 'trust_fraud', confidence: 0.95 };
  }
  if (matchesAny(text, TRUST_KW)) {
    return { intent: 'trust_concern', priority: 'trust_fraud', confidence: 0.85 };
  }
  if (matchesAny(text, MEDICAL_KW)) {
    return { intent: 'medical_condition', priority: 'medical', confidence: 0.90 };
  }
  if (matchesAny(text, HUMAN_KW)) {
    return { intent: 'wants_human', priority: 'contact', confidence: 0.95 };
  }
  if (matchesAny(text, BUY_KW)) {
    return { intent: 'ready_to_buy', priority: 'contact', confidence: 0.90 };
  }
  if (matchesAny(text, CONTACT_KW)) {
    return { intent: 'contact_request', priority: 'contact', confidence: 0.90 };
  }
  if (matchesAny(text, HEALTH_KW)) {
    return { intent: 'product_health', priority: 'product', confidence: 0.90 };
  }
  if (matchesAny(text, CANCER_KW)) {
    return { intent: 'product_cancer', priority: 'product', confidence: 0.90 };
  }
  if (matchesAny(text, TAX_KW)) {
    return { intent: 'product_tax', priority: 'product', confidence: 0.90 };
  }
  if (matchesAny(text, RETIREMENT_KW)) {
    return { intent: 'product_retirement', priority: 'product', confidence: 0.90 };
  }
  if (matchesAny(text, INVESTMENT_KW)) {
    return { intent: 'product_investment', priority: 'product', confidence: 0.85 };
  }
  if (matchesAny(text, PREMIUM_KW)) {
    return { intent: 'ask_premium', priority: 'quote', confidence: 0.85 };
  }
  if (matchesAny(text, RECOMMEND_KW)) {
    return { intent: 'ask_recommendation', priority: 'interest', confidence: 0.80 };
  }
  if (matchesAny(text, GREETING_KW)) {
    return { intent: 'greeting', priority: 'fallback', confidence: 0.80 };
  }
  if (matchesAny(text, PRICE_OBJECTION)) {
    return { intent: 'objection_price', priority: 'fallback', confidence: 0.75 };
  }
  return { intent: 'unclear', priority: 'fallback', confidence: 0.0 };
}
