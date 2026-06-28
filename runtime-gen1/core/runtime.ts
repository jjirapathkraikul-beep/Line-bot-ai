import type { RuntimeInput, RuntimeOutput, RuntimeTrace } from './types';
import { getRuntimeMode } from './runtimeMode';
import { detectIntent } from '../capability/intentDetector';
import { loadCapability } from '../capability/capabilityLoader';
import { resolveMemory } from '../memory/memoryResolver';
import { resolveKnowledge } from '../knowledge/knowledgeResolver';
import { makeDecision } from '../decision/decisionEngine';
import { selectConversationStrategy } from '../conversation/strategyEngine';
import { buildExecutionContext } from '../context/contextBuilder';
import { buildPrompt } from '../response/promptBuilder';
import { generateResponse, GEN1_SAFE_FALLBACK_TEXT } from '../response/llmAdapter';
import { validateResponse } from '../response/responseValidator';
import { formatResponse } from '../response/responseFormatter';

export const RUNTIME_VERSION = 'gen1-stub-0.9.0';

const PLACEHOLDER_TEXT = 'ตอนนี้ระบบ AI Advisor รุ่นใหม่กำลังทำงานครับ 😊';

// ─── executeGen1 ──────────────────────────────────────────────────────────────
//
// Runs the FULL Gen1 pipeline (steps 1–10) unconditionally.
// Used by: the #gen1 admin command (via lineAdapter), and by execute() in gen1 mode.
// Always returns an LLM-generated response; falls back to GEN1_SAFE_FALLBACK_TEXT
// only when the pipeline itself throws (not when LLM degrades gracefully).

export async function executeGen1(input: RuntimeInput): Promise<RuntimeOutput> {
  // ── Steps 1–6: Intent → Capability → Memory → Knowledge → Decision → Strategy → Context ──
  const intentResult     = detectIntent(input.message);
  const capabilityResult = loadCapability(intentResult);
  const memoryResult     = resolveMemory({ runtimeInput: input, intentResult, capabilityResult });
  const knowledgeResult  = await resolveKnowledge({ intentResult, capabilityResult, memoryResult });
  const decisionResult   = makeDecision({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult });
  const strategyResult   = selectConversationStrategy({ intentResult, capabilityResult, memoryResult, decisionResult });
  const contextResult    = buildExecutionContext({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult, decisionResult, strategyResult });

  // Base trace — all fields derived from steps 1–6 (populated before LLM, safe to use in catch)
  const trace: RuntimeTrace = {
    mode:            'gen1',
    userId_masked:   `${input.userId.substring(0, 8)}***`,
    message_preview: input.message.substring(0, 40),
    runtimeVersion:  RUNTIME_VERSION,
    decision:        'ACT-12 FALLBACK (stub)',
    timestamp:       input.timestamp,
    // Phase 10.2 — intent + capability
    detectedIntent:              intentResult.intent,
    confidence:                  intentResult.confidence,
    isTrustSignal:               intentResult.flags.isTrustSignal,
    isMedicalSignal:             intentResult.flags.isMedicalSignal,
    isEmergency:                 intentResult.flags.isEmergency,
    isHumanRequest:              intentResult.flags.isHumanRequest,
    selectedCapabilities:        [capabilityResult.primaryCapability.capId],
    selectedAcpPaths:            capabilityResult.selectedAcpPaths,
    shouldInterruptCurrentState: capabilityResult.shouldInterruptCurrentState,
    interruptReason:             capabilityResult.reason,
    // Phase 10.3 — memory resolver
    knownFields:         memoryResult.knownFields,
    missingFields:       memoryResult.missingFields.map((f) => f.field),
    deferredFields:      memoryResult.deferredFields.map((f) => f.field),
    neverAskAgainFields: memoryResult.neverAskAgainFields,
    nextBestFieldToAsk:  memoryResult.nextBestFieldToAsk,
    extractedFacts:      memoryResult.extractedFacts.map((f) => ({
      field: f.field, value: f.value, confidence: f.confidence,
    })),
    memoryDecisionReason: memoryResult.memoryDecisionReason,
    // Phase 10.4 — knowledge resolver
    selectedKnowledgePaths:     knowledgeResult.selectedSources.map((s) => s.path),
    loadedKnowledgeCount:       knowledgeResult.loadedSnippets.length,
    missingKnowledgePaths:      knowledgeResult.missingSources,
    knowledgeWarnings:          knowledgeResult.warnings,
    knowledgeDecisionReason:    knowledgeResult.knowledgeTrace.knowledgeDecisionReason,
    mandatoryKnowledgeIncluded: knowledgeResult.knowledgeTrace.mandatoryIncluded,
    knowledgeFragmentsAdded:    knowledgeResult.knowledgeTrace.mandatoryFragmentsAdded,
    // Phase 10.5 — decision engine
    action:                    decisionResult.action,
    decisionPriority:          decisionResult.priority,
    shouldCollectLead:         decisionResult.shouldCollectLead,
    shouldEscalate:            decisionResult.shouldEscalate,
    askField:                  decisionResult.askField,
    mustAnswerFirst:           decisionResult.mustAnswerFirst,
    mustBuildTrust:            decisionResult.mustBuildTrust,
    mustIncludeDisclaimer:     decisionResult.mustIncludeDisclaimer,
    mustIncludeRiskDisclosure: decisionResult.mustIncludeRiskDisclosure,
    decisionReason:            decisionResult.reason,
    decisionWarnings:          decisionResult.warnings.map((w) => `[${w.severity}] ${w.code}: ${w.message}`),
    blockedCapabilities:       decisionResult.blockedCapabilities,
    decisionConfidence:        decisionResult.decisionTrace.confidence,
    alternativeAction:         decisionResult.decisionTrace.alternativeAction,
    // Phase Pre-10.9 — conversation strategy engine
    strategyId:                         strategyResult.strategyId,
    strategyGoal:                        strategyResult.strategyGoal,
    topicShiftDetected:                  strategyResult.topicShiftDetected,
    leadCaptureAllowedByStrategy:        strategyResult.leadCaptureAllowedByStrategy,
    strategyMustAnswerFirst:             strategyResult.mustAnswerFirst,
    strategyMustEducate:                 strategyResult.mustEducate,
    strategyMustRecommendBeforeCapture:  strategyResult.mustRecommendBeforeCapture,
    strategyWarnings:                    strategyResult.strategyWarnings,
    // Phase 10.6 — context builder
    contextBuilt:                    true,
    contextValidationPassed:          contextResult.validation.passed,
    contextWarnings:                  contextResult.warnings,
    responseProfileTone:              contextResult.executionContext.responseProfile.tone,
    responseProfileLength:            contextResult.executionContext.responseProfile.length,
    responseProfileEmpathy:           contextResult.executionContext.responseProfile.empathyLevel,
    responseProfileQuestionStrategy:  contextResult.executionContext.responseProfile.questionStrategy,
    responseProfileCtaAllowed:        contextResult.executionContext.responseProfile.ctaAllowed,
    restrictionsHardCount:            contextResult.executionContext.restrictions.hardProhibitions.length,
    restrictionsSoftCount:            contextResult.executionContext.restrictions.softProhibitions.length,
    compressedContextCharCount:       contextResult.contextTrace.compressedCharCount,
    contextAuditId:                   contextResult.contextTrace.auditId,
    contextAssemblyTimeMs:            contextResult.contextTrace.assemblyTimeMs,
  };

  // ── Steps 7–10: Prompt → LLM → Validator → Formatter ────────────────────────
  try {
    const promptResult    = buildPrompt({ executionContext: contextResult.executionContext });
    const llmResult       = await generateResponse({
      systemPrompt: promptResult.systemPrompt,
      userMessage:  promptResult.userMessage,
      userId:       input.userId,
    });
    const responseResult  = validateResponse({ text: llmResult.text, executionContext: contextResult.executionContext });
    const formatterResult = formatResponse({ text: responseResult.text });

    console.log('[GEN1_PIPELINE]', JSON.stringify({
      intent:           intentResult.intent,
      capability:       capabilityResult.primaryCapability.capId,
      action:           decisionResult.action,
      strategyId:       strategyResult.strategyId,
      promptBuilt:      true,
      llmCalled:        true,
      validatorPassed:  responseResult.passed,
      formatterApplied: formatterResult.changed,
    }));

    return {
      text:           formatterResult.text,
      decision:       decisionResult.action,
      runtimeVersion: RUNTIME_VERSION,
      trace: {
        ...trace,
        // Step 7
        promptBuilt:       true,
        promptSectionCount: promptResult.sectionCount,
        promptCharCount:    promptResult.promptCharCount,
        // Step 8
        llmModel:            llmResult.model,
        llmPromptTokens:     llmResult.promptTokens,
        llmCompletionTokens: llmResult.completionTokens,
        llmWarnings:         llmResult.warnings,
        // Step 9
        responseValidationPassed:   responseResult.passed,
        responseValidationFailures: responseResult.failures,
        responseValidationWarnings: responseResult.warnings,
        responseUsedFallback:       responseResult.usedFallback,
        responseWordCount:          responseResult.wordCount,
        // Step 10 — formatter + P0-008 audit
        formatterApplied:            formatterResult.changed,
        formatterRules:              formatterResult.appliedRules,
        strategyReason:              strategyResult.strategyGoal,
        questionCount:               responseResult.questionCount,
        educationDelivered:          memoryResult.leadMemory.valueDelivered,
        leadCaptureStarted:          memoryResult.leadMemory.captureStage !== 'IDLE' && memoryResult.leadMemory.captureStage !== 'COMPLETE',
        recommendationDelivered:     false,
        valueDeliveredBeforeCapture: decisionResult.shouldCollectLead ? memoryResult.leadMemory.valueDelivered : undefined,
      },
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[GEN1] Pipeline error in steps 7-10:', errMsg);
    console.log('[GEN1_PIPELINE]', JSON.stringify({
      intent:           intentResult.intent,
      capability:       capabilityResult.primaryCapability.capId,
      action:           decisionResult.action,
      strategyId:       strategyResult.strategyId,
      promptBuilt:      false,
      llmCalled:        false,
      validatorPassed:  false,
      formatterApplied: false,
      fallbackReason:   errMsg,
    }));
    return {
      text:           GEN1_SAFE_FALLBACK_TEXT,
      decision:       'fallback',
      runtimeVersion: RUNTIME_VERSION,
      trace:          { ...trace, gen1PipelineError: true },
    };
  }
}

// ─── execute ──────────────────────────────────────────────────────────────────
//
// Feature-flag router. Respects AI_RUNTIME_MODE:
//   gen1   → delegates to executeGen1() (full pipeline)
//   shadow → runs gen1 pipeline in background, returns placeholder to user
//   v1     → returns placeholder (V1 webhook handles real response)

export async function execute(input: RuntimeInput): Promise<RuntimeOutput> {
  const mode = getRuntimeMode();

  // Fast path: delegate entirely to executeGen1() — no duplication of pipeline code
  if (mode === 'gen1') {
    return executeGen1(input);
  }

  // For shadow/v1: run steps 1–7 to build the shared trace and shadow context
  const intentResult     = detectIntent(input.message);
  const capabilityResult = loadCapability(intentResult);
  const memoryResult     = resolveMemory({ runtimeInput: input, intentResult, capabilityResult });
  const knowledgeResult  = await resolveKnowledge({ intentResult, capabilityResult, memoryResult });
  const decisionResult   = makeDecision({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult });
  const strategyResult   = selectConversationStrategy({ intentResult, capabilityResult, memoryResult, decisionResult });
  const contextResult    = buildExecutionContext({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult, decisionResult, strategyResult });

  const trace: RuntimeTrace = {
    mode,
    userId_masked:   `${input.userId.substring(0, 8)}***`,
    message_preview: input.message.substring(0, 40),
    runtimeVersion:  RUNTIME_VERSION,
    decision:        'ACT-12 FALLBACK (stub)',
    timestamp:       input.timestamp,
    detectedIntent:              intentResult.intent,
    confidence:                  intentResult.confidence,
    isTrustSignal:               intentResult.flags.isTrustSignal,
    isMedicalSignal:             intentResult.flags.isMedicalSignal,
    isEmergency:                 intentResult.flags.isEmergency,
    isHumanRequest:              intentResult.flags.isHumanRequest,
    selectedCapabilities:        [capabilityResult.primaryCapability.capId],
    selectedAcpPaths:            capabilityResult.selectedAcpPaths,
    shouldInterruptCurrentState: capabilityResult.shouldInterruptCurrentState,
    interruptReason:             capabilityResult.reason,
    knownFields:         memoryResult.knownFields,
    missingFields:       memoryResult.missingFields.map((f) => f.field),
    deferredFields:      memoryResult.deferredFields.map((f) => f.field),
    neverAskAgainFields: memoryResult.neverAskAgainFields,
    nextBestFieldToAsk:  memoryResult.nextBestFieldToAsk,
    extractedFacts:      memoryResult.extractedFacts.map((f) => ({
      field: f.field, value: f.value, confidence: f.confidence,
    })),
    memoryDecisionReason: memoryResult.memoryDecisionReason,
    selectedKnowledgePaths:     knowledgeResult.selectedSources.map((s) => s.path),
    loadedKnowledgeCount:       knowledgeResult.loadedSnippets.length,
    missingKnowledgePaths:      knowledgeResult.missingSources,
    knowledgeWarnings:          knowledgeResult.warnings,
    knowledgeDecisionReason:    knowledgeResult.knowledgeTrace.knowledgeDecisionReason,
    mandatoryKnowledgeIncluded: knowledgeResult.knowledgeTrace.mandatoryIncluded,
    knowledgeFragmentsAdded:    knowledgeResult.knowledgeTrace.mandatoryFragmentsAdded,
    action:                    decisionResult.action,
    decisionPriority:          decisionResult.priority,
    shouldCollectLead:         decisionResult.shouldCollectLead,
    shouldEscalate:            decisionResult.shouldEscalate,
    askField:                  decisionResult.askField,
    mustAnswerFirst:           decisionResult.mustAnswerFirst,
    mustBuildTrust:            decisionResult.mustBuildTrust,
    mustIncludeDisclaimer:     decisionResult.mustIncludeDisclaimer,
    mustIncludeRiskDisclosure: decisionResult.mustIncludeRiskDisclosure,
    decisionReason:            decisionResult.reason,
    decisionWarnings:          decisionResult.warnings.map((w) => `[${w.severity}] ${w.code}: ${w.message}`),
    blockedCapabilities:       decisionResult.blockedCapabilities,
    decisionConfidence:        decisionResult.decisionTrace.confidence,
    alternativeAction:         decisionResult.decisionTrace.alternativeAction,
    strategyId:                         strategyResult.strategyId,
    strategyGoal:                        strategyResult.strategyGoal,
    topicShiftDetected:                  strategyResult.topicShiftDetected,
    leadCaptureAllowedByStrategy:        strategyResult.leadCaptureAllowedByStrategy,
    strategyMustAnswerFirst:             strategyResult.mustAnswerFirst,
    strategyMustEducate:                 strategyResult.mustEducate,
    strategyMustRecommendBeforeCapture:  strategyResult.mustRecommendBeforeCapture,
    strategyWarnings:                    strategyResult.strategyWarnings,
    contextBuilt:                    true,
    contextValidationPassed:          contextResult.validation.passed,
    contextWarnings:                  contextResult.warnings,
    responseProfileTone:              contextResult.executionContext.responseProfile.tone,
    responseProfileLength:            contextResult.executionContext.responseProfile.length,
    responseProfileEmpathy:           contextResult.executionContext.responseProfile.empathyLevel,
    responseProfileQuestionStrategy:  contextResult.executionContext.responseProfile.questionStrategy,
    responseProfileCtaAllowed:        contextResult.executionContext.responseProfile.ctaAllowed,
    restrictionsHardCount:            contextResult.executionContext.restrictions.hardProhibitions.length,
    restrictionsSoftCount:            contextResult.executionContext.restrictions.softProhibitions.length,
    compressedContextCharCount:       contextResult.contextTrace.compressedCharCount,
    contextAuditId:                   contextResult.contextTrace.auditId,
    contextAssemblyTimeMs:            contextResult.contextTrace.assemblyTimeMs,
  };

  // ── Shadow mode: run gen1 in background, return placeholder ─────────────────
  if (mode === 'shadow') {
    Promise.resolve().then(async () => {
      const promptResult = buildPrompt({ executionContext: contextResult.executionContext });
      const llmResult    = await generateResponse({
        systemPrompt: promptResult.systemPrompt,
        userMessage:  promptResult.userMessage,
        userId:       input.userId,
      });
      const responseResult = validateResponse({
        text:             llmResult.text,
        executionContext: contextResult.executionContext,
      });
      console.log(
        `[GEN1-SHADOW] action=${decisionResult.action} model=${llmResult.model}` +
        ` passed=${responseResult.passed} text="${responseResult.text.substring(0, 60)}..."`,
      );
    }).catch((err: unknown) => {
      console.error('[GEN1-SHADOW] Error:', err instanceof Error ? err.message : String(err));
    });
  }

  // ── Default (v1 or shadow fall-through): return placeholder ─────────────────
  return {
    text:           PLACEHOLDER_TEXT,
    decision:       'ACT-12 FALLBACK (stub)',
    runtimeVersion: RUNTIME_VERSION,
    trace,
  };
}
