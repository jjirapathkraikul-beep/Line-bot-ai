# 13 — Context Validation

**Document ID**: AIOS-ACE-13  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines the validation rules ACE applies to the assembled `ExecutionContext` before it is sent to the LLM (Step 14 of the assembly pipeline).

Validation ensures the context is complete, safe, consistent, and ready for LLM consumption.

---

## Validation Rule Categories

### Category A: Structural Completeness (HARD)

These checks verify the context schema is populated with required fields.

| Rule ID | Check | Failure Type |
|---|---|---|
| VAL-A-01 | `selected_capabilities.primary` is populated | HARD |
| VAL-A-02 | `decision.action` is set to a valid action from the taxonomy | HARD |
| VAL-A-03 | `response_profile.tone` is set | HARD |
| VAL-A-04 | `response_profile.question_strategy` is set | HARD |
| VAL-A-05 | `restrictions.hard_prohibitions` is not empty (minimum global prohibitions present) | HARD |
| VAL-A-06 | `request.normalized_input` is not empty | HARD |
| VAL-A-07 | `selected_conversation_patterns.patterns` includes CID-20 master patterns | HARD |

**On HARD failure**: Stop pipeline; produce SAFE_FALLBACK context.

---

### Category B: Safety Rules (HARD)

These checks verify that safety constraints are not violated.

| Rule ID | Check | Failure Type |
|---|---|---|
| VAL-B-01 | If `trust_profile.trust_concern_active = true` AND `turns_since_trust_concern < 2` → `decision.action` must NOT be `COLLECT_LEAD` | HARD |
| VAL-B-02 | If `trust_profile.trust_concern_active = true` → `cta_allowed = false` | HARD |
| VAL-B-03 | If `risk_profile.emergency_detected = true` → `decision.action` must be `EMERGENCY_GUIDE` or `HANDOFF` | HARD |
| VAL-B-04 | If `risk_profile.medical_concern_active = true` → `restrictions.hard_prohibitions` must include medical guarantee prohibition | HARD |
| VAL-B-05 | If `detected_intent.primary = "product_investment"` → `restrictions.hard_prohibitions` must include investment return guarantee prohibition | HARD |
| VAL-B-06 | If `decision.action = COLLECT_LEAD` → `trust_profile.lead_capture_allowed = true` must be verified | HARD |
| VAL-B-07 | If `decision.action = COLLECT_LEAD` → field being requested must NOT be in `lead_profile.fields_captured` | HARD |

**On HARD failure**: Override decision or context; log critical violation; do NOT send unsafe context to LLM.

---

### Category C: Consistency Rules (SOFT)

These checks verify internal consistency of the assembled context.

| Rule ID | Check | Failure Type |
|---|---|---|
| VAL-C-01 | `selected_capabilities.priority = CRITICAL` → `decision.action` should be `BUILD_TRUST` or `EMERGENCY_GUIDE` | SOFT |
| VAL-C-02 | `emotion.empathy_required = true` → `response_profile.empathy_level` should be at least `medium` | SOFT |
| VAL-C-03 | `decision.action = RECOMMEND` → `memory.known_facts` should contain age + budget (soft requirement for good recommendation) | SOFT |
| VAL-C-04 | `conversation.unresolved_question` is set → current response should address it or explicitly defer it | SOFT |
| VAL-C-05 | `response_profile.question_strategy = one_question` → `decision.constraints` should not produce more than one question | SOFT |
| VAL-C-06 | `lead_profile.fields_captured` is not empty → `decision` should not re-request any of those fields | SOFT |

**On SOFT failure**: Log warning in `debug.validation_errors`; proceed with context.

---

### Category D: Knowledge Quality (SOFT)

| Rule ID | Check | Failure Type |
|---|---|---|
| VAL-D-01 | All `selected_knowledge.sources` have a registered source ID in SR-04 | SOFT |
| VAL-D-02 | No duplicate knowledge facts from different sources | SOFT |
| VAL-D-03 | Knowledge relevance scores are all ≥ 0.5 | SOFT |
| VAL-D-04 | Tax knowledge source review date is within 12 months | SOFT |
| VAL-D-05 | Medical knowledge excerpt contains uncertainty language | SOFT |

---

### Category E: Content Safety (HARD)

| Rule ID | Check | Failure Type |
|---|---|---|
| VAL-E-01 | No LINE-specific data (webhook tokens, user display names from LINE) in knowledge or decision context | HARD |
| VAL-E-02 | No application infrastructure details in context | HARD |
| VAL-E-03 | PII fields (phone, raw name) not present in `debug` or `analytics` output | HARD |
| VAL-E-04 | No fabricated product performance data in knowledge excerpts | HARD |

---

## Validation Result Actions

| Result | Action |
|---|---|
| All HARD rules pass + all SOFT rules pass | Proceed to LLM |
| All HARD rules pass + some SOFT rules fail | Proceed to LLM; log soft failures |
| Any HARD rule fails (non-safety) | Fix and re-validate; escalate if not fixable |
| Any HARD safety rule fails (B or E) | Produce SAFE_FALLBACK context; log critical |
| Multiple HARD failures | Do not send to LLM; return error state |

---

## SAFE_FALLBACK Context

When validation fails critically, ACE produces a minimal safe fallback:

```
decision.action = FALLBACK
response_profile = {
  tone: "empathetic",
  length: "short",
  thai_response: true,
  answer_first: true,
  question_strategy: "no_question"
}
restrictions.hard_prohibitions = [all global prohibitions]
```

The LLM generates a response like:
> "ขอโทษด้วยนะครับ ตอนนี้ระบบกำลังปรับปรุงอยู่ครับ มีอะไรให้ช่วยเพิ่มเติมไหมครับ?"

---

## Validation Log Entry Format

```
{
  audit_id: string,
  timestamp: ISO8601,
  validation_passed: boolean,
  rules_evaluated: integer,
  hard_failures: string[],
  soft_failures: string[],
  action_taken: "proceed" | "fix_and_retry" | "safe_fallback"
}
```

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial validation rules — 28 rules across 5 categories |
