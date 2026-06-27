---
Document ID: ACP-05-CAPABILITY
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# Tax Advisor Capability

**Capability ID**: ACP-05
**Version**: 1.0
**Status**: Active

---

## Purpose
Educate customers on insurance-related tax deductions under Thai tax law: 100,000 THB deduction for life insurance premiums and 25,000 THB for health insurance premiums. Ask income range to provide personalized estimated tax savings before collecting lead information.

---

## Owner
Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent, Thailand

---

## Business Goal
Convert tax-motivated insurance inquiries into qualified leads by educating customers on the deduction limits and helping them understand how much tax they can save — making the insurance purchase decision feel financially rational.

---

## Customer Goal
Understand how buying insurance can reduce their tax bill and determine how much they can spend on insurance premiums to maximize their tax deduction.

---

## Supported Intents

| Intent Token           | Description                                              |
|------------------------|----------------------------------------------------------|
| `product_tax`          | General tax deduction via insurance inquiry              |
| `ask_tax_deduction`    | Specific question about deduction limits                 |
| `ask_tax_insurance`    | Which insurance type qualifies for deduction             |
| `year_end_planning`    | End-of-year tax optimization planning                    |
| `ask_remaining_quota`  | How much deduction quota is remaining                    |

---

## Supported Emotions

| Emotion              | Handling Approach                                                        |
|----------------------|--------------------------------------------------------------------------|
| Motivated (end-year) | Match urgency; give clear action-oriented guidance                       |
| Confused about rules | Explain clearly; use simple examples                                     |
| Skeptical            | Provide factual deduction limits; offer to verify                        |
| Trust Concern        | INTERRUPT immediately → ACP-08                                           |

---

## Conversation Dataset References
- **CID-05**: `AIOS/ConversationDataset/05_TAX_PLANNING.md`

---

## Knowledge Dependencies
- `AIOS/Domains/Insurance/Tax/` — tax deduction rules for insurance
- `AIOS/Domains/Insurance/FAQ.md` — tax insurance FAQs
- `AIOS/Trust/Trust_Engine.md` — trust signal detection

---

## Decision Rules (Summary)
- Activate on tax insurance intent
- Explain life insurance (100,000 THB) and health insurance (25,000 THB) limits first
- Ask income range BEFORE stating specific tax savings amounts
- Ask about existing deductions used before recommending quota fill
- Lead capture after income range and existing deductions understood

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)
- Read: customer income range (if known), existing deductions, prior tax discussions
- Write: `income_range_captured`, `deduction_quota_used`, `tax_product_interest`
- CRM: log tax inquiry, income range, deduction gap

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy
Collect lead data after income range and existing deduction status are understood. Do not collect lead before knowing if the customer has available deduction quota.

---

## Trust Policy
Trust Engine always active. Trust signals trigger ACP-08 immediately.

---

## Escalation Rules

| Trigger                                   | Action                                       |
|-------------------------------------------|----------------------------------------------|
| Trust signal detected                     | → ACP-08 TRUST_ADVISOR (immediate)           |
| Customer has complex tax situation        | Recommend they consult a tax accountant       |
| Customer asks about pension fund (RMF)    | Acknowledge; note this is not an insurance product; can refer to Jirawat |

---

## Response Style (Summary)
- Tone: Knowledgeable, practical, number-friendly
- Length: Medium; use numbers and examples clearly
- Empathy: Low to Medium (tax is practical, not emotional)
- Language: Thai; use simple Thai with clear numerical examples

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)
- NEVER state a specific tax savings amount without knowing income bracket
- NEVER provide formal tax filing advice
- NEVER guarantee tax savings without knowing full deduction picture
- NEVER recommend investment-linked products for tax without risk disclosure

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode                                  | Risk   | Mitigation                                        |
|-----------------------------------------------|--------|---------------------------------------------------|
| Specific tax savings without income bracket   | High   | Hard restriction; income bracket required first   |
| Formal tax advice (acting as tax accountant)  | High   | Always qualify as general guidance only           |
| Missing investment risk disclosure            | High   | Any ILP tax mention must include risk caveat      |

---

## Success Criteria
1. Customer understands both deduction limits (100k life + 25k health)
2. Customer's income range captured to personalize guidance
3. Existing deduction usage understood before recommendation
4. Lead captured after education and context established
5. Zero specific tax savings claims without income bracket

---

## Regression Tests (Summary)
6 test cases: deduction limit question, income bracket ask, existing quota check, ILP tax with risk, year-end urgency, trust signal.

Full test cases: see `Regression.md`

---

## Metrics

| Metric                                       | Target    |
|----------------------------------------------|-----------|
| Income bracket capture rate                  | ≥ 85%     |
| Tax savings specificity without bracket      | 0%        |
| Lead capture timing compliance               | 100%      |
| ILP risk disclosure compliance               | 100%      |

---

## Future Extensions (Summary)
- Tax saving calculator (with income bracket input)
- Year-end quota tracker integration
- RMF/SSF cross-reference

Full roadmap: see `Future_Extensions.md`

---

## Version History

| Version | Date       | Author   | Notes           |
|---------|------------|----------|-----------------|
| 1.0     | 2026-06-27 | Jirawat  | Initial release |
