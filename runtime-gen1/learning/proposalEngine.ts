// Learning Proposal Engine — Phase 12.0C
// Transforms RootCauseRecords into structured Learning Proposal Drafts.
// READ-ONLY: never modifies Runtime, Prompts, Knowledge, Memory, or Decisions.
// Never calls LLM. Deterministic content templates only. Never blocks runtime.
//
// Phase 12.0C outputs: DRAFT and READY_FOR_GUARDIAN only.
// UNDER_REVIEW / APPROVED / REJECTED / IMPLEMENTED belong to later phases.

import { getKvClient } from '../observability/kvClient';
import {
  getRecentRootCauseIds,
  getRootCauseByIdFromKv,
  type RootCauseRecord,
  type RootCauseCategory,
} from './rootCauseAnalysis';
import {
  getPatternByIdFromKv,
  type PatternRecord,
  type OperationalCategory,
  type PatternConfidence,
} from './patternRecognition';

// ─── TTL ──────────────────────────────────────────────────────────────────────

export const PROPOSAL_TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days

// ─── Types ────────────────────────────────────────────────────────────────────

// Only DRAFT and READY_FOR_GUARDIAN may be produced in Phase 12.0C.
// All other states are managed by Architecture Guardian (Phase 12.0D+).
export type ProposalStatus =
  | 'DRAFT'
  | 'READY_FOR_GUARDIAN'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IMPLEMENTED';

// Proposal priority scores — deterministic, not LLM-assigned.
// See scoreProposalPriority() for full scoring rules.
export type ProposalPriority = 'P0' | 'P1' | 'P2' | 'P3';

// Risk estimation — based on category sensitivity, not change complexity.
export type EstimatedRisk = 'LOW' | 'MEDIUM' | 'HIGH';

// Implementation scope — what AIOS layer must change to fix the root cause.
export type ImplementationScope =
  | 'KNOWLEDGE'
  | 'CAPABILITY'
  | 'PROMPT'
  | 'MEMORY'
  | 'DECISION'
  | 'PROCESS'
  | 'ARCHITECTURE';

export interface ProposalRecord {
  proposalId:           string;              // PROPOSAL-{CATEGORY}-001
  rootCauseId:          string;
  title:                string;
  summary:              string;
  problem:              string;
  businessImpact:       string;
  technicalImpact:      string;
  recommendedAction:    string;
  recommendedOwner:     string;
  affectedIntelligence: string;
  affectedCapability:   string;
  priority:             ProposalPriority;
  estimatedRisk:        EstimatedRisk;
  confidence:           PatternConfidence;
  implementationScope:  ImplementationScope;
  status:               ProposalStatus;
  createdAt:            string;
  updatedAt:            string;
}

export interface ProposalEngineResult {
  rootCausesProcessed:     number;
  proposalsCreated:        number;
  proposalsUpdated:        number;
  draftCount:              number;
  readyForGuardianCount:   number;
  errors:                  number;
}

// ─── Priority Scoring Rules ───────────────────────────────────────────────────
//
// Priority is assigned deterministically from:
//   1. Pattern confidence    (HIGH > MEDIUM > LOW)
//   2. Severity distribution (P0 issues = highest urgency)
//   3. Business impact       (TRUST, MEDICAL = highest risk)
//   4. Architecture impact   (Architecture Debt = elevated)
//
// P0: HIGH confidence AND (has P0 issues OR TRUST or MEDICAL category)
// P1: HIGH confidence, OR any P0 issues, OR TRUST/MEDICAL category
// P2: MEDIUM confidence, OR COMMERCIAL/HANDOFF/PRODUCT category
// P3: LOW confidence, all other categories

export function scoreProposalPriority(
  pattern: PatternRecord,
): ProposalPriority {
  const hasP0      = pattern.severityDistribution.P0 > 0;
  const isSensitive = pattern.operationalCategory === 'TRUST' || pattern.operationalCategory === 'MEDICAL';
  const isHighConf  = pattern.confidence === 'HIGH';
  const isMedConf   = pattern.confidence === 'MEDIUM';
  const isCommercial = ['COMMERCIAL', 'HANDOFF', 'PRODUCT'].includes(pattern.operationalCategory);

  if (isHighConf && (hasP0 || isSensitive)) return 'P0';
  if (isHighConf || hasP0 || isSensitive)   return 'P1';
  if (isMedConf || isCommercial)            return 'P2';
  return 'P3';
}

// ─── Risk Estimation Rules ────────────────────────────────────────────────────
//
// Risk is based on category sensitivity (not change complexity).
// HIGH: TRUST or MEDICAL — customer safety and compliance implications
// MEDIUM: KNOWLEDGE, PRODUCT, COMMERCIAL, HANDOFF — quality and business impact
// LOW: MEMORY, CONVERSATION — functional improvements with lower risk profile

export function estimateRisk(category: OperationalCategory): EstimatedRisk {
  if (category === 'TRUST' || category === 'MEDICAL') return 'HIGH';
  if (category === 'KNOWLEDGE' || category === 'PRODUCT' || category === 'COMMERCIAL' || category === 'HANDOFF') return 'MEDIUM';
  return 'LOW';
}

// ─── Implementation Scope Rules ───────────────────────────────────────────────
//
// Maps root cause category to the AIOS layer that must change.
// This field is MANDATORY for Architecture Guardian (Phase 12.0D).

export function determineScope(rootCauseCategory: RootCauseCategory): ImplementationScope {
  const SCOPE_MAP: Record<RootCauseCategory, ImplementationScope> = {
    'Knowledge Gap':        'KNOWLEDGE',
    'Memory Weakness':      'MEMORY',
    'Conversation Design':  'DECISION',
    'Commercial Logic':     'PROCESS',
    'Recommendation Timing': 'PROCESS',
    'Trust Strategy':       'CAPABILITY',
    'Medical Flow':         'CAPABILITY',
    'Product Coverage':     'KNOWLEDGE',
    'Architecture Debt':    'ARCHITECTURE',
    'Governance Gap':       'PROCESS',
    'Unknown':              'ARCHITECTURE',
  };
  return SCOPE_MAP[rootCauseCategory];
}

// ─── Proposal Status Rules ────────────────────────────────────────────────────
//
// Status lifecycle for Phase 12.0C (DRAFT and READY_FOR_GUARDIAN only):
//
//   LOW confidence                 → DRAFT  (insufficient evidence)
//   HIGH confidence                → READY_FOR_GUARDIAN  (HIGH always ready)
//   MEDIUM confidence + P0 or P1   → READY_FOR_GUARDIAN  (significant enough)
//   MEDIUM confidence + P2 or P3   → DRAFT  (monitor before escalating)

export function determineProposalStatus(
  confidence: PatternConfidence,
  priority: ProposalPriority,
): ProposalStatus {
  if (confidence === 'LOW')  return 'DRAFT';
  if (confidence === 'HIGH') return 'READY_FOR_GUARDIAN';
  // MEDIUM confidence:
  return (priority === 'P0' || priority === 'P1') ? 'READY_FOR_GUARDIAN' : 'DRAFT';
}

// ─── Content Templates ────────────────────────────────────────────────────────

const PROPOSAL_TITLES: Record<OperationalCategory, string> = {
  KNOWLEDGE:    'Expand Knowledge Path Registry to Close Detected Knowledge Gap',
  MEMORY:       'Strengthen Memory Resolver to Eliminate Repeated Question Issues',
  CONVERSATION: 'Refine Conversation Strategy Selection for Improved Flow Quality',
  COMMERCIAL:   'Recalibrate Lead Capture Logic for Better Commercial Timing',
  PRODUCT:      'Expand Product Knowledge Coverage for Identified Product Gaps',
  TRUST:        'Strengthen Trust Flow Detection and Response Strategy',
  MEDICAL:      'Reinforce Medical Flow Compliance and Disclaimer Coverage',
  HANDOFF:      'Improve Handoff Trigger Timing and Context Completeness',
};

const BUSINESS_IMPACT_TEMPLATES: Record<OperationalCategory, string> = {
  KNOWLEDGE:    'Customers receive fallback answers instead of accurate product information, reducing trust and increasing conversation abandonment rate.',
  MEMORY:       'Customers are asked to repeat information they already provided, creating friction and signalling poor AI quality to the customer.',
  CONVERSATION: 'Suboptimal conversation flow reduces customer engagement quality, decreasing the probability of qualification and lead capture.',
  COMMERCIAL:   'Missed commercial signals and poor lead timing result in lost conversion opportunities and reduced revenue pipeline.',
  PRODUCT:      'Product knowledge gaps prevent accurate recommendations, reducing customer confidence and recommendation acceptance rate.',
  TRUST:        'Trust failures can permanently destroy customer relationships. Trust-concern conversations that end in dissatisfaction have near-zero return probability.',
  MEDICAL:      'Medical flow failures expose AIOS to compliance and regulatory risk. Incorrect underwriting guidance may create legal liability.',
  HANDOFF:      'Poor handoff quality reduces advisor effectiveness and post-handoff conversion rate. Incomplete context requires the advisor to restart customer discovery.',
};

const TECHNICAL_IMPACT_TEMPLATES: Record<RootCauseCategory, string> = {
  'Knowledge Gap':           'Knowledge resolver returns empty or low-confidence results, triggering fallback path. Affects knowledgeResolver hit rate metric and fallbackUsed rate.',
  'Memory Weakness':         'Session fields not written or not read correctly. Affects re-ask rate metric and promptBuilder context completeness (knownFields injection).',
  'Conversation Design':     'Strategy selection returns suboptimal strategy for context, affecting conversation health score and strategy-to-outcome alignment metric.',
  'Commercial Logic':        'Lead capture state machine fires at wrong stage, affecting lead qualification rate, handoff rate, and average lead score at handoff.',
  'Recommendation Timing':   'Handoff trigger fires with incomplete profile or at wrong conversation stage, affecting handoff quality score and post-handoff conversion rate.',
  'Trust Strategy':          'Trust detection fails to suppress lead capture or fails to respond correctly, violating PATTERN-TRUST-001 and affecting trust recovery rate.',
  'Medical Flow':            'Medical capability fails to include mandatory uncertainty disclaimer fragment or routes incorrectly, violating PATTERN-MEDICAL-001 compliance requirement.',
  'Product Coverage':        'Knowledge resolver cannot match product intent to knowledge document, falling back to generic response. Affects mandatory fragment inclusion rate.',
  'Architecture Debt':       'Systematic capability duplication or layer violation creates maintainability risk across multiple intelligence domains.',
  'Governance Gap':          'Missing oversight mechanism allows ungoverned capability creation or knowledge modification without traceability.',
  'Unknown':                 'Root cause not yet determined. Requires manual RCA investigation with additional conversation log review.',
};

const RECOMMENDED_ACTIONS: Record<RootCauseCategory, string> = {
  'Knowledge Gap':           'Expand Knowledge Path Registry: add missing FAQ entries, update product documentation, and verify knowledge resolver intent-to-path mappings for the affected capability.',
  'Memory Weakness':         'Review memoryResolver extraction rules: ensure all captured fields are correctly written to session and injected into AI context via promptBuilder knownFields section.',
  'Conversation Design':     'Update conversation strategy patterns: review strategyEngine selection logic and update conversation dataset scenarios for the affected intent types.',
  'Commercial Logic':        'Review lead capture state machine: verify timing rules, qualification thresholds, and readiness signal detection in ACP-11 and decisionEngine.',
  'Recommendation Timing':   'Review handoff trigger conditions and timing in ACP-17: ensure human escalation fires at the correct conversation stage with complete profile context.',
  'Trust Strategy':          'Strengthen trust detection keyword coverage in intentDetector and verify BUILD_TRUST_FIRST strategy correctly suppresses all lead capture actions.',
  'Medical Flow':            'Verify medical flow capability (CAP-003/ACP-04): ensure mandatory uncertainty disclaimers are included in all applicable responses and underwriting logic is accurate.',
  'Product Coverage':        'Expand product knowledge documentation and verify Knowledge Path Registry mappings cover all product intents detected in the Pattern Library.',
  'Architecture Debt':       'Schedule Architecture Guardian review: this pattern indicates systemic design debt requiring refactoring of the affected Intelligence domain.',
  'Governance Gap':          'Escalate to Architecture Guardian for governance review: missing process or oversight mechanisms require formal policy definition.',
  'Unknown':                 'Manual investigation required: insufficient pattern data to determine root cause. Increase audit coverage and rerun analysis after 10+ additional issues.',
};

// ─── Proposal upsert ──────────────────────────────────────────────────────────

async function upsertProposal(
  rootCause: RootCauseRecord,
  pattern: PatternRecord,
): Promise<{ proposal: ProposalRecord; isNew: boolean }> {
  const kv         = getKvClient();
  const category   = pattern.operationalCategory;
  const proposalId = `PROPOSAL-${category}-001`;
  const now        = new Date().toISOString();

  const existingRaw = await kv.get(`proposal:byId:${proposalId}`);
  const existing    = existingRaw ? (JSON.parse(existingRaw) as ProposalRecord) : null;

  const priority = scoreProposalPriority(pattern);
  const status   = determineProposalStatus(pattern.confidence, priority);

  const proposal: ProposalRecord = {
    proposalId,
    rootCauseId:          rootCause.rootCauseId,
    title:                PROPOSAL_TITLES[category],
    summary:              `${rootCause.rootCauseCategory} identified in ${pattern.affectedIntelligence}. ${pattern.issueCount} issue(s) detected with ${pattern.confidence} confidence. Root cause: ${rootCause.description}`,
    problem:              `${BUSINESS_IMPACT_TEMPLATES[category]} Issue count: ${pattern.issueCount}. Confidence: ${pattern.confidence}.`,
    businessImpact:       BUSINESS_IMPACT_TEMPLATES[category],
    technicalImpact:      TECHNICAL_IMPACT_TEMPLATES[rootCause.rootCauseCategory],
    recommendedAction:    RECOMMENDED_ACTIONS[rootCause.rootCauseCategory],
    recommendedOwner:     pattern.suggestedOwner,
    affectedIntelligence: pattern.affectedIntelligence,
    affectedCapability:   rootCause.affectedCapability,
    priority,
    estimatedRisk:        estimateRisk(category),
    confidence:           pattern.confidence,
    implementationScope:  determineScope(rootCause.rootCauseCategory),
    status,
    createdAt:            existing?.createdAt ?? now,
    updatedAt:            now,
  };

  await kv.set(`proposal:byId:${proposalId}`, JSON.stringify(proposal), { ex: PROPOSAL_TTL_SECONDS });

  const isNew = existing === null;

  if (isNew) {
    await kv.lpush('proposal:recent', proposalId);
    await kv.expire('proposal:recent', PROPOSAL_TTL_SECONDS);
    await kv.lpush(`proposal:status:${status}`, proposalId);
    await kv.expire(`proposal:status:${status}`, PROPOSAL_TTL_SECONDS);
    console.log('[PROPOSAL_CREATED]', JSON.stringify({
      proposalId,
      rootCauseId:          rootCause.rootCauseId,
      affectedIntelligence: proposal.affectedIntelligence,
      priority,
      status,
      confidence:           proposal.confidence,
    }));
    if (status === 'READY_FOR_GUARDIAN') {
      console.log('[PROPOSAL_READY]', JSON.stringify({
        proposalId,
        priority,
        affectedIntelligence: proposal.affectedIntelligence,
        rootCauseCategory:    rootCause.rootCauseCategory,
      }));
    }
  } else if (existing.status !== status && status === 'READY_FOR_GUARDIAN') {
    // Status upgrade: DRAFT → READY_FOR_GUARDIAN (promoted by increased confidence)
    await kv.lpush(`proposal:status:${status}`, proposalId);
    await kv.expire(`proposal:status:${status}`, PROPOSAL_TTL_SECONDS);
    console.log('[PROPOSAL_READY]', JSON.stringify({
      proposalId,
      priority,
      affectedIntelligence: proposal.affectedIntelligence,
      rootCauseCategory:    rootCause.rootCauseCategory,
      promotedFrom:         existing.status,
    }));
  }

  return { proposal, isNew };
}

// ─── Run Proposal Engine ──────────────────────────────────────────────────────
// Reads recent root causes from KV, generates/updates ProposalRecords.
// Accepts optional rootCauseIds override (for testing or targeted runs).
// Never throws — all errors are caught and counted.

export async function runProposalEngine(
  rootCauseIds?: string[],
  limit = 20,
): Promise<ProposalEngineResult> {
  const result: ProposalEngineResult = {
    rootCausesProcessed:   0,
    proposalsCreated:      0,
    proposalsUpdated:      0,
    draftCount:            0,
    readyForGuardianCount: 0,
    errors:                0,
  };

  let ids: string[];
  try {
    ids = rootCauseIds ?? (await getRecentRootCauseIds(limit));
  } catch (err) {
    console.error('[PROPOSAL_ENGINE_ERROR]', JSON.stringify({ phase: 'fetch_root_causes', error: String(err) }));
    return result;
  }

  for (const rcId of ids) {
    try {
      const rootCause = await getRootCauseByIdFromKv(rcId);
      if (!rootCause) continue;

      const pattern = await getPatternByIdFromKv(rootCause.patternId);
      if (!pattern) continue;

      result.rootCausesProcessed++;
      const { proposal, isNew } = await upsertProposal(rootCause, pattern);

      if (isNew) result.proposalsCreated++;
      else       result.proposalsUpdated++;

      if (proposal.status === 'DRAFT')              result.draftCount++;
      if (proposal.status === 'READY_FOR_GUARDIAN') result.readyForGuardianCount++;

    } catch (err) {
      result.errors++;
      console.error('[PROPOSAL_ENGINE_ERROR]', JSON.stringify({ rcId, error: String(err) }));
    }
  }

  console.log('[PROPOSAL_ENGINE]', JSON.stringify({ event: 'run_complete', ...result }));
  return result;
}

// ─── Async KV read helpers ────────────────────────────────────────────────────

export async function getProposalByIdFromKv(proposalId: string): Promise<ProposalRecord | null> {
  try {
    const raw = await getKvClient().get(`proposal:byId:${proposalId}`);
    return raw ? (JSON.parse(raw) as ProposalRecord) : null;
  } catch (err) {
    console.error('[PROPOSAL_READ_ERROR]', String(err));
    return null;
  }
}

export async function getRecentProposalIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('proposal:recent', 0, limit - 1);
  } catch (err) {
    console.error('[PROPOSAL_READ_ERROR]', String(err));
    return [];
  }
}

export async function getDraftProposalIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('proposal:status:DRAFT', 0, limit - 1);
  } catch (err) {
    console.error('[PROPOSAL_READ_ERROR]', String(err));
    return [];
  }
}

export async function getReadyForGuardianIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('proposal:status:READY_FOR_GUARDIAN', 0, limit - 1);
  } catch (err) {
    console.error('[PROPOSAL_READ_ERROR]', String(err));
    return [];
  }
}

async function fetchProposalsByIds(ids: string[]): Promise<ProposalRecord[]> {
  const results = await Promise.all(ids.map((id) => getProposalByIdFromKv(id)));
  return results.filter((r): r is ProposalRecord => r !== null);
}

export async function getDraftProposals(limit = 20): Promise<ProposalRecord[]> {
  const ids = await getDraftProposalIds(limit);
  return fetchProposalsByIds(ids);
}

export async function getReadyForGuardian(limit = 20): Promise<ProposalRecord[]> {
  const ids = await getReadyForGuardianIds(limit);
  return fetchProposalsByIds(ids);
}

// getProposalById — named alias for public API
export { getProposalByIdFromKv as getProposalById };
