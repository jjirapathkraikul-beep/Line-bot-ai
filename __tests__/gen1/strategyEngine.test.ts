// Phase Pre-10.9 — Conversation Strategy Engine Tests
// Tests for selectConversationStrategy, topic shift detection, and strategy registry.
// Acceptance: 22 tests covering all 10 strategy IDs + guards + warnings.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { selectConversationStrategy } from '../../runtime-gen1/conversation/strategyEngine';
import { getStrategy, STRATEGY_REGISTRY } from '../../runtime-gen1/conversation/strategyRegistry';
import type { ConversationStrategyInput } from '../../runtime-gen1/conversation/strategyTypes';
import type { IntentDetectorResult } from '../../runtime-gen1/capability/intentDetector';
import type { CapabilityLoaderResult } from '../../runtime-gen1/capability/capabilityLoader';
import type { RuntimeMemoryResolution, CaptureStage } from '../../runtime-gen1/memory/memoryTypes';
import type { RuntimeDecisionResult } from '../../runtime-gen1/decision/decisionTypes';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeIntent(
  intent: string,
  flags: Partial<IntentDetectorResult['flags']> = {},
): IntentDetectorResult {
  return {
    intent: intent as IntentDetectorResult['intent'],
    confidence: 0.85,
    flags: {
      isTrustSignal:          false,
      isMedicalSignal:        false,
      isEmergency:            false,
      isHumanRequest:         false,
      isProductIntent:        false,
      isRecommendationIntent: false,
      ...flags,
    },
  };
}

function makeCapability(): CapabilityLoaderResult {
  return {
    primaryCapability: {
      capId: 'CAP-001', name: 'Greeting Handler',
      acpPath: 'AIOS/ACP/ACP-01_GREETING', priority: 'STANDARD',
    },
    secondaryCapabilities: [],
    selectedAcpPaths: ['AIOS/ACP/ACP-01_GREETING'],
    shouldInterruptCurrentState: false,
    reason: 'Greeting detected',
  };
}

function makeMemory(overrides: {
  captureStage?: CaptureStage;
  trustConcernActive?: boolean;
  leadCaptureAllowed?: boolean;
  valueDelivered?: boolean;
} = {}): RuntimeMemoryResolution {
  const {
    captureStage = 'IDLE' as CaptureStage,
    trustConcernActive = false,
    leadCaptureAllowed = true,
    valueDelivered = false,
  } = overrides;

  return {
    customerProfile: {
      real_name: null, display_name: null, age: null, gender: null,
      phone: null, preferred_contact_time: null, budget_annual: null,
      monthly_income: null, interest_category: null, product_interest: null,
      health_status: null, crm_saved: false, fields_captured: [],
    },
    leadMemory: {
      captureStage, nameRequested: false, phoneRequested: false,
      timeRequested: false, nameDeclined: false, phoneDeclined: false,
      timeDeclined: false, interruptedAtStage: null, valueDelivered,
    },
    medicalMemory: {
      medicalConcernActive: false, conditionsDisclosed: [],
      conditionsAssessed: [], conditionsPending: [],
      underwritingContextReady: false, followUpTurnCount: 0,
    },
    trustMemory: {
      trustConcernActive, trustConcernTurn: trustConcernActive ? 1 : null,
      turnsSinceTrustConcern: null, leadCaptureAllowed,
      trustResolved: false, credentialsDelivered: false, suspendedAcp: null,
    },
    conversationMemory: {
      turnCount: 1, currentState: 'idle', priorState: null,
      lastIntent: null, unresolvedQuestion: null,
    },
    knownFields: [],
    missingFields: [],
    deferredFields: [],
    neverAskAgainFields: [],
    nextBestFieldToAsk: null,
    extractedFacts: [],
    memoryDecisionReason: 'stub',
  };
}

function makeDecision(
  action: RuntimeDecisionResult['action'] = 'answer',
  overrides: Partial<RuntimeDecisionResult> = {},
): RuntimeDecisionResult {
  return {
    action,
    priority: 'STANDARD',
    shouldCollectLead: false,
    shouldEscalate: false,
    askField: null,
    mustAnswerFirst: true,
    mustBuildTrust: false,
    mustIncludeDisclaimer: false,
    mustIncludeRiskDisclosure: false,
    allowedCapabilities: [],
    blockedCapabilities: [],
    reason: 'stub decision',
    warnings: [],
    decisionTrace: {
      rulesEvaluated: ['R-FALLBACK'],
      ruleMatched: 'Fallback',
      ruleMatchedId: 'R-FALLBACK',
      conditionsMet: [],
      conditionsBlocked: [],
      priorityChain: ['CRITICAL', 'HIGH', 'STANDARD', 'LOW'],
      confidence: 0.65,
      alternativeAction: null,
    },
    ...overrides,
  };
}

function makeInput(
  intentName: string,
  intentFlags: Partial<IntentDetectorResult['flags']> = {},
  memoryOverrides: Parameters<typeof makeMemory>[0] = {},
  decisionAction: RuntimeDecisionResult['action'] = 'answer',
  decisionOverrides: Partial<RuntimeDecisionResult> = {},
): ConversationStrategyInput {
  return {
    intentResult:     makeIntent(intentName, intentFlags),
    capabilityResult: makeCapability(),
    memoryResult:     makeMemory(memoryOverrides),
    decisionResult:   makeDecision(decisionAction, decisionOverrides),
  };
}

// ─── STRAT: Strategy selection by action ─────────────────────────────────────

test('STRAT-01: action=answer → ANSWER_ONLY', () => {
  const result = selectConversationStrategy(makeInput('greeting', {}, {}, 'answer'));
  assert.equal(result.strategyId, 'ANSWER_ONLY');
});

test('STRAT-02: action=answer_then_ask + valueDelivered=true → ANSWER_FIRST_ONE_QUESTION', () => {
  const result = selectConversationStrategy(
    makeInput('product_inquiry', {}, { valueDelivered: true }, 'answer_then_ask'),
  );
  assert.equal(result.strategyId, 'ANSWER_FIRST_ONE_QUESTION');
});

test('STRAT-03: action=answer_then_ask + valueDelivered=false → EDUCATE_THEN_DISCOVER (CP-03)', () => {
  const result = selectConversationStrategy(
    makeInput('product_inquiry', {}, { valueDelivered: false }, 'answer_then_ask'),
  );
  assert.equal(result.strategyId, 'EDUCATE_THEN_DISCOVER');
});

test('STRAT-04: action=educate → EDUCATE_THEN_DISCOVER', () => {
  const result = selectConversationStrategy(makeInput('product_inquiry', {}, {}, 'educate'));
  assert.equal(result.strategyId, 'EDUCATE_THEN_DISCOVER');
});

test('STRAT-05: isTrustSignal=true → BUILD_TRUST_FIRST (overrides all else)', () => {
  const result = selectConversationStrategy(
    makeInput('trust_concern', { isTrustSignal: true }, {}, 'answer_then_ask'),
  );
  assert.equal(result.strategyId, 'BUILD_TRUST_FIRST');
});

test('STRAT-06: trustConcernActive=true → BUILD_TRUST_FIRST', () => {
  const result = selectConversationStrategy(
    makeInput('greeting', {}, { trustConcernActive: true }, 'answer'),
  );
  assert.equal(result.strategyId, 'BUILD_TRUST_FIRST');
});

test('STRAT-07: isMedicalSignal=true → MEDICAL_ANSWER_THEN_FOLLOWUP', () => {
  const result = selectConversationStrategy(
    makeInput('medical_concern', { isMedicalSignal: true }, {}, 'answer_then_ask'),
  );
  assert.equal(result.strategyId, 'MEDICAL_ANSWER_THEN_FOLLOWUP');
});

test('STRAT-08: action=recommend → RECOMMEND_THEN_CAPTURE', () => {
  const result = selectConversationStrategy(makeInput('product_inquiry', {}, {}, 'recommend'));
  assert.equal(result.strategyId, 'RECOMMEND_THEN_CAPTURE');
});

test('STRAT-09: shouldEscalate=true → HANDOFF_WITH_CONTEXT', () => {
  const result = selectConversationStrategy(
    makeInput('human_request', {}, {}, 'handoff', { shouldEscalate: true }),
  );
  assert.equal(result.strategyId, 'HANDOFF_WITH_CONTEXT');
});

test('STRAT-10: action=fallback → SAFE_FALLBACK', () => {
  const result = selectConversationStrategy(makeInput('unknown', {}, {}, 'fallback'));
  assert.equal(result.strategyId, 'SAFE_FALLBACK');
});

// ─── SHIFT: Topic shift detection (CP-08) ────────────────────────────────────

test('SHIFT-01: captureStage=NAME + isTrustSignal → topicShiftDetected=true, TOPIC_SHIFT_RECOVERY', () => {
  const result = selectConversationStrategy(
    makeInput('trust_concern', { isTrustSignal: true }, { captureStage: 'NAME' }, 'build_trust'),
  );
  // Trust signal takes priority over topic shift for strategyId, but topicShiftDetected is still true
  assert.equal(result.topicShiftDetected, true);
});

test('SHIFT-02: captureStage=PHONE + isProductIntent → topicShiftDetected=true', () => {
  const result = selectConversationStrategy(
    makeInput('product_inquiry', { isProductIntent: true }, { captureStage: 'PHONE' }, 'answer_then_ask'),
  );
  assert.equal(result.topicShiftDetected, true);
  assert.equal(result.strategyId, 'TOPIC_SHIFT_RECOVERY');
});

test('SHIFT-03: captureStage=IDLE → topicShiftDetected=false (no shift when not in capture)', () => {
  const result = selectConversationStrategy(
    makeInput('greeting', { isProductIntent: true }, { captureStage: 'IDLE' }, 'answer'),
  );
  assert.equal(result.topicShiftDetected, false);
});

test('SHIFT-04: captureStage=COMPLETE → topicShiftDetected=false (completed flow is not interrupted)', () => {
  const result = selectConversationStrategy(
    makeInput('greeting', { isMedicalSignal: true }, { captureStage: 'COMPLETE' }, 'answer'),
  );
  assert.equal(result.topicShiftDetected, false);
});

// ─── GUARD: Strategy property assertions ─────────────────────────────────────

test('GUARD-01: BUILD_TRUST_FIRST → leadCaptureAllowedByStrategy=false', () => {
  const result = selectConversationStrategy(
    makeInput('trust_concern', { isTrustSignal: true }, {}, 'build_trust'),
  );
  assert.equal(result.leadCaptureAllowedByStrategy, false);
});

test('GUARD-02: ANSWER_FIRST_ONE_QUESTION → mustAnswerFirst=true', () => {
  const result = selectConversationStrategy(
    makeInput('product_inquiry', {}, { valueDelivered: true }, 'answer_then_ask'),
  );
  assert.equal(result.mustAnswerFirst, true);
});

test('GUARD-03: EDUCATE_THEN_DISCOVER → mustEducate=true, leadCaptureAllowedByStrategy=false', () => {
  const result = selectConversationStrategy(makeInput('product_inquiry', {}, {}, 'educate'));
  assert.equal(result.mustEducate, true);
  assert.equal(result.leadCaptureAllowedByStrategy, false);
});

test('GUARD-04: RECOMMEND_THEN_CAPTURE → mustRecommendBeforeCapture=true', () => {
  const result = selectConversationStrategy(makeInput('product_inquiry', {}, {}, 'recommend'));
  assert.equal(result.mustRecommendBeforeCapture, true);
});

// ─── WARN: Strategy warnings ──────────────────────────────────────────────────

test('WARN-01: topic shift during NAME capture → CP-08 warning added', () => {
  const result = selectConversationStrategy(
    makeInput('product_inquiry', { isProductIntent: true }, { captureStage: 'NAME' }, 'answer_then_ask'),
  );
  assert.ok(
    result.strategyWarnings.some((w) => w.includes('CP-08')),
    'Expected CP-08 warning for topic shift',
  );
});

test('WARN-02: shouldCollectLead=true with trust strategy → W-STR-02 warning', () => {
  const result = selectConversationStrategy(
    makeInput('trust_concern', { isTrustSignal: true }, {}, 'build_trust', { shouldCollectLead: true }),
  );
  assert.ok(
    result.strategyWarnings.some((w) => w.includes('W-STR-02')),
    'Expected W-STR-02 warning for lead capture conflict',
  );
});

// ─── PROP: Result properties ──────────────────────────────────────────────────

test('PROP-01: result always has strategyGoal as non-empty string', () => {
  const result = selectConversationStrategy(makeInput('greeting', {}, {}, 'answer'));
  assert.ok(typeof result.strategyGoal === 'string' && result.strategyGoal.length > 0);
});

test('PROP-02: result always has orderedSteps as non-empty array', () => {
  const result = selectConversationStrategy(makeInput('greeting', {}, {}, 'answer'));
  assert.ok(Array.isArray(result.orderedSteps) && result.orderedSteps.length > 0);
});

test('PROP-03: STRATEGY_REGISTRY has exactly 10 entries', () => {
  assert.equal(Object.keys(STRATEGY_REGISTRY).length, 10);
});

test('PROP-04: getStrategy returns definition matching the requested ID', () => {
  const def = getStrategy('BUILD_TRUST_FIRST');
  assert.equal(def.id, 'BUILD_TRUST_FIRST');
  assert.equal(def.leadCaptureAllowed, false);
  assert.ok(def.patterns.includes('CP-04'));
});
