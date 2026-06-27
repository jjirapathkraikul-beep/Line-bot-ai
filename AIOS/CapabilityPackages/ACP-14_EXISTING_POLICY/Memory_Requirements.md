# Memory Requirements — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `trust_engine.concern_active` | Trust Engine | Block if concern active |
| `conversation_state.need_discovery_results` | Conversation State | Customer's stated needs to compare against existing coverage |
| `customer_profile.existing_policies` | Customer Profile | Existing policy data if previously captured |
| `customer_profile.age` | Customer Profile | Age context for coverage assessment |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `customer_profile.health_status` | Customer Profile | Health context affects adequacy assessment |
| `customer_profile.has_dependents` | Customer Profile | Dependent coverage adequacy |
| `customer_profile.occupation` | Customer Profile | Occupational risk context |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `existing_policy.coverage_profile` | Object | What the customer describes having |
| `existing_policy.stated_needs` | Array | Customer's needs from this session or ACP-10 |
| `existing_policy.identified_gaps` | Array | Specific gaps identified with scenario examples |
| `existing_policy.sufficiency_assessment` | Enum: SUFFICIENT / GAP_FOUND / UNKNOWN | Overall assessment |
| `existing_policy.assessment_basis` | String | Brief description of what the assessment was based on |

---

## CRM Fields (Write on Exit)

| CRM Field | Value |
|---|---|
| `policy_review.coverage_profile` | Existing coverage described by customer |
| `policy_review.identified_gaps` | Specific gaps found |
| `policy_review.sufficiency_assessment` | SUFFICIENT / GAP_FOUND / UNKNOWN |
| `policy_review.recommended_action` | What was recommended (if anything) |

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Existing policy type | Once described in this session, do not ask again |
| Coverage amounts | Once stated, do not re-ask in same session |
