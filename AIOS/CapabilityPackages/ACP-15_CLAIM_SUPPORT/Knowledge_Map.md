# Knowledge Map — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-15. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-15 |
|---|---|---|
| Claim Process | `AIOS/Domains/Insurance/Claim/` | Step-by-step claim procedures, required documents, cashless vs. reimbursement process, claim timelines |
| Insurance Products | `AIOS/Domains/Insurance/` | Policy type context (which claim type applies to which policy) |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | Common claim questions |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state; blocks if concern is active |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-14 | `AIOS/ConversationDataset/14_CLAIM.md` | Claim support conversation patterns, empathy scripts, step-by-step guidance examples, escalation patterns |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Policy type if known; directs to relevant claim process |
| Conversation State | `AIOS/Memory/ConversationState/` | Write: claim_support_active flag; claim_type_discussed |

---

## Data Flow

```
Claim question detected
         |
         v
ACP-15 CLAIM_SUPPORT
   |
   |-- reads --> AIOS/Domains/Insurance/Claim/ (claim process)
   |-- reads --> CustomerProfile (policy type if known)
   |-- reads --> Trust Engine (trust state check)
   |-- writes --> ConversationState (claim_support_active = true)
   |
   |-- blocks --> ACP-11 (Lead Capture — absolutely prohibited during claim)
   |
   v
Complex/disputed claim → ACP-17 (Jirawat)
Hospital in progress → ACP-16 (Hospital Guidance)
```

---

## Lead Capture Block

ACP-15 MUST set `conversation_state.lead_capture_blocked = true` upon activation. This flag prevents ACP-11 from being activated by any other signal during the claim support session.
