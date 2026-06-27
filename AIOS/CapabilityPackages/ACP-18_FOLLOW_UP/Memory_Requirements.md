# Memory Requirements — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `session_history.prior_sessions` | Session History | Core data for recognition and context reference |
| `customer_profile.name` | Customer Profile | Use in recognition greeting |
| `customer_profile.phone` | Customer Profile | Existing lead data; avoid re-asking |
| `trust_engine.concern_active` | Trust Engine | Block or interrupt if concern active |
| `session_history.last_topic` | Session History | Most relevant prior topic for acknowledgment |
| `session_history.last_interest_signal` | Session History | Prior interest expressed |
| `crm.lead_status` | CRM | Existing lead status; update if new info provided |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `session_history.objections_raised` | Session History | Be aware of prior objections; don't re-raise them |
| `session_history.capabilities_activated` | Session History | Know which topics were already covered |
| `customer_profile.preferred_contact_time` | Customer Profile | If known, can confirm in follow-up |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `follow_up.session_active` | Boolean | Set TRUE upon activation |
| `follow_up.high_value_signal_detected` | Boolean | Whether high-value signal was found in current message |
| `follow_up.routing_target` | Enum: ACP-19 / ACP-17 / CONTINUE / REDISCOVER | Where follow-up is routing |
| `follow_up.new_info_provided` | Boolean | Whether customer provided new contact info |

---

## CRM Fields (Write on Exit)

| CRM Field | Value |
|---|---|
| `follow_up.return_session_id` | Current session ID |
| `follow_up.high_value_signal` | Boolean; if detected |
| `follow_up.routing_target` | Where customer was routed |
| `follow_up.new_contact_info` | Any new info provided in this session |
| `lead.last_contact_timestamp` | Update to current timestamp |

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Name | Known from prior session; do NOT re-ask |
| Phone | Known from prior session; do NOT re-ask |
| Prior topics | Already discussed; do NOT re-explain |
| System introduction | Do NOT re-introduce system to returning customer |
