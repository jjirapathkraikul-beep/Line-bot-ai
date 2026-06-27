---
Document ID: ACP-05-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                             | Usage in ACP-05                                                     |
|--------------------------------------------|---------------------------------------------------------------------|
| `AIOS/Domains/Insurance/Tax/`              | Core tax deduction rules for life and health insurance              |
| `AIOS/Domains/Insurance/FAQ.md`            | Tax insurance FAQs                                                  |
| `AIOS/Trust/Trust_Engine.md`               | Trust signal detection — always active                              |

---

## Conversation Dataset References

| Dataset ID | File Path                                       | Usage                                                           |
|------------|-------------------------------------------------|-----------------------------------------------------------------|
| CID-05     | `AIOS/ConversationDataset/05_TAX_PLANNING.md`   | Tax planning conversation patterns and income bracket examples  |

---

## Key Concepts Referenced (Not Duplicated Here)

| Concept                                   | Canonical Location                  |
|-------------------------------------------|-------------------------------------|
| Life insurance tax deduction (100k limit) | `AIOS/Domains/Insurance/Tax/`       |
| Health insurance tax deduction (25k limit)| `AIOS/Domains/Insurance/Tax/`       |
| Eligible insurance types for deduction    | `AIOS/Domains/Insurance/Tax/`       |
| RMF/SSF cross-reference rules             | `AIOS/Domains/Insurance/Tax/`       |
| Income bracket tax rate table             | `AIOS/Domains/Insurance/Tax/`       |

---

## Learning Layer References

| Learning Source                             | Purpose                                                         |
|---------------------------------------------|-----------------------------------------------------------------|
| `AIOS/Learning/Tax_FAQ_Log.md`              | Most frequent tax deduction questions                           |
| `AIOS/Learning/Income_Bracket_Patterns.md`  | Common income ranges in customer base for response calibration  |

---

## Knowledge Dependency Graph

```
ACP-05_TAX_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md               [always active]
    ├── READS: AIOS/Domains/Insurance/Tax/              [core tax rules]
    ├── READS: AIOS/Domains/Insurance/FAQ.md            [FAQ responses]
    └── READS: AIOS/ConversationDataset/05_TAX_PLANNING.md
```

---

## Out-of-Scope Knowledge for ACP-05

- Formal tax return filing procedures (not insurance knowledge)
- RMF/SSF product details (non-insurance investment; note and refer to Jirawat)
- Personal income tax calculation services (refer to Revenue Department or tax accountant)
- Medical underwriting for tax insurance applicants (→ ACP-04)
