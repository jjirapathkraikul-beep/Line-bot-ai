# CRM Field Definition — LINE Chatbot Application
### Application CRM Field Mapping (Implementation Layer)
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

---

> **Boundary Notice:** This document describes application-level field mapping notes for the LINE Chatbot CRM implementation. It does NOT define the business meaning, type, or ownership of lead fields.
>
> The canonical source of truth for all field definitions is:
>
> `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md`
>
> Consult Lead_Data_Model.md for: field descriptions, data types, required/optional status, enum values, and ownership rules.

---

## Purpose

Document application-specific notes for each CRM field as implemented in the LINE Chatbot. This includes how each field is collected, which code module writes it, and any channel-specific constraints that differ from the domain definition.

---

## Scope

This document covers:
- Which `lib/` module is responsible for writing each field
- How each field is captured in the LINE conversation
- Application-specific formatting or constraints
- Fields that are system-generated vs user-provided

This document does not cover:
- Business meaning of fields (see `Lead_Data_Model.md`)
- Google Sheet column layout (see `CRM_Schema.md`)
- Sync protocol (see `Integrations/Lead_Synchronization.md`)

---

## Field Mapping Notes

| Field | Domain Reference | Captured By | Written By | How Collected | Notes |
|---|---|---|---|---|---|
| `line_user_id` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Extracted from LINE webhook event payload | Never collected from user |
| `channel` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Hardcoded to `LINE OA` for this application | Other channels would require separate app instances |
| `display_name` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Fetched from LINE profile API at first contact | May be Thai or English |
| `real_name` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Extracted during lead capture flow | Optional — only if user provides |
| `phone` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Extracted during lead capture flow | Validated for 10-digit Thai format |
| `age` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Extracted from user response | Stored as integer |
| `gender` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Quick reply selection | Enum: ชาย / หญิง / ไม่ระบุ |
| `occupation` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Free text from user | Not validated |
| `monthly_income` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Extracted from user response | Stored as integer (THB) |
| `tax_bracket` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Extracted from user response | Stored as string with % |
| `marital_status` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Quick reply selection | Enum per domain model |
| `children` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Numeric input from user | Stored as integer |
| `interest_category` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Rich menu action or free text | Mapped to domain enum |
| `product_interest` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Free text or product selection | May contain product names |
| `budget_annual` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | User-stated annual budget | Stored as integer (THB) |
| `health_status` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Quick reply selection | Enum per domain model |
| `cancer_status` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Quick reply selection | Enum per domain model |
| `tax_goal` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Free text or quick reply | Optional |
| `investment_goal` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Free text from user | Optional |
| `lead_score` | `Lead_Data_Model.md` | Computed | `lib/scorer.ts` | Computed using domain scoring rules | Algorithm defined in `Lead/Lead_Scoring.md` |
| `lead_status` | `Lead_Data_Model.md` | Computed | `lib/leadService.ts` | Updated based on conversation state and score | Valid values defined in `Lead/Lead_Status.md` |
| `follow_up_status` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Set at handoff trigger | Default: `pending` |
| `preferred_contact_time` | `Lead_Data_Model.md` | Conversation | `lib/leadCapture.ts` | Free text from user | Optional |
| `conversation_summary` | `Lead_Data_Model.md` | Generated | `lib/leadService.ts` | Generated at handoff or session close | AI-generated or template-based |
| `last_question` | `Lead_Data_Model.md` | System | `lib/session.ts` | Last message text stored in session | Passed to CRM at handoff |
| `source` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Hardcoded to `LINE OA` | May be extended for sub-campaigns |
| `first_contact_date` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Set once at record creation | ISO date string |
| `last_contact_date` | `Lead_Data_Model.md` | System | `lib/leadService.ts` | Updated on every CRM write | ISO date string |

---

## Related Documents

- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Canonical field definitions (source of truth)
- `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` — Google Sheet column mapping
- `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` — Sync protocol

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Application Maintainers | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Rewritten as application mapping only; all business definitions now reference Lead_Data_Model.md |
