import type { RuntimeInput, RuntimeOutput, RuntimeTrace } from './types';
import { getRuntimeMode } from './runtimeMode';
import { detectIntent } from '../capability/intentDetector';
import { loadCapability } from '../capability/capabilityLoader';
import { resolveMemory } from '../memory/memoryResolver';
import { resolveKnowledge } from '../knowledge/knowledgeResolver';
import { makeDecision } from '../decision/decisionEngine';
import { buildExecutionContext } from '../context/contextBuilder';

export const RUNTIME_VERSION = 'gen1-stub-0.6.0';

const PLACEHOLDER_TEXT = 'ตอนนี้ระบบ AI Advisor รุ่นใหม่กำลังทำงานครับ 😊';

export async function execute(input: RuntimeInput): Promise<RuntimeOutput> {
  // Step 1: Intent detection
  const intentResult = detectIntent(input.message);

  // Step 2: Capability loading
  const capabilityResult = loadCapability(intentResult);

  // Step 3: Memory resolution
  const memoryResult = resolveMemory({ runtimeInput: input, intentResult, capabilityResult });

  // Step 4: Knowledge resolution
  const knowledgeResult = await resolveKnowledge({ intentResult, capabilityResult, memoryResult });

  // Step 5: Decision engine
  const decisionResult = makeDecision({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult });

  // Step 6: Context builder
  const contextResult = buildExecutionContext({ runtimeInput: input, intentResult, capabilityResult, memoryResult, knowledgeResult, decisionResult });

  const trace: RuntimeTrace = {
    mode:            getRuntimeMode(),
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
    selectedKnowledgePaths:    knowledgeResult.selectedSources.map((s) => s.path),
    loadedKnowledgeCount:      knowledgeResult.loadedSnippets.length,
    missingKnowledgePaths:     knowledgeResult.missingSources,
    knowledgeWarnings:         knowledgeResult.warnings,
    knowledgeDecisionReason:   knowledgeResult.knowledgeTrace.knowledgeDecisionReason,
    mandatoryKnowledgeIncluded: knowledgeResult.knowledgeTrace.mandatoryIncluded,
    knowledgeFragmentsAdded:   knowledgeResult.knowledgeTrace.mandatoryFragmentsAdded,
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
    // Phase 10.6 — context builder
    contextBuilt:              true,
    contextValidationPassed:   contextResult.validation.passed,
    contextWarnings:           contextResult.warnings,
    responseProfileTone:       contextResult.executionContext.responseProfile.tone,
    responseProfileLength:     contextResult.executionContext.responseProfile.length,
    responseProfileEmpathy:    contextResult.executionContext.responseProfile.empathyLevel,
    responseProfileQuestionStrategy: contextResult.executionContext.responseProfile.questionStrategy,
    responseProfileCtaAllowed: contextResult.executionContext.responseProfile.ctaAllowed,
    restrictionsHardCount:     contextResult.executionContext.restrictions.hardProhibitions.length,
    restrictionsSoftCount:     contextResult.executionContext.restrictions.softProhibitions.length,
    compressedContextCharCount: contextResult.contextTrace.compressedCharCount,
    contextAuditId:            contextResult.contextTrace.auditId,
    contextAssemblyTimeMs:     contextResult.contextTrace.assemblyTimeMs,
  };

  return {
    text:           PLACEHOLDER_TEXT,
    decision:       'ACT-12 FALLBACK (stub)',
    runtimeVersion: RUNTIME_VERSION,
    trace,
  };
}
