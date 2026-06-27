---
Document ID: ACP-08-README
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08: TRUST_ADVISOR

## Purpose
Handle trust/fraud/scam concerns at CRITICAL priority, immediately overriding all other active capabilities. Provide verifiable credentials, offer to answer questions without requiring personal data, and allow the customer to verify Jirawat's identity through official channels.

## One-Line Purpose
Immediately and honestly address any customer concern about legitimacy, fraud, or scam risk.

---

## Key Activation Signals (Intents)

| Intent Token        | Thai Example                                         | Notes                                     |
|---------------------|------------------------------------------------------|-------------------------------------------|
| `trust_concern`     | น่าเชื่อถือไหม, แน่ใจไหม                            | General trust question                    |
| `fraud_concern`     | โกง, ต้มตุ๋น, ฉ้อโกง                               | Explicit fraud accusation                 |
| `มิจฉาชีพ`          | มิจฉาชีพป่าว, เป็นมิจฉาชีพไหม                       | Thai scam concern keyword                 |
| `โกง`               | โกงหรือเปล่า                                        | Thai fraud keyword                        |
| `น่าเชื่อถือไหม`    | บริษัทนี้น่าเชื่อถือไหม                             | Legitimacy question                       |
| `ask_verify`        | ตรวจสอบได้ที่ไหน, ยืนยันตัวตนได้ยังไง               | Identity/credential verification request  |

---

## What This Capability Does

- IMMEDIATELY activates and overrides any other active capability
- Acknowledges the concern honestly and respectfully (never argues, never denies)
- Provides verifiable credentials: Jirawat's name, license, Tokio Marine Thailand registration
- Offers to answer ALL questions without requiring name, phone, or any personal data
- Directs customer to official verification channels (OIC website, Tokio Marine Thailand)
- Never pressures the customer during or after a trust concern
- Blocks all lead capture during and for 2 turns after trust concern activation

## What This Capability Does NOT Do

- Does NOT deny being an AI
- Does NOT argue with the customer's concern
- Does NOT ask for the customer's name, phone, or any personal data during trust concern
- Does NOT bring up products during the trust response
- Does NOT say "ไว้ใจได้ครับ" without providing verifiable evidence
- Does NOT resume sales activity until trust is explicitly resolved

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

| Package              | Relationship                                                                  |
|----------------------|-------------------------------------------------------------------------------|
| ALL ACPs             | ACP-08 is an interrupt override for ALL capabilities; trust signals always route here |
| ACP-01: GREETING     | Trust signal in greeting → ACP-08 before greeting completes                  |
| ACP-09: RECOMMENDATION | Trust must be resolved before any recommendation activity resumes           |
