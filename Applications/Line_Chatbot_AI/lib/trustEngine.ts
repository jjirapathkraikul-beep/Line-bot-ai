// Trust Engine — AIOS LINE Adapter v2
// Handles trust/fraud concerns per AIOS Domain Contract and Response Composer rules.
// Rule: BUILD_TRUST must fire BEFORE COLLECT_LEAD. Never ask phone after trust concern.

function norm(s: string): string {
  return s.normalize('NFC').toLowerCase();
}

// ─── Trust trigger keywords ───────────────────────────────────────────────────
// Exported so leadCapture.ts can include them in ALL_INTENT_TRIGGERS (state override).

export const TRUST_TRIGGERS: string[] = [
  'มิจฉาชีพ', 'โกง', 'หลอก', 'ต้มตุ๋น', 'กลัวโดนโกง',
  'น่าเชื่อถือไหม', 'น่าเชื่อถือมั้ย', 'ไว้ใจได้ไหม', 'ไว้ใจได้มั้ย',
  'ของจริงไหม', 'ปลอม', 'แอบอ้าง', 'scam', 'fraud',
  'โกงหรือเปล่า', 'จริงมั้ย',
];

export function isTrustTrigger(text: string): boolean {
  const n = norm(text);
  return TRUST_TRIGGERS.some((kw) => n.includes(norm(kw)));
}

// ─── Trust response builder ───────────────────────────────────────────────────
// Pre-built response — does NOT rely on OpenAI (trust is too critical to hallucinate).
// Per AIOS Response Composer: Acknowledge → Verify → Offer continued conversation.
// Must NOT ask for phone number after trust concern.

export function buildTrustResponse(_text: string): string {
  return [
    'เข้าใจเลยครับ ปัจจุบันมิจฉาชีพเยอะจริง ๆ การตรวจสอบก่อนให้ข้อมูลเป็นเรื่องที่ถูกต้องครับ',
    '',
    'คุณสามารถตรวจสอบคุณจิราวัฒน์ได้จาก:',
    '• โปรไฟล์และประวัติการทำงาน',
    '• LINE OA นี้',
    '• Facebook Page',
    '• ใบอนุญาตตัวแทนประกันชีวิต',
    '• เอกสารจาก Tokio Marine Life',
    '',
    'ถ้ายังไม่สะดวกให้เบอร์ ผมสามารถตอบคำถามเบื้องต้นในแชตก่อนได้ครับ 😊',
  ].join('\n');
}
