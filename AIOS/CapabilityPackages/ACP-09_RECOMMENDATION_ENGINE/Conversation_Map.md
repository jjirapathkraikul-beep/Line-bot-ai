---
Document ID: ACP-09-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Conversation Map

---

## Entry Points

| Entry Trigger                  | Source              | Condition                                                 |
|--------------------------------|---------------------|-----------------------------------------------------------|
| `ask_recommendation` intent    | Any ACP             | Customer explicitly asks for a recommendation             |
| `ready_for_recommendation`     | Any ACP             | Customer signals readiness for suggestion                 |
| Advisory ACP completion signal | ACP-02 through ACP-07 | Context threshold met; customer ready for recommendation |
| ACP-10 completion              | NEED_DISCOVERY      | Primary need and budget identified; ready for recommendation |

---

## Exit Points

| Exit Type               | Condition                                             | Next State                              |
|-------------------------|-------------------------------------------------------|-----------------------------------------|
| Success — Lead          | Recommendation delivered; lead captured               | CRM write; Jirawat handoff              |
| Success — Informed      | Recommendation delivered; customer not ready for lead | Session open; await customer decision   |
| Context Incomplete      | Missing required context; asked for 1 missing piece   | Return to relevant ACP for context      |
| Trust Override          | Trust signal detected                                 | → ACP-08 TRUST_ADVISOR                 |

---

## Interrupt Rules

| Interrupt Trigger           | Priority   | Action                                              |
|-----------------------------|------------|-----------------------------------------------------|
| Trust signal                | CRITICAL   | → ACP-08 immediately; recommendation suspended      |
| Customer pushes back on rec | MEDIUM     | Acknowledge; ask what doesn't fit; adjust or offer alternative |
| Customer overwhelmed        | MEDIUM     | Reduce to 1 product; simplify; offer Jirawat call   |

---

## Resume Rules

| Scenario                       | Resume Allowed | Conditions                                          |
|--------------------------------|---------------|-----------------------------------------------------|
| After ACP-08 (trust) resolved  | Yes           | After 2-turn cooling; recommendation may restart    |
| After context collection       | Yes           | After missing context obtained from advisory ACP    |
| Session timeout                | No            | Restart from greeting                               |

---

## Composition Rules

| Position      | Capability                  | Condition                                                   |
|---------------|-----------------------------|-------------------------------------------------------------|
| BEFORE ACP-09 | ACP-02 through ACP-07       | Advisory context must be established before recommendation  |
| BEFORE ACP-09 | ACP-10 NEED_DISCOVERY       | Need discovery may directly feed recommendation             |
| DURING ACP-09 | ACP-08 TRUST_ADVISOR        | Always available interrupt                                  |
| AFTER ACP-09  | Lead capture                | Lead captured after recommendation delivered                |

---

## Conversation Flow Summary

```
[ACP-09 activated — recommendation request]
        ↓
[Activation requirements check]
   Missing context → [Ask ONE missing question → return to advisory ACP → back to ACP-09]
   All present    ↓
[Select 1-2 products based on context match]
        ↓
[Deliver recommendation with rationale citing customer's words]
   Format: "จากที่คุณบอกว่า [customer quote] ผมแนะนำ [product] เพราะ [reason]"
        ↓
[Deliver second product if warranted (different need/category)]
        ↓
[Lead capture offer]
   "ถ้าสนใจ คุณจิรวัฒน์สามารถคำนวณเบี้ยที่แน่ชัดและอธิบายรายละเอียดได้เลยครับ ฝากชื่อและเบอร์ไว้ได้ครับ"
```

**Detailed Thai examples in `Examples.md`.**
