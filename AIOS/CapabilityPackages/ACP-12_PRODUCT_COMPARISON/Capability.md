# Product Comparison Capability

| Field | Value |
|---|---|
| Document ID | ACP-12-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-12  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Enable customers to understand meaningful differences between insurance products through a simplified, personalized comparison that helps them make informed decisions — without overwhelming them with data or declaring one product universally "better."

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Convert product curiosity into informed interest. A customer who understands the key differences relevant to their situation is significantly more likely to progress toward a purchase decision.

---

## Customer Goal

Understand which product or plan is most suitable for their specific needs, lifestyle, and budget — presented clearly without jargon.

---

## Supported Intents

| Intent ID | Intent Name | Example Trigger |
|---|---|---|
| INT-12-01 | ask_comparison | "อยากเปรียบเทียบแผนครับ" |
| INT-12-02 | ต่างกันยังไง | "แผน A กับ B ต่างกันยังไงครับ?" |
| INT-12-03 | compare_products | "เทียบให้หน่อยได้ไหม?" |
| INT-12-04 | which_is_better | "แบบไหนดีกว่าครับ?" |
| INT-12-05 | help_choose | "ควรเลือกแบบไหนดีครับ?" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Curious | Standard comparison; educate fully |
| Overwhelmed | Reduce to 2 key dimensions only; simplify aggressively |
| Decisive | Respect pace; do not slow down with unnecessary detail |
| Price-anxious | Lead comparison with value-for-money dimension; hand off to ACP-13 if needed |
| Skeptical | Lead with facts; avoid superlatives |

---

## Conversation Dataset References

- **CID-09**: `AIOS/ConversationDataset/09_PRODUCT_COMPARISON.md` — contains comparison conversation patterns and example scripts

---

## Knowledge Dependencies

- `AIOS/Domains/Insurance/` — product specifications and plan details
- `AIOS/Domains/Insurance/Tax/` — tax deduction eligibility by product type
- `AIOS/Domains/Insurance/FAQ.md` — common comparison questions

---

## Decision Rules (Summary)

1. Always understand the customer's need before comparing products
2. Limit active comparison dimensions to 2-3 maximum
3. Frame comparison in terms of customer's stated priority
4. Never declare one product universally better
5. If customer's need is unclear, ask ONE clarifying question before comparing
6. Transition to ACP-09 when customer signals a preference

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: customer profile (age, health, budget if known), prior need discovery results, conversation state
- Write: products_compared, customer_preference_signal, comparison_topic to conversation state

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

Lead capture (ACP-11) activates AFTER comparison is complete AND customer has expressed specific interest in one of the compared products. Do NOT interrupt the comparison with lead capture.

---

## Trust Policy

Trust concern from Trust Engine immediately suspends comparison. ACP-08 takes control. Comparison resumes only after concern is resolved.

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer asks for specific premium calculation | Activate ACP-13 or hand off to ACP-17 for Jirawat's personalized quote |
| Customer signals purchase readiness | Activate ACP-19_CLOSING |
| Price objection raised during comparison | Activate ACP-13_PRICE_OBJECTION |
| Trust concern detected | Activate ACP-08_TRUST_ADVISOR |

---

## Response Style (Summary)

- Use plain language; avoid technical jargon
- Use comparison tables only when dimensions are clear
- Personalize framing ("สำหรับคุณที่บอกว่า...")
- Avoid superlatives: "ดีที่สุด", "ถูกที่สุด"

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER say one product is "better" without customer context
- NEVER present more than 3 comparison dimensions per turn
- NEVER make detailed competitor comparisons
- NEVER collect lead data during comparison

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Detection | Recovery |
|---|---|---|
| Customer asks to compare more than 3 products | More than 3 products named | Ask which two are most relevant; reduce scope |
| Products not in Jirawat's portfolio | Unknown product name detected | Acknowledge gap; offer to compare known products; suggest Jirawat for full market comparison |
| Customer cannot decide after comparison | Repeated comparison requests without progress | Activate ACP-17_HUMAN_HANDOFF |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Customer indicates understanding post-comparison | Positive acknowledgment in response |
| Comparison leads to preference signal | Customer indicates preference or next action |
| No confusion indicators after comparison | No "ไม่เข้าใจครับ" or re-asks of same comparison |

---

## Regression Tests (Summary)

- TEST-12-01: Two-product comparison with clear dimensions
- TEST-12-02: Customer asks "which is better" — context-appropriate response
- TEST-12-03: Overwhelmed customer — simplification
- TEST-12-04: Trust concern mid-comparison — suspension
- TEST-12-05: Price objection during comparison — handoff to ACP-13

Full test cases: see `Regression.md`

---

## Metrics

| Metric | Description |
|---|---|
| comparison_to_preference_rate | % of comparisons that result in a stated customer preference |
| simplification_rate | % of cases where comparison was reduced to 2 dimensions |
| handoff_from_comparison | Rate of ACP-17 activations following comparison |
| price_objection_rate | Rate of ACP-13 activations following comparison |

---

## Future Extensions (Summary)

- Interactive comparison table via LINE rich card
- AI-generated personalized recommendation at end of comparison
- Competitor comparison module (factual, Jirawat-approved)

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
