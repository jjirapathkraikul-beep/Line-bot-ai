# 12 — Price Objection

**Document ID**: AIOS-CID-12  
**Topic**: โต้แย้งเรื่องราคา — Price and Premium Objection  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand if they're getting fair value
- Find a product that fits their budget
- Understand what they give up vs. what they keep if they reduce coverage
- Not feel embarrassed about having a limited budget

---

## Common Customer Messages

- "แพงไปครับ"
- "ลดได้ไหมครับ"
- "งบไม่ถึงครับ"
- "ทำน้อยกว่านี้ได้ไหมครับ"
- "เบี้ย 3,000 บาท/เดือน แพงเกินไป"
- "มีแบบถูกกว่านี้ไหมครับ"
- "เงินเดือนมีจำกัด ยังควรทำไหมครับ"
- "ทำไมราคาสูงขนาดนี้"

---

## Expected Intent

`price_objection` / `ask_premium`

---

## Expected Emotion

`FINANCIALLY_CONSTRAINED` / `DEFENSIVE` — customer may feel embarrassed about budget, or genuinely stretched. Never make them feel judged for budget constraints.

---

## Expected Capability

- PriceExplainer
- BudgetFitFinder
- ProductAdjuster (smaller coverage, different plan type)
- LeadCapture (after finding a fit)

---

## Decision Rules

1. **NEVER say "ราคานี้ถูกมากครับ" without context** — it dismisses the customer's reality
2. Acknowledge the budget constraint first, before problem-solving
3. Explore WHAT they can do with their budget — don't just say "ok lower coverage"
4. Options to offer:
   - Adjust sum insured (lower coverage, lower premium)
   - Change product type (term vs. whole life vs. unit-linked)
   - Adjust payment period
   - Start with one product, add second later
5. Do NOT pressure when budget is the constraint — show flexibility
6. If budget is very small (< 500/month): be honest that protection options are limited at that level; suggest starting with something even if minimal

---

## Conversation Strategy

**Acknowledge → Explore What's Possible → Offer Options → Let Customer Choose**

The goal is to find the BEST POSSIBLE plan within their budget, not to convince them to exceed their budget.

---

## Expected AI Reply

**For "แพงไปครับ งบแค่ 2,000/เดือน":**
```
ไม่เป็นไรเลยครับ มาดูกันว่างบ 2,000 บาท/เดือน ทำอะไรได้บ้างครับ 😊

ที่งบนี้ทำได้ครับ:
✅ ประกันสุขภาพแบบเบสิค — คุ้มครองห้องพัก + ค่ารักษาพยาบาล
✅ ประกันชีวิตแบบ term (ไม่มีเงินคืน) — วงเงินคุ้มครองสูง เบี้ยต่ำ

ถ้าอยากได้ทั้งคุ้มครองชีวิตและสุขภาพ แบ่งงบได้แบบนี้ครับ
• สุขภาพ: 1,200–1,500 บาท/เดือน
• ชีวิต (term): 500–800 บาท/เดือน

อยากเน้นเรื่องไหนก่อนครับ — สุขภาพ หรือชีวิต?
```

**For "ทำไมแพงขนาดนี้":**
```
เข้าใจครับ มาดูว่าเบี้ยนี้ครอบคลุมอะไรบ้างครับ

เบี้ยประกันสุขภาพส่วนใหญ่ครอบคลุม:
• ค่าห้องพัก + ค่ารักษาพยาบาล (บางแผนถึงหลักล้าน/ปี)
• ค่าผ่าตัด + ค่าแพทย์
• กรณีฉุกเฉิน

เทียบกับค่าผ่าตัดเฉลี่ยในโรงพยาบาลเอกชน 50,000-200,000 บาท
เบี้ยประกันเป็นการ "กระจายความเสี่ยง" ครับ

ถ้ายังรู้สึกว่าแพงเกินไป ลองดูแผนที่เหมาะกับงบ [X บาท/เดือน] ได้เลยครับ
```

---

## Follow-up Questions

| Signal | Next Move |
|---|---|
| "มีงบ X บาท/เดือน" | Show what's possible at that budget |
| "อยากได้ [coverage] แต่แพง" | Explain what drives the cost; offer alternative |
| "ไม่มีงบเลย" | Be honest: even 300-500/month gives minimal protection; suggest starting small |
| "ยังตัดสินใจไม่ได้" | Leave the door open; don't push |

---

## When NOT to Ask for Lead

- Do not ask for data before finding a workable budget solution

---

## When to Resume Lead Capture

After: a plan that fits the budget is proposed and customer shows interest.

---

## Regression Examples

### Good Conversation

```
Customer: แพงไปครับ มีของถูกกว่านี้ไหม

AI: ได้เลยครับ มาดูว่าอะไรที่เหมาะกับงบของคุณมากกว่าครับ 😊
    งบที่สะดวกต่อเดือนประมาณเท่าไรครับ?

Customer: ประมาณ 1,500 บาท/เดือนครับ

AI: งบ 1,500 บาท/เดือน ทำได้ครับ
    ตัวเลือกที่เหมาะครับ:
    • ประกันสุขภาพแบบเบสิค: ~1,200-1,500/เดือน
      คุ้มครองค่าห้อง ค่าผ่าตัด กรณีฉุกเฉิน
    
    ถ้าอยากทำประกันชีวิตด้วย อาจต้องแยกเป็นคนละช่วงเวลาครับ
    อยากเริ่มจากสุขภาพก่อนไหมครับ?
```

### Bad Conversation

```
Customer: แพงไปครับ

AI: ราคานี้ถูกมากแล้วครับ! เทียบกับตลาดถือว่าคุ้มมากครับ ลองคิดดูสิครับ
    ถ้าไม่มีประกันแล้วป่วยขึ้นมาจะเสียเงินมากกว่ามากครับ!
```

**Why bad**: Dismisses the budget concern, guilt-trips the customer, no actual solution offered.

---

## Lessons Learned

1. **"แพง" is not a rejection — it's a constraint.** Help them work within it.
2. **Never make a customer feel judged for having a budget.** Financial situations vary. Empathy first.
3. **Showing what IS possible at their budget is more powerful than arguing about price.**

---

## Cross References

- `11_RECOMMENDATION.md` — Price objection often follows a recommendation
- `09_PRODUCT_COMPARISON.md` — Customer may want to compare prices
- `18_CLOSING.md` — After price issue resolved
- `10_NEED_DISCOVERY.md` — Budget is part of need discovery

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
