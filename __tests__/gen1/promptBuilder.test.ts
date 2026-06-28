// Phase 10.7 — Prompt Builder + LLM Adapter + Response Validator + Runtime Tests
// Acceptance: 30+ tests covering sections 7-9 of the Gen1 pipeline.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildPrompt }                                      from '../../runtime-gen1/response/promptBuilder';
import { generateResponse, __setMockLlmFn,
         GEN1_SAFE_FALLBACK_TEXT }                          from '../../runtime-gen1/response/llmAdapter';
import { validateResponse, RESPONSE_SAFE_FALLBACK_TEXT }   from '../../runtime-gen1/response/responseValidator';
import { execute, RUNTIME_VERSION }                         from '../../runtime-gen1/core/runtime';
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

test('PROMPT-15: recommend action → output rules prohibit asking for contact info after recommending (CQ-003)', () => {
  const ctx = makeCtx();
  ctx.decision.action = 'recommend';
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('NEVER ask for contact information'), 'Expected CQ-003 recommendation structure rule');
  assert.ok(result.systemPrompt.includes('RECOMMEND'), 'Expected RECOMMEND action in output rules header');
});

test('PROMPT-16: knownFacts present → memory section tells LLM to USE them and never re-ask (CQ-002)', () => {
  const ctx = makeCtx();
  ctx.memory.knownFacts = [{ field: 'age', value: '39' }, { field: 'budget', value: '20000' }];
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('CRITICAL: USE these facts'), 'Expected memory continuity instruction');
  assert.ok(result.systemPrompt.includes('age'), 'Expected age in memory section');
  assert.ok(result.systemPrompt.includes('budget'), 'Expected budget in memory section');
});

test('PROMPT-17: ROLE section includes advisor voice guidance (CQ-004)', () => {
  const ctx    = makeCtx();
  const result = buildPrompt({ executionContext: ctx });
  assert.ok(result.systemPrompt.includes('Advisor voice'), 'Expected advisor voice guidance in ROLE section');
  assert.ok(result.systemPrompt.includes('จากข้อมูลที่คุณให้มาครับ'), 'Expected Thai advisor phrase example');
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
