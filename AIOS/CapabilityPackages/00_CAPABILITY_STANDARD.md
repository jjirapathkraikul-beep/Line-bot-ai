# 00 — Capability Standard

**Document ID**: AIOS-ACP-00  
**Type**: Canonical Standard — All ACP packages must conform  
**Version**: 1.0  
**Status**: Active  
**Authority**: Chief AI Capability Architect  
**Last Updated**: 2026-06-27

---

## Purpose

This document defines the **canonical specification** for every AI Capability Package (ACP) in the AIOS system. All 20 capability packages must conform to this standard. Any deviation is an architecture violation that must be corrected before commit.

---

## What Is a Capability Package?

A Capability Package (ACP) is the **executable capability specification** that the AI Execution Engine (AEE) loads at runtime to determine how to behave in a given conversation context.

### What ACP Is
- A **specification** — defines how the AI should behave
- A **boundary** — defines what is allowed and what is prohibited
- A **reference map** — points to knowledge, conversations, and patterns by reference
- A **composition unit** — can be combined with other capabilities

### What ACP Is NOT
- A **Knowledge Base** — does NOT store insurance product facts
- A **Prompt** — does NOT contain LLM instruction text
- A **Conversation Dataset** — does NOT describe conversation flows in detail
- A **Runtime component** — no code, no execution logic

---

## Capability ID Format

```
ACP-[NN]
where NN is the two-digit package number: 01 through 20
```

Examples: `ACP-01`, `ACP-08`, `ACP-17`

---

## Required Files Per Package

Every ACP package folder MUST contain exactly these 11 files:

| File | Required | Purpose |
|---|---|---|
| `README.md` | YES | Package overview and quick reference |
| `Capability.md` | YES | Core definition — the authoritative ACP document |
| `Knowledge_Map.md` | YES | Knowledge source references |
| `Conversation_Map.md` | YES | Entry, exit, interrupt, composition |
| `Decision_Rules.md` | YES | Execution logic |
| `Memory_Requirements.md` | YES | What to store and recall |
| `Response_Profile.md` | YES | Tone, length, style |
| `Restrictions.md` | YES | Hard prohibitions |
| `Examples.md` | YES | Good and bad conversation examples |
| `Regression.md` | YES | Regression test cases |
| `Future_Extensions.md` | YES | Planned evolution |

---

## Capability.md Standard Schema

Every `Capability.md` must define all fields in this schema:

```markdown
# [Package Name] Capability

## Capability ID
ACP-[NN]

## Version
[X.Y]

## Purpose
[One paragraph describing what this capability does and why it exists]

## Owner
AIOS — Chief AI Capability Architect

## Business Goal
[What business outcome this capability serves for Jirawat]

## Customer Goal
[What the customer is trying to accomplish when this capability activates]

## Supported Intents
[List of intent signals that activate this capability]

## Supported Emotions
[List of emotional states this capability is designed for]

## Conversation Dataset References
[List of ConversationDataset document IDs this capability draws from]

## Knowledge Dependencies
[List of Domain Knowledge documents this capability requires]

## Decision Rules
[Short summary — full rules in Decision_Rules.md]

## Memory Requirements
[Short summary — full requirements in Memory_Requirements.md]

## Lead Policy
[When lead data is allowed, required, or prohibited]

## Trust Policy
[How this capability interacts with trust signals]

## Escalation Rules
[When and how to escalate to Jirawat or another capability]

## Response Style
[Short summary — full profile in Response_Profile.md]

## Restrictions
[Short summary — full list in Restrictions.md]

## Failure Modes
[What can go wrong and how to detect it]

## Success Criteria
[How to measure success for this capability]

## Regression Tests
[Short list — full cases in Regression.md]

## Metrics
[KPIs tracked for this capability]

## Future Extensions
[Short list — full roadmap in Future_Extensions.md]
```

---

## Knowledge_Map.md Standard

```markdown
# Knowledge Map — [Package Name]

## Domain Knowledge References
[Paths to AIOS/Domains/* documents used by this capability]

## Conversation Dataset References
[AIOS/ConversationDataset/ document IDs used by this capability]

## Learning Layer References
[AIOS/Learning/ pattern and improvement database references]

## External Knowledge References
[External sources, regulations, standards referenced by name]

## Knowledge Gaps
[Knowledge that is missing and would improve this capability]

## NO-DUPLICATE DECLARATION
This capability does NOT duplicate any knowledge.
All knowledge is accessed by reference only.
```

---

## Conversation_Map.md Standard

```markdown
# Conversation Map — [Package Name]

## Entry Points
[How/when does this capability activate]
- Intent signals
- Explicit customer request
- Composed from another capability
- Priority override

## Exit Points
[How does this capability end]
- Success: natural completion, handoff to capability X
- Timeout: no engagement, default action
- Override: higher-priority capability takes over

## Interrupt Rules
[What can interrupt this capability mid-execution]
- Priority-level interrupts (e.g., trust signal → ACP-08)
- Customer intent change

## Resume Rules
[Can this capability be resumed after interrupt? Under what conditions?]

## Composition Rules
[Which capabilities this one can run alongside or in sequence]
- Pre-conditions: capabilities that should run before this
- Post-conditions: capabilities that typically follow
- Parallel capabilities: capabilities that may run concurrently

## Conversation Flow Summary
[Brief description of typical flow — detailed examples in Examples.md]
```

---

## Decision_Rules.md Standard

```markdown
# Decision Rules — [Package Name]

## Priority
[Numeric or label priority: CRITICAL / HIGH / ELEVATED / STANDARD]

## Activation Conditions
[What triggers this capability to activate]

## Preconditions
[What must be true for this capability to execute properly]

## Execution Conditions
[What governs behavior while capability is active]

## Exit Conditions
[What causes successful completion]

## Interrupt Conditions
[What causes capability to be suspended or overridden]

## Recovery Conditions
[How to resume after interrupt if applicable]

## Fallback Rules
[What to do if normal execution fails or produces no result]

## Conflict Resolution
[How conflicts with other active capabilities are resolved]
```

---

## Memory_Requirements.md Standard

```markdown
# Memory Requirements — [Package Name]

## Required Memory (Must Read Before Executing)
[Fields that must be checked before responding]

## Optional Memory (Use If Available)
[Fields that improve response quality but are not blocking]

## Working Memory (Maintained During Execution)
[State maintained across turns while this capability is active]

## Customer Profile Fields
[Customer profile data points relevant to this capability]

## CRM Fields
[CRM data that should be written when this capability completes]

## Conversation Summary
[What should be summarized and stored for future sessions]

## Known Facts
[Facts extracted from conversation that must be preserved]

## Never Ask Again Fields
[Fields that should not be re-requested once captured]
```

---

## Response_Profile.md Standard

```markdown
# Response Profile — [Package Name]

## Tone
[Professional / Empathetic / Educational / Practical / etc.]

## Length
[Short (1-3 sentences) / Medium (1-2 paragraphs) / Long (structured response)]

## Empathy Level
[None / Low / Medium / High / Critical]

## Professionalism Level
[Casual / Standard / Professional / Formal]

## Confidence Level
[Authoritative / Measured / Tentative / Deferring]

## Educational Depth
[None / Surface / Standard / Deep]

## Question Strategy
[One question per turn / Multiple allowed / No questions]

## Recommendation Strategy
[Max recommendations / Reasoning requirement / Personalization requirement]

## Closing Strategy
[How this capability ends a response]

## Language Rules
[Thai / English / Mixed — and any specific language requirements]
```

---

## Restrictions.md Standard

```markdown
# Restrictions — [Package Name]

## Hard Prohibitions (Must NEVER happen)
[List of absolutely prohibited behaviors — violations are critical errors]

## Soft Prohibitions (Should avoid)
[List of behaviors to avoid unless explicitly necessary]

## Data Collection Restrictions
[When personal data collection is prohibited]

## Timing Restrictions
[Timing conditions under which certain behaviors are prohibited]

## Content Restrictions
[Content that must not be generated]

## Competitive Restrictions
[What may not be said about competitors]
```

---

## Architecture Boundary Rules

### Rule 1: No Knowledge Duplication
No ACP may copy or embed content from Domain Knowledge documents. All knowledge is accessed by reference. Any duplicated knowledge is an architecture violation.

### Rule 2: No Conversation Logic Duplication
No ACP may reproduce detailed conversation flows that exist in ConversationDataset. Reference the dataset document instead.

### Rule 3: No Runtime Dependency
No ACP document may depend on, reference, or define runtime code. ACPs are documentation only.

### Rule 4: No Cross-Layer Contamination
ACP documents exist at Layer 2.5. They may reference downward (Domain Knowledge, Foundation) but not upward (Application, Runtime).

### Rule 5: Reference Integrity
Every reference in an ACP must point to a document that exists in the AIOS filesystem. Dangling references are architecture defects.

### Rule 6: Single Responsibility
Each ACP covers exactly one capability scope. Overlapping capability scope between packages requires a boundary decision, not silence.

---

## Violation Handling

If a violation is discovered:

| Violation Type | Severity | Fix Required Before |
|---|---|---|
| Knowledge duplicated | HIGH | Commit |
| Decision rules duplicated | MEDIUM | Commit |
| Conversation logic duplicated | MEDIUM | Commit |
| Trust rule duplicated | HIGH | Commit |
| Lead rule duplicated | MEDIUM | Commit |
| Missing required file | HIGH | Commit |
| Dangling reference | MEDIUM | Commit |
| Runtime dependency | CRITICAL | Commit |

---

## Capability Lifecycle

```
DRAFT
  ↓ (Architecture review pass)
ACTIVE
  ↓ (Superseded by v2)
DEPRECATED
  ↓ (Removed from active roster)
ARCHIVED
```

State transitions require:
- DRAFT → ACTIVE: Architecture Boundary Review pass
- ACTIVE → DEPRECATED: Replacement ACP identified and documented
- DEPRECATED → ARCHIVED: All references updated to replacement

---

## Governance

| Role | Responsibility |
|---|---|
| Chief AI Capability Architect | Owns this standard; approves major version changes |
| AI Execution Engine Team | Consumes ACP interface; cannot modify ACP content |
| Domain Knowledge Team | Owns referenced knowledge; must notify ACP team on changes |
| Learning Layer | Provides patterns referenced by ACPs |
| Human (Jirawat) | Approves ACP changes that affect customer-facing behavior |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial standard — canonical specification for all 20 ACPs |
