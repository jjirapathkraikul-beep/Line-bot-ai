# Knowledge Map — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-12. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-12 |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Product specifications, plan tiers, coverage details for all comparable products |
| Tax Rules | `AIOS/Domains/Insurance/Tax/` | Tax deduction eligibility differs by product type — key comparison dimension |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | Common customer questions about product differences |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check; blocks or interrupts comparison if concern is active |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-09 | `AIOS/ConversationDataset/09_PRODUCT_COMPARISON.md` | Authoritative source for comparison conversation patterns, example dialogue, and comparison dimension guidance |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Read customer age, health status, budget, prior expressed needs to personalize comparison |
| Conversation State | `AIOS/Memory/ConversationState/` | Read results from ACP-10 (Need Discovery) if prior need discovery was performed |
| Comparison Context | `AIOS/Memory/ConversationState/comparison_context` | Write: products compared, dimensions used, customer preference signal |

---

## Key Knowledge Boundaries

ACP-12 reads product knowledge to perform comparisons but does NOT author product knowledge. All product data is sourced from `AIOS/Domains/Insurance/`.

| Knowledge Type | ACP-12 Action |
|---|---|
| Product coverage details | Read-only from `AIOS/Domains/Insurance/` |
| Premium ranges | Read-only; does NOT calculate exact premiums |
| Tax deduction rules | Read-only from `AIOS/Domains/Insurance/Tax/` |
| Medical underwriting criteria | Read-only reference; defer detail to Jirawat |
| Competitor products | NOT accessed — see Restrictions.md |

---

## Data Flow

```
ACP-10 (Need Discovery) — optional prior context
         |
         v
ACP-12 PRODUCT_COMPARISON
   |
   |-- reads --> AIOS/Domains/Insurance/ (product data)
   |-- reads --> AIOS/Domains/Insurance/Tax/ (tax eligibility)
   |-- reads --> CustomerProfile (age, health, budget, needs)
   |-- reads --> ConversationState (prior need discovery results)
   |-- writes --> ConversationState.comparison_context
   |
   v
ACP-09 (Recommendation) or ACP-11 (Lead Capture)
   or ACP-13 (Price Objection) as appropriate
```

---

## Notes

- ACP-12 must never reproduce product specification tables verbatim in its responses. It must synthesize and personalize product knowledge into customer-relevant comparisons.
- When product data is unavailable or unclear, ACP-12 must acknowledge the gap and route to ACP-17 (Human Handoff) rather than speculating.
