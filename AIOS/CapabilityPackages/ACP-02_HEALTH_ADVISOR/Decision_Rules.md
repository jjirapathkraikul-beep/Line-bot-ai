---
Document ID: ACP-02-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Decision Rules

**Priority Level**: STANDARD
*(ACP-08 TRUST_ADVISOR overrides at CRITICAL priority at all times)*

---

## Activation Conditions

| Condition                                      | Logic                                                  |
|------------------------------------------------|--------------------------------------------------------|
| Health insurance intent detected               | `intent IN [product_health, ask_premium_health, ask_ipd, ask_opd, ask_room_rate]` |
| Routing from ACP-01 with health intent         | `routing_target == ACP-02`                             |
| Customer pivots to health mid-conversation     | Health keyword detected while in another ACP           |

---

## Preconditions

| Precondition                | Required Value        |
|-----------------------------|-----------------------|
| Trust Engine loaded         | TRUE                  |
| ACP-08 not currently active | TRUE                  |
| Session active              | TRUE                  |

---

## Execution Conditions

ACP-02 executes in this order:

1. **Answer First**: Always answer the customer's health question before asking anything.
2. **Educate on Coverage Concept**: Explain the relevant concept (IPD, OPD, room rate, limit).
3. **Trust Scan on Every Message**: Run Trust Engine on every customer message.
4. **Pre-existing Condition Check**: If customer mentions a health condition → route to ACP-04.
5. **Discovery Question**: After initial answer, ask ONE follow-up question to personalize guidance.
6. **Lead Capture Eligibility**: Lead capture only after at least ONE educational turn completed.

### Coverage Education Priority Order

When multiple concepts are relevant, educate in this order:
1. IPD (hospitalization) — most impactful; customer needs to understand this first
2. OPD (out-patient) — secondary
3. Room rate — often the most asked-about cost element
4. Annual limit — important for planning
5. Co-payment — explain when customer asks about cost-sharing

---

## Exit Conditions

| Condition                                       | Exit Type         |
|-------------------------------------------------|-------------------|
| Lead captured (name + phone)                    | Success           |
| Customer explicitly ends conversation           | No-lead success   |
| Pre-existing condition question detected        | Medical redirect  |
| Trust signal detected                           | Interrupt         |
| Customer asks for specific product → ACP-09     | Recommendation    |

---

## Interrupt Conditions

| Trigger                           | Priority | Action                                         |
|-----------------------------------|----------|------------------------------------------------|
| Trust signal in any message       | CRITICAL | → ACP-08; suspend lead capture                 |
| Pre-existing condition mentioned  | HIGH     | → ACP-04; do not attempt underwriting response |
| Customer requests Jirawat         | MEDIUM   | Provide contact; offer AI continuation         |

---

## Recovery Conditions

| Recovery Scenario                          | Action                                             |
|--------------------------------------------|----------------------------------------------------|
| Returning from ACP-04 (medical resolved)   | Resume ACP-02 with medical context; don't re-educate IPD/OPD |
| Returning from ACP-08 (trust resolved)     | Resume from last education point; delay lead capture 2 turns |
| NLU confidence low on health sub-topic     | Ask: "ถามเรื่อง IPD/OPD หรือเรื่องเบี้ยประกันครับ?" |

---

## Fallback Rules

| Scenario                                   | Fallback Action                                    |
|--------------------------------------------|----------------------------------------------------|
| Customer asks for premium without age      | Explain that age affects premium; ask age first    |
| Customer asks about a specific plan name   | Explain plan category; offer to discuss with Jirawat for specifics |
| Customer asks about hospital network       | Acknowledge; refer to Jirawat for latest network list |
| All Qs answered; customer undecided        | Summarize key benefit; invite them to share age for estimate |

---

## Conflict Resolution

| Conflict                                    | Resolution                                                |
|---------------------------------------------|-----------------------------------------------------------|
| Health + tax question in same message       | Answer health first; then note tax benefit briefly; route to ACP-05 if deep tax question |
| Health + medical underwriting in same msg   | Answer health concept first; route to ACP-04 for underwriting |
| Customer wants quote + has pre-existing     | Route to ACP-04 first; premium discussion after medical clarification |
