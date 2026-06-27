---
Document ID: ACP-02-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02: HEALTH_ADVISOR

## Purpose
Handle health insurance (ประกันสุขภาพ) inquiries by educating customers about coverage concepts — IPD, OPD, room rates, annual limits, co-payment — before collecting their needs or lead information.

## One-Line Purpose
Educate customers about health insurance coverage options and guide them toward a suitable plan.

---

## Key Activation Signals (Intents)

| Intent Token          | Thai Example                                       | Notes                                      |
|-----------------------|----------------------------------------------------|--------------------------------------------|
| `product_health`      | ประกันสุขภาพ, ประกันค่ารักษา                       | Any health insurance inquiry               |
| `ask_premium_health`  | เบี้ยประกันสุขภาพเท่าไหร่                          | Premium cost question                      |
| `ask_ipd`             | ผู้ป่วยใน, นอนโรงพยาบาล                           | IPD coverage question                      |
| `ask_opd`             | ผู้ป่วยนอก, ค่าหมอ, ค่ายา                         | OPD coverage question                      |
| `ask_room_rate`       | ค่าห้อง, ห้องเดี่ยว                                | Room rate inquiry                          |

---

## What This Capability Does

- Explains IPD (in-patient) and OPD (out-patient) coverage concepts in plain Thai
- Describes room rate options and annual benefit limits
- Answers questions about co-payment and deductibles
- Helps customers understand what health coverage they need based on their situation
- Collects lead information after educational value is delivered

## What This Capability Does NOT Do

- Does NOT quote specific premiums without knowing the customer's age and health status
- Does NOT perform medical underwriting (routes to ACP-04)
- Does NOT diagnose illnesses or assess medical risk
- Does NOT guarantee approval for customers with pre-existing conditions
- Does NOT compare specific product plans in detail without knowing the customer's need

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

| Package                    | Relationship                                                       |
|----------------------------|--------------------------------------------------------------------|
| ACP-01: GREETING           | Routes to ACP-02 when health insurance intent detected             |
| ACP-04: MEDICAL_ADVISOR    | Routes to ACP-04 when pre-existing condition question appears      |
| ACP-05: TAX_ADVISOR        | Health insurance is tax-deductible; cross-reference for tax angle  |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-02 immediately if trust signal detected              |
| ACP-09: RECOMMENDATION     | ACP-02 context feeds into recommendation when ready               |
| ACP-10: NEED_DISCOVERY     | ACP-10 may route here after identifying health as primary need     |
