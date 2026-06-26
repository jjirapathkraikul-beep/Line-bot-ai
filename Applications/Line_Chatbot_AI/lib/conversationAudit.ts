// Conversation Audit — AIOS LINE Adapter v2
// Structured logging for every intent routing decision.
// Each audit event is one JSON line: [AUDIT] {...}
// Not stored to DB in V2 — log aggregation (Vercel/Datadog) can pick this up.

export interface AuditEvent {
  userId: string;           // masked userId (first 8 chars + ***)
  message: string;          // first 100 chars of customer message
  detected_intent: string;
  priority: string;         // A–H or state/fallback
  current_state_before: string;
  action_taken: string;
  current_state_after: string;
  lead_fields_known: string[];
  handoff_triggered: boolean;
  timestamp: string;        // ISO-8601
}

export function logAuditEvent(event: AuditEvent): void {
  console.log('[AUDIT]', JSON.stringify(event));
}
