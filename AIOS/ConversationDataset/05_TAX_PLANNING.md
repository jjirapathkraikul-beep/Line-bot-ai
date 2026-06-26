# 05 — Tax Planning

**Document ID**: AIOS-CID-05  
**Topic**: ลดหย่อนภาษี — Tax Reduction Through Insurance  
**Version**: 1.0  
**Last Updated**: 2026-06-27

---

## Customer Goals

- Reduce their personal income tax liability this year
- Understand how insurance qualifies for tax deduction
- Know the maximum deduction limits
- Know which type of insurance gives the best tax benefit
- Act before year-end (often time-sensitive)

---

## Common Customer Questions

- "ประกันลดหย่อนภาษีได้เท่าไรครับ"
- "ประกันแบบไหนลดหย่อนภาษีได้บ้างครับ"
- "ประกันชีวิตลดหย่อนได้กี่บาทครับ"
- "ประกันสุขภาพลดหย่อนภาษีได้ไหมครับ"
- "ต้องทำก่อนสิ้นปีไหมครับ"
- "รายได้เท่านี้คุ้มไหมที่จะทำประกันเพื่อลดหย่อน"
- "ถ้ามีประกันอยู่แล้วต้องทำเพิ่มไหมครับ"
- "ต่างกับ SSF/RMF ยังไงครับ"

---

## Expected Intent

`product_tax` / `ask_premium` / `ask_recommendation`

---

## Expected Emotion

`PRACTICAL` / `GOAL-ORIENTED` — tax customers are usually focused on a specific outcome (saving money on taxes). They are often more decisive than general inquirers. May be slightly time-pressured if approaching year-end.

---

## Expected Capability

- TaxExplainer (deduction limits and eligibility)
- NeedDiscovery (income level, existing deductions)
- ProductMatcher (which product suits their tax situation)
- LeadCapture (income/occupation → then phone → handoff)

---

## Knowledge Required

- Insurance tax deduction limits (ประกันชีวิต: up to 100,000 THB; ประกันสุขภาพ: up to 25,000 THB)
- Combined deduction limit awareness
- Qualifying conditions for tax deduction
- Year-end deadline for coverage to count
- How deduction reduces actual tax paid (not 1:1)
- Difference between deduction types (ประกันชีวิต, ประกันสุขภาพ, เงินฝากประกันชีวิต)

---

## Decision Rules

1. Tax customer → educate on deduction limits FIRST before asking about their income
2. Ask about their income range BEFORE recommending an amount (deduction value depends on tax bracket)
3. Do NOT quote exact deduction amounts without knowing if they have other deductions already
4. Do NOT assume customer needs MORE insurance — they may already have enough for deduction
5. If customer asks "รายได้เท่านี้คุ้มไหม" → need to know income level first; do not give generic answer
6. Time-sensitive: if December, note year-end deadline proactively

---

## Conversation Strategy

**Orient → Educate → Calculate → Recommend → Capture**

1. **Orient**: Understand what they already have (existing insurance, other deductions)
2. **Educate**: Explain how insurance deductions work and what the limits are
3. **Calculate**: Help them understand how much more they might need (based on income)
4. **Recommend**: Suggest the most appropriate product type for their tax goal + protection need
5. **Capture**: Once they understand the recommendation, collect data and hand off

The goal is to help the customer understand whether they need MORE insurance for tax purposes, or if they already have enough — and what kind gives the best combined protection/deduction value.

---

## Expected AI Thinking

> Customer wants to reduce taxes using insurance. This is a practical, outcome-focused inquiry.
>
> Key education points:
> 1. ประกันชีวิต → deduct up to 100,000 THB from taxable income
> 2. ประกันสุขภาพ → deduct up to 25,000 THB (separate category)
> 3. Combined deduction saves actual tax = deduction × your tax rate
>
> To give a useful recommendation I need to know: (1) their approximate income (to know tax bracket), (2) what insurance they already have.
>
> I won't immediately ask for exact income — that feels intrusive. I'll explain the concept first, then ask income range (which bracket they're in).

---

## Expected AI Reply

**For "ประกันลดหย่อนภาษีได้เท่าไรครับ":**
```
ลดหย่อนภาษีได้ 2 ประเภทครับ

📌 ประกันชีวิต — ลดหย่อนได้สูงสุด 100,000 บาท/ปี
📌 ประกันสุขภาพ — ลดหย่อนได้สูงสุด 25,000 บาท/ปี (คนละส่วนกัน)

ตัวอย่าง: ถ้าซื้อประกันชีวิต 50,000 บาท/ปี และอยู่ในฐานภาษี 20%
จะประหยัดภาษีได้ 50,000 × 20% = 10,000 บาทครับ

ขอถามนิดนึงครับ ตอนนี้มีประกันชีวิตที่ใช้ลดหย่อนอยู่แล้วไหมครับ?
```

**For "รายได้เท่านี้คุ้มไหมที่จะทำเพื่อลดหย่อน":**
```
ขึ้นอยู่กับฐานภาษีของคุณครับ

ถ้าฐานภาษี 10% → ลดหย่อน 100,000 บาท ประหยัดได้ 10,000 บาท
ถ้าฐานภาษี 20% → ลดหย่อน 100,000 บาท ประหยัดได้ 20,000 บาท
ถ้าฐานภาษี 30% → ลดหย่อน 100,000 บาท ประหยัดได้ 30,000 บาท

รายได้ต่อปีประมาณเท่าไรครับ? (ไม่ต้องละเอียดมาก แค่ช่วงกว้าง ๆ ก็ได้ครับ)
```

---

## Follow-up Questions

| Turn | Signal | Next Question |
|---|---|---|
| 2 | No existing insurance for tax | Ask income range |
| 2 | Has insurance but under limit | Ask how much they're already deducting |
| 3 | Income range known | Explain potential deduction value; ask "อยากเน้นลดหย่อนอย่างเดียว หรืออยากได้ความคุ้มครองด้วยครับ?" |
| 4 | Goals clarified | Recommend product type; propose handoff with Jirawat |

---

## When NOT to Ask for Lead

- Do not ask for phone/name before income range and existing deductions are understood
- Do not ask for exact income if not needed — income range is sufficient

---

## When to Resume Lead Capture

After:
1. Income range is understood
2. Existing deductions are known
3. Customer has expressed interest in moving forward

Sequence: Income range → Existing insurance → Phone → Name → Preferred contact time → Handoff

---

## Escalation Conditions

| Condition | Action |
|---|---|
| Customer needs advice on combining SSF/RMF with insurance deductions | Acknowledge the question; explain insurance deductions are separate; recommend Jirawat for holistic tax planning |
| Customer needs exact premium for specific coverage amount | Handoff to Jirawat for quote |
| Year-end deadline is imminent (December) | Note urgency proactively; expedite handoff |

---

## Regression Examples

### Good Conversation

```
Customer: อยากลดหย่อนภาษีด้วยประกัน ไม่รู้จะเริ่มยังไงครับ

AI: เริ่มต้นได้ง่ายเลยครับ 😊

    มีประกัน 2 ประเภทที่ลดหย่อนภาษีได้:
    • ประกันชีวิต → สูงสุด 100,000 บาท/ปี
    • ประกันสุขภาพ → สูงสุด 25,000 บาท/ปี
    
    ตอนนี้มีประกันชีวิตที่ใช้ลดหย่อนอยู่บ้างไหมครับ?

Customer: มีอยู่ แต่จ่ายแค่ 30,000 บาท/ปี

AI: ดีครับ แสดงว่ายังมีช่องว่างที่ลดหย่อนได้อีก 70,000 บาทครับ

    รายได้ต่อปีประมาณเท่าไรครับ? เพื่อดูว่าจะประหยัดภาษีได้เท่าไรถ้าเพิ่มความคุ้มครอง
```

**Why good**: Educates first, finds out existing situation before recommending, uses their data to give personalized advice.

### Bad Conversation

```
Customer: อยากลดหย่อนภาษีด้วยประกัน

AI: กรุณาแจ้งชื่อ เบอร์โทร และรายได้ต่อปี
    เพื่อให้ตัวแทนเสนอแผนที่เหมาะสมครับ
```

**Why bad**: 3-field form request with zero education, no context about what insurance tax deduction means, treats customer as a data source not a person seeking help.

---

## Lessons Learned

1. **Tax customers are often already partially informed** — they may know the 100,000 limit but not the health insurance separate limit, or they may be overestimating their deduction by not knowing about caps. Always start with what they already know.
2. **Income range, not exact income.** Asking "รายได้เท่าไร" feels invasive. Asking "อยู่ในช่วงรายได้ประมาณเท่าไรครับ เพื่อช่วยคำนวณ" is much more comfortable.
3. **Year-end urgency is real.** In October–December, many customers are racing against deadlines. Acknowledge this and offer to help them move quickly. Don't slow down the conversation.

---

## Cross References

- `06_RETIREMENT.md` — Combined tax planning with retirement products
- `07_INVESTMENT_LINKED.md` — Investment-linked products with tax benefits
- `09_PRODUCT_COMPARISON.md` — Comparing tax deduction across product types
- `18_CLOSING.md` — When customer is ready to commit before year-end

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
