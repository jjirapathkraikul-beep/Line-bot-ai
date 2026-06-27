---
Document ID: ACP-09-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                              | Usage in ACP-09                                                    |
|---------------------------------------------|--------------------------------------------------------------------|
| `AIOS/Domains/Insurance/`                   | All product category knowledge for recommendation matching         |
| `AIOS/Domains/Insurance/FAQ.md`             | Product FAQs for recommendation rationale support                  |
| `AIOS/Trust/Trust_Engine.md`                | Trust signal detection — always active                             |

---

## Conversation Dataset References

| Dataset ID | File Path                                          | Usage                                                           |
|------------|----------------------------------------------------|-----------------------------------------------------------------|
| CID-11     | `AIOS/ConversationDataset/11_RECOMMENDATION.md`    | Recommendation patterns; context-to-product mapping examples    |

---

## Context Sources (From Prior ACPs)

ACP-09 synthesizes context from these sources — it does not collect context itself:

| Context Source               | Provided By          | Usage in Recommendation                                   |
|------------------------------|----------------------|-----------------------------------------------------------|
| Customer age                 | Any prior ACP        | Age-appropriate product matching                          |
| Customer goal                | ACP-10 or advisory   | Goal-aligned product selection                            |
| Health concern / conditions  | ACP-04               | Health / cancer product matching; underwriting flag       |
| Tax intent                   | ACP-05               | Tax-efficient product selection                           |
| Retirement concern           | ACP-06               | Annuity / endowment recommendation                        |
| Risk profile                 | ACP-07               | ILP vs. savings product selection                         |
| Budget range                 | ACP-10 or advisory   | Premium-appropriate product selection                     |

---

## Knowledge Dependency Graph

```
ACP-09_RECOMMENDATION_ENGINE
    ├── READS: AIOS/Trust/Trust_Engine.md                    [always active]
    ├── READS: AIOS/Domains/Insurance/                       [all product knowledge]
    ├── READS: AIOS/Domains/Insurance/FAQ.md                 [FAQ references]
    ├── READS: AIOS/ConversationDataset/11_RECOMMENDATION.md
    ├── READS: Session memory from ALL prior active ACPs     [context synthesis]
    └── READS: CRM customer profile                          [known field protection]
```

---

## Out-of-Scope Knowledge for ACP-09

- Medical underwriting decisions (→ ACP-04 + Jirawat)
- Live premium calculation (→ Jirawat)
- Investment fund selection (→ ACP-07 + Jirawat)
- Formal tax advice (→ ACP-05 scope only; accounting beyond insurance)
