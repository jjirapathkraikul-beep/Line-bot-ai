# Knowledge Map — ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-19. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Post-commitment process (what documents are needed, underwriting steps) |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-18 | `AIOS/ConversationDataset/18_CLOSING.md` | Closing conversation patterns, affirmation scripts, next step communication, lead capture at closing |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Check if lead is already captured; use name in affirmation |
| Conversation State | `AIOS/Memory/ConversationState/` | Context of what product was discussed; what the customer decided on |
| CRM | `AIOS/Memory/CRM/` | Write closing event; update lead status to "closing" |

---

## Data Flow

```
Closing signal detected
         |
         v
ACP-19 CLOSING
   |
   |-- reads --> CustomerProfile (name, lead status, existing data)
   |-- reads --> ConversationState (product decided; prior discussion)
   |-- reads --> Trust Engine
   |
   |-- if lead not captured → embed ACP-11 logic (name → phone → time)
   |-- writes --> CRM (lead_status = CLOSING; closing_timestamp)
   |
   v
ACP-17 (Jirawat takes over for appointment/purchase processing)
```
