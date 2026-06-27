---
Document ID: ACP-08-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Memory Requirements

---

## Required Memory (Must Check Before Responding)

| Field                           | Source        | Purpose                                                      |
|---------------------------------|---------------|--------------------------------------------------------------|
| `trust.signal_type`             | Trust Engine  | What type of signal was detected                             |
| `trust.signal_timestamp`        | Trust Engine  | When signal was detected                                     |
| `session.active_acp_suspended`  | Session state | Which ACP was active when trust concern triggered            |
| `trust.credentials_delivered`   | Session state | Whether credentials were already delivered this session      |

---

## Optional Memory

| Field                          | Source      | Usage if Available                                          |
|--------------------------------|-------------|-------------------------------------------------------------|
| `customer.name`                | CRM         | Use to personalize if already known; do NOT ask            |
| `session.prior_context`        | Session     | Understand what the customer was doing before trust concern |

---

## Working Memory (Maintained During ACP-08 Execution)

| Field                                | Type      | Description                                               |
|--------------------------------------|-----------|-----------------------------------------------------------|
| `trust.acp08_active`                 | Boolean   | TRUE while ACP-08 is handling trust concern               |
| `trust.concern_acknowledged`         | Boolean   | TRUE after first acknowledgment                           |
| `trust.credentials_delivered`        | Boolean   | TRUE after credentials provided to customer               |
| `trust.oic_verification_offered`     | Boolean   | TRUE after OIC verification channel mentioned             |
| `trust.resolution_turns_remaining`   | Integer   | Countdown: 2 turns after trust resolved                   |
| `trust.customer_satisfied`           | Boolean   | Whether customer explicitly resolved concern              |
| `trust.escalated_to_jirawat`         | Boolean   | Whether Jirawat contact was offered                       |

---

## Customer Profile Fields

| Field                    | Action   | Notes                                                         |
|--------------------------|----------|---------------------------------------------------------------|
| ALL customer data fields | READ ONLY | During ACP-08, NO data collection is permitted for any field |

---

## CRM Fields Written on ACP-08 Activation (Immediate)

| Field                              | Value Written                              | Condition                    |
|------------------------------------|--------------------------------------------|------------------------------|
| `crm.trust_signal_detected`        | TRUE                                       | Always on activation         |
| `crm.trust_signal_type`            | Signal keyword or intent classification    | Always                       |
| `crm.trust_signal_timestamp`       | Timestamp                                  | Always                       |
| `crm.trust_acp_suspended`          | ACP ID that was suspended                  | Always                       |
| `crm.jirawat_review_flag`          | TRUE — requires Jirawat manual review      | Always                       |

## CRM Fields Written on ACP-08 Completion

| Field                              | Value Written                              | Condition                    |
|------------------------------------|--------------------------------------------|------------------------------|
| `crm.trust_resolved`               | TRUE / FALSE                               | Always                       |
| `crm.trust_resolution_turns`       | Number of turns to resolution              | Always                       |
| `crm.jirawat_contact_offered`      | TRUE / FALSE                               | Always                       |

---

## Conversation Summary Written on Exit

```
TRUST ALERT: Trust/fraud concern detected at [timestamp].
Signal type: [keyword/intent].
ACP suspended: [ACP_ID].
Credentials delivered: TRUE.
OIC verification offered: TRUE.
Trust resolved: [TRUE/FALSE].
Jirawat contact offered: [TRUE/FALSE].
Jirawat manual review: REQUIRED.
```

---

## Never Ask Again During ACP-08

EVERY data collection field is prohibited during ACP-08. This is absolute. No exceptions.
The following fields are specifically called out as the highest-risk violation points:

- Customer name (NEVER request during trust concern)
- Customer phone number (NEVER request during trust concern)
- Customer health information (NEVER request during trust concern)
- Any financial information (NEVER request during trust concern)
