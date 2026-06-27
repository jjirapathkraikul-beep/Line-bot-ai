# Memory Requirements — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `trust_engine.concern_active` | Trust Engine | Suspend if concern active |
| `customer_profile.*` | Customer Profile | All available fields for CRM summary |
| `conversation_state.*` | Conversation State | Full session context for CRM log |
| `customer_profile.name` | Customer Profile | Skip name stage if known |
| `customer_profile.phone` | Customer Profile | Skip phone stage if known |
| `customer_profile.preferred_contact_time` | Customer Profile | Skip time stage if known |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `session_history.prior_sessions` | Session Memory | Reference prior conversations in Jirawat's briefing |
| `comparison.products_compared` | Conversation State | Include in Jirawat's context |
| `price_objection.stated_budget` | Conversation State | Include in Jirawat's context |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `handoff.type` | Enum: IMMEDIATE / WARM / SCHEDULED | Handoff type |
| `handoff.stage` | Enum: FRAMING / NAME / PHONE / TIME / CRM_LOG / COMPLETE | Current stage |
| `handoff.framing_given` | Boolean | Whether positive framing was delivered |
| `handoff.name_collected` | Boolean | |
| `handoff.phone_collected` | Boolean | |
| `handoff.time_collected` | Boolean | |
| `handoff.crm_logged` | Boolean | Whether context was logged to CRM |
| `handoff.urgent_flag` | Boolean | For IMMEDIATE handoffs |

---

## CRM Fields (Write on Exit — MANDATORY)

| CRM Field | Value |
|---|---|
| `handoff.customer_name` | Customer's name (if provided) |
| `handoff.phone` | Customer's phone (if provided) |
| `handoff.preferred_contact_time` | Preferred time (if provided) |
| `handoff.type` | IMMEDIATE / WARM / SCHEDULED |
| `handoff.urgent_flag` | Boolean |
| `handoff.topics_discussed` | Array of topics from this session |
| `handoff.capabilities_activated` | Array of ACP IDs from this session |
| `handoff.customer_interest_signals` | What the customer expressed interest in |
| `handoff.objections_raised` | Price, trust, or other objections |
| `handoff.recommended_next_action` | AI's recommendation for Jirawat |
| `handoff.conversation_summary` | Auto-generated summary for Jirawat |
| `handoff.session_id` | Conversation session ID |
| `handoff.timestamp` | Completion timestamp |

---

## Conversation Summary Template for Jirawat

> "ลูกค้าชื่อ [ชื่อ] โทร [เบอร์] สะดวกช่วง [เวลา]  
> คุยเรื่อง [topics]. [สนใจ/กังวล/ถามเรื่อง] [key interest/objection].  
> แนะนำให้คุณจิรวัฒน์ [recommended action]."

---

## Never Ask Again Fields

Same rules as ACP-11: name, phone, preferred time — skip if already known.
