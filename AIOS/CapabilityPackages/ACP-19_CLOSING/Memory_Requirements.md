# Memory Requirements — ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `trust_engine.concern_active` | Trust Engine | Block or interrupt if concern active |
| `customer_profile.name` | Customer Profile | Use in affirmation; skip name capture if known |
| `customer_profile.phone` | Customer Profile | Skip phone capture if known |
| `customer_profile.preferred_contact_time` | Customer Profile | Skip time capture if known |
| `conversation_state.product_discussed` | Conversation State | What product the customer decided on |
| `crm.lead_status` | CRM | Whether lead is already captured |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `session_history.objections_resolved` | Session History | Confirm prior objections were addressed; do not re-open |
| `comparison.customer_preference` | Conversation State | Reference specific product they chose |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `closing.affirmation_given` | Boolean | Whether Step 1 was completed |
| `closing.next_steps_given` | Boolean | Whether Step 2 was completed |
| `closing.lead_capture_status` | Enum: NEEDED / IN_PROGRESS / COMPLETE | Status of embedded ACP-11 |
| `closing.confirmation_given` | Boolean | Whether final confirmation was given |
| `closing.product_committed_to` | String | Product the customer committed to |

---

## CRM Fields (Write on Exit)

| CRM Field | Value |
|---|---|
| `lead.status` | CLOSING |
| `lead.product_committed` | Product from working memory |
| `lead.closing_timestamp` | Current timestamp |
| `lead.closing_session_id` | Session ID |
| `lead.name` | From embedded ACP-11 or existing profile |
| `lead.phone` | From embedded ACP-11 or existing profile |
| `lead.preferred_contact_time` | From embedded ACP-11 or existing profile |

---

## Never Ask Again Fields

Same as ACP-11: never re-ask name, phone, or preferred time if already known.
