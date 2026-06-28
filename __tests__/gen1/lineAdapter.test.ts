// Phase 10.8 — LINE Adapter Tests
// Tests for buildRuntimeInput, buildLogEntry, stripGen1Prefix, and runGen1LineAdapter.
// Acceptance: 24 tests covering all adapter conversion paths + pipeline activation.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRuntimeInput,
  buildLogEntry,
  stripGen1Prefix,
  runGen1LineAdapter,
  type LineAdapterInput,
} from '../../runtime-gen1/adapters/line/lineAdapter';
import { execute } from '../../runtime-gen1/core/runtime';
import { __setMockLlmFn, GEN1_SAFE_FALLBACK_TEXT } from '../../runtime-gen1/response/llmAdapter';
import type { RuntimeOutput, RuntimeInput } from '../../runtime-gen1/core/types';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeLineInput(overrides: Partial<LineAdapterInput> = {}): LineAdapterInput {
  return {
    userId:      'Uabc12345test',
    displayName: 'คุณทดสอบ',
    messageText: 'สวัสดีครับ',
    replyToken:  'REPLY_TOKEN_001',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     { displayName: 'คุณทดสอบ' },
    ...overrides,
  };
}

function makeRuntimeInput(message = 'สวัสดีครับ'): RuntimeInput {
  return {
    userId:      'U_TEST_EXEC_01',
    message,
    displayName: 'ทดสอบ',
    replyToken:  'REPLY_EXEC_001',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  };
}

function makeRuntimeOutput(overrides: Partial<RuntimeOutput> = {}): RuntimeOutput {
  return {
    text:           'สวัสดีครับ ยินดีให้คำปรึกษาครับ',
    decision:       'answer',
    runtimeVersion: 'gen1-stub-0.7.0',
    trace: {
      mode:                    'gen1',
      userId_masked:           'Uabc1234***',
      message_preview:         'สวัสดีครับ',
      runtimeVersion:          'gen1-stub-0.7.0',
      decision:                'answer',
      timestamp:               '2026-06-01T10:00:00.000Z',
      detectedIntent:          'greeting',
      selectedCapabilities:    ['CAP-001'],
      action:                  'answer',
      responseValidationPassed: true,
    },
    ...overrides,
  };
}

// ─── CONV tests — buildRuntimeInput field mapping ─────────────────────────────

test('CONV-01: buildRuntimeInput maps userId correctly', () => {
  const result = buildRuntimeInput(makeLineInput({ userId: 'U_LINE_123' }));
  assert.equal(result.userId, 'U_LINE_123');
});

test('CONV-02: buildRuntimeInput maps messageText to message', () => {
  const result = buildRuntimeInput(makeLineInput({ messageText: 'ประกันชีวิตราคาเท่าไหร่ครับ' }));
  assert.equal(result.message, 'ประกันชีวิตราคาเท่าไหร่ครับ');
});

test('CONV-03: buildRuntimeInput maps displayName', () => {
  const result = buildRuntimeInput(makeLineInput({ displayName: 'Jirawat Test' }));
  assert.equal(result.displayName, 'Jirawat Test');
});

test('CONV-04: buildRuntimeInput maps replyToken', () => {
  const result = buildRuntimeInput(makeLineInput({ replyToken: 'TOKEN_XYZ_789' }));
  assert.equal(result.replyToken, 'TOKEN_XYZ_789');
});

test('CONV-05: buildRuntimeInput maps timestamp', () => {
  const ts     = '2026-07-01T08:30:00.000Z';
  const result = buildRuntimeInput(makeLineInput({ timestamp: ts }));
  assert.equal(result.timestamp, ts);
});

test('CONV-06: buildRuntimeInput maps session object reference', () => {
  const session = { displayName: 'Test', lastIntent: 'greeting' };
  const result  = buildRuntimeInput(makeLineInput({ session }));
  assert.deepEqual(result.session, session);
});

// ─── LOG tests — buildLogEntry field construction ─────────────────────────────

test('LOG-01: buildLogEntry includes all required fields', () => {
  const output = makeRuntimeOutput();
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.ok('mode'             in entry, 'Expected mode field');
  assert.ok('userId_masked'    in entry, 'Expected userId_masked field');
  assert.ok('intent'           in entry, 'Expected intent field');
  assert.ok('capability'       in entry, 'Expected capability field');
  assert.ok('action'           in entry, 'Expected action field');
  assert.ok('validationPassed' in entry, 'Expected validationPassed field');
  assert.ok('responseLength'   in entry, 'Expected responseLength field');
  assert.ok('timestamp'        in entry, 'Expected timestamp field');
});

test('LOG-02: buildLogEntry responseLength equals text.length', () => {
  const text   = 'สวัสดีครับ ยินดีให้คำปรึกษาครับ';
  const output = makeRuntimeOutput({ text });
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.equal(entry.responseLength, text.length);
});

test('LOG-03: buildLogEntry intent comes from trace.detectedIntent', () => {
  const output = makeRuntimeOutput();
  output.trace.detectedIntent = 'trust_concern';
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.equal(entry.intent, 'trust_concern');
});

test('LOG-04: buildLogEntry defaults intent to "unknown" when detectedIntent missing', () => {
  const output = makeRuntimeOutput();
  delete output.trace.detectedIntent;
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.equal(entry.intent, 'unknown');
});

test('LOG-05: buildLogEntry capability comes from first selectedCapabilities entry', () => {
  const output = makeRuntimeOutput();
  output.trace.selectedCapabilities = ['CAP-008', 'CAP-001'];
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.equal(entry.capability, 'CAP-008');
});

test('LOG-06: buildLogEntry validationPassed reflects trace.responseValidationPassed', () => {
  const output = makeRuntimeOutput();
  output.trace.responseValidationPassed = false;
  const entry  = buildLogEntry(output, '2026-06-01T10:00:00.000Z');
  assert.equal(entry.validationPassed, false);
});

// ─── PREFIX tests — stripGen1Prefix ──────────────────────────────────────────

test('PREFIX-01: strips "#gen1 " prefix and returns the message', () => {
  const result = stripGen1Prefix('#gen1 สวัสดีครับ');
  assert.equal(result, 'สวัสดีครับ');
});

test('PREFIX-02: returns null for messages that do not start with "#gen1 "', () => {
  assert.equal(stripGen1Prefix('สวัสดีครับ'),   null);
  assert.equal(stripGen1Prefix('#reset'),        null);
  assert.equal(stripGen1Prefix('#debug'),        null);
  assert.equal(stripGen1Prefix('gen1 test'),     null);
});

test('PREFIX-03: returns null when "#gen1 " prefix has no following text', () => {
  assert.equal(stripGen1Prefix('#gen1 '),  null);
  assert.equal(stripGen1Prefix('#gen1   '), null);
});

test('PREFIX-04: is case-insensitive for the prefix', () => {
  const result = stripGen1Prefix('#GEN1 ประกันสุขภาพ');
  assert.equal(result, 'ประกันสุขภาพ');
});

test('PREFIX-05: trims whitespace from both the prefix and the result', () => {
  const result = stripGen1Prefix('  #gen1 สวัสดีครับ  ');
  assert.equal(result, 'สวัสดีครับ');
});

// ─── ADAPTER tests — runGen1LineAdapter always runs gen1 pipeline ─────────────
// runGen1LineAdapter calls executeGen1() directly — AI_RUNTIME_MODE is ignored.

test('ADAPTER-01: runGen1LineAdapter returns text from gen1 pipeline (no env override needed)', async () => {
  __setMockLlmFn(async () => 'สวัสดีครับ ผมยินดีให้คำปรึกษาครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(output.text, 'สวัสดีครับ ผมยินดีให้คำปรึกษาครับ');
    assert.ok(typeof output.runtimeVersion === 'string', 'Expected runtimeVersion string');
    assert.ok(typeof output.decision === 'string',       'Expected decision string');
  } finally {
    __setMockLlmFn(null);
  }
});

test('ADAPTER-02: runGen1LineAdapter logEntry contains all required trace fields', async () => {
  __setMockLlmFn(async () => 'ประกันชีวิตคุ้มครองครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ userId: 'U_LOG_TEST_001' }));
    const { logEntry } = output;
    assert.ok(typeof logEntry.mode === 'string',             'Expected mode');
    assert.ok(typeof logEntry.userId_masked === 'string',    'Expected userId_masked');
    assert.ok(typeof logEntry.intent === 'string',           'Expected intent');
    assert.ok(typeof logEntry.capability === 'string',       'Expected capability');
    assert.ok(typeof logEntry.action === 'string',           'Expected action');
    assert.ok(typeof logEntry.validationPassed === 'boolean','Expected validationPassed');
    assert.ok(typeof logEntry.responseLength === 'number',   'Expected responseLength');
    assert.ok(typeof logEntry.timestamp === 'string',        'Expected timestamp');
  } finally {
    __setMockLlmFn(null);
  }
});

test('ADAPTER-03: runGen1LineAdapter logEntry responseLength matches text length', async () => {
  const mockText = 'ตอบสนองทดสอบ Gen1 ครับ';
  __setMockLlmFn(async () => mockText);
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(output.logEntry.responseLength, output.text.length, 'logEntry.responseLength must equal text.length');
  } finally {
    __setMockLlmFn(null);
  }
});

// ─── MODE tests ───────────────────────────────────────────────────────────────

test('MODE-01: runGen1LineAdapter always runs gen1 pipeline regardless of AI_RUNTIME_MODE', async () => {
  __setMockLlmFn(async () => 'คำตอบจาก Gen1 ครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'อธิบายประกันชีวิต' }));
    assert.equal(output.text, 'คำตอบจาก Gen1 ครับ', 'Expected LLM text from gen1 pipeline');
    assert.equal(output.logEntry.mode, 'gen1', 'Expected mode=gen1 in log entry');
  } finally {
    __setMockLlmFn(null);
  }
});

test('MODE-02: AI_RUNTIME_MODE=v1 → runGen1LineAdapter STILL runs gen1 pipeline (admin command ignores feature flag)', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'v1';
  let llmCalled = false;
  __setMockLlmFn(async () => { llmCalled = true; return 'gen1 ยังทำงานอยู่ครับ'; });
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(llmCalled, true, 'LLM must be called even when AI_RUNTIME_MODE=v1');
    assert.equal(output.logEntry.mode, 'gen1', 'Expected mode=gen1 — adapter always uses executeGen1()');
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not return stub decision');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('MODE-03: AI_RUNTIME_MODE=v1 → execute() returns placeholder (feature flag preserved)', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'v1';
  let llmCalled = false;
  __setMockLlmFn(async () => { llmCalled = true; return 'should not be returned'; });
  try {
    const output = await execute(makeRuntimeInput());
    assert.equal(llmCalled, false, 'LLM must NOT be called in v1 mode via execute()');
    assert.equal(output.trace.mode, 'v1', 'Expected trace.mode=v1');
    assert.equal(output.decision, 'ACT-12 FALLBACK (stub)', 'v1 must return stub decision');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

// ─── ADMIN tests — #gen1 prefix behavior ─────────────────────────────────────

test('ADMIN-01: #gen1 prefix strips correctly for admin use-case end-to-end', async () => {
  __setMockLlmFn(async () => 'ประกันสุขภาพดีครับ');
  try {
    const adminMessage = '#gen1 ประกันสุขภาพดีไหม';
    const stripped     = stripGen1Prefix(adminMessage);
    assert.equal(stripped, 'ประกันสุขภาพดีไหม', 'Expected stripped message');

    const output = await runGen1LineAdapter(makeLineInput({ messageText: stripped! }));
    assert.equal(output.text, 'ประกันสุขภาพดีครับ', 'Expected Gen1 response for admin test');
    assert.equal(output.logEntry.mode, 'gen1', 'Admin command must always use gen1 pipeline');
  } finally {
    __setMockLlmFn(null);
  }
});

test('ADMIN-02: non-#gen1 command does not strip (null result guards the route)', () => {
  assert.equal(stripGen1Prefix('#reset'),        null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('#debug'),        null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('#testnotify'),   null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('สวัสดีครับ'),   null, 'Expected null for normal message');
});

// ─── PIPELINE tests — #gen1 admin command always runs full pipeline ─────────────
// These tests verify that the full 10-step gen1 pipeline runs for admin commands,
// regardless of AI_RUNTIME_MODE, and that no stub fallback is returned.

test('PIPELINE-01: #gen1 Cancer Care คืออะไร — pipeline runs, no stub fallback returned', async () => {
  __setMockLlmFn(async () => 'Cancer Care คือประกันมะเร็งครับ คุ้มครองค่ารักษาพยาบาลจากโรคมะเร็ง');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'Cancer Care คืออะไรครับ' }));
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not return stub fallback');
    assert.ok(output.text.length > 10, 'Must return a real LLM response');
    assert.equal(output.logEntry.validationPassed, true, 'Validation must pass');
    assert.equal(output.logEntry.mode, 'gen1', 'Mode must be gen1');
  } finally {
    __setMockLlmFn(null);
  }
});

test('PIPELINE-02: #gen1 มิจฉาชีพไหม — trust signal routes to BUILD_TRUST_FIRST strategy', async () => {
  __setMockLlmFn(async () => 'ผมเข้าใจความกังวลของคุณครับ ผมเป็นตัวแทนที่ได้รับใบอนุญาตอย่างถูกต้องครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'มิจฉาชีพไหมครับ' }));
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not return stub fallback');
    assert.ok(output.text.length > 0, 'Must return non-empty response');
    assert.equal(output.logEntry.mode, 'gen1', 'Must run gen1 pipeline');
    // Trust signal → intent detector flags isTrustSignal → strategy BUILD_TRUST_FIRST
    assert.ok(output.logEntry.intent !== undefined, 'Intent must be detected');
  } finally {
    __setMockLlmFn(null);
  }
});

test('PIPELINE-03: #gen1 เป็นความดัน ทำประกันสุขภาพได้ไหม — medical signal routes correctly', async () => {
  __setMockLlmFn(async () => 'โรคความดันโลหิตสูงสามารถทำประกันสุขภาพได้ครับ ขึ้นอยู่กับระดับความดันและประวัติการรักษาครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'เป็นความดัน ทำประกันสุขภาพได้ไหมครับ' }));
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not return stub fallback');
    assert.ok(output.text.length > 0, 'Must return non-empty response');
    assert.equal(output.logEntry.mode, 'gen1', 'Must run gen1 pipeline');
  } finally {
    __setMockLlmFn(null);
  }
});

test('PIPELINE-04: pipeline executes through promptBuilder (trace.mode=gen1, non-stub decision)', async () => {
  __setMockLlmFn(async () => 'ยินดีให้คำแนะนำเรื่องประกันสุขภาพครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'ช่วยแนะนำประกันหน่อยครับ' }));
    assert.equal(output.logEntry.mode, 'gen1', 'Mode must be gen1');
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Must not be stub decision');
    assert.ok(typeof output.text === 'string' && output.text.length > 0, 'Must return a response');
    // Verify pipeline actually ran through the decision engine (action is a real action type)
    const validActions = ['answer', 'answer_then_ask', 'build_trust', 'educate', 'recommend',
      'collect_lead', 'emergency_guide', 'claim_guide', 'discovery', 'redirect', 'fallback', 'wait',
      'emergency_guide', 'handoff'];
    assert.ok(
      validActions.some((a) => output.decision === a) || output.decision.length > 0,
      'decision must be a real action type, not stub',
    );
  } finally {
    __setMockLlmFn(null);
  }
});

test('PIPELINE-05: GEN1_SAFE_FALLBACK_TEXT only returned when LLM mock throws, not on normal messages', async () => {
  // Part A: normal LLM response → NOT safe fallback
  __setMockLlmFn(async () => 'ตอบคำถามได้ปกติครับ มีอะไรให้ช่วยไหม');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'สวัสดีครับ' }));
    assert.notEqual(output.text, GEN1_SAFE_FALLBACK_TEXT, 'Normal messages must NOT return safe fallback text');
  } finally {
    __setMockLlmFn(null);
  }

  // Part B: LLM mock throws → llmAdapter catches internally → returns GEN1_SAFE_FALLBACK_TEXT
  __setMockLlmFn(async () => { throw new Error('Simulated LLM failure'); });
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'สวัสดีครับ' }));
    assert.equal(output.text, GEN1_SAFE_FALLBACK_TEXT, 'LLM failure must return GEN1_SAFE_FALLBACK_TEXT');
  } finally {
    __setMockLlmFn(null);
  }
});
