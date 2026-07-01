// Conversation History Tests — Beta Hotfix
// Verifies: history loads into memory, facts extracted cross-turn,
// prompt section 13 generated, KV failures degrade gracefully.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveMemory }       from '../../runtime-gen1/memory/memoryResolver';
import { buildPrompt }         from '../../runtime-gen1/response/promptBuilder';
import { runGen1LineAdapter }  from '../../runtime-gen1/adapters/line/lineAdapter';
import { __setMockLlmFn }     from '../../runtime-gen1/response/llmAdapter';
import { __setKvClientForTest, type KvMinimal } from '../../runtime-gen1/observability/kvClient';
import { logConversationTurn, getRecentConversationTurnsForUser, buildConversationId } from '../../runtime-gen1/observability/conversationLogger';
import { clearAuditQueue }    from '../../runtime-gen1/observability/auditQueue';
import type { ConversationTurnContext } from '../../runtime-gen1/core/types';
import type { IntentDetectorResult }   from '../../runtime-gen1/capability/intentDetector';
import type { CapabilityLoaderResult } from '../../runtime-gen1/capability/capabilityLoader';
import type { ExecutionContext }       from '../../runtime-gen1/context/contextTypes';
import type { LineAdapterInput }       from '../../runtime-gen1/adapters/line/lineAdapter';
import type { ConversationLogEntry }   from '../../runtime-gen1/observability/conversationLogger';

// ─── Mock KV ─────────────────────────────────────────────────────────────────

interface MockKv extends KvMinimal {
  _store: Map<string, string>;
  _lists: Map<string, string[]>;
}

function createMockKv(): MockKv {
  const _store = new Map<string, string>();
  const _lists = new Map<string, string[]>();
  return {
    _store, _lists,
    async set(key, value) { _store.set(key, value); return 'OK'; },
    async get(key) { return _store.get(key) ?? null; },
    async lpush(key, ...values) {
      const existing = _lists.get(key) ?? [];
      _lists.set(key, [...values, ...existing]);
      return existing.length + values.length;
    },
    async lrange(key, start, stop) {
      const list = _lists.get(key) ?? [];
      const end  = stop < 0 ? list.length + stop + 1 : stop + 1;
      return list.slice(start, end);
    },
    async expire() { return 1; },
  };
}

function createThrowingKv(): KvMinimal {
  const fail = () => Promise.reject(new Error('KV_NOT_CONFIGURED'));
  return {
    set:    () => fail(),
    get:    () => fail() as Promise<string | null>,
    lpush:  () => fail() as Promise<number>,
    lrange: () => fail() as Promise<string[]>,
    expire: () => fail() as Promise<number>,
  };
}

// ─── Stub factories ───────────────────────────────────────────────────────────

function makeHistoryTurn(overrides: Partial<ConversationTurnContext> = {}): ConversationTurnContext {
  return {
    sessionId:         'ctx-hist-001',
    userMessage:       'ผมอายุ 39 ปีครับ',
    assistantResponse: 'รับทราบครับ คุณอายุ 39 ปี',
    timestamp:         '2026-06-29T09:00:00.000Z',
    intent:            'health_insurance',
    ...overrides,
  };
}

function makeMemoryInput(
  message: string,
  history: ConversationTurnContext[] = [],
) {
  const runtimeInput = {
    userId:      'Utest1234567',
    message,
    session:     {},
    displayName: 'คุณทดสอบ',
    replyToken:  'REPLY_TOKEN',
    timestamp:   '2026-06-29T10:00:00.000Z',
  };
	  const intentResult: IntentDetectorResult = {
	    intent:     'health_insurance',
	    confidence: 0.85,
	    matchedKeywords: [],
	    flags: {
	      isTrustSignal: false, isMedicalSignal: false, isEmergency: false,
	      isHumanRequest: false, isProductIntent: true, isPriceIntent: false, isRecommendationIntent: false,
	    },
  };
  const capabilityResult = {
    primaryCapability: { capId: 'CAP-004', name: 'Health Insurance Advisory', acpPath: 'ACP-04', priority: 'HIGH' },
    selectedAcpPaths: ['ACP-04'],
    shouldInterruptCurrentState: false,
    reason: '',
    loadedCapabilities: [],
  } as unknown as CapabilityLoaderResult;
  return { runtimeInput, intentResult, capabilityResult, conversationHistory: history };
}

function makeLineInput(message: string): LineAdapterInput {
  return {
    userId:      'Uline12345test',
    displayName: 'Beta User',
    messageText: message,
    replyToken:  'REPLY_LINE_001',
    timestamp:   new Date().toISOString(),
    session:     {},
  };
}

// ─── HISTORY extraction from memoryResolver ────────────────────────────────────

test('HIST-01: gender "ชาย" in prior turn → gender extracted as known field', () => {
  const history = [makeHistoryTurn({ userMessage: 'ผมเป็นชายอายุ 35 ปีครับ', intent: 'greeting' })];
  const result  = resolveMemory(makeMemoryInput('สนใจประกันสุขภาพครับ', history));

  assert.ok(result.knownFields.includes('gender'), 'Expected gender in knownFields from history');
  assert.equal(result.customerProfile.gender, 'ชาย', 'Expected gender=ชาย extracted from history');
  assert.ok(result.memoryTrace.fieldsFromHistory.includes('gender'), 'Expected gender in fieldsFromHistory trace');
});

test('HIST-02: age=39 in prior turn → age known in next turn, not re-asked', () => {
  const history = [makeHistoryTurn({ userMessage: 'ผมอายุ 39 ปีครับ', intent: 'health_insurance' })];
  const result  = resolveMemory(makeMemoryInput('แนะนำประกันสุขภาพให้หน่อยครับ', history));

  assert.equal(result.customerProfile.age, 39, 'Expected age=39 from history');
  assert.ok(result.knownFields.includes('age'), 'Expected age in knownFields');
  const ageInMissing = result.missingFields.some((f) => f.field === 'age');
  assert.equal(ageInMissing, false, 'age must NOT be in missingFields since it was stated in history');
});

test('HIST-03: budget in prior turn → budget_annual known, not re-asked next turn', () => {
  const history = [makeHistoryTurn({ userMessage: 'งบประมาณ 20000 บาทต่อปีครับ', intent: 'health_insurance' })];
  const result  = resolveMemory(makeMemoryInput('ช่วยแนะนำแผนประกันครับ', history));

  assert.ok(result.customerProfile.budget_annual !== null, 'Expected budget_annual from history');
  assert.equal(result.customerProfile.budget_annual, 20000, 'Expected budget_annual=20000');
  assert.ok(result.knownFields.includes('budget_annual'), 'Expected budget_annual in knownFields');
  assert.ok(result.memoryTrace.fieldsFromHistory.includes('budget_annual'), 'Expected in fieldsFromHistory trace');
});

test('HIST-04: current message overrides history on same field', () => {
  const history = [makeHistoryTurn({ userMessage: 'ผมอายุ 39 ปีครับ', intent: 'health_insurance' })];
  // Current message states a different age — current message must win
  const result  = resolveMemory(makeMemoryInput('จริงๆ แล้วผมอายุ 42 ปีครับ', history));

  assert.equal(result.customerProfile.age, 42, 'Current message age=42 must override history age=39');
});

test('HIST-05: no history → fieldsFromHistory is empty array', () => {
  const result = resolveMemory(makeMemoryInput('สนใจประกันสุขภาพครับ', []));
  assert.deepEqual(result.memoryTrace.fieldsFromHistory, [], 'Expected empty fieldsFromHistory with no history');
});

test('HIST-06: undefined history → resolveMemory does not throw', () => {
  // conversationHistory omitted entirely (optional parameter)
  assert.doesNotThrow(() => {
    resolveMemory(makeMemoryInput('สนใจประกันสุขภาพครับ'));
  });
});

test('HIST-07: multiple history turns — deduplication uses first-seen per field', () => {
  const history = [
    makeHistoryTurn({ userMessage: 'ผมอายุ 39 ปีครับ', intent: 'health_insurance' }),
    makeHistoryTurn({ userMessage: 'ผมอายุ 41 ปีครับ งบ 15000 บาทครับ', intent: 'health_insurance', sessionId: 'ctx-hist-002' }),
  ];
  const result = resolveMemory(makeMemoryInput('แนะนำหน่อยครับ', history));
  // First history mention of age=39 wins (history deduplication is first-seen)
  assert.equal(result.customerProfile.age, 39, 'Expected age=39 from first history mention');
  assert.equal(result.customerProfile.budget_annual, 15000, 'Expected budget from second history turn');
});

// ─── PROMPT Section 13 ────────────────────────────────────────────────────────

function makeMinimalCtx(): ExecutionContext {
  return {
    request: { rawInput: 'test', normalizedInput: 'test', channel: 'line', timestamp: '2026-06-29T10:00:00.000Z', turnNumber: 1, sessionId: 'ctx-test' },
    user: { userId: 'Utest***', displayName: null, language: 'th', isReturning: false },
    session: { sessionId: 'ctx-test', turnCount: 1, activeState: null, priorState: null },
    message: { summary: '', lastAiAction: null, unresolvedQuestion: null },
    intent: { primary: 'health_insurance', confidence: 0.85, secondary: null, isTrustSignal: false, isMedicalSignal: false, isEmergency: false, isHumanRequest: false, isProductIntent: true, isRecommendationIntent: false },
    capability: { primary: { id: 'CAP-004', name: 'Health Insurance', acpPath: 'ACP-04', priority: 'HIGH' }, secondary: [], priority: 'HIGH', overrideReason: null },
    memory: { requiredFieldsPresent: false, knownFacts: [], missingRequired: [] },
    knowledge: { sources: [], totalChars: 0, compressed: false, mandatoryFragmentsIncluded: [] },
    decision: { action: 'educate', priority: 'STANDARD', reason: 'Product intent', constraints: [], shouldCollectLead: false, shouldEscalate: false, askField: null },
    conversationStrategy: { strategyId: 'EDUCATE_THEN_DISCOVER', strategyGoal: 'Educate', orderedSteps: ['educate'], topicShiftDetected: false, leadCaptureAllowedByStrategy: false, mustAnswerFirst: false, mustEducate: true, mustRecommendBeforeCapture: false, strategyWarnings: [] },
    responseProfile: { tone: 'warm', length: 'medium', empathyLevel: 'low', questionStrategy: 'one_question', answerFirst: true, maxRecommendations: 1, thaiResponse: true, prohibitedPhrases: [], ctaAllowed: false, mustIncludeDisclaimer: false, mustIncludeRiskDisclosure: false },
    restrictions: { active: [], hardProhibitions: [], softProhibitions: [] },
    escalation: { required: false, type: null, reason: null, target: null, contextForJirawat: null },
    leadPolicy: { captureAllowed: false, fieldBeingAsked: null, knownFields: [], valueDelivered: false, captureStage: 'IDLE' },
    trustPolicy: { trustConcernActive: false, trustConcernTurn: null, turnsSinceTrustConcern: null, leadCaptureAllowed: true, trustResolved: true },
    medicalPolicy: { medicalConcernActive: false, conditionsDisclosed: [], disclaimerRequired: false },
    analytics: { auditId: 'ctx-test', acpSelected: 'ACP-04', intentConfidence: 0.85, charCount: 0, compressionApplied: false, assemblyTimeMs: 0, validationPassed: true, restrictionsActive: 0 },
    trace: { assemblyTimeMs: 0, stepsCompleted: 6, compressedCharCount: 0, validationPassed: true, validationHardFailures: [], validationSoftFailures: [], auditId: 'ctx-test' },
  } as ExecutionContext;
}

test('PROMPT-HIST-01: Section 13 appears in prompt when conversationHistory is provided', () => {
  const history: ConversationTurnContext[] = [
    { sessionId: 'ctx-a', userMessage: 'ผมอายุ 39 ปีครับ', assistantResponse: 'รับทราบครับ', timestamp: '2026-06-29T09:00:00.000Z', intent: 'health_insurance' },
  ];
  const result = buildPrompt({ executionContext: makeMinimalCtx(), conversationHistory: history });

  assert.ok(result.systemPrompt.includes('=== 13: RECENT CONVERSATION HISTORY ==='), 'Expected Section 13 in prompt');
  assert.ok(result.systemPrompt.includes('ผมอายุ 39 ปีครับ'), 'Expected user message in history section');
  assert.ok(result.systemPrompt.includes('รับทราบครับ'), 'Expected assistant response in history section');
  assert.equal(result.sectionCount, 13, 'Expected 13 sections when history is present');
});

test('PROMPT-HIST-02: Section 13 absent when no history', () => {
  const result = buildPrompt({ executionContext: makeMinimalCtx(), conversationHistory: [] });

  assert.ok(!result.systemPrompt.includes('=== 13: RECENT CONVERSATION HISTORY ==='), 'Section 13 must be absent with no history');
  assert.equal(result.sectionCount, 12, 'Expected 12 sections with no history');
});

test('PROMPT-HIST-03: Section 13 includes cannot-see-history guard rule', () => {
  const history: ConversationTurnContext[] = [
    { sessionId: 'ctx-b', userMessage: 'งบ 20000 ครับ', assistantResponse: 'รับทราบครับ', timestamp: '2026-06-29T09:00:00.000Z', intent: 'health_insurance' },
  ];
  const result = buildPrompt({ executionContext: makeMinimalCtx(), conversationHistory: history });
  assert.ok(result.systemPrompt.includes('NEVER say you cannot see previous messages'), 'Expected history guard rule in prompt');
});

test('PROMPT-HIST-04: Output rules include rule 9 referencing Section 13', () => {
  const result = buildPrompt({ executionContext: makeMinimalCtx() });
  assert.ok(result.systemPrompt.includes('Section 13'), 'Expected rule 9 about Section 13 in output rules');
});

// ─── KV history loader ────────────────────────────────────────────────────────

test('KV-HIST-01: getRecentConversationTurnsForUser returns turns oldest-first', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);

  const userId = 'Uhisttest001';
  const date   = '2026-06-29';
  const convId = buildConversationId(userId, `${date}T10:00:00.000Z`);

  const entryA: ConversationLogEntry = {
    conversationId: convId, sessionId: 'ctx-older', timestamp: '2026-06-29T09:00:00.000Z',
    runtimeVersion: 'gen1-stub-0.9.0', runtimeMode: 'gen1', userId: `${userId.substring(0,8)}***`,
    userMessage: 'ผมอายุ 39 ปีครับ', assistantResponse: 'รับทราบครับ', latency: 100,
    intent: 'health_insurance', capability: 'CAP-004', decision: 'educate', strategy: 'EDUCATE_THEN_DISCOVER',
    questionCount: 1, recommendationDelivered: false, educationDelivered: false,
    leadCaptureStarted: false, leadCaptureCompleted: false, trustFlow: false, medicalFlow: false,
    formatterApplied: false, validatorPassed: true, fallbackUsed: false, fallbackReason: null, error: null, responseLength: 6,
  };
  const entryB: ConversationLogEntry = {
    ...entryA, sessionId: 'ctx-newer', timestamp: '2026-06-29T10:00:00.000Z',
    userMessage: 'งบ 20000 บาทครับ', assistantResponse: 'รับทราบงบครับ',
  };

  await logConversationTurn(entryA);
  await logConversationTurn(entryB);

  const turns = await getRecentConversationTurnsForUser(userId, date, 10);
  assert.ok(turns.length >= 2, `Expected ≥2 turns, got ${turns.length}`);
  // Oldest first — entryA timestamp < entryB timestamp
  const olderIdx = turns.findIndex((t) => t.sessionId === 'ctx-older');
  const newerIdx = turns.findIndex((t) => t.sessionId === 'ctx-newer');
  assert.ok(olderIdx < newerIdx, 'Expected older turn before newer turn (oldest-first order)');
});

test('KV-HIST-02: getRecentConversationTurnsForUser respects limit', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);

  const userId = 'Ulimituser01';
  const date   = '2026-06-29';
  const convId = buildConversationId(userId, `${date}T10:00:00.000Z`);
  const baseEntry: ConversationLogEntry = {
    conversationId: convId, sessionId: 'ctx-lim-X', timestamp: '2026-06-29T10:00:00.000Z',
    runtimeVersion: 'gen1-stub-0.9.0', runtimeMode: 'gen1', userId: `${userId.substring(0,8)}***`,
    userMessage: 'ทดสอบ', assistantResponse: 'ตอบ', latency: 10,
    intent: 'greeting', capability: 'CAP-001', decision: 'answer', strategy: 'ANSWER_ONLY',
    questionCount: 0, recommendationDelivered: false, educationDelivered: false,
    leadCaptureStarted: false, leadCaptureCompleted: false, trustFlow: false, medicalFlow: false,
    formatterApplied: false, validatorPassed: true, fallbackUsed: false, fallbackReason: null, error: null, responseLength: 2,
  };

  for (let i = 0; i < 5; i++) {
    await logConversationTurn({ ...baseEntry, sessionId: `ctx-lim-${i}` });
  }

  const turns = await getRecentConversationTurnsForUser(userId, date, 3);
  assert.equal(turns.length, 3, 'Expected exactly 3 turns for limit=3');
});

test('KV-HIST-03: getRecentConversationTurnsForUser returns [] when KV throws', async () => {
  __setKvClientForTest(createThrowingKv());
  const errors: string[] = [];
  const origErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(String(args[0])); };
  try {
    const turns = await getRecentConversationTurnsForUser('UanyUser', '2026-06-29', 10);
    assert.deepEqual(turns, [], 'Expected empty array when KV throws');
    assert.ok(errors.some((e) => e.includes('[CONV_HISTORY_LOAD_ERROR]')), 'Expected [CONV_HISTORY_LOAD_ERROR] logged');
  } finally {
    console.error = origErr;
  }
});

test('KV-HIST-04: getRecentConversationTurnsForUser returns [] when no history exists', async () => {
  const mock = createMockKv();
  __setKvClientForTest(mock);
  const turns = await getRecentConversationTurnsForUser('UnoHistory00', '2026-06-29', 10);
  assert.deepEqual(turns, [], 'Expected empty array when no history stored');
});

// ─── End-to-end: pipeline degrades gracefully when KV unavailable ─────────────

test('E2E-HIST-01: pipeline completes normally when KV history load fails', async () => {
  clearAuditQueue();
  __setKvClientForTest(createThrowingKv());
  __setMockLlmFn(async () => 'ประกันสุขภาพ Good Health Prime เหมาะกับคุณครับ');
  const origErr = console.error;
  console.error = () => { /* suppress */ };
  try {
    const output = await runGen1LineAdapter(makeLineInput('ผมอายุ 39 สนใจประกันสุขภาพครับ'));
    assert.ok(output.text.length > 0, 'Expected non-empty response even when KV throws');
    assert.notEqual(output.decision, 'ACT-12 FALLBACK (stub)', 'Expected non-stub response');
  } finally {
    __setMockLlmFn(null);
    console.error = origErr;
  }
});

test('E2E-HIST-02: [MEMORY_HISTORY] log emitted on every executeGen1 call', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  __setMockLlmFn(async () => 'ยินดีให้คำปรึกษาครับ');

  const logs: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => { logs.push(args.join(' ')); orig(...args); };
  try {
    await runGen1LineAdapter(makeLineInput('สวัสดีครับ'));
    assert.ok(logs.some((l) => l.includes('[MEMORY_HISTORY]')), 'Expected [MEMORY_HISTORY] in logs');
  } finally {
    console.log = orig;
    __setMockLlmFn(null);
  }
});

test('E2E-HIST-03: [MEMORY_HISTORY] log contains required fields', async () => {
  clearAuditQueue();
  const mock = createMockKv();
  __setKvClientForTest(mock);
  __setMockLlmFn(async () => 'ยินดีช่วยเหลือครับ');

  let captured = '';
  const orig = console.log;
  console.log = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0] === '[MEMORY_HISTORY]') {
      captured = String(args[1]);
    }
    orig(...args);
  };
  try {
    await runGen1LineAdapter(makeLineInput('สนใจประกันสุขภาพครับ'));
    assert.ok(captured.length > 0, 'Expected [MEMORY_HISTORY] JSON captured');
    const parsed = JSON.parse(captured) as Record<string, unknown>;
    assert.ok('loadedTurns' in parsed, 'Expected loadedTurns field');
    assert.ok('extractedKnownFieldsFromHistory' in parsed, 'Expected extractedKnownFieldsFromHistory field');
    assert.ok('historyAvailable' in parsed, 'Expected historyAvailable field');
    assert.ok('historyLoadError' in parsed, 'Expected historyLoadError field');
  } finally {
    console.log = orig;
    __setMockLlmFn(null);
  }
});
