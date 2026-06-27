# Memory Requirements — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `customer_profile.policy_type` | Customer Profile | If known, direct to relevant network |
| `customer_profile.insurer` | Customer Profile | For Tokio Marine customers, provide specific guidance |

Note: ACP-16 does NOT block on trust_engine check before providing guidance. Emergency guidance is provided first, trust concerns addressed second.

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `customer_profile.hospital_network` | Customer Profile | If network is known, can confirm and provide specifics |
| `customer_profile.location` | Customer Profile | If known, can give geographically relevant hospital guidance |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `hospital.guidance_active` | Boolean | Set TRUE upon activation; persists for session |
| `hospital.lead_capture_blocked` | Boolean | Set TRUE upon activation; enforced throughout session |
| `hospital.emergency_protocol_given` | Boolean | Whether emergency protocol was communicated |
| `hospital.situation_type` | Enum: EMERGENCY / PLANNED / GENERAL_QUESTION | Context of the hospital guidance |
| `hospital.guidance_steps_provided` | Boolean | Whether step-by-step guidance was given |

---

## CRM Fields (Write on Exit)

| CRM Field | Value | Notes |
|---|---|---|
| `support.hospital_session` | true | Flag for Jirawat: customer in hospital situation |
| `support.hospital_situation_type` | From working memory | Emergency / Planned / General |
| `support.emergency_protocol_given` | Boolean | Verification that protocol was communicated |
| `support.session_id` | Conversation session ID | Traceability |

---

## LEAD CAPTURE LOCK

Same enforcement as ACP-15:
- `lead_capture_blocked` MUST be `true` for the entire session
- ACP-11 MUST check this flag and NOT activate if true
- No exceptions, even if other signals suggest commercial activity

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Policy type | If stated during hospital session, do not re-ask |
| Hospital name | If stated, do not ask again in same session |
