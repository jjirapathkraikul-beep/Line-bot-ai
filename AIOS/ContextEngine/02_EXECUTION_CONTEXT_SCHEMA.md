# 02 — Execution Context Schema

**Document ID**: AIOS-ACE-02  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

This document defines the canonical `ExecutionContext` — the complete, structured object that ACE produces and the LLM consumes for every response generation cycle.

The schema is **technology-independent**. It does not assume JSON, YAML, or any specific serialization format. It does not contain LINE-specific fields or OpenAI-specific parameters.

---

## ExecutionContext Schema

```
ExecutionContext {

  ─────────────────────────────────────
  REQUEST
  ─────────────────────────────────────
  request {
    raw_input:        string          // Original customer message, unnormalized
    normalized_input: string          // NFC-normalized, lowercased
    channel:          string          // "line" | "web" | "test"
    timestamp:        ISO8601
    turn_number:      integer         // Turn index in current session
    session_id:       string
  }

  ─────────────────────────────────────
  USER
  ─────────────────────────────────────
  user {
    user_id:          string          // Platform-agnostic identifier
    display_name:     string | null   // If known
    language:         string          // "th" | "en" | "mixed"
    is_returning:     boolean
  }

  ─────────────────────────────────────
  SESSION
  ─────────────────────────────────────
  session {
    session_id:       string
    started_at:       ISO8601
    turn_count:       integer
    last_active:      ISO8601
    active_state:     string | null   // Current state machine state
    prior_state:      string | null   // Previous state
  }

  ─────────────────────────────────────
  CONVERSATION
  ─────────────────────────────────────
  conversation {
    summary:          string          // Compressed summary of prior turns
    history:          ConversationTurn[]  // Recent N turns (compressed)
    last_ai_action:   string | null   // Last action taken by AI
    unresolved_question: string | null  // Question AI asked that isn't answered yet
  }

  ConversationTurn {
    role:    "customer" | "ai"
    content: string                   // Compressed turn content
    turn:    integer
  }

  ─────────────────────────────────────
  INTENT
  ─────────────────────────────────────
  detected_intent {
    primary:          string          // e.g. "trust_concern", "product_health"
    confidence:       float           // 0.0–1.0
    secondary:        string | null
    all_candidates:   string[]        // All detected signals
    is_trust_signal:  boolean         // Fast-path for ACP-08
    is_medical_signal: boolean        // Fast-path for ACP-04
    is_emergency:     boolean         // Fast-path for ACP-16
  }

  ─────────────────────────────────────
  EMOTION
  ─────────────────────────────────────
  emotion {
    detected:         string          // "neutral" | "anxious" | "frustrated" | "suspicious" | "decided"
    confidence:       float
    empathy_required: boolean
  }

  ─────────────────────────────────────
  CUSTOMER GOAL
  ─────────────────────────────────────
  customer_goal {
    primary:          string          // What the customer is trying to accomplish
    secondary:        string | null
    inferred_from:    string          // "explicit" | "inferred_from_context" | "default"
  }

  ─────────────────────────────────────
  CAPABILITIES
  ─────────────────────────────────────
  selected_capabilities {
    primary:          ACPReference
    secondary:        ACPReference[]  // For composition
    priority:         "CRITICAL" | "HIGH" | "ELEVATED" | "STANDARD"
    override_reason:  string | null   // Why primary override fired (e.g. trust signal)
  }

  ACPReference {
    id:               string          // "ACP-08"
    name:             string          // "TRUST_ADVISOR"
    version:          string
  }

  ─────────────────────────────────────
  KNOWLEDGE
  ─────────────────────────────────────
  selected_knowledge {
    sources:          KnowledgeFragment[]
    total_tokens:     integer
    compressed:       boolean
  }

  KnowledgeFragment {
    source_id:        string          // e.g. "AIOS/Domains/Insurance/Medical.md"
    relevance:        float           // 0.0–1.0
    excerpt:          string          // Compressed relevant excerpt
    full_path:        string
  }

  ─────────────────────────────────────
  CONVERSATION PATTERNS
  ─────────────────────────────────────
  selected_conversation_patterns {
    patterns:         PatternReference[]
    examples:         ConversationExample[]  // From ConversationDataset
  }

  PatternReference {
    pattern_id:       string          // "CP-01" | "CP-04" | etc.
    name:             string
    rule:             string          // One-line rule summary
  }

  ConversationExample {
    type:             "good" | "bad"
    context:          string
    example:          string          // Abbreviated example
  }

  ─────────────────────────────────────
  DECISION
  ─────────────────────────────────────
  decision {
    action:           string          // See 11_DECISION_CONTEXT.md
    rationale:        string          // Why this action was selected
    constraints:      string[]        // Active constraints on this action
  }

  ─────────────────────────────────────
  MEMORY
  ─────────────────────────────────────
  memory {
    required_fields_present: boolean
    known_facts:      KnownFact[]
    missing_required: string[]        // Fields needed but not yet captured
    working_memory:   object          // Transient per-capability state
  }

  KnownFact {
    field:   string                   // "customer_name" | "age" | "budget" etc.
    value:   string
    source:  "customer_stated" | "crm" | "inferred"
    turn:    integer
  }

  ─────────────────────────────────────
  LEAD PROFILE
  ─────────────────────────────────────
  lead_profile {
    name:              string | null
    phone:             string | null
    age:               integer | null
    gender:            string | null
    budget_range:      string | null
    existing_coverage: string[] | null
    product_interest:  string[] | null
    preferred_time:    string | null
    crm_saved:         boolean
    fields_captured:   string[]       // Never ask again
  }

  ─────────────────────────────────────
  TRUST PROFILE
  ─────────────────────────────────────
  trust_profile {
    trust_concern_active:      boolean
    trust_concern_turn:        integer | null  // Turn when concern was raised
    turns_since_trust_concern: integer | null
    lead_capture_allowed:      boolean         // false if trust_concern_active AND turns < 2
    trust_resolved:            boolean
  }

  ─────────────────────────────────────
  RISK PROFILE
  ─────────────────────────────────────
  risk_profile {
    medical_concern_active:    boolean
    medical_conditions:        string[]        // Stated conditions
    underwriting_sensitivity:  boolean
    financial_stress_detected: boolean
    emergency_detected:        boolean
  }

  ─────────────────────────────────────
  RESPONSE PROFILE
  ─────────────────────────────────────
  response_profile {
    tone:              string          // "empathetic" | "educational" | "practical" | "warm"
    length:            string          // "short" | "medium" | "long"
    empathy_level:     string          // "none" | "low" | "medium" | "high" | "critical"
    question_strategy: string          // "one_question" | "no_question" | "clarifying_only"
    answer_first:      boolean         // Always true unless trust/emergency override
    max_recommendations: integer       // Usually 2
    thai_response:     boolean         // true for customer-facing
    prohibited_phrases: string[]
    cta_allowed:       boolean
  }

  ─────────────────────────────────────
  RESTRICTIONS
  ─────────────────────────────────────
  restrictions {
    active:            Restriction[]
    hard_prohibitions: string[]        // Absolute — no exceptions
    soft_prohibitions: string[]        // Avoid unless necessary
  }

  Restriction {
    id:       string                   // "R-08-01" (from ACP-08 Restrictions.md)
    rule:     string                   // One-line rule
    severity: "HARD" | "SOFT"
    source:   string                   // Which ACP or policy
  }

  ─────────────────────────────────────
  ESCALATION
  ─────────────────────────────────────
  escalation {
    required:             boolean
    type:                 "immediate" | "warm" | "scheduled" | null
    reason:               string | null
    target:               "jirawat" | null
    context_for_jirawat:  string | null   // Compressed summary for handoff
  }

  ─────────────────────────────────────
  ANALYTICS
  ─────────────────────────────────────
  analytics {
    audit_id:             string          // Unique ID for this context assembly
    acp_selected:         string
    intent_confidence:    float
    context_token_count:  integer
    compression_applied:  boolean
    assembly_time_ms:     integer
    validation_passed:    boolean
    restrictions_active:  integer
  }

  ─────────────────────────────────────
  DEBUG
  ─────────────────────────────────────
  debug {
    pipeline_steps_completed: string[]
    knowledge_sources_considered: integer
    knowledge_sources_selected:   integer
    memory_fields_resolved:       integer
    restrictions_evaluated:       integer
    compression_ratio:            float | null
    validation_errors:            string[]
  }

}
```

---

## Schema Design Principles

1. **Technology-independent**: No LINE, OpenAI, or Vercel-specific fields in the core schema. Channel-specific fields live in `request.channel` extension points.

2. **Flat first**: Nested objects are used only when grouping meaningfully improves readability. Prefer named sections over deeply nested trees.

3. **Null-explicit**: Fields that may be absent use `null` rather than omission. Missing vs. unknown is always distinguishable.

4. **Audit-complete**: The `analytics` and `debug` sections must be populated for every context assembly — even in production — to support the Learning Layer.

5. **Trust-safe by default**: `trust_profile.lead_capture_allowed` defaults to `true` but is set to `false` automatically when `trust_concern_active = true` and `turns_since_trust_concern < 2`.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial schema — technology-independent |
