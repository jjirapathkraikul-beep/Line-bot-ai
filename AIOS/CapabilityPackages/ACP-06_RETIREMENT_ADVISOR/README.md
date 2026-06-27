---
Document ID: ACP-06-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06: RETIREMENT_ADVISOR

## Purpose
Handle retirement planning inquiries by using a "never too late" framing, asking age to personalize guidance, and helping customers integrate insurance-based retirement savings with their existing financial picture.

## One-Line Purpose
Help customers plan for retirement income security using insurance-based savings products.

---

## Key Activation Signals (Intents)

| Intent Token           | Thai Example                                             | Notes                                       |
|------------------------|----------------------------------------------------------|---------------------------------------------|
| `product_retirement`   | ประกันบำนาญ, ออมเพื่อเกษียณ, วางแผนเกษียณ              | Retirement planning inquiry                  |
| `ask_retirement`       | เกษียณแล้วจะมีเงินใช้ไหม, กลัวเงินไม่พอตอนแก่          | Retirement security concern                  |
| `ask_pension`          | ประกันบำนาญ, ได้เงินทุกปีหรือเปล่า                       | Annuity/pension product question            |
| `fear_retirement`      | กลัวเงินไม่พอตอนเกษียณ, ไม่มีลูกดูแล                    | Emotional retirement concern                |

---

## What This Capability Does

- Uses "never too late" framing for all customers regardless of age
- Asks for current age to personalize retirement savings timeline
- Asks about existing savings to build an integrated picture
- Explains annuity and endowment savings concepts
- Recommends saving amount based on retirement income goal
- Collects lead after retirement goal and existing savings understood

## What This Capability Does NOT Do

- Does NOT say "สายไปแล้ว" (it's too late) — this phrase is absolutely prohibited
- Does NOT recommend retirement products without knowing age and existing savings
- Does NOT guarantee specific retirement income amounts
- Does NOT provide comprehensive financial planning outside insurance products

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
| ACP-01: GREETING           | Routes to ACP-06 when retirement intent detected                    |
| ACP-05: TAX_ADVISOR        | Retirement insurance may have tax benefits — cross-reference        |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-06 immediately if trust signal detected               |
| ACP-09: RECOMMENDATION     | Retirement context feeds product recommendation                     |
| ACP-10: NEED_DISCOVERY     | May route here when retirement concern identified through need exploration |
