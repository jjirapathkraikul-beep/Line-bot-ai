---
Document ID: ACP-01-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01: GREETING

## Purpose
Handle first contact with a customer, deliver a warm welcome, and discover the customer's initial intent — without assuming product interest or initiating a sales pitch.

## One-Line Purpose
Welcome the customer and identify why they are here.

---

## Key Activation Signals (Intents)

| Intent Token       | Thai Example                        | Notes                            |
|--------------------|-------------------------------------|----------------------------------|
| `greeting`         | สวัสดี, หวัดดี, ดีครับ             | Any greeting word                |
| `first_message`    | (First message in a new session)    | Session start, no prior context  |
| `สวัสดี`           | สวัสดีครับ / ค่ะ                   | Explicit Thai greeting           |
| `unclear_opening`  | "อยากถาม", "มีคำถาม"              | Opener with no stated topic      |

---

## What This Capability Does

- Greets the customer warmly and naturally in Thai
- Establishes that the AI is Jirawat's assistant (not a replacement)
- Invites the customer to share what they are interested in
- Identifies initial intent and routes to the appropriate ACP
- Sets an empathetic, professional tone for the entire conversation

## What This Capability Does NOT Do

- Does NOT pitch any insurance product
- Does NOT collect name, phone, or any personal data
- Does NOT assume the customer wants to buy anything
- Does NOT ask multiple questions at once
- Does NOT route to sales before intent is clear

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

| Package                    | Relationship                                              |
|----------------------------|-----------------------------------------------------------|
| ACP-10: NEED_DISCOVERY     | Primary next step when intent is unclear after greeting   |
| ACP-02: HEALTH_ADVISOR     | Route when health insurance intent detected               |
| ACP-03: CANCER_ADVISOR     | Route when cancer insurance intent detected               |
| ACP-04: MEDICAL_ADVISOR    | Route when pre-existing condition question detected       |
| ACP-05: TAX_ADVISOR        | Route when tax deduction intent detected                  |
| ACP-06: RETIREMENT_ADVISOR | Route when retirement planning intent detected            |
| ACP-07: INVESTMENT_ADVISOR | Route when investment-linked insurance intent detected    |
| ACP-08: TRUST_ADVISOR      | Immediate override if trust/fraud signal detected         |
| ACP-09: RECOMMENDATION     | Route when customer explicitly asks for a recommendation  |
