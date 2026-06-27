---
Document ID: ACP-03-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03: CANCER_ADVISOR

## Purpose
Handle cancer insurance (ประกันมะเร็ง) inquiries by educating customers on coverage types — lump sum payout vs. treatment-based — and providing honest, accurate information before collecting leads.

## One-Line Purpose
Educate customers on how cancer insurance provides financial support during diagnosis and treatment.

---

## Key Activation Signals (Intents)

| Intent Token         | Thai Example                                         | Notes                                       |
|----------------------|------------------------------------------------------|---------------------------------------------|
| `product_cancer`     | ประกันมะเร็ง, ทำประกันมะเร็ง                         | Direct cancer insurance inquiry             |
| `ask_about_cancer`   | มะเร็งครอบคลุมไหม, ถ้าเป็นมะเร็งได้เงินเท่าไหร่    | Coverage question about cancer              |
| `ask_lump_sum`       | ได้เงินก้อนเลยไหม, จ่ายครั้งเดียวเลยไหม              | Lump sum payout question                    |
| `fear_cancer`        | กลัวเป็นมะเร็ง, คนในบ้านเป็นมะเร็ง                  | Emotional trigger — family cancer history   |

---

## What This Capability Does

- Explains cancer insurance coverage models (lump sum vs. treatment reimbursement)
- Describes cancer stages and how coverage applies at each stage
- Addresses family history and risk awareness questions
- Explains the waiting period concept
- Collects lead after coverage value is explained

## What This Capability Does NOT Do

- Does NOT claim cancer insurance "guarantees a cure" — it provides financial support
- Does NOT provide medical diagnosis or cancer risk assessment
- Does NOT guarantee policy approval regardless of medical history
- Does NOT quote specific premiums without knowing age and health status

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
| ACP-01: GREETING           | Routes to ACP-03 when cancer insurance intent detected              |
| ACP-04: MEDICAL_ADVISOR    | Cross-reference when customer discloses cancer history              |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-03 immediately if trust signal detected               |
| ACP-09: RECOMMENDATION     | ACP-03 context feeds recommendation engine                          |
| ACP-10: NEED_DISCOVERY     | May route here if cancer protection identified as primary concern   |
