---
Document ID: ACP-04-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                                  | Usage in ACP-04                                                   |
|-------------------------------------------------|-------------------------------------------------------------------|
| `AIOS/Domains/Insurance/Medical/`               | Core medical underwriting guidelines and condition handling rules |
| `AIOS/Domains/Insurance/FAQ.md`                 | Common medical underwriting FAQs                                  |
| `AIOS/Trust/Trust_Engine.md`                    | Trust signal detection — always active                            |

---

## Conversation Dataset References

| Dataset ID | File Path                                              | Usage                                                          |
|------------|--------------------------------------------------------|----------------------------------------------------------------|
| CID-04     | `AIOS/ConversationDataset/04_MEDICAL_UNDERWRITING.md`  | Medical underwriting conversation patterns and anti-patterns   |

---

## Key Concepts Referenced (Not Duplicated Here)

| Concept                            | Canonical Location                      |
|------------------------------------|-----------------------------------------|
| Underwriting decision types        | `AIOS/Domains/Insurance/Medical/`       |
| Common condition handling          | `AIOS/Domains/Insurance/Medical/`       |
| Premium loading rules              | `AIOS/Domains/Insurance/Medical/`       |
| Exclusion clause rules             | `AIOS/Domains/Insurance/Medical/`       |
| Medical examination requirements   | `AIOS/Domains/Insurance/Medical/`       |
| Declaration form requirements      | `AIOS/Domains/Insurance/Medical/`       |

---

## Learning Layer References

| Learning Source                                 | Purpose                                                          |
|-------------------------------------------------|------------------------------------------------------------------|
| `AIOS/Learning/Medical_FAQ_Log.md`              | Most frequent medical underwriting questions                     |
| `AIOS/Learning/Underwriting_Outcome_Log.md`     | Common outcomes for frequently disclosed conditions              |

---

## Knowledge Dependency Graph

```
ACP-04_MEDICAL_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md                    [always active]
    ├── READS: AIOS/Domains/Insurance/Medical/               [core underwriting knowledge]
    ├── READS: AIOS/Domains/Insurance/FAQ.md                 [FAQ responses]
    └── READS: AIOS/ConversationDataset/04_MEDICAL_UNDERWRITING.md
```

---

## Out-of-Scope Knowledge for ACP-04

- Medical diagnosis or disease severity assessment (not insurance underwriting)
- Specific premium tables (→ advisory ACPs)
- Investment or retirement product knowledge (→ ACP-06 / ACP-07)
- Tax deduction specifics (→ ACP-05)
