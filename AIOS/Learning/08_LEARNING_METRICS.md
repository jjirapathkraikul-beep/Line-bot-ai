# 08 — Learning Metrics

**Document ID**: AIOS-LEARN-08  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the Key Performance Indicators (KPIs) that measure the health and effectiveness of the AIOS Learning System. These metrics answer: *Is the AI getting better? Are we learning from conversations? Is the improvement process working?*

---

## Scope

These metrics apply to the Learning Layer itself and to AIOS AI quality as observed through the Learning Layer. They do not measure business outcomes directly (e.g., sales conversion) — those are measured by the Application layer.

---

## Metric Categories

| Category | What It Measures |
|---|---|
| **Conversation Quality** | How well AI conversations are performing |
| **Learning Velocity** | How fast the Learning System identifies and fixes issues |
| **Knowledge Growth** | How much the knowledge base has grown or improved |
| **Governance Health** | How well the human approval process is functioning |
| **Regression Safety** | Whether improvements are being made without breaking existing behavior |

---

## Conversation Quality Metrics

### CQ-01 — Intent Accuracy Rate

**Definition**: Percentage of conversations where the AI correctly identified the customer's primary intent.  
**Formula**: `(conversations with correct_intent_detection = true) / (total audited conversations) × 100`  
**Source**: `02_CONVERSATION_AUDIT.md` → `intent_detected_correctly` field  
**Target**: ≥ 90%  
**Measurement Period**: Weekly  
**Alert Threshold**: < 80% triggers immediate P1 investigation

---

### CQ-02 — Answer Quality Score (Average)

**Definition**: Average answer quality score across all audited conversations.  
**Formula**: `sum(answer_quality scores) / count(audited conversations)`  
**Source**: `02_CONVERSATION_AUDIT.md` → `answer_quality` field  
**Target**: ≥ 4.0 / 5.0  
**Measurement Period**: Weekly  
**Alert Threshold**: < 3.5 triggers P1 issue creation

---

### CQ-03 — Trust Score (Average)

**Definition**: Average trust-handling score across conversations where a trust concern was detected.  
**Formula**: `sum(trust_score) / count(conversations with trust_concern intent) × 100`  
**Source**: `02_CONVERSATION_AUDIT.md` → `trust_score` field (trust conversations only)  
**Target**: ≥ 4.5 / 5.0  
**Measurement Period**: Weekly  
**Alert Threshold**: < 4.0 triggers immediate review

---

### CQ-04 — Repeat Question Rate

**Definition**: Percentage of audited conversations where the AI asked for information the customer had already provided.  
**Formula**: `(conversations with repeat_question_detected = true) / (total audited) × 100`  
**Source**: `02_CONVERSATION_AUDIT.md` → `repeat_question_detected`  
**Target**: < 5%  
**Measurement Period**: Weekly  
**Alert Threshold**: > 10% triggers memory system review

---

### CQ-05 — Conversation Completion Rate

**Definition**: Percentage of conversations where the customer reached their stated or inferred goal.  
**Formula**: `(conversations with conversation_completed = true) / (total audited) × 100`  
**Source**: `02_CONVERSATION_AUDIT.md` → `conversation_completed`  
**Target**: ≥ 70%  
**Measurement Period**: Weekly  
**Alert Threshold**: < 55%

---

### CQ-06 — Lost Opportunity Rate

**Definition**: Percentage of conversations where the AI missed a chance to better serve the customer.  
**Formula**: `(conversations with lost_opportunity = true) / (total audited) × 100`  
**Source**: `02_CONVERSATION_AUDIT.md` → `lost_opportunity`  
**Target**: < 15%  
**Measurement Period**: Weekly  
**Alert Threshold**: > 25%

---

### CQ-07 — Medical Response Quality

**Definition**: Average question quality and answer quality score for conversations involving medical/underwriting topics.  
**Formula**: `average(answer_quality + recommendation_quality) / 2` for conversations with `primary_intent = medical_condition OR underwriting_question`  
**Target**: ≥ 4.0 / 5.0  
**Measurement Period**: Monthly  
**Note**: Small sample sizes may make weekly measurement unreliable

---

### CQ-08 — Human Handoff Rate

**Definition**: Percentage of conversations that resulted in a handoff to a human agent.  
**Formula**: `(conversations with handoff_triggered = true) / (total conversations) × 100`  
**Source**: Application analytics, not audit-only  
**Target**: > 15% (too low = AI may be blocking handoffs; too high = AI may be under-performing)  
**Measurement Period**: Weekly  
**Note**: Both very low and very high values require investigation

---

### CQ-09 — Customer Satisfaction Score (Average)

**Definition**: Average estimated customer satisfaction across audited conversations.  
**Formula**: `sum(customer_satisfaction scores) / count(audited conversations)`  
**Source**: `02_CONVERSATION_AUDIT.md` → `customer_satisfaction`  
**Target**: ≥ 4.0 / 5.0  
**Measurement Period**: Monthly  
**Note**: This is an auditor estimate; explicit CSAT survey data should replace it when available

---

### CQ-10 — Naturalness Score (Average)

**Definition**: Average naturalness score across all audited conversations.  
**Formula**: `sum(naturalness scores) / count(audited conversations)`  
**Source**: `02_CONVERSATION_AUDIT.md` → `naturalness`  
**Target**: ≥ 3.8 / 5.0  
**Measurement Period**: Monthly

---

## Learning Velocity Metrics

### LV-01 — Mean Time to Issue Creation

**Definition**: Average time from conversation date to issue creation date.  
**Formula**: `average(issue.created_date - issue.conversation_date)` in days  
**Target**: ≤ 3 days  
**Alert Threshold**: > 7 days means the audit process is too slow

---

### LV-02 — Mean Time to Proposal

**Definition**: Average time from issue creation to linked proposal creation.  
**Formula**: `average(proposal.created_date - issue.created_date)` in days  
**Target**: ≤ 5 days for P1, ≤ 14 days for P2, ≤ 30 days for P3  
**Alert Threshold**: P1 > 7 days triggers escalation

---

### LV-03 — Mean Time to Approval

**Definition**: Average time from proposal READY_FOR_REVIEW to APPROVED.  
**Formula**: `average(approval.date - ready_for_review.date)` in days  
**Target**: P1 ≤ 1 day, P2 ≤ 5 days, P3 ≤ 10 days  
**Alert Threshold**: Per `07_ACCEPTANCE_PROCESS.md` maximum review times

---

### LV-04 — Improvement Velocity

**Definition**: Number of approved and implemented improvements per month.  
**Formula**: `count(issues with status = CLOSED in period)` per calendar month  
**Target**: ≥ 3 improvements per month  
**Note**: Quality matters more than quantity — do not sacrifice quality to hit this target

---

### LV-05 — Issue Backlog Size

**Definition**: Number of open issues (status not CLOSED, REJECTED, or ARCHIVED).  
**Formula**: `count(issues with status IN [OPEN, ANALYZED, PROPOSED, APPROVED, IN_PROGRESS, IMPLEMENTED])`  
**Target**: < 20 open issues at any time  
**Alert Threshold**: > 30 triggers backlog review

---

## Knowledge Growth Metrics

### KG-01 — Knowledge Base Growth Rate

**Definition**: Number of new or updated knowledge entries per month from Learning proposals.  
**Formula**: `count(proposals with change_scope = KNOWLEDGE AND status = CLOSED)` per month  
**Target**: ≥ 2 per month  
**Measurement Period**: Monthly

---

### KG-02 — Pattern Library Size

**Definition**: Number of active patterns in the Pattern Library.  
**Formula**: `count(patterns with status = ACTIVE)`  
**Source**: `04_PATTERN_LIBRARY.md`  
**Target**: Grow by ≥ 2 patterns per quarter  
**Measurement Period**: Quarterly

---

### KG-03 — Knowledge Gap Rate

**Definition**: Percentage of audited conversations where `root_cause_category = RC-K` (knowledge gap).  
**Formula**: `count(issues with root_cause_category = RC-K) / count(total issues) × 100`  
**Target**: Declining over time; steady state < 10%  
**Measurement Period**: Monthly

---

## Governance Health Metrics

### GH-01 — Proposal Approval Rate

**Definition**: Percentage of proposals that are approved (vs. rejected).  
**Formula**: `count(proposals with status = RELEASED OR CLOSED) / count(proposals with final status) × 100`  
**Target**: 70–90% (too high may mean insufficient review rigor; too low may mean poor proposal quality)  
**Measurement Period**: Monthly

---

### GH-02 — Revision Rate

**Definition**: Percentage of proposals returned for revision before approval.  
**Formula**: `count(proposals with NEEDS_REVISION event) / count(total proposals) × 100`  
**Target**: < 30% (high revision rate indicates poor proposal quality)  
**Measurement Period**: Monthly

---

### GH-03 — Sensitive Change Review Rate

**Definition**: Percentage of sensitive proposals that received two independent approvals.  
**Formula**: `count(sensitive proposals with approver_1 AND approver_2 both populated) / count(is_sensitive = true proposals) × 100`  
**Target**: 100% — no exceptions  
**Alert Threshold**: < 100% is a governance failure

---

## Regression Safety Metrics

### RS-01 — Regression Test Coverage

**Definition**: Percentage of closed issues that have at least one linked regression test.  
**Formula**: `count(issues with regression_tests NOT empty AND status = CLOSED) / count(issues with status = CLOSED) × 100`  
**Target**: ≥ 95%  
**Alert Threshold**: < 85%

---

### RS-02 — Zero Regression Rate

**Definition**: Percentage of releases that passed all regression tests on first attempt.  
**Formula**: `count(releases with no regression failures) / count(total releases) × 100`  
**Target**: ≥ 90%  
**Alert Threshold**: < 80%

---

## Metrics Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│              AIOS LEARNING METRICS DASHBOARD                         │
│                          [Weekly View]                               │
├─────────────────────────────────────────────────────────────────────┤
│  CONVERSATION QUALITY            │  LEARNING VELOCITY               │
│  ┌────────────────────────┐      │  ┌────────────────────────┐      │
│  │ Intent Accuracy: 94% ✓ │      │  │ Issues Open: 12 ✓      │      │
│  │ Answer Quality: 4.2 ✓  │      │  │ Avg Time to Issue: 2d ✓│      │
│  │ Trust Score: 4.6 ✓     │      │  │ Avg Time to Propose: 4d│      │
│  │ Repeat Q Rate: 3% ✓    │      │  │ Improvements/Mo: 5 ✓   │      │
│  │ Completion Rate: 72% ✓ │      │  └────────────────────────┘      │
│  └────────────────────────┘      │                                  │
├─────────────────────────────────────────────────────────────────────┤
│  GOVERNANCE HEALTH               │  REGRESSION SAFETY               │
│  ┌────────────────────────┐      │  ┌────────────────────────┐      │
│  │ Approval Rate: 82% ✓   │      │  │ Test Coverage: 97% ✓   │      │
│  │ Revision Rate: 18% ✓   │      │  │ Zero Regression: 93% ✓ │      │
│  │ Sensitive 2x: 100% ✓   │      │  └────────────────────────┘      │
│  └────────────────────────┘      │                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Metric Collection Cadence

| Cadence | Metrics |
|---|---|
| **Weekly** | CQ-01, CQ-02, CQ-03, CQ-04, CQ-05, CQ-06, CQ-08, LV-01 through LV-05 |
| **Monthly** | CQ-07, CQ-09, CQ-10, KG-01, KG-03, GH-01, GH-02, GH-03, RS-01, RS-02 |
| **Quarterly** | KG-02, trend analysis across all metrics |

---

## Metric Review Meeting

A **monthly Learning Review** should cover:
1. All metrics against targets — identify outliers
2. Top 3 open issues by severity
3. Proposals awaiting review (blocked?)
4. Release retrospective — what shipped last month?
5. Forecast: what is expected to ship next month?

---

## Cross References

- `02_CONVERSATION_AUDIT.md` — Source data for CQ metrics
- `03_IMPROVEMENT_DATABASE.md` — Source data for LV metrics
- `07_ACCEPTANCE_PROCESS.md` — Source data for GH metrics
- `10_CONTINUOUS_IMPROVEMENT.md` — How metrics feed back into the cycle

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release with 19 metrics |
