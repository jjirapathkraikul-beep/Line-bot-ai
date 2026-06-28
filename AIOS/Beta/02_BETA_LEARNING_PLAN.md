# 02 — Beta Learning Plan

**Document ID**: AIOS-BETA-02  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Learning Architect + Human Product Owner  
**Reference**: `AIOS/Learning/` (all 10 governance documents), `AIOS/Intelligence/02_INTELLIGENCE_TAXONOMY.md`

---

## Purpose

This document defines exactly what AIOS must learn during Beta, how that learning is collected, and how it flows into improvement.

Learning is not passive. It is a deliberate, structured process with named owners, defined sources, and governed outcomes.

---

## 1. Learning Domains

### 1.1 Conversation Learning

**What to learn:**
- Which intents are most common? Do current ACP packages cover them adequately?
- Where do conversations break down — which turn, which strategy, which ACP?
- Which conversation strategies (CP-01 to CP-10) produce the best customer outcomes?
- How often does topic shift detection trigger? Is recovery effective?
- What are customers confused about? (CS-04 Confusion signal frequency)
- How often does the "I already told you" (CS-05 Repetition) signal appear?

**Learning sources:**
- `[CONV_LOG]` — intent, strategy, decision, turn count, questionCount
- `[MEMORY_HISTORY]` — loadedTurns, extractedKnownFieldsFromHistory
- Conversation Audit scores (question_quality, naturalness, decision_quality)

**Owner**: Conversation Intelligence  
**Output**: Updated ConversationDataset patterns, updated strategyRegistry entries

---

### 1.2 Customer Learning

**What to learn:**
- How complete are customer profiles at time of recommendation? Which fields are most often missing?
- How accurate is memory resolution? What fields are missed or misclassified?
- How often does trust concern trigger? How well does BUILD_TRUST_FIRST perform?
- How often does medical disclosure trigger? Is the medical follow-up question relevant?
- How long does it take (in turns) for a customer to move from UNKNOWN to INTERESTED?
- Are returning customers being recognized correctly via conversation history?

**Learning sources:**
- `knownFields` and `missingFields` in `[CONV_LOG]`
- `fieldsFromHistory` in `[MEMORY_HISTORY]`
- `trustFlow` and `medicalFlow` flags in conversation log
- Re-ask rate (LS-02: Memory Failure signal frequency)

**Owner**: Customer Intelligence  
**Output**: Improved memory extraction patterns, improved fact confidence weights, improved trust/medical detection keywords

---

### 1.3 Commercial Learning

**What to learn:**
- At which turn are commercial recommendations most effective?
- What objection types appear most frequently? Are objection handling ACPs (ACP-13, ACP-14) being activated correctly?
- What is the lead drop-off pattern — where do customers disengage after expressing interest?
- Which product recommendations resonate? Which are rejected?
- How accurate is lead timing? Is lead capture being triggered too early (trust not safe) or too late (customer already frustrated)?

**Learning sources:**
- `leadCaptureStarted`, `leadCaptureCompleted`, `recommendationDelivered` in conversation log
- Decision trace (`decision` field in log)
- Commercial signal frequency (CoS-01 to CoS-07 per `05_SHARED_SIGNAL_FRAMEWORK.md`)
- Lost opportunity analysis

**Owner**: Commercial Intelligence  
**Reference**: `03_COMMERCIAL_LEARNING.md` (detailed commercial learning plan)

---

### 1.4 Product Learning

**What to learn:**
- Which product questions are most common? Is there a knowledge document for each?
- How often does the knowledge resolver fail to find relevant content (Knowledge Gap rate)?
- Are mandatory fragments (medical uncertainty, investment risk) being included in every applicable response?
- Which knowledge documents are accessed most frequently vs. least frequently?
- Are there product questions that receive a fallback response when a knowledge document should exist?

**Learning sources:**
- `selectedKnowledgePaths` in conversation trace
- `knowledgeWarnings` in conversation trace
- `fallbackUsed` flag in conversation log
- Knowledge resolver [CONV_LOG] trace

**Owner**: Product Intelligence  
**Output**: New knowledge documents, updated existing documents, new Knowledge Path Registry entries

---

### 1.5 Advisor Learning

**What to learn:**
- Are handoffs being triggered at the right moment (not too early, not too late)?
- Is the handoff context complete enough for the human advisor?
- Which conversations result in successful handoffs vs. lost leads?
- What context is most useful to the human advisor?
- Are post-handoff outcomes being tracked?

**Learning sources:**
- Handoff trigger decision trace
- Lead score at handoff (from log)
- Human advisor feedback (collected via structured form — future)
- `handoffTriggered`, `leadScore` fields

**Owner**: Advisor Intelligence  
**Output**: Improved handoff trigger timing, improved advisor brief content

---

### 1.6 Business Learning

**What to learn:**
- Which KPIs are above target? Which are below?
- What is the weekly business health trajectory?
- What is the conversion funnel shape — where is the biggest drop?
- What product demand patterns are emerging?
- What is the learning velocity — how fast is AIOS improving?

**Learning sources:**
- Aggregated conversation log data (daily/weekly)
- KPI calculations from metric definitions (`09_METRIC_DEFINITIONS.md`)
- Learning metrics (issue resolution rate, pattern reuse rate)

**Owner**: Business Intelligence  
**Output**: Weekly business report, KPI trends, anomaly alerts

---

### 1.7 Knowledge Learning

**What to learn:**
- Which knowledge documents need to be created (missing content)?
- Which knowledge documents need to be updated (outdated content)?
- Are there domain-specific questions that current knowledge doesn't cover?
- Are mandatory fragments always accurate and current?

**Learning sources:**
- `knowledgeWarnings` from resolver trace
- Conversation Audit `answer_quality` score < 3
- Pattern LS-01 (Knowledge Gap signal)
- Human reviewer feedback during daily review

**Owner**: Product Intelligence → changes require Change Proposal (Learning-06)

---

## 2. Learning Sources

### Source 1 — Conversation Logs (Primary)

**Location**: Vercel KV — `convlog:turn:{sessionId}`, `convlog:turns:{conversationId}`  
**Content**: 26 structured fields per turn  
**Access**: `getRecentConversationTurnsForUser()`, `getConversationById()` helpers  
**Update frequency**: Real-time (every turn)  
**Owner**: Customer Intelligence (writes); Learning Intelligence (reads for audit)

---

### Source 2 — Audit Queue

**Location**: Vercel KV — `audit:{auditId}`  
**Content**: Quality scores, flags, issue indicators per conversation  
**Update frequency**: Post-response (async, every turn)  
**Owner**: Learning Intelligence  
**Reference**: `runtime-gen1/observability/auditQueue.ts`

---

### Source 3 — Issue Database

**Location**: Currently in-memory (P0-01: migrate to KV)  
**Content**: Structured issues with severity, category, root cause, status  
**Update frequency**: As issues are identified  
**Owner**: Learning Intelligence  
**Reference**: `runtime-gen1/observability/issueDatabase.ts`

---

### Source 4 — Human Feedback (Daily Review)

**Format**: Daily review template (`07_DAILY_REVIEW_TEMPLATE.md`)  
**Content**: Human-observed quality issues, knowledge gaps, customer confusion patterns  
**Update frequency**: Daily (Human Product Owner or designated reviewer)  
**Owner**: Human Product Owner  
**This is the highest-quality signal** — a human reviewer reading actual conversations catches what automated systems miss

---

### Source 5 — Advisor Feedback

**Format**: Structured feedback per handoff (future — P3-03 from roadmap)  
**Content**: Was the handoff context useful? Did the customer convert?  
**Update frequency**: Per handoff  
**Owner**: Advisor Intelligence  
**Note**: Not yet implemented. Manually collected during Beta via direct advisor input.

---

## 3. Weekly Learning Loop

The weekly learning loop is the core operating cycle of the Beta Learning System. It runs every week without exception.

```
STEP 1 — COLLECT (Monday)
  Pull all conversation logs from prior 7 days
  Pull all audit queue records
  Pull all open issues from Issue Database
  Summarize: total conversations, intent distribution,
             fallback rate, re-ask rate, handoff rate

STEP 2 — AUDIT (Monday–Tuesday)
  Human reviewer scores top 10 conversations
  using Conversation Audit schema (AIOS/Learning/02_CONVERSATION_AUDIT.md)
  Flag: any P0 issues immediately
  Score: answer_quality, question_quality, memory_usage, decision_quality

STEP 3 — PATTERN (Tuesday–Wednesday)
  Compare audited issues against Pattern Library (AIOS/Learning/04_PATTERN_LIBRARY.md)
  If issue matches existing pattern: apply known solution
  If issue is novel: document as new pattern candidate

STEP 4 — PROPOSE (Wednesday)
  For each unresolved issue:
    Generate Change Proposal using template (AIOS/Learning/06_CHANGE_PROPOSAL.md)
    Include: originating ConversationID, pattern reference, proposed fix,
             affected components, regression test requirement

STEP 5 — APPROVE (Thursday)
  Human Product Owner reviews all proposals
  Approve: Proposal moves to IN_PROGRESS
  Reject: Proposal archived with reason
  Needs Revision: Returned to proposer

STEP 6 — DEPLOY (Thursday–Friday)
  Approved proposals implemented (runtime fix, knowledge update, ACP update)
  Full regression suite run (321+ tests must pass)
  New test cases added for the issue scenario

STEP 7 — OBSERVE (Following Monday)
  Confirm improvement is visible in new conversation data
  Update Pattern Library with confirmed fix
  Close issue in Issue Database
  Record in Release Notes (AIOS/Learning/09_RELEASE_NOTES.md)
```

---

## 4. Learning Governance

All learning changes comply with:

- `AIOS/Learning/01_LEARNING_PHILOSOPHY.md` — Principles 1-7
- `AIOS/Learning/06_CHANGE_PROPOSAL.md` — Proposal lifecycle
- `AIOS/Learning/07_ACCEPTANCE_PROCESS.md` — Approval requirements
- `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` — Intelligence layer governance
- `AIOS/04_AI_Constitution.md` — Constitutional constraints

**Sensitive changes** (trust, medical, compliance, recommendation) require elevated review per `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` Section 4.
