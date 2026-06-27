---
Document ID: ACP-07-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07 Conversation Map

---

## Entry Points

| Entry Trigger               | Source              | Condition                                             |
|-----------------------------|---------------------|-------------------------------------------------------|
| `product_investment` intent | ACP-01 routing      | Investment insurance inquiry                          |
| `ask_ilp_return` intent     | ACP-01 routing      | Return question triggering ILP discussion             |
| ACP-10 routing              | Need Discovery      | Investment interest identified as primary concern     |
| ACP-06 cross-trigger        | ACP-06 mid-session  | Customer asks about investment-linked retirement product |

---

## Exit Points

| Exit Type               | Condition                                            | Next State / ACP              |
|-------------------------|------------------------------------------------------|-------------------------------|
| Success — Lead (ILP)    | Risk-tolerant; lead captured after risk assessment   | CRM with risk profile; Jirawat handoff |
| Success — Redirect      | Risk-averse; redirected to savings product           | → ACP-06 or ACP-09           |
| Trust Override          | Trust signal detected                                | → ACP-08 TRUST_ADVISOR       |
| Informed Exit           | Customer satisfied; not ready for lead               | Session open                  |

---

## Interrupt Rules

| Interrupt Trigger              | Priority   | Action                                               |
|--------------------------------|------------|------------------------------------------------------|
| Trust signal                   | CRITICAL   | → ACP-08 immediately                               |
| Customer cannot accept any risk| HIGH       | Redirect to savings product; do not push ILP         |
| Guarantee return request       | HIGH       | Never guarantee; repeat risk disclosure              |

---

## Resume Rules

| Scenario                        | Resume Allowed | Conditions                              |
|---------------------------------|---------------|-----------------------------------------|
| After ACP-08 resolved           | Yes           | Resume after 2-turn delay               |
| After savings product detour    | Yes           | Return to ILP if customer re-asks       |
| Session timeout                 | No            | Restart from greeting                   |

---

## Composition Rules

| Position      | Capability                  | Condition                                              |
|---------------|-----------------------------|--------------------------------------------------------|
| BEFORE ACP-07 | ACP-01 GREETING             | Standard entry                                         |
| BEFORE ACP-07 | ACP-06 RETIREMENT_ADVISOR   | Investment-linked retirement option explored           |
| DURING ACP-07 | ACP-08 TRUST_ADVISOR        | Always available interrupt                             |
| AFTER ACP-07  | ACP-06 RETIREMENT_ADVISOR   | Risk-averse redirect to savings retirement product     |
| AFTER ACP-07  | ACP-09 RECOMMENDATION       | Customer ready for specific recommendation             |

---

## Conversation Flow Summary

```
[ACP-07 activated with investment insurance intent]
        ↓
[Explain ILP concept: insurance + investment combined]
        ↓
[MANDATORY risk disclosure: investment is not guaranteed]
        ↓
[Assess risk tolerance — ONE question per turn]
        ↓
[Risk assessment result]
   Risk-tolerant → [Continue ILP education; lead capture after full assessment]
   Risk-averse  → [Redirect: "มีแบบที่การันตีผลตอบแทนครับ" → ACP-06 or savings product]
        ↓
[Customer ready for lead?]
   Yes → [Collect name + phone + risk profile → CRM → Jirawat handoff]
   No  → [Continue education]
```

**Detailed Thai conversation examples are in `Examples.md`.**
