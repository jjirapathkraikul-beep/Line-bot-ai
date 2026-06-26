# Human Handoff
### Insurance Domain — Domain-Level Handoff Rules
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## 1. Purpose

Define the domain-level rules governing when and why a conversation must be transferred to a human advisor, what advisor context is required at the point of handoff, and what constitutes a lead ready for human handling.

---

## 2. Scope

This document covers:
- Handoff trigger conditions (business rules only)
- Required advisor context at handoff
- Lead readiness criteria
- Advisor briefing requirements

This document does not cover:
- How any application delivers the handoff notification (Application concern)
- LINE-specific payload format (see `Applications/Line_Chatbot_AI/Conversation/Handoff_Payload.md`)
- CRM field mapping for handoff data (see `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md`)
- Notification delivery mechanism (see `Applications/Line_Chatbot_AI/Integrations/Notification.md`)

---

## 3. Inputs

- Lead profile (from `Lead/Lead_Data_Model.md`)
- Conversation readiness indicators
- Trust score (from `Trust/Trust_Engine.md`)
- Lead status (from `Lead/Lead_Status.md`)
- Escalation trigger signal (from `Human/Escalation_Rules.md`)

---

## 4. Outputs

- Confirmed handoff decision (binary: proceed / do not proceed)
- Required advisor context package (fields listed below)
- Lead status transition: current → `handoff`

---

## 5. Handoff Trigger Conditions

A handoff must occur when any of the following domain business conditions are met:

| Condition | Rule |
|---|---|
| Customer explicitly requests human contact | Customer says "ขอคุยกับเจ้าหน้าที่", "ต้องการติดต่อ", "ขอโทรกลับ" or equivalent |
| Lead reaches qualified status and requests pricing | Lead status is `qualified` and customer requests a specific quote or premium |
| High-trust buying signal detected | Trust score is above threshold AND `Buying_Signal.md` detects a close-ready signal |
| Complex underwriting case | Customer discloses health condition requiring manual underwriting assessment |
| Customer complaint or dissatisfaction | Negative sentiment or explicit complaint detected |
| Session limit reached | Customer has had more than the maximum defined AI-only turns without resolution |
| Advisor explicitly requested | Any explicit request, regardless of lead score or trust level |

---

## 6. Lead Readiness Criteria for Handoff

Before handoff is executed, the following minimum fields must be populated in the lead record:

| Field | Requirement | Source |
|---|---|---|
| `real_name` or `display_name` | At least one must be present | `Lead_Data_Model.md` |
| `phone` | Required for advisor contact | `Lead_Data_Model.md` |
| `interest_category` | Required to brief advisor | `Lead_Data_Model.md` |
| `conversation_summary` | Required context for advisor | `Lead_Data_Model.md` |
| `lead_status` | Must be set to `handoff` | `Lead_Status.md` |

If `phone` is missing, the handoff package must flag this for the advisor to collect on first contact.

---

## 7. Required Advisor Context

The following information must be available to the advisor at the time of handoff. Applications must deliver all available fields from this list:

| Context Item | Source Field | Purpose |
|---|---|---|
| Customer name | `real_name` or `display_name` | Address customer correctly |
| Contact number | `phone` | Call customer |
| Insurance interest | `interest_category`, `product_interest` | Know what to discuss |
| Budget | `budget_annual` | Know affordability range |
| Age and health | `age`, `health_status`, `cancer_status` | Underwriting context |
| Conversation summary | `conversation_summary` | Understand prior context |
| Last customer question | `last_question` | Continue where conversation left off |
| Lead score | `lead_score` | Understand priority level |
| Preferred contact time | `preferred_contact_time` | Schedule call appropriately |

---

## 8. Dependencies

- `AIOS/Domains/Insurance/Human/Escalation_Rules.md` — Detailed escalation trigger rules
- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Lead field definitions
- `AIOS/Domains/Insurance/Lead/Lead_Status.md` — Status transition to `handoff`
- `AIOS/Domains/Insurance/Trust/Trust_Engine.md` — Trust score inputs
- `AIOS/Domains/Insurance/Sales/Buying_Signal.md` — Buying signal detection

---

## 9. Future Improvements

- Two-way sync: advisor updates lead status after call, reflected in AI conversation context
- SLA: define maximum response time after handoff trigger
- Handoff quality scoring: measure advisor outcome per handoff

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Domain Lead | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Removed application payload and delivery concerns; retained only domain business rules, lead readiness criteria, and required advisor context; application payload moved to Handoff_Payload.md |
