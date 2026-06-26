# 08 — Analytics Engine
### AI Execution Engine — Observability and Measurement
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Chief AI System Architect

---

## Purpose

Define what the AIOS AI Execution Engine measures, what events it emits, and how those events enable operators to understand and improve AI performance. The Analytics Engine is the observability layer of the AEE — nothing happens silently.

---

## Scope

This document covers:
- Analytics design principles
- The full event taxonomy
- Event payload schemas
- Derived metrics (computed from events)
- Conversation scoring
- Drop-off and lost opportunity analysis
- Analytics output format

This document does not cover:
- How analytics data is stored or dashboarded — Application concern
- Application-level KPIs — see `Applications/Line_Chatbot_AI/Analytics/KPI.md`

---

## Analytics Design Principles

1. **Every action emits an event** — No decision, capability activation, knowledge resolution, or state change is unlogged.
2. **Events are immutable facts** — An analytics event records what happened. It is never modified after emission.
3. **Analytics never block** — All analytics operations are async and post-response. They never affect response latency.
4. **Derived metrics come from events** — Conversation score, lead score progression, drop-off risk — all are computed from events, not hardcoded.
5. **Analytics are channel-agnostic** — The same event schema applies regardless of whether the conversation happened on LINE, Facebook, or voice.

---

## Event Taxonomy

### Category 1 — Pipeline Events

Emitted once per execution turn, at the step that produces them.

| Event ID | Name | Emitted At | Description |
|---|---|---|---|
| `EVT-P01` | `INTENT_DETECTED` | Step 3 | Intent classification result |
| `EVT-P02` | `EMOTION_DETECTED` | Step 4 | Emotion classification result |
| `EVT-P03` | `GOAL_DETECTED` | Step 5 | Goal inference result |
| `EVT-P04` | `CAPABILITIES_SELECTED` | Step 6 | Which capabilities were activated |
| `EVT-P05` | `KNOWLEDGE_RESOLVED` | Step 7 | Which knowledge sources were used |
| `EVT-P06` | `DECISION_MADE` | Step 8 | Action taken and rationale |
| `EVT-P07` | `RESPONSE_COMPOSED` | Step 9 | Response type, tone, length |

### Category 2 — Lead Events

Emitted when the lead record changes.

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-L01` | `LEAD_FIELD_CAPTURED` | New field collected | Which field, its value, capture method |
| `EVT-L02` | `LEAD_SCORE_UPDATED` | Score changes | Old score, new score, delta, contributing signals |
| `EVT-L03` | `LEAD_STATUS_CHANGED` | Status transition | From state, to state, trigger |
| `EVT-L04` | `LEAD_QUALIFIED` | Status → `qualified` | Lead profile at qualification time |
| `EVT-L05` | `LEAD_HANDOFF_TRIGGERED` | Handoff fires | Handoff reason, advisor context summary |
| `EVT-L06` | `LEAD_LOST` | Status → `closed_lost` | Reason (if available) |

### Category 3 — Trust Events

Emitted by TrustEngine (CAP-002).

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-T01` | `TRUST_SCORE_UPDATED` | Trust state changes | Old score, new score, signal that triggered change |
| `EVT-T02` | `SCAM_CONCERN_DETECTED` | Scam intent or skepticism HIGH | Signal details |
| `EVT-T03` | `TRUST_ACTION_TAKEN` | TrustEngine produces output | Action type (REASSURE, VERIFY, etc.) |
| `EVT-T04` | `FRAUD_FLAG_SET` | Fraud signal detected | Signal details |

### Category 4 — Conversation Events

Emitted at conversation lifecycle moments.

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-C01` | `CONVERSATION_STARTED` | First turn in session | Session ID, customer ID, channel type, domain |
| `EVT-C02` | `CONVERSATION_TURN_COMPLETED` | Each turn | Turn number, intent, decision, response type |
| `EVT-C03` | `CONVERSATION_MODE_CHANGED` | Mode transitions | Old mode, new mode |
| `EVT-C04` | `OBJECTION_DETECTED` | Objection detected | Objection type |
| `EVT-C05` | `OBJECTION_RESOLVED` | Objection addressed | Type, resolution approach |
| `EVT-C06` | `CONVERSATION_ENDED` | Final turn | End reason (natural, timeout, handoff, explicit) |
| `EVT-C07` | `DROP_OFF_RISK_DETECTED` | Risk signals detected | Risk signals, turn number |
| `EVT-C08` | `LOST_OPPORTUNITY` | Conversation ends without handoff for qualified lead | Lead state at end, last intent |

### Category 5 — Capability Events

Emitted by the Capability Loader.

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-CAP01` | `CAPABILITY_ACTIVATED` | Capability selected | Capability ID, activation reason |
| `EVT-CAP02` | `CAPABILITY_FAILED` | Capability load/execution fails | Capability ID, error type |
| `EVT-CAP03` | `CAPABILITY_OUTPUT_OVERRIDDEN` | Higher-priority cap overrides | Overrider, overridden |

### Category 6 — Knowledge Events

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-K01` | `KNOWLEDGE_SOURCE_USED` | Source contributes to response | Source ID, relevance score |
| `EVT-K02` | `KNOWLEDGE_SOURCE_UNAVAILABLE` | Source cannot be loaded | Source ID, reason |
| `EVT-K03` | `KNOWLEDGE_CONFLICT_DETECTED` | Two sources contradict | Source IDs, topic |
| `EVT-K04` | `KNOWLEDGE_STALE` | Stale source used | Source ID, days since review |

### Category 7 — Memory Events

| Event ID | Name | Trigger | Description |
|---|---|---|---|
| `EVT-M01` | `MEMORY_WRITE_SUCCESS` | Layer write succeeds | Layer, fields written |
| `EVT-M02` | `MEMORY_WRITE_FAILED` | Layer write fails | Layer, error |
| `EVT-M03` | `MEMORY_READ_EMPTY` | Layer returns no data | Layer, fallback taken |
| `EVT-M04` | `CRM_SYNC_TRIGGERED` | CRM write queued | Trigger reason |

---

## Standard Event Payload

All events share this base structure:

```
AnalyticsEvent {
  event_id: string             // e.g., "EVT-L02"
  event_name: string           // human-readable name
  timestamp: ISO-8601
  session_id: string
  customer_id: string
  turn_number: integer
  domain: string               // e.g., "INSURANCE"
  channel_type: string         // e.g., "CHAT"
  payload: {
    // event-specific fields (see taxonomy above)
  }
}
```

---

## Derived Metrics

The following metrics are not raw events — they are computed from event streams.

### Conversation Score

A per-session quality score (0–100) computed from:

| Signal | Weight | Direction |
|---|---|---|
| `INTENT_DETECTED` confidence avg | 20% | Higher = better |
| `EMOTION_DETECTED` trajectory (IMPROVING vs DECLINING) | 15% | Improving = better |
| Objections addressed / objections detected ratio | 15% | Higher = better |
| Lead fields captured / Tier 1 fields total | 20% | Higher = better |
| Turns without `INTENT_UNKNOWN` / total turns | 15% | Higher = better |
| Session ended naturally (vs timeout/drop-off) | 15% | Natural = better |

Score range: 0 (worst) to 100 (perfect). A session scoring < 40 triggers a `LOW_CONVERSATION_SCORE` flag.

---

### Drop-off Risk Score

Computed during the session (not post-session) to enable real-time intervention:

| Signal | Risk Contribution |
|---|---|
| 3+ consecutive `INTENT_UNKNOWN` | HIGH |
| `EMOTION_TRAJECTORY = DECLINING` for 2+ turns | HIGH |
| Customer declined Tier 1 field twice | MEDIUM |
| Session turn count > 8 with no progress | MEDIUM |
| `EMOTION_FRUSTRATED` detected | HIGH |
| Long response time from customer (inferred from timestamp gap) | LOW |

Drop-off risk levels: NONE | LOW | MEDIUM | HIGH. HIGH triggers `EVT-C07` and may activate HandoffEngine.

---

### Lost Opportunity Analysis

`EVT-C08` is emitted when:
- Conversation ends (timeout or explicit goodbye)
- Lead status was `qualified` or better at end
- No handoff was triggered

Lost opportunity payload includes:
- `lead_score_at_end` — what the score was
- `missing_fields[]` — which Tier 1 fields were not collected
- `last_intent` — what the customer's last intent was
- `objections_unresolved[]` — any objections that were detected but not addressed
- `potential_product` — which product might have been recommended based on profile

---

### Intent Distribution

Computed from `EVT-P01` events across sessions:

- Most frequent intents per domain
- Intent mix per channel
- Intent sequences that lead to handoff (successful)
- Intent sequences that lead to drop-off

---

### Capability Usage

Computed from `EVT-CAP01` events:

- Activation frequency per capability
- Capability combinations that correlate with qualified leads
- Capability failure rate

---

### Knowledge Effectiveness

Computed from `EVT-K01` + outcome events:

- Which knowledge sources are used most frequently
- Which sources correlate with positive outcomes (handoff, qualification)
- Staleness rate (how often stale knowledge is used)
- Unresolved topics (detected intent with no knowledge source)

---

## Analytics Output

Analytics events are normalized output from the AEE. The Application Adapter routes them to the appropriate analytics store (log, database, monitoring service).

```
AnalyticsOutput {
  events: AnalyticsEvent[]     // all events for this turn
  conversation_score_update?: float  // updated score if changed
  drop_off_risk?: DropOffRisk  // current risk level if elevated
  lost_opportunity?: LostOpportunity  // if applicable this turn
}
```

---

## Analytics Failure Handling

| Failure | Behavior |
|---|---|
| Analytics event write fails | Log locally; do not retry synchronously |
| Derived metric computation fails | Log error; use last-known score |
| Analytics store unavailable | Buffer events in memory; flush on recovery |

Analytics failure must never block response delivery.

---

## Dependencies

- `02_EXECUTION_PIPELINE.md` — Step 11 invokes the Analytics Engine
- `09_EXECUTION_CONTRACT.md` — AnalyticsInterface definition
- `Applications/Line_Chatbot_AI/Analytics/KPI.md` — Application-level KPIs that consume these events

---

## Future Extensions

- A/B test event tracking: `EVT-EXP01` for experiment assignment and outcome
- Advisor feedback loop: events from advisor post-handoff outcome (won/lost/re-nurture)
- Sentiment trend: cross-session emotional trajectory per customer
- Cohort analysis: group customers by interest, engagement level, and outcome

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief AI System Architect | Initial creation — 7 event categories, 38 events, derived metrics, output schema |
