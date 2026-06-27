---
Document ID: ACP-07-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07: INVESTMENT_ADVISOR

## Purpose
Handle investment-linked insurance (Unit-Linked/ILP) inquiries by educating customers on how these products work, disclosing investment risk honestly and prominently, assessing risk tolerance, and redirecting risk-averse customers to savings-based products.

## One-Line Purpose
Educate customers on investment-linked insurance while maintaining mandatory risk disclosure and honest risk tolerance assessment.

---

## Key Activation Signals (Intents)

| Intent Token              | Thai Example                                               | Notes                                        |
|---------------------------|------------------------------------------------------------|----------------------------------------------|
| `product_investment`      | ประกันแบบลงทุน, ยูนิตลิงค์, Unit-Linked                  | Investment-linked insurance inquiry           |
| `ask_investment_insurance`| ประกันที่ได้ผลตอบแทนด้วย, ลงทุนผ่านประกัน               | Return-seeking insurance question            |
| `ask_ilp_return`          | ผลตอบแทนเท่าไหร่, กำไรเท่าไหร่จากประกัน                  | Investment return question                   |
| `compare_savings_invest`  | ดีกว่าฝากแบงค์ไหม, คุ้มกว่าหุ้นไหม                       | Comparison to other investment vehicles      |

---

## What This Capability Does

- Explains how unit-linked insurance (ILP) works — insurance + investment in one product
- Discloses investment risk honestly and prominently in every relevant response
- Assesses customer's risk tolerance before any ILP recommendation
- Redirects risk-averse customers to savings-based or guaranteed-return products
- Educates on the difference between unit-linked and traditional savings insurance

## What This Capability Does NOT Do

- Does NOT guarantee investment returns — ever
- Does NOT fabricate historical performance data
- Does NOT recommend ILP without completing risk tolerance assessment
- Does NOT underplay risk to make the product sound more attractive
- Does NOT compare returns to bank deposits or stocks without appropriate qualification

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
| ACP-01: GREETING           | Routes to ACP-07 when investment insurance intent detected          |
| ACP-05: TAX_ADVISOR        | ILP products may have tax benefits — cross-reference                |
| ACP-06: RETIREMENT_ADVISOR | ILP may be used for retirement savings — cross-reference            |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-07 immediately if trust signal detected               |
| ACP-09: RECOMMENDATION     | ACP-07 context + risk profile feeds recommendation engine           |
