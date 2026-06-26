# 11 — Recommendation

**Document ID**: AIOS-CID-11  
**Topic**: การแนะนำผลิตภัณฑ์ — Product Recommendation  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Receive a recommendation that fits their actual situation
- Understand WHY this recommendation is right for them
- Feel that the recommendation is honest, not just what's being promoted
- Have a clear next step

---

## Common Contexts for Recommendation

- After completing need discovery
- After customer asks "ควรทำแบบไหนดีครับ?"
- After customer provides enough context (age + goal + budget)
- After comparison conversation

---

## Expected Intent

`ask_recommendation` / `ready_to_buy` (borderline)

---

## Expected Emotion

`RECEPTIVE` — customer is in listening mode; they are looking for guidance.

---

## Expected Capability

- RecommendationEngine
- ProductKnowledge
- LeadCapture (this is the appropriate time to collect contact info)

---

## Decision Rules

1. **Recommendation requires minimum context**: age + primary goal + budget range
2. If context is incomplete → ask for the missing piece before recommending
3. Recommend MAXIMUM 2 products — more creates confusion
4. ALWAYS explain WHY this recommendation fits THEIR situation
5. Never recommend based on what's "popular" without tying it to their context
6. End with a clear CTA: "คุยกับคุณจิราวัฒน์เพื่อดูรายละเอียดได้เลยครับ"

---

## Recommendation Logic by Context

| Customer Profile | Primary Recommendation | Secondary Consideration |
|---|---|---|
| Young, single, healthy | ประกันสุขภาพ (build foundation) | ประกันชีวิต if income support needed |
| Young, married, no kids | ประกันชีวิต + ประกันสุขภาพ | — |
| Married with young children | ประกันชีวิต (protection) + ประกันสุขภาพ | ประกันมะเร็ง/โรคร้ายแรง |
| Age 35–50, tax focus | ประกันชีวิต (tax deduction) | ประกันสุขภาพ |
| Near retirement | ประกันบำนาญ + ประกันสุขภาพ | — |
| Risk-tolerant, wealth builder | Unit-linked + ประกันสุขภาพ | — |

---

## Expected AI Reply

**After need discovery complete (age 35, married, 2 kids, budget 5,000/month):**
```
จากที่คุยกันมา ผมแนะนำ 2 อย่างครับ

1️⃣ ประกันชีวิต (แบบมีเงินออม) — เพราะมีลูก 2 คน ถ้าเกิดอะไรขึ้นกับคุณ ครอบครัวยังมีเงินดูแลตัวเองได้ครับ งบ 2,000–3,000 บาท/เดือน

2️⃣ ประกันสุขภาพ — ค่าโรงพยาบาลเอกชนตอนนี้แพงมากครับ ไม่อยากให้กระทบเงินออมครอบครัวครับ งบ 1,500–2,500 บาท/เดือน

รวมประมาณ 4,000–5,000 บาท/เดือน พอดีกับงบที่วางไว้ครับ 😊

ให้คุณจิราวัฒน์ช่วยออกแบบแผนที่เหมาะสมกว่านี้ได้ครับ ขอชื่อที่สะดวกได้ไหมครับ?
```

---

## When NOT to Ask for Lead

- Do not ask for phone before the recommendation is delivered
- The recommendation itself is the value delivery — lead capture comes AFTER value is received

---

## When to Resume Lead Capture

Immediately after recommendation is delivered and customer shows positive signal.
If customer is quiet: ask "ที่แนะนำไปตอบโจทย์ไหมครับ?" before asking for data.

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer wants very specific plan details | Recommend handoff to Jirawat for detailed quote |
| Customer wants to compare multiple plans in detail | Route to `09_PRODUCT_COMPARISON.md` then handoff |
| Customer says "ready to buy" | Route to `18_CLOSING.md` |

---

## Regression Examples

### Good Conversation

```
Customer: อายุ 40 มีครอบครัว งบ 3,000/เดือน ควรทำอะไรครับ?

AI: งบ 3,000 บาท/เดือน สำหรับครอบครัวที่อายุ 40 แนะนำแบบนี้ครับ

    ✅ ประกันสุขภาพก่อน — ป้องกันค่ารักษาพยาบาลที่อาจสูงถึงหลักแสนครับ
    ✅ ถ้าเหลือ — เพิ่มความคุ้มครองชีวิตเพื่อดูแลครอบครัว
    
    งบ 3,000 เน้นสุขภาพเต็มที่ได้เลยครับ แล้วค่อย ๆ เพิ่มชีวิตทีหลัง
    
    ให้คุณจิราวัฒน์ช่วยออกแบบรายละเอียดได้นะครับ ขอชื่อที่สะดวกได้ไหมครับ?
```

### Bad Conversation

```
Customer: อายุ 40 มีครอบครัว งบ 3,000/เดือน ควรทำอะไรครับ?
AI: แนะนำทำทั้ง ประกันชีวิต ประกันสุขภาพ ประกันมะเร็ง ประกันบำนาญ 
    ครบทุกอย่างเลยจะได้คุ้มครองครบครับ!
```

**Why bad**: Recommends everything regardless of budget. Customer said 3,000/month budget — buying all 4 products is impossible. This is not a recommendation, it's a list.

---

## Lessons Learned

1. **Recommendation with reasoning builds trust; recommendation without reasoning builds doubt.**
2. **Maximum 2 products per recommendation.** More than 2 overwhelms and reduces decision quality.
3. **Tie every recommendation to something the customer said.** "เพราะมีลูก 2 คน..." is far more persuasive than "ผลิตภัณฑ์นี้ดีมากครับ."

---

## Cross References

- `10_NEED_DISCOVERY.md` — Prerequisites for recommendation
- `12_PRICE_OBJECTION.md` — After recommendation, customer may object to price
- `18_CLOSING.md` — After recommendation accepted
- `16_HUMAN_HANDOFF.md` — Recommendation always leads to Jirawat handoff

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
