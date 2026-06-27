---
Document ID: ACP-10-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-10: NEED_DISCOVERY

## Purpose
Handle unstructured exploratory conversations with customers who do not know what insurance they need. Guide them through life stage → concern → budget → existing coverage → goal — one question per turn — before routing to the appropriate advisory ACP.

## One-Line Purpose
Help customers who don't know where to start discover their primary insurance need through guided, non-pressuring exploration.

---

## Key Activation Signals (Intents)

| Intent Token          | Thai Example                                                      | Notes                                       |
|-----------------------|-------------------------------------------------------------------|---------------------------------------------|
| `unclear_intent`      | ไม่รู้จะเริ่มยังไง, ไม่รู้ต้องทำอะไร                            | No stated product interest                   |
| `ask_general_advice`  | แนะนำหน่อยได้ไหม, ไม่รู้ควรทำประกันอะไรก่อน                     | Open-ended advice request                   |
| `ไม่รู้จะเริ่มยังไง`  | ไม่รู้จะเริ่มยังไงครับ                                           | Explicit "don't know where to start" signal |
| `general_inquiry`     | อยากทำประกัน แต่ไม่แน่ใจแบบไหน                                   | Product-unspecified insurance interest      |

---

## What This Capability Does

- Explores customer's life stage (young single / married / family / near retirement)
- Identifies primary concern (health / financial security / savings / legacy)
- Understands budget range
- Asks about existing coverage to avoid redundancy
- Articulates a clear primary need and routes to the correct advisory ACP

## What This Capability Does NOT Do

- Does NOT start with a product pitch — ever
- Does NOT ask about budget before understanding life stage and concern
- Does NOT capture leads during need discovery
- Does NOT route to ACP-09 RECOMMENDATION directly (advisory ACP first)
- Does NOT ask multiple questions in a single turn

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
| ACP-01: GREETING           | Routes to ACP-10 when customer intent is unclear after greeting     |
| ACP-02: HEALTH_ADVISOR     | Routes from ACP-10 when health need identified                      |
| ACP-03: CANCER_ADVISOR     | Routes from ACP-10 when cancer concern identified                   |
| ACP-05: TAX_ADVISOR        | Routes from ACP-10 when tax motivation identified                   |
| ACP-06: RETIREMENT_ADVISOR | Routes from ACP-10 when retirement concern identified               |
| ACP-07: INVESTMENT_ADVISOR | Routes from ACP-10 when investment growth need identified           |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-10 immediately if trust signal detected               |
| ACP-09: RECOMMENDATION     | ACP-10 feeds context to ACP-09 after advisory ACP completes         |
