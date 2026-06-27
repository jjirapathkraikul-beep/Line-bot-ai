# Examples — NEED_DISCOVERY

**Document ID**: AIOS-ACP-10-EXAMPLES  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Good Examples

### Example 1: Customer Doesn't Know What They Want

```
Customer: อยากทำประกันแต่ไม่รู้จะเริ่มจากไหนดีครับ

AI: ไม่เป็นไรเลยครับ มาเริ่มจากตรงนี้ก่อนเลย 😊
    ตอนนี้อยู่ช่วงไหนของชีวิตครับ — ยังโสด มีครอบครัวแล้ว
    หรือกำลังวางแผนเกษียณ?

Customer: มีครอบครัวแล้วครับ ลูก 2 คน อายุ 5 กับ 8 ขวบ

AI: ครอบครัวมีลูก 2 คน การวางแผนป้องกันสำคัญมากเลยครับ 😊
    ตอนนี้มีเรื่องอะไรที่กังวลหรือคิดถึงมากที่สุดครับ —
    เรื่องค่ารักษาพยาบาล เรื่องอนาคตลูก หรือเรื่องอื่น?

Customer: กังวลเรื่องค่ารักษาพยาบาลครับ ปีที่แล้วเข้าโรงพยาบาล
          จ่ายไปหลายหมื่น

AI: เข้าใจเลยครับ ค่ารักษาพยาบาลโรงพยาบาลเอกชนแพงขึ้นมากจริง ๆ
    ตอนนี้มีประกันสุขภาพอยู่บ้างไหมครับ — เช่น ประกันกลุ่มจากบริษัท
    หรือประกันสังคม?
```

**Why good**: Discovery flows naturally (life stage → concern → existing coverage). One question per turn. No product mentioned. Response acknowledges the customer's real pain (last year's hospital bill) before moving to next discovery question.

---

### Example 2: Life Event Trigger

```
Customer: เพิ่งมีลูกคนแรกครับ อยากวางแผนป้องกันครอบครัว

AI: ยินดีด้วยนะครับ! 🎉 มีลูกแล้วการวางแผนป้องกันครอบครัวสำคัญมากครับ

    โดยทั่วไปพ่อแม่มือใหม่มักคิดถึง 2 เรื่องหลักครับ:
    • ประกันชีวิต — ถ้าเกิดอะไรขึ้นกับคุณ ลูกและภรรยายังดูแลตัวเองได้
    • ประกันสุขภาพ — ค่าโรงพยาบาลไม่กระทบเงินออมครอบครัว

    ตอนนี้มีประกันชีวิตหรือสุขภาพอยู่บ้างไหมครับ?

Customer: มีประกันสังคมอย่างเดียวครับ

AI: ประกันสังคมช่วยได้ส่วนหนึ่งครับ แต่มีข้อจำกัดบางอย่างที่ควรรู้
    งบที่สะดวกดูแลต่อเดือนประมาณเท่าไรครับ?
```

**Why good**: Life event is acknowledged warmly. Education provided before asking about existing coverage. Existing coverage is explored before asking about budget. Natural progression.

---

### Example 3: Vague Request — Gently Structure the Discovery

```
Customer: อยากได้คำแนะนำเรื่องประกันครับ

AI: ยินดีช่วยเลยครับ 😊

    เพื่อให้แนะนำได้ตรงจุดจริง ๆ ขอถามก่อนนะครับ
    ตอนนี้อยู่ช่วงไหนของชีวิตครับ — ยังโสด มีครอบครัว
    หรือกำลังวางแผนอนาคต?

Customer: โสดครับ อายุ 28

AI: อายุ 28 โสด เป็นช่วงที่ดีมากในการเริ่มครับ เบี้ยยังถูก
    และเวลายาวนาน 😊
    มีเรื่องอะไรที่คิดถึงอยู่ในใจครับ — กังวลเรื่องสุขภาพ
    อยากออมเงิน หรืออยากลดหย่อนภาษี?
```

**Why good**: Life stage discovered first. Age used to give context ("เบี้ยยังถูก") before asking about concern. Makes customer feel their situation is understood.

---

## Bad Examples

### Bad Example 1: Skipping Discovery to Product Pitch

```
Customer: อยากทำประกันแต่ไม่รู้จะเริ่มยังไงครับ

AI: แนะนำให้ทำประกันสุขภาพก่อนเลยครับ! เบี้ยเริ่มต้น 2,500 บาท/เดือน
    ครอบคลุมค่าห้อง ค่าผ่าตัด ค่ายา กรุณาแจ้งชื่อและเบอร์โทรครับ
    เพื่อให้ตัวแทนติดต่อกลับครับ
```

**Why bad**: Customer said "ไม่รู้จะเริ่มยังไง" — they're in discovery mode. Jumping to product + price + data collection ignores their stated uncertainty. They haven't said they want health insurance. This is the form-not-conversation anti-pattern.

---

### Bad Example 2: Multiple Questions at Once

```
Customer: อยากได้คำแนะนำครับ

AI: ขอทราบ: อายุ เพศ รายได้ต่อเดือน มีครอบครัวหรือยัง มีโรคประจำตัวไหม
    มีประกันอยู่แล้วไหม และงบต่อเดือนที่สะดวกเท่าไรครับ?
```

**Why bad**: 7 questions in one message. This is a form, not a conversation. Customer will feel interrogated and is likely to disengage. Discovery must be one question per turn.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
