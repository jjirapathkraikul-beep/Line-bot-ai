---
Document ID: ACP-05-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Conversation Map

---

## Entry Points

| Entry Trigger              | Source              | Condition                                           |
|----------------------------|---------------------|-----------------------------------------------------|
| `product_tax` intent       | ACP-01 routing      | Customer expresses tax deduction interest           |
| `ask_tax_deduction`        | ACP-01 routing      | Specific deduction limit question                   |
| `year_end_planning`        | ACP-01 routing      | End-of-year tax urgency detected                    |
| ACP-02 cross-trigger       | ACP-02 mid-session  | Customer asks about health insurance tax benefit    |
| ACP-07 cross-trigger       | ACP-07 mid-session  | Customer asks about ILP tax benefit                 |
| ACP-10 routing             | Need Discovery      | Tax optimization identified as primary concern      |

---

## Exit Points

| Exit Type           | Condition                                            | Next State / ACP              |
|---------------------|------------------------------------------------------|-------------------------------|
| Success — Lead      | Lead captured after income context established       | CRM write; Jirawat handoff    |
| Success — Informed  | Customer satisfied; not ready for lead               | Session open                  |
| Trust Override      | Trust signal detected                                | → ACP-08 TRUST_ADVISOR       |
| Recommendation      | Customer ready for product recommendation            | → ACP-09                     |
| Health Crossover    | Customer wants health insurance for tax benefit      | → ACP-02 (return after)       |

---

## Interrupt Rules

| Interrupt Trigger         | Priority   | Action                                         |
|---------------------------|------------|------------------------------------------------|
| Trust signal              | CRITICAL   | → ACP-08 immediately                          |
| Customer asks for formal tax advice | MEDIUM | Acknowledge; recommend tax accountant; stay in scope |

---

## Resume Rules

| Scenario                        | Resume Allowed | Conditions                                  |
|---------------------------------|---------------|---------------------------------------------|
| After ACP-08 resolved           | Yes           | Resume after 2-turn delay                   |
| After ACP-02 health cross-visit | Yes           | Resume with health insurance noted as used  |
| Session timeout                 | No            | Restart from greeting                       |

---

## Composition Rules

| Position      | Capability                  | Condition                                             |
|---------------|-----------------------------|-------------------------------------------------------|
| BEFORE ACP-05 | ACP-01 GREETING             | Standard entry                                        |
| BEFORE ACP-05 | ACP-10 NEED_DISCOVERY       | Tax concern identified through need exploration       |
| DURING ACP-05 | ACP-08 TRUST_ADVISOR        | Always available interrupt                            |
| AFTER ACP-05  | ACP-02 HEALTH_ADVISOR       | Customer wants health insurance for tax purposes      |
| AFTER ACP-05  | ACP-09 RECOMMENDATION       | Customer ready for specific product recommendation    |

---

## Conversation Flow Summary

```
[ACP-05 activated with tax intent]
        ↓
[Explain deduction limits: 100k (life) + 25k (health)]
        ↓
[Ask income range — ONE question]
        ↓
[Customer provides income range]
        ↓
[Estimate approximate tax saving with income bracket]
        ↓
[Ask about existing deductions used — ONE question]
        ↓
[Customer provides existing deduction info]
        ↓
[Calculate remaining quota; recommend insurance type to fill gap]
        ↓
[Customer ready for lead capture?]
   Yes → [Collect name + phone → CRM → Jirawat handoff]
   No  → [Continue education until ready]
```

**Detailed Thai conversation examples are in `Examples.md`.**
