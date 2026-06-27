# Knowledge Map — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-18. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage |
|---|---|---|
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check; blocks if concern active |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | May be referenced to continue prior discussion |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-17 | `AIOS/ConversationDataset/17_FOLLOW_UP.md` | Follow-up conversation patterns, warm re-engagement scripts, high-value signal handling |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | ALL fields — used for recognition and continuity |
| Session History | `AIOS/Memory/SessionHistory/` | Prior session summaries, topics discussed, interest signals |
| CRM | `AIOS/Memory/CRM/` | Prior lead data; update if new info provided |
| Conversation State | `AIOS/Memory/ConversationState/` | Write: follow_up_session_active flag |

---

## Data Flow

```
Returning customer message detected
         |
         v
ACP-18 FOLLOW_UP
   |
   |-- reads --> CustomerProfile (all fields for recognition)
   |-- reads --> SessionHistory (prior topics, signals)
   |-- reads --> CRM (existing lead data)
   |-- reads --> Trust Engine (trust state)
   |
   |-- detects --> High-value signal? YES → ACP-19 or ACP-17 immediately
   |-- detects --> High-value signal? NO → General follow-up flow
   |
   |-- writes --> CRM (update if new contact info)
   |-- writes --> ConversationState (follow_up_session_active = true)
```
