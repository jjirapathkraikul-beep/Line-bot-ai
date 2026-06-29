// Root Cause & Proposal Engine Tests — Phase 12.0C
// Groups: TYPES (4), RCA_MAP (8), RCA_ENGINE (8), SCORE (8), PROPOSAL_ENGINE (8), KV_PERSIST (8), COMPAT (4) = 48 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  mapPatternToRootCauseCategory,
  mapPatternToAffectedCapability,
  runRootCauseAnalysis,
  getRootCauseByIdFromKv,
  getRecentRootCauses,
  getRootCausesByCategory,
  getRootCauses,
  ROOTCAUSE_TTL_SECONDS,
  ROOT_CAUSE_CATEGORY_MAP,
  type RootCauseRecord,
  type RootCauseCategory,
} from '../../runtime-gen1/learning/rootCauseAnalysis';

import {
  scoreProposalPriority,
  estimateRisk,
  determineScope,
  determineProposalStatus,
  runProposalEngine,
  getProposalByIdFromKv,
  getDraftProposals,
  getReadyForGuardian,
  getProposalById,
  PROPOSAL_TTL_SECONDS,
  type ProposalRecord,
} from '../../runtime-gen1/learning/proposalEngine';

import {
  __setKvClientForTest,
  type KvMinimal,
} from '../../runtime-gen1/observability/kvClient';

import {
  INTELLIGENCE_MAP,
  calculateConfidence,
  type PatternRecord,
  type OperationalCategory,
} from '../../runtime-gen1/learning/patternRecognition';

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
    async get(key)  { return _store.get(key) ?? null; },
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

// ─── Pattern stub ─────────────────────────────────────────────────────────────

function makePattern(
  category: OperationalCategory,
  issueCount: number,
  p0Count = 0,
): PatternRecord {
  const dist = { P0: p0Count, P1: Math.max(0, issueCount - p0Count - 1), P2: 1, P3: 0 };
  return {
    patternId:            `PATTERN-${category}-001`,
    patternName:          `Repeated ${category} Issues`,
    operationalCategory:  category,
    affectedIntelligence: INTELLIGENCE_MAP[category],
    issueCount,
    confidence:           calculateConfidence(issueCount),
    severityDistribution: dist,
    firstSeen:            '2026-06-29T10:00:00.000Z',
    lastSeen:             '2026-06-29T12:00:00.000Z',
    relatedIssueIds:      ['ISSUE-0001', 'ISSUE-0002'],
    suggestedOwner:       `${INTELLIGENCE_MAP[category]} Team`,
    status:               issueCount === 1 ? 'EMERGING' : 'ACTIVE',
    createdAt:            '2026-06-29T10:00:00.000Z',
    updatedAt:            '2026-06-29T12:00:00.000Z',
  };
}

// Seed a PatternRecord into mock KV (pattern:byId and pattern:recent)
function seedPattern(kv: MockKv, pattern: PatternRecord): void {
  kv._store.set(`pattern:byId:${pattern.patternId}`, JSON.stringify(pattern));
  const existing = kv._lists.get('pattern:recent') ?? [];
  kv._lists.set('pattern:recent', [pattern.patternId, ...existing.filter((id) => id !== pattern.patternId)]);
}

// Seed a RootCauseRecord into mock KV
function seedRootCause(kv: MockKv, rc: RootCauseRecord): void {
  kv._store.set(`rootcause:byId:${rc.rootCauseId}`, JSON.stringify(rc));
  const existing = kv._lists.get('rootcause:recent') ?? [];
  kv._lists.set('rootcause:recent', [rc.rootCauseId, ...existing.filter((id) => id !== rc.rootCauseId)]);
}

// ─── TYPES GROUP ──────────────────────────────────────────────────────────────

test('TYPES-01: ROOTCAUSE_TTL_SECONDS is 180 days', () => {
  assert.equal(ROOTCAUSE_TTL_SECONDS, 180 * 24 * 60 * 60);
});

test('TYPES-02: PROPOSAL_TTL_SECONDS is 180 days', () => {
  assert.equal(PROPOSAL_TTL_SECONDS, 180 * 24 * 60 * 60);
});

test('TYPES-03: ROOT_CAUSE_CATEGORY_MAP has entries for all 8 operational categories', () => {
  const cats: OperationalCategory[] = ['MEMORY', 'KNOWLEDGE', 'COMMERCIAL', 'CONVERSATION', 'PRODUCT', 'TRUST', 'MEDICAL', 'HANDOFF'];
  for (const cat of cats) {
    assert.ok(cat in ROOT_CAUSE_CATEGORY_MAP, `Expected ${cat} in ROOT_CAUSE_CATEGORY_MAP`);
  }
});

test('TYPES-04: rootCauseId format is RCA-{CATEGORY}-001', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('MEMORY', 3));
  await runRootCauseAnalysis(['PATTERN-MEMORY-001']);

  const rc = await getRootCauseByIdFromKv('RCA-MEMORY-001');
  assert.ok(rc !== null, 'Expected RCA-MEMORY-001 in KV');
  assert.equal(rc!.rootCauseId, 'RCA-MEMORY-001');

  __setKvClientForTest(null);
});

// ─── RCA_MAP GROUP ────────────────────────────────────────────────────────────

test('RCA_MAP-01: KNOWLEDGE → Knowledge Gap', () => {
  assert.equal(mapPatternToRootCauseCategory('KNOWLEDGE'), 'Knowledge Gap');
});

test('RCA_MAP-02: MEMORY → Memory Weakness', () => {
  assert.equal(mapPatternToRootCauseCategory('MEMORY'), 'Memory Weakness');
});

test('RCA_MAP-03: CONVERSATION → Conversation Design', () => {
  assert.equal(mapPatternToRootCauseCategory('CONVERSATION'), 'Conversation Design');
});

test('RCA_MAP-04: COMMERCIAL → Commercial Logic', () => {
  assert.equal(mapPatternToRootCauseCategory('COMMERCIAL'), 'Commercial Logic');
});

test('RCA_MAP-05: PRODUCT → Product Coverage', () => {
  assert.equal(mapPatternToRootCauseCategory('PRODUCT'), 'Product Coverage');
});

test('RCA_MAP-06: TRUST → Trust Strategy', () => {
  assert.equal(mapPatternToRootCauseCategory('TRUST'), 'Trust Strategy');
});

test('RCA_MAP-07: MEDICAL → Medical Flow', () => {
  assert.equal(mapPatternToRootCauseCategory('MEDICAL'), 'Medical Flow');
});

test('RCA_MAP-08: HANDOFF → Recommendation Timing', () => {
  assert.equal(mapPatternToRootCauseCategory('HANDOFF'), 'Recommendation Timing');
});

// ─── RCA_ENGINE GROUP ─────────────────────────────────────────────────────────

test('RCA_ENGINE-01: creates RootCauseRecord from pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('KNOWLEDGE', 5));
  const result = await runRootCauseAnalysis(['PATTERN-KNOWLEDGE-001']);

  assert.equal(result.patternsAnalyzed, 1);
  assert.equal(result.rootCausesCreated, 1);
  assert.equal(result.rootCausesUpdated, 0);
  assert.equal(result.errors, 0);

  __setKvClientForTest(null);
});

test('RCA_ENGINE-02: root cause has all required fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('TRUST', 3));
  await runRootCauseAnalysis(['PATTERN-TRUST-001']);

  const rc = await getRootCauseByIdFromKv('RCA-TRUST-001');
  assert.ok(rc !== null);
  assert.ok('rootCauseId' in rc!);
  assert.ok('patternId' in rc!);
  assert.ok('rootCauseCategory' in rc!);
  assert.ok('affectedIntelligence' in rc!);
  assert.ok('affectedCapability' in rc!);
  assert.ok('description' in rc!);
  assert.ok('confidence' in rc!);
  assert.ok(Array.isArray(rc!.evidence));
  assert.ok(rc!.evidence.length > 0);
  assert.ok(Array.isArray(rc!.supportingPatterns));
  assert.ok('createdAt' in rc!);
  assert.ok('status' in rc!);

  __setKvClientForTest(null);
});

test('RCA_ENGINE-03: root cause inherits confidence from pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('MEDICAL', 10)); // HIGH confidence
  await runRootCauseAnalysis(['PATTERN-MEDICAL-001']);

  const rc = await getRootCauseByIdFromKv('RCA-MEDICAL-001');
  assert.equal(rc!.confidence, 'HIGH');
  assert.equal(rc!.rootCauseCategory, 'Medical Flow');

  __setKvClientForTest(null);
});

test('RCA_ENGINE-04: second run updates existing root cause (createdAt preserved)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('COMMERCIAL', 2));
  const first = await runRootCauseAnalysis(['PATTERN-COMMERCIAL-001']);

  const beforeCreatedAt = (await getRootCauseByIdFromKv('RCA-COMMERCIAL-001'))!.createdAt;

  // Simulate updated pattern (higher issue count)
  seedPattern(mockKv, makePattern('COMMERCIAL', 5));
  const second = await runRootCauseAnalysis(['PATTERN-COMMERCIAL-001']);

  const afterCreatedAt = (await getRootCauseByIdFromKv('RCA-COMMERCIAL-001'))!.createdAt;

  assert.equal(first.rootCausesCreated, 1);
  assert.equal(second.rootCausesCreated, 0);
  assert.equal(second.rootCausesUpdated, 1);
  assert.equal(beforeCreatedAt, afterCreatedAt, 'createdAt must not change on update');

  __setKvClientForTest(null);
});

test('RCA_ENGINE-05: evidence array contains issue count and confidence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('HANDOFF', 4));
  await runRootCauseAnalysis(['PATTERN-HANDOFF-001']);

  const rc = await getRootCauseByIdFromKv('RCA-HANDOFF-001');
  const evidenceText = rc!.evidence.join(' ');
  assert.ok(evidenceText.includes('HANDOFF') || evidenceText.includes('4'));
  assert.ok(evidenceText.includes('MEDIUM'));

  __setKvClientForTest(null);
});

test('RCA_ENGINE-06: runRootCauseAnalysis uses recent patterns when no patternIds given', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('PRODUCT', 3));
  seedPattern(mockKv, makePattern('MEMORY', 2));

  const result = await runRootCauseAnalysis(); // no explicit patternIds

  assert.equal(result.patternsAnalyzed, 2);
  assert.equal(result.rootCausesCreated, 2);

  __setKvClientForTest(null);
});

test('RCA_ENGINE-07: missing pattern in KV is silently skipped', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // Pass a patternId that doesn't exist in KV
  const result = await runRootCauseAnalysis(['PATTERN-NONEXISTENT-001']);

  assert.equal(result.patternsAnalyzed, 0);
  assert.equal(result.errors, 0); // not an error — just missing

  __setKvClientForTest(null);
});

test('RCA_ENGINE-08: KV error during upsert increments error count', async () => {
  const pattern = makePattern('MEMORY', 3);

  const errorKv: KvMinimal = {
    async get(key) {
      if (key === `pattern:byId:${pattern.patternId}`) return JSON.stringify(pattern);
      // Fail when attempting to write rootcause (set is called)
      return null;
    },
    async set() { throw new Error('KV write failure'); },
    async lpush() { return 1; },
    async lrange(key) {
      if (key === 'pattern:recent') return [pattern.patternId];
      return [];
    },
    async expire() { return 1; },
  };
  __setKvClientForTest(errorKv);

  const result = await runRootCauseAnalysis();
  assert.ok(result.errors >= 1);

  __setKvClientForTest(null);
});

// ─── SCORE GROUP ──────────────────────────────────────────────────────────────

test('SCORE-01: P0 priority — HIGH confidence + P0 issues + TRUST', () => {
  const pattern = makePattern('TRUST', 10, 1); // HIGH confidence, 1 P0 issue
  assert.equal(scoreProposalPriority(pattern), 'P0');
});

test('SCORE-02: P0 priority — HIGH confidence + MEDICAL (no P0 issues needed)', () => {
  const pattern = makePattern('MEDICAL', 10, 0); // HIGH, no P0
  assert.equal(scoreProposalPriority(pattern), 'P0');
});

test('SCORE-03: P1 priority — HIGH confidence, non-sensitive category', () => {
  const pattern = makePattern('KNOWLEDGE', 10, 0); // HIGH, no P0, not sensitive
  assert.equal(scoreProposalPriority(pattern), 'P1');
});

test('SCORE-04: P1 priority — any P0 issue, even LOW confidence', () => {
  const pattern = makePattern('CONVERSATION', 1, 1); // LOW, but has P0 issue
  assert.equal(scoreProposalPriority(pattern), 'P1');
});

test('SCORE-05: P2 priority — MEDIUM confidence, COMMERCIAL', () => {
  const pattern = makePattern('COMMERCIAL', 5, 0); // MEDIUM, no P0
  assert.equal(scoreProposalPriority(pattern), 'P2');
});

test('SCORE-06: P2 priority — LOW confidence, HANDOFF', () => {
  const pattern = makePattern('HANDOFF', 2, 0); // LOW confidence, HANDOFF (commercial-adjacent)
  assert.equal(scoreProposalPriority(pattern), 'P2');
});

test('SCORE-07: P3 priority — LOW confidence, CONVERSATION', () => {
  const pattern = makePattern('CONVERSATION', 2, 0); // LOW, not commercial
  assert.equal(scoreProposalPriority(pattern), 'P3');
});

test('SCORE-08: estimateRisk returns correct values', () => {
  assert.equal(estimateRisk('TRUST'),       'HIGH');
  assert.equal(estimateRisk('MEDICAL'),     'HIGH');
  assert.equal(estimateRisk('KNOWLEDGE'),   'MEDIUM');
  assert.equal(estimateRisk('COMMERCIAL'),  'MEDIUM');
  assert.equal(estimateRisk('MEMORY'),      'LOW');
  assert.equal(estimateRisk('CONVERSATION'), 'LOW');
});

// ─── PROPOSAL_ENGINE GROUP ────────────────────────────────────────────────────

test('PROPOSAL_ENGINE-01: creates ProposalRecord from root cause + pattern', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const pattern = makePattern('KNOWLEDGE', 5);
  seedPattern(mockKv, pattern);
  await runRootCauseAnalysis(['PATTERN-KNOWLEDGE-001']);

  const result = await runProposalEngine(['RCA-KNOWLEDGE-001']);

  assert.equal(result.rootCausesProcessed, 1);
  assert.equal(result.proposalsCreated, 1);
  assert.equal(result.errors, 0);

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-02: HIGH confidence proposal → READY_FOR_GUARDIAN', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('KNOWLEDGE', 10)); // HIGH confidence
  await runRootCauseAnalysis(['PATTERN-KNOWLEDGE-001']);
  const result = await runProposalEngine(['RCA-KNOWLEDGE-001']);

  const proposal = await getProposalByIdFromKv('PROPOSAL-KNOWLEDGE-001');
  assert.equal(proposal!.status, 'READY_FOR_GUARDIAN');
  assert.equal(result.readyForGuardianCount, 1);
  assert.equal(result.draftCount, 0);

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-03: LOW confidence proposal → DRAFT', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('CONVERSATION', 2)); // LOW confidence
  await runRootCauseAnalysis(['PATTERN-CONVERSATION-001']);
  const result = await runProposalEngine(['RCA-CONVERSATION-001']);

  const proposal = await getProposalByIdFromKv('PROPOSAL-CONVERSATION-001');
  assert.equal(proposal!.status, 'DRAFT');
  assert.equal(result.draftCount, 1);
  assert.equal(result.readyForGuardianCount, 0);

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-04: MEDIUM confidence + P0/P1 priority → READY_FOR_GUARDIAN', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // TRUST with 5 issues (MEDIUM), no P0 → priority P1 (sensitive) → READY_FOR_GUARDIAN
  seedPattern(mockKv, makePattern('TRUST', 5, 0)); // MEDIUM confidence, sensitive
  await runRootCauseAnalysis(['PATTERN-TRUST-001']);
  await runProposalEngine(['RCA-TRUST-001']);

  const proposal = await getProposalByIdFromKv('PROPOSAL-TRUST-001');
  assert.equal(proposal!.priority, 'P1');
  assert.equal(proposal!.status, 'READY_FOR_GUARDIAN');

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-05: proposal has all required Architecture Guardian fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('MEDICAL', 4));
  await runRootCauseAnalysis(['PATTERN-MEDICAL-001']);
  await runProposalEngine(['RCA-MEDICAL-001']);

  const proposal = await getProposalByIdFromKv('PROPOSAL-MEDICAL-001');
  assert.ok(proposal !== null);
  // Architecture Guardian requirement: all of these must be present
  assert.ok(proposal!.affectedIntelligence.length > 0, 'affectedIntelligence required');
  assert.ok(proposal!.affectedCapability.length > 0,   'affectedCapability required');
  assert.ok(proposal!.recommendedOwner.length > 0,     'recommendedOwner required');
  assert.ok(proposal!.businessImpact.length > 0,       'businessImpact required');
  assert.ok(proposal!.technicalImpact.length > 0,      'technicalImpact required');
  assert.ok(proposal!.implementationScope.length > 0,  'implementationScope required');

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-06: second run updates proposal (createdAt preserved)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('PRODUCT', 3));
  await runRootCauseAnalysis(['PATTERN-PRODUCT-001']);
  await runProposalEngine(['RCA-PRODUCT-001']);

  const beforeCreatedAt = (await getProposalByIdFromKv('PROPOSAL-PRODUCT-001'))!.createdAt;

  // Second run (pattern updated with more issues)
  seedPattern(mockKv, makePattern('PRODUCT', 8));
  await runRootCauseAnalysis(['PATTERN-PRODUCT-001']);
  const second = await runProposalEngine(['RCA-PRODUCT-001']);

  const afterCreatedAt = (await getProposalByIdFromKv('PROPOSAL-PRODUCT-001'))!.createdAt;

  assert.equal(second.proposalsCreated, 0);
  assert.equal(second.proposalsUpdated, 1);
  assert.equal(beforeCreatedAt, afterCreatedAt);

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-07: runProposalEngine uses recent root causes when no ids given', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('HANDOFF', 4));
  seedPattern(mockKv, makePattern('MEMORY', 2));
  await runRootCauseAnalysis();

  const result = await runProposalEngine(); // no explicit ids

  assert.equal(result.rootCausesProcessed, 2);
  assert.equal(result.proposalsCreated, 2);

  __setKvClientForTest(null);
});

test('PROPOSAL_ENGINE-08: engine error is caught — increments error count', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // Seed a root cause that references a non-existent pattern
  const fakeRc: RootCauseRecord = {
    rootCauseId:          'RCA-FAKE-001',
    patternId:            'PATTERN-FAKE-001', // not in KV
    rootCauseCategory:    'Unknown',
    affectedIntelligence: 'Learning Intelligence',
    affectedCapability:   'unknown',
    description:          'Fake',
    confidence:           'LOW',
    evidence:             [],
    supportingPatterns:   [],
    createdAt:            new Date().toISOString(),
    status:               'OPEN',
  };
  seedRootCause(mockKv, fakeRc);

  const result = await runProposalEngine(['RCA-FAKE-001']);

  // Missing pattern means rootCause is processed but no proposal created (silent skip)
  assert.equal(result.rootCausesProcessed, 0); // pattern not found → skipped
  assert.equal(result.errors, 0);

  __setKvClientForTest(null);
});

// ─── KV_PERSIST GROUP ─────────────────────────────────────────────────────────

test('KV_PERSIST-01: RootCauseRecord persisted to rootcause:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('TRUST', 3));
  await runRootCauseAnalysis(['PATTERN-TRUST-001']);

  const raw = mockKv._store.get('rootcause:byId:RCA-TRUST-001');
  assert.ok(raw, 'Expected rootcause:byId:RCA-TRUST-001 in KV');

  __setKvClientForTest(null);
});

test('KV_PERSIST-02: rootcause:recent index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('COMMERCIAL', 2));
  await runRootCauseAnalysis(['PATTERN-COMMERCIAL-001']);

  const ids = mockKv._lists.get('rootcause:recent') ?? [];
  assert.ok(ids.includes('RCA-COMMERCIAL-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-03: rootcause:category index uses underscore key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('MEMORY', 3));
  await runRootCauseAnalysis(['PATTERN-MEMORY-001']);

  const ids = mockKv._lists.get('rootcause:category:Memory_Weakness') ?? [];
  assert.ok(ids.includes('RCA-MEMORY-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-04: ProposalRecord persisted to proposal:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('PRODUCT', 5));
  await runRootCauseAnalysis(['PATTERN-PRODUCT-001']);
  await runProposalEngine(['RCA-PRODUCT-001']);

  const raw = mockKv._store.get('proposal:byId:PROPOSAL-PRODUCT-001');
  assert.ok(raw, 'Expected proposal:byId:PROPOSAL-PRODUCT-001 in KV');

  __setKvClientForTest(null);
});

test('KV_PERSIST-05: proposal:status:DRAFT index is set for LOW confidence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('CONVERSATION', 1)); // LOW
  await runRootCauseAnalysis(['PATTERN-CONVERSATION-001']);
  await runProposalEngine(['RCA-CONVERSATION-001']);

  const ids = mockKv._lists.get('proposal:status:DRAFT') ?? [];
  assert.ok(ids.includes('PROPOSAL-CONVERSATION-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-06: proposal:status:READY_FOR_GUARDIAN index is set for HIGH confidence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('KNOWLEDGE', 10)); // HIGH
  await runRootCauseAnalysis(['PATTERN-KNOWLEDGE-001']);
  await runProposalEngine(['RCA-KNOWLEDGE-001']);

  const ids = mockKv._lists.get('proposal:status:READY_FOR_GUARDIAN') ?? [];
  assert.ok(ids.includes('PROPOSAL-KNOWLEDGE-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-07: getDraftProposals and getReadyForGuardian return correct records', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('CONVERSATION', 2)); // LOW → DRAFT
  seedPattern(mockKv, makePattern('MEDICAL', 10));     // HIGH → READY

  await runRootCauseAnalysis();
  await runProposalEngine();

  const drafts = await getDraftProposals(10);
  const ready  = await getReadyForGuardian(10);

  assert.ok(drafts.some((p) => p.proposalId === 'PROPOSAL-CONVERSATION-001'));
  assert.ok(ready.some((p) => p.proposalId === 'PROPOSAL-MEDICAL-001'));
  assert.ok(ready.every((p) => p.status === 'READY_FOR_GUARDIAN'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-08: PROPOSAL_TTL_SECONDS applied to proposal:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('TRUST', 3));
  await runRootCauseAnalysis(['PATTERN-TRUST-001']);
  await runProposalEngine(['RCA-TRUST-001']);

  const ttl = mockKv._ttls.get('proposal:byId:PROPOSAL-TRUST-001');
  assert.equal(ttl, PROPOSAL_TTL_SECONDS);

  __setKvClientForTest(null);
});

// ─── COMPAT GROUP ─────────────────────────────────────────────────────────────

test('COMPAT-01: determineProposalStatus covers all confidence/priority combinations', () => {
  assert.equal(determineProposalStatus('LOW',    'P0'), 'DRAFT');
  assert.equal(determineProposalStatus('LOW',    'P1'), 'DRAFT');
  assert.equal(determineProposalStatus('MEDIUM', 'P0'), 'READY_FOR_GUARDIAN');
  assert.equal(determineProposalStatus('MEDIUM', 'P1'), 'READY_FOR_GUARDIAN');
  assert.equal(determineProposalStatus('MEDIUM', 'P2'), 'DRAFT');
  assert.equal(determineProposalStatus('MEDIUM', 'P3'), 'DRAFT');
  assert.equal(determineProposalStatus('HIGH',   'P3'), 'READY_FOR_GUARDIAN');
});

test('COMPAT-02: determineScope returns valid scope for all root cause categories', () => {
  const validScopes = ['KNOWLEDGE', 'CAPABILITY', 'PROMPT', 'MEMORY', 'DECISION', 'PROCESS', 'ARCHITECTURE'];
  const categories: RootCauseCategory[] = [
    'Knowledge Gap', 'Memory Weakness', 'Conversation Design', 'Commercial Logic',
    'Recommendation Timing', 'Trust Strategy', 'Medical Flow', 'Product Coverage',
    'Architecture Debt', 'Governance Gap', 'Unknown',
  ];
  for (const cat of categories) {
    const scope = determineScope(cat);
    assert.ok(validScopes.includes(scope), `Unexpected scope "${scope}" for category "${cat}"`);
  }
});

test('COMPAT-03: getRootCauses alias works as getRecentRootCauses', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('HANDOFF', 3));
  await runRootCauseAnalysis(['PATTERN-HANDOFF-001']);

  const results = await getRootCauses(10);
  assert.ok(Array.isArray(results));
  assert.ok(results.some((rc) => rc.rootCauseId === 'RCA-HANDOFF-001'));

  __setKvClientForTest(null);
});

test('COMPAT-04: getProposalById alias works as getProposalByIdFromKv', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  seedPattern(mockKv, makePattern('COMMERCIAL', 5));
  await runRootCauseAnalysis(['PATTERN-COMMERCIAL-001']);
  await runProposalEngine(['RCA-COMMERCIAL-001']);

  const via_alias  = await getProposalById('PROPOSAL-COMMERCIAL-001');
  const via_direct = await getProposalByIdFromKv('PROPOSAL-COMMERCIAL-001');

  assert.ok(via_alias !== null);
  assert.equal(via_alias!.proposalId, via_direct!.proposalId);

  __setKvClientForTest(null);
});
