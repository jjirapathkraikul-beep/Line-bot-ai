# Knowledge Map — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-14. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-14 |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Coverage category definitions; gap identification framework |
| Medical Insurance | `AIOS/Domains/Insurance/Medical/` | Health coverage assessment criteria |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | Common coverage adequacy questions |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-13 | `AIOS/ConversationDataset/13_EXISTING_INSURANCE.md` | Conversation patterns for existing coverage review, gap identification dialogue, sufficiency acknowledgment scripts |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Age, health, dependents, existing policies if previously captured |
| Conversation State | `AIOS/Memory/ConversationState/` | Need discovery results; write existing_coverage_profile and gap_assessment |

---

## Data Flow

```
ACP-10 (Need Discovery) — optional prior context
         |
         v
ACP-14 EXISTING_POLICY
   |
   |-- reads --> CustomerProfile (existing policies, age, health, dependents)
   |-- reads --> AIOS/Domains/Insurance/ (coverage categories, gap framework)
   |-- reads --> ConversationState (need discovery results)
   |-- writes --> ConversationState (existing_coverage_profile, identified_gaps, sufficiency_assessment)
   |
   v
Gap found → ACP-09 Recommendation or ACP-11 Lead Capture
No gap → Honest close (no further sales action)
```
