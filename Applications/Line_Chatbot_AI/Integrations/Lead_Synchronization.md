# Lead Synchronization
### LINE Chatbot Application — CRM Sync Protocol
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

> **Location Note:** This file was relocated from `Applications/Line_Chatbot_AI/CRM/Lead_Synchronization.md` to `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` during the AIOS Boundary Cleanup Sprint (2026-06-26). Synchronization is an integration concern, not a CRM data model concern.

---

## 1. Purpose

Define the sync protocol used by the LINE Chatbot to write lead data to the Google Sheets CRM via Apps Script. This includes idempotency rules, write triggers, conflict resolution, and error handling behavior.

---

## 2. Scope

This document covers:
- When a CRM write is triggered
- Idempotency and upsert behavior
- Conflict resolution rules
- Retry and backoff strategy
- Sync failure behavior
- Monitoring and audit

This document does not cover:
- Lead field definitions (see `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md`)
- Google Sheet column layout (see `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md`)
- Apps Script code (see `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md`)

---

## 3. Write Triggers

A CRM sync is triggered on the following application events:

| Event | Fields Written | Notes |
|---|---|---|
| First customer message received | `line_user_id`, `display_name`, `channel`, `source`, `first_contact_date`, `lead_status=new` | Record creation only — does not overwrite existing records |
| Lead field captured in conversation | Captured field only + `last_contact_date` | Partial update |
| Handoff triggered | Full handoff payload (see `Conversation/Handoff_Payload.md`) | `lead_status=handoff` |
| Admin command `#reset` | `lead_status=new`, session cleared | Resets lead state for testing |

---

## 4. Idempotency and Upsert Rules

The Apps Script endpoint performs an upsert keyed on `line_user_id`:

1. Look up `line_user_id` in column A of the CRM sheet.
2. If a row exists: apply partial update — only fields present in the payload are written.
3. If no row exists: append a new row with all payload fields. Set `first_contact_date = today`.
4. `first_contact_date` is **never overwritten** after initial creation.
5. `last_contact_date` is **always updated** on every write, including partial updates.

These rules ensure that multiple webhook events for the same user do not create duplicate records.

---

## 5. Conflict Resolution

If two events occur close together and both trigger a write:

- The later write wins for all shared fields.
- `first_contact_date` is protected (never overwritten) regardless of write order.
- No locking mechanism is currently implemented — concurrent write conflicts are accepted as a known limitation for this implementation tier.

---

## 6. Retry and Backoff

Current behavior:
- Single attempt per event.
- On failure (network timeout, Apps Script error): the failure is logged but not retried automatically.
- The chatbot continues responding to the user regardless of CRM write success.

Future improvement:
- Implement retry with exponential backoff (max 3 attempts).
- Queue failed writes for replay on next webhook event from the same user.

---

## 7. Sync Failure Behavior

CRM sync failure must not:
- Block the chatbot response to the customer.
- Prevent the admin notification from being sent.
- Cause the session state to be cleared.

CRM sync failure must:
- Be logged with error details (event type, user ID, error message).
- Be surfaced in application monitoring.

---

## 8. Inputs

- Lead update event from `lib/leadService.ts`
- Constructed payload (subset of `Lead_Data_Model.md` fields)
- Apps Script endpoint URL from `process.env.LEAD_SHEET_CSV_URL`

---

## 9. Outputs

- Successful CRM upsert (HTTP 200 from Apps Script)
- Sync log entry
- Error log on failure

---

## 10. Dependencies

- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Field definitions
- `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` — Column layout
- `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md` — Apps Script endpoint
- `Applications/Line_Chatbot_AI/Integrations/Google_Sheet.md` — Sheet configuration

---

## 11. Future Improvements

- Retry queue with exponential backoff
- Dead-letter handling for permanently failed syncs
- Monitoring dashboard for sync success rate
- Schema validation before write to catch format errors early

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Created at Integrations/ (relocated from CRM/); added full sync protocol, idempotency rules, failure behavior, and retry notes |
