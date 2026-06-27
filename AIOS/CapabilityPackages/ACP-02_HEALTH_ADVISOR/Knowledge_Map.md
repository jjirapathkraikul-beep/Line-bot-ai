---
Document ID: ACP-02-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                                     | Usage in ACP-02                                                 |
|----------------------------------------------------|-----------------------------------------------------------------|
| `AIOS/Domains/Insurance/`                          | Health insurance product structure and coverage types           |
| `AIOS/Domains/Insurance/FAQ.md`                    | Common health insurance FAQs (IPD/OPD/room rate/limits)         |
| `AIOS/Domains/Insurance/Tax/`                      | Health insurance tax deductibility (cross-ref for ACP-05)       |
| `AIOS/Trust/Trust_Engine.md`                       | Trust signal detection — always active                          |

---

## Conversation Dataset References

| Dataset ID | File Path                                          | Usage                                                           |
|------------|----------------------------------------------------|-----------------------------------------------------------------|
| CID-02     | `AIOS/ConversationDataset/02_HEALTH_INSURANCE.md`  | Health insurance conversation patterns and anti-patterns        |

---

## Key Concepts Referenced (Not Duplicated Here)

The following concepts are defined in `AIOS/Domains/Insurance/` and must be read from there:

| Concept                    | Canonical Location                          |
|----------------------------|---------------------------------------------|
| IPD definition             | `AIOS/Domains/Insurance/`                   |
| OPD definition             | `AIOS/Domains/Insurance/`                   |
| Room rate coverage types   | `AIOS/Domains/Insurance/`                   |
| Annual benefit limit       | `AIOS/Domains/Insurance/`                   |
| Co-payment structure       | `AIOS/Domains/Insurance/`                   |
| Medical underwriting rules | `AIOS/Domains/Insurance/Medical/`           |

---

## Learning Layer References

| Learning Source                                    | Purpose                                                         |
|----------------------------------------------------|-----------------------------------------------------------------|
| `AIOS/Learning/Health_FAQ_Log.md`                  | Most frequent health insurance questions; improves response relevance |
| `AIOS/Learning/Coverage_Confusion_Log.md`          | Common customer misunderstandings about health coverage          |

---

## Knowledge Dependency Graph

```
ACP-02_HEALTH_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md                    [always active]
    ├── READS: AIOS/Domains/Insurance/                       [core product knowledge]
    ├── READS: AIOS/Domains/Insurance/FAQ.md                 [FAQ responses]
    ├── READS: AIOS/Domains/Insurance/Tax/                   [tax cross-reference only]
    └── READS: AIOS/ConversationDataset/02_HEALTH_INSURANCE.md
```

---

## Out-of-Scope Knowledge for ACP-02

The following knowledge domains are explicitly out of scope for ACP-02 and must not be accessed:

- Cancer-specific coverage details (→ ACP-03)
- Medical underwriting decision criteria (→ ACP-04)
- Retirement savings products (→ ACP-06)
- Investment-linked product details (→ ACP-07)
- Specific competitor product comparisons
