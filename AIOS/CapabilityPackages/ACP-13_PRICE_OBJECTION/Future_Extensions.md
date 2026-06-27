# Future Extensions — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-13-01 | Premium calculator integration | Show exact premiums for customer's age/health at stated budget | High |
| FE-13-02 | Tax benefit visualizer (LINE card) | Visual "before/after tax deduction" display improves effectiveness | Medium |
| FE-13-03 | Budget-to-coverage illustrator | Show what percentage of medical costs would be covered at different budget levels | High |
| FE-13-04 | "Start small, scale up" framing | Explicitly present entry-level products as a starting point with upgrade path | Low |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-13-01 | Cannot calculate exact premiums | Customers need to know if a budget-matched option's premium is exactly within budget | High |
| GAP-13-02 | No real-time product availability at budget tiers | Product offering may change; static knowledge may be outdated | Medium |
| GAP-13-03 | No income-based affordability guidance | Some customers need help understanding what budget is reasonable for their income | Low |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Tokio Marine Premium API | Real-time premium calculation by age, health, product | Accurate budget matching |
| Tax Calculator | Link to Thailand Revenue Department tax calculator | More precise tax benefit estimation |
| ACP-05_TAX_ADVISOR | Tighter integration for tax-filing customers | Smoother transition when tax framing is relevant |

---

## Research Items

| Item | Question |
|---|---|
| RI-13-01 | What is the most effective acknowledgment phrase for Thai customers facing price concerns? |
| RI-13-02 | Does presenting tax deduction framing early vs. late in the conversation affect conversion? |
| RI-13-03 | What is the minimum viable budget threshold below which no product should be offered? |
