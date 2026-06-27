---
Document ID: ACP-09-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Decision Rules

**Priority Level**: STANDARD (ACP-08 overrides at CRITICAL)

---

## Activation Conditions

| Condition                              | Logic                                                            |
|----------------------------------------|------------------------------------------------------------------|
| Recommendation intent detected         | `intent IN [ask_recommendation, ready_for_recommendation, ask_what_to_buy]` |
| Context threshold met                  | Age + goal + ≥1 context factor all present in session memory    |
| No active trust concern                | `trust.acp08_active == FALSE`                                   |

---

## Activation Requirements Gate

If any requirement is missing, ACP-09 asks ONE question to fill the gap, then returns:

| Missing Requirement  | Question to Ask                                                   |
|----------------------|-------------------------------------------------------------------|
| Customer age         | "ขอทราบอายุคร่าวๆ ครับ เพื่อแนะนำได้เหมาะสมที่สุดครับ"        |
| Customer goal        | "เป้าหมายหลักที่อยากได้จากประกันคืออะไรครับ? คุ้มครอง ออม หรือลดหย่อน?" |
| Any context factor   | "มีงบประมาณเบี้ยประกันต่อปีคร่าวๆ ไหมครับ?"                    |

---

## Execution Conditions

1. **Synthesize Context**: Read all session memory from prior ACPs.
2. **Select Products**: Match customer context to product categories (max 2 products).
3. **Validate Selection**: Ensure each product fits at least 2 customer context factors.
4. **Compose Rationale**: For each product, identify the customer quote or stated fact that justifies it.
5. **Deliver Recommendation**: Use format "จากที่คุณบอกว่า [quote] ผมแนะนำ [product] เพราะ [reason]"
6. **Lead Capture After Delivery**: Offer name/phone collection only after recommendation is complete.

### Product Selection Logic

| Customer Context                            | Product Category Match                                   |
|---------------------------------------------|----------------------------------------------------------|
| Young + health concern + no prior coverage  | Health insurance (ACP-02 context)                        |
| Any age + cancer fear + family history      | Cancer insurance (ACP-03 context)                        |
| Pre-existing condition                      | Health insurance (flag for Jirawat underwriting review)  |
| Tax motivation + employed                   | Life insurance or health insurance (ACP-05 context)      |
| Age 40+ + retirement concern                | Annuity / endowment insurance (ACP-06 context)           |
| Risk-tolerant + growth seeking              | Unit-linked / ILP (ACP-07 context; risk-tolerant only)   |
| Risk-averse + savings goal                  | Endowment / savings insurance                            |
| Multiple needs (protection + savings)       | Two products from different categories (max 2)           |

---

## Exit Conditions

| Condition                             | Exit Type          |
|---------------------------------------|--------------------|
| Lead captured after recommendation    | Success            |
| Recommendation delivered; no lead     | Informed exit      |
| Trust signal                          | Interrupt → ACP-08 |

---

## Fallback Rules

| Scenario                                 | Fallback Action                                         |
|------------------------------------------|---------------------------------------------------------|
| No clear product match for customer      | "ผมแนะนำให้คุยกับคุณจิรวัฒน์โดยตรงครับ เพื่อออกแบบให้ตรงกับความต้องการ" |
| Customer rejects both recommendations    | Ask what didn't fit; adjust or offer Jirawat call       |
| Pre-existing condition flagged           | Recommend product category; flag underwriting in CRM; don't guarantee coverage |
