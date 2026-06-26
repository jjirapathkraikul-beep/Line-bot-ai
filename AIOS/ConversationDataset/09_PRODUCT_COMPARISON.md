# 09 — Product Comparison

**Document ID**: AIOS-CID-09  
**Topic**: เปรียบเทียบผลิตภัณฑ์ — Insurance Product Comparison  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand the differences between insurance products
- Make an informed choice without being overwhelmed
- Avoid buying the wrong product
- Understand overlaps (why they might need multiple products)

---

## Common Customer Questions

- "ประกันชีวิตกับประกันสุขภาพต่างกันยังไงครับ"
- "ประกันมะเร็งกับประกันโรคร้ายแรงต่างกันไหมครับ"
- "ควรเริ่มจากอันไหนก่อนครับ"
- "ต้องมีทุกอันเลยไหมครับ"
- "Unit-linked กับออมทรัพย์อันไหนดีกว่าครับ"
- "ถ้ามีงบจำกัด ซื้อแบบไหนก่อนครับ"

---

## Expected Intent

`ask_recommendation` / `product_inquiry_general`

---

## Expected Emotion

`CONFUSED` to `ANALYTICAL` — customer wants clarity. The worst outcome is making them MORE confused.

---

## Conversation Strategy

**Simplify → Prioritize → Personalize**

Use simple analogies. Do not overwhelm with product details. The goal is clarity — help them understand ONE distinction well, then move to the next.

---

## Expected AI Reply

**For "ประกันชีวิตกับประกันสุขภาพต่างกันยังไง":**
```
อธิบายง่าย ๆ ครับ

ประกันสุขภาพ = ดูแลเรื่องค่ารักษาพยาบาล ถ้าป่วยหรือต้องผ่าตัด
ประกันชีวิต = ดูแลคนที่คุณรักถ้าคุณไม่อยู่แล้ว

คนส่วนใหญ่ต้องการทั้งสองอย่างครับ แต่ถ้าต้องเลือกก่อน:
• มีคนพึ่งพา (ลูก, พ่อแม่, คู่สมรส) → ประกันชีวิตก่อน
• ไม่มีคนพึ่งพาแต่กลัวค่ารักษา → ประกันสุขภาพก่อน

ตอนนี้มีคนที่พึ่งพารายได้คุณไหมครับ?
```

**For "ถ้ามีงบจำกัด ซื้อแบบไหนก่อนครับ":**
```
ลำดับที่แนะนำครับ:

1️⃣ ประกันสุขภาพ — ป้องกันค่าโรงพยาบาลที่อาจทำให้หมดเนื้อหมดตัวได้
2️⃣ ประกันชีวิต — ถ้ามีคนพึ่งพารายได้คุณ
3️⃣ ประกันโรคร้ายแรง/มะเร็ง — เพิ่มความคุ้มครองสำหรับโรคใหญ่
4️⃣ ประกันออมทรัพย์/บำนาญ — วางแผนระยะยาว

งบต่อเดือนที่สะดวกประมาณเท่าไรครับ?
```

---

## Decision Rules

1. Comparison requests → always ask "ต้องการเลือก หรือแค่อยากเข้าใจความแตกต่าง?" before going deep
2. If budget limited → give priority ranking, not "buy everything"
3. Never say one product is better than another without knowing the customer's situation

---

## Regression Examples

### Good Conversation

```
Customer: ประกันมะเร็งกับประกันโรคร้ายแรงต่างกันยังไงครับ

AI: ความต่างครับ:

    ประกันโรคร้ายแรง (CI) = คุ้มครองหลายโรค เช่น มะเร็ง หัวใจ หลอดเลือดสมอง ไต
    ประกันมะเร็ง = คุ้มครองเฉพาะมะเร็งอย่างเดียว แต่มักครอบคลุมทุกระยะ

    CI ครอบคลุมกว้างกว่า แต่เบี้ยอาจสูงกว่า
    ประกันมะเร็งเฉพาะทาง บางทีเบี้ยต่ำกว่าและครอบคลุมมะเร็งได้ละเอียดกว่า

    มีเหตุผลพิเศษที่กังวลเรื่องมะเร็งเป็นพิเศษไหมครับ?
```

### Bad Conversation

```
Customer: ต้องมีทุกอันเลยไหมครับ
AI: ใช่ครับ! แนะนำให้ทำทุกอย่างเลยครับ ทั้งประกันชีวิต สุขภาพ มะเร็ง บำนาญ
    จะได้คุ้มครองครบถ้วนครับ
```

**Why bad**: Recommends everything without knowing budget, situation, or needs. Pure sales, no consultation.

---

## Lessons Learned

1. **Comparison questions are need discovery in disguise.** Customer is trying to figure out what they need — help them figure that out, not just recite differences.
2. **Priority ranking with limited budget is more useful than exhaustive product lists.**

---

## Cross References

- `10_NEED_DISCOVERY.md` — Comparison leads to need discovery
- `11_RECOMMENDATION.md` — After comparison, recommend
- `02_HEALTH_INSURANCE.md`, `03_CANCER_INSURANCE.md`, `06_RETIREMENT.md`

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
