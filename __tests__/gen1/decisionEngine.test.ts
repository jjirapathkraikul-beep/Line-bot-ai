// Phase 10.5 — Decision Engine Tests
// Tests deterministic rule evaluation across all 12 action scenarios.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { makeDecision } from '../../runtime-gen1/decision/decisionEngine';
import {
  ruleTrustBeforeLead,
  ruleMedicalBeforeSales,
  ruleClaimHospitalBeforeLead,
  ruleHumanHandoff,
  ruleProductEducation,
  ruleRecommendation,
  ruleLeadCapture,
  ruleUnknownDiscover,
  ruleFallback,
} from '../../runtime-gen1/decision/decisionRules';
import type { RuntimeDecisionInput } from '../../runtime-gen1/decision/decisionTypes';
import type { IntentDetectorResult } from '../../runtime-gen1/capability/intentDetector';
import type { CapabilityLoaderResult } from '../../runtime-gen1/capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../../runtime-gen1/memory/memoryTypes';
import type { KnowledgeSelectionResult } from '../../runtime-gen1/knowledge/knowledgeTypes';
import type { RuntimeInput } from '../../runtime-gen1/core/types';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeRuntimeInput(message = 'test'): RuntimeInput {
  return {
    userId:      'U_TEST_001',
    message,
    displayName: 'Test User',
    replyToken:  'REPLY_TEST',
    timestamp:   '2026-01-01T00:00:00.000Z',
    session:     {},
  };
}

function makeIntent(
  intent: string,
  flags: Partial<IntentDetectorResult['flags']> = {},
): IntentDetectorResult {
  return {
    intent,
    confidence: 0.85,
    matchedKeywords: [],
    flags: {
      isTrustSignal:        false,
      isMedicalSignal:      false,
      isEmergency:          false,
      isHumanRequest:       false,
      isProductIntent:      false,
      isPriceIntent:        false,
      isRecommendationIntent: false,
      ...flags,
    },
  };
}

function makeCapability(): CapabilityLoaderResult {
  return {
    primaryCapability: {
      capId: 'CAP-001',
      acpId: 'ACP-01',
      name:  'Greeting',
      priority: 'STANDARD',
      description: 'Stub',
      acpPaths: [],
    },
    secondaryCapabilities: [],
    selectedAcpPaths: [],
    priority: 'STANDARD',
    shouldInterruptCurrentState: false,
    reason: 'stub',
  };
}

function makeMemory(overrides: {
  trustConcernActive?: boolean;
  leadCaptureAllowed?: boolean;
  medicalConcernActive?: boolean;
  valueDelivered?: boolean;
  nextBestFieldToAsk?: string | null;
  knownFields?: string[];
  interest_category?: string | null;
  age?: number | null;
  budget_annual?: number | null;
} = {}): RuntimeMemoryResolution {
  const {
    trustConcernActive   = false,
    leadCaptureAllowed   = true,
    medicalConcernActive = false,
    valueDelivered       = false,
    nextBestFieldToAsk   = null,
    knownFields          = [],
    interest_category    = null,
    age                  = null,
    budget_annual        = null,
  } = overrides;

  return {
    customerProfile: {
      real_name:         null,
      age,
      gender:            null,
      occupation:        null,
      income_annual:     null,
      budget_annual,
      interest_category,
      family_status:     null,
      health_status:     null,
      existing_policies: [],
    },
    extractedFacts: [],
    leadMemory: {
      fieldsCollected:     knownFields,
      nextFieldPriority:   nextBestFieldToAsk ?? undefined,
      valueDelivered,
      captureStartedAt:    null,
      lastFieldAskedAt:    null,
    },
    medicalMemory: {
      medicalConcernActive,
      conditionsDisclosed: [],
      underwritingStarted: false,
      medicalTurnCount:    0,
    },
    trustMemory: {
      trustConcernActive,
      leadCaptureAllowed,
      trustResolvedAt:          null,
      turnsSinceTrustConcern:   0,
    },
    knownFields,
    missingFields:       [],
    deferredFields:      [],
    neverAskAgainFields: [],
    nextBestFieldToAsk:  nextBestFieldToAsk,
    shouldAskField:      nextBestFieldToAsk !== null,
    memoryDecisionReason: 'stub',
    memoryTrace: {
      fieldsFromSession:  [],
      fieldsFromMessage:  [],
      fieldsBlocked:      [],
      leadCaptureAllowed,
      trustActive:        trustConcernActive,
      medicalActive:      medicalConcernActive,
    },
  };
}

function makeKnowledge(): KnowledgeSelectionResult {
  return {
    selectedSources: [],
    loadedSnippets:  [],
    mandatorySources: [],
    optionalSources:  [],
    missingSources:   [],
    warnings:         [],
    knowledgeTrace: {
      intentUsed:              'unknown',
      sourcesConsidered:       0,
      sourcesSelected:         0,
      sourcesLoaded:           0,
      sourcesMissing:          0,
      mandatoryIncluded:       false,
      mandatoryMissing:        [],
      cacheHits:               0,
      blockedProductDocs:      false,
      mandatoryFragmentsAdded: [],
      knowledgeDecisionReason: 'stub',
    },
  };
}

function makeInput(
  intent: string,
  intentFlags: Partial<IntentDetectorResult['flags']> = {},
  memoryOverrides: Parameters<typeof makeMemory>[0] = {},
): RuntimeDecisionInput {
  return {
    runtimeInput:     makeRuntimeInput(),
    intentResult:     makeIntent(intent, intentFlags),
    capabilityResult: makeCapability(),
    memoryResult:     makeMemory(memoryOverrides),
    knowledgeResult:  makeKnowledge(),
  };
}

// ─── R01: Trust ───────────────────────────────────────────────────────────────

test('DECISION-R01-01: trust signal → build_trust, CRITICAL, shouldCollectLead=false', () => {
  const result = makeDecision(makeInput('trust_concern', { isTrustSignal: true }));
  assert.equal(result.action, 'build_trust');
  assert.equal(result.priority, 'CRITICAL');
  assert.equal(result.shouldCollectLead, false);
  assert.equal(result.mustBuildTrust, true);
  assert.equal(result.askField, null);
});

test('DECISION-R01-02: trust ACP-11 blocked when isTrustSignal', () => {
  const result = makeDecision(makeInput('trust_concern', { isTrustSignal: true }));
  assert.ok(result.blockedCapabilities.includes('ACP-11'));
});

test('DECISION-R01-03: session trustConcernActive triggers build_trust even without signal', () => {
  const result = makeDecision(
    makeInput('health_insurance', {}, { trustConcernActive: true, leadCaptureAllowed: false }),
  );
  assert.equal(result.action, 'build_trust');
  assert.equal(result.priority, 'CRITICAL');
});

test('DECISION-R01-04: ruleTrustBeforeLead returns null when no trust', () => {
  const input = makeInput('health_insurance', { isProductIntent: true });
  assert.equal(ruleTrustBeforeLead(input), null);
});

// ─── R02: Medical ─────────────────────────────────────────────────────────────

test('DECISION-R02-01: medical signal → answer_then_ask, mustIncludeDisclaimer=true', () => {
  const result = makeDecision(makeInput('medical_underwriting', { isMedicalSignal: true }));
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.mustIncludeDisclaimer, true);
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R02-02: medical askField = medical_follow_up sentinel (not a lead field)', () => {
  const result = makeDecision(makeInput('medical_underwriting', { isMedicalSignal: true }));
  assert.equal(result.askField, 'medical_follow_up');
});

test('DECISION-R02-03: ruleMedicalBeforeSales returns null when no medical signal', () => {
  const input = makeInput('health_insurance', { isProductIntent: true });
  assert.equal(ruleMedicalBeforeSales(input), null);
});

// ─── R03: Claim / Hospital ────────────────────────────────────────────────────

test('DECISION-R03-01: claim_question → claim_guide, no lead capture', () => {
  const result = makeDecision(makeInput('claim_question'));
  assert.equal(result.action, 'claim_guide');
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R03-02: hospital_question → answer_then_ask, no lead capture', () => {
  const result = makeDecision(makeInput('hospital_question'));
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R03-03: emergency flag → emergency_guide + shouldEscalate', () => {
  const result = makeDecision(makeInput('hospital_question', { isEmergency: true }));
  assert.equal(result.action, 'emergency_guide');
  assert.equal(result.shouldEscalate, true);
});

// ─── R04: Human Handoff ───────────────────────────────────────────────────────

test('DECISION-R04-01: human request → handoff, shouldEscalate=true', () => {
  const result = makeDecision(makeInput('human_handoff', { isHumanRequest: true }));
  assert.equal(result.action, 'handoff');
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.shouldEscalate, true);
});

test('DECISION-R04-02: human handoff collects phone when not yet known', () => {
  const result = makeDecision(
    makeInput('human_handoff', { isHumanRequest: true }, { knownFields: [] }),
  );
  assert.equal(result.shouldCollectLead, true);
  assert.equal(result.askField, 'phone');
});

test('DECISION-R04-03: human handoff skips phone if already known; asks real_name', () => {
  const result = makeDecision(
    makeInput('human_handoff', { isHumanRequest: true }, { knownFields: ['phone'] }),
  );
  assert.equal(result.askField, 'real_name');
});

test('DECISION-R04-04: human handoff with all contact fields → shouldCollectLead=false', () => {
  const result = makeDecision(
    makeInput('human_handoff', { isHumanRequest: true }, {
      knownFields: ['phone', 'real_name', 'preferred_contact_time'],
    }),
  );
  assert.equal(result.shouldCollectLead, false);
  assert.equal(result.askField, null);
});

// ─── R07: Product Education ───────────────────────────────────────────────────

test('DECISION-R07-01: product intent without value delivered → educate', () => {
  const result = makeDecision(makeInput('health_insurance', { isProductIntent: true }, { valueDelivered: false }));
  assert.equal(result.action, 'educate');
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R07-02: product intent with value delivered → answer_then_ask + lead field', () => {
  const result = makeDecision(
    makeInput('health_insurance', { isProductIntent: true }, {
      valueDelivered: true,
      nextBestFieldToAsk: 'phone',
      leadCaptureAllowed: true,
    }),
  );
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.shouldCollectLead, true);
  assert.equal(result.askField, 'phone');
});

test('DECISION-R07-03: investment_linked → mustIncludeRiskDisclosure=true', () => {
  const result = makeDecision(makeInput('investment_linked', { isProductIntent: true }));
  assert.equal(result.mustIncludeRiskDisclosure, true);
});

test('DECISION-R07-04: price_objection intent matches product education rule', () => {
  const result = ruleProductEducation(makeInput('price_objection', { isPriceIntent: false }));
  assert.notEqual(result, null);
  assert.equal(result?.action, 'educate');
});

// ─── R08: Recommendation ─────────────────────────────────────────────────────

test('DECISION-R08-01: recommendation with enough facts → recommend', () => {
  const result = makeDecision(
    makeInput('recommendation_request', { isRecommendationIntent: true }, {
      interest_category: 'health',
      age: 35,
    }),
  );
  assert.equal(result.action, 'recommend');
  assert.equal(result.priority, 'STANDARD');
});

test('DECISION-R08-02: recommendation without interest_category → answer_then_ask + askField=interest_category', () => {
  const result = makeDecision(
    makeInput('recommendation_request', { isRecommendationIntent: true }, {
      interest_category: null,
      age: null,
    }),
  );
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.askField, 'interest_category');
});

test('DECISION-R08-03: recommendation with category but no age/budget → asks for age', () => {
  const result = makeDecision(
    makeInput('recommendation_request', { isRecommendationIntent: true }, {
      interest_category: 'cancer',
      age: null,
      budget_annual: null,
    }),
  );
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.askField, 'age');
});

// ─── R07b: Lead Capture ───────────────────────────────────────────────────────

test('DECISION-R07b-01: ruleLeadCapture returns collect_lead when all conditions met', () => {
  const input = makeInput('unknown', {}, {
    leadCaptureAllowed: true,
    valueDelivered: true,
    nextBestFieldToAsk: 'phone',
    knownFields: [],
  });
  // Override intent to something that doesn't fire R01-R07 or R08
  // Use ruleLeadCapture directly since R09 would fire first via engine
  const result = ruleLeadCapture(input);
  assert.notEqual(result, null);
  assert.equal(result?.action, 'collect_lead');
  assert.equal(result?.askField, 'phone');
  assert.equal(result?.shouldCollectLead, true);
});

test('DECISION-R07b-02: ruleLeadCapture returns null when value not delivered', () => {
  const input = makeInput('unknown', {}, {
    valueDelivered: false,
    nextBestFieldToAsk: 'phone',
  });
  assert.equal(ruleLeadCapture(input), null);
});

test('DECISION-R07b-03: ruleLeadCapture returns null when trust blocks lead capture', () => {
  const input = makeInput('unknown', {}, {
    leadCaptureAllowed: false,
    valueDelivered: true,
    nextBestFieldToAsk: 'phone',
  });
  assert.equal(ruleLeadCapture(input), null);
});

test('DECISION-R07b-04: ruleLeadCapture returns null when nextBestFieldToAsk is null', () => {
  const input = makeInput('unknown', {}, {
    leadCaptureAllowed: true,
    valueDelivered: true,
    nextBestFieldToAsk: null,
  });
  assert.equal(ruleLeadCapture(input), null);
});

// ─── Known Field Protection (CP-05) ──────────────────────────────────────────

test('DECISION-CP05-01: engine blocks asking a known field (W01 warning)', () => {
  // Manually construct input where R07 would try to ask 'phone' but phone is known
  // by giving nextBestFieldToAsk='phone' AND knownFields=['phone']
  // The rule itself has safePick, but engine double-checks
  const input: RuntimeDecisionInput = {
    runtimeInput:     makeRuntimeInput(),
    intentResult:     makeIntent('health_insurance', { isProductIntent: true }),
    capabilityResult: makeCapability(),
    memoryResult:     makeMemory({
      valueDelivered:     true,
      leadCaptureAllowed: true,
      nextBestFieldToAsk: 'phone',
      knownFields:        ['phone'],   // phone IS known
    }),
    knowledgeResult: makeKnowledge(),
  };
  const result = makeDecision(input);
  // R07 safePick should have returned null already; engine is the safety net
  assert.equal(result.askField, null, 'should not ask a known field');
  assert.equal(result.shouldCollectLead, false);
});

// ─── R09: Discovery / Greeting ────────────────────────────────────────────────

test('DECISION-R09-01: greeting → answer, no lead capture', () => {
  const result = makeDecision(makeInput('greeting'));
  assert.equal(result.action, 'answer');
  assert.equal(result.priority, 'LOW');
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R09-02: unknown intent → discovery', () => {
  const result = makeDecision(makeInput('unknown'));
  assert.equal(result.action, 'discovery');
  assert.equal(result.priority, 'LOW');
  assert.equal(result.shouldCollectLead, false);
});

test('DECISION-R09-03: ruleUnknownDiscover returns null for non-greeting non-unknown intent', () => {
  const input = makeInput('health_insurance', { isProductIntent: true });
  assert.equal(ruleUnknownDiscover(input), null);
});

// ─── R10: Fallback ────────────────────────────────────────────────────────────

test('DECISION-R10-01: ruleFallback always returns fallback action', () => {
  const result = ruleFallback(makeInput('unknown'));
  assert.equal(result.action, 'fallback');
  assert.equal(result.priority, 'LOW');
  assert.equal(result.shouldCollectLead, false);
});

// ─── Priority override checks ─────────────────────────────────────────────────

test('DECISION-PRI-01: trust signal overrides medical signal (CRITICAL beats HIGH)', () => {
  const result = makeDecision(
    makeInput('medical_underwriting', { isTrustSignal: true, isMedicalSignal: true }),
  );
  assert.equal(result.action, 'build_trust');
  assert.equal(result.priority, 'CRITICAL');
});

test('DECISION-PRI-02: medical signal overrides product intent (HIGH beats STANDARD)', () => {
  const result = makeDecision(
    makeInput('health_insurance', { isMedicalSignal: true, isProductIntent: true }),
  );
  assert.equal(result.action, 'answer_then_ask');
  assert.equal(result.mustIncludeDisclaimer, true);
  assert.equal(result.priority, 'HIGH');
});

// ─── Decision trace ───────────────────────────────────────────────────────────

test('DECISION-TRACE-01: trace includes rulesEvaluated and ruleMatchedId', () => {
  const result = makeDecision(makeInput('unknown'));
  const { decisionTrace } = result;
  assert.ok(Array.isArray(decisionTrace.rulesEvaluated));
  assert.ok(decisionTrace.rulesEvaluated.length > 0);
  assert.ok(typeof decisionTrace.ruleMatchedId === 'string');
  assert.ok(typeof decisionTrace.ruleMatched === 'string');
});

test('DECISION-TRACE-02: trace confidence is 0.98 for CRITICAL decisions', () => {
  const result = makeDecision(makeInput('trust_concern', { isTrustSignal: true }));
  assert.equal(result.decisionTrace.confidence, 0.98);
});

test('DECISION-TRACE-03: trace includes priorityChain with all four levels', () => {
  const result = makeDecision(makeInput('unknown'));
  const { priorityChain } = result.decisionTrace;
  assert.ok(priorityChain.includes('CRITICAL'));
  assert.ok(priorityChain.includes('HIGH'));
  assert.ok(priorityChain.includes('STANDARD'));
  assert.ok(priorityChain.includes('LOW'));
});

test('DECISION-TRACE-04: alternativeAction populated when second rule matches', () => {
  // medical signal fires R02; product education R07 would also fire
  const result = makeDecision(
    makeInput('health_insurance', { isMedicalSignal: true, isProductIntent: true }),
  );
  // R02 matches first; R07 is the alternative
  assert.notEqual(result.decisionTrace.alternativeAction, undefined);
});

// ─── Runtime integration ──────────────────────────────────────────────────────

test('DECISION-RUNTIME-01: execute() populates decision trace fields (gen1 mode)', async () => {
  const origMode = process.env['AI_RUNTIME_MODE'];
  process.env['AI_RUNTIME_MODE'] = 'gen1';
  try {
    const { execute } = await import('../../runtime-gen1/core/runtime');
    const out = await execute({
      userId:      'U_TEST_RUNTIME',
      message:     'สวัสดีครับ',
      session:     {},
      displayName: 'Test',
      replyToken:  'REPLY_RT',
      timestamp:   '2026-01-01T00:00:00.000Z',
    });
    assert.ok(out.trace.action !== undefined, 'trace.action should be set');
    assert.ok(out.trace.decisionPriority !== undefined);
    assert.ok(typeof out.trace.shouldCollectLead === 'boolean');
    assert.ok(typeof out.trace.mustAnswerFirst === 'boolean');
  } finally {
    if (origMode === undefined) delete process.env['AI_RUNTIME_MODE'];
    else process.env['AI_RUNTIME_MODE'] = origMode;
  }
});

test('DECISION-RUNTIME-02: version bumped to gen1-stub-0.5.0', async () => {
  const { RUNTIME_VERSION } = await import('../../runtime-gen1/core/runtime');
  assert.equal(RUNTIME_VERSION, 'gen1-stub-0.5.0');
});
