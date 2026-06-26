# 13 — Existing Insurance

**Document ID**: AIOS-CID-13  
**Topic**: มีประกันอยู่แล้ว — Customer with Existing Insurance  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand if their current coverage is sufficient
- Identify gaps in existing coverage
- Know if they're over-insured (and could save money)
- Understand how to complement, not duplicate, existing coverage
- Make an informed decision about adding or changing insurance

---

## Common Customer Messages

- "มีประกันอยู่แล้วครับ ต้องทำเพิ่มไหม?"
- "ประกันจากบริษัทคุ้มพอไหมครับ"
- "มีประกันสังคมอยู่ มันพอไหมครับ?"
- "มีประกันชีวิตอยู่แล้ว อยากเพิ่มความคุ้มครองสุขภาพ"
- "กลัวซื้อซ้ำซ้อนกัน"
- "ต้องเปลี่ยนประกันหรือทำเพิ่มดีครับ"
- "ของเดิมครอบคลุมอะไรบ้าง ไม่รู้เลยครับ"

---

## Expected Intent

`existing_insurance_review` / `ask_recommendation` / `need_discovery`

---

## Expected Emotion

`CAUTIOUS` to `ANALYTICAL` — customer wants to make a smart decision, not be sold something they don't need.

---

## Expected Capability

- CoverageReviewer
- GapAnalyzer
- NeedDiscovery
- LeadCapture (after gap analysis complete)

---

## Knowledge Required

- Social Security insurance (ประกันสังคม) coverage limits
- Company group insurance typical coverage scope
- How to identify gaps: room rate limits, sub-limits, exclusions
- Typical scenarios where group insurance is insufficient
- How individual insurance complements group insurance

---

## Decision Rules

1. **NEVER assume existing coverage is insufficient before asking what it covers**
2. Ask what type of existing insurance first (group, social security, individual)
3. Key gap signals to listen for:
   - Room rate limit below 3,000/night (common gap)
   - No coverage for pre-existing conditions
   - No coverage for critical illness / cancer
   - No coverage after leaving current employer
   - Benefit unit system (ระบบเหมาจ่ายจำกัด) instead of actual cost reimbursement
4. If existing coverage is genuinely sufficient → say so honestly
5. If customer is over-insured → tell them honestly; don't push more products

---

## Conversation Strategy

**Understand What They Have → Identify Real Gaps → Recommend to Fill Gaps Only**

The unique challenge: the right answer might be "you don't need more insurance right now." Saying this builds far more trust than selling an unnecessary policy.

---

## Expected AI Reply

**For "มีประกันสังคมอยู่ มันพอไหมครับ":**
```
ประกันสังคมให้ความคุ้มครองพื้นฐานครับ แต่มีข้อจำกัดบางอย่างที่ควรรู้ครับ

ประกันสังคมครอบคลุมครับ:
✅ ค่ารักษาพยาบาลในโรงพยาบาลคู่สัญญา
✅ ค่าคลอดบุตร (จำนวนจำกัด)
✅ ทุพพลภาพ และเสียชีวิต (บางส่วน)

แต่มีช่องว่างที่คนมักพบครับ:
⚠️ ต้องไปโรงพยาบาลในระบบเท่านั้น (เลือกเองไม่ได้)
⚠️ ไม่คุ้มครองโรคร้ายแรงแบบเบิกเงินก้อน
⚠️ หายออกจากระบบประกันสังคมแล้วก็หายไปด้วย

คุณมีโรคประจำตัวหรือครอบครัวที่ต้องดูแลด้วยไหมครับ?
```

**For "กลัวซื้อซ้ำซ้อน":**
```
เป็นเรื่องดีที่คิดแบบนี้ครับ การซื้อซ้ำซ้อนเป็นปัญหาจริง ๆ ครับ

ก่อนแนะนำอะไรเพิ่ม ขอถามก่อนนะครับ:
ตอนนี้มีประกันประเภทอะไรบ้างครับ?
• ประกันสังคม
• ประกันกลุ่มจากบริษัท
• ประกันชีวิตส่วนตัว
• ประกันสุขภาพส่วนตัว

รู้แค่นี้แล้วผมจะช่วยดูได้เลยว่ายังขาดอะไรอยู่หรือเปล่าครับ
```

---

## Gap Analysis Framework

| Coverage Type | What to Ask | Common Gap |
|---|---|---|
| ประกันสังคม | "ไปโรงพยาบาลอะไรได้บ้าง?" | จำกัดโรงพยาบาลคู่สัญญา, ไม่มีโรคร้ายแรง |
| ประกันกลุ่มบริษัท | "ค่าห้องคืนละเท่าไร? วงเงินรวมต่อปีเท่าไร?" | ค่าห้องต่ำ, วงเงินจำกัด, หายตอนออกงาน |
| ประกันชีวิตส่วนตัว | "ทุนประกันเท่าไร? ไม่มีสุขภาพรวมหรือเปล่า?" | ไม่มีความคุ้มครองสุขภาพ |
| ประกันสุขภาพส่วนตัว | "เบิกอะไรได้บ้าง? มี sub-limit ไหม?" | OPD ไม่ครอบคลุม, ไม่มีโรคร้ายแรง |

---

## When to Say "You Don't Need More"

If customer already has:
- Individual health insurance with adequate room rate (3,000+/night)
- Actual cost reimbursement (ไม่ใช่ระบบเหมาจ่าย)
- OPD coverage or acceptable OPD plan
- No major coverage gap

→ Honestly tell them: "จากที่บอกมา ดูเหมือนครอบคลุมค่อนข้างดีครับ อาจยังไม่จำเป็นต้องเพิ่มตอนนี้"

This builds trust and positions Jirawat as an honest advisor, not a salesperson.

---

## When to Resume Lead Capture

After: existing coverage reviewed + real gap identified + customer agrees gap matters.

---

## Regression Examples

### Good Conversation

```
Customer: มีประกันกลุ่มจากบริษัทอยู่แล้ว ต้องทำเพิ่มไหมครับ

AI: ขึ้นอยู่กับว่าของที่มีครอบคลุมเท่าไรครับ
    ค่าห้องพักในประกันกลุ่มของคุณคืนละเท่าไรครับ?

Customer: 1,500 บาทครับ

AI: งั้นมีช่องว่างนิดนึงครับ
    โรงพยาบาลเอกชนส่วนใหญ่ค่าห้องตอนนี้ 2,500-4,000 บาท/คืนครับ
    ถ้าพักเกิน 1,500 ต้องจ่ายส่วนเกินเองครับ
    
    แบบส่วนตัวที่เพิ่มความคุ้มครองส่วนนี้ เบี้ยประมาณ 800-1,500 บาท/เดือนครับ
    สนใจดูรายละเอียดเพิ่มเติมไหมครับ?
```

### Bad Conversation

```
Customer: มีประกันกลุ่มจากบริษัทอยู่แล้วครับ

AI: ประกันกลุ่มบริษัทไม่เพียงพอแน่นอนครับ! 
    ต้องทำประกันส่วนตัวเพิ่มทันทีครับ 
    ขอเบอร์โทรเพื่อให้ตัวแทนติดต่อกลับครับ
```

**Why bad**: Assumes group insurance is insufficient without even knowing what it covers. Pushes for lead immediately.

---

## Lessons Learned

1. **"มีแล้ว" is a signal to investigate, not ignore.** The best follow-up to "I already have insurance" is "what does it cover?"
2. **Honestly saying "you don't need more" is the most powerful trust-building move in this scenario.** If a customer doesn't need more, say so. If they later need more, they'll come back to Jirawat first.
3. **Room rate gap is the most common real gap.** 1,500/night group vs. 3,000+/night private hospital is the #1 gap to look for.

---

## Cross References

- `04_MEDICAL_UNDERWRITING.md` — Existing conditions may affect new coverage
- `10_NEED_DISCOVERY.md` — Understanding existing coverage is part of need discovery
- `09_PRODUCT_COMPARISON.md` — Comparing individual vs. group coverage
- `11_RECOMMENDATION.md` — Recommendation after gap analysis

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
