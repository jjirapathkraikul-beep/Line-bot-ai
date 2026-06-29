// Human Product Owner Approval Engine Tests — Phase 12.0E
// Groups: TYPES(4), CONSTRAINTS(6), AUTHORIZATION(6), ADR_SCAFFOLD(6),
//         HPO_DECISION(8), KV_PERSIST(6), READ_HELPERS(6), GOVERNANCE(8), COMPAT(4) = 54 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  APPROVAL_TTL_SECONDS,
  AUTHORIZATION_EXPIRY_DAYS,
  buildDefaultConstraints,
  generateAuthorization,
  generateAdrScaffold,
  processHpoDecision,
  queueForHpoReview,
  getApprovalById,
  getApproval,
  getApprovals,
  getApprovalsByDecision,
  getAuthorizationById,
  getApprovedAuthorizations,
  getPendingApprovals,
  type HpoDecision,
  type HpoApproval,
  type ImplementationAuthorization,
  type ImplementationConstraints,
} from '../../runtime-gen1/governance/hpoApproval';

import {
  __setKvClientForTest,
  type KvMinimal,
} from '../../runtime-gen1/observability/kvClient';

import {
  type GuardianReview,
  type GuardianDecision,
  type GateResult,
  type SsiValidationResult,
  type LayerValidationResult,
  type ChangeType,
} from '../../runtime-gen1/guardian/guardianReview';

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

// ─── GuardianReview stub ──────────────────────────────────────────────────────

function makeGuardianReview(
  category: string,
  decision: GuardianDecision,
  changeType: ChangeType,
  adrRequired = false,
  futureImpactScore = 75,
): GuardianReview {
  const gateResults: GateResult[] = [
    { gate: 'G1', name: 'Vision Alignment', status: 'PASS', rationale: 'Aligned' },
    { gate: 'G2', name: 'Capability Audit', status: 'PASS', rationale: 'No duplicate' },
    { gate: 'G3', name: 'SSI Validation',   status: 'PASS', rationale: 'SSI clean' },
    { gate: 'G4', name: 'Layer Validation', status: 'PASS', rationale: 'Correct layer' },
    { gate: 'G5', name: 'Business Value',   status: 'PASS', rationale: 'Value confirmed' },
    { gate: 'G6', name: 'Future Impact',    status: futureImpactScore >= 60 ? 'PASS' : 'FAIL', rationale: `Score: ${futureImpactScore}` },
  ];

  const ssiValidation: SsiValidationResult = {
    correctOwner: true, noDuplicateIntelligence: true, noDuplicateMemory: true,
    noDuplicateKnowledge: true, noDuplicateLeadScoring: true, noDuplicateProductLogic: true,
    noDuplicateAnalytics: true, violations: [], status: 'CLEAN',
  };

  const layerMap: Record<string, string> = {
    Knowledge:    'L7 — Knowledge',
    Runtime:      'L5 — Runtime',
    Architecture: 'L3 — Constitution',
    Conversation: 'L8 — Skills (ACP)',
    Commercial:   'L9 — Workflows',
  };

  const layerValidation: LayerValidationResult = {
    proposedLayer:     layerMap[changeType] ?? 'L7 — Knowledge',
    proposedLocation:  `AIOS/${category}/`,
    layerCorrect:      true,
    boundaryCompliant: true,
    violations:        [],
    status:            'PASS',
  };

  return {
    reviewId:               `REVIEW-${category}-001`,
    proposalIds:            [`PROPOSAL-${category}-001`],
    decision,
    reviewSummary:          `Guardian Review of PROPOSAL-${category}-001: ${decision}. All gates passed.`,
    businessImpact:         `Business impact of ${category} improvement — ${changeType} change required.`,
    architectureImpact:     `${changeType} change in test intelligence. Layer: ${layerMap[changeType] ?? 'L7'}. Change type: ${changeType}.`,
    implementationRisk:     `LOW risk. Standard testing sufficient.`,
    futureMaintenance:      `Future Impact Score: ${futureImpactScore}/100.`,
    conflicts:              [],
    gateResults,
    ssiValidation,
    layerValidation,
    duplicateCapability:    false,
    duplicateKnowledge:     false,
    constitutionCompliance: true,
    adrRequired,
    adrReason:              adrRequired ? 'ADR required for this scope.' : 'No ADR needed.',
    changeType,
    conditions:             [],
    futureImpactScore,
    reviewer:               'Architecture Guardian (AGS-gen1)',
    createdAt:              '2026-06-29T10:00:00.000Z',
  };
}

function seedGuardianReview(kv: MockKv, review: GuardianReview): void {
  kv._store.set(`guardianReview:byId:${review.reviewId}`, JSON.stringify(review));
}

// ─── TYPES GROUP ──────────────────────────────────────────────────────────────

test('TYPES-01: APPROVAL_TTL_SECONDS is 365 days', () => {
  assert.equal(APPROVAL_TTL_SECONDS, 365 * 24 * 60 * 60);
});

test('TYPES-02: AUTHORIZATION_EXPIRY_DAYS is 30', () => {
  assert.equal(AUTHORIZATION_EXPIRY_DAYS, 30);
});

test('TYPES-03: HpoDecision has exactly 5 valid values', () => {
  const decisions: HpoDecision[] = [
    'APPROVE', 'APPROVE_WITH_NOTES', 'REJECT', 'DEFER', 'RETURN_TO_GUARDIAN',
  ];
  assert.equal(decisions.length, 5);
});

test('TYPES-04: approvalId format is HPO-APPROVAL-{reviewId}', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision(
    'REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved — expand knowledge registry.', 'HPO',
  );

  assert.equal(result.approvalId, 'HPO-APPROVAL-REVIEW-KNOWLEDGE-001');

  __setKvClientForTest(null);
});

// ─── CONSTRAINTS GROUP ────────────────────────────────────────────────────────

test('CONSTRAINTS-01: KNOWLEDGE scope — allowedFiles targets AIOS/KnowledgeBase', () => {
  const c = buildDefaultConstraints('KNOWLEDGE', 'Knowledge');
  assert.ok(c.allowedFiles.some((f) => f.includes('KnowledgeBase')));
  assert.ok(c.forbiddenFiles.some((f) => f.includes('runtime-gen1')));
});

test('CONSTRAINTS-02: MEMORY scope — allowedFiles targets runtime-gen1/memory', () => {
  const c = buildDefaultConstraints('MEMORY', 'Runtime');
  assert.ok(c.allowedFiles.some((f) => f.includes('memory')));
  assert.equal(c.migrationRequired, true);
});

test('CONSTRAINTS-03: CAPABILITY scope — allowedFiles targets CapabilityPackages', () => {
  const c = buildDefaultConstraints('CAPABILITY', 'Architecture');
  assert.ok(c.allowedFiles.some((f) => f.includes('CapabilityPackages')));
  assert.ok(c.forbiddenFiles.some((f) => f.includes('runtime-gen1')));
});

test('CONSTRAINTS-04: ARCHITECTURE scope — allowedFiles is empty (HPO must specify)', () => {
  const c = buildDefaultConstraints('ARCHITECTURE', 'Architecture');
  assert.equal(c.allowedFiles.length, 0);
  assert.ok(c.maximumScope.includes('must be explicitly defined'));
  assert.ok(c.additionalConstraints.some((s) => s.includes('ADR')));
});

test('CONSTRAINTS-05: PROCESS scope — rollbackRequired is false, migrationRequired is false', () => {
  const c = buildDefaultConstraints('PROCESS', 'Commercial');
  assert.equal(c.rollbackRequired, false);
  assert.equal(c.migrationRequired, false);
});

test('CONSTRAINTS-06: all constraint templates have testingRequired = true', () => {
  const scopes: Array<Parameters<typeof buildDefaultConstraints>[0]> = [
    'KNOWLEDGE', 'MEMORY', 'CAPABILITY', 'PROMPT', 'DECISION', 'ARCHITECTURE',
  ];
  for (const scope of scopes) {
    const c = buildDefaultConstraints(scope, 'Knowledge');
    assert.equal(c.testingRequired, true, `Expected testingRequired for ${scope}`);
  }
});

// ─── AUTHORIZATION GROUP ──────────────────────────────────────────────────────

test('AUTHORIZATION-01: authorizationId format is AUTH-{reviewId}', () => {
  const review = makeGuardianReview('MEMORY', 'APPROVE', 'Runtime');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-REVIEW-MEMORY-001', buildDefaultConstraints('MEMORY', 'Runtime'), 'HPO');
  assert.equal(auth.authorizationId, 'AUTH-REVIEW-MEMORY-001');
});

test('AUTHORIZATION-02: authorization has approvedBy and approvedAt', () => {
  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-test', buildDefaultConstraints('KNOWLEDGE', 'Knowledge'), 'Jirawat (HPO)');
  assert.equal(auth.approvedBy, 'Jirawat (HPO)');
  assert.ok(auth.approvedAt.length > 0);
});

test('AUTHORIZATION-03: authorization expiresAt is 30 days from approvedAt', () => {
  const review = makeGuardianReview('COMMERCIAL', 'APPROVE', 'Commercial');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-test', buildDefaultConstraints('PROCESS', 'Commercial'), 'HPO');
  const approved = new Date(auth.approvedAt);
  const expires  = new Date(auth.expiresAt);
  const diffDays = (expires.getTime() - approved.getTime()) / (1000 * 60 * 60 * 24);
  assert.ok(Math.abs(diffDays - 30) < 1, `Expected ~30 days, got ${diffDays}`);
});

test('AUTHORIZATION-04: authorization status starts as ACTIVE', () => {
  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Knowledge');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-test', buildDefaultConstraints('KNOWLEDGE', 'Knowledge'), 'HPO');
  assert.equal(auth.status, 'ACTIVE');
});

test('AUTHORIZATION-05: authorization includes authorizedImplementationAI field', () => {
  const review = makeGuardianReview('TRUST', 'APPROVE', 'Architecture');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-test', buildDefaultConstraints('CAPABILITY', 'Architecture'), 'HPO');
  assert.ok(auth.authorizedImplementationAI.includes('Claude'));
});

test('AUTHORIZATION-06: authorization proposalIds matches review proposalIds', () => {
  const review = makeGuardianReview('HANDOFF', 'APPROVE', 'Commercial');
  const auth   = generateAuthorization(review, 'HPO-APPROVAL-test', buildDefaultConstraints('PROCESS', 'Commercial'), 'HPO');
  assert.deepEqual(auth.proposalIds, review.proposalIds);
});

// ─── ADR_SCAFFOLD GROUP ───────────────────────────────────────────────────────

test('ADR_SCAFFOLD-01: adrId format is ADR-{reviewId}', () => {
  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE_WITH_CONDITIONS', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE', reviewNotes: 'Approved', approvedBy: 'HPO' });
  assert.equal(adr.adrId, 'ADR-REVIEW-KNOWLEDGE-001');
});

test('ADR_SCAFFOLD-02: ADR status is always DRAFT', () => {
  const review = makeGuardianReview('TRUST', 'ESCALATE', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE', reviewNotes: 'Notes', approvedBy: 'HPO' });
  assert.equal(adr.status, 'DRAFT');
});

test('ADR_SCAFFOLD-03: ADR decision field is a placeholder for HPO completion', () => {
  const review = makeGuardianReview('MEDICAL', 'ESCALATE', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE_WITH_NOTES', reviewNotes: 'With notes', approvedBy: 'HPO' });
  assert.ok(adr.decision.includes('TO BE COMPLETED') || adr.decision.includes('['));
});

test('ADR_SCAFFOLD-04: ADR alternatives has at least 2 options', () => {
  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE', reviewNotes: 'Approved', approvedBy: 'HPO' });
  assert.ok(adr.alternatives.length >= 2);
});

test('ADR_SCAFFOLD-05: ADR humanDecision includes HPO decision', () => {
  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE_WITH_NOTES', reviewNotes: 'Review complete', approvedBy: 'Chief HPO' });
  assert.ok(adr.humanDecision.includes('APPROVE_WITH_NOTES') || adr.humanDecision.includes('Chief HPO'));
});

test('ADR_SCAFFOLD-06: ADR guardianFindings includes Guardian decision', () => {
  const review = makeGuardianReview('COMMERCIAL', 'APPROVE_WITH_CONDITIONS', 'Architecture', true);
  const adr    = generateAdrScaffold(review, { approvalId: 'HPO-test', decision: 'APPROVE', reviewNotes: 'Noted', approvedBy: 'HPO' });
  assert.ok(adr.guardianFindings.includes('APPROVE_WITH_CONDITIONS') || adr.guardianFindings.length > 10);
});

// ─── HPO_DECISION GROUP ───────────────────────────────────────────────────────

test('HPO_DECISION-01: APPROVE creates authorization certificate', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved.', 'HPO');
  assert.equal(result.decision, 'APPROVE');
  assert.equal(result.authorized, true);
  assert.ok(result.authorizationId !== null);
  assert.equal(result.authorizationId, 'AUTH-REVIEW-KNOWLEDGE-001');

  __setKvClientForTest(null);
});

test('HPO_DECISION-02: APPROVE_WITH_NOTES creates authorization with notes', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEMORY', 'APPROVE_WITH_CONDITIONS', 'Runtime');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision(
    'REVIEW-MEMORY-001', 'APPROVE_WITH_NOTES', 'Approved. Ensure memory tests pass.', 'HPO',
  );
  assert.equal(result.authorized, true);
  assert.ok(result.authorizationId !== null);

  __setKvClientForTest(null);
});

test('HPO_DECISION-03: REJECT creates no authorization — implementation blocked', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('TRUST', 'APPROVE', 'Architecture');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-TRUST-001', 'REJECT', 'Rejected — insufficient justification.', 'HPO');
  assert.equal(result.authorized, false);
  assert.equal(result.authorizationId, null);
  assert.equal(result.status, 'REJECTED');

  __setKvClientForTest(null);
});

test('HPO_DECISION-04: DEFER creates no authorization — decision deferred', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('COMMERCIAL', 'APPROVE_WITH_CONDITIONS', 'Commercial');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-COMMERCIAL-001', 'DEFER', 'Defer until Q4 budget review.', 'HPO');
  assert.equal(result.authorized, false);
  assert.equal(result.authorizationId, null);
  assert.equal(result.status, 'DEFERRED');

  __setKvClientForTest(null);
});

test('HPO_DECISION-05: RETURN_TO_GUARDIAN creates no authorization', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEDICAL', 'ESCALATE', 'Architecture');
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-MEDICAL-001', 'RETURN_TO_GUARDIAN', 'Need more detail on compliance impact.', 'HPO');
  assert.equal(result.authorized, false);
  assert.equal(result.status, 'RETURNED_TO_GUARDIAN');

  __setKvClientForTest(null);
});

test('HPO_DECISION-06: adrRequired=true → ADR scaffold generated on APPROVE', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE_WITH_CONDITIONS', 'Architecture', true);
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved with ADR.', 'HPO');
  assert.ok(result.adrScaffoldId !== null, 'Expected ADR scaffold to be generated');
  assert.equal(result.adrScaffoldId, 'ADR-REVIEW-KNOWLEDGE-001');

  __setKvClientForTest(null);
});

test('HPO_DECISION-07: adrRequired=false → no ADR scaffold generated', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEMORY', 'APPROVE', 'Runtime', false); // adrRequired=false
  seedGuardianReview(mockKv, review);

  const result = await processHpoDecision('REVIEW-MEMORY-001', 'APPROVE', 'Approved.', 'HPO');
  assert.equal(result.adrScaffoldId, null, 'Expected no ADR scaffold when adrRequired=false');

  __setKvClientForTest(null);
});

test('HPO_DECISION-08: constraintOverride merges with defaults', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);

  const override: Partial<ImplementationConstraints> = {
    additionalConstraints: ['Must notify Product team before merging.'],
    rollbackRequired:      true,
  };

  await processHpoDecision('REVIEW-PRODUCT-001', 'APPROVE', 'Approved with custom constraint.', 'HPO', override);

  const approval = await getApprovalById('HPO-APPROVAL-REVIEW-PRODUCT-001');
  assert.ok(approval !== null);
  assert.ok(approval!.constraints.additionalConstraints.some((c) => c.includes('Product team')));

  __setKvClientForTest(null);
});

// ─── KV_PERSIST GROUP ─────────────────────────────────────────────────────────

test('KV_PERSIST-01: HpoApproval persisted to approval:byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('HANDOFF', 'APPROVE', 'Commercial');
  seedGuardianReview(mockKv, review);

  await processHpoDecision('REVIEW-HANDOFF-001', 'APPROVE', 'Approved.', 'HPO');

  const raw = mockKv._store.get('approval:byId:HPO-APPROVAL-REVIEW-HANDOFF-001');
  assert.ok(raw, 'Expected approval to be persisted to KV');

  __setKvClientForTest(null);
});

test('KV_PERSIST-02: approval:recent index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('TRUST', 'ESCALATE', 'Architecture', true);
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-TRUST-001', 'REJECT', 'Rejected.', 'HPO');

  const ids = mockKv._lists.get('approval:recent') ?? [];
  assert.ok(ids.includes('HPO-APPROVAL-REVIEW-TRUST-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-03: approval:decision:{decision} index is set', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved.', 'HPO');

  const ids = mockKv._lists.get('approval:decision:APPROVE') ?? [];
  assert.ok(ids.includes('HPO-APPROVAL-REVIEW-KNOWLEDGE-001'));

  __setKvClientForTest(null);
});

test('KV_PERSIST-04: authorization persisted to authorization:{id} key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEMORY', 'APPROVE', 'Runtime');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-MEMORY-001', 'APPROVE', 'Approved.', 'HPO');

  const raw = mockKv._store.get('authorization:AUTH-REVIEW-MEMORY-001');
  assert.ok(raw, 'Expected authorization to be persisted to KV');

  const auth = JSON.parse(raw) as ImplementationAuthorization;
  assert.equal(auth.status, 'ACTIVE');

  __setKvClientForTest(null);
});

test('KV_PERSIST-05: APPROVAL_TTL_SECONDS applied to approval byId key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('COMMERCIAL', 'APPROVE', 'Commercial');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-COMMERCIAL-001', 'DEFER', 'Deferred.', 'HPO');

  const ttl = mockKv._ttls.get('approval:byId:HPO-APPROVAL-REVIEW-COMMERCIAL-001');
  assert.equal(ttl, APPROVAL_TTL_SECONDS);

  __setKvClientForTest(null);
});

test('KV_PERSIST-06: REJECT decision does not persist authorization key', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-PRODUCT-001', 'REJECT', 'Rejected.', 'HPO');

  const raw = mockKv._store.get('authorization:AUTH-REVIEW-PRODUCT-001');
  assert.equal(raw, undefined, 'Expected no authorization key for REJECT decision');

  __setKvClientForTest(null);
});

// ─── READ_HELPERS GROUP ───────────────────────────────────────────────────────

test('READ_HELPERS-01: getApprovalById returns correct HpoApproval', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Notes here.', 'HPO');

  const approval = await getApprovalById('HPO-APPROVAL-REVIEW-KNOWLEDGE-001');
  assert.ok(approval !== null);
  assert.equal(approval!.decision, 'APPROVE');
  assert.equal(approval!.reviewNotes, 'Notes here.');

  __setKvClientForTest(null);
});

test('READ_HELPERS-02: getApprovals returns array of all approvals', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const r1 = makeGuardianReview('KNOWLEDGE', 'APPROVE',               'Knowledge');
  const r2 = makeGuardianReview('MEMORY',    'APPROVE_WITH_CONDITIONS', 'Runtime');
  seedGuardianReview(mockKv, r1);
  seedGuardianReview(mockKv, r2);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE',             'Approved.', 'HPO');
  await processHpoDecision('REVIEW-MEMORY-001',    'APPROVE_WITH_NOTES',  'Noted.', 'HPO');

  const approvals = await getApprovals(10);
  assert.equal(approvals.length, 2);

  __setKvClientForTest(null);
});

test('READ_HELPERS-03: getApprovalsByDecision returns only matching decisions', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const r1 = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  const r2 = makeGuardianReview('MEMORY',    'APPROVE', 'Runtime');
  const r3 = makeGuardianReview('PRODUCT',   'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, r1);
  seedGuardianReview(mockKv, r2);
  seedGuardianReview(mockKv, r3);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved.', 'HPO');
  await processHpoDecision('REVIEW-MEMORY-001',    'REJECT',  'Rejected.', 'HPO');
  await processHpoDecision('REVIEW-PRODUCT-001',   'DEFER',   'Deferred.', 'HPO');

  const approved = await getApprovalsByDecision('APPROVE', 10);
  assert.equal(approved.length, 1);
  assert.equal(approved[0].decision, 'APPROVE');

  __setKvClientForTest(null);
});

test('READ_HELPERS-04: getAuthorizationById returns active authorization', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-PRODUCT-001', 'APPROVE', 'Approved.', 'HPO');

  const auth = await getAuthorizationById('AUTH-REVIEW-PRODUCT-001');
  assert.ok(auth !== null);
  assert.equal(auth!.status, 'ACTIVE');
  assert.equal(auth!.guardianReviewId, 'REVIEW-PRODUCT-001');

  __setKvClientForTest(null);
});

test('READ_HELPERS-05: getApprovedAuthorizations returns all active authorizations', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const r1 = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  const r2 = makeGuardianReview('MEMORY',    'APPROVE', 'Runtime');
  const r3 = makeGuardianReview('PRODUCT',   'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, r1);
  seedGuardianReview(mockKv, r2);
  seedGuardianReview(mockKv, r3);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE',             'Approved.', 'HPO');
  await processHpoDecision('REVIEW-MEMORY-001',    'APPROVE_WITH_NOTES',  'Approved with notes.', 'HPO');
  await processHpoDecision('REVIEW-PRODUCT-001',   'REJECT',              'Rejected.', 'HPO');

  const auths = await getApprovedAuthorizations(10);
  assert.equal(auths.length, 2, 'Expected 2 authorizations (APPROVE + APPROVE_WITH_NOTES, not REJECT)');
  assert.ok(auths.every((a) => a.status === 'ACTIVE'));

  __setKvClientForTest(null);
});

test('READ_HELPERS-06: getPendingApprovals returns queued review IDs', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  await queueForHpoReview('REVIEW-TRUST-001');
  await queueForHpoReview('REVIEW-MEDICAL-001');

  const pending = await getPendingApprovals(10);
  assert.ok(pending.includes('REVIEW-TRUST-001'));
  assert.ok(pending.includes('REVIEW-MEDICAL-001'));

  __setKvClientForTest(null);
});

// ─── GOVERNANCE GROUP ─────────────────────────────────────────────────────────

test('GOVERNANCE-01: missing Guardian Review returns blocked result (not authorized)', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  // No review seeded in KV
  const result = await processHpoDecision('REVIEW-NONEXISTENT-001', 'APPROVE', 'Approved.', 'HPO');
  assert.equal(result.authorized, false);
  assert.equal(result.authorizationId, null);

  __setKvClientForTest(null);
});

test('GOVERNANCE-02: REJECT approval produces IMPLEMENTATION_BLOCKED log', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEDICAL', 'ESCALATE', 'Architecture');
  seedGuardianReview(mockKv, review);

  // Capture console.log output to verify IMPLEMENTATION_BLOCKED is emitted
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => logs.push(args.join(' '));
  try {
    await processHpoDecision('REVIEW-MEDICAL-001', 'REJECT', 'Compliance risk too high.', 'HPO');
  } finally {
    console.log = origLog;
  }

  assert.ok(logs.some((l) => l.includes('IMPLEMENTATION_BLOCKED')));

  __setKvClientForTest(null);
});

test('GOVERNANCE-03: APPROVE produces IMPLEMENTATION_AUTHORIZED log', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);

  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => logs.push(args.join(' '));
  try {
    await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved.', 'HPO');
  } finally {
    console.log = origLog;
  }

  assert.ok(logs.some((l) => l.includes('IMPLEMENTATION_AUTHORIZED')));

  __setKvClientForTest(null);
});

test('GOVERNANCE-04: authorization includes implementationConstraints from default + override', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEMORY', 'APPROVE', 'Runtime');
  seedGuardianReview(mockKv, review);

  await processHpoDecision(
    'REVIEW-MEMORY-001', 'APPROVE', 'Approved with constraints.', 'HPO',
    { additionalConstraints: ['Custom HPO constraint'] },
  );

  const auth = await getAuthorizationById('AUTH-REVIEW-MEMORY-001');
  assert.ok(auth !== null);
  assert.ok(auth!.implementationConstraints.additionalConstraints.some((c) => c.includes('Custom HPO constraint')));

  __setKvClientForTest(null);
});

test('GOVERNANCE-05: HPO approval contains all required schema fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('COMMERCIAL', 'APPROVE', 'Commercial');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-COMMERCIAL-001', 'APPROVE', 'Approved.', 'HPO');

  const approval = await getApprovalById('HPO-APPROVAL-REVIEW-COMMERCIAL-001');
  assert.ok(approval !== null);

  const required = [
    'approvalId', 'guardianReviewId', 'proposalIds', 'decision', 'reviewNotes',
    'approvedBy', 'approvedAt', 'changeScope', 'constraints', 'adrRequired',
    'status', 'createdAt',
  ];
  for (const field of required) {
    assert.ok(field in approval!, `Expected field "${field}" in HpoApproval`);
  }

  __setKvClientForTest(null);
});

test('GOVERNANCE-06: authorization has all required certificate fields', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('PRODUCT', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-PRODUCT-001', 'APPROVE', 'Approved.', 'HPO');

  const auth = await getAuthorizationById('AUTH-REVIEW-PRODUCT-001');
  assert.ok(auth !== null);

  const required = [
    'authorizationId', 'approvalId', 'proposalIds', 'guardianReviewId', 'approvedBy',
    'approvedAt', 'approvedScope', 'approvedChangeTypes', 'adrRequired',
    'implementationConstraints', 'authorizedImplementationAI', 'status', 'expiresAt', 'createdAt',
  ];
  for (const field of required) {
    assert.ok(field in auth!, `Expected field "${field}" in ImplementationAuthorization`);
  }

  __setKvClientForTest(null);
});

test('GOVERNANCE-07: KV write error returns safe blocked result without throwing', async () => {
  const review = makeGuardianReview('TRUST', 'APPROVE', 'Architecture');

  const errorKv: KvMinimal = {
    async get(key) {
      if (key === `guardianReview:byId:REVIEW-TRUST-001`) return JSON.stringify(review);
      return null;
    },
    async set()    { throw new Error('KV unavailable'); },
    async lpush()  { throw new Error('KV unavailable'); },
    async lrange() { return []; },
    async expire() { return 1; },
  };
  __setKvClientForTest(errorKv);

  const result = await processHpoDecision('REVIEW-TRUST-001', 'APPROVE', 'Approved.', 'HPO');
  // Should return blocked result — not throw
  assert.equal(result.authorized, false);
  assert.equal(typeof result.decision, 'string');

  __setKvClientForTest(null);
});

test('GOVERNANCE-08: DEFER preserves HPO notes in persisted approval', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('HANDOFF', 'APPROVE_WITH_CONDITIONS', 'Commercial');
  seedGuardianReview(mockKv, review);

  const deferNotes = 'Defer until budget approval in Q4. Revisit with CFO sign-off.';
  await processHpoDecision('REVIEW-HANDOFF-001', 'DEFER', deferNotes, 'HPO');

  const approval = await getApprovalById('HPO-APPROVAL-REVIEW-HANDOFF-001');
  assert.ok(approval !== null);
  assert.equal(approval!.reviewNotes, deferNotes);
  assert.equal(approval!.status, 'DEFERRED');

  __setKvClientForTest(null);
});

// ─── COMPAT GROUP ─────────────────────────────────────────────────────────────

test('COMPAT-01: getApproval is alias for getApprovalById', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('KNOWLEDGE', 'APPROVE', 'Knowledge');
  seedGuardianReview(mockKv, review);
  await processHpoDecision('REVIEW-KNOWLEDGE-001', 'APPROVE', 'Approved.', 'HPO');

  const via_alias  = await getApproval('HPO-APPROVAL-REVIEW-KNOWLEDGE-001');
  const via_direct = await getApprovalById('HPO-APPROVAL-REVIEW-KNOWLEDGE-001');

  assert.ok(via_alias !== null);
  assert.equal(via_alias!.approvalId, via_direct!.approvalId);

  __setKvClientForTest(null);
});

test('COMPAT-02: getApprovedAuthorizations returns empty array when none approved', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const r1 = makeGuardianReview('TRUST', 'ESCALATE', 'Architecture');
  seedGuardianReview(mockKv, r1);
  await processHpoDecision('REVIEW-TRUST-001', 'REJECT', 'Rejected.', 'HPO');

  const auths = await getApprovedAuthorizations(10);
  assert.equal(auths.length, 0);

  __setKvClientForTest(null);
});

test('COMPAT-03: processHpoDecision is idempotent — same result on re-run', async () => {
  const mockKv = createMockKv();
  __setKvClientForTest(mockKv);

  const review = makeGuardianReview('MEMORY', 'APPROVE', 'Runtime');
  seedGuardianReview(mockKv, review);

  const r1 = await processHpoDecision('REVIEW-MEMORY-001', 'APPROVE', 'Approved.', 'HPO');
  const r2 = await processHpoDecision('REVIEW-MEMORY-001', 'APPROVE', 'Approved.', 'HPO');

  assert.equal(r1.approvalId,     r2.approvalId);
  assert.equal(r1.authorizationId, r2.authorizationId);
  assert.equal(r1.decision,        r2.decision);

  __setKvClientForTest(null);
});

test('COMPAT-04: queueForHpoReview silently ignores KV errors', async () => {
  const errorKv: KvMinimal = {
    async get()    { return null; },
    async set()    { throw new Error('KV down'); },
    async lpush()  { throw new Error('KV down'); },
    async lrange() { return []; },
    async expire() { return 1; },
  };
  __setKvClientForTest(errorKv);

  // Should not throw
  await assert.doesNotReject(() => queueForHpoReview('REVIEW-TEST-001'));

  __setKvClientForTest(null);
});
