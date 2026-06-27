---
Document ID: ACP-09-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Memory Requirements

---

## Required Memory (All Must Be Present Before Recommendation)

| Field                           | Source                   | Purpose                                              |
|---------------------------------|--------------------------|------------------------------------------------------|
| `customer.age`                  | Any prior ACP / CRM      | Age-appropriate product matching                     |
| `customer.primary_goal`         | ACP-10 or advisory ACP   | Goal-aligned product selection                       |
| At least ONE of the following:  |                          |                                                      |
| `customer.budget_range`         | ACP-10 or advisory       | Budget-appropriate product selection                 |
| `customer.health_conditions`    | ACP-04                   | Health-aware recommendation                          |
| `customer.risk_profile`         | ACP-07                   | Investment-appropriate recommendation                |
| `customer.existing_coverage`    | Any ACP                  | Gap analysis for recommendation                      |
| `customer.life_stage`           | ACP-10                   | Life-stage-appropriate recommendation                |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                      |
|------------------------------------|-------------|----------------------------------------------------------|
| `customer.tax_intent`              | ACP-05      | Prioritize tax-efficient products                        |
| `customer.retirement_concern`      | ACP-06      | Include retirement product if relevant                   |
| `customer.cancer_concern`          | ACP-03      | Include cancer product if relevant                       |
| `customer.name`                    | CRM         | Personalize recommendation delivery                      |
| `customer.income_range`            | CRM / ACP-05| Validate premium affordability for recommendation        |

---

## Working Memory

| Field                                   | Type      | Description                                          |
|-----------------------------------------|-----------|------------------------------------------------------|
| `rec.context_completeness_score`        | Integer   | Count of context fields present (≥3 required)        |
| `rec.products_selected`                 | List      | 1-2 products selected for recommendation             |
| `rec.rationale_by_product`              | Map       | Customer quote or fact cited for each product        |
| `rec.recommendation_delivered`          | Boolean   | TRUE after recommendation message sent               |
| `rec.lead_eligible`                     | Boolean   | TRUE after recommendation delivered                  |
| `rec.lead_captured`                     | Boolean   | Whether lead captured this session                   |

---

## CRM Fields Written on Completion

| Field                                  | Value Written                              | Condition                          |
|----------------------------------------|--------------------------------------------|------------------------------------|
| `crm.recommendation_delivered`         | TRUE                                       | Always                             |
| `crm.products_recommended`             | List of products                           | Always                             |
| `crm.recommendation_rationale`         | Rationale for each product (customer quote)| Always                             |
| `crm.context_richness_score`           | Integer (context field count)              | Always                             |
| `crm.recommendation_lead_captured`     | TRUE / FALSE                               | Always                             |
| `crm.pre_existing_flag`                | TRUE / FALSE                               | If health conditions noted         |

---

## Never Ask Again Fields

- Customer age (once known)
- Customer primary goal (once articulated)
- Budget range (once provided)
- Risk profile (once classified by ACP-07)
- Health conditions (once disclosed)
- Customer name and phone (once captured)
