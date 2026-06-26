# 03 — Capability Loader
### AI Execution Engine — Dynamic Capability Selection
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Chief AI System Architect

---

## Purpose

Define the capability registry, the dynamic capability selection mechanism, and the rules that determine which capabilities are activated for any given execution turn. The Capability Loader ensures that the engine is modular — new capabilities can be added without modifying existing ones.

---

## Scope

This document covers:
- The full capability registry for AIOS v1.0
- Capability activation rules and priority ordering
- Capability interface contract (what every capability must implement)
- Capability composition rules for multi-capability turns
- Capability failure handling

This document does not cover:
- Internal logic of each capability (that is each capability's own specification)
- Knowledge resolution (see `04_KNOWLEDGE_RESOLVER.md`)
- Decision rules (see `05_DECISION_PIPELINE.md`)

---

## Architecture Principle

The Capability Loader is a dynamic registry. No capability is hardcoded into the pipeline. The engine selects capabilities at runtime based on the ExecutionContext at Step 6. This means:

- A LINE chatbot and a voice AI use the same capabilities
- New capabilities (e.g., `InvestmentEngine`) can be added without touching the pipeline
- Disabled or unavailable capabilities degrade gracefully

---

## Capability Registry

### Registered Capabilities — AIOS v1.0

| ID | Capability | Purpose | Default Active |
|---|---|---|---|
| `CAP-001` | ConversationIntelligence | Manages multi-turn coherence, context, and flow | Always |
| `CAP-002` | TrustEngine | Evaluates and builds customer trust | On trust signals |
| `CAP-003` | LeadEngine | Manages lead capture, qualification, scoring | On lead signals |
| `CAP-004` | FAQEngine | Resolves knowledge questions from knowledge base | On information intent |
| `CAP-005` | RecommendationEngine | Selects and ranks product recommendations | On purchase intent |
| `CAP-006` | ObjectionEngine | Handles customer objections and concerns | On objection signals |
| `CAP-007` | HandoffEngine | Orchestrates human advisor handoff | On handoff triggers |
| `CAP-008` | EmotionResponder | Adapts response tone to emotional state | When emotion ≥ MEDIUM |

---

## Capability Definitions

### CAP-001 — ConversationIntelligence

**Purpose:** Maintains conversational coherence. Understands what the current turn is about in the context of the full conversation. Provides context injection, topic tracking, and conversation mode management.

**Always Active:** Yes. Every execution turn runs ConversationIntelligence.

**Inputs consumed from ExecutionContext:**
- `ConversationContext.prior_turns`
- `ConversationContext.current_mode`
- `IntentResult`

**Outputs produced:**
- `next_conversation_mode` — updated mode for this turn
- `topic_continuity` — whether the customer is on the same topic
- `context_injection` — relevant prior context to carry into response

---

### CAP-002 — TrustEngine

**Purpose:** Evaluates customer trust signals, maintains a trust state, and selects trust-building actions when trust is low or under threat. Governs the AI's credibility behavior.

**Domain Reference:** `AIOS/Domains/Insurance/Trust/Trust_Engine.md`

**Activated when:**
- `IntentResult.primary_intent` is `INTENT_VERIFY_LEGITIMACY` | `INTENT_SCAM_CONCERN` | `INTENT_SKEPTICAL`
- `EmotionResult.primary_emotion` is `SKEPTICAL` | `ANXIOUS` at intensity MEDIUM or HIGH
- Trust score drops below threshold defined in `Trust_Engine.md`
- Customer explicitly questions authenticity

**Inputs consumed:**
- `ConversationContext.trust_state`
- `IntentResult`
- `EmotionResult`
- Trust knowledge (resolved by `04_KNOWLEDGE_RESOLVER.md`)

**Outputs produced:**
- `trust_score_update` — new trust score
- `trust_action` — VERIFY | REASSURE | DEMONSTRATE_CREDIBILITY | PROVIDE_LICENSE | ESCALATE
- `trust_signals_detected[]` — signals that triggered this capability

---

### CAP-003 — LeadEngine

**Purpose:** Manages the progressive collection of customer profile data, evaluates lead qualification readiness, updates lead score, and determines which field to collect next.

**Domain Reference:** `AIOS/Domains/Insurance/Lead/`

**Activated when:**
- `ConversationContext.current_mode` is LEAD_CAPTURE
- `IntentResult` is `INTENT_PROVIDE_INFO` | `INTENT_GET_QUOTE` | `INTENT_APPLY`
- Lead profile has missing Tier 1 fields (per `Adaptive_Lead_Capture.md`)
- Customer has expressed product interest

**Inputs consumed:**
- `ConversationContext.customer_profile`
- `ConversationContext.lead_state`
- `GoalResult`
- Lead rules from `Adaptive_Lead_Capture.md` and `Lead_Scoring.md`

**Outputs produced:**
- `next_field_to_capture` — which Tier 1/2 field is missing and should be requested
- `lead_score_update` — updated lead score after this turn
- `lead_status_update` — updated lead status if threshold crossed
- `capture_question` — the question to ask the customer for the next field

---

### CAP-004 — FAQEngine

**Purpose:** Resolves customer knowledge questions by matching intent to the knowledge base and generating an accurate, concise answer. The knowledge base is defined by the domain, not the application.

**Domain Reference:** `AIOS/Domains/Insurance/Knowledge/FAQ.md`

**Activated when:**
- `IntentResult.primary_intent` is `INTENT_FAQ` | `INTENT_PRODUCT_INFO` | `INTENT_CLAIM_INFO` | `INTENT_TAX_INFO`
- `GoalResult.primary_goal` is `UNDERSTAND`
- `INTENT_UNKNOWN` (safe default)

**Inputs consumed:**
- `IntentResult`
- `KnowledgeBundle` (resolved knowledge from Step 7)
- `ConversationContext.customer_profile` — for personalized answers

**Outputs produced:**
- `answer_content` — resolved answer text
- `answer_confidence` — float 0.0–1.0
- `answer_source_id` — which knowledge entry answered the question
- `follow_up_suggestion?` — a natural follow-up question to deepen engagement

---

### CAP-005 — RecommendationEngine

**Purpose:** Selects the most appropriate insurance products for the customer based on their profile, stated interest, budget, and health status. Rankings are driven by domain rules, not by hardcoded product logic.

**Domain Reference:** `AIOS/Domains/Insurance/Recommendation/Recommendation_Framework.md`

**Activated when:**
- `IntentResult` is `INTENT_GET_QUOTE` | `INTENT_COMPARE` | `INTENT_APPLY`
- `GoalResult.primary_goal` is `PURCHASE` | `COMPARE`
- Lead profile has sufficient data (Tier 1 complete)

**Inputs consumed:**
- `ConversationContext.customer_profile` — age, budget, health_status, interest_category
- `KnowledgeBundle` — product knowledge
- Recommendation rules from `Recommendation_Framework.md`

**Outputs produced:**
- `recommended_products[]` — ranked list with rationale per product
- `primary_recommendation` — single best-fit product
- `recommendation_confidence` — float 0.0–1.0
- `missing_profile_fields[]` — fields that would improve recommendation accuracy

---

### CAP-006 — ObjectionEngine

**Purpose:** Detects and responds to customer objections with domain-defined response strategies. Objection handling is not confrontational — it is empathetic and trust-building.

**Domain Reference:** `AIOS/Domains/Insurance/Objection/Objection_Framework.md`

**Activated when:**
- Customer message contains objection signals (price concern, "already have insurance", "need time", "spouse must decide", scam concern, health condition concern)
- `IntentResult` indicates resistance or hesitation
- `EmotionResult.primary_emotion` is `SKEPTICAL` | `FRUSTRATED`

**Inputs consumed:**
- `IntentResult`
- `EmotionResult`
- `KnowledgeBundle` — objection response library

**Outputs produced:**
- `objection_type` — which objection category was detected
- `objection_response` — domain-defined response strategy
- `empathy_required` — whether response must lead with empathy

---

### CAP-007 — HandoffEngine

**Purpose:** Evaluates handoff readiness, validates that required advisor context is available, and orchestrates the transition from AI to human advisor. Once HandoffEngine fires, the current conversation mode transitions to HANDOFF and does not return.

**Domain Reference:** `AIOS/Domains/Insurance/Human/Human_Handoff.md` · `Escalation_Rules.md`

**Activated when:**
- `IntentResult` is `INTENT_REQUEST_HUMAN` | `INTENT_CALL_BACK`
- Any escalation rule from `Escalation_Rules.md` is triggered
- Lead reaches `qualified` status and buying signal is detected
- Trust score drops below minimum threshold

**Inputs consumed:**
- `ConversationContext` — customer profile, trust state, lead state
- `Decision` — action must be `ESCALATE_HUMAN`
- Handoff rules from `Human_Handoff.md`

**Outputs produced:**
- `handoff_ready` — boolean
- `handoff_context` — normalized advisor context package (technology-independent)
- `missing_fields[]` — fields not yet collected that advisor should prioritize
- `handoff_message` — what to say to the customer at handoff

---

### CAP-008 — EmotionResponder

**Purpose:** Adapts the engine's response posture when the customer's emotional state requires it. Ensures that factual answers are delivered with appropriate empathy, and that AI never responds with information-first when emotion-first is required.

**Activated when:**
- `EmotionResult.emotion_intensity` is MEDIUM or HIGH
- `EmotionResult.empathy_required` is true

**Inputs consumed:**
- `EmotionResult`
- `Decision`

**Outputs produced:**
- `tone_modifier` — EMPATHETIC | REASSURING | PATIENT | VALIDATING
- `empathy_prefix` — optional empathy opening to prepend to the response
- `pacing_adjustment` — whether to slow down information delivery

---

## Capability Activation Priority

When multiple capabilities are selected, they execute in priority order:

```
Priority 1: HandoffEngine       (overrides all; if firing, execution collapses to handoff)
Priority 2: TrustEngine         (trust must be addressed before anything else)
Priority 3: ObjectionEngine     (objection must be resolved before recommendation)
Priority 4: EmotionResponder    (tone must be set before content is composed)
Priority 5: RecommendationEngine
Priority 6: LeadEngine
Priority 7: FAQEngine
Priority 8: ConversationIntelligence  (always last; wraps all others)
```

---

## Capability Composition Rules

Multiple capabilities may be active simultaneously. When composing their outputs:

1. A higher-priority capability may modify or override a lower-priority capability's output.
2. HandoffEngine, when active, suppresses output from LeadEngine, FAQEngine, and RecommendationEngine — the handoff is the only action.
3. TrustEngine may insert a trust-building step before FAQEngine's answer. The response becomes: trust acknowledgment → answer.
4. EmotionResponder wraps any output with an empathy modifier; it does not replace content.
5. ObjectionEngine and RecommendationEngine may not both produce primary content in the same turn — ObjectionEngine takes precedence.

---

## Adding New Capabilities

New capabilities are registered by:
1. Defining the capability specification (purpose, inputs, outputs, domain references)
2. Adding the capability to the Capability Registry with a new `CAP-NNN` ID
3. Adding activation rules to the Capability Selection Matrix
4. Defining priority relative to existing capabilities

No changes to the pipeline steps (01–11) are required to add a new capability.

---

## Dependencies

- `02_EXECUTION_PIPELINE.md` — Step 6 invokes the Capability Loader
- `AIOS/Domains/Insurance/Trust/Trust_Engine.md` — CAP-002
- `AIOS/Domains/Insurance/Lead/` — CAP-003
- `AIOS/Domains/Insurance/Knowledge/FAQ.md` — CAP-004
- `AIOS/Domains/Insurance/Recommendation/Recommendation_Framework.md` — CAP-005
- `AIOS/Domains/Insurance/Objection/Objection_Framework.md` — CAP-006
- `AIOS/Domains/Insurance/Human/Human_Handoff.md` — CAP-007

---

## Future Extensions

- `CAP-009` — InvestmentEngine: product advice for investment-linked products
- `CAP-010` — TaxPlanningEngine: tax deduction optimization advice
- `CAP-011` — ClaimAssistEngine: claim filing guidance and status tracking
- `CAP-012` — RetentionEngine: churn prevention for existing policyholders

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief AI System Architect | Initial creation — 8 capabilities, selection rules, composition model |
