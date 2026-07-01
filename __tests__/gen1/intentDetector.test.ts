/**
 * Intent Detector Tests
 * Run: npx tsx --tsconfig tsconfig.json __tests__/gen1/intentDetector.test.ts
 */

import assert from 'node:assert/strict';
import { detectIntent } from '../../runtime-gen1/capability/intentDetector';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

console.log('\n🧪 Intent Detector Tests\n');

// ── Trust / Fraud (Priority 1 — CRITICAL) ──────────────────────────────────

test('"มิจฉาชีพไหม" → trust_concern; isTrustSignal=true', () => {
  const r = detectIntent('มิจฉาชีพไหม');
  assert.equal(r.intent, 'trust_concern');
  assert.equal(r.flags.isTrustSignal, true);
  assert.ok(r.confidence >= 0.90);
  assert.ok(r.matchedKeywords.length > 0);
});

test('"โกงหรือเปล่า" → fraud_concern; isTrustSignal=true', () => {
  const r = detectIntent('โกงหรือเปล่า');
  assert.equal(r.intent, 'fraud_concern');
  assert.equal(r.flags.isTrustSignal, true);
  assert.ok(r.confidence >= 0.90);
});

test('validation-risk topic outranks trust phrasing → human_handoff', () => {
  const samples = [
    'มะเร็งไม่คุ้มครองจริงไหม',
    'เห็นว่ามะเร็งไม่คุ้มครองใช่ไหม',
    'เนื้องอกไม่คุ้มครองจริงหรือเปล่า',
    'นิ่วไม่คุ้มครองใช่ไหม',
    'โรครอคอย 120 วันมีอะไรบ้าง',
  ];

  for (const sample of samples) {
    const r = detectIntent(sample);
    assert.equal(r.intent, 'human_handoff', sample);
    assert.equal(r.flags.isHumanRequest, true, sample);
    assert.equal(r.flags.isTrustSignal, false, sample);
    assert.ok(r.matchedKeywords.length > 0, sample);
  }
});

test('pure trust questions stay trust_concern', () => {
  const samples = [
    'บริษัทนี้น่าเชื่อถือไหม',
    'โตเกียวมารีนเชื่อถือได้ไหม',
  ];

  for (const sample of samples) {
    const r = detectIntent(sample);
    assert.equal(r.intent, 'trust_concern', sample);
    assert.equal(r.flags.isTrustSignal, true, sample);
    assert.equal(r.flags.isHumanRequest, false, sample);
  }
});

// ── Medical (Priority 3) ────────────────────────────────────────────────────

test('"เป็นมะเร็งทำประกันได้ไหม" → medical_underwriting; isMedicalSignal=true', () => {
  const r = detectIntent('เป็นมะเร็งทำประกันได้ไหม');
  assert.equal(r.intent, 'medical_underwriting');
  assert.equal(r.flags.isMedicalSignal, true);
  assert.equal(r.flags.isTrustSignal, false);
  assert.ok(r.confidence >= 0.85);
});

test('"เป็นเบาหวานสมัครประกันสุขภาพได้ไหม" → medical_underwriting (medical beats health)', () => {
  const r = detectIntent('เป็นเบาหวานสมัครประกันสุขภาพได้ไหม');
  // Medical underwriting has priority over health insurance in this context
  // because medical_underwriting priority (3) > health_insurance (5)
  assert.equal(r.intent, 'medical_underwriting');
  assert.equal(r.flags.isMedicalSignal, true);
});

// ── Products (Priority 5) ───────────────────────────────────────────────────

test('"สนใจประกันสุขภาพ" → health_insurance; isProductIntent=true', () => {
  const r = detectIntent('สนใจประกันสุขภาพ');
  assert.equal(r.intent, 'health_insurance');
  assert.equal(r.flags.isProductIntent, true);
  assert.equal(r.flags.isTrustSignal, false);
  assert.ok(r.confidence >= 0.85);
});

test('"Good Health Prime มี OPD ไหม" → health_insurance; not medical_underwriting', () => {
  const r = detectIntent('Good Health Prime มี OPD ไหม');
  assert.equal(r.intent, 'health_insurance');
  assert.equal(r.flags.isProductIntent, true);
  assert.equal(r.flags.isMedicalSignal, false);
});

test('"ถ้าไม่ได้ใช้ OPD เอาไปตรวจสุขภาพได้ไหม" → health_insurance; not medical_underwriting', () => {
  const r = detectIntent('ถ้าไม่ได้ใช้ OPD เอาไปตรวจสุขภาพได้ไหม');
  assert.equal(r.intent, 'health_insurance');
  assert.equal(r.flags.isProductIntent, true);
  assert.equal(r.flags.isMedicalSignal, false);
});

test('"เอา OPD ไปฉีดวัคซีนได้ไหม" → health_insurance; not medical_underwriting', () => {
  const r = detectIntent('เอา OPD ไปฉีดวัคซีนได้ไหม');
  assert.equal(r.intent, 'health_insurance');
  assert.equal(r.flags.isProductIntent, true);
  assert.equal(r.flags.isMedicalSignal, false);
});

test('"Cancer Care คืออะไร" → cancer_insurance; isProductIntent=true', () => {
  const r = detectIntent('Cancer Care คืออะไร');
  assert.equal(r.intent, 'cancer_insurance');
  assert.equal(r.flags.isProductIntent, true);
});

test('"ลดหย่อนภาษี" → tax_planning; isProductIntent=true', () => {
  const r = detectIntent('ลดหย่อนภาษี');
  assert.equal(r.intent, 'tax_planning');
  assert.equal(r.flags.isProductIntent, true);
});

// ── Claim (Priority 2) ──────────────────────────────────────────────────────

test('"เคลมได้ไหม" → claim_question (higher priority than medical when standalone)', () => {
  const r = detectIntent('เคลมได้ไหม');
  assert.equal(r.intent, 'claim_question');
  assert.equal(r.flags.isTrustSignal, false);
  assert.equal(r.flags.isMedicalSignal, false);
});

// ── Hospital (Priority 2) ───────────────────────────────────────────────────

test('"เข้าโรงพยาบาลไหนดี" → hospital_question', () => {
  const r = detectIntent('เข้าโรงพยาบาลไหนดี');
  assert.equal(r.intent, 'hospital_question');
  assert.equal(r.flags.isTrustSignal, false);
});

// ── Human handoff (Priority 4) ──────────────────────────────────────────────

test('"ขอปรึกษาคุณจิราวัฒน์" → human_handoff; isHumanRequest=true', () => {
  const r = detectIntent('ขอปรึกษาคุณจิราวัฒน์');
  assert.equal(r.intent, 'human_handoff');
  assert.equal(r.flags.isHumanRequest, true);
});

// ── Unknown ─────────────────────────────────────────────────────────────────

test('"ขอบคุณมากครับ" → unknown (no keywords matched)', () => {
  const r = detectIntent('ขอบคุณมากครับ');
  assert.equal(r.intent, 'unknown');
  assert.equal(r.flags.isTrustSignal, false);
  assert.equal(r.flags.isMedicalSignal, false);
  assert.equal(r.flags.isHumanRequest, false);
  assert.equal(r.matchedKeywords.length, 0);
  assert.ok(r.confidence <= 0.60);
});

// ── NFC normalization ────────────────────────────────────────────────────────

test('NFC normalisation: Thai NFC and NFD both detect same intent', () => {
  const nfc = detectIntent('สนใจประกันสุขภาพ'.normalize('NFC'));
  const nfd = detectIntent('สนใจประกันสุขภาพ'.normalize('NFD'));
  assert.equal(nfc.intent, nfd.intent);
  assert.equal(nfc.intent, 'health_insurance');
});

// ── Emergency flag ────────────────────────────────────────────────────────────

test('Emergency keyword sets isEmergency flag even without changing intent', () => {
  const r = detectIntent('ฉุกเฉิน เข้า ICU ตอนนี้ครับ');
  assert.equal(r.flags.isEmergency, true);
});

// ── All flags are boolean ─────────────────────────────────────────────────────

test('All flags are boolean for every intent', () => {
  const messages = [
    'สวัสดีครับ', 'มิจฉาชีพ', 'เป็นมะเร็ง', 'ประกันสุขภาพ',
    'เคลม', 'โรงพยาบาลไหน', 'ติดต่อคุณจิราวัฒน์', 'ลดหย่อนภาษี',
    'ไม่รู้จะพูดอะไร',
  ];
  for (const msg of messages) {
    const r = detectIntent(msg);
    const flags = r.flags;
    assert.equal(typeof flags.isTrustSignal, 'boolean', `${msg}: isTrustSignal not boolean`);
    assert.equal(typeof flags.isMedicalSignal, 'boolean', `${msg}: isMedicalSignal not boolean`);
    assert.equal(typeof flags.isEmergency, 'boolean', `${msg}: isEmergency not boolean`);
    assert.equal(typeof flags.isHumanRequest, 'boolean', `${msg}: isHumanRequest not boolean`);
    assert.equal(typeof flags.isProductIntent, 'boolean', `${msg}: isProductIntent not boolean`);
    assert.equal(typeof flags.isPriceIntent, 'boolean', `${msg}: isPriceIntent not boolean`);
    assert.equal(typeof flags.isRecommendationIntent, 'boolean', `${msg}: isRecommendationIntent not boolean`);
  }
});

// ─── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) {
  console.log('\n⚠️  Some tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed\n');
}
