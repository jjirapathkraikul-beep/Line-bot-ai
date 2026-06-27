# Knowledge Map — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-11. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage |
|---|---|---|
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Determines whether trust concern is active; blocks lead capture if concern is flagged |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | General context for understanding customer questions that may arise during lead collection |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-16 | `AIOS/ConversationDataset/16_HUMAN_HANDOFF.md` | Contains conversation patterns for collecting contact information during handoff and lead capture scenarios |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile Store | `AIOS/Memory/CustomerProfile/` | Source of truth for already-captured customer fields (name, phone, preferred time) |
| CRM Write Layer | `AIOS/Memory/CRM/` | Destination for completed lead records |
| Conversation State | `AIOS/Memory/ConversationState/` | Tracks which field has been requested in the current lead capture sequence |

---

## Knowledge NOT Required by This Capability

The following knowledge domains are explicitly NOT needed by ACP-11, to prevent scope creep:

| Domain | Path | Reason Excluded |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Product knowledge is the domain of calling capabilities, not LEAD_CAPTURE |
| Medical Underwriting | `AIOS/Domains/Insurance/Medical/` | Not relevant to contact collection |
| Tax Rules | `AIOS/Domains/Insurance/Tax/` | Not relevant to contact collection |
| Claim Process | `AIOS/Domains/Insurance/Claim/` | Claim handling belongs to ACP-15 |

---

## Data Flow

```
Calling Capability
       |
       v
[Value Delivery Confirmation]
       |
       v
ACP-11 LEAD_CAPTURE
   |
   |-- reads --> CustomerProfile (existing fields to skip)
   |-- reads --> Trust_Engine (trust state check)
   |-- writes --> CRM (name, phone, preferred_contact_time)
   |-- writes --> ConversationState (capture_stage, lead_captured flag)
```

---

## Notes

- ACP-11 has no direct product or insurance domain knowledge dependency. It relies entirely on the calling capability to have already delivered the relevant domain knowledge to the customer.
- The Trust Engine is the only domain reference that can interrupt execution of this capability.
