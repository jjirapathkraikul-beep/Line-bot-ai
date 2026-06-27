---
Document ID: ACP-06-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Conversation Map

---

## Entry Points

| Entry Trigger               | Source              | Condition                                             |
|-----------------------------|---------------------|-------------------------------------------------------|
| `product_retirement` intent | ACP-01 routing      | Retirement insurance inquiry                          |
| `ask_retirement` intent     | ACP-01 routing      | Retirement security question                          |
| `fear_retirement` emotion   | ACP-01 routing      | Customer expresses retirement anxiety                 |
| ACP-10 routing              | Need Discovery      | Retirement concern identified as primary need         |
| ACP-05 cross-trigger        | ACP-05 mid-session  | Customer asks about retirement tax-deductible product |

---

## Exit Points

| Exit Type           | Condition                                            | Next State / ACP              |
|---------------------|------------------------------------------------------|-------------------------------|
| Success — Lead      | Lead captured after age + savings context            | CRM write; Jirawat handoff    |
| Success — Informed  | Customer satisfied; not ready for lead               | Session open                  |
| Trust Override      | Trust signal detected                                | → ACP-08 TRUST_ADVISOR       |
| Tax Crossover       | Customer asks about tax deductibility                | → ACP-05 (return after)       |
| Recommendation      | Customer ready for specific recommendation           | → ACP-09                     |

---

## Interrupt Rules

| Interrupt Trigger         | Priority   | Action                                              |
|---------------------------|------------|-----------------------------------------------------|
| Trust signal              | CRITICAL   | → ACP-08 immediately                               |
| "สายไปแล้ว" from customer | HIGH       | Immediately reframe; never agree                    |
| Investment return request | MEDIUM     | Note investment-linked option; risk disclosure required |

---

## Resume Rules

| Scenario                        | Resume Allowed | Conditions                                    |
|---------------------------------|---------------|-----------------------------------------------|
| After ACP-08 resolved           | Yes           | Resume after 2-turn delay                     |
| After ACP-05 tax cross-visit    | Yes           | Resume with tax benefit noted                 |
| Session timeout                 | No            | Restart from greeting                         |

---

## Composition Rules

| Position      | Capability                  | Condition                                              |
|---------------|-----------------------------|--------------------------------------------------------|
| BEFORE ACP-06 | ACP-01 GREETING             | Standard entry                                         |
| BEFORE ACP-06 | ACP-10 NEED_DISCOVERY       | Retirement concern identified through need exploration |
| DURING ACP-06 | ACP-08 TRUST_ADVISOR        | Always available interrupt                             |
| AFTER ACP-06  | ACP-05 TAX_ADVISOR          | Customer asks about tax benefit of retirement insurance|
| AFTER ACP-06  | ACP-09 RECOMMENDATION       | Customer ready for specific product recommendation     |

---

## Conversation Flow Summary

```
[ACP-06 activated with retirement intent]
        ↓
[Answer retirement question FIRST — "ยังไม่สายครับ" framing]
        ↓
[Ask age — ONE question]
        ↓
[Customer provides age]
        ↓
[Explain retirement savings timeline based on their age]
        ↓
[Ask existing savings — ONE question]
        ↓
[Customer provides savings context]
        ↓
[Describe insurance-based retirement income target and product type]
        ↓
[Customer ready for lead capture?]
   Yes → [Collect name + phone → CRM → Jirawat handoff]
   No  → [Continue exploration]
```

**Detailed Thai conversation examples are in `Examples.md`.**
