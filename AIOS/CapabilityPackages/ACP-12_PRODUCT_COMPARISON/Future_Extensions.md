# Future Extensions — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-12-01 | Interactive comparison table via LINE Rich Card | Visual comparison tables are more effective than text on mobile; significantly improves comprehension | High |
| FE-12-02 | AI-generated personalized recommendation at end of comparison | After comparison, synthesize customer context + comparison result into a specific recommendation | Medium |
| FE-12-03 | Customer-priority weighting ("ให้คะแนนความสำคัญ") | Allow customer to rate dimensions by importance; AI generates a weighted comparison score | High |
| FE-12-04 | Premium range estimation by age band | Provide rough premium ranges by age tier to make comparison more concrete | Medium |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-12-01 | Cannot provide exact premiums | Customers often want to compare specific costs; this capability can only give ranges | High |
| GAP-12-02 | No competitor product data | Customers frequently ask for market-wide comparisons; capability cannot satisfy this fully | Medium |
| GAP-12-03 | No real-time product availability check | Product plans may have changed; capability cannot verify current availability | Medium |
| GAP-12-04 | No integration with Tokio Marine product catalog API | All product data is static documentation; cannot reflect live updates | High |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Tokio Marine Product Catalog API | Real-time product data and premium calculation | Accurate, current comparison data |
| ACP-09 Recommendation Engine | Tighter coupling at comparison completion | Seamless transition from comparison to recommendation |
| LINE Rich Menu | Display comparison as a card with tap-to-select options | Better mobile UX for product selection |
| Jirawat's Quote Tool | Link comparison result to quote generation | Customer can immediately get a personalized quote post-comparison |

---

## Research Items

| Item | Question |
|---|---|
| RI-12-01 | What is the optimal number of comparison dimensions before customers start showing confusion? (Current hypothesis: 3) |
| RI-12-02 | Does presenting a comparison table vs. prose description lead to higher preference signal rates? |
| RI-12-03 | How often do customers compare products from the same category vs. cross-category? |
