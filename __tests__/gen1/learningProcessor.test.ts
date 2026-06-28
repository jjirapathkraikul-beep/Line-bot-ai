// Learning Processor Tests — Phase 12.0A
// Groups: CLASSIFY (7), SEVERITY (8), PROCESSOR (7), KV_ISSUE (8), REPORT (5), COMPAT (4) = 39 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  classifyIssueCategory,
  assignSeverity,
  shouldCreateIssue,
  processAuditRecord,
  runLearningProcessor,
  type LearningIssueCategory,
} from '../../runtime-gen1/learning/learningProcessor';

import {
  generateLearningReport,
  getIssueById,
  getOpenIssues,
  getIssuesByCategory,
  getIssuesBySeverity,
  getRecentIssues,
} from '../../runtime-gen1/learning/learningReport';

import {
  createIssue,
  getIssues,
  getIssueById as getIssueByIdSync,
  updateIssue,
  clearIssues,
  ISSUE_TTL_SECONDS,
} from '../../runtime-gen1/observability/issueDatabase';

import {
  enqueueAudit,
  clearAuditQueue,
  markAuditProcessedInKv,
  type AuditCandidate,
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
      _lists.set(key, [...values, ...existing]);
      return existing.length + values.length;
    },
    async lrange(key, start, stop) {
      const list = _lists.get(key) ?? [];
      const end  = stop < 0 ? list.length : stop + 1;
      return list.slice(start, end);
    },
    async expire(key, seconds) {
      _ttls.set(key, seconds);
      return 1;
    },
  };
}

// ─── Audit stub ───────────────────────────────────────────────────────────────

function makeAudit(overrides: Partial<AuditCandidate> = {}): AuditCandidate {
  return {
    conversationId:  'conv-Utest001-2026-06-29',
    sessionId:       'ctx-test-0001',
    timestamp:       '2026-06-29T10:00:00.000Z',
    intent:          'product_health',
    decision:        'ACT-03',
    strategy:        'EDUCATE_THEN_DISCOVER',
    fallbackUsed:    false,
    validatorPassed: true,
    questionCount:   1,
    latency:         250,
    status:          'PENDING',
    ...overrides,
  };
}

// ─── CLASSIFY GROUP ──────────────────────────────────────────────────────────

test('CLASSIFY-01: fallbackUsed with generic intent → KNOWLEDGE', () => {
  const result = classifyIssueCategory(makeAudit({ fallbackUsed: true, intent: 'product_health' }));
  assert.equal(result, 'KNOWLEDGE');
});

test('CLASSIFY-02: medical intent → MEDICAL regardless of fallback', () => {
  const result = classifyIssueCategory(makeAudit({ intent: 'medical_disclosure', fallbackUsed: false }));
  assert.equal(result, 'MEDICAL');
});

test('CLASSIFY-03: trust_concern intent → TRUST', () => {
  const result = classifyIssueCategory(makeAudit({ intent: 'trust_concern' }));
  assert.equal(result, 'TRUST');
});

test('CLASSIFY-04: ESCALATE decision → HANDOFF', () => {
  const result = classifyIssueCategory(makeAudit({ decision: 'ESCALATE', intent: 'human_request' }));
  assert.equal(result, 'HANDOFF');
});

test('CLASSIFY-05: ACT-05 COLLECT_LEAD decision → COMMERCIAL', () => {
  const result = classifyIssueCategory(makeAudit({ decision: 'ACT-05', intent: 'buy_insurance' }));
  assert.equal(result, 'COMMERCIAL');
});

test('CLASSIFY-06: Thai scam keyword in intent → TRUST', () => {
  const result = classifyIssueCategory(makeAudit({ intent: 'หลอกลวงไหม' }));
  assert.equal(result, 'TRUST');
});

test('CLASSIFY-07: no keywords, no fallback → CONVERSATION', () => {
  const result = classifyIssueCategory(makeAudit({ intent: 'greeting', fallbackUsed: false }));
  assert.equal(result, 'CONVERSATION');
});

// ─── SEVERITY GROUP ──────────────────────────────────────────────────────────

test('SEVERITY-01: fallbackUsed AND !validatorPassed → P0', () => {
  const c = makeAudit({ fallbackUsed: true, validatorPassed: false });
  assert.equal(assignSeverity(c, 'KNOWLEDGE'), 'P0');
});

test('SEVERITY-02: MEDICAL category with fallback → P0', () => {
  const c = makeAudit({ fallbackUsed: true, validatorPassed: true });
  assert.equal(assignSeverity(c, 'MEDICAL'), 'P0');
});

test('SEVERITY-03: TRUST category with validator failure → P0', () => {
  const c = makeAudit({ fallbackUsed: false, validatorPassed: false });
  assert.equal(assignSeverity(c, 'TRUST'), 'P0');
});

test('SEVERITY-04: fallbackUsed only → P1', () => {
  const c = makeAudit({ fallbackUsed: true, validatorPassed: true });
  assert.equal(assignSeverity(c, 'KNOWLEDGE'), 'P1');
});

test('SEVERITY-05: !validatorPassed only → P1', () => {
  const c = makeAudit({ fallbackUsed: false, validatorPassed: false });
  assert.equal(assignSeverity(c, 'CONVERSATION'), 'P1');
});

test('SEVERITY-06: COMMERCIAL with no quality failure → P2', () => {
  const c = makeAudit({ fallbackUsed: false, validatorPassed: true });
  assert.equal(assignSeverity(c, 'COMMERCIAL'), 'P2');
});

test('SEVERITY-07: high latency (> 5000ms) with no other failure → P2', () => {
  const c = makeAudit({ fallbackUsed: false, validatorPassed: true, latency: 6000 });
  assert.equal(assignSeverity(c, 'CONVERSATION'), 'P2');
});

test('SEVERITY-08: all passing with non-sensitive category → P3', () => {
  const c = makeAudit({ fallbackUsed: false, validatorPassed: true, latency: 200 });
  assert.equal(assignSeverity(c, 'CONVERSATION'), 'P3');
});

// ─── PROCESSOR GROUP ─────────────────────────────────────────────────────────

test('PROCESSOR-01: shouldCreateIssue → false when both pass', () => {
  assert.equal(shouldCreateIssue(makeAudit({ fallbackUsed: false, validatorPassed: true })), false);
});

test('PROCESSOR-02: shouldCreateIssue → true when fallback used', () => {
  assert.equal(shouldCreateIssue(makeAudit({ fallbackUsed: true })), true);
});

test('PROCESSOR-03: shouldCreateIssue → true when validator failed', () => {
  assert.equal(shouldCreateIssue(makeAudit({ validatorPassed: false })), true);
});

test('PROCESSOR-04: processAuditRecord returns null for clean record', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const result = await processAuditRecord(makeAudit({ fallbackUsed: false, validatorPassed: true }));
  assert.equal(result, null);

  clearIssues();
  __setKvClientForTest(null);
});

test('PROCESSOR-05: processAuditRecord creates IssueRecord for fallback', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const issue = await processAuditRecord(makeAudit({
    fallbackUsed:    true,
    validatorPassed: true,
    intent:          'product_health',
  }));

  assert.ok(issue !== null);
  assert.equal(issue!.status, 'OPEN');
  assert.equal(issue!.category, 'KNOWLEDGE');
  assert.equal(issue!.severity, 'P1');
  assert.ok(issue!.issueId.startsWith('ISSUE-'));

  clearIssues();
  __setKvClientForTest(null);
});

test('PROCESSOR-06: runLearningProcessor returns ProcessingResult', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();
  clearAuditQueue();

  // Enqueue two audits: one with fallback (→ issue), one clean (→ skip)
  const auditWithFallback = makeAudit({ sessionId: 'ctx-lp-001', fallbackUsed: true });
  const auditClean        = makeAudit({ sessionId: 'ctx-lp-002', fallbackUsed: false, validatorPassed: true });

  // Persist both to KV directly (simulating what enqueueAudit does)
  await mockKv.set(`audit:byId:ctx-lp-001`, JSON.stringify(auditWithFallback));
  await mockKv.set(`audit:byId:ctx-lp-002`, JSON.stringify(auditClean));
  await mockKv.lpush('audit:status:PENDING', 'ctx-lp-002', 'ctx-lp-001');

  const result = await runLearningProcessor(10);

  assert.equal(result.processed, 2);
  assert.equal(result.issued, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.errors, 0);

  clearIssues();
  clearAuditQueue();
  __setKvClientForTest(null);
});

test('PROCESSOR-07: runLearningProcessor handles KV fetch error gracefully', async () => {
  const errorKv: KvMinimal = {
    async set()    { throw new Error('KV down'); },
    async get()    { throw new Error('KV down'); },
    async lpush()  { throw new Error('KV down'); },
    async lrange() { throw new Error('KV down'); },
    async expire() { throw new Error('KV down'); },
  };
  __setKvClientForTest(errorKv);
  clearIssues();

  const result = await runLearningProcessor(10);

  // Must return a valid result object even when KV fails entirely
  assert.equal(result.processed, 0);
  assert.equal(result.errors, 0);

  clearIssues();
  __setKvClientForTest(null);
});

// ─── KV_ISSUE GROUP ──────────────────────────────────────────────────────────

test('KV_ISSUE-01: ISSUE_TTL_SECONDS is 90 days', () => {
  assert.equal(ISSUE_TTL_SECONDS, 90 * 24 * 60 * 60);
});

test('KV_ISSUE-02: createIssue persists to KV (issue:byId)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const issue = createIssue({
    conversationId:   'conv-kv-test-001',
    category:         'KNOWLEDGE',
    severity:         'P1',
    expectedBehavior: 'Relevant answer',
    actualBehavior:   'Fallback returned',
    rootCause:        null,
    proposedFix:      null,
    owner:            null,
  });

  // Allow micro-task queue to flush KV write
  await new Promise((r) => setTimeout(r, 10));

  const raw = mockKv._store.get(`issue:byId:${issue.issueId}`);
  assert.ok(raw !== undefined, 'Expected issue to be persisted in KV');
  const persisted = JSON.parse(raw!) as { issueId: string };
  assert.equal(persisted.issueId, issue.issueId);

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-03: createIssue sets TTL on issue:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const issue = createIssue({
    conversationId: 'conv-ttl-test',
    category: 'CONVERSATION',
    severity: 'P2',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const ttl = mockKv._ttls.get(`issue:byId:${issue.issueId}`);
  assert.equal(ttl, ISSUE_TTL_SECONDS);

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-04: createIssue adds to issue:recent list', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const issue = createIssue({
    conversationId: 'conv-recent-test',
    category: 'TRUST', severity: 'P0',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const recent = mockKv._lists.get('issue:recent') ?? [];
  assert.ok(recent.includes(issue.issueId), 'Expected issueId in issue:recent list');

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-05: getIssueById (async) reads from KV', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const issue = createIssue({
    conversationId: 'conv-async-read',
    category: 'MEDICAL', severity: 'P0',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const found = await getIssueById(issue.issueId);
  assert.ok(found !== null);
  assert.equal(found!.issueId, issue.issueId);
  assert.equal(found!.severity, 'P0');

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-06: getOpenIssues returns open issues from KV', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const i1 = createIssue({
    conversationId: 'conv-open-1', category: 'KNOWLEDGE', severity: 'P1',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });
  const i2 = createIssue({
    conversationId: 'conv-open-2', category: 'CONVERSATION', severity: 'P2',
    expectedBehavior: 'a', actualBehavior: 'b',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const open = await getOpenIssues(10);
  const ids  = open.map((i) => i.issueId);
  assert.ok(ids.includes(i1.issueId));
  assert.ok(ids.includes(i2.issueId));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-07: getIssuesByCategory filters by category', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const knowledge = createIssue({
    conversationId: 'conv-cat-1', category: 'KNOWLEDGE', severity: 'P1',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });
  createIssue({
    conversationId: 'conv-cat-2', category: 'TRUST', severity: 'P0',
    expectedBehavior: 'a', actualBehavior: 'b',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const knowledgeIssues = await getIssuesByCategory('KNOWLEDGE', 10);
  assert.ok(knowledgeIssues.some((i) => i.issueId === knowledge.issueId));
  assert.ok(knowledgeIssues.every((i) => i.category === 'KNOWLEDGE'));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_ISSUE-08: getIssuesBySeverity filters by severity', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const p0Issue = createIssue({
    conversationId: 'conv-sev-p0', category: 'MEDICAL', severity: 'P0',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });
  createIssue({
    conversationId: 'conv-sev-p1', category: 'KNOWLEDGE', severity: 'P1',
    expectedBehavior: 'a', actualBehavior: 'b',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const p0Issues = await getIssuesBySeverity('P0', 10);
  assert.ok(p0Issues.some((i) => i.issueId === p0Issue.issueId));
  assert.ok(p0Issues.every((i) => i.severity === 'P0'));

  clearIssues();
  __setKvClientForTest(null);
});

// ─── REPORT GROUP ─────────────────────────────────────────────────────────────

test('REPORT-01: generateLearningReport returns valid structure', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generateLearningReport(30);

  assert.ok(report.generatedAt.length > 0);
  assert.equal(report.periodDays, 30);
  assert.ok(typeof report.openIssues === 'number');
  assert.ok(Array.isArray(report.recommendations));
  assert.ok(Array.isArray(report.topKnowledgeProblems));
  assert.ok(Array.isArray(report.topMemoryProblems));
  assert.ok(Array.isArray(report.recentIssues));

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-02: report includes P0 URGENT recommendation when P0 exists', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  createIssue({
    conversationId: 'conv-p0-rec', category: 'MEDICAL', severity: 'P0',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });

  await new Promise((r) => setTimeout(r, 10));

  const report = await generateLearningReport();
  const hasUrgent = report.recommendations.some((r) => r.startsWith('URGENT') || r.includes('P0'));
  assert.ok(hasUrgent, 'Expected URGENT recommendation for P0 issue');

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-03: report returns no-issues recommendation when no issues', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generateLearningReport();

  // No issues in KV → recommendations should contain the "no critical issues" message
  assert.ok(report.recommendations.length >= 1);
  assert.ok(report.recommendations.some((r) => r.includes('No critical') || r.includes('maintain')));

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-04: issuesBySeverity contains all severity levels', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generateLearningReport();

  assert.ok('P0' in report.issuesBySeverity);
  assert.ok('P1' in report.issuesBySeverity);
  assert.ok('P2' in report.issuesBySeverity);
  assert.ok('P3' in report.issuesBySeverity);

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-05: issuesByCategory contains all learning categories', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generateLearningReport();
  const cats   = Object.keys(report.issuesByCategory);

  for (const expected of ['KNOWLEDGE', 'MEMORY', 'COMMERCIAL', 'TRUST', 'MEDICAL', 'HANDOFF']) {
    assert.ok(cats.includes(expected), `Expected ${expected} in issuesByCategory`);
  }

  clearIssues();
  __setKvClientForTest(null);
});

// ─── COMPAT GROUP — backward compatibility of issueDatabase sync API ──────────

test('COMPAT-01: createIssue still returns sync IssueRecord', () => {
  clearIssues();
  const issue = createIssue({
    conversationId:   'conv-compat-01',
    category:         'conversation_flow',
    severity:         'P2',
    expectedBehavior: 'x',
    actualBehavior:   'y',
    rootCause:        null,
    proposedFix:      null,
    owner:            null,
  });
  assert.ok(issue.issueId.startsWith('ISSUE-'));
  assert.equal(issue.status, 'OPEN');
  assert.equal(issue.regressionTested, false);
  clearIssues();
});

test('COMPAT-02: getIssueById (sync) still works from in-memory', () => {
  clearIssues();
  const issue = createIssue({
    conversationId: 'conv-compat-02',
    category: 'trust_flow', severity: 'P0',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });
  const found = getIssueByIdSync(issue.issueId);
  assert.ok(found !== undefined);
  assert.equal(found!.issueId, issue.issueId);
  clearIssues();
});

test('COMPAT-03: updateIssue (sync) still updates in-memory record', () => {
  clearIssues();
  const issue = createIssue({
    conversationId: 'conv-compat-03',
    category: 'fallback_triggered', severity: 'P1',
    expectedBehavior: 'x', actualBehavior: 'y',
    rootCause: null, proposedFix: null, owner: null,
  });
  const updated = updateIssue(issue.issueId, { status: 'RESOLVED', owner: 'test-owner' });
  assert.equal(updated, true);
  const record = getIssueByIdSync(issue.issueId)!;
  assert.equal(record.status, 'RESOLVED');
  assert.equal(record.owner, 'test-owner');
  clearIssues();
});

test('COMPAT-04: getIssues returns all in-memory issues', () => {
  clearIssues();
  createIssue({ conversationId: 'c1', category: 'other', severity: 'P3', expectedBehavior: 'x', actualBehavior: 'y', rootCause: null, proposedFix: null, owner: null });
  createIssue({ conversationId: 'c2', category: 'latency', severity: 'P2', expectedBehavior: 'a', actualBehavior: 'b', rootCause: null, proposedFix: null, owner: null });
  assert.equal(getIssues().length, 2);
  clearIssues();
  assert.equal(getIssues().length, 0);
});
