# Analytics Engine

**Sprint**: Phase 10.9  
**Status**: PLANNING

## Purpose

Emits structured `AnalyticsEvent[]` after each turn. Connects to the Learning Layer by sending `ConversationAuditEvent` after every response.

## Responsibilities

- Emit events: INTENT_DETECTED, CAPABILITY_ACTIVATED, KNOWLEDGE_RESOLVED, DECISION_MADE, RESPONSE_COMPOSED, LEAD_UPDATED, TRUST_UPDATED, HANDOFF_TRIGGERED
- Write ConversationAuditEvent conforming to `AIOS/Learning/02_CONVERSATION_AUDIT.md`
- Never block response delivery (all analytics are async, post-response)
- Expand V1 `lib/conversationAudit.ts` (currently 21-line stub) with full schema

## Files to Create (Phase 10.9)

```
runtime-gen1/analytics/
├── analyticsEngine.ts      ← Main event emitter
├── auditEventSchema.ts     ← ConversationAuditEvent typed schema
└── auditWriter.ts          ← Write audit to KV / external store
```

## ConversationAuditEvent Schema (to implement)

```typescript
interface ConversationAuditEvent {
  audit_id: string
  session_id: string
  customer_id_masked: string   // never store raw customer_id
  timestamp: string
  turn_number: integer
  detected_intent: string
  selected_acp: string
  decision_action: string
  trust_signal_detected: boolean
  lead_capture_allowed: boolean
  fields_captured_this_turn: string[]
  handoff_triggered: boolean
  knowledge_sources_used: string[]
  response_length_words: integer
  validation_passed: boolean
  soft_failures: string[]
}
```

## Source Spec

- `AIOS/Learning/02_CONVERSATION_AUDIT.md`
- `AIOS/Execution/08_ANALYTICS_ENGINE.md`
- `AIOS/Execution/09_EXECUTION_CONTRACT.md` — AnalyticsInterface
