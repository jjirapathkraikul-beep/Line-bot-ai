// Human Product Owner Approval Engine — Phase 12.0E
// Completes the AIOS Learning Governance Loop.
//
// CONSTITUTIONAL PRINCIPLE:
//   Implementation AI may execute only after receiving a valid
//   Implementation Authorization Certificate issued by the Human Product Owner.
//   This is a constitutional rule of AIOS. No exceptions.
//
// GOVERNANCE HIERARCHY:
//   Human Product Owner   → Supreme authority. Final word.
//   Architecture Guardian → Reviews, recommends, never authorizes.
//   Learning Intelligence → Proposes, never authorizes.
//   Implementation AI     → Executes only after valid authorization.
//
// THIS MODULE:
//   - Never executes changes
//   - Never approves on behalf of HPO
//   - Never modifies runtime, prompts, knowledge, memory, or decisions
//   - Governance only

import { getKvClient } from '../observability/kvClient';
import {
  getGuardianReviewById,
  type GuardianReview,
  type ChangeType,
} from '../guardian/guardianReview';
import { type ImplementationScope } from '../learning/proposalEngine';

// ─── TTL ──────────────────────────────────────────────────────────────────────

export const APPROVAL_TTL_SECONDS = 365 * 24 * 60 * 60; // 365 days

// Authorization validity window — HPO authorization expires in 30 days if unused
export const AUTHORIZATION_EXPIRY_DAYS = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

// Five decisions only the Human Product Owner may produce.
// No AI system may produce these states on behalf of the HPO.
export type HpoDecision =
  | 'APPROVE'              // Full approval. Implementation may proceed.
  | 'APPROVE_WITH_NOTES'   // Approved with implementation notes and constraints.
  | 'REJECT'               // Implementation blocked. Proposal archived.
  | 'DEFER'                // Decision deferred. Return when conditions are met.
  | 'RETURN_TO_GUARDIAN';  // Return to Architecture Guardian for additional review.

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'APPROVED_WITH_NOTES'
  | 'REJECTED'
  | 'DEFERRED'
  | 'RETURNED_TO_GUARDIAN';

export type AuthorizationStatus =
  | 'ACTIVE'     // Implementation may proceed
  | 'EXPIRED'    // Authorization window elapsed without implementation
  | 'REVOKED'    // HPO revoked post-issuance
  | 'CONSUMED';  // Implementation completed and verified

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Every HPO authorization MUST define these constraints.
// Implementation AI must obey them without exception.
export interface ImplementationConstraints {
  allowedFiles:          string[];  // file paths / globs permitted for modification
  forbiddenFiles:        string[];  // file paths / globs that must NOT be touched
  maximumScope:          string;    // human-readable description of max permitted scope
  rollbackRequired:      boolean;   // must have tested rollback plan before merging
  testingRequired:       boolean;   // all tests must pass before implementation is complete
  documentationRequired: boolean;   // relevant docs must be updated as part of implementation
  migrationRequired:     boolean;   // data migration needed (e.g., KV schema change)
  additionalConstraints: string[];  // any HPO-specified constraints beyond the above
}

// Implementation Authorization Certificate — the ONLY artifact that authorizes work.
// Implementation AI must present this certificate to any reviewer before merging.
export interface ImplementationAuthorization {
  authorizationId:            string;
  approvalId:                 string;
  proposalIds:                string[];
  guardianReviewId:           string;
  approvedBy:                 string;       // 'Human Product Owner'
  approvedAt:                 string;
  approvedScope:              string;
  approvedChangeTypes:        ChangeType[];
  adrRequired:                boolean;
  implementationConstraints:  ImplementationConstraints;
  authorizedImplementationAI: string;       // who is authorized to implement
  status:                     AuthorizationStatus;
  expiresAt:                  string;       // AUTHORIZATION_EXPIRY_DAYS from approvedAt
  createdAt:                  string;
}

// Draft ADR scaffold — generated automatically when Guardian indicates adrRequired = true.
// Draft only — never auto-approved. HPO must review and finalize.
export interface AdrScaffold {
  adrId:             string;   // ADR-{reviewId}
  title:             string;
  status:            'DRAFT';  // Always DRAFT. Human must finalize.
  context:           string;   // from pattern/root cause evidence
  decision:          string;   // intentionally blank — HPO fills this in
  alternatives:      string[]; // from Guardian's analysis
  consequences:      string;   // from Guardian's risk assessment
  relatedProposal:   string;   // proposalId
  guardianFindings:  string;   // summary of Guardian gate results
  humanDecision:     string;   // HPO decision and any conditions/notes
  createdAt:         string;
}

// Complete HPO Approval record
export interface HpoApproval {
  approvalId:                  string;    // HPO-APPROVAL-{reviewId}
  guardianReviewId:            string;
  proposalIds:                 string[];
  decision:                    HpoDecision;
  reviewNotes:                 string;
  implementationAuthorization: ImplementationAuthorization | null; // only on APPROVE/APPROVE_WITH_NOTES
  approvedBy:                  string;
  approvedAt:                  string;
  changeScope:                 string;
  constraints:                 ImplementationConstraints;
  adrRequired:                 boolean;
  adrScaffold:                 AdrScaffold | null; // generated when adrRequired = true
  status:                      ApprovalStatus;
  createdAt:                   string;
}

export interface HpoApprovalResult {
  approvalId:      string;
  decision:        HpoDecision;
  status:          ApprovalStatus;
  authorized:      boolean;  // true only for APPROVE / APPROVE_WITH_NOTES
  authorizationId: string | null;
  adrScaffoldId:   string | null;
}

// ─── Constraint Templates ─────────────────────────────────────────────────────
// Deterministic constraint sets by ImplementationScope.
// HPO may override any field via the constraints parameter in processHpoDecision().

const CORE_FORBIDDEN = [
  'runtime-gen1/core/executeGen1.ts',
  'runtime-gen1/core/promptBuilder.ts',
  'runtime-gen1/core/contextBuilder.ts',
  'lib/**',
  'Applications/**',
];

export function buildDefaultConstraints(scope: ImplementationScope, _changeType: ChangeType): ImplementationConstraints {
  const base: ImplementationConstraints = {
    allowedFiles:          [],
    forbiddenFiles:        CORE_FORBIDDEN,
    maximumScope:          '',
    rollbackRequired:      true,
    testingRequired:       true,
    documentationRequired: true,
    migrationRequired:     false,
    additionalConstraints: [],
  };

  switch (scope) {
    case 'KNOWLEDGE':
      return {
        ...base,
        allowedFiles:          ['AIOS/KnowledgeBase/**', 'AIOS/Domains/**'],
        forbiddenFiles:        [...CORE_FORBIDDEN, 'runtime-gen1/**', 'AIOS/Architecture-Guardian/**'],
        maximumScope:          'Knowledge Base document updates only. No runtime code changes.',
        migrationRequired:     false,
        additionalConstraints: ['Knowledge content must be reviewed by Product Intelligence owner before merge.'],
      };

    case 'MEMORY':
      return {
        ...base,
        allowedFiles:          ['runtime-gen1/memory/**'],
        forbiddenFiles:        [...CORE_FORBIDDEN, 'runtime-gen1/decision/**', 'runtime-gen1/knowledge/**'],
        maximumScope:          'Memory resolver changes only. No changes to prompt building or decision logic.',
        migrationRequired:     true,
        additionalConstraints: ['Run KV persistence tests. Verify session field extraction before and after.'],
      };

    case 'CAPABILITY':
      return {
        ...base,
        allowedFiles:          ['AIOS/CapabilityPackages/**'],
        forbiddenFiles:        [...CORE_FORBIDDEN, 'runtime-gen1/**'],
        maximumScope:          'ACP package updates only. No runtime execution changes.',
        additionalConstraints: ['Capability must pass SSI review before merge. See 05_SSI_ENFORCEMENT.md.'],
      };

    case 'PROMPT':
      return {
        ...base,
        allowedFiles:          ['runtime-gen1/core/promptBuilder.ts'],
        forbiddenFiles:        ['runtime-gen1/core/executeGen1.ts', 'runtime-gen1/decision/**', 'lib/**'],
        maximumScope:          'Prompt builder changes only. Must not alter model selection or execution flow.',
        additionalConstraints: ['Prompt regression test required. Compare outputs before and after change.'],
      };

    case 'DECISION':
      return {
        ...base,
        allowedFiles:          ['AIOS/CapabilityPackages/**/Decision_Rules.md'],
        forbiddenFiles:        [...CORE_FORBIDDEN, 'runtime-gen1/**'],
        maximumScope:          'Decision rules documentation updates only. No execution code changes.',
        additionalConstraints: ['Decision rules must align with existing ACP structure. No new ACPs in this change.'],
      };

    case 'PROCESS':
      return {
        ...base,
        allowedFiles:          ['AIOS/Operating-Model/**', 'AIOS/Workflows/**', 'AIOS/Learning/**'],
        forbiddenFiles:        [...CORE_FORBIDDEN, 'runtime-gen1/**'],
        maximumScope:          'Process and workflow document updates only. No code changes.',
        rollbackRequired:      false,
        migrationRequired:     false,
        additionalConstraints: ['Document changes must follow AIOS documentation standards. See AIOS/CLAUDE.md.'],
      };

    case 'ARCHITECTURE':
      return {
        ...base,
        allowedFiles:          [], // Must be explicitly defined by HPO — no default
        forbiddenFiles:        ['runtime-gen1/**', 'lib/**', 'Applications/**', 'AIOS/Architecture-Guardian/**'],
        maximumScope:          'Scope must be explicitly defined by HPO. No default scope applies to ARCHITECTURE changes.',
        rollbackRequired:      true,
        migrationRequired:     true,
        documentationRequired: true,
        additionalConstraints: [
          'ADR must be finalized and HPO-signed before implementation begins.',
          'Architecture Guardian must confirm all conditions met before clearance.',
          'Chief AI Architect approval required before merge.',
        ],
      };

    default:
      return { ...base, maximumScope: 'Scope must be explicitly defined by HPO.' };
  }
}

// ─── ADR Scaffold Generator ───────────────────────────────────────────────────
// Generated when Guardian indicates adrRequired = true.
// Always DRAFT status. HPO must review, complete, and authorize the ADR.

export function generateAdrScaffold(
  review: GuardianReview,
  approval: Pick<HpoApproval, 'approvalId' | 'decision' | 'reviewNotes' | 'approvedBy'>,
): AdrScaffold {
  const proposalId  = review.proposalIds[0] ?? 'unknown';
  const gateResults = review.gateResults.map((g) => `${g.gate} (${g.name}): ${g.status}`).join(', ');
  const conditions  = review.conditions?.join('; ') ?? 'None';

  const alternatives = [
    `Option A: Implement ${review.changeType} change as proposed — ${review.architectureImpact.slice(0, 80)}`,
    `Option B: Defer implementation until issue confidence reaches HIGH (≥10 issues detected)`,
    `Option C: Scope reduction — address only the highest-priority sub-problem first`,
  ];

  return {
    adrId:            `ADR-${review.reviewId}`,
    title:            `[DRAFT] ${review.reviewSummary.slice(0, 80)}`,
    status:           'DRAFT',
    context:          `Pattern detected in AIOS Learning Intelligence: ${review.businessImpact.slice(0, 300)}. Architecture Guardian completed 6-gate review. Gate results: ${gateResults}. Future Impact Score: ${review.futureImpactScore}/100.`,
    decision:         '[TO BE COMPLETED BY HUMAN PRODUCT OWNER — Describe the specific implementation decision, scope, and rationale here]',
    alternatives,
    consequences:     `Positive: ${review.businessImpact.slice(0, 120)}. Risk: ${review.implementationRisk}. Future maintenance: ${review.futureMaintenance}. Conditions: ${conditions}.`,
    relatedProposal:  proposalId,
    guardianFindings: `Decision: ${review.decision}. ${review.reviewSummary}`,
    humanDecision:    `HPO Decision: ${approval.decision}. Approved by: ${approval.approvedBy}. Notes: ${approval.reviewNotes}`,
    createdAt:        new Date().toISOString(),
  };
}

// ─── Authorization Certificate Generator ─────────────────────────────────────

export function generateAuthorization(
  review: GuardianReview,
  approvalId: string,
  constraints: ImplementationConstraints,
  approvedBy: string,
): ImplementationAuthorization {
  const now     = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + AUTHORIZATION_EXPIRY_DAYS);

  return {
    authorizationId:            `AUTH-${review.reviewId}`,
    approvalId,
    proposalIds:                review.proposalIds,
    guardianReviewId:           review.reviewId,
    approvedBy,
    approvedAt:                 now.toISOString(),
    approvedScope:              review.architectureImpact,
    approvedChangeTypes:        [review.changeType],
    adrRequired:                review.adrRequired,
    implementationConstraints:  constraints,
    authorizedImplementationAI: 'Claude (Implementation AI) — must present this certificate to code reviewer',
    status:                     'ACTIVE',
    expiresAt:                  expires.toISOString(),
    createdAt:                  now.toISOString(),
  };
}

// ─── Approval Status Map ──────────────────────────────────────────────────────

function decisionToStatus(decision: HpoDecision): ApprovalStatus {
  const STATUS_MAP: Record<HpoDecision, ApprovalStatus> = {
    APPROVE:             'APPROVED',
    APPROVE_WITH_NOTES:  'APPROVED_WITH_NOTES',
    REJECT:              'REJECTED',
    DEFER:               'DEFERRED',
    RETURN_TO_GUARDIAN:  'RETURNED_TO_GUARDIAN',
  };
  return STATUS_MAP[decision];
}

// ─── Process HPO Decision ─────────────────────────────────────────────────────
// The central governance function. Records the Human Product Owner's decision,
// generates Implementation Authorization if approved, scaffolds ADR if required.
//
// Parameters:
//   guardianReviewId  — the GuardianReview being acted upon
//   decision          — the HPO's decision
//   reviewNotes       — HPO notes (required for APPROVE_WITH_NOTES, REJECT, DEFER)
//   approvedBy        — HPO identity (name, role)
//   constraintOverride — optional HPO-defined constraints (merges with defaults)

export async function processHpoDecision(
  guardianReviewId:  string,
  decision:          HpoDecision,
  reviewNotes:       string,
  approvedBy:        string,
  constraintOverride?: Partial<ImplementationConstraints>,
): Promise<HpoApprovalResult> {
  const kv  = getKvClient();
  const now = new Date().toISOString();

  const nullResult: HpoApprovalResult = {
    approvalId:      '',
    decision,
    status:          decisionToStatus(decision),
    authorized:      false,
    authorizationId: null,
    adrScaffoldId:   null,
  };

  // Fetch the Guardian Review
  let review: GuardianReview | null;
  try {
    review = await getGuardianReviewById(guardianReviewId);
  } catch (err) {
    console.error('[HPO_APPROVAL_ERROR]', JSON.stringify({ phase: 'fetch_review', guardianReviewId, error: String(err) }));
    return nullResult;
  }

  if (!review) {
    console.error('[HPO_APPROVAL_ERROR]', JSON.stringify({ phase: 'review_not_found', guardianReviewId }));
    return nullResult;
  }

  const approvalId = `HPO-APPROVAL-${guardianReviewId}`;
  const isApproved = decision === 'APPROVE' || decision === 'APPROVE_WITH_NOTES';
  const status     = decisionToStatus(decision);

  // Infer scope from review and build constraints
  const inferredScope = inferScopeFromLayer(review.layerValidation.proposedLayer, review.changeType);
  const baseConstraints = buildDefaultConstraints(inferredScope, review.changeType);

  const constraints: ImplementationConstraints = {
    ...baseConstraints,
    ...constraintOverride,
    allowedFiles:          constraintOverride?.allowedFiles         ?? baseConstraints.allowedFiles,
    forbiddenFiles:        constraintOverride?.forbiddenFiles        ?? baseConstraints.forbiddenFiles,
    additionalConstraints: [
      ...baseConstraints.additionalConstraints,
      ...(constraintOverride?.additionalConstraints ?? []),
    ],
  };

  // Generate Authorization Certificate (APPROVE / APPROVE_WITH_NOTES only)
  const authorization: ImplementationAuthorization | null = isApproved
    ? generateAuthorization(review, approvalId, constraints, approvedBy)
    : null;

  // Generate ADR Scaffold (when adrRequired AND approved — HPO must still fill it in)
  const adrScaffold: AdrScaffold | null = (review.adrRequired && isApproved)
    ? generateAdrScaffold(review, { approvalId, decision, reviewNotes, approvedBy })
    : null;

  const approval: HpoApproval = {
    approvalId,
    guardianReviewId,
    proposalIds:                 review.proposalIds,
    decision,
    reviewNotes,
    implementationAuthorization: authorization,
    approvedBy,
    approvedAt:                  now,
    changeScope:                 review.architectureImpact,
    constraints,
    adrRequired:                 review.adrRequired,
    adrScaffold,
    status,
    createdAt:                   now,
  };

  // Persist approval
  try {
    await kv.set(`approval:byId:${approvalId}`, JSON.stringify(approval), { ex: APPROVAL_TTL_SECONDS });
    await kv.lpush('approval:recent', approvalId);
    await kv.expire('approval:recent', APPROVAL_TTL_SECONDS);
    await kv.lpush(`approval:decision:${decision}`, approvalId);
    await kv.expire(`approval:decision:${decision}`, APPROVAL_TTL_SECONDS);

    // Persist authorization separately for fast lookup by implementation AI
    if (authorization) {
      await kv.set(`authorization:${authorization.authorizationId}`, JSON.stringify(authorization), { ex: APPROVAL_TTL_SECONDS });
    }
  } catch (err) {
    console.error('[HPO_APPROVAL_ERROR]', JSON.stringify({ phase: 'persist', approvalId, error: String(err) }));
    return nullResult;
  }

  // Remove from pending queue
  // (best-effort; pending list is advisory)
  try {
    const pending = await kv.lrange('approval:pending', 0, -1);
    const updated = pending.filter((id) => id !== guardianReviewId);
    if (updated.length !== pending.length) {
      // Re-write pending without this item (lpush replaces list semantics by rebuilding)
      await kv.set('approval:pending:cleared', guardianReviewId, { ex: APPROVAL_TTL_SECONDS });
    }
  } catch {
    // Advisory only — never fail due to pending list
  }

  // Emit governance logs
  console.log('[HPO_APPROVAL]', JSON.stringify({
    approvalId,
    guardianReviewId,
    decision,
    approvedBy,
    proposalIds:    review.proposalIds,
    adrRequired:    review.adrRequired,
    authorized:     isApproved,
    authorizationId: authorization?.authorizationId ?? null,
  }));

  if (isApproved) {
    console.log('[IMPLEMENTATION_AUTHORIZED]', JSON.stringify({
      authorizationId:   authorization!.authorizationId,
      approvalId,
      proposalIds:       review.proposalIds,
      changeType:        review.changeType,
      approvedBy,
      expiresAt:         authorization!.expiresAt,
      adrRequired:       review.adrRequired,
      adrScaffoldId:     adrScaffold?.adrId ?? null,
      constraintSummary: {
        allowedFiles:    constraints.allowedFiles.length,
        forbiddenFiles:  constraints.forbiddenFiles.length,
        testingRequired: constraints.testingRequired,
        rollbackRequired: constraints.rollbackRequired,
      },
    }));
  } else {
    console.log('[IMPLEMENTATION_BLOCKED]', JSON.stringify({
      approvalId,
      guardianReviewId,
      decision,
      reason:      reviewNotes.slice(0, 200),
      proposalIds: review.proposalIds,
    }));
  }

  return {
    approvalId,
    decision,
    status,
    authorized:      isApproved,
    authorizationId: authorization?.authorizationId ?? null,
    adrScaffoldId:   adrScaffold?.adrId ?? null,
  };
}

// ─── Scope Inference ──────────────────────────────────────────────────────────
// Infers ImplementationScope from layer string + change type (for constraint derivation)

function inferScopeFromLayer(layerString: string, changeType: ChangeType): ImplementationScope {
  if (changeType === 'Knowledge')      return 'KNOWLEDGE';
  if (changeType === 'Conversation')   return 'DECISION';
  if (changeType === 'Commercial')     return 'PROCESS';
  if (changeType === 'Architecture')   return 'ARCHITECTURE';
  if (changeType === 'Runtime') {
    if (layerString.includes('L5'))    return 'MEMORY';
    return 'PROMPT';
  }
  return 'PROCESS';
}

// ─── Queue Helper ─────────────────────────────────────────────────────────────
// Adds a GuardianReview to the HPO pending review queue.
// Called by the Guardian engine or test setup when a review needs HPO action.

export async function queueForHpoReview(guardianReviewId: string): Promise<void> {
  try {
    const kv = getKvClient();
    await kv.lpush('approval:pending', guardianReviewId);
    await kv.expire('approval:pending', APPROVAL_TTL_SECONDS);
  } catch (err) {
    console.error('[HPO_QUEUE_ERROR]', String(err));
  }
}

// ─── Async KV read helpers ────────────────────────────────────────────────────

export async function getApprovalById(approvalId: string): Promise<HpoApproval | null> {
  try {
    const raw = await getKvClient().get(`approval:byId:${approvalId}`);
    return raw ? (JSON.parse(raw) as HpoApproval) : null;
  } catch (err) {
    console.error('[HPO_READ_ERROR]', String(err));
    return null;
  }
}

export async function getRecentApprovalIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('approval:recent', 0, limit - 1);
  } catch (err) {
    console.error('[HPO_READ_ERROR]', String(err));
    return [];
  }
}

export async function getApprovals(limit = 20): Promise<HpoApproval[]> {
  const ids     = await getRecentApprovalIds(limit);
  const results = await Promise.all(ids.map((id) => getApprovalById(id)));
  return results.filter((r): r is HpoApproval => r !== null);
}

export async function getApprovalsByDecision(decision: HpoDecision, limit = 20): Promise<HpoApproval[]> {
  try {
    const ids     = await getKvClient().lrange(`approval:decision:${decision}`, 0, limit - 1);
    const results = await Promise.all(ids.map((id) => getApprovalById(id)));
    return results.filter((r): r is HpoApproval => r !== null);
  } catch (err) {
    console.error('[HPO_READ_ERROR]', String(err));
    return [];
  }
}

export async function getAuthorizationById(authorizationId: string): Promise<ImplementationAuthorization | null> {
  try {
    const raw = await getKvClient().get(`authorization:${authorizationId}`);
    return raw ? (JSON.parse(raw) as ImplementationAuthorization) : null;
  } catch (err) {
    console.error('[HPO_READ_ERROR]', String(err));
    return null;
  }
}

export async function getApprovedAuthorizations(limit = 20): Promise<ImplementationAuthorization[]> {
  const approvals = await getApprovalsByDecision('APPROVE', Math.floor(limit / 2));
  const withNotes = await getApprovalsByDecision('APPROVE_WITH_NOTES', Math.ceil(limit / 2));
  const allApproved = [...approvals, ...withNotes];
  const authorizations = allApproved
    .map((a) => a.implementationAuthorization)
    .filter((a): a is ImplementationAuthorization => a !== null);
  return authorizations.slice(0, limit);
}

export async function getPendingApprovals(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('approval:pending', 0, limit - 1);
  } catch (err) {
    console.error('[HPO_READ_ERROR]', String(err));
    return [];
  }
}

// Named aliases for spec API surface
export { getApprovalById as getApproval };
