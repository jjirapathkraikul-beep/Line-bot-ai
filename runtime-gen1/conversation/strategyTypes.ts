// Gen1 Conversation Strategy Types — Phase Pre-10.9
// 10 strategy IDs, definition schema, engine I/O types.
// Source: AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md (CP-01 to CP-10).

import type { IntentDetectorResult } from '../capability/intentDetector';
import type { CapabilityLoaderResult } from '../capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../memory/memoryTypes';
import type { RuntimeDecisionResult } from '../decision/decisionTypes';

// ─── Strategy ID enum ─────────────────────────────────────────────────────────

export type ConversationStrategyId =
  | 'ANSWER_ONLY'                 // CP-01: direct answer, no follow-up
  | 'ANSWER_FIRST_ONE_QUESTION'   // CP-01 + CP-02: answer then exactly one follow-up
  | 'EDUCATE_THEN_DISCOVER'       // CP-03: deliver value before collecting data
  | 'BUILD_TRUST_FIRST'           // CP-04: trust signal → identity evidence, no products
  | 'MEDICAL_ANSWER_THEN_FOLLOWUP'// CP-06: empathy + uncertainty language + one follow-up
  | 'RECOMMEND_THEN_CAPTURE'      // CP-07: cite context → recommend → capture on positive signal
  | 'CLARIFY_THEN_CONTINUE'       // CP-02: one clarifying question to resolve ambiguity
  | 'HANDOFF_WITH_CONTEXT'        // CP-10: warm handoff with context package
  | 'SAFE_FALLBACK'               // CP-09: short empathetic response when no strategy fits
  | 'TOPIC_SHIFT_RECOVERY';       // CP-08: follow customer's shift, cancel prior interrupted state

// ─── Strategy definition ──────────────────────────────────────────────────────

export interface ConversationStrategyDefinition {
  id: ConversationStrategyId;
  name: string;
  goal: string;
  orderedSteps: string[];
  patterns: string[];           // CP-XX references that govern this strategy
  leadCaptureAllowed: boolean;
  mustAnswerFirst: boolean;
  mustEducate: boolean;
  mustRecommendBeforeCapture: boolean;
}

// ─── Engine I/O ───────────────────────────────────────────────────────────────

export interface ConversationStrategyInput {
  intentResult: IntentDetectorResult;
  capabilityResult: CapabilityLoaderResult;
  memoryResult: RuntimeMemoryResolution;
  decisionResult: RuntimeDecisionResult;
}

export interface ConversationStrategyResult {
  strategyId: ConversationStrategyId;
  strategyGoal: string;
  orderedSteps: string[];
  topicShiftDetected: boolean;
  leadCaptureAllowedByStrategy: boolean;
  mustAnswerFirst: boolean;
  mustEducate: boolean;
  mustRecommendBeforeCapture: boolean;
  strategyWarnings: string[];
}
