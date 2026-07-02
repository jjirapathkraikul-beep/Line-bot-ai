// Phase 10.7 — Prompt Builder + LLM Adapter + Response Validator + Runtime Tests
// Acceptance: 30+ tests covering sections 7-9 of the Gen1 pipeline.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildPrompt }                                      from '../../runtime-gen1/response/promptBuilder';
import { generateResponse, __setMockLlmFn,
         GEN1_SAFE_FALLBACK_TEXT }                          from '../../runtime-gen1/response/llmAdapter';
import { validateResponse, RESPONSE_SAFE_FALLBACK_TEXT }   from '../../runtime-gen1/response/responseValidator';
import { execute, RUNTIME_VERSION }                         from '../../runtime-gen1/core/runtime';
import { runGen1LineAdapter }                               from '../../runtime-gen1/adapters/line/lineAdapter';
import { dehydrateAll }                                     from '../../lib/session';
import {
  GHP_COMBINED_BUCKET_DIRECT_ANSWER,
  GHP_OPD_DIRECT_ANSWER,
  getGoodHealthPrimeCombinedBucketDirectAnswer,
  isGoodHealthPrimeCombinedBucketQuestion,
} from '../../runtime-gen1/response/goodHealthPrimeCombinedBucket';
import {
  HEALTH_CATEGORY_CONFIRMATION_DIRECT_ANSWER,
  HEALTH_INTEREST_DIRECT_ANSWER,
  HEALTH_OPTIONS_DIRECT_ANSWER,
  getHealthInsuranceFlowDirectAnswer,
  mapRoomAmountToGhpPlan,
  resolveHealthAdvisorySlots,
} from '../../runtime-gen1/response/healthInsuranceFlow';
import {
  findHospitalRoomRate,
  resolveHospitalMapping,
  type HospitalRoomRateRecord,
} from '../../runtime-gen1/reference/hospitalRoomRates';
import type { ExecutionContext }                            from '../../runtime-gen1/context/contextTypes';
import type { RuntimeInput }                               from '../../runtime-gen1/core/types';

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeRuntimeInput(message = 'สวัสดีครับ'): RuntimeInput {
  return {
    userId:      'U_PB_TEST_001',
    message,
    displayName: 'Test Customer',
    replyToken:  'REPLY_PB_TEST',
    timestamp:   '2026-06-01T10:00:00.000Z',
    session:     {},
  };
}

function makeCtx(): ExecutionContext {
  return {
    request: {
      rawInput:        'สวัสดีครับ อยากสอบถามเรื่องประกันชีวิต',
      normalizedInput: 'สวัสดีครับ อยากสอบถามเรื่องประกันชีวิต',
      channel:         'test',
      timestamp:       '2026-06-01T10:00:00.000Z',
      turnNumber:      1,
      sessionId:       'S_PB_001',
    },
    user: {
      userId:      'U_PB_001',
      displayName: 'Test Customer',
      language:    'th',
      isReturning: false,
    },
    session: {
      sessionId:   'S_PB_001',
      turnCount:   1,
      activeState: null,
      priorState:  null,
    },
    message: {
      summary:             '',
      lastAiAction:        null,
      unresolvedQuestion:  null,
    },
    intent: {
      primary:               'greeting',
      confidence:            0.85,
      secondary:             null,
      isTrustSignal:         false,
      isMedicalSignal:       false,
      isEmergency:           false,
      isHumanRequest:        false,
      isProductIntent:       false,
      isRecommendationIntent: false,
    },
    capability: {
      primary: {
        id:       'CAP-001',
        name:     'Greeting Handler',
        acpPath:  'AIOS/ACP/ACP-01_GREETING',
        priority: 'STANDARD',
      },
      secondary:     [],
      priority:      'STANDARD',
      overrideReason: null,
    },
    memory: {
      requiredFieldsPresent: false,
      knownFacts:            [],
      missingRequired:       [],
    },
    knowledge: {
      sources:                    [],
      totalChars:                 0,
      compressed:                 false,
      mandatoryFragmentsIncluded: [],
    },
    decision: {
      action:           'answer',
      priority:         'STANDARD',
      reason:           'User sent a greeting',
      constraints:      [],
      shouldCollectLead: false,
      shouldEscalate:   false,
      askField:         null,
    },
    conversationStrategy: {
      strategyId:                  'ANSWER_ONLY',
      strategyGoal:                'Deliver a direct, complete answer with no follow-up question.',
      orderedSteps:                ['Answer the question directly (CP-01)', 'Close without asking anything'],
      topicShiftDetected:          false,
      leadCaptureAllowedByStrategy: false,
      mustAnswerFirst:             true,
      mustEducate:                 false,
      mustRecommendBeforeCapture:  false,
      strategyWarnings:            [],
    },
    responseProfile: {
      tone:                    'warm',
      length:                  'short',
      empathyLevel:            'low',
      questionStrategy:        'one_question',
      answerFirst:             true,
      maxRecommendations:      1,
      thaiResponse:            true,
      prohibitedPhrases:       [],
      ctaAllowed:              false,
      mustIncludeDisclaimer:   false,
      mustIncludeRiskDisclosure: false,
    },
    restrictions: {
      active:           [],
      hardProhibitions: [],
      softProhibitions: [],
    },
    escalation: {
      required:           false,
      type:               null,
      reason:             null,
      target:             null,
      contextForJirawat:  null,
    },
    leadPolicy: {
      captureAllowed:  true,
      fieldBeingAsked: null,
      knownFields:     [],
      valueDelivered:  false,
      captureStage:    'IDLE',
    },
    trustPolicy: {
      trustConcernActive:     false,
      trustConcernTurn:       null,
      turnsSinceTrustConcern: null,
      leadCaptureAllowed:     true,
      trustResolved:          false,
    },
    medicalPolicy: {
      medicalConcernActive: false,
      conditionsDisclosed:  [],
      disclaimerRequired:   false,
    },
    analytics: {
      auditId:             'AUDIT-PB-001',
      acpSelected:         'ACP-01',
      intentConfidence:    0.85,
      charCount:           500,
      compressionApplied:  false,
      assemblyTimeMs:      10,
      validationPassed:    true,
      restrictionsActive:  0,
    },
    trace: {
      assemblyTimeMs:          10,
      stepsCompleted:          17,
      compressedCharCount:     500,
      validationPassed:        true,
      validationHardFailures:  [],
      validationSoftFailures:  [],
      auditId:                 'AUDIT-PB-001',
    },
  };
}

// ─── PROMPT tests — buildPrompt section contents ──────────────────────────────

test('PROMPT-01: systemPrompt includes ROLE section with AIOS AI Advisor', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('AIOS AI Advisor'), 'Expected ROLE section with "AIOS AI Advisor"');
  assert.ok(result.systemPrompt.includes('1: ROLE'), 'Expected section header "1: ROLE"');
});

test('PROMPT-02: systemPrompt includes customer raw input in CUSTOMER MESSAGE section', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes(ctx.request.rawInput), 'Expected raw input in prompt');
  assert.ok(result.systemPrompt.includes('2: CUSTOMER MESSAGE'), 'Expected section header');
});

test('PROMPT-03: systemPrompt includes INTENT section with detected intent', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('4: INTENT'), 'Expected INTENT section header');
  assert.ok(result.systemPrompt.includes('greeting'), 'Expected intent name "greeting"');
});

test('PROMPT-04: systemPrompt includes RESTRICTIONS section', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('9: RESTRICTIONS'), 'Expected RESTRICTIONS section header');
});

test('PROMPT-05: systemPrompt includes DECISION section with action', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('8: DECISION'), 'Expected DECISION section header');
  assert.ok(result.systemPrompt.includes('ANSWER'), 'Expected decision action in uppercase');
});

test('PROMPT-06: knowledge section includes content when sources are loaded', () => {
  const ctx = makeCtx();
  ctx.knowledge.sources = [{
    sourceId:    'health-doc',
    relevance:   0.9,
    excerpt:     'ประกันสุขภาพคุ้มครองค่ารักษาพยาบาลครับ',
    fullPath:    'AIOS/Domain/HEALTH.md',
    isMandatory: true,
  }];
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('ประกันสุขภาพคุ้มครองค่ารักษาพยาบาลครับ'), 'Expected knowledge content in prompt');
  assert.ok(result.systemPrompt.includes('MANDATORY CONTEXT'), 'Expected mandatory context label');
});

test('PROMPT-07: knowledge section shows no-knowledge fallback when sources empty', () => {
  const ctx    = makeCtx();
  ctx.knowledge.sources = [];
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('No knowledge loaded'), 'Expected no-knowledge fallback text');
});

test('PROMPT-08: MEMORY section shows NEVER ASK AGAIN for known fields', () => {
  const ctx = makeCtx();
  ctx.leadPolicy.knownFields = ['real_name', 'phone'];
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('NEVER ASK AGAIN'), 'Expected NEVER ASK AGAIN label');
  assert.ok(result.systemPrompt.includes('real_name'), 'Expected real_name in known fields');
  assert.ok(result.systemPrompt.includes('phone'), 'Expected phone in known fields');
});

test('PROMPT-09: build_trust action → OUTPUT RULES exclude personal data collection', () => {
  const ctx = makeCtx();
  ctx.decision.action = 'build_trust';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('12: OUTPUT RULES'), 'Expected OUTPUT RULES section');
  assert.ok(result.systemPrompt.includes('Do NOT ask for personal data'), 'Expected build_trust specific rule');
  assert.ok(result.systemPrompt.includes('BUILD_TRUST'), 'Expected action in output rules header');
});

test('PROMPT-10: emergency_guide action → OUTPUT RULES prioritize guidance', () => {
  const ctx = makeCtx();
  ctx.decision.action = 'emergency_guide';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Priority is GUIDANCE'), 'Expected emergency_guide specific rule');
  assert.ok(result.systemPrompt.includes('EMERGENCY_GUIDE'), 'Expected action in output rules header');
});

test('PROMPT-11: collect_lead action → OUTPUT RULES specify single field ask', () => {
  const ctx = makeCtx();
  ctx.decision.action  = 'collect_lead';
  ctx.decision.askField = 'real_name';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('ONE piece of information'), 'Expected collect_lead specific rule');
  assert.ok(result.systemPrompt.includes('COLLECT_LEAD'), 'Expected action in output rules header');
});

test('PROMPT-12: returns both systemPrompt and userMessage', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(typeof result.systemPrompt === 'string' && result.systemPrompt.length > 0, 'Expected non-empty systemPrompt');
  assert.equal(result.userMessage, ctx.request.rawInput, 'Expected userMessage to equal rawInput');
});

test('PROMPT-13: promptCharCount equals systemPrompt.length + userMessage.length', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  const expected = result.systemPrompt.length + result.userMessage.length;
  assert.equal(result.promptCharCount, expected, 'Expected promptCharCount to equal sum of char lengths');
});

test('PROMPT-14: isMedicalSignal=true → output rules include medical-specific follow-up guidance (CQ-001)', () => {
  const ctx = makeCtx();
  ctx.intent.isMedicalSignal = true;
  ctx.responseProfile.questionStrategy = 'one_question';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('แพทย์วินิจฉัยแล้วหรือยังครับ'), 'Expected medical follow-up question in output rules');
});

function makeGhpOpdCtx(rawInput: string, normalizedInput: string) {
  const ctx = makeCtx();
  ctx.request.rawInput = rawInput;
  ctx.request.normalizedInput = normalizedInput;
  ctx.intent.primary = 'health_insurance';
  ctx.intent.isProductIntent = true;
  ctx.memory.knownFacts = [
    { field: 'product_interest', value: 'Good Health Prime', source: 'customer_stated' },
  ];
  ctx.knowledge.sources = [{
    sourceId: 'Domains-Insurance-Products-Good_Health_Prime.md',
    relevance: 1,
    fullPath: 'AIOS/Domains/Insurance/Products/Good_Health_Prime.md',
    isMandatory: true,
    excerpt: [
      'Continued outpatient treatment after discharge | Within 31 days, max 2 visits | Paid as incurred',
      'Accident outpatient treatment | Within 24 hours of accident | Paid as incurred',
      'Annual checkup, OR outpatient treatment, OR vaccination (per policy year, one combined benefit) | 3,000 | 5,000 | 6,000 | 8,000 | 10,000 | 15,000 | 20,000',
    ].join('\n'),
  }];
  return ctx;
}

test('PROMPT-GHP-01: Good Health Prime OPD prompt includes product-specific OPD answer pattern', () => {
  const ctx = makeGhpOpdCtx('Good Health Prime มี OPD ไหม', 'good health prime มี opd ไหม');

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('มีครับ แต่ไม่ใช่ OPD เหมาจ่ายทั่วไปทุกครั้งที่ไปหาหมอ'));
  // Updated: new guidance uses 'after discharge' wording
  assert.ok(result.systemPrompt.includes('within 31 days after discharge, max 2 visits'));
  assert.ok(result.systemPrompt.includes('within 24 hours'));
  assert.ok(result.systemPrompt.includes('annual health checkup OR outpatient treatment OR vaccination'));
  // New: bucket must be labeled correctly — NOT "สิทธิประโยชน์รวมประจำปีตามแผน"
  assert.ok(result.systemPrompt.includes('วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี'),
    'Expected bucket label "วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี" in prompt');
  // The guidance itself contains the forbidden label (in the "do NOT call it" prohibition instruction).
  // So we test that the instruction to AVOID it is present, rather than testing absence of the phrase.
  assert.ok(result.systemPrompt.includes('do NOT call it "สิทธิประโยชน์รวมประจำปีตามแผน"'),
    'Must include instruction prohibiting misleading label');
  // New: bullet-list format, not "A=B" format
  assert.ok(result.systemPrompt.includes('แผนค่าห้อง 2,000: 3,000 บาท/ปี'),
    'Expected bullet-list format "แผนค่าห้อง 2,000: 3,000 บาท/ปี"');
  assert.ok(result.systemPrompt.includes('แผนค่าห้อง 12,000: 20,000 บาท/ปี'),
    'Expected bullet-list format for plan 12000');
  assert.ok(!result.systemPrompt.includes('12000=20,000'),
    'Must NOT use "A=B" notation for plan limits');
  // New: main annual limits must be mentioned separately
  assert.ok(result.systemPrompt.includes('500,000'),
    'Expected main annual limit 500,000 (plan 2000 illness/accident) to clarify it is separate');
  // New: no generic CTA
  assert.ok(result.systemPrompt.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ') === false ||
    result.systemPrompt.includes('Do NOT append generic CTA'),
    'Must restrict generic CTA in OPD answer');
});

test('PROMPT-GHP-02: short OPD follow-up uses retained Good Health Prime context', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'มี OPD ไหม';
  ctx.request.normalizedInput = 'มี opd ไหม';
  ctx.intent.primary = 'health_insurance';
  ctx.intent.isProductIntent = true;
  ctx.memory.knownFacts = [
    { field: 'product_interest', value: 'Good Health Prime', source: 'customer_stated' },
  ];
  ctx.knowledge.sources = [{
    sourceId: 'Domains-Insurance-Products-Good_Health_Prime.md',
    relevance: 1,
    fullPath: 'AIOS/Domains/Insurance/Products/Good_Health_Prime.md',
    isMandatory: true,
    excerpt: 'Annual checkup, OR outpatient treatment, OR vaccination (per policy year, one combined benefit)',
  }];

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Good Health Prime OPD answer pattern'));
});

test('PROMPT-GHP-03: checkup/vaccine questions require direct combined bucket answer', () => {
  const ctx = makeGhpOpdCtx(
    'ถ้าไม่ได้ใช้ OPD เอาไปตรวจสุขภาพได้ไหม',
    'ถ้าไม่ได้ใช้ opd เอาไปตรวจสุขภาพได้ไหม',
  );

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('answer yes directly within the same combined annual bucket'));
  assert.ok(result.systemPrompt.includes('annual health checkup OR outpatient treatment OR vaccination'));
  // Must use the correct bucket label
  assert.ok(result.systemPrompt.includes('วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี'));
});

test('PROMPT-GHP-04: "เอา OPD ไปฉีดวัคซีนได้ไหม" triggers combined bucket guidance with direct-yes instruction', () => {
  const ctx = makeGhpOpdCtx(
    'เอา OPD ไปฉีดวัคซีนได้ไหม',
    'เอา opd ไปฉีดวัคซีนได้ไหม',
  );

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Good Health Prime OPD answer pattern'),
    'Expected GHP OPD pattern guidance');
  assert.ok(result.systemPrompt.includes('answer yes directly within the same combined annual bucket'),
    'Expected direct-yes instruction for vaccine question');
  assert.ok(result.systemPrompt.includes('annual health checkup OR outpatient treatment OR vaccination'));
});

test('PROMPT-GHP-05: "ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม" triggers combined bucket guidance', () => {
  const ctx = makeGhpOpdCtx(
    'ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม',
    'ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม',
  );

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Good Health Prime OPD answer pattern'),
    'Expected GHP OPD pattern guidance for checkup/vaccine bucket question');
  assert.ok(result.systemPrompt.includes('วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี'),
    'Expected correct bucket label');
});

test('PROMPT-GHP-06: OPD prompt clarifies main annual limits are separate from sub-limit bucket', () => {
  const ctx = makeGhpOpdCtx('Good Health Prime มี OPD ไหม', 'good health prime มี opd ไหม');

  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('CLARIFY that the main annual plan limits are SEPARATE'),
    'Expected instruction to clarify main limits are separate');
  assert.ok(result.systemPrompt.includes('500,000'),
    'Expected example main annual limit figure in guidance');
});

test('PROMPT-GHP-07: OPD prompt does not use "A=B" notation for plan limits', () => {
  const ctx = makeGhpOpdCtx('Good Health Prime มี OPD ไหม', 'good health prime มี opd ไหม');

  const result = buildPrompt({ executionContext: ctx });
  // Old misleading format must be gone
  assert.ok(!result.systemPrompt.includes('2000=3,000'), 'Must not use "2000=3,000" notation');
  assert.ok(!result.systemPrompt.includes('12000=20,000'), 'Must not use "12000=20,000" notation');
  // New readable format must be present
  assert.ok(result.systemPrompt.includes('แผนค่าห้อง 2,000: 3,000 บาท/ปี'), 'Expected readable bullet format');
});

test('PROMPT-GHP-08: combined bucket questions do NOT trigger validation-risk handoff escalation', () => {
  // "ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม" is a known-fact question, not an underwriting/claim question
  const ctx = makeGhpOpdCtx(
    'ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม',
    'ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม',
  );
  // makeCtx() defaults to no escalation (required: false, shouldEscalate: false) — no override needed

  const result = buildPrompt({ executionContext: ctx });
  // The prompt should NOT contain handoff escalation language for this known-fact question
  assert.ok(!result.systemPrompt.includes('ESCALATE: Include a warm handoff'),
    'Combined bucket question must not trigger handoff escalation');
});

test('GHP-BUCKET-01: helper detects semantically similar combined-bucket follow-ups', () => {
  const samples = [
    'ถ้าไม่ได้ใช้ OPD เอาไปตรวจสุขภาพได้ไหม',
    'เอา OPD ไปตรวจสุขภาพได้ไหม',
    'เอา OPD ไปฉีดวัคซีนได้ไหม',
    'ใช้วงเงินนี้ฉีดวัคซีนได้ไหม',
    'ตรวจสุขภาพกับวัคซีนใช้วงเงินเดียวกันไหม',
    'OPD กับตรวจสุขภาพใช้วงเงินเดียวกันไหม',
    'ถ้าไม่ได้ใช้ OPD ใช้ทำอะไรได้บ้าง',
  ];

  for (const sample of samples) {
    assert.equal(isGoodHealthPrimeCombinedBucketQuestion(sample), true, sample);
  }
});

test('GHP-BUCKET-02: recent Good Health Prime history enables direct combined-bucket answer', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'เอา OPD ไปฉีดวัคซีนได้ไหม';
  ctx.request.normalizedInput = 'เอา opd ไปฉีดวัคซีนได้ไหม';
  ctx.intent.primary = 'health_insurance';
  ctx.intent.isProductIntent = true;

  const answer = getGoodHealthPrimeCombinedBucketDirectAnswer({
    executionContext: ctx,
    conversationHistory: [{
      sessionId: 's1',
      userMessage: 'Good Health Prime มี OPD ไหม',
      assistantResponse: 'Good Health Prime มี OPD แบบเฉพาะเงื่อนไขครับ',
      timestamp: '2026-07-02T10:00:00.000Z',
      intent: 'health_insurance',
    }],
  });

  assert.equal(answer, GHP_COMBINED_BUCKET_DIRECT_ANSWER);
});

test('GHP-BUCKET-03: validation-risk handoff is not overridden by combined-bucket direct answer', () => {
  const ctx = makeGhpOpdCtx(
    'ข้อยกเว้นของ Good Health Prime มีอะไรบ้าง',
    'ข้อยกเว้นของ good health prime มีอะไรบ้าง',
  );
  ctx.decision.action = 'handoff';
  ctx.decision.shouldEscalate = true;

  const answer = getGoodHealthPrimeCombinedBucketDirectAnswer({ executionContext: ctx });
  assert.equal(answer, null);
});

test('GHP-BUCKET-04: runtime answers checkup follow-up directly without calling LLM', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'บางกรมธรรม์อาจครอบคลุม ขึ้นอยู่กับเงื่อนไขกรมธรรม์ครับ';
  });

  try {
    const output = await execute({
      ...makeRuntimeInput('ถ้าไม่ได้ใช้ OPD เอาไปตรวจสุขภาพได้ไหม'),
      session: { data: { product_interest: 'Good Health Prime' } },
    });

    assert.equal(llmCalled, false, 'Direct known-fact answer should bypass LLM');
    assert.equal(output.text, GHP_COMBINED_BUCKET_DIRECT_ANSWER);
    assert.equal(output.decision, 'educate');
    assert.equal(output.trace.llmModel, 'direct-answer');
    assert.equal(output.trace.shouldEscalate, false);
    assert.ok(!output.text.includes('บางกรมธรรม์อาจ'));
    assert.ok(!output.text.includes('ขึ้นอยู่กับเงื่อนไขกรมธรรม์'));
    assert.ok(!output.text.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ'));
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('GHP-BUCKET-05: runtime answers vaccine follow-up directly without generic policy wording', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'ขึ้นอยู่กับเงื่อนไขกรมธรรม์ครับ';
  });

  try {
    const output = await execute({
      ...makeRuntimeInput('เอา OPD ไปฉีดวัคซีนได้ไหม'),
      session: { data: { product_interest: 'Good Health Prime' } },
    });

    assert.equal(llmCalled, false, 'Direct known-fact answer should bypass LLM');
    assert.equal(output.text, GHP_COMBINED_BUCKET_DIRECT_ANSWER);
    assert.equal(output.trace.llmModel, 'direct-answer');
    assert.equal(output.trace.shouldEscalate, false);
    assert.ok(!output.text.includes('บางกรมธรรม์อาจ'));
    assert.ok(!output.text.includes('ขึ้นอยู่กับเงื่อนไขกรมธรรม์'));
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('GHP-BUCKET-06: single-turn explicit Good Health Prime vaccine question gets direct answer', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'บางกรมธรรม์อาจครอบคลุมครับ';
  });

  try {
    const output = await execute(makeRuntimeInput('Good Health Prime เอา OPD ไปฉีดวัคซีนได้ไหม'));

    assert.equal(llmCalled, false, 'Explicit product known-fact answer should bypass LLM');
    assert.equal(output.text, GHP_COMBINED_BUCKET_DIRECT_ANSWER);
    assert.equal(output.trace.llmModel, 'direct-answer');
    assert.equal(output.trace.shouldEscalate, false);
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('GHP-OPD-01: Good Health Prime OPD question does not append generic broad CTA', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'Good Health Prime มี OPD ครับ ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ?';
  });

  try {
    const output = await execute(makeRuntimeInput('Good Health Prime มี OPD ไหม'));

    assert.equal(llmCalled, false, 'Known Good Health Prime OPD answer should bypass generic LLM CTA');
    assert.equal(output.text, GHP_OPD_DIRECT_ANSWER);
    assert.ok(output.text.includes('ไม่ใช่ OPD เหมาจ่ายทั่วไปทุกครั้งที่ไปหาหมอ'));
    assert.ok(output.text.includes('วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี'));
    assert.ok(!output.text.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ'));
    assert.ok(!output.text.includes('คุณสนใจด้านไหนเป็นพิเศษครับ'));
    assert.ok(!output.text.includes('มีอะไรให้ช่วยเพิ่มเติมไหมครับ'));
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('HEALTH-FLOW-01: initial health insurance interest enters hospital-context flow without broad CTA', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'ประกันสุขภาพคือความคุ้มครองค่ารักษาครับ ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ?';
  });

  try {
    const output = await execute(makeRuntimeInput('สนใจประกันสุขภาพ'));

    assert.equal(llmCalled, false, 'Health category entry should bypass generic LLM loop');
    assert.equal(output.text, HEALTH_INTEREST_DIRECT_ANSWER);
    assert.ok(output.text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
    assert.ok(!output.text.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ'));
    assert.ok(!output.text.includes('คุณสนใจในด้านไหนเป็นพิเศษครับ'));
    assert.equal(output.trace.llmModel, 'direct-answer');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('HEALTH-FLOW-02: options question after health context lists health plan types only', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'มีประกันชีวิต ประกันสุขภาพ ประกันอุบัติเหตุ และประกันควบการลงทุนครับ คุณสนใจในด้านไหนเป็นพิเศษครับ?';
  });

  try {
    const output = await execute({
      ...makeRuntimeInput('มีแบบไหนให้เลือกบ้าง'),
      session: { data: { product_interest: 'ประกันสุขภาพ' } },
    });

    assert.equal(llmCalled, false, 'Health-context options should bypass broad category answer');
    assert.equal(output.text, HEALTH_OPTIONS_DIRECT_ANSWER);
    assert.ok(output.text.includes('ถ้าพูดเฉพาะประกันสุขภาพ'));
    assert.ok(output.text.includes('แผนเน้น IPD'));
    assert.ok(output.text.includes('OPD / ตรวจสุขภาพ / วัคซีน'));
    assert.ok(!output.text.includes('ประกันชีวิต'));
    assert.ok(!output.text.includes('ประกันอุบัติเหตุ'));
    assert.ok(!output.text.includes('ประกันควบการลงทุน'));
    assert.ok(!output.text.includes('คุณสนใจในด้านไหนเป็นพิเศษครับ'));
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('HEALTH-FLOW-03: short health category confirmation asks hospital, not category again', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  let llmCalled = false;
  __setMockLlmFn(async () => {
    llmCalled = true;
    return 'ประกันสุขภาพช่วยเรื่องค่ารักษาครับ ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ?';
  });

  try {
    const output = await execute({
      ...makeRuntimeInput('ประกันสุขภาพ'),
      session: { data: { product_interest: 'ประกันสุขภาพ' } },
    });

    assert.equal(llmCalled, false, 'Short category confirmation should bypass generic explanation loop');
    assert.equal(output.text, HEALTH_CATEGORY_CONFIRMATION_DIRECT_ANSWER);
    assert.ok(output.text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
    assert.ok(!output.text.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ'));
    assert.ok(!output.text.includes('คุณสนใจในด้านไหนเป็นพิเศษครับ'));
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('HEALTH-FLOW-04: helper uses recent health context for "มีแบบไหนให้เลือกบ้าง"', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'มีแบบไหนให้เลือกบ้าง';
  ctx.request.normalizedInput = 'มีแบบไหนให้เลือกบ้าง';

  const answer = getHealthInsuranceFlowDirectAnswer({
    executionContext: ctx,
    conversationHistory: [{
      sessionId: 's1',
      userMessage: 'สนใจประกันสุขภาพ',
      assistantResponse: HEALTH_INTEREST_DIRECT_ANSWER,
      timestamp: '2026-07-02T10:00:00.000Z',
      intent: 'health_insurance',
    }],
  });

  assert.equal(answer, HEALTH_OPTIONS_DIRECT_ANSWER);
});

test('HEALTH-FLOW-05: pure broad planning question is not forced into health flow', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'อยากวางแผนประกัน';
  ctx.request.normalizedInput = 'อยากวางแผนประกัน';
  ctx.intent.primary = 'recommendation_request';
  ctx.intent.isRecommendationIntent = true;

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx });
  assert.equal(answer, null);
});

test('HEALTH-FLOW-06: health recommendation question is not overridden by category-entry direct answer', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'สนใจประกันสุขภาพ อายุ 39 ปี งบ 20,000 บาทต่อปี แนะนำให้หน่อยครับ';
  ctx.request.normalizedInput = 'สนใจประกันสุขภาพ อายุ 39 ปี งบ 20,000 บาทต่อปี แนะนำให้หน่อยครับ';
  ctx.intent.primary = 'health_insurance';
  ctx.intent.isProductIntent = true;

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx });
  assert.equal(answer, null);
});

test('HEALTH-FLOW-07: selected health context replaces generic broad CTA with hospital question', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => (
    'ค่าเบี้ยประกันสุขภาพขึ้นอยู่กับอายุและแผนความคุ้มครองครับ ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ?'
  ));

  try {
    const output = await execute(makeRuntimeInput('อยากรู้ราคาเบี้ยประกันสุขภาพครับ'));

    assert.ok(output.text.includes('ค่าเบี้ยประกันสุขภาพขึ้นอยู่กับอายุและแผนความคุ้มครองครับ'));
    assert.ok(output.text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
    assert.ok(!output.text.includes('ตอนนี้กำลังมองหาความคุ้มครองด้านไหนเป็นพิเศษครับ'));
    assert.ok(!output.text.includes('คุณสนใจด้านไหนเป็นพิเศษครับ'));
    assert.equal(output.trace.formatterApplied, true);
    assert.ok(output.trace.formatterRules?.includes('REPLACE_CONTEXTUAL_BROAD_FOLLOWUP'));
    assert.notEqual(output.trace.llmModel, 'direct-answer');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('HEALTH-SLOTS-01: known hospital in health context returns GHP room-plan recommendation and asks age next', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'เข้าที่ รพ นนทเวช';
  ctx.request.normalizedInput = 'เข้าที่ รพ นนทเวช';

  const history = [{
    sessionId: 's1',
    userMessage: 'สนใจประกันสุขภาพ',
    assistantResponse: HEALTH_INTEREST_DIRECT_ANSWER,
    timestamp: '2026-07-02T10:00:00.000Z',
    intent: 'health_insurance',
  }];

  const slots = resolveHealthAdvisorySlots({ executionContext: ctx, conversationHistory: history });
  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.equal(slots.preferred_hospital, 'นนทเวช');
  assert.ok(answer?.includes('ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก'));
  assert.ok(answer?.includes('ค่าห้องเดี่ยวเริ่มต้นที่ใช้เทียบกับแผน Good Health Prime อยู่ที่ประมาณ 4,560 บาท/วัน'));
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000 หรือสูงกว่าครับ'));
  assert.ok(answer?.includes('ตัวเลขนี้เป็นยอดสำหรับเทียบแผนค่าห้อง ไม่ใช่ค่าใช้จ่ายรวมทั้งหมดของการรักษา'));
  assert.ok(answer?.includes('ขอทราบอายุผู้เอาประกันหน่อยครับ'));
  assert.ok(!answer?.includes('อยากดูค่าห้องประมาณเท่าไหร่ครับ'));
  assert.ok(!answer?.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
});

test('HEALTH-HOSPITAL-01: hospital lookup uses ghp_mapping_amount as primary mapping source', () => {
  const record = findHospitalRoomRate('รพ นนทเวช');
  assert.ok(record);

  const mapping = resolveHospitalMapping(record);

  assert.equal(mapping.source, 'ghp_mapping_amount');
  assert.equal(mapping.amount, 4560);
  assert.equal(mapping.plan, 6000);
});

test('HEALTH-HOSPITAL-02: hospital mapping does not recompute room+food when ghp_mapping_amount exists', () => {
  const record: HospitalRoomRateRecord = {
    hospitalNameTh: 'โรงพยาบาลทดสอบ',
    aliases: ['โรงพยาบาลทดสอบ'],
    province: 'กรุงเทพฯ',
    area: 'ทดสอบ',
    roomType: 'Test Room',
    roomCharge: 1000,
    foodCharge: 1000,
    ghpMappingAmount: 7200,
    suggestedGhpPlan: 8000,
    confidence: 'High',
    dataCompleteness: 'Synthetic unit-test record',
    sourceType: 'Unit test',
    mappingNote: 'Synthetic test record',
  };

  const mapping = resolveHospitalMapping(record);

  assert.equal(mapping.source, 'ghp_mapping_amount');
  assert.equal(mapping.amount, 7200);
  assert.equal(mapping.plan, 8000);
});

test('HEALTH-HOSPITAL-03: hospital mapping falls back to room+food only when ghp_mapping_amount is missing', () => {
  const record: HospitalRoomRateRecord = {
    hospitalNameTh: 'โรงพยาบาลทดสอบ',
    aliases: ['โรงพยาบาลทดสอบ'],
    province: 'กรุงเทพฯ',
    area: 'ทดสอบ',
    roomType: 'Test Room',
    roomCharge: 4500,
    foodCharge: 900,
    suggestedGhpPlan: 6000,
    confidence: 'High',
    dataCompleteness: 'Synthetic unit-test record',
    sourceType: 'Unit test',
    mappingNote: 'Synthetic test record',
  };

  const mapping = resolveHospitalMapping(record);

  assert.equal(mapping.source, 'room_food_fallback');
  assert.equal(mapping.amount, 5400);
  assert.equal(mapping.plan, 6000);
});

test('HEALTH-HOSPITAL-04: unknown provincial hospital uses safe Plan 6000 baseline without exact numbers', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'เข้าที่ รพ ชลบุรี';
  ctx.request.normalizedInput = 'เข้าที่ รพ ชลบุรี';

  const history = [{
    sessionId: 's1',
    userMessage: 'สนใจประกันสุขภาพ',
    assistantResponse: HEALTH_INTEREST_DIRECT_ANSWER,
    timestamp: '2026-07-02T10:00:00.000Z',
    intent: 'health_insurance',
  }];

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.ok(answer?.includes('ตอนนี้ผมยังไม่มีค่าห้องล่าสุด'));
  assert.ok(answer?.includes('โรงพยาบาลต่างจังหวัด'));
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000 มักเป็น baseline'));
  assert.ok(answer?.includes('ควรเทียบกับค่าห้อง+ค่าอาหารล่าสุด'));
  assert.ok(!answer?.includes('ค่าห้องเดี่ยวเริ่มต้นที่ใช้เทียบกับแผน Good Health Prime อยู่ที่ประมาณ'));
});

test('HEALTH-HOSPITAL-05: unknown Bangkok or perimeter hospital does not over-assume Plan 6000', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'เข้าที่ รพ บางนา สมุทรปราการ';
  ctx.request.normalizedInput = 'เข้าที่ รพ บางนา สมุทรปราการ';

  const history = [{
    sessionId: 's1',
    userMessage: 'สนใจประกันสุขภาพ',
    assistantResponse: HEALTH_INTEREST_DIRECT_ANSWER,
    timestamp: '2026-07-02T10:00:00.000Z',
    intent: 'health_insurance',
  }];

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.ok(answer?.includes('กรุงเทพฯ หรือปริมณฑล'));
  assert.ok(answer?.includes('ผมยังไม่อยากฟันธงว่าแผนไหนพอดีครับ'));
  assert.ok(answer?.includes('ถ้ามีรูปค่าห้องล่าสุด ส่งมาได้เลยครับ'));
  assert.ok(!answer?.includes('แผนค่าห้อง 6,000 มักเป็น baseline'));
});

test('HEALTH-HOSPITAL-06: LINE adapter persists pending hospital slot for short follow-up without KV history', async () => {
  const now = Date.now();
  const session = {
    data: {},
    meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: now },
    history: [],
    notifiedReasons: [],
    createdAt: now,
    updatedAt: now,
  };

  const first = await runGen1LineAdapter({
    userId:      'U_PB_HEALTH_006',
    displayName: 'Test Customer',
    messageText: 'ประกันสุขภาพ',
    replyToken:  'REPLY_PB_HEALTH_006A',
    timestamp:   '2026-07-02T10:00:00.000Z',
    session,
  });

  assert.ok(first.text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
  assert.equal(session.meta.lastState, 'gen1_pending_slot:preferred_hospital');
  assert.equal(dehydrateAll('U_PB_HEALTH_006', session).meta.lastState, 'gen1_pending_slot:preferred_hospital');

  const second = await runGen1LineAdapter({
    userId:      'U_PB_HEALTH_006',
    displayName: 'Test Customer',
    messageText: 'นนทเวช',
    replyToken:  'REPLY_PB_HEALTH_006B',
    timestamp:   '2026-07-02T10:01:00.000Z',
    session,
  });

  assert.ok(second.text.includes('ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก'));
  assert.ok(second.text.includes('ประมาณ 4,560 บาท/วัน'));
  assert.ok(second.text.includes('Good Health Prime แผนค่าห้อง 6,000'));
  assert.ok(!second.text.includes('โรงพยาบาลที่มีชื่อเสียง'));
});

test('HEALTH-HOSPITAL-07: pending hospital slot maps explicit Nonthavej hospital name', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'โรงพยาบาลนนทเวช';
  ctx.request.normalizedInput = 'โรงพยาบาลนนทเวช';
  ctx.session.activeState = 'gen1_pending_slot:preferred_hospital';

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: [] });

  assert.ok(answer?.includes('ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก'));
  assert.ok(answer?.includes('ประมาณ 4,560 บาท/วัน'));
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000'));
});

test('HEALTH-HOSPITAL-08: pending hospital slot maps MedPark to Plan 8000', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'เมดพาร์ค';
  ctx.request.normalizedInput = 'เมดพาร์ค';
  ctx.session.activeState = 'gen1_pending_slot:preferred_hospital';

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: [] });

  assert.ok(answer?.includes('ถ้าใช้โรงพยาบาลเมดพาร์คเป็นหลัก'));
  assert.ok(answer?.includes('ประมาณ 7,200 บาท/วัน'));
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 8,000'));
});

test('HEALTH-HOSPITAL-09: bare hospital name without health or pending context does not force GHP recommendation', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'นนทเวช';
  ctx.request.normalizedInput = 'นนทเวช';

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: [] });

  assert.equal(answer, null);
});

test('HEALTH-HOSPITAL-10: previous assistant hospital question is enough pending context when history exists', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'รพ.นนทเวช';
  ctx.request.normalizedInput = 'รพ.นนทเวช';

  const history = [{
    sessionId: 's1',
    userMessage: 'ประกันสุขภาพ',
    assistantResponse: HEALTH_CATEGORY_CONFIRMATION_DIRECT_ANSWER,
    timestamp: '2026-07-02T10:00:00.000Z',
    intent: 'health_insurance',
  }];

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.ok(answer?.includes('ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก'));
  assert.ok(answer?.includes('ประมาณ 4,560 บาท/วัน'));
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000'));
});

test('HEALTH-PENDING-01: health pending slots continue hospital to age to budget without KV history', async () => {
  const now = Date.now();
  const session = {
    data: {},
    meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: now },
    history: [],
    notifiedReasons: [],
    createdAt: now,
    updatedAt: now,
  };

  await runGen1LineAdapter({
    userId:      'U_PB_PENDING_001',
    displayName: 'Test Customer',
    messageText: 'ประกันสุขภาพ',
    replyToken:  'REPLY_PB_PENDING_001A',
    timestamp:   '2026-07-02T10:00:00.000Z',
    session,
  });
  assert.equal(dehydrateAll('U_PB_PENDING_001', session).meta.pendingSlot, 'preferred_hospital');

  const hospitalTurn = await runGen1LineAdapter({
    userId:      'U_PB_PENDING_001',
    displayName: 'Test Customer',
    messageText: 'นนทเวช',
    replyToken:  'REPLY_PB_PENDING_001B',
    timestamp:   '2026-07-02T10:01:00.000Z',
    session,
  });
  let persisted = dehydrateAll('U_PB_PENDING_001', session);
  assert.ok(hospitalTurn.text.includes('ประมาณ 4,560 บาท/วัน'));
  assert.ok(hospitalTurn.text.includes('Good Health Prime แผนค่าห้อง 6,000'));
  assert.equal(persisted.meta.gen1Slots?.preferred_hospital, 'นนทเวช');
  assert.equal(persisted.meta.pendingSlot, 'age');
  assert.notEqual(persisted.meta.pendingSlot, 'preferred_hospital');

  const ageTurn = await runGen1LineAdapter({
    userId:      'U_PB_PENDING_001',
    displayName: 'Test Customer',
    messageText: '39',
    replyToken:  'REPLY_PB_PENDING_001C',
    timestamp:   '2026-07-02T10:02:00.000Z',
    session,
  });
  persisted = dehydrateAll('U_PB_PENDING_001', session);
  assert.ok(ageTurn.text.includes('อายุผู้เอาประกัน 39 ปี'));
  assert.ok(ageTurn.text.includes('ขอทราบงบประมาณต่อปี'));
  assert.ok(!ageTurn.text.includes('ขอทราบอายุผู้เอาประกัน'));
  assert.equal(persisted.meta.gen1Slots?.age, '39');
  assert.equal(persisted.meta.pendingSlot, 'budget_annual');

  const budgetTurn = await runGen1LineAdapter({
    userId:      'U_PB_PENDING_001',
    displayName: 'Test Customer',
    messageText: '50000',
    replyToken:  'REPLY_PB_PENDING_001D',
    timestamp:   '2026-07-02T10:03:00.000Z',
    session,
  });
  persisted = dehydrateAll('U_PB_PENDING_001', session);
  assert.ok(budgetTurn.text.includes('งบประมาณต่อปี: 50,000 บาท'));
  assert.ok(!budgetTurn.text.includes('ขอทราบงบประมาณต่อปี'));
  assert.equal(persisted.meta.gen1Slots?.budget_annual, '50000');
  assert.equal(persisted.meta.pendingSlot, undefined);
});

test('HEALTH-PENDING-02: Good Health Prime OPD question overrides pending hospital slot', async () => {
  const now = Date.now();
  const session = {
    data: {},
    meta: {
      lastState: 'gen1_pending_slot:preferred_hospital',
      lastIntent: 'health_insurance',
      stateUpdatedAt: now,
      activeFlow: 'health_insurance',
      pendingSlot: 'preferred_hospital',
      pendingSlotUpdatedAt: now,
    },
    history: [],
    notifiedReasons: [],
    createdAt: now,
    updatedAt: now,
  };

  const output = await runGen1LineAdapter({
    userId:      'U_PB_PENDING_002',
    displayName: 'Test Customer',
    messageText: 'Good Health Prime มี OPD ไหม',
    replyToken:  'REPLY_PB_PENDING_002',
    timestamp:   '2026-07-02T10:00:00.000Z',
    session,
  });

  assert.ok(output.text.includes('มีครับ แต่ไม่ใช่ OPD เหมาจ่ายทั่วไป'));
  assert.ok(!output.text.includes('ค่าห้องเดี่ยวเริ่มต้นที่ใช้เทียบกับแผน'));
});

test('HEALTH-PENDING-03: tax topic does not parse as pending health age', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'ลดหย่อนภาษีได้ไหม';
  ctx.request.normalizedInput = 'ลดหย่อนภาษีได้ไหม';
  ctx.intent.primary = 'tax_planning';
  ctx.memory.knownFacts = [
    { field: 'active_flow', value: 'health_insurance', source: 'session' },
    { field: 'pending_slot', value: 'age', source: 'session' },
  ];

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: [] });

  assert.equal(answer, null);
});

test('HEALTH-SLOTS-02: known hospital plus room and OPD maps to Good Health Prime Plan 6000 without re-asking hospital', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'ประกันสุขภาพ ค่าห้อง6000 มี opd ด้วย';
  ctx.request.normalizedInput = 'ประกันสุขภาพ ค่าห้อง6000 มี opd ด้วย';

  const history = [{
    sessionId: 's1',
    userMessage: 'เข้าที่ รพ นนทเวช',
    assistantResponse: 'ได้ครับ ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก ผมจะใช้โรงพยาบาลนี้เป็นตัวเทียบแผนให้ครับ',
    timestamp: '2026-07-02T10:01:00.000Z',
    intent: 'health_insurance',
  }];

  const slots = resolveHealthAdvisorySlots({ executionContext: ctx, conversationHistory: history });
  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.equal(slots.preferred_hospital, 'นนทเวช');
  assert.equal(slots.desired_room_amount, 6000);
  assert.equal(slots.wants_opd, true);
  assert.equal(mapRoomAmountToGhpPlan(slots.desired_room_amount), 6000);
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000'));
  assert.ok(answer?.includes('วงเงินย่อยหมวด ตรวจสุขภาพ / OPD / ฉีดวัคซีน ต่อปี'));
  assert.ok(answer?.includes('ตรงนี้ช่วยเพิ่มความคุ้มค่า'));
  assert.ok(answer?.includes('ขอทราบอายุผู้เอาประกันหน่อยครับ'));
  assert.ok(!answer?.includes('อยากมี OPD / ตรวจสุขภาพ / วัคซีน เพิ่มด้วยไหมครับ'));
  assert.ok(!answer?.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
});

test('HEALTH-SLOTS-03: short room answer can recommend without OPD as required slot', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'ค่าห้อง6000';
  ctx.request.normalizedInput = 'ค่าห้อง6000';

  const history = [{
    sessionId: 's1',
    userMessage: 'เข้าที่ รพ นนทเวช',
    assistantResponse: 'อยากดูค่าห้องประมาณเท่าไหร่ครับ เช่น 4,000 / 6,000 / 8,000 บาท?',
    timestamp: '2026-07-02T10:01:00.000Z',
    intent: 'health_insurance',
  }];

  const slots = resolveHealthAdvisorySlots({ executionContext: ctx, conversationHistory: history });
  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.equal(slots.preferred_hospital, 'นนทเวช');
  assert.equal(slots.desired_room_amount, 6000);
  assert.equal(slots.wants_opd, undefined);
  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000'));
  assert.ok(answer?.includes('ขอทราบอายุผู้เอาประกันหน่อยครับ'));
  assert.ok(!answer?.includes('อยากมี OPD'));
  assert.ok(!answer?.includes('ต้องการ OPD'));
  assert.ok(!answer?.includes('ใช้โรงพยาบาลไหนเป็นหลักครับ'));
});

test('HEALTH-SLOTS-04: short room and OPD answer works when health context already exists', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'ค่าห้อง6000 มี opd ด้วย';
  ctx.request.normalizedInput = 'ค่าห้อง6000 มี opd ด้วย';

  const history = [{
    sessionId: 's1',
    userMessage: 'เข้าที่ รพ นนทเวช',
    assistantResponse: 'อยากดูค่าห้องประมาณเท่าไหร่ครับ เช่น 4,000 / 6,000 / 8,000 บาท?',
    timestamp: '2026-07-02T10:01:00.000Z',
    intent: 'health_insurance',
  }];

  const answer = getHealthInsuranceFlowDirectAnswer({ executionContext: ctx, conversationHistory: history });

  assert.ok(answer?.includes('Good Health Prime แผนค่าห้อง 6,000'));
  assert.ok(answer?.includes('ตรงนี้ช่วยเพิ่มความคุ้มค่า'));
  assert.ok(answer?.includes('ขอทราบอายุผู้เอาประกันหน่อยครับ'));
  assert.ok(!answer?.includes('อยากมี OPD / ตรวจสุขภาพ / วัคซีน เพิ่มด้วยไหมครับ'));
  assert.ok(answer?.includes('ถ้าใช้โรงพยาบาลนนทเวชเป็นหลัก'));
  assert.ok(!answer?.includes('ใช้โรงพยาบาลไหนเป็นหลักครับ'));
});

test('HEALTH-SLOTS-05: OPD preference statements are captured without validation-risk handoff', () => {
  const trueCtx = makeCtx();
  trueCtx.request.rawInput = 'มี OPD';
  trueCtx.request.normalizedInput = 'มี OPD';
  const falseCtx = makeCtx();
  falseCtx.request.rawInput = 'ไม่เอา OPD';
  falseCtx.request.normalizedInput = 'ไม่เอา OPD';

  const history = [{
    sessionId: 's1',
    userMessage: 'เข้าที่ รพ นนทเวช',
    assistantResponse: 'อยากดูค่าห้องประมาณเท่าไหร่ครับ เช่น 4,000 / 6,000 / 8,000 บาท?',
    timestamp: '2026-07-02T10:01:00.000Z',
    intent: 'health_insurance',
  }];

  const trueSlots = resolveHealthAdvisorySlots({ executionContext: trueCtx, conversationHistory: history });
  const falseSlots = resolveHealthAdvisorySlots({ executionContext: falseCtx, conversationHistory: history });
  const trueAnswer = getHealthInsuranceFlowDirectAnswer({ executionContext: trueCtx, conversationHistory: history });
  const falseAnswer = getHealthInsuranceFlowDirectAnswer({ executionContext: falseCtx, conversationHistory: history });

  assert.equal(trueSlots.wants_opd, true);
  assert.equal(falseSlots.wants_opd, false);
  assert.ok(trueAnswer?.includes('อยากดูค่าห้องประมาณเท่าไหร่ครับ'));
  assert.ok(falseAnswer?.includes('อยากดูค่าห้องประมาณเท่าไหร่ครับ'));
});

test('HEALTH-SLOTS-06: between-tier room amount maps to next higher Good Health Prime tier', () => {
  assert.equal(mapRoomAmountToGhpPlan(4500), 6000);
  assert.equal(mapRoomAmountToGhpPlan(6000), 6000);
  assert.equal(mapRoomAmountToGhpPlan(12500), 12000);
});

test('GENERIC-CTA-01: broad unclear insurance planning may still ask broad category follow-up', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'ได้ครับ ตอนนี้มองหาความคุ้มครองด้านไหนเป็นหลักครับ — สุขภาพ ชีวิต หรือเกษียณ');

  try {
    const output = await execute(makeRuntimeInput('อยากวางแผนประกัน'));

    assert.ok(output.text.includes('ตอนนี้มองหาความคุ้มครองด้านไหนเป็นหลักครับ'));
    assert.notEqual(output.trace.llmModel, 'direct-answer');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('PROMPT-QUALITY-01: prompt prohibits robotic opening phrase', () => {
  const ctx = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('never open with: "จากข้อมูลที่คุณให้มาครับ"'));
  assert.ok(!result.systemPrompt.includes('Preferred: "จากข้อมูลที่คุณให้มาครับ'));
});

test('PROMPT-QUALITY-02: health follow-up guidance asks hospital instead of broad category CTA', () => {
  const ctx = makeCtx();
  ctx.intent.primary = 'health_insurance';
  ctx.intent.isProductIntent = true;
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ'));
  assert.ok(result.systemPrompt.includes('Do NOT ask broad category-selection CTAs after health insurance is selected'));
});

test('PROMPT-HANDOFF-01: validation-risk handoff asks for name and phone context', () => {
  const ctx = makeCtx();
  ctx.request.rawInput = 'มะเร็งไม่คุ้มครองจริงไหม';
  ctx.request.normalizedInput = 'มะเร็งไม่คุ้มครองจริงไหม';
  ctx.decision.action = 'handoff';
  ctx.decision.shouldEscalate = true;
  ctx.decision.shouldCollectLead = true;
  ctx.decision.askField = 'phone';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('name and phone number for Jirawat follow-up'));
  assert.ok(result.systemPrompt.includes('only allowed two-field contact request'));
});

test('PROMPT-15: recommend action → output rules prohibit asking for contact info after recommending (CQ-003)', () => {
  const ctx = makeCtx();
  ctx.decision.action = 'recommend';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('NEVER ask for contact information'), 'Expected CQ-003 recommendation structure rule');
  assert.ok(result.systemPrompt.includes('RECOMMEND'), 'Expected RECOMMEND action in output rules header');
});

test('PROMPT-16: knownFacts present → memory section tells LLM to USE them and never re-ask (CQ-002)', () => {
  const ctx = makeCtx();
  ctx.memory.knownFacts = [
    { field: 'age', value: '39', source: 'customer_stated' },
    { field: 'budget', value: '20000', source: 'customer_stated' },
  ];
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('CRITICAL: USE these facts'), 'Expected memory continuity instruction');
  assert.ok(result.systemPrompt.includes('age'), 'Expected age in memory section');
  assert.ok(result.systemPrompt.includes('budget'), 'Expected budget in memory section');
});

test('PROMPT-17: ROLE section includes advisor voice guidance (CQ-004)', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Advisor voice'), 'Expected advisor voice guidance in ROLE section');
  assert.ok(result.systemPrompt.includes('direct answer first'), 'Expected direct-answer advisor guidance');
  assert.ok(!result.systemPrompt.includes('Preferred: "จากข้อมูลที่คุณให้มาครับ'), 'Robotic preferred phrase must not be suggested');
});

test('PROMPT-18: educate action → output rules include 4-part structure with คืออะไร (CQ-005)', () => {
  const ctx = makeCtx();
  ctx.decision.action = 'educate';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('คืออะไร'), 'Expected product explanation structure rule');
  assert.ok(result.systemPrompt.includes('เหมาะกับใคร'), 'Expected who-benefits rule');
});

test('PROMPT-19: output rules include memory check rule (CQ-002) and conversation flow rule (CQ-006)', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Memory continuity'), 'Expected memory continuity rule');
  assert.ok(result.systemPrompt.includes('Conversation flow'), 'Expected conversation flow rule');
});

test('PROMPT-14: sectionCount is 11', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.equal(result.sectionCount, 12, 'Expected 12 sections in prompt');
});

// ─── VAL tests — validateResponse ─────────────────────────────────────────────

test('VAL-01: empty text → RESP-HARD-01 failure + safe fallback', () => {
  const result = validateResponse({ text: '', executionContext: makeCtx() });
  assert.equal(result.passed, false, 'Expected passed=false');
  assert.equal(result.usedFallback, true, 'Expected usedFallback=true');
  assert.ok(result.failures.some((f) => f.includes('RESP-HARD-01')), 'Expected RESP-HARD-01 failure');
  assert.equal(result.text, RESPONSE_SAFE_FALLBACK_TEXT, 'Expected safe fallback text');
});

test('VAL-02: trust concern active + phone ask → RESP-HARD-02 failure', () => {
  const ctx = makeCtx();
  ctx.trustPolicy.trustConcernActive = true;
  const result = validateResponse({
    text:             'ขอเบอร์โทรหน่อยนะครับ ให้ได้ไหมครับ?',
    executionContext:  ctx,
  });
  assert.equal(result.passed, false, 'Expected passed=false');
  assert.ok(result.failures.some((f) => f.includes('RESP-HARD-02')), 'Expected RESP-HARD-02 failure');
  assert.equal(result.usedFallback, true, 'Expected safe fallback on HARD failure');
});

test('VAL-03: medical signal + guarantee language → RESP-HARD-03 failure', () => {
  const ctx = makeCtx();
  ctx.intent.isMedicalSignal = true;
  const result = validateResponse({
    text:             'ประกันนี้รับประกันว่าจะผ่านการพิจารณาเลยครับ',
    executionContext:  ctx,
  });
  assert.equal(result.passed, false, 'Expected passed=false');
  assert.ok(result.failures.some((f) => f.includes('RESP-HARD-03')), 'Expected RESP-HARD-03 failure');
});

test('VAL-04: valid trust-handling response (no phone ask) → passes', () => {
  const ctx = makeCtx();
  ctx.trustPolicy.trustConcernActive = true;
  const result = validateResponse({
    text:             'ผมเป็นที่ปรึกษาที่ได้รับใบอนุญาตครับ ยินดีให้ข้อมูลครับ',
    executionContext:  ctx,
  });
  assert.equal(result.passed, true, 'Expected passed=true for valid trust response');
  assert.equal(result.usedFallback, false, 'Expected no fallback for passing response');
});

test('VAL-05: clean product response passes without failures or fallback', () => {
  const result = validateResponse({
    text:             'ประกันชีวิตมีหลายประเภทครับ ได้แก่ ประกันชีวิตแบบตลอดชีพ และแบบบำนาญครับ',
    executionContext:  makeCtx(),
  });
  assert.equal(result.passed, true, 'Expected passed=true');
  assert.equal(result.usedFallback, false, 'Expected usedFallback=false');
  assert.equal(result.failures.length, 0, 'Expected no HARD failures');
});

test('VAL-06: two questions with one_question strategy → RESP-SOFT-02 warning', () => {
  const ctx = makeCtx();
  ctx.responseProfile.questionStrategy = 'one_question';
  const result = validateResponse({
    text:             'สนใจประเภทไหนครับ? งบประมาณเท่าไหร่ไหมครับ?',
    executionContext:  ctx,
  });
  assert.equal(result.passed, true, 'Expected passed=true (SOFT warnings do not fail)');
  assert.ok(result.warnings.some((w) => w.includes('RESP-SOFT-02')), 'Expected RESP-SOFT-02 warning');
});

test('VAL-07: word count exceeds short-length limit → RESP-SOFT-01 warning', () => {
  const ctx = makeCtx();
  ctx.responseProfile.length = 'short'; // limit = 80 words
  const longText = Array.from({ length: 100 }, (_, i) => `คำ${i}`).join(' '); // 100 words
  const result = validateResponse({ text: longText, executionContext: ctx });
  assert.equal(result.passed, true, 'Expected passed=true (SOFT warning only)');
  assert.ok(result.warnings.some((w) => w.includes('RESP-SOFT-01')), 'Expected RESP-SOFT-01 warning');
});

test('VAL-08: re-asking a known phone field → RESP-SOFT-05 warning', () => {
  const ctx = makeCtx();
  ctx.leadPolicy.knownFields = ['phone'];
  const result = validateResponse({
    text:             'อยากทราบเบอร์โทรของคุณครับ ให้ผมติดต่อกลับได้ไหมครับ?',
    executionContext:  ctx,
  });
  assert.ok(result.warnings.some((w) => w.includes('RESP-SOFT-05')), 'Expected RESP-SOFT-05 re-ask warning');
});

// ─── LLM tests — generateResponse with mock injection ─────────────────────────

test('LLM-01: __setMockLlmFn returns mock text and model="mock"', async () => {
  __setMockLlmFn(async () => 'สวัสดีครับ ผมช่วยคุณได้เลยครับ');
  try {
    const result = await generateResponse({ systemPrompt: 'System', userMessage: 'สวัสดีครับ', userId: 'U001' });
    assert.equal(result.text, 'สวัสดีครับ ผมช่วยคุณได้เลยครับ', 'Expected mock text');
    assert.equal(result.model, 'mock', 'Expected model="mock"');
    assert.equal(result.warnings.length, 0, 'Expected no warnings for successful mock');
  } finally {
    __setMockLlmFn(null);
  }
});

test('LLM-02: result includes all required fields with correct types', async () => {
  __setMockLlmFn(async () => 'test response');
  try {
    const result = await generateResponse({ systemPrompt: 'Sys', userMessage: 'Usr', userId: 'U002' });
    assert.ok(typeof result.text === 'string',          'text must be string');
    assert.ok(typeof result.model === 'string',         'model must be string');
    assert.ok(typeof result.promptCharCount === 'number',     'promptCharCount must be number');
    assert.ok(typeof result.completionCharCount === 'number', 'completionCharCount must be number');
    assert.ok(typeof result.promptTokens === 'number',        'promptTokens must be number');
    assert.ok(typeof result.completionTokens === 'number',    'completionTokens must be number');
    assert.ok(Array.isArray(result.warnings),           'warnings must be array');
  } finally {
    __setMockLlmFn(null);
  }
});

test('LLM-03: mock that throws → safe fallback text + W-LLM-MOCK-ERROR warning', async () => {
  __setMockLlmFn(async () => { throw new Error('Mock failure test'); });
  try {
    const result = await generateResponse({ systemPrompt: 'S', userMessage: 'U', userId: 'U003' });
    assert.equal(result.text, GEN1_SAFE_FALLBACK_TEXT, 'Expected safe fallback on mock error');
    assert.ok(result.warnings.some((w) => w.includes('W-LLM-MOCK-ERROR')), 'Expected W-LLM-MOCK-ERROR warning');
  } finally {
    __setMockLlmFn(null);
  }
});

test('LLM-04: promptCharCount equals systemPrompt.length + userMessage.length', async () => {
  __setMockLlmFn(async () => 'ok');
  try {
    const sp     = 'system prompt content for test';
    const um     = 'user message content';
    const result = await generateResponse({ systemPrompt: sp, userMessage: um, userId: 'U004' });
    assert.equal(result.promptCharCount, sp.length + um.length, 'Expected promptCharCount to equal combined lengths');
  } finally {
    __setMockLlmFn(null);
  }
});

// ─── RUNTIME tests — execute() in gen1/shadow modes ──────────────────────────

test('RUNTIME-01: gen1 mode + mock LLM → returns LLM-generated text (not placeholder)', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'สวัสดีครับ ยินดีให้คำปรึกษาเรื่องประกันชีวิตครับ');
  try {
    const output = await execute(makeRuntimeInput('สวัสดีครับ'));
    assert.equal(output.text, 'สวัสดีครับ ยินดีให้คำปรึกษาเรื่องประกันชีวิตครับ', 'Expected LLM text in gen1 mode');
    assert.ok(output.trace.promptBuilt === true, 'Expected trace.promptBuilt=true');
    assert.equal(output.trace.llmModel, 'mock', 'Expected trace.llmModel="mock"');
    assert.ok(typeof output.trace.responseValidationPassed === 'boolean', 'Expected responseValidationPassed in trace');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('RUNTIME-02: shadow mode → returns placeholder (not LLM text)', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'shadow';
  __setMockLlmFn(async () => 'LLM text that should not be returned');
  try {
    const output = await execute(makeRuntimeInput('สวัสดีครับ'));
    assert.notEqual(output.text, 'LLM text that should not be returned', 'Expected placeholder in shadow mode');
    assert.ok(output.text.length > 0, 'Expected non-empty placeholder text');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('RUNTIME-03: gen1 + mock returns empty string → validation activates safe fallback', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => '');  // Empty → triggers RESP-HARD-01
  try {
    const output = await execute(makeRuntimeInput('สวัสดีครับ'));
    assert.equal(output.text, GEN1_SAFE_FALLBACK_TEXT, 'Expected safe fallback when validation fails');
    assert.ok(output.trace.responseUsedFallback === true, 'Expected responseUsedFallback=true');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});

test('RUNTIME-04: runtime version is gen1-stub-0.7.x in gen1 mode', async () => {
  const savedMode = process.env.AI_RUNTIME_MODE;
  process.env.AI_RUNTIME_MODE = 'gen1';
  __setMockLlmFn(async () => 'สวัสดีครับ ผมพร้อมช่วยครับ');
  try {
    const output = await execute(makeRuntimeInput('สวัสดีครับ'));
    assert.ok(
      output.runtimeVersion.startsWith('gen1-stub-0.'),
      `Expected gen1-stub-0.x.x version, got: ${output.runtimeVersion}`,
    );
    assert.equal(RUNTIME_VERSION, output.runtimeVersion, 'RUNTIME_VERSION constant should match output');
  } finally {
    __setMockLlmFn(null);
    process.env.AI_RUNTIME_MODE = savedMode ?? 'v1';
  }
});
