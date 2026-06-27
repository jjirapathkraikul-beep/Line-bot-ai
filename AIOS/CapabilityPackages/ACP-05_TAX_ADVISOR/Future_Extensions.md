---
Document ID: ACP-05-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                        | Description                                                                                   | Priority |
|------------------------------------|-----------------------------------------------------------------------------------------------|----------|
| Tax Saving Calculator              | Input: income range + premium amount → Output: estimated tax saving with qualified disclaimer | High     |
| Remaining Quota Tracker            | Help customer calculate how much deduction quota they have left based on premiums already paid | High    |
| Year-End Deadline Reminder         | Proactively note that insurance must be purchased before Dec 31 for current year deduction    | Medium   |

---

## Planned v1.2 Improvements

| Enhancement                        | Description                                                                                   | Priority |
|------------------------------------|-----------------------------------------------------------------------------------------------|----------|
| Multi-Product Deduction Optimizer  | Given customer's income, suggest the optimal mix of life + health premium to maximize deduction | Medium |
| RMF/SSF Cross-Reference Note       | Lightweight note explaining that RMF/SSF exist for additional deduction; refer to Jirawat     | Low      |
| Previous Year Deduction Import     | Allow customer to reference prior year insurance premiums to project this year                | Low      |

---

## Known Gaps in v1.0

| Gap                                           | Impact                                                         | Planned Fix |
|-----------------------------------------------|----------------------------------------------------------------|-------------|
| No tax savings calculator                     | Customer cannot get a concrete estimate without Jirawat        | v1.1        |
| No remaining quota tracker                    | Customer doesn't know how much deduction they have left        | v1.1        |
| No year-end deadline awareness built in       | AI may miss year-end urgency context naturally                 | v1.1        |

---

## Integration Opportunities

| Integration                                   | Value                                                          | Dependency         |
|-----------------------------------------------|----------------------------------------------------------------|--------------------|
| Tax bracket API (Revenue Department)          | Real-time tax rate data for accurate savings estimates         | External API       |
| CRM income field pre-population               | Skip income question for returning customers with known income | CRM connector      |
| Calendar integration for Dec 31 deadline      | Proactively remind customer if approaching year-end            | Calendar API       |
