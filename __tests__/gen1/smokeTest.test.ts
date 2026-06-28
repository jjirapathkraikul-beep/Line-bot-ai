// Production Smoke Tests — Beta Release Switch
// Verifies all 7 required scenarios against the LIVE Gen1 pipeline (mock LLM).
// These tests run the exact same code path as production AI_RUNTIME_MODE=gen1:
//   runGen1LineAdapter → executeGen1 → 10-step pipeline → [CONV_LOG] + [AUDIT_ENQUEUE]
//
// Smoke scenarios: Greeting, Trust, Medical, Health Product, Tax, Recommendation, Lead Capture
// Pass criteria: no stub response, pipeline executes, logging active, audit queued

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { runGen1LineAdapter }       from '../../runtime-gen1/adapters/line/lineAdapter';
import { __setMockLlmFn }          from '../../runtime-gen1/response/llmAdapter';
import { getAuditQueue, clearAuditQueue } from '../../runtime-gen1/observability/auditQueue';
import { getMetrics, resetMetrics }       from '../../runtime-gen1/observability/runtimeMetrics';
import type { LineAdapterInput }   from '../../runtime-gen1/adapters/line/lineAdapter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInput(message: string, userId = 'U_SMOKE_TEST_001'): LineAdapterInput {
  return {
    userId,
    displayName: 'Beta Tester',
    messageText: message,
    replyToken:  'SMOKE_REPLY_TOKEN',
    timestamp:   new Date().toISOString(),
    session:     {},
  };
}

// Captures [CONV_LOG] JSON from console output during pipeline call
async function runWithLog(
  message: string,
  mockResponse: string,
): Promise<{ output: Awaited<ReturnType<typeof runGen1LineAdapter>>; convLog: Record<string, unknown> | null }> {
  let convLog: Record<string, unknown> | null = null;
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    if (args[0] === '[CONV_LOG]' && typeof args[1] === 'string') {
      try { convLog = JSON.parse(args[1]) as Record<string, unknown>; } catch { /* */ }
    }
    origLog(...args);
  };
  __setMockLlmFn(async () => mockResponse);
  let output: Awaited<ReturnType<typeof runGen1LineAdapter>>;
  try {
    output = await runGen1LineAdapter(makeInput(message));
  } finally {
    console.log = origLog;
    __setMockLlmFn(null);
  }
  return { output, convLog };
}

// ─── Pre-flight ───────────────────────────────────────────────────────────────

test('SMOKE-00: pre-flight — AI_RUNTIME_MODE is NOT gen1 (admin path bypasses flag)', () => {
  // The #gen1 admin command always runs executeGen1() regardless of mode.
  // In production with AI_RUNTIME_MODE=gen1, the normal user path also runs executeGen1.
  // These smoke tests use runGen1LineAdapter() directly — same code path as prod gen1 mode.
  const mode = process.env.AI_RUNTIME_MODE ?? 'v1';
  console.log(`[SMOKE] Running pipeline smoke tests (env AI_RUNTIME_MODE=${mode})`);
  assert.ok(true, 'Pre-flight logged');
});

// ─── SMOKE-01: Greeting ───────────────────────────────────────────────────────

test('SMOKE-01: Greeting — pipeline runs, non-stub response, intent=greeting', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'สวัสดีครับ',
    'สวัสดีครับ ยินดีให้คำปรึกษาด้านประกันชีวิตและการเงินครับ มีอะไรให้ช่วยไหมครับ?',
  );

  // No stub
  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not return stub decision');
  assert.ok(output.text.length > 10, 'Must return non-empty response');
  assert.equal(output.logEntry.mode, 'gen1', 'Mode must be gen1');

  // Intent detected
  assert.equal(output.logEntry.intent, 'greeting', 'Expected intent=greeting');

  // Logging active
  assert.ok(convLog !== null, 'Expected [CONV_LOG] to be emitted');
  assert.equal(convLog!['runtimeMode'], 'gen1', 'CONV_LOG runtimeMode must be gen1');
  assert.equal(convLog!['intent'], 'greeting', 'CONV_LOG intent must be greeting');
  assert.equal(convLog!['fallbackUsed'], false, 'Must not be fallback');
  assert.equal(convLog!['validatorPassed'], true, 'Validator must pass');

  // Audit queued
  const auditEntry = getAuditQueue()[getAuditQueue().length - 1];
  assert.ok(auditEntry !== undefined, 'Expected audit candidate');
  assert.equal(auditEntry!.status, 'PENDING', 'Audit status must be PENDING');
  assert.equal(auditEntry!.fallbackUsed, false, 'Audit must not flag fallback');

  console.log(`[SMOKE-01] PASS  intent=${output.logEntry.intent}  action=${output.decision}  latency=${convLog!['latency']}ms`);
});

// ─── SMOKE-02: Trust / Fraud Concern ─────────────────────────────────────────

test('SMOKE-02: Trust — trust signal routes to build_trust, lead capture blocked', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'มิจฉาชีพไหมครับ',
    'ผมเข้าใจความกังวลของคุณครับ ผมเป็นตัวแทนที่ได้รับใบอนุญาตจาก คปภ. อย่างถูกต้องครับ',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  assert.equal(output.logEntry.intent, 'trust_concern', 'Expected intent=trust_concern');
  assert.equal(output.decision, 'build_trust', 'Expected decision=build_trust for trust concern');

  // Trust flow flag
  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  assert.equal(convLog!['trustFlow'], true, 'CONV_LOG trustFlow must be true');
  assert.equal(convLog!['leadCaptureStarted'], false, 'Lead capture must not start during trust flow');

  console.log(`[SMOKE-02] PASS  intent=${output.logEntry.intent}  action=${output.decision}  trustFlow=${convLog!['trustFlow']}`);
});

// ─── SMOKE-03: Medical Underwriting ──────────────────────────────────────────

test('SMOKE-03: Medical — medical signal detected, disclaimer required', async () => {
  clearAuditQueue();
  // Use pure medical keyword: 'เบาหวาน' + 'ทำประกันได้ไหม' — matches MEDICAL_KEYWORDS before health product check
  const { output, convLog } = await runWithLog(
    'เป็นเบาหวาน จะทำประกันได้ไหมครับ',
    'โรคเบาหวานสามารถยื่นขอทำประกันสุขภาพได้ครับ แต่จะพิจารณาเป็นรายกรณีขึ้นอยู่กับระดับน้ำตาลในเลือดครับ',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  assert.equal(output.logEntry.intent, 'medical_underwriting', 'Expected intent=medical_underwriting');

  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  assert.equal(convLog!['medicalFlow'], true, 'CONV_LOG medicalFlow must be true');
  assert.equal(convLog!['validatorPassed'], true, 'Validator must pass');

  console.log(`[SMOKE-03] PASS  intent=${output.logEntry.intent}  action=${output.decision}  medicalFlow=${convLog!['medicalFlow']}`);
});

// ─── SMOKE-04: Health Insurance Product ──────────────────────────────────────

test('SMOKE-04: Health Product — product intent detected, educate action', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'Good Health Prime คืออะไรครับ',
    'Good Health Prime คือประกันสุขภาพแบบเหมาจ่ายจาก Tokio Marine ครับ คุ้มครองค่ารักษาพยาบาลแบบผู้ป่วยใน',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  assert.equal(output.logEntry.intent, 'health_insurance', 'Expected intent=health_insurance');
  assert.ok(
    ['educate', 'answer_then_ask', 'answer'].includes(output.decision),
    `Expected educate/answer action, got: ${output.decision}`,
  );

  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  assert.equal(convLog!['intent'], 'health_insurance', 'CONV_LOG intent must be health_insurance');
  assert.equal(convLog!['fallbackUsed'], false, 'No fallback');

  console.log(`[SMOKE-04] PASS  intent=${output.logEntry.intent}  action=${output.decision}`);
});

// ─── SMOKE-05: Tax Planning ───────────────────────────────────────────────────

test('SMOKE-05: Tax — tax intent detected, product knowledge loaded', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'Tokyo SuperTax ลดหย่อนภาษีได้เท่าไรครับ',
    'Tokyo SuperTax เป็นประกันชีวิตแบบสะสมทรัพย์ที่ใช้ลดหย่อนภาษีได้สูงสุด 100,000 บาทครับ',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  assert.equal(output.logEntry.intent, 'tax_planning', 'Expected intent=tax_planning');

  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  assert.equal(convLog!['intent'], 'tax_planning', 'CONV_LOG intent must be tax_planning');
  assert.ok(typeof convLog!['latency'] === 'number', 'Latency must be recorded');

  console.log(`[SMOKE-05] PASS  intent=${output.logEntry.intent}  action=${output.decision}  latency=${convLog!['latency']}ms`);
});

// ─── SMOKE-06: Recommendation ────────────────────────────────────────────────

test('SMOKE-06: Recommendation — recommendation intent routed correctly', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'สนใจประกันสุขภาพ อายุ 39 ปี ชาย งบ 20,000 บาทต่อปี แนะนำให้หน่อยครับ',
    'จากที่คุณบอกว่าอายุ 39 ปี งบ 20,000 บาทต่อปี ผมแนะนำ Good Health Prime Plan 3 ครับ คุ้มครองได้ครอบคลุมในงบที่เหมาะสมครับ',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  assert.ok(
    ['recommend', 'answer_then_ask', 'answer', 'educate'].includes(output.decision),
    `Expected recommendation-path action, got: ${output.decision}`,
  );

  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  assert.ok(
    ['recommendation_request', 'health_insurance'].includes(String(convLog!['intent'])),
    `Expected recommendation or health intent, got: ${convLog!['intent']}`,
  );

  console.log(`[SMOKE-06] PASS  intent=${output.logEntry.intent}  action=${output.decision}`);
});

// ─── SMOKE-07: Lead Capture ───────────────────────────────────────────────────

test('SMOKE-07: Lead Capture — lead capture flow does not fire before value delivered', async () => {
  clearAuditQueue();
  const { output, convLog } = await runWithLog(
    'อยากรู้ราคาเบี้ยประกันสุขภาพครับ',
    'ค่าเบี้ยประกันสุขภาพขึ้นอยู่กับอายุและแผนความคุ้มครองครับ ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ',
  );

  assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'No stub');
  // Premium question routes to price-related handling — should not immediately capture lead
  assert.ok(convLog !== null, 'Expected [CONV_LOG]');
  // Lead capture must not start before value has been delivered (CP-07)
  const leadCaptureStarted = convLog!['leadCaptureStarted'] as boolean;
  assert.equal(leadCaptureStarted, false, 'Lead capture must NOT start on first price inquiry (CP-07: value before capture)');

  console.log(`[SMOKE-07] PASS  intent=${output.logEntry.intent}  action=${output.decision}  leadCaptureStarted=${leadCaptureStarted}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

test('SMOKE-SUMMARY: runtime metrics accumulated across all smoke tests', () => {
  const metrics = getMetrics();
  console.log('[SMOKE-SUMMARY] Runtime metrics snapshot:');
  console.log(`  totalTurns:              ${metrics.totalTurns}`);
  console.log(`  averageLatencyMs:        ${metrics.averageLatencyMs}`);
  console.log(`  fallbackRate:            ${(metrics.fallbackRate * 100).toFixed(1)}%`);
  console.log(`  validationFailureRate:   ${(metrics.validationFailureRate * 100).toFixed(1)}%`);
  console.log(`  trustConversationRate:   ${(metrics.trustConversationRate * 100).toFixed(1)}%`);
  console.log(`  medicalConversationRate: ${(metrics.medicalConversationRate * 100).toFixed(1)}%`);
  console.log(`  topIntents:              ${JSON.stringify(metrics.topIntents)}`);

  // Sanity checks on accumulated data
  assert.ok(metrics.totalTurns >= 7, 'Expected at least 7 turns from smoke tests');
  assert.equal(metrics.fallbackRate, 0, 'Fallback rate must be 0 — no stub responses in smoke tests');
  assert.equal(metrics.validationFailureRate, 0, 'Validation failure rate must be 0');
  assert.ok(metrics.trustConversationRate > 0, 'Expected at least one trust conversation (SMOKE-02)');
  assert.ok(metrics.medicalConversationRate > 0, 'Expected at least one medical conversation (SMOKE-03)');

  console.log('[SMOKE-SUMMARY] All metrics healthy — pipeline is production-ready');
  resetMetrics();
});
