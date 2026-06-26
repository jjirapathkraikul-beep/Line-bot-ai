# 07 — Investment-Linked Insurance

**Document ID**: AIOS-CID-07  
**Topic**: ประกันควบการลงทุน (Unit-Linked / ILP)  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand what investment-linked insurance is
- Know the difference from savings insurance and mutual funds
- Assess whether ILP fits their goals
- Understand the risks involved
- Know how to compare ILP products

---

## Common Customer Questions

- "ประกันควบการลงทุนคืออะไรครับ"
- "ต่างจากกองทุนรวมยังไงครับ"
- "ให้ผลตอบแทนดีไหมครับ"
- "ความเสี่ยงสูงไหม"
- "เหมาะกับคนรับความเสี่ยงได้น้อยไหมครับ"
- "ถ้าตลาดหุ้นตก เบี้ยประกันหายไปด้วยไหม"
- "ทำแล้วยกเลิกได้ไหมครับ"

---

## Expected Intent

`product_investment` / `ask_recommendation` / `ask_premium`

---

## Expected Emotion

`CURIOUS` to `CAUTIOUS` — ILP customers are often sophisticated but worried about risk. Many have heard negative stories. AI must be balanced, not a pure sales pitch.

---

## Expected Capability

- ILPExplainer
- RiskDiscovery
- NeedDiscovery
- LeadCapture (after risk profile understood)

---

## Knowledge Required

- ILP structure: protection + investment components
- Fund choices and risk levels
- Surrender charges and lock-in periods
- How it differs from pure savings insurance (endowment)
- How it differs from mutual funds (insurance protection layer)
- Regulatory disclosure requirements

---

## Decision Rules

1. **MUST** acknowledge risk honestly — AI must NOT oversell returns
2. Ask risk tolerance BEFORE product details
3. If customer asks for expected returns → explain market dependency, do not give specific % guarantees
4. If customer seems risk-averse → honestly suggest ILP may not be the best fit; explore savings products instead
5. Never fabricate historical performance data

---

## Conversation Strategy

**Understand → Educate Honestly → Assess Risk → Match or Redirect**

The unique challenge of ILP: the right answer might be "this isn't for you." AI must be willing to redirect risk-averse customers to more appropriate products, even if that means ILP doesn't get sold.

---

## Expected AI Reply

**For "ประกันควบการลงทุนคืออะไรครับ":**
```
ประกันควบการลงทุน (Unit-Linked) เป็นผลิตภัณฑ์ที่รวม 2 อย่างไว้ด้วยกันครับ

🛡️ ความคุ้มครองชีวิต — เหมือนประกันชีวิตทั่วไป
📈 การลงทุน — ส่วนหนึ่งของเบี้ยนำไปลงทุนในกองทุนที่เลือกได้

จุดต่างจากกองทุนรวมครับ:
• มีความคุ้มครองชีวิตด้วย
• ลดหย่อนภาษีได้
• แต่มีค่าธรรมเนียมมากกว่า และมี lock-in period

จุดต่างจากประกันออมทรัพย์:
• ผลตอบแทนขึ้นลงตามตลาด (ไม่การันตี)
• มีโอกาสได้มากกว่า แต่มีความเสี่ยงด้วย

คุณรับความเสี่ยงด้านการลงทุนได้มากน้อยแค่ไหนครับ?
```

---

## When NOT to Ask for Lead

- Do not ask for data before risk tolerance is understood
- Do not push forward with ILP if customer expresses strong risk aversion

---

## When to Resume Lead Capture

After: risk profile + investment goals + time horizon are understood. Only if ILP is confirmed appropriate.

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer wants guaranteed returns | Redirect to savings/endowment products honestly |
| Customer asks about specific fund performance | Explain market-dependent, provide Jirawat contact |
| Customer mentions significant capital to invest | Flag as high-value lead; expedite handoff |

---

## Regression Examples

### Good Conversation

```
Customer: ประกันควบการลงทุนให้ผลตอบแทนดีไหมครับ

AI: ตอบตรง ๆ ครับ — ขึ้นอยู่กับตลาดครับ ไม่มีการการันตีผลตอบแทน

    ถ้าตลาดดี ผลตอบแทนอาจสูงกว่าประกันออมทรัพย์ทั่วไป
    ถ้าตลาดไม่ดี มูลค่ากองทุนอาจลดลงได้ครับ

    เพราะฉะนั้นก่อนจะแนะนำ อยากถามก่อนครับ รับความเสี่ยงได้มากน้อยแค่ไหนครับ?
```

### Bad Conversation

```
Customer: ประกันควบการลงทุนให้ผลตอบแทนดีไหมครับ
AI: ผลตอบแทนดีมากครับ! เฉลี่ยปีละ 8-12% ทีเดียว ต้องการสมัครไหมครับ?
```

**Why bad**: Fabricated specific return percentages, no risk disclosure, immediately pushed to signup.

---

## Lessons Learned

1. **Honest risk disclosure builds more trust than overselling returns.** Customers who are told the truth and still choose ILP become better long-term clients than customers who were misled.
2. **Redirecting a wrong-fit customer is a good conversation outcome.** If a risk-averse customer is steered to a savings product instead, that's a win for everyone.

---

## Cross References

- `06_RETIREMENT.md` — ILP may be part of retirement planning
- `05_TAX_PLANNING.md` — ILP often has tax deduction benefit
- `12_PRICE_OBJECTION.md` — ILP customers often ask about fees
- `09_PRODUCT_COMPARISON.md` — ILP vs. mutual fund vs. savings insurance

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
