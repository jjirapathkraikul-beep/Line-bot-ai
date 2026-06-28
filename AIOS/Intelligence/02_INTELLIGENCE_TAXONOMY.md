# 02 — Intelligence Taxonomy

**Document ID**: AIOS-INT-02  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect  
**Approved From**: Phase 11.0A Architecture & Capability Audit

---

## Overview

AIOS intelligence is organized into 7 domains. Each domain has a singular mission, clear owned capabilities, explicit consumed capabilities, and defined success metrics.

These domains are **domain-independent** — they apply regardless of whether AIOS is serving Insurance, Tax, Investment, Healthcare, or any other advisory vertical.

---

## Intelligence 1 — Conversation Intelligence

**Mission**: Orchestrate the full conversation experience — from turn-by-turn routing and strategy selection to multi-turn pattern continuity.

**Primary Question Answered**: *What is this conversation about, and how should it flow right now?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Intent Detection | Implemented | `runtime-gen1/capability/intentDetector.ts` |
| Conversation Strategy Selection | Implemented | `runtime-gen1/conversation/strategyEngine.ts` |
| Strategy Registry (10 strategies) | Implemented | `runtime-gen1/conversation/strategyRegistry.ts` |
| Topic Shift Detection | Implemented | `strategyEngine.ts` (detectTopicShift) |
| Conversation Routing (CAP-001) | Implemented | Capability Loader + ACP-01 |
| Need Discovery (ACP-10) | Specified | `CapabilityPackages/ACP-10_NEED_DISCOVERY/` |
| Edge Case Handling (ACP-20) | Implemented | `CapabilityPackages/ACP-20_EDGE_CASE_HANDLER/` |
| Conversation Dataset (20 scenarios) | Active | `AIOS/ConversationDataset/` |
| Conversation Patterns (CP-01 to CP-10) | Active | `ConversationDataset/20_CONVERSATION_PATTERNS.md` |
| Emotion Detection | **Gap — not yet implemented** | Specified in `Execution/02_EXECUTION_PIPELINE.md` Step 4 |
| Goal Detection | **Gap — not yet implemented** | Specified in `Execution/02_EXECUTION_PIPELINE.md` Step 5 |
| Conversation Success Scoring | **Gap** | — |

### Consumed Capabilities

| Capability | From |
|---|---|
| Customer profile, trust state, known fields | Customer Intelligence |
| Product knowledge selection | Product Intelligence |
| Lead state, commercial signals | Commercial Intelligence |
| Approved conversation patterns | Learning Intelligence |

### Inputs
- Raw customer message
- Session state (from Customer Intelligence)
- Prior turns (conversation history from Customer Intelligence)
- Active ACP selection (from AEE Capability Loader)

### Outputs
- Detected intent + confidence
- Detected emotion (future)
- Inferred goal (future)
- Selected conversation strategy
- Conversation health signal

### Success Metrics
- Intent classification accuracy ≥ 90%
- Strategy-to-outcome alignment (measured by Learning Intelligence)
- Conversation health score ≥ 4.0/5.0
- Topic shift recovery rate ≥ 95%

### Interactions with Other Intelligences
- **Produces for** Customer Intelligence: detected intent triggers memory resolution
- **Produces for** Commercial Intelligence: product intent and buying signals trigger lead evaluation
- **Consumes from** Learning Intelligence: approved conversation patterns inform strategy selection
- **Reports to** Business Intelligence: strategy selection events (EVT-P01, EVT-P06)

---

## Intelligence 2 — Customer Intelligence

**Mission**: Build and maintain a complete, persistent understanding of each customer — across turns, sessions, and time.

**Primary Question Answered**: *Who is this customer and what do we know about them right now?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Memory Resolution (5 layers) | Layers 1-2 implemented; Layers 3-5 partial | `runtime-gen1/memory/memoryResolver.ts`, `ContextEngine/07_MEMORY_RESOLUTION.md` |
| Trust Profile | Implemented | `memoryResolver.ts` (trustMemory) |
| Medical Profile | Implemented | `memoryResolver.ts` (medicalConditions, riskProfile) |
| Lead Profile (age, gender, budget, phone) | Implemented | `memoryResolver.ts` (customerProfile, knownFields) |
| Conversation History Loading | Implemented | `conversationLogger.ts` → `runtime.ts` |
| Session Hydration | Partial — `RuntimeInput.session: unknown` | Target: `CustomerSession` type in Gen1 |
| Long-term Memory | **Gap** | Specified in `Execution/07_MEMORY_ENGINE.md` Layer 4 |
| CRM Memory | Partial — V1 only | Specified in `Execution/07_MEMORY_ENGINE.md` Layer 5 |
| Customer Journey Mapping | **Gap** | — |
| Next Best Action (per-customer) | **Gap** | — |
| Life Stage Inference | **Gap** | — |
| Trust Logic (SSI-06) | Implemented | See SSI-06 |

### Consumed Capabilities

| Capability | From |
|---|---|
| Detected intent | Conversation Intelligence |
| Handoff trigger | Advisor Intelligence |
| Lead score | Commercial Intelligence |
| Analytics events | Business Intelligence |

### Inputs
- All conversation turns (current + history from KV)
- Session KV state
- CRM records (returning customers)
- Detected intent, emotion, goal (from Conversation Intelligence)

### Outputs
- `CustomerProfile` (all known fields, confidence)
- `knownFields` list (prevents re-asking)
- `missingFields` list (what to discover next)
- Trust state (active concern, turns since concern)
- Medical state (conditions disclosed, disclaimer required)
- `nextBestField` (what to ask next)

### Success Metrics
- Re-ask rate: target 0% (never ask a question answered in history)
- Profile completeness at handoff ≥ 80%
- Trust state accuracy: 0 lead capture actions during active trust concern
- Memory resolution latency: < 20ms

### Interactions with Other Intelligences
- **Produces for** Conversation Intelligence: memory state drives strategy selection
- **Produces for** Commercial Intelligence: lead profile feeds lead scoring; trust state gates lead capture
- **Produces for** Advisor Intelligence: full profile at handoff
- **Produces for** Decision Engine: knownFields, missingFields, trustActive, medicalActive
- **Reports to** Business Intelligence: memory resolution events, trust events (EVT-T01)

---

## Intelligence 3 — Commercial Intelligence

**Mission**: Convert qualified conversations into commercial outcomes through accurate recommendations, lead management, and opportunity detection.

**Primary Question Answered**: *What is the commercial potential of this conversation, and what action leads to conversion?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Product Recommendation Engine (ACP-09) | Implemented | `CapabilityPackages/ACP-09_RECOMMENDATION_ENGINE/` |
| Lead Capture (ACP-11, CAP-003) | Implemented | `CapabilityPackages/ACP-11_LEAD_CAPTURE/` |
| Closing Logic (ACP-19) | Specified | `CapabilityPackages/ACP-19_CLOSING/` |
| Price Objection Handling (ACP-13) | Implemented | `CapabilityPackages/ACP-13_PRICE_OBJECTION/` |
| Existing Policy Handling (ACP-14) | Specified | `CapabilityPackages/ACP-14_EXISTING_POLICY/` |
| Lead Scoring (SSI-04) | Defined | `Domains/Insurance/Lead/Lead_Scoring.md` |
| Lead Status Taxonomy | Defined | `Domains/Insurance/Lead/Lead_Status.md` |
| Sales Knowledge | Active | `Domains/Insurance/Sales/` (4 docs) |
| Recommendation Knowledge | Active | `Domains/Insurance/Recommendation/` (3 docs) |
| Commercial Opportunity Detection | **Gap** | — |
| Commercial Signal Classification | **Gap** | — |
| Pipeline Value Calculation | **Gap** | — |
| Lost Opportunity Tracking | Partial | `Applications/Line_Chatbot_AI/Analytics/` |

### Consumed Capabilities

| Capability | From |
|---|---|
| Customer profile (age, budget, product interest) | Customer Intelligence |
| Trust state (lead capture gate) | Customer Intelligence |
| Product knowledge (products to recommend) | Product Intelligence |
| Conversation strategy (COLLECT_LEAD, RECOMMEND) | Conversation Intelligence |

### Inputs
- CustomerProfile with knownFields
- Trust state (must be safe before lead capture)
- Detected product intent
- Current conversation strategy
- Product knowledge snippets

### Outputs
- Lead score (0-100)
- Recommended action (ACT-05 RECOMMEND, ACT-08 COLLECT_LEAD, ACT-09 CLOSE)
- Commercial signal (buying intent, objection, comparison)
- Opportunity flag (upsell/cross-sell)

### Success Metrics
- Lead qualification rate ≥ 30% of engaged leads
- Handoff rate ≥ 80% of qualified leads
- Average lead score at handoff ≥ 60
- Recommendation acceptance rate (tracked by Learning Intelligence)

### Interactions with Other Intelligences
- **Consumes from** Customer Intelligence: profile, trust state
- **Consumes from** Product Intelligence: product knowledge for recommendations
- **Produces for** Advisor Intelligence: lead score and commercial context at handoff
- **Reports to** Business Intelligence: lead events (EVT-L01 to EVT-L06)
- **Feeds** Learning Intelligence: failed recommendations as issues

---

## Intelligence 4 — Product Intelligence

**Mission**: Provide accurate, current, and contextually relevant domain knowledge to every conversation turn.

**Primary Question Answered**: *What product knowledge is relevant, accurate, and complete for this specific customer context?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Product Knowledge Base | Active | `AIOS/Domains/Insurance/Products/` (6 files) |
| Domain Knowledge Base | Active | `AIOS/Domains/Insurance/Knowledge/` (6 files) |
| Knowledge Path Registry | Active | `AIOS/AIRR/Knowledge_Path_Registry.md` |
| Knowledge Resolution | Implemented | `runtime-gen1/knowledge/knowledgeResolver.ts` |
| Knowledge Registry (intent-to-path mapping) | Implemented | `runtime-gen1/knowledge/knowledgeRegistry.ts` |
| Mandatory Knowledge Fragments | Implemented | Medical uncertainty + investment risk (synthetic) |
| Product Comparison (ACP-12) | Specified | `CapabilityPackages/ACP-12_PRODUCT_COMPARISON/` |
| ACP-02 Health Advisor | Specified + Knowledge exists | `CapabilityPackages/ACP-02_HEALTH_ADVISOR/` |
| ACP-03 Cancer Advisor | Specified + Knowledge exists | `CapabilityPackages/ACP-03_CANCER_ADVISOR/` |
| ACP-04 Medical Advisor | Specified + Knowledge exists | `CapabilityPackages/ACP-04_MEDICAL_ADVISOR/` |
| ACP-05 Tax Advisor | Specified | `CapabilityPackages/ACP-05_TAX_ADVISOR/` |
| ACP-06 Retirement Advisor | Specified | `CapabilityPackages/ACP-06_RETIREMENT_ADVISOR/` |
| ACP-07 Investment Advisor | Specified | `CapabilityPackages/ACP-07_INVESTMENT_ADVISOR/` |
| Product Suitability Matrix | **Gap** | — |
| Knowledge Freshness Tracking | **Gap** | — |
| AIOS Glossary (`30_KB_Glossary.md`) | **Gap** | Referenced in Claude.md; does not exist |

### Consumed Capabilities

| Capability | From |
|---|---|
| Detected intent (which knowledge to load) | Conversation Intelligence |
| Customer profile (age, health, budget) | Customer Intelligence |
| ACP selection | AEE Capability Loader |

### Inputs
- Detected intent + secondary intents
- Customer age, health conditions, budget (for knowledge selection)
- Active ACP (determines which Knowledge_Map to consult)

### Outputs
- Ranked knowledge snippets with relevance scores
- Mandatory fragments (always included when applicable)
- Knowledge trace (which sources loaded, which were unavailable)
- Suitability score per product (future)

### Success Metrics
- Knowledge hit rate: correct snippet selected ≥ 95% of turns
- Knowledge staleness: ≤ 90 days since last review per document
- Zero hallucinated product facts (measured by Learning Intelligence)
- Mandatory fragment inclusion: 100% of applicable turns

### Interactions with Other Intelligences
- **Produces for** Conversation Intelligence: knowledge context for strategy
- **Produces for** Commercial Intelligence: product knowledge for recommendations
- **Produces for** Advisor Intelligence: product summary at handoff
- **Reports to** Learning Intelligence: knowledge gaps (when file not found)
- **Reports to** Business Intelligence: knowledge resolution events (EVT-P05)

---

## Intelligence 5 — Learning Intelligence

**Mission**: Continuously improve AIOS from real conversations, governed by human oversight and traceable from conversation to release.

**Primary Question Answered**: *What quality issues exist, what patterns explain them, and what changes would improve the platform?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Learning Philosophy | Active | `AIOS/Learning/01_LEARNING_PHILOSOPHY.md` |
| Conversation Audit Schema | Active | `AIOS/Learning/02_CONVERSATION_AUDIT.md` |
| Improvement Database | Active | `AIOS/Learning/03_IMPROVEMENT_DATABASE.md` |
| Pattern Library (schema) | Active (empty) | `AIOS/Learning/04_PATTERN_LIBRARY.md` |
| Root Cause Analysis | Active | `AIOS/Learning/05_ROOT_CAUSE_ANALYSIS.md` |
| Change Proposal Lifecycle | Active | `AIOS/Learning/06_CHANGE_PROPOSAL.md` |
| Acceptance Process | Active | `AIOS/Learning/07_ACCEPTANCE_PROCESS.md` |
| Learning Metrics | Active | `AIOS/Learning/08_LEARNING_METRICS.md` |
| Conversation Logger (runtime) | Implemented | `runtime-gen1/observability/conversationLogger.ts` |
| Audit Queue (runtime) | Implemented | `runtime-gen1/observability/auditQueue.ts` |
| Issue Database (runtime) | Implemented (in-memory) | `runtime-gen1/observability/issueDatabase.ts` |
| Pattern Recognition Engine | **Gap** | — |
| Automated Audit Scorer | **Gap** | — |
| Learning Proposal Engine | **Gap** | — |
| Pattern Library (content) | **Gap — empty** | 0 patterns populated |

### Consumed Capabilities

| Capability | From |
|---|---|
| Conversation logs | Customer Intelligence + Observability |
| Analytics events | Business Intelligence |
| Issue reports | All intelligence domains |
| Human approvals | Human Product Owner |

### Inputs
- Conversation turn logs (all 26 fields per turn, from KV)
- Audit queue records
- Human-flagged issues
- Analytics events

### Outputs
- Quality scores per conversation
- Detected patterns (matched against Pattern Library)
- Change Proposals (draft, for human review)
- Approved AIOS improvements → feed all other intelligence domains
- Release notes per improvement cycle

### Success Metrics
- Learning velocity: ≥ 1 approved change per month
- Pattern reuse rate (same pattern applied to multiple issues)
- Issue resolution time: P0 ≤ 24h, P1 ≤ 1 week
- Regression rate: 0 approved changes that introduce new issues
- Traceability completeness: 100% of deployed changes have ConversationID → ChangeID chain

### Interactions with Other Intelligences
- **Consumes from** all intelligences: conversation logs, events, issues
- **Produces for** all intelligences: approved patterns and improvements
- **Requires** Human Product Owner approval for all proposed changes
- **Feeds back** Conversation Intelligence: new conversation patterns
- **Feeds back** Product Intelligence: updated knowledge documents
- **Feeds back** Customer Intelligence: improved memory extraction rules

---

## Intelligence 6 — Business Intelligence

**Mission**: Provide comprehensive visibility into AIOS operational health, conversation quality, and business outcomes.

**Primary Question Answered**: *How is AIOS performing, and what business outcomes is it generating?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Analytics Event Taxonomy | Specified | `AIOS/Execution/08_ANALYTICS_ENGINE.md` (EVT-P, EVT-L, EVT-T) |
| KPI Definitions | Active | `Applications/Line_Chatbot_AI/Analytics/KPI.md` (move to platform) |
| Runtime Metrics | Implemented | `runtime-gen1/analytics/runtimeMetrics.ts` |
| Conversation Quality KPIs | Defined | KPI.md → to be owned by BI |
| Lead Pipeline KPIs | Defined | KPI.md → to be owned by BI |
| Lost Opportunity Analysis | Active | `Applications/Line_Chatbot_AI/Analytics/` |
| Analytics Event Emitter | **Gap** | AEE-08 specified; not yet emitting per-step events |
| Event Aggregation Layer | **Gap** | — |
| Business Health Score | **Gap** | — |
| Alerting Rules | **Gap** | — |

### Consumed Capabilities

| Capability | From |
|---|---|
| All analytics events (EVT-P, EVT-L, EVT-T) | All intelligence domains emitting per pipeline step |
| Learning metrics | Learning Intelligence |
| Runtime performance | Observability layer |

### Inputs
- Per-step analytics events from all pipeline steps
- Conversation logs (post-turn)
- Learning quality scores

### Outputs
- Aggregated KPI reports (conversation quality, lead pipeline, integration reliability)
- Business Health Score
- Anomaly alerts (when metrics cross thresholds)
- Executive summary (daily/weekly)

### Success Metrics
- Event coverage: ≥ 90% of pipeline steps emitting structured events
- Dashboard accuracy: reported KPIs match ground truth ± 2%
- Alert false-positive rate ≤ 5%

### Interactions with Other Intelligences
- **Consumes from** all intelligences via event emissions
- **Produces for** Human Product Owner: business visibility
- **Produces for** Learning Intelligence: performance trends that trigger audit cycles
- Reports on all 7 intelligences' health

---

## Intelligence 7 — Advisor Intelligence

**Mission**: Support and continuously improve human advisor performance through structured, AI-enriched handoff intelligence and coaching insights.

**Primary Question Answered**: *How do we give the human advisor the best possible context, and how do we improve advisor outcomes over time?*

---

### Owned Capabilities

| Capability | Status | Location |
|---|---|---|
| Human Handoff (ACP-17, CAP-007) | Implemented | `CapabilityPackages/ACP-17_HUMAN_HANDOFF/` |
| Handoff Context Builder | Implemented | Conversation strategy HANDOFF_WITH_CONTEXT |
| Advisor Brief | Active | `AIOS/Domains/Insurance/Human/Advisor_Brief.md` |
| Escalation Protocol | Active | `AIOS/Domains/Insurance/Human/Escalation.md` |
| Handoff Quality Scoring | **Gap** | — |
| Advisor Coaching Package | **Gap** | — |
| Tacit Knowledge Capture | **Gap** | — |
| Post-Handoff Feedback Loop | **Gap** | — |
| Advisor Success Patterns | **Gap** | — |

### Consumed Capabilities

| Capability | From |
|---|---|
| Full customer profile | Customer Intelligence |
| Lead score and commercial context | Commercial Intelligence |
| Product knowledge summary | Product Intelligence |
| Conversation summary | Conversation Intelligence |

### Inputs
- Complete CustomerProfile at point of handoff
- Lead score + commercial signals
- Conversation summary (turn-by-turn)
- Medical and trust flags
- Product interest and comparison history

### Outputs
- Enriched handoff context package (structured, scored)
- Advisor brief (summary for human advisor)
- Coaching package (future — what the advisor should know about this customer type)
- Post-handoff outcome record (future — did the advisor convert?)

### Success Metrics
- Handoff quality score (context completeness + usefulness, rated by advisor)
- Post-handoff conversion rate
- Advisor acceptance rate (% of handoffs that are acknowledged, not dropped)
- Tacit knowledge entries captured per quarter

### Interactions with Other Intelligences
- **Consumes from** Customer Intelligence: full profile
- **Consumes from** Commercial Intelligence: lead score, opportunity
- **Consumes from** Product Intelligence: product summary
- **Produces for** Human Advisor: enriched handoff package
- **Feeds back** Learning Intelligence: post-handoff outcomes as learning signals
- **Reports to** Business Intelligence: handoff quality events (EVT-L05)
