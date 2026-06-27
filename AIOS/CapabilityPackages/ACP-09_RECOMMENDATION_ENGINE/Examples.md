---
Document ID: ACP-09-EXAMPLES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-09 Examples

---

## Good Example 1: Context-Based Dual Recommendation

**Scenario**: Customer (age 35, health concern + tax motivation) asks for recommendation.

---

**ลูกค้า**: จากที่คุยมา แนะนำให้ผมทำอะไรดีครับ?

**AI**: จากที่คุณบอกว่ากังวลเรื่องค่าโรงพยาบาลและอยากลดหย่อนภาษีด้วยครับ ผมแนะนำ 2 ตัวเลือกที่น่าสนใจครับ

**1. ประกันสุขภาพ (IPD+OPD)** — เพราะคุณบอกว่ากังวลเรื่องค่ารักษาพยาบาล และที่อายุ 35 เบี้ยยังไม่สูงครับ นอกจากนี้เบี้ยประกันสุขภาพยังลดหย่อนภาษีได้สูงสุด 25,000 บาทต่อปีด้วยครับ ตรงกับเป้าหมายทั้งสองข้อของคุณเลยครับ

**2. ประกันชีวิตแบบสะสมทรัพย์** — เพราะคุณบอกว่าอยากมีเงินออมด้วยครับ แบบนี้จะได้ทั้งความคุ้มครองและเงินคืนตามกำหนดครับ และลดหย่อนภาษีได้อีก 100,000 บาทต่อปีครับ

ถ้าสนใจ ผมขอฝากชื่อและเบอร์โทรไว้ให้คุณจิรวัฒน์ติดต่อกลับ เพื่อคำนวณเบี้ยที่แน่ชัดและออกแบบแผนให้เหมาะกับคุณโดยเฉพาะครับ

**Why this is correct**:
- Cites customer's own words ("กังวลเรื่องค่าโรงพยาบาล", "อยากลดหย่อนภาษี")
- Exactly 2 products recommended
- Each product has a specific rationale linking to customer context
- Lead capture offered AFTER recommendation
- No guaranteed outcomes

---

## Good Example 2: Single Recommendation for Focused Need

**Scenario**: Customer (age 50, retirement concern only) asks for recommendation.

---

**ลูกค้า**: ก็แนะนำให้ทำอะไรดีครับสำหรับตอนนี้?

**AI**: จากที่คุณบอกว่าอยากมีเงินใช้หลังเกษียณ และตอนนี้อายุ 50 มีเวลาอีกประมาณ 10 ปีก่อนเกษียณครับ ผมแนะนำ **ประกันบำนาญ** ครับ

เพราะประกันบำนาญจะการันตีให้คุณได้รับเงินทุกปีหลังเกษียณตลอดชีวิต ตรงกับที่คุณบอกว่าอยากมีรายได้ประจำหลังเกษียณโดยไม่ต้องกังวลครับ ออมต่อเนื่อง 10 ปีก็สะสมได้น่าสนใจครับ

ถ้าสนใจให้คุณจิรวัฒน์ช่วยออกแบบแผนบำนาญที่เหมาะกับเป้าหมายรายได้ของคุณหลังเกษียณ ฝากชื่อและเบอร์โทรได้เลยครับ

**Why this is correct**:
- Single product appropriate for focused retirement need
- Customer's words cited ("อยากมีเงินใช้หลังเกษียณ", "รายได้ประจำ")
- Qualified language (ไม่ได้ guarantee specific amount)
- Lead capture after recommendation

---

## Bad Example 1: More Than 2 Products (VIOLATION)

**ลูกค้า**: แนะนำให้ทำอะไรดีครับ?

**AI (WRONG)**: ผมแนะนำให้ทำ 5 แบบครับ: 1) ประกันสุขภาพ 2) ประกันมะเร็ง 3) ประกันชีวิต 4) ประกันบำนาญ 5) ยูนิตลิงค์ ทำให้ครบจะได้คุ้มครองทุกด้านครับ!

**Why this is WRONG**:
- 5 products recommended (violates H1 — max 2)
- Creates decision paralysis
- Not personalized to any specific context
- No customer quote cited for any product

---

## Bad Example 2: "Popular Product" Recommendation Without Context (VIOLATION)

**ลูกค้า**: อยากทำประกัน แนะนำอะไรดีครับ?

**AI (WRONG)**: ตอนนี้ประกันสุขภาพขายดีที่สุดครับ ลูกค้าส่วนใหญ่เลือกแบบนี้ครับ แนะนำเลยครับ

**Why this is WRONG**:
- Recommends based on "most popular" without any customer context (violates H2)
- Does not know customer age, goal, or any context factor (violates H5)
- No customer quote cited
- Correct: First ask age and goal, then personalize the recommendation
