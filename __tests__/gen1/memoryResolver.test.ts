/**
 * Memory Resolver Tests — Phase 10.3
 * Run: ./node_modules/.bin/tsx --tsconfig tsconfig.json __tests__/gen1/memoryResolver.test.ts
 */

import assert from 'node:assert/strict';
import { extractFactsFromMessage, resolveMemory } from '../../runtime-gen1/memory/memoryResolver';
import { detectIntent } from '../../runtime-gen1/capability/intentDetector';
import { loadCapability } from '../../runtime-gen1/capability/capabilityLoader';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInput(
  message: string,
  sessionData: Record<string, string> = {},
  opts: { displayName?: string } = {},
) {
  return {
    userId: 'U1234567890abcdef',
    message,
    session: { data: sessionData, meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: Date.now() } },
    displayName: opts.displayName ?? 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  };
}

function resolve(message: string, sessionData: Record<string, string> = {}, opts: { displayName?: string } = {}) {
  const runtimeInput = makeInput(message, sessionData, opts);
  const intentResult = detectIntent(message);
  const capabilityResult = loadCapability(intentResult);
  return resolveMemory({ runtimeInput, intentResult, capabilityResult });
}

console.log('\n🧪 Memory Resolver Tests — Phase 10.3\n');

// ─── Message Extraction ───────────────────────────────────────────────────────

console.log('\n  📋 Message Extraction\n');

test('"อายุ 39" extracts age=39', () => {
  const facts = extractFactsFromMessage('อายุ 39');
  const age = facts.find((f) => f.field === 'age');
  assert.ok(age, 'age fact not found');
  assert.equal(age.value, '39');
  assert.ok(age.confidence >= 0.85);
});

test('"ผม 39 ปี" extracts age=39', () => {
  const facts = extractFactsFromMessage('ผม 39 ปี');
  const age = facts.find((f) => f.field === 'age');
  assert.ok(age, 'age fact not found');
  assert.equal(age.value, '39');
});

test('"ชาย งบ 20000" extracts gender=ชาย and budget_annual=20000', () => {
  const facts = extractFactsFromMessage('ชาย งบ 20000');
  const gender = facts.find((f) => f.field === 'gender');
  const budget = facts.find((f) => f.field === 'budget_annual');
  assert.ok(gender, 'gender fact not found');
  assert.equal(gender.value, 'ชาย');
  assert.ok(budget, 'budget_annual fact not found');
  assert.equal(budget.value, '20000');
});

test('"เดือนละ 2500" extracts budget_annual=30000 (monthly × 12)', () => {
  const facts = extractFactsFromMessage('เดือนละ 2500');
  const budget = facts.find((f) => f.field === 'budget_annual');
  assert.ok(budget, 'budget_annual fact not found');
  assert.equal(budget.value, '30000');
});

test('Phone number extracts phone field', () => {
  const facts = extractFactsFromMessage('เบอร์ผม 0812345678 ครับ');
  const phone = facts.find((f) => f.field === 'phone');
  assert.ok(phone, 'phone fact not found');
  assert.equal(phone.value, '0812345678');
  assert.ok(phone.confidence >= 0.90);
});

test('Phone with dashes extracts and cleans phone', () => {
  const facts = extractFactsFromMessage('081-234-5678');
  const phone = facts.find((f) => f.field === 'phone');
  assert.ok(phone, 'phone fact not found');
  assert.equal(phone.value, '0812345678');
});

test('"เป็นเบาหวาน" extracts medical_condition=diabetes', () => {
  const facts = extractFactsFromMessage('เป็นเบาหวาน');
  const cond = facts.find((f) => f.field === 'medical_condition');
  assert.ok(cond, 'medical_condition fact not found');
  assert.equal(cond.value, 'diabetes');
  assert.ok(cond.confidence >= 0.85);
});

test('"เป็นความดัน" extracts medical_condition=hypertension', () => {
  const facts = extractFactsFromMessage('เป็นความดัน');
  const cond = facts.find((f) => f.field === 'medical_condition');
  assert.ok(cond, 'medical_condition fact not found');
  assert.equal(cond.value, 'hypertension');
});

test('"เคยมีก้อนเนื้อ" extracts medical_condition=tumor_or_cyst', () => {
  const facts = extractFactsFromMessage('เคยมีก้อนเนื้อที่หน้าท้อง');
  const cond = facts.find((f) => f.field === 'medical_condition');
  assert.ok(cond, 'medical_condition fact not found');
  assert.equal(cond.value, 'tumor_or_cyst');
});

test('"สนใจประกันสุขภาพ" extracts interest_category=ประกันสุขภาพ', () => {
  const facts = extractFactsFromMessage('สนใจประกันสุขภาพ');
  const cat = facts.find((f) => f.field === 'interest_category');
  assert.ok(cat, 'interest_category not found');
  assert.equal(cat.value, 'ประกันสุขภาพ');
});

test('"ประกันมะเร็ง" extracts interest_category=ประกันมะเร็ง', () => {
  const facts = extractFactsFromMessage('อยากทำประกันมะเร็ง');
  const cat = facts.find((f) => f.field === 'interest_category');
  assert.ok(cat, 'interest_category not found');
  assert.equal(cat.value, 'ประกันมะเร็ง');
});

test('"สะดวกเย็น" extracts preferred_contact_time=เย็น', () => {
  const facts = extractFactsFromMessage('สะดวกเย็นครับ');
  const t = facts.find((f) => f.field === 'preferred_contact_time');
  assert.ok(t, 'preferred_contact_time not found');
  assert.equal(t.value, 'เย็น');
});

test('Multiple facts in one message are all captured', () => {
  const facts = extractFactsFromMessage('ผมอายุ 45 ปี เพศชาย งบปีละ 36000');
  const fields = facts.map((f) => f.field);
  assert.ok(fields.includes('age'), 'age missing');
  assert.ok(fields.includes('gender'), 'gender missing');
  assert.ok(fields.includes('budget_annual'), 'budget_annual missing');
  const age = facts.find((f) => f.field === 'age');
  const budget = facts.find((f) => f.field === 'budget_annual');
  assert.equal(age?.value, '45');
  assert.equal(budget?.value, '36000');
});

// ─── Known Field Protection ───────────────────────────────────────────────────

console.log('\n  🛡️  Known Field Protection\n');

test('If phone exists in session, phone is not in missingFields', () => {
  const result = resolve('สนใจประกันสุขภาพ', { phone: '0812345678' });
  const missingFieldNames = result.missingFields.map((f) => f.field);
  assert.ok(!missingFieldNames.includes('phone'), 'phone should not be in missingFields');
  assert.ok(result.knownFields.includes('phone'), 'phone should be in knownFields');
});

test('Known fields are always in neverAskAgainFields', () => {
  const result = resolve('สนใจประกันสุขภาพ', { real_name: 'สมชาย', age: '35', phone: '0812345678' });
  assert.ok(result.neverAskAgainFields.includes('real_name'), 'real_name should be in neverAskAgainFields');
  assert.ok(result.neverAskAgainFields.includes('age'), 'age should be in neverAskAgainFields');
  assert.ok(result.neverAskAgainFields.includes('phone'), 'phone should be in neverAskAgainFields');
});

test('Trust intent → shouldAskField=false, nextBestFieldToAsk=null, phone deferred', () => {
  const result = resolve('มิจฉาชีพไหม');
  assert.equal(result.shouldAskField, false, 'shouldAskField should be false');
  assert.equal(result.nextBestFieldToAsk, null, 'nextBestFieldToAsk should be null');
  assert.ok(result.deferredFields.length > 0, 'deferredFields should not be empty');
  const deferredNames = result.deferredFields.map((f) => f.field);
  assert.ok(deferredNames.includes('phone'), 'phone should be deferred during trust');
  // Verify trust memory
  assert.equal(result.trustMemory.trustConcernActive, true);
  assert.equal(result.trustMemory.leadCaptureAllowed, false);
});

test('Trust intent never asks for phone even if phone is missing', () => {
  const result = resolve('โกงหรือเปล่า', {}); // no phone in session
  assert.equal(result.nextBestFieldToAsk, null);
  assert.equal(result.shouldAskField, false);
  const deferred = result.deferredFields.map((f) => f.field);
  assert.ok(deferred.includes('phone'), 'phone should be deferred');
});

test('Medical intent pauses lead field capture (nextBestFieldToAsk=null)', () => {
  const result = resolve('เป็นมะเร็งทำประกันได้ไหม');
  assert.equal(result.nextBestFieldToAsk, null);
  assert.equal(result.shouldAskField, false);
  assert.ok(result.medicalMemory.medicalConcernActive, 'medicalConcernActive should be true');
  assert.ok(result.medicalMemory.conditionsDisclosed.includes('cancer'), 'cancer should be disclosed');
});

test('Medical intent with message "เป็นเบาหวาน" — condition captured, no lead ask', () => {
  const result = resolve('เป็นเบาหวาน');
  assert.equal(result.shouldAskField, false);
  assert.ok(result.medicalMemory.conditionsDisclosed.includes('diabetes'));
  const deferredNames = result.deferredFields.map((f) => f.field);
  assert.ok(deferredNames.length > 0, 'lead fields should be deferred');
});

test('Claim intent → lead fields deferred', () => {
  const result = resolve('เคลมได้ไหม');
  assert.equal(result.shouldAskField, false);
  assert.equal(result.nextBestFieldToAsk, null);
  assert.ok(result.deferredFields.length > 0);
});

test('Hospital intent → lead fields deferred', () => {
  const result = resolve('เข้าโรงพยาบาลไหนดี');
  assert.equal(result.shouldAskField, false);
  assert.equal(result.nextBestFieldToAsk, null);
});

test('Unknown intent → lead fields deferred', () => {
  const result = resolve('ขอบคุณมากครับ');
  assert.equal(result.shouldAskField, false);
  assert.equal(result.nextBestFieldToAsk, null);
});

test('Human handoff → shouldAskField=true, phone asked if missing', () => {
  const result = resolve('ขอปรึกษาคุณจิราวัฒน์');
  assert.equal(result.shouldAskField, true);
  assert.equal(result.nextBestFieldToAsk, 'phone');
});

test('Human handoff → phone NOT asked if phone already known', () => {
  const result = resolve('ขอปรึกษาคุณจิราวัฒน์', { phone: '0812345678' });
  // If phone is known, next field would be real_name
  if (result.nextBestFieldToAsk !== null) {
    assert.notEqual(result.nextBestFieldToAsk, 'phone', 'should not ask phone if already known');
  }
});

test('Product intent → shouldAskField=true, first missing field returned', () => {
  const result = resolve('สนใจประกันสุขภาพ');
  assert.equal(result.shouldAskField, true);
  assert.notEqual(result.nextBestFieldToAsk, null, 'should have a field to ask');
});

test('Product intent with age known → age not asked', () => {
  const result = resolve('สนใจประกันสุขภาพ', { age: '35' });
  const missing = result.missingFields.map((f) => f.field);
  assert.ok(!missing.includes('age'), 'age should not be in missingFields');
});

test('Deferred fields are not immediately re-asked (deferred ≠ nextBestFieldToAsk)', () => {
  const result = resolve('มิจฉาชีพไหม');
  const deferredNames = new Set(result.deferredFields.map((f) => f.field));
  // nextBestFieldToAsk must NOT be in deferredFields
  if (result.nextBestFieldToAsk !== null) {
    assert.ok(!deferredNames.has(result.nextBestFieldToAsk), 'nextBestFieldToAsk is in deferredFields');
  }
});

test('All extracted facts this turn are in extractedFacts (not just in knownFields)', () => {
  const result = resolve('ผมอายุ 35 ปี ชาย เบอร์ 0812345678');
  const factFields = result.extractedFacts.map((f) => f.field);
  assert.ok(factFields.includes('age'), 'age not in extractedFacts');
  assert.ok(factFields.includes('gender'), 'gender not in extractedFacts');
  assert.ok(factFields.includes('phone'), 'phone not in extractedFacts');
});

test('Session phone + message age → both appear in knownFields', () => {
  const result = resolve('ผมอายุ 40 ปีครับ', { phone: '0912345678' });
  assert.ok(result.knownFields.includes('phone'), 'phone from session not in knownFields');
  assert.ok(result.knownFields.includes('age'), 'age from message not in knownFields');
});

// ─── Runtime Trace Integration ────────────────────────────────────────────────

console.log('\n  🔍  Runtime Trace Integration\n');

test('execute() trace includes Phase 10.3 memory fields', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const out = await execute({
    userId: 'U1234567890abcdef',
    message: 'สนใจประกันสุขภาพ อายุ 35',
    session: { data: {}, meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: Date.now() } },
    displayName: 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  });
  assert.ok(Array.isArray(out.trace.knownFields),       'knownFields must be array');
  assert.ok(Array.isArray(out.trace.missingFields),     'missingFields must be array');
  assert.ok(Array.isArray(out.trace.deferredFields),    'deferredFields must be array');
  assert.ok(Array.isArray(out.trace.extractedFacts),    'extractedFacts must be array');
  assert.ok(typeof out.trace.memoryDecisionReason === 'string', 'memoryDecisionReason must be string');
  // Age was extracted from the message
  const extracted = out.trace.extractedFacts ?? [];
  assert.ok(extracted.some((f) => f.field === 'age'), 'age should be in extractedFacts');
});

test('execute() trust message → memory fields show trust blocking', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const out = await execute({
    userId: 'U1234567890abcdef',
    message: 'มิจฉาชีพไหม',
    session: { data: {}, meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: Date.now() } },
    displayName: 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  });
  assert.ok((out.trace.deferredFields ?? []).length > 0, 'deferredFields should be non-empty for trust');
  assert.equal(out.trace.nextBestFieldToAsk, null, 'nextBestFieldToAsk must be null for trust');
  assert.ok(out.trace.memoryDecisionReason?.includes('Trust'), 'reason should mention Trust');
});

test('execute() medical message → medical condition in extractedFacts', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const out = await execute({
    userId: 'U1234567890abcdef',
    message: 'เป็นความดันโลหิตสูงจะทำประกันสุขภาพได้ไหม',
    session: { data: {}, meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: Date.now() } },
    displayName: 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  });
  const extracted = out.trace.extractedFacts ?? [];
  assert.ok(
    extracted.some((f) => f.field === 'medical_condition' && f.value === 'hypertension'),
    'hypertension should be in extractedFacts',
  );
  assert.equal(out.trace.nextBestFieldToAsk, null, 'medical should not ask lead field');
});

test('execute() shadow mode — returns placeholder text (V1 behavior unchanged)', async () => {
  const original = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'shadow';
  try {
    const { execute } = await import('../../runtime-gen1/core/runtime');
    const out = await execute({
      userId: 'U1234567890abcdef',
      message: 'สนใจประกันสุขภาพ',
      session: {},
      displayName: 'ทดสอบ',
      replyToken: 'test-token',
      timestamp: '2026-06-28T00:00:00.000Z',
    });
    // Gen1 execute() always returns placeholder (V1 serves in shadow mode via route.ts gate)
    assert.ok(out.text.length > 0, 'text should not be empty');
    assert.ok(out.trace.mode === 'shadow', 'trace.mode should be shadow');
    // Memory fields should still be populated
    assert.ok(Array.isArray(out.trace.knownFields), 'knownFields should be array in shadow mode');
  } finally {
    if (original === undefined) delete process.env.AI_RUNTIME_MODE;
    else process.env.AI_RUNTIME_MODE = original;
  }
});

// ─── memoryTrace audit fields ─────────────────────────────────────────────────

console.log('\n  📊  Memory Trace Audit\n');

test('memoryTrace.trustActive=true when trust intent detected', () => {
  const result = resolve('โกงหรือเปล่า');
  assert.equal(result.memoryTrace.trustActive, true);
  assert.equal(result.memoryTrace.leadCaptureAllowed, false);
});

test('memoryTrace.medicalActive=true when medical condition extracted', () => {
  const result = resolve('เป็นเบาหวาน');
  assert.equal(result.memoryTrace.medicalActive, true);
});

test('memoryTrace.fieldsFromSession lists session fields', () => {
  const result = resolve('สวัสดี', { real_name: 'สมชาย', phone: '0812345678' });
  assert.ok(result.memoryTrace.fieldsFromSession.includes('real_name'), 'real_name from session');
  assert.ok(result.memoryTrace.fieldsFromSession.includes('phone'), 'phone from session');
});

test('memoryTrace.fieldsFromMessage lists extracted fields', () => {
  const result = resolve('อายุ 35 ปีครับ');
  assert.ok(result.memoryTrace.fieldsFromMessage.includes('age'), 'age from message');
});

test('memoryTrace.fieldsBlocked populated when intent blocks collection', () => {
  const result = resolve('มิจฉาชีพไหม');
  assert.ok(result.memoryTrace.fieldsBlocked.length > 0, 'fieldsBlocked should be non-empty for trust');
  assert.ok(result.memoryTrace.fieldsBlocked.includes('phone'), 'phone should be blocked');
});

// ─── Interest category inference ──────────────────────────────────────────────

console.log('\n  💡  Interest Category Inference\n');

test('Health insurance intent → interest_category inferred as ประกันสุขภาพ', () => {
  const result = resolve('สนใจทำประกันสุขภาพ');
  assert.equal(result.customerProfile.interest_category, 'ประกันสุขภาพ');
  assert.ok(result.knownFields.includes('interest_category'));
});

test('Tax planning intent → interest_category inferred as วางแผนภาษี', () => {
  const result = resolve('อยากลดหย่อนภาษี');
  assert.equal(result.customerProfile.interest_category, 'วางแผนภาษี');
});

// ─── Results ──────────────────────────────────────────────────────────────────

const sentinel = new Promise<void>((res) => setImmediate(res));
void sentinel.then(() => {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed\n');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed\n');
  }
});
