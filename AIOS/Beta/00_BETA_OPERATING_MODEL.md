# 00 — Beta Operating Model

**Document ID**: AIOS-BETA-00  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief Product Officer + Human Product Owner

---

## 1. Mission

Transform AIOS from a technically validated development project into a continuously learning product that improves with every customer conversation.

Beta is not a phase where AIOS sits still waiting to be approved. Beta is a phase where AIOS actively generates intelligence that earns the right to serve a general audience.

---

## 2. Principles

**P1 — Every Conversation Is Data**  
No conversation is too short, too simple, or too strange to learn from. A one-message conversation that ends in drop-off is as valuable as a full lead capture flow. Both tell us something.

**P2 — Learning Is the Primary Job**  
During Beta, learning is more important than volume. Ten well-reviewed conversations that generate three improvements are worth more than 100 unreviewed conversations.

**P3 — Human Oversight Is Non-Negotiable**  
All changes to AI behavior during Beta require human approval. The system may identify patterns and propose improvements, but it may not deploy them without sign-off. See `AIOS/Learning/07_ACCEPTANCE_PROCESS.md`.

**P4 — Fix P0 Before Adding P1**  
No new capability is added while a P0 issue (trust failure, medical compliance failure, hallucination) is open. Customer safety and trust always precede commercial improvement.

**P5 — Truth Before Comfort**  
If Beta data shows AIOS is underperforming, that is a gift — not a failure. An honest assessment of Beta performance is more valuable than an optimistic one. Report what the data says.

**P6 — Architecture Protects the Future**  
Every change during Beta must comply with the SSI governance in `AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md`. Short-term fixes that violate architecture create long-term debt.

---

## 3. Daily Operating Cycle

```
06:00  Automated: Conversation logs available in KV
        ↓
Morning Review (Human, 15-30 min)
        Review: New conversations from prior day
        Flag: Any P0 issues (trust, medical, hallucination)
        Note: Knowledge gaps, memory failures, confusing responses
        ↓
Action Triage (Human)
        P0 → Fix immediately before any other work
        P1 → Create issue in issueDatabase; assign owner
        P2 → Log in weekly review backlog
        ↓
Mid-day (if P0 fix required)
        Implement fix (runtime, knowledge, or ACP)
        Run full test suite (321 tests must pass)
        Deploy
        ↓
End of Day
        Update daily review template (07_DAILY_REVIEW_TEMPLATE.md)
        Confirm no open P0 issues
```

---

## 4. Weekly Operating Cycle

```
Monday
  Review prior week's conversation log summary
  Identify Top 10 issues by category and severity
  Set improvement priorities for the week
  ↓
Tuesday–Thursday
  Implement approved improvements (P0 and P1)
  Update knowledge documents (if change approved)
  Update ACP decision rules (if change approved)
  Run regression tests after each change
  ↓
Friday
  Produce weekly report (08_WEEKLY_REPORT_TEMPLATE.md)
  Review learning metrics (pattern count, issue resolution rate)
  Confirm roadmap progress
  Prepare next week's priorities
  Human Product Owner reviews and approves weekly report
```

---

## 5. Monthly Review

The monthly review is a strategic checkpoint — not a fix session.

**Agenda:**
1. Architecture Review — is the intelligence layer healthy? Any new SSI violations?
2. Learning Review — how many patterns identified? How many Change Proposals approved?
3. Commercial Review — is the lead pipeline improving? Qualification rate? Handoff quality?
4. Product Review — which capabilities are performing? Which are underperforming?
5. Roadmap Review — are P0/P1 items progressing? What moves to P2?
6. Exit Criteria Check — are we moving toward Production readiness?

**Output:**
- Updated `07_INTELLIGENCE_ROADMAP.md` (Intelligence layer)
- Updated `06_RELEASE_CRITERIA.md` (promotion status)
- Monthly Human Product Owner sign-off

---

## 6. Roles

| Role | Responsibility | Authority |
|---|---|---|
| **Human Product Owner** | Final approval of all behavioral changes; sets priorities; defines exit criteria | Highest — no change to AI behavior without sign-off |
| **Chief AI Architect** | Architecture compliance; SSI enforcement; intelligence design | Architecture decisions; escalates product decisions to HPO |
| **Lead Runtime Engineer** | P0 fixes; runtime implementation; test suite health | Code implementation within approved scope |
| **Knowledge Curator** | Knowledge gap identification; knowledge document updates | Knowledge recommendation; approval by HPO |
| **QA Lead** | Conversation review; regression testing; quality scoring | Review authority; flags but does not approve behavior changes |
| **Learning Intelligence Processor** | Pattern recognition; Change Proposal generation; audit scoring | Proposes only; no self-approval |

All roles are defined in `AIOS/Architecture-Office/AI_OPERATING_MODEL.md`.

---

## 7. Decision Authority

| Decision Type | Who Decides |
|---|---|
| Deploy a P0 fix (non-behavioral: KV, logging, type fix) | Lead Runtime Engineer |
| Deploy a P0 fix (behavioral: trust, medical, response change) | Chief AI Architect + Human Product Owner |
| Add a P1 capability | Chief AI Architect recommends; Human Product Owner approves |
| Update knowledge document | Knowledge Curator proposes; Human Product Owner approves |
| Update ACP decision rules | Full Change Proposal process (`Learning/06_CHANGE_PROPOSAL.md`) |
| Change exit criteria | Human Product Owner only |
| Promote to Release Candidate | Human Product Owner only |
| Promote to Production | Human Product Owner only |

---

## 8. Relationship with Intelligence Domains

Beta operations interact with all 7 intelligence domains from `AIOS/Intelligence/02_INTELLIGENCE_TAXONOMY.md`:

| Intelligence | Beta Interaction |
|---|---|
| **Conversation Intelligence** | Primary source of Beta learning data — every conversation turn is evidence |
| **Customer Intelligence** | Measures memory recall rate; Re-ask rate; Profile completeness at handoff |
| **Commercial Intelligence** | Measures lead timing, qualification rate, recommendation acceptance, conversion |
| **Product Intelligence** | Measures knowledge gap rate; identifies missing knowledge documents |
| **Learning Intelligence** | Owns the Beta learning cycle — audit → pattern → proposal → approval → deploy |
| **Business Intelligence** | Provides Beta KPI reporting; business health score; drop-off analysis |
| **Advisor Intelligence** | Measures handoff quality; advisor brief completeness; post-handoff outcomes |

---

## 9. Relationship with Runtime

Beta does NOT modify the Gen1 runtime architecture. Beta consumes what the runtime produces:
- `[CONV_LOG]` — conversation turn data
- `[MEMORY_HISTORY]` — memory resolution trace
- `[AUDIT_ENQUEUE]` — quality record
- `[ISSUE_CREATE]` — issue registry

Beta's output (improved knowledge, rules, patterns) feeds BACK into the runtime via:
- Updated ACP documents (read by runtime capability loader)
- Updated knowledge documents (read by knowledge resolver)
- Updated conversation patterns (consumed by strategy engine)

**The runtime serves the learning cycle. The learning cycle improves the runtime.**

---

## 10. Success Definition

Beta is successful when:
1. AIOS can reliably handle real conversations without P0 issues
2. AIOS has demonstrated measurable improvement over baseline within the Beta period
3. The Learning System has produced and deployed at least 5 approved improvements
4. Commercial metrics meet minimum thresholds (see `05_SUCCESS_CRITERIA.md`)
5. The Human Product Owner is confident to invite the general public

Success is NOT defined as: zero bugs, perfect conversations, or complete implementation of all P2/P3 capabilities.
