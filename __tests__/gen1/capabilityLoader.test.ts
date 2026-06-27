/**
 * Capability Loader Tests
 * Run: npx tsx --tsconfig tsconfig.json __tests__/gen1/capabilityLoader.test.ts
 */

import assert from 'node:assert/strict';
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

console.log('\n🧪 Capability Loader Tests\n');

const IDLE_CTX    = { currentState: 'idle',                 leadData: {} };
const CAPTURE_CTX = { currentState: 'awaiting_field:phone', leadData: {} };

// ── Trust (CRITICAL) ─────────────────────────────────────────────────────────

test('Trust signal → CAP-002 / ACP-08 / CRITICAL / interrupt=true', () => {
  const result = loadCapability(detectIntent('มิจฉาชีพไหม'));
  assert.equal(result.primaryCapability.capId, 'CAP-002');
  assert.equal(result.primaryCapability.acpPath, 'ACP-08_TRUST_ADVISOR');
  assert.equal(result.priority, 'CRITICAL');
  assert.equal(result.shouldInterruptCurrentState, true);
});

test('Trust signal interrupts even when in lead capture state', () => {
  const result = loadCapability(detectIntent('โกงหรือเปล่า'), CAPTURE_CTX);
  assert.equal(result.priority, 'CRITICAL');
  assert.equal(result.shouldInterruptCurrentState, true);
});

// ── Claim (HIGH) ─────────────────────────────────────────────────────────────

test('Claim question → CAP-011 / ACP-15 / HIGH', () => {
  const result = loadCapability(detectIntent('เคลมได้ไหม'));
  assert.equal(result.primaryCapability.capId, 'CAP-011');
  assert.ok(result.selectedAcpPaths.includes('ACP-15_CLAIM_SUPPORT'));
  assert.equal(result.priority, 'HIGH');
});

test('Claim interrupts lead capture', () => {
  const result = loadCapability(detectIntent('แจ้งเคลม'), CAPTURE_CTX);
  assert.equal(result.shouldInterruptCurrentState, true);
});

// ── Hospital (HIGH) ──────────────────────────────────────────────────────────

test('Hospital question → CAP-012 / ACP-16 / HIGH', () => {
  const result = loadCapability(detectIntent('โรงพยาบาลไหนดี'));
  assert.equal(result.primaryCapability.capId, 'CAP-012');
  assert.ok(result.selectedAcpPaths.includes('ACP-16_HOSPITAL_GUIDANCE'));
  assert.equal(result.priority, 'HIGH');
});

// ── Medical (HIGH) ───────────────────────────────────────────────────────────

test('Medical underwriting → CAP-003 / ACP-04 / HIGH', () => {
  const result = loadCapability(detectIntent('เป็นมะเร็งทำประกันได้ไหม'));
  assert.equal(result.primaryCapability.capId, 'CAP-003');
  assert.ok(result.selectedAcpPaths.includes('ACP-04_MEDICAL_ADVISOR'));
  assert.equal(result.priority, 'HIGH');
});

test('Medical interrupts lead capture', () => {
  const result = loadCapability(detectIntent('เบาหวานรับประกันไหม'), CAPTURE_CTX);
  assert.equal(result.shouldInterruptCurrentState, true);
});

// ── Human handoff (HIGH) ─────────────────────────────────────────────────────

test('Human handoff → CAP-013 / ACP-17 / HIGH', () => {
  const result = loadCapability(detectIntent('ขอปรึกษาคุณจิราวัฒน์'));
  assert.equal(result.primaryCapability.capId, 'CAP-013');
  assert.ok(result.selectedAcpPaths.includes('ACP-17_HUMAN_HANDOFF'));
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.shouldInterruptCurrentState, true);
});

// ── Products (STANDARD) ──────────────────────────────────────────────────────

test('Health insurance → CAP-004 / ACP-02 / STANDARD / no interrupt', () => {
  const result = loadCapability(detectIntent('สนใจประกันสุขภาพ'));
  assert.equal(result.primaryCapability.capId, 'CAP-004');
  assert.ok(result.selectedAcpPaths.includes('ACP-02_HEALTH_ADVISOR'));
  assert.equal(result.priority, 'STANDARD');
  assert.equal(result.shouldInterruptCurrentState, false);
});

test('Cancer insurance → CAP-005 / ACP-03', () => {
  const result = loadCapability(detectIntent('Cancer Care คืออะไร'));
  assert.equal(result.primaryCapability.capId, 'CAP-005');
  assert.ok(result.selectedAcpPaths.includes('ACP-03_CANCER_ADVISOR'));
});

test('Tax planning → CAP-006 / ACP-05', () => {
  const result = loadCapability(detectIntent('ลดหย่อนภาษี'));
  assert.equal(result.primaryCapability.capId, 'CAP-006');
  assert.ok(result.selectedAcpPaths.includes('ACP-05_TAX_ADVISOR'));
});

test('Retirement planning → CAP-009 / ACP-06', () => {
  const result = loadCapability(detectIntent('วางแผนเกษียณ'));
  assert.equal(result.primaryCapability.capId, 'CAP-009');
  assert.ok(result.selectedAcpPaths.includes('ACP-06_RETIREMENT_ADVISOR'));
});

test('Investment linked → CAP-010 / ACP-07', () => {
  const result = loadCapability(detectIntent('unit linked'));
  assert.equal(result.primaryCapability.capId, 'CAP-010');
  assert.ok(result.selectedAcpPaths.includes('ACP-07_INVESTMENT_ADVISOR'));
});

// ── Price objection (STANDARD) ───────────────────────────────────────────────

test('Price objection → CAP-014 / ACP-13', () => {
  const result = loadCapability(detectIntent('แพงเกินไปครับ'));
  assert.equal(result.primaryCapability.capId, 'CAP-014');
  assert.ok(result.selectedAcpPaths.includes('ACP-13_PRICE_OBJECTION'));
});

// ── Unknown (STANDARD) ───────────────────────────────────────────────────────

test('Unknown intent → CAP-001 (greeting/default) / no critical capability', () => {
  const result = loadCapability(detectIntent('ขอบคุณมากครับ'));
  assert.equal(result.priority, 'STANDARD');
  assert.notEqual(result.primaryCapability.capId, 'CAP-002', 'Must NOT be trust capability');
  assert.notEqual(result.primaryCapability.priority, 'CRITICAL', 'Must NOT be CRITICAL priority');
  assert.equal(result.shouldInterruptCurrentState, false);
});

// ── Runtime trace integration ─────────────────────────────────────────────────

test('execute() trace contains detectedIntent and selectedAcpPaths', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId: 'U1234567890abcdef',
    message: 'สนใจประกันสุขภาพ',
    session: {},
    displayName: 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  });
  assert.equal(output.trace.detectedIntent, 'health_insurance');
  assert.ok(Array.isArray(output.trace.selectedAcpPaths), 'selectedAcpPaths must be an array');
  assert.ok((output.trace.selectedAcpPaths ?? []).length > 0, 'must have at least one ACP path');
});

test('execute() trust message → trace.isTrustSignal=true + shouldInterrupt=true', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId: 'U1234567890abcdef',
    message: 'มิจฉาชีพไหม',
    session: {},
    displayName: 'ทดสอบ',
    replyToken: 'test-token',
    timestamp: '2026-06-28T00:00:00.000Z',
  });
  assert.equal(output.trace.isTrustSignal, true);
  assert.equal(output.trace.shouldInterruptCurrentState, true);
  assert.equal(output.trace.detectedIntent, 'trust_concern');
});

// ─── Results ─────────────────────────────────────────────────────────────────

const asyncSentinel = new Promise<void>((resolve) => setImmediate(resolve));
asyncSentinel.then(() => {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed\n');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed\n');
  }
});
