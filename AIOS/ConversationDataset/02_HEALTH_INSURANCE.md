# 02 — Health Insurance

**Document ID**: AIOS-CID-02  
**Topic**: ประกันสุขภาพ — Health Insurance Inquiry  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Understand what health insurance covers
- Know whether they need health insurance
- Understand what "good" health insurance looks like for their situation
- Compare options if they already have some coverage
- Eventually get a recommendation or speak to Jirawat

---

## Common Customer Questions

- "ประกันสุขภาพคุ้มครองอะไรบ้างครับ"
- "ทำประกันสุขภาพราคาเท่าไรครับ"
- "ต่างจากประกันชีวิตยังไงครับ"
- "มีโรงพยาบาลในเครือไหมครับ"
- "ผู้ป่วยในกับผู้ป่วยนอกต่างกันยังไง"
- "แบบไหนเหมาะกับคนอายุ 35 ครับ"
- "คุ้มไหมที่จะทำประกันสุขภาพ"
- "ถ้ายังแข็งแรงดีอยู่จำเป็นต้องทำไหมครับ"
- "ครอบครัวมี 4 คน ทำแบบไหนดีครับ"

---

## Expected Intent

`product_health` / `ask_premium` / `ask_recommendation`

---

## Expected Emotion

`CURIOUS` to `INTERESTED` — often not urgent unless they or a family member just had a health event. Some customers come with `ANXIOUS` emotion if they just received a diagnosis or hospital bill.

---

## Expected Capability

- HealthInsuranceExplainer (product education)
- NeedDiscovery (understand their specific situation)
- KnowledgeResolver (FAQ about health insurance)
- LeadCapture (age first, then other fields — after education)

---

## Knowledge Required

- Health insurance types: ผู้ป่วยใน (IP), ผู้ป่วยนอก (OP), comprehensive
- Key benefits: ค่าห้อง, ค่าผ่าตัด, ค่ายา, ค่าหมอ
- Hospital network coverage
- Rider vs. standalone
- Cashless claim process
- Age-based pricing ballpark
- Pre-existing condition basics
- Renewal guarantees

---

## Decision Rules

1. Customer asks about health insurance → **educate first**, then ask ONE clarifying question
2. The first clarifying question should be **age** (determines product category)
3. Do NOT ask for phone number before: age, goal, and at least one follow-up are captured
4. If customer mentions a family member → ask if the question is for themselves or the family member
5. If customer says "ยังแข็งแรงดี" (still healthy) → this is the BEST time to buy; explain why
6. If customer mentions income/job → use as context for affordability, not for data capture

---

## Conversation Strategy

**Educate → Understand → Personalize → Propose**

1. **Educate**: Give a clear, jargon-free explanation of what health insurance does
2. **Understand**: Ask about their situation — age, current coverage, primary concern
3. **Personalize**: Tailor the explanation to their specific context
4. **Propose**: Suggest talking to Jirawat directly when they have enough context to make a decision

The customer should leave the conversation knowing more about health insurance than when they arrived — regardless of whether they buy.

---

## Expected AI Thinking

> Customer asked about health insurance. They haven't given me any information yet. I should give them a clear, useful explanation first.
>
> What do they really want to know? Probably: "Does this apply to me? What does it cost? Is it worth it?"
>
> I'll give a short, clear overview and then ask the one question that helps me personalize the answer: their age. Age determines which plan category is relevant, what the premium range looks like, and whether pre-existing conditions are a concern yet.
>
> I will NOT ask for their name or phone number yet. They haven't decided anything.

---

## Expected AI Reply

**For "ประกันสุขภาพคุ้มครองอะไรบ้างครับ":**
```
ประกันสุขภาพช่วยครอบคลุมค่าใช้จ่ายเมื่อต้องเข้าโรงพยาบาลครับ เช่น
• ค่าห้องและค่าอาหาร
• ค่าแพทย์และค่าผ่าตัด
• ค่ายาและค่าตรวจ
• ค่า ICU กรณีวิกฤต

บางแผนครอบคลุมทั้งผู้ป่วยใน (นอนโรงพยาบาล) และผู้ป่วยนอก (มาตรวจแล้วกลับบ้าน) ครับ

ขอถามเพิ่มเติมนิดนึงครับ ตอนนี้อายุประมาณเท่าไรครับ? (จะได้แนะนำแบบที่เหมาะกับสถานการณ์ได้ครับ)
```

**For "คุ้มไหมที่จะทำประกันสุขภาพ":**
```
คำตอบสั้น ๆ คือ คุ้มครับ — แต่ขึ้นอยู่กับสถานการณ์ครับ

ค่ารักษาพยาบาลในไทยตอนนี้สูงมากครับ โดยเฉพาะโรงพยาบาลเอกชน แค่ค่าห้องอาจสูงถึง 5,000–15,000 บาท/คืน ยังไม่รวมค่าหมอและค่ายา

ถ้ายังแข็งแรงดีและยังอายุน้อย ตอนนี้คือเวลาที่ดีที่สุดที่จะทำครับ เพราะเบี้ยยังต่ำและยังไม่มีโรคประจำตัวที่จะถูกยกเว้น

ตอนนี้อายุประมาณเท่าไรครับ?
```

---

## Follow-up Questions

| Turn | Customer Signal | AI Follow-up Question |
|---|---|---|
| 2 | Gave age | "มีประกันสุขภาพอยู่แล้วไหมครับ หรือเพิ่งจะเริ่มพิจารณา?" |
| 3 | No existing insurance | "มีค่าใช้จ่ายในใจไหมครับว่าอยากจ่ายเบี้ยประมาณเดือนละเท่าไร?" |
| 3 | Has existing insurance | Route to `13_EXISTING_INSURANCE.md` |
| 4 | Has budget idea | "อยากได้ความคุ้มครองแบบไหนเป็นพิเศษครับ เช่น ค่าห้องสูง ๆ หรือครอบคลุมโรคร้ายแรงด้วย?" |
| 5 | Full context captured | Summarize + propose handoff |

---

## When NOT to Ask for Lead

- Do not ask for phone number before: age is known AND goal is understood
- Do not ask for name when customer is still in "education mode" (asking general questions)
- Do not ask for any data if customer has expressed hesitation ("ยังไม่แน่ใจ", "แค่ขอถามก่อน")
- Do not ask for data immediately after customer provides their age — first use the age to give a more relevant answer

---

## When to Resume Lead Capture

Lead capture is appropriate when:
- Customer says "สนใจ" or "อยากได้"
- Customer asks for a quote ("ขอตัวเลขหน่อยได้ไหมครับ")
- Customer has provided: age + at least one goal/concern
- Customer asks a question that requires Jirawat's personal input (e.g., comparing specific plans)

Sequence for health insurance:
1. Age → 2. Existing coverage → 3. Budget → 4. Phone + Name → 5. Handoff

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer mentions recent hospitalization | Express empathy first; then ask if they need current coverage or planning for future |
| Customer mentions pre-existing condition | Route to `04_MEDICAL_UNDERWRITING.md` |
| Customer asks for specific plan names/prices | Acknowledge; note prices vary by plan; offer to have Jirawat provide exact quotes |
| Customer says "ready to buy" | Route to `18_CLOSING.md` |

---

## Regression Examples

### Good Conversation

```
Customer: สนใจประกันสุขภาพครับ ไม่รู้จะเริ่มยังไง

AI: ยินดีช่วยเลยครับ 😊 ประกันสุขภาพช่วยครอบคลุมค่าใช้จ่ายเมื่อต้องเข้า
    โรงพยาบาลครับ ทั้งค่าห้อง ค่าหมอ ค่าผ่าตัด ค่ายา
    
    ขอถามก่อนเลยครับ ตอนนี้อายุประมาณเท่าไรครับ?

Customer: 35 ปีครับ
AI: อายุ 35 เป็นช่วงที่ดีมาก ๆ ในการเริ่มทำประกันสุขภาพครับ เบี้ยยังไม่สูงมาก
    และยังไม่มีโรคประจำตัวที่จะมากระทบการรับประกัน
    
    ตอนนี้มีประกันสุขภาพอยู่แล้วไหมครับ หรือเพิ่งจะเริ่มพิจารณา?
```

**Why good**: Answers first, asks age (not name/phone), uses age to give personalized insight, then asks next relevant question.

### Bad Conversation

```
Customer: สนใจประกันสุขภาพครับ

AI: สวัสดีครับ กรุณาแจ้งชื่อ-นามสกุล เบอร์โทรศัพท์ และอายุของคุณ
    เพื่อให้เราสามารถเสนอแผนที่เหมาะสมได้ครับ
```

**Why bad**: No education given, immediately demands 3 pieces of data, treats customer like a lead form, not a person seeking advice.

---

## Lessons Learned

1. **Age is the first and only question in turn 2.** It's the most useful single piece of data for health insurance — it determines product category, premium range, and underwriting sensitivity. Do not ask for name or phone first.
2. **"ยังแข็งแรงดี" is NOT a reason to delay — it's a reason to act now.** AI must reframe this correctly; healthy = ideal time to apply, not "wait until you're sick."
3. **Family scenarios need clarification.** If customer says "ครอบครัว 4 คน", ask who specifically needs coverage first — children, spouse, or the customer themselves — before discussing options.

---

## Cross References

- `04_MEDICAL_UNDERWRITING.md` — When customer has pre-existing condition
- `09_PRODUCT_COMPARISON.md` — When customer compares plans
- `13_EXISTING_INSURANCE.md` — When customer already has coverage
- `15_HOSPITAL.md` — When customer asks about hospital network
- `AIOS/Learning/PATTERN-LEAD-001` — Lead timing for health scenarios

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
