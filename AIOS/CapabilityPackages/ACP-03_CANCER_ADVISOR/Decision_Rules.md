---
Document ID: ACP-03-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03 Decision Rules

**Priority Level**: STANDARD
*(ACP-08 TRUST_ADVISOR overrides at CRITICAL; emotional escalation elevates to HIGH)*

---

## Activation Conditions

| Condition                              | Logic                                                             |
|----------------------------------------|-------------------------------------------------------------------|
| Cancer insurance intent detected       | `intent IN [product_cancer, ask_about_cancer, ask_lump_sum, fear_cancer]` |
| Cancer keyword in message              | Keywords: มะเร็ง, cancer, เนื้องอก, chemotherapy                  |
| ACP-10 routing with cancer concern     | `routing_target == ACP-03 AND need == cancer_protection`         |

---

## Preconditions

| Precondition                   | Required Value     |
|--------------------------------|--------------------|
| Trust Engine loaded            | TRUE               |
| ACP-08 not currently active    | TRUE               |
| Session active                 | TRUE               |

---

## Execution Conditions

1. **Emotion Check First**: Before generating any response, check for grief, fear, or personal cancer disclosure.
2. **If emotional signal detected**: Lead with empathy acknowledgment. Do not pitch or educate immediately.
3. **If no emotional signal**: Answer the cancer question directly.
4. **Coverage Model Education**: After answering, explain lump sum vs. treatment-based if not yet covered.
5. **Cancer History Check**: If customer discloses personal or family cancer history → route to ACP-04.
6. **Discovery Question**: Ask ONE follow-up question per turn.
7. **Lead Capture Eligibility**: Only after at least one education turn AND no recent emotional disclosure AND no trust signal.

### Cancer Education Priority Order

| Step | Topic                            | When                                          |
|------|----------------------------------|-----------------------------------------------|
| 1    | What cancer insurance covers     | First response to any cancer inquiry          |
| 2    | Lump sum vs. treatment model     | After initial answer                          |
| 3    | Cancer stage coverage            | When customer asks about severity/conditions  |
| 4    | Waiting period                   | When customer asks about when coverage starts |
| 5    | Premium context                  | After age is known                            |

---

## Exit Conditions

| Condition                                    | Exit Type         |
|----------------------------------------------|-------------------|
| Lead captured                                | Success           |
| Customer satisfied; not ready for lead       | No-lead success   |
| Cancer history disclosed → ACP-04            | Medical redirect  |
| Trust signal detected → ACP-08              | Interrupt         |

---

## Interrupt Conditions

| Trigger                                | Priority  | Action                                             |
|----------------------------------------|-----------|----------------------------------------------------|
| Trust signal in any message            | CRITICAL  | → ACP-08; suspend ACP-03                           |
| Personal cancer diagnosis disclosed    | HIGH      | Pause all product discussion; lead with empathy    |
| Cancer history in family              | HIGH      | Acknowledge empathy; offer information only if welcomed |
| Customer requests Jirawat             | MEDIUM    | Provide contact; offer AI continuation             |

---

## Recovery Conditions

| Recovery Scenario                    | Action                                                   |
|--------------------------------------|----------------------------------------------------------|
| After ACP-04 (medical) resolved      | Resume cancer education; add medical context             |
| After ACP-08 (trust) resolved        | Resume after 2-turn delay; no lead capture in those turns |
| Customer re-engages after grief      | Follow customer's lead; do not re-initiate pitch         |

---

## Fallback Rules

| Scenario                                    | Fallback Action                                         |
|---------------------------------------------|---------------------------------------------------------|
| Customer asks about a specific cancer type  | Explain general coverage; note Jirawat can advise on specifics |
| Customer asks about survival statistics     | Do not provide medical statistics; redirect to coverage benefits |
| Customer asks if "this will help them survive" | Empathize; clarify financial protection role; never promise medical outcome |

---

## Conflict Resolution

| Conflict                                     | Resolution                                              |
|----------------------------------------------|---------------------------------------------------------|
| Cancer + health insurance in same message    | Address cancer question first; bridge to ACP-02 if needed |
| Emotional disclosure + product question      | Empathy first; product only after customer re-engages   |
| Cancer question + trust signal in same message | ACP-08 takes priority                                  |
