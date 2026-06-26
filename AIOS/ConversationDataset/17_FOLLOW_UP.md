# 17 — Follow-Up

**Document ID**: AIOS-CID-17  
**Topic**: ติดตาม — Follow-Up After Handoff or Previous Conversation  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Continuation of a previous conversation
- Check status of previous inquiry
- Re-engage after thinking it over
- Ask a question they forgot to ask last time
- Provide additional information they thought of later

---

## Common Customer Messages

- "ตามเรื่องที่คุยไปครั้งก่อนครับ"
- "คุยกับคุณจิราวัฒน์แล้วครับ มีคำถามเพิ่มเติม"
- "คิดมาอีกรอบแล้ว ยังสนใจครับ"
- "ช่วง X ที่แล้วคุยกันไว้ครับ"
- "สถานะเรื่องที่ฝากไว้เป็นยังไงครับ"

---

## Expected Intent

`follow_up` / `re_engagement`

---

## Expected Emotion

`RETURNING` — customer has already been introduced to Jirawat's services; they are returning with continued interest or additional questions. This is high-value engagement.

---

## Expected Capability

- SessionContextRetriever (if available via Vercel KV)
- ContinuationGuide
- LeadCapture (update if new info provided)

---

## Decision Rules

1. Returning customer → warmly acknowledge their return
2. If prior context is stored in session → reference it naturally ("จากที่คุยเรื่อง [topic] ไปครับ")
3. If no context available → ask gently ("ช่วยย้อนนิดนึงได้ไหมครับ ว่าครั้งก่อนคุยเรื่องอะไรครับ?")
4. Never treat a returning customer like a new stranger
5. Returning customer expressing continued interest → this is a warm lead, expedite handoff

---

## Expected AI Reply

**For "ตามเรื่องที่คุยไปครั้งก่อนครับ":**
```
ยินดีต้อนรับกลับมาครับ 😊

ครั้งก่อนเราคุยเรื่อง [ถ้ามีบริบท: หัวข้อที่คุยไป] ไว้ครับ
ตอนนี้มีคำถามเพิ่มเติม หรืออยากคุยเรื่องอะไรต่อครับ?
```

**If no prior context:**
```
ยินดีต้อนรับกลับมาครับ 😊

ช่วยบอกได้ไหมครับว่าครั้งก่อนคุยเรื่องอะไรไว้? 
จะได้ต่อจากตรงนั้นได้เลยครับ
```

**For customer who has already met Jirawat:**
```
ดีมากเลยครับที่ได้คุยกับคุณจิราวัฒน์แล้ว 😊

มีคำถามอะไรที่อยากถามเพิ่มเติมไหมครับ? 
หรืออยากนัดคุยรอบที่สองได้เลยครับ
```

---

## High-Value Follow-Up Signals

If customer says any of these → flag as warm lead immediately:
- "คิดมาแล้ว พร้อมสมัครแล้วครับ"
- "ขอดูรายละเอียดเพิ่มได้ไหมครับ"
- "ครอบครัวเห็นด้วยแล้วครับ"
- "อยากนัดกับคุณจิราวัฒน์ครับ"

For these signals → move immediately to `18_CLOSING.md` or `16_HUMAN_HANDOFF.md`.

---

## Lessons Learned

1. **A returning customer is the most valuable customer in this funnel.** They've overcome inertia. Handle with care.
2. **Referencing prior context (even brief) makes a huge difference.** "จากที่คุยกัน..." shows the AI remembers them and they're not starting from zero.

---

## Cross References

- `16_HUMAN_HANDOFF.md` — Initial handoff that precedes follow-up
- `18_CLOSING.md` — If follow-up signals readiness to close

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
