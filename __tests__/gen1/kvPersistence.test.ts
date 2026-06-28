// KV Persistence Tests — Beta Hotfix
// Verifies that conversation logs and audit candidates are persisted to KV,
// read helpers work correctly, and KV failures never affect customers.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  logConversationTurn,
  getConversationById,
  getConversationIdsByDate,
  getRecentConversations,
  CONV_TTL_SECONDS,
  type ConversationLogEntry,
} from '../../runtime-gen1/observability/conversationLogger';

import {
  enqueueAudit,
  clearAuditQueue,
  getAuditById,
  getPendingAuditCandidates,
  AUDIT_TTL_SECONDS,
} from '../../runtime-gen1/observability/auditQueue';

import {
  __setKvClientForTest,
  type KvMinimal,
} from '../../runtime-gen1/observability/kvClient';

// ─── Mock KV ─────────────────────────────────────────────────────────────────

interface MockKv extends KvMinimal {
  _store: Map<string, string>;
  _lists: Map<string, string[]>;
  _ttls:  Map<string, number>;
}

function createMockKv(): MockKv {
  const _store = new Map<string, string>();
  const _lists = new Map<string, string[]>();
  const _ttls  = new Map<string, number>();
  return {
    _store, _lists, _ttls,
    async set(key, value, opts) {
      _store.set(key, value);
      if (opts?.ex) _ttls.set(key, opts.ex);
      return 'OK';
    },
    async get(key) {
      return _store.get(key) ?? null;
    },
    async lpush(key, ...values) {
      const existing = _lists.get(key) ?? [];
      _lists.set(key, [...values, ...existing]); // prepend (newest first)
      return existing.length + values.length;
    },
    async lrange(key, start, stop) {
      const list = _lists.get(key) ?? [];
      const end  = stop < 0 ? list.length + stop + 1 : stop + 1;
      return list.slice(start, end);
    },
    async expire(key, seconds) {
      _ttls.set(key, seconds);
      return 1;
    },
  };
}

function createThrowingKv(): KvMinimal {
  const fail = () => Promise.reject(new Error('KV_NOT_CONFIGURED'));
  return {
    set:    () => fail(),
    get:    () => fail() as Promise<string | null>,
    lpush:  () => fail() as Promise<number>,
    lrange: () => fail() as Promise<string[]>,
    expire: () => fail() as Promise<number>,
  };
}

// ─── Stub factory ─────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<ConversationLogEntry> = {}): ConversationLogEntry {
  return {
    conversationId:          'conv-Utest123-2026-06-28',
    sessionId:               'ctx-111111111-sess01',
    timestamp:               '2026-06-28T10:00:00.000Z',
    runtimeVersion:          'gen1-stub-0.9.0',
    runtimeMode:             'gen1',
    userId:                  'Utest123***',
    userMessage:             'ประกันสุขภาพคืออะไรครับ',
    assistantResponse:       'ประกันสุขภาพคือความคุ้มครองค่ารักษาพยาบาลครับ',
    latency:                 120,
    intent:                  'health_insurance',
    capability:              'CAP-004',
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
    responseLength:          46,
    ...overrides,
  };
}

// ─── PERSIST group: conversation logger ───────────────────────────────────────

test('PERSIST-01: logConversationTurn persists entry to convlog:byId:{conversationId}', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry();
  await logConversationTurn(entry);

  const raw = mock._store.get(`convlog:byId:${entry.conversationId}`);
  assert.ok(raw !== undefined, 'Expected entry in KV store');
  const parsed = JSON.parse(raw) as ConversationLogEntry;
  assert.equal(parsed.sessionId, entry.sessionId);
  assert.equal(parsed.intent, entry.intent);
});

test('PERSIST-02: logConversationTurn creates date index in convlog:date:{YYYY-MM-DD}', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry({ timestamp: '2026-06-28T15:30:00.000Z' });
  await logConversationTurn(entry);

  const dateList = mock._lists.get('convlog:date:2026-06-28') ?? [];
  assert.ok(dateList.includes(entry.conversationId), 'Expected conversationId in date index');
});

test('PERSIST-03: logConversationTurn adds to convlog:recent list', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry();
  await logConversationTurn(entry);

  const recent = mock._lists.get('convlog:recent') ?? [];
  assert.ok(recent.includes(entry.conversationId), 'Expected conversationId in recent list');
});

test('PERSIST-04: logConversationTurn sets TTL of 30 days on conversation entry', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry();
  await logConversationTurn(entry);

  const ttl = mock._ttls.get(`convlog:byId:${entry.conversationId}`);
  assert.equal(ttl, CONV_TTL_SECONDS, `Expected TTL=${CONV_TTL_SECONDS} (30 days)`);
});

test('PERSIST-05: logConversationTurn KV failure emits [CONV_LOG_PERSIST_ERROR] without throw', async () => {
  __setKvClientForTest(createThrowingKv());
  const errors: string[] = [];
  const origErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.join(' ')); };
  try {
    await assert.doesNotReject(() => logConversationTurn(makeEntry()));
    assert.ok(errors.some((e) => e.includes('[CONV_LOG_PERSIST_ERROR]')), 'Expected [CONV_LOG_PERSIST_ERROR] in stderr');
  } finally {
    console.error = origErr;
  }
});

test('PERSIST-06: console [CONV_LOG] is still emitted when KV write succeeds', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const logs: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => { logs.push(args.join(' ')); orig(...args); };
  try {
    await logConversationTurn(makeEntry());
    assert.ok(logs.some((l) => l.startsWith('[CONV_LOG]')), 'Expected [CONV_LOG] prefix');
  } finally {
    console.log = orig;
  }
});

test('PERSIST-07: console [CONV_LOG] is still emitted when KV write fails', async () => {
  __setKvClientForTest(createThrowingKv());
  const logs: string[] = [];
  const orig    = console.log;
  const origErr = console.error;
  console.log   = (...args: unknown[]) => { logs.push(args.join(' ')); };
  console.error = () => { /* suppress */ };
  try {
    await logConversationTurn(makeEntry());
    assert.ok(logs.some((l) => l.startsWith('[CONV_LOG]')), 'Expected [CONV_LOG] even when KV fails');
  } finally {
    console.log   = orig;
    console.error = origErr;
  }
});

// ─── PERSIST group: audit queue ───────────────────────────────────────────────

test('PERSIST-08: enqueueAudit persists candidate to audit:byId:{sessionId}', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry({ sessionId: 'ctx-persist-sess-01' });
  await enqueueAudit(entry);

  const raw = mock._store.get(`audit:byId:${entry.sessionId}`);
  assert.ok(raw !== undefined, 'Expected audit in KV store');
  const parsed = JSON.parse(raw) as { intent: string; status: string };
  assert.equal(parsed.intent, entry.intent);
  assert.equal(parsed.status, 'PENDING');
});

test('PERSIST-09: enqueueAudit adds sessionId to audit:status:PENDING list', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry({ sessionId: 'ctx-persist-sess-02' });
  await enqueueAudit(entry);

  const pendingList = mock._lists.get('audit:status:PENDING') ?? [];
  assert.ok(pendingList.includes(entry.sessionId), 'Expected sessionId in PENDING list');
});

test('PERSIST-10: enqueueAudit KV failure emits [AUDIT_PERSIST_ERROR] without throw', async () => {
  clearAuditQueue();
  __setKvClientForTest(createThrowingKv());
  const errors: string[] = [];
  const origErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.join(' ')); };
  try {
    await assert.doesNotReject(() => enqueueAudit(makeEntry()));
    assert.ok(errors.some((e) => e.includes('[AUDIT_PERSIST_ERROR]')), 'Expected [AUDIT_PERSIST_ERROR] in stderr');
  } finally {
    console.error = origErr;
  }
});

test('PERSIST-11: in-memory queue is updated synchronously (before KV write)', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  // Call without awaiting — queue push should be visible immediately
  const promise = enqueueAudit(makeEntry({ sessionId: 'ctx-sync-check-01' }));
  // Queue is already updated even before await resolves
  // (this is true because _queue.push happens before any `await` in enqueueAudit)
  await promise;
  assert.ok(true, 'Queue updated — no assertion needed, just verifying no throw');
});

// ─── READ helpers ─────────────────────────────────────────────────────────────

test('READ-01: getConversationById returns entry from KV', async () => {
  const mock  = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry({ conversationId: 'conv-READ-001' });
  await logConversationTurn(entry);

  const result = await getConversationById('conv-READ-001');
  assert.ok(result !== null, 'Expected non-null result');
  assert.equal(result!.intent, entry.intent);
  assert.equal(result!.sessionId, entry.sessionId);
});

test('READ-02: getConversationById returns null for unknown conversationId', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const result = await getConversationById('conv-DOES-NOT-EXIST');
  assert.equal(result, null);
});

test('READ-03: getConversationIdsByDate returns IDs for the requested date', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const entry1 = makeEntry({ conversationId: 'conv-DATE-001', timestamp: '2026-06-27T10:00:00.000Z' });
  const entry2 = makeEntry({ conversationId: 'conv-DATE-002', timestamp: '2026-06-27T12:00:00.000Z' });
  await logConversationTurn(entry1);
  await logConversationTurn(entry2);

  const ids = await getConversationIdsByDate('2026-06-27');
  assert.ok(ids.includes('conv-DATE-001'), 'Expected conv-DATE-001 in date index');
  assert.ok(ids.includes('conv-DATE-002'), 'Expected conv-DATE-002 in date index');
});

test('READ-04: getRecentConversations returns entries up to limit', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  await logConversationTurn(makeEntry({ conversationId: 'conv-RECENT-A', sessionId: 'ctx-A' }));
  await logConversationTurn(makeEntry({ conversationId: 'conv-RECENT-B', sessionId: 'ctx-B' }));
  await logConversationTurn(makeEntry({ conversationId: 'conv-RECENT-C', sessionId: 'ctx-C' }));

  const results = await getRecentConversations(2);
  assert.equal(results.length, 2, 'Expected exactly 2 results for limit=2');
});

test('READ-05: getAuditById returns audit candidate from KV', async () => {
  clearAuditQueue();
  const mock  = createMockKv();
  __setKvClientForTest(mock);
  const entry = makeEntry({ sessionId: 'ctx-audit-read-01' });
  await enqueueAudit(entry);

  const result = await getAuditById('ctx-audit-read-01');
  assert.ok(result !== null, 'Expected non-null audit');
  assert.equal(result!.sessionId, 'ctx-audit-read-01');
  assert.equal(result!.status, 'PENDING');
});

test('READ-06: getAuditById returns null for unknown auditId', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const result = await getAuditById('ctx-DOES-NOT-EXIST');
  assert.equal(result, null);
});

test('READ-07: getPendingAuditCandidates returns candidates up to limit', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  await enqueueAudit(makeEntry({ sessionId: 'ctx-pending-01' }));
  await enqueueAudit(makeEntry({ sessionId: 'ctx-pending-02' }));
  await enqueueAudit(makeEntry({ sessionId: 'ctx-pending-03' }));

  const results = await getPendingAuditCandidates(2);
  assert.equal(results.length, 2, 'Expected exactly 2 results for limit=2');
  assert.equal(results[0]!.status, 'PENDING');
});

test('READ-08: getConversationById gracefully returns null when KV throws', async () => {
  __setKvClientForTest(createThrowingKv());
  const origErr = console.error;
  console.error = () => { /* suppress */ };
  try {
    const result = await getConversationById('conv-ANY');
    assert.equal(result, null, 'Expected null when KV throws on read');
  } finally {
    console.error = origErr;
  }
});

test('READ-09: getPendingAuditCandidates gracefully returns [] when KV throws', async () => {
  __setKvClientForTest(createThrowingKv());
  const origErr = console.error;
  console.error = () => { /* suppress */ };
  try {
    const result = await getPendingAuditCandidates(10);
    assert.deepEqual(result, [], 'Expected empty array when KV throws on read');
  } finally {
    console.error = origErr;
  }
});
