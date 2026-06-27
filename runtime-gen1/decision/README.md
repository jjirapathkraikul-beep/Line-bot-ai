# Decision Engine

**Sprint**: Phase 10.5  
**Status**: PLANNING

## Purpose

Resolves the explicit `decision.action` from the 12-action taxonomy before the LLM call. The LLM executes the decision; it does not choose it.

## Responsibilities

- Read ACP Decision_Rules.md for the selected capability
- Apply priority overrides: trust signal → ACT-03; emergency → ACT-08
- Resolve constraints: no_lead_capture, one_question_max, answer_first_required
- Return decision.action + decision.rationale + decision.constraints

## Files to Create (Phase 10.5)

```
runtime-gen1/decision/
├── decisionEngine.ts       ← Main: context → decision.action
├── actionTaxonomy.ts       ← ACT-01 through ACT-12 definitions
└── constraintResolver.ts   ← Active constraint list builder
```

## Action Taxonomy (from AIOS/ContextEngine/11_DECISION_CONTEXT.md)

| Action | Trigger |
|---|---|
| ACT-01 ANSWER | Factual question, no follow-up needed |
| ACT-02 ANSWER_THEN_ASK | Answer + one follow-up |
| ACT-03 BUILD_TRUST | is_trust_signal = true (CRITICAL — no override) |
| ACT-04 EDUCATE | General product question |
| ACT-05 RECOMMEND | Need discovery complete + age + goal + budget |
| ACT-06 COLLECT_LEAD | Value delivered; trust safe; field not already captured |
| ACT-07 HANDOFF | Explicit request or post-lead |
| ACT-08 EMERGENCY_GUIDE | is_emergency = true (HIGH — no override) |
| ACT-09 CLAIM_GUIDE | claim_help intent |
| ACT-10 DISCOVERY | Intent unclear |
| ACT-11 REDIRECT | Topic change |
| ACT-12 FALLBACK | No match |

## Source Spec

- `AIOS/ContextEngine/11_DECISION_CONTEXT.md`
- `AIOS/Execution/05_DECISION_PIPELINE.md`
