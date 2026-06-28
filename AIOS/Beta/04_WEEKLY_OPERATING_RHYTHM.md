# 04 — Weekly Operating Rhythm

**Document ID**: AIOS-BETA-04  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief Product Officer + Human Product Owner

---

## Purpose

Define the recurring operational rhythm for Beta. Consistency in review cadence is how AIOS avoids accumulating silent debt — quality problems that go unnoticed until they become trust failures.

**Rhythm creates learning. Learning creates improvement. Improvement earns production.**

---

## Every Day — Daily Operating Rhythm

### Morning Review (15-30 minutes)

**Who**: Human Product Owner (or designated reviewer)  
**When**: First thing each morning  
**Input**: Yesterday's conversation logs from Vercel KV

**Review checklist:**

```
□ How many conversations occurred yesterday?
□ Any P0 issues? (trust failure, hallucination, medical compliance violation)
  → If YES: Stop. Fix before proceeding. Do not continue daily review until P0 is resolved.
□ Any conversations where the bot said it could not see prior messages?
  → Flag: Memory failure (LS-02)
□ Any conversations where the bot re-asked something the customer already answered?
  → Flag: Memory failure (LS-02)
□ Any conversations where the bot gave a confusing or irrelevant answer?
  → Flag: conversation_flow issue in issueDatabase
□ Any product questions the bot could not answer well?
  → Flag: Knowledge gap (LS-01)
□ Any conversations that dropped off unexpectedly?
  → Flag: Drop-off analysis for weekly review
```

**Output:**
- P0 issues: immediate action
- P1/P2 issues: logged in issueDatabase
- Weekly backlog items: added to weekly review notes

---

### End of Day

```
□ All P0 issues resolved or in-progress with clear owner and ETA
□ Daily review template completed (07_DAILY_REVIEW_TEMPLATE.md)
□ Test suite run after any change (npm test — 321+ tests, 0 failures)
□ No new issues introduced by today's changes
```

---

## Every Week — Weekly Operating Rhythm

### Monday — Weekly Planning (30-45 minutes)

**Who**: Human Product Owner + Chief AI Architect  
**Input**: Prior week's conversation data, open issues, pattern backlog

**Top 10 Weekly Issues Review:**

The following 6 categories are reviewed and ranked by priority:

**1. Top Knowledge Gaps**
- Which product questions received a fallback or generic response?
- Which knowledge documents were referenced but missing?
- Which topics had zero relevant knowledge snippets?
- *Output*: Knowledge Curator creates update proposals for top 3 gaps

**2. Top Product Questions**
- What product-specific questions appeared most often?
- What terms, prices, or benefits were customers asking about?
- Were any factually incorrect responses given?
- *Output*: Product Intelligence update proposals

**3. Top Memory Problems**
- Which fields were most commonly re-asked despite being stated?
- How effective is conversation history loading? (fieldsFromHistory count)
- Are trust and medical flags being preserved across turns?
- *Output*: Customer Intelligence improvement proposals

**4. Top Conversation Problems**
- Which strategy transitions triggered incorrectly?
- Where did conversations have the highest fallback rate?
- Which turn patterns correlate with drop-off?
- *Output*: Conversation Intelligence pattern updates

**5. Top Conversion Opportunities**
- Which conversations got close to handoff but didn't complete?
- What was blocking the transition to READY?
- Where are objections concentrated?
- *Output*: Commercial Intelligence improvement proposals

**6. P0 Count Review**
- How many P0 issues occurred this week?
- Are they trending up or down?
- Are any recurring (same pattern multiple weeks)?
- *Output*: If P0 recurring: Architecture review required

---

### Tuesday–Thursday — Implementation

**For each approved improvement:**
```
1. Create Change Proposal (AIOS/Learning/06_CHANGE_PROPOSAL.md)
2. Implement change (knowledge update, ACP update, runtime fix)
3. Write regression test for the specific scenario
4. Run full test suite (npm test — 0 failures required)
5. Deploy
6. Observe: does the change appear in next conversation data?
```

---

### Friday — Weekly Close + Report

**Who**: Human Product Owner  
**Input**: Week's changes, metrics, issue status

**Weekly Report (08_WEEKLY_REPORT_TEMPLATE.md):**

```
□ Executive Summary (2-3 bullets: what improved, what concerns remain)
□ Conversation Metrics (total conversations, fallback rate, re-ask rate)
□ Learning Metrics (issues logged, patterns identified, proposals deployed)
□ Commercial Metrics (lead capture rate, handoff rate, qualification rate)
□ Business Metrics (KPIs vs targets)
□ Top Wins (what worked better than last week)
□ Top Risks (what needs attention next week)
□ Top Improvements (what was deployed this week)
□ Roadmap Progress (P0, P1 item status)
□ Next Week Priorities (top 3)
```

---

## Every Month — Monthly Strategic Review

**Who**: Human Product Owner + Chief AI Architect  
**When**: Last Friday of each month  
**Duration**: 2-3 hours  
**Input**: 4 weekly reports + all issue data + KPI trends

### Agenda

---

**1. Architecture Review (30 minutes)**

*Questions to answer:*
- Are there any new SSI violations introduced this month?
- Is the Gen1 runtime stable? Any recurring pipeline errors?
- Is the intelligence boundary map (`09_INTELLIGENCE_BOUNDARY_MAP.md`) still accurate?
- Are any V1 modules still blocking Gen1 independence?

*Output*: Architecture health rating (Green / Yellow / Red)

---

**2. Learning Review (30 minutes)**

*Questions to answer:*
- How many Change Proposals were approved and deployed this month?
- How many patterns were added to the Pattern Library?
- Is learning velocity improving (more proposals deployed per week than prior month)?
- Is the regression rate = 0?
- Are there any issues that have been open for > 3 weeks without resolution?

*Output*: Learning velocity score; Issue backlog health

---

**3. Commercial Review (30 minutes)**

*Questions to answer:*
- How did commercial KPIs trend this month vs. prior month?
- Is the lead qualification pipeline improving?
- Are handoffs resulting in advisor contact? (requires advisor feedback)
- Which commercial problems recurred and need architectural attention?

*Output*: Commercial pipeline health; Recommendation quality trend

---

**4. Product Review (30 minutes)**

*Questions to answer:*
- Which ACP packages performed well?
- Which ACP packages had the most quality issues?
- Are there customer needs that no current ACP serves?
- Which product knowledge documents need updating?

*Output*: ACP performance report; Knowledge update backlog

---

**5. Roadmap Review (30 minutes)**

*Questions to answer:*
- Are all P0 roadmap items complete?
- Are P1 items progressing on schedule?
- Do any P2 items need to be promoted to P1 based on Beta data?
- Are any items in P3 now irrelevant based on what Beta taught us?

*Output*: Updated roadmap priorities for next month

---

**6. Exit Criteria Check (15 minutes)**

*Questions to answer:*
- Are all technical exit criteria met?
- Are all learning exit criteria met?
- Are all commercial exit criteria met?
- Is the Human Product Owner confident to proceed to Release Candidate?

*Output*: Beta status (Continuing / Release Candidate Gate Triggered)

---

### Monthly Review Output

| Deliverable | Owner | Deadline |
|---|---|---|
| Monthly architecture health report | Chief AI Architect | End of review |
| Updated INTELLIGENCE_ROADMAP.md (if changes) | Chief AI Architect | Within 2 days |
| Updated RELEASE_CRITERIA.md status | Human Product Owner | End of review |
| Pattern Library entries added this month | Learning Intelligence | Within 2 days |
| Monthly business report | Business Intelligence | Within 1 day |
| Next month's top 5 priorities | Human Product Owner | End of review |
