# AI_CONTEXT.md
### AIOS Context Routing Protocol (ACRP)
**Version:** 1.0  
**Effective Date:** 2026-06-26  
**Status:** Active  
**Authority:** AIOS Platform Governance

---

## 1. Purpose

This document is the official entry point for all AI assistants entering this repository.

Its purpose is to ensure that each AI system loads the minimum context required for the task at hand instead of reading the entire repository blindly. This protocol exists to reduce noise, improve accuracy, preserve focus, and support reliable handoff between AI agents.

Loading every document is inefficient. It increases token usage, creates confusion, and makes it harder to identify the real source of truth. The correct approach is progressive context loading: begin with the minimum necessary documents and escalate only when the task requires more context.

---

## 2. Context Loading Philosophy

### Progressive Context Loading
An AI assistant should begin with the smallest relevant context and only expand when the task demands deeper understanding.

### Role-based Context Loading
Different roles require different minimum context:

- Product Owner: product and business intent
- Platform Architect: product + platform architecture
- Application Developer: product + platform + application context
- AI Engineer: product + platform + application + current status
- QA: product + application + current status
- Reviewer: product + platform + relevant architecture decisions
- Support AI: product + current status + handoff context

### Task-based Context Loading
The required context depends on the task type. A bug fix, a product discussion, a platform refactor, and a handoff session each require a different document set.

### Minimal Context Principle
The AI assistant should never load more documents than necessary. The default should be the smallest set that still enables safe and accurate action.

### Single Source of Truth
The repository uses a layered document model:

- Product intent lives in 00_PRODUCT_INTELLIGENCE.md
- Platform architecture lives in 01_PLATFORM_INTELLIGENCE.md
- Application implementation context lives in 02_APPLICATION_INTELLIGENCE.md
- Current state lives in 03_CURRENT_STATUS.md
- Temporary collaboration memory lives in 90_AI_HANDOFF.md

These documents are the canonical context sources. They should be read in order when more depth is required.

---

## 3. Context Loading Order

Every AI assistant should follow this canonical sequence when the task requires repository context.

```text
AI_CONTEXT.md

↓

00_PRODUCT_INTELLIGENCE.md

↓

01_PLATFORM_INTELLIGENCE.md

↓

02_APPLICATION_INTELLIGENCE.md

↓

03_CURRENT_STATUS.md

↓

90_AI_HANDOFF.md
```

### Purpose of each layer

- AI_CONTEXT.md: the routing protocol itself; defines what to load and why
- 00_PRODUCT_INTELLIGENCE.md: product intent, ownership boundaries, business goals, and product expectations
- 01_PLATFORM_INTELLIGENCE.md: platform architecture, governance, conventions, registry model, and ecosystem boundaries
- 02_APPLICATION_INTELLIGENCE.md: application-specific purpose, runtime model, flows, and integrations
- 03_CURRENT_STATUS.md: current operational snapshot, milestones, known issues, and current health
- 90_AI_HANDOFF.md: temporary collaboration memory for ongoing work, current sprint activity, and next steps

### Canonical rule
If the task is ambiguous, start at the top and load downward until enough context is available.

---

## 4. Task-based Loading Matrix

| Task | Required Documents | Rationale |
|---|---|---|
| Product Discussion | AI_CONTEXT + 00 | Establish product intent, ownership, and business framing before any design work. |
| Platform Design | AI_CONTEXT + 00 + 01 | Requires product boundaries and platform architecture context. |
| Application Development | AI_CONTEXT + 00 + 01 + 02 | Requires full application and platform context before implementation decisions. |
| Bug Fix | AI_CONTEXT + 00 + 01 + 02 + 03 | Requires implementation awareness plus current status and operational risks. |
| Continue Previous Sprint | AI_CONTEXT + 00 + 01 + 02 + 03 + 90 | Must recover the current work state and temporary assumptions. |
| Repository Refactoring | AI_CONTEXT + 00 + 01 + ADR | Requires architecture history and platform boundaries before structural change. |
| New Application Creation | AI_CONTEXT + 00 + 01 | Requires product and platform contract knowledge before creating a new app. |
| AIOS Platform Development | AI_CONTEXT + 00 + 01 | Requires platform governance and architecture context. |

### Explanation of each row

- Product Discussion: The AI should not begin with implementation detail. It needs the product definition first.
- Platform Design: Platform work must be grounded in product intent and platform architecture.
- Application Development: App work needs both the platform contract and application-specific context.
- Bug Fix: Bugs are often caused by current runtime conditions, so current status is essential.
- Continue Previous Sprint: Prior work often depends on temporary decisions, so handoff context is necessary.
- Repository Refactoring: Refactors are architecture-sensitive and must respect decisions captured in ADRs.
- New Application Creation: A new app should be built using the existing AIOS contract, not in isolation.
- AIOS Platform Development: Platform development requires governance, standards, and architecture awareness.

---

## 5. Role-based Loading Matrix

| Role | Minimum Context Required | Why |
|---|---|---|
| Product Owner | AI_CONTEXT + 00 | Product owners need product intent, scope, and business framing. |
| Platform Architect | AI_CONTEXT + 00 + 01 | Architects need product boundaries and platform structure. |
| Application Developer | AI_CONTEXT + 00 + 01 + 02 | Developers need the app context and the platform contract. |
| AI Engineer | AI_CONTEXT + 00 + 01 + 02 + 03 | AI engineers need implementation awareness and current operational status. |
| QA | AI_CONTEXT + 00 + 02 + 03 | QA needs the product expectations, app behavior, and current state. |
| Reviewer | AI_CONTEXT + 00 + 01 + 02 | Reviewers need the architecture and application context to evaluate changes. |
| Support AI | AI_CONTEXT + 03 + 90 | Support work depends on current incidents, current state, and ongoing handoff notes. |

### Role guidance

- Product Owner: focus on value, positioning, and product boundaries
- Platform Architect: focus on system boundaries, governance, and runtime model
- Application Developer: focus on how the app implements the product and platform contract
- AI Engineer: focus on behavior, handoff, and current runtime constraints
- QA: focus on expected behavior and known risks
- Reviewer: focus on correctness, governance, and architectural fit
- Support AI: focus on immediate operational context and current issues

---

## 6. Context Escalation Rules

An AI assistant should load more documents when any of the following is true:

### Need business understanding
Load 00_PRODUCT_INTELLIGENCE.md when the task concerns product direction, value proposition, customer framing, or ownership.

### Need platform understanding
Load 01_PLATFORM_INTELLIGENCE.md when the task concerns architecture, conventions, governance, registry expectations, or system boundaries.

### Need implementation details
Load 02_APPLICATION_INTELLIGENCE.md when the task concerns application behavior, feature flows, integrations, session handling, or runtime model.

### Need current sprint information
Load 03_CURRENT_STATUS.md and 90_AI_HANDOFF.md when the task depends on recent progress, current blockers, or ongoing development state.

### Need historical decisions
Load ADR documents when the task concerns why a prior architectural decision was made or whether a change is compatible with historical intent.

### Escalation rule of thumb
If the AI cannot safely act with the current context, it should escalate one layer deeper rather than guessing.

---

## 7. Future Evolution

This protocol must remain scalable.

Future intelligence documents may be added without breaking the protocol if they follow the same pattern:

- they must be introduced as a new layer in the context stack
- they must be clearly named and categorized
- they must be referenced from AI_CONTEXT.md
- they must not replace the existing canonical order unless the protocol is formally versioned

The canonical rule is that new documents should enrich the context stack, not replace the existing one. Compatibility is preserved by keeping the core order stable and by documenting any new layers explicitly.

---

## 8. Official Rule for All Future AI Assistants

Every AI assistant entering this repository must:

1. Read AI_CONTEXT.md first
2. Determine the task type
3. Load the minimum required intelligence documents
4. Escalate only when needed
5. Use 90_AI_HANDOFF.md for ongoing collaboration
6. Avoid reading irrelevant documents unless the task requires them

This protocol is the official entry point for AI context routing in the AIOS ecosystem.
