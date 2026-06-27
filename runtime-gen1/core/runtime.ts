import type { RuntimeInput, RuntimeOutput, RuntimeTrace } from './types';
import { getRuntimeMode } from './runtimeMode';

export const RUNTIME_VERSION = 'gen1-stub-0.1.0';

const PLACEHOLDER_TEXT = 'ตอนนี้ระบบ AI Advisor รุ่นใหม่กำลังทำงานครับ 😊';

export async function execute(input: RuntimeInput): Promise<RuntimeOutput> {
  const trace: RuntimeTrace = {
    mode: getRuntimeMode(),
    userId_masked: `${input.userId.substring(0, 8)}***`,
    message_preview: input.message.substring(0, 40),
    runtimeVersion: RUNTIME_VERSION,
    decision: 'ACT-12 FALLBACK (stub)',
    timestamp: input.timestamp,
  };

  return {
    text: PLACEHOLDER_TEXT,
    decision: 'ACT-12 FALLBACK (stub)',
    runtimeVersion: RUNTIME_VERSION,
    trace,
  };
}
