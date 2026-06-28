// Conversation Audit Queue — Beta Release Sprint
// Every completed Gen1 turn is enqueued as an audit candidate (status: PENDING).
// Manual review only — no automatic AI auditing in beta.
// Persistence: Vercel log stream (in-memory for within-process access).

import type { ConversationLogEntry } from './conversationLogger';

export type AuditStatus = 'PENDING' | 'REVIEWED' | 'FIXED' | 'VERIFIED';

export interface AuditCandidate {
  conversationId: string;
  sessionId:      string;
  timestamp:      string;
  intent:         string;
  decision:       string;
  strategy:       string;
  fallbackUsed:   boolean;
  validatorPassed: boolean;
  questionCount:  number;
  latency:        number;
  status:         AuditStatus;
}

const _queue: AuditCandidate[] = [];

export function enqueueAudit(entry: ConversationLogEntry): AuditCandidate {
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
  _queue.push(candidate);
  console.log('[AUDIT_ENQUEUE]', JSON.stringify({
    conversationId: candidate.conversationId,
    sessionId:      candidate.sessionId,
    status:         'PENDING',
    fallbackUsed:   candidate.fallbackUsed,
    latency:        candidate.latency,
  }));
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
