// Gen1 LINE Adapter — Phase 10.8
// Converts LINE text message events into RuntimeInput and RuntimeOutput into LINE replies.
// All LINE-specific conversion logic lives here; business logic stays in runtime-gen1/core.
//
// Usage from webhook:
//   const out = await runGen1LineAdapter({ userId, displayName, messageText, replyToken, timestamp, session });
//   await lineClient.replyMessage(replyToken, { type: 'text', text: out.text });

import { executeGen1 } from '../../core/runtime';
import type { RuntimeInput, RuntimeOutput } from '../../core/types';
import {
  clearPendingSlot,
  detectPendingSlotFromAssistantResponse,
  getPendingSlotFromSession,
  parseThaiAnnualBudget,
  saveResolvedSlot,
  setPendingSlot,
  type PendingSlotResolution,
} from '../../memory/pendingSlotManager';
import { findHospitalRoomRate } from '../../reference/hospitalRoomRates';

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

function norm(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

function parseNumber(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return null;
  const amount = Number.parseInt(digits, 10);
  return Number.isFinite(amount) ? amount : null;
}

function isTopicChange(text: string): boolean {
  const n = norm(text);
  return n.includes('ลดหย่อน') ||
    n.includes('ภาษี') ||
    n.includes('good health prime') ||
    n.includes('opd') ||
    n.includes('ตรวจสุขภาพ') ||
    n.includes('วัคซีน') ||
    n.includes('มะเร็ง') ||
    n.includes('คุ้มครองอะไร') ||
    n.includes('คืออะไร');
}

function extractHospital(text: string): string | null {
  const raw = text.normalize('NFC').trim();
  const n = norm(raw);
  if (!raw) return null;
  if (n.includes('นนทเวช')) return 'นนทเวช';
  if (n.includes('เมดพาร์ค')) return 'เมดพาร์ค';
  if (n.includes('เกษมราษฎร์')) return raw.replace(/^(เข้าที่|ใช้|ไป|เข้า)\s*/i, '').trim();

  const hospitalMatch = raw.match(/(?:เข้าที่|ใช้|ไป|เข้า)?\s*(?:รพ\.?|โรงพยาบาล)\s*([ก-๙A-Za-z0-9 .-]{2,40})/i);
  const hospital = hospitalMatch?.[1]?.trim()
    .replace(/[?.!]+$/g, '')
    .replace(/\s+/g, ' ');
  if (!hospital || norm(hospital).includes('ไหน')) return null;
  return hospital;
}

function resolvePendingSlotValue(slot: string, message: string): PendingSlotResolution | null {
  const n = norm(message);

  if (slot === 'preferred_hospital') {
    const hospital = extractHospital(message);
    if (!hospital) return null;
    if (!findHospitalRoomRate(hospital) && message.length <= 2) return null;
    return { field: 'preferred_hospital', value: hospital };
  }

  if (slot === 'age') {
    const ageMatch = n.match(/^(\d{1,2})$/) ?? n.match(/^อายุ\s*(\d{1,2})$/) ?? n.match(/^(\d{1,2})\s*ปี$/);
    const age = parseNumber(ageMatch?.[1] ?? '');
    if (!age || age <= 0 || age >= 100) return null;
    return { field: 'age', value: String(age) };
  }

  if (slot === 'budget_annual') {
    if (n.includes('ค่าห้อง')) return null;
    const budget = parseThaiAnnualBudget(message);
    if (!budget || budget.min < 1000) return null;
    if (budget.max) {
      return {
        field: 'budget_annual_note',
        value: budget.display,
        fields: {
          budget_annual_min: String(budget.min),
          budget_annual_max: String(budget.max),
          budget_annual_note: budget.display,
        },
      };
    }
    return { field: 'budget_annual', value: String(budget.min) };
  }

  if (slot === 'desired_room_amount') {
    const room = parseNumber(message);
    if (!room || room < 1000 || room > 50000) return null;
    return { field: 'desired_room_amount', value: String(room) };
  }

  return null;
}

function resolvePendingSlotBeforeRuntime(userId: string, session: unknown, messageText: string): void {
  const pending = getPendingSlotFromSession(session);
  if (!pending || isTopicChange(messageText)) return;

  const resolution = resolvePendingSlotValue(pending.pendingSlot, messageText);
  if (!resolution) return;

  saveResolvedSlot(userId, session, pending.activeFlow, resolution);
  clearPendingSlot(userId, session, pending.activeFlow);
}

function updateGen1PendingSlot(userId: string, session: unknown, outputText: string): void {
  const nextPending = detectPendingSlotFromAssistantResponse(outputText);
  if (nextPending) {
    setPendingSlot(userId, session, nextPending);
    return;
  }

  const currentPending = getPendingSlotFromSession(session);
  if (currentPending) clearPendingSlot(userId, session, currentPending.activeFlow);
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
  resolvePendingSlotBeforeRuntime(input.userId, input.session, input.messageText);
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
