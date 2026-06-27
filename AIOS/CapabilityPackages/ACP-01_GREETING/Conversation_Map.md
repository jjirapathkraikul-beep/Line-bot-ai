---
Document ID: ACP-01-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Conversation Map

---

## Entry Points

| Entry Trigger               | Source                              | Condition                                    |
|-----------------------------|-------------------------------------|----------------------------------------------|
| `greeting` intent           | Any message                         | Session is new or has been idle > 30 minutes |
| `first_message` event       | System event                        | First message of a new conversation session  |
| `สวัสดี` keyword            | Customer message                    | Keyword present in message text              |
| `unclear_opening` intent    | NLU classification                  | Message opens conversation without topic     |

---

## Exit Points

| Exit Type        | Condition                                              | Next State / ACP           |
|------------------|--------------------------------------------------------|----------------------------|
| Success          | Intent identified from customer's reply                | Route to appropriate ACP   |
| Timeout          | No customer reply within session window                | Session closed; no CRM write |
| Trust Override   | Trust/fraud signal detected at any point               | → ACP-08 TRUST_ADVISOR     |
| User Redirect    | Customer explicitly asks to speak with Jirawat         | Provide contact; offer to continue |
| Confusion Exit   | Customer unable to express intent after 2 attempts     | → ACP-10 NEED_DISCOVERY    |

---

## Interrupt Rules

| Interrupt Trigger           | Priority   | Action                                              |
|-----------------------------|------------|-----------------------------------------------------|
| Trust/fraud signal          | CRITICAL   | Immediately activate ACP-08; suspend ACP-01         |
| Request to speak to human   | HIGH       | Provide Jirawat's contact; offer AI continuation    |
| Emergency/urgent keyword    | HIGH       | Acknowledge urgency; fast-track to relevant ACP     |

**Trust signals always interrupt this capability, regardless of conversation state.**

---

## Resume Rules

| Scenario                           | Resume Allowed | Conditions                                   |
|------------------------------------|---------------|----------------------------------------------|
| After trust concern resolved       | Yes           | Resume from where interrupted; do not restart |
| After human contact redirect       | Yes           | If customer chooses to continue with AI       |
| After session timeout              | No            | Start a new greeting; treat as new session    |

---

## Composition Rules

| Position        | Capability              | Condition                                      |
|-----------------|-------------------------|------------------------------------------------|
| BEFORE ACP-01   | None (ACP-01 is start)  | ACP-01 is always the conversation entry point  |
| AFTER ACP-01    | ACP-02 through ACP-10   | Based on intent detected from customer reply   |
| DEFAULT AFTER   | ACP-10 NEED_DISCOVERY   | When intent is not clear after 1 greeting turn |

---

## Conversation Flow Summary

```
[Customer sends first message]
        ↓
[ACP-01 activated]
        ↓
[Trust Engine checks message] → Trust signal? → [ACP-08 TRUST_ADVISOR]
        ↓ No
[Deliver greeting + one open-ended question]
        ↓
[Customer replies]
        ↓
[Trust Engine checks reply] → Trust signal? → [ACP-08 TRUST_ADVISOR]
        ↓ No
[NLU classifies intent]
        ↓
[Exact intent identified?]
   Yes ↓                    No ↓
[Route to specific ACP]    [Route to ACP-10 NEED_DISCOVERY]
```

**Detailed conversation examples with Thai dialogue are in `Examples.md`.**
