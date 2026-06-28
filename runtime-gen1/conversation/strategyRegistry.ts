// Gen1 Strategy Registry — Phase Pre-10.9
// Maps each ConversationStrategyId to its full definition.
// Source: AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md.

import type { ConversationStrategyDefinition, ConversationStrategyId } from './strategyTypes';

const STRATEGY_REGISTRY: Record<ConversationStrategyId, ConversationStrategyDefinition> = {
  ANSWER_ONLY: {
    id: 'ANSWER_ONLY',
    name: 'Answer Only',
    goal: 'Deliver a direct, complete answer with no follow-up question.',
    orderedSteps: [
      'Answer the question directly and completely (CP-01)',
      'Close without asking anything (CP-02: no question needed)',
    ],
    patterns: ['CP-01', 'CP-09'],
    leadCaptureAllowed: false,
    mustAnswerFirst: true,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  ANSWER_FIRST_ONE_QUESTION: {
    id: 'ANSWER_FIRST_ONE_QUESTION',
    name: 'Answer First, One Question',
    goal: 'Answer the customer fully first, then ask ONE follow-up to advance the conversation.',
    orderedSteps: [
      'Answer the customer\'s question fully (CP-01)',
      'Ask exactly ONE follow-up question (CP-02)',
      'Never bundle questions in the same response',
    ],
    patterns: ['CP-01', 'CP-02'],
    leadCaptureAllowed: true,
    mustAnswerFirst: true,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  EDUCATE_THEN_DISCOVER: {
    id: 'EDUCATE_THEN_DISCOVER',
    name: 'Educate Then Discover',
    goal: 'Deliver educational value before collecting any customer data (CP-03).',
    orderedSteps: [
      'Provide relevant educational content first (CP-03)',
      'Optionally close with ONE soft discovery question (CP-02)',
      'Never collect lead data before value is delivered',
    ],
    patterns: ['CP-03', 'CP-02'],
    leadCaptureAllowed: false,
    mustAnswerFirst: true,
    mustEducate: true,
    mustRecommendBeforeCapture: false,
  },

  BUILD_TRUST_FIRST: {
    id: 'BUILD_TRUST_FIRST',
    name: 'Build Trust First',
    goal: 'Address trust concerns with verifiable evidence. No products or data collection (CP-04).',
    orderedSteps: [
      'Acknowledge the customer\'s concern without being defensive (CP-04)',
      'Provide verifiable identity evidence (license, company registration)',
      'Answer questions in chat without requiring personal data',
      'Wait at least 2 turns before any product mention',
    ],
    patterns: ['CP-04'],
    leadCaptureAllowed: false,
    mustAnswerFirst: false,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  MEDICAL_ANSWER_THEN_FOLLOWUP: {
    id: 'MEDICAL_ANSWER_THEN_FOLLOWUP',
    name: 'Medical Answer Then Followup',
    goal: 'Respond to medical context with empathy first, then a careful answer with uncertainty language.',
    orderedSteps: [
      'Acknowledge the medical context with genuine empathy (CP-06)',
      'Answer with explicit medical uncertainty language (ACP-04)',
      'Ask ONE careful follow-up question only if necessary (CP-02)',
    ],
    patterns: ['CP-06', 'CP-02', 'CP-09'],
    leadCaptureAllowed: false,
    mustAnswerFirst: true,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  RECOMMEND_THEN_CAPTURE: {
    id: 'RECOMMEND_THEN_CAPTURE',
    name: 'Recommend Then Capture',
    goal: 'Deliver a personalized recommendation citing the customer\'s context, then capture lead on positive signal.',
    orderedSteps: [
      'Reference the customer\'s own words and situation (CP-07)',
      'Deliver recommendation — maximum 2 products, explain WHY each fits',
      'Capture lead data ONLY if customer responds positively (ACP-11)',
      'Never re-ask known fields (CP-05)',
    ],
    patterns: ['CP-07', 'CP-05', 'CP-02'],
    leadCaptureAllowed: true,
    mustAnswerFirst: false,
    mustEducate: false,
    mustRecommendBeforeCapture: true,
  },

  CLARIFY_THEN_CONTINUE: {
    id: 'CLARIFY_THEN_CONTINUE',
    name: 'Clarify Then Continue',
    goal: 'Ask a single clarifying question to resolve ambiguity before taking action.',
    orderedSteps: [
      'Acknowledge what was understood',
      'Ask exactly ONE clarifying question (CP-02)',
      'Do not collect any lead data until intent is clear',
    ],
    patterns: ['CP-02'],
    leadCaptureAllowed: false,
    mustAnswerFirst: false,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  HANDOFF_WITH_CONTEXT: {
    id: 'HANDOFF_WITH_CONTEXT',
    name: 'Handoff With Context',
    goal: 'Transition the conversation to Jirawat with a full context package. Frame as positive progression (CP-10).',
    orderedSteps: [
      'Acknowledge the customer\'s need warmly (CP-10)',
      'Frame handoff as a positive next step — never as an AI limitation',
      'Provide context package for Jirawat',
      'No product pitch or data collection',
    ],
    patterns: ['CP-10'],
    leadCaptureAllowed: false,
    mustAnswerFirst: false,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  SAFE_FALLBACK: {
    id: 'SAFE_FALLBACK',
    name: 'Safe Fallback',
    goal: 'Deliver a short, honest response when no specific strategy can be determined (CP-09).',
    orderedSteps: [
      'Acknowledge the customer without system failure language',
      'Offer a concrete help path',
      'No data collection, no product mention',
    ],
    patterns: ['CP-09'],
    leadCaptureAllowed: false,
    mustAnswerFirst: false,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },

  TOPIC_SHIFT_RECOVERY: {
    id: 'TOPIC_SHIFT_RECOVERY',
    name: 'Topic Shift Recovery',
    goal: 'Follow the customer\'s topic shift gracefully. Cancel prior interrupted state (CP-08).',
    orderedSteps: [
      'Acknowledge the new topic naturally (CP-08)',
      'Cancel the previous interrupted flow — never force the customer back',
      'Start fresh on the new topic with CP-01 (answer first)',
    ],
    patterns: ['CP-08', 'CP-01'],
    leadCaptureAllowed: false,
    mustAnswerFirst: true,
    mustEducate: false,
    mustRecommendBeforeCapture: false,
  },
};

export function getStrategy(id: ConversationStrategyId): ConversationStrategyDefinition {
  return STRATEGY_REGISTRY[id];
}

export { STRATEGY_REGISTRY };
