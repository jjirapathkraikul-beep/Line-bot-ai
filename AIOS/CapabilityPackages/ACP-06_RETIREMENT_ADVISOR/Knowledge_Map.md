---
Document ID: ACP-06-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                              | Usage in ACP-06                                                    |
|---------------------------------------------|--------------------------------------------------------------------|
| `AIOS/Domains/Insurance/`                   | Retirement insurance (annuity/endowment) product knowledge         |
| `AIOS/Domains/Insurance/Tax/`               | Tax deductibility of retirement insurance premiums                 |
| `AIOS/Domains/Insurance/FAQ.md`             | Retirement insurance FAQs                                          |
| `AIOS/Trust/Trust_Engine.md`                | Trust signal detection — always active                             |

---

## Conversation Dataset References

| Dataset ID | File Path                                      | Usage                                                           |
|------------|------------------------------------------------|-----------------------------------------------------------------|
| CID-06     | `AIOS/ConversationDataset/06_RETIREMENT.md`    | Retirement conversation patterns; "never too late" examples     |

---

## Key Concepts Referenced (Not Duplicated Here)

| Concept                              | Canonical Location                |
|--------------------------------------|-----------------------------------|
| Annuity insurance structure          | `AIOS/Domains/Insurance/`         |
| Endowment savings insurance          | `AIOS/Domains/Insurance/`         |
| Retirement income calculation        | `AIOS/Domains/Insurance/`         |
| Tax deductibility of pension premium | `AIOS/Domains/Insurance/Tax/`     |

---

## Knowledge Dependency Graph

```
ACP-06_RETIREMENT_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md               [always active]
    ├── READS: AIOS/Domains/Insurance/                  [retirement product knowledge]
    ├── READS: AIOS/Domains/Insurance/Tax/              [tax benefit cross-reference]
    ├── READS: AIOS/Domains/Insurance/FAQ.md            [FAQ responses]
    └── READS: AIOS/ConversationDataset/06_RETIREMENT.md
```

---

## Out-of-Scope Knowledge for ACP-06

- Stock market investment for retirement (→ ACP-07 if investment-linked)
- Government Social Security Fund specifics (refer to SSF website)
- Provident fund management (employer-based; not insurance)
- Formal financial planning services (refer to certified financial planner)
