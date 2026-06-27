---
Document ID: ACP-05-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Memory Requirements

---

## Required Memory

| Field                             | Source          | Purpose                                               |
|-----------------------------------|-----------------|-------------------------------------------------------|
| `customer.income_range`           | Session / CRM   | Required before any specific tax savings estimate     |
| `customer.existing_deductions`    | Session         | Understand remaining quota before recommendation      |
| `trust.signal_detected`           | Trust Engine    | Suspend lead capture if present                       |
| `session.education_turn_count`    | Session memory  | Ensure education before lead capture                  |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                 |
|------------------------------------|-------------|-----------------------------------------------------|
| `customer.name`                    | CRM         | Personalize responses                              |
| `customer.existing_life_premium`   | Session     | Help identify remaining life insurance deduction   |
| `customer.existing_health_premium` | Session     | Help identify remaining health insurance deduction |

---

## Working Memory

| Field                                 | Type      | Description                                          |
|---------------------------------------|-----------|------------------------------------------------------|
| `tax.income_range_captured`           | Boolean   | Whether income range has been provided               |
| `tax.income_tier`                     | Enum      | UNDER_300K / 300K_500K / 500K_1M / OVER_1M           |
| `tax.deduction_life_used`             | Integer   | Life insurance deduction already used (THB)          |
| `tax.deduction_health_used`           | Integer   | Health insurance deduction already used (THB)        |
| `tax.remaining_life_quota`            | Integer   | Remaining life insurance deduction quota             |
| `tax.remaining_health_quota`          | Integer   | Remaining health insurance deduction quota           |
| `tax.lead_eligible`                   | Boolean   | TRUE after income range captured                     |
| `tax.lead_captured`                   | Boolean   | Whether lead captured this session                   |

---

## CRM Fields Written on Completion

| Field                              | Value Written                         | Condition                           |
|------------------------------------|---------------------------------------|-------------------------------------|
| `crm.tax_interest_confirmed`       | TRUE                                  | Always                              |
| `crm.income_tier`                  | Captured tier                         | If income range captured            |
| `crm.deduction_gap_life`           | Remaining life quota (THB)            | If deduction context established    |
| `crm.deduction_gap_health`         | Remaining health quota (THB)          | If deduction context established    |
| `crm.tax_lead_captured`            | TRUE / FALSE                          | Always                              |

---

## Conversation Summary on Exit

```
Customer inquired about tax deduction via insurance.
Income tier captured: [tier or UNKNOWN].
Life insurance deduction remaining: [THB or UNKNOWN].
Health insurance deduction remaining: [THB or UNKNOWN].
Lead captured: [TRUE/FALSE].
```

---

## Never Ask Again Fields

- Customer income range (once provided this session)
- Existing life insurance premiums (once confirmed)
- Existing health insurance premiums (once confirmed)
- Customer name and phone (once captured)
