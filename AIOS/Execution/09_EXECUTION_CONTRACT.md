# 09 — Execution Contract
### AI Execution Engine — Formal Interface Definitions
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Chief AI System Architect

---

## Purpose

Define the formal, technology-independent interface contracts that govern how the AI Execution Engine interacts with Application Adapters, capabilities, knowledge sources, memory layers, and the analytics store. This document is the binding specification that all implementations must conform to.

---

## Scope

This document covers:
- ExecutionInput and ExecutionOutput contracts
- CapabilityInterface
- KnowledgeInterface
- ApplicationInterface
- MemoryInterface
- AnalyticsInterface

This document does not cover:
- LINE-specific types, Facebook-specific types, or any channel-specific schemas
- OpenAI, GPT, or any AI provider SDK types
- Database schemas or storage formats
- Prompt templates

All interfaces use pseudo-typed notation. Implementations may use TypeScript, Python, Go, or any other language — the contract defines structure and semantics, not syntax.

---

## Interface 1 — ExecutionInput

The normalized input packet that an Application Adapter delivers to the AEE. The Application Adapter is responsible for translating channel-specific events into this format.

```
ExecutionInput {
  // --- Identity ---
  session_id: string           // Unique per conversation session. Channel-agnostic.
  customer_id: string          // Unique per customer across sessions. Channel-agnostic.
  request_id: string           // Unique per execution turn. Used for idempotency.

  // --- Message ---
  message: string              // Normalized message text (sanitized, decoded, language-detected)
  message_type: enum {
    TEXT                       // Customer typed a message
    POSTBACK                   // Customer tapped a button or menu item
    EVENT                      // System event (e.g., follow, unfollow, join)
    MEDIA                      // Customer sent image, audio, file
  }
  postback_data?: string       // Semantic intent for POSTBACK type (e.g., "action=get_quote")

  // --- Application Context ---
  application_context: {
    domain: string             // Domain identifier: "INSURANCE" | "INVESTMENT" | etc.
    language: string           // ISO 639-1: "th" | "en" | etc.
    channel_type: enum {
      CHAT                     // Text-based messaging
      VOICE                    // Voice conversation
      EMAIL                    // Email thread
      WEB                      // Website widget
    }
    application_id: string     // Which application is calling (for logging only — not for logic)
  }

  // --- Timestamps ---
  timestamp: string            // ISO-8601 timestamp of the message
  received_at: string          // ISO-8601 timestamp when the AEE received the input
}
```

**Validation Rules:**
- `session_id`, `customer_id`, `request_id` must be non-empty strings
- `message` must be non-empty for `message_type=TEXT`
- `domain` must match a registered domain in the AIOS domain registry
- `language` must be a supported language code

---

## Interface 2 — ExecutionOutput

The normalized output packet returned by the AEE to the Application Adapter. The Application Adapter translates this into channel-specific format.

```
ExecutionOutput {
  // --- Identity ---
  request_id: string           // Echoed from ExecutionInput for correlation
  session_id: string
  customer_id: string

  // --- Response Content ---
  responses: Response[]        // Ordered list of response segments to deliver

  Response {
    response_type: enum {
      TEXT                     // Plain text response
      STRUCTURED               // Structured content (heading, body, list)
      QUESTION                 // A question to the customer
      SUMMARY                  // Conversation summary
      HANDOFF_MESSAGE          // Message to customer at handoff
    }
    content: string            // Composed text
    structure?: {
      heading?: string
      body: string
      items?: string[]
    }
    follow_up_question?: string
    tone_applied: ToneEnum
    empathy_applied: boolean
    knowledge_source_ids: string[]
    word_count: integer
  }

  // --- Decision ---
  decision: {
    action: ActionEnum         // The action taken this turn
    action_rationale: {
      rule_matched: string
      conditions_met: string[]
    }
    confidence: float
  }

  // --- Lead Update (if any) ---
  lead_update?: {
    fields_captured: { field: string, value: any }[]
    new_lead_score?: integer
    new_lead_status?: string
    status_changed: boolean
  }

  // --- Handoff (if triggered) ---
  handoff?: {
    triggered: boolean
    trigger_reason: string
    handoff_context: HandoffContext  // Technology-independent advisor context
    advisor_briefing: string         // Summary for the human advisor
  }

  HandoffContext {
    customer_name: string
    phone?: string
    interest_category: string
    product_interest?: string
    budget_annual?: integer
    age?: integer
    health_status?: string
    lead_score: integer
    conversation_summary: string
    last_question?: string
    preferred_contact_time?: string
    missing_fields: string[]
    session_turn_count: integer
    handoff_trigger: string
  }

  // --- Memory Instructions ---
  memory_instructions: {
    write_session: boolean
    write_profile: boolean
    trigger_crm_sync: boolean
  }

  // --- Analytics ---
  analytics_events: AnalyticsEvent[]

  // --- Metadata ---
  execution_duration_ms: integer
  pipeline_version: string
  error?: {
    code: string
    message: string
    recoverable: boolean
  }
}
```

---

## Interface 3 — CapabilityInterface

Every capability registered in the Capability Loader must implement this interface.

```
CapabilityInterface {
  // --- Identity ---
  capability_id: string        // e.g., "CAP-002"
  capability_name: string
  version: string

  // --- Lifecycle ---
  is_available(): boolean      // Check if capability can be loaded
  activate(context: ExecutionContext): CapabilityActivation
  // Activation result includes whether the capability fired and its priority

  // --- Execution ---
  execute(context: ExecutionContext, knowledge: KnowledgeBundle): CapabilityOutput

  CapabilityOutput {
    capability_id: string
    executed: boolean
    outputs: { [key: string]: any }   // Capability-specific outputs
    modified_decision?: Partial<Decision>  // If capability suggests a decision modifier
    analytics_events: AnalyticsEvent[]
    error?: string
  }

  // --- Configuration ---
  required_knowledge_sources: string[]   // KS-NNN IDs this capability needs
  activation_conditions: string[]        // Human-readable conditions for documentation
}
```

---

## Interface 4 — KnowledgeInterface

The interface between the Knowledge Resolver and the knowledge content provider. The AEE never fetches knowledge directly — it requests it via this interface and the Application Adapter (or a knowledge provider) fulfills the request.

```
KnowledgeInterface {
  // Called by Knowledge Resolver at Step 7
  resolve(
    source_id: string,           // e.g., "KS-001"
    topic_signals: string[],     // e.g., ["cancer", "health insurance"]
    domain: string,              // e.g., "INSURANCE"
    language: string             // e.g., "th"
  ): KnowledgeSource

  KnowledgeSource {
    source_id: string
    name: string
    domain_path: string          // Where this knowledge is defined in AIOS
    content: string              // The actual knowledge content
    effective_date: string       // ISO date — when this content was last updated
    stale: boolean               // Whether this source has exceeded its review cadence
    confidence: float            // 0.0–1.0 relevance to the current query
  }
}
```

---

## Interface 5 — ApplicationInterface

The contract between the AEE and the Application Adapter. The Application Adapter calls the AEE and receives its output.

```
ApplicationInterface {
  // Entry point — called by Application Adapter for every customer turn
  execute(input: ExecutionInput): ExecutionOutput

  // Health check
  health(): {
    status: "ok" | "degraded" | "unavailable"
    pipeline_version: string
    registered_capabilities: string[]
    registered_knowledge_sources: string[]
  }

  // Configuration
  configure(config: AEEConfiguration): void

  AEEConfiguration {
    domain: string
    language: string
    capability_set: string[]     // Which CAP-NNN IDs to enable
    knowledge_sources: string[]  // Which KS-NNN IDs to enable
    decision_rules_version: string
    memory_config: MemoryConfiguration
  }
}
```

---

## Interface 6 — MemoryInterface

The contract between the AEE and the memory provider. The AEE issues memory commands; the Application Adapter's persistence layer executes them.

```
MemoryInterface {
  // Session Memory
  read_session(session_id: string): SessionMemory | null
  write_session(session_id: string, data: SessionMemory): void

  // Customer Profile
  read_profile(customer_id: string): CustomerProfile | null
  write_profile(customer_id: string, fields: Partial<CustomerProfile>): void

  // CRM
  read_crm(customer_id: string): CustomerProfile | null
  trigger_crm_sync(customer_id: string, reason: string): void

  // Long-term Memory
  read_longterm(customer_id: string): LongtermMemory | null
  write_longterm(customer_id: string, data: LongtermMemory): void

  SessionMemory {
    session_id: string
    customer_id: string
    turn_history: TurnSummary[]
    current_mode: ConversationMode
    session_turn_count: integer
    trust_state: TrustState
    objections_addressed: string[]
    fields_requested_this_session: string[]
    handoff_triggered: boolean
    last_updated: string
  }

  CustomerProfile {
    // All fields from AIOS/Domains/Insurance/Lead/Lead_Data_Model.md
    // (28 fields as defined)
  }

  LongtermMemory {
    customer_id: string
    returning_customer: boolean
    prior_interest_categories: string[]
    prior_objections: string[]
    prior_handoff_attempts: integer
    re_engagement_note: string
    last_updated: string
  }
}
```

---

## Interface 7 — AnalyticsInterface

The contract between the AEE and the analytics store. The AEE emits events; the Application Adapter routes them to the appropriate store.

```
AnalyticsInterface {
  emit(events: AnalyticsEvent[]): void   // Async — never blocks

  AnalyticsEvent {
    event_id: string             // e.g., "EVT-L02"
    event_name: string
    timestamp: string            // ISO-8601
    session_id: string
    customer_id: string
    turn_number: integer
    domain: string
    channel_type: string
    payload: { [key: string]: any }
  }

  // Batch query (for derived metrics — used by application analytics layer)
  query(
    session_id?: string,
    customer_id?: string,
    event_ids?: string[],
    from?: string,
    to?: string
  ): AnalyticsEvent[]
}
```

---

## Contract Versioning

All interfaces are versioned. The `pipeline_version` field in `ExecutionOutput` identifies which contract version the AEE implemented. Application Adapters must verify version compatibility.

Version format: `MAJOR.MINOR`
- MAJOR increment: breaking change to any interface
- MINOR increment: additive, backwards-compatible change

Breaking changes require a migration path documented in this file before deployment.

---

## Dependencies

- `02_EXECUTION_PIPELINE.md` — Pipeline steps that consume these interfaces
- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — CustomerProfile field schema
- `07_MEMORY_ENGINE.md` — MemoryInterface implementation guidance
- `08_ANALYTICS_ENGINE.md` — AnalyticsEvent schema and event taxonomy

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief AI System Architect | Initial creation — 7 interfaces, technology-independent contracts |
