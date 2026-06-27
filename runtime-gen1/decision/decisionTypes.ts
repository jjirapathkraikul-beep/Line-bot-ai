// Gen1 Decision Types — Phase 10.5
// Action taxonomy + decision result types for the deterministic decision engine.
// Mapped from AIOS-ACE-11 (12 actions) and 05_DECISION_PIPELINE.md.

import type { RuntimeInput } from '../core/types';
import type { IntentDetectorResult } from '../capability/intentDetector';
import type { CapabilityLoaderResult } from '../capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../memory/memoryTypes';
import type { KnowledgeSelectionResult } from '../knowledge/knowledgeTypes';

// ─── Action taxonomy ──────────────────────────────────────────────────────────
// AIOS-ACE-11: ACT-01 through ACT-12 + WAIT from 05_DECISION_PIPELINE.md

export type RuntimeAction =
  | 'answer'           // ACT-01: direct answer, no follow-up
  | 'answer_then_ask'  // ACT-02: answer + ONE follow-up question
  | 'build_trust'      // ACT-03: address trust concern (CRITICAL — overrides everything)
  | 'educate'          // ACT-04: educational content before lead capture
  | 'recommend'        // ACT-05: personalized product recommendation
  | 'collect_lead'     // ACT-06: ask for ONE lead field
  | 'handoff'          // ACT-07: warm transfer to Jirawat
  | 'emergency_guide'  // ACT-08: immediate hospital/emergency guidance
  | 'claim_guide'      // ACT-09: walk through claim process
  | 'discovery'        // ACT-10: discovery question for unclear intent
  | 'redirect'         // ACT-11: graceful topic change
  | 'fallback'         // ACT-12: generic helpful response
  | 'wait';            // ACT-WAIT: acknowledge without new info; wait for customer

export type RuntimeDecisionPriority =
  | 'CRITICAL'   // trust/fraud — no override permitted
  | 'HIGH'       // medical/claim/hospital/human
  | 'STANDARD'   // product/recommendation/lead
  | 'LOW';       // discovery/fallback

// ─── Input ───────────────────────────────────────────────────────────────────

export interface RuntimeDecisionInput {
  runtimeInput: RuntimeInput;
  intentResult: IntentDetectorResult;
  capabilityResult: CapabilityLoaderResult;
  memoryResult: RuntimeMemoryResolution;
  knowledgeResult: KnowledgeSelectionResult;
}

// ─── Intermediate rule result ─────────────────────────────────────────────────

export interface RuntimeDecisionRuleResult {
  ruleId: string;
  ruleName: string;
  action: RuntimeAction;
  priority: RuntimeDecisionPriority;
  shouldCollectLead: boolean;
  shouldEscalate: boolean;
  askField: string | null;
  mustAnswerFirst: boolean;           // CP-01 — answer before any question
  mustBuildTrust: boolean;            // ACP-08 trust response required
  mustIncludeDisclaimer: boolean;     // ACP-04 medical uncertainty language
  mustIncludeRiskDisclosure: boolean; // ACP-07 ILP investment risk disclosure
  allowedCapabilities: string[];
  blockedCapabilities: string[];      // ACP IDs that must not activate this turn
  reason: string;
  conditionsMet: string[];
}

// ─── Warning ─────────────────────────────────────────────────────────────────

export interface RuntimeDecisionWarning {
  code: string;
  message: string;
  severity: 'HARD' | 'SOFT';   // HARD = must be handled; SOFT = advisory
}

// ─── Decision trace (audit) ───────────────────────────────────────────────────

export interface RuntimeDecisionTrace {
  rulesEvaluated: string[];          // rule IDs evaluated in order
  ruleMatched: string;               // name of the winning rule
  ruleMatchedId: string;             // ID of the winning rule
  conditionsMet: string[];           // conditions that triggered the match
  conditionsBlocked: string[];       // constraints checked and not met
  priorityChain: string[];           // priorities in the order they were considered
  confidence: number;                // 0.0–1.0 decision confidence
  alternativeAction: RuntimeAction | null; // second-best action for audit logging
}

// ─── Full decision result ─────────────────────────────────────────────────────

export interface RuntimeDecisionResult {
  action: RuntimeAction;
  priority: RuntimeDecisionPriority;
  shouldCollectLead: boolean;
  shouldEscalate: boolean;
  askField: string | null;             // field to ask for (lead field or clarifying question)
  mustAnswerFirst: boolean;            // CP-01: always answer before asking
  mustBuildTrust: boolean;             // ACP-08 trust response required
  mustIncludeDisclaimer: boolean;      // medical uncertainty language (mandatory)
  mustIncludeRiskDisclosure: boolean;  // ILP risk disclosure (mandatory)
  allowedCapabilities: string[];
  blockedCapabilities: string[];
  reason: string;
  warnings: RuntimeDecisionWarning[];
  decisionTrace: RuntimeDecisionTrace;
}
