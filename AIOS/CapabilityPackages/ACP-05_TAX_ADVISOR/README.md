---
Document ID: ACP-05-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05: TAX_ADVISOR

## Purpose
Handle tax deduction through insurance questions by educating customers about the life insurance (ประกันชีวิต, 100,000 THB limit) and health insurance (ประกันสุขภาพ, 25,000 THB limit) tax deduction rules, and personalizing guidance based on income range.

## One-Line Purpose
Help customers understand how insurance premiums reduce their taxable income under Thai tax law.

---

## Key Activation Signals (Intents)

| Intent Token           | Thai Example                                           | Notes                                       |
|------------------------|--------------------------------------------------------|---------------------------------------------|
| `product_tax`          | ลดหย่อนภาษี, ประกันลดหย่อน                            | Tax deduction inquiry                        |
| `ask_tax_deduction`    | ซื้อประกันลดหย่อนภาษีได้เท่าไหร่                      | Specific deduction amount question           |
| `ask_tax_insurance`    | ประกันชีวิตลดหย่อนได้ไหม, ประกันสุขภาพลดหย่อนได้ไหม   | Insurance type tax eligibility               |
| `year_end_planning`    | ปลายปีอยากซื้อประกันลดหย่อน                           | End-of-year tax planning trigger             |

---

## What This Capability Does

- Explains the 100,000 THB tax deduction limit for life insurance premiums
- Explains the 25,000 THB tax deduction limit for health insurance premiums
- Asks income range to personalize the estimated tax saving
- Identifies whether customer has used their deduction quota
- Guides toward the right insurance product for tax optimization

## What This Capability Does NOT Do

- Does NOT state a specific tax savings amount without knowing the customer's income bracket
- Does NOT provide formal tax filing advice (not a tax accountant)
- Does NOT calculate exact tax liability
- Does NOT recommend investment-linked products for tax purposes without risk disclosure

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
| ACP-01: GREETING           | Routes to ACP-05 when tax intent detected                           |
| ACP-02: HEALTH_ADVISOR     | Health insurance is tax-deductible; cross-reference for tax angle   |
| ACP-07: INVESTMENT_ADVISOR | Unit-linked products may have tax benefits; cross-reference         |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-05 immediately if trust signal detected               |
| ACP-09: RECOMMENDATION     | Tax context feeds product recommendation                            |
