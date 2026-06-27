import type { RuntimeInput, RuntimeOutput, RuntimeTrace } from './types';
import { getRuntimeMode } from './runtimeMode';
import { detectIntent } from '../capability/intentDetector';
import { loadCapability } from '../capability/capabilityLoader';
import { resolveMemory } from '../memory/memoryResolver';
import { resolveKnowledge } from '../knowledge/knowledgeResolver';

export const RUNTIME_VERSION = 'gen1-stub-0.4.0';

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
  };

  return {
    text:           PLACEHOLDER_TEXT,
    decision:       'ACT-12 FALLBACK (stub)',
    runtimeVersion: RUNTIME_VERSION,
    trace,
  };
}
