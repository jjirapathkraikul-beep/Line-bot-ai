---
Document ID: ACP-06-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Memory Requirements

---

## Required Memory

| Field                              | Source          | Purpose                                                   |
|------------------------------------|-----------------|-----------------------------------------------------------|
| `customer.age`                     | CRM / session   | Core for retirement timeline personalization              |
| `customer.existing_savings`        | Session         | Integrate into retirement picture                         |
| `trust.signal_detected`            | Trust Engine    | Suspend lead capture if present                           |
| `session.education_turn_count`     | Session memory  | Ensure context before lead capture                        |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                       |
|------------------------------------|-------------|----------------------------------------------------------|
| `customer.name`                    | CRM         | Personalize responses                                    |
| `customer.income_range`            | CRM / ACP-05| Estimate affordable monthly premium                      |
| `customer.retirement_age_goal`     | Session     | Personalize target date                                  |

---

## Working Memory

| Field                                 | Type      | Description                                              |
|---------------------------------------|-----------|----------------------------------------------------------|
| `retirement.age_captured`             | Boolean   | Whether age has been provided                            |
| `retirement.years_to_retirement`      | Integer   | Calculated from age; assumed retirement at 60            |
| `retirement.existing_savings_noted`   | Boolean   | Whether existing savings discussed                       |
| `retirement.monthly_income_goal`      | Integer   | Customer's stated or estimated retirement income target  |
| `retirement.lead_eligible`            | Boolean   | TRUE after age + savings context captured                |
| `retirement.lead_captured`            | Boolean   | Whether lead captured this session                       |

---

## CRM Fields Written on Completion

| Field                              | Value Written                          | Condition                           |
|------------------------------------|----------------------------------------|-------------------------------------|
| `crm.retirement_interest_confirmed`| TRUE                                   | Always                              |
| `crm.age_at_inquiry`               | Customer age                           | If captured                         |
| `crm.existing_savings_status`      | Brief description                      | If discussed                        |
| `crm.retirement_income_goal`       | Target monthly income                  | If articulated                      |
| `crm.retirement_lead_captured`     | TRUE / FALSE                           | Always                              |

---

## Never Ask Again Fields

- Customer age (once provided this session)
- Existing savings status (once discussed)
- Retirement age goal (once articulated)
- Customer name and phone (once captured)
