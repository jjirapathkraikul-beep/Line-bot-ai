---
Document ID: ACP-03-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                        | Description                                                                                       | Priority |
|------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Cancer Stage Coverage Visualizer   | Simple table/chart showing how much is paid at each cancer stage per plan                         | High     |
| Waiting Period Calculator          | Show customer when their coverage will activate based on purchase date                            | Medium   |
| Emotional State Confidence Scoring | Improve emotion detection accuracy to prevent false positives on grief/anxiety                    | High     |
| Premium Range Post-Age Capture     | After age captured, provide indicative premium range with appropriate qualifications              | High     |

---

## Planned v1.2 Improvements

| Enhancement                        | Description                                                                                       | Priority |
|------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Cancer Statistics Context Module   | Responsibly provide cancer prevalence data in Thailand to contextualize the need for coverage     | Low      |
| Cancer Type Coverage Reference     | Quick reference table for which cancer types are typically covered                                | Medium   |
| Post-Cancer Survivor Pathway       | Specific conversation pathway for customers who have recovered from cancer                        | Medium   |

---

## Known Gaps in v1.0

| Gap                                              | Impact                                                            | Planned Fix |
|--------------------------------------------------|-------------------------------------------------------------------|-------------|
| No visual stage coverage explanation             | Customers struggle to understand coverage by stage                | v1.1        |
| No waiting period calculator                     | Customers unsure when their coverage starts                       | v1.1        |
| Emotion detection relies on keywords only        | Subtle emotional signals may be missed                            | v1.1        |
| No premium range even with age                   | Customer cannot evaluate affordability                            | v1.1        |

---

## Integration Opportunities

| Integration                                   | Value                                                             | Dependency           |
|-----------------------------------------------|-------------------------------------------------------------------|----------------------|
| Cancer education content from Health Ministry | Add local Thai cancer statistics for contextual awareness         | Content partnership  |
| Premium calculator API                        | Real-time indicative premium post age capture                     | Product API          |
| Hospital cancer treatment center reference    | Help customers understand which cancer centers are covered        | Network data feed    |

---

## Notes
- Cancer-related conversations have the highest emotional risk of any ACP
- The empathy-first interrupt rule should be tested exhaustively before any v1.1 release
- Post-cancer survivor pathway (v1.2) is a significant opportunity as this is an underserved segment
