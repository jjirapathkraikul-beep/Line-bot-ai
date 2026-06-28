# 07 — Future Impact Assessment

**Document ID**: AIOS-AGS-07  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `01_ARCHITECTURE_GATES.md` Gate 6 — Future Impact

---

## Purpose

Define the scoring framework the Architecture Guardian uses to evaluate the 5-year architectural impact of every proposed AIOS change.

**Core premise**: Every decision made today is a constraint on every decision that can be made tomorrow. The Future Impact Assessment quantifies that constraint before it is created.

---

## 1. Assessment Categories

The Future Impact Assessment scores eight categories. Each category is scored on a 0–10 scale. The total is normalized to 100.

---

### Category 1 — Maintainability (Weight: 20%)

**Question**: Will this component be harder or easier to maintain in 2 years?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Reduces maintenance burden; self-documenting; minimal dependencies |
| 7–8 | Maintainable with minor effort; documentation sufficient |
| 5–6 | Neutral; no better or worse than current |
| 3–4 | Adds maintenance burden; requires specialist knowledge or frequent updates |
| 1–2 | Significantly increases maintenance; fragile; hard to understand |
| 0 | Creates ongoing maintenance debt that will grow without bounds |

**Evidence questions:**
- How many files must change when this component needs to be updated?
- Does this component have clear boundaries, or does it blur into adjacent components?
- Is there someone who will own maintaining this in 1 year?
- What happens to this component when the AI model changes?

---

### Category 2 — Scalability (Weight: 20%)

**Question**: Does this component scale as AIOS grows to multiple domains and higher conversation volume?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Works across all AIOS domains without modification; handles 100× current volume |
| 7–8 | Works across most domains; minor adaptation required for new domains |
| 5–6 | Works for current domain; adaptation needed for each new domain |
| 3–4 | Hardcoded to current domain; significant rework for expansion |
| 1–2 | Only works for Insurance; fundamentally incompatible with other domains |
| 0 | Cannot scale; creates scaling bottleneck for the entire system |

**Evidence questions:**
- Does this component reference Insurance-specific terms, rates, or products?
- Does this work the same way for a Tax advisor AIOS as for an Insurance advisor AIOS?
- Does this component create any shared state that would become a bottleneck at scale?

---

### Category 3 — Testability (Weight: 15%)

**Question**: Can this component be reliably tested in isolation and in integration?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Fully unit-testable; has or will have test coverage; deterministic |
| 7–8 | Testable with minor setup; most paths coverable |
| 5–6 | Partially testable; some paths require integration setup |
| 3–4 | Difficult to test; requires complex mocking or real external dependencies |
| 1–2 | Not reliably testable; behavior is non-deterministic or untestable |
| 0 | Cannot be tested; creates untestable behavior in the system |

**Evidence questions:**
- Can this be tested with the existing test infrastructure (`npm test`)?
- Does this have side effects that make testing difficult?
- Can a regression test be written for the specific scenario this capability addresses?

---

### Category 4 — Reusability (Weight: 10%)

**Question**: Can this component be reused by other parts of AIOS without modification?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Pure reusable capability; used by multiple consumers without modification |
| 7–8 | Reusable with minor configuration; designed for reuse |
| 5–6 | Partially reusable; some domain-specific logic present |
| 3–4 | Mostly specific; reuse requires significant modification |
| 1–2 | Single-use component; no general applicability |
| 0 | Designed for exactly one scenario; creates no reusable value |

---

### Category 5 — Governance (Weight: 10%)

**Question**: Does this component add governance complexity that grows over time?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Extends existing governance cleanly; no new governance overhead |
| 7–8 | Adds minor governance overhead with clear ownership |
| 5–6 | Adds moderate governance overhead; owner is defined |
| 3–4 | Adds significant governance overhead; owner is unclear |
| 1–2 | Difficult to govern; creates ownership ambiguity or SSI conflict risk |
| 0 | Ungovernable by design; will compound into chaos |

---

### Category 6 — Migration Cost (Weight: 10%)

**Question**: What would it cost to change or remove this component in 2 years?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Trivially replaceable; removal requires changing one file |
| 7–8 | Replaceable within one sprint; few dependencies |
| 5–6 | Replaceable within one month; moderate dependencies |
| 3–4 | Replacement requires 1+ sprints and migration plan |
| 1–2 | Difficult to replace; tightly coupled to multiple components |
| 0 | Cannot be removed without significant system rewrite |

---

### Category 7 — Technical Debt (Weight: 10%)

**Question**: How much technical debt does this component create?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Zero known technical debt introduced |
| 7–8 | Minor technical debt; self-contained; cleanup plan defined |
| 5–6 | Moderate debt; acknowledged and registered in Debt Register |
| 3–4 | Significant debt; multiple known issues; no cleanup plan |
| 1–2 | High debt; creates downstream debt in other components |
| 0 | Net negative; creates more debt than value delivered |

---

### Category 8 — Business Value Durability (Weight: 5%)

**Question**: Will this component still deliver business value in 5 years?

**Scoring guide:**

| Score | Meaning |
|---|---|
| 9–10 | Core capability; will be needed regardless of product evolution |
| 7–8 | High probability of continued relevance |
| 5–6 | Moderate probability; could be displaced by product changes |
| 3–4 | Low probability; solving a problem that may become irrelevant |
| 1–2 | Solving a problem specific to today's constraints |
| 0 | Addresses a problem that will disappear in the near term |

---

## 2. Scoring Calculation

```
Future Impact Score =
  (Cat1 × 0.20) +
  (Cat2 × 0.20) +
  (Cat3 × 0.15) +
  (Cat4 × 0.10) +
  (Cat5 × 0.10) +
  (Cat6 × 0.10) +
  (Cat7 × 0.10) +
  (Cat8 × 0.05)

× 10 (to normalize from 0–10 scale to 0–100 scale)
```

---

## 3. Score Interpretation

| Score | Interpretation | Guardian Action |
|---|---|---|
| 80–100 | Excellent future architecture | APPROVE |
| 70–79 | Good future architecture | APPROVE |
| 60–69 | Acceptable, with awareness | APPROVE WITH CONDITIONS: register any debt |
| 50–59 | Borderline; redesign recommended | REQUEST REVISION: improve design before approval |
| 40–49 | Poor future architecture | REQUEST REVISION: substantial redesign required |
| 20–39 | Significant architectural concern | REJECT unless HPO acknowledges and accepts risk |
| 0–19 | Architecture liability | REJECT; not viable as proposed |

---

## 4. Assessment Form

Complete this form as Gate 6 evidence.

```markdown
## Future Impact Assessment

Proposal ID: ACP-YYYY-NNN  
Assessed by: [Name/Role]  
Date: YYYY-MM-DD  

### Category Scores

| Category | Weight | Score (0–10) | Weighted |
|---|---|---|---|
| 1. Maintainability | 20% | | |
| 2. Scalability | 20% | | |
| 3. Testability | 15% | | |
| 4. Reusability | 10% | | |
| 5. Governance | 10% | | |
| 6. Migration Cost | 10% | | |
| 7. Technical Debt | 10% | | |
| 8. Business Value Durability | 5% | | |
| **Total** | **100%** | | **___ / 100** |

### Technical Debt Identified
[List specific technical debt, or "None"]

### Architecture Debt Identified
[List specific architecture debt, or "None"]

### Debt Register Required?
[ ] Yes — Debt ID(s): ___________
[ ] No

### 5-Year Outlook
[One paragraph: what does AIOS look like with this component in 5 years?]

### Removal Scenario
[One paragraph: if this component needed to be removed in 2 years, what would that require?]

### Domain Scalability Confirmation
[ ] Confirmed: works across all AIOS domains without modification
[ ] Domain-specific: __________ (reason documented)
```

---

## 5. Special Assessment: AI-Generated Architecture Drift

Every proposal generated by an AI system (Claude, ChatGPT, or any future AI) must include an additional drift check:

**Drift check questions:**

1. Does this proposal introduce any naming convention not found in existing AIOS documents?
2. Does this proposal introduce any structural pattern not established in AIOS?
3. Does this proposal use any terminology that conflicts with AIOS canonical vocabulary?
4. Does this proposal reference any authority, framework, or source not already part of AIOS?

If YES to any: the proposal must explicitly justify the deviation and obtain Guardian confirmation before proceeding.

AI-generated drift is insidious because it looks like progress. New terminology, new structural patterns, new frameworks — each is plausible in isolation. Together, they erode the architectural coherence that makes AIOS governable.

**Guardian posture on AI drift**: Skeptical by default. Every deviation from established AIOS patterns requires justification. The burden of proof is on the new pattern, not on the established one.
