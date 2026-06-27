# 07 — Memory Resolution

**Document ID**: AIOS-ACE-07  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how ACE resolves memory from multiple sources and populates the `memory`, `lead_profile`, `trust_profile`, and `risk_profile` sections of `ExecutionContext`.

---

## Memory Layers

ACE reads from memory in this priority order (higher = more authoritative):

```
Priority 1 — Explicit Customer Statement (current turn)
    "ผมชื่อสมชายครับ" → name = "สมชาย" (highest priority)

Priority 2 — Session Memory (current session KV store)
    Previously captured lead fields in current session

Priority 3 — CRM Memory (returning customer lookup)
    Prior session data from CRM for known user_id

Priority 4 — Inferred Memory (ACE inference from conversation)
    Life stage inferred from "มีลูก 2 คน" → family_status = married_with_children

Priority 5 — Default / Unknown
    Field is absent; marked as null in lead_profile
```

When the same field appears in multiple layers, the higher-priority layer wins.

---

## Memory Categories

### Working Memory

Transient state maintained during the CURRENT conversation turn only. Cleared after response is sent.

Contents:
- `conversation.unresolved_question`: The question AI asked that hasn't been answered yet
- `session.active_state`: Current state machine state
- ACP-specific temporary flags (e.g., "trust_response_delivered")

---

### Session Memory

Persisted across turns within a single session. Stored in KV store.

Contents:
- All captured `lead_profile` fields
- `trust_profile.trust_concern_active` and `trust_profile.trust_concern_turn`
- `risk_profile.medical_conditions` (stated by customer)
- `conversation.summary` (compressed)
- `session.turn_count`

Lifetime: Session TTL (default: 24 hours of inactivity)

---

### Customer Profile

Long-term profile built across multiple sessions. Stored in CRM.

Contents:
- `lead_profile.name`, `phone`, `age`, `gender`
- `lead_profile.product_interest` (historical)
- `lead_profile.crm_saved = true` (once phone is captured)

ACE reads CRM for returning customers only (when `user.is_returning = true`).

---

### Long-Term Memory

Not yet implemented in v1.0. Planned for v1.1.

Scope: Cross-session learning from customer behavior patterns.

---

### Learning Memory

Validated patterns from the Learning Layer (SR-08) that have been approved for use.

ACE may reference learning memory for:
- Updated conversation patterns (CP-01 to CP-10 variants)
- New intent-to-ACP routing improvements
- Validated response improvements

Learning memory is read-only at context assembly time. It informs patterns; it does not override hard rules.

---

## Known-Field Protection

**Rule**: Any field that appears in `lead_profile.fields_captured` must NEVER appear in `decision.constraints` as a field-to-collect.

Implementation:
1. Build `fields_captured` set from `lead_profile` (all non-null fields + CRM fields)
2. When Step 09 (Decision Rules) considers COLLECT_LEAD action: exclude all `fields_captured` fields from collection targets
3. When Step 11 (Response Profile) considers questions to ask: exclude fields in `fields_captured`

This is the implementation of CP-05 (Known Field Protection pattern) at the context layer.

---

## Never Ask Again Fields

Once captured, these fields are permanently added to `lead_profile.fields_captured`:

| Field | Capture Trigger |
|---|---|
| `name` | Customer states their name in any form |
| `phone` | Customer provides phone number |
| `age` | Customer states their age |
| `gender` | Customer reveals gender contextually or explicitly |
| `budget_range` | Customer states a budget amount or range |
| `existing_coverage` | Customer mentions insurance they have |
| `medical_conditions` | Customer mentions a health condition |

Fields in `fields_captured` are NEVER re-requested. The LLM must use these known facts in the response.

---

## Stale Memory Handling

| Staleness Type | Detection | Action |
|---|---|---|
| Session expired | TTL exceeded | Treat as new session; start discovery fresh |
| Trust concern stale | `turns_since_trust_concern >= 2` | Allow lead capture to resume |
| CRM data old | CRM field age > 90 days | Use CRM data but flag as possibly outdated; do not override new customer statement |
| Medical condition stated long ago | Stated more than 10 turns ago | Preserve but do not act on without re-confirmation if treatment status unclear |

---

## Sensitive Data Handling

| Data Type | Rule |
|---|---|
| Phone number | Store encrypted in session KV; NEVER appear in `debug` output |
| Name | May appear in context for personalization |
| Medical conditions | Stored in session; never used to diagnose; handled with medical empathy |
| Financial data (income, budget) | Budget range only — exact income never stored |

---

## Memory Resolution Checklist

Before completing Step 10, verify:

- [ ] `lead_profile.fields_captured` is populated from session + CRM
- [ ] No `fields_captured` field is in `memory.missing_required`
- [ ] `trust_profile.turns_since_trust_concern` is calculated from `trust_concern_turn`
- [ ] `risk_profile.medical_conditions` carries all conditions stated in current session
- [ ] `memory.required_fields_present` reflects actual ACP requirements vs. available fields

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial memory resolution spec |
