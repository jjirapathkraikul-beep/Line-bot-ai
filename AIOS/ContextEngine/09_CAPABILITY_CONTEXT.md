# 09 — Capability Context

**Document ID**: AIOS-ACE-09  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how the selected AI Capability Package (ACP) contributes content to `ExecutionContext`. ACE reads ACP documents to extract capability fragments — it never copies entire ACP documents into context.

---

## ACP Contribution Principle

**ACE selects fragments from ACP — it does not load the entire package.**

Each ACP document is a specification. ACE's job is to extract only the fragments that are relevant to the current conversation turn and inject them into the appropriate `ExecutionContext` fields.

---

## What Each ACP Document Contributes

### Capability.md → Core Metadata

ACE extracts from `Capability.md`:

| Field in Capability.md | Maps to ExecutionContext |
|---|---|
| `Purpose` | `selected_capabilities.primary.name` context |
| `Supported Intents` | Cross-checks against `detected_intent` |
| `Lead Policy` | Populates `trust_profile.lead_capture_allowed` |
| `Trust Policy` | Reinforces `restrictions` trust rules |
| `Escalation Rules` | Populates `escalation.required` and `escalation.type` |
| `Failure Modes` | Contributes to `14_CONTEXT_FAILURE_HANDLING.md` routing |

---

### Restrictions.md → restrictions section

ACE extracts all `Hard Prohibitions` and `Soft Prohibitions`:

```
restrictions.hard_prohibitions ← ACP Restrictions.md Hard Prohibitions (all)
restrictions.soft_prohibitions ← ACP Restrictions.md Soft Prohibitions (all)
restrictions.active            ← Hard prohibitions formatted as Restriction objects
```

**Rules**:
- All hard prohibitions from the primary ACP are loaded in full
- Hard prohibitions from secondary ACPs are merged in (no deduplication — same rule can appear twice; LLM sees it as reinforced)
- Soft prohibitions from secondary ACPs are loaded only if budget allows

---

### Decision_Rules.md → decision section

ACE extracts from `Decision_Rules.md`:

| Field | Maps to ExecutionContext |
|---|---|
| Priority | `selected_capabilities.priority` |
| Activation Conditions | Validated against current context; used in `decision.rationale` |
| Exit Conditions | Stored in `session.active_state` management |
| Interrupt Conditions | Used by AEE for priority override decisions |
| Fallback Rules | Used by Step 14 (Failure Handling) |

The full Decision_Rules.md is NOT injected into context. Only the selected action and its rationale are included in `decision`.

---

### Response_Profile.md → response_profile section

ACE maps directly from `Response_Profile.md`:

| ACP Field | ExecutionContext Field |
|---|---|
| Tone | `response_profile.tone` |
| Length | `response_profile.length` |
| Empathy Level | `response_profile.empathy_level` |
| Question Strategy | `response_profile.question_strategy` |
| Recommendation Strategy | Informs `decision.constraints` |
| Closing Strategy | Informs `escalation` context |
| Language Rules | `response_profile.thai_response` |

Emotion modifiers (from `emotion.detected`) may override ACP defaults. See Step 11 of pipeline.

---

### Memory_Requirements.md → memory section

ACE uses `Memory_Requirements.md` to:
1. Build the list of required fields for Step 10
2. Populate `memory.missing_required` with fields not yet captured
3. Determine if ACP can proceed without missing fields (some ACPs degrade gracefully; others block)

```
Required Memory → memory.missing_required (if absent in lead_profile)
Optional Memory → memory.known_facts (if present)
Working Memory  → memory.working_memory (per-turn)
Never Ask Again → merged into lead_profile.fields_captured
```

---

### Knowledge_Map.md → selected_knowledge and selected_conversation_patterns

ACE reads `Knowledge_Map.md` to:
- Get the list of Domain Knowledge paths to load (Step 08)
- Get the list of ConversationDataset references to load (Step 07)
- Get the list of Learning Layer patterns to consider

The Knowledge_Map itself is NOT added to context — it is the instruction to ACE for what to load.

---

### Examples.md → selected_conversation_patterns.examples

ACE extracts from `Examples.md`:
- 1 good example (abbreviated to 3 turns max)
- 1 bad example (reason only — 1 sentence)

These are loaded into `selected_conversation_patterns.examples`.

---

### Regression.md

NOT loaded into runtime context. Regression cases are used by the Testing layer and Learning Layer only.

---

### Future_Extensions.md

NOT loaded into runtime context. Used by Governance and Planning only.

---

## Composition: Multiple ACPs

When secondary ACPs are loaded (see SR-SEL-02):

| Secondary ACP Document | What ACE Loads |
|---|---|
| Restrictions.md | Hard Prohibitions only → merged into `restrictions` |
| Response_Profile.md | Empathy Level override (highest of all active ACPs wins) |
| Capability.md | Lead Policy and Trust Policy (most restrictive wins) |
| Knowledge_Map.md | Additional knowledge sources loaded if relevant |

Secondary ACP knowledge and examples are NOT loaded unless primary ACP Knowledge_Map explicitly references them.

---

## ACP Fragment Size Budget

ACE targets these fragment sizes per ACP section:

| ACP Section | Target Size |
|---|---|
| Restrictions (all) | ~200–400 words |
| Decision summary | ~50–100 words |
| Response profile | ~100 words |
| Memory requirements | ~100 words |
| Capability metadata | ~50 words |
| 1 Good example | ~150 words |
| 1 Bad example reason | ~30 words |
| **Total ACP contribution** | **~700–1000 words** |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial ACP context contribution spec |
