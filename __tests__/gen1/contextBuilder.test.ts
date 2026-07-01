// Phase 10.6 — Context Builder Tests
// Tests for buildExecutionContext, contextCompressor, contextValidator.
// Acceptance: 30+ tests covering all 5 validation categories + builder sections.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildExecutionContext } from '../../runtime-gen1/context/contextBuilder';
import { compressExecutionContext } from '../../runtime-gen1/context/contextCompressor';
import { validateExecutionContext } from '../../runtime-gen1/context/contextValidator';
import type { ContextBuilderInput } from '../../runtime-gen1/context/contextTypes';
import type { IntentDetectorResult } from '../../runtime-gen1/capability/intentDetector';
import type { CapabilityLoaderResult } from '../../runtime-gen1/capability/capabilityLoader';
import type { RuntimeMemoryResolution, CaptureStage } from '../../runtime-gen1/memory/memoryTypes';
import type { KnowledgeSelectionResult } from '../../runtime-gen1/knowledge/knowledgeTypes';
import type { RuntimeDecisionResult } from '../../runtime-gen1/decision/decisionTypes';
import type { RuntimeInput } from '../../runtime-gen1/core/types';
import type { ConversationStrategyResult } from '../../runtime-gen1/conversation/strategyTypes';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeRuntimeInput(message = 'สวัสดีครับ'): RuntimeInput {
  return {
    userId:      'U_CTX_TEST_001',
    message,
    displayName: 'Test Customer',
    replyToken:  'REPLY_CTX_TEST',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  };
}

function makeIntent(
  intent: string,
  flags: Partial<IntentDetectorResult['flags']> = {},
  confidence = 0.85,
): IntentDetectorResult {
  return {
    intent,
    confidence,
    matchedKeywords: [],
    flags: {
      isTrustSignal:          false,
      isMedicalSignal:        false,
      isEmergency:            false,
      isHumanRequest:         false,
      isProductIntent:        false,
      isPriceIntent:          false,
      isRecommendationIntent: false,
      ...flags,
    },
  };
}

function makeCapability(
  capId = 'CAP-001',
  acpPath = 'AIOS/ACP/ACP-01_GREETING',
  priority: CapabilityLoaderResult['priority'] = 'STANDARD',
): CapabilityLoaderResult {
  return {
    primaryCapability: {
      capId,
      acpId: 'ACP-01',
      name:  'Greeting',
      priority,
      description: 'Greeting handler stub',
      acpPaths: [acpPath],
      acpPath,
      supportedIntents: ['greeting'],
      canInterruptLeadCapture: false,
      requiresHumanEscalation: false,
    } as unknown as CapabilityLoaderResult['primaryCapability'],
    secondaryCapabilities: [],
    selectedAcpPaths: [acpPath],
    priority,
    shouldInterruptCurrentState: false,
    reason: 'stub capability',
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
  conditionsDisclosed?: string[];
  captureStage?: CaptureStage;
  trustResolved?: boolean;
  turnsSinceTrustConcern?: number;
} = {}): RuntimeMemoryResolution {
  const {
    trustConcernActive     = false,
    leadCaptureAllowed     = true,
    medicalConcernActive   = false,
    valueDelivered         = false,
    nextBestFieldToAsk     = null,
    knownFields            = [],
    interest_category      = null,
    age                    = null,
    budget_annual          = null,
    conditionsDisclosed    = [],
    captureStage           = 'IDLE' as CaptureStage,
    trustResolved          = false,
    turnsSinceTrustConcern = 0,
  } = overrides;

  return {
    customerProfile: {
      real_name:              null,
      display_name:           null,
      age,
      gender:                 null,
      phone:                  null,
      preferred_contact_time: null,
      budget_annual,
      monthly_income:         null,
      interest_category,
      product_interest:       null,
      health_status:          null,
      crm_saved:              false,
      fields_captured:        knownFields,
    },
    extractedFacts: [],
    leadMemory: {
      captureStage,
      nameRequested:       false,
      phoneRequested:      false,
      timeRequested:       false,
      nameDeclined:        false,
      phoneDeclined:       false,
      timeDeclined:        false,
      interruptedAtStage:  null,
      valueDelivered,
    },
    medicalMemory: {
      medicalConcernActive,
      conditionsDisclosed,
      conditionsAssessed:       [],
      conditionsPending:        [],
      underwritingContextReady: false,
      followUpTurnCount:        0,
    },
    trustMemory: {
      trustConcernActive,
      trustConcernTurn:       trustConcernActive ? 1 : null,
      turnsSinceTrustConcern,
      leadCaptureAllowed,
      trustResolved,
      credentialsDelivered:   false,
      suspendedAcp:           null,
    },
    conversationMemory: {
      turnCount:          1,
      currentState:       'idle',
      priorState:         null,
      lastIntent:         null,
      unresolvedQuestion: null,
    },
    knownFields,
    missingFields:       [],
    deferredFields:      [],
    neverAskAgainFields: [],
    nextBestFieldToAsk,
    shouldAskField:      nextBestFieldToAsk !== null,
    memoryDecisionReason: 'stub',
    memoryTrace: {
      fieldsFromSession:  [],
      fieldsFromMessage:  [],
      fieldsFromHistory:  [],
      fieldsBlocked:      [],
      leadCaptureAllowed,
      trustActive:        trustConcernActive,
      medicalActive:      medicalConcernActive,
    },
  };
}

function makeKnowledge(sources: Array<{ path: string; content: string; mandatory?: boolean }> = []): KnowledgeSelectionResult {
  const loadedSnippets = sources.map((s) => ({
    sourcePath:   s.path,
    title:        s.path.split('/').pop() ?? 'stub',
    content:      s.content,
    charCount:    s.content.length,
    trustLevel:   'HIGH' as const,
    freshness:    'STABLE' as const,
    loadedAt:     0,
    isMandatory:  s.mandatory ?? false,
    isCacheHit:   false,
  }));

  const selectedSources = sources.map((s) => ({
    id:             s.path.replace(/\//g, '-'),
    path:           s.path,
    type:           'domain_knowledge' as const,
    trustLevel:     'HIGH' as const,
    freshness:      'STABLE' as const,
    mandatory:      s.mandatory ?? false,
    relevanceScore: 0.9,
    description:    'stub source',
  }));

  return {
    selectedSources,
    loadedSnippets,
    mandatorySources: sources.filter((s) => s.mandatory).map((s) => s.path),
    optionalSources:  sources.filter((s) => !s.mandatory).map((s) => s.path),
    missingSources:   [],
    warnings:         [],
    knowledgeTrace: {
      intentUsed:              'unknown',
      sourcesConsidered:       sources.length,
      sourcesSelected:         sources.length,
      sourcesLoaded:           sources.length,
      sourcesMissing:          0,
      mandatoryIncluded:       sources.some((s) => s.mandatory),
      mandatoryMissing:        [],
      cacheHits:               0,
      blockedProductDocs:      false,
      mandatoryFragmentsAdded: sources.filter((s) => s.mandatory).map((s) => s.path),
      knowledgeDecisionReason: 'stub',
    },
  };
}

function makeDecision(
  action: RuntimeDecisionResult['action'],
  overrides: Partial<RuntimeDecisionResult> = {},
): RuntimeDecisionResult {
  return {
    action,
    priority:                  'STANDARD',
    shouldCollectLead:         false,
    shouldEscalate:            false,
    askField:                  null,
    mustAnswerFirst:           true,
    mustBuildTrust:            false,
    mustIncludeDisclaimer:     false,
    mustIncludeRiskDisclosure: false,
    allowedCapabilities:       [],
    blockedCapabilities:       [],
    reason:                    `${action} selected by rule`,
    warnings:                  [],
    decisionTrace: {
      rulesEvaluated:    [],
      ruleMatched:       'stub',
      ruleMatchedId:     'R-TEST',
      conditionsMet:     [],
      conditionsBlocked: [],
      priorityChain:     ['STANDARD'],
      confidence:        0.85,
      alternativeAction: null,
    },
    ...overrides,
  };
}

function makeStrategy(overrides: Partial<ConversationStrategyResult> = {}): ConversationStrategyResult {
  return {
    strategyId:                  'ANSWER_ONLY',
    strategyGoal:                'Deliver a direct, complete answer with no follow-up question.',
    orderedSteps:                ['Answer the question directly (CP-01)', 'Close without asking anything'],
    topicShiftDetected:          false,
    leadCaptureAllowedByStrategy: false,
    mustAnswerFirst:             true,
    mustEducate:                 false,
    mustRecommendBeforeCapture:  false,
    strategyWarnings:            [],
    ...overrides,
  };
}

function makeInput(
  message: string,
  intent: string,
  intentFlags: Partial<IntentDetectorResult['flags']> = {},
  memoryOverrides: Parameters<typeof makeMemory>[0] = {},
  decisionOverrides: Partial<RuntimeDecisionResult> = {},
  decisionAction: RuntimeDecisionResult['action'] = 'answer',
  knowledgeSources: Parameters<typeof makeKnowledge>[0] = [],
): ContextBuilderInput {
  return {
    runtimeInput:     makeRuntimeInput(message),
    intentResult:     makeIntent(intent, intentFlags, 0.85),
    capabilityResult: makeCapability(),
    memoryResult:     makeMemory(memoryOverrides),
    knowledgeResult:  makeKnowledge(knowledgeSources),
    decisionResult:   makeDecision(decisionAction, decisionOverrides),
    strategyResult:   makeStrategy(),
  };
}

// ─── CTX-BUILD: Builder structural tests ─────────────────────────────────────

test('CTX-BUILD-01: builder returns all 18 ExecutionContext sections', () => {
  const result = buildExecutionContext(makeInput('สวัสดีครับ', 'greeting'));
  const ctx = result.executionContext;
  assert.ok(ctx.request,               'missing: request');
  assert.ok(ctx.user,                  'missing: user');
  assert.ok(ctx.session,               'missing: session');
  assert.ok(ctx.message,               'missing: message');
  assert.ok(ctx.intent,                'missing: intent');
  assert.ok(ctx.capability,            'missing: capability');
  assert.ok(ctx.memory,                'missing: memory');
  assert.ok(ctx.knowledge,             'missing: knowledge');
  assert.ok(ctx.decision,              'missing: decision');
  assert.ok(ctx.conversationStrategy,  'missing: conversationStrategy');
  assert.ok(ctx.responseProfile,       'missing: responseProfile');
  assert.ok(ctx.restrictions,          'missing: restrictions');
  assert.ok(ctx.escalation,            'missing: escalation');
  assert.ok(ctx.leadPolicy,            'missing: leadPolicy');
  assert.ok(ctx.trustPolicy,           'missing: trustPolicy');
  assert.ok(ctx.medicalPolicy,         'missing: medicalPolicy');
  assert.ok(ctx.analytics,             'missing: analytics');
  assert.ok(ctx.trace,                 'missing: trace');
});

test('CTX-BUILD-02: contextTrace.stepsCompleted = 15 (AIOS-ACE-03)', () => {
  const { contextTrace } = buildExecutionContext(makeInput('test', 'greeting'));
  assert.equal(contextTrace.stepsCompleted, 15);
});

test('CTX-BUILD-03: contextTrace.auditId starts with "ctx-"', () => {
  const { contextTrace } = buildExecutionContext(makeInput('test', 'greeting'));
  assert.ok(contextTrace.auditId.startsWith('ctx-'), `unexpected auditId: ${contextTrace.auditId}`);
});

test('CTX-BUILD-04: compressedContext is non-empty string', () => {
  const { compressedContext } = buildExecutionContext(makeInput('สวัสดี', 'greeting'));
  assert.ok(typeof compressedContext === 'string' && compressedContext.length > 0);
});

test('CTX-BUILD-05: contextTrace.compressedCharCount matches compressedContext.length', () => {
  const result = buildExecutionContext(makeInput('สวัสดี', 'greeting'));
  assert.equal(result.contextTrace.compressedCharCount, result.compressedContext.length);
});

test('CTX-GHP-01: Good Health Prime knowledge excerpt keeps OPD/checkup/vaccine details beyond file header', () => {
  const longHeader = 'HEADER\n'.repeat(80);
  const ghpContent = [
    longHeader,
    '**Non-admission (outpatient) benefits** — paid as incurred unless noted:',
    '| Continued outpatient treatment after discharge | Within 31 days, max 2 visits | Paid as incurred |',
    '| Accident outpatient treatment | Within 24 hours of accident | Paid as incurred |',
    '| Annual checkup, OR outpatient treatment, OR vaccination (per policy year, one combined benefit) | 3,000 | 5,000 | 6,000 | 8,000 | 10,000 | 15,000 | 20,000 |',
  ].join('\n');
  const result = buildExecutionContext(makeInput(
    'Good Health Prime มี OPD ไหม',
    'health_insurance',
    { isProductIntent: true },
    {},
    {},
    'answer',
    [{ path: 'AIOS/Domains/Insurance/Products/Good_Health_Prime.md', content: ghpContent, mandatory: true }],
  ));
  const excerpt = result.executionContext.knowledge.sources[0]?.excerpt ?? '';
  assert.ok(excerpt.includes('Within 31 days, max 2 visits'));
  assert.ok(excerpt.includes('Within 24 hours of accident'));
  assert.ok(excerpt.includes('Annual checkup, OR outpatient treatment, OR vaccination'));
});

// ─── CTX-REQUEST: Request section ────────────────────────────────────────────

test('CTX-REQ-01: request.rawInput preserved, normalizedInput lowercased', () => {
  const result = buildExecutionContext(makeInput('Hello WORLD', 'greeting'));
  assert.equal(result.executionContext.request.rawInput, 'Hello WORLD');
  assert.equal(result.executionContext.request.normalizedInput, 'hello world');
});

test('CTX-REQ-02: request.channel = "line"', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  assert.equal(result.executionContext.request.channel, 'line');
});

// ─── CTX-USER: User section ───────────────────────────────────────────────────

test('CTX-USER-01: Thai message → language = "th"', () => {
  const result = buildExecutionContext(makeInput('สวัสดีครับ', 'greeting'));
  assert.equal(result.executionContext.user.language, 'th');
});

test('CTX-USER-02: Latin message → language = "en"', () => {
  const result = buildExecutionContext(makeInput('Hello there', 'greeting'));
  assert.equal(result.executionContext.user.language, 'en');
});

test('CTX-USER-03: user.userId is masked (contains ***)', () => {
  const result = buildExecutionContext(makeInput('สวัสดี', 'greeting'));
  assert.ok(result.executionContext.user.userId.includes('***'));
});

test('CTX-USER-04: isReturning = true when knownFields non-empty', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting', {}, { knownFields: ['real_name'] }));
  assert.equal(result.executionContext.user.isReturning, true);
});

// ─── CTX-DECISION: Decision section ──────────────────────────────────────────

test('CTX-DEC-01: decision.action mirrors decisionResult.action', () => {
  const result = buildExecutionContext(makeInput('test', 'product_inquiry', {}, {}, {}, 'educate'));
  assert.equal(result.executionContext.decision.action, 'educate');
});

test('CTX-DEC-02: decision.shouldCollectLead mirrors decisionResult', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'greeting', {}, { nextBestFieldToAsk: 'real_name', valueDelivered: true },
    { action: 'collect_lead', shouldCollectLead: true, askField: 'real_name' },
    'collect_lead',
  ));
  assert.equal(result.executionContext.decision.shouldCollectLead, true);
  assert.equal(result.executionContext.decision.askField, 'real_name');
});

test('CTX-DEC-03: CP-01 constraint present when mustAnswerFirst=true', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting', {}, {}, { mustAnswerFirst: true }));
  const hasCP01 = result.executionContext.decision.constraints.some((c) => c.includes('CP-01'));
  assert.ok(hasCP01, 'CP-01 constraint missing');
});

// ─── CTX-RESP: Response profile ──────────────────────────────────────────────

test('CTX-RESP-01: build_trust → questionStrategy = no_question (AIOS-ACE-12)', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  ));
  assert.equal(result.executionContext.responseProfile.questionStrategy, 'no_question');
});

test('CTX-RESP-02: build_trust → ctaAllowed = false', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  ));
  assert.equal(result.executionContext.responseProfile.ctaAllowed, false);
});

test('CTX-RESP-03: emergency_guide → length = "short", answerFirst = false', () => {
  const result = buildExecutionContext(makeInput(
    'อุบัติเหตุ', 'emergency', { isEmergency: true }, {},
    { action: 'emergency_guide', shouldEscalate: true, priority: 'HIGH' },
    'emergency_guide',
  ));
  assert.equal(result.executionContext.responseProfile.length, 'short');
  assert.equal(result.executionContext.responseProfile.answerFirst, false);
});

test('CTX-RESP-04: medical flag → empathyLevel >= low (AIOS-ACE-12)', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'health_question', { isMedicalSignal: true }, {},
    { action: 'answer_then_ask', mustIncludeDisclaimer: true },
    'answer_then_ask',
  ));
  const empathy = result.executionContext.responseProfile.empathyLevel;
  assert.notEqual(empathy, 'none', `expected at least 'low', got '${empathy}'`);
});

test('CTX-RESP-05: 6 global prohibited phrases always present', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  const { prohibitedPhrases } = result.executionContext.responseProfile;
  assert.ok(prohibitedPhrases.length >= 6, `got only ${prohibitedPhrases.length} prohibited phrases`);
});

test('CTX-RESP-06: recommend → maxRecommendations = 2, ctaAllowed = true', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'recommend_product',
    { isRecommendationIntent: true },
    { age: 30, interest_category: 'term_life' },
    { action: 'recommend', priority: 'STANDARD' },
    'recommend',
  ));
  assert.equal(result.executionContext.responseProfile.maxRecommendations, 2);
  assert.equal(result.executionContext.responseProfile.ctaAllowed, true);
});

// ─── CTX-REST: Restrictions ───────────────────────────────────────────────────

test('CTX-REST-01: trust active → hardProhibitions contain lead collection block', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  ));
  const hasLeadBlock = result.executionContext.restrictions.hardProhibitions.some(
    (p) => p.includes('personal data') || p.includes('trust concern'),
  );
  assert.ok(hasLeadBlock, 'no trust-related lead prohibition found');
});

test('CTX-REST-02: medical signal → hardProhibitions contain medical guarantee block', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'health_question', { isMedicalSignal: true }, {},
    { action: 'answer_then_ask', mustIncludeDisclaimer: true },
    'answer_then_ask',
  ));
  const hasMedBlock = result.executionContext.restrictions.hardProhibitions.some(
    (p) => p.includes('NEVER guarantee') && p.includes('medical'),
  );
  assert.ok(hasMedBlock, 'no medical prohibition found');
});

test('CTX-REST-03: known fields produce CP-05 restriction', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'greeting', {}, { knownFields: ['real_name', 'phone'] },
  ));
  const hasCP05 = result.executionContext.restrictions.active.some((r) => r.id.includes('CP05'));
  assert.ok(hasCP05, 'CP-05 restriction not added for known fields');
});

test('CTX-REST-04: hardProhibitions always includes at least the 3 global rules (2 generic + 6 phrases)', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  // Should have at minimum: 1 one-question rule, 1 answer-first rule, 6 prohibited phrases
  assert.ok(result.executionContext.restrictions.hardProhibitions.length >= 3);
});

// ─── CTX-POLICY: Trust / Lead / Medical policy ───────────────────────────────

test('CTX-POL-01: trustPolicy.trustConcernActive mirrors memoryResult', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  ));
  assert.equal(result.executionContext.trustPolicy.trustConcernActive, true);
  assert.equal(result.executionContext.trustPolicy.leadCaptureAllowed, false);
});

test('CTX-POL-02: leadPolicy.knownFields = memoryResult.knownFields', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'greeting', {}, { knownFields: ['real_name', 'age'] },
  ));
  assert.deepEqual(result.executionContext.leadPolicy.knownFields, ['real_name', 'age']);
});

test('CTX-POL-03: medicalPolicy.disclaimerRequired = decisionResult.mustIncludeDisclaimer', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'health_question', { isMedicalSignal: true }, {},
    { action: 'answer_then_ask', mustIncludeDisclaimer: true },
    'answer_then_ask',
  ));
  assert.equal(result.executionContext.medicalPolicy.disclaimerRequired, true);
});

// ─── CTX-ESC: Escalation ─────────────────────────────────────────────────────

test('CTX-ESC-01: no escalation when shouldEscalate=false', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  assert.equal(result.executionContext.escalation.required, false);
  assert.equal(result.executionContext.escalation.type, null);
});

test('CTX-ESC-02: emergency_guide → escalation.type = "immediate"', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'emergency', { isEmergency: true }, {},
    { action: 'emergency_guide', shouldEscalate: true, priority: 'HIGH' },
    'emergency_guide',
  ));
  assert.equal(result.executionContext.escalation.required, true);
  assert.equal(result.executionContext.escalation.type, 'immediate');
  assert.equal(result.executionContext.escalation.target, 'jirawat');
});

test('CTX-ESC-03: handoff → escalation.type = "warm"', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'speak_to_human', { isHumanRequest: true }, {},
    { action: 'handoff', shouldEscalate: true, priority: 'HIGH' },
    'handoff',
  ));
  assert.equal(result.executionContext.escalation.required, true);
  assert.equal(result.executionContext.escalation.type, 'warm');
});

// ─── CTX-VAL: Validator — Category A (Structural HARD) ───────────────────────

test('CTX-VAL-A01: empty capability.primary.id → HARD failure VAL-A-01', () => {
  const input = makeInput('test', 'greeting');
  input.capabilityResult.primaryCapability.capId = '';
  const result = buildExecutionContext(input);
  const hasVA01 = result.validation.hardFailures.some((f) => f.includes('VAL-A-01'));
  assert.ok(hasVA01, `expected VAL-A-01, got: ${JSON.stringify(result.validation.hardFailures)}`);
});

test('CTX-VAL-A02: invalid decision action → HARD failure VAL-A-02', () => {
  const input = makeInput('test', 'greeting');
  // @ts-expect-error — intentionally corrupt for test
  input.decisionResult.action = 'INVALID_ACTION_XYZ';
  const result = buildExecutionContext(input);
  const hasVA02 = result.validation.hardFailures.some((f) => f.includes('VAL-A-02'));
  assert.ok(hasVA02, `expected VAL-A-02, got: ${JSON.stringify(result.validation.hardFailures)}`);
});

test('CTX-VAL-A06: empty message → HARD failure VAL-A-06', () => {
  const input = makeInput('', 'greeting');
  const result = buildExecutionContext(input);
  const hasVA06 = result.validation.hardFailures.some((f) => f.includes('VAL-A-06'));
  assert.ok(hasVA06, `expected VAL-A-06, got: ${JSON.stringify(result.validation.hardFailures)}`);
});

// ─── CTX-VAL: Validator — Category B (Safety HARD) ───────────────────────────

test('CTX-VAL-B01: trust active + collect_lead → HARD failure VAL-B-01', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: true, nextBestFieldToAsk: 'real_name' },
    { action: 'collect_lead', shouldCollectLead: true, askField: 'real_name' },
    'collect_lead',
  ));
  const hasVB01 = result.validation.hardFailures.some((f) => f.includes('VAL-B-01'));
  assert.ok(hasVB01, `expected VAL-B-01, got: ${JSON.stringify(result.validation.hardFailures)}`);
});

test('CTX-VAL-B02: trust active + ctaAllowed=true → HARD failure VAL-B-02', () => {
  // Simulate a context where trust is active but cta_allowed somehow got set to true
  const input = makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  );
  const result = buildExecutionContext(input);
  // The builder should have set ctaAllowed=false; patch it to force the validation failure
  result.executionContext.responseProfile.ctaAllowed = true;
  const validation = validateExecutionContext(result.executionContext);
  const hasVB02 = validation.hardFailures.some((f) => f.includes('VAL-B-02'));
  assert.ok(hasVB02, `expected VAL-B-02, got: ${JSON.stringify(validation.hardFailures)}`);
});

test('CTX-VAL-B03: emergency + non-emergency action → HARD failure VAL-B-03', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'emergency', { isEmergency: true }, {},
    { action: 'educate', priority: 'STANDARD' },
    'educate',
  ));
  const hasVB03 = result.validation.hardFailures.some((f) => f.includes('VAL-B-03'));
  assert.ok(hasVB03, `expected VAL-B-03, got: ${JSON.stringify(result.validation.hardFailures)}`);
});

test('CTX-VAL-B04: medical signal without medical prohibition → HARD failure VAL-B-04', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'health_question', { isMedicalSignal: true }, {},
    { action: 'answer_then_ask', mustIncludeDisclaimer: true },
    'answer_then_ask',
  ));
  // patch: remove medical prohibition
  result.executionContext.restrictions.hardProhibitions = result.executionContext.restrictions.hardProhibitions.filter(
    (p) => !(p.includes('NEVER guarantee') && p.includes('medical')),
  );
  const validation = validateExecutionContext(result.executionContext);
  const hasVB04 = validation.hardFailures.some((f) => f.includes('VAL-B-04'));
  assert.ok(hasVB04, `expected VAL-B-04, got: ${JSON.stringify(validation.hardFailures)}`);
});

test('CTX-VAL-B06: collect_lead + captureAllowed=false → HARD failure VAL-B-06', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'greeting', {}, { leadCaptureAllowed: false },
    { action: 'collect_lead', shouldCollectLead: true, askField: 'phone' },
    'collect_lead',
  ));
  // Force leadPolicy to reflect blocked state
  result.executionContext.leadPolicy.captureAllowed = false;
  const validation = validateExecutionContext(result.executionContext);
  const hasVB06 = validation.hardFailures.some((f) => f.includes('VAL-B-06'));
  assert.ok(hasVB06, `expected VAL-B-06, got: ${JSON.stringify(validation.hardFailures)}`);
});

test('CTX-VAL-B07: collect_lead → askField already in knownFields → HARD failure VAL-B-07', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'greeting', {},
    { knownFields: ['phone'], valueDelivered: true, nextBestFieldToAsk: 'phone' },
    { action: 'collect_lead', shouldCollectLead: true, askField: 'phone' },
    'collect_lead',
  ));
  // Force the context to have the field in both places for validation
  result.executionContext.decision.askField = 'phone';
  result.executionContext.leadPolicy.knownFields = ['phone'];
  const validation = validateExecutionContext(result.executionContext);
  const hasVB07 = validation.hardFailures.some((f) => f.includes('VAL-B-07'));
  assert.ok(hasVB07, `expected VAL-B-07, got: ${JSON.stringify(validation.hardFailures)}`);
});

// ─── CTX-VAL: Validator — action decisions ────────────────────────────────────

test('CTX-VAL-ACTION-01: validation.action = "proceed" on clean context', () => {
  const result = buildExecutionContext(makeInput('สวัสดีครับ', 'greeting'));
  assert.equal(result.validation.action, 'proceed');
  assert.equal(result.validation.passed, true);
});

test('CTX-VAL-ACTION-02: safety (VAL-B) failure → action = "safe_fallback"', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'emergency', { isEmergency: true }, {},
    { action: 'educate', priority: 'STANDARD' },
    'educate',
  ));
  assert.equal(result.validation.action, 'safe_fallback');
  assert.equal(result.validation.safeToSendToLlm, false);
});

// ─── CTX-COMPRESS: Compressor ─────────────────────────────────────────────────

test('CTX-COMP-01: compressed string contains ACTION: uppercase action', () => {
  const result = buildExecutionContext(makeInput('สวัสดี', 'greeting'));
  assert.ok(result.compressedContext.includes('ACTION:'), 'compressed missing ACTION section');
});

test('CTX-COMP-02: compressed string contains HARD RESTRICTIONS section', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  assert.ok(result.compressedContext.includes('HARD RESTRICTIONS'));
});

test('CTX-COMP-03: compressed string contains RESPONSE PROFILE section', () => {
  const result = buildExecutionContext(makeInput('test', 'greeting'));
  assert.ok(result.compressedContext.includes('RESPONSE PROFILE'));
});

test('CTX-COMP-04: trust active → TRUST POLICY section present', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'trust_concern', { isTrustSignal: true },
    { trustConcernActive: true, leadCaptureAllowed: false },
    { action: 'build_trust', mustBuildTrust: true, priority: 'CRITICAL' },
    'build_trust',
  ));
  assert.ok(result.compressedContext.includes('TRUST POLICY'), 'TRUST POLICY section missing');
});

test('CTX-COMP-05: escalation present → ESCALATION section in compressed output', () => {
  const result = buildExecutionContext(makeInput(
    'test', 'emergency', { isEmergency: true }, {},
    { action: 'emergency_guide', shouldEscalate: true, priority: 'HIGH' },
    'emergency_guide',
  ));
  assert.ok(result.compressedContext.includes('ESCALATION'), 'ESCALATION section missing');
});

test('CTX-COMP-06: knowledge sources appear in compressed output', () => {
  const input = makeInput(
    'test', 'greeting', {}, {}, {}, 'answer',
    [{ path: 'AIOS/Domain/HEALTH.md', content: 'Health insurance overview snippet', mandatory: false }],
  );
  const result = buildExecutionContext(input);
  assert.ok(result.compressedContext.includes('KNOWLEDGE SUMMARIES'));
});

// ─── CTX-RUNTIME: Runtime integration ────────────────────────────────────────

test('CTX-RUNTIME-01: runtime version is gen1-stub series', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId:      'U_CTX_RT_001',
    message:     'สวัสดีครับ',
    displayName: 'Runtime Test',
    replyToken:  'REPLY_RT_001',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  });
  assert.ok(output.runtimeVersion.startsWith('gen1-stub-'), `expected gen1-stub-* version, got: ${output.runtimeVersion}`);
});

test('CTX-RUNTIME-02: runtime trace includes contextBuilt = true', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId:      'U_CTX_RT_002',
    message:     'ขอทราบข้อมูลประกันสุขภาพ',
    displayName: 'Runtime Test',
    replyToken:  'REPLY_RT_002',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  });
  assert.equal(output.trace.contextBuilt, true);
});

test('CTX-RUNTIME-03: runtime trace includes responseProfileTone', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId:      'U_CTX_RT_003',
    message:     'สวัสดี',
    displayName: 'Runtime Test',
    replyToken:  'REPLY_RT_003',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  });
  assert.ok(typeof output.trace.responseProfileTone === 'string' && output.trace.responseProfileTone.length > 0);
});

test('CTX-RUNTIME-04: runtime trace includes compressedContextCharCount > 0', async () => {
  const { execute } = await import('../../runtime-gen1/core/runtime');
  const output = await execute({
    userId:      'U_CTX_RT_004',
    message:     'อยากแนะนำประกัน',
    displayName: 'Runtime Test',
    replyToken:  'REPLY_RT_004',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  });
  assert.ok(
    typeof output.trace.compressedContextCharCount === 'number' &&
    output.trace.compressedContextCharCount > 0,
  );
});
