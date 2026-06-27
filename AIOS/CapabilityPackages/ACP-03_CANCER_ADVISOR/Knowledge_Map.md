---
Document ID: ACP-03-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                                    | Usage in ACP-03                                                   |
|---------------------------------------------------|-------------------------------------------------------------------|
| `AIOS/Domains/Insurance/`                         | Cancer insurance product structure and coverage types             |
| `AIOS/Domains/Insurance/FAQ.md`                   | Cancer insurance FAQs                                             |
| `AIOS/Domains/Insurance/Medical/`                 | Medical underwriting for cancer history (cross-ref for ACP-04)    |
| `AIOS/Trust/Trust_Engine.md`                      | Trust signal detection — always active                            |

---

## Conversation Dataset References

| Dataset ID | File Path                                         | Usage                                                             |
|------------|---------------------------------------------------|-------------------------------------------------------------------|
| CID-03     | `AIOS/ConversationDataset/03_CANCER_INSURANCE.md` | Cancer insurance conversation patterns and emotional handling      |

---

## Key Concepts Referenced (Not Duplicated Here)

| Concept                          | Canonical Location                   |
|----------------------------------|--------------------------------------|
| Cancer insurance coverage models | `AIOS/Domains/Insurance/`            |
| Cancer stage definitions         | `AIOS/Domains/Insurance/`            |
| Waiting period rules             | `AIOS/Domains/Insurance/`            |
| Lump sum payout structure        | `AIOS/Domains/Insurance/`            |
| Treatment reimbursement model    | `AIOS/Domains/Insurance/`            |
| Cancer underwriting guidelines   | `AIOS/Domains/Insurance/Medical/`    |

---

## Learning Layer References

| Learning Source                              | Purpose                                                          |
|----------------------------------------------|------------------------------------------------------------------|
| `AIOS/Learning/Cancer_FAQ_Log.md`            | Most frequent cancer insurance questions                         |
| `AIOS/Learning/Emotional_Signal_Log.md`      | Patterns of emotional triggers in cancer conversations           |

---

## Knowledge Dependency Graph

```
ACP-03_CANCER_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md                       [always active]
    ├── READS: AIOS/Domains/Insurance/                          [cancer product knowledge]
    ├── READS: AIOS/Domains/Insurance/FAQ.md                    [FAQ responses]
    ├── READS: AIOS/Domains/Insurance/Medical/                  [cross-ref for ACP-04 routing]
    └── READS: AIOS/ConversationDataset/03_CANCER_INSURANCE.md
```

---

## Out-of-Scope Knowledge for ACP-03

- Medical cancer diagnosis or treatment protocols (not insurance knowledge)
- Health insurance IPD/OPD specifics without cancer context (→ ACP-02)
- Retirement or investment products (→ ACP-06 / ACP-07)
- Tax deduction specifics (→ ACP-05)
