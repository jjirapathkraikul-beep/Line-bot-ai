---
Document ID: ACP-07-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07 Memory Requirements

---

## Required Memory

| Field                           | Source          | Purpose                                                     |
|---------------------------------|-----------------|-------------------------------------------------------------|
| `customer.age`                  | CRM / session   | Age context for investment horizon                          |
| `customer.risk_profile`         | Session / CRM   | Prevent recommending ILP to known risk-averse customers     |
| `trust.signal_detected`         | Trust Engine    | Suspend lead capture if present                             |
| `session.risk_disclosure_given` | Session memory  | Track that mandatory disclosure was delivered               |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                       |
|------------------------------------|-------------|----------------------------------------------------------|
| `customer.investment_experience`   | Session     | Adjust explanation depth                                 |
| `customer.income_range`            | CRM / ACP-05| Understand investment capacity                           |
| `customer.existing_investments`    | Session     | Integrate with existing portfolio context                |

---

## Working Memory

| Field                                   | Type       | Description                                            |
|-----------------------------------------|------------|--------------------------------------------------------|
| `ilp.risk_disclosure_delivered`         | Boolean    | TRUE after mandatory risk disclosure in this session   |
| `ilp.risk_tolerance_questions_asked`    | Integer    | Count of risk tolerance questions asked                |
| `ilp.risk_profile_classified`           | Enum       | RISK_TOLERANT / RISK_AVERSE / UNASSESSED               |
| `ilp.redirect_to_savings`               | Boolean    | TRUE if customer classified as risk-averse             |
| `ilp.lead_eligible`                     | Boolean    | TRUE after risk profile classified                     |
| `ilp.lead_captured`                     | Boolean    | Whether lead captured this session                     |

---

## CRM Fields Written on Completion

| Field                              | Value Written                          | Condition                              |
|------------------------------------|----------------------------------------|----------------------------------------|
| `crm.ilp_interest_confirmed`       | TRUE                                   | Always                                 |
| `crm.risk_profile`                 | RISK_TOLERANT / RISK_AVERSE            | Always after assessment                |
| `crm.risk_disclosure_delivered`    | TRUE                                   | Always                                 |
| `crm.redirect_to_savings`          | TRUE / FALSE                           | Always                                 |
| `crm.ilp_lead_captured`            | TRUE / FALSE                           | Always                                 |
| `crm.investment_experience`        | Brief description                      | If mentioned by customer               |

---

## Never Ask Again Fields

- Risk profile (once classified in this session, do not re-ask same risk questions)
- Customer age (once provided)
- Investment experience (once described)
- Customer name and phone (once captured)
