# Memory Requirements — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-MEMORY-REQUIREMENTS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Required Memory (Must Read Before Responding)

| Field | Source | Purpose |
|---|---|---|
| `trust_engine.concern_active` | Trust Engine | Block or interrupt if trust concern is active |
| `conversation_state.active_capability` | Conversation State | Verify not in restricted context |
| `customer_profile.age` | Customer Profile | Personalize comparison (some products age-restricted) |
| `customer_profile.budget_range` | Customer Profile | Weight comparison toward affordable options |
| `conversation_state.need_discovery_results` | Conversation State | Use discovered needs to prioritize comparison dimensions |

---

## Optional Memory (Read If Available)

| Field | Source | Usage |
|---|---|---|
| `customer_profile.health_status` | Customer Profile | Some products differ significantly in underwriting; inform comparison |
| `customer_profile.has_dependents` | Customer Profile | Family-oriented products may rank higher in comparison |
| `customer_profile.tax_filing` | Customer Profile | Highlight tax-deductible products if customer is a tax filer |
| `session_history.prior_comparisons` | Session Memory | Avoid repeating the same comparison framing |
| `customer_profile.occupation` | Customer Profile | Some products have occupation exclusions |

---

## Working Memory (Maintained During Execution)

| Field | Type | Description |
|---|---|---|
| `comparison.products_in_scope` | Array of product IDs | Products being actively compared |
| `comparison.active_dimensions` | Array (max 3) | Dimensions currently being used in the comparison |
| `comparison.customer_priority` | String | What the customer has stated as their top priority |
| `comparison.rounds_completed` | Integer | Number of comparison rounds completed (trigger ACP-17 after 3) |
| `comparison.preference_signal` | String or NULL | If customer has expressed a preference toward one product |
| `comparison.price_objection_raised` | Boolean | Whether price concern was raised during comparison |

---

## Customer Profile Fields (Read-Only for ACP-12)

ACP-12 reads but does NOT write to the customer profile. Profile writes are handled by the calling or downstream capability.

| Field | Read Purpose |
|---|---|
| `age` | Age-appropriate product filtering |
| `budget_range` | Premium-appropriate filtering |
| `health_status` | Coverage scope filtering |
| `has_dependents` | Feature priority (rider availability, family coverage) |
| `tax_filing` | Tax-benefit dimension relevance |

---

## CRM Fields (Write on Exit)

| CRM Field | Value | Notes |
|---|---|---|
| `comparison.products_compared` | Array from `comparison.products_in_scope` | For Jirawat's context |
| `comparison.customer_priority` | From working memory | Key for Jirawat's follow-up |
| `comparison.preference_signal` | From working memory | Indicates which direction customer is leaning |
| `comparison.price_objection` | Boolean | Flag for Jirawat to be aware of |
| `comparison.session_id` | Conversation session ID | Traceability |

---

## Conversation Summary

At exit, ACP-12 writes a brief summary:

**Format**:
> "ลูกค้าเปรียบเทียบ [Product A] กับ [Product B] โดยให้ความสำคัญกับ [priority]. [ลูกค้าบอกว่าชอบ/ยังไม่ตัดสินใจ]. [มี/ไม่มี] ข้อกังวลเรื่องราคา."

---

## Never Ask Again Fields

| Field | Rule |
|---|---|
| Customer's stated comparison priority | If already expressed in this session, do not ask again |
| Products in scope | If customer named them, do not ask which products to compare |
| Budget range | If captured in ACP-10 or ACP-13, do not ask again during comparison |
