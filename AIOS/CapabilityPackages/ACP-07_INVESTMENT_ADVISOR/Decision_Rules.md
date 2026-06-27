---
Document ID: ACP-07-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07 Decision Rules

**Priority Level**: ELEVATED
*(Investment products carry regulatory and reputational risk; all return claims require risk disclosure)*

---

## Activation Conditions

| Condition                           | Logic                                                           |
|-------------------------------------|-----------------------------------------------------------------|
| Investment insurance intent         | `intent IN [product_investment, ask_investment_insurance, ask_ilp_return]` |
| ILP keyword in message              | Keywords: ยูนิตลิงค์, Unit-Linked, ILP, กองทุน, ผลตอบแทน, ลงทุน |
| ACP-06/ACP-10 cross-trigger         | Investment component of retirement or need discovery            |

---

## Execution Conditions

STRICT SEQUENCE — must follow this order every time:

1. **Explain ILP Structure**: Insurance protection + investment return in one product.
2. **MANDATORY Risk Disclosure**: Before or immediately after explaining potential returns: "ประกันแบบยูนิตลิงค์มีความเสี่ยงด้านการลงทุน ผลตอบแทนไม่ได้รับการรับประกันครับ"
3. **Risk Tolerance Assessment**: Ask ONE risk tolerance question per turn.
4. **Risk Classification**: Classify customer as risk-tolerant or risk-averse based on response.
5. **Risk-Averse Redirect**: If customer cannot accept investment risk → immediately redirect to savings-based products.
6. **Continue ILP Education**: Only for risk-tolerant customers.
7. **Lead Capture**: Only after risk tolerance is classified and noted.

### Risk Tolerance Assessment Questions (ONE per turn)

| Question                                                                             | Classifies Toward              |
|--------------------------------------------------------------------------------------|--------------------------------|
| "ถ้าเงินที่ลงทุนลดลงชั่วคราว คุณรู้สึกยังไงครับ?"                                 | Risk-averse if cannot tolerate |
| "ต้องการผลตอบแทนที่การันตีหรือยอมรับความผันผวนได้ครับ?"                            | Risk-averse if guaranteed      |
| "เคยลงทุนในกองทุนรวมหรือหุ้นมาก่อนไหมครับ?"                                       | Risk-tolerant if experienced   |

---

## Exit Conditions

| Condition                                  | Exit Type             |
|--------------------------------------------|-----------------------|
| Risk-tolerant customer; lead captured      | Success — ILP         |
| Risk-averse customer; redirected           | Success — Redirect    |
| Trust signal                               | Interrupt → ACP-08   |

---

## Interrupt Conditions

| Trigger                                  | Priority  | Action                                            |
|------------------------------------------|-----------|---------------------------------------------------|
| Trust signal                             | CRITICAL  | → ACP-08                                         |
| Customer asks for guaranteed return      | HIGH      | Never guarantee; re-disclose risk                 |
| Customer shows signs of financial stress | HIGH      | Do not push investment product; explore savings   |

---

## Fallback Rules

| Scenario                                  | Fallback Action                                         |
|-------------------------------------------|---------------------------------------------------------|
| Customer asks about specific fund returns | "AI ไม่สามารถให้ข้อมูล NAV หรือผลตอบแทนเฉพาะได้ครับ คุณจิรวัฒน์จะช่วยได้" |
| Customer wants both guarantee and growth  | Explain trade-off honestly; offer savings option        |
| Customer hostile to any risk discussion   | Validate concern; redirect directly to savings product  |
