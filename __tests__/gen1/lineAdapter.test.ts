// Phase 10.8 — LINE Adapter Tests
// Tests for buildRuntimeInput, buildLogEntry, stripGen1Prefix, and runGen1LineAdapter.
// Acceptance: 15+ tests covering all adapter conversion paths.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRuntimeInput,
  buildLogEntry,
  stripGen1Prefix,
  runGen1LineAdapter,
  type LineAdapterInput,
} from '../../runtime-gen1/adapters/line/lineAdapter';
import { __setMockLlmFn, GEN1_SAFE_FALLBACK_TEXT } from '../../runtime-gen1/response/llmAdapter';
import type { RuntimeOutput } from '../../runtime-gen1/core/types';

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

// ─── ADAPTER tests — runGen1LineAdapter with mock LLM ─────────────────────────

test('ADAPTER-01: runGen1LineAdapter with mock returns text from execute', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'สวัสดีครับ ผมยินดีให้คำปรึกษาครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(output.text, 'สวัสดีครับ ผมยินดีให้คำปรึกษาครับ');
    assert.ok(typeof output.runtimeVersion === 'string', 'Expected runtimeVersion string');
    assert.ok(typeof output.decision === 'string',       'Expected decision string');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('ADAPTER-02: runGen1LineAdapter logEntry contains all required trace fields', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
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
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('ADAPTER-03: runGen1LineAdapter logEntry responseLength matches text length', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  const mockText = 'ตอบสนองทดสอบ Gen1 ครับ';
  __setMockLlmFn(async () => mockText);
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(output.logEntry.responseLength, output.text.length, 'logEntry.responseLength must equal text.length');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

// ─── MODE tests ───────────────────────────────────────────────────────────────

test('MODE-01: AI_RUNTIME_MODE=gen1 + mock → adapter returns LLM-generated text', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'คำตอบจาก Gen1 ครับ');
  try {
    const output = await runGen1LineAdapter(makeLineInput({ messageText: 'อธิบายประกันชีวิต' }));
    assert.equal(output.text, 'คำตอบจาก Gen1 ครับ', 'Expected LLM text in gen1 mode');
    assert.equal(output.logEntry.mode, 'gen1', 'Expected mode=gen1 in log entry');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('MODE-02: AI_RUNTIME_MODE=v1 → execute returns placeholder (LLM not called)', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'v1';
  let llmCalled = false;
  __setMockLlmFn(async () => { llmCalled = true; return 'should not be returned'; });
  try {
    const output = await runGen1LineAdapter(makeLineInput());
    assert.equal(llmCalled, false, 'LLM mock should NOT be called in v1 mode');
    assert.equal(output.logEntry.mode, 'v1', 'Expected mode=v1 in log entry');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

// ─── ADMIN tests — #gen1 prefix behavior ─────────────────────────────────────

test('ADMIN-01: #gen1 prefix strips correctly for admin use-case end-to-end', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'ประกันสุขภาพดีครับ');
  try {
    const adminMessage = '#gen1 ประกันสุขภาพดีไหม';
    const stripped     = stripGen1Prefix(adminMessage);
    assert.equal(stripped, 'ประกันสุขภาพดีไหม', 'Expected stripped message');

    // Verify the stripped message routes correctly through the adapter
    const output = await runGen1LineAdapter(makeLineInput({ messageText: stripped! }));
    assert.equal(output.text, 'ประกันสุขภาพดีครับ', 'Expected Gen1 response for admin test');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('ADMIN-02: non-#gen1 command does not strip (null result guards the route)', () => {
  // The route checks `if (gen1Msg !== null)` — null means not an admin gen1 test
  assert.equal(stripGen1Prefix('#reset'),        null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('#debug'),        null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('#testnotify'),   null, 'Expected null for non-gen1 command');
  assert.equal(stripGen1Prefix('สวัสดีครับ'),   null, 'Expected null for normal message');
});
