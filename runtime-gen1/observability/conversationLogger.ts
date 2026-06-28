// Conversation Logger — Beta Release + KV Persistence Hotfix
// Emits [CONV_LOG] to console (always) and persists to Vercel KV (best-effort).
// KV failures are silently swallowed — customers are never affected by logging errors.

import { getKvClient } from './kvClient';

export const CONV_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface ConversationLogEntry {
  conversationId:          string;   // conv-{userId8}-{YYYY-MM-DD}
  sessionId:               string;   // unique per turn (contextTrace.auditId)
  timestamp:               string;
  runtimeVersion:          string;
  runtimeMode:             string;
  userId:                  string;   // masked: "Uabc1234***"
  userMessage:             string;   // first 60 chars
  assistantResponse:       string;   // first 150 chars
  latency:                 number;
  intent:                  string;
  capability:              string;
  decision:                string;
  strategy:                string;
  questionCount:           number;
  recommendationDelivered: boolean;
  educationDelivered:      boolean;
  leadCaptureStarted:      boolean;
  leadCaptureCompleted:    boolean;
  trustFlow:               boolean;
  medicalFlow:             boolean;
  formatterApplied:        boolean;
  validatorPassed:         boolean;
  fallbackUsed:            boolean;
  fallbackReason:          string | null;
  error:                   string | null;
  responseLength:          number;
}

export function buildConversationId(userId: string, timestamp: string): string {
  const masked = userId.substring(0, 8);
  const date   = timestamp.substring(0, 10);
  return `conv-${masked}-${date}`;
}

// Emits console log synchronously, then persists to KV asynchronously.
// Returns a Promise so callers in runtime.ts can await it for reliable Vercel writes.
export async function logConversationTurn(entry: ConversationLogEntry): Promise<void> {
  // Console emit is always sync-first — never depends on KV.
  console.log('[CONV_LOG]', JSON.stringify(entry));

  const date = entry.timestamp.substring(0, 10);
  try {
    const kv = getKvClient();
    await kv.set(`convlog:byId:${entry.conversationId}`, JSON.stringify(entry), { ex: CONV_TTL_SECONDS });
    await kv.lpush(`convlog:date:${date}`, entry.conversationId);
    await kv.expire(`convlog:date:${date}`, CONV_TTL_SECONDS);
    await kv.lpush('convlog:recent', entry.conversationId);
    await kv.expire('convlog:recent', CONV_TTL_SECONDS);
  } catch (err) {
    console.error('[CONV_LOG_PERSIST_ERROR]', String(err));
  }
}

// ─── Read helpers ─────────────────────────────────────────────────────────────
// Used by audit workflows and AI agents (Claude, ChatGPT, Codex) for review.

export async function getConversationById(conversationId: string): Promise<ConversationLogEntry | null> {
  try {
    const raw = await getKvClient().get(`convlog:byId:${conversationId}`);
    return raw ? (JSON.parse(raw) as ConversationLogEntry) : null;
  } catch (err) {
    console.error('[CONV_LOG_READ_ERROR]', String(err));
    return null;
  }
}

export async function getConversationIdsByDate(date: string): Promise<string[]> {
  try {
    return await getKvClient().lrange(`convlog:date:${date}`, 0, -1);
  } catch (err) {
    console.error('[CONV_LOG_READ_ERROR]', String(err));
    return [];
  }
}

export async function getRecentConversations(limit: number): Promise<ConversationLogEntry[]> {
  try {
    const kv  = getKvClient();
    const ids = await kv.lrange('convlog:recent', 0, limit - 1);
    const entries = await Promise.all(
      ids.map(async (id) => {
        const raw = await kv.get(`convlog:byId:${id}`);
        return raw ? (JSON.parse(raw) as ConversationLogEntry) : null;
      }),
    );
    return entries.filter((e): e is ConversationLogEntry => e !== null);
  } catch (err) {
    console.error('[CONV_LOG_READ_ERROR]', String(err));
    return [];
  }
}
