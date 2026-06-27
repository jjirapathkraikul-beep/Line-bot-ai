---
Document ID: ACP-02-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Conversation Map

---

## Entry Points

| Entry Trigger             | Source                          | Condition                                              |
|---------------------------|---------------------------------|--------------------------------------------------------|
| `product_health` intent   | ACP-01 routing                  | Customer expressed health insurance interest           |
| `ask_premium_health`      | ACP-01 routing or direct        | Customer asks about health insurance cost              |
| `ask_ipd` / `ask_opd`     | ACP-01 routing or direct        | Customer asks about specific coverage type             |
| ACP-10 routing            | Need Discovery exit             | Health identified as primary need                      |
| Direct re-entry           | Customer re-states health topic | Mid-conversation pivot to health insurance             |

---

## Exit Points

| Exit Type          | Condition                                                   | Next State / ACP             |
|--------------------|-------------------------------------------------------------|------------------------------|
| Success — Lead     | Lead captured after education delivered                     | CRM write; handoff to Jirawat |
| Success — No Lead  | Customer satisfied with information; no lead ready          | Session remains open          |
| Medical Redirect   | Customer mentions pre-existing condition                    | → ACP-04 MEDICAL_ADVISOR     |
| Trust Override     | Trust/fraud signal detected                                 | → ACP-08 TRUST_ADVISOR       |
| Recommendation     | Customer ready for specific product recommendation          | → ACP-09 RECOMMENDATION_ENGINE |
| Tax Cross-sell     | Customer asks about tax deduction angle                     | → ACP-05 TAX_ADVISOR (then return) |

---

## Interrupt Rules

| Interrupt Trigger               | Priority   | Action                                              |
|---------------------------------|------------|-----------------------------------------------------|
| Trust/fraud signal              | CRITICAL   | → ACP-08 immediately                               |
| Pre-existing condition mention  | HIGH       | → ACP-04; do not answer underwriting Qs in ACP-02  |
| Customer requests Jirawat       | MEDIUM     | Provide contact; offer to continue                  |

---

## Resume Rules

| Scenario                              | Resume Allowed | Conditions                                              |
|---------------------------------------|---------------|---------------------------------------------------------|
| Returning from ACP-04 (medical)       | Yes           | Resume with medical context added to customer profile   |
| Returning from ACP-08 (trust)         | Yes           | Resume only if trust concern resolved                   |
| Returning from ACP-05 (tax)           | Yes           | Resume health education with tax benefit noted          |
| After session timeout                 | No            | Restart from greeting                                   |

---

## Composition Rules

| Position      | Capability                  | Condition                                        |
|---------------|-----------------------------|--------------------------------------------------|
| BEFORE ACP-02 | ACP-01 GREETING             | Standard entry via intent detection              |
| BEFORE ACP-02 | ACP-10 NEED_DISCOVERY       | When health need identified through exploration  |
| DURING ACP-02 | ACP-04 MEDICAL_ADVISOR      | Interrupt when pre-existing condition mentioned  |
| DURING ACP-02 | ACP-08 TRUST_ADVISOR        | Always available interrupt                       |
| AFTER ACP-02  | ACP-09 RECOMMENDATION_ENGINE | When customer is ready for specific product      |
| AFTER ACP-02  | ACP-05 TAX_ADVISOR          | When customer asks about tax deductions          |

---

## Conversation Flow Summary

```
[ACP-02 activated with health intent]
        ↓
[Answer the customer's health insurance question FIRST]
        ↓
[Explain relevant coverage concept (IPD / OPD / room rate)]
        ↓
[Customer mentions pre-existing condition?]
   Yes → [→ ACP-04 MEDICAL_ADVISOR]
   No  ↓
[Ask ONE discovery question (age, existing coverage, or specific concern)]
        ↓
[Customer provides context]
        ↓
[Deliver personalized coverage guidance]
        ↓
[Customer ready for lead capture?]
   Yes → [Collect name + phone → CRM → Jirawat handoff]
   No  → [Continue education until ready]
```

**Detailed Thai conversation examples are in `Examples.md`.**
