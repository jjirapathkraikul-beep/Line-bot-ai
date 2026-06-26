# 08 — Trust and Scam

**Document ID**: AIOS-CID-08  
**Topic**: ความน่าเชื่อถือ / มิจฉาชีพ — Trust and Fraud Concern  
**Version**: 1.0  
**Status**: CRITICAL — highest priority scenario  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Verify that this is a legitimate person/service before sharing any personal information
- Understand how to check Jirawat's credentials
- Feel safe enough to continue the conversation
- Not feel pressured or manipulated

---

## Common Customer Questions

- "มิจฉาชีพไหมครับ"
- "น่าเชื่อถือไหมครับ"
- "LINE นี้จริงไหมครับ"
- "คุณจิราวัฒน์เป็นใครครับ"
- "กลัวโดนโกงอยู่"
- "ไว้ใจได้ไหมถ้าให้ข้อมูลไป"
- "ตัวแทนประกันโกงเยอะมั้ยครับ"
- "ปลอดภัยไหมครับ"
- "มีใบอนุญาตจริงไหมครับ"
- "โตเกียวมารีนจริงไหมครับ"

---

## Expected Intent

`trust_concern` / `fraud_concern`

---

## Expected Emotion

`SUSPICIOUS` to `ANXIOUS` — customer is actively questioning legitimacy. This is a protective instinct, not an attack. AI must respond with empathy and respect, not defensiveness.

**This is the most emotionally sensitive non-medical scenario. Handling it wrong destroys the entire relationship.**

---

## Expected Capability

- TrustEngine (CRITICAL — must fire before ANY other capability)
- Identity verification information delivery
- NO lead capture capability

---

## Knowledge Required

- How to verify Jirawat's identity (LINE OA, Facebook page, agent license number)
- Tokio Marine Life Insurance Thailand official information
- The Office of Insurance Commission (OIC) license lookup information
- What legitimate insurance agents do and don't do
- Signs of legitimate vs. fraudulent insurance contact

---

## Decision Rules

1. **ANY trust/fraud signal → cancel ALL active states immediately**
2. **NEVER ask for phone number, name, or any personal data after a trust concern**
3. Trust response MUST come before ANY other content
4. Trust response must acknowledge the concern (not deny or defend)
5. Trust response must provide VERIFIABLE information the customer can check independently
6. Offer to answer questions in chat — remove the pressure to share data
7. Do NOT bring up product benefits during a trust concern
8. Minimum 2 turns before returning to any lead capture after trust signal

---

## Conversation Strategy

**Acknowledge → Validate → Verify → Invite → Patience**

1. **Acknowledge**: Recognize the concern as legitimate and smart
2. **Validate**: Tell the customer they are right to check
3. **Verify**: Provide specific, checkable verification information
4. **Invite**: Offer to answer questions in chat without requiring personal data
5. **Patience**: Don't rush back to product topics — let the customer set the pace

**What NOT to do:**
- Do not say "ผมเป็นของจริงครับ" — anyone can say that
- Do not argue with the customer's concern
- Do not offer a "deal" to rebuild trust ("ลดราคาพิเศษถ้าสมัครเดี๋ยวนี้")
- Do not ask for data immediately after trust response

---

## Expected AI Thinking

> Customer just expressed a fraud concern. This is a CRITICAL moment. If I respond correctly, I may turn a skeptical person into a trusting client. If I respond incorrectly — by asking for their phone number anyway, or by being defensive — this conversation ends immediately and the customer will never come back.
>
> What does a trustworthy person do when someone doubts them? They don't argue. They say "your concern is completely valid — here's how you can check for yourself." That's what I need to do.
>
> Specifically: provide checkable verification. Not vague reassurance. Not "trust me." Actual URLs, license numbers, or page names the customer can look up independently.
>
> And under NO circumstances do I ask for personal data after this. The customer just said they're afraid to share data. Asking for data anyway would confirm their fear.

---

## Expected AI Reply

**For "มิจฉาชีพไหมครับ" / "น่าเชื่อถือไหม":**
```
เข้าใจเลยครับ ช่วงนี้มิจฉาชีพเยอะจริง ๆ การตรวจสอบก่อนให้ข้อมูลเป็นเรื่องถูกต้องมากครับ 🙏

คุณสามารถตรวจสอบคุณจิราวัฒน์ได้จาก:
• LINE Official Account นี้ (มีเครื่องหมาย Official)
• Facebook Page: [ชื่อ Page ของคุณจิราวัฒน์]
• ใบอนุญาตตัวแทนประกันชีวิต (สามารถตรวจสอบได้กับ คปภ.)
• เอกสารจากโตเกียวมารีนประกันชีวิต (บริษัทสามารถยืนยันตัวแทนได้)

ถ้ายังไม่สะดวกให้ข้อมูลส่วนตัว ไม่เป็นไรเลยครับ ผมยินดีตอบคำถามในแชตก่อนได้ครับ 😊

มีอะไรอยากถามก่อนไหมครับ?
```

**For "ตัวแทนประกันโกงเยอะไหมครับ":**
```
พูดตรง ๆ ครับ — มีทั้งดีและไม่ดีในทุกอาชีพครับ

สัญญาณที่ควรระวังในตัวแทนที่ไม่ดีครับ:
❌ บอกผลตอบแทนสูงเกินจริงโดยไม่มีเอกสารยืนยัน
❌ กดดันให้ตัดสินใจเร็ว ("วันนี้วันเดียวเท่านั้น")
❌ ขอให้โอนเงินก่อนได้รับเอกสาร
❌ ไม่ยอมให้เวลาอ่านกรมธรรม์

คุณจิราวัฒน์มีใบอนุญาตตัวแทนประกันชีวิตและอยู่ภายใต้การกำกับของ คปภ. ครับ

มีอะไรอยากถามหรือตรวจสอบเพิ่มเติมไหมครับ?
```

---

## Follow-up Questions

| Customer Response After Trust Response | AI Action |
|---|---|
| "โอเค เข้าใจแล้วครับ อยากถามเรื่องประกัน..." | Resume product inquiry naturally |
| "ยังกังวลอยู่ครับ" | Provide additional verification; suggest calling OIC to verify license |
| [No response / Silence] | Do not follow up aggressively; one gentle "มีอะไรให้ช่วยไหมครับ?" then wait |
| "ตรวจสอบแล้ว โอเค" | Warmly welcome back; ask what they'd like to know |

---

## When NOT to Ask for Lead

- **NEVER** ask for phone, name, or any data within 2 turns after a trust concern is expressed
- **NEVER** ask for data if customer has not explicitly signaled comfort ("โอเค เข้าใจแล้ว")
- If customer provides their own contact info unprompted after trust response → gracefully accept it without making a big deal

---

## When to Resume Lead Capture

Only after:
1. Customer explicitly signals comfort (positive response to trust information)
2. Customer proactively continues the conversation with a product question
3. At least 2 conversation turns have passed since the trust concern

Even then, resuming with the softest possible data request:
- "ถ้าสะดวกก็ฝากชื่อไว้ได้นะครับ ไม่บังคับเลยครับ" (not mandatory framing)

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer is extremely suspicious and persistent | Offer Jirawat's public contact for direct verification |
| Customer says they were previously scammed by an insurance agent | Express genuine empathy; do NOT rush to sell; let them lead |
| Customer asks for official company verification | Provide Tokio Marine Life official contact |

---

## Regression Examples

### Good Conversation

```
Customer: มิจฉาชีพไหมครับ กลัวโดนโกง

AI: เข้าใจเลยครับ ช่วงนี้มิจฉาชีพเยอะจริง ๆ การตรวจสอบก่อนให้ข้อมูลเป็น
    เรื่องถูกต้องมากครับ 🙏
    
    สามารถตรวจสอบคุณจิราวัฒน์ได้จากใบอนุญาตตัวแทน คปภ.
    Facebook Page และ LINE OA นี้ครับ
    
    ถ้ายังไม่สะดวกให้ข้อมูล ไม่เป็นไรเลยครับ ผมตอบคำถามในแชตก่อนได้ครับ
    มีอะไรอยากถามก่อนไหมครับ?

Customer: โอเค ตรวจสอบแล้วครับ สนใจเรื่องประกันสุขภาพ

AI: ดีใจที่ตรวจสอบแล้วนะครับ 😊 [Routes to HEALTH_INSURANCE scenario]
```

### Bad Conversation

```
Customer: มิจฉาชีพไหมครับ กลัวโดนโกง

AI: ไม่ใช่มิจฉาชีพแน่นอนครับ! ไว้ใจได้เลยครับ ขอเบอร์โทรได้เลยนะครับ
    เพื่อให้ตัวแทนติดต่อกลับครับ
```

**Why bad**: Defensive denial ("ไม่ใช่มิจฉาชีพ" — anyone can say this), zero empathy, immediately asked for phone number — the exact behavior a real scammer would exhibit.

---

## Lessons Learned

1. **Verification, not reassurance.** "ไว้ใจได้ครับ" is what every scammer says. "ตรวจสอบได้ที่นี่" is what a legitimate person says. Always provide verifiable evidence.
2. **Asking for data after a trust concern is the worst possible move.** It proves the customer's suspicion. No exceptions.
3. **"ตอบคำถามในแชตก่อนได้" is the most powerful trust-builder in this scenario.** It removes pressure and demonstrates willingness to give value without demanding personal data.
4. **Many customers have been genuinely scammed before.** This is not paranoia — it's experience. Treat it with the gravity it deserves.

---

## Cross References

- `AIOS/Learning/PATTERN-TRUST-001` — Core pattern for this scenario
- `16_HUMAN_HANDOFF.md` — If customer wants to meet/call Jirawat directly
- `01_GREETING.md` — Trust concern may appear at first message
- `AIOS/Execution/05_DECISION_PIPELINE.md` — Priority C: Trust fires before all states

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
