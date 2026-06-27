# Memory Requirements — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

These fields MUST be checked before ACP-11 begins any action:

| Field | Source | Purpose |
|---|---|---|
| `customer_profile.name` | Customer Profile Store | Skip name stage if already known |
| `customer_profile.phone` | Customer Profile Store | Skip phone stage if already known |
| `customer_profile.preferred_contact_time` | Customer Profile Store | Skip time stage if already known |
| `trust_engine.concern_active` | Trust Engine | Block activation if trust concern is active |
| `conversation_state.active_capability` | Conversation State | Verify not in restricted context (ACP-15/16) |
| `conversation_state.calling_capability` | Conversation State | Verify which capability called ACP-11 |
| `conversation_state.value_delivered` | Conversation State | Activation guard check |

---

## Optional Memory (Read If Available)

| Field | Source | Usage |
|---|---|---|
| `customer_profile.line_id` | Customer Profile Store | If available, can supplement contact record |
| `customer_profile.previous_lead_captured` | Customer Profile Store | Indicates if customer has been in CRM before |
| `conversation_state.customer_sentiment` | Sentiment Layer | Inform tone and pacing of requests |
| `session_history.prior_decline` | Session Memory | If customer declined in prior session, soften approach |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `lead_capture.stage` | Enum: NAME / PHONE / TIME / COMPLETE | Current stage in the 3-step sequence |
| `lead_capture.name_requested` | Boolean | Whether name has been requested this session |
| `lead_capture.phone_requested` | Boolean | Whether phone has been requested this session |
| `lead_capture.time_requested` | Boolean | Whether preferred time has been requested this session |
| `lead_capture.name_declined` | Boolean | Whether customer declined to share name |
| `lead_capture.phone_declined` | Boolean | Whether customer declined to share phone |
| `lead_capture.time_declined` | Boolean | Whether customer declined to share preferred time |
| `lead_capture.interrupted_at_stage` | Enum: NAME / PHONE / TIME / NULL | Stage at which an interrupt occurred |

---

## Customer Profile Fields

Fields that ACP-11 can populate in the customer profile:

| Field Name | Format | Notes |
|---|---|---|
| `name` | String (Thai or English) | First name or nickname accepted |
| `phone` | String (Thai mobile format) | 10-digit; accept as entered without forcing format |
| `preferred_contact_time` | String | Free text; e.g., "เช้า 9-11 โมง", "หลัง 5 โมงเย็น", "flexible" |

---

## CRM Fields (Write on Completion)

These fields are written to Jirawat's CRM when LEAD_CAPTURE completes:

| CRM Field | Source | Required |
|---|---|---|
| `lead.customer_name` | `customer_profile.name` | Optional |
| `lead.phone` | `customer_profile.phone` | Required for viable lead |
| `lead.preferred_contact_time` | `customer_profile.preferred_contact_time` | Optional |
| `lead.source_capability` | `conversation_state.calling_capability` | Required |
| `lead.capture_timestamp` | System timestamp | Required |
| `lead.session_id` | Conversation session ID | Required |
| `lead.lead_viable` | Boolean (true if phone captured) | Required |
| `lead.interest_topic` | Topic from calling capability | Required |
| `lead.conversation_summary` | Auto-generated summary | Required |

---

## Conversation Summary

At completion, ACP-11 generates a brief summary for Jirawat:

**Format**:
> "ลูกค้าชื่อ [name/ไม่ทราบชื่อ] สนใจเรื่อง [topic from calling capability] โทร [phone/ไม่มีเบอร์] สะดวกคุยช่วง [preferred_time/ยืดหยุ่น]"

---

## Known Facts

Once a field is captured, it is treated as a "known fact" and must never be re-asked:

| Known Fact | Never Re-ask Condition |
|---|---|
| Customer name | Once provided in this or any prior session |
| Phone number | Once provided in this or any prior session |
| Preferred time | Once provided (may update if customer offers new preference) |

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Name | If `customer_profile.name` is not NULL, skip the name stage entirely |
| Phone | If `customer_profile.phone` is not NULL, skip the phone stage entirely |
| Preferred time | If `customer_profile.preferred_contact_time` is not NULL, skip unless customer offers an update |
