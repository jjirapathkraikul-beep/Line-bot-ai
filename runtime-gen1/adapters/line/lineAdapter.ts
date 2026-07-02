// Gen1 LINE Adapter — Phase 10.8
// Converts LINE text message events into RuntimeInput and RuntimeOutput into LINE replies.
// All LINE-specific conversion logic lives here; business logic stays in runtime-gen1/core.
//
// Usage from webhook:
//   const out = await runGen1LineAdapter({ userId, displayName, messageText, replyToken, timestamp, session });
//   await lineClient.replyMessage(replyToken, { type: 'text', text: out.text });

import { executeGen1 } from '../../core/runtime';
import type { RuntimeInput, RuntimeOutput } from '../../core/types';
import { setRuntimeStateMetadata } from '../../../lib/leadCapture';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LineAdapterInput {
  userId:      string;
  displayName: string;
  messageText: string;
  replyToken:  string;
  timestamp:   string;
  session:     unknown;
}

export interface LineAdapterOutput {
  text:           string;
  runtimeVersion: string;
  decision:       string;
  logEntry:       LineTraceEntry;
}

// Structured log emitted as [GEN1_LINE] on every Gen1 LINE reply
export interface LineTraceEntry {
  mode:             string;
  userId_masked:    string;
  intent:           string;
  capability:       string;
  action:           string;
  validationPassed: boolean;
  responseLength:   number;
  timestamp:        string;
}

const PENDING_HOSPITAL_SLOT_STATE = 'gen1_pending_slot:preferred_hospital';
const HEALTH_ADVISORY_STATE = 'gen1_health_advisory';

function asMutableSession(session: unknown): { meta?: Record<string, unknown> } | null {
  if (session !== null && typeof session === 'object') {
    return session as { meta?: Record<string, unknown> };
  }
  return null;
}

function asksForPreferredHospital(text: string): boolean {
  return text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลักครับ') ||
    text.includes('ปกติเข้าโรงพยาบาลไหนเป็นหลัก');
}

function updateGen1PendingSlot(userId: string, session: unknown, outputText: string): void {
  const mutableSession = asMutableSession(session);
  if (!mutableSession) return;

  const meta = mutableSession.meta ?? {};
  const currentState = typeof meta.lastState === 'string' ? meta.lastState : null;

  if (asksForPreferredHospital(outputText)) {
    const updates = {
      lastState:  PENDING_HOSPITAL_SLOT_STATE,
      lastIntent: 'health_insurance',
    };
    mutableSession.meta = {
      ...meta,
      ...updates,
      stateUpdatedAt: Date.now(),
    };
    setRuntimeStateMetadata(userId, updates);
    return;
  }

  if (currentState === PENDING_HOSPITAL_SLOT_STATE) {
    const updates = { lastState: HEALTH_ADVISORY_STATE };
    mutableSession.meta = {
      ...meta,
      ...updates,
      stateUpdatedAt: Date.now(),
    };
    setRuntimeStateMetadata(userId, updates);
  }
}

// ─── Pure conversions ─────────────────────────────────────────────────────────

// Convert LINE event fields to the channel-agnostic RuntimeInput.
export function buildRuntimeInput(input: LineAdapterInput): RuntimeInput {
  return {
    userId:      input.userId,
    message:     input.messageText,
    displayName: input.displayName,
    replyToken:  input.replyToken,
    timestamp:   input.timestamp,
    session:     input.session,
  };
}

// Build the structured [GEN1_LINE] log entry from a completed RuntimeOutput.
export function buildLogEntry(output: RuntimeOutput, timestamp: string): LineTraceEntry {
  return {
    mode:             output.trace.mode,
    userId_masked:    output.trace.userId_masked,
    intent:           output.trace.detectedIntent          ?? 'unknown',
    capability:       output.trace.selectedCapabilities?.[0] ?? 'unknown',
    action:           output.trace.action                  ?? output.decision,
    validationPassed: output.trace.responseValidationPassed ?? true,
    responseLength:   output.text.length,
    timestamp,
  };
}

// Strip the "#gen1" prefix (with any amount of following whitespace) from an admin test command.
// Accepts: '#gen1 msg', '#gen1msg', '#gen1   msg' (CQ-007 parser robustness)
// Returns the real message text, or null if input is not a #gen1 command or has no message body.
export function stripGen1Prefix(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.toLowerCase().startsWith('#gen1')) return null;
  const after = trimmed.substring('#gen1'.length).trim();
  return after.length > 0 ? after : null;
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

// Run the full Gen1 pipeline for a LINE text message event.
// Always calls executeGen1() — bypasses AI_RUNTIME_MODE so the admin #gen1
// command works regardless of the feature-flag environment variable.
// Logs [GEN1_LINE] with all required fields on every call.
export async function runGen1LineAdapter(input: LineAdapterInput): Promise<LineAdapterOutput> {
  const runtimeInput = buildRuntimeInput(input);
  const output       = await executeGen1(runtimeInput);
  updateGen1PendingSlot(input.userId, input.session, output.text);
  const logEntry     = buildLogEntry(output, input.timestamp);

  console.log('[GEN1_LINE]', JSON.stringify({
    mode:             logEntry.mode,
    userId_masked:    logEntry.userId_masked,
    intent:           logEntry.intent,
    capability:       logEntry.capability,
    action:           logEntry.action,
    validationPassed: logEntry.validationPassed,
    responseLength:   logEntry.responseLength,
    timestamp:        logEntry.timestamp,
  }));

  return {
    text:           output.text,
    runtimeVersion: output.runtimeVersion,
    decision:       output.decision,
    logEntry,
  };
}
