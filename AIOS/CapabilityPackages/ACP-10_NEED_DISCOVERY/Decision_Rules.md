---
Document ID: ACP-10-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-10 Decision Rules

**Priority Level**: STANDARD (ACP-08 overrides at CRITICAL)

---

## Activation Conditions

| Condition                               | Logic                                                            |
|-----------------------------------------|------------------------------------------------------------------|
| Unclear intent detected                 | `intent IN [unclear_intent, ask_general_advice, general_inquiry]` |
| No product intent from ACP-01           | `routing_target == ACP-10`                                       |
| Customer expresses confusion mid-session | "ไม่รู้จะเลือกอะไรดี" in any ACP                               |

---

## Execution Conditions

STRICT SEQUENCE — enforced rigidly:

1. **Never start with a product**: First response must acknowledge the customer's uncertainty and begin discovery.
2. **Life Stage First**: Ask about life stage before anything else (especially before budget).
3. **Concern Second**: After life stage, ask about primary concern.
4. **Budget Third**: Ask about budget ONLY after life stage AND concern are understood.
5. **Existing Coverage Fourth**: Ask about existing insurance.
6. **Goal Confirmation Fifth**: Ask customer to articulate their goal in their own words.
7. **One Question Per Turn**: Never bundle two discovery questions.
8. **Early Exit Rule**: If customer reveals specific product interest at any point, exit ACP-10 and route immediately.

### Early Exit Triggers

| Signal in Customer Response          | Immediate Route To              |
|--------------------------------------|---------------------------------|
| "ประกันสุขภาพ" mentioned             | ACP-02 HEALTH_ADVISOR           |
| "มะเร็ง" mentioned                   | ACP-03 CANCER_ADVISOR           |
| "โรคประจำตัว" / health condition     | ACP-04 MEDICAL_ADVISOR          |
| "ภาษี" / "ลดหย่อน" mentioned        | ACP-05 TAX_ADVISOR              |
| "เกษียณ" mentioned                   | ACP-06 RETIREMENT_ADVISOR       |
| "ลงทุน" / "กำไร" mentioned          | ACP-07 INVESTMENT_ADVISOR       |
| Trust signal                         | ACP-08 TRUST_ADVISOR            |

---

## Exit Conditions

| Condition                               | Exit Action                                       |
|-----------------------------------------|---------------------------------------------------|
| Primary need identified (any turn)      | Route to appropriate advisory ACP immediately     |
| All 5 discovery turns completed         | Route to best-fit ACP based on accumulated context|
| Trust signal detected                   | → ACP-08                                          |
| 5 turns without clear need              | → ACP-09 with all available context              |

---

## Fallback Rules

| Scenario                                  | Fallback Action                                           |
|-------------------------------------------|-----------------------------------------------------------|
| Customer won't answer life stage question | Ask concern question instead; adapt sequence              |
| Customer gives vague answers to all Qs    | Offer simple topic menu at turn 4: health / savings / tax / retirement |
| Customer has no budget for insurance      | Acknowledge; explore if there is a minimum budget threshold; offer education anyway |
| Customer has ALL types of insurance       | Acknowledge; explore if there are gaps or coverage they're uncertain about |

---

## Conflict Resolution

| Conflict                                  | Resolution                                              |
|-------------------------------------------|---------------------------------------------------------|
| Customer mentions two needs at once       | Note both; ask which is more urgent                     |
| Budget mentioned before concern asked     | Note it; continue sequence from concern question        |
| Trust signal and product signal at once   | ACP-08 takes priority                                   |
