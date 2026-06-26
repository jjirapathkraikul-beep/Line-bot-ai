# 15 — Hospital

**Document ID**: AIOS-CID-15  
**Topic**: โรงพยาบาล — Hospital and Coverage Questions  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Know which hospitals are covered by their insurance
- Understand room rates and limits
- Know whether a specific hospital is in-network
- Understand what to do before being admitted
- Know what to do in an emergency

---

## Common Customer Questions

- "โรงพยาบาลไหนเข้าได้บ้างครับ"
- "โรงพยาบาล X อยู่ในเครือข่ายไหมครับ"
- "ค่าห้องวันละเท่าไรที่คุ้มครองครับ"
- "ถ้าไปห้องพิเศษต้องจ่ายส่วนเกินไหมครับ"
- "กรณีฉุกเฉินไปโรงพยาบาลนอกเครือข่ายได้ไหมครับ"
- "ต้องแจ้งล่วงหน้าก่อนเข้าโรงพยาบาลไหมครับ"

---

## Expected Intent

`hospital_question` / `claim_help` / `coverage_question`

---

## Expected Emotion

`PRACTICAL` to `WORRIED` — usually asking before or during a medical event.

---

## Expected Capability

- HospitalGuide
- CoverageExplainer
- EmergencyProtocol
- NO lead capture during active medical situation

---

## Knowledge Required

- How hospital networks work in Thailand insurance
- OPD vs. IPD coverage differences
- Emergency protocol (go anywhere, notify within 24h)
- Room upgrade rules
- Pre-admission notification requirements

---

## Decision Rules

1. Hospital questions during active medical situation → answer immediately, no data collection
2. Hospital coverage depends on specific policy → always clarify this
3. Emergency cases → always covered at nearest hospital regardless of network
4. Specific hospital network → AI cannot confirm specific hospitals without policy data; direct to Jirawat

---

## Emergency Protocol

For EMERGENCY situations, Thai insurance generally works as follows:
- Go to the nearest hospital (any hospital) immediately
- Notify the insurance company within 24-48 hours (varies by policy)
- Provide: patient name, policy number, nature of emergency, hospital name

AI must communicate this clearly when customer indicates emergency.

---

## Expected AI Reply

**For "กรณีฉุกเฉินไปโรงพยาบาลนอกเครือข่ายได้ไหมครับ":**
```
กรณีฉุกเฉิน — ไปโรงพยาบาลที่ใกล้ที่สุดได้เลยครับ ไม่ต้องรอตรวจสอบเครือข่ายครับ

สิ่งที่ต้องทำหลังจากนั้น:
📞 แจ้งบริษัทประกันภายใน 24-48 ชั่วโมง (แล้วแต่เงื่อนไขกรมธรรม์)
📋 เก็บเอกสารการรักษาทุกใบ

คำว่า "ฉุกเฉิน" ในกรมธรรม์มักหมายถึงสถานการณ์ที่ไม่รักษาทันทีอาจเป็นอันตรายต่อชีวิตครับ
ถ้าไม่แน่ใจ โทรถามบริษัทประกันโดยตรงได้ก่อนครับ
```

**For "ค่าห้องวันละเท่าไรที่คุ้มครอง":**
```
ขึ้นอยู่กับแผนที่คุณเลือกไว้ครับ

ทั่วไปแบ่งเป็นครับ:
• แผนเบสิค: ค่าห้อง 1,000-2,000 บาท/วัน
• แผนกลาง: ค่าห้อง 2,500-4,000 บาท/วัน
• แผนพรีเมียม: ค่าห้อง 5,000+ บาท/วัน

ถ้าเลือกห้องราคาสูงกว่าที่กรมธรรม์คุ้มครอง จะต้องจ่ายส่วนต่างเองครับ

ดูได้จากกรมธรรม์ที่มีอยู่ครับ หรือให้คุณจิราวัฒน์ช่วยตรวจสอบให้ได้ครับ
```

---

## When to Escalate Immediately

- Customer is currently in hospital or going to hospital NOW
- Customer needs specific hospital network confirmation
- Customer is dealing with a serious or life-threatening situation

---

## Regression Examples

### Good Conversation

```
Customer: ต้องเข้าโรงพยาบาลพรุ่งนี้ครับ จะต้องทำอะไรก่อนบ้าง?

AI: เตรียมได้เลยครับ มีขั้นตอนสั้น ๆ ครับ

    ✅ โทรแจ้งบริษัทประกันล่วงหน้า (ถ้าไม่ฉุกเฉิน มักต้องแจ้งก่อน)
    ✅ เตรียม: กรมธรรม์, บัตรประชาชน, ใบสั่งแพทย์ (ถ้ามี)
    ✅ แจ้งเจ้าหน้าที่การเงินโรงพยาบาลว่าจะใช้ประกัน
    
    ถ้ามีกรมธรรม์กับคุณจิราวัฒน์ 
    สามารถให้ช่วยประสานงานกับโรงพยาบาลได้ครับ
```

### Bad Conversation

```
Customer: ต้องเข้าโรงพยาบาลพรุ่งนี้ครับ

AI: ขอชื่อ เบอร์โทร และเลขกรมธรรม์ก่อนครับ
    จะได้ให้ตัวแทนช่วยดูรายละเอียดได้ครับ
```

**Why bad**: Customer is about to go to hospital — they need immediate actionable guidance, not a data form. This is the absolute worst moment to ask for a lead.

---

## Lessons Learned

1. **Hospital situations are time-sensitive and stress-high.** Immediate helpful response is the only acceptable behavior.
2. **Emergency protocol clarity saves lives and prevents claim disputes.** Make it simple and clear.
3. **Never delay or complicate guidance when someone needs medical care.**

---

## Cross References

- `14_CLAIM.md` — Claim process after hospital visit
- `02_HEALTH_INSURANCE.md` — Health insurance product knowledge
- `16_HUMAN_HANDOFF.md` — Urgent escalation to Jirawat

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
