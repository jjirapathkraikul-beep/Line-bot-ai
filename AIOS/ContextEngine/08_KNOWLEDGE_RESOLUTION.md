# 08 — Knowledge Resolution

**Document ID**: AIOS-ACE-08  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how ACE selects and loads domain knowledge based on detected intent, risk profile, and selected ACP. This is the primary implementation of Step 08 of the assembly pipeline.

---

## Knowledge Resolution Principle

**Load the most specific knowledge available for the detected intent. Load nothing that is not needed for this turn.**

Knowledge resolution is intent-driven and ACP-driven. ACE reads the ACP's `Knowledge_Map.md` to get the list of eligible knowledge sources, then selects from those sources based on intent signals.

---

## Intent-to-Knowledge Mapping

### Trust / Fraud Concern (`is_trust_signal = true`)

```
PRIMARY LOAD:
  AIOS/Trust/Trust_Engine.md          → Verification information, credential details
  ACP-08 Restrictions.md              → Hard prohibitions during trust concern

DO NOT LOAD:
  Any insurance product knowledge
  Any pricing information
  Any lead capture flow
  Any recommendation knowledge
```

---

### Health Insurance (`product_health`, `ask_premium_health`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Health.md    → IPD, OPD, coverage types, room rates
  AIOS/Domains/Insurance/FAQ.md       → Relevant health insurance FAQs

CONDITIONAL LOAD:
  AIOS/Domains/Insurance/Medical.md   → If customer mentions health history
  AIOS/Domains/Insurance/Tax.md       → If customer mentions tax deduction

DO NOT LOAD:
  Retirement knowledge
  Investment knowledge
  Claim process (unless customer asks)
```

---

### Cancer Insurance (`product_cancer`, `ask_cancer`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Cancer.md    → Cancer insurance types, lump sum, coverage stages
  AIOS/Domains/Insurance/FAQ.md       → Cancer-specific FAQs

CONDITIONAL LOAD:
  AIOS/Domains/Insurance/Medical.md   → If customer mentions cancer diagnosis or history
```

---

### Medical Underwriting (`medical_question`, `ask_health_condition`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Medical.md      → Underwriting approach, case-by-case
  AIOS/Domains/Insurance/Underwriting.md → Acceptance criteria, exclusion principles

MANDATORY INCLUSION:
  Underwriting uncertainty language:
  "บริษัทพิจารณาเป็นรายกรณี — cannot guarantee acceptance or rejection"
  This fragment must always be present in medical knowledge context.

DO NOT LOAD:
  Specific acceptance probabilities
  Claims not based on official underwriting guidelines
```

---

### Tax Planning (`product_tax`, `ask_tax_deduction`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Tax.md       → Deduction limits (100k life, 25k health)
  AIOS/Domains/Insurance/Tax/Rates.md → Tax bracket table (if available)

CONDITIONAL LOAD:
  AIOS/Domains/Insurance/Health.md    → If asking about health insurance tax
  AIOS/Domains/Insurance/Life.md      → If asking about life insurance tax

NOTE: Tax deduction limits change annually. Tax knowledge source must be reviewed yearly.
```

---

### Retirement Planning (`product_retirement`, `ask_retirement`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Retirement.md  → Annuity, endowment, retirement products
  AIOS/Domains/Insurance/Tax.md         → Tax benefits of annuity products

CONDITIONAL LOAD:
  AIOS/Domains/Insurance/Savings.md     → Endowment vs. annuity comparison
```

---

### Investment-Linked (`product_investment`, `ask_investment_insurance`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Investment.md  → ILP structure, fund choice, risk

MANDATORY INCLUSION:
  Risk disclosure language:
  "ผลตอบแทนไม่การันตี ขึ้นอยู่กับผลการลงทุน"
  This fragment must always be present in investment context.

DO NOT LOAD:
  Historical returns data (unless officially documented)
  Guaranteed return projections
```

---

### Claim Support (`claim_help`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Claim/Process.md     → Claim steps
  AIOS/Domains/Insurance/Claim/Documents.md   → Required documents

CONDITIONAL LOAD:
  AIOS/Domains/Insurance/Claim/Appeal.md      → If claim was rejected
  AIOS/Domains/Insurance/Claim/Emergency.md   → If in hospital now

DO NOT LOAD:
  Sales knowledge
  Product descriptions
  Lead capture flow
```

---

### Product Comparison (`ask_comparison`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/ProductTypes.md  → All product type summaries
  AIOS/Domains/Insurance/Comparison.md    → Comparison framework

NOTE: Load summaries, not full product specs. Customer needs clarity, not exhaustive detail.
```

---

### Need Discovery / Unclear (`unclear`, `greeting`)

```
PRIMARY LOAD:
  AIOS/Domains/Insurance/Overview.md     → High-level product overview

DO NOT LOAD:
  Specific product details
  Pricing
  Any knowledge that presupposes a need the customer hasn't expressed
```

---

## Knowledge Conflict Handling

If two knowledge sources contain contradictory information:

| Conflict Type | Resolution |
|---|---|
| FAQ vs. Domain Knowledge | Domain Knowledge wins (more authoritative) |
| Old vs. New version of same document | New version wins (check last_reviewed date) |
| Tax rate from different years | Use the most recent; flag if review date > 12 months |
| Medical guidelines differ | Use more conservative interpretation; always recommend case-by-case |

---

## Knowledge Excerpt Scoring

Each knowledge fragment is scored for relevance (0.0–1.0):

| Score | Meaning | Inclusion |
|---|---|---|
| 0.9–1.0 | Direct match to detected intent | Always include |
| 0.7–0.89 | Strong secondary relevance | Include unless over budget |
| 0.5–0.69 | Moderate relevance | Include if budget allows |
| < 0.5 | Weak relevance | Exclude |

---

## Mandatory Inclusions

These knowledge fragments must always be included regardless of token budget:

| Fragment | When | Source |
|---|---|---|
| Underwriting uncertainty language | Any medical inquiry | SR-06 |
| Investment risk disclosure | Any ILP inquiry | SR-05 |
| Trust verification information | Any trust signal | SR-05 / Trust_Engine |
| CP-01 through CP-10 pattern references | All intents | SR-04 CID-20 |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial knowledge resolution mapping |
