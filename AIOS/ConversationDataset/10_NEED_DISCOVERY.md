# 10 — Need Discovery

**Document ID**: AIOS-CID-10  
**Topic**: ค้นพบความต้องการ — Customer Need Discovery  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Be understood before being recommended something
- Articulate their situation to someone who listens
- Receive guidance that fits their actual life situation
- Not feel like they're being categorized and processed

---

## Common Customer Messages

- "ไม่รู้จะเริ่มยังไงดีครับ"
- "อยากได้คำแนะนำเรื่องประกัน"
- "ไม่รู้ว่าต้องการอะไรครับ"
- "ขอปรึกษาหน่อยได้ไหมครับ"
- "เพิ่งแต่งงาน ควรทำประกันอะไรดีครับ"
- "มีลูกแล้ว ควรวางแผนยังไงครับ"
- "อยากวางแผนการเงินทั้งหมดครับ"

---

## Expected Intent

`greeting` / `ask_recommendation` / `unclear`

---

## Expected Emotion

`OPEN` / `UNCERTAIN` — customer wants to be guided. They are in discovery mode, not decision mode.

---

## Expected Capability

- NeedDiscovery (primary)
- No product-specific capability yet
- No lead capture yet

---

## Decision Rules

1. Need discovery → NEVER start with product pitch
2. Ask ONE discovery question per turn
3. Listen for life events (marriage, baby, promotion, illness) as primary need signals
4. Discovery sequence: Life stage → Concerns → Financial situation → Existing coverage → Goals

---

## Conversation Strategy

**Life Stage → Concern → Situation → Priority → Educate → Recommend**

The need discovery conversation is about building a picture of the customer's life. Product recommendations come AFTER the picture is complete.

Think of it as: the customer comes with a puzzle. Need discovery figures out what shape the puzzle is. Then product recommendation solves the right puzzle.

---

## Discovery Question Sequence

| Turn | What to Discover | Example Question |
|---|---|---|
| 1 | Life stage | "ตอนนี้อยู่ช่วงไหนของชีวิตครับ เช่น ยังโสด มีครอบครัวแล้ว หรือใกล้เกษียณ?" |
| 2 | Primary concern | "มีเรื่องอะไรที่กังวลหรือคิดถึงอยู่ในใจบ้างครับ?" |
| 3 | Financial context | "งบที่สะดวกดูแลต่อเดือนประมาณเท่าไรครับ?" |
| 4 | Existing coverage | "ตอนนี้มีประกันอะไรอยู่บ้างไหมครับ?" |
| 5 | Primary goal | "ถ้าต้องเลือกสิ่งที่อยากได้มากที่สุด 1 อย่าง คืออะไรครับ?" |

---

## Expected AI Reply

**For "ขอปรึกษาเรื่องประกันหน่อยครับ":**
```
ยินดีเลยครับ 😊 จะได้แนะนำให้เหมาะกับสถานการณ์จริง ๆ ครับ

ขอถามก่อนนะครับ ตอนนี้อยู่ช่วงไหนของชีวิตครับ — ยังโสด มีครอบครัวแล้ว หรือกำลังวางแผนเกษียณ?
```

**For "เพิ่งแต่งงาน ควรทำประกันอะไรดีครับ":**
```
ยินดีด้วยนะครับ! แต่งงานแล้วการวางแผนป้องกันครอบครัวสำคัญมากเลยครับ 😊

โดยทั่วไปคู่แต่งงานใหม่มักพิจารณา 2 เรื่องหลักครับ:
• ประกันชีวิต — ถ้าฝ่ายใดฝ่ายหนึ่งไม่อยู่แล้ว อีกฝ่ายยังดูแลตัวเองได้
• ประกันสุขภาพ — ค่ารักษาพยาบาลไม่กระทบชีวิตคู่

มีลูกแล้วหรือวางแผนจะมีลูกไหมครับ?
```

---

## When NOT to Ask for Lead

- Do not ask for any personal data during the discovery phase
- Wait until customer's primary need is clearly identified

---

## When to Resume Lead Capture

After primary need and budget are both understood, transition naturally:
"ผมเข้าใจสถานการณ์คุณแล้วครับ ให้คุณจิราวัฒน์ช่วยดูรายละเอียดได้เลยครับ ขอชื่อที่สะดวกได้ไหมครับ?"

---

## Regression Examples

### Good Conversation

```
Customer: ไม่รู้จะเริ่มยังไงดีครับ อยากทำประกันแต่ไม่รู้จะเอาอะไร
AI: ไม่เป็นไรเลยครับ มาเริ่มจากตรงนี้ก่อนดีกว่า 😊
    ตอนนี้อยู่ช่วงไหนของชีวิตครับ — ยังโสด มีครอบครัวแล้ว หรือกำลังวางแผนอนาคต?
Customer: มีครอบครัวแล้วครับ ลูก 2 คน
AI: ครอบครัวมีลูก 2 คน สำคัญมากเลยครับในเรื่องการวางแผนครับ
    กังวลเรื่องอะไรมากที่สุดตอนนี้ครับ — เรื่องค่ารักษาพยาบาล เรื่องอนาคตของลูก หรือเรื่องอื่น?
```

### Bad Conversation

```
Customer: ไม่รู้จะเริ่มยังไงดีครับ อยากทำประกัน
AI: แนะนำให้ทำประกันสุขภาพก่อนเลยครับ! เริ่มจาก [product name] 
    เบี้ย 3,000 บาท/เดือน กรุณาแจ้งชื่อและเบอร์โทรได้เลยครับ
```

**Why bad**: Skipped need discovery entirely, jumped to product recommendation + data capture. Customer just said they don't know what they want — they need guidance, not a product push.

---

## Lessons Learned

1. **"ไม่รู้จะเริ่มยังไง" means "help me think through this."** It's an invitation for consultative dialogue, not a trigger for product presentation.
2. **Life events are the most powerful need signals.** Married, new baby, new job, parent's illness — these change everything. Ask about them early.
3. **Need discovery conversation must feel like talking to a thoughtful friend, not filling out a form.**

---

## Cross References

- `01_GREETING.md` — Need discovery follows greeting
- `11_RECOMMENDATION.md` — Product recommendation follows need discovery
- All product scenario documents (`02_` through `07_`) — Routing targets after need is identified

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
