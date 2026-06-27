---
Document ID: ACP-10-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-10 Conversation Map

---

## Entry Points

| Entry Trigger              | Source              | Condition                                               |
|----------------------------|---------------------|---------------------------------------------------------|
| `unclear_intent`           | ACP-01 routing      | No clear product intent after greeting                  |
| `ask_general_advice`       | ACP-01 routing      | Customer asks for general insurance advice              |
| `general_inquiry`          | ACP-01 routing      | Product-unspecified insurance interest                  |
| Mid-conversation reset     | Any ACP             | Customer says "ไม่รู้จะเลือกอะไรดี" mid-conversation   |

---

## Exit Points

| Exit Type              | Condition                                                  | Next State                          |
|------------------------|------------------------------------------------------------|-------------------------------------|
| Health need identified | `primary_concern == health`                                | → ACP-02 HEALTH_ADVISOR            |
| Cancer concern         | `primary_concern == cancer`                                | → ACP-03 CANCER_ADVISOR            |
| Medical condition      | `primary_concern == medical` or condition disclosed        | → ACP-04 MEDICAL_ADVISOR           |
| Tax motivation         | `primary_concern == tax`                                   | → ACP-05 TAX_ADVISOR               |
| Retirement need        | `primary_concern == retirement`                            | → ACP-06 RETIREMENT_ADVISOR        |
| Investment interest    | `primary_concern == investment`                            | → ACP-07 INVESTMENT_ADVISOR        |
| Trust Override         | Trust signal                                               | → ACP-08 TRUST_ADVISOR             |
| Unclear after 5 turns  | Primary need not identified                                | → ACP-09 with partial context      |

---

## Interrupt Rules

| Interrupt Trigger            | Priority   | Action                                              |
|------------------------------|------------|-----------------------------------------------------|
| Trust signal                 | CRITICAL   | → ACP-08 immediately                              |
| Specific product mention     | HIGH       | Exit ACP-10 early; route directly to product ACP   |
| Customer overwhelmed (signals)| MEDIUM    | Offer simple menu; reduce question pace             |

---

## Resume Rules

| Scenario                        | Resume Allowed | Conditions                                        |
|---------------------------------|---------------|---------------------------------------------------|
| After ACP-08 (trust) resolved   | Yes           | Resume from last discovery question               |
| After advisory ACP returns      | No            | ACP-10's job is complete after routing            |
| Session timeout                 | No            | Restart from greeting                             |

---

## Composition Rules

| Position       | Capability                    | Condition                                           |
|----------------|-------------------------------|-----------------------------------------------------|
| BEFORE ACP-10  | ACP-01 GREETING               | Standard entry from unclear intent                  |
| DURING ACP-10  | ACP-08 TRUST_ADVISOR          | Always available interrupt                          |
| AFTER ACP-10   | ACP-02 through ACP-07         | Based on identified primary need                    |
| AFTER ACP-10   | ACP-09 RECOMMENDATION         | Only if 5 turns exhausted without clear primary need |

---

## Discovery Sequence (One Question Per Turn)

```
Turn 1: Life Stage Question
   "ตอนนี้อยู่ในช่วงชีวิตไหนครับ? เช่น โสดทำงานอยู่ แต่งงานแล้ว มีลูกแล้ว หรือใกล้เกษียณ?"

        ↓ Customer answers

Turn 2: Primary Concern Question
   "มีเรื่องอะไรที่เป็นกังวลหลักๆ ครับ? เช่น เรื่องสุขภาพ การเงิน เงินออม หรือการดูแลครอบครัว?"

        ↓ Customer answers — early exit if specific product/need identified

Turn 3: Budget Range Question (only after life stage AND concern known)
   "งบประมาณสำหรับประกันต่อปีคร่าวๆ อยู่ในช่วงไหนครับ?"

        ↓ Customer answers

Turn 4: Existing Coverage Question
   "ตอนนี้มีประกันอยู่บ้างแล้วไหมครับ?"

        ↓ Customer answers

Turn 5: Goal Confirmation
   "ถ้าให้สรุปในหนึ่งประโยค เป้าหมายหลักที่อยากได้จากประกันคืออะไรครับ?"

        ↓ Primary need identified → route to advisory ACP
```

**Detailed Thai examples in `Examples.md`.**
