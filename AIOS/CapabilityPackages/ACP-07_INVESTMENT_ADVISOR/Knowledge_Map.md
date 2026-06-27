---
Document ID: ACP-07-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                              | Usage in ACP-07                                                    |
|---------------------------------------------|--------------------------------------------------------------------|
| `AIOS/Domains/Insurance/`                   | Unit-linked / ILP product structure and fund categories            |
| `AIOS/Domains/Insurance/Tax/`               | Tax deductibility aspects of ILP premiums                          |
| `AIOS/Domains/Insurance/FAQ.md`             | ILP FAQs and common risk disclosure language                       |
| `AIOS/Trust/Trust_Engine.md`                | Trust signal detection — always active                             |

---

## Conversation Dataset References

| Dataset ID | File Path                                           | Usage                                                           |
|------------|-----------------------------------------------------|-----------------------------------------------------------------|
| CID-07     | `AIOS/ConversationDataset/07_INVESTMENT_LINKED.md`  | ILP conversation patterns; risk disclosure examples             |

---

## Key Concepts Referenced (Not Duplicated Here)

| Concept                              | Canonical Location                  |
|--------------------------------------|-------------------------------------|
| Unit-linked insurance structure      | `AIOS/Domains/Insurance/`           |
| Fund category types                  | `AIOS/Domains/Insurance/`           |
| Risk tolerance classification        | `AIOS/Domains/Insurance/`           |
| Investment risk disclosure language  | `AIOS/Domains/Insurance/FAQ.md`     |
| ILP tax deduction rules              | `AIOS/Domains/Insurance/Tax/`       |

---

## Knowledge Dependency Graph

```
ACP-07_INVESTMENT_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md                    [always active]
    ├── READS: AIOS/Domains/Insurance/                       [ILP product knowledge]
    ├── READS: AIOS/Domains/Insurance/Tax/                   [tax cross-reference]
    ├── READS: AIOS/Domains/Insurance/FAQ.md                 [risk disclosure language]
    └── READS: AIOS/ConversationDataset/07_INVESTMENT_LINKED.md
```

---

## Out-of-Scope Knowledge for ACP-07

- Live fund price or NAV data (not available to AI; refer to Jirawat)
- Historical fund performance data (never fabricate; refer to official sources)
- Stock market or equity analysis
- Non-insurance investment products (mutual funds, RMF/SSF as standalone products)
