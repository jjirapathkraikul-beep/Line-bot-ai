---
Document ID: ACP-02-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                          | Description                                                                                     | Priority |
|--------------------------------------|-------------------------------------------------------------------------------------------------|----------|
| Premium Range Calculator             | After age and health profile collected, provide indicative premium range (not exact) with disclaimer | High |
| Hospital Network Lookup              | Reference approved hospital network for customer's area                                          | Medium   |
| OPD Drug Coverage Explainer          | Clarify which drug types are covered under OPD plans                                            | Medium   |
| Coverage Gap Analysis                | Ask about existing coverage; identify gaps and explain where additional coverage helps           | High     |

---

## Planned v1.2 Improvements

| Enhancement                          | Description                                                                                     | Priority |
|--------------------------------------|-------------------------------------------------------------------------------------------------|----------|
| Family Plan Builder                  | Walk customer through building a health coverage plan for spouse + children step by step        | Medium   |
| Annual Limit Calculator              | Help customer estimate how much annual limit they need based on hospital costs in their area    | Low      |
| Claim Process Explainer              | Explain how to make a claim (cashless vs. reimbursement) as a trust-building step               | Medium   |

---

## Known Gaps in v1.0

| Gap                                           | Impact                                                          | Planned Fix |
|-----------------------------------------------|-----------------------------------------------------------------|-------------|
| No premium range available even with age      | Customer cannot get even a rough estimate from AI               | v1.1        |
| Hospital network not queryable                | Customer cannot verify their preferred hospital is covered      | v1.1        |
| No coverage gap analysis                      | Customers with existing coverage don't get tailored advice      | v1.1        |
| OPD drug coverage rules not detailed          | Common customer confusion goes unresolved                       | v1.1        |

---

## Integration Opportunities

| Integration                                   | Value                                                           | Dependency           |
|-----------------------------------------------|-----------------------------------------------------------------|----------------------|
| Premium calculator API                        | Real-time indicative premium based on age and plan tier         | Product API          |
| Hospital network database                     | Allow customers to check if preferred hospital is in network    | Network data feed    |
| Tax integration with ACP-05                   | Surface health insurance tax deduction benefit mid-conversation | ACP-05 coordination  |
| CRM health profile pre-population             | Use health data from prior sessions to skip re-questioning      | CRM connector        |

---

## Notes
- Premium calculator integration (v1.1) is the highest-value improvement — removes friction from the lead qualification step
- Hospital network lookup would significantly improve customer confidence in Tokio Marine products
