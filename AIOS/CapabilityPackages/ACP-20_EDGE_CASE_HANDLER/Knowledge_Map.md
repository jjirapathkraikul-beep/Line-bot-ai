# Knowledge Map — ACP-20: EDGE_CASE_HANDLER

| Field | Value |
|---|---|
| Document ID | ACP-20-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-20. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-20 |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | EC-02 (terminal illness), EC-03 (financial crisis), EC-08 (returns), EC-09 (minors) — existing policy options |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | EC-10 (misinformation correction) |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check; EC-04 (competitor comparison) also involves trust layer |

---

## External References (Crisis Resources)

| Resource | Source | Usage |
|---|---|---|
| Samaritans Thailand | Public resource — 02-713-6793 | EC-01: Self-harm crisis resource |
| Department of Mental Health Thailand | Public resource | EC-01: Mental health support |

These are public resources, not AIOS knowledge assets. They are referenced by number only and are not stored in AIOS.

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-19 | `AIOS/ConversationDataset/19_EDGE_CASES.md` | All 10 edge case conversation patterns, detection signals, response scripts, and escalation guidance |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Age (EC-09 minor detection), existing policies (EC-02, EC-03) |
| Conversation State | `AIOS/Memory/ConversationState/` | Write: edge_case_active, ec_type, resolution |

---

## Data Flow

```
Content pattern detection (any EC signal)
         |
         v
ACP-20 EDGE_CASE_HANDLER
   |
   |-- reads --> CustomerProfile (age, existing policies)
   |-- reads --> Trust Engine (trust state)
   |-- reads --> AIOS/Domains/Insurance/ (for EC-02, EC-03, EC-08, EC-09)
   |-- reads --> CID-19 (edge case conversation patterns)
   |-- writes --> ConversationState (edge_case_active, ec_type)
   |
   v
EC-01 → Crisis resources (no commercial routing)
EC-02, EC-03, EC-07 → ACP-17 (if customer wants Jirawat, post-handling)
EC-04, EC-05, EC-06 → Normal conversation resumes or redirects
EC-08, EC-09, EC-10 → Normal conversation after correction/guidance
```
