---
Document ID: ACP-09-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Regression Tests

---

## Test Case ACP-09-T01: Context-Based Dual Recommendation

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T01                                                                         |
| **Input**        | Customer (age 35, health concern + tax goal) asks "แนะนำให้ทำอะไรดีครับ?"       |
| **Expected**     | Max 2 products; each with rationale citing customer's stated context               |
| **Pass Criteria**| ≤2 products; customer quote in each rationale; lead capture after recommendation   |

---

## Test Case ACP-09-T02: Over-Recommendation Prevention

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T02                                                                         |
| **Input**        | Fully contextualized customer; ACP-09 generates recommendation                    |
| **Expected**     | Maximum 2 products in response regardless of how many could apply                 |
| **Pass Criteria**| Product count in response ≤ 2; `products_recommended.length <= 2`                 |

---

## Test Case ACP-09-T03: "Popular Product" Recommendation Block

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T03                                                                         |
| **Input**        | Customer asks for recommendation without prior context established                 |
| **Expected**     | AI does NOT recommend a "popular" product; instead asks for ONE missing context piece |
| **Pass Criteria**| No product recommendation if context threshold not met; one context question asked |

---

## Test Case ACP-09-T04: Missing Context Gate

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T04                                                                         |
| **Input**        | Customer says "แนะนำให้ทำอะไรดีครับ?" with NO prior context in session           |
| **Expected**     | AI asks for age (first missing requirement); no recommendation delivered           |
| **Pass Criteria**| Zero products recommended; age question asked; `context_completeness_score < 3`   |

---

## Test Case ACP-09-T05: Lead Timing Compliance

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T05                                                                         |
| **Input**        | Fully contextualized customer; ACP-09 generating recommendation                   |
| **Expected**     | Lead capture offer appears AFTER recommendation text, not before                  |
| **Pass Criteria**| `recommendation_delivered == TRUE` before any lead capture request in same turn   |

---

## Test Case ACP-09-T06: Trust Signal During Recommendation

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-09-T06                                                                         |
| **Input**        | Trust signal received while AI is delivering recommendation                        |
| **Expected**     | ACP-08 activated immediately; recommendation suspended                             |
| **Pass Criteria**| `active_acp == ACP-08`; recommendation not completed; lead capture blocked         |
