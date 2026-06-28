# 09 — Metric Definitions

**Document ID**: AIOS-BETA-09  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Business Intelligence + Human Product Owner  
**Reference**: `05_SUCCESS_CRITERIA.md` (targets), `AIOS/Learning/05_METRICS.md` (base metrics)

---

## Purpose

Define exactly how every Beta metric is calculated. Without precise definitions, the same data produces different numbers in different weeks — and trend analysis becomes meaningless.

**Each metric has: a formula, a data source, an update frequency, and an owner.**

---

## 1. Conversation Metrics

---

### 1.1 Total Conversations

**Definition**: Number of distinct conversation sessions in the measurement period.  
**Formula**: `COUNT(DISTINCT conversationId)` from conversation logs in period  
**Data Source**: Vercel KV — `convlog:turns:{conversationId}` index  
**Update Frequency**: Daily  
**Owner**: Business Intelligence

---

### 1.2 Total Turns

**Definition**: Number of individual turn pairs (user message + assistant response) in the period.  
**Formula**: `COUNT(turn records)` from `convlog:turn:{sessionId}` in period  
**Data Source**: Vercel KV  
**Update Frequency**: Daily  
**Owner**: Business Intelligence

---

### 1.3 Fallback Rate

**Definition**: Percentage of turns where the system returned a generic fallback response (no ACP match, knowledge resolver empty, unhandled intent).  
**Formula**: `(turns with fallback = true) / (total turns) × 100`  
**Data Source**: `fallbackUsed` flag in conversation log  
**Update Frequency**: Daily  
**Owner**: Conversation Intelligence  
**Targets**: Beta ≤ 10% | RC ≤ 8% | Production ≤ 5%

---

### 1.4 Re-ask Rate

**Definition**: Percentage of turns where the system asked for information the customer had already provided in the same or prior session.  
**Formula**: `(turns with reAsk = true) / (total turns) × 100`  
**Note**: `reAsk = true` is flagged when a field already exists in `knownFields` but the system prompt contains a question for that field. Currently a heuristic — exact implementation depends on conversation audit.  
**Data Source**: `reAskDetected` flag (to be added) or manual audit  
**Update Frequency**: Weekly (manual audit during Beta; automated in RC)  
**Owner**: Customer Intelligence  
**Targets**: Beta ≤ 5% | RC ≤ 3% | Production ≤ 2%

---

### 1.5 Avg Conversation Length to Outcome

**Definition**: Average number of turns from conversation start to a meaningful outcome (QUALIFIED, handoff, or confirmed drop-off).  
**Formula**: `AVERAGE(turns_at_outcome - turns_at_start)` for conversations that reached an outcome state  
**Data Source**: State machine state field in conversation log (requires state tracking per turn)  
**Update Frequency**: Weekly  
**Owner**: Conversation Intelligence  
**Targets**: Beta ≤ 10 turns | RC ≤ 8 turns | Production ≤ 7 turns

---

### 1.6 Intent Accuracy Rate

**Definition**: Percentage of turns where the detected intent matches the intent a human auditor would assign.  
**Formula**: `(correctly classified intents) / (audited turns) × 100`  
**Data Source**: Conversation audit records vs. logged `intent` field  
**Update Frequency**: Weekly (based on audited sample)  
**Owner**: Conversation Intelligence  
**Targets**: Beta ≥ 90% | RC ≥ 93% | Production ≥ 95%

---

## 2. Learning Metrics

---

### 2.1 Learning Velocity

**Definition**: Number of approved and deployed Change Proposals per week.  
**Formula**: `COUNT(Change Proposals with status = DEPLOYED) in prior 7 days`  
**Data Source**: Change Proposal registry (AIOS/Learning/06_CHANGE_PROPOSAL.md format)  
**Update Frequency**: Weekly  
**Owner**: Learning Intelligence  
**Targets**: Beta ≥ 1/week | RC ≥ 2/week

---

### 2.2 Issue Resolution Time

**Definition**: Time from issue creation (in issueDatabase) to status = RESOLVED.  
**Formula (P0)**: `resolution_timestamp - created_timestamp` (in hours)  
**Formula (P1)**: Same (in days)  
**Data Source**: `issueDatabase` records with `createdAt` and `resolvedAt` timestamps  
**Update Frequency**: Per-issue; aggregated weekly  
**Owner**: Lead Runtime Engineer (P0), Chief AI Architect (P1)  
**Targets**: P0 ≤ 24h | P1 ≤ 7 days

---

### 2.3 Regression Rate

**Definition**: Percentage of deployed Change Proposals that introduced a new issue after deployment.  
**Formula**: `(proposals that caused regression) / (total proposals deployed) × 100`  
**Data Source**: Regression flag in issue records (`regressionFrom: proposalId`)  
**Update Frequency**: Per deployment; aggregated weekly  
**Owner**: QA Lead  
**Targets**: 0% at all stages (non-negotiable)

---

### 2.4 Pattern Library Size

**Definition**: Total number of active entries in the Pattern Library.  
**Formula**: `COUNT(patterns with status = ACTIVE)` in AIOS/Learning/04_PATTERN_LIBRARY.md  
**Data Source**: Pattern Library document  
**Update Frequency**: As entries are added  
**Owner**: Learning Intelligence  
**Targets**: Beta ≥ 10 | RC ≥ 15 | Production growing

---

### 2.5 Conversation Audit Coverage

**Definition**: Percentage of conversations in the period that received a human audit score.  
**Formula**: `(conversations audited) / (total conversations) × 100`  
**Data Source**: Audit records vs. total conversation count  
**Update Frequency**: Weekly  
**Owner**: QA Lead  
**Targets**: Beta ≥ 20%/week | RC ≥ 30%/week | Production ≥ 10%/week

---

### 2.6 Change Proposal Approval Rate

**Definition**: Percentage of submitted Change Proposals that are approved (not rejected or cancelled).  
**Formula**: `(APPROVED proposals) / (APPROVED + REJECTED proposals) × 100`  
**Note**: Proposals returned for revision are not counted as rejected.  
**Data Source**: Change Proposal registry  
**Update Frequency**: Weekly  
**Owner**: Human Product Owner  
**Targets**: Beta ≥ 70% | RC ≥ 75%

---

## 3. Commercial Metrics

---

### 3.1 Lead Capture Rate

**Definition**: Percentage of new users who provide enough information to constitute an engaged lead (name + phone number captured, or equivalent identification).  
**Formula**: `(conversations with leadCaptureCompleted = true) / (new unique user conversations) × 100`  
**Data Source**: `leadCaptureCompleted` flag in conversation log  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≥ 50% | RC ≥ 55% | Production ≥ 60%

---

### 3.2 Qualification Rate

**Definition**: Percentage of engaged leads who reach a lead score sufficient for qualification (lead score ≥ 50).  
**Formula**: `(conversations with leadScore ≥ 50) / (conversations with leadCaptureCompleted = true) × 100`  
**Data Source**: `leadScore` field in conversation log  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≥ 20% | RC ≥ 25% | Production ≥ 30%

---

### 3.3 Handoff Rate

**Definition**: Percentage of qualified leads who receive a handoff to a human advisor.  
**Formula**: `(conversations with handoffTriggered = true AND leadScore ≥ 50) / (conversations with leadScore ≥ 50) × 100`  
**Data Source**: `handoffTriggered`, `leadScore` fields  
**Update Frequency**: Weekly  
**Owner**: Advisor Intelligence  
**Targets**: Beta ≥ 70% | RC ≥ 75% | Production ≥ 80%

---

### 3.4 Trust Recovery Rate

**Definition**: Percentage of conversations where trust concern was detected AND the conversation continued productively beyond the trust resolution.  
**Formula**: `(conversations with isTrustSignal = true AND continued_after_trust_resolved = true) / (conversations with isTrustSignal = true) × 100`  
**Data Source**: `trustFlow` trace in conversation log  
**Update Frequency**: Weekly  
**Owner**: Customer Intelligence  
**Targets**: Beta ≥ 90% | RC ≥ 92% | Production ≥ 95%

---

### 3.5 Medical Compliance Rate

**Definition**: Percentage of medical disclosure conversations that include the mandatory medical uncertainty fragment.  
**Formula**: `(conversations with isMedicalSignal = true AND mandatoryFragmentIncluded = true) / (conversations with isMedicalSignal = true) × 100`  
**Data Source**: `medicalFlow` trace in conversation log  
**Update Frequency**: Daily (critical metric — no delay allowed)  
**Owner**: Product Intelligence  
**Targets**: 100% at all stages — any deviation below 100% is a P0 issue

---

### 3.6 Recommendation Delivery Rate

**Definition**: Percentage of conversations that reached the CONSIDERING state and also received an explicit product recommendation.  
**Formula**: `(conversations with state ≥ CONSIDERING AND recommendationDelivered = true) / (conversations with state ≥ CONSIDERING) × 100`  
**Data Source**: `recommendationDelivered`, conversation state  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≥ 60% | RC ≥ 65% | Production ≥ 70%

---

### 3.7 Avg Lead Score at Handoff

**Definition**: The average lead score value at the moment a handoff is triggered.  
**Formula**: `AVERAGE(leadScore at time of handoffTriggered = true)` for conversations in period  
**Data Source**: `leadScore` at `handoffTriggered` event  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≥ 60 | RC ≥ 65 | Production ≥ 70

---

### 3.8 Objection Resolution Rate

**Definition**: Percentage of conversations with a detected objection where the conversation continued meaningfully after the objection response.  
**Formula**: `(conversations with objection detected AND continued_post_objection) / (conversations with objection detected) × 100`  
**Data Source**: Objection signal detection + subsequent turn count > 2 post-objection  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≥ 50% | RC ≥ 55% | Production ≥ 60%

---

### 3.9 Lost Opportunity Rate

**Definition**: Percentage of conversations that reached CONSIDERING or higher and did not result in a handoff.  
**Formula**: `(conversations with state ≥ CONSIDERING AND handoffTriggered = false) / (conversations with state ≥ CONSIDERING) × 100`  
**Data Source**: State field + `handoffTriggered` field  
**Update Frequency**: Weekly  
**Owner**: Commercial Intelligence  
**Targets**: Beta ≤ 30% | RC ≤ 25% | Production ≤ 20%

---

## 4. Customer Experience Metrics

---

### 4.1 Conversation Quality Score

**Definition**: Average human audit score across all audited conversations. Scored on 5 dimensions: answer quality, question quality, memory usage, naturalness, decision quality.  
**Formula**: `AVERAGE(total_audit_score / 5)` across all audited conversations in period  
**Data Source**: Human audit records (AIOS/Learning/02_CONVERSATION_AUDIT.md rubric)  
**Update Frequency**: Weekly  
**Owner**: QA Lead  
**Targets**: Beta ≥ 4.0/5 | RC ≥ 4.2/5 | Production ≥ 4.5/5

---

### 4.2 Answer Quality Score

**Definition**: Average score for the factual accuracy and completeness of AIOS answers.  
**Formula**: `AVERAGE(answer_quality score)` from audit records  
**Data Source**: Human audit records  
**Update Frequency**: Weekly  
**Owner**: QA Lead  
**Targets**: Beta ≥ 4.0/5 | RC ≥ 4.2/5 | Production ≥ 4.5/5

---

### 4.3 Question Quality Score

**Definition**: Average score for how natural, relevant, and minimal AIOS's clarifying questions are.  
**Formula**: `AVERAGE(question_quality score)` from audit records  
**Data Source**: Human audit records  
**Update Frequency**: Weekly  
**Owner**: QA Lead  
**Targets**: Beta ≥ 4.0/5 | RC ≥ 4.2/5 | Production ≥ 4.5/5

---

## 5. Business Metrics

---

### 5.1 Business Health Score

**Definition**: A composite score (0–100) reflecting the overall business health of AIOS during the measurement period. Computed monthly for the monthly strategic review.  
**Formula**:

```
Score = (
  (Technical Dimension Score × 0.20) +
  (Learning Dimension Score × 0.25) +
  (Commercial Dimension Score × 0.25) +
  (Customer Experience Dimension Score × 0.20) +
  (Business Dimension Score × 0.10)
) × 100

Where each dimension score = AVERAGE(metric_health_scores in that dimension)
And metric_health_score: GREEN = 1.0, YELLOW = 0.6, RED = 0.0
```

**Update Frequency**: Monthly  
**Owner**: Business Intelligence  
**Targets**: Beta ≥ 70 | RC ≥ 80 | Production ≥ 85

---

### 5.2 Knowledge Gap Rate

**Definition**: Percentage of turns where the knowledge resolver returned empty or insufficient results.  
**Formula**: `(turns with knowledgeWarnings present AND selectedKnowledgePaths empty) / (total turns) × 100`  
**Data Source**: `knowledgeWarnings`, `selectedKnowledgePaths` in conversation trace  
**Update Frequency**: Weekly  
**Owner**: Product Intelligence  
**Targets**: Beta ≤ 10% | RC ≤ 7% | Production ≤ 5%

---

### 5.3 Architecture Health

**Definition**: A three-state assessment of the current state of the AIOS architecture. Assessed by the Chief AI Architect monthly.  
**States**: GREEN (no violations, no open P1+ architectural concerns) | YELLOW (1-2 minor concerns, no SSI violations) | RED (any SSI violation, or open P0 architectural concern)  
**Update Frequency**: Monthly  
**Owner**: Chief AI Architect

---

## 6. Metric Log Reference

These are the structured log keys where source data for metrics is found:

| Metric Category | Log Key | Fields |
|---|---|---|
| All conversation data | `convlog:turn:{sessionId}` | All 26 per-turn fields |
| Conversation index | `convlog:turns:{conversationId}` | List of sessionIds |
| Audit records | `audit:{auditId}` | Quality scores, flags |
| Issue records | `issue:{issueId}` | Severity, status, timestamps |
| Conversation trace | `[CONV_LOG]` server log | Intent, strategy, decision, leadScore |
| Memory trace | `[MEMORY_HISTORY]` server log | loadedTurns, fieldsFromHistory |
