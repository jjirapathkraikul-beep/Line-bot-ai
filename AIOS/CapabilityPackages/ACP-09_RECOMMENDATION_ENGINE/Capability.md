---
Document ID: ACP-09-CAPABILITY
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# Recommendation Engine Capability

**Capability ID**: ACP-09
**Version**: 1.0
**Status**: Active

---

## Purpose
Synthesize customer context gathered from advisory ACPs and Need Discovery into a personalized product recommendation of at most 2 products, explaining the reason for each recommendation by citing the customer's own stated goals, concerns, and context.

---

## Owner
Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent, Thailand

---

## Business Goal
Convert fully-contextualized customer conversations into high-quality leads with specific product recommendations, enabling Jirawat to deliver a highly personalized follow-up call rather than a generic product pitch.

---

## Customer Goal
Receive a recommendation that feels personally tailored to them — not a generic sales pitch — with a clear explanation of why each suggested product fits their specific situation.

---

## Supported Intents

| Intent Token              | Description                                              |
|---------------------------|----------------------------------------------------------|
| `ask_recommendation`      | Direct recommendation request                            |
| `ready_for_recommendation`| Customer signals readiness for a suggestion              |
| `ask_what_to_buy`         | Purchase decision question                               |
| `compare_products`        | Comparison with a recommendation ask                     |

---

## Supported Emotions

| Emotion                  | Handling Approach                                                         |
|--------------------------|---------------------------------------------------------------------------|
| Ready and motivated      | Deliver recommendation clearly and confidently                            |
| Undecided/cautious       | Frame recommendation as "starting point" not commitment                   |
| Overwhelmed              | Limit to 1 product; simplify; invite to discuss with Jirawat              |
| Trust Concern            | INTERRUPT immediately → ACP-08 (trust must be resolved first)            |

---

## Conversation Dataset References
- **CID-11**: `AIOS/ConversationDataset/11_RECOMMENDATION.md`

---

## Knowledge Dependencies
- All advisory ACP outputs (customer context from ACP-02 through ACP-10)
- `AIOS/Domains/Insurance/` — product knowledge for recommendation matching
- `AIOS/Domains/Insurance/FAQ.md` — product FAQs
- `AIOS/Trust/Trust_Engine.md` — trust signal detection

---

## Activation Requirements (All Must Be Met)

| Requirement                  | Source                              |
|------------------------------|-------------------------------------|
| Customer age known           | ACP memory or current session       |
| Customer goal articulated    | ACP-10 or advisory ACP context      |
| At least one context factor  | Budget / existing coverage / life stage / risk profile |
| No active trust concern      | ACP-08 must be resolved             |

---

## Decision Rules (Summary)
- Check all activation requirements before generating recommendation
- If requirements not met, ask ONE missing question and return
- Recommend maximum 2 products per response
- For each recommendation, cite the customer's own words as the reason
- Collect lead AFTER recommendation is delivered
- Never recommend based on popularity without customer context

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)
- Read: all context from prior ACPs in this session (age, goal, budget, existing coverage, risk profile, health conditions)
- Write: `recommendation_delivered`, `products_recommended`, `recommendation_rationale`
- CRM: log full recommendation context for Jirawat's reference

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy
Collect name and phone AFTER the recommendation is delivered. The recommendation is the value exchange that earns the right to request contact information.

---

## Trust Policy
Trust Engine always active. If trust signal detected at any point — including during recommendation delivery — immediately activate ACP-08.

---

## Escalation Rules

| Trigger                               | Action                                       |
|---------------------------------------|----------------------------------------------|
| Trust signal detected                 | → ACP-08 TRUST_ADVISOR (immediate)           |
| Insufficient context for recommendation | Ask ONE missing question; do not recommend without context |
| Customer overwhelmed by recommendation | Simplify to 1 product; offer Jirawat call   |
| Customer wants exact premium          | Collect lead; Jirawat will provide exact quote |

---

## Response Style (Summary)
- Tone: Confident, personalized, non-pushy
- Length: Medium to Long (recommendation + rationale + CTA)
- Empathy: Medium
- Language: Thai with clear product names and rationale

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)
- NEVER recommend more than 2 products per response
- NEVER recommend without citing customer context as reason
- NEVER recommend based on "what's popular" without customer fit
- NEVER guarantee product outcomes
- NEVER collect lead before recommendation is delivered

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode                              | Risk   | Mitigation                                         |
|-------------------------------------------|--------|----------------------------------------------------|
| Over 2 products in one response           | High   | Hard restriction H1                                |
| Recommendation without customer context   | High   | Activation requirements gate enforced              |
| "Popular product" recommendation          | High   | Hard restriction H2                                |
| Lead before recommendation                | High   | Lead policy enforced                               |
| Outcome guarantee                         | High   | Hard restriction H3                                |

---

## Success Criteria
1. Recommendation cites customer's own words
2. Maximum 2 products recommended per response
3. Lead captured after recommendation delivered
4. Customer understands WHY each product was recommended
5. Context richness score in CRM ≥ 3 fields (age + goal + at least 1 context)

---

## Regression Tests (Summary)
6 test cases: context-based recommendation, over-recommendation prevention, "popular" recommendation block, missing context gate, lead timing, trust signal during recommendation.

Full test cases: see `Regression.md`

---

## Metrics

| Metric                                      | Target    |
|---------------------------------------------|-----------|
| Customer-context citation rate              | 100%      |
| >2 product recommendation violation         | 0%        |
| "Popular product" without context           | 0%        |
| Lead capture before recommendation          | 0%        |
| Context richness at recommendation          | ≥ 3 fields|

---

## Future Extensions (Summary)
- Recommendation scoring engine
- Multi-product bundle recommendation
- Recommendation acceptance tracking

Full roadmap: see `Future_Extensions.md`

---

## Version History

| Version | Date       | Author   | Notes           |
|---------|------------|----------|-----------------|
| 1.0     | 2026-06-27 | Jirawat  | Initial release |
