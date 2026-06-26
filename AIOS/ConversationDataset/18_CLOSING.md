# 18 — Closing

**Document ID**: AIOS-CID-18  
**Topic**: ปิดการขาย — Closing and Commitment  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Make a final decision with confidence
- Understand what happens next
- Not feel pressured into deciding
- Feel supported in their choice

---

## Common Customer Signals

- "โอเค สมัครได้เลยครับ"
- "พร้อมแล้วครับ"
- "ตัดสินใจแล้วครับ"
- "อยากเริ่มเลยครับ"
- "ส่งใบสมัครได้เลยไหมครับ"
- "ต้องทำอะไรต่อครับ?"
- "คุณจิราวัฒน์จะมาเมื่อไรครับ?"

---

## Expected Intent

`ready_to_buy` / `closing`

---

## Expected Emotion

`DECIDED` — the customer has made a decision. Support it; do NOT reopen the debate or add new objections.

---

## Expected Capability

- ClosingGuide
- NextStepsExplainer
- LeadCapture (if not yet collected)
- Appointment setting

---

## Decision Rules

1. **Closing signal → acknowledge positively, immediately**
2. Do NOT reopen the discussion ("are you sure?", "have you considered...")
3. Do NOT add more product options at closing — decision is made
4. Provide clear next steps only
5. If lead data not yet collected → collect now (this is the highest-priority moment)
6. If lead data already collected → confirm and set expectation for next contact

---

## Conversation Strategy

**Affirm → Next Steps → Expectation Setting → Warm Close**

1. **Affirm**: Validate their decision positively
2. **Next Steps**: Tell them exactly what happens next (Jirawat will call, appointment time, application process)
3. **Expectation Setting**: When to expect contact, what to prepare
4. **Warm Close**: End on a supportive, personal note

---

## Expected AI Reply

**For "โอเค สมัครได้เลยครับ" (lead already collected):**
```
ดีใจมากเลยครับ ที่คุณ[ชื่อ]ตัดสินใจแล้ว 😊

ขั้นตอนต่อไปครับ:
1️⃣ คุณจิราวัฒน์จะโทรยืนยันรายละเอียดแผนที่เลือก
2️⃣ เตรียมเอกสาร: บัตรประชาชน, ข้อมูลสุขภาพเบื้องต้น
3️⃣ กรอกใบสมัครและส่งเบี้ยงวดแรก

คุณจิราวัฒน์จะติดต่อกลับในช่วง[เวลา]ครับ 🙏
```

**For "พร้อมแล้วครับ" (lead NOT yet collected):**
```
ยอดเยี่ยมเลยครับ 😊

เพื่อให้คุณจิราวัฒน์ดำเนินการได้ ขอชื่อที่ใช้ติดต่อครับ?
```

---

## What Comes After Closing

After lead is fully captured:
1. Log to CRM: name, phone, intent, product interest, preferred appointment time
2. Set expectation for Jirawat callback (same day or next business day)
3. Offer: "ถ้ามีคำถามระหว่างรอ ถามในแชตได้ตลอดเลยครับ"
4. Do NOT continue selling — conversation naturally ends here

---

## Regression Examples

### Good Closing

```
Customer: ตัดสินใจแล้วครับ อยากทำประกันสุขภาพแผนที่แนะนำ

AI: ดีใจมากเลยครับ! การดูแลสุขภาพตัวเองและครอบครัวเป็นเรื่องดีมากครับ 😊

    คุณจิราวัฒน์จะโทรยืนยันรายละเอียดแผนและอธิบายขั้นตอนสมัครครับ
    เตรียมบัตรประชาชนไว้ได้เลยนะครับ
    
    คาดว่าจะโทรถึงในช่วง [preferred time ที่บอกไว้] ครับ 🙏
```

### Bad Closing

```
Customer: ตัดสินใจแล้วครับ อยากทำประกันสุขภาพ

AI: แน่ใจแล้วหรือครับ? ลองดูประกันมะเร็งด้วยไหมครับ?
    น่าจะเพิ่มความคุ้มครองได้ดีครับ
```

**Why bad**: Customer said they've decided. Reopening the sale with new products shows disrespect for their decision and creates doubt.

---

## Lessons Learned

1. **"ตัดสินใจแล้ว" means the conversation has succeeded.** Don't undermine it.
2. **Immediate affirmation is essential.** Even a 1-second delay to add more options sends the wrong signal.
3. **Clear next steps reduce anxiety at the commitment stage.** Tell them exactly what happens next.

---

## Cross References

- `16_HUMAN_HANDOFF.md` — Handoff happens here
- `12_PRICE_OBJECTION.md` — Price objection before closing
- `17_FOLLOW_UP.md` — If customer doesn't immediately proceed after expressing interest

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
