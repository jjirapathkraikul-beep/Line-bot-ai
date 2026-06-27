# 15 — Context Examples

**Document ID**: AIOS-ACE-15  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Provides 8 fully worked `ExecutionContext` examples illustrating how ACE assembles context for different customer scenarios. Each example includes: raw input, selected intent, selected ACP, selected knowledge, decision, compressed context summary, and expected reply strategy.

---

## Example 01: Customer Asks About Health Insurance

**Raw Input**: "อยากทำประกันสุขภาพครับ ไม่รู้จะเริ่มยังไง"

### Selected Intent
```
primary:           "product_health"
confidence:        0.88
is_trust_signal:   false
is_medical_signal: false
is_emergency:      false
```

### Selected ACP
```
primary: ACP-02 HEALTH_ADVISOR (STANDARD priority)
```

### Selected Knowledge
```
sources:
  - AIOS/Domains/Insurance/Health.md     relevance: 0.95
    excerpt: "ประกันสุขภาพครอบคลุม IPD (ผู้ป่วยใน) และ OPD (ผู้ป่วยนอก)..."
  - AIOS/Domains/Insurance/FAQ.md        relevance: 0.70
    excerpt: "คำถามพบบ่อย: ค่าห้องต่อคืนที่คุ้มครองขึ้นอยู่กับแผน..."
```

### Decision
```
action:    ACT-02 (ANSWER_THEN_ASK)
rationale: "Customer is asking a general health insurance question with no prior context.
            Answer the question first (what health insurance covers), then ask one
            discovery question to understand their situation better."
constraints: ["answer_first_required", "one_question_max"]
```

### Trust Profile
```
trust_concern_active:   false
lead_capture_allowed:   true
```

### Response Profile
```
tone:               "educational"
length:             "medium"
empathy_level:      "low"
question_strategy:  "one_question"
answer_first:       true
thai_response:      true
```

### Compressed Context Summary
```
Customer asking about health insurance for the first time. No prior context.
Action: Explain what health insurance covers (IPD/OPD/room rate), then ask one
discovery question (life stage or existing coverage).
Never start with: product name, premium, data request.
```

### Expected Reply Strategy
> Briefly explain health insurance (IPD + OPD, hospital costs). Then ask ONE question: "ตอนนี้มีประกันสุขภาพอยู่บ้างไหมครับ?" or "มีครอบครัวที่ต้องดูแลด้วยไหมครับ?"

---

## Example 02: Customer Asks "มิจฉาชีพไหม"

**Raw Input**: "คุณเป็นมิจฉาชีพไหมครับ กลัวโดนโกง"

### Selected Intent
```
primary:           "trust_concern"
confidence:        0.99
is_trust_signal:   true
is_medical_signal: false
is_emergency:      false
```

### Selected ACP
```
primary:         ACP-08 TRUST_ADVISOR (CRITICAL priority)
override_reason: "is_trust_signal = true — forced override"
```

### Selected Knowledge
```
sources:
  - AIOS/Trust/Trust_Engine.md    relevance: 1.0
    excerpt: "Verification channels: LINE OA (official mark), Facebook Page,
              OIC license verification, Tokio Marine Life official confirmation..."
```

### Decision
```
action:    ACT-03 (BUILD_TRUST)
rationale: "Customer expressed fraud concern. CRITICAL priority. Must provide
            verifiable credentials. No product mention. No data request.
            Offer to answer in chat without requiring personal information."
constraints: ["no_lead_capture", "no_product_mention", "no_cta", "verification_required"]
```

### Trust Profile
```
trust_concern_active:          true
trust_concern_turn:            [current turn]
turns_since_trust_concern:     0
lead_capture_allowed:          false
```

### Response Profile
```
tone:               "empathetic_transparent"
length:             "medium"
empathy_level:      "high"
question_strategy:  "no_question"
cta_allowed:        false
answer_first:       true
```

### Hard Prohibitions Active
```
- NEVER ask for phone/name/any data
- NEVER argue with the concern
- NEVER say "ไว้ใจได้ครับ" without verifiable evidence
- NEVER bring up products
- NEVER deny being AI
```

### Compressed Context Summary
```
CRITICAL: Trust/fraud concern detected. Override all other capabilities.
Action: Acknowledge concern → provide verifiable credentials → offer chat without data.
No product. No data. No CTA. No argument.
```

### Expected Reply Strategy
> "เข้าใจเลยครับ..." → list verification channels → offer to answer questions in chat without giving contact info.

---

## Example 03: Customer Has Hypertension

**Raw Input**: "ผมเป็นความดันโลหิตสูงครับ จะทำประกันได้ไหม"

### Selected Intent
```
primary:           "medical_question"
confidence:        0.92
is_medical_signal: true
is_trust_signal:   false
```

### Selected ACP
```
primary: ACP-04 MEDICAL_ADVISOR (STANDARD priority)
```

### Selected Knowledge
```
sources:
  - AIOS/Domains/Insurance/Medical.md      relevance: 1.0
    excerpt: "บริษัทพิจารณาผู้เอาประกันที่มีประวัติสุขภาพเป็นรายกรณี..."
  - AIOS/Domains/Insurance/Underwriting.md relevance: 0.85
    excerpt: "ความดันโลหิตสูงที่ควบคุมได้ด้วยยา อาจรับประกันได้ โดยมีเงื่อนไขพิเศษ..."
```

### Decision
```
action:    ACT-02 (ANSWER_THEN_ASK — medical variant)
rationale: "Medical question. Must answer case-by-case approach FIRST.
            Then ask ONE medical follow-up about control status.
            Never guarantee acceptance or rejection."
constraints: [
  "answer_first_required",
  "one_question_max",
  "medical_uncertainty_required",
  "no_lead_capture_before_medical_followup",
  "no_guarantee_language"
]
```

### Mandatory Knowledge Fragment
```
"บริษัทพิจารณาเป็นรายกรณีครับ — ไม่สามารถการันตีผลการพิจารณาได้ก่อน"
[Always included for medical intent]
```

### Compressed Context Summary
```
Customer has hypertension. Medical underwriting question.
Action: Explain case-by-case approach (not rejection, not guaranteed acceptance).
Ask ONE medical follow-up: "ตอนนี้ทานยาควบคุมความดันอยู่ไหมครับ?"
Never ask for phone. Never guarantee outcome.
```

### Expected Reply Strategy
> "บริษัทพิจารณาเป็นรายกรณีครับ ยังไม่สามารถตอบแทนบริษัทได้..." → ask "ตอนนี้ทานยาควบคุมความดันอยู่ไหมครับ?"

---

## Example 04: Customer Asks About Cancer Care Insurance

**Raw Input**: "Cancer Care คืออะไรครับ"

### Selected Intent
```
primary:    "product_cancer"
confidence: 0.85
```

### Selected ACP
```
primary: ACP-03 CANCER_ADVISOR (STANDARD)
```

### Decision
```
action: ACT-04 (EDUCATE)
```

### Compressed Context Summary
```
Customer asks about cancer insurance product. Educational response.
Explain: lump sum payment on diagnosis, cancer stages covered, separate from health insurance.
Then ask: "มีเหตุผลพิเศษที่กังวลเรื่องมะเร็งไหมครับ?" (discovery follow-up)
```

### Expected Reply Strategy
> Explain what cancer insurance is (lump sum, diagnosis trigger, stages) → ask if there's a specific reason for interest in cancer coverage.

---

## Example 05: Customer Asks for Tax-Saving Insurance Plan

**Raw Input**: "อยากได้แผนประกันที่ลดหย่อนภาษีได้สูงสุดครับ"

### Selected Intent
```
primary:    "product_tax"
confidence: 0.91
```

### Selected ACP
```
primary: ACP-05 TAX_ADVISOR (STANDARD)
```

### Decision
```
action:    ACT-02 (ANSWER_THEN_ASK)
rationale: "Tax planning inquiry. Educate on deduction limits first.
            Then ask income range to personalize."
constraints: ["answer_first_required", "one_question_max", "no_specific_tax_amount_without_bracket"]
```

### Compressed Context Summary
```
Tax deduction inquiry. Deduction limits: life insurance 100k/yr, health 25k/yr (separate).
After explaining limits, ask income range to calculate actual tax saving.
Do NOT quote specific tax savings without knowing income bracket.
```

### Expected Reply Strategy
> Explain 100k + 25k deduction limits → give example calculation for context → ask "รายได้ต่อปีประมาณเท่าไรครับ? เพื่อช่วยคำนวณว่าจะประหยัดภาษีได้เท่าไร"

---

## Example 06: Customer Asks for Recommendation with Budget

**Raw Input**: "อายุ 35 ครับ มีลูก 2 คน งบ 5,000 บาท/เดือน ควรทำอะไรดีครับ"

### Selected Intent
```
primary:    "ask_recommendation"
confidence: 0.94
```

### Selected ACP
```
primary: ACP-09 RECOMMENDATION_ENGINE (STANDARD)
```

### Memory
```
known_facts:
  - field: age,    value: 35,      source: customer_stated
  - field: budget, value: 5000/mo, source: customer_stated
```

### Decision
```
action:    ACT-05 (RECOMMEND)
rationale: "Sufficient context: age 35, married with 2 children, budget 5000/month.
            Recommend max 2 products. Cite customer's context (children) in reasoning."
constraints: [
  "max_recommendations_2",
  "cite_customer_context",
  "answer_first_required",
  "no_lead_capture_before_recommendation"
]
```

### Compressed Context Summary
```
Customer: age 35, 2 children, budget 5000/month. Sufficient for recommendation.
Recommend 2 products max: life insurance (protect children) + health insurance (hospital costs).
Cite "เพราะมีลูก 2 คน" in recommendation. Then ask for name/phone.
```

### Expected Reply Strategy
> "จากที่บอกมา ผมแนะนำ 2 อย่างครับ: 1) ประกันชีวิต เพราะมีลูก 2 คน... 2) ประกันสุขภาพ เพราะค่าโรงพยาบาลเอกชนแพง..." → then: "ให้คุณจิราวัฒน์ช่วยออกแบบรายละเอียดได้ครับ ขอชื่อที่สะดวกได้ไหมครับ?"

---

## Example 07: Customer Changes Topic During Lead Capture

**Raw Input**: "อ้อ แต่ถ้าเป็นความดันโลหิตสูง ทำประกันได้ไหมครับ" (mid-lead-capture)

### Prior State
```
session.active_state: "AWAITING_PHONE"  (lead capture in progress)
conversation.unresolved_question: "เบอร์โทรที่สะดวกติดต่อกลับครับ?"
```

### Selected Intent
```
primary:           "medical_question"
confidence:        0.89
is_medical_signal: true
```

### Decision
```
action:      ACT-02 (ANSWER_THEN_ASK — medical)
override:    "Customer changed topic. State machine interrupt. ACP-04 activated.
              Lead capture state suspended. ACP-04 rules now apply."
constraints: ["medical_uncertainty_required", "no_lead_capture_until_medical_resolved",
              "answer_first_required", "one_question_max"]
```

### Memory
```
lead_profile.fields_captured: ["name"]   ← name was already captured
working_memory: { suspended_state: "AWAITING_PHONE" }
```

### Compressed Context Summary
```
Topic changed mid-lead-capture. Suspend phone collection. Answer medical question first.
Known: customer name already captured. Do NOT re-ask name.
After medical follow-up resolved, may resume lead capture if appropriate.
```

### Expected Reply Strategy
> Answer medical question (case-by-case for hypertension) → ask one medical follow-up. Phone collection resumes only after this is resolved and customer returns to interest in product.

---

## Example 08: Customer Asks to Speak with Jirawat

**Raw Input**: "อยากคุยกับคุณจิราวัฒน์โดยตรงครับ"

### Selected Intent
```
primary:    "handoff_request"
confidence: 0.97
```

### Selected ACP
```
primary: ACP-17 HUMAN_HANDOFF (STANDARD)
```

### Decision
```
action:    ACT-07 (HANDOFF — immediate type)
rationale: "Customer explicitly requested to speak with Jirawat. Immediate warm handoff."
```

### Memory
```
lead_profile: { name: "สมชาย", phone: null }
fields_captured: ["name"]
```

### Compressed Context Summary
```
Customer explicitly requested Jirawat. Immediate handoff.
Known: name is "สมชาย". Do NOT ask for name again.
Next: ask for phone only. Frame as natural next step, not AI limitation.
```

### Expected Reply Strategy
> "ได้เลยครับ คุณสมชาย คุณจิราวัฒน์จะช่วยได้โดยตรงเลยครับ" → "เบอร์โทรที่สะดวกให้โทรกลับครับ?" (name already known — skip to phone)

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial 8 examples — trust, medical, tax, recommendation, topic change, handoff |
