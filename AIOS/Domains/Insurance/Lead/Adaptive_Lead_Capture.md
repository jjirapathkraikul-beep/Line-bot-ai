# Adaptive Lead Capture
### Insurance Domain — Progressive Profiling Strategy
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## 1. Purpose

Define the domain strategy for collecting insurance lead data progressively across multiple interactions. The goal is to minimize customer friction by asking only for fields that are most valuable at each stage of the conversation, rather than collecting all fields upfront.

---

## 2. Scope

This document covers:
- Field collection priority tiers
- Progressive profiling rules (which fields to request first)
- Fallback field rules when a customer declines to answer
- Consent capture requirements
- Minimum viable lead profile

This document does not cover:
- How any specific application implements the capture flow (Application concern)
- How customer state is persisted between turns (Application concern)
- Channel-specific UI elements such as quick replies or rich menus (Application concern)

---

## 3. Inputs

- Partial customer profile (known fields and missing fields)
- Customer's expressed interest category
- Lead readiness stage (from `Lead_Status.md`)

---

## 4. Outputs

- Incrementally built lead record (new known fields)
- Next recommended field to request
- Minimum viable profile flag (when enough fields are collected for handoff)

---

## 5. Field Collection Priority

Fields are collected in three tiers. Tier 1 fields are requested first; Tier 3 fields are optional enrichment.

### Tier 1 — Minimum Viable Lead (Required for Handoff)

| Field | Reason for Priority |
|---|---|
| `interest_category` | Determines which product path to follow |
| `display_name` or `real_name` | Personalizes conversation; required for advisor |
| `phone` | Required for advisor follow-up |
| `age` | Required for product eligibility and underwriting |

### Tier 2 — Qualified Lead Enrichment

| Field | Reason for Priority |
|---|---|
| `gender` | Product eligibility (cancer, CI products) |
| `marital_status` | Family protection needs |
| `budget_annual` | Product filtering and recommendation |
| `health_status` | Underwriting routing |
| `product_interest` | Refines recommendation |

### Tier 3 — Optional Profiling

| Field | Reason |
|---|---|
| `occupation` | Risk assessment refinement |
| `monthly_income` | Affordability and product matching |
| `tax_bracket` | Tax-deductible product relevance |
| `children` | Education and family protection needs |
| `cancer_status` | Cancer product eligibility |
| `tax_goal` | Tax planning product alignment |
| `investment_goal` | Investment-linked product alignment |
| `preferred_contact_time` | Scheduling follow-up |

---

## 6. Progressive Profiling Rules

1. Request only one new field per conversation turn to avoid overwhelming the customer.
2. Always start with Tier 1 fields before moving to Tier 2 or 3.
3. If a customer's interest category is already known, begin from the most relevant Tier 2 field for that category.
4. If a customer skips or declines to answer a field, move to the next field in tier sequence — do not repeat the same field in the same session.
5. A lead is considered handoff-ready when all Tier 1 fields are collected and the lead score meets the threshold in `Lead_Scoring.md`.

---

## 7. Consent Capture Requirements

Before storing personal data (Tier 1+), the system must confirm that the customer understands their information will be used for insurance advisory purposes. Consent must be recorded before any data is written to the lead record.

---

## 8. Fallback Field Rules

If a required Tier 1 field cannot be collected after two attempts:
- Skip to the next Tier 1 field.
- Retain the lead as `engaged` status.
- Flag the missing field for advisor follow-up.
- Do not block handoff if other Tier 1 fields are complete and lead score is sufficient.

---

## 9. Dependencies

- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Field definitions and ownership
- `AIOS/Domains/Insurance/Lead/Lead_Status.md` — Lead readiness states
- `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` — Score threshold for handoff readiness
- `AIOS/Domains/Insurance/Lead/Lead_Qualification.md` — Qualification criteria

---

## 10. Future Improvements

- Persona-based capture templates (e.g., different field order for retirement vs health intent)
- Real-time qualification scoring during capture flow
- Consent logging and audit trail specification

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Domain Lead | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Removed application dependencies (Session state, CRM direct); replaced with domain-neutral terms (known field, missing field, lead readiness); added tier structure and progressive profiling rules |
