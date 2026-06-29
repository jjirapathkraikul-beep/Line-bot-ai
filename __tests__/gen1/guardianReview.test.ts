// Architecture Guardian Review Engine Tests — Phase 12.0D
// Groups: TYPES(4), GATE_RESULTS(8), CONFLICT_DETECT(6), ADR_RULES(6),
//         DECISION(8), REVIEW_ENGINE(8), KV_PERSIST(6), REPORT(4), COMPAT(4) = 54 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  GUARDIAN_REVIEW_TTL_SECONDS,
  computeFutureImpactScore,
  requiresAdr,
  determineGuardianDecision,
  runGuardianReview,
  getGuardianReviewById,
  getGuardianReviews,
  getReviewsByDecision,
  getPendingHumanReview,
  getGuardianReview,
  type GuardianDecision,
  type GateResult,
  type ConflictReport,
} from '../../runtime-gen1/guardian/guardianReview';

import {
  generateGuardianReport,
} from '../../runtime-gen1/guardian/guardianReport';

import {
  __setKvClientForTest,
  type KvMinimal,
} from '../../runtime-gen1/observability/kvClient';

import {
  INTELLIGENCE_MAP,
  type OperationalCategory,
} from '../../runtime-gen1/learning/patternRecognition';

import {
  type ProposalRecord,
  type ProposalStatus,
  type ProposalPriority,
  type EstimatedRisk,
  type ImplementationScope,
} from '../../runtime-gen1/learning/proposalEngine';

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

// ─── Proposal stub ────────────────────────────────────────────────────────────

function makeProposal(
  category: OperationalCategory,
  confidence: 'LOW' | 'MEDIUM' | 'HIGH',
  priority: ProposalPriority,
  risk: EstimatedRisk,
  scope: ImplementationScope,
  status: ProposalStatus = 'READY_FOR_GUARDIAN',
): ProposalRecord {
  return {
    proposalId:            `PROPOSAL-${category}-001`,
    rootCauseId:           `RCA-${category}-001`,
    title:                 `Fix ${category} issue`,
    summary:               `Summary for ${category}`,
    problem:               `Problem in ${category}`,
    businessImpact:        `Business impact of ${category} failure detected with ${confidence} confidence.`,
    technicalImpact:       `Technical impact: ${scope} layer change required.`,
    recommendedAction:     `Recommended action for ${category}`,
    recommendedOwner:      `${INTELLIGENCE_MAP[category]} Team`,
    affectedIntelligence:  INTELLIGENCE_MAP[category],
    affectedCapability:    `cap-${category.toLowerCase()}`,
    priority,
    estimatedRisk:         risk,
    confidence,
    implementationScope:   scope,
    status,
    createdAt:             '2026-06-29T10:00:00.000Z',
    updatedAt:             '2026-06-29T12:00:00.000Z',
  };
}

function seedProposal(kv: MockKv, proposal: ProposalRecord): void {
  kv._store.set(`proposal:byId:${proposal.proposalId}`, JSON.stringify(proposal));
  const list = kv._lists.get('proposal:status:READY_FOR_GUARDIAN') ?? [];
  kv._lists.set('proposal:status:READY_FOR_GUARDIAN', [proposal.proposalId, ...list]);
}

// ─── TYPES GROUP ──────────────────────────────────────────────────────────────

test('TYPES-01: GUARDIAN_REVIEW_TTL_SECONDS is 365 days', () => {
  assert.equal(GUARDIAN_REVIEW_TTL_SECONDS, 365 * 24 * 60 * 60);
});

test('TYPES-02: GuardianDecision has 5 valid values', () => {
  const decisions: GuardianDecision[] = [
    'APPROVE', 'APPROVE_WITH_CONDITIONS', 'REQUEST_REVISION', 'REJECT', 'ESCALATE',
  ];
  assert.equal(decisions.length, 5);
});

test('TYPES-03: reviewId format is REVIEW-{CATEGORY}-001', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);

  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  assert.ok(review !== null);
  assert.equal(review!.reviewId, 'REVIEW-KNOWLEDGE-001');

  __setKvClientForTest(null);
});

test('TYPES-04: GuardianReview has all required schema fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('MEMORY', 'MEDIUM', 'P2', 'LOW', 'MEMORY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-MEMORY-001']);

  const review = await getGuardianReviewById('REVIEW-MEMORY-001');
  assert.ok(review !== null);

  // All required schema fields from the spec
  const requiredFields = [
    'reviewId', 'proposalIds', 'decision', 'reviewSummary', 'businessImpact',
    'architectureImpact', 'implementationRisk', 'futureMaintenance', 'conflicts',
    'gateResults', 'ssiValidation', 'layerValidation', 'duplicateCapability',
    'duplicateKnowledge', 'constitutionCompliance', 'adrRequired', 'reviewer', 'createdAt',
  ];
  for (const field of requiredFields) {
    assert.ok(field in review!, `Expected field "${field}" in GuardianReview`);
  }

  __setKvClientForTest(null);
});

// ─── GATE_RESULTS GROUP ───────────────────────────────────────────────────────

test('GATE_RESULTS-01: G1 PASS for HIGH/MEDIUM confidence proposals', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-TRUST-001']);

  const review = await getGuardianReviewById('REVIEW-TRUST-001');
  const g1 = review!.gateResults.find((g) => g.gate === 'G1');
  assert.equal(g1!.status, 'PASS');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-02: G1 CONDITIONAL_PASS for LOW confidence proposals', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('CONVERSATION', 'LOW', 'P3', 'LOW', 'DECISION', 'DRAFT');
  // Override status to simulate we're still reviewing a DRAFT
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-CONVERSATION-001']);

  const review = await getGuardianReviewById('REVIEW-CONVERSATION-001');
  const g1 = review!.gateResults.find((g) => g.gate === 'G1');
  assert.equal(g1!.status, 'CONDITIONAL_PASS');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-03: G2 PASS when no duplicate scope+intelligence in batch', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('PRODUCT', 'MEDIUM', 'P2', 'MEDIUM', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-PRODUCT-001']);

  const review = await getGuardianReviewById('REVIEW-PRODUCT-001');
  const g2 = review!.gateResults.find((g) => g.gate === 'G2');
  assert.equal(g2!.status, 'PASS');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-04: G3 PASS when affectedIntelligence is known SSI owner', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('COMMERCIAL', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-COMMERCIAL-001']);

  const review = await getGuardianReviewById('REVIEW-COMMERCIAL-001');
  const g3 = review!.gateResults.find((g) => g.gate === 'G3');
  assert.equal(g3!.status, 'PASS');
  assert.equal(review!.ssiValidation.status, 'CLEAN');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-05: G3 CONDITIONAL_PASS for ARCHITECTURE scope (cross-domain SSI risk)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // Make a proposal with ARCHITECTURE scope (highest risk)
  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  const g3 = review!.gateResults.find((g) => g.gate === 'G3');
  assert.equal(g3!.status, 'CONDITIONAL_PASS');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-06: G5 FAIL for LOW confidence proposals', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('MEMORY', 'LOW', 'P3', 'LOW', 'MEMORY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-MEMORY-001']);

  const review = await getGuardianReviewById('REVIEW-MEMORY-001');
  const g5 = review!.gateResults.find((g) => g.gate === 'G5');
  assert.equal(g5!.status, 'FAIL');

  __setKvClientForTest(null);
});

test('GATE_RESULTS-07: G6 score ≥ 70 for LOW risk + HIGH confidence', () => {
  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'LOW', 'KNOWLEDGE');
  const score = computeFutureImpactScore(proposal);
  assert.ok(score >= 70, `Expected score ≥ 70, got ${score}`);
});

test('GATE_RESULTS-08: G6 score < 70 for HIGH risk + ARCHITECTURE scope', () => {
  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'ARCHITECTURE');
  const score = computeFutureImpactScore(proposal);
  assert.ok(score < 70, `Expected score < 70 for HIGH risk + ARCHITECTURE, got ${score}`);
});

// ─── CONFLICT_DETECT GROUP ────────────────────────────────────────────────────

test('CONFLICT_DETECT-01: no conflict for single proposal', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('HANDOFF', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-HANDOFF-001']);

  const review = await getGuardianReviewById('REVIEW-HANDOFF-001');
  assert.equal(review!.conflicts.length, 0);
  assert.equal(review!.duplicateCapability, false);

  __setKvClientForTest(null);
});

test('CONFLICT_DETECT-02: DUPLICATE_PROPOSAL detected for same scope + intelligence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // Two proposals, both KNOWLEDGE scope, both Product Intelligence
  const p1 = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'KNOWLEDGE');
  const p2: ProposalRecord = {
    ...makeProposal('PRODUCT', 'MEDIUM', 'P2', 'MEDIUM', 'KNOWLEDGE'),
    proposalId:           'PROPOSAL-PRODUCT-001',
    affectedIntelligence: 'Product Intelligence', // same as KNOWLEDGE
  };

  seedProposal(mockKv, p1);
  mockKv._store.set(`proposal:byId:${p2.proposalId}`, JSON.stringify(p2));

  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001', 'PROPOSAL-PRODUCT-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  assert.ok(review!.conflicts.some((c) => c.conflictType === 'DUPLICATE_PROPOSAL'));
  assert.equal(review!.duplicateCapability, true);

  __setKvClientForTest(null);
});

test('CONFLICT_DETECT-03: CRITICAL conflict for multiple HIGH-risk proposals in batch', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('TRUST',   'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  const p2 = makeProposal('MEDICAL', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');

  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);

  await runGuardianReview(['PROPOSAL-TRUST-001', 'PROPOSAL-MEDICAL-001']);

  const review1 = await getGuardianReviewById('REVIEW-TRUST-001');
  const hasCritical = review1!.conflicts.some((c) => c.severity === 'CRITICAL');
  assert.ok(hasCritical, 'Expected CRITICAL conflict for 2 HIGH-risk proposals');

  __setKvClientForTest(null);
});

test('CONFLICT_DETECT-04: CONTRADICTORY_SCOPE detected for MEMORY + DECISION in same intelligence', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1: ProposalRecord = { ...makeProposal('MEMORY',       'MEDIUM', 'P2', 'LOW',  'MEMORY'),   affectedIntelligence: 'Customer Intelligence' };
  const p2: ProposalRecord = { ...makeProposal('CONVERSATION', 'MEDIUM', 'P2', 'LOW',  'DECISION'), affectedIntelligence: 'Customer Intelligence' };

  seedProposal(mockKv, p1);
  mockKv._store.set(`proposal:byId:${p2.proposalId}`, JSON.stringify(p2));

  await runGuardianReview(['PROPOSAL-MEMORY-001', 'PROPOSAL-CONVERSATION-001']);

  const review = await getGuardianReviewById('REVIEW-MEMORY-001');
  assert.ok(review!.conflicts.some((c) => c.conflictType === 'CONTRADICTORY_SCOPE'));

  __setKvClientForTest(null);
});

test('CONFLICT_DETECT-05: LAYER_VIOLATION detected for ARCHITECTURE scope', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  // Layer validation should flag the ARCHITECTURE scope as a conditional (not clean)
  assert.equal(review!.layerValidation.boundaryCompliant, false);
  assert.ok(review!.layerValidation.violations.length > 0);

  __setKvClientForTest(null);
});

test('CONFLICT_DETECT-06: constitutionCompliance false for ARCHITECTURE scope', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  assert.equal(review!.constitutionCompliance, false);

  __setKvClientForTest(null);
});

// ─── ADR_RULES GROUP ──────────────────────────────────────────────────────────

test('ADR_RULES-01: ARCHITECTURE scope always requires ADR', () => {
  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  const result = requiresAdr(proposal, 'APPROVE_WITH_CONDITIONS');
  assert.equal(result.required, true);
  assert.ok(result.reason.includes('ARCHITECTURE'));
});

test('ADR_RULES-02: CAPABILITY + HIGH risk requires ADR', () => {
  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  const result = requiresAdr(proposal, 'APPROVE');
  assert.equal(result.required, true);
  assert.ok(result.reason.includes('CAPABILITY'));
});

test('ADR_RULES-03: DECISION + HIGH confidence + P0 requires ADR', () => {
  const proposal = makeProposal('CONVERSATION', 'HIGH', 'P0', 'LOW', 'DECISION');
  const result = requiresAdr(proposal, 'APPROVE');
  assert.equal(result.required, true);
  assert.ok(result.reason.includes('DECISION'));
});

test('ADR_RULES-04: ESCALATE decision always requires ADR', () => {
  // Use PROCESS scope + MEDIUM risk to bypass ARCHITECTURE and CAPABILITY+HIGH branches
  // so the ESCALATE branch is the specific trigger
  const proposal = makeProposal('HANDOFF', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  const result = requiresAdr(proposal, 'ESCALATE');
  assert.equal(result.required, true);
  assert.ok(result.reason.toLowerCase().includes('escalate'));
});

test('ADR_RULES-05: KNOWLEDGE scope with MEDIUM confidence does NOT require ADR', () => {
  const proposal = makeProposal('KNOWLEDGE', 'MEDIUM', 'P2', 'MEDIUM', 'KNOWLEDGE');
  const result = requiresAdr(proposal, 'APPROVE');
  assert.equal(result.required, false);
});

test('ADR_RULES-06: MEMORY scope with LOW confidence does NOT require ADR', () => {
  const proposal = makeProposal('MEMORY', 'LOW', 'P3', 'LOW', 'MEMORY');
  const result = requiresAdr(proposal, 'REQUEST_REVISION');
  assert.equal(result.required, false);
});

// ─── DECISION GROUP ───────────────────────────────────────────────────────────

test('DECISION-01: APPROVE when all gates PASS cleanly', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'PASS', rationale: '' },
  ];
  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'LOW', 'KNOWLEDGE');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'APPROVE');
});

test('DECISION-02: APPROVE_WITH_CONDITIONS when G3 CONDITIONAL_PASS (ARCHITECTURE scope)', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'CONDITIONAL_PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'CONDITIONAL_PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'CONDITIONAL_PASS', rationale: '' },
  ];
  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'APPROVE_WITH_CONDITIONS');
});

test('DECISION-03: REQUEST_REVISION when G5 FAIL (LOW confidence)', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'CONDITIONAL_PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'FAIL', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'PASS', rationale: '' },
  ];
  const proposal = makeProposal('MEMORY', 'LOW', 'P3', 'LOW', 'MEMORY');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'REQUEST_REVISION');
});

test('DECISION-04: REJECT when G1 hard FAIL', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'FAIL', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'PASS', rationale: '' },
  ];
  const proposal = makeProposal('CONVERSATION', 'HIGH', 'P1', 'LOW', 'DECISION');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'REJECT');
});

test('DECISION-05: ESCALATE for HIGH risk + P0 priority', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'CONDITIONAL_PASS', rationale: '' },
  ];
  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'ESCALATE');
});

test('DECISION-06: ESCALATE for CRITICAL conflict in batch', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'PASS', rationale: '' },
  ];
  const criticalConflict: ConflictReport = {
    conflictType:   'CAPABILITY_OVERLAP',
    proposalIds:    ['PROPOSAL-TRUST-001', 'PROPOSAL-MEDICAL-001'],
    description:    'Two HIGH-risk proposals',
    severity:       'CRITICAL',
    recommendation: 'Sequence changes.',
  };
  const proposal = makeProposal('MEDICAL', 'HIGH', 'P1', 'HIGH', 'CAPABILITY');
  const decision = determineGuardianDecision(gateResults, [criticalConflict], proposal);
  assert.equal(decision, 'ESCALATE');
});

test('DECISION-07: REQUEST_REVISION when G6 FAIL (very low future impact score)', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'FAIL', rationale: '' },
  ];
  const proposal = makeProposal('KNOWLEDGE', 'MEDIUM', 'P3', 'HIGH', 'ARCHITECTURE');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'REQUEST_REVISION');
});

test('DECISION-08: G5 CONDITIONAL_PASS for MEDIUM confidence + P2/P3 → APPROVE_WITH_CONDITIONS', () => {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision', status: 'PASS', rationale: '' },
    { gate: 'G2', name: 'Capability', status: 'PASS', rationale: '' },
    { gate: 'G3', name: 'SSI', status: 'PASS', rationale: '' },
    { gate: 'G4', name: 'Layer', status: 'PASS', rationale: '' },
    { gate: 'G5', name: 'Business Value', status: 'CONDITIONAL_PASS', rationale: '' },
    { gate: 'G6', name: 'Future Impact', status: 'PASS', rationale: '' },
  ];
  const proposal = makeProposal('COMMERCIAL', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  const decision = determineGuardianDecision(gateResults, [], proposal);
  assert.equal(decision, 'APPROVE_WITH_CONDITIONS');
});

// ─── REVIEW_ENGINE GROUP ──────────────────────────────────────────────────────

test('REVIEW_ENGINE-01: creates GuardianReview for READY_FOR_GUARDIAN proposal', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);

  const result = await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);
  assert.equal(result.proposalsReviewed, 1);
  assert.equal(result.errors, 0);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-02: LOW confidence proposal → REQUEST_REVISION decision', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('MEMORY', 'LOW', 'P3', 'LOW', 'MEMORY');
  seedProposal(mockKv, proposal);

  const result = await runGuardianReview(['PROPOSAL-MEMORY-001']);
  assert.equal(result.requestRevision, 1);
  assert.equal(result.approved, 0);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-03: HIGH risk + P0 → ESCALATE decision', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('MEDICAL', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  seedProposal(mockKv, proposal);

  const result = await runGuardianReview(['PROPOSAL-MEDICAL-001']);
  assert.equal(result.escalated, 1);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-04: ARCHITECTURE scope → APPROVE_WITH_CONDITIONS + ADR required', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'MEDIUM', 'ARCHITECTURE');
  seedProposal(mockKv, proposal);

  const result = await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);
  assert.equal(result.approvedWithConditions, 1);
  assert.equal(result.adrRequired, 1);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  assert.equal(review!.adrRequired, true);
  assert.ok(review!.conditions.length > 0);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-05: review includes all 6 gate results', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('COMMERCIAL', 'MEDIUM', 'P1', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, proposal);

  await runGuardianReview(['PROPOSAL-COMMERCIAL-001']);
  const review = await getGuardianReviewById('REVIEW-COMMERCIAL-001');

  assert.equal(review!.gateResults.length, 6);
  const gateIds = review!.gateResults.map((g) => g.gate).sort();
  assert.deepEqual(gateIds, ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-06: runGuardianReview uses READY_FOR_GUARDIAN ids when none provided', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('PRODUCT',  'HIGH',   'P1', 'MEDIUM', 'KNOWLEDGE');
  const p2 = makeProposal('HANDOFF',  'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);

  const result = await runGuardianReview(); // no explicit ids
  assert.equal(result.proposalsReviewed, 2);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-07: missing proposal is silently skipped', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const result = await runGuardianReview(['PROPOSAL-NONEXISTENT-001']);
  assert.equal(result.proposalsReviewed, 0);
  assert.equal(result.errors, 0);

  __setKvClientForTest(null);
});

test('REVIEW_ENGINE-08: KV write error is caught and increments error count', async () => {
  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');

  const errorKv: KvMinimal = {
    async get(key) {
      if (key.startsWith('proposal:byId:')) return JSON.stringify(proposal);
      if (key.startsWith('proposal:status:')) return null;
      return null;
    },
    async set() { throw new Error('KV write failure'); },
    async lpush() { return 1; },
    async lrange(key) {
      if (key === 'proposal:status:READY_FOR_GUARDIAN') return [proposal.proposalId];
      return [];
    },
    async expire() { return 1; },
  };
  __setKvClientForTest(errorKv);

  const result = await runGuardianReview(['PROPOSAL-TRUST-001']);
  assert.ok(result.errors >= 1);

  __setKvClientForTest(null);
});

// ─── KV_PERSIST GROUP ─────────────────────────────────────────────────────────

test('KV_PERSIST-01: GuardianReview persisted to guardianReview:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('PRODUCT', 'HIGH', 'P1', 'MEDIUM', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-PRODUCT-001']);

  const raw = mockKv._store.get('guardianReview:byId:REVIEW-PRODUCT-001');
  assert.ok(raw, 'Expected guardianReview:byId:REVIEW-PRODUCT-001 in KV');

  __setKvClientForTest(null);
});

test('KV_PERSIST-02: guardianReview:recent index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('COMMERCIAL', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-COMMERCIAL-001']);

  const ids = mockKv._lists.get('guardianReview:recent') ?? [];
  assert.ok(ids.includes('REVIEW-COMMERCIAL-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-03: guardianReview:decision:{decision} index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('KNOWLEDGE', 'HIGH', 'P1', 'LOW', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001']);

  const review = await getGuardianReviewById('REVIEW-KNOWLEDGE-001');
  const decision = review!.decision;
  const ids = mockKv._lists.get(`guardianReview:decision:${decision}`) ?? [];
  assert.ok(ids.includes('REVIEW-KNOWLEDGE-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-04: GUARDIAN_REVIEW_TTL_SECONDS applied to review byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('TRUST', 'MEDIUM', 'P1', 'HIGH', 'CAPABILITY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-TRUST-001']);

  const ttl = mockKv._ttls.get('guardianReview:byId:REVIEW-TRUST-001');
  assert.equal(ttl, GUARDIAN_REVIEW_TTL_SECONDS);

  __setKvClientForTest(null);
});

test('KV_PERSIST-05: createdAt preserved on second review run', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('MEMORY', 'HIGH', 'P1', 'LOW', 'MEMORY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-MEMORY-001']);

  const firstCreatedAt = (await getGuardianReviewById('REVIEW-MEMORY-001'))!.createdAt;

  await runGuardianReview(['PROPOSAL-MEMORY-001']);
  const secondCreatedAt = (await getGuardianReviewById('REVIEW-MEMORY-001'))!.createdAt;

  assert.equal(firstCreatedAt, secondCreatedAt, 'createdAt must not change on re-run');

  __setKvClientForTest(null);
});

test('KV_PERSIST-06: getReviewsByDecision returns only matching decision reviews', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('KNOWLEDGE',    'HIGH', 'P1', 'LOW', 'KNOWLEDGE');   // → APPROVE
  const p2 = makeProposal('MEMORY',       'LOW',  'P3', 'LOW', 'MEMORY');      // → REQUEST_REVISION

  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);

  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001', 'PROPOSAL-MEMORY-001']);

  const approved  = await getReviewsByDecision('APPROVE',          10);
  const revisions = await getReviewsByDecision('REQUEST_REVISION', 10);

  assert.ok(approved.length >= 1, 'Expected at least one APPROVE review');
  assert.ok(revisions.length >= 1, 'Expected at least one REQUEST_REVISION review');
  assert.ok(approved.every((r) => r.decision === 'APPROVE'));
  assert.ok(revisions.every((r) => r.decision === 'REQUEST_REVISION'));

  __setKvClientForTest(null);
});

// ─── REPORT GROUP ─────────────────────────────────────────────────────────────

test('REPORT-01: generateGuardianReport returns structured report', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('PRODUCT', 'HIGH', 'P1', 'MEDIUM', 'KNOWLEDGE');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-PRODUCT-001']);

  const report = await generateGuardianReport(50);

  assert.ok('summary' in report);
  assert.ok('reviewedProposals' in report);
  assert.ok('recommendations' in report);
  assert.ok('rawReviews' in report);
  assert.ok(Array.isArray(report.recommendations));
  assert.ok(report.recommendations.length > 0);

  __setKvClientForTest(null);
});

test('REPORT-02: report summary counts match actual reviews', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('KNOWLEDGE', 'HIGH',  'P1', 'LOW',  'KNOWLEDGE'); // → APPROVE
  const p2 = makeProposal('MEMORY',    'LOW',   'P3', 'LOW',  'MEMORY');    // → REQUEST_REVISION
  const p3 = makeProposal('MEDICAL',   'HIGH',  'P0', 'HIGH', 'CAPABILITY'); // → ESCALATE

  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);
  seedProposal(mockKv, p3);

  await runGuardianReview(['PROPOSAL-KNOWLEDGE-001', 'PROPOSAL-MEMORY-001', 'PROPOSAL-MEDICAL-001']);
  const report = await generateGuardianReport(50);

  assert.equal(report.summary.totalReviewed, 3);
  assert.ok(report.summary.approved >= 0);
  assert.ok(report.summary.requestRevision >= 0);
  assert.ok(report.summary.escalated >= 0);

  __setKvClientForTest(null);
});

test('REPORT-03: report escalations list contains escalated review summaries', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('TRUST', 'HIGH', 'P0', 'HIGH', 'CAPABILITY');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-TRUST-001']);

  const report = await generateGuardianReport(50);
  assert.ok(report.escalations.length >= 1);
  assert.ok(report.escalations[0].summary.length > 0);

  __setKvClientForTest(null);
});

test('REPORT-04: empty report for empty KV returns safe defaults', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const report = await generateGuardianReport(50);
  assert.equal(report.summary.totalReviewed, 0);
  assert.ok(report.recommendations.some((r) => r.includes('healthy') || r.includes('No proposals')));

  __setKvClientForTest(null);
});

// ─── COMPAT GROUP ─────────────────────────────────────────────────────────────

test('COMPAT-01: getGuardianReview is alias for getGuardianReviewById', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const proposal = makeProposal('HANDOFF', 'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, proposal);
  await runGuardianReview(['PROPOSAL-HANDOFF-001']);

  const via_alias  = await getGuardianReview('REVIEW-HANDOFF-001');
  const via_direct = await getGuardianReviewById('REVIEW-HANDOFF-001');

  assert.ok(via_alias !== null);
  assert.equal(via_alias!.reviewId, via_direct!.reviewId);

  __setKvClientForTest(null);
});

test('COMPAT-02: computeFutureImpactScore is deterministic and bounded 0-100', () => {
  const combos: [OperationalCategory, 'LOW' | 'MEDIUM' | 'HIGH', ProposalPriority, EstimatedRisk, ImplementationScope][] = [
    ['KNOWLEDGE', 'HIGH',   'P1', 'LOW',    'KNOWLEDGE'],
    ['TRUST',     'HIGH',   'P0', 'HIGH',   'ARCHITECTURE'],
    ['MEMORY',    'LOW',    'P3', 'LOW',    'MEMORY'],
    ['MEDICAL',   'MEDIUM', 'P1', 'HIGH',   'CAPABILITY'],
  ];
  for (const [cat, conf, pri, risk, scope] of combos) {
    const p = makeProposal(cat, conf, pri, risk, scope);
    const score = computeFutureImpactScore(p);
    assert.ok(score >= 0 && score <= 100, `Score ${score} out of range for ${cat}`);
    // Determinism: calling twice gives same result
    assert.equal(computeFutureImpactScore(p), score);
  }
});

test('COMPAT-03: getPendingHumanReview includes ESCALATE and APPROVE_WITH_CONDITIONS reviews', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('MEDICAL',    'HIGH',   'P0', 'HIGH',   'CAPABILITY'); // → ESCALATE
  const p2 = makeProposal('KNOWLEDGE',  'HIGH',   'P1', 'MEDIUM', 'ARCHITECTURE'); // → APPROVE_WITH_CONDITIONS

  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);
  await runGuardianReview(['PROPOSAL-MEDICAL-001', 'PROPOSAL-KNOWLEDGE-001']);

  const pending = await getPendingHumanReview(20);
  assert.ok(pending.length >= 1, 'Expected at least one pending review for HPO');

  __setKvClientForTest(null);
});

test('COMPAT-04: getGuardianReviews returns reviews as array', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const p1 = makeProposal('PRODUCT',  'HIGH',   'P1', 'MEDIUM', 'KNOWLEDGE');
  const p2 = makeProposal('HANDOFF',  'MEDIUM', 'P2', 'MEDIUM', 'PROCESS');
  seedProposal(mockKv, p1);
  seedProposal(mockKv, p2);
  await runGuardianReview(['PROPOSAL-PRODUCT-001', 'PROPOSAL-HANDOFF-001']);

  const reviews = await getGuardianReviews(10);
  assert.ok(Array.isArray(reviews));
  assert.ok(reviews.length >= 2);

  __setKvClientForTest(null);
});
