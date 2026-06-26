/**
 * AIOS LINE Adapter v2 — Regression Test Suite
 * Run: npx tsx --tsconfig tsconfig.json __tests__/aiosAdapter.test.ts
 *
 * 8 test cases covering the Phase 5 V2 behavior improvements.
 * Tests the building-block functions used by the intent priority router.
 */

import assert from 'node:assert/strict';

import {
  detectRichMenuCommand,
  extractProductFromText,
  isContactTrigger,
  isUnderwritingTrigger,
  isQuoteTrigger,
  isInterestTrigger,
  getMissingFields,
  accumulateLeadData,
  clearLeadData,
  CONTACT_FLOW_FIELDS,
} from '../lib/leadCapture';
import { isTrustTrigger, buildTrustResponse } from '../lib/trustEngine';
import { buildMedicalResponse } from '../lib/medicalEngine';
import { classifyIntent } from '../lib/intentClassifier';

// ─── Minimal test runner ──────────────────────────────────────────────────────

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

// ─── Test Cases ───────────────────────────────────────────────────────────────

console.log('\n🧪 AIOS LINE Adapter v2 — 8 Regression Tests\n');

// ── Test 1 ──────────────────────────────────────────────────────────────────
// Rich menu "ประกันสุขภาพ" → health flow directly (Priority B), NOT category flow
test('Test 1: health_insurance rich menu → enters health flow, not category', () => {
  const cmd = detectRichMenuCommand('health_insurance');
  assert.equal(cmd, 'health_insurance', 'detectRichMenuCommand must return "health_insurance"');

  // Must NOT be caught by product mention as a different product
  const product = extractProductFromText('health_insurance');
  assert.equal(product, null, 'Rich menu command text must not match product keyword extractor');

  // Must NOT trigger contact or underwriting
  assert.equal(isContactTrigger('health_insurance'),      false, 'Must NOT match contact');
  assert.equal(isUnderwritingTrigger('health_insurance'), false, 'Must NOT match underwriting');
});

// ── Test 2 ──────────────────────────────────────────────────────────────────
// "สนใจประกันสุขภาพ" → product mention (Priority E) wins, NOT category flow
test('Test 2: "สนใจประกันสุขภาพ" → product detected, category flow skipped', () => {
  const msg = 'สนใจประกันสุขภาพ';

  const product = extractProductFromText(msg);
  assert.equal(product, 'ประกันสุขภาพ', 'Must detect ประกันสุขภาพ as product');

  // isInterestTrigger also matches — priority ordering in router decides
  assert.equal(isInterestTrigger(msg), true, 'isInterestTrigger also matches (router priority matters)');

  // Since product is detected (Priority E), category flow (Priority H) must be skipped
  // Verified by product being non-null — router returns early at Priority E
  assert.notEqual(product, null, 'Product detection is the tiebreaker');
});

// ── Test 3 ──────────────────────────────────────────────────────────────────
// "มิจฉาชีพไหม" → trust concern detected (Priority C), NOT ask phone
test('Test 3: "มิจฉาชีพไหม" → trust_concern, response does not ask for phone', () => {
  const msg = 'มิจฉาชีพไหม';

  assert.equal(isTrustTrigger(msg), true, 'isTrustTrigger must return true');

  const trustResp = buildTrustResponse(msg);
  assert.ok(trustResp.includes('ตรวจสอบ'), 'Trust response must explain how to verify');
  assert.ok(!trustResp.includes('เบอร์โทร'), 'Trust response must NOT ask for phone number');
  assert.ok(!trustResp.includes('ฝากเบอร์'), 'Trust response must NOT say "ฝากเบอร์"');

  // classifyIntent must detect trust_fraud priority
  const classified = classifyIntent(msg);
  assert.equal(classified.priority, 'trust_fraud', 'classifyIntent priority must be trust_fraud');
});

// ── Test 4 ──────────────────────────────────────────────────────────────────
// "เป็นมะเร็งทำประกันได้ไหม" → medical response FIRST, not ask for age/phone
test('Test 4: "เป็นมะเร็งทำประกันได้ไหม" → medical answer first, no field capture', () => {
  const msg = 'เป็นมะเร็งทำประกันได้ไหม';

  assert.equal(isUnderwritingTrigger(msg), true, 'isUnderwritingTrigger must return true');

  const medResp = buildMedicalResponse(msg);
  assert.ok(medResp.includes('พิจารณาเป็นรายกรณี'), 'Medical response must mention case-by-case');
  assert.ok(!medResp.includes('เบอร์โทร'), 'Medical response must NOT ask for phone immediately');
  assert.ok(!medResp.includes('ฝากชื่อ'), 'Medical response must NOT ask for name immediately');
  assert.ok(medResp.includes('ขอถามเพิ่มเติม'), 'Medical response must ask one medical follow-up');

  // For cancer specifically, the follow-up should be about treatment status
  assert.ok(
    medResp.includes('รักษา'),
    'Cancer follow-up must ask about treatment status'
  );
});

// ── Test 5 ──────────────────────────────────────────────────────────────────
// Phone already exists → getMissingFields does NOT include phone (known field protection)
test('Test 5: phone already in lead data → never appears in missing fields', () => {
  const TEST_ID = 'test_phone_guard_v2';
  clearLeadData(TEST_ID);

  // Simulate phone already captured
  accumulateLeadData(TEST_ID, { phone: '0812345678' });

  const missing = getMissingFields(TEST_ID, CONTACT_FLOW_FIELDS);
  assert.ok(!missing.includes('phone'), 'phone must NOT be in missing fields when already captured');

  // Verify the data is actually there
  const allMissing = getMissingFields(TEST_ID, ['real_name', 'phone', 'preferred_contact_time'] as import('../lib/leadCapture').LeadField[]);
  assert.ok(allMissing.includes('real_name'), 'real_name IS missing (not captured)');
  assert.ok(!allMissing.includes('phone'),    'phone is NOT missing (already captured)');

  clearLeadData(TEST_ID); // cleanup
});

// ── Test 6 ──────────────────────────────────────────────────────────────────
// "ติดต่อคุณจิราวัฒน์" → contact trigger fires (Priority E in v2)
test('Test 6: "ติดต่อคุณจิราวัฒน์" → contact trigger, first field = real_name', () => {
  const msg = 'ติดต่อคุณจิราวัฒน์';

  assert.equal(isContactTrigger(msg), true, 'isContactTrigger must return true');

  // Must NOT be trust or underwriting (would fire at higher priority)
  assert.equal(isTrustTrigger(msg),           false, 'Must NOT be trust trigger');
  assert.equal(isUnderwritingTrigger(msg),    false, 'Must NOT be underwriting trigger');

  // Contact flow starts with real_name, never age
  assert.equal(CONTACT_FLOW_FIELDS[0], 'real_name', 'Contact flow first field must be real_name');
  assert.ok(!CONTACT_FLOW_FIELDS.includes('age'),    'Contact flow must NOT include age');
});

// ── Test 7 ──────────────────────────────────────────────────────────────────
// "ขอปรึกษา" → falls to OpenAI (no aggressive trigger), does NOT force age question
test('Test 7: "ขอปรึกษา" → no specific trigger fires, falls to OpenAI fallback', () => {
  const msg = 'ขอปรึกษา';

  // Must NOT match any aggressive trigger that forces field capture
  assert.equal(isQuoteTrigger(msg),       false, '"ขอปรึกษา" must NOT trigger quote flow (no age ask)');
  assert.equal(isContactTrigger(msg),     false, '"ขอปรึกษา" must NOT trigger contact flow');
  assert.equal(isUnderwritingTrigger(msg), false, '"ขอปรึกษา" must NOT trigger underwriting flow');
  assert.equal(isTrustTrigger(msg),        false, '"ขอปรึกษา" must NOT trigger trust flow');

  // Falls to OpenAI — which will ask "สนใจเรื่องอะไรครับ?" naturally
  const classified = classifyIntent(msg);
  assert.equal(classified.priority, 'fallback', 'classifyIntent priority must be fallback');
});

// ── Test 8 ──────────────────────────────────────────────────────────────────
// "about_jirawat" → rich menu command, does NOT enter lead or contact flow
test('Test 8: "about_jirawat" → rich menu only, does NOT trigger lead/contact flow', () => {
  const cmd = detectRichMenuCommand('about_jirawat');
  assert.equal(cmd, 'about_jirawat', 'detectRichMenuCommand must return "about_jirawat"');

  assert.equal(isContactTrigger('about_jirawat'),      false, 'Must NOT trigger contact flow');
  assert.equal(isQuoteTrigger('about_jirawat'),        false, 'Must NOT trigger quote flow');
  assert.equal(isInterestTrigger('about_jirawat'),     false, 'Must NOT trigger interest flow');
  assert.equal(isTrustTrigger('about_jirawat'),        false, 'Must NOT trigger trust flow');
  assert.equal(isUnderwritingTrigger('about_jirawat'), false, 'Must NOT trigger underwriting flow');
  assert.equal(extractProductFromText('about_jirawat'), null, 'Must NOT be detected as product');
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
