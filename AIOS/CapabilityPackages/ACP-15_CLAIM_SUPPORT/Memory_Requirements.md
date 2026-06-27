# Memory Requirements — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `trust_engine.concern_active` | Trust Engine | Block if trust concern active |
| `customer_profile.policy_type` | Customer Profile | Direct to relevant claim process if known |
| `conversation_state.active_capability` | Conversation State | Verify not in ACP-16 conflict |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `customer_profile.insurer` | Customer Profile | Direct to correct claim line if known |
| `customer_profile.hospital_network` | Customer Profile | Cashless network information if known |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `claim.support_active` | Boolean | Set to TRUE upon activation; blocks ACP-11 |
| `claim.lead_capture_blocked` | Boolean | Set to TRUE upon activation; enforced throughout session |
| `claim.type_identified` | Enum: CASHLESS / REIMBURSEMENT / OPD / LIFE_CI / UNKNOWN | Claim type for this session |
| `claim.steps_provided` | Boolean | Whether step-by-step guidance was given |
| `claim.escalated_to_jirawat` | Boolean | Whether ACP-17 was activated |

---

## CRM Fields (Write on Exit)

| CRM Field | Value | Notes |
|---|---|---|
| `support.claim_session` | true | Flag for Jirawat: customer had claim question |
| `support.claim_type` | From working memory | Context for Jirawat follow-up |
| `support.claim_session_id` | Conversation session ID | Traceability |

---

## LEAD CAPTURE LOCK

Upon ACP-15 activation:
- `lead_capture_blocked` MUST be set to `true`
- This flag MUST persist for the entire session
- ACP-11 MUST check this flag before activating
- No exceptions

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Policy type | Once identified, do not re-ask |
| Claim type | Once identified, do not re-ask |
