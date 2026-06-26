# CRM Schema — LINE Chatbot Application
### Application-Level Google Sheet Implementation Mapping
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

---

> **Boundary Notice:** This document defines the Google Sheet column layout and Apps Script implementation mapping for the LINE Chatbot CRM. It does NOT define the business meaning of lead fields. The canonical lead data model — including field definitions, data types, and ownership rules — is maintained in:
>
> `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md`
>
> Any conflict between this document and Lead_Data_Model.md must be resolved in favor of Lead_Data_Model.md.

---

## Purpose

Define the implementation schema used by the LINE Chatbot to store lead data in Google Sheets via Apps Script. This includes column order, sheet structure, sync behavior, and application-specific implementation notes.

---

## Scope

This document covers:
- Google Sheet column layout for the CRM Lead Sheet
- Apps Script field mapping
- Sync behavior and idempotency rules
- Implementation-specific notes (column index, data formatting)

This document does not cover:
- Business meaning of lead fields (see `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md`)
- Lead lifecycle business rules (see `AIOS/Domains/Insurance/Lead/Lead_Status.md`)
- Lead scoring logic (see `AIOS/Domains/Insurance/Lead/Lead_Scoring.md`)
- Sync retry and backoff protocol (see `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md`)

---

## Google Sheet Column Layout

Columns appear in this order (row 1 = header):

| Column Index | Column Name | Domain Field Reference | Implementation Notes |
|---|---|---|---|
| A | `line_user_id` | `Lead_Data_Model.md` → `line_user_id` | Primary key. Used for upsert lookup in Apps Script. Never overwrite. |
| B | `display_name` | `Lead_Data_Model.md` → `display_name` | Set on first contact. May be updated if LINE profile changes. |
| C | `real_name` | `Lead_Data_Model.md` → `real_name` | Populated during lead capture conversation. |
| D | `phone` | `Lead_Data_Model.md` → `phone` | Collected during lead capture flow. |
| E | `age` | `Lead_Data_Model.md` → `age` | Integer. Stored as number in sheet. |
| F | `occupation` | `Lead_Data_Model.md` → `occupation` | Free text from conversation. |
| G | `monthly_income` | `Lead_Data_Model.md` → `monthly_income` | Integer (THB). Stored as number. |
| H | `tax_bracket` | `Lead_Data_Model.md` → `tax_bracket` | String, e.g. "20%". |
| I | `marital_status` | `Lead_Data_Model.md` → `marital_status` | Enum per domain model. |
| J | `children` | `Lead_Data_Model.md` → `children` | Integer. |
| K | `interest_category` | `Lead_Data_Model.md` → `interest_category` | Enum per domain model. |
| L | `budget_annual` | `Lead_Data_Model.md` → `budget_annual` | Integer (THB). |
| M | `product_interest` | `Lead_Data_Model.md` → `product_interest` | Free text, product name(s). |
| N | `lead_status` | `Lead_Data_Model.md` → `lead_status` | Enum per `Lead_Status.md`. |
| O | `follow_up_status` | `Lead_Data_Model.md` → `follow_up_status` | Enum per domain model. |
| P | `last_question` | `Lead_Data_Model.md` → `last_question` | Last customer question text. |
| Q | `conversation_summary` | `Lead_Data_Model.md` → `conversation_summary` | AI-generated summary. |
| R | `preferred_contact_time` | `Lead_Data_Model.md` → `preferred_contact_time` | Free text. |
| S | `source` | `Lead_Data_Model.md` → `source` | Defaults to `LINE OA`. |
| T | `first_contact_date` | `Lead_Data_Model.md` → `first_contact_date` | ISO date. Set once, never overwritten. |
| U | `last_contact_date` | `Lead_Data_Model.md` → `last_contact_date` | ISO date. Updated on every sync. |

---

## Apps Script Upsert Behavior

The Apps Script endpoint receives a JSON payload from the chatbot and performs an upsert based on `line_user_id`:

1. Read column A to find an existing row with the matching `line_user_id`.
2. If found: update only the fields present in the payload (partial update).
3. If not found: append a new row with all provided fields plus `first_contact_date = today`.
4. `first_contact_date` is never overwritten on update.
5. `last_contact_date` is always set to the current date on every write.

---

## Payload Format

The Apps Script endpoint expects a flat JSON object with field names matching the column names above. Example:

```json
{
  "line_user_id": "U1a2b3c4d5e6f",
  "display_name": "สมชาย",
  "real_name": "สมชาย วงษ์สุขใจ",
  "phone": "0812345678",
  "lead_status": "qualified",
  "conversation_summary": "สนใจประกันสุขภาพ งบ 2,500/เดือน",
  "last_contact_date": "2026-06-26"
}
```

---

## Implementation Notes

- Sheet must have exactly one header row at row 1.
- Column order must match the layout above for the Apps Script to function correctly.
- Do not insert or reorder columns without updating the Apps Script and this document simultaneously.
- FAQ data is stored in a separate sheet and accessed via a different URL. See `Applications/Line_Chatbot_AI/Integrations/Google_Sheet.md`.

---

## Related Documents

- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Canonical field definitions (source of truth)
- `Applications/Line_Chatbot_AI/CRM/CRM_Field_Definition.md` — Application field mapping notes
- `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` — Sync protocol
- `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md` — Apps Script deployment

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Application Maintainers | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Rewritten as implementation-only mapping; business definitions moved to Lead_Data_Model.md |
