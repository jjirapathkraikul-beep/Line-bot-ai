// Gen1 LINE Adapter — Phase 10.8
// Converts LINE text message events into RuntimeInput and RuntimeOutput into LINE replies.
// All LINE-specific conversion logic lives here; business logic stays in runtime-gen1/core.
//
// Usage from webhook:
//   const out = await runGen1LineAdapter({ userId, displayName, messageText, replyToken, timestamp, session });
//   await lineClient.replyMessage(replyToken, { type: 'text', text: out.text });

import { execute } from '../../core/runtime';
import type { RuntimeInput, RuntimeOutput } from '../../core/types';

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

// Strip the "#gen1 " prefix from an admin test command.
// Returns the real message text, or null if input is not a #gen1 command or has no message.
export function stripGen1Prefix(message: string): string | null {
  const trimmed = message.trim();
  const PREFIX  = '#gen1 ';
  if (trimmed.toLowerCase().startsWith(PREFIX)) {
    const stripped = trimmed.substring(PREFIX.length).trim();
    return stripped.length > 0 ? stripped : null;
  }
  return null;
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

// Run the full Gen1 pipeline for a LINE text message event.
// Logs [GEN1_LINE] with all required fields on every call.
export async function runGen1LineAdapter(input: LineAdapterInput): Promise<LineAdapterOutput> {
  const runtimeInput = buildRuntimeInput(input);
  const output       = await execute(runtimeInput);
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
