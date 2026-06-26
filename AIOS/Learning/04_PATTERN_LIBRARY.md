# 04 — Pattern Library

**Document ID**: AIOS-LEARN-04  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Catalog reusable improvement patterns. A Pattern represents a recurring class of AI quality issue with a proven solution template. When a new issue is identified, the first step is to check whether an existing Pattern covers it — avoiding duplication and accelerating improvement.

---

## Scope

Patterns are platform-independent. They describe AI behavior in terms of intent, context, and response strategy — not in terms of any specific channel, product, or implementation.

---

## Pattern ID Format

```
PATTERN-[CATEGORY]-NNN
```

Example: `PATTERN-TRUST-001`

---

## Pattern Schema

Each pattern contains:

| Field | Description |
|---|---|
| `pattern_id` | Unique ID |
| `pattern_name` | Short descriptive name |
| `category` | Pattern category (see categories below) |
| `version` | Pattern version |
| `status` | `ACTIVE` / `DEPRECATED` / `DRAFT` |
| `trigger` | Conditions that activate this pattern |
| `problem` | What goes wrong when this pattern is NOT applied |
| `solution` | The correct behavior when this pattern IS applied |
| `referenced_documents` | AIOS docs this pattern implements |
| `examples` | 2–3 concrete examples (channel-neutral) |
| `known_limitations` | Edge cases where this pattern may not apply |
| `related_patterns` | Other patterns to check when this one applies |

---

## Pattern Categories

| Category | Description |
|---|---|
| `TRUST` | Handling customer skepticism, fraud concern, identity verification |
| `MEDICAL` | Handling health history, underwriting questions, medical disclaimers |
| `SALES` | Handling product recommendations, objections, readiness to buy |
| `FAQ` | Handling factual product or service questions |
| `LEAD` | Handling data capture, field collection, timing of questions |
| `MEMORY` | Using previously captured information; avoiding repeat questions |
| `DECISION` | Routing, priority, and state machine transitions |
| `RECOMMENDATION` | Suggesting the right product, action, or next step |
| `OBJECTION` | Responding to price, timing, or commitment objections |
| `FOLLOW_UP` | Continuing a conversation after a key event (handoff, medical, trust) |

---

## PATTERN-TRUST-001 — Trust Before Lead

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer message contains any of: concern about fraud, scam, identity theft, or legitimacy of the person/service they are interacting with — at any point in the conversation, including during active data capture.

### Problem
When a customer expresses a trust concern, AI systems in lead-capture mode continue to ask for personal data (phone number, name). This confirms the customer's fear that the system is only trying to extract data, not help them. Result: conversation ends, trust destroyed.

### Solution
1. **Cancel all active data capture states immediately**
2. **Acknowledge the concern** — do not argue or defend
3. **Provide verification information** — explain how the customer can independently verify the person/company
4. **Do NOT ask for personal data** for at least the next two AI turns
5. **Offer to answer questions in chat** — remove the pressure to share data

### Referenced Documents
- `AIOS/Execution/06_RESPONSE_COMPOSER.md` — Answer Before Asking rule
- `AIOS/Execution/05_DECISION_PIPELINE.md` — Priority ordering
- `AIOS/Learning/01_LEARNING_PHILOSOPHY.md` — Safety over Speed principle

### Examples

**Example 1 — During awaiting_phone state**
> Customer: "มิจฉาชีพไหม กลัวโดนโกง"
> Wrong: "ฝากเบอร์โทรของคุณได้เลยครับ"
> Correct: "เข้าใจเลยครับ การตรวจสอบก่อนให้ข้อมูลเป็นเรื่องถูกต้อง คุณสามารถตรวจสอบได้จาก [verification info]. ถ้ายังไม่สะดวกให้เบอร์ ผมตอบคำถามในแชตก่อนได้ครับ"

**Example 2 — At conversation start**
> Customer: "LINE นี้น่าเชื่อถือไหม"
> Wrong: "สวัสดีครับ คุณสนใจประกันประเภทไหนครับ"
> Correct: "สวัสดีครับ ถามได้ถูกเลยครับ [verification info]. หลังจากตรวจสอบแล้ว ผมพร้อมตอบทุกคำถามครับ"

**Example 3 — During product inquiry**
> Customer: "สนใจประกันสุขภาพ แต่กลัวเป็นแก๊งค์ประกัน"
> Wrong: [continue to product questions]
> Correct: Trust response first, then return to product inquiry after trust is resolved

### Known Limitations
- If the customer immediately follows trust resolution with a product question, AI may begin lead capture on the next turn (after the 2-turn cooldown)
- If the customer provides verification themselves ("เห็นเพจแล้ว โอเค"), the cooldown may be shorter

### Related Patterns
- `PATTERN-LEAD-001` — Lead Timing
- `PATTERN-FOLLOW_UP-001` — Post-Trust Follow-Up

---

## PATTERN-MEDICAL-001 — Answer Medical Before Capturing

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer message contains any medical condition, health history, or underwriting-related question (e.g., cancer, diabetes, surgery history, pre-existing conditions).

### Problem
AI systems in data-capture mode respond to medical questions by immediately asking for contact information. This treats a serious health concern as a lead opportunity. The customer does not get their question answered and feels dismissed.

### Solution
1. **Answer the medical question first** — explain the case-by-case underwriting process
2. **Do NOT guarantee approval or rejection** — always use conditional language
3. **Ask exactly ONE relevant medical follow-up question** (treatment status, current medication, etc.)
4. **Save CRM record with available data** for agent awareness
5. **Offer human agent review** as a natural next step — do not force it

### Referenced Documents
- `AIOS/Execution/06_RESPONSE_COMPOSER.md` — Answer Before Asking rule
- `AIOS/Execution/03_CAPABILITY_LOADER.md` — Capability activation for medical

### Examples

**Example 1 — Cancer**
> Customer: "เป็นมะเร็งทำประกันได้ไหม"
> Wrong: "ขอทราบชื่อและเบอร์โทรก่อนเลยครับ"
> Correct: "กรณีมีประวัติมะเร็ง บริษัทพิจารณาเป็นรายกรณีครับ ไม่สามารถฟันธงได้เพราะต้องดูรายละเอียดทางการแพทย์ก่อน ขอถามเพิ่มเติม 1 ข้อครับ: ตอนนี้อยู่ระหว่างรักษา หรือรักษาหายแล้วครับ?"

**Example 2 — Diabetes**
> Customer: "เป็นเบาหวานทำประกันได้มั้ย"
> Wrong: "ขออนุญาตสอบถามอายุก่อนนะครับ"
> Correct: "กรณีเบาหวาน พิจารณาเป็นรายกรณีครับ ขอถามเพิ่มเติม 1 ข้อ: ตอนนี้ค่าน้ำตาลอยู่ในเกณฑ์ที่ควบคุมได้ไหมครับ?"

### Known Limitations
- This pattern does not cover cases where the customer explicitly says they want to buy and discloses a condition — in that case, lead capture may begin after answering
- Complex multi-condition cases may require human agent escalation after first response

### Related Patterns
- `PATTERN-TRUST-001` — may be combined if customer also expresses skepticism
- `PATTERN-FOLLOW_UP-002` — what to do after initial medical response

---

## PATTERN-LEAD-001 — Lead Timing

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Any situation where AI considers asking for customer personal data (name, phone, age, etc.)

### Problem
Premature or repeated data capture requests destroy conversation naturalness and customer trust. Common failures:
- Asking for phone before answering the customer's question
- Asking for data the customer already provided
- Asking for multiple data fields in one message
- Asking for contact information right after a trust concern

### Solution
1. **Answer the customer's question first** (always)
2. **Check known fields** — never ask for a field already captured
3. **Ask for exactly one field per turn**
4. **Do not capture lead data** within two turns after a trust concern
5. **Lead capture is appropriate only after** the customer's primary goal has been addressed at least partially

### Referenced Documents
- `AIOS/Execution/07_MEMORY_ENGINE.md` — Known field protection
- `AIOS/Execution/06_RESPONSE_COMPOSER.md` — One question per turn

### Examples

**Example 1 — Known field protection**
> Customer already provided: phone = 0812345678
> Wrong: "ขอเบอร์โทรของคุณลูกค้าด้วยครับ"
> Correct: [Do not ask for phone; proceed to next unknown field or answer question]

**Example 2 — Post-question capture**
> Customer: "ประกันสุขภาพแบบไหนเหมาะกับผมครับ"
> Wrong: "ขอทราบชื่อและเบอร์โทรก่อนได้เลยครับ"
> Correct: "ประกันสุขภาพมีหลายแบบครับ ขอทราบอายุประมาณเพื่อแนะนำให้เหมาะได้เลยครับ" [answer + one question]

### Known Limitations
- If the customer explicitly says they are ready to buy, lead capture may begin immediately
- Rich menu or postback entries may bypass the normal question flow

### Related Patterns
- `PATTERN-MEMORY-001` — Known field protection implementation
- `PATTERN-TRUST-001` — Trust overrides lead capture

---

## PATTERN-MEMORY-001 — Known Field Protection

**Status**: ACTIVE | **Version**: 1.0

### Trigger
AI is about to ask a question that can be answered by previously captured session data.

### Problem
AI asks for data the customer has already provided in the same conversation. This signals that the AI is not listening, breaks conversational flow, and frustrates returning customers.

### Solution
1. **Before asking any question**, check the session memory for the relevant field
2. **If field is populated** (non-null, non-empty), use the value directly — do not ask
3. **If field is partially populated** (e.g., "ประมาณ 30"), accept it as-is and do not ask for precision
4. **Inject known fields into AI context** so the language model does not regenerate questions for them
5. **Summarize known fields to the customer** when appropriate ("จากที่คุยกันทราบว่าคุณอายุ 35 ปี")

### Referenced Documents
- `AIOS/Execution/07_MEMORY_ENGINE.md`

### Examples

**Example 1 — Phone already captured**
> Session data: phone = "0812345678"
> Wrong: "ฝากเบอร์โทรของคุณได้เลยนะครับ"
> Correct: [Skip phone capture; proceed to next unknown field]

**Example 2 — Age captured, ask for income**
> Session data: age = "35"
> Wrong: "ขอทราบอายุของคุณก่อนครับ"
> Correct: "รายได้ต่อเดือนประมาณเท่าไรครับ"

### Known Limitations
- Fields captured in previous sessions (different conversation_id) require explicit loading from persistent memory before this pattern applies

### Related Patterns
- `PATTERN-LEAD-001` — Lead Timing (prerequisite)

---

## PATTERN-FAQ-001 — Answer From Knowledge

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer asks a factual question that can be answered from the knowledge base (product features, premiums, coverage, process, etc.)

### Problem
AI either:
- Makes up an answer not in the knowledge base (hallucination)
- Deflects to "please contact us" before attempting to answer
- Gives a correct but incomplete answer from incomplete knowledge

### Solution
1. **Search knowledge base first** — do not answer from training data alone
2. **If high-confidence match found** (>90%): answer directly and completely
3. **If medium-confidence match** (70–90%): answer with appropriate caveat
4. **If low-confidence** (<70%): acknowledge the question and offer to escalate to human agent
5. **Never fabricate product details, prices, or coverage terms**

### Referenced Documents
- `AIOS/Execution/04_KNOWLEDGE_RESOLVER.md`
- `AIOS/06_AI_Knowledge_Standard.md`

### Examples

**Example 1 — High confidence**
> Customer: "ประกันสุขภาพคุ้มครองอะไรบ้างครับ"
> Wrong: "คุ้มครองทุกโรคครับ" [fabricated]
> Correct: [Answer from FAQ with specific coverage details and appropriate caveats]

### Known Limitations
- Knowledge base must be kept current — stale FAQs produce confident wrong answers

### Related Patterns
- `PATTERN-RECOMMENDATION-001` — When answer leads to product recommendation

---

## PATTERN-DECISION-001 — Priority-First Routing

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Any incoming message where multiple intents could potentially apply.

### Problem
AI handles the lower-priority intent when a higher-priority intent was also present. Example: customer asks a trust question during a product inquiry, and AI continues with the product inquiry.

### Solution
Apply strict priority ordering. Higher-priority intents ALWAYS override lower-priority ones. Canonical order:
1. Admin / System commands
2. Rich menu / postback commands
3. Trust / Fraud concern
4. Medical / Underwriting
5. Contact / Human handoff request
6. Quote / Ready-to-buy signals
7. Product interest
8. General interest / FAQ
9. OpenAI fallback

### Referenced Documents
- `AIOS/Execution/05_DECISION_PIPELINE.md`

### Known Limitations
- If a message contains both trust AND medical signals, trust takes priority

---

## PATTERN-RECOMMENDATION-001 — Appropriate Product Recommendation

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer has provided enough context for a product recommendation (age, goal, budget).

### Problem
AI recommends based on insufficient context, recommends the wrong product type, or recommends a product because it appears first in the catalog rather than because it fits.

### Solution
1. Verify minimum required context: age + goal + budget (or income)
2. Match against product catalog using goal as primary filter
3. Present 1–2 options maximum with clear rationale
4. Explicitly link recommendation to customer's stated goal
5. If context is insufficient, ask for the missing field — do NOT assume

### Referenced Documents
- `AIOS/Execution/05_DECISION_PIPELINE.md`
- Domain knowledge base

### Known Limitations
- Medical history may affect recommendation validity — flag for human review if disclosed

---

## PATTERN-OBJECTION-001 — Price Objection Response

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer expresses concern about cost, premium amount, or affordability.

### Problem
AI either defends the price, offers discounts it cannot guarantee, or abandons the conversation.

### Solution
1. **Acknowledge the concern** — price is a legitimate consideration
2. **Reframe to value** — what does the coverage provide vs. the risk of not having it
3. **Offer alternatives** — lower coverage tier, phased entry, or different product
4. **Do NOT invent pricing** — use only confirmed prices from knowledge base
5. If no alternative fits, offer human agent for personalized review

### Known Limitations
- Promotions and pricing change frequently — always reference knowledge base, never fabricate

---

## PATTERN-SALES-001 — Readiness to Buy Recognition

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Customer signals readiness to buy (explicit: "ซื้อได้เลย", "อยากทำ", implicit: asking for next steps, asking for document list).

### Problem
AI misses the buy signal and continues in information-giving mode, or responds with more questions instead of advancing toward handoff.

### Solution
1. Recognize explicit and implicit buy signals
2. Confirm the customer's intent briefly
3. Initiate handoff flow: collect minimum required fields if not already known
4. Generate handoff summary
5. Transfer to human agent with complete context

### Referenced Documents
- `AIOS/Execution/07_MEMORY_ENGINE.md` — Handoff context
- Application handoff documentation

---

## PATTERN-FOLLOW_UP-001 — Post-Trust Follow-Up

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Conversation continues after a trust concern was successfully addressed.

### Problem
After handling a trust concern, AI either:
- Immediately jumps back to lead capture (too soon)
- Forgets the previous context and restarts the conversation

### Solution
1. Wait for customer to signal comfort (explicit: "โอเค เข้าใจแล้ว", implicit: asking a product question)
2. On positive signal: resume from where the conversation was before the trust concern
3. On continued concern: provide additional verification information; do not push
4. On no response: do not proactively re-initiate; wait for customer

### Known Limitations
- Trust recovery time varies by customer; one or two follow-up turns may be needed

---

## PATTERN-FOLLOW_UP-002 — Post-Medical Follow-Up

**Status**: ACTIVE | **Version**: 1.0

### Trigger
Conversation continues after AI answered a medical/underwriting question.

### Problem
After answering a medical question, AI either:
- Asks for personal data immediately (wrong — too soon)
- Stops the conversation entirely (wrong — customer may have more questions)

### Solution
1. After medical response + one medical follow-up question, wait for customer response
2. If customer provides medical details: acknowledge, summarize, and offer human agent review
3. If customer seems ready to proceed: resume product discussion
4. If customer asks another medical question: apply `PATTERN-MEDICAL-001` again

---

## Pattern Governance

### Adding a New Pattern

1. Identify recurring issue (≥ 3 occurrences of similar root cause in Improvement Database)
2. Draft pattern using the schema above
3. Link to at least 2 example issues
4. Submit for Learning Architect review
5. Link to relevant AIOS documents
6. Set status to `DRAFT` until approved
7. After approval: set status to `ACTIVE`

### Deprecating a Pattern

1. Identify that the pattern is no longer needed or has been superseded
2. Create new pattern (if superseding)
3. Add `DEPRECATED` status with reason and link to replacement
4. Archive all references from open issues

---

## Pattern Index

| ID | Name | Category | Status |
|---|---|---|---|
| PATTERN-TRUST-001 | Trust Before Lead | TRUST | ACTIVE |
| PATTERN-MEDICAL-001 | Answer Medical Before Capturing | MEDICAL | ACTIVE |
| PATTERN-LEAD-001 | Lead Timing | LEAD | ACTIVE |
| PATTERN-MEMORY-001 | Known Field Protection | MEMORY | ACTIVE |
| PATTERN-FAQ-001 | Answer From Knowledge | FAQ | ACTIVE |
| PATTERN-DECISION-001 | Priority-First Routing | DECISION | ACTIVE |
| PATTERN-RECOMMENDATION-001 | Appropriate Product Recommendation | RECOMMENDATION | ACTIVE |
| PATTERN-OBJECTION-001 | Price Objection Response | OBJECTION | ACTIVE |
| PATTERN-SALES-001 | Readiness to Buy Recognition | SALES | ACTIVE |
| PATTERN-FOLLOW_UP-001 | Post-Trust Follow-Up | FOLLOW_UP | ACTIVE |
| PATTERN-FOLLOW_UP-002 | Post-Medical Follow-Up | FOLLOW_UP | ACTIVE |

---

## Cross References

- `03_IMPROVEMENT_DATABASE.md` — Issues that generate patterns
- `06_CHANGE_PROPOSAL.md` — Proposals that implement patterns
- `AIOS/Execution/05_DECISION_PIPELINE.md` — Decision patterns implemented here

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release with 11 patterns |
