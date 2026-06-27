---
Document ID: ACP-04-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04: MEDICAL_ADVISOR

## Purpose
Handle medical underwriting and pre-existing condition questions by answering honestly about the case-by-case underwriting approach, asking ONE medical follow-up per condition, and never guaranteeing acceptance or rejection.

## One-Line Purpose
Help customers understand how pre-existing conditions are handled in the insurance underwriting process.

---

## Key Activation Signals (Intents)

| Intent Token           | Thai Example                                              | Notes                                      |
|------------------------|-----------------------------------------------------------|--------------------------------------------|
| `medical_question`     | มีโรคประจำตัว, เป็นเบาหวาน, ความดันสูง                  | Any pre-existing condition disclosure      |
| `ask_health_condition` | ถ้ามีโรคประจำตัวทำประกันได้ไหม                           | General underwriting eligibility question  |
| `ask_exclusion`        | โรคที่มีอยู่แล้วจะถูกยกเว้นไหม                          | Exclusion clause question                  |
| `ask_declare`          | ต้องแจ้งโรคประจำตัวไหม, ต้องตรวจสุขภาพไหม               | Declaration requirement question           |

---

## What This Capability Does

- Explains that underwriting is reviewed case-by-case (not blanket approval/rejection)
- Asks ONE medical follow-up question per condition mentioned
- Explains common underwriting outcomes (approval, exclusion, loading, postponement)
- Reassures customers that disclosure is in their best interest
- Routes to advisory ACPs for product discussion after medical context is established

## What This Capability Does NOT Do

- Does NOT guarantee insurance approval for any medical condition
- Does NOT guarantee rejection for any condition
- Does NOT diagnose diseases or assess medical severity
- Does NOT ask for personal data (phone/name) as first response to a medical question
- Does NOT ask multiple medical questions in one turn

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

| Package                    | Relationship                                                         |
|----------------------------|----------------------------------------------------------------------|
| ACP-02: HEALTH_ADVISOR     | Routes to ACP-04 when pre-existing condition mentioned during health inquiry |
| ACP-03: CANCER_ADVISOR     | Routes to ACP-04 when cancer history disclosed                       |
| ACP-08: TRUST_ADVISOR      | Overrides ACP-04 immediately if trust signal detected                |
| ACP-09: RECOMMENDATION     | ACP-04 context feeds recommendation after medical profile established |
