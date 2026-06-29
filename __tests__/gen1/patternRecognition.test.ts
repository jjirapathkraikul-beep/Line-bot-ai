// Pattern Recognition Tests — Phase 12.0B
// Groups: TYPES (4), MAP (8), CONFIDENCE (5), ENGINE (9), KV_PATTERN (8), REPORT (6), COMPAT (3) = 43 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  mapCategoryToIntelligence,
  mapCategoryToPatternName,
  mapCategoryToOwner,
  calculateConfidence,
  derivePatternStatus,
  buildSeverityDistribution,
  runPatternRecognition,
  getPatternByIdFromKv,
  getRecentPatterns,
  getPatternsByCategory,
  getPatternsByIntelligence,
  getHighConfidencePatternsFromKv,
  PATTERN_TTL_SECONDS,
  OPERATIONAL_CATEGORIES,
  type OperationalCategory,
  type PatternRecord,
} from '../../runtime-gen1/learning/patternRecognition';

import {
  generatePatternReport,
  getPatternById,
  getPatterns,
  getHighConfidencePatterns,
} from '../../runtime-gen1/learning/patternReport';

import {
  createIssue,
  clearIssues,
  type IssueRecord,
} from '../../runtime-gen1/observability/issueDatabase';

import {
  __setKvClientForTest,
  type KvMinimal,
} from '../../runtime-gen1/observability/kvClient';

// ─── Mock KV ──────────────────────────────────────────────────────────────────

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
    async get(key)                    { return _store.get(key) ?? null; },
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
    async expire(key, seconds) { _ttls.set(key, seconds); return 1; },
  };
}

// ─── Issue stub helpers ───────────────────────────────────────────────────────

function makeIssueRecord(overrides: Partial<IssueRecord> = {}): IssueRecord {
  const now = new Date().toISOString();
  return {
    issueId:          'ISSUE-0001',
    conversationId:   'conv-test-001',
    category:         'KNOWLEDGE',
    severity:         'P1',
    expectedBehavior: 'Relevant answer',
    actualBehavior:   'Fallback returned',
    rootCause:        null,
    proposedFix:      null,
    status:           'OPEN',
    owner:            null,
    regressionTested: false,
    createdAt:        now,
    updatedAt:        now,
    ...overrides,
  };
}

// Seed KV with issues for a given category
function seedIssues(kv: MockKv, category: OperationalCategory, count: number): IssueRecord[] {
  const issues: IssueRecord[] = [];
  for (let i = 1; i <= count; i++) {
    const id  = `ISSUE-${String(i).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const issue: IssueRecord = makeIssueRecord({ issueId: id, category, conversationId: `conv-${category}-${i}` });
    kv._store.set(`issue:byId:${id}`, JSON.stringify(issue));
    const existing = kv._lists.get(`issue:category:${category}`) ?? [];
    kv._lists.set(`issue:category:${category}`, [id, ...existing]);
    issues.push(issue);
  }
  return issues;
}

// ─── TYPES GROUP ──────────────────────────────────────────────────────────────

test('TYPES-01: PATTERN_TTL_SECONDS is 180 days', () => {
  assert.equal(PATTERN_TTL_SECONDS, 180 * 24 * 60 * 60);
});

test('TYPES-02: OPERATIONAL_CATEGORIES has exactly 8 entries', () => {
  assert.equal(OPERATIONAL_CATEGORIES.length, 8);
  assert.ok(OPERATIONAL_CATEGORIES.includes('MEMORY'));
  assert.ok(OPERATIONAL_CATEGORIES.includes('HANDOFF'));
});

test('TYPES-03: patternId format is PATTERN-{CATEGORY}-001', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEMORY', 1);
  await runPatternRecognition(10);

  const ids = mockKv._lists.get('pattern:recent') ?? [];
  assert.ok(ids.includes('PATTERN-MEMORY-001'), 'Expected PATTERN-MEMORY-001 in recent list');

  clearIssues();
  __setKvClientForTest(null);
});

test('TYPES-04: PatternRecord has all required schema fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'KNOWLEDGE', 3);
  await runPatternRecognition(10);

  const raw = mockKv._store.get('pattern:byId:PATTERN-KNOWLEDGE-001');
  assert.ok(raw, 'Expected pattern record in KV');
  const pattern = JSON.parse(raw!) as PatternRecord;

  assert.ok('patternId' in pattern);
  assert.ok('patternName' in pattern);
  assert.ok('operationalCategory' in pattern);
  assert.ok('affectedIntelligence' in pattern);
  assert.ok('issueCount' in pattern);
  assert.ok('confidence' in pattern);
  assert.ok('severityDistribution' in pattern);
  assert.ok('firstSeen' in pattern);
  assert.ok('lastSeen' in pattern);
  assert.ok('relatedIssueIds' in pattern);
  assert.ok('suggestedOwner' in pattern);
  assert.ok('status' in pattern);
  assert.ok('createdAt' in pattern);
  assert.ok('updatedAt' in pattern);

  clearIssues();
  __setKvClientForTest(null);
});

// ─── MAP GROUP ────────────────────────────────────────────────────────────────

test('MAP-01: MEMORY → Customer Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('MEMORY'), 'Customer Intelligence');
});

test('MAP-02: KNOWLEDGE → Product Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('KNOWLEDGE'), 'Product Intelligence');
});

test('MAP-03: COMMERCIAL → Commercial Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('COMMERCIAL'), 'Commercial Intelligence');
});

test('MAP-04: CONVERSATION → Conversation Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('CONVERSATION'), 'Conversation Intelligence');
});

test('MAP-05: PRODUCT → Product Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('PRODUCT'), 'Product Intelligence');
});

test('MAP-06: TRUST → Conversation Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('TRUST'), 'Conversation Intelligence');
});

test('MAP-07: MEDICAL → Conversation Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('MEDICAL'), 'Conversation Intelligence');
});

test('MAP-08: HANDOFF → Advisor Intelligence', () => {
  assert.equal(mapCategoryToIntelligence('HANDOFF'), 'Advisor Intelligence');
});

// ─── CONFIDENCE GROUP ─────────────────────────────────────────────────────────

test('CONFIDENCE-01: 0 issues → LOW', () => {
  assert.equal(calculateConfidence(0), 'LOW');
});

test('CONFIDENCE-02: 1 issue → LOW', () => {
  assert.equal(calculateConfidence(1), 'LOW');
});

test('CONFIDENCE-03: 2 issues → LOW (boundary below 3)', () => {
  assert.equal(calculateConfidence(2), 'LOW');
});

test('CONFIDENCE-04: 3 issues → MEDIUM', () => {
  assert.equal(calculateConfidence(3), 'MEDIUM');
});

test('CONFIDENCE-05: 9 issues → MEDIUM (boundary below 10)', () => {
  assert.equal(calculateConfidence(9), 'MEDIUM');
});

test('CONFIDENCE-06: 10 issues → HIGH', () => {
  assert.equal(calculateConfidence(10), 'HIGH');
});

test('CONFIDENCE-07: 50 issues → HIGH', () => {
  assert.equal(calculateConfidence(50), 'HIGH');
});

test('CONFIDENCE-08: derivePatternStatus(1) → EMERGING', () => {
  assert.equal(derivePatternStatus(1), 'EMERGING');
});

test('CONFIDENCE-09: derivePatternStatus(2+) → ACTIVE', () => {
  assert.equal(derivePatternStatus(2), 'ACTIVE');
  assert.equal(derivePatternStatus(10), 'ACTIVE');
});

// ─── ENGINE GROUP ─────────────────────────────────────────────────────────────

test('ENGINE-01: no issues → 0 patterns detected', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const result = await runPatternRecognition(10);

  assert.equal(result.scannedCategories, 8);
  assert.equal(result.patternsDetected, 0);
  assert.equal(result.errors, 0);

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-02: single KNOWLEDGE issue → 1 LOW pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'KNOWLEDGE', 1);

  const result = await runPatternRecognition(10);

  assert.equal(result.patternsDetected, 1);
  assert.equal(result.lowConfidence, 1);
  assert.equal(result.patternsCreated, 1);

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-03: 3 TRUST issues → 1 MEDIUM pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'TRUST', 3);

  const result = await runPatternRecognition(10);

  assert.equal(result.patternsDetected, 1);
  assert.equal(result.mediumConfidence, 1);

  const raw = mockKv._store.get('pattern:byId:PATTERN-TRUST-001');
  assert.ok(raw);
  const pattern = JSON.parse(raw!) as PatternRecord;
  assert.equal(pattern.confidence, 'MEDIUM');
  assert.equal(pattern.affectedIntelligence, 'Conversation Intelligence');

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-04: 10 MEMORY issues → 1 HIGH pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEMORY', 10);

  const result = await runPatternRecognition(50);

  assert.equal(result.highConfidence, 1);

  const pattern = JSON.parse(mockKv._store.get('pattern:byId:PATTERN-MEMORY-001')!) as PatternRecord;
  assert.equal(pattern.confidence, 'HIGH');
  assert.equal(pattern.affectedIntelligence, 'Customer Intelligence');
  assert.equal(pattern.issueCount, 10);

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-05: multiple categories → multiple patterns', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEMORY', 2);
  seedIssues(mockKv, 'KNOWLEDGE', 5);
  seedIssues(mockKv, 'COMMERCIAL', 1);

  const result = await runPatternRecognition(50);

  assert.equal(result.patternsDetected, 3);
  assert.equal(result.patternsCreated, 3);
  assert.equal(result.mediumConfidence, 1); // KNOWLEDGE = 5 → MEDIUM
  assert.equal(result.lowConfidence, 2);    // MEMORY = 2, COMMERCIAL = 1 → LOW

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-06: second run updates existing pattern (not creates new)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'HANDOFF', 2);
  const first = await runPatternRecognition(10);

  // Add more issues (simulate more audit processing)
  seedIssues(mockKv, 'HANDOFF', 3);
  const second = await runPatternRecognition(10);

  assert.equal(first.patternsCreated, 1);
  assert.equal(second.patternsCreated, 0);   // no new patterns
  assert.equal(second.patternsUpdated, 1);   // one updated

  // pattern:recent should only have PATTERN-HANDOFF-001 once
  const ids = mockKv._lists.get('pattern:recent') ?? [];
  const handoffIds = ids.filter((id) => id === 'PATTERN-HANDOFF-001');
  assert.equal(handoffIds.length, 1, 'Pattern ID should only appear once in index list');

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-07: pattern preserves createdAt across updates', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'PRODUCT', 1);
  await runPatternRecognition(10);

  const before = JSON.parse(mockKv._store.get('pattern:byId:PATTERN-PRODUCT-001')!) as PatternRecord;

  seedIssues(mockKv, 'PRODUCT', 2);
  await runPatternRecognition(10);

  const after = JSON.parse(mockKv._store.get('pattern:byId:PATTERN-PRODUCT-001')!) as PatternRecord;

  assert.equal(before.createdAt, after.createdAt, 'createdAt must not change on update');
  assert.ok(after.updatedAt >= before.updatedAt, 'updatedAt should be >= prior value');

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-08: pattern relatedIssueIds capped at 50', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'CONVERSATION', 60);
  await runPatternRecognition(200);

  const pattern = JSON.parse(mockKv._store.get('pattern:byId:PATTERN-CONVERSATION-001')!) as PatternRecord;
  assert.ok(pattern.relatedIssueIds.length <= 50, 'relatedIssueIds must be capped at 50');

  clearIssues();
  __setKvClientForTest(null);
});

test('ENGINE-09: engine handles KV error gracefully — returns error count', async () => {
  // issueDatabase swallows lrange errors (returns []), so KV failures during
  // issue reads never surface. Instead, we fail on pattern:byId reads (inside
  // upsertPattern) — that error propagates and is caught by runPatternRecognition.
  const issueRecord = makeIssueRecord({ issueId: 'ISSUE-0001', category: 'MEMORY' });

  const partialErrorKv: KvMinimal = {
    async get(key) {
      // Fail when the engine checks for an existing pattern — triggers error path
      if (key.startsWith('pattern:byId')) throw new Error('Pattern KV read failure');
      // Succeed for issue record lookups
      if (key === 'issue:byId:ISSUE-0001') return JSON.stringify(issueRecord);
      return null;
    },
    async set()   { return 'OK'; },
    async lpush() { return 1; },
    async lrange(key) {
      // Provide one MEMORY issue so upsertPattern is attempted
      if (key === 'issue:category:MEMORY') return ['ISSUE-0001'];
      return [];
    },
    async expire() { return 1; },
  };
  __setKvClientForTest(partialErrorKv);
  clearIssues();

  const result = await runPatternRecognition(10);

  assert.ok(result.errors >= 1, 'Expected at least 1 error when pattern:byId KV read fails');
  assert.equal(result.scannedCategories, 8);

  clearIssues();
  __setKvClientForTest(null);
});

// ─── KV_PATTERN GROUP ─────────────────────────────────────────────────────────

test('KV_PATTERN-01: pattern persisted to pattern:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEDICAL', 1);
  await runPatternRecognition(10);

  const raw = mockKv._store.get('pattern:byId:PATTERN-MEDICAL-001');
  assert.ok(raw, 'Expected pattern:byId:PATTERN-MEDICAL-001 in KV');

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-02: pattern:byId TTL is PATTERN_TTL_SECONDS', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'TRUST', 1);
  await runPatternRecognition(10);

  const ttl = mockKv._ttls.get('pattern:byId:PATTERN-TRUST-001');
  assert.equal(ttl, PATTERN_TTL_SECONDS);

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-03: pattern:recent list includes patternId', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'COMMERCIAL', 2);
  await runPatternRecognition(10);

  const ids = mockKv._lists.get('pattern:recent') ?? [];
  assert.ok(ids.includes('PATTERN-COMMERCIAL-001'));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-04: pattern:category index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'HANDOFF', 1);
  await runPatternRecognition(10);

  const ids = mockKv._lists.get('pattern:category:HANDOFF') ?? [];
  assert.ok(ids.includes('PATTERN-HANDOFF-001'));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-05: pattern:intelligence index uses underscore key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEMORY', 2);
  await runPatternRecognition(10);

  const ids = mockKv._lists.get('pattern:intelligence:Customer_Intelligence') ?? [];
  assert.ok(ids.includes('PATTERN-MEMORY-001'));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-06: getPatternByIdFromKv reads from KV', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'PRODUCT', 4);
  await runPatternRecognition(10);

  const pattern = await getPatternByIdFromKv('PATTERN-PRODUCT-001');
  assert.ok(pattern !== null);
  assert.equal(pattern!.patternId, 'PATTERN-PRODUCT-001');
  assert.equal(pattern!.operationalCategory, 'PRODUCT');
  assert.equal(pattern!.affectedIntelligence, 'Product Intelligence');
  assert.equal(pattern!.confidence, 'MEDIUM');

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-07: getPatternsByCategory returns correct patterns', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'KNOWLEDGE', 5);
  seedIssues(mockKv, 'TRUST', 2);
  await runPatternRecognition(10);

  const knowledgePatterns = await getPatternsByCategory('KNOWLEDGE', 10);
  assert.ok(knowledgePatterns.some((p) => p.patternId === 'PATTERN-KNOWLEDGE-001'));
  assert.ok(knowledgePatterns.every((p) => p.operationalCategory === 'KNOWLEDGE'));

  clearIssues();
  __setKvClientForTest(null);
});

test('KV_PATTERN-08: getPatternsByIntelligence groups correctly', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  // TRUST and MEDICAL both map to Conversation Intelligence
  seedIssues(mockKv, 'TRUST', 2);
  seedIssues(mockKv, 'MEDICAL', 1);
  await runPatternRecognition(10);

  const convPatterns = await getPatternsByIntelligence('Conversation Intelligence', 10);
  const ids = convPatterns.map((p) => p.patternId);
  assert.ok(ids.includes('PATTERN-TRUST-001'));
  assert.ok(ids.includes('PATTERN-MEDICAL-001'));

  clearIssues();
  __setKvClientForTest(null);
});

// ─── REPORT GROUP ─────────────────────────────────────────────────────────────

test('REPORT-01: generatePatternReport returns valid structure', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generatePatternReport(30);

  assert.ok(report.generatedAt.length > 0);
  assert.equal(report.periodDays, 30);
  assert.ok(typeof report.totalPatterns === 'number');
  assert.ok(typeof report.highestFrequency === 'number');
  assert.ok(Array.isArray(report.topPatterns));
  assert.ok(Array.isArray(report.emergingPatterns));
  assert.ok(Array.isArray(report.resolvedPatterns));
  assert.ok(Array.isArray(report.recommendations));
  assert.ok(Array.isArray(report.affectedIntelligences));
  assert.ok('patternsByCategory' in report);

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-02: trend is ACCELERATING when HIGH confidence pattern exists', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'KNOWLEDGE', 10);
  await runPatternRecognition(50);

  const report = await generatePatternReport();
  assert.equal(report.trend, 'ACCELERATING');

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-03: trend is EMERGING when only EMERGING patterns exist', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEMORY', 1); // issueCount=1 → EMERGING
  await runPatternRecognition(10);

  const report = await generatePatternReport();
  assert.equal(report.trend, 'EMERGING');

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-04: HIGH-confidence pattern triggers CRITICAL recommendation', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'TRUST', 10);
  await runPatternRecognition(50);

  const report = await generatePatternReport();
  const hasCritical = report.recommendations.some((r) => r.startsWith('CRITICAL'));
  assert.ok(hasCritical, 'Expected CRITICAL recommendation for HIGH-confidence pattern');

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-05: patternsByCategory contains all 8 operational categories', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  const report = await generatePatternReport();
  const keys = Object.keys(report.patternsByCategory);

  for (const cat of ['MEMORY', 'KNOWLEDGE', 'COMMERCIAL', 'CONVERSATION', 'PRODUCT', 'TRUST', 'MEDICAL', 'HANDOFF']) {
    assert.ok(keys.includes(cat), `Expected ${cat} in patternsByCategory`);
  }

  clearIssues();
  __setKvClientForTest(null);
});

test('REPORT-06: getHighConfidencePatterns filters by confidence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);
  clearIssues();

  seedIssues(mockKv, 'MEDICAL', 10); // HIGH
  seedIssues(mockKv, 'MEMORY', 2);   // LOW
  await runPatternRecognition(50);

  const highConf = await getHighConfidencePatterns(10);
  assert.ok(highConf.every((p) => p.confidence === 'HIGH'));
  assert.ok(highConf.some((p) => p.operationalCategory === 'MEDICAL'));
  assert.ok(!highConf.some((p) => p.operationalCategory === 'MEMORY'));

  clearIssues();
  __setKvClientForTest(null);
});

// ─── COMPAT GROUP — ensure Phase 12.0A tests still work ──────────────────────

test('COMPAT-01: buildSeverityDistribution counts correctly', () => {
  const issues: IssueRecord[] = [
    makeIssueRecord({ severity: 'P0' }),
    makeIssueRecord({ severity: 'P0' }),
    makeIssueRecord({ severity: 'P1' }),
    makeIssueRecord({ severity: 'P3' }),
  ];
  const dist = buildSeverityDistribution(issues);
  assert.equal(dist.P0, 2);
  assert.equal(dist.P1, 1);
  assert.equal(dist.P2, 0);
  assert.equal(dist.P3, 1);
});

test('COMPAT-02: mapCategoryToPatternName returns non-empty string for all categories', () => {
  for (const cat of ['MEMORY', 'KNOWLEDGE', 'COMMERCIAL', 'CONVERSATION', 'PRODUCT', 'TRUST', 'MEDICAL', 'HANDOFF'] as OperationalCategory[]) {
    const name = mapCategoryToPatternName(cat);
    assert.ok(name.length > 0, `Expected non-empty name for ${cat}`);
  }
});

test('COMPAT-03: mapCategoryToOwner returns non-empty owner for all categories', () => {
  for (const cat of ['MEMORY', 'KNOWLEDGE', 'COMMERCIAL', 'CONVERSATION', 'PRODUCT', 'TRUST', 'MEDICAL', 'HANDOFF'] as OperationalCategory[]) {
    const owner = mapCategoryToOwner(cat);
    assert.ok(owner.length > 0, `Expected non-empty owner for ${cat}`);
    assert.ok(owner.includes('Team'), `Expected owner to include "Team" for ${cat}`);
  }
});
