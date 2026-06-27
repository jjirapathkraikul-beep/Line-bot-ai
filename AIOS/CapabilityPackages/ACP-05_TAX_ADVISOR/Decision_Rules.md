---
Document ID: ACP-05-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Decision Rules

**Priority Level**: STANDARD

---

## Activation Conditions

| Condition                          | Logic                                                             |
|------------------------------------|-------------------------------------------------------------------|
| Tax deduction intent detected      | `intent IN [product_tax, ask_tax_deduction, year_end_planning]`   |
| Tax keyword in message             | Keywords: ลดหย่อน, ภาษี, tax, RMF (if asking about insurance)     |
| Cross-trigger from ACP-02/ACP-07   | Customer asks about tax benefit while in health or investment ACP |

---

## Execution Conditions

1. **Explain Limits First**: State 100,000 THB (life insurance) and 25,000 THB (health insurance) deduction limits.
2. **Ask Income Range**: Before stating any specific tax savings, ask for income range.
3. **Estimate After Income**: Provide approximate tax saving estimate using income bracket.
4. **Ask Existing Deductions**: Ask if customer has already used some deduction quota this year.
5. **Fill-Gap Recommendation**: Recommend insurance type and approximate premium that fills the remaining quota.
6. **Lead Capture**: After income range and deduction status understood.

### Income Bracket Context Table (Reference Only — Exact Rates in Tax Domain)

| Income Range Tier | Use For                                           |
|-------------------|---------------------------------------------------|
| Under 300k/year   | Lower tax rate; health deduction often more impactful |
| 300k–500k/year    | Moderate rate; both deductions valuable           |
| 500k–1M/year      | Higher rate; full quotas highly valuable          |
| Over 1M/year      | Highest rate; maximum deduction strongly recommended |

---

## Exit Conditions

| Condition                          | Exit Type         |
|------------------------------------|-------------------|
| Lead captured                      | Success           |
| Customer satisfied; no lead        | Informed exit     |
| Trust signal                       | Interrupt → ACP-08|
| Customer routed to ACP-02 for health | Cross-route     |

---

## Fallback Rules

| Scenario                                  | Fallback Action                                            |
|-------------------------------------------|------------------------------------------------------------|
| Customer won't share income               | Explain both scenarios (lower vs. higher bracket) generally |
| Customer has already maxed out deductions | Acknowledge; explore other planning options with Jirawat   |
| Complex tax situation                     | Recommend tax accountant for formal filing; stay in insurance scope |
