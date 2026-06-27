# 14 — Context Failure Handling

**Document ID**: AIOS-ACE-14  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how ACE handles failure conditions at each stage of the context assembly pipeline. Failure handling must be predictable, safe, and auditable.

---

## Failure Handling Principles

1. **Fail safely, not silently**: Every failure must produce a context that results in a helpful (if limited) response. Never produce a context that could cause a harmful output.

2. **Degrade gracefully**: Loss of one knowledge source should not collapse the entire context. Reduce quality without losing safety.

3. **Fail open on knowledge; fail closed on restrictions**: If knowledge is missing, proceed with less. If restriction enforcement fails, stop.

4. **Every failure is a learning signal**: All failure events must be logged in `analytics` and sent to the audit layer for Learning Layer review.

---

## Failure Catalog

### FC-01: Missing ACP

**Trigger**: Selected ACP document not found in `AIOS/CapabilityPackages/`  
**Severity**: HIGH  
**Handling**:
1. Log `ACP_NOT_FOUND` in `debug`
2. Fall back to ACP-20 EDGE_CASE_HANDLER
3. Set `decision.action = FALLBACK`
4. Continue pipeline from Step 06 with ACP-20
5. Send alert to Learning Layer

---

### FC-02: Missing Required Knowledge

**Trigger**: Knowledge document in ACP Knowledge_Map is not found  
**Severity**: MEDIUM  
**Handling**:
1. Mark source as `source_unavailable` in `selected_knowledge`
2. Log `KNOWLEDGE_SOURCE_MISSING` in `debug`
3. Continue with available knowledge
4. If NO knowledge sources available: continue with patterns + restrictions only
5. Flag `debug.knowledge_sources_selected = 0`

**Note**: The LLM will produce a more general response. This is acceptable degradation.

---

### FC-03: Memory Store Unavailable

**Trigger**: Session KV store is unreachable (timeout, network error)  
**Severity**: MEDIUM  
**Handling**:
1. Log `MEMORY_UNAVAILABLE` in `debug`
2. Set all `lead_profile` fields to null
3. Set `memory.required_fields_present = false`
4. Set `trust_profile.trust_concern_active = false` (assume no prior trust concern)
5. Set `session.turn_count = 1` (treat as new session)
6. Continue pipeline
7. **CRITICAL**: Do NOT assume fields captured; do NOT trigger COLLECT_LEAD for fields that might have been captured

**Known risk**: Without memory, known-field protection fails. The LLM may re-ask fields the customer gave before. This is a quality degradation, not a safety failure — logged and monitored.

---

### FC-04: Conflicting Context

**Trigger**: Two capability restrictions contradict each other  
**Example**: ACP-09 says "recommend product"; ACP-08 interrupt says "no product mention"  
**Severity**: MEDIUM  
**Handling**:
1. Apply the more restrictive rule
2. Log `RESTRICTION_CONFLICT` in `debug` with both rules
3. Override `decision.action` to the most restrictive action
4. Continue pipeline

**Rule**: When in doubt, apply more restriction, not less.

---

### FC-05: Stale Knowledge

**Trigger**: Knowledge source's `last_reviewed` date exceeds freshness threshold  
**Thresholds**:
- Tax knowledge: 12 months
- Medical guidelines: 18 months
- Product information: 6 months
- FAQ: 3 months

**Severity**: LOW  
**Handling**:
1. Include knowledge with a staleness flag in `selected_knowledge`
2. Add soft restriction: "Acknowledge knowledge may not reflect latest information if customer probes for specifics"
3. Log `STALE_KNOWLEDGE` in `debug`
4. Send staleness alert to Learning Layer

---

### FC-06: Low Intent Confidence

**Trigger**: `detected_intent.confidence < 0.5`  
**Severity**: LOW  
**Handling**:
1. Set `detected_intent.primary = "unclear"`
2. Select ACP-10 NEED_DISCOVERY
3. Set `decision.action = DISCOVERY`
4. Log `LOW_INTENT_CONFIDENCE` in `debug`

---

### FC-07: Unsafe Request

**Trigger**: Input contains content that violates safety policies (e.g., self-harm signal, explicit harmful request)  
**Severity**: CRITICAL  
**Handling**:
1. Set `risk_profile.emergency_detected = true` (for self-harm: see EC-01)
2. Set `decision.action = EMERGENCY_GUIDE` or appropriate edge case action
3. Force `response_profile.empathy_level = critical`
4. DO NOT load product knowledge
5. DO NOT enable lead capture
6. Produce context that guides LLM to crisis support response
7. Log `UNSAFE_REQUEST` in analytics

---

### FC-08: Sensitive Medical Case

**Trigger**: Customer mentions terminal illness, current hospitalization for serious condition  
**Severity**: HIGH  
**Handling**:
1. Load medical empathy profile (high empathy, short length, no CTA)
2. Load ACP-04 restrictions (cannot guarantee acceptance/rejection)
3. Set `decision.action = ANSWER_THEN_ASK` (medical) or `HANDOFF` if Jirawat can add value
4. Suppress any product recommendation
5. Log `SENSITIVE_MEDICAL_CASE` in analytics

---

### FC-09: Context Compression Failure

**Trigger**: Even after full compression, context exceeds LLM window  
**Severity**: MEDIUM  
**Handling**:
1. Activate Minimal Context Mode (see `06_CONTEXT_COMPRESSION_RULES.md`)
2. Log `MINIMAL_CONTEXT_MODE_ACTIVATED` in analytics
3. Response quality will be reduced; safety is maintained

---

### FC-10: Pipeline Timeout

**Trigger**: Context assembly exceeds timeout threshold (e.g., > 3 seconds)  
**Severity**: HIGH  
**Handling**:
1. Return partial context assembled up to the timed-out step
2. If Step < 12 (Restrictions not yet applied): produce SAFE_FALLBACK instead
3. Log `PIPELINE_TIMEOUT` with `debug.pipeline_steps_completed`

---

## Failure Severity Summary

| Severity | Behavior | LLM Called? |
|---|---|---|
| CRITICAL | Stop; produce SAFE_FALLBACK | YES (with fallback context) |
| HIGH | Fix or degrade; log | YES (with reduced quality) |
| MEDIUM | Degrade gracefully; log | YES |
| LOW | Log and monitor | YES |

**Safety principle**: The LLM is ALWAYS called with SOME context. "Return nothing" is never an acceptable failure mode — it would leave the customer with no response at all.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial failure handling catalog — 10 failure cases |
