# 07 — Intelligence Roadmap

**Document ID**: AIOS-INT-07  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect  
**Approved From**: Phase 11.0A Architecture & Capability Audit — Top 20 Recommendations

---

## Purpose

This roadmap converts the Phase 11.0A audit findings into a staged delivery plan for AIOS Intelligence capabilities. Each item is classified as P0 (critical now), P1 (next), P2 (later), or P3 (do not do yet).

This roadmap governs **intelligence layer capabilities only** — not application features, not UI changes, not runtime infrastructure unrelated to intelligence.

---

## Roadmap Principles

1. **No intelligence without SSI clearance** — Every item must pass the 5-gate Architecture Gate before work begins (`01_SINGLE_SOURCE_OF_INTELLIGENCE.md`)
2. **Extend before create** — P0 and P1 items primarily extend existing capabilities
3. **No deployment without Learning Intelligence review** — Every change that modifies ACP, knowledge, or memory rules requires a Change Proposal per `AIOS/Learning/06_CHANGE_PROPOSAL.md`
4. **Human approval for sensitive changes** — All P0 and P1 items touching trust, medical, or recommendation behavior require Human Product Owner sign-off

---

## P0 — DO NOW (Critical — Current Release)

*These are architectural debts or safety gaps. They must be resolved before building P1 capabilities.*

---

### P0-01 — Persist Issue Database to KV

**Intelligence**: Learning Intelligence  
**Gap**: G-20  
**Current state**: `issueDatabase.ts` stores issues in `const _issues: IssueRecord[]` — cleared on every deploy  
**Target state**: Every issue written to `issue:{issueId}` in Vercel KV with TTL 90 days  
**Why now**: The Learning System has no memory. Quality issues observed in production are invisible after the next deployment.  
**Effort**: Small (2-3 hours). Pattern: identical to how `conversationLogger.ts` writes to KV.  
**Owner**: Learning Intelligence → implemented in `runtime-gen1/observability/issueDatabase.ts`  
**Risk if skipped**: All quality intelligence is ephemeral. AIOS cannot learn.

---

### P0-02 — Knowledge Path CI Validation

**Intelligence**: Product Intelligence  
**Gap**: GP-03  
**Current state**: `knowledgeLoader.ts` fails gracefully when a referenced file does not exist. Missing knowledge is invisible to operators.  
**Target state**: CI test that validates all paths in `Knowledge_Path_Registry.md` exist as real files. Build fails on missing knowledge.  
**Why now**: A silent knowledge gap means the LLM receives less context without alerting anyone. Recommendation quality degrades invisibly.  
**Effort**: Small (1-2 hours). Add to `package.json` test chain.  
**Owner**: Product Intelligence → implemented in `__tests__/` knowledge validation test  
**Risk if skipped**: Silent product knowledge gaps in production.

---

### P0-03 — Pattern Library — First 5 Entries

**Intelligence**: Learning Intelligence  
**Gap**: G-19  
**Current state**: `04_PATTERN_LIBRARY.md` defines a complete schema and example PATTERN-TRUST-001. Library is empty in practice.  
**Target state**: Create `AIOS/Learning/PatternLibrary/` directory. Populate 5 patterns from observed conversation behaviors:
- PATTERN-TRUST-001 (Trust Before Lead — from existing spec)
- PATTERN-MEMORY-001 (History Before Re-asking — from gen1-stub-0.9.0 Beta fix)
- PATTERN-MEDICAL-001 (Empathy Before Underwriting)
- PATTERN-SALES-001 (Answer Before Closing)
- PATTERN-DECISION-001 (One Question Per Turn)  
**Why now**: The Pattern Library is the memory of the Learning System. Without populated entries, every quality issue is treated as novel.  
**Effort**: Medium (architecture document creation, no code).  
**Owner**: Learning Intelligence → `AIOS/Learning/PatternLibrary/`  
**Risk if skipped**: Learning System cannot function. Every future issue wastes analysis time re-discovering known patterns.

---

### P0-04 — KV TTL Confirmation and Retention Audit

**Intelligence**: Customer Intelligence, Learning Intelligence  
**Gap**: Operational  
**Current state**: `CONV_TTL_SECONDS = 30 * 24 * 60 * 60 = 2,592,000`. Turn index (`convlog:turns:{conversationId}`) grows with LPUSH without bounded size verification.  
**Target state**: Confirm TTL is applied to all KV keys. Add test that verifies LRANGE is bounded by `limit` parameter. Document retention policy.  
**Why now**: Unbounded KV growth is a cost and operational risk.  
**Effort**: Small.  
**Owner**: Customer Intelligence → `conversationLogger.ts`

---

### P0-05 — Analytics Event Emission Foundation

**Intelligence**: Business Intelligence  
**Gap**: G-11  
**Current state**: AEE-08 defines 30+ events. Gen1 emits one [CONV_LOG] post-turn.  
**Target state**: Implement `emitEvent(eventId, payload)` utility. Emit EVT-P01 (INTENT_DETECTED) and EVT-P06 (DECISION_MADE) as the minimum foundation. Add async, never block response.  
**Why now**: Business Intelligence cannot aggregate anything without events. This is the foundation for all BI capability.  
**Effort**: Medium. New `observability/eventEmitter.ts` module.  
**Owner**: Business Intelligence → `runtime-gen1/observability/eventEmitter.ts`  
**Risk if skipped**: Business Intelligence has no data. KPI tracking is manual.

---

### P0-06 — AIOS Glossary (`30_KB_Glossary.md`)

**Intelligence**: Product Intelligence  
**Gap**: Referenced in `AIOS/Claude.md`; does not exist  
**Target state**: Create `AIOS/KnowledgeBase/30_KB_Glossary.md` with key AIOS terms, intelligence concepts, and domain vocabulary.  
**Effort**: Small (architecture document creation, no code).  
**Owner**: Product Intelligence → `AIOS/KnowledgeBase/`

---

## P1 — DO NEXT (High Value, Bounded Scope)

*These capabilities extend the intelligence layer significantly. Each requires SSI clearance and a bounded implementation scope.*

---

### P1-01 — Emotion Detector (AEE Phase 4)

**Intelligence**: Conversation Intelligence  
**Gap**: G-01  
**Current state**: AEE Step 4 (Emotion Detection) is specified in `Execution/02_EXECUTION_PIPELINE.md` but not implemented. Gen1 skips emotion entirely.  
**Target state**: `runtime-gen1/capability/emotionDetector.ts`. Thai keyword + pattern classifier. Returns `EmotionDetectorResult` with `{ emotion, intensity, evidence }`. Emit EVT-P02.  
**Why next**: Every empathy decision in the current system is based on heuristics from `strategyEngine.ts`. Explicit emotion detection makes empathy deterministic and auditable.  
**Sensitive**: Medium. Emotion classification affects response tone. Requires Learning Intelligence review after first 100 conversations.  
**Owner**: Conversation Intelligence

---

### P1-02 — Goal Detector (AEE Phase 5)

**Intelligence**: Conversation Intelligence  
**Gap**: G-02  
**Current state**: AEE Step 5 (Goal Detection) is specified but not implemented. Intent ≠ goal.  
**Target state**: `runtime-gen1/capability/goalDetector.ts`. Infers persistent customer goal (FIND_PROTECTION, UNDERSTAND_PRODUCT, COMPARE_OPTIONS, etc.) from intent + context signals. Emit EVT-P03.  
**Why next**: Strategy selection accuracy improves when the goal (what they ultimately want) is distinct from the intent (what they said). Prevents premature strategy transitions.  
**Owner**: Conversation Intelligence

---

### P1-03 — CustomerSession Type (Gen1 Session Ownership)

**Intelligence**: Customer Intelligence  
**Gap**: S-08 (Architecture Smell), GP-05  
**Current state**: `RuntimeInput.session: unknown` — Gen1 receives V1 session via `hydrateAll` without type safety.  
**Target state**: Define `CustomerSession` interface in Gen1 types. Implement Gen1-native session hydration from KV. Deprecate V1 `hydrateAll`.  
**Why next**: This is an active type lie and V1 dependency. It blocks full Gen1 independence.  
**Owner**: Customer Intelligence

---

### P1-04 — Learning Pattern Recognition Engine (Basic)

**Intelligence**: Learning Intelligence  
**Gap**: G-10  
**Current state**: Audit queue is written to KV. No component reads it and produces patterns.  
**Target state**: Basic pattern matcher that reads `audit:{auditId}` from KV, classifies against existing Pattern Library entries, and flags matching patterns in the issue record. Human reviews all flags.  
**Why next**: Closes the feedback loop from observability to learning. The Learning System currently generates data it cannot process.  
**Owner**: Learning Intelligence

---

### P1-05 — Long-term Memory (AEE Layer 4 — Cross-Session Profile)

**Intelligence**: Customer Intelligence  
**Gap**: G-18  
**Current state**: Customer profile is reconstructed from `conversationHistory` (last 10 turns, 30-day TTL). No persistent profile across sessions beyond raw turn logs.  
**Target state**: Aggregate customer profile from all stored turns. Write `customer:profile:{userId}` to KV with 180-day TTL. Merge with current session facts. Memory Layer 4 per `Execution/07_MEMORY_ENGINE.md`.  
**Why next**: Returning customers should not re-introduce themselves. Cross-session memory is foundational to a genuine advisor relationship.  
**Owner**: Customer Intelligence

---

### P1-06 — Advisor Intelligence Formalization

**Intelligence**: Advisor Intelligence  
**Gap**: Not yet formalized  
**Current state**: ACP-17 and CAP-007 exist; handoff is implemented. Advisor Intelligence has no formal specification document.  
**Target state**: Create `AIOS/Intelligence/AdvisorIntelligence/` (or equivalent) with Handoff Quality Schema, Advisor Brief template, and Coaching Package structure.  
**Why next**: Advisor Intelligence is P1 because human advisors are the final revenue gate. Poor handoff quality directly affects conversion.  
**Owner**: Advisor Intelligence

---

### P1-07 — Decision Rules → ACP-Driven (Migration Start)

**Intelligence**: All (SSI-05)  
**Gap**: S-04 (Architecture Smell)  
**Current state**: `decisionRules.ts` contains hardcoded business logic.  
**Target state**: Begin migrating hardcoded rules to ACP Decision_Rules.md documents. Decision Engine reads from ACP documents at startup. Start with 3 rules as proof of concept.  
**Why next**: Business decisions require a code deploy to change. This violates the architecture principle that governance should be separate from implementation.  
**Owner**: Chief AI Architect → `runtime-gen1/decision/` + ACP documents  
**Sensitive**: HIGH. Any change to decision rules requires Human Product Owner approval and full regression test.

---

## P2 — DO LATER (Medium Value, Architectural Evolution)

*These capabilities build on P0 and P1 foundations. Premature implementation before P1 is complete will create waste.*

---

### P2-01 — Product Suitability Matrix

**Intelligence**: Product Intelligence  
**Gap**: G-08  
**Description**: Structured mapping from CustomerProfile attributes (age, health, budget, goal) to ranked product recommendations. Replaces heuristic recommendations in ACP-09 with a data-driven matrix.  
**Dependency**: P1-03 (CustomerSession type needed for full profile), P1-05 (Long-term memory needed for returning customer profile)

---

### P2-02 — Customer Journey Tracker

**Intelligence**: Customer Intelligence  
**Gap**: G-03  
**Description**: Maps each customer's stage progression across multiple sessions. Answers: "Where in the funnel is this customer, and how long have they been there?"  
**Dependency**: P1-05 (Long-term Memory), P0-05 (Event emission foundation)

---

### P2-03 — Commercial Opportunity Detector

**Intelligence**: Commercial Intelligence  
**Gap**: G-05  
**Description**: Detects upsell, cross-sell, and portfolio gap signals from conversation context. Informs Advisor Intelligence at handoff.  
**Dependency**: P2-01 (Product Suitability Matrix), P2-02 (Customer Journey Tracker)

---

### P2-04 — Analytics Event Aggregation

**Intelligence**: Business Intelligence  
**Gap**: G-11 (full implementation)  
**Description**: Aggregate per-step events into daily/weekly KPI reports. Requires event emitter (P0-05) and sufficient event volume for meaningful aggregation.  
**Dependency**: P0-05 (event emission foundation)

---

### P2-05 — StrategyRegistry from ACP Conversation_Map

**Intelligence**: Conversation Intelligence  
**Gap**: S-06 (Architecture Smell)  
**Description**: Auto-generate or loader-populate `strategyRegistry.ts` entries from ACP `Conversation_Map.md` documents. Closes spec/code divergence.  
**Dependency**: P1-07 (ACP-driven decision rules as proof-of-concept)

---

### P2-06 — Knowledge Freshness Tracker

**Intelligence**: Product Intelligence  
**Gap**: G-07  
**Description**: Track `lastReviewedAt` per knowledge document. Flag documents older than threshold. Alert Product Intelligence owner.  
**Dependency**: P0-02 (Knowledge Path CI validation)

---

## P3 — DO NOT DO YET

*These capabilities are valuable but require earlier layers to be stable and producing data. Building them now would be premature.*

---

### P3-01 — Advisor Coaching Package

**Intelligence**: Advisor Intelligence  
**Gap**: G-14  
**Description**: AI-generated insights about the customer type, objection patterns, and successful conversation strategies — delivered to the human advisor alongside the handoff context.  
**Dependency**: P1-06 (Advisor Intelligence formalization), P1-04 (Pattern Recognition Engine), sufficient Pattern Library content

---

### P3-02 — Tacit Knowledge Capture

**Intelligence**: Advisor Intelligence + Product Intelligence  
**Gap**: G-15  
**Description**: Structured process to capture the advisor's undocumented expertise (Jirawat's real-world insurance knowledge) into reusable AIOS knowledge artifacts.  
**Dependency**: P2-06 (Knowledge Freshness), P1-04 (Learning Pattern Engine — to identify gaps)

---

### P3-03 — Post-Handoff Feedback Loop

**Intelligence**: Advisor Intelligence → Learning Intelligence  
**Gap**: G-17  
**Description**: Human advisor records post-handoff outcome (converted, nurturing, lost). Outcome feeds Learning Intelligence as a labeled training signal.  
**Dependency**: P1-06 (Advisor Intelligence formalization), external CRM integration

---

### P3-04 — Revenue Forecasting

**Intelligence**: Commercial Intelligence + Business Intelligence  
**Gap**: G-06  
**Description**: Predict revenue potential from current lead pipeline. Requires substantial data accumulation (minimum 6 months of KPI data).  
**Dependency**: P2-04 (Analytics Event Aggregation), P2-02 (Customer Journey Tracker), 6+ months of data

---

### P3-05 — Business Intelligence Dashboard

**Intelligence**: Business Intelligence  
**Gap**: G-13  
**Description**: Operational dashboard for Human Product Owner. Displays KPIs, conversation quality, lead pipeline, product demand.  
**Dependency**: P2-04 (Event Aggregation), P0-05 (Event foundation), sustained data volume  
**Note**: Dashboard is an application concern (`Applications/`), not a platform intelligence concern. BI intelligence owns the data model; an application surfaces it.

---

## Roadmap Summary Table

| ID | Item | Intelligence | Priority | Dependency |
|---|---|---|---|---|
| P0-01 | Issue DB → KV | Learning | P0 | None |
| P0-02 | Knowledge CI validation | Product | P0 | None |
| P0-03 | Pattern Library first 5 entries | Learning | P0 | None |
| P0-04 | KV TTL audit | Customer | P0 | None |
| P0-05 | Analytics event emitter foundation | Business | P0 | None |
| P0-06 | AIOS Glossary | Product | P0 | None |
| P1-01 | Emotion Detector | Conversation | P1 | P0-05 |
| P1-02 | Goal Detector | Conversation | P1 | P1-01 |
| P1-03 | CustomerSession type | Customer | P1 | None |
| P1-04 | Pattern Recognition Engine | Learning | P1 | P0-01, P0-03 |
| P1-05 | Long-term Memory | Customer | P1 | P1-03 |
| P1-06 | Advisor Intelligence formalization | Advisor | P1 | None |
| P1-07 | Decision Rules → ACP-driven | All | P1 | None |
| P2-01 | Product Suitability Matrix | Product | P2 | P1-03, P1-05 |
| P2-02 | Customer Journey Tracker | Customer | P2 | P1-05, P0-05 |
| P2-03 | Commercial Opportunity Detector | Commercial | P2 | P2-01, P2-02 |
| P2-04 | Analytics Event Aggregation | Business | P2 | P0-05 |
| P2-05 | StrategyRegistry from ACP | Conversation | P2 | P1-07 |
| P2-06 | Knowledge Freshness Tracker | Product | P2 | P0-02 |
| P3-01 | Advisor Coaching Package | Advisor | P3 | P1-06, P1-04 |
| P3-02 | Tacit Knowledge Capture | Advisor + Product | P3 | P2-06, P1-04 |
| P3-03 | Post-Handoff Feedback Loop | Advisor + Learning | P3 | P1-06, CRM |
| P3-04 | Revenue Forecasting | Commercial + BI | P3 | P2-04, 6mo data |
| P3-05 | BI Dashboard | Business | P3 | P2-04 |
