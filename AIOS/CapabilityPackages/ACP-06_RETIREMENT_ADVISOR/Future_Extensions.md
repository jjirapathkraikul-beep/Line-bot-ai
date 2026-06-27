---
Document ID: ACP-06-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                        | Description                                                                                      | Priority |
|------------------------------------|--------------------------------------------------------------------------------------------------|----------|
| Retirement Income Calculator       | Input: age + monthly premium → Output: estimated retirement income range (with qualification)    | High     |
| Savings Gap Visualizer             | Show customer how much monthly savings is needed to reach a target retirement income             | High     |
| Age-Band Response Library          | Pre-built response variants for each 10-year age band (30s, 40s, 50s, 60+)                      | Medium   |

---

## Planned v1.2 Improvements

| Enhancement                        | Description                                                                                      | Priority |
|------------------------------------|--------------------------------------------------------------------------------------------------|----------|
| Provident Fund Integration Note    | Acknowledge employer provident fund as a complement; add insurance layer on top                 | Low      |
| Social Security Reference          | Note government SSF contributions; explain how insurance supplements public pension             | Low      |
| Couple/Family Retirement Planner   | Help couples plan retirement jointly — whose annuity covers which needs                         | Medium   |

---

## Known Gaps in v1.0

| Gap                                         | Impact                                                         | Planned Fix |
|---------------------------------------------|----------------------------------------------------------------|-------------|
| No retirement income calculator             | Customer cannot self-evaluate affordability                    | v1.1        |
| No age-band response library                | Response quality varies by age context                         | v1.1        |
| No savings gap visualization                | Hard for customer to understand how much they need to save     | v1.1        |

---

## Integration Opportunities

| Integration                                   | Value                                                          | Dependency         |
|-----------------------------------------------|----------------------------------------------------------------|--------------------|
| Annuity calculator API                        | Real-time retirement income estimates from product data        | Product API        |
| CRM age field pre-population                  | Skip age question for returning customers                      | CRM connector      |
| Tax integration with ACP-05                   | Surface retirement insurance tax benefit mid-conversation      | ACP-05             |
