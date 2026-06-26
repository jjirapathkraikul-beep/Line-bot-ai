# 10 — Execution Sequence
### AI Execution Engine — Key Scenario Walkthroughs
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Chief AI System Architect

---

## Purpose

Demonstrate how the AI Execution Engine processes six key customer scenarios. Each sequence shows which pipeline steps fire, which capabilities activate, which knowledge sources resolve, and what decision and response result. These sequences validate the execution architecture against real-world use cases.

---

## Scope

This document covers six annotated sequence diagrams:
1. Customer asks about health insurance
2. Customer worries about scam
3. Customer discloses cancer history
4. Customer requests a quotation
5. Customer requests a human advisor
6. Customer changes topic during lead capture

These diagrams are technology-independent. They show AEE thinking — not LINE events, webhook payloads, or AI model calls.

---

## Notation

Each sequence shows the pipeline steps as vertical lanes and annotates what flows through them. `[CAP-NNN]` = capability activated. `[KS-NNN]` = knowledge resolved. `[RULE-N]` = decision rule matched.

---

## Scenario 1 — Customer Asks About Health Insurance

**Customer message:** "ประกันสุขภาพคุ้มครองอะไรบ้างครับ"
**Session state:** New customer, first turn, no prior context.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant KS as Knowledge
    participant MEM as Memory

    C->>AEE: "ประกันสุขภาพคุ้มครองอะไรบ้างครับ"

    Note over AEE: Step 1 — Receive Input
    AEE->>AEE: Validate input. Initialize ExecutionContext.

    Note over AEE: Step 2 — Conversation Context
    AEE->>MEM: Read session (session_id)
    MEM-->>AEE: Empty session (new customer)
    AEE->>AEE: current_mode = GREETING. customer_profile = empty.

    Note over AEE: Step 3 — Intent Detection
    AEE->>AEE: primary_intent = INTENT_PRODUCT_INFO
    AEE->>AEE: intent_confidence = 0.92

    Note over AEE: Step 4 — Emotion Detection
    AEE->>AEE: primary_emotion = CURIOUS, intensity = LOW

    Note over AEE: Step 5 — Goal Detection
    AEE->>AEE: primary_goal = UNDERSTAND. success_criteria = question answered.

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-004] FAQEngine (INTENT_PRODUCT_INFO)
    AEE->>CAP: Activate [CAP-001] ConversationIntelligence (always)

    Note over AEE: Step 7 — Knowledge Resolution
    AEE->>KS: Resolve [KS-001] FAQ Knowledge (primary)
    AEE->>KS: Resolve [KS-002] Product Catalog (topic: health insurance)
    KS-->>AEE: KnowledgeBundle: FAQ + Product health coverage content

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 8a: INTENT_PRODUCT_INFO + knowledge available + first turn
    AEE->>AEE: First turn → do not ask (skip 8a)
    AEE->>AEE: Rule 8b: ANSWER. [RULE-8b matched]

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-01 INFORMATIVE
    AEE->>AEE: Structure: Answer-first. Short paragraph. No question on turn 1.
    AEE-->>C: "ประกันสุขภาพคุ้มครองค่ารักษาพยาบาลผู้ป่วยในครับ..."

    Note over AEE: Step 10 — Memory Update (async)
    AEE->>MEM: Write session: turn_history[0], current_mode=FAQ

    Note over AEE: Step 11 — Analytics (async)
    AEE->>AEE: Emit EVT-P01 (INTENT_DETECTED), EVT-P04, EVT-P05, EVT-P06, EVT-P07, EVT-C01, EVT-C02
```

**Key takeaway:** First turn FAQ scenario — no lead capture, pure informative answer. Capabilities: 2. Knowledge sources: 2. Decision: ANSWER.

---

## Scenario 2 — Customer Worries About Scam

**Customer message:** "กลัวว่าจะโดนโกง บริษัทนี้น่าเชื่อถือไหมครับ"
**Session state:** Turn 3, currently in FAQ mode, emotion history = neutral.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant KS as Knowledge

    C->>AEE: "กลัวว่าจะโดนโกง บริษัทนี้น่าเชื่อถือไหมครับ"

    Note over AEE: Step 3 — Intent Detection
    AEE->>AEE: primary_intent = INTENT_SCAM_CONCERN
    AEE->>AEE: intent_confidence = 0.95

    Note over AEE: Step 4 — Emotion Detection
    AEE->>AEE: primary_emotion = ANXIOUS, intensity = HIGH
    AEE->>AEE: empathy_required = true
    AEE->>AEE: emotional_trajectory = DECLINING (from neutral → anxious)

    Note over AEE: Step 5 — Goal Detection
    AEE->>AEE: primary_goal = VERIFY
    AEE->>AEE: unstated_need = REASSURANCE

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-002] TrustEngine (INTENT_SCAM_CONCERN, priority 1)
    AEE->>CAP: Activate [CAP-008] EmotionResponder (ANXIOUS HIGH)
    AEE->>CAP: Activate [CAP-001] ConversationIntelligence

    Note over AEE: Step 7 — Knowledge Resolution
    AEE->>KS: Resolve [KS-006] Trust Scenarios (primary)
    KS-->>AEE: Scam handling script, license verification, credibility proof points

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 2: INTENT_SCAM_CONCERN + ANXIOUS HIGH → BUILD_TRUST [RULE-2 matched]

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-03 EMPATHETIC (empathy_required=true overrides T-02)
    AEE->>AEE: EmotionResponder: prepend empathy acknowledgment
    AEE->>AEE: TrustEngine output: trust_action=VERIFY, provide license info
    AEE-->>C: "เข้าใจเลยครับว่ามันน่ากังวล ปัจจุบันมีหลายอย่างที่ต้องระวัง..."
    AEE-->>C: "ผมเป็นตัวแทนที่ได้รับใบอนุญาตจากคปภ. เลขที่ [XXX]..."

    Note over AEE: Analytics
    AEE->>AEE: Emit EVT-T01 (trust score updated), EVT-T02 (scam concern), EVT-T03 (action=VERIFY)
    AEE->>AEE: Emit EVT-C07 if drop_off_risk elevated
```

**Key takeaway:** Trust scenario overrides normal flow. Empathy comes before information. TrustEngine fires at Priority 1. Decision: BUILD_TRUST.

---

## Scenario 3 — Customer Discloses Cancer History

**Customer message:** "แต่ว่าผมเคยเป็นมะเร็งมาก่อนนะครับ สมัครประกันได้ไหม"
**Session state:** Turn 5, lead capture in progress, Tier 1 fields partially collected.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant KS as Knowledge

    C->>AEE: "แต่ว่าผมเคยเป็นมะเร็งมาก่อนนะครับ สมัครประกันได้ไหม"

    Note over AEE: Step 3 — Intent Detection
    AEE->>AEE: primary_intent = INTENT_FAQ (product eligibility)
    AEE->>AEE: topic_signals = ["cancer", "มะเร็ง", "สมัคร"]

    Note over AEE: Step 4 — Emotion Detection
    AEE->>AEE: primary_emotion = ANXIOUS, intensity = MEDIUM
    AEE->>AEE: empathy_required = true (health disclosure = sensitive)

    Note over AEE: Step 5 — Goal Detection
    AEE->>AEE: primary_goal = UNDERSTAND (eligibility) + unstated = HOPE

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-004] FAQEngine (INTENT_FAQ)
    AEE->>CAP: Activate [CAP-003] LeadEngine (health field captured: cancer_status)
    AEE->>CAP: Activate [CAP-008] EmotionResponder (ANXIOUS MEDIUM + health sensitive)

    Note over AEE: Step 7 — Knowledge Resolution
    AEE->>KS: Resolve [KS-003] Medical Knowledge (topic: cancer)
    AEE->>KS: Resolve [KS-010] Underwriting Rules (cancer history eligibility)
    KS-->>AEE: Cancer underwriting rules, available product options for cancer survivors

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 8a: FAQ intent + knowledge available + lead fields partially complete
    AEE->>AEE: ANSWER_THEN_ASK → answer eligibility question + ask next Tier 1 field [RULE-8a]

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-03 EMPATHETIC (health disclosure)
    AEE->>AEE: Acknowledge concern. Answer eligibility with nuance. Bridge to next field.
    AEE-->>C: "ขอบคุณที่แชร์นะครับ เข้าใจว่าเรื่องนี้อาจกังวลครับ..."
    AEE-->>C: "บางแผนอาจมีข้อจำกัด แต่มีตัวเลือกที่ยังคุ้มครองได้..."
    AEE-->>C: "[follow_up_question] อยากทราบว่าหายจากการรักษามาสักกี่ปีแล้วครับ?"

    Note over AEE: Step 10 — Memory (async)
    AEE->>MEM: Write cancer_status = "เคยเป็น" to CustomerProfile
    AEE->>MEM: Write lead_score updated to Session + trigger CRM sync
```

**Key takeaway:** Health disclosure triggers Medical Knowledge + Underwriting. Empathy mandatory on health sensitive topics. LeadEngine captures `cancer_status` as a side effect of the FAQ answer. Decision: ANSWER_THEN_ASK.

---

## Scenario 4 — Customer Requests Quotation

**Customer message:** "ขอทราบเบี้ยประกันสุขภาพได้เลยไหมครับ"
**Session state:** Turn 7, lead_status = engaged, Tier 1 mostly complete (missing budget only), lead_score = 58.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant KS as Knowledge

    C->>AEE: "ขอทราบเบี้ยประกันสุขภาพได้เลยไหมครับ"

    Note over AEE: Step 3
    AEE->>AEE: primary_intent = INTENT_GET_QUOTE
    AEE->>AEE: intent_confidence = 0.91

    Note over AEE: Step 4
    AEE->>AEE: primary_emotion = INTERESTED, intensity = MEDIUM

    Note over AEE: Step 5
    AEE->>AEE: primary_goal = PURCHASE

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-005] RecommendationEngine (INTENT_GET_QUOTE)
    AEE->>CAP: Activate [CAP-003] LeadEngine (budget missing — can improve recommendation)
    AEE->>CAP: Activate [CAP-001] ConversationIntelligence

    Note over AEE: Step 7
    AEE->>KS: Resolve [KS-002] Product Catalog (health insurance)
    AEE->>KS: Resolve [KS-009] Recommendation Rules
    AEE->>KS: Resolve [KS-010] Underwriting Rules (age-based pricing)
    KS-->>AEE: Product options matched to age=35, health=good

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 6: INTENT_GET_QUOTE + lead_status=engaged (not yet qualified)
    AEE->>AEE: recommendation_confidence = 0.68 (budget unknown → below 0.7 threshold)
    AEE->>AEE: Rule 6 does NOT match (confidence < 0.7)
    AEE->>AEE: Rule 7: Tier 1 field missing (budget_annual) → COLLECT_LEAD [RULE-7]

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-05 CONVERSATIONAL
    AEE->>AEE: Acknowledge quote intent. Explain need for budget to give accurate number.
    AEE-->>C: "ยินดีแนะนำเลยครับ เพื่อให้ตัวเลขใกล้เคียงที่สุด..."
    AEE-->>C: "งบที่วางแผนไว้สำหรับค่าประกันต่อปี ประมาณเท่าไหร่ดีครับ?"

    Note over AEE: Analytics
    AEE->>AEE: Emit EVT-L01 (intent to quote), EVT-P06 (COLLECT_LEAD)
```

**Key takeaway:** Quote intent triggers RecommendationEngine but confidence is too low without budget. Decision falls through to COLLECT_LEAD first. Once budget is captured next turn, RecommendationEngine will have enough data to qualify the lead.

---

## Scenario 5 — Customer Requests a Human Advisor

**Customer message:** "ขอคุยกับเจ้าหน้าที่ได้เลยไหมครับ"
**Session state:** Turn 4, lead_status = engaged, lead_score = 45, Tier 1 partial.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant MEM as Memory

    C->>AEE: "ขอคุยกับเจ้าหน้าที่ได้เลยไหมครับ"

    Note over AEE: Step 3
    AEE->>AEE: primary_intent = INTENT_REQUEST_HUMAN
    AEE->>AEE: intent_confidence = 0.97

    Note over AEE: Step 4
    AEE->>AEE: primary_emotion = NEUTRAL, intensity = LOW

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-007] HandoffEngine (INTENT_REQUEST_HUMAN — Priority 1)
    AEE->>CAP: HandoffEngine evaluates Tier 1 completeness
    CAP-->>AEE: handoff_ready = true (INTENT_REQUEST_HUMAN is unconditional)
    CAP-->>AEE: missing_fields = ["budget_annual"] (Tier 1 partially missing — flag for advisor)

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 1: INTENT_REQUEST_HUMAN → ESCALATE_HUMAN [RULE-1 matched, absolute]

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-07 CLOSING
    AEE->>AEE: Compose customer-facing handoff message
    AEE-->>C: "ได้เลยครับ ผมได้ส่งข้อมูลให้ทีมที่ปรึกษาแล้ว..."
    AEE-->>C: "จะมีทีมงานติดต่อกลับภายใน 24 ชั่วโมงครับ"

    Note over AEE: Step 10 — Memory (async)
    AEE->>MEM: Write lead_status = "handoff" to CustomerProfile
    AEE->>MEM: trigger_crm_sync = true (ESCALATE_HUMAN always triggers CRM sync)
    AEE->>MEM: Write handoff_triggered = true to SessionMemory

    Note over AEE: Output
    AEE-->>App: ExecutionOutput with handoff.triggered=true + HandoffContext
```

**Key takeaway:** `INTENT_REQUEST_HUMAN` triggers Rule 1 immediately — no other rule is evaluated. HandoffEngine is Priority 1. Lead status transitions to `handoff`. CRM sync is triggered. Missing fields are flagged in HandoffContext for advisor.

---

## Scenario 6 — Customer Changes Topic During Lead Capture

**Customer message:** "แล้วถ้าเข้าโรงพยาบาลได้ที่ไหนบ้างครับ" *(during phone number capture)*
**Session state:** Turn 3, current_mode = LEAD_CAPTURE, last action was COLLECT_LEAD asking for phone number.

```mermaid
sequenceDiagram
    participant C as Customer
    participant AEE as AEE Pipeline
    participant CAP as Capabilities
    participant KS as Knowledge

    Note over AEE: Prior turn: AEE asked for phone number (COLLECT_LEAD)
    C->>AEE: "แล้วถ้าเข้าโรงพยาบาลได้ที่ไหนบ้างครับ"

    Note over AEE: Step 2 — Conversation Context
    AEE->>AEE: prior turn action = COLLECT_LEAD (phone requested)
    AEE->>AEE: customer_profile.phone = null (not provided → topic_changed instead)

    Note over AEE: Step 3 — Intent Detection
    AEE->>AEE: primary_intent = INTENT_FAQ (topic: hospital network)
    AEE->>AEE: NOTE: customer did NOT provide phone → topic_changed detected

    Note over AEE: Step 4
    AEE->>AEE: primary_emotion = CURIOUS, intensity = LOW

    Note over AEE: Step 5
    AEE->>AEE: primary_goal = UNDERSTAND
    AEE->>AEE: Note topic change from COLLECT_LEAD context

    Note over AEE: Step 6 — Capability Selection
    AEE->>CAP: Activate [CAP-004] FAQEngine (INTENT_FAQ: hospital)
    AEE->>CAP: Activate [CAP-003] LeadEngine (phone still missing — will ask again after answering)

    Note over AEE: Step 7
    AEE->>KS: Resolve [KS-011] Hospital Network
    KS-->>AEE: Hospital network list and cashless claim info

    Note over AEE: Step 8 — Decision Engine
    AEE->>AEE: Rule 7: phone still missing → COLLECT_LEAD normally
    AEE->>AEE: BUT: current turn intent is FAQ (topic change)
    AEE->>AEE: Rule 8a: FAQ intent + lead partially complete + not first turn → ANSWER_THEN_ASK
    AEE->>AEE: [RULE-8a matched] Answer hospital question, then re-ask phone naturally

    Note over AEE: Step 9 — Response Composer
    AEE->>AEE: Tone = T-01 INFORMATIVE
    AEE->>AEE: Answer hospital question first (answer-first principle)
    AEE->>AEE: Bridge naturally to phone capture
    AEE-->>C: "เข้าได้ทุกโรงพยาบาลในเครือที่ตกลงกับบริษัทครับ..."
    AEE-->>C: "โอ้โห ถามได้ละเอียดมากเลยนะครับ ฝากเบอร์โทรไว้ได้เลยไหมครับ..."

    Note over AEE: Key Behavior
    Note over AEE: LeadEngine adds phone to fields_requested_this_session[]
    Note over AEE: Avoids asking phone a 3rd time if customer declines again next turn
```

**Key takeaway:** Topic change during lead capture is handled gracefully. AEE answers the new question first (answer-first principle), then re-approaches the missing field naturally. If customer declines again, `fields_requested_this_session[]` prevents the engine from repeating the same request. Decision: ANSWER_THEN_ASK.

---

## Cross-Scenario Patterns

| Scenario | Rule | Decision | Trust Action | Lead Action |
|---|---|---|---|---|
| Health insurance FAQ | Rule 8b | ANSWER | — | — |
| Scam concern | Rule 2 | BUILD_TRUST | VERIFY + REASSURE | — |
| Cancer disclosure | Rule 8a | ANSWER_THEN_ASK | Empathy only | Capture cancer_status |
| Quote request (incomplete) | Rule 7 | COLLECT_LEAD | — | Capture budget |
| Request human | Rule 1 | ESCALATE_HUMAN | — | Handoff |
| Topic change mid-capture | Rule 8a | ANSWER_THEN_ASK | — | Re-ask field |

---

## Dependencies

- `02_EXECUTION_PIPELINE.md` — Steps referenced in each sequence
- `03_CAPABILITY_LOADER.md` — CAP-NNN capabilities
- `04_KNOWLEDGE_RESOLVER.md` — KS-NNN knowledge sources
- `05_DECISION_PIPELINE.md` — Rules referenced
- `06_RESPONSE_COMPOSER.md` — Tones applied
- `07_MEMORY_ENGINE.md` — Memory operations
- `08_ANALYTICS_ENGINE.md` — Events emitted

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief AI System Architect | Initial creation — 6 scenarios with full sequence diagrams and cross-scenario pattern table |
