# Domain Contract — Insurance
### AIOS Layer 2 — Formal Interface for Application Consumers
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## Purpose

This document is the formal contract between the Insurance Domain (Layer 2) and any Application that consumes it. It defines what the Domain owns, what Applications may consume, what Applications must not redefine, and the rules governing source of truth and dependency direction.

All Applications consuming the Insurance Domain must align with this contract before implementation begins.

---

## Dependency Direction

```
AIOS Core (Layer 1)
       ↓
Insurance Domain (Layer 2)
       ↓
Application (Layer 3 — e.g., LINE Chatbot AI)
```

**Rules:**
- Domain knows nothing about Applications. Domain files must contain zero references to application infrastructure (LINE, Vercel KV, Google Sheets, session state, webhook).
- Applications consume Domain artifacts. Applications reference Domain documents; they do not copy or redefine Domain content.
- AIOS Core is never modified by Domain or Application layers.

---

## What the Insurance Domain Owns

The following are exclusively defined and maintained within `AIOS/Domains/Insurance/`:

| Area | Source of Truth | Path |
|---|---|---|
| Lead data model | Canonical lead field definitions | `Lead/Lead_Data_Model.md` |
| Lead lifecycle states | Lead status taxonomy and transitions | `Lead/Lead_Status.md` |
| Lead scoring logic | Scoring weights, signals, priority buckets | `Lead/Lead_Scoring.md` |
| Lead qualification rules | Criteria for sales-ready, nurture, discard | `Lead/Lead_Qualification.md` |
| Adaptive capture strategy | Progressive profiling rules and field priority | `Lead/Adaptive_Lead_Capture.md` |
| Sales playbook | Consultative selling, discovery, closing | `Sales/Sales_Playbook.md` |
| Sales psychology | Trust-building, persuasion ethics | `Sales/Sales_Psychology.md` |
| Need discovery | Structured question sets and branching | `Sales/Need_Discovery.md` |
| Buying signal detection | Signal taxonomy and response mapping | `Sales/Buying_Signal.md` |
| Closing framework | Ethical close sequences, consent capture | `Sales/Closing_Framework.md` |
| Cross-sell strategy | Cross-sell logic and sequencing | `Sales/Cross_Sell_Strategy.md` |
| Pain point framework | Pain classification and response mapping | `Sales/Pain_Point_Framework.md` |
| Fact finding | Data gathering process for needs analysis | `Sales/Fact_Finding.md` |
| Trust engine | Trust score definition, signals, thresholds | `Trust/Trust_Engine.md` |
| Trust scenarios | Scenario library for trust handling | `Trust/Trust_Scenarios.md` |
| Fraud handling | Fraud signal detection and response | `Trust/Fraud_Handling.md` |
| License verification | Credential and compliance verification | `Trust/License_Verification.md` |
| Professional credibility | Credibility-building framework | `Trust/Professional_Credibility.md` |
| Objection handling | All objection response frameworks | `Objection/` |
| Escalation business rules | When and why to escalate to human advisor | `Human/Escalation_Rules.md` |
| Human handoff domain rules | Required advisor context, lead readiness criteria | `Human/Human_Handoff.md` |
| Advisor brief | Context template for advisor at handoff | `Human/Advisor_Brief.md` |
| Call preparation | Pre-call checklist and context requirements | `Human/Call_Preparation.md` |
| Product knowledge taxonomy | Product categories, types, and relationships | `Products/` |
| Product recommendation rules | Rules for selecting and ranking products | `Recommendation/` |
| Coverage strategy | Coverage planning logic | `Recommendation/Coverage_Strategy.md` |
| Knowledge base | Policy, claim, medical, tax knowledge | `Knowledge/` |
| FAQ taxonomy and governance | Category schema and answer policy for FAQs | `Knowledge/FAQ.md` |

---

## What Applications May Consume

Applications may read and implement any Domain artifact. Permitted consumption patterns:

| Permitted | Description |
|---|---|
| Reference domain definitions | Link to domain documents from application docs |
| Implement domain rules in code | Translate domain logic into application runtime behavior |
| Extend domain fields for application use | Add application-specific fields (e.g., `kv_session_key`) while referencing domain fields |
| Measure domain metrics | Record trust scores, lead scores produced by domain logic |
| Trigger domain-defined escalations | Fire handoff based on domain escalation rules |
| Adapt domain content for channel | Reformat domain content (e.g., FAQ answers → LINE Flex Message) |

---

## What Applications Must Not Redefine

The following meanings are owned exclusively by the Domain. Applications must not create alternative definitions, shadow copies, or competing versions of these concepts:

| Prohibited Action | Domain Owner | Consequence of Violation |
|---|---|---|
| Redefine lead field meanings | `Lead/Lead_Data_Model.md` | Data inconsistency across channels |
| Redefine lead status taxonomy | `Lead/Lead_Status.md` | Broken lifecycle logic |
| Redefine lead scoring weights or meaning | `Lead/Lead_Scoring.md` | Incorrect prioritization |
| Redefine trust score meaning | `Trust/Trust_Engine.md` | Trust model divergence |
| Redefine escalation trigger rules | `Human/Escalation_Rules.md` | Incorrect or missed handoffs |
| Redefine product recommendation rules | `Recommendation/Recommendation_Framework.md` | Incorrect product suggestions |
| Redefine objection handling logic | `Objection/Objection_Framework.md` | Inconsistent customer experience |
| Define FAQ answer policy | `Knowledge/FAQ.md` | Answer quality drift |

---

## Source of Truth Rules

### Lead Data

| Concern | Source of Truth |
|---|---|
| Lead field definitions and meaning | `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` |
| Lead status states and transitions | `AIOS/Domains/Insurance/Lead/Lead_Status.md` |
| Lead scoring algorithm | `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` |
| Google Sheet column mapping | `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` |
| CRM sync protocol | `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` |

### FAQ

| Concern | Source of Truth |
|---|---|
| FAQ categories, schema, answer policy | `AIOS/Domains/Insurance/Knowledge/FAQ.md` |
| Runtime FAQ content (actual Q&A) | Google Sheet (external, managed by operator) |
| FAQ delivery format | `Applications/Line_Chatbot_AI/Integrations/Google_Sheet.md` |

### Trust

| Concern | Source of Truth |
|---|---|
| Trust score definition and signals | `AIOS/Domains/Insurance/Trust/Trust_Engine.md` |
| Application trust threshold behavior | `Applications/Line_Chatbot_AI/UX/Fallback_Strategy.md` |

### Handoff

| Concern | Source of Truth |
|---|---|
| When and why to escalate (business rules) | `AIOS/Domains/Insurance/Human/Escalation_Rules.md` |
| Required advisor context (domain level) | `AIOS/Domains/Insurance/Human/Human_Handoff.md` |
| LINE-specific handoff payload format | `Applications/Line_Chatbot_AI/Conversation/Handoff_Payload.md` |

---

## Application Ownership

The following are exclusively owned by the consuming Application and must not be defined in the Domain:

| Area | Path |
|---|---|
| LINE webhook handler | `Applications/Line_Chatbot_AI/app/api/line-webhook/` |
| Session state machine | `Applications/Line_Chatbot_AI/Conversation/Conversation_State.md` |
| Quick reply UX | `Applications/Line_Chatbot_AI/Conversation/Quick_Reply_Strategy.md` |
| Rich menu strategy | `Applications/Line_Chatbot_AI/Conversation/Rich_Menu_Strategy.md` |
| LINE-specific handoff payload | `Applications/Line_Chatbot_AI/Conversation/Handoff_Payload.md` |
| Google Sheet column mapping | `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` |
| Apps Script sync implementation | `Applications/Line_Chatbot_AI/Integrations/Apps_Script.md` |
| Lead synchronization protocol | `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` |
| Admin notification delivery | `Applications/Line_Chatbot_AI/Integrations/Notification.md` |
| KPI measurement and dashboards | `Applications/Line_Chatbot_AI/Analytics/KPI.md` |
| Flex message format | `Applications/Line_Chatbot_AI/Conversation/Flex_Message_Guideline.md` |
| Response formatting | `Applications/Line_Chatbot_AI/UX/Response_Formatting.md` |
| Error handling behavior | `Applications/Line_Chatbot_AI/UX/Error_Handling.md` |
| Fallback and escalation thresholds | `Applications/Line_Chatbot_AI/UX/Fallback_Strategy.md` |

---

## Enforcement

This contract is enforced through documentation review before any Phase implementation begins. Violations detected during review must be resolved before new feature work is added to affected files.

The Architecture Boundary Review Report (produced 2026-06-26) is the baseline that this contract formalizes.

---

## Related Documents

- `AIOS/Domains/Insurance/README.md` — Domain overview
- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Canonical lead fields
- `AIOS/Domains/Insurance/Trust/Trust_Engine.md` — Trust scoring
- `AIOS/Domains/Insurance/Human/Escalation_Rules.md` — Escalation business rules
- `Applications/Line_Chatbot_AI/02_APPLICATION_INTELLIGENCE.md` — Application overview

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Initial creation — formalizes domain/application boundary |
