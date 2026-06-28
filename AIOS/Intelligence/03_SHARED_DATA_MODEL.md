# 03 — Shared Data Model

**Document ID**: AIOS-INT-03  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect

---

## Purpose

This document defines the conceptual data model shared across all 7 AIOS intelligence domains. These are **architecture-level concepts**, not runtime type definitions.

Do not duplicate runtime type definitions from `runtime-gen1/core/types.ts` or `runtime-gen1/memory/memoryTypes.ts` here. This document describes *what* these concepts mean in business terms — not how they are implemented.

These concepts apply regardless of domain (Insurance, Tax, Investment, Healthcare) and regardless of channel (LINE, Web, Voice).

---

## 1. Customer

**Definition**: A person interacting with an AIOS-powered advisor. The customer may be anonymous (unknown) or identified (known).

**Key properties:**
- `identity` — known (has userId, possibly CRM record) or anonymous
- `channel` — how they are interacting (LINE, web, voice)
- `stage` — where they are in the customer lifecycle (see `04_SHARED_STATE_MACHINE.md`)
- `profile` — accumulated knowledge about this customer (see Customer Intelligence)
- `history` — prior conversations (cross-session)

**Owner**: Customer Intelligence

**Note**: The runtime type is `RuntimeInput.userId` + `CustomerProfile` in `memoryTypes.ts`. This conceptual definition includes the lifecycle and history dimensions that the runtime type does not yet fully capture.

---

## 2. Conversation

**Definition**: A bounded interaction between a customer and AIOS within a single channel session. A conversation consists of one or more turns.

**Key properties:**
- `conversationId` — unique identifier (`userId + date` in current implementation)
- `channel` — where the conversation is happening
- `startTime`, `endTime`
- `turns` — ordered list of turns (oldest first)
- `stage` — the customer's journey stage at the time
- `outcome` — what happened (handoff, self-serve resolution, drop-off, etc.)

**Owner**: Conversation Intelligence (orchestrates); Learning Intelligence (audits)

---

## 3. Turn

**Definition**: A single exchange within a conversation — one customer message and one AI response. The atomic unit of AIOS execution.

**Key properties:**
- `sessionId` — unique turn identifier
- `userMessage` — the raw customer input
- `assistantResponse` — the generated AI response
- `intent` — detected intent for this turn
- `emotion` — detected emotion for this turn (future)
- `goal` — inferred goal for this turn (future)
- `decision` — what action was taken (ACT-01 to ACT-12)
- `strategy` — conversation strategy applied
- `latency` — processing time

**Owner**: Conversation Intelligence (processes); Customer Intelligence (persists and loads history); Learning Intelligence (audits)

**Runtime**: Implemented as `ConversationTurnContext` in `runtime-gen1/core/types.ts` and `ConversationLogEntry` in `conversationLogger.ts`.

---

## 4. Session

**Definition**: The stateful KV-persisted record of a customer's current conversation, including captured fields, active states, and context flags.

**Key properties:**
- `sessionId` — channel-specific session identifier
- `turnCount` — number of turns in this session
- `activeState` — current state machine state
- `capturedFields` — lead fields collected so far
- `trustActive` — whether a trust concern is active
- `medicalActive` — whether a medical disclosure is active

**Owner**: Customer Intelligence

**Current gap**: `RuntimeInput.session: unknown` — V1 `hydrateAll` partially owns session. Target: `CustomerSession` type fully owned by Gen1 Customer Intelligence.

---

## 5. Intent

**Definition**: A structured classification of what the customer is trying to accomplish, derived from their message.

**Key properties:**
- `primary` — the dominant intent (e.g., product inquiry, trust concern, medical question)
- `confidence` — how certain the classification is (0.0–1.0)
- `secondary` — additional intents detected in the same message
- `flags` — special signals (isTrustSignal, isMedicalSignal, isEmergency, isHumanRequest)

**Owner**: Conversation Intelligence (SSI-02)

**Runtime**: `IntentDetectorResult` in `runtime-gen1/capability/intentDetector.ts`

---

## 6. Emotion

**Definition**: The emotional state of the customer as inferred from their message — distinct from intent (what they want) and goal (what outcome they seek).

**Key properties:**
- `primary` — dominant emotion: NEUTRAL, CURIOUS, ANXIOUS, FRUSTRATED, TRUSTING, SUSPICIOUS
- `intensity` — LOW, MEDIUM, HIGH
- `trigger` — what in the message produced this emotion classification

**Owner**: Conversation Intelligence

**Current status**: Specified in `AIOS/Execution/02_EXECUTION_PIPELINE.md` Step 4 (EVT-P02). **Not yet implemented** in Gen1. Gap G-01.

---

## 7. Goal

**Definition**: What outcome the customer is ultimately seeking — distinct from intent (what they asked) and emotion (how they feel). A goal persists across turns; intent may change turn-by-turn.

**Key properties:**
- `primary` — e.g., FIND_PROTECTION, UNDERSTAND_PRODUCT, COMPARE_OPTIONS, GET_HELP, VERIFY_ADVISOR
- `confidence` — inference confidence
- `derivedFrom` — which intent signals and context contributed to this inference

**Owner**: Conversation Intelligence

**Current status**: Specified in `AIOS/Execution/02_EXECUTION_PIPELINE.md` Step 5 (EVT-P03). **Not yet implemented** in Gen1. Gap G-02.

---

## 8. Stage

**Definition**: Where the customer is in their advisory journey — their maturity and readiness relative to a decision. Stages are independent of channel and domain.

**See**: `04_SHARED_STATE_MACHINE.md` for the complete stage model.

**Owner**: Customer Intelligence (tracks), Conversation Intelligence (uses to select strategy), Commercial Intelligence (uses to determine action)

---

## 9. Signal

**Definition**: A discrete event observed during a conversation that indicates customer behavior, intent, readiness, or concern. Signals are inputs to intelligence domain decisions.

**Key properties:**
- `type` — signal category (see `05_SHARED_SIGNAL_FRAMEWORK.md`)
- `strength` — LOW, MEDIUM, HIGH
- `turn` — which turn produced this signal
- `evidence` — the text or pattern that triggered this signal

**Owner**: Depends on signal type — see `05_SHARED_SIGNAL_FRAMEWORK.md`

---

## 10. Product

**Definition**: A domain-specific advisory offering (insurance product, investment fund, tax strategy, healthcare plan, etc.) that AIOS can educate about, compare, and recommend.

**Key properties:**
- `productId` — platform identifier
- `name` — human-readable name
- `domain` — which advisory domain this belongs to
- `suitabilityFactors` — which customer attributes determine relevance
- `knowledgePath` — where the authoritative knowledge document lives

**Owner**: Product Intelligence

**Current implementation**: Knowledge files in `AIOS/Domains/Insurance/Products/`, mapped via `AIOS/AIRR/Knowledge_Path_Registry.md`

---

## 11. Recommendation

**Definition**: A specific product or action that AIOS proposes to a customer based on their profile, goals, and context.

**Key properties:**
- `product` — what is being recommended
- `rationale` — why this product fits this customer
- `confidence` — how well the customer profile matches
- `turn` — when it was delivered
- `accepted` — whether the customer responded positively (tracked for learning)

**Owner**: Commercial Intelligence

**Runtime**: Decision action ACT-05 RECOMMEND, governed by ACP-09 RECOMMENDATION_ENGINE

---

## 12. Lead

**Definition**: A customer who has provided at least one piece of contact or qualifying information, creating a commercial relationship record.

**Key properties:**
- `fields` — captured data (name, phone, age, budget, product_interest, etc.)
- `score` — computed lead quality (0-100)
- `status` — lifecycle stage (UNKNOWN → AWARE → INTERESTED → CONSIDERING → QUALIFIED → READY → HANDOFF)
- `capturedAt` — when lead data was first captured

**Owner**: Commercial Intelligence (score and status); Customer Intelligence (stores fields in profile)

**Reference**: `AIOS/Domains/Insurance/Lead/` (3 documents: Capture, Scoring, Status)

---

## 13. Opportunity

**Definition**: A detected commercial signal indicating that a customer may benefit from an additional or different product beyond what they explicitly asked about.

**Key properties:**
- `type` — UPSELL, CROSS_SELL, REPLACEMENT, PORTFOLIO_GAP
- `product` — the opportunity product
- `signal` — which conversation signal triggered this
- `strength` — LOW, MEDIUM, HIGH
- `detectedAt` — turn number

**Owner**: Commercial Intelligence

**Current status**: **Not yet implemented** — Gap G-05.

---

## 14. Handoff

**Definition**: The event at which AIOS transfers the conversation to a human advisor, delivering a structured context package.

**Key properties:**
- `trigger` — why handoff was initiated (customer request, qualification threshold, emergency, etc.)
- `customerProfile` — complete profile at time of handoff
- `leadScore` — score at time of handoff
- `conversationSummary` — what was discussed
- `advisorBrief` — what the human advisor needs to know
- `qualityScore` — how complete and useful the context package is (future)

**Owner**: Advisor Intelligence

**Reference**: `AIOS/CapabilityPackages/ACP-17_HUMAN_HANDOFF/`, `AIOS/Domains/Insurance/Human/`

---

## 15. Issue

**Definition**: A documented quality problem identified in a conversation, classified by severity and category, with a proposed fix path.

**Key properties:**
- `issueId` — unique identifier (ISSUE-NNNN)
- `conversationId` — source conversation
- `category` — type of quality issue (intent, memory, recommendation, trust, medical, etc.)
- `severity` — P0 to P3
- `expectedBehavior` — what should have happened
- `actualBehavior` — what happened
- `rootCause` — RC taxonomy classification
- `status` — OPEN, IN_PROGRESS, RESOLVED, WONT_FIX

**Owner**: Learning Intelligence

**Runtime**: `runtime-gen1/observability/issueDatabase.ts` (currently in-memory; needs KV persistence — Gap G-20)

---

## 16. Pattern

**Definition**: A reusable classification of a recurring quality issue with a proven solution template. Patterns allow Learning Intelligence to apply known fixes without re-analyzing each case from scratch.

**Key properties:**
- `patternId` — PATTERN-[CATEGORY]-NNN
- `trigger` — conditions that activate this pattern
- `problem` — what breaks when pattern is violated
- `solution` — correct behavior
- `category` — TRUST, MEDICAL, SALES, MEMORY, LEAD, DECISION, RECOMMENDATION, etc.

**Owner**: Learning Intelligence

**Reference**: `AIOS/Learning/04_PATTERN_LIBRARY.md` (schema defined; library empty — Gap G-19)

---

## 17. Proposal

**Definition**: A formal request to change AIOS capability, knowledge, or behavior — derived from one or more patterns, referencing originating conversations.

**Key properties:**
- `proposalId` — PROPOSAL-YYYYMMDD-NNN
- `status` — DRAFT → READY_FOR_REVIEW → APPROVED → IMPLEMENTED → CLOSED
- `affectedComponents` — which AIOS documents or capabilities would change
- `originConversationIds` — evidence base
- `approver` — human approver name + date

**Owner**: Learning Intelligence

**Reference**: `AIOS/Learning/06_CHANGE_PROPOSAL.md`

---

## 18. Business Outcome

**Definition**: A measurable result at the platform or business level, derived from aggregating events across many conversations.

**Key properties:**
- `metric` — which KPI this outcome measures (lead capture rate, qualification rate, handoff rate, etc.)
- `period` — measurement window (daily, weekly, monthly)
- `value` — the measured value
- `target` — the defined target
- `delta` — change from previous period

**Owner**: Business Intelligence

**Reference**: `Applications/Line_Chatbot_AI/Analytics/KPI.md` (application-level; to be consolidated under Business Intelligence)
