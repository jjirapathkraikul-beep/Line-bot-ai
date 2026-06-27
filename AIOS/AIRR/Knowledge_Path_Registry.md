# Knowledge Path Registry

**Document ID**: AIOS-AIRR-03  
**Version**: 1.0  
**Date**: 2026-06-27  
**Status**: Active — AIRR Resolution for GAP-H-02  
**Authority**: Chief AI Systems Architect

---

## Purpose

This document is the canonical reference for all domain knowledge file paths in AIOS. All ACP Knowledge_Maps and ACE Source Registry entries must use paths from this registry.

**Rule**: If a knowledge path is not in this registry, it is not a valid reference. ACP Knowledge_Maps that reference non-registered paths must be updated to use registered paths.

---

## Insurance Domain Knowledge Paths

All paths are relative to the AIOS repository root.

### Products

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Health Insurance | `AIOS/Domains/Insurance/Products/Health_Insurance.md` | ACP-02 |
| Cancer Insurance | `AIOS/Domains/Insurance/Products/Cancer_Insurance.md` | ACP-03 |
| Life Insurance | `AIOS/Domains/Insurance/Products/Life_Insurance.md` | ACP-06, ACP-09 |
| Investment-Linked | `AIOS/Domains/Insurance/Products/Investment_Linked.md` | ACP-07 |
| Retirement | `AIOS/Domains/Insurance/Products/Retirement.md` | ACP-06 |
| Tax Planning | `AIOS/Domains/Insurance/Products/Tax_Planning.md` | ACP-05 |
| Product Overview | `AIOS/Domains/Insurance/Overview.md` | ACP-01, ACP-10 |

**Note**: `Overview.md` does not yet exist. Create as part of Phase 10.0 (GAP-L-01).

---

### Knowledge (Underwriting, Claims, Medical, Tax)

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Medical Underwriting | `AIOS/Domains/Insurance/Knowledge/Medical.md` | ACP-04 |
| Underwriting Rules | `AIOS/Domains/Insurance/Knowledge/Underwriting.md` | ACP-04 |
| Tax Deduction Limits | `AIOS/Domains/Insurance/Knowledge/Tax.md` | ACP-05 |
| Claim Process | `AIOS/Domains/Insurance/Knowledge/Claim.md` | ACP-15 |
| Hospital Protocol | `AIOS/Domains/Insurance/Knowledge/Hospital.md` | ACP-16 |
| FAQ | `AIOS/Domains/Insurance/Knowledge/FAQ.md` | ACP-02, ACP-03, ACP-12 |

---

### Trust

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Trust Engine | `AIOS/Domains/Insurance/Trust/Trust_Engine.md` | ACP-08, all ACPs (secondary) |
| Fraud Handling | `AIOS/Domains/Insurance/Trust/Fraud_Handling.md` | ACP-08 |
| License Verification | `AIOS/Domains/Insurance/Trust/License_Verification.md` | ACP-08 |
| Professional Credibility | `AIOS/Domains/Insurance/Trust/Professional_Credibility.md` | ACP-08 |

---

### Sales & Recommendation

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Recommendation Framework | `AIOS/Domains/Insurance/Recommendation/Recommendation_Framework.md` | ACP-09 |
| Product Selection Rules | `AIOS/Domains/Insurance/Recommendation/Product_Selection_Rules.md` | ACP-09 |
| Budget Optimization | `AIOS/Domains/Insurance/Recommendation/Budget_Optimization.md` | ACP-09, ACP-13 |
| Consultative Selling | `AIOS/Domains/Insurance/Sales/Consultative_Selling.md` | ACP-09, ACP-10 |
| Need Discovery | `AIOS/Domains/Insurance/Sales/Need_Discovery.md` | ACP-10 |
| Closing Framework | `AIOS/Domains/Insurance/Sales/Closing_Framework.md` | ACP-19 |
| Buying Signal | `AIOS/Domains/Insurance/Sales/Buying_Signal.md` | ACP-19, ACP-18 |

---

### Lead

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Lead Data Model | `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` | ACP-11 |
| Lead Qualification | `AIOS/Domains/Insurance/Lead/Lead_Qualification.md` | ACP-11 |
| Adaptive Lead Capture | `AIOS/Domains/Insurance/Lead/Adaptive_Lead_Capture.md` | ACP-11 |
| Follow-up Strategy | `AIOS/Domains/Insurance/Lead/Follow_Up_Strategy.md` | ACP-18 |

---

### Objection

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Price Objection | `AIOS/Domains/Insurance/Objection/Price_Objection.md` | ACP-13 |
| Already Have Insurance | `AIOS/Domains/Insurance/Objection/Already_Have_Insurance.md` | ACP-14 |
| Scam Concern | `AIOS/Domains/Insurance/Objection/Scam_Concern.md` | ACP-08 |
| Objection Framework | `AIOS/Domains/Insurance/Objection/Objection_Framework.md` | ACP-13, ACP-14 |

---

### Human Handoff

| Knowledge Topic | Canonical Path | ACP Knowledge_Maps That Reference This |
|---|---|---|
| Human Handoff Rules | `AIOS/Domains/Insurance/Human/Human_Handoff.md` | ACP-17 |
| Escalation Rules | `AIOS/Domains/Insurance/Human/Escalation_Rules.md` | ACP-17, ACP-15 |
| Advisor Brief | `AIOS/Domains/Insurance/Human/Advisor_Brief.md` | ACP-17 |

---

## Conversation Dataset Paths

| Dataset | Canonical Path |
|---|---|
| CID-01 Greeting | `AIOS/ConversationDataset/01_GREETING.md` |
| CID-02 Health | `AIOS/ConversationDataset/02_HEALTH_INSURANCE.md` |
| CID-03 Cancer | `AIOS/ConversationDataset/03_CANCER_INSURANCE.md` |
| CID-04 Medical | `AIOS/ConversationDataset/04_MEDICAL_UNDERWRITING.md` |
| CID-05 Tax | `AIOS/ConversationDataset/05_TAX_PLANNING.md` |
| CID-06 Retirement | `AIOS/ConversationDataset/06_RETIREMENT.md` |
| CID-07 Investment | `AIOS/ConversationDataset/07_INVESTMENT_LINKED.md` |
| CID-08 Trust | `AIOS/ConversationDataset/08_TRUST_AND_SCAM.md` |
| CID-09 Comparison | `AIOS/ConversationDataset/09_PRODUCT_COMPARISON.md` |
| CID-10 Need Discovery | `AIOS/ConversationDataset/10_NEED_DISCOVERY.md` |
| CID-11 Recommendation | `AIOS/ConversationDataset/11_RECOMMENDATION.md` |
| CID-12 Price | `AIOS/ConversationDataset/12_PRICE_OBJECTION.md` |
| CID-13 Existing | `AIOS/ConversationDataset/13_EXISTING_INSURANCE.md` |
| CID-14 Claim | `AIOS/ConversationDataset/14_CLAIM.md` |
| CID-15 Hospital | `AIOS/ConversationDataset/15_HOSPITAL.md` |
| CID-16 Handoff | `AIOS/ConversationDataset/16_HUMAN_HANDOFF.md` |
| CID-17 Follow-up | `AIOS/ConversationDataset/17_FOLLOW_UP.md` |
| CID-18 Closing | `AIOS/ConversationDataset/18_CLOSING.md` |
| CID-19 Edge Cases | `AIOS/ConversationDataset/19_EDGE_CASES.md` |
| CID-20 Patterns | `AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md` |

---

## Known Invalid Paths (Previously Used — Now Corrected)

The following paths appeared in earlier ACP Knowledge_Map files and are INVALID. Use the canonical paths above.

| Invalid Path | Correct Path |
|---|---|
| `AIOS/Domains/Insurance/Health.md` | `AIOS/Domains/Insurance/Products/Health_Insurance.md` |
| `AIOS/Trust/Trust_Engine.md` | `AIOS/Domains/Insurance/Trust/Trust_Engine.md` |
| `AIOS/Domains/Insurance/Tax/` | `AIOS/Domains/Insurance/Knowledge/Tax.md` |
| `AIOS/Domains/Insurance/Underwriting.md` | `AIOS/Domains/Insurance/Knowledge/Underwriting.md` |
| `AIOS/Domains/Insurance/Investment.md` | `AIOS/Domains/Insurance/Products/Investment_Linked.md` |
| `AIOS/Domains/Insurance/Overview.md` | Create at `AIOS/Domains/Insurance/Overview.md` (Phase 10.0) |

---

## Registry Maintenance Rules

1. When a new knowledge file is added to any Domain, add it to this registry immediately
2. When a knowledge file is moved, update this registry and all ACP Knowledge_Maps that reference it
3. This registry is the source of truth for all knowledge path references
4. ACE Source Registry (04_CONTEXT_SOURCE_REGISTRY.md) must reference paths from this registry

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial — resolves GAP-H-02 from AIRR v1.0 |
