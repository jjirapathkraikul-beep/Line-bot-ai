# 07 — Acceptance Process

**Document ID**: AIOS-LEARN-07  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the human governance model for accepting and rejecting AI improvement proposals. This document establishes who can approve what, how proposals move through review stages, and what conditions must be met at each gate.

---

## Scope

All Change Proposals in the Learning System. No exception. The AI system may draft proposals and collect evidence; it may never approve or implement its own proposals.

---

## Core Governance Rule

> **AI proposes. Human approves. AI never self-approves runtime behavior.**

This rule is non-negotiable and applies regardless of confidence level, urgency, or priority.

---

## Acceptance Stages

```
DRAFT → READY_FOR_REVIEW → IN_REVIEW → APPROVED → IN_PROGRESS → IMPLEMENTED → REGRESSION_TESTED → RELEASED → ARCHIVED
                                            ↓               
                                        REJECTED ──────→ ARCHIVED
                                            ↓
                                     NEEDS_REVISION ──→ DRAFT
```

### Stage Definitions

| Stage | Description | Owner | Duration Limit |
|---|---|---|---|
| `DRAFT` | Proposal is being written | Proposer | No limit |
| `READY_FOR_REVIEW` | Complete proposal, pending reviewer assignment | Proposer → Coordinator | 48h |
| `IN_REVIEW` | Assigned reviewer is evaluating | Reviewer(s) | 5 business days |
| `APPROVED` | Change approved; awaiting implementation | Learning Architect | — |
| `IN_PROGRESS` | Implementation underway | Implementer | Per estimate |
| `IMPLEMENTED` | Change deployed to AIOS | Implementer | — |
| `REGRESSION_TESTED` | All required tests pass | QA / Proposer | 48h |
| `RELEASED` | Included in a named AIOS release | Release Manager | — |
| `ARCHIVED` | Closed, complete record preserved | — | — |
| `REJECTED` | Not approved; reason documented | Reviewer | — |
| `NEEDS_REVISION` | Returned for more work before re-review | Reviewer → Proposer | — |

---

## Approval Authority

### Standard Proposal (non-sensitive)

Requires **one human approver** from the Approval Authority Table.

### Sensitive Proposal

Any proposal marked `is_sensitive: true` requires **two independent human approvers**. The two approvers must not be the same person.

Sensitive triggers:
- Change affects medical or health-related responses
- Change affects trust/fraud/identity verification responses
- Change affects compliance or regulatory language
- Change affects handoff to human agent
- Change removes or weakens a customer protection rule

---

## Approval Authority Table

| Change Scope | Minimum Approver Level | Sensitive: Additional Approver |
|---|---|---|
| `KNOWLEDGE` | Domain Owner | Chief AI Learning Architect |
| `DECISION` | AI Architect | Chief AI Learning Architect |
| `CAPABILITY` | AI Architect | Chief AI Learning Architect |
| `MEMORY` | AI Architect | Domain Owner |
| `PROMPT` | Chief AI Learning Architect | AI Architect |
| `PATTERN` | Chief AI Learning Architect | AI Architect |
| `PROCESS` | Operations Lead | Chief AI Learning Architect |

---

## Gate Conditions

### Gate 1: DRAFT → READY_FOR_REVIEW

All of the following must be true:

- [ ] `linked_issue_ids` contains at least one issue ID
- [ ] `linked_rca_id` is populated with a completed RCA
- [ ] `problem_statement` clearly states the customer-facing problem
- [ ] `conversation_references` contains at least one conversation ID
- [ ] `recommended_change` is specific (not "improve AI behavior")
- [ ] `current_behavior` and `proposed_behavior` are both explicitly stated
- [ ] `risk_level` is assigned
- [ ] `rollback_plan` is documented
- [ ] `acceptance_criteria` contains at least 2 verifiable criteria
- [ ] For sensitive proposals: `is_sensitive: true` is set

### Gate 2: READY_FOR_REVIEW → APPROVED

Reviewer must confirm:

- [ ] Problem is real and evidenced by conversation references
- [ ] Root cause is correctly identified (not a symptom)
- [ ] Proposed change will actually address the root cause
- [ ] Migration impact is understood and acceptable
- [ ] Risk level is appropriate
- [ ] Rollback plan is executable
- [ ] New regression tests are adequate for the change
- [ ] No higher-priority pattern or proposal already covers this

For sensitive proposals, **second approver must independently review** all of the above.

### Gate 3: IMPLEMENTED → REGRESSION_TESTED

- [ ] All regression tests from `regression_tests_required` pass
- [ ] All new tests from `new_tests_required` pass and are committed
- [ ] No existing passing tests were broken (zero regressions)
- [ ] `next build` or equivalent build command passes cleanly
- [ ] Implementation matches the `proposed_behavior` described in the proposal

### Gate 4: REGRESSION_TESTED → RELEASED

- [ ] Change is included in a named release (`RELEASE-YYYY-MM-DD-vN`)
- [ ] Release Notes entry is written (`09_RELEASE_NOTES.md`)
- [ ] Issue status updated to `VERIFIED`
- [ ] Conversation reference lessons are documented in Pattern Library if applicable

---

## Rejection Criteria

A proposal may be rejected for any of the following reasons:

| Rejection Code | Description |
|---|---|
| `REJ-001` | Insufficient evidence — fewer than 1 conversation reference |
| `REJ-002` | Root cause not confirmed — hypothesis only, no RCA |
| `REJ-003` | Proposed change does not address the stated root cause |
| `REJ-004` | Migration impact is unacceptable (risk > benefit) |
| `REJ-005` | Duplicate — another proposal already covers this |
| `REJ-006` | Out of scope — change belongs in Application layer, not AIOS |
| `REJ-007` | Insufficient testing plan |
| `REJ-008` | Change conflicts with AIOS Core principles |

---

## Revision Criteria

A proposal is returned for revision (NEEDS_REVISION) when it is close to approvable but requires specific improvements:

- `current_behavior` is vague — needs exact quote from code/transcript
- `proposed_behavior` is ambiguous — needs precise specification
- `acceptance_criteria` are not testable
- `rollback_plan` is "revert the change" without specifics
- Additional conversation evidence is needed to confirm occurrence count

---

## RACI Matrix

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Conversation Audit | Learning System (auto) / Human (manual) | Chief AI Learning Architect | — | Domain Owner |
| Issue Creation | Learning System (auto) / Human (manual) | Chief AI Learning Architect | — | Domain Owner |
| RCA | Learning Architect | Chief AI Learning Architect | AI Architect | — |
| Proposal Drafting | Learning Architect | Chief AI Learning Architect | Domain Owner | — |
| Proposal Review | Designated Reviewer | Approver | Learning Architect | — |
| Approval Decision | Human Approver | Human Approver | — | Learning Architect |
| Implementation | Implementer | AI Architect | — | Learning Architect |
| Regression Testing | QA / Proposer | AI Architect | — | Learning Architect |
| Release | Release Manager | Chief AI Learning Architect | — | All stakeholders |

---

## Review Timeline Standards

| Priority | Target Review Time | Maximum Review Time |
|---|---|---|
| P1 | 1 business day | 2 business days |
| P2 | 3 business days | 5 business days |
| P3 | 5 business days | 10 business days |

If a review exceeds maximum time, the proposal is escalated to the Chief AI Learning Architect.

---

## Emergency Change Process

For P1 issues where the standard review timeline would cause significant customer harm, an Emergency Change may be approved with:

1. **One approver** (instead of two, even for sensitive topics)
2. **Post-implementation review** within 24 hours by the second approver
3. **Explicit risk acknowledgment** signed by the approving human

Emergency changes must still meet all Gate 1 requirements before proceeding.

---

## Archive Policy

All proposals — approved or rejected — are archived permanently. Archives may not be modified after `ARCHIVED` status is set. Archives serve as:
- Audit trail for governance purposes
- Learning material for future proposal authors
- Evidence of what was tried and what was rejected

---

## Governance Exceptions

No exceptions to the Human Approval requirement are permitted. If a situation arises where the process cannot be followed (e.g., no human reviewer available), the change must wait. The system does not deploy changes autonomously under any circumstances.

---

## Cross References

- `06_CHANGE_PROPOSAL.md` — What proposals look like
- `08_LEARNING_METRICS.md` — Approval rate and velocity metrics
- `09_RELEASE_NOTES.md` — What happens after RELEASED
- `01_LEARNING_PHILOSOPHY.md` — Principle 2 (Human-in-the-Loop)

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
