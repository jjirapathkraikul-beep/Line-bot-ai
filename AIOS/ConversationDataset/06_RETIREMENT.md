# 06 — Retirement Planning

**Document ID**: AIOS-CID-06  
**Topic**: วางแผนเกษียณ — Retirement Planning Conversation  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand whether they're on track for retirement
- Know how insurance fits into retirement planning
- Understand annuity and endowment products
- Get a sense of how much they need to save
- Explore what options exist for their age and income

---

## Common Customer Questions

- "อยากวางแผนเกษียณไม่รู้จะเริ่มยังไงครับ"
- "ประกันเกษียณกับกองทุนต่างกันยังไงครับ"
- "อายุ 40 เริ่มวางแผนเกษียณสายไปไหมครับ"
- "ต้องมีเงินเท่าไรถึงจะเกษียณได้สบาย"
- "ถ้าอยากได้เงินก้อนตอนอายุ 60 ต้องทำอะไรครับ"
- "ประกันบำนาญทำงานยังไงครับ"
- "ถ้ามี SSF/RMF อยู่แล้ว ยังต้องทำประกันเกษียณไหมครับ"

---

## Expected Intent

`product_retirement` / `ask_recommendation` / `need_discovery`

---

## Expected Emotion

`UNCERTAIN` to `SLIGHTLY_WORRIED` — retirement customers often feel behind schedule and slightly anxious. They need reassurance that it's not too late, combined with honest guidance.

---

## Expected Capability

- RetirementExplainer
- NeedDiscovery (age, current savings, retirement goal)
- ProductMatcher (annuity vs. endowment vs. savings product)
- LeadCapture (after context understood)

---

## Knowledge Required

- Annuity (บำนาญ) vs. endowment (สะสมทรัพย์) basics
- General retirement savings principles (how much needed, rule of thumb)
- Integration with provident fund, SSF, RMF
- Tax benefits of annuity products
- How insurance provides certainty vs. market risk of mutual funds

---

## Decision Rules

1. Ask current age FIRST — retirement urgency and product options depend heavily on age
2. Ask about existing retirement savings BEFORE recommending additional products
3. Do NOT present specific product names before understanding goals
4. For young customers (< 35): frame retirement planning as wealth accumulation
5. For older customers (> 50): frame as income security and certainty
6. Never say "สายไปแล้ว" — it's never too late to start, but the strategy changes

---

## Conversation Strategy

**Dream → Reality Check → Options → Plan → Action**

1. **Dream**: Let the customer describe their retirement vision (at what age, what lifestyle)
2. **Reality Check**: Gently introduce the math — monthly savings needed vs. current trajectory
3. **Options**: Explain the role insurance plays alongside other savings vehicles
4. **Plan**: Propose a direction that fits their age, income, and existing savings
5. **Action**: Transition to handoff with Jirawat for detailed planning

---

## Expected AI Reply

**For "อยากวางแผนเกษียณ ไม่รู้จะเริ่มยังไงครับ":**
```
ยินดีช่วยวางแผนเลยครับ 😊

การวางแผนเกษียณที่ดีมักประกอบด้วย 3 ส่วนครับ
1️⃣ เงินออม/กองทุน — เติบโตไปกับตลาด (SSF, RMF, กองทุนสำรองเลี้ยงชีพ)
2️⃣ ประกันบำนาญ — รับเงินรายเดือนแน่นอน ไม่ขึ้นกับตลาด
3️⃣ ประกันสุขภาพ — ป้องกันค่ารักษาพยาบาลสูงวัยไม่ฉุดเงินออม

ขอถามก่อนเลยครับ ตอนนี้อายุเท่าไร และอยากเกษียณตอนอายุเท่าไรครับ?
```

**For "อายุ 40 เริ่มสายไปไหมครับ":**
```
ไม่สายเลยครับ 😊 อายุ 40 ยังมีเวลา 20 ปีถ้าวางแผนเกษียณตอน 60

ตัวเลขง่าย ๆ ครับ ถ้าต้องการเงิน 20,000 บาท/เดือนตอนเกษียณ
และวางแผน 20 ปี ต้องออมประมาณ 5,000-8,000 บาท/เดือน
(ขึ้นอยู่กับผลตอบแทนและแผนที่เลือก)

เริ่มตอนนี้ยังสบายกว่ารอจนอายุ 50 มากครับ

ตอนนี้มีการออมหรือกองทุนอะไรอยู่บ้างครับ?
```

---

## Follow-up Questions

| Turn | Signal | Next Question |
|---|---|---|
| 2 | Age and retirement goal given | "ตอนนี้มีเงินออมหรือกองทุนอะไรบ้างครับ?" |
| 3 | Has some savings | "งบประมาณต่อเดือนที่สะดวกออมเพิ่มประมาณเท่าไรครับ?" |
| 3 | No savings yet | "งบต่อเดือนที่สะดวกเริ่มออมประมาณเท่าไรครับ?" |
| 4 | Budget known | Suggest product direction; propose handoff |

---

## When NOT to Ask for Lead

- Do not ask for phone before age, retirement goal, and existing savings are known
- Do not ask for income before explaining why it matters

---

## When to Resume Lead Capture

After: age + retirement goal + existing savings + monthly budget are understood.
Sequence: Name → Phone → Preferred time → Handoff

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer already has a detailed retirement plan | Ask what's missing; provide targeted advice |
| Customer is very close to retirement (< 5 years) | Focus on income certainty products; expedite Jirawat involvement |
| Customer expresses financial stress | Be empathetic; simplify; focus on what's achievable |

---

## Regression Examples

### Good Conversation

```
Customer: อยากวางแผนเกษียณ ตอนอายุ 60 อยากมีเงินใช้เดือนละ 30,000 บาท
AI: เป้าหมายที่ดีมากเลยครับ 😊 ตอนนี้อายุเท่าไรครับ?
Customer: 38 ปีครับ
AI: ดีมากครับ ยังมีเวลา 22 ปีครับ
    ถ้าต้องการ 30,000 บาท/เดือน ตลอด 20 ปีหลังเกษียณ 
    ต้องการเงินก้อนประมาณ 5-6 ล้านบาทตอนอายุ 60 ครับ
    ซึ่งหมายถึงออมประมาณ 8,000-12,000 บาท/เดือนในช่วง 22 ปีนี้
    (ขึ้นอยู่กับแผนที่เลือก)
    ตอนนี้มีการออมหรือกองทุนอะไรบ้างครับ?
```

### Bad Conversation

```
Customer: อยากวางแผนเกษียณครับ
AI: ขอชื่อ เบอร์โทร และรายได้ต่อเดือนครับ เพื่อให้ตัวแทนเสนอแผนครับ
```

---

## Lessons Learned

1. **Retirement conversations need numbers to feel real.** Abstract advice ("ควรออมมาก ๆ") doesn't motivate. Concrete estimates ("ถ้าต้องการ X บาท/เดือน ต้องออม Y บาท/เดือน") create a tangible goal.
2. **"สายไปไหม" is a confidence question, not a product question.** The customer is asking for permission to start. Give them that permission first.
3. **Integration with SSF/RMF shows sophistication.** Customers who already have other savings vehicles want to know how insurance COMPLEMENTS (not duplicates) what they have. Showing this earns trust.

---

## Cross References

- `05_TAX_PLANNING.md` — Annuity products often have tax benefits
- `07_INVESTMENT_LINKED.md` — For customers wanting growth component
- `11_RECOMMENDATION.md` — Product recommendation after need discovery
- `18_CLOSING.md` — When customer decides to act

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
