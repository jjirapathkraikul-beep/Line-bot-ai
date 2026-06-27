---
Document ID: ACP-09-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                          | Description                                                                                       | Priority |
|--------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Recommendation Scoring Engine        | Score each potential product against customer context (0-100); select top 2 by score             | High     |
| Context Richness Validator           | Auto-validate that context richness score ≥3 before generating recommendation; block if below    | High     |
| Recommendation Acceptance Tracking   | Track whether customer accepted or rejected each recommendation; feed back to improve scoring     | Medium   |

---

## Planned v1.2 Improvements

| Enhancement                          | Description                                                                                       | Priority |
|--------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Bundle Recommendation                | Identify when two products are complementary and present as a "protection bundle"                 | Medium   |
| Premium Estimate Integration         | After recommendation, provide premium range (with qualification) using age + plan tier            | Medium   |
| Alternative Recommendation           | If customer rejects first recommendation, auto-generate alternative from next-best product       | Medium   |

---

## Known Gaps in v1.0

| Gap                                           | Impact                                                         | Planned Fix |
|-----------------------------------------------|----------------------------------------------------------------|-------------|
| No formal scoring engine                      | Product selection relies on rule matching; may miss best fit   | v1.1        |
| No acceptance tracking                        | Cannot learn from accepted vs. rejected recommendations        | v1.1        |
| No premium estimate at recommendation         | Customer cannot evaluate affordability at recommendation stage | v1.2        |
| No bundle recommendation logic                | Complementary products presented as two separate suggestions   | v1.2        |

---

## Integration Opportunities

| Integration                                   | Value                                                          | Dependency          |
|-----------------------------------------------|----------------------------------------------------------------|---------------------|
| CRM recommendation history                    | Track which products Jirawat's customers are most often shown  | CRM connector       |
| Premium API at recommendation stage           | Provide indicative premium range after recommendation          | Product API         |
| A/B testing for recommendation order          | Test whether health-first or savings-first recommendations convert better | Experiment framework |
