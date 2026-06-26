# Google Sheet Integration
### LINE Chatbot Application — Google Sheet Delivery Layer
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

---

## Source of Truth Declaration

| Concern | Source of Truth |
|---|---|
| FAQ taxonomy, categories, answer quality policy | `AIOS/Domains/Insurance/Knowledge/FAQ.md` |
| Runtime FAQ content (actual Q&A entries) | **Google Sheet** — this integration layer |
| CRM lead field definitions | `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` |
| CRM Google Sheet column mapping | `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` |

This document owns: how the application fetches, caches, and uses Google Sheet data at runtime. It does not own the business meaning of that data.

---

## 1. Purpose

Document how Google Sheets are used as runtime data sources for the LINE Chatbot AI — specifically for FAQ content delivery and CRM lead storage via Apps Script.

---

## 2. Scope

This document covers:
- FAQ Sheet: URL configuration, fetch behavior, CSV format, and caching
- CRM Lead Sheet: write behavior via Apps Script (overview only)
- Access controls and refresh cadence

This document does not cover:
- FAQ answer content or quality policy (see `AIOS/Domains/Insurance/Knowledge/FAQ.md`)
- CRM column layout (see `CRM/CRM_Schema.md`)
- CRM sync protocol and retry behavior (see `Integrations/Lead_Synchronization.md`)

---

## 3. FAQ Sheet

### Purpose

The FAQ Google Sheet is the runtime content source for customer-facing FAQ responses. It stores the actual Q&A entries that the chatbot retrieves and uses to answer customer questions.

### Configuration

- Sheet URL is provided via environment variable: `SHEET_CSV_URL`
- The sheet is published as a CSV (Google Sheet → File → Share → Publish to web → Sheet → CSV)
- The application fetches the CSV via HTTP GET on each request, with an in-process 60-second cache

### CSV Column Format

Row 1 must be a header row. Columns must be:

| Column | Name | Description |
|---|---|---|
| A | `category` | FAQ category — must use values from `AIOS/Domains/Insurance/Knowledge/FAQ.md` taxonomy |
| B | `question` | Customer question text (Thai) |
| C | `answer` | Answer text (Thai) — must meet answer quality standards in `FAQ.md` |
| D | `keyword` | Comma-separated keywords for matching |
| E | `updated_at` | ISO date of last content update |

### Fetch Behavior (`lib/sheet.ts`)

- URL is read from `process.env.SHEET_CSV_URL`
- Response is parsed as CSV and converted to `FaqRow[]` (type defined in `types/faq.ts`)
- Cache TTL: 60 seconds (in-memory)
- On fetch failure: chatbot falls back to a default response; see `UX/Fallback_Strategy.md`
- FAQ content is injected into the OpenAI system prompt as XML context

### FAQ Source of Truth Rule

> The Google Sheet holds runtime content. Domain governance rules for categories and answer policy are defined in `AIOS/Domains/Insurance/Knowledge/FAQ.md`. Content editors updating the FAQ Sheet must consult `FAQ.md` for category taxonomy and answer quality standards before making changes.

---

## 4. CRM Lead Sheet

### Purpose

The CRM Lead Sheet stores lead records written by the chatbot after lead capture and at handoff. It is managed via a Google Apps Script endpoint.

### Configuration

- Apps Script URL is provided via environment variable: `LEAD_SHEET_CSV_URL` (despite the name, this is a POST endpoint, not a CSV)
- The application POSTs JSON to this endpoint to upsert lead records

### Relationship to CRM Docs

- Column layout: `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md`
- Field definitions: `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md`
- Sync protocol: `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md`
- Apps Script code: `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md`

---

## 5. Access Controls

| Sheet | Access Level | Who |
|---|---|---|
| FAQ Sheet | Read-only (published CSV) | Application (unauthenticated read) |
| CRM Lead Sheet | Write via Apps Script | Application (authenticated via Apps Script URL) |
| CRM Lead Sheet | Read | Advisor (direct Google Sheet access) |

---

## 6. Refresh Cadence

| Data | Refresh | Notes |
|---|---|---|
| FAQ content | Every 60s (cache TTL) | Immediate on cache expiry |
| CRM leads | Real-time (on each relevant webhook event) | No polling; event-driven writes |

---

## 7. Future Improvements

- Migrate FAQ content from Google Sheet to a structured knowledge base with version control (noted in `FAQ.md`)
- Add sheet health check endpoint for operational monitoring
- Add schema validation on FAQ CSV fetch to detect column format regressions

---

## Related Documents

- `AIOS/Domains/Insurance/Knowledge/FAQ.md` — FAQ governance and answer policy (source of truth for content standards)
- `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` — CRM column layout
- `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` — CRM sync protocol
- `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md` — Apps Script deployment

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Application Maintainers | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Added SoT declaration referencing FAQ.md; expanded FAQ fetch behavior, column format, and access control detail; clarified scope boundaries |
