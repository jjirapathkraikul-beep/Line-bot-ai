# Memory Requirements — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `customer_profile.budget_range` | Customer Profile | Determine if budget is already known |
| `customer_profile.tax_filing` | Customer Profile | Determine if tax deduction framing is applicable |
| `trust_engine.concern_active` | Trust Engine | Block if trust concern active |
| `conversation_state.prior_product_discussed` | Conversation State | Context for what product triggered the objection |

---

## Optional Memory

| Field | Source | Usage |
|---|---|---|
| `customer_profile.age` | Customer Profile | Age affects premium levels; useful for budget guidance |
| `customer_profile.income_range` | Customer Profile | If captured, helps gauge realistic budget |
| `session_history.prior_price_objections` | Session Memory | If customer objected before, approach with more sensitivity |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `price_objection.stated_budget` | Number or String | Budget figure or range stated by customer |
| `price_objection.acknowledgment_given` | Boolean | Whether Step 1 (acknowledge) was completed |
| `price_objection.budget_discovered` | Boolean | Whether Step 2 (budget discovery) was completed |
| `price_objection.products_offered` | Array | Products offered within stated budget |
| `price_objection.tax_framing_used` | Boolean | Whether tax deduction framing was presented |
| `price_objection.resolution_approach` | Enum: PRODUCT_MATCH / HONEST_CLOSE / HANDOFF | How the objection was resolved |

---

## CRM Fields (Write on Exit)

| CRM Field | Value | Notes |
|---|---|---|
| `objection.price_objection_flag` | true | Flag for Jirawat |
| `objection.stated_budget` | From working memory | Key follow-up context |
| `objection.products_offered` | From working memory | What was shown at their budget |
| `objection.resolution_approach` | From working memory | How conversation concluded |

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Budget range | Once stated, do not re-ask in same session |
| Tax filing status | If known from prior context, do not ask again |
