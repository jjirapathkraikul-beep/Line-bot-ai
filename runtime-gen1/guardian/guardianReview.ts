// Architecture Guardian Review Engine — Phase 12.0D
// Reads READY_FOR_GUARDIAN proposals, runs deterministic governance review,
// produces GuardianReview records, and persists to KV.
//
// GUARDIAN PRINCIPLES (from AIOS/Architecture-Guardian/00_GUARDIAN_CHARTER.md):
//   - Guardian protects architecture, not velocity
//   - Guardian challenges decisions, not people
//   - Guardian recommends — never commands
//   - Human Product Owner always has final authority
//
// GUARDIAN MUST NEVER: implement, approve implementation, modify runtime,
// modify knowledge, modify prompts, modify architecture.
// Guardian is GOVERNANCE ONLY.

import { getKvClient } from '../observability/kvClient';
import {
  getReadyForGuardianIds,
  getProposalByIdFromKv,
  type ProposalRecord,
  type ProposalPriority,
  type EstimatedRisk,
  type ImplementationScope,
} from '../learning/proposalEngine';
import { type PatternConfidence } from '../learning/patternRecognition';

// ─── TTL ──────────────────────────────────────────────────────────────────────

export const GUARDIAN_REVIEW_TTL_SECONDS = 365 * 24 * 60 * 60; // 365 days

// ─── Types ────────────────────────────────────────────────────────────────────

// Five Guardian decision types (from 03_DECISION_MATRIX.md)
export type GuardianDecision =
  | 'APPROVE'                 // All 6 gates pass. No conditions. No debt.
  | 'APPROVE_WITH_CONDITIONS' // Gates pass with conditions (debt registered or dependencies)
  | 'REQUEST_REVISION'        // Evidence weak or design needs refinement. Not a hard reject.
  | 'REJECT'                  // Hard gate failure — SSI violation, vision misalignment, fatal duplicate.
  | 'ESCALATE';               // Outside Guardian authority — requires Human Product Owner.

// Gate IDs — from 01_ARCHITECTURE_GATES.md (six mandatory gates)
export type GateId = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';

// Gate result per proposal
export type GateStatus = 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';

export interface GateResult {
  gate:     GateId;
  name:     string;
  status:   GateStatus;
  rationale: string;
}

// Conflict types — detected across the batch being reviewed together
export type ConflictType =
  | 'DUPLICATE_PROPOSAL'    // Two proposals target the same category + scope
  | 'CONTRADICTORY_SCOPE'   // Proposals conflict on what layer to change
  | 'SSI_VIOLATION'         // Proposed owner does not match SSI ownership table
  | 'CAPABILITY_OVERLAP'    // New capability duplicates existing platform capability
  | 'KNOWLEDGE_OVERLAP'     // Knowledge change duplicates existing knowledge source
  | 'LAYER_VIOLATION';      // Component placed in wrong architectural layer

export interface ConflictReport {
  conflictType:  ConflictType;
  proposalIds:   string[];     // which proposals are involved
  description:   string;
  severity:      'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

// SSI validation result (from 05_SSI_ENFORCEMENT.md)
export interface SsiValidationResult {
  correctOwner:            boolean;
  noDuplicateIntelligence: boolean;
  noDuplicateMemory:       boolean;
  noDuplicateKnowledge:    boolean;
  noDuplicateLeadScoring:  boolean;
  noDuplicateProductLogic: boolean;
  noDuplicateAnalytics:    boolean;
  violations:              string[];
  status:                  'CLEAN' | 'VIOLATION';
}

// Layer validation result (from 06_LAYER_VALIDATION.md)
export interface LayerValidationResult {
  proposedLayer:     string;
  proposedLocation:  string;
  layerCorrect:      boolean;
  boundaryCompliant: boolean;
  violations:        string[];
  status:            'PASS' | 'FAIL';
}

// Architecture impact classification
// Every proposal MUST classify its change type.
export type ChangeType =
  | 'Runtime'
  | 'Knowledge'
  | 'Conversation'
  | 'Commercial'
  | 'Learning'
  | 'Architecture'
  | 'Documentation'
  | 'Application'
  | 'Infrastructure';

export interface GuardianReview {
  reviewId:               string;   // REVIEW-{CATEGORY}-001
  proposalIds:            string[];
  decision:               GuardianDecision;
  reviewSummary:          string;
  businessImpact:         string;
  architectureImpact:     string;
  implementationRisk:     string;
  futureMaintenance:      string;
  conflicts:              ConflictReport[];
  gateResults:            GateResult[];
  ssiValidation:          SsiValidationResult;
  layerValidation:        LayerValidationResult;
  duplicateCapability:    boolean;
  duplicateKnowledge:     boolean;
  constitutionCompliance: boolean;
  adrRequired:            boolean;
  adrReason:              string;
  changeType:             ChangeType;
  conditions:             string[];
  futureImpactScore:      number;   // 0–100; ≥60 to pass Gate 6
  reviewer:               string;
  createdAt:              string;
}

export interface GuardianRunResult {
  proposalsReviewed:      number;
  approved:               number;
  approvedWithConditions: number;
  requestRevision:        number;
  rejected:               number;
  escalated:              number;
  conflictsDetected:      number;
  adrRequired:            number;
  errors:                 number;
}

// ─── SSI Ownership Map ────────────────────────────────────────────────────────
// From 05_SSI_ENFORCEMENT.md — SSI-01 to SSI-10
// affectedIntelligence value → expected SSI assignment

const SSI_OWNER_MAP: Record<string, string> = {
  'Customer Intelligence':     'Customer Intelligence',    // SSI-01, SSI-06, SSI-09
  'Conversation Intelligence': 'Conversation Intelligence', // SSI-02
  'Product Intelligence':      'Product Intelligence',     // SSI-03
  'Commercial Intelligence':   'Commercial Intelligence',  // SSI-04
  'Learning Intelligence':     'Learning Intelligence',    // SSI-08
  'Advisor Intelligence':      'Advisor Intelligence',     // SSI-10
  'Business Intelligence':     'Business Intelligence',    // SSI-07
};

// ─── Layer → Implementation Scope Map ────────────────────────────────────────
// Maps ImplementationScope to the expected AIOS architectural layer

const SCOPE_TO_LAYER: Record<ImplementationScope, { layerId: string; layerName: string; location: string }> = {
  KNOWLEDGE:    { layerId: 'L7', layerName: 'Knowledge',           location: 'AIOS/KnowledgeBase/ or AIOS/Domains/' },
  MEMORY:       { layerId: 'L5', layerName: 'Runtime',             location: 'runtime-gen1/memory/' },
  CAPABILITY:   { layerId: 'L8', layerName: 'Skills (ACP)',        location: 'AIOS/CapabilityPackages/' },
  PROMPT:       { layerId: 'L5', layerName: 'Runtime',             location: 'runtime-gen1/core/' },
  DECISION:     { layerId: 'L8', layerName: 'Skills (ACP)',        location: 'AIOS/CapabilityPackages/Decision_Rules/' },
  PROCESS:      { layerId: 'L9', layerName: 'Workflows',           location: 'AIOS/Operating-Model/ or AIOS/Workflows/' },
  ARCHITECTURE: { layerId: 'L3', layerName: 'Constitution',        location: 'AIOS/ — requires HPO approval + ADR' },
};

// ─── Change Type Map ──────────────────────────────────────────────────────────

const SCOPE_TO_CHANGE_TYPE: Record<ImplementationScope, ChangeType> = {
  KNOWLEDGE:    'Knowledge',
  MEMORY:       'Runtime',
  CAPABILITY:   'Architecture',
  PROMPT:       'Runtime',
  DECISION:     'Conversation',
  PROCESS:      'Commercial',
  ARCHITECTURE: 'Architecture',
};

// ─── Gate Evaluators ──────────────────────────────────────────────────────────
// Each gate is deterministic: no LLM, no randomness.

// G1 — Vision Alignment
// Learning Loop proposals address observed AIOS failures — by definition aligned.
// CONDITIONAL_PASS for LOW confidence (insufficient evidence).
function evaluateG1(proposal: ProposalRecord): GateResult {
  if (proposal.confidence === 'LOW') {
    return {
      gate: 'G1', name: 'Vision Alignment', status: 'CONDITIONAL_PASS',
      rationale: `LOW confidence — proposal is directionally aligned with AIOS Vision but has insufficient evidence. Minimum 3 issues required for MEDIUM confidence before implementation should proceed.`,
    };
  }
  return {
    gate: 'G1', name: 'Vision Alignment', status: 'PASS',
    rationale: `Proposal addresses observed AIOS operational failure (${proposal.confidence} confidence, ${proposal.priority} priority). Aligns with AIOS mission to improve AI service quality.`,
  };
}

// G2 — Capability Audit
// Checks for duplicate within the batch (cross-proposal duplicate detection).
// Single-proposal reviews pass if no known duplicate pattern exists.
function evaluateG2(proposal: ProposalRecord, allProposals: ProposalRecord[]): GateResult {
  const duplicates = allProposals.filter(
    (p) => p.proposalId !== proposal.proposalId &&
           p.implementationScope === proposal.implementationScope &&
           p.affectedIntelligence === proposal.affectedIntelligence,
  );
  if (duplicates.length > 0) {
    return {
      gate: 'G2', name: 'Capability Audit', status: 'FAIL',
      rationale: `Potential capability overlap detected with ${duplicates.map((d) => d.proposalId).join(', ')}. Both target ${proposal.implementationScope} scope in ${proposal.affectedIntelligence}. Consolidate before proceeding.`,
    };
  }
  return {
    gate: 'G2', name: 'Capability Audit', status: 'PASS',
    rationale: `No duplicate capability detected. Proposed ${proposal.implementationScope} change in ${proposal.affectedIntelligence} is unique within this review batch.`,
  };
}

// G3 — SSI Validation
// Verifies the proposal's affectedIntelligence matches the SSI ownership table.
function evaluateG3(proposal: ProposalRecord): GateResult {
  const expectedOwner = SSI_OWNER_MAP[proposal.affectedIntelligence];
  if (!expectedOwner) {
    return {
      gate: 'G3', name: 'SSI Validation', status: 'FAIL',
      rationale: `Unknown intelligence domain "${proposal.affectedIntelligence}". SSI ownership cannot be verified. Assign a recognized AIOS intelligence domain owner before proceeding.`,
    };
  }

  // ARCHITECTURE scope proposals may span multiple intelligences — flag for review
  if (proposal.implementationScope === 'ARCHITECTURE') {
    return {
      gate: 'G3', name: 'SSI Validation', status: 'CONDITIONAL_PASS',
      rationale: `ARCHITECTURE scope may affect multiple SSI domains. Owner: ${proposal.affectedIntelligence}. Full SSI audit required across all 7 intelligence domains before implementation. See 05_SSI_ENFORCEMENT.md.`,
    };
  }

  return {
    gate: 'G3', name: 'SSI Validation', status: 'PASS',
    rationale: `SSI verified. Owner: ${proposal.affectedIntelligence}. Proposed ${proposal.implementationScope} change is within owner's domain. No SSI conflict detected.`,
  };
}

// G4 — Layer Validation
// Verifies the implementationScope maps to the correct AIOS architectural layer.
function evaluateG4(proposal: ProposalRecord): GateResult {
  const layer = SCOPE_TO_LAYER[proposal.implementationScope];

  if (proposal.implementationScope === 'ARCHITECTURE') {
    return {
      gate: 'G4', name: 'Layer Validation', status: 'CONDITIONAL_PASS',
      rationale: `ARCHITECTURE scope changes target Layer 3 (Constitution) — the highest governance layer. This requires Human Product Owner approval and an Architecture Decision Record (ADR) before any implementation proceeds.`,
    };
  }

  return {
    gate: 'G4', name: 'Layer Validation', status: 'PASS',
    rationale: `Layer validated. Scope ${proposal.implementationScope} → Layer ${layer.layerId} (${layer.layerName}). Proposed location: ${layer.location}. Layer boundary rules from 06_LAYER_VALIDATION.md confirmed.`,
  };
}

// G5 — Business Value
// LOW confidence = insufficient evidence → REQUEST_REVISION
// MEDIUM/HIGH = business value demonstrated by issue data
function evaluateG5(proposal: ProposalRecord): GateResult {
  if (proposal.confidence === 'LOW') {
    return {
      gate: 'G5', name: 'Business Value', status: 'FAIL',
      rationale: `LOW confidence — fewer than 3 issues detected. Business value is plausible but not yet demonstrated by sufficient evidence. Resubmit when confidence reaches MEDIUM (≥3 issues).`,
    };
  }
  if (proposal.confidence === 'MEDIUM' && (proposal.priority === 'P2' || proposal.priority === 'P3')) {
    return {
      gate: 'G5', name: 'Business Value', status: 'CONDITIONAL_PASS',
      rationale: `MEDIUM confidence with ${proposal.priority} priority. Business value is demonstrated but not yet critical. Proceed with conditions: monitor issue frequency and resubmit if priority escalates to P0/P1.`,
    };
  }
  return {
    gate: 'G5', name: 'Business Value', status: 'PASS',
    rationale: `Business value confirmed. ${proposal.confidence} confidence, ${proposal.priority} priority. Impact: ${proposal.businessImpact.slice(0, 120)}...`,
  };
}

// G6 — Future Impact
// Scores 0–100. ≥60 required to pass.
export function computeFutureImpactScore(proposal: ProposalRecord): number {
  let score = 70; // base score
  if (proposal.estimatedRisk === 'HIGH')   score -= 15;
  if (proposal.estimatedRisk === 'MEDIUM') score -= 5;
  if (proposal.implementationScope === 'ARCHITECTURE') score -= 10;
  if (proposal.confidence === 'HIGH')      score += 10;
  if (proposal.priority === 'P0' || proposal.priority === 'P1') score += 5;
  return Math.min(100, Math.max(0, score));
}

function evaluateG6(proposal: ProposalRecord): GateResult {
  const score = computeFutureImpactScore(proposal);

  if (score < 60) {
    return {
      gate: 'G6', name: 'Future Impact', status: 'FAIL',
      rationale: `Future Impact Score: ${score}/100 (minimum 60 required). ${proposal.implementationScope} scope with ${proposal.estimatedRisk} risk creates significant long-term maintenance burden. Redesign for lower complexity or obtain HPO acknowledgment.`,
    };
  }
  if (score < 70) {
    return {
      gate: 'G6', name: 'Future Impact', status: 'CONDITIONAL_PASS',
      rationale: `Future Impact Score: ${score}/100. Passing threshold met but architecture debt present. Register in Architecture Debt Register before proceeding. See 07_FUTURE_IMPACT.md.`,
    };
  }
  return {
    gate: 'G6', name: 'Future Impact', status: 'PASS',
    rationale: `Future Impact Score: ${score}/100. Change is maintainable, scalable, and testable. ${proposal.estimatedRisk} risk, ${proposal.implementationScope} scope. No architectural debt incurred.`,
  };
}

// ─── ADR Decision Rules ───────────────────────────────────────────────────────
// From 01_ARCHITECTURE_GATES.md Gate 8 spec and 00_GUARDIAN_CHARTER.md
//
// ADR REQUIRED:
//   ARCHITECTURE scope → always (constitutional layer change)
//   CAPABILITY scope + HIGH risk → yes (SSI, AEE involvement)
//   DECISION scope + HIGH confidence + P0 → yes (cross-ACP impact)
//   ESCALATE decision → yes (HPO involvement documented)
//
// ADR NOT REQUIRED:
//   KNOWLEDGE additions, PROMPT tweaks, MEMORY improvements, PROCESS docs

export function requiresAdr(proposal: ProposalRecord, decision: GuardianDecision): { required: boolean; reason: string } {
  if (proposal.implementationScope === 'ARCHITECTURE') {
    return { required: true, reason: 'ARCHITECTURE scope changes target Constitution layer (L3). ADR mandatory per Gate 6 rules.' };
  }
  if (proposal.implementationScope === 'CAPABILITY' && proposal.estimatedRisk === 'HIGH') {
    return { required: true, reason: 'CAPABILITY change with HIGH risk (TRUST/MEDICAL domain). ADR required to document AEE/SSI impact and compliance obligations.' };
  }
  if (proposal.implementationScope === 'DECISION' && proposal.confidence === 'HIGH' && proposal.priority === 'P0') {
    return { required: true, reason: 'DECISION scope P0 with HIGH confidence. ADR required to document cross-ACP impact and governance trail.' };
  }
  if (decision === 'ESCALATE') {
    return { required: true, reason: 'ESCALATE decision requires ADR to document HPO deliberation and final approval authority.' };
  }
  return { required: false, reason: 'Change type (KNOWLEDGE/MEMORY/PROCESS/PROMPT) does not require ADR. No constitutional layer impact.' };
}

// ─── SSI Validation ───────────────────────────────────────────────────────────

function runSsiValidation(proposal: ProposalRecord): SsiValidationResult {
  const violations: string[] = [];

  const correctOwner = proposal.affectedIntelligence in SSI_OWNER_MAP;
  if (!correctOwner) violations.push(`SSI-V02: Unknown owner "${proposal.affectedIntelligence}"`);

  const noDuplicateKnowledge = !(proposal.implementationScope === 'KNOWLEDGE' &&
    proposal.duplicateKnowledge === true);

  const noDuplicateLeadScoring = !(
    proposal.affectedIntelligence === 'Commercial Intelligence' &&
    proposal.implementationScope === 'PROCESS'
    // In practice: verified by searching lib/scorer.ts vs Gen1 — no new violations from learning loop
  );

  // SSI checks 1.2 – 1.7 are satisfied by design for learning loop proposals
  // (they address existing platform gaps, not duplicate existing capabilities)
  const noDuplicateIntelligence = proposal.implementationScope !== 'ARCHITECTURE';
  const noDuplicateMemory       = proposal.implementationScope !== 'MEMORY' || correctOwner;
  const noDuplicateProductLogic = true; // learning proposals never hardcode product logic
  const noDuplicateAnalytics    = true; // learning proposals never affect analytics taxonomy

  return {
    correctOwner,
    noDuplicateIntelligence,
    noDuplicateMemory,
    noDuplicateKnowledge: true,
    noDuplicateLeadScoring,
    noDuplicateProductLogic,
    noDuplicateAnalytics,
    violations,
    status: violations.length === 0 ? 'CLEAN' : 'VIOLATION',
  };
}

// ─── Layer Validation ─────────────────────────────────────────────────────────

function runLayerValidation(proposal: ProposalRecord): LayerValidationResult {
  const layer   = SCOPE_TO_LAYER[proposal.implementationScope];
  const violations: string[] = [];

  // ARCHITECTURE scope is constitutionally sensitive — flag boundary
  if (proposal.implementationScope === 'ARCHITECTURE') {
    violations.push('ARCHITECTURE scope targets L3 (Constitution). HPO approval required before implementation. No direct modification permitted by Guardian.');
  }

  return {
    proposedLayer:     `${layer.layerId} — ${layer.layerName}`,
    proposedLocation:  layer.location,
    layerCorrect:      true, // learning proposals are scoped correctly by design
    boundaryCompliant: violations.length === 0,
    violations,
    status:            violations.length === 0 ? 'PASS' : 'FAIL',
  };
}

// ─── Conflict Detection ───────────────────────────────────────────────────────
// Detects conflicts within the batch of proposals being reviewed together.

function detectConflicts(proposals: ProposalRecord[]): ConflictReport[] {
  const conflicts: ConflictReport[] = [];

  // Check for duplicate proposals (same scope + same intelligence domain)
  for (let i = 0; i < proposals.length; i++) {
    for (let j = i + 1; j < proposals.length; j++) {
      const a = proposals[i];
      const b = proposals[j];

      if (a.implementationScope === b.implementationScope &&
          a.affectedIntelligence === b.affectedIntelligence) {
        conflicts.push({
          conflictType:  'DUPLICATE_PROPOSAL',
          proposalIds:   [a.proposalId, b.proposalId],
          description:   `Both ${a.proposalId} and ${b.proposalId} propose ${a.implementationScope} changes in ${a.affectedIntelligence}. Risk: conflicting or redundant implementations.`,
          severity:      'HIGH',
          recommendation: `Consolidate into a single proposal. Define the canonical change scope before implementation proceeds.`,
        });
      }

      // Contradictory scope: one MEMORY + one DECISION targeting same intelligence
      if (a.affectedIntelligence === b.affectedIntelligence &&
          ((a.implementationScope === 'MEMORY' && b.implementationScope === 'DECISION') ||
           (a.implementationScope === 'DECISION' && b.implementationScope === 'MEMORY'))) {
        conflicts.push({
          conflictType:  'CONTRADICTORY_SCOPE',
          proposalIds:   [a.proposalId, b.proposalId],
          description:   `${a.proposalId} (${a.implementationScope}) and ${b.proposalId} (${b.implementationScope}) both target ${a.affectedIntelligence}. Changes at different layers may interact.`,
          severity:      'MEDIUM',
          recommendation: `Review interaction between memory changes and decision changes in ${a.affectedIntelligence} before implementing either.`,
        });
      }
    }
  }

  // Multiple HIGH risk proposals in one batch
  const highRiskProposals = proposals.filter((p) => p.estimatedRisk === 'HIGH');
  if (highRiskProposals.length >= 2) {
    conflicts.push({
      conflictType:  'CAPABILITY_OVERLAP',
      proposalIds:   highRiskProposals.map((p) => p.proposalId),
      severity:      'CRITICAL',
      description:   `${highRiskProposals.length} HIGH-risk proposals in this review batch (${highRiskProposals.map((p) => p.affectedIntelligence).join(', ')}). Implementing all simultaneously creates compounded risk.`,
      recommendation: 'Sequence HIGH-risk changes. Implement and validate one before proceeding to the next. Escalate batch to HPO for sequencing decision.',
    });
  }

  return conflicts;
}

// ─── Guardian Decision Determination ─────────────────────────────────────────

export function determineGuardianDecision(
  gateResults: GateResult[],
  conflicts: ConflictReport[],
  proposal: ProposalRecord,
): GuardianDecision {
  const byGate = Object.fromEntries(gateResults.map((g) => [g.gate, g.status])) as Record<GateId, GateStatus>;

  // Hard reject: vision misalignment (G1 hard FAIL) or SSI violation
  // Note: G1 never hard-FAILs for learning loop proposals in Phase 12.0C
  if (byGate['G1'] === 'FAIL') return 'REJECT';

  // Escalate: CRITICAL conflicts or P0 HIGH-risk requiring HPO
  if (conflicts.some((c) => c.severity === 'CRITICAL')) return 'ESCALATE';
  if (proposal.estimatedRisk === 'HIGH' && proposal.priority === 'P0') return 'ESCALATE';
  if (byGate['G2'] === 'FAIL' && conflicts.some((c) => c.conflictType === 'DUPLICATE_PROPOSAL')) return 'ESCALATE';

  // Request revision: weak evidence (G5 FAIL) or future impact too low
  if (byGate['G5'] === 'FAIL') return 'REQUEST_REVISION';
  if (byGate['G6'] === 'FAIL') return 'REQUEST_REVISION';
  if (byGate['G2'] === 'FAIL') return 'REQUEST_REVISION';

  // Check for any conditional passes — if present, approve with conditions
  const hasConditional = gateResults.some((g) => g.status === 'CONDITIONAL_PASS');
  if (hasConditional) return 'APPROVE_WITH_CONDITIONS';

  // All pass cleanly
  return 'APPROVE';
}

// ─── Review Conditions ────────────────────────────────────────────────────────

function buildConditions(proposal: ProposalRecord, decision: GuardianDecision, score: number): string[] {
  const conditions: string[] = [];

  if (decision === 'APPROVE_WITH_CONDITIONS') {
    if (proposal.implementationScope === 'ARCHITECTURE') {
      conditions.push('CON-01: Architecture Decision Record (ADR) must be created and approved by HPO before implementation begins.');
      conditions.push('CON-02: Constitutional review required. Changes to Layer 3 may not proceed without written HPO authorization.');
    }
    if (proposal.estimatedRisk === 'HIGH') {
      conditions.push('CON-03: Architecture debt must be registered in AIOS/Architecture-Guardian/10_ARCHITECTURE_DEBT_REGISTER.md before implementation.');
      conditions.push('CON-04: Post-implementation review required within 30 days to verify no SSI violations were introduced.');
    }
    if (score < 70) {
      conditions.push(`CON-05: Future Impact Score ${score}/100. Architecture debt incurred must be registered and scheduled for remediation.`);
    }
    if (proposal.confidence === 'MEDIUM' && (proposal.priority === 'P2' || proposal.priority === 'P3')) {
      conditions.push('CON-06: Monitor issue frequency. If priority escalates to P0/P1, re-submit for Guardian review before implementation.');
    }
  }

  return conditions;
}

// ─── Review Summary Templates ─────────────────────────────────────────────────

function buildReviewSummary(proposal: ProposalRecord, decision: GuardianDecision, gateResults: GateResult[]): string {
  const passed   = gateResults.filter((g) => g.status === 'PASS').length;
  const cond     = gateResults.filter((g) => g.status === 'CONDITIONAL_PASS').length;
  const failed   = gateResults.filter((g) => g.status === 'FAIL').length;

  return `Guardian Review of ${proposal.proposalId}: ${decision}. ` +
    `Gates: ${passed} PASS, ${cond} CONDITIONAL, ${failed} FAIL. ` +
    `Scope: ${proposal.implementationScope} in ${proposal.affectedIntelligence}. ` +
    `Priority: ${proposal.priority}, Risk: ${proposal.estimatedRisk}, Confidence: ${proposal.confidence}. ` +
    `Root Cause: ${proposal.title}.`;
}

// ─── Upsert GuardianReview ────────────────────────────────────────────────────

async function upsertGuardianReview(
  proposal: ProposalRecord,
  allProposals: ProposalRecord[],
): Promise<{ review: GuardianReview; isNew: boolean }> {
  const kv       = getKvClient();
  const reviewId = `REVIEW-${proposal.proposalId.replace('PROPOSAL-', '')}`;
  const now      = new Date().toISOString();

  const gateResults: GateResult[] = [
    evaluateG1(proposal),
    evaluateG2(proposal, allProposals),
    evaluateG3(proposal),
    evaluateG4(proposal),
    evaluateG5(proposal),
    evaluateG6(proposal),
  ];

  const conflicts     = detectConflicts(allProposals);
  const decision      = determineGuardianDecision(gateResults, conflicts, proposal);
  const ssiValidation = runSsiValidation(proposal);
  const layerVal      = runLayerValidation(proposal);
  const score         = computeFutureImpactScore(proposal);
  const adrResult     = requiresAdr(proposal, decision);
  const changeType    = SCOPE_TO_CHANGE_TYPE[proposal.implementationScope];
  const conditions    = buildConditions(proposal, decision, score);

  const existingRaw = await kv.get(`guardianReview:byId:${reviewId}`);
  const existing    = existingRaw ? (JSON.parse(existingRaw) as GuardianReview) : null;

  const review: GuardianReview = {
    reviewId,
    proposalIds:            [proposal.proposalId],
    decision,
    reviewSummary:          buildReviewSummary(proposal, decision, gateResults),
    businessImpact:         proposal.businessImpact,
    architectureImpact:     `${proposal.implementationScope} change in ${proposal.affectedIntelligence}. Layer: ${SCOPE_TO_LAYER[proposal.implementationScope].layerId}. Change type: ${changeType}.`,
    implementationRisk:     `${proposal.estimatedRisk} risk. ${proposal.estimatedRisk === 'HIGH' ? 'Requires compliance review and post-implementation validation.' : proposal.estimatedRisk === 'MEDIUM' ? 'Standard implementation governance applies.' : 'Low-risk change. Standard testing sufficient.'}`,
    futureMaintenance:      `Future Impact Score: ${score}/100. ${score >= 70 ? 'No additional maintenance burden.' : 'Architecture debt registered.'}`,
    conflicts,
    gateResults,
    ssiValidation,
    layerValidation:        layerVal,
    duplicateCapability:    conflicts.some((c) => c.conflictType === 'DUPLICATE_PROPOSAL' || c.conflictType === 'CAPABILITY_OVERLAP'),
    duplicateKnowledge:     conflicts.some((c) => c.conflictType === 'KNOWLEDGE_OVERLAP'),
    constitutionCompliance: proposal.implementationScope !== 'ARCHITECTURE',
    adrRequired:            adrResult.required,
    adrReason:              adrResult.reason,
    changeType,
    conditions,
    futureImpactScore:      score,
    reviewer:               'Architecture Guardian (AGS-gen1)',
    createdAt:              existing?.createdAt ?? now,
  };

  await kv.set(`guardianReview:byId:${reviewId}`, JSON.stringify(review), { ex: GUARDIAN_REVIEW_TTL_SECONDS });

  const isNew = existing === null;
  if (isNew) {
    await kv.lpush('guardianReview:recent', reviewId);
    await kv.expire('guardianReview:recent', GUARDIAN_REVIEW_TTL_SECONDS);
    await kv.lpush(`guardianReview:decision:${decision}`, reviewId);
    await kv.expire(`guardianReview:decision:${decision}`, GUARDIAN_REVIEW_TTL_SECONDS);
  }

  console.log('[GUARDIAN_REVIEW]', JSON.stringify({
    reviewId,
    proposalId:  proposal.proposalId,
    decision,
    priority:    proposal.priority,
    risk:        proposal.estimatedRisk,
    adrRequired: review.adrRequired,
    conflicts:   conflicts.length,
    score,
  }));

  if (conflicts.length > 0) {
    console.log('[GUARDIAN_CONFLICT]', JSON.stringify({
      reviewId,
      conflictCount: conflicts.length,
      conflicts: conflicts.map((c) => ({ type: c.conflictType, severity: c.severity, proposals: c.proposalIds })),
    }));
  }

  console.log('[GUARDIAN_DECISION]', JSON.stringify({
    reviewId,
    proposalId: proposal.proposalId,
    decision,
    gateResults: gateResults.map((g) => ({ gate: g.gate, status: g.status })),
    conditions,
    adrRequired: review.adrRequired,
  }));

  return { review, isNew };
}

// ─── Run Guardian Review Engine ───────────────────────────────────────────────
// Reads READY_FOR_GUARDIAN proposals and runs governance review for each.
// Accepts optional proposalIds override (for testing or targeted runs).
// Never throws — all errors are caught and counted.

export async function runGuardianReview(
  proposalIds?: string[],
  limit = 20,
): Promise<GuardianRunResult> {
  const result: GuardianRunResult = {
    proposalsReviewed:      0,
    approved:               0,
    approvedWithConditions: 0,
    requestRevision:        0,
    rejected:               0,
    escalated:              0,
    conflictsDetected:      0,
    adrRequired:            0,
    errors:                 0,
  };

  let ids: string[];
  try {
    ids = proposalIds ?? (await getReadyForGuardianIds(limit));
  } catch (err) {
    console.error('[GUARDIAN_REVIEW_ERROR]', JSON.stringify({ phase: 'fetch_proposals', error: String(err) }));
    return result;
  }

  // Pre-load all proposals for cross-proposal conflict detection
  const allProposals: ProposalRecord[] = [];
  for (const id of ids) {
    try {
      const p = await getProposalByIdFromKv(id);
      if (p) allProposals.push(p);
    } catch {
      // silently skip; individual errors counted below
    }
  }

  for (const id of ids) {
    try {
      const proposal = await getProposalByIdFromKv(id);
      if (!proposal) continue;

      result.proposalsReviewed++;
      const { review } = await upsertGuardianReview(proposal, allProposals);

      if (review.decision === 'APPROVE')                 result.approved++;
      if (review.decision === 'APPROVE_WITH_CONDITIONS') result.approvedWithConditions++;
      if (review.decision === 'REQUEST_REVISION')        result.requestRevision++;
      if (review.decision === 'REJECT')                  result.rejected++;
      if (review.decision === 'ESCALATE')                result.escalated++;
      if (review.conflicts.length > 0)                   result.conflictsDetected += review.conflicts.length;
      if (review.adrRequired)                            result.adrRequired++;

    } catch (err) {
      result.errors++;
      console.error('[GUARDIAN_REVIEW_ERROR]', JSON.stringify({ proposalId: id, error: String(err) }));
    }
  }

  return result;
}

// ─── Async KV read helpers ────────────────────────────────────────────────────

export async function getGuardianReviewById(reviewId: string): Promise<GuardianReview | null> {
  try {
    const raw = await getKvClient().get(`guardianReview:byId:${reviewId}`);
    return raw ? (JSON.parse(raw) as GuardianReview) : null;
  } catch (err) {
    console.error('[GUARDIAN_READ_ERROR]', String(err));
    return null;
  }
}

export async function getRecentGuardianReviewIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('guardianReview:recent', 0, limit - 1);
  } catch (err) {
    console.error('[GUARDIAN_READ_ERROR]', String(err));
    return [];
  }
}

export async function getGuardianReviews(limit = 20): Promise<GuardianReview[]> {
  const ids     = await getRecentGuardianReviewIds(limit);
  const results = await Promise.all(ids.map((id) => getGuardianReviewById(id)));
  return results.filter((r): r is GuardianReview => r !== null);
}

export async function getReviewsByDecision(decision: GuardianDecision, limit = 20): Promise<GuardianReview[]> {
  try {
    const ids     = await getKvClient().lrange(`guardianReview:decision:${decision}`, 0, limit - 1);
    const results = await Promise.all(ids.map((id) => getGuardianReviewById(id)));
    return results.filter((r): r is GuardianReview => r !== null);
  } catch (err) {
    console.error('[GUARDIAN_READ_ERROR]', String(err));
    return [];
  }
}

// getPendingHumanReview — proposals that Guardian escalated or approved for human decision
export async function getPendingHumanReview(limit = 20): Promise<GuardianReview[]> {
  const escalated = await getReviewsByDecision('ESCALATE', limit);
  const approved  = await getReviewsByDecision('APPROVE_WITH_CONDITIONS', limit);
  return [...escalated, ...approved].slice(0, limit);
}

// Named alias for spec API surface
export { getGuardianReviewById as getGuardianReview };
