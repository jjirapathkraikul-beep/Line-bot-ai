# 01 — Beta Strategy

**Document ID**: AIOS-BETA-01  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief Product Officer + Human Product Owner

---

## 1. Primary Goal

**Make AIOS a trustworthy, improving AI advisor — measured by customer experience and commercial outcomes.**

This is not a technical milestone goal. It is a product goal. Technical stability is a prerequisite, not the goal.

---

## 2. Beta Objectives

### Technical Objectives

| Objective | What Success Looks Like |
|---|---|
| Zero P0 issues in production | No trust failures, no hallucinations, no medical compliance violations reaching customers |
| Full Gen1 pipeline running | All 10 pipeline steps active; V1 traffic fully migrated or gracefully dual-running |
| Issue Database persisted to KV | Quality intelligence survives deployments (P0-01 from roadmap) |
| Analytics event emitter live | At least EVT-P01 and EVT-P06 emitting per turn (P0-05 from roadmap) |
| Knowledge CI validation | All knowledge path references validated in CI (P0-02 from roadmap) |
| Pattern Library populated | At least 5 patterns documented and active (P0-03 from roadmap) |

### Learning Objectives

| Objective | What Success Looks Like |
|---|---|
| Learning cycle operational | Conversation → Audit → Pattern → Proposal → Approval → Deploy is working |
| Minimum 5 deployed improvements | At least 5 Change Proposals approved and deployed from Beta data |
| Knowledge gaps mapped | All major knowledge gaps documented and either filled or in Change Proposal |
| Pattern Library grows to 15+ | Pattern Library exceeds 15 entries by end of Beta |
| Regression rate = 0 | No approved change introduces a new P0 or P1 issue |

### Commercial Objectives

| Objective | Target | Reference |
|---|---|---|
| Lead Capture Rate | ≥ 50% (new users reach `engaged` stage) | `KPI.md` → adjusted for Beta volume |
| Qualification Rate | ≥ 20% of engaged leads qualify | Conservative Beta target |
| Handoff Rate | ≥ 70% of qualified leads trigger handoff | Conservative Beta target |
| Re-ask Rate | ≤ 5% of turns re-ask a known field | Memory Intelligence target |
| Recommendation Delivery Rate | ≥ 60% of CONSIDERING+ customers receive a recommendation | Conversation quality |

### Architecture Objectives

| Objective | What Success Looks Like |
|---|---|
| Zero SSI violations introduced | No new duplicate capabilities created during Beta |
| Intelligence boundaries respected | All changes go through correct intelligence domain owner |
| V1 deprecation started | At least one V1 module formally deprecated with ADR |
| CustomerSession type defined | `RuntimeInput.session: unknown` resolved (P1-03) |

---

## 3. Non-Goals

The following are explicitly **out of scope for Beta**:

- Serving the general public at scale (Beta is controlled volume)
- Implementing all P2/P3 roadmap items
- Building a BI dashboard (observability is log-based during Beta)
- Multi-domain expansion (Insurance domain only during Beta)
- Revenue optimization algorithms (learn first, optimize later)
- Fully automated learning (human approval remains in loop throughout Beta)
- Perfect conversations (imperfect conversations that are reviewed and improved are more valuable)

---

## 4. Exit Criteria

Beta ends and Release Candidate begins when **all** of the following are true:

### Technical Exit Criteria

- [ ] P0 issues: 0 open in production for ≥ 14 consecutive days
- [ ] Test suite: 321+ tests, 0 failures on every deployment
- [ ] Issue Database: KV-persisted (P0-01 complete)
- [ ] Analytics events: EVT-P01 and EVT-P06 emitting per turn (P0-05 complete)
- [ ] Knowledge CI validation: Active and passing in CI (P0-02 complete)

### Learning Exit Criteria

- [ ] Learning cycle: At least one full loop completed (Conversation → Deploy)
- [ ] Approved improvements: ≥ 5 Change Proposals approved and deployed
- [ ] Pattern Library: ≥ 10 patterns documented
- [ ] Regression rate: 0 (no improvement caused a regression)

### Commercial Exit Criteria

- [ ] Re-ask Rate: ≤ 5% (Memory Intelligence working)
- [ ] Lead Capture Rate: ≥ 50% of new users
- [ ] Handoff Rate: ≥ 70% of qualified leads
- [ ] Trust Recovery Rate: ≥ 90% (trust concern handled correctly in ≥ 90% of cases)

### Human Product Owner Sign-off

- [ ] Human Product Owner has reviewed Beta performance report
- [ ] Human Product Owner is confident to invite general audience
- [ ] No open architectural concerns that could affect customer trust

---

## 5. Beta Timeline Reference

Beta does not have a fixed calendar end date. It ends when exit criteria are met.

**Estimated phases:**

| Phase | Duration Estimate | Goal |
|---|---|---|
| Beta Stabilization | Weeks 1-2 | P0 issues resolved; full pipeline running |
| Beta Learning | Weeks 3-6 | First learning cycle complete; 5 improvements deployed |
| Beta Optimization | Weeks 7+ | Commercial metrics improving; Pattern Library growing |
| Release Candidate Gate | When exit criteria met | Promote if all criteria pass |

These are estimates. Data drives the timeline, not the calendar.
