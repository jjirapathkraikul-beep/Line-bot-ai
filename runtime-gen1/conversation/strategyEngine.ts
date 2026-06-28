// Gen1 Conversation Strategy Engine — Phase Pre-10.9
// Selects the correct conversation strategy from intent, memory, and decision state.
// All logic is deterministic — no LLM involvement.
// Source: AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md (CP-01 to CP-10).

import type { IntentDetectorResult } from '../capability/intentDetector';
import type { RuntimeMemoryResolution } from '../memory/memoryTypes';
import type { RuntimeDecisionResult } from '../decision/decisionTypes';
import type {
  ConversationStrategyId,
  ConversationStrategyInput,
  ConversationStrategyResult,
} from './strategyTypes';
import { getStrategy } from './strategyRegistry';

// ─── Topic shift detection (deterministic) ────────────────────────────────────
// CP-08: If lead capture is in progress and the new intent is a topic distractor,
// cancel the current flow and follow the customer.

function detectTopicShift(
  memoryResult: RuntimeMemoryResolution,
  intentResult: IntentDetectorResult,
): boolean {
  const { captureStage } = memoryResult.leadMemory;
  const inLeadCapture = captureStage !== 'IDLE' && captureStage !== 'COMPLETE';
  if (!inLeadCapture) return false;

  const { flags } = intentResult;
  return (
    flags.isTrustSignal    ||
    flags.isMedicalSignal  ||
    flags.isProductIntent  ||
    flags.isHumanRequest
  );
}

// ─── Strategy selection ───────────────────────────────────────────────────────
// Priority order mirrors the Pattern Interaction Map in 20_CONVERSATION_PATTERNS.md.

function selectStrategyId(
  intentResult: IntentDetectorResult,
  memoryResult: RuntimeMemoryResolution,
  decisionResult: RuntimeDecisionResult,
  topicShiftDetected: boolean,
): ConversationStrategyId {
  const { flags } = intentResult;
  const action = decisionResult.action;
  const trustActive = memoryResult.trustMemory.trustConcernActive;
  const valueDelivered = memoryResult.leadMemory.valueDelivered;

  // 1. Trust signal or active concern — CP-04 overrides ALL other states
  if (flags.isTrustSignal || trustActive) return 'BUILD_TRUST_FIRST';

  // 2. Explicit escalation requested
  if (decisionResult.shouldEscalate || action === 'handoff') return 'HANDOFF_WITH_CONTEXT';

  // 3. Topic shift while in an active capture flow — CP-08
  if (topicShiftDetected) return 'TOPIC_SHIFT_RECOVERY';

  // 4. Medical signal — CP-06: empathy before information
  if (flags.isMedicalSignal) return 'MEDICAL_ANSWER_THEN_FOLLOWUP';

  // 5. Action-based selection
  switch (action) {
    case 'recommend':
      return 'RECOMMEND_THEN_CAPTURE';

    case 'educate':
    case 'discovery':
      return 'EDUCATE_THEN_DISCOVER';

    case 'answer_then_ask':
      // CP-03: if value not yet delivered, educate before capturing
      return valueDelivered ? 'ANSWER_FIRST_ONE_QUESTION' : 'EDUCATE_THEN_DISCOVER';

    case 'collect_lead': {
      // P0-005: contact field capture (phone/name/time) must follow recommendation first (CP-07)
      const CONTACT_FIELDS = ['phone', 'real_name', 'preferred_contact_time'];
      const isContactCapture =
        decisionResult.askField !== null &&
        CONTACT_FIELDS.includes(decisionResult.askField);
      if (isContactCapture) return 'RECOMMEND_THEN_CAPTURE';
      // CP-03 defense: demographic capture only when value has been delivered
      return valueDelivered ? 'ANSWER_FIRST_ONE_QUESTION' : 'EDUCATE_THEN_DISCOVER';
    }

    case 'answer':
      return 'ANSWER_ONLY';

    case 'emergency_guide':
      return 'HANDOFF_WITH_CONTEXT';

    case 'claim_guide':
      return 'ANSWER_FIRST_ONE_QUESTION';

    case 'redirect':
      return 'TOPIC_SHIFT_RECOVERY';

    case 'wait':
      return 'CLARIFY_THEN_CONTINUE';

    case 'fallback':
    default:
      return 'SAFE_FALLBACK';
  }
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function selectConversationStrategy(
  input: ConversationStrategyInput,
): ConversationStrategyResult {
  const { intentResult, memoryResult, decisionResult } = input;
  const warnings: string[] = [];

  const topicShiftDetected = detectTopicShift(memoryResult, intentResult);
  const strategyId = selectStrategyId(intentResult, memoryResult, decisionResult, topicShiftDetected);
  const definition = getStrategy(strategyId);

  // Warning: topic shift cancelled prior flow
  if (topicShiftDetected) {
    warnings.push(
      `CP-08: Topic shift detected during stage=${memoryResult.leadMemory.captureStage} — prior lead capture flow cancelled`,
    );
  }

  // Warning: strategy fell through to SAFE_FALLBACK for unexpected reason
  if (
    strategyId === 'SAFE_FALLBACK' &&
    decisionResult.action !== 'fallback' &&
    decisionResult.action !== 'emergency_guide'
  ) {
    warnings.push(
      `W-STR-01: Strategy resolved to SAFE_FALLBACK from unrecognized action '${decisionResult.action}'`,
    );
  }

  // Warning: decision wants lead capture but strategy prevents it
  if (decisionResult.shouldCollectLead && !definition.leadCaptureAllowed) {
    warnings.push(
      `W-STR-02: Decision requested lead capture but strategy ${strategyId} does not permit it`,
    );
  }

  return {
    strategyId,
    strategyGoal:                definition.goal,
    orderedSteps:                definition.orderedSteps,
    topicShiftDetected,
    leadCaptureAllowedByStrategy: definition.leadCaptureAllowed,
    mustAnswerFirst:             definition.mustAnswerFirst,
    mustEducate:                 definition.mustEducate,
    mustRecommendBeforeCapture:  definition.mustRecommendBeforeCapture,
    strategyWarnings:            warnings,
  };
}
