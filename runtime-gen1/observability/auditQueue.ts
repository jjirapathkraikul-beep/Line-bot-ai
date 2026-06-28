// Conversation Audit Queue — Beta Release + KV Persistence Hotfix
// In-memory queue (sync) + Vercel KV persistence (async, best-effort).
// KV failures are silently swallowed — customers are never affected.

import { getKvClient } from './kvClient';
import type { ConversationLogEntry } from './conversationLogger';

export const AUDIT_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type AuditStatus = 'PENDING' | 'REVIEWED' | 'FIXED' | 'VERIFIED';

export interface AuditCandidate {
  conversationId:  string;
  sessionId:       string;
  timestamp:       string;
  intent:          string;
  decision:        string;
  strategy:        string;
  fallbackUsed:    boolean;
  validatorPassed: boolean;
  questionCount:   number;
  latency:         number;
  status:          AuditStatus;
}

const _queue: AuditCandidate[] = [];

// In-memory push is sync (before any await) so existing tests that don't
// await this function still see the queue update immediately.
export async function enqueueAudit(entry: ConversationLogEntry): Promise<AuditCandidate> {
  const candidate: AuditCandidate = {
    conversationId:  entry.conversationId,
    sessionId:       entry.sessionId,
    timestamp:       entry.timestamp,
    intent:          entry.intent,
    decision:        entry.decision,
    strategy:        entry.strategy,
    fallbackUsed:    entry.fallbackUsed,
    validatorPassed: entry.validatorPassed,
    questionCount:   entry.questionCount,
    latency:         entry.latency,
    status:          'PENDING',
  };
  _queue.push(candidate); // sync — callers that don't await still see this
  console.log('[AUDIT_ENQUEUE]', JSON.stringify({
    conversationId: candidate.conversationId,
    sessionId:      candidate.sessionId,
    status:         'PENDING',
    fallbackUsed:   candidate.fallbackUsed,
    latency:        candidate.latency,
  }));

  try {
    const kv = getKvClient();
    await kv.set(`audit:byId:${candidate.sessionId}`, JSON.stringify(candidate), { ex: AUDIT_TTL_SECONDS });
    await kv.lpush('audit:status:PENDING', candidate.sessionId);
    await kv.expire('audit:status:PENDING', AUDIT_TTL_SECONDS);
  } catch (err) {
    console.error('[AUDIT_PERSIST_ERROR]', String(err));
  }

  return candidate;
}

export function getAuditQueue(): ReadonlyArray<AuditCandidate> {
  return _queue;
}

export function updateAuditStatus(conversationId: string, status: AuditStatus): boolean {
  const candidate = _queue.find((c) => c.conversationId === conversationId);
  if (!candidate) return false;
  candidate.status = status;
  console.log('[AUDIT_UPDATE]', JSON.stringify({ conversationId, status }));
  return true;
}

export function clearAuditQueue(): void {
  _queue.length = 0;
}

// ─── Read helpers ─────────────────────────────────────────────────────────────
// Used by audit workflows and AI agents for review (auditId = sessionId).

export async function getAuditById(auditId: string): Promise<AuditCandidate | null> {
  try {
    const raw = await getKvClient().get(`audit:byId:${auditId}`);
    return raw ? (JSON.parse(raw) as AuditCandidate) : null;
  } catch (err) {
    console.error('[AUDIT_READ_ERROR]', String(err));
    return null;
  }
}

export async function getPendingAuditCandidates(limit: number): Promise<AuditCandidate[]> {
  try {
    const kv         = getKvClient();
    const sessionIds = await kv.lrange('audit:status:PENDING', 0, limit - 1);
    const candidates = await Promise.all(
      sessionIds.map(async (id) => {
        const raw = await kv.get(`audit:byId:${id}`);
        return raw ? (JSON.parse(raw) as AuditCandidate) : null;
      }),
    );
    return candidates.filter((c): c is AuditCandidate => c !== null);
  } catch (err) {
    console.error('[AUDIT_READ_ERROR]', String(err));
    return [];
  }
}

// Marks an audit record as REVIEWED in KV (used by LearningProcessor after processing).
// Does not modify in-memory _queue — processor runs asynchronously, possibly cross-invocation.
export async function markAuditProcessedInKv(sessionId: string): Promise<void> {
  try {
    const kv  = getKvClient();
    const raw = await kv.get(`audit:byId:${sessionId}`);
    if (!raw) return;
    const candidate: AuditCandidate = { ...JSON.parse(raw) as AuditCandidate, status: 'REVIEWED' };
    await kv.set(`audit:byId:${sessionId}`, JSON.stringify(candidate), { ex: AUDIT_TTL_SECONDS });
  } catch (err) {
    console.error('[AUDIT_MARK_PROCESSED_ERROR]', String(err));
  }
}
