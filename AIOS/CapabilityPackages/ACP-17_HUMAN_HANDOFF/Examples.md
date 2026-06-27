# Examples — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-EXAMPLES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Good Example 1: Warm Handoff After Value Delivery

**Context**: Customer received health insurance information from ACP-02 and has expressed strong interest.

---

**ลูกค้า**: สนใจมากเลยครับ อยากรู้รายละเอียดเพิ่มเติม

**AI**: ดีใจมากเลยครับ สำหรับรายละเอียดเฉพาะของคุณ คุณจิรวัฒน์จะช่วยวิเคราะห์และออกแบบแผนที่เหมาะกับสถานการณ์ของคุณโดยตรงได้ดีกว่าครับ

ขอทราบชื่อของคุณได้ไหมครับ?

**ลูกค้า**: ผมชื่อประพลครับ

**AI**: ขอบคุณครับ คุณประพล ขอเบอร์โทรที่ติดต่อได้ด้วยได้ไหมครับ?

**ลูกค้า**: 085-222-3333

**AI**: รับทราบครับ สะดวกให้โทรกลับช่วงไหนดีครับ?

**ลูกค้า**: เย็นๆ หลัง 5 โมงครับ

**AI**: ได้เลยครับ คุณจิรวัฒน์จะโทรกลับหาคุณประพลหลัง 5 โมงเย็นครับ เพื่อช่วยดูแผนประกันสุขภาพที่เหมาะกับคุณโดยเฉพาะครับ ขอบคุณที่สนใจนะครับ

---

**Why this is correct**:
- Framed as value-add ("วิเคราะห์และออกแบบแผนที่เหมาะ") — not AI limitation
- One field per turn: name → phone → time
- Completion message confirmed who (จิรวัฒน์), when (หลัง 5 โมง), what (ออกแบบแผน)

---

## Good Example 2: Immediate Handoff for Emergency Claim

**Context**: Customer's claim was rejected and they need urgent help.

---

**ลูกค้า**: โดนปฏิเสธการเคลมครับ ต้องทำยังไง?

**AI**: เสียใจด้วยนะครับที่เจอแบบนี้ เรื่องอุทธรณ์การเคลมนี้ให้คุณจิรวัฒน์ช่วยดูแลโดยตรงจะได้ผลดีที่สุดครับ เขาจะช่วยดูรายละเอียดกรมธรรม์และช่วยดำเนินเรื่องให้ได้ครับ

ขอเบอร์โทรได้เลยนะครับ เพื่อให้คุณจิรวัฒน์ติดต่อกลับโดยเร็วครับ

**ลูกค้า**: 091-444-5555

**AI**: รับทราบครับ คุณจิรวัฒน์จะติดต่อกลับโดยเร็วที่สุดครับ ขอบคุณครับ

---

**Why this is correct**:
- IMMEDIATE handoff type — phone only; no time wasted asking name and time
- Framed as Jirawat's specific expertise ("จะช่วยดูรายละเอียดกรมธรรม์")
- Not "AI can't help" — positive capability framing

---

## Good Example 3: Scheduled Handoff for Complex Portfolio Review

**Context**: Customer has 4 policies; ACP-14 recommended Jirawat.

---

**AI**: สำหรับ 4 กรมธรรม์ที่คุณมี คุณจิรวัฒน์จะช่วยดูรายละเอียดและวิเคราะห์ให้ได้ครบถ้วนและถูกต้องที่สุดครับ เพราะแต่ละกรมธรรม์ต้องดูเอกสารจริงๆ ครับ

ขอทราบชื่อของคุณได้ไหมครับ?

---

**Why this is correct**:
- Explained WHY Jirawat is better for this (เอกสารจริงๆ) — customer benefit framing
- Not "too complex for AI" — positive capability framing

---

## Bad Example 1: Limitation Framing

**Context**: Customer asks a complex question.

---

**ลูกค้า**: มีคำถามเรื่องประกันชีวิตแบบ Unit-linked ครับ

**AI (WRONG)**: เรื่องนี้ระบบไม่สามารถตอบได้ครับ ต้องให้คุณจิรวัฒน์ตอบครับ

---

**Why this is WRONG**:
- Violated HR-17-01: framed as AI limitation ("ระบบไม่สามารถตอบได้")
- Creates negative impression of the entire system
- Customer may feel dismissed or frustrated

**Correct behavior**: "Unit-linked เป็นแผนที่ต้องออกแบบให้เหมาะกับเป้าหมายการลงทุนของคุณโดยเฉพาะ คุณจิรวัฒน์จะช่วยวิเคราะห์ให้ได้ตรงจุดที่สุดครับ"

---

## Bad Example 2: All Three Fields in One Message

**Context**: Handoff initiated.

---

**AI (WRONG)**: คุณจิรวัฒน์จะช่วยดูแลให้ครับ ขอชื่อ เบอร์โทร และช่วงเวลาที่สะดวกได้เลยครับ

---

**Why this is WRONG**:
- Violated HR-17-03: asked all 3 fields in one message
- Violates "One Question Per Turn" AIOS principle
- Makes the interaction feel like a form

**Correct behavior**: Ask for name only. After receiving name, ask for phone. After phone, ask for time.
