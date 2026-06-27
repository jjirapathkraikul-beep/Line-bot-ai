# Knowledge Map — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-17. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-17 |
|---|---|---|
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check; suspends if concern is active |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | May be referenced to briefly explain why Jirawat is the right next step |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-16 | `AIOS/ConversationDataset/16_HUMAN_HANDOFF.md` | Handoff conversation patterns, positive framing scripts, data collection sequence, CRM logging requirements |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Read: all available customer data to compile handoff summary |
| Conversation State | `AIOS/Memory/ConversationState/` | Read: complete conversation history, capability activations, topics discussed |
| CRM Write Layer | `AIOS/Memory/CRM/` | Write: full handoff record including conversation summary |

---

## Context Aggregation

ACP-17 is unique in that it reads from ALL prior capabilities' working memory to build a complete context package for Jirawat.

Context sources:
- ACP-10: Need discovery results
- ACP-12: Products compared; customer preference
- ACP-13: Budget/price objection if any
- ACP-14: Existing policy assessment
- ACP-15: Claim support context if any
- ACP-16: Hospital situation if any
- All others: Topic discussed, value delivered

---

## Data Flow

```
Activation (from any capability or direct request)
         |
         v
ACP-17 HUMAN_HANDOFF
   |
   |-- reads --> ALL ConversationState (full context)
   |-- reads --> CustomerProfile (all available fields)
   |-- reads --> Trust Engine (trust state)
   |-- collects --> name, phone, preferred_time (one per turn)
   |-- writes --> CRM (full handoff record + conversation summary)
   |
   v
Jirawat notified / callback scheduled
```
