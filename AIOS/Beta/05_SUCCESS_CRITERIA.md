# 05 — Beta Success Criteria

**Document ID**: AIOS-BETA-05  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Human Product Owner  
**Reference**: `09_METRIC_DEFINITIONS.md` for all formula definitions

---

## Purpose

Define what success means for AIOS Beta — across technical, learning, commercial, and business dimensions. Success is measured, not assumed.

**A goal without a metric is a wish. A metric without an owner is noise.**

---

## 1. Technical Success

Technical success means AIOS is stable enough to serve real customers without harming them.

| Metric | Target | Warning | Critical | Owner |
|---|---|---|---|---|
| P0 Open Issues | 0 | 1 | ≥ 2 | Lead Runtime Engineer |
| P1 Open Issues | ≤ 3 | 4–6 | ≥ 7 | Chief AI Architect |
| Test Pass Rate | 100% | < 100% for > 1 deployment | Failing tests in production | Lead Runtime Engineer |
| Pipeline Error Rate | < 1% of turns | 1–3% | > 3% | Lead Runtime Engineer |
| Fallback Rate | ≤ 10% | 10–20% | > 20% | Conversation Intelligence |
| Latency (p95) | ≤ 5 seconds | 5–8 seconds | > 8 seconds | Lead Runtime Engineer |
| Analytics Event Coverage | ≥ 2 events per turn | < 2 | 0 events | Business Intelligence |
| Issue Database Persistence | KV-persisted | In-memory | Not logging | Learning Intelligence |

### Technical Success Definition

**GREEN**: P0 = 0, tests passing, fallback < 10%, latency < 5s for 7+ consecutive days  
**YELLOW**: P0 = 0 but P1 > 3, or fallback 10–20%, or latency intermittently > 5s  
**RED**: Any P0 open, or test failures in production, or fallback > 20%

---

## 2. Learning Success

Learning success means the Beta period is generating intelligence that improves AIOS.

| Metric | Target | Warning | Critical | Owner |
|---|---|---|---|---|
| Learning Velocity | ≥ 1 approved improvement/week | < 1/week for 2 weeks | 0 improvements for 4 weeks | Learning Intelligence |
| Pattern Library Size | ≥ 10 by end of Beta | < 5 | 0 | Learning Intelligence |
| Issue Resolution Time (P0) | ≤ 24 hours | 24–48 hours | > 48 hours | Lead Runtime Engineer |
| Issue Resolution Time (P1) | ≤ 7 days | 7–14 days | > 14 days | Chief AI Architect |
| Regression Rate | 0% | Any regression | Recurring regression | QA Lead |
| Conversation Audit Coverage | ≥ 20% of conversations/week audited | 10–20% | < 10% | QA Lead |
| Change Proposal Approval Rate | ≥ 70% of proposals approved | 50–70% | < 50% | Human Product Owner |
| Learning Cycle Completions | ≥ 1 full cycle/week | < 1/week | 0 cycles | Learning Intelligence |

### Learning Success Definition

**GREEN**: ≥ 1 improvement/week, regression = 0, Pattern Library growing, cycle completing  
**YELLOW**: Improvements deployed but < 1/week, or 1 regression caught and fixed  
**RED**: No improvements deployed in 2+ weeks, any unresolved regression, P0 from a deployed improvement

---

## 3. Commercial Success

Commercial success means AIOS is moving customers toward qualified leads and handoffs.

| Metric | Target | Warning | Critical | Owner |
|---|---|---|---|---|
| Lead Capture Rate | ≥ 50% | 35–50% | < 35% | Commercial Intelligence |
| Qualification Rate | ≥ 20% of engaged | 12–20% | < 12% | Commercial Intelligence |
| Handoff Rate | ≥ 70% of qualified | 50–70% | < 50% | Advisor Intelligence |
| Re-ask Rate | ≤ 5% | 5–15% | > 15% | Customer Intelligence |
| Recommendation Delivery Rate | ≥ 60% of CONSIDERING+ | 40–60% | < 40% | Commercial Intelligence |
| Trust Recovery Rate | ≥ 90% | 75–90% | < 75% | Customer Intelligence |
| Medical Compliance Rate | 100% | — | < 100% | Product Intelligence |
| Lead Score at Handoff | ≥ 60 average | 40–60 | < 40 | Commercial Intelligence |
| Objection Resolution Rate | ≥ 50% | 30–50% | < 30% | Commercial Intelligence |
| Drop-off Rate at CONSIDERING | ≤ 40% | 40–60% | > 60% | Conversation Intelligence |

### Commercial Success Definition

**GREEN**: Lead Capture ≥ 50%, Handoff Rate ≥ 70%, Re-ask ≤ 5%, Trust Recovery ≥ 90%, Medical Compliance 100%  
**YELLOW**: Any metric in Warning range for 2+ consecutive weeks  
**RED**: Medical Compliance < 100% (always RED), or Trust Recovery < 75%, or Re-ask > 15%

---

## 4. Customer Experience Success

Customer experience success means customers feel understood, not interrogated or confused.

| Metric | Target | Warning | Critical | Owner |
|---|---|---|---|---|
| Conversation Quality Score (human audit) | ≥ 4.0 / 5.0 average | 3.0–4.0 | < 3.0 | QA Lead |
| Answer Quality Score | ≥ 4.0 / 5.0 | 3.0–4.0 | < 3.0 | QA Lead |
| Question Quality Score | ≥ 4.0 / 5.0 | 3.0–4.0 | < 3.0 | QA Lead |
| Memory Usage Score | ≥ 4.0 / 5.0 | 3.0–4.0 | < 3.0 | Customer Intelligence |
| Naturalness Score | ≥ 4.0 / 5.0 | 3.0–4.0 | < 3.0 | Conversation Intelligence |
| Customer-Initiated Drop-off Rate | ≤ 30% | 30–50% | > 50% | Conversation Intelligence |
| Conversation Length to Outcome | ≤ 10 turns average for QUALIFIED+ | 10–15 turns | > 15 turns | Conversation Intelligence |

*Conversation Quality scores use the rubric from `AIOS/Learning/02_CONVERSATION_AUDIT.md`.*

---

## 5. Business Success

Business success means the overall system is delivering measurable business value.

| Metric | Target | Warning | Critical | Owner |
|---|---|---|---|---|
| Conversations / Week | Growing week-over-week | Flat | Declining | Human Product Owner |
| Business Health Score | ≥ 70 / 100 | 50–70 | < 50 | Business Intelligence |
| Knowledge Gap Rate | ≤ 10% of turns | 10–25% | > 25% | Product Intelligence |
| Advisor Handoff Quality Score | ≥ 3.5 / 5.0 | 2.5–3.5 | < 2.5 | Advisor Intelligence |
| Architecture Health | GREEN | YELLOW | RED | Chief AI Architect |

---

## 6. Composite Beta Score

At the end of each month, a Beta Health Score is computed from the five dimensions:

| Dimension | Weight |
|---|---|
| Technical | 20% |
| Learning | 25% |
| Commercial | 25% |
| Customer Experience | 20% |
| Business | 10% |

**Scoring:**
- GREEN metric = 100 points
- YELLOW metric = 60 points
- RED metric = 0 points

**Beta Health Score ≥ 75%** = On track for Release Candidate  
**Beta Health Score 60–75%** = Caution; specific dimensions need attention  
**Beta Health Score < 60%** = Beta is not ready for promotion; reset priorities

---

## 7. Exit Criteria Checklist

Promotion from Beta to Release Candidate requires ALL of the following:

### Technical
- [ ] P0 issues: 0 open for ≥ 14 consecutive days
- [ ] Test suite: 0 failures on every deployment in prior 2 weeks
- [ ] Issue Database: KV-persisted
- [ ] Analytics event emitter: Live (P0-05 complete)
- [ ] Knowledge CI validation: Active (P0-02 complete)

### Learning
- [ ] ≥ 5 Change Proposals approved and deployed
- [ ] Pattern Library: ≥ 10 entries
- [ ] Regression rate: 0 in prior 4 weeks
- [ ] At least 1 complete learning cycle completed

### Commercial
- [ ] Lead Capture Rate: ≥ 50% for prior 4 weeks
- [ ] Handoff Rate: ≥ 70% for prior 4 weeks
- [ ] Re-ask Rate: ≤ 5% for prior 4 weeks
- [ ] Trust Recovery Rate: ≥ 90% for prior 4 weeks
- [ ] Medical Compliance Rate: 100% (no exceptions)

### Human Product Owner Sign-off
- [ ] Human Product Owner has reviewed all exit criteria evidence
- [ ] Human Product Owner is satisfied with Beta performance
- [ ] No pending architectural concerns flagged by Chief AI Architect
- [ ] Human Product Owner signs the Release Candidate approval
