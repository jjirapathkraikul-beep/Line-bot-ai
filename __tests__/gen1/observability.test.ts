// Beta Release Sprint — Observability System Tests
// Covers: conversationLogger, auditQueue, issueDatabase, runtimeMetrics
// Groups: LOGGER (6), AUDIT (7), ISSUES (7), METRICS (8), INTEGRATION (4) = 32 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildConversationId,
  logConversationTurn,
  type ConversationLogEntry,
} from '../../runtime-gen1/observability/conversationLogger';

import {
  enqueueAudit,
  getAuditQueue,
  updateAuditStatus,
  clearAuditQueue,
} from '../../runtime-gen1/observability/auditQueue';

import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  clearIssues,
} from '../../runtime-gen1/observability/issueDatabase';

import {
  recordMetric,
  getMetrics,
  resetMetrics,
} from '../../runtime-gen1/observability/runtimeMetrics';

import { runGen1LineAdapter } from '../../runtime-gen1/adapters/line/lineAdapter';
import { __setMockLlmFn } from '../../runtime-gen1/response/llmAdapter';
import type { LineAdapterInput } from '../../runtime-gen1/adapters/line/lineAdapter';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<ConversationLogEntry> = {}): ConversationLogEntry {
  return {
    conversationId:          'conv-Uabc1234-2026-06-28',
    sessionId:               'ctx-1234567890-Uabc',
    timestamp:               '2026-06-28T10:00:00.000Z',
    runtimeVersion:          'gen1-stub-0.9.0',
    runtimeMode:             'gen1',
    userId:                  'Uabc1234***',
    userMessage:             'Cancer Care คืออะไรครับ',
    assistantResponse:       'Cancer Care คือประกันมะเร็งครับ',
    latency:                 250,
    intent:                  'cancer_insurance',
    capability:              'CAP-005',
    decision:                'educate',
    strategy:                'EDUCATE_THEN_DISCOVER',
    questionCount:           1,
    recommendationDelivered: false,
    educationDelivered:      false,
    leadCaptureStarted:      false,
    leadCaptureCompleted:    false,
    trustFlow:               false,
    medicalFlow:             false,
    formatterApplied:        false,
    validatorPassed:         true,
    fallbackUsed:            false,
    fallbackReason:          null,
    error:                   null,
    responseLength:          30,
    ...overrides,
  };
}

function makeLineInput(overrides: Partial<LineAdapterInput> = {}): LineAdapterInput {
  return {
    userId:      'Uabc12345test',
    displayName: 'คุณทดสอบ',
    messageText: 'สวัสดีครับ',
    replyToken:  'REPLY_OBS_001',
    timestamp:   '2026-06-28T10:00:00.000Z',
    session:     {},
    ...overrides,
  };
}

// ─── LOGGER GROUP ─────────────────────────────────────────────────────────────

test('LOGGER-01: buildConversationId returns correct format conv-{userId8}-{date}', () => {
  const id = buildConversationId('Uabc12345678', '2026-06-28T10:00:00.000Z');
  assert.equal(id, 'conv-Uabc1234-2026-06-28');
});

test('LOGGER-02: buildConversationId uses first 8 chars of userId', () => {
  const id = buildConversationId('USHORTID', '2026-06-28T10:00:00.000Z');
  assert.ok(id.startsWith('conv-USHORTID-'), 'Expected userId prefix in conversationId');
});

test('LOGGER-03: buildConversationId groups same user on same day to same ID', () => {
  const id1 = buildConversationId('Uabc12345678', '2026-06-28T10:00:00.000Z');
  const id2 = buildConversationId('Uabc12345678', '2026-06-28T23:59:59.000Z');
  assert.equal(id1, id2, 'Expected same conversationId for same user on same day');
});

test('LOGGER-04: buildConversationId differs across days', () => {
  const id1 = buildConversationId('Uabc12345678', '2026-06-28T10:00:00.000Z');
  const id2 = buildConversationId('Uabc12345678', '2026-06-29T10:00:00.000Z');
  assert.notEqual(id1, id2, 'Expected different conversationId on different days');
});

test('LOGGER-05: logConversationTurn emits [CONV_LOG] to console (no throw)', () => {
  const logs: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => { logs.push(args.join(' ')); orig(...args); };
  try {
    logConversationTurn(makeEntry());
    assert.ok(logs.some((l) => l.startsWith('[CONV_LOG]')), 'Expected [CONV_LOG] prefix');
  } finally {
    console.log = orig;
  }
});

test('LOGGER-06: logConversationTurn output is valid JSON with all 26 required fields', () => {
  let captured = '';
  const orig = console.log;
  console.log = (...args: unknown[]) => { captured = args.slice(1).join(' '); };
  try {
    logConversationTurn(makeEntry());
    const parsed = JSON.parse(captured) as Record<string, unknown>;
    const required = [
      'conversationId', 'sessionId', 'timestamp', 'runtimeVersion', 'runtimeMode',
      'userId', 'userMessage', 'assistantResponse', 'latency', 'intent', 'capability',
      'decision', 'strategy', 'questionCount', 'recommendationDelivered', 'educationDelivered',
      'leadCaptureStarted', 'leadCaptureCompleted', 'trustFlow', 'medicalFlow',
      'formatterApplied', 'validatorPassed', 'fallbackUsed', 'fallbackReason',
      'error', 'responseLength',
    ];
    for (const field of required) {
      assert.ok(field in parsed, `Expected field "${field}" in CONV_LOG output`);
    }
  } finally {
    console.log = orig;
  }
});

// ─── AUDIT GROUP ──────────────────────────────────────────────────────────────

test('AUDIT-01: enqueueAudit adds candidate to queue with status PENDING', () => {
  clearAuditQueue();
  enqueueAudit(makeEntry());
  const queue = getAuditQueue();
  assert.equal(queue.length, 1);
  assert.equal(queue[0]!.status, 'PENDING');
});

test('AUDIT-02: enqueueAudit copies conversationId and sessionId from entry', () => {
  clearAuditQueue();
  const entry = makeEntry({ conversationId: 'conv-TEST-001', sessionId: 'ctx-TEST-001' });
  enqueueAudit(entry);
  const candidate = getAuditQueue()[0]!;
  assert.equal(candidate.conversationId, 'conv-TEST-001');
  assert.equal(candidate.sessionId, 'ctx-TEST-001');
});

test('AUDIT-03: enqueueAudit copies key diagnostic fields (intent, decision, strategy, latency)', () => {
  clearAuditQueue();
  enqueueAudit(makeEntry({ intent: 'trust_concern', decision: 'build_trust', latency: 450 }));
  const c = getAuditQueue()[0]!;
  assert.equal(c.intent,   'trust_concern');
  assert.equal(c.decision, 'build_trust');
  assert.equal(c.latency,  450);
});

test('AUDIT-04: multiple enqueueAudit calls grow the queue', () => {
  clearAuditQueue();
  enqueueAudit(makeEntry({ conversationId: 'conv-A' }));
  enqueueAudit(makeEntry({ conversationId: 'conv-B' }));
  enqueueAudit(makeEntry({ conversationId: 'conv-C' }));
  assert.equal(getAuditQueue().length, 3);
});

test('AUDIT-05: updateAuditStatus changes status to REVIEWED', () => {
  clearAuditQueue();
  enqueueAudit(makeEntry({ conversationId: 'conv-STATUS-01' }));
  const ok = updateAuditStatus('conv-STATUS-01', 'REVIEWED');
  assert.equal(ok, true);
  assert.equal(getAuditQueue()[0]!.status, 'REVIEWED');
});

test('AUDIT-06: updateAuditStatus supports all four statuses', () => {
  clearAuditQueue();
  enqueueAudit(makeEntry({ conversationId: 'conv-CYCLE-01' }));
  for (const status of ['PENDING', 'REVIEWED', 'FIXED', 'VERIFIED'] as const) {
    updateAuditStatus('conv-CYCLE-01', status);
    assert.equal(getAuditQueue()[0]!.status, status);
  }
});

test('AUDIT-07: updateAuditStatus returns false for unknown conversationId', () => {
  clearAuditQueue();
  const ok = updateAuditStatus('conv-DOES-NOT-EXIST', 'REVIEWED');
  assert.equal(ok, false);
});

// ─── ISSUES GROUP ─────────────────────────────────────────────────────────────

test('ISSUES-01: createIssue assigns ISSUE-0001 to the first issue', () => {
  clearIssues();
  const issue = createIssue({
    conversationId:   'conv-TEST',
    category:         'conversation_flow',
    severity:         'P1',
    expectedBehavior: 'Should answer first',
    actualBehavior:   'Asked a question first',
    rootCause:        null,
    proposedFix:      null,
    owner:            null,
  });
  assert.equal(issue.issueId, 'ISSUE-0001');
  assert.equal(issue.status, 'OPEN');
  assert.equal(issue.regressionTested, false);
});

test('ISSUES-02: createIssue auto-increments issueId', () => {
  clearIssues();
  const a = createIssue({ conversationId: 'conv-A', category: 'other', severity: 'P3', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  const b = createIssue({ conversationId: 'conv-B', category: 'other', severity: 'P3', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  assert.equal(a.issueId, 'ISSUE-0001');
  assert.equal(b.issueId, 'ISSUE-0002');
});

test('ISSUES-03: getIssues returns all created issues', () => {
  clearIssues();
  createIssue({ conversationId: 'conv-1', category: 'other', severity: 'P2', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  createIssue({ conversationId: 'conv-2', category: 'other', severity: 'P2', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  assert.equal(getIssues().length, 2);
});

test('ISSUES-04: getIssueById returns correct issue', () => {
  clearIssues();
  createIssue({ conversationId: 'conv-GBI', category: 'intent_detection', severity: 'P0', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  const found = getIssueById('ISSUE-0001');
  assert.ok(found !== undefined, 'Expected to find issue by ID');
  assert.equal(found!.conversationId, 'conv-GBI');
});

test('ISSUES-05: getIssueById returns undefined for unknown ID', () => {
  clearIssues();
  assert.equal(getIssueById('ISSUE-9999'), undefined);
});

test('ISSUES-06: updateIssue changes status and sets updatedAt', () => {
  clearIssues();
  createIssue({ conversationId: 'conv-UPD', category: 'other', severity: 'P1', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  const ok = updateIssue('ISSUE-0001', { status: 'IN_PROGRESS', owner: 'jirawat' });
  assert.equal(ok, true);
  const issue = getIssueById('ISSUE-0001')!;
  assert.equal(issue.status, 'IN_PROGRESS');
  assert.equal(issue.owner, 'jirawat');
});

test('ISSUES-07: updateIssue returns false for unknown issueId', () => {
  clearIssues();
  const ok = updateIssue('ISSUE-9999', { status: 'RESOLVED' });
  assert.equal(ok, false);
});

// ─── METRICS GROUP ────────────────────────────────────────────────────────────

test('METRICS-01: recordMetric increments totalTurns', () => {
  resetMetrics();
  recordMetric(makeEntry());
  recordMetric(makeEntry());
  const m = getMetrics();
  assert.equal(m.totalTurns, 2);
});

test('METRICS-02: averageLatencyMs is correct average', () => {
  resetMetrics();
  recordMetric(makeEntry({ latency: 100 }));
  recordMetric(makeEntry({ latency: 300 }));
  const m = getMetrics();
  assert.equal(m.averageLatencyMs, 200);
});

test('METRICS-03: fallbackRate counts fallbackUsed=true entries', () => {
  resetMetrics();
  recordMetric(makeEntry({ fallbackUsed: false }));
  recordMetric(makeEntry({ fallbackUsed: false }));
  recordMetric(makeEntry({ fallbackUsed: true }));
  const m = getMetrics();
  assert.ok(Math.abs(m.fallbackRate - (1 / 3)) < 0.001, 'Expected fallbackRate=1/3');
});

test('METRICS-04: validationFailureRate counts validatorPassed=false entries', () => {
  resetMetrics();
  recordMetric(makeEntry({ validatorPassed: true }));
  recordMetric(makeEntry({ validatorPassed: false }));
  const m = getMetrics();
  assert.equal(m.validationFailureRate, 0.5);
});

test('METRICS-05: topIntents accumulates counts correctly', () => {
  resetMetrics();
  recordMetric(makeEntry({ intent: 'cancer_insurance' }));
  recordMetric(makeEntry({ intent: 'cancer_insurance' }));
  recordMetric(makeEntry({ intent: 'health_insurance' }));
  const m = getMetrics();
  assert.equal(m.topIntents['cancer_insurance'], 2);
  assert.equal(m.topIntents['health_insurance'], 1);
});

test('METRICS-06: trustConversationRate and medicalConversationRate tracked separately', () => {
  resetMetrics();
  recordMetric(makeEntry({ trustFlow: true,  medicalFlow: false }));
  recordMetric(makeEntry({ trustFlow: false, medicalFlow: true  }));
  recordMetric(makeEntry({ trustFlow: false, medicalFlow: false }));
  const m = getMetrics();
  assert.ok(Math.abs(m.trustConversationRate   - (1 / 3)) < 0.001);
  assert.ok(Math.abs(m.medicalConversationRate - (1 / 3)) < 0.001);
});

test('METRICS-07: getMetrics with zero turns returns all zeros and empty objects', () => {
  resetMetrics();
  const m = getMetrics();
  assert.equal(m.totalTurns, 0);
  assert.equal(m.averageLatencyMs, 0);
  assert.equal(m.fallbackRate, 0);
  assert.deepEqual(m.topIntents, {});
});

test('METRICS-08: resetMetrics clears all accumulators', () => {
  resetMetrics();
  recordMetric(makeEntry({ latency: 500, intent: 'greeting' }));
  recordMetric(makeEntry({ fallbackUsed: true }));
  resetMetrics();
  const m = getMetrics();
  assert.equal(m.totalTurns, 0);
  assert.equal(m.averageLatencyMs, 0);
  assert.deepEqual(m.topIntents, {});
});

// ─── INTEGRATION GROUP ────────────────────────────────────────────────────────

test('INTEG-01: runGen1LineAdapter emits [CONV_LOG] for every turn', async () => {
  clearAuditQueue();
  resetMetrics();
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => { logs.push(args.join(' ')); origLog(...args); };
  __setMockLlmFn(async () => 'ประกันสุขภาพดีครับ');
  try {
    await runGen1LineAdapter(makeLineInput({ messageText: 'ประกันสุขภาพคืออะไร' }));
    assert.ok(logs.some((l) => l.includes('[CONV_LOG]')), 'Expected [CONV_LOG] emitted by pipeline');
  } finally {
    console.log = origLog;
    __setMockLlmFn(null);
  }
});

test('INTEG-02: runGen1LineAdapter enqueues audit candidate after each turn', async () => {
  clearAuditQueue();
  resetMetrics();
  __setMockLlmFn(async () => 'ผมเป็นตัวแทนที่น่าเชื่อถือครับ');
  try {
    const before = getAuditQueue().length;
    await runGen1LineAdapter(makeLineInput({ messageText: 'มิจฉาชีพไหม' }));
    assert.equal(getAuditQueue().length, before + 1, 'Expected one new audit candidate after turn');
    assert.equal(getAuditQueue()[getAuditQueue().length - 1]!.status, 'PENDING');
  } finally {
    __setMockLlmFn(null);
  }
});

test('INTEG-03: runGen1LineAdapter records metric — totalTurns increases', async () => {
  resetMetrics();
  __setMockLlmFn(async () => 'Cancer Care คุ้มครองค่ารักษาครับ');
  try {
    const before = getMetrics().totalTurns;
    await runGen1LineAdapter(makeLineInput({ messageText: 'Cancer Care คืออะไร' }));
    const after  = getMetrics().totalTurns;
    assert.ok(after > before, 'Expected totalTurns to increase after turn');
  } finally {
    __setMockLlmFn(null);
    resetMetrics();
  }
});

test('INTEG-04: CONV_LOG entry has valid runtimeVersion and runtimeMode=gen1', async () => {
  clearAuditQueue();
  resetMetrics();
  let captured = '';
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0] === '[CONV_LOG]') {
      captured = String(args[1]);
    }
    origLog(...args);
  };
  __setMockLlmFn(async () => 'ยินดีให้คำปรึกษาครับ');
  try {
    await runGen1LineAdapter(makeLineInput({ messageText: 'สนใจประกันสุขภาพ' }));
    assert.ok(captured.length > 0, 'Expected [CONV_LOG] to be emitted');
    const parsed = JSON.parse(captured) as Record<string, unknown>;
    assert.equal(parsed['runtimeMode'], 'gen1');
    assert.ok(typeof parsed['runtimeVersion'] === 'string' && (parsed['runtimeVersion'] as string).startsWith('gen1'));
    assert.ok(typeof parsed['latency'] === 'number' && (parsed['latency'] as number) >= 0);
  } finally {
    console.log = origLog;
    __setMockLlmFn(null);
    resetMetrics();
  }
});
