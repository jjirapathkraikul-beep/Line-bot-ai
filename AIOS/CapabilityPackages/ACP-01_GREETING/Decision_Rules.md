---
Document ID: ACP-01-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Decision Rules

**Priority Level**: STANDARD
*(ACP-08 TRUST_ADVISOR overrides at CRITICAL priority at all times)*

---

## Activation Conditions

ACP-01 activates when ANY of the following conditions are met:

| Condition                          | Logic                                                       |
|------------------------------------|-------------------------------------------------------------|
| Session is new (no prior messages) | `session.message_count == 0`                                |
| Greeting intent detected           | `intent IN [greeting, สวัสดี, unclear_opening]`             |
| Session idle restart               | `session.idle_duration > 30min AND new_message_received`   |

---

## Preconditions

Before ACP-01 executes, the following must be true:

| Precondition                    | Required Value         |
|---------------------------------|------------------------|
| Trust Engine loaded             | TRUE                   |
| Session initialized             | TRUE                   |
| No active CRITICAL interrupt    | FALSE (none active)    |

---

## Execution Conditions

During execution, ACP-01 follows these rules in order:

1. **Trust Check First**: Before generating any response, run Trust Engine scan on the incoming message.
2. **If trust signal**: STOP ACP-01 execution; activate ACP-08 immediately.
3. **If no trust signal**: Compose greeting response.
4. **Greeting response must include**: One warm welcome statement + one open-ended question.
5. **After customer reply**: Re-run Trust Engine scan on the reply.
6. **If trust signal in reply**: STOP; activate ACP-08.
7. **If no trust signal**: Classify intent from reply.
8. **Route based on intent**: See routing table below.

### Intent Routing Table

| Detected Intent                  | Route To               |
|----------------------------------|------------------------|
| `product_health`                 | ACP-02 HEALTH_ADVISOR  |
| `product_cancer`                 | ACP-03 CANCER_ADVISOR  |
| `medical_question`               | ACP-04 MEDICAL_ADVISOR |
| `product_tax`                    | ACP-05 TAX_ADVISOR     |
| `product_retirement`             | ACP-06 RETIREMENT_ADVISOR |
| `product_investment`             | ACP-07 INVESTMENT_ADVISOR |
| `trust_concern`                  | ACP-08 TRUST_ADVISOR   |
| `ask_recommendation`             | ACP-09 RECOMMENDATION_ENGINE |
| `unclear_intent`                 | ACP-10 NEED_DISCOVERY  |
| `ask_general_advice`             | ACP-10 NEED_DISCOVERY  |

---

## Exit Conditions

ACP-01 exits when:

| Condition                                      | Exit Type      |
|------------------------------------------------|----------------|
| Intent identified and routing target selected  | Success        |
| Trust signal detected                          | Interrupt       |
| Session timeout (no response)                  | Timeout        |
| Customer explicitly requests human agent       | Redirect       |

---

## Interrupt Conditions

| Interrupt Trigger          | Priority   | Immediate Action                     |
|----------------------------|------------|--------------------------------------|
| Trust signal detected      | CRITICAL   | Activate ACP-08; halt ACP-01         |
| Emergency keyword detected | HIGH       | Acknowledge urgency; fast-route      |
| Human agent request        | HIGH       | Provide contact; offer AI option     |

---

## Recovery Conditions

| Recovery Scenario                          | Action                                          |
|--------------------------------------------|-------------------------------------------------|
| ACP-08 resolves trust concern              | Resume ACP-01 from post-greeting state          |
| Customer re-greets after redirect          | Restart ACP-01 fresh                            |
| NLU fails to classify intent               | Default to ACP-10 NEED_DISCOVERY                |

---

## Fallback Rules

| Scenario                                   | Fallback Action                                 |
|--------------------------------------------|-------------------------------------------------|
| Intent unclear after 1 customer reply      | Route to ACP-10 NEED_DISCOVERY                  |
| NLU confidence below threshold (<60%)     | Ask one clarifying question; do not assume      |
| All routing options fail                   | Offer simple topic menu (health/tax/retirement/investment/other) |

---

## Conflict Resolution

| Conflict                                     | Resolution                                      |
|----------------------------------------------|-------------------------------------------------|
| Multiple intents in one message              | Prioritize in order: trust > health > tax > retirement > investment > unclear |
| Greeting + product question in same message  | Skip greeting phase; go directly to product ACP |
| Greeting + trust signal in same message      | Skip greeting; activate ACP-08 immediately      |
