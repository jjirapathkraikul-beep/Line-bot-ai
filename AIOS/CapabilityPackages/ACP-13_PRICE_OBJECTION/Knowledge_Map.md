# Knowledge Map — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-13. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-13 |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Entry-level products and budget-tier plans to offer as alternatives |
| Tax Rules | `AIOS/Domains/Insurance/Tax/` | Frame effective cost after tax deduction (reduces perceived price) |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | Common price-related FAQs |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check; blocks if concern active |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-12 | `AIOS/ConversationDataset/12_PRICE_OBJECTION.md` | Authoritative source for price objection conversation patterns, acknowledgment scripts, and budget redirection examples |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Read: known budget, tax filing status, prior product interest |
| Conversation State | `AIOS/Memory/ConversationState/` | Read: prior product discussed; write: stated_budget, price_objection_flag |

---

## Key Knowledge Boundaries

ACP-13 uses product and tax knowledge defensively — to find what IS accessible at a given budget, not to justify high prices. It does not author product or tax knowledge.

---

## Data Flow

```
Price objection detected
         |
         v
ACP-13 PRICE_OBJECTION
   |
   |-- reads --> CustomerProfile (budget_range, tax_filing)
   |-- reads --> AIOS/Domains/Insurance/ (entry-level products)
   |-- reads --> AIOS/Domains/Insurance/Tax/ (deduction framing)
   |-- reads --> ConversationState (prior product context)
   |-- writes --> ConversationState (stated_budget, price_objection_flag, resolution_approach)
   |
   v
ACP-09 (Recommendation at budget) or ACP-11 (Lead Capture) or ACP-17 (Handoff)
```
