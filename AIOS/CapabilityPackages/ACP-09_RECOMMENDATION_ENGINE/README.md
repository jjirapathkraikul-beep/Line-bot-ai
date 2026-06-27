---
Document ID: ACP-09-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09: RECOMMENDATION_ENGINE

## Purpose
Deliver personalized product recommendations when a customer has sufficient context established. Requires: customer age + stated goal + at least one need context. Recommends a maximum of 2 products per response. Always explains WHY by citing the customer's own words.

## One-Line Purpose
Translate customer context into a specific, personalized, 1-2 product recommendation that cites the customer's own goals.

---

## Key Activation Signals (Intents)

| Intent Token              | Thai Example                                                  | Notes                                              |
|---------------------------|---------------------------------------------------------------|----------------------------------------------------|
| `ask_recommendation`      | แนะนำให้ทำแบบไหนดีครับ, ช่วยแนะนำประกันที่เหมาะกับผมหน่อย | Direct recommendation request                      |
| `ready_for_recommendation`| บอกได้เลยว่าเหมาะกับอะไร                                   | Customer signals they are ready for a suggestion   |
| `ask_what_to_buy`         | ควรซื้อแบบไหนดี                                              | Purchase decision question                          |
| `compare_products`        | ระหว่าง A กับ B เลือกอะไรดี                                   | Product comparison with recommendation ask          |

---

## What This Capability Does

- Synthesizes customer context from prior ACPs into a personalized recommendation
- Recommends a maximum of 2 products per response
- Always cites the customer's own words as the reason for the recommendation
- Collects lead AFTER recommendation is delivered
- Can recommend across multiple product categories if need warrants it

## What This Capability Does NOT Do

- Does NOT recommend without knowing age + goal + at least one contextual fact
- Does NOT recommend more than 2 products in one response
- Does NOT recommend based on "what's popular" without citing customer context
- Does NOT guarantee outcomes for any recommended product

---

## File Index

| File                    | Purpose                                             |
|-------------------------|-----------------------------------------------------|
| README.md               | This file — overview and quick reference            |
| Capability.md           | Full capability definition and schema               |
| Knowledge_Map.md        | Knowledge dependencies and dataset references       |
| Conversation_Map.md     | Entry/exit/interrupt/composition rules              |
| Decision_Rules.md       | Activation, execution, and fallback rules           |
| Memory_Requirements.md  | Memory fields, CRM outputs, known-field protection  |
| Response_Profile.md     | Tone, length, empathy, language guidance            |
| Restrictions.md         | Hard and soft prohibitions                          |
| Examples.md             | Thai conversation examples (good and bad)           |
| Regression.md           | Test cases for QA and regression validation         |
| Future_Extensions.md    | Planned improvements and integration opportunities  |

---

## Cross-References

| Package                    | Relationship                                                        |
|----------------------------|---------------------------------------------------------------------|
| ACP-02: HEALTH_ADVISOR     | Health context feeds health product recommendation                  |
| ACP-03: CANCER_ADVISOR     | Cancer concern feeds cancer product recommendation                  |
| ACP-05: TAX_ADVISOR        | Tax context feeds tax-efficient product recommendation              |
| ACP-06: RETIREMENT_ADVISOR | Retirement context feeds annuity/endowment recommendation           |
| ACP-07: INVESTMENT_ADVISOR | Risk profile feeds ILP or savings recommendation                    |
| ACP-08: TRUST_ADVISOR      | Trust must be resolved before any recommendation                    |
| ACP-10: NEED_DISCOVERY     | Need Discovery context is the primary feed for this capability      |
