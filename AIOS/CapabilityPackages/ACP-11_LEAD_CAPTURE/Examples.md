# Examples — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-EXAMPLES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Good Example 1: Standard Lead Capture After Value Delivery

**Context**: Customer has just received health insurance explanation from ACP-02. Customer has expressed interest in learning more.

---

**AI (ACP-02 completing)**: ประกันสุขภาพแบบ Health Plus ของโตเกียวมารีนจะคุ้มครองค่าห้องและค่าผ่าตัด รวมถึงค่าแพทย์ที่ในโรงพยาบาลทั้งเครือข่ายครับ ตอบโจทย์ที่คุณถามได้เลยครับ

**ลูกค้า**: ดีเลยครับ อยากรู้เพิ่มเติมนะครับ

**AI (ACP-11 activates)**: ดีใจที่สนใจครับ คุณจิรวัฒน์จะโทรมาอธิบายรายละเอียดเพิ่มเติมและตอบทุกคำถามได้เลยครับ ขอทราบชื่อของคุณได้ไหมครับ?

**ลูกค้า**: ผมชื่อธนาครับ

**AI**: ขอบคุณครับ คุณธนา ขอเบอร์โทรศัพท์ที่ติดต่อได้สักเบอร์ได้เลยครับ

**ลูกค้า**: 089-123-4567

**AI**: รับทราบครับ แล้วสะดวกให้โทรกลับช่วงไหนดีครับ?

**ลูกค้า**: หลัง 5 โมงเย็นได้เลยครับ

**AI**: ได้เลยครับ คุณธนา คุณจิรวัฒน์จะโทรกลับหลัง 5 โมงเย็นนะครับ ขอบคุณที่สนใจครับ หากมีคำถามเพิ่มเติมทักมาได้เลยครับ

---

**Why this is correct**:
- ACP-11 activated AFTER value was delivered
- One field per turn: name → phone → preferred time
- Acknowledged each answer before asking next
- Warm and conversational, not form-filling

---

## Good Example 2: Graceful Handling of Phone Decline

**Context**: Customer received product explanation, expressed interest, provided name, but declines to share phone.

---

**AI**: ขอบคุณครับ คุณสมชาย ขอเบอร์โทรศัพท์ที่ติดต่อได้สักเบอร์ได้เลยครับ

**ลูกค้า**: ขอไม่แชร์เบอร์ก่อนได้ไหมครับ

**AI**: ไม่เป็นไรเลยครับ ถ้าสะดวกคุยเพิ่มเติมเมื่อไหร่ก็ทักมาที่นี่ได้เลยครับ หรือถ้าพร้อมแล้วจะให้คุณจิรวัฒน์ติดต่อกลับ ก็แจ้งได้เลยนะครับ

---

**Why this is correct**:
- Acknowledged decline immediately without pushing
- Did not retry or ask for an alternative contact method
- Left the door open for future contact without pressure

---

## Good Example 3: Skipping Already-Known Field

**Context**: Customer is a returning customer. Phone is already in the CRM.

---

**AI (ACP-11 activates, phone is known)**: คุณจิรวัฒน์จะโทรกลับหาคุณที่เบอร์ที่เคยให้ไว้นะครับ สะดวกให้โทรช่วงไหนดีครับ?

**ลูกค้า**: เช้าๆ ก็ได้ครับ ประมาณ 9-10 โมง

**AI**: รับทราบครับ คุณจิรวัฒน์จะโทรช่วง 9-10 โมงเช้านะครับ ขอบคุณครับ

---

**Why this is correct**:
- Did not ask for phone again (known field protection)
- Moved directly to preferred time
- Efficient and respectful of customer's time

---

## Bad Example 1: Asking Multiple Fields in One Turn

**Context**: Customer expresses interest after value delivery.

---

**ลูกค้า**: น่าสนใจครับ อยากรู้เพิ่ม

**AI (WRONG)**: ดีมากเลยครับ ขอทราบชื่อ เบอร์โทร และเวลาที่สะดวกให้ติดต่อกลับได้เลยครับ

---

**Why this is WRONG**:
- Asks three fields in a single message — violates HR-11-02 and "One Question Per Turn" AIOS principle
- Feels like a form, not a conversation
- Overwhelms the customer

**Correct behavior**: Ask only for name first. Wait for response. Then ask for phone. Then ask for time.

---

## Bad Example 2: Activating Lead Capture Before Value Delivery

**Context**: Customer just started a conversation with a general question.

---

**ลูกค้า**: สวัสดีครับ อยากถามเรื่องประกันสุขภาพ

**AI (WRONG)**: สวัสดีครับ ขอทราบชื่อและเบอร์โทรของคุณก่อนเลยนะครับ

---

**Why this is WRONG**:
- Activates lead capture immediately at session start — violates HR-11-01
- No value has been delivered
- Violates "Educate Before Capture" AIOS principle
- Customer has not expressed genuine interest in a specific product

**Correct behavior**: Answer the customer's question first. Deliver value. THEN activate ACP-11 if interest is expressed.
