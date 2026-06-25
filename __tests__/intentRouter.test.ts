/**
 * Intent Router Test Cases
 * Run: npx tsx __tests__/intentRouter.test.ts
 *
 * Tests the routing functions that determine which flow a user message enters.
 * All 5 test cases correspond directly to production bugs fixed in the intent
 * priority router (route.ts, Priority B–G).
 */

import assert from 'node:assert/strict';

import {
  detectRichMenuCommand,
  isContactTrigger,
  isUnderwritingTrigger,
  isInterestTrigger,
  isAnyTrigger,
  extractProductFromText,
  CONTACT_FLOW_FIELDS,
} from '../lib/leadCapture';

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

console.log('\n🧪 Intent Router — 5 Test Cases\n');

// ── Test 1 ─────────────────────────────────────────────────────────────────
// input: about_jirawat (Rich Menu)
// expected: detected as Priority B rich_menu command — NOT product/contact/interest

test('Test 1: about_jirawat → Priority B (rich menu), zero other intents triggered', () => {
  const cmd = detectRichMenuCommand('about_jirawat');
  assert.equal(cmd, 'about_jirawat', 'detectRichMenuCommand must return "about_jirawat"');

  // Must NOT be caught by any lower-priority router
  assert.equal(isContactTrigger('about_jirawat'),     false, 'Must NOT match contact trigger');
  assert.equal(isUnderwritingTrigger('about_jirawat'), false, 'Must NOT match underwriting');
  assert.equal(isInterestTrigger('about_jirawat'),    false, 'Must NOT match interest trigger');
  assert.equal(extractProductFromText('about_jirawat'), null,  'Must NOT match product mention');

  // isAnyTrigger must return true (so state override works if user is mid-flow)
  assert.equal(isAnyTrigger('about_jirawat'), true, 'Must be in ALL_INTENT_TRIGGERS for state override');
});

// ── Test 2 ─────────────────────────────────────────────────────────────────
// input: สนใจประกันสุขภาพ
// expected: Priority E (product mention) wins over Priority G (interest)
//           → enters health flow, asks age immediately, NOT category selection

test('Test 2: สนใจประกันสุขภาพ → Priority E product (ประกันสุขภาพ), not category flow', () => {
  const msg = 'สนใจประกันสุขภาพ';

  // Priority E: product is detected
  const product = extractProductFromText(msg);
  assert.equal(product, 'ประกันสุขภาพ', 'extractProductFromText must return "ประกันสุขภาพ"');

  // Even though isInterestTrigger would also match, Priority E runs first in the router
  // — confirmed here that the interest trigger DOES match (so we know priority ordering matters)
  assert.equal(isInterestTrigger(msg), true, 'isInterestTrigger also matches (priority ordering is critical)');

  // Must NOT be contact or underwriting
  assert.equal(isContactTrigger(msg),      false, 'Must NOT match contact trigger');
  assert.equal(isUnderwritingTrigger(msg), false, 'Must NOT match underwriting');
});

// ── Test 3 ─────────────────────────────────────────────────────────────────
// current_state: awaiting_field:age
// input: ติดต่อคุณจิราวัฒน์
// expected: Priority D (contact) overrides state → asks name/phone/time, NOT age

test('Test 3: ติดต่อคุณจิราวัฒน์ → Priority D contact flow, first field = real_name (not age)', () => {
  const msg = 'ติดต่อคุณจิราวัฒน์';

  // Priority D: contact trigger detected
  assert.equal(isContactTrigger(msg), true, 'isContactTrigger must return true');

  // isAnyTrigger ensures the awaiting_field state is overridden before Priority D runs
  assert.equal(isAnyTrigger(msg), true, 'Must be in ALL_INTENT_TRIGGERS for state override');

  // CONTACT_FLOW_FIELDS must start with real_name, NOT age
  assert.equal(CONTACT_FLOW_FIELDS[0], 'real_name', 'Contact flow first field must be "real_name"');
  assert.notEqual(CONTACT_FLOW_FIELDS[0], 'age',     'Contact flow must NOT start with "age"');
  assert.ok(CONTACT_FLOW_FIELDS.includes('phone'),                    'Contact flow must include "phone"');
  assert.ok(CONTACT_FLOW_FIELDS.includes('preferred_contact_time'),   'Contact flow must include "preferred_contact_time"');
  assert.ok(!CONTACT_FLOW_FIELDS.includes('age'),                     'Contact flow must NOT include "age"');
  assert.ok(!CONTACT_FLOW_FIELDS.includes('gender'),                  'Contact flow must NOT include "gender"');
});

// ── Test 4 ─────────────────────────────────────────────────────────────────
// current_state: awaiting_field:age
// input: เป็นมะเร็งทำประกันมะเร็งได้มั้ย
// expected: Priority C (underwriting) overrides state → underwriting handoff, NOT ask age

test('Test 4: เป็นมะเร็งทำประกันมะเร็งได้มั้ย → Priority C underwriting (not product/age flow)', () => {
  const msg = 'เป็นมะเร็งทำประกันมะเร็งได้มั้ย';

  // Priority C: underwriting trigger
  assert.equal(isUnderwritingTrigger(msg), true, 'isUnderwritingTrigger must return true');

  // isAnyTrigger ensures state override fires before underwriting branch runs
  assert.equal(isAnyTrigger(msg), true, 'Must be in ALL_INTENT_TRIGGERS for state override');

  // Even though "ประกันมะเร็ง" is in the text, Priority C runs before Priority E
  // Verify product IS detected (so we know priority ordering protects this case)
  const product = extractProductFromText(msg);
  assert.ok(product !== null, 'Product IS detected in text — Priority C must run first to override it');

  // Must NOT be contact trigger
  assert.equal(isContactTrigger(msg), false, 'Must NOT match contact trigger');
});

// ── Test 5 ─────────────────────────────────────────────────────────────────
// input: ลดหย่อนภาษี
// expected: Priority E → tax product (ประกันลดหย่อนภาษี), NOT health product

test('Test 5: ลดหย่อนภาษี → ประกันลดหย่อนภาษี (tax), not ประกันสุขภาพ (health)', () => {
  const msg = 'ลดหย่อนภาษี';

  const product = extractProductFromText(msg);
  assert.equal(product, 'ประกันลดหย่อนภาษี', 'Must detect "ประกันลดหย่อนภาษี" (not health)');
  assert.notEqual(product, 'ประกันสุขภาพ',    'Must NOT be health insurance');

  // Must NOT be contact or underwriting
  assert.equal(isContactTrigger(msg),      false, 'Must NOT match contact trigger');
  assert.equal(isUnderwritingTrigger(msg), false, 'Must NOT match underwriting');
});

// ─── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) {
  console.log('\n⚠️  Some tests failed — check routing logic above\n');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed\n');
}
