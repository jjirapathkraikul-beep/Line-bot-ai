# ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-11  
**Package Name**: LEAD_CAPTURE  
**One-Line Purpose**: Collect customer contact information for Jirawat's CRM after value has been delivered by another capability.

---

## What This Capability Does

LEAD_CAPTURE is a downstream capability — it is never triggered by a customer intent directly. It activates after another capability (e.g., ACP-02 through ACP-10) has delivered meaningful value and the customer has shown genuine interest. The capability collects exactly three fields in a strict sequential order:

1. Customer name (ชื่อ)
2. Phone number (เบอร์โทร)
3. Preferred contact time (เวลาที่สะดวก)

Each field is requested in a separate conversational turn. If the customer declines to share a field, the interaction gracefully continues without that data. The collected information is written to Jirawat's CRM for follow-up.

---

## What This Capability Does NOT Do

- Does NOT activate before value has been delivered
- Does NOT ask for email, LINE ID, address, or any field beyond the three defined above
- Does NOT re-ask a field the customer has already provided
- Does NOT collect data during a trust concern state
- Does NOT collect data during ACP-15 (Claim Support) or ACP-16 (Hospital Guidance)
- Does NOT pressure customers who decline to share contact information

---

## Key Activation Signals

This capability is activated programmatically by other capabilities, NOT by customer intent:

| Activating Capability | Activation Condition |
|---|---|
| ACP-02 through ACP-10 | Customer shows buying interest after value delivery |
| ACP-17 (HUMAN_HANDOFF) | Handoff requires contact info to schedule callback |
| ACP-19 (CLOSING) | Customer indicates readiness to proceed |

---

## File Index

| File | Purpose |
|---|---|
| README.md | This file — overview and quick reference |
| Capability.md | Full capability definition and schema |
| Knowledge_Map.md | Knowledge dependencies and dataset references |
| Conversation_Map.md | Entry/exit points and conversation flow |
| Decision_Rules.md | Activation, execution, and exit conditions |
| Memory_Requirements.md | Memory read/write requirements |
| Response_Profile.md | Tone, length, and language guidelines |
| Restrictions.md | Hard and soft prohibitions |
| Examples.md | Thai conversation examples (good and bad) |
| Regression.md | Test cases for validation |
| Future_Extensions.md | Planned improvements and integration opportunities |

---

## Cross-References

| Package | Relationship |
|---|---|
| ACP-17_HUMAN_HANDOFF | Shares lead collection fields; HANDOFF extends with scheduling |
| ACP-19_CLOSING | CLOSING triggers LEAD_CAPTURE if lead not yet captured |
| ACP-10_NEED_DISCOVERY | Often precedes LEAD_CAPTURE after need is confirmed |
| ACP-08_TRUST_ADVISOR | Trust concern from TRUST_ADVISOR pauses LEAD_CAPTURE |
| ACP-15_CLAIM_SUPPORT | CLAIM_SUPPORT explicitly prohibits LEAD_CAPTURE activation |
| ACP-16_HOSPITAL_GUIDANCE | HOSPITAL_GUIDANCE explicitly prohibits LEAD_CAPTURE activation |
