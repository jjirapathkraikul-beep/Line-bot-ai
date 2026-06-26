# 14 — Claim

**Document ID**: AIOS-CID-14  
**Topic**: เคลม — Insurance Claim Questions  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand how to file a claim
- Know what documents are needed
- Know what's covered and what's not
- Get help when their claim has a problem
- Feel supported, not abandoned, after something bad happened

---

## Common Customer Questions

- "จะเคลมยังไงครับ"
- "ต้องใช้เอกสารอะไรบ้างครับ"
- "ไปโรงพยาบาลแล้ว ต้องทำอะไรต่อครับ"
- "เคลมได้ไหมครับ สำหรับโรค X"
- "บริษัทปฏิเสธการเคลม จะทำยังไงครับ"
- "เคลมนานแค่ไหนถึงได้เงิน"
- "เคลมสดได้ไหม หรือต้องจ่ายก่อน"
- "เกินวงเงินต้องจ่ายส่วนเกินเองไหมครับ"

---

## Expected Intent

`claim_help` / `post_sale_support`

---

## Expected Emotion

`STRESSED` to `FRUSTRATED` — claim customers are often already dealing with illness or accident. This is the moment of truth for insurance. Handling it poorly destroys the relationship permanently.

---

## Expected Capability

- ClaimGuide (step-by-step claim instructions)
- DocumentChecklist
- EscalationPath (when claim has issues)
- NO lead capture — this is pure post-sale support

---

## Knowledge Required

- General claim process for health insurance
- Required documents (discharge summary, hospital bill, itemized receipt)
- Cashless claim (สดเคลม) vs. reimbursement claim (เบิกเอง)
- Common claim rejection reasons
- How to appeal a rejected claim

---

## Decision Rules

1. Claim questions → IMMEDIATE helpful response; no lead capture at all
2. If claim is rejected → empathize first, then explain options
3. AI can provide general guidance but for specific policy disputes → handoff to Jirawat
4. Never tell a customer their claim "will definitely be approved" — AI cannot guarantee this
5. For crisis moments (hospital now, need help now) → escalate to Jirawat immediately

---

## Conversation Strategy

**Empathize → Clarify → Guide → Escalate If Needed**

1. **Empathize**: Acknowledge the difficulty of the situation (if stress is evident)
2. **Clarify**: Ask which type of claim (cashless vs. reimbursement) and which insurance
3. **Guide**: Give clear step-by-step process
4. **Escalate**: For complex cases, connect to Jirawat directly

---

## Claim Process Overview (General)

### Cashless Claim (สดเคลม — ไม่ต้องจ่ายก่อน)
1. แจ้งโรงพยาบาลว่าต้องการใช้ประกัน
2. แสดงบัตรประกัน / LINE OA สมาชิก
3. โรงพยาบาลประสานกับบริษัทประกัน
4. จ่ายเฉพาะส่วนที่เกินวงเงิน (ถ้ามี)

### Reimbursement Claim (เบิกเอง)
1. จ่ายค่ารักษาพยาบาลก่อน
2. เก็บใบเสร็จ + ใบสรุปการรักษา + OPD/IPD card
3. ยื่นเอกสารต่อบริษัทประกัน (ภายในกำหนด — มักภายใน 30-90 วัน)
4. รอการโอนเงินคืน (ประมาณ 7-30 วันทำการ)

---

## Required Documents (Standard)

| Document | Purpose |
|---|---|
| ใบสรุปการรักษา (Discharge Summary) | แสดงการวินิจฉัยและการรักษา |
| ใบเสร็จรับเงิน (Receipt) | ยืนยันจำนวนเงินที่จ่าย |
| รายการค่าใช้จ่าย (Itemized Bill) | แจกแจงรายการค่ารักษา |
| บัตรประชาชน | ยืนยันตัวตน |
| เลขกรมธรรม์ | ระบุกรมธรรม์ที่เคลม |

---

## Expected AI Reply

**For "จะเคลมยังไงครับ":**
```
ยินดีช่วยเลยครับ 😊 มี 2 แบบขึ้นอยู่กับสถานการณ์ครับ

1️⃣ เคลมสด (ไม่ต้องจ่ายก่อน)
แจ้งโรงพยาบาลว่าต้องการใช้ประกัน
โรงพยาบาลจะติดต่อบริษัทประกันแทนครับ

2️⃣ จ่ายก่อน แล้วค่อยเบิก
เก็บ: ใบเสร็จ + ใบสรุปการรักษา + รายการค่าใช้จ่าย
ยื่นเอกสารต่อบริษัทประกัน ภายในกำหนด (มักภายใน 30-90 วัน)
รอเงินโอนกลับมาครับ

อยู่ในสถานการณ์ไหนอยู่ครับ?
```

**For "บริษัทปฏิเสธการเคลม":**
```
เสียใจด้วยครับ ที่รู้สึกว่าไม่ได้รับความเป็นธรรมแบบนี้ ผมเข้าใจครับ

โดยทั่วไปสิ่งที่ทำได้ครับ:
1. ขอเหตุผลเป็นลายลักษณ์อักษรจากบริษัทประกัน
2. ตรวจสอบกรมธรรม์ของตัวเองว่าเคสนี้ควรคุ้มครองหรือไม่
3. ยื่นอุทธรณ์ (Appeal) พร้อมเอกสารเพิ่มเติม
4. ติดต่อ คปภ. ถ้าเห็นว่าบริษัทปฏิเสธโดยไม่มีเหตุผลเพียงพอ

ให้คุณจิราวัฒน์ช่วยดูรายละเอียดเพิ่มเติมได้เลยครับ
อยากให้ผมช่วยเชื่อมต่อไหมครับ?
```

---

## When to Escalate to Jirawat Immediately

- Customer is currently in hospital and needs help NOW
- Claim was rejected and customer wants to appeal
- Complex coverage dispute
- Customer is distressed or emotional

---

## Regression Examples

### Good Conversation

```
Customer: อยู่โรงพยาบาลตอนนี้ครับ จะเคลมยังไง

AI: เข้าใจครับ ขั้นตอนเร็ว ๆ ครับ:
    1. แจ้งแผนกการเงินว่าต้องการใช้ประกันชีวิต/สุขภาพ
    2. แสดงบัตรประชาชนและเลขกรมธรรม์
    3. โรงพยาบาลจะช่วยประสานกับบริษัทประกันให้ครับ
    
    ถ้าต้องการให้คุณจิราวัฒน์ช่วยติดต่อบริษัทประกันให้ บอกได้เลยครับ
    จะรีบช่วยทันทีครับ
```

### Bad Conversation

```
Customer: จะเคลมยังไงครับ

AI: ขอชื่อ เบอร์โทร และเลขกรมธรรม์ก่อนครับ
    เพื่อให้ตัวแทนช่วยดำเนินการครับ
```

**Why bad**: Claim questions need immediate guidance, not data collection. Customer is stressed — a form-like response is the worst possible approach.

---

## Lessons Learned

1. **Claim moments are the most important customer experience in insurance.** How this is handled determines whether the customer recommends Jirawat or warns others away.
2. **"จ่ายก่อนแล้วค่อยเบิก" steps are often confusing.** Walking through them clearly, with document checklist, is high-value service.
3. **Rejected claims need empathy before process.** The customer is already frustrated — lead with understanding, not bureaucratic steps.

---

## Cross References

- `15_HOSPITAL.md` — Hospital-specific guidance
- `16_HUMAN_HANDOFF.md` — When to escalate to Jirawat directly
- `13_EXISTING_INSURANCE.md` — Understanding their coverage before claim

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
