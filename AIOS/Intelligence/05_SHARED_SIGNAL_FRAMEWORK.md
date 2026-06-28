# 05 — Shared Signal Framework

**Document ID**: AIOS-INT-05  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect

---

## Purpose

This document defines the signal taxonomy used across all 7 AIOS intelligence domains. Signals are discrete, observable events detected during a conversation that inform intelligence decisions.

A signal is not a decision — it is an input. Each intelligence domain consumes signals; the Decision Engine and Conversation Intelligence use them to select actions and strategies.

**Domain independence**: Signal definitions are not insurance-specific. The signal types apply to any advisory domain. Domain-specific signal content (Thai keywords, product names) lives in `AIOS/Domains/`.

---

## Signal Schema

Every signal conforms to this structure:

```
Signal {
  type:     string           // Signal identifier (e.g., TRUST_CONCERN)
  category: SignalCategory   // Which intelligence domain owns this signal
  strength: LOW | MEDIUM | HIGH
  turn:     number           // Which turn produced this signal
  evidence: string           // Text or pattern that triggered the signal
  owner:    Intelligence     // Which intelligence domain processes this signal
}
```

---

## Category 1 — Conversation Signals

**Owner**: Conversation Intelligence  
**Used by**: Conversation Intelligence (strategy), Decision Engine (action), Learning Intelligence (quality)

---

### CS-01 — Intent

**Description**: Classification of what the customer is asking or attempting to accomplish.  
**Strength levels**:
- HIGH: Clear, unambiguous intent ("ผมอยากทำประกันสุขภาพ")
- MEDIUM: Probable intent inferred from context
- LOW: Ambiguous or multi-intent message

**Triggers**: Any customer message  
**Produced at**: Intent Detection (AEE Step 3 / Gen1 Step 1)  
**Runtime**: `IntentDetectorResult.intent + confidence` in `intentDetector.ts`

---

### CS-02 — Topic Shift

**Description**: The customer has changed topic mid-flow — especially while an active conversation state (lead capture, medical, trust) is in progress.  
**Strength levels**:
- HIGH: Complete pivot to a new, unrelated intent
- MEDIUM: Partial topic change (related but diverging)
- LOW: Clarification or expansion of current topic

**Triggers**: New intent detected while `captureStage !== 'IDLE'`  
**Action implication**: TOPIC_SHIFT_RECOVERY strategy (CP-08)  
**Runtime**: `detectTopicShift()` in `strategyEngine.ts`

---

### CS-03 — Emotion

**Description**: The customer's emotional state — distinct from what they want (intent) and what they seek (goal).  
**Strength levels**: LOW, MEDIUM, HIGH per emotion type  
**Values**: NEUTRAL, CURIOUS, ANXIOUS, FRUSTRATED, TRUSTING, SUSPICIOUS  
**Triggers**: Linguistic markers, punctuation patterns, complaint language, gratitude language

**Current status**: **NOT YET IMPLEMENTED** (Gap G-01)  
**Specified in**: `AIOS/Execution/02_EXECUTION_PIPELINE.md` Step 4 (EVT-P02)  
**Action implication**: HIGH emotion + ANXIOUS → empathy before information; SUSPICIOUS → BUILD_TRUST_FIRST

---

### CS-04 — Confusion

**Description**: The customer is unclear, has asked the same question twice, or has given an inconsistent answer.  
**Strength levels**:
- HIGH: Direct statement of confusion ("ไม่เข้าใจ", "งงครับ")
- MEDIUM: Repeated question (same field asked again)
- LOW: Contradictory data in consecutive turns

**Triggers**: Repeated question detection, contradiction in captured fields  
**Action implication**: Rephrase + educate; DO NOT re-ask the same way

---

### CS-05 — Repetition

**Description**: The customer is repeating information they have already provided.  
**Strength levels**:
- HIGH: Customer explicitly says "I already told you" ("ฉันตอบไปแล้ว", "บอกไปแล้ว")
- MEDIUM: Customer re-states a field value without prompting

**Triggers**: CS-05 HIGH was the primary Beta failure mode (conversation history not loaded)  
**Action implication**: Do NOT re-ask; consult Section 13 (conversation history) before responding  
**Runtime fix**: `conversationHistory` loading in gen1-stub-0.9.0

---

### CS-06 — Question Fatigue

**Description**: The customer has been asked multiple questions without their questions being answered first. They signal impatience.  
**Strength levels**:
- HIGH: Direct statement ("ถามเยอะจัง", "ทำไมต้องตอบเยอะ")
- MEDIUM: Short or one-word answers after several turns
- LOW: Response latency increase (channel-dependent)

**Action implication**: Answer the customer's question first (CP-01: Answer Before Asking); reduce question frequency  
**Governed by**: CP-02 (One Question Per Turn)

---

## Category 2 — Customer Signals

**Owner**: Customer Intelligence  
**Used by**: Conversation Intelligence (strategy), Commercial Intelligence (lead action), Decision Engine

---

### CuS-01 — Trust Level

**Description**: The customer's current level of trust in the advisor/platform.  
**Strength levels**:
- HIGH trust: Customer is sharing personal information freely
- MEDIUM trust: Cautious but engaged
- LOW trust: Skeptical, asking verification questions

**Triggers**: Trust keywords, identity questions, fraud/scam vocabulary  
**Runtime**: `trustMemory.trustConcernActive`, `trustMemory.trustConcernTurn`  
**Action implication**: LOW trust → BUILD_TRUST_FIRST (CP-04); suspend lead capture

---

### CuS-02 — Need Clarity

**Description**: How clearly the customer has articulated what they are looking for.  
**Strength levels**:
- HIGH: Specific product, budget, timeline stated
- MEDIUM: General category identified but specifics unknown
- LOW: "I don't know what I need"

**Action implication**: LOW need clarity → NEED_DISCOVERY strategy; HIGH need clarity → skip discovery, go to recommendation

---

### CuS-03 — Buying Intent

**Description**: The customer is showing signs of readiness to purchase or commit.  
**Strength levels**:
- HIGH: Direct statement ("อยากซื้อ", "สมัครได้เลยไหม")
- MEDIUM: Callback request, schedule appointment signal
- LOW: Positive response to recommendation without explicit commitment

**Triggers**: `Buying_Signal.md` criteria  
**Action implication**: HIGH → ACT-09 CLOSE or HANDOFF_PENDING; MEDIUM → ACT-10 CONFIRM_INTENT

---

### CuS-04 — Urgency

**Description**: The customer has a time constraint or pressing need.  
**Strength levels**:
- HIGH: Hospitalization event, pending travel, immediate family need
- MEDIUM: "Soon" or "this month" language
- LOW: General "sometime this year" framing

**Action implication**: HIGH urgency → skip extended education; ACP-16/15 for emergency; fast-track lead capture

---

### CuS-05 — Budget Readiness

**Description**: Whether the customer has disclosed or implied a budget range.  
**Strength levels**:
- HIGH: Specific number stated ("งบ 20,000 บาทต่อปี")
- MEDIUM: Range stated ("ไม่เกิน 2,000 ต่อเดือน")
- LOW: Indirect signal ("แพงไปหน่อย")

**Runtime**: `customerProfile.budget_annual` in `memoryResolver.ts`  
**Action implication**: Known → do not re-ask; Unknown at CONSIDERING stage → ask budget

---

### CuS-06 — Medical Disclosure

**Description**: The customer has disclosed a health condition relevant to underwriting.  
**Strength levels**:
- HIGH: Named specific condition with current treatment status
- MEDIUM: Mentioned condition without specifics
- LOW: Implied concern ("สุขภาพไม่ค่อยดี")

**Triggers**: `isMedicalSignal = true` in intentDetector  
**Action implication**: Empathy first; underwriting uncertainty language mandatory (CP-06); do NOT guarantee approval  
**Runtime**: `medicalMemory.conditionsDisclosed`, `medicalMemory.disclaimerRequired`

---

### CuS-07 — Family Event

**Description**: The customer has disclosed a significant life event (birth, marriage, new job, child entering school) that changes their protection needs.  
**Action implication**: Acknowledge event; adjust recommendation to new life stage; update product suitability

---

### CuS-08 — Risk Concern

**Description**: The customer is expressing concern about risk (investment risk, policy risk, company risk).  
**Action implication**: Provide risk disclosure; for investment → mandatory investment risk fragment; for company risk → trust verification

---

## Category 3 — Commercial Signals

**Owner**: Commercial Intelligence  
**Used by**: Commercial Intelligence (action selection), Conversation Intelligence (strategy), Advisor Intelligence (handoff trigger)

---

### CoS-01 — Product Interest

**Description**: The customer has expressed interest in a specific product category.  
**Strength levels**:
- HIGH: Named specific product
- MEDIUM: Named category (health insurance, life insurance)
- LOW: General protection interest without category

**Runtime**: `intentResult.flags.isProductIntent`  
**Action implication**: HIGH → load ACP for that product; trigger education → recommendation path

---

### CoS-02 — Comparison

**Description**: The customer wants to compare multiple products, providers, or options.  
**Triggers**: "เปรียบเทียบ", "ดีกว่า", "ต่างกันอย่างไร", "อีกที่"  
**Action implication**: ACP-12 PRODUCT_COMPARISON; answer comparison honestly per constitutional constraint

---

### CoS-03 — Price Inquiry

**Description**: The customer is asking about cost, premium, or affordability.  
**Triggers**: "เบี้ย", "ราคา", "แพง", "ถูก", "กี่บาท"  
**Action implication**: ACP-13 PRICE_OBJECTION if concern detected; otherwise provide indicative range

---

### CoS-04 — Callback Request

**Description**: The customer wants human contact — phone call, appointment, LINE call.  
**Triggers**: "โทรหา", "นัด", "คุย", "เบอร์"  
**Strength**: Always HIGH  
**Action implication**: ACT-11 HANDOFF_TO_HUMAN; ACP-17 HUMAN_HANDOFF; transition to HANDOFF_PENDING

---

### CoS-05 — Quotation Request

**Description**: The customer wants a specific premium quote for their profile.  
**Triggers**: "ขอใบเสนอราคา", "quotation", "เสนอราคา"  
**Action implication**: Lead capture required before quotation (name, age, product, health); then handoff or product PDF

---

### CoS-06 — Objection

**Description**: The customer is expressing resistance — price, timing, spouse, skepticism.  
**Sub-types**: PRICE_OBJECTION, TIMING_OBJECTION, SPOUSE_OBJECTION, SCAM_CONCERN  
**Action implication**: Per ACP-13 (price), ACP-08 (scam), objection handling patterns

---

### CoS-07 — Purchase Intent

**Description**: The customer is ready to commit. Highest strength commercial signal.  
**Triggers**: Direct purchase statement, application request, policy question (not just education)  
**Strength**: HIGH only  
**Action implication**: ACT-09 CLOSE; lead capture completion; transition to READY or HANDOFF_PENDING

---

## Category 4 — Learning Signals

**Owner**: Learning Intelligence  
**Used by**: Learning Intelligence (issue detection), Conversation Intelligence (pattern matching), Business Intelligence (quality metrics)

---

### LS-01 — Knowledge Gap

**Description**: The AI could not find relevant knowledge for a customer question.  
**Evidence**: Knowledge resolver returned empty result or fallback fragment  
**Action implication**: Log issue `knowledge_gap`; Learning Intelligence creates Change Proposal to add knowledge

---

### LS-02 — Memory Failure

**Description**: The AI asked for information the customer had already provided.  
**Evidence**: Re-ask of a known field (violates CP-05)  
**Action implication**: P1 issue; root cause: memory resolution failed or history not loaded

---

### LS-03 — Repeated Question

**Description**: The AI asked the same question it asked in a prior turn.  
**Evidence**: `unresolvedQuestion` matches prior turn question  
**Action implication**: P1 issue; Learning Intelligence logs PATTERN-MEMORY-NNN

---

### LS-04 — Poor Follow-up

**Description**: The AI's follow-up question was irrelevant or poorly timed.  
**Evidence**: Question quality score < 3 in Conversation Audit  
**Action implication**: Pattern analysis → improved ACP Decision_Rules or strategyRegistry

---

### LS-05 — Hallucination Risk

**Description**: The AI generated a statement not traceable to a loaded knowledge snippet.  
**Evidence**: Response contains specific product claim with no matching knowledge source  
**Action implication**: P0 issue; immediate human review; potential compliance risk

---

### LS-06 — Failed Recommendation

**Description**: A recommendation was delivered but the customer rejected it or it was clearly mismatched.  
**Evidence**: Customer says recommendation is wrong/expensive/irrelevant after ACT-05  
**Action implication**: Root cause analysis; check ACP-09 Decision_Rules; check profile accuracy

---

### LS-07 — Handoff Timing Error

**Description**: Handoff triggered too early (insufficient context) or too late (customer already frustrated).  
**Evidence**: Lead score below threshold at handoff (too early); FRUSTRATION signal before handoff triggered (too late)  
**Action implication**: Adjust handoff threshold in ACP-17 Decision_Rules

---

## Category 5 — Business Signals

**Owner**: Business Intelligence  
**Used by**: Business Intelligence (aggregation), Human Product Owner (decision), Learning Intelligence (trend detection)

---

### BS-01 — Conversion

**Description**: A customer has successfully moved from READY to HANDOFF_COMPLETED or CUSTOMER.  
**Strength**: Always HIGH  
**Event**: EVT-L05 (LEAD_HANDOFF_TRIGGERED) → post-conversion tracking

---

### BS-02 — Lead Quality

**Description**: The quality score of a lead at the time of any significant event (capture, qualification, handoff).  
**Derived from**: Lead score algorithm (SSI-04)  
**Used for**: KPI measurement (Avg Lead Score at Handoff target ≥ 60)

---

### BS-03 — Handoff Quality

**Description**: How complete and useful the handoff context package was, rated by the human advisor.  
**Current status**: **NOT YET IMPLEMENTED** (Gap G-16)  
**Action implication**: Low handoff quality → Advisor Intelligence improvement cycle

---

### BS-04 — Product Demand

**Description**: Which products customers are asking about most frequently over a given period.  
**Derived from**: CoS-01 (Product Interest) aggregated by Business Intelligence  
**Used for**: Product prioritization, knowledge freshness prioritization

---

### BS-05 — Drop-off Point

**Description**: At which stage or turn customers most frequently disengage without completing their goal.  
**Derived from**: Session completeness + Customer stage at last turn  
**Used for**: Conversation strategy improvement; Learning Intelligence audit cycle triggers

---

## Signal Priority Rules

When multiple signals are active simultaneously, the following priority rules apply for decision-making:

| Priority | Signal | Why |
|---|---|---|
| 1 (CRITICAL) | CuS-01 TRUST LOW + isTrustSignal = true | Trust must be resolved before any other action |
| 2 (HIGH) | CuS-06 MEDICAL_DISCLOSURE | Medical flows have compliance implications |
| 3 (HIGH) | CS-03 EMOTION = FRUSTRATED or ANXIOUS | Empathy before information |
| 4 (STANDARD) | CuS-04 URGENCY HIGH | Accelerate flow; reduce discovery |
| 5 (STANDARD) | CoS-07 PURCHASE_INTENT HIGH | Transition to closing/handoff |
| 6 (STANDARD) | CS-02 TOPIC_SHIFT | Follow customer; do not force prior flow |
| 7 (LOW) | BS-04 PRODUCT_DEMAND | Platform-level observation; does not affect individual turn |

These priorities mirror the Decision Engine's CRITICAL → HIGH → STANDARD → LOW rule evaluation chain defined in `AIOS/Execution/05_DECISION_PIPELINE.md`.
