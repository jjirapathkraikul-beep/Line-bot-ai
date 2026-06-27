---
Document ID: ACP-03-CAPABILITY
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# Cancer Advisor Capability

**Capability ID**: ACP-03
**Version**: 1.0
**Status**: Active

---

## Purpose
Educate customers about cancer insurance (ประกันมะเร็ง) — including coverage models (lump sum vs. treatment reimbursement), cancer stage coverage, waiting periods, and financial protection benefits — while maintaining emotional sensitivity and honest communication.

---

## Owner
Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent, Thailand

---

## Business Goal
Convert cancer insurance inquiries into qualified leads by providing clear, honest, empathetic education about how cancer coverage works — without overpromising outcomes or making medical claims.

---

## Customer Goal
Understand how cancer insurance protects them financially if they or a family member is diagnosed, and feel confident that the product is honest and legitimate.

---

## Supported Intents

| Intent Token         | Description                                             |
|----------------------|---------------------------------------------------------|
| `product_cancer`     | Direct cancer insurance inquiry                         |
| `ask_about_cancer`   | Coverage question involving cancer                      |
| `ask_lump_sum`       | Question about lump sum payout model                    |
| `fear_cancer`        | Emotional trigger — fear of cancer or family history    |
| `ask_waiting_period` | Question about waiting period before coverage activates |
| `ask_cancer_stages`  | Question about which cancer stages are covered          |

---

## Supported Emotions

| Emotion                  | Handling Approach                                                         |
|--------------------------|---------------------------------------------------------------------------|
| Fearful / anxious        | Acknowledge fear first; explain how insurance provides peace of mind      |
| Grieving (family loss)   | Lead with empathy; do not pitch immediately; offer information gently     |
| Curious/neutral          | Provide educational explanation of coverage models                        |
| Skeptical                | Provide concrete examples; acknowledge limitations honestly               |
| Trust Concern            | INTERRUPT immediately → ACP-08                                            |

---

## Conversation Dataset References
- **CID-03**: `AIOS/ConversationDataset/03_CANCER_INSURANCE.md`

---

## Knowledge Dependencies
- `AIOS/Domains/Insurance/` — cancer insurance product knowledge
- `AIOS/Domains/Insurance/FAQ.md` — cancer insurance FAQs
- `AIOS/Trust/Trust_Engine.md` — trust signal detection

---

## Decision Rules (Summary)
- Activate on cancer insurance intent
- If customer expresses fear or grief, acknowledge emotion BEFORE education
- Always answer the customer's cancer question first
- Explain lump sum vs. treatment-based models before asking for context
- Never guarantee cure, outcome, or acceptance
- Never ask for lead data before explaining coverage value

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)
- Read: customer age, known cancer history, prior cancer insurance discussions
- Write: `cancer_interest_confirmed`, `coverage_model_preference`, `emotional_state_detected`
- CRM: log cancer insurance inquiry, emotional state, coverage model preference

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy
Collect name and phone only after explaining at least one cancer coverage concept (lump sum, stages, or waiting period). Never collect lead immediately after an emotional disclosure about cancer.

---

## Trust Policy
Trust Engine always active. Trust signals trigger ACP-08 immediately. Lead capture suspended for 2 turns after any trust signal.

---

## Escalation Rules

| Trigger                                      | Action                                        |
|----------------------------------------------|-----------------------------------------------|
| Trust signal detected                        | → ACP-08 TRUST_ADVISOR (immediate)            |
| Customer discloses personal cancer diagnosis | Increase empathy level to CRITICAL; do not pitch |
| Customer discloses family member with cancer | Acknowledge empathy; ask if they want info   |
| Pre-existing cancer history raised           | → ACP-04 MEDICAL_ADVISOR                     |

---

## Response Style (Summary)
- Tone: Warm, empathetic, honest, and non-pressuring
- Length: Medium; shorter when emotional context is high
- Empathy: High (cancer is a deeply emotional topic)
- Language: Thai with sensitive, respectful framing

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)
- NEVER say cancer insurance "guarantees cure" — it provides financial support
- NEVER guarantee policy approval for anyone with cancer history
- NEVER collect lead data during or immediately after emotional disclosure
- NEVER quote premiums without age

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode                                  | Risk     | Mitigation                                      |
|-----------------------------------------------|----------|-------------------------------------------------|
| Claiming insurance guarantees medical outcome | Critical | Hard restriction H1; always frame as financial  |
| Pitching during grief/emotional disclosure    | Critical | Empathy-first rule mandatory                    |
| Collecting lead after emotional disclosure    | High     | Lead policy blocks for 1+ turns post-emotion    |
| Missing cancer history → ACP-04 routing       | High     | Detection rule; route any history mention       |

---

## Success Criteria
1. Customer understands lump sum vs. treatment-based distinction
2. Emotional context handled appropriately (no pitch during grief)
3. Lead captured after educational value delivered
4. Zero "guarantees cure" language
5. Zero premature lead capture during emotional moments

---

## Regression Tests (Summary)
6 test cases covering: lump sum question, cancer stages question, family cancer history, personal cancer history (ACP-04 routing), trust signal, and waiting period question.

Full test cases: see `Regression.md`

---

## Metrics

| Metric                                        | Target    |
|-----------------------------------------------|-----------|
| Empathy-first compliance (emotional signals)  | 100%      |
| "Guarantees cure" violation rate              | 0%        |
| Lead capture timing compliance                | 100%      |
| ACP-04 routing accuracy                       | ≥ 95%     |

---

## Future Extensions (Summary)
- Cancer stage coverage visualization
- Waiting period calculator
- Cancer statistics education module

Full roadmap: see `Future_Extensions.md`

---

## Version History

| Version | Date       | Author   | Notes           |
|---------|------------|----------|-----------------|
| 1.0     | 2026-06-27 | Jirawat  | Initial release |
