# 03 — Cancer Insurance

**Document ID**: AIOS-CID-03  
**Topic**: ประกันมะเร็ง — Cancer Insurance Inquiry  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand what cancer insurance covers vs. health insurance
- Know if they need separate cancer coverage
- Understand how cancer benefits are paid (lump sum vs. reimbursement)
- Get guidance if a family member has/had cancer
- Assess their own cancer risk concern

---

## Common Customer Questions

- "ประกันมะเร็งกับประกันสุขภาพต่างกันยังไงครับ"
- "ประกันมะเร็งจ่ายเป็นก้อนหรือตามจริงครับ"
- "ทำไมต้องมีประกันมะเร็งแยกต่างหากครับ"
- "ถ้าคนในครอบครัวเป็นมะเร็ง เราจะทำประกันได้ไหมครับ"
- "มะเร็งทุกระยะคุ้มครองไหมครับ"
- "ถ้าเคยเป็นมะเร็งแล้วหายแล้ว ทำประกันได้ไหมครับ"
- "เบี้ยประกันมะเร็งแพงไหมครับ"

---

## Expected Intent

`product_cancer` / `medical_condition` / `ask_premium`

---

## Expected Emotion

`ANXIOUS` to `CURIOUS` — cancer is an emotionally charged topic. Customer may have a personal or family history that makes them more emotionally invested than a typical product inquiry. AI must lead with empathy.

---

## Expected Capability

- CancerInsuranceExplainer
- MedicalEngine (if personal cancer history mentioned)
- NeedDiscovery
- LeadCapture (after education + context understood)

---

## Knowledge Required

- Difference between cancer insurance (โรคร้ายแรง / CI) and health insurance (สุขภาพ)
- Lump sum payment mechanism
- Cancer staging and coverage (all stages vs. major stage only)
- Family history impact on underwriting
- Waiting period (typically 90 days)
- What lump sum is for (life disruption, not just medical bills)

---

## Decision Rules

1. Customer asks about cancer insurance → lead with WHAT it is before asking anything
2. If customer mentions personal cancer history → immediately apply `04_MEDICAL_UNDERWRITING.md` — do NOT discuss coverage terms first
3. If customer mentions family member has cancer → first express empathy; then clarify if question is about the family member getting insurance OR about the customer getting cancer insurance based on family history concern
4. "ประวัติครอบครัวเป็นมะเร็ง" is a different conversation than "ตัวเองเป็นมะเร็ง" — handle them differently
5. Never guarantee coverage for anyone with current or recent cancer history

---

## Conversation Strategy

**Empathize → Educate → Differentiate → Discover → Personalize**

1. **Empathize**: Cancer is a scary topic. Acknowledge any emotional weight first.
2. **Educate**: Explain what cancer insurance uniquely provides (lump sum, not just medical reimbursement)
3. **Differentiate**: Make clear why it's separate from health insurance (different purpose)
4. **Discover**: Ask about personal history, family history, and financial concern
5. **Personalize**: Give relevant recommendation based on their specific situation

---

## Expected AI Thinking

> Customer asked about cancer insurance. This is an emotionally charged topic — they might have a family member who's sick, or they might have read about statistics. I should not treat this like a neutral product inquiry.
>
> First: explain clearly what cancer insurance IS and WHY it's different from health insurance. The key insight most customers don't know: cancer insurance pays a LUMP SUM for life disruption (lost income, travel, caregiver costs) — not just medical bills. That's the value proposition.
>
> Then I need to understand their situation — do they have a personal or family history concern? That changes everything about which products apply.

---

## Expected AI Reply

**For "ประกันมะเร็งกับประกันสุขภาพต่างกันยังไงครับ":**
```
เป็นคำถามที่ดีมากครับ หลายคนสงสัยข้อนี้เหมือนกัน 😊

ประกันสุขภาพ = จ่ายตามจริง เมื่อเข้าโรงพยาบาล
ประกันมะเร็ง = จ่ายเป็นก้อน เมื่อตรวจพบมะเร็ง (ไม่ว่าจะเข้าโรงพยาบาลหรือไม่)

ตัวอย่างเช่น ถ้าตรวจพบมะเร็งและได้รับเงินก้อน 1 ล้านบาท เงินนี้ใช้ได้กับ
• ค่าที่ขาดรายได้ช่วงรักษา
• ค่าเดินทางและที่พักสำหรับครอบครัว
• ค่ารักษาแบบทางเลือก
• ค่าใช้จ่ายส่วนตัวที่ไม่ครอบคลุมในประกันสุขภาพ

ถามหน่อยนะครับ สนใจเพราะกังวลเรื่องอะไรเป็นพิเศษครับ — มีประวัติครอบครัวหรือแค่อยากวางแผนล่วงหน้าครับ?
```

**For "ถ้าคนในครอบครัวเป็นมะเร็ง เราจะทำประกันได้ไหมครับ":**
```
ขอถามให้ชัดขึ้นก่อนนะครับ เพราะอยากตอบให้ถูกต้องครับ

คำถามนี้หมายถึง:
1. อยากให้ครอบครัวที่กำลังเป็นมะเร็งทำประกันได้ไหม?
2. ตัวเองมีประวัติครอบครัวเป็นมะเร็ง แต่ตัวเองยังปกติ อยากทำประกันได้ไหม?

คือสองกรณีนี้คำตอบต่างกันครับ 🙏
```

---

## Follow-up Questions

| Turn | Signal | AI Response |
|---|---|---|
| 2 | "แค่อยากวางแผน ยังไม่มีประวัติ" | Ask age → then explain waiting period → then estimate premium range |
| 2 | "พ่อแม่เคยเป็นมะเร็ง" | Acknowledge concern; explain family history affects underwriting but doesn't disqualify; ask their current age and health status |
| 2 | "ตัวเองเคยเป็นมะเร็ง" | Route to `04_MEDICAL_UNDERWRITING.md` immediately; do not discuss product terms |

---

## When NOT to Ask for Lead

- When customer mentions personal cancer history (they need medical guidance, not a sales conversation)
- When customer is emotionally distressed (family member just diagnosed)
- When customer is clearly in "early research" mode with high uncertainty

---

## When to Resume Lead Capture

- Customer says they are healthy and just want to plan ahead
- Customer has a family history concern but is personally healthy and interested in coverage
- Customer has resolved their medical questions and expresses intent to apply

Sequence: Age → Family history status → Current health → Phone/Name → Handoff

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Current cancer diagnosis | Route to `04_MEDICAL_UNDERWRITING.md`; explain case-by-case; offer human agent |
| Customer seems distressed | Pause product talk; acknowledge emotion; ask "มีอะไรให้ช่วยไหมครับ?" |
| Customer asks for exact premium | Note that exact premium requires health declaration; offer to have Jirawat follow up |

---

## Regression Examples

### Good Conversation

```
Customer: ประกันมะเร็งจ่ายเป็นก้อนหรือตามจริงครับ

AI: จ่ายเป็นก้อนครับ ซึ่งเป็นจุดที่แตกต่างจากประกันสุขภาพมากครับ

    ตัวอย่างเช่น ถ้าแผนคุ้มครอง 1 ล้านบาท เมื่อตรวจพบมะเร็ง (ไม่ว่าระยะไหน
    ขึ้นอยู่กับแผน) จะได้รับเงินก้อนทันทีครับ ไม่ต้องรอเบิกตามใบเสร็จ

    เงินก้อนนี้ใช้ได้กับทุกอย่างครับ ทั้งค่ารักษา ค่าขาดรายได้ ค่าดูแลครอบครัว

    สนใจเพราะกังวลเรื่องอะไรเป็นพิเศษครับ? มีประวัติครอบครัวหรือแค่อยากวางแผนล่วงหน้า?
```

### Bad Conversation

```
Customer: ถ้าคนในครอบครัวเป็นมะเร็ง เราจะทำประกันได้ไหมครับ

AI: ได้ครับ กรุณาแจ้งชื่อ อายุ และเบอร์โทรของคุณ 
    เพื่อให้ตัวแทนติดต่อกลับครับ
```

**Why bad**: Customer asked a sensitive, ambiguous question about family cancer situation. AI immediately asked for personal data without clarifying the situation, without empathy, without answering anything.

---

## Lessons Learned

1. **Cancer is emotionally loaded — lead with empathy, not product facts.** Even for customers who seem factual ("just asking"), acknowledging that this is an important topic goes a long way.
2. **Always clarify "ครอบครัวเป็นมะเร็ง" before answering.** This could mean the customer's family member is currently ill (very different from "family history risk"). Answering the wrong one wastes both parties' time and can feel callous.
3. **Lump sum benefit is the unique value proposition.** Most customers don't know this — they think cancer insurance is just "more health insurance." Explaining the income replacement and life disruption angle is what makes the product click.

---

## Cross References

- `04_MEDICAL_UNDERWRITING.md` — For customers with personal cancer history
- `02_HEALTH_INSURANCE.md` — Explaining difference between products
- `09_PRODUCT_COMPARISON.md` — When customer compares cancer vs. health insurance
- `AIOS/Learning/PATTERN-MEDICAL-001` — Medical empathy before capture

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
