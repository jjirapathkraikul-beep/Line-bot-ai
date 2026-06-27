---
Document ID: ACP-10-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-10 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                            | Usage in ACP-10                                                     |
|-------------------------------------------|---------------------------------------------------------------------|
| `AIOS/Domains/Insurance/FAQ.md`           | General insurance overview for anchoring life stage questions       |
| `AIOS/Trust/Trust_Engine.md`              | Trust signal detection — always active                              |

---

## Conversation Dataset References

| Dataset ID | File Path                                         | Usage                                                          |
|------------|---------------------------------------------------|----------------------------------------------------------------|
| CID-10     | `AIOS/ConversationDataset/10_NEED_DISCOVERY.md`   | Need discovery conversation patterns; life stage question bank |

---

## Routing Targets (Not Knowledge — Structural References)

ACP-10 routes discovered needs to these ACPs:

| Primary Need Identified     | Routes To              |
|-----------------------------|------------------------|
| Health / hospitalization    | ACP-02 HEALTH_ADVISOR  |
| Cancer concern              | ACP-03 CANCER_ADVISOR  |
| Pre-existing condition      | ACP-04 MEDICAL_ADVISOR |
| Tax reduction               | ACP-05 TAX_ADVISOR     |
| Retirement income           | ACP-06 RETIREMENT_ADVISOR |
| Investment / growth         | ACP-07 INVESTMENT_ADVISOR |
| Unclear after 5 turns       | ACP-09 RECOMMENDATION (with partial context) |

---

## Learning Layer References

| Learning Source                              | Purpose                                                          |
|----------------------------------------------|------------------------------------------------------------------|
| `AIOS/Learning/Need_Discovery_Log.md`        | Common need discovery paths; optimize question sequence          |
| `AIOS/Learning/Life_Stage_Patterns.md`       | Life stage signals that predict insurance need type              |

---

## Knowledge Dependency Graph

```
ACP-10_NEED_DISCOVERY
    ├── READS: AIOS/Trust/Trust_Engine.md               [always active]
    ├── READS: AIOS/Domains/Insurance/FAQ.md            [general overview only]
    ├── READS: AIOS/ConversationDataset/10_NEED_DISCOVERY.md
    └── ROUTES TO: ACP-02 through ACP-07 / ACP-09      [based on identified need]
```

---

## Out-of-Scope Knowledge for ACP-10

- Specific product details (education happens in advisory ACPs)
- Premium calculations (advisory ACPs + Jirawat)
- Medical underwriting (→ ACP-04 after routing)
- Tax rates and calculations (→ ACP-05 after routing)
