---
Document ID: ACP-10-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-10 Memory Requirements

---

## Required Memory (Must Check Before Starting Discovery)

| Field                           | Source          | Purpose                                                     |
|---------------------------------|-----------------|-------------------------------------------------------------|
| `session.intent_from_acp01`     | ACP-01 memory   | Confirm intent is genuinely unclear before starting         |
| `trust.signal_detected`         | Trust Engine    | Check for any prior trust signal                            |
| `customer.life_stage`           | Session memory  | Skip if already captured earlier in session                 |

---

## Optional Memory

| Field                            | Source      | Usage if Available                                        |
|----------------------------------|-------------|-----------------------------------------------------------|
| `customer.age`                   | CRM / session| May suggest life stage without asking explicitly          |
| `customer.name`                  | CRM         | Personalize discovery questions                           |
| `customer.existing_coverage`     | CRM         | Skip existing coverage question if already known          |

---

## Working Memory (Maintained During ACP-10 Execution)

| Field                                  | Type      | Description                                              |
|----------------------------------------|-----------|----------------------------------------------------------|
| `discovery.step`                       | Enum      | LIFE_STAGE / CONCERN / BUDGET / COVERAGE / GOAL          |
| `discovery.life_stage`                 | String    | Customer's life stage (once answered)                    |
| `discovery.primary_concern`            | String    | Customer's primary concern (once answered)               |
| `discovery.budget_range`               | String    | Customer's budget range (once answered)                  |
| `discovery.existing_coverage`          | String    | Customer's existing insurance (once answered)            |
| `discovery.primary_need`               | String    | Articulated need (from goal question or early exit)      |
| `discovery.routing_target`             | String    | ACP to route to based on identified need                 |
| `discovery.turn_count`                 | Integer   | Number of discovery turns completed                      |
| `discovery.early_exit_triggered`       | Boolean   | Whether early exit occurred due to specific signal       |

---

## Customer Profile Fields Written During ACP-10

| Field                              | Action  | Notes                                                       |
|------------------------------------|---------|-------------------------------------------------------------|
| `customer.life_stage`              | WRITE   | Record life stage for all subsequent ACPs                   |
| `customer.primary_concern`         | WRITE   | Record primary concern for routing and advisory context     |
| `customer.budget_range`            | WRITE   | Record for advisory ACP context                             |
| `customer.existing_coverage`       | WRITE   | Record for gap analysis in advisory ACP                     |
| `customer.primary_need`            | WRITE   | Record identified need for ACP routing decision             |

---

## CRM Fields Written on ACP-10 Completion

| Field                              | Value Written                         | Condition                              |
|------------------------------------|---------------------------------------|----------------------------------------|
| `crm.need_discovery_completed`     | TRUE                                  | Always                                 |
| `crm.life_stage`                   | Customer's life stage                 | If captured                            |
| `crm.primary_concern`              | Primary concern                       | If captured                            |
| `crm.budget_range`                 | Budget range                          | If captured                            |
| `crm.existing_coverage`            | Existing insurance description        | If captured                            |
| `crm.primary_need`                 | Identified primary need               | Always on exit                         |
| `crm.routed_to_acp`                | ACP ID routed to                      | Always                                 |
| `crm.discovery_turns`              | Number of turns in discovery          | Always                                 |

---

## Conversation Summary Written on Exit

```
Need Discovery completed in [N] turns.
Life stage: [life_stage or UNKNOWN].
Primary concern: [concern or UNKNOWN].
Budget range: [budget or UNKNOWN].
Existing coverage: [coverage or NONE/UNKNOWN].
Primary need identified: [need].
Routed to: [ACP_ID].
Early exit triggered: [TRUE/FALSE].
```

---

## Never Ask Again Fields

- Life stage (once answered in this session)
- Primary concern (once articulated)
- Budget range (once provided)
- Existing coverage status (once discussed)
- Customer name (if known)
