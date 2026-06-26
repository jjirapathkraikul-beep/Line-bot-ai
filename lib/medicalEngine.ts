// Medical Engine — AIOS LINE Adapter v2
// Handles medical/underwriting questions per AIOS Response Composer rules.
// Rule: Answer carefully → Ask ONE medical follow-up → Never guarantee approval.
// Rule: Do NOT immediately ask for phone. Offer human review as a natural next step.

function norm(s: string): string {
  return s.normalize('NFC').toLowerCase();
}

// ─── Context-aware follow-up question ────────────────────────────────────────

function detectFollowUp(text: string): string {
  const n = norm(text);
  if (n.includes('มะเร็ง')) {
    return 'ตอนนี้อยู่ระหว่างรักษา หรือรักษาหายแล้วครับ?';
  }
  if (n.includes('เบาหวาน')) {
    return 'ตอนนี้ค่าน้ำตาลอยู่ในระดับที่ควบคุมได้ไหมครับ?';
  }
  if (n.includes('ความดัน')) {
    return 'ตอนนี้ทานยาควบคุมความดันอยู่ไหมครับ?';
  }
  if (n.includes('ไขมัน')) {
    return 'ตอนนี้ค่าไขมันอยู่ในเกณฑ์ปกติไหมครับ?';
  }
  if (n.includes('ผ่าตัด') || n.includes('เคยผ่าตัด')) {
    return 'ผ่าตัดเรื่องอะไรครับ และหายดีแล้วไหม?';
  }
  if (n.includes('หัวใจ')) {
    return 'ตอนนี้ยังมีอาการอยู่ หรือรักษาหายแล้วครับ?';
  }
  return 'ตอนนี้อยู่ระหว่างรักษา หรือรักษาหายแล้วครับ?';
}

// ─── Medical response builder ─────────────────────────────────────────────────
// Pre-built response that answers FIRST, then asks ONE relevant follow-up.
// Per AIOS: "Do not guarantee approval. Case-by-case. One question per turn."

export function buildMedicalResponse(text: string): string {
  const followUp = detectFollowUp(text);
  return [
    'กรณีมีประวัติสุขภาพหรือเคยได้รับการวินิจฉัยโรคร้ายแรง บริษัทจะพิจารณาเป็นรายกรณีครับ',
    '',
    'ผมยังไม่อยากตอบแทนบริษัทแบบฟันธง เพราะต้องดูรายละเอียดทางการแพทย์ก่อน',
    '',
    `ขอถามเพิ่มเติม 1 ข้อครับ:\n${followUp}`,
  ].join('\n');
}
