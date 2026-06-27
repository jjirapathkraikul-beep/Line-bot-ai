# Price Objection Capability

| Field | Value |
|---|---|
| Document ID | ACP-13-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-13  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Handle customer price objections and budget constraints with empathy and practical redirection — acknowledging the concern first, then showing what value IS accessible at the customer's budget, without pressuring for more spending.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Convert price objections into informed budget-matched conversations that result in an actionable path forward. Even customers with limited budgets are valuable leads — small policies build relationships and future upsell potential.

---

## Customer Goal

Understand what insurance protection is available within their actual budget, and feel that the AI (and Jirawat) respect their financial situation.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-13-01 | price_objection | "แพงเกินไปครับ" |
| INT-13-02 | แพงเกินไป | "เบี้ยสูงมากเลย" |
| INT-13-03 | งบไม่ถึง | "งบผมประมาณพันต้นๆ เองครับ" |
| INT-13-04 | cheaper_option | "มีแบบถูกกว่านี้ไหมครับ?" |
| INT-13-05 | minimum_premium | "ประกันถูกสุดคือเท่าไหร่ครับ?" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Frustrated (price) | Acknowledge first; validate concern; do not defend the price |
| Embarrassed (budget constraint) | Normalize: "หลายคนก็เริ่มจากงบแบบนี้ครับ" |
| Resigned ("ไม่ไหวแล้ว") | Do not push; offer lowest entry point; leave door open |
| Curious (seeking options) | Engage fully; show budget-matched options |

---

## Conversation Dataset References

- **CID-12**: `AIOS/ConversationDataset/12_PRICE_OBJECTION.md`

---

## Knowledge Dependencies

- `AIOS/Domains/Insurance/` — product spectrum and entry-level plans
- `AIOS/Domains/Insurance/Tax/` — tax deduction framing to address effective cost
- `AIOS/Domains/Insurance/FAQ.md` — price-related FAQs

---

## Decision Rules (Summary)

1. ALWAYS acknowledge the budget concern before offering alternatives
2. Ask for budget figure if not stated (one question only)
3. Redirect to products within or near the stated budget
4. Use tax deduction framing to show effective lower cost if applicable
5. NEVER recommend products that exceed stated budget

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: customer budget if known, prior product discussed, tax filing status
- Write: stated_budget, price_objection_flag, resolution_approach to conversation state

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

Activate ACP-11 (Lead Capture) AFTER a workable budget-matched solution has been identified and the customer expresses interest. Not before.

---

## Trust Policy

Trust concern from Trust Engine immediately suspends ACP-13. ACP-08 takes control.

---

## Escalation Rules

| Condition | Action |
|---|---|
| No product available at stated budget | Honest disclosure; suggest Jirawat for custom solutions; offer ACP-17 |
| Customer in genuine financial hardship | Do not push any product; offer awareness resources; close gracefully |
| Trust concern detected | Activate ACP-08 |

---

## Response Style (Summary)

- Empathetic first, practical second
- Never defensive about pricing
- Normalize having a budget
- Frame tax deductions as effective cost reduction

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER say "ราคานี้ถูกมากแล้วครับ" without context
- NEVER make customer feel judged
- NEVER recommend products exceeding stated budget
- NEVER skip the acknowledgment step

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| No product at customer's budget | Honest disclosure; offer Jirawat; do not fabricate a product |
| Customer refuses to state budget | Work with ranges; offer three price tiers |
| Customer's stated budget changes mid-conversation | Update and re-confirm without judgment |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Customer feels heard after acknowledgment | No repeat complaint in same turn |
| Budget-matched product identified | Applicable product exists at stated budget |
| Customer continues conversation after objection | Does not disengage immediately |

---

## Regression Tests (Summary)

- TEST-13-01: Price objection acknowledged before product alternatives
- TEST-13-02: No product recommendation exceeding stated budget
- TEST-13-03: Tax deduction framing when applicable
- TEST-13-04: "ถูกมากแล้ว" prohibition
- TEST-13-05: Genuine hardship — graceful close

Full test cases: see `Regression.md`

---

## Metrics

| Metric | Description |
|---|---|
| objection_to_engagement_rate | % of price objections that lead to continued conversation |
| budget_matched_solution_rate | % of cases where a viable product was found at customer's budget |
| lead_conversion_post_objection | % of price objection conversations that result in a lead |

---

## Future Extensions (Summary)

- Premium calculator integration
- Tax benefit visualizer
- Budget-to-coverage illustrator

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
