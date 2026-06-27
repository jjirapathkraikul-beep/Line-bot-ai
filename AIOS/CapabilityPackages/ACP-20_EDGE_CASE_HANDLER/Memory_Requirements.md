# Memory Requirements — ACP-20: EDGE_CASE_HANDLER

| Field | Value |
|---|---|
| Document ID | ACP-20-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Used By EC |
|---|---|---|
| `customer_profile.age` | Customer Profile | EC-09 (minor detection) |
| `customer_profile.existing_policies` | Customer Profile | EC-02, EC-03 (existing coverage context) |
| `trust_engine.concern_active` | Trust Engine | All ECs; trust concern overrides |
| `conversation_state.interrupted_capability` | Conversation State | Know what was interrupted for potential resume |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `customer_profile.financial_status` | Customer Profile | EC-03 if previously captured |
| `session_history.prior_ec_events` | Session History | Know if customer has prior EC history in this or prior sessions |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `ec.active_type` | Enum: EC-01 through EC-10 | Current edge case type being handled |
| `ec.interrupted_capability` | String | Which capability was interrupted |
| `ec.commercial_suspended` | Boolean | Whether commercial activity is suspended |
| `ec.de_escalation_complete` | Boolean | EC-07: whether anger was resolved |
| `ec.honest_disclosure_given` | Boolean | EC-08: whether honest return disclosure was given |
| `ec.guardian_explained` | Boolean | EC-09: whether guardian requirement was explained |
| `ec.correction_given` | Boolean | EC-10: whether gentle correction was provided |

---

## CRM Fields (Write on Exit)

| CRM Field | Value | Notes |
|---|---|---|
| `edge_case.type` | EC type | For Jirawat awareness |
| `edge_case.resolved` | Boolean | Whether the EC was handled to resolution |
| `edge_case.commercial_impact` | Boolean | Whether commercial activity was suspended |
| `edge_case.session_id` | Session ID | Traceability |

### EC-01 Special Logging

For EC-01 (self-harm), a special flag must be logged:
- `crisis.self_harm_signal_detected = true`
- `crisis.resources_provided = true`
- This flag is for Jirawat's awareness and is flagged as HIGH SENSITIVITY

---

## Lead Capture Lock (EC-Specific)

| EC | Lead Capture Status |
|---|---|
| EC-01 | ABSOLUTELY PROHIBITED for entire session |
| EC-02 | PROHIBITED unless customer explicitly asks for Jirawat support |
| EC-03 | PROHIBITED for new product sales |
| EC-07 | SUSPENDED until de-escalation complete |
| All others | Standard rules apply after EC handling |

---

## Never Ask Again Fields

For EC-07 (angry customer): Never ask commercial data collection questions while frustration is unresolved.
For EC-01: Never ask any data collection questions at any point in same session.
