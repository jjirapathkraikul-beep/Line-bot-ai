# 06 — Release Criteria

**Document ID**: AIOS-BETA-06  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Human Product Owner (final decision)  
**Reference**: `05_SUCCESS_CRITERIA.md` (metrics), `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` (governance)

---

## Purpose

Define the promotion rules for advancing AIOS from Beta through Release Candidate to Production. Each stage has required metrics, quality gates, stability requirements, and explicit rollback criteria.

**No stage may be skipped. Human Product Owner approval is required at every gate.**

---

## 1. Stage Map

```
Beta (Current Stage)
  Purpose: Learn · Improve · Validate
  Audience: Controlled, trusted users
  Tolerance: Higher — learning from imperfection
      │
      │  [Beta Exit Gate — all criteria met + HPO approval]
      ▼
Release Candidate
  Purpose: Validate stability at higher volume
  Audience: Wider trusted group + soft launch
  Tolerance: Lower — must sustain quality under load
      │
      │  [RC Exit Gate — all criteria met + HPO approval]
      ▼
Production
  Purpose: Serve general public
  Audience: Open audience
  Tolerance: Lowest — every issue is customer-visible
```

---

## 2. Beta Stage

**Current stage.**

**Definition**: AIOS is serving known, trusted users under active human oversight. Every conversation is reviewed regularly. Rapid iteration is permitted.

### Required Metrics (maintained for ≥ 14 days before exit)

| Category | Requirement |
|---|---|
| P0 Issues | 0 open |
| Test Pass Rate | 100% every deployment |
| Fallback Rate | ≤ 10% |
| Medical Compliance | 100% |
| Trust Recovery Rate | ≥ 90% |
| Re-ask Rate | ≤ 5% |
| Lead Capture Rate | ≥ 50% |
| Handoff Rate | ≥ 70% of qualified |

### Required Quality

| Requirement | Status |
|---|---|
| Human conversation audit: ≥ 20%/week coverage | Active |
| Daily P0 review completed | Active |
| Weekly report published | Active |
| All P0 roadmap items complete | Required before exit |

### Required Stability

| Requirement | Status |
|---|---|
| No P0 issues for 14 consecutive days | Gate criterion |
| No regressions from any deployed improvement | Required |
| Full test suite passing on every deployment | Required |

### Required Learning

| Requirement | Status |
|---|---|
| ≥ 5 Change Proposals approved and deployed | Required |
| Pattern Library ≥ 10 entries | Required |
| At least 1 complete learning cycle end-to-end | Required |

### Required Business Results

| Requirement | Status |
|---|---|
| Positive commercial trend (improving week-over-week for ≥ 3 weeks) | Required |
| Beta Health Score ≥ 75% for ≥ 4 consecutive weeks | Required |

### Rollback Criteria (Beta → Reset)

| Trigger | Action |
|---|---|
| P0 issue opened | Immediate pause; fix before any other Beta activity |
| Regression introduced by a deployed change | Revert change; add regression test; re-propose |
| Test suite failure in production | Immediate rollback of last deployment |
| Beta Health Score drops below 50% for 2 consecutive weeks | Escalate to HPO; reassess strategy |

---

## 3. Release Candidate Stage

**Definition**: AIOS has demonstrated Beta stability. RC introduces AIOS to a wider, trusted audience to validate that Beta performance holds under higher volume and more diverse users.

### Entry Requirements

- All Beta Exit Criteria met (see `05_SUCCESS_CRITERIA.md` Section 7)
- Human Product Owner has signed Beta exit approval
- Chief AI Architect confirms no open architectural concerns
- Full regression test suite passes

### Required Metrics (maintained for ≥ 21 days before Production promotion)

| Category | RC Target (stricter than Beta) |
|---|---|
| P0 Issues | 0 open — any P0 triggers rollback to Beta |
| Fallback Rate | ≤ 8% (tighter than Beta) |
| Re-ask Rate | ≤ 3% (tighter than Beta) |
| Trust Recovery Rate | ≥ 92% |
| Medical Compliance | 100% (no exceptions) |
| Conversation Quality Score | ≥ 4.2 / 5.0 |
| Latency (p95) | ≤ 4 seconds |
| Lead Capture Rate | ≥ 55% |
| Handoff Rate | ≥ 75% |

### Required Quality

| Requirement |
|---|
| Automated conversation audit: ≥ 30% sampling |
| Weekly report continues |
| Monthly architecture review complete |
| All P1 roadmap items complete or in-progress with clear ETA |

### Required Stability

| Requirement |
|---|
| 21 consecutive days with 0 P0 issues |
| ≤ 1 P1 issue per week average |
| No regressions in prior 3 weeks |
| All deployments fully tested before merge |

### Required Learning

| Requirement |
|---|
| Learning cycle: ≥ 2/week sustained |
| Pattern Library: ≥ 15 entries |
| Issue resolution time: ≤ 5 days for P1 |

### Required Business Results

| Requirement |
|---|
| All commercial metrics in GREEN for ≥ 3 consecutive weeks |
| Business Health Score ≥ 80% |
| Positive learning velocity trend (more per week vs. Beta average) |

### Rollback Criteria (RC → Beta)

| Trigger | Action |
|---|---|
| Any P0 issue | Immediate rollback to Beta stage |
| Fallback Rate > 10% for 3+ consecutive days | Rollback; diagnose before re-promoting |
| Medical Compliance < 100% | Immediate rollback; fix + full audit before re-promoting |
| Conversation Quality Score < 4.0 for 2 consecutive weeks | Rollback; investigate quality degradation |
| RC Health Score < 65% for 2 consecutive weeks | Rollback to Beta |

---

## 4. Production Stage

**Definition**: AIOS serves the general public. Volume is uncontrolled. Every conversation is potentially a customer's first impression. Quality gates are at their strictest.

### Entry Requirements

- All RC Exit Criteria met for ≥ 21 consecutive days
- Human Product Owner has signed RC exit approval (separate from Beta exit)
- Chief AI Architect confirms: no P1+ architectural concerns, SSI clean, no V1 modules in critical path
- QA Lead confirms: all regression tests passing, all sensitive scenario tests green

### Production Metrics (ongoing — not a temporary gate)

| Category | Production Target |
|---|---|
| P0 Issues | 0 — any P0 triggers hotfix deploy within 4 hours |
| Fallback Rate | ≤ 5% |
| Re-ask Rate | ≤ 2% |
| Trust Recovery Rate | ≥ 95% |
| Medical Compliance | 100% — non-negotiable |
| Conversation Quality Score | ≥ 4.5 / 5.0 |
| Latency (p95) | ≤ 3 seconds |
| Lead Capture Rate | ≥ 60% |
| Handoff Rate | ≥ 80% |
| Business Health Score | ≥ 85% |

### Production Stability Requirements

| Requirement |
|---|
| Automated monitoring: alert on any metric crossing Warning threshold |
| P0 response SLA: fix deployed within 4 hours |
| Change velocity: slower than Beta (governance reviewed, not rapid) |
| Rollback plan: every deployment has a 1-click rollback procedure |
| Sampling: ≥ 10% of conversations sampled for quality weekly |

### Production Rollback Criteria

| Trigger | Action |
|---|---|
| P0 issue | Immediate hotfix; if not fixable in 4 hours → rollback last deployment |
| Medical Compliance < 100% | Hotfix deploy + full audit; if recurring → rollback and reassess architecture |
| Conversation Quality < 4.0 for 1 week | Root cause analysis; pause non-P0 improvements |
| Trust Recovery < 90% for 1 week | Root cause; review trust detection logic |

---

## 5. Promotion Authority

| Promotion | Authority |
|---|---|
| Beta → Release Candidate | Human Product Owner (sole authority) |
| Release Candidate → Production | Human Product Owner (sole authority) |
| Any rollback | Chief AI Architect may initiate; Human Product Owner confirms if > P1 impact |

No promotion may be approved by an AI agent, including AIOS itself, Claude Code, or any architectural AI. Human authority is final and non-delegable for stage promotions.
