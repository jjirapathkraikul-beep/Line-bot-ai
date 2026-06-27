# 03 — Context Assembly Pipeline

**Document ID**: AIOS-ACE-03  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines the 15-step pipeline ACE executes to produce an `ExecutionContext` from a raw customer message and a selected ACP.

Each step has a defined input, output, owner, and failure handling behavior. The pipeline is sequential. No step may begin before the previous step produces a valid output (or explicit error state).

---

## Pipeline Overview

```
Raw Message + Session ID + Selected ACP
        ↓
Step 01  Normalize Input
Step 02  Load Session Memory
Step 03  Summarize Conversation
Step 04  Detect Current Intent
Step 05  Select ACP
Step 06  Load ACP Metadata
Step 07  Load Conversation Dataset References
Step 08  Resolve Domain Knowledge
Step 09  Resolve Decision Rules
Step 10  Resolve Memory Fields
Step 11  Resolve Response Profile
Step 12  Apply Restrictions
Step 13  Compress Context
Step 14  Validate Context
Step 15  Produce ExecutionContext
        ↓
        LLM
```

---

## Step 01: Normalize Input

**Owner**: ACE — Input Normalizer  
**Input**: Raw customer message string, channel identifier  
**Output**: `request.normalized_input`, `request.channel`, `request.turn_number`

**Process**:
- Apply Unicode NFC normalization
- Lowercase Thai and Latin text
- Strip leading/trailing whitespace
- Identify language (Thai / English / Mixed)
- Record raw input in `request.raw_input` before any modification

**Failure Handling**:
- Empty string → produce `normalized_input = ""`, continue to Step 02 (Step 09 will select FALLBACK action)
- Binary or non-text → reject; produce error context with action = FALLBACK

---

## Step 02: Load Session Memory

**Owner**: ACE — Memory Resolver  
**Input**: `session_id`, memory store  
**Output**: Populated `session`, `lead_profile`, `trust_profile`, `risk_profile`

**Process**:
- Read session record from KV store (Vercel KV or equivalent)
- Populate `session.active_state`, `session.prior_state`, `session.turn_count`
- Populate `lead_profile` with all captured fields
- Populate `trust_profile.trust_concern_active` and `trust_profile.turns_since_trust_concern`
- Populate `risk_profile.medical_concern_active`

**Failure Handling**:
- Session not found → treat as new session; `session.turn_count = 1`; all profiles empty
- Store unavailable → set `debug.memory_fields_resolved = 0`; continue with empty profiles; log warning

---

## Step 03: Summarize Conversation

**Owner**: ACE — Conversation Summarizer  
**Input**: Raw conversation history from session  
**Output**: `conversation.summary`, `conversation.history` (compressed recent turns)

**Process**:
- Retain last 3–5 turns verbatim (configurable)
- Compress earlier turns into `conversation.summary`
- Identify `conversation.last_ai_action` from prior turn metadata
- Identify `conversation.unresolved_question` (last question AI asked; check if answered in current turn)

**Failure Handling**:
- No prior history → `conversation.summary = ""`, `conversation.history = []`
- Summary generation error → use raw recent turns only; log warning

---

## Step 04: Detect Current Intent

**Owner**: AEE (result passed to ACE)  
**Input**: `request.normalized_input`, `conversation.summary`  
**Output**: Populated `detected_intent`

**Process**:
- Intent classifier produces `primary`, `confidence`, `all_candidates`
- ACE reads classifier result; does NOT re-run classification
- ACE sets fast-path flags:
  - `is_trust_signal` if any trust trigger keyword matches (see ACP-08 trigger list)
  - `is_medical_signal` if medical keywords detected
  - `is_emergency` if emergency keywords detected

**Failure Handling**:
- Low confidence (< 0.5) → set `primary = "unclear"`, proceed to Step 05 with NEED_DISCOVERY or GREETING default
- Classifier unavailable → set `primary = "fallback"`, select ACP-20 EDGE_CASE_HANDLER

---

## Step 05: Select ACP

**Owner**: AEE (result passed to ACE)  
**Input**: `detected_intent`, `trust_profile`, `risk_profile`, `session.active_state`  
**Output**: `selected_capabilities.primary`, `selected_capabilities.priority`

**Priority Override Rules**:
- `is_trust_signal = true` → force `ACP-08`, `priority = CRITICAL`, record `override_reason`
- `is_emergency = true` → force `ACP-16`, `priority = HIGH`
- Active state interrupted by high-priority signal → force high-priority ACP; preserve prior state for resume

**Failure Handling**:
- No matching ACP → select ACP-20 EDGE_CASE_HANDLER
- Multiple equally valid ACPs → select highest-priority; record others as `secondary`

---

## Step 06: Load ACP Metadata

**Owner**: ACE — ACP Loader  
**Input**: `selected_capabilities.primary.id`  
**Output**: ACP fragments loaded into working context (not yet assembled)

**Process**:
- Read ACP `Capability.md` → extract purpose, lead_policy, trust_policy, escalation_rules
- Read ACP `Decision_Rules.md` → extract activation conditions, exit conditions
- Read ACP `Restrictions.md` → extract hard and soft prohibitions
- Read ACP `Response_Profile.md` → extract tone, length, empathy, question strategy
- Read ACP `Memory_Requirements.md` → extract required and optional memory fields
- Do NOT load full ACP text — load only referenced sections

**Failure Handling**:
- ACP document not found → fall back to ACP-20; log critical error
- Partial ACP (missing files) → load what exists; mark missing sections in `debug`

---

## Step 07: Load Conversation Dataset References

**Owner**: ACE — Dataset Loader  
**Input**: ACP `Knowledge_Map.md` → `Conversation Dataset References` list  
**Output**: Relevant examples and patterns loaded into `selected_conversation_patterns`

**Process**:
- Read ACP's Knowledge_Map to identify which ConversationDataset documents apply
- From each referenced CID document, extract:
  - Expected AI thinking (1 paragraph)
  - 1 good example (abbreviated)
  - 1 bad example (with reason)
  - Follow-up question strategy
  - Lead capture timing signal
- Load master patterns from `CID-20_CONVERSATION_PATTERNS.md` (always included)

**Failure Handling**:
- Dataset document not found → proceed without examples; log warning
- Dataset reference invalid → skip that reference; log defect

---

## Step 08: Resolve Domain Knowledge

**Owner**: ACE — Knowledge Resolver  
**Input**: ACP `Knowledge_Map.md` → `Domain Knowledge References`, `detected_intent`  
**Output**: Populated `selected_knowledge`

**Process**:
- Read ACP's knowledge references list
- For each referenced knowledge document:
  - Read relevant sections based on detected intent
  - Extract excerpt (not full document)
  - Score relevance: 1.0 if primary match, 0.7 if secondary
- Exclude knowledge with relevance < 0.5
- Record `selected_knowledge.total_tokens`

**See**: `08_KNOWLEDGE_RESOLUTION.md` for intent-to-knowledge mapping rules

**Failure Handling**:
- Knowledge document not found → mark as `source_unavailable`; continue without it
- All knowledge unavailable → fallback to general response mode; flag in `debug`

---

## Step 09: Resolve Decision Rules

**Owner**: ACE — Decision Resolver  
**Input**: ACP decision rules, `detected_intent`, `session.active_state`, `trust_profile`, `risk_profile`  
**Output**: Populated `decision`

**Process**:
- Evaluate ACP activation conditions against current context
- Select `decision.action` from the decision action taxonomy (see `11_DECISION_CONTEXT.md`)
- Apply priority overrides:
  - Trust signal → action must be BUILD_TRUST
  - Emergency → action must be EMERGENCY_GUIDE
  - Medical inquiry with no known data → action must be ANSWER_THEN_ASK (medical)
  - Lead policy prohibits collection → action cannot be COLLECT_LEAD
- Record `decision.rationale`
- Record `decision.constraints` (list of active constraints on the action)

**Failure Handling**:
- No valid action found → select FALLBACK action
- Conflicting constraints → apply most restrictive; log conflict in `debug`

---

## Step 10: Resolve Memory Fields

**Owner**: ACE — Memory Resolver  
**Input**: ACP `Memory_Requirements.md`, `lead_profile`, `session memory`  
**Output**: Populated `memory.known_facts`, `memory.missing_required`, `memory.required_fields_present`

**Process**:
- Read ACP's required memory fields
- For each required field: check `lead_profile` and `session memory`
- If found → add to `memory.known_facts`
- If not found → add to `memory.missing_required`
- Set `memory.required_fields_present = (missing_required.length == 0)`
- Set `lead_profile.fields_captured` (all fields ever captured — never ask again list)

**Failure Handling**:
- Memory store unavailable → `missing_required = [all required fields]`; `required_fields_present = false`; continue

---

## Step 11: Resolve Response Profile

**Owner**: ACE — Response Profiler  
**Input**: ACP `Response_Profile.md`, `emotion`, `risk_profile`, `trust_profile`  
**Output**: Populated `response_profile`

**Process**:
- Start with ACP default response profile
- Apply emotion modifier:
  - `emotion.empathy_required = true` → override `empathy_level` to at least "medium"
  - Frustration or suspicion detected → override `tone` to "empathetic"
- Apply safety modifiers:
  - `trust_profile.trust_concern_active` → set `cta_allowed = false`
  - `risk_profile.emergency_detected` → set `length = "short"`, `empathy_level = "high"`
- Confirm `answer_first = true` always (unless emergency override)
- Load prohibited phrases from ACP Restrictions + global policy

**Failure Handling**:
- ACP response profile missing → use safe defaults: empathetic, medium length, one question, Thai, answer first

---

## Step 12: Apply Restrictions

**Owner**: ACE — Restriction Enforcer  
**Input**: ACP `Restrictions.md`, `trust_profile`, `risk_profile`, `decision`  
**Output**: Populated `restrictions`

**Process**:
- Load hard prohibitions from ACP Restrictions.md
- Add global restrictions:
  - `trust_concern_active AND turns_since < 2` → add restriction: "NEVER ask for personal data"
  - `medical_concern_active` → add restriction: "NEVER guarantee acceptance or rejection"
  - `emergency_detected` → add restriction: "NEVER collect lead data"
- Set `trust_profile.lead_capture_allowed = false` if applicable
- Validate `decision.action` against restrictions (Step 09 should have done this; double-check here)

**Failure Handling**:
- Conflict between decision and restriction → restrictions win; override decision; log

---

## Step 13: Compress Context

**Owner**: ACE — Context Compressor  
**Input**: All assembled context sections  
**Output**: Same structure, compressed to fit LLM context window

**Process**:
- Measure total token estimate
- If within budget → no compression needed; `selected_knowledge.compressed = false`
- If over budget → apply compression in this priority order:
  1. Compress conversation history (keep summary + last 3 turns)
  2. Compress knowledge excerpts (keep most relevant sentences only)
  3. Compress examples (keep 1 good + 1 bad only)
  4. Compress decision rationale (1 sentence)
  5. NEVER compress: restrictions, response_profile, trust_profile, lead_profile

**See**: `06_CONTEXT_COMPRESSION_RULES.md`

**Failure Handling**:
- Even after compression, context exceeds limit → escalate to minimal context mode; include only: restrictions + decision + response_profile + lead_profile

---

## Step 14: Validate Context

**Owner**: ACE — Context Validator  
**Input**: Fully assembled and compressed ExecutionContext  
**Output**: `analytics.validation_passed`, `debug.validation_errors`

**Process**:
- Run all validation rules (see `13_CONTEXT_VALIDATION.md`)
- Set `analytics.validation_passed`
- If critical validation fails → do NOT send to LLM; produce error context

**Failure Handling**:
- Soft validation failure → log in `debug.validation_errors`; proceed
- Hard validation failure → stop pipeline; produce SAFE_FALLBACK context

---

## Step 15: Produce ExecutionContext

**Owner**: ACE — Context Assembler  
**Input**: All resolved sections  
**Output**: Final `ExecutionContext` object

**Process**:
- Assemble all sections into canonical schema (see `02_EXECUTION_CONTEXT_SCHEMA.md`)
- Populate `analytics.audit_id` with unique trace ID
- Populate `analytics.assembly_time_ms`
- Mark `debug.pipeline_steps_completed`
- Return ExecutionContext to AEE for LLM call

---

## Pipeline Error States

| Error Type | Step | Behavior |
|---|---|---|
| Empty input | 01 | Continue; Step 09 selects FALLBACK |
| Session unavailable | 02 | Continue with empty memory |
| Intent unclear | 04 | Route to NEED_DISCOVERY |
| ACP not found | 06 | Route to ACP-20 |
| All knowledge unavailable | 08 | Continue; flag in debug |
| Decision conflict | 09 | Apply most restrictive |
| Critical validation fail | 14 | Stop; SAFE_FALLBACK |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial 15-step pipeline |
