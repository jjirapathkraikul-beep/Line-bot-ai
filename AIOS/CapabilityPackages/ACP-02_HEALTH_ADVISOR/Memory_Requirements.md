---
Document ID: ACP-02-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Memory Requirements

---

## Required Memory (Must Check Before Responding)

| Field                            | Source           | Purpose                                                    |
|----------------------------------|------------------|------------------------------------------------------------|
| `customer.age`                   | CRM / session    | Required before any premium discussion                     |
| `customer.health_conditions`     | Session memory   | Check for pre-existing conditions before coverage guidance |
| `trust.signal_detected`          | Trust Engine     | Suspend lead capture if trust signal present               |
| `session.education_turn_count`   | Session memory   | Ensure at least 1 education turn before lead capture       |
| `customer.existing_health_coverage` | CRM / session | Avoid re-explaining coverage they already have             |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                      |
|------------------------------------|-------------|--------------------------------------------------------|
| `customer.name`                    | CRM         | Personalize responses                                  |
| `customer.occupation`              | CRM         | Personalize risk context (e.g., active job vs desk job)|
| `customer.family_status`           | Session     | Suggest individual vs family plan                      |
| `customer.income_range`            | CRM         | Help with premium affordability framing                |

---

## Working Memory (Maintained During ACP-02 Execution)

| Field                                  | Type      | Description                                           |
|----------------------------------------|-----------|-------------------------------------------------------|
| `health.intent_subtype`                | Enum      | IPD / OPD / ROOM_RATE / PREMIUM / LIMIT / GENERAL     |
| `health.education_topics_covered`      | List      | Tracks which concepts have been explained             |
| `health.age_captured`                  | Boolean   | Whether customer age has been collected               |
| `health.coverage_interest`             | Enum      | Individual / Family / Both                            |
| `health.pre_existing_flagged`          | Boolean   | Whether pre-existing condition was mentioned          |
| `health.lead_eligible`                 | Boolean   | TRUE after min. 1 education turn with no trust signal |
| `health.lead_captured`                 | Boolean   | Whether lead has been captured in this session        |

---

## Customer Profile Fields

| Field                            | Action  | Notes                                                        |
|----------------------------------|---------|--------------------------------------------------------------|
| `customer.age`                   | READ/WRITE | Capture if not known; required for premium context       |
| `customer.name`                  | READ    | Use if available; never re-ask                               |
| `customer.phone`                 | READ/WRITE | Capture at lead stage; never before education delivered  |
| `customer.health_conditions`     | READ    | Check before coverage guidance; update if new info shared    |
| `customer.existing_health_coverage` | READ | Check to avoid duplicate coverage guidance                |

---

## CRM Fields Written on Completion

| Field                              | Value Written                            | Condition                             |
|------------------------------------|------------------------------------------|---------------------------------------|
| `crm.health_interest_confirmed`    | TRUE                                     | Always on ACP-02 completion           |
| `crm.health_coverage_interest`     | Individual / Family / Both               | When captured in session              |
| `crm.age_at_inquiry`               | Customer age                             | If age captured                       |
| `crm.health_lead_captured`         | TRUE / FALSE                             | Always                                |
| `crm.health_education_topics`      | List of topics covered                   | Always                                |
| `crm.pre_existing_flagged`         | TRUE / FALSE                             | Always                                |

---

## Conversation Summary Written on Exit

```
Customer inquired about health insurance (ประกันสุขภาพ).
Topics covered: [IPD/OPD/room rate/annual limit/co-payment].
Customer age: [age or UNKNOWN].
Pre-existing condition flagged: [TRUE/FALSE].
Coverage interest: [Individual/Family/Both].
Lead captured: [TRUE/FALSE].
```

---

## Known Facts (Protected)

| Field              | Protection Rule                                                       |
|--------------------|-----------------------------------------------------------------------|
| Customer age       | If captured this session, never ask again                             |
| Customer name      | If in CRM or captured, use in responses; never re-ask                 |
| Phone number       | If in CRM, do not request again                                       |
| Pre-existing info  | If flagged, do not ask again; route to ACP-04 with this context       |

---

## Never Ask Again Fields

Once the following are captured in a session, they must not be re-requested:
- Customer age (once provided, store and use throughout session)
- Customer name
- Phone number
- Existing health insurance status (if already answered)
