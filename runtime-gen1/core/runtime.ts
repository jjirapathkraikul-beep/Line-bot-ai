import type { RuntimeInput, RuntimeOutput, RuntimeTrace } from './types';
import { getRuntimeMode } from './runtimeMode';
import { detectIntent } from '../capability/intentDetector';
import { loadCapability } from '../capability/capabilityLoader';

export const RUNTIME_VERSION = 'gen1-stub-0.2.0';

const PLACEHOLDER_TEXT = 'ตอนนี้ระบบ AI Advisor รุ่นใหม่กำลังทำงานครับ 😊';

export async function execute(input: RuntimeInput): Promise<RuntimeOutput> {
  // Phase 10.2: run intent detection + capability loading
  const intentResult     = detectIntent(input.message);
  const capabilityResult = loadCapability(intentResult);

  const trace: RuntimeTrace = {
    mode:          getRuntimeMode(),
    userId_masked: `${input.userId.substring(0, 8)}***`,
    message_preview: input.message.substring(0, 40),
    runtimeVersion: RUNTIME_VERSION,
    decision:      'ACT-12 FALLBACK (stub)',
    timestamp:     input.timestamp,
    // Phase 10.2 intent + capability fields
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
  };

  return {
    text:           PLACEHOLDER_TEXT,
    decision:       'ACT-12 FALLBACK (stub)',
    runtimeVersion: RUNTIME_VERSION,
    trace,
  };
}
