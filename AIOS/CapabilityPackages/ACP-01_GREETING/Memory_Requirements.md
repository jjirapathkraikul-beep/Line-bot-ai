---
Document ID: ACP-01-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Memory Requirements

---

## Required Memory (Must Check Before Responding)

| Field                        | Source              | Purpose                                                |
|------------------------------|---------------------|--------------------------------------------------------|
| `session.is_new`             | Session state       | Determine if this is a new or returning session        |
| `session.message_count`      | Session state       | Confirm this is the first message                      |
| `trust.signal_detected`      | Trust Engine        | Check for any prior trust signal in session            |
| `customer.prior_greeting`    | Session memory      | Avoid redundant greeting if already greeted this session |

---

## Optional Memory

| Field                        | Source              | Usage if Available                                     |
|------------------------------|---------------------|--------------------------------------------------------|
| `customer.preferred_name`    | CRM / prior session | Personalize greeting with name if known                |
| `customer.last_session_date` | CRM                 | Tailor welcome-back message for returning customers    |
| `customer.last_intent`       | CRM                 | Pre-route if returning customer has consistent intent  |

---

## Working Memory (Maintained During ACP-01 Execution)

| Field                           | Type     | Description                                           |
|---------------------------------|----------|-------------------------------------------------------|
| `greeting.state`                | Enum     | `AWAITING_REPLY` / `INTENT_IDENTIFIED` / `COMPLETE`   |
| `greeting.turn_count`           | Integer  | Number of turns taken in greeting phase               |
| `greeting.intent_detected`      | String   | Intent token identified from customer reply           |
| `greeting.routing_target`       | String   | ACP to route to (set before exit)                     |
| `greeting.trust_scan_result`    | Boolean  | Result of Trust Engine scan on this session           |

---

## Customer Profile Fields

Fields that ACP-01 may READ from profile (if available) but must NEVER WRITE:

| Field                  | Action  | Notes                                                     |
|------------------------|---------|-----------------------------------------------------------|
| `customer.name`        | READ    | Use to personalize if available; never ask for it         |
| `customer.phone`       | READ    | Never request during greeting                             |
| `customer.age`         | READ    | Never request during greeting                             |

---

## CRM Fields Written on Completion

| Field                            | Value Written                          | Condition                  |
|----------------------------------|----------------------------------------|----------------------------|
| `crm.conversation_start`         | Timestamp of session start             | Always                     |
| `crm.initial_intent`             | Intent token detected                  | On successful intent detect |
| `crm.greeting_completed`         | TRUE                                   | On successful exit          |
| `crm.routing_target`             | ACP ID routed to                       | On successful exit          |

---

## Conversation Summary Written on Exit

```
Session started at [timestamp]. Customer sent greeting/opening message.
Intent detected: [intent_token]. Routed to: [ACP_ID].
Trust signal detected: [TRUE/FALSE].
```

---

## Known Facts (Protected)

If any of the following facts are already known from prior session or CRM, they must NOT be re-asked:

| Field              | Protection Rule                                                 |
|--------------------|-----------------------------------------------------------------|
| Customer name      | If in CRM, use it; never ask again in same session              |
| Customer phone     | If in CRM, never ask again in same session                      |
| Prior intent       | If returning customer with known intent, pre-route              |

---

## Never Ask Again Fields

The following fields must NEVER be collected or requested during ACP-01:

- Customer name
- Customer phone number
- Customer age
- Customer health status
- Any financial information
- Any personal identification

These fields are collected only in later ACPs after substantive value has been delivered.
