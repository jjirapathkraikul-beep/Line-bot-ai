# 06 — Context Compression Rules

**Document ID**: AIOS-ACE-06  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how ACE compresses the assembled context to fit within the LLM's context window without losing decision-critical information.

---

## When Compression Is Required

Compression triggers when the estimated token count of assembled context exceeds the configured budget threshold. Typical threshold: 70% of model context window (reserving 30% for LLM response generation).

---

## Compression Priority

Compression is applied in this order. Lower-priority items are compressed first.

```
Priority 1 (NEVER COMPRESS)
├── restrictions.hard_prohibitions
├── trust_profile
├── risk_profile
├── lead_profile.fields_captured (Never Ask Again list)
├── decision.action
└── response_profile

Priority 2 (Compress Last)
├── decision.rationale (→ 1 sentence)
└── lead_profile (beyond fields_captured)

Priority 3 (Compress if Needed)
├── selected_knowledge.sources[].excerpt (→ key sentences only)
└── selected_conversation_patterns.examples (→ 1 good + 1 bad)

Priority 4 (Compress First)
├── conversation.history (→ summary + last 3 turns)
├── conversation.summary (→ 2 sentences)
└── debug (→ empty in production)
```

---

## Compression Techniques by Section

### Conversation History

**Default**: Retain last 5 turns verbatim + compressed summary  
**When over budget**: Retain last 3 turns verbatim; compress summary to 2 sentences  
**Minimum**: Retain last 1 turn (the immediate prior AI response) + 1-sentence summary

Summary format:
```
[Turn count] turns. Customer: [primary interest]. 
Known: [captured fields]. Last action: [last AI action].
```

---

### Knowledge Excerpts

**Default**: Top 3 most relevant sentences per knowledge document  
**When over budget**: Top 1 most relevant sentence per document  
**Minimum**: Document name + one-line fact summary only

Excerpts must always preserve:
- The key fact relevant to the intent
- Any uncertainty language (e.g., "case-by-case basis", "cannot guarantee")
- Any mandatory disclosure (e.g., "investment returns are not guaranteed")

---

### Conversation Examples

**Default**: 1 good example + 1 bad example per referenced CID document  
**When over budget**: 1 good example from the most relevant CID only  
**Minimum**: Pattern references only (CP-01 through CP-10, no examples)

Good example compression: Use 3-turn snippet, not full conversation.  
Bad example compression: 1 line — state what was wrong.

---

### Decision Rationale

**Default**: 2–3 sentences explaining why this action was selected  
**When over budget**: 1 sentence — action + primary constraint

---

## Protected Content

The following must NEVER be compressed or truncated:

| Content | Reason |
|---|---|
| `restrictions.hard_prohibitions` | These are safety rules; LLM must always see them in full |
| `trust_profile.lead_capture_allowed` | Critical safety flag |
| `trust_profile.trust_concern_active` | Critical safety flag |
| `decision.action` | LLM must know the selected action clearly |
| `response_profile.prohibited_phrases` | LLM must not use these |
| `lead_profile.fields_captured` | Prevents re-asking — fundamental behavior requirement |

---

## Minimal Context Mode

If even after full compression the context exceeds the limit, ACE activates Minimal Context Mode:

Include ONLY:
1. `restrictions.hard_prohibitions` (full)
2. `decision.action`
3. `response_profile` (core fields only)
4. `trust_profile` (full)
5. `lead_profile.fields_captured` (full)
6. `request.normalized_input`
7. `conversation.history` (last 1 turn only)

Log Minimal Context Mode activation in `analytics` and `debug`.

---

## Compression Output Requirements

After compression:
- All Priority 1 content must be present and unmodified
- Total token estimate must be within budget
- `selected_knowledge.compressed = true` must be set if any excerpt was compressed
- `analytics.compression_ratio` must be populated

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial compression rules |
