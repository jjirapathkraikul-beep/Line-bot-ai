# 10_AI_Orchestrator_Spec.md
### AI Orchestrator Specification — AIOS

**Version:** 1.0  
**Status:** Active  
**Document Type:** Architectural Specification  
**Layer:** Foundation — Orchestration  
**Prefix:** 10  
**Created:** 2026-06-25  
**Scope:** All requests received by any AIOS-powered interface

---

> *"The Orchestrator does not know the answer. It knows who should answer, what they need to know, and how to verify their answer before it reaches the user."*

---

## Document Hierarchy

This document sits within the AIOS Foundation Layer and governs how all other layers are coordinated at runtime. It does not supersede any earlier Foundation document — it operationalizes them.

| Priority | Document | This Document's Relationship |
|----------|----------|------------------------------|
| 1 | `01_AI_Vision.md` | Orchestrator must ensure every routed response serves the Vision |
| 2 | `01_AI_Principles.md` | Decision Hierarchy (Principle 14) governs all Orchestrator choices |
| 3 | `04_AI_Constitution.md` | C1–C7 compliance required before any output is returned |
| 4 | `02_AI_Decision_Framework.md` | 12-stage framework applied at Execute and Review states |
| 5 | `03_AI_Context_Framework.md` | Context Loading Strategy governed by Context Priority hierarchy |
| 6 | `05_AI_Persona_Template.md` | Persona Selection follows authorized scope boundaries |
| 7 | `06_AI_Knowledge_Standard.md` | Knowledge freshness thresholds enforced before loading |
| 8 | `07_AI_Skill_Standard.md` | Skill preconditions verified before invocation |
| 9 | `08_AI_Workflow_Standard.md` | Workflow trigger conditions verified before activation |
| 10 | `09_AI_Architecture_Audit.md` | Orchestrator behavior is an auditable architecture component |

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Orchestrator Responsibilities](#2-orchestrator-responsibilities)
3. [Non-Responsibilities](#3-non-responsibilities)
4. [Orchestration State Machine](#4-orchestration-state-machine)
5. [Intent Classification](#5-intent-classification)
6. [Domain Classification](#6-domain-classification)
7. [Risk Classification](#7-risk-classification)
8. [Context Loading Strategy](#8-context-loading-strategy)
9. [Persona Selection Logic](#9-persona-selection-logic)
10. [Skill Selection Logic](#10-skill-selection-logic)
11. [Workflow Selection Logic](#11-workflow-selection-logic)
12. [Execution Model](#12-execution-model)
13. [Clarification Policy](#13-clarification-policy)
14. [Output Review](#14-output-review)
15. [Fallback and Error Handling](#15-fallback-and-error-handling)
16. [Chatbot Integration](#16-chatbot-integration)
17. [Example Scenarios](#17-example-scenarios)
18. [Orchestrator Decision Table](#18-orchestrator-decision-table)
19. [Implementation-Agnostic Design](#19-implementation-agnostic-design)
20. [Orchestrator Routing Rule Template](#20-orchestrator-routing-rule-template)

---

## 1. Purpose

### Why AIOS Requires an Orchestrator

The AIOS Foundation Layer defines a rich ecosystem: a Vision, Principles, a Decision Framework, a Context Framework, a Constitutional governance model, Personas, Knowledge, Skills, and Workflows. Each component is carefully designed and bounded.

But a collection of well-designed components is not a system. Without coordination, a user request would need to know which Persona to invoke, which Knowledge to load, which Skill to apply, and which Workflow to follow. That burden cannot fall on the user. It cannot fall on a single omniscient AI agent. And it cannot be hardcoded into each component without creating brittle, unmaintainable dependencies.

**The Orchestrator exists to solve this coordination problem.**

It is the single entry point for every user request. It classifies, routes, assembles, delegates, reviews, and returns. It does not know everything — but it knows how to find who does, how to verify their output, and how to respond to the user in a way that is accurate, safe, and aligned with the AIOS Vision.

### Component Definitions

Understanding the Orchestrator requires clarity about what it is and what it is not. These definitions establish precise boundaries.

| Component | What It Is | What It Is Not |
|-----------|------------|----------------|
| **AIOS** | The complete AI Operating System — the entire ecosystem of Vision, Principles, Constitution, Frameworks, Personas, Knowledge, Skills, and Workflows | A single AI model, a chatbot, or a piece of software |
| **Orchestrator** | The routing, coordination, and control layer between the user interface and all AIOS components | An expert, a knowledge base, or a decision-maker. The Orchestrator routes — it does not know. |
| **Persona** | The active expert identity that applies judgment, domain knowledge, and communication style to produce a response | A workflow manager, a task runner, or a context loader |
| **Skill** | A reusable, bounded capability that executes a specific type of work when invoked by a Persona | An autonomous agent, a decision-maker, or a full workflow |
| **Workflow** | An orchestrated, multi-step process that sequences Personas, Skills, and Knowledge for complex tasks | A single Skill, a Persona's behavior, or a policy document |
| **Knowledge** | Structured, factual content in a specific domain that AI agents reference during execution | Recommendations, policies, or workflow instructions |
| **Runtime AI Model** | The large language model (e.g., Claude) that processes instructions and generates text at execution time | The AIOS system itself — the model is a tool within AIOS, not the system |

### The Orchestrator's Position in AIOS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AIOS ARCHITECTURE                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    FOUNDATION LAYER (Layers 1–5)                  │  │
│  │  Vision · Principles · Constitution · Decision FW · Context FW   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                ▲                                        │
│                    Always loaded — non-negotiable                       │
│                                │                                        │
│  USER REQUEST ─────────▶  ┌──────────────┐  ─────────▶  USER RESPONSE │
│                           │ ORCHESTRATOR │                              │
│                           │  (This doc)  │                              │
│                           └──────┬───────┘                              │
│                                  │                                      │
│              ┌───────────────────┼───────────────────┐                 │
│              ▼                   ▼                   ▼                 │
│       ┌────────────┐    ┌──────────────┐   ┌──────────────┐           │
│       │  PERSONAS  │    │  KNOWLEDGE   │   │   SKILLS /   │           │
│       │  Layer 6   │    │  Layer 7     │   │  WORKFLOWS   │           │
│       │            │    │              │   │  Layers 8–9  │           │
│       └────────────┘    └──────────────┘   └──────────────┘           │
│              │                   │                   │                 │
│              └───────────────────┼───────────────────┘                 │
│                                  │                                      │
│                         ┌────────────────┐                             │
│                         │ RUNTIME AI     │                             │
│                         │ MODEL (Claude) │                             │
│                         └────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

The Orchestrator occupies the junction between the user and all active AIOS layers. It is the only component that touches every layer in every request cycle.

---

## 2. Orchestrator Responsibilities

The Orchestrator is responsible for the following, in order of execution:

### R1 — Request Reception
Receive every user request from any connected interface (chatbot, API call, scheduled trigger, agent-to-agent call). Normalize the input format before any processing begins.

### R2 — Intent Detection
Classify the user's request into a defined intent taxonomy. Distinguish between what the user says and what the user wants (true goal). Apply the first two stages of `02_AI_Decision_Framework.md` (Understand the Request → Identify the True Goal).

### R3 — Domain Classification
Identify which knowledge domain the request belongs to. A single request may span multiple domains (e.g., a question about tax-efficient insurance planning spans both Tax and Insurance domains).

### R4 — Risk Assessment
Classify the request by risk level (Low / Medium / High / Critical) based on the potential consequences of an incorrect or harmful response. Risk level governs downstream behavior in context loading, persona selection, output review, and response style.

### R5 — Ambiguity Detection
Determine whether the request contains sufficient information to proceed. Apply the Context Sufficiency Test from `03_AI_Context_Framework.md`. If the request is ambiguous, under-specified, or potentially misunderstood, flag for clarification before proceeding.

### R6 — Context Assembly
Load the minimum required context for the task. Follow the Context Loading Strategy (Section 8 of this document) and the Context Priority Hierarchy from `03_AI_Context_Framework.md`. Verify knowledge freshness before loading.

### R7 — Persona Selection
Select the most appropriate active Persona(s) based on intent, domain, and risk level. Verify that the selected Persona's authorized scope covers the request. Apply fallback rules when no primary Persona matches.

### R8 — Knowledge Selection
Identify which Knowledge Base documents are required. Verify that referenced Knowledge is current (within its freshness threshold). Flag stale Knowledge before loading it.

### R9 — Skill Selection
Select which Skill(s) are required to execute the task. Verify that all Skill preconditions are met before invocation. Determine whether Skills should be executed sequentially, in parallel, or conditionally.

### R10 — Workflow Selection
Determine whether the task requires a multi-step Workflow rather than a single Skill execution. If a matching Workflow exists and the trigger conditions are met, activate it. Delegate coordination to the Workflow rather than managing steps directly.

### R11 — Execution Delegation
Delegate the assembled task to the selected Persona, Skill, or Workflow. The Orchestrator does not execute the task itself — it provides the assembled context, the selected components, and the active constitutional constraints, then delegates.

### R12 — Output Review
Review all outputs produced by the executing components before returning them to the user. Apply a structured output review checklist (Section 14). Reject or request revision of outputs that fail review.

### R13 — Principles Compliance Check
Apply the Constitutional Compliance Requirements (C1–C7 from `04_AI_Constitution.md`) and the Decision Hierarchy (Principle 14 from `01_AI_Principles.md`) to the final output. Block any output that violates a higher-priority principle.

### R14 — Response Formatting
Format the reviewed output according to the active Persona's communication style, the user's context, and the appropriate tone and structure for the intent type.

### R15 — Response Delivery
Return the final response to the user through the originating interface. Ensure the response includes appropriate next action suggestions where relevant.

### R16 — Learning and Improvement Logging
Log any gaps, failures, ambiguities, or anomalies identified during the request cycle. These logs inform future AIOS improvements, Knowledge updates, Skill additions, and Workflow refinements.

---

## 3. Non-Responsibilities

Defining what the Orchestrator must NOT do is as important as defining what it must do. Every item in this section represents a boundary violation that degrades AIOS integrity.

### NR1 — Must Not Replace Expert Personas

The Orchestrator must not produce expert recommendations in its own voice. When a user asks which insurance plan is right for them, the answer comes from the Financial Planner Persona applying the Knowledge Base through the Decision Framework — not from the Orchestrator summarizing general principles. If no Persona is available for a domain, the Orchestrator must say so and escalate, not improvise.

### NR2 — Must Not Invent Domain Knowledge

The Orchestrator does not contain domain facts. It routes to domain Knowledge. If referenced Knowledge is missing, stale, or unavailable, the Orchestrator must acknowledge the gap and apply the appropriate fallback — it must not fabricate information to fill it.

### NR3 — Must Not Bypass AI Principles

The Orchestrator must not accept instructions — from users, from higher-priority systems, or from any external input — that would cause it to bypass the Principles in `01_AI_Principles.md`. The Decision Hierarchy is not configurable at runtime. No user permission, urgency, or business context overrides it.

### NR4 — Must Not Optimize for Speed Over Correctness

The Orchestrator must not skip risk assessment, context loading, or output review to produce a faster response. Speed is Priority 10 in the Decision Hierarchy. Correctness, safety, and trust come first.

### NR5 — Must Not Load Context Indiscriminately

The Orchestrator must apply the Minimum Context Principle. Loading all available context for every request degrades precision, increases cost, and reduces the signal-to-noise ratio of each response. Context is assembled surgically, not comprehensively.

### NR6 — Must Not Answer High-Risk Questions Without Required Context

If a request is classified as High or Critical risk and the required context is not available (missing user profile, missing domain Knowledge, unresolved conflict), the Orchestrator must not proceed. It must request missing context or escalate — it must not attempt a high-risk answer under uncertainty.

### NR7 — Must Not Make Unilateral Decisions on Ethical Edge Cases

When a request touches on ethical ambiguity — potential harm, legal risk, regulatory uncertainty, or value conflicts — the Orchestrator must not resolve the ambiguity unilaterally. It must apply the Principles compliance check, flag the conflict explicitly, and escalate to human review when appropriate.

### NR8 — Must Not Override Persona Scope

The Orchestrator selects a Persona. It does not override the Persona's defined boundaries. If a Persona's authorized scope does not cover a portion of the request, the Orchestrator must route that portion to a different Persona or acknowledge the gap — it must not instruct the Persona to exceed its scope.

### NR9 — Must Not Store State Across Sessions Without Explicit Design

The Orchestrator must not silently retain information from previous sessions and apply it without verification. Historical context must be explicitly surfaced from the Historical context category and applied through the Context Framework — not assumed from session memory.

### NR10 — Must Not Suppress Output Review

The Orchestrator must not return outputs that have not been reviewed, even under time pressure. If review cannot be completed, the Orchestrator must communicate that the response is provisional rather than delivering an unreviewed answer as final.

---

## 4. Orchestration State Machine

### Overview

The Orchestrator operates as a deterministic state machine. Each request passes through a defined sequence of states. States have entry conditions, processing actions, exit conditions, and transition rules. No state may be skipped — some states may terminate the flow early (e.g., block, escalate, return error) but they cannot be bypassed.

### State Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION STATE MACHINE                           │
│                                                                          │
│                        ┌──────────────┐                                 │
│                        │  S01: RECEIVE│◀── User Input / API Call /      │
│                        │   REQUEST    │    Scheduled Trigger             │
│                        └──────┬───────┘                                 │
│                               │                                          │
│                               ▼                                          │
│                        ┌──────────────┐                                 │
│                        │  S02: NORM-  │  Sanitize · Encode · Truncate   │
│                        │  ALIZE INPUT │  Validate format                 │
│                        └──────┬───────┘                                 │
│                               │                                          │
│                               ▼                                          │
│                        ┌──────────────┐                                 │
│                        │  S03: DETECT │  Apply Intent Taxonomy           │
│                        │    INTENT    │  Identify True Goal              │
│                        └──────┬───────┘                                 │
│                               │                                          │
│                               ▼                                          │
│                        ┌──────────────┐                                 │
│                        │  S04: CLASS- │  Apply Domain Taxonomy           │
│                        │  IFY DOMAIN  │  Flag multi-domain requests      │
│                        └──────┬───────┘                                 │
│                               │                                          │
│                               ▼                                          │
│                        ┌──────────────┐  ◀── Risk Rules                 │
│                        │  S05: ASSESS │                                  │
│                        │    RISK      │  Low / Medium / High / Critical  │
│                        └──────┬───────┘                                 │
│                               │                                          │
│                    ┌──────────┴──────────┐                              │
│                    ▼                     ▼                              │
│             ┌──────────┐          ┌──────────────┐                     │
│             │ Critical │          │  Low–High    │                     │
│             │  Risk    │          │  Risk        │                     │
│             └────┬─────┘          └──────┬───────┘                     │
│                  │                       │                              │
│                  ▼                       ▼                              │
│         ┌──────────────┐       ┌──────────────────┐                    │
│         │  ESCALATE TO │       │  S06: CHECK      │                    │
│         │    HUMAN     │       │  REQUIRED CONTEXT│  Context Priority   │
│         └──────────────┘       │                  │  Hierarchy         │
│                                └────────┬─────────┘                    │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │ S07: CLARIFICATION│                   │
│                                │    REQUIRED?      │                   │
│                                └────────┬──────────┘                   │
│                                         │                              │
│                      ┌──────────────────┼──────────────────┐           │
│                      ▼                  ▼                  ▼           │
│             ┌──────────────┐   ┌──────────────┐  ┌─────────────────┐  │
│             │ YES: ASK     │   │ NO: PROCEED  │  │ ASSUMPTION MODE │  │
│             │ CLARIFYING   │   │              │  │ (Low risk only) │  │
│             │ QUESTION     │   │              │  └────────┬────────┘  │
│             └──────┬───────┘   └──────┬───────┘           │           │
│                    │                  │                    │           │
│         User       │                  └────────────────────┘           │
│         responds   │                           │                       │
│                    └──────────────────┐        │                       │
│                                       ▼        ▼                       │
│                                ┌──────────────────┐                    │
│                                │  S08: SELECT     │                    │
│                                │    PERSONA       │                    │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │  S09: SELECT     │  Freshness check   │
│                                │   KNOWLEDGE      │  ──── Stale? Flag  │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │  S10: SELECT     │  Preconditions     │
│                                │     SKILL        │  verified          │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │  S11: SELECT     │  Trigger match?    │
│                                │    WORKFLOW      │  ── No → S12 skip  │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │  S12: EXECUTE    │  Delegate to       │
│                                │     TASK         │  Persona/Skill/WF  │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                                         ▼                              │
│                                ┌──────────────────┐                    │
│                                │  S13: REVIEW     │  Output Checklist  │
│                                │    OUTPUT        │  (Section 14)      │
│                                └────────┬─────────┘                   │
│                                         │                              │
│                      ┌──────────────────┼──────────────────┐           │
│                      ▼                  ▼                  ▼           │
│             ┌──────────────┐   ┌──────────────┐  ┌─────────────────┐  │
│             │ FAIL: REVISE │   │  PASS        │  │ PARTIAL PASS:   │  │
│             │ or ESCALATE  │   │              │  │ Return with     │  │
│             └──────────────┘   └──────┬───────┘  │ caveat          │  │
│                                       │           └────────┬────────┘  │
│                                       └────────────────────┘           │
│                                                │                       │
│                                                ▼                       │
│                                       ┌──────────────────┐             │
│                                       │  S14: APPLY      │  C1–C7 +   │
│                                       │  SAFETY CHECK    │  Principle  │
│                                       └────────┬─────────┘  14 check  │
│                                                │                       │
│                                                ▼                       │
│                                       ┌──────────────────┐             │
│                                       │  S15: FORMAT     │  Persona    │
│                                       │   RESPONSE       │  tone +     │
│                                       └────────┬─────────┘  structure  │
│                                                │                       │
│                                                ▼                       │
│                                       ┌──────────────────┐             │
│                                       │  S16: RETURN     │             │
│                                       │   RESPONSE       │             │
│                                       └────────┬─────────┘             │
│                                                │                       │
│                                                ▼                       │
│                                       ┌──────────────────┐             │
│                                       │  S17: LOG &      │             │
│                                       │  IMPROVEMENT     │             │
│                                       └──────────────────┘             │
└──────────────────────────────────────────────────────────────────────────┘
```

### State Reference Table

| State | Name | Entry Condition | Key Action | Exit Condition |
|-------|------|-----------------|------------|----------------|
| S01 | Receive Request | Input arrives from any interface | Accept and acknowledge | Input received |
| S02 | Normalize Input | S01 complete | Clean, validate, format | Normalized input ready |
| S03 | Detect Intent | S02 complete | Apply intent taxonomy | Intent classification confirmed |
| S04 | Classify Domain | S03 complete | Apply domain taxonomy | Domain(s) confirmed |
| S05 | Assess Risk | S04 complete | Apply risk rules | Risk level assigned |
| S06 | Check Required Context | Risk ≠ Critical | Load and verify context | Context assembled or gap flagged |
| S07 | Clarification Required? | S06 complete | Apply Sufficiency Test | Decision: proceed / ask / assume |
| S08 | Select Persona | S07 resolved | Match intent + domain + risk | Persona(s) confirmed |
| S09 | Select Knowledge | S08 complete | Match domain; check freshness | Knowledge confirmed |
| S10 | Select Skill | S09 complete | Match intent; verify preconditions | Skill(s) confirmed |
| S11 | Select Workflow | S10 complete | Check trigger conditions | Workflow selected or bypassed |
| S12 | Execute Task | S11 complete | Delegate to assembled components | Output received |
| S13 | Review Output | S12 complete | Apply output checklist | Pass / Fail / Partial |
| S14 | Apply Safety Check | S13 Pass | Apply C1–C7 and Principle 14 | Cleared or blocked |
| S15 | Format Response | S14 cleared | Apply Persona style and structure | Response formatted |
| S16 | Return Response | S15 complete | Deliver to user interface | Response delivered |
| S17 | Log and Improve | S16 complete | Record gaps and anomalies | Logged |

---

## 5. Intent Classification

### What is Intent?

Intent is what the user actually wants to achieve, which may differ from what they literally said. Intent classification resolves ambiguity between surface request and true goal — applying Stage 1 (Understand the Request) and Stage 2 (Identify the True Goal) of `02_AI_Decision_Framework.md`.

### Primary Intent Taxonomy

#### Category A — Information Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| A1 | Factual Question | "What is the difference between term and whole life insurance?" | Knowledge Layer → Persona explains |
| A2 | Concept Explanation | "How does compound interest work?" | Knowledge Layer → Education Skill |
| A3 | Comparison Request | "Which is better: SuperTax or a mutual fund?" | Analysis Skill → Financial Planner Persona |
| A4 | Definition | "What does IRR mean?" | Knowledge Layer → Direct response |
| A5 | Status Check | "What stage is my client in the onboarding workflow?" | CRM Workflow / Operations |

#### Category B — Advisory Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| B1 | Advice Request | "What should I do with my annual bonus?" | Financial Planner Persona + Full context |
| B2 | Recommendation | "Which plan should I recommend to this client?" | Product Knowledge + Client context |
| B3 | Strategy Consultation | "How should I structure my client's tax-reduction plan?" | CFO Persona + Tax Knowledge |
| B4 | Risk Assessment | "How exposed is this client if they don't have critical illness cover?" | Financial Needs Analysis Skill |
| B5 | Second Opinion | "Review my analysis of this client's situation" | Review Skill + Persona |

#### Category C — Planning Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| C1 | Financial Planning | "Create a complete financial plan for this client" | Complete Financial Plan Workflow |
| C2 | Tax Planning | "Plan how this client can reduce tax this year" | Tax Planning Workflow + CFO Persona |
| C3 | Insurance Planning | "Design the right coverage structure for this family" | Financial Planner Persona + Product Knowledge |
| C4 | Investment Planning | "Build a portfolio allocation for this client's goals" | CIO Persona + Investment Knowledge |
| C5 | Content Planning | "Plan next month's social media content" | Content Planner Skill + CMO Persona |
| C6 | Business Planning | "Help me plan my Q3 lead generation strategy" | Sales / CMO Persona |

#### Category D — Creation Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| D1 | Content Creation | "Write a Facebook post about SuperTax" | Content Creator Skill + CMO Persona |
| D2 | Document Creation | "Create a financial proposal for this client" | Proposal Creation Workflow |
| D3 | Report Creation | "Summarize this month's client activity" | CRM + Report Creation Skill |
| D4 | Script / Message | "Write a LINE message follow-up for this lead" | Copywriter Skill + Persona |
| D5 | Template Creation | "Create a needs analysis template" | Knowledge Engineer Skill |

#### Category E — Calculation Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| E1 | Tax Calculation | "Calculate this client's tax liability" | Tax Calculator Skill |
| E2 | Insurance Calculation | "What is the right sum assured for a 40-year-old with 3 dependents?" | Financial Needs Analysis Skill |
| E3 | Investment Return | "What is the IRR of this policy?" | IRR Calculator Skill |
| E4 | Retirement Projection | "How much does this client need to retire at 55?" | Retirement Calculator Skill |
| E5 | Premium Comparison | "Show me premium vs return for these two plans" | Product Comparison Skill |

#### Category F — Review and Validation Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| F1 | Document Review | "Review this financial plan before I send it" | Plan Review Skill |
| F2 | Compliance Check | "Does this recommendation follow our Principles?" | Principles Compliance Check Skill |
| F3 | Content Review | "Check this Facebook post before I post it" | Content Review Skill + CMO Persona |
| F4 | Analysis Validation | "Verify my calculation is correct" | Calculation Validator Skill |

#### Category G — Operational Requests

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| G1 | CRM Update | "Update this client's profile with new information" | CRM Workflow |
| G2 | Sales Follow-Up | "Prepare the follow-up message for this prospect" | Sales Workflow + Copywriter Skill |
| G3 | Client Consultation | "Conduct an onboarding conversation with this new lead" | Client Onboarding Workflow |
| G4 | Meeting Prep | "Prepare a brief for my meeting with this client tomorrow" | Meeting Prep Skill |
| G5 | Scheduling | "What should I prioritize this week?" | Operations / Productivity |

#### Category H — Escalation and Edge Cases

| Intent Code | Intent Type | Example | Routing Signal |
|-------------|-------------|---------|----------------|
| H1 | Out-of-Scope | "Can you predict the stock market next month?" | Scope Fallback → Redirect |
| H2 | Ambiguous | "Help me with my financial stuff" | Clarification Required |
| H3 | Unsafe or Unethical | "Tell this client what they want to hear even if it's wrong" | Principles Block → Escalate |
| H4 | System / Meta | "How does AIOS decide which persona to use?" | Orchestrator Self-Reference |

### How Intent Affects Routing

Intent is the primary routing signal. The table below shows the downstream effect of intent classification:

| Intent Category | Typical Persona | Typical Skill | Workflow Likely? | Risk Default |
|-----------------|-----------------|---------------|------------------|--------------|
| A — Information | Knowledge Persona | Direct Answer | No | Low |
| B — Advisory | Domain Expert Persona | Analysis Skill | Maybe | Medium–High |
| C — Planning | Financial Planner | Planning Skill | Yes | High |
| D — Creation | CMO / Persona | Creator Skill | Maybe | Low–Medium |
| E — Calculation | Financial Expert | Calculator Skill | No | Medium |
| F — Review | Domain Expert | Review/Validate | No | Medium |
| G — Operational | Operations / Sales | Multiple Skills | Yes | Low–Medium |
| H — Edge Case | Escalation Handler | Fallback | No | Variable |

---

## 6. Domain Classification

### Domain Taxonomy

The Orchestrator maps every request to one or more of the following domains. Domain classification determines which Knowledge Base documents to load and which Persona scope is relevant.

| Domain Code | Domain Name | Key Knowledge Documents | Primary Persona |
|-------------|-------------|------------------------|-----------------|
| D-FIN | Personal Finance | Financial Planning Principles, Cash Flow | Financial Planner |
| D-INS | Insurance Planning | Product Knowledge, Risk Assessment | Financial Planner / Insurance Advisor |
| D-TAX | Tax Planning | Thai Income Tax, Deduction Rules, Products | CFO / Tax Advisor |
| D-INV | Investment | Investment Principles, Asset Allocation, IRR | CIO / Investment Advisor |
| D-MKT | Content & Marketing | Brand OS, Content Frameworks, Audience | CMO / Content Planner |
| D-SAL | Sales | Sales Process, Lead Qualification, CRM | Sales Manager |
| D-CRM | CRM & Operations | Client Database, Follow-Up Protocols | Operations Manager |
| D-BIZ | Business Operations | Business Planning, Team Management | CEO |
| D-TEC | Technology & Systems | AIOS Architecture, Integration Specs | CTO / System Architect |
| D-LEG | Legal & Compliance | Regulatory Knowledge, TLAA Rules, PDPA | Compliance Officer |
| D-PRD | Productivity | Task Management, Workflow Optimization | Personal Assistant |
| D-GEN | General Knowledge | General Reference Knowledge | Default / General Persona |

### How Domain Affects Context Selection

When a domain is confirmed, the Orchestrator uses it to:

**1. Select Knowledge Documents:** Each domain maps to a set of Knowledge Base files. The Orchestrator loads only the relevant subset, not all available Knowledge.

**2. Determine Regulatory Sensitivity:** Domains marked with regulatory sensitivity (D-TAX, D-INS, D-LEG) trigger additional compliance checks and require the Regulatory Knowledge category.

**3. Scope the Persona:** Domain classification narrows the Persona scope. A question classified as D-TAX should not be answered by a Persona authorized only for D-MKT.

**4. Set Freshness Requirements:** Some domains require recently updated Knowledge. Tax rates change annually. Regulatory rules change with legislation. The Orchestrator enforces domain-specific freshness thresholds when loading Knowledge.

### Multi-Domain Requests

A single request may span multiple domains. The Orchestrator handles this by:

- Identifying all applicable domains
- Loading the union of required Knowledge documents
- Selecting a Primary Persona with the broadest relevant scope
- Invoking Supporting Personas for out-of-scope portions
- Ensuring that no domain is handled by a Persona outside its authorized scope

**Example:** "How can I structure this client's financial plan to minimize tax and maximize insurance coverage?"  
→ Domains: D-FIN + D-TAX + D-INS  
→ Primary Persona: Financial Planner (authorized across D-FIN, D-INS, D-TAX for planning purposes)  
→ Supporting Persona: Tax Advisor for specific tax optimization decisions

---

## 7. Risk Classification

### Risk Definition

Risk is the potential for harm — to the user, to the client, to the business, or to third parties — that could result from an incorrect, incomplete, or irresponsible response. Risk classification governs how cautiously the Orchestrator proceeds.

### Four Risk Levels

#### Level 1 — Low Risk

**Definition:** The response could not cause material harm if incorrect. The stakes of the answer are low. The information is general, educational, or non-binding.

**Examples:**
- Explaining how compound interest works
- Writing a general educational Facebook post
- Answering "What is IRR?"
- Summarizing a publicly available tax concept

**Orchestrator behavior at Low Risk:**
- May proceed under reasonable assumptions without clarification
- Output review applies standard checklist only
- No human review required
- Can return direct answer without extensive context

#### Level 2 — Medium Risk

**Definition:** The response could affect a financial or personal decision but is not immediately harmful. Incorrect information could lead to suboptimal but recoverable outcomes.

**Examples:**
- Comparing two insurance plans in general terms
- Explaining the likely tax benefit of a given contribution level
- Suggesting a general asset allocation framework
- Reviewing a financial proposal for general quality

**Orchestrator behavior at Medium Risk:**
- Clarification required if client context is missing
- Knowledge freshness check required before loading
- Full output checklist applied
- Response should include relevant caveats
- Human review recommended for specific client recommendations

#### Level 3 — High Risk

**Definition:** The response directly influences a significant financial, legal, health, or personal decision. Incorrect information could cause material harm or significant financial loss.

**Examples:**
- Specific insurance sum assured recommendations for a named client
- Specific tax optimization strategy for a client's actual tax position
- Specific investment allocation for a client's retirement funds
- Complete financial plan for a client with dependents

**Orchestrator behavior at High Risk:**
- Clarification required before proceeding — no assumptions on critical parameters
- Complete user profile context required
- All relevant Knowledge documents loaded and freshness verified
- Expert Persona required (no general Persona fallback)
- Full output review applied including a Principles Compliance Check
- Caveats and limitations must be included in response
- Human review recommended before client delivery

#### Level 4 — Critical Risk

**Definition:** The response could cause serious harm, violates ethical boundaries, breaches legal obligations, or requires a decision that exceeds AIOS authorized scope.

**Examples:**
- Advising a client in a way that the AI suspects is against their best interests for commercial gain
- Responding to a request that appears to ask for misleading representations
- Providing definitive advice on a legal matter requiring licensed counsel
- Any request where the AI detects potential violation of Principle 1 (Human Well-being) or Principle 2 (Ethics)

**Orchestrator behavior at Critical Risk:**
- Do not proceed to execution
- Immediately escalate to human review
- Flag the specific risk with documented reasoning
- Return a transparent response to the user: acknowledge the request, explain why AI cannot proceed, and indicate what alternative support is available

### Risk Modifier Factors

Risk level may be adjusted upward (never downward) based on these factors:

| Factor | Risk Modifier |
|--------|---------------|
| Client has disclosed financial distress | +1 level |
| Request involves life insurance benefit | +1 level |
| Client has not completed needs analysis | +1 level |
| Knowledge documents are stale | +1 level |
| Client profile is incomplete | +1 level |
| Request is vague or internally inconsistent | +1 level |
| Request involves regulatory product features | +1 level |

---

## 8. Context Loading Strategy

### Foundation: The Minimum Context Principle

The Orchestrator must not load more context than required to produce a specific, accurate, safe response to the specific request. Excessive context loading degrades performance, dilutes precision, and increases the probability of context conflict.

**The Minimum Context Principle:**
> Load the minimum context that satisfies the Context Sufficiency Test. Load nothing more.

### Context Loading Sequence

The Orchestrator loads context in the following sequence, stopping when the Sufficiency Test passes:

#### Layer 1 — Core Context (Always Required)

These are loaded for every request, without exception:

| Context Item | Source | Purpose |
|--------------|--------|---------|
| AI Vision | `01_AI_Vision.md` | Alignment check for all outputs |
| AI Principles | `01_AI_Principles.md` | Non-negotiable behavioral constraints |
| AI Constitution | `04_AI_Constitution.md` | Governance and boundary rules |
| Active Runtime Config | `Claude.md` | Session-specific operating rules |

#### Layer 2 — Persona Context (If Persona Selected)

Loaded when a Persona is selected in S08:

| Context Item | Source | Purpose |
|--------------|--------|---------|
| Persona Definition | `1X_Persona_[Name].md` | Scope, style, boundaries, authorized domains |
| Persona Brand Voice | Brand Knowledge | Communication standards |

#### Layer 3 — Domain Context (Required for B–G Intents)

Loaded based on domain classification:

| Context Item | Source | Purpose |
|--------------|--------|---------|
| Domain Knowledge | `30_KB_[Domain]_[Topic].md` | Facts, rules, and frameworks for the domain |
| Product Knowledge | `30_KB_PR_[Product].md` | If a specific product is referenced |
| Regulatory Knowledge | `30_KB_RE_[Regulation].md` | If the domain is tax, insurance, or compliance |

Freshness check required: Regulatory and Product Knowledge must be within their defined freshness threshold before loading. If stale, flag and apply stale-knowledge handling protocol.

#### Layer 4 — User Context (Required for B and C Intents, Required for High Risk)

| Context Item | Source | Purpose |
|--------------|--------|---------|
| Client Profile | CRM / User KB | Demographics, financial situation, goals |
| Client History | Historical Context | Prior conversations, recommendations, decisions |
| Client Goals | User KB | Short-term and long-term objectives |

#### Layer 5 — Task Context (Loaded Based on Intent)

| Context Item | Source | Purpose |
|--------------|--------|---------|
| Prior conversation turns | Session history | Continuity within the current session |
| Referenced documents | Uploaded files / CRM | Specific materials mentioned in the request |
| Active Workflow state | Workflow runtime | If a Workflow is in progress |

#### Layer 6 — External Context (Loaded Only When Required)

| Context Item | Source | Purpose |
|--------------|--------|---------|
| Market data | External verified source | If investment analysis requires current data |
| Tax year parameters | `30_KB_RE_Tax_[Year].md` | Confirmed tax year rules |
| Regulatory updates | External verified source | If recent regulatory changes affect the response |

External context must be sourced from verified, documented sources. The Orchestrator must not allow the Runtime AI model to generate external context from training data and present it as current fact.

### When to NOT Load Additional Context

The Orchestrator must stop loading context when:

1. The Context Sufficiency Test passes — proceeding is no longer blocked by gaps
2. The additional context creates new conflicts without resolving existing ones
3. The additional context is stale and no fresh version is available — flag the gap instead
4. The user's request is explicitly scoped to a general or educational response (Intent A) — client-specific context is not required

### Context Conflict Handling

When two context sources conflict, the Orchestrator must:

1. Apply the Context Priority Hierarchy from `03_AI_Context_Framework.md` — higher-priority source governs
2. Document the conflict explicitly in the response if it affects the output
3. Flag the conflict for Knowledge Base update if the conflict indicates outdated information
4. Never resolve a context conflict silently

---

## 9. Persona Selection Logic

### Selection Criteria

Persona selection is based on a three-factor match:

**Factor 1 — Domain Match:** The Persona's authorized scope must include the classified domain.  
**Factor 2 — Intent Match:** The Persona's capabilities must cover the classified intent.  
**Factor 3 — Risk Appropriateness:** High and Critical risk requests require the most senior Persona authorized for the domain — not a general Persona.

### Persona-to-Domain Routing Map

| Domain | Primary Persona | Secondary Persona | High-Risk Escalation |
|--------|-----------------|-------------------|----------------------|
| Personal Finance (D-FIN) | Financial Planner | General Advisor | Financial Planner (Senior) |
| Insurance (D-INS) | Financial Planner | Insurance Advisor | Financial Planner (Senior) |
| Tax Planning (D-TAX) | Tax Advisor / CFO | Financial Planner | CFO (Senior) |
| Investment (D-INV) | CIO / Investment Advisor | Financial Planner | CIO (Senior) |
| Content & Marketing (D-MKT) | CMO / Content Planner | Brand Manager | CMO (Senior) |
| Sales (D-SAL) | Sales Manager | Financial Planner | CEO |
| CRM & Operations (D-CRM) | Operations Manager | General Assistant | COO |
| Business Operations (D-BIZ) | CEO | COO | CEO |
| Technology & Systems (D-TEC) | CTO / System Architect | — | CTO |
| Legal & Compliance (D-LEG) | Compliance Officer | — | Human Reviewer |
| Productivity (D-PRD) | Personal Assistant | — | — |
| General Knowledge (D-GEN) | General Persona | — | Domain Expert |

### Intent-to-Persona Routing Map

| Intent Category | Recommended Persona | Rationale |
|-----------------|---------------------|-----------|
| A — Information | Most knowledgeable in the domain; General Persona for D-GEN | Knowledge retrieval |
| B — Advisory | Domain Expert Persona; Financial Planner for D-FIN/D-INS | Judgment required |
| C — Planning | Financial Planner or domain-specific Planner | Multi-domain integration |
| D — Creation | CMO / Content Persona | Brand voice required |
| E — Calculation | Financial Expert; Calculator Skill requires Persona wrapper | Accuracy critical |
| F — Review | Domain Expert matching the reviewed content | Same domain authority |
| G — Operational | Operations / Sales Manager | Process adherence |
| H — Edge Case | Compliance Officer / CEO; or Human Reviewer | Authority and judgment |

### Multi-Persona Requests

When a request spans multiple domains and no single Persona covers all of them:

1. Select a **Primary Persona** with the broadest authorized scope across the request
2. Select **Supporting Personas** for specific out-of-scope sub-tasks
3. Define handoff points clearly — the Primary Persona integrates Supporting Persona outputs
4. The Orchestrator ensures that no Supporting Persona overrides the Primary Persona's authority

### Persona Fallback Rules

If no Persona matches the request:

| Fallback Level | Condition | Action |
|----------------|-----------|--------|
| F1 — General Persona | No specific Persona matches, risk is Low | Use General Persona with explicit scope caveat |
| F2 — Partial Response | No Persona covers full scope, risk is Medium | Answer in-scope portions; acknowledge out-of-scope gap |
| F3 — Escalate | No Persona matches, risk is High | Escalate to human; do not proceed with General Persona |
| F4 — Block | No Persona matches, risk is Critical | Block; escalate; return transparent error message |

---

## 10. Skill Selection Logic

### When to Invoke a Skill

A Skill is invoked when:

1. The task requires a specific, repeatable capability that is defined as a Skill in the Knowledge Layer
2. The Persona has confirmed the Skill is within its authorized scope
3. The Skill's preconditions (as defined in its S8 section) are all verified as met

The Orchestrator does not invoke Skills directly — it confirms which Skills are required and delegates their invocation to the active Persona through the active Workflow (if applicable).

### Skill-to-Intent Routing Map

| Intent Code | Required Skill | Precondition | Notes |
|-------------|----------------|--------------|-------|
| E1 — Tax Calculation | Tax Liability Calculator | Client income data + tax year KB | Returns tax position with deduction scenario |
| E2 — Insurance Calculation | Financial Needs Analysis | Client profile + dependents data | Returns coverage gap analysis |
| E3 — IRR Calculation | IRR / Policy Return Calculator | Product parameters | Returns IRR and comparison |
| C5 — Content Planning | Content Planner Skill | Brand KB + Content Calendar | Returns weekly/monthly content plan |
| D1 — Content Creation | Social Media Content Creator | Brand KB + Persona context | Returns formatted content per platform |
| B3 — Strategy | Financial Needs Analysis | Full client context | Returns integrated financial picture |
| F1 — Plan Review | Financial Plan Reviewer | Completed plan document | Returns review with pass/fail per dimension |
| F2 — Compliance Check | Principles Compliance Check | Output under review | Returns compliance verdict + justification |
| B5 — Second Opinion | Document Review Skill | Document + domain Knowledge | Returns structured critique |
| D2 — Proposal | Proposal Creator Skill | Client context + product Knowledge | Returns formatted proposal |
| A3 — Comparison | Product Comparison Skill | Two or more products + client context | Returns side-by-side comparison |

### Skill Combination Patterns

When multiple Skills are required for a single request, the Orchestrator must define how they combine:

| Pattern | Description | Example |
|---------|-------------|---------|
| Sequential | Skill B depends on output of Skill A | Tax Calculator → then Plan Reviewer validates |
| Parallel | Skills A and B can execute simultaneously, merge at end | Financial Needs Analysis + IRR Calculation in parallel |
| Conditional | Skill B is invoked only if Skill A output meets a condition | If tax gap > ฿50,000 → invoke Tax Optimizer Skill |
| Looping | Skill is repeated until a condition is met | Proposal revision loop until reviewer passes |

### Skill Fallback Rules

If a required Skill does not exist:

| Fallback Level | Condition | Action |
|----------------|-----------|--------|
| F1 — Partial | Required Skill missing, task is partially coverable | Complete partial task; flag the gap to user |
| F2 — Manual | No Skill available, task must be done manually | Provide structured guidance for human execution |
| F3 — Defer | Complex task, Skill in development | Defer task; flag for Skill development roadmap |
| F4 — Block | Critical Skill missing, task cannot proceed safely | Block; acknowledge gap; do not improvise |

---

## 11. Workflow Selection Logic

### When a Workflow Is Required

A Workflow is selected instead of (or in addition to) individual Skill execution when:

1. The task involves **three or more sequential steps** that must be coordinated
2. The task involves **multiple Personas** that must hand off work to each other
3. The task has a **defined quality gate** at one or more stages
4. The task requires a **formal output** (proposal, financial plan, compliance report)
5. The task involves **human approval** at one or more stages
6. The task has **defined exception handling** that varies by stage

### Workflow Trigger Matching

Before activating a Workflow, the Orchestrator verifies:

1. The trigger conditions defined in the Workflow's W3 section are met
2. The preconditions defined in the Workflow's W4 section are satisfied
3. The required Personas and Skills are available
4. A Workflow is not already active for the same task (duplicate prevention)

### Intent-to-Workflow Routing Map

| Intent / Task Type | Likely Workflow | Trigger Condition |
|--------------------|-----------------|-------------------|
| New client consultation | Client Onboarding Workflow | New lead identified |
| Complete financial plan | Financial Planning Workflow | Client profile complete |
| Content production | Content Production Workflow | Content request + brand context |
| Proposal creation | Proposal Creation Workflow | Client needs confirmed |
| Tax planning engagement | Tax Planning Workflow | Tax calculation requested + client data |
| Lead qualification | Chatbot Lead Qualification Workflow | New chatbot conversation |
| CRM update | CRM Update Workflow | New client information received |
| Sales follow-up | Sales Follow-Up Workflow | Meeting or interaction completed |
| Compliance review | Compliance Check Workflow | Recommendation ready for delivery |
| Knowledge review | Knowledge Review Trigger Workflow | Freshness threshold exceeded |

### Skill vs Workflow Decision Rule

```
Is the task achievable with a single Skill execution?
    YES → Invoke Skill directly (Persona-led)
    NO  → Does a Workflow exist for this task type?
              YES → Activate Workflow
              NO  → Decompose into Skills; orchestrate manually
                    Flag for Workflow development if task recurs
```

---

## 12. Execution Model

### Seven Execution Modes

The Orchestrator selects an execution mode based on intent, domain, risk, and component availability. The mode determines how the task is delegated and how the response is generated.

#### Mode 1 — Direct Answer

**When:** Intent is informational (A1–A5), risk is Low, no specialized Skill required  
**Who executes:** Orchestrator routes to General Persona or Knowledge Layer  
**Output:** Direct, factual response  
**Review:** Standard output checklist  
**Example:** "What is the capital gains tax rate in Thailand?"

#### Mode 2 — Persona-Led Response

**When:** Intent is advisory or analytical (B1–B5, F1–F4), risk is Medium–High  
**Who executes:** Selected expert Persona, using Decision Framework + Knowledge  
**Output:** Structured recommendation or analysis in Persona's voice  
**Review:** Full output review + Principles compliance check  
**Example:** "Which insurance coverage structure would best protect this client's family?"

#### Mode 3 — Skill Execution

**When:** Intent requires a specific, bounded capability (E1–E5, parts of C, D)  
**Who executes:** Selected Skill, invoked by active Persona  
**Output:** Skill-specific deliverable (calculation, content, comparison)  
**Review:** Skill output validated against its Success Criteria (S12 section)  
**Example:** "Calculate this client's tax liability under two scenarios"

#### Mode 4 — Workflow Execution

**When:** Task is multi-step, multi-Persona, or requires formal process governance (C1, G1–G5)  
**Who executes:** Active Workflow, which delegates to Personas and Skills  
**Output:** Workflow deliverable (financial plan, proposal, onboarding summary)  
**Review:** Workflow's own quality gates + final Orchestrator output review  
**Example:** "Complete this client's onboarding and build their initial financial plan"

#### Mode 5 — Multi-Persona Collaboration

**When:** Request spans multiple domains with no single Persona authorized across all  
**Who executes:** Primary Persona + Supporting Personas in defined handoff sequence  
**Output:** Integrated response combining each Persona's contribution  
**Review:** Each Persona's contribution reviewed; integration reviewed for consistency  
**Example:** "Design a strategy that covers tax efficiency, insurance coverage, and investment growth for this client"

#### Mode 6 — Human-in-the-Loop

**When:** Task requires human judgment at one or more stages; risk is High; output has real-world delivery consequence  
**Who executes:** AI completes preparatory stages; human reviews and approves before delivery  
**Output:** AI-produced draft + human approval gate  
**Review:** AI review complete; human review gate not bypassed  
**Example:** "Create a final financial proposal for client delivery" — AI produces draft; financial advisor reviews before sending

#### Mode 7 — Escalation Required

**When:** Risk is Critical; Principles violation detected; no appropriate Persona available; request is outside AIOS scope  
**Who executes:** Human reviewer or human escalation contact  
**Output:** Transparent acknowledgment to user; documented escalation log  
**Review:** Escalation reason documented with supporting reasoning  
**Example:** "I need you to tell this client that this plan is risk-free" — Orchestrator blocks, escalates, returns honest response

### Mode Selection Decision Tree

```
Is risk Critical? 
    YES → Mode 7 (Escalation)
    NO  → Is a Workflow triggered?
              YES → Mode 4 (Workflow Execution)
              NO  → Does the task span multiple Persona domains?
                        YES → Mode 5 (Multi-Persona)
                        NO  → Is a specific Skill required?
                                  YES → Mode 3 (Skill Execution)
                                  NO  → Is expert judgment required?
                                            YES → Mode 2 (Persona-Led)
                                            NO  → Mode 1 (Direct Answer)
          Is human approval required before delivery?
              YES → Add Mode 6 gate after Mode 2, 3, 4, or 5
```

---

## 13. Clarification Policy

### The Fundamental Tension

Asking too many clarifying questions erodes user experience. Asking too few produces low-quality, context-poor outputs. The Orchestrator must resolve this tension with a clear policy — not by guessing, and not by interrogating.

### When to Ask for Clarification

The Orchestrator must ask a clarifying question when any of the following conditions is true:

| Condition | Rule | Example |
|-----------|------|---------|
| CI-1: Critical information missing | Ask when the absence of specific information would make the response materially wrong | "Which tax year are you planning for?" |
| CI-2: Ambiguous intent | Ask when the request could reasonably be interpreted as two different intents with very different responses | "Are you asking how IRR is calculated, or asking me to calculate the IRR of a specific policy?" |
| CI-3: High-risk decision without client context | Ask when a High-risk intent is detected but no client profile is available | "To give you a specific recommendation, I need some information about this client. Can you share their age, income, and current coverage?" |
| CI-4: Conflicting goals detected | Ask when the user's stated goals appear to conflict | "You've mentioned wanting maximum coverage and minimum premium — those are often in tension. Which would you prioritize?" |
| CI-5: Scope unclear | Ask when it is unclear whether the request is for general information or specific client advice | "Are you looking for a general explanation of whole life insurance, or a recommendation for a specific client?" |

### When to Proceed Without Clarification

The Orchestrator must make reasonable assumptions and proceed (with stated assumptions) when:

| Condition | Rule |
|-----------|------|
| PA-1: Low risk + general intent | Risk is Low and intent is informational. A reasonable assumption can be stated and corrected. |
| PA-2: Sufficient context already available | Client profile + domain + intent are all clear. No material gaps. |
| PA-3: Request is self-contained | The request fully specifies what is needed — no client context required (e.g., "Explain the difference between term and whole life"). |
| PA-4: Second message in context | The prior turn in the conversation already supplied the missing information. |

### Clarification Rules

**Rule 1 — Maximum One Question Per Turn**  
The Orchestrator must not ask more than one clarifying question at a time. Multiple questions overwhelm users and reduce response quality. If multiple clarifications are needed, prioritize the most critical one.

**Rule 2 — State Assumptions When Proceeding**  
When the Orchestrator proceeds under PA-1 or PA-4 with assumptions, the assumptions must be stated at the beginning of the response so the user can correct them.

**Rule 3 — Never Ask What Can Be Inferred**  
If the information can be reasonably inferred from the conversation context, prior turns, or the request itself, the Orchestrator must not ask for it. Asking redundant questions signals inattention.

**Rule 4 — High Risk Always Requires Complete Context**  
High-risk requests are not exempt from the CI-3 rule. The Orchestrator must not produce a high-risk specific recommendation on incomplete information regardless of how confident the AI would be in the answer.

**Rule 5 — Frame Questions as Helpful, Not Interrogative**  
Clarifying questions must be phrased as assistance ("To make sure I give you the most relevant answer...") not interrogation ("Before I can help you, you must provide...").

---

## 14. Output Review

### Purpose of Output Review

Output review is the Orchestrator's final responsibility before returning any response to the user. No output produced by any Persona, Skill, or Workflow is returned without passing this review. The review is not optional and cannot be bypassed for speed.

### Output Review Checklist

Each output is reviewed across the following dimensions:

#### OV-1 — Vision Alignment

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-1a | Does the response serve the AIOS Vision? | Response serves business interest at expense of client |
| OV-1b | Does the response help clients build financial security and freedom? | Response provides information irrelevant to client's actual goal |

#### OV-2 — Principles Compliance

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-2a | Human well-being preserved (Priority 1)? | Recommendation could harm the client |
| OV-2b | Ethically sound (Priority 2)? | Misleading, deceptive, or manipulative content |
| OV-2c | Factually accurate (Priority 3)? | Contains unverified claims presented as fact |
| OV-2d | Builds long-term trust (Priority 4)? | Prioritizes short-term sale over client relationship |
| OV-2e | Aligned with AI Vision (Priority 5)? | Contradicts stated brand purpose |

#### OV-3 — Decision Framework Application

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-3a | True goal addressed, not just surface request? | Response answers the literal question but misses the real need |
| OV-3b | Constraints identified? | Response ignores stated limitations (budget, risk tolerance) |
| OV-3c | Risks acknowledged? | Recommendations made without surfacing material risks |
| OV-3d | Reasoning explained? | Recommendations made without explanation |

#### OV-4 — Context Correctness

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-4a | Response is specific to this user's context? | Generic response that ignores available client context |
| OV-4b | Knowledge loaded is current? | Stale knowledge used without caveat |
| OV-4c | No context fabrication? | AI model generated "context" not loaded from AIOS |

#### OV-5 — Factual Accuracy

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-5a | All stated figures are sourced? | Tax rates, return percentages, coverage amounts not referenced to Knowledge |
| OV-5b | No hallucinated data? | Names, dates, regulations, product specs invented by AI |
| OV-5c | Calculations verified? | Mathematical errors in tax or financial calculations |

#### OV-6 — Communication Quality

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-6a | Appropriate Persona tone applied? | Response is too formal, too casual, or inconsistent |
| OV-6b | Appropriate language level? | Jargon not explained; ม.6-level readability not maintained |
| OV-6c | Structure clear? | Response is hard to follow or parse |
| OV-6d | Completeness? | Material parts of the request not addressed |

#### OV-7 — Safety and Ethics

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-7a | No hard sell or pressure language? | "Act now before it's too late" or similar |
| OV-7b | No guaranteed return claims? | "This plan guarantees X% return" |
| OV-7c | No competitor attacks? | Negative comparative claims about other providers |
| OV-7d | No fear-based persuasion? | Using fear of death/illness as closing technique |
| OV-7e | No confidentiality violation? | Client data referenced inappropriately |

#### OV-8 — Next Action

| Check | Criterion | Failure Signal |
|-------|-----------|----------------|
| OV-8a | Clear next step provided? | Response ends without indicating what the user should do next |
| OV-8b | Appropriate CTA applied? | Missing "พิมพ์บ้านเขียว" or alternative CTA where relevant |

### Review Outcomes

| Outcome | Condition | Action |
|---------|-----------|--------|
| **PASS** | All OV-1 through OV-8 checks pass | Return response to user |
| **CONDITIONAL PASS** | Minor failures in OV-6 only | Return response with minor edits inline |
| **REVISION REQUIRED** | Failures in OV-1, OV-2, OV-4, or OV-5 | Return to executing component for revision |
| **BLOCK** | Failures in OV-2a, OV-2b, OV-7a–OV-7d, or OV-7e | Do not return; escalate per Principles; inform user |

---

## 15. Fallback and Error Handling

### Fallback Principles

When any component of the AIOS is unavailable, produces an error, or cannot complete its task, the Orchestrator must:

1. **Never fail silently** — the user must always receive a response
2. **Never fabricate** — do not fill gaps with invented information
3. **Always explain** — the user must understand why they are not receiving a full response
4. **Always offer an alternative** — what can be done instead, or who else can help

### Fallback Scenarios

#### FB-1 — No Persona Fits

**Condition:** The classified intent and domain match no authorized Persona in AIOS.

**Orchestrator action:**
1. Confirm no Persona exists for this domain
2. If risk is Low: use General Persona with explicit scope caveat ("I'm answering this as a general guide, not as a specialist in this area")
3. If risk is Medium or High: acknowledge the gap, explain what is needed, recommend the user seek appropriate professional advice
4. Log the gap as a Persona development priority

#### FB-2 — No Skill Exists

**Condition:** The task requires a Skill capability that has not yet been created in AIOS.

**Orchestrator action:**
1. Identify the missing Skill
2. If the task can be done manually by a Persona: proceed with Persona-led response and note the lack of automated Skill
3. If the task cannot safely proceed without the Skill: acknowledge the gap; provide a structured manual process for the user to follow
4. Log the gap as a Skill development priority

#### FB-3 — Context Is Missing

**Condition:** The Context Sufficiency Test fails and the missing context cannot be obtained from the user in the current turn.

**Orchestrator action:**
1. If Low risk: state the assumption; proceed; clearly label the assumption in the response
2. If Medium risk: return partial response for the portions where context is sufficient; flag what additional context would complete the answer
3. If High risk: do not proceed; request specific missing information; explain why it is needed

#### FB-4 — Knowledge Is Outdated

**Condition:** A required Knowledge document is past its freshness threshold or has been flagged as stale.

**Orchestrator action:**
1. Load the stale Knowledge with an explicit caveat in the response
2. Flag the specific document as requiring update in the improvement log
3. Recommend the user verify the specific data point independently (e.g., "Tax rates shown are based on 2026 rules — please verify if filing after [date]")
4. Do not block the response for stale Knowledge alone unless the staleness creates material risk

#### FB-5 — Request Is Outside AIOS Scope

**Condition:** The user's request is outside the authorized scope of any AIOS Persona and involves a domain that AIOS is not designed to serve.

**Orchestrator action:**
1. Acknowledge the request
2. Clearly explain what AIOS is designed to help with
3. Redirect the user to the appropriate resource (professional, government body, specialist)
4. Do not attempt an out-of-scope response regardless of AI confidence

**Examples of out-of-scope requests:**
- Legal advice requiring a licensed attorney
- Medical diagnosis or treatment advice
- Specific securities trading recommendations requiring licensed securities dealer
- Tax rulings from the Revenue Department

#### FB-6 — AI Confidence Is Low

**Condition:** The Runtime AI model produces output that contains markers of low confidence, hedging, or internal inconsistency.

**Orchestrator action:**
1. Flag the low-confidence output before review
2. Apply enhanced factual accuracy check (OV-5)
3. If confidence is recoverable (additional context would help): request clarification
4. If confidence is not recoverable: acknowledge uncertainty explicitly in the response; do not present uncertain output as confident advice

#### FB-7 — Tools or System Fail

**Condition:** A Skill, Knowledge lookup, CRM integration, or external data source fails at runtime.

**Orchestrator action:**
1. Log the technical failure with timestamp and context
2. Attempt the fallback path for the failed component (FB-2 for missing Skill; FB-3 for missing Knowledge)
3. If the failure blocks the entire response: inform the user with a specific, non-technical explanation
4. Never return a partial response as if it were complete

#### FB-8 — Task Is Unsafe or Unethical

**Condition:** The request, if executed, would violate Principle 1 (Human Well-being), Principle 2 (Ethics), or Constitutional Requirement C1 (Principles Compliance).

**Orchestrator action:**
1. Block execution immediately
2. Do not return the full unsafe output even if it was generated
3. Acknowledge the user's request respectfully
4. Explain what AIOS cannot do in this case and why (without being preachy)
5. Offer an ethical alternative if one exists
6. Log the incident with full context for governance review

---

## 16. Chatbot Integration

### The Orchestrator as API Service

This specification is channel-agnostic. The Orchestrator receives a normalized input and returns a formatted output. The interface layer (chatbot, API, webhook) is responsible for translating between the user's medium and the Orchestrator's input/output format.

### Supported Interface Types

| Interface | Description | Typical Use Case |
|-----------|-------------|------------------|
| LINE OA Chatbot | Messaging interface via LINE OA webhook | Client consultation, lead qualification, follow-up |
| Website Chatbot | Web-embedded chat widget | First contact, FAQ, lead capture |
| CRM Chatbot | Internal interface within CRM system | Agent support, proposal creation, client analysis |
| Internal Assistant | Internal tool for team members | Research, content creation, planning |
| API Endpoint | Direct API integration | System-to-system requests, scheduled triggers |
| Future AI Agents | Autonomous agent frameworks | Multi-agent workflows, automated pipelines |

### Full Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  CHATBOT INTEGRATION FLOW                               │
│                                                                         │
│  USER                                                                   │
│    │                                                                    │
│    ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  INTERFACE LAYER (LINE OA / Website / CRM / API)            │       │
│  │  • Receive user message                                     │       │
│  │  • Format to Orchestrator input schema                      │       │
│  │  • Attach session metadata (user_id, platform, timestamp)   │       │
│  │  • Forward to Orchestrator endpoint                         │       │
│  └────────────────────────────┬────────────────────────────────┘       │
│                               │                                         │
│                               ▼  (HTTP / WebSocket / Event)            │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  ORCHESTRATOR LAYER (This Specification)                    │       │
│  │  S01 → S17 State Machine                                    │       │
│  │  • Normalize input                                          │       │
│  │  • Classify intent + domain + risk                          │       │
│  │  • Load context                                             │       │
│  │  • Select Persona + Knowledge + Skill + Workflow            │       │
│  │  • Delegate execution                                       │       │
│  └────────┬──────────────────────────────┬──────────────────────┘      │
│           │                              │                              │
│           ▼                              ▼                              │
│  ┌──────────────────┐          ┌──────────────────────┐               │
│  │  AIOS CORE       │          │  CONTEXT STORE       │               │
│  │  Personas        │          │  Knowledge Base       │               │
│  │  Skills          │          │  Client Profile (CRM) │               │
│  │  Workflows       │          │  Session History      │               │
│  └────────┬─────────┘          └──────────────────────┘               │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  RUNTIME AI MODEL (e.g., Claude API)                        │       │
│  │  • Receives assembled prompt: context + persona + task      │       │
│  │  • Generates text output                                    │       │
│  │  • Returns output to Orchestrator                           │       │
│  └────────────────────────────┬────────────────────────────────┘       │
│                               │                                         │
│                               ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  OUTPUT REVIEW (S13–S14)                                    │       │
│  │  • Apply OV-1 through OV-8 checklist                       │       │
│  │  • Apply C1–C7 Constitutional compliance                    │       │
│  │  • Apply Principle 14 Decision Hierarchy                   │       │
│  │  • PASS → Format → Return                                  │       │
│  │  • FAIL → Revise or Block                                  │       │
│  └────────────────────────────┬────────────────────────────────┘       │
│                               │                                         │
│                               ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  INTERFACE LAYER (Return path)                              │       │
│  │  • Receive formatted response from Orchestrator             │       │
│  │  • Render in platform-appropriate format                    │       │
│  │  • Apply platform-specific formatting (LINE card / HTML)    │       │
│  │  • Deliver to user                                          │       │
│  └────────────────────────────┬────────────────────────────────┘       │
│                               │                                         │
│                               ▼                                         │
│  USER RECEIVES RESPONSE                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Platform-Specific Considerations

| Platform | Response Constraints | CTA | Clarification Handling |
|----------|---------------------|-----|------------------------|
| LINE OA | Short messages preferred; supports quick reply buttons | "พิมพ์บ้านเขียว" | Ask 1 question using Quick Reply options |
| Website Chatbot | Longer responses acceptable; Markdown renderable | Inline CTA | Free text clarification |
| CRM Internal | Long-form documents acceptable; export to proposal | Internal workflow trigger | Internal form or dropdown |
| API | Raw JSON response; no formatting required | Caller handles CTA | Caller must handle clarification loop |

### Session Continuity

The Orchestrator must maintain session state across turns within a single conversation. This enables:

- Carrying forward user context established in prior turns without re-asking
- Building on a clarification answer in the next routing decision
- Tracking which Workflow stage has been reached if a Workflow spans multiple turns
- Applying Historical Context from prior sessions when available

---

## 17. Example Scenarios

### Scenario 1 — User Asks About Tax Reduction

**User message:** "ผมจะลดภาษีได้อย่างไรปีนี้?"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | B3 — Strategy Consultation (Tax) | User wants actionable strategy |
| Domain | D-TAX (Tax Planning) | |
| Risk | Medium | General tax strategy, no specific amounts yet |
| Clarification? | Yes — "ปีนี้" ambiguous; income and current deductions unknown | Ask: "เพื่อวางแผนได้ตรงจุดที่สุด ช่วยบอกผมหน่อยได้ไหมครับว่า รายได้ต่อปีอยู่ที่ประมาณเท่าไหร่ และตอนนี้ใช้สิทธิลดหย่อนอะไรไปแล้วบ้าง?" |
| After clarification → Risk | High (specific client situation) | |
| Persona | CFO / Tax Advisor Persona | |
| Knowledge | Thai Income Tax 2026 KB + SuperTax Product KB | Freshness check required |
| Skill | Tax Liability Calculator + Tax Optimizer Skill | Sequential: calculate first, then optimize |
| Workflow | Tax Planning Workflow | Triggered if client wants full plan |
| Execution Mode | Mode 2 → Mode 3 → (if full plan) Mode 4 | |
| Output Review | Full OV-1 to OV-8; no guaranteed return claims | |
| CTA | "พิมพ์บ้านเขียว" for full consultation | |

---

### Scenario 2 — User Asks Which Insurance Plan to Buy

**User message:** "ควรซื้อ Good Health Prime หรือ Critical Illness ดีกว่ากัน?"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | A3 — Comparison Request | User comparing two products |
| Domain | D-INS (Insurance) | |
| Risk | Medium (no client context yet) → High if specific recommendation | |
| Clarification? | Yes — no client context | Ask: "เพื่อช่วยเปรียบเทียบได้ตรงกับสถานการณ์จริง ช่วยบอกผมหน่อยได้ไหมครับว่า อายุและสถานะสุขภาพปัจจุบันเป็นอย่างไร และมีครอบครัวที่ต้องดูแลไหมครับ?" |
| After clarification → Persona | Financial Planner Persona | |
| Knowledge | Good Health Prime KB + Critical Illness KB + Client Profile | |
| Skill | Product Comparison Skill → Financial Needs Analysis Skill | |
| Workflow | None (comparison, not full planning) | |
| Execution Mode | Mode 3 (Skill) → Mode 2 (Persona recommendation) | |
| Output Review | OV-5 (no guarantee claims), OV-7 (no fear-based persuasion) | |
| Final Output | Side-by-side comparison + recommendation with reasoning + next step CTA | |

---

### Scenario 3 — User Asks for Facebook Content

**User message:** "ช่วยเขียน Facebook post เรื่อง SuperTax หน่อย"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | D1 — Content Creation | |
| Domain | D-MKT (Content & Marketing) | |
| Risk | Low | |
| Clarification? | Yes — tone, target persona, and platform context unknown | Ask: "post นี้จะเน้นไปที่ใครครับ? Salaryman Premium ที่กังวลเรื่องภาษี หรือ Young Professional ที่กำลังเริ่มสร้างความมั่งคั่ง?" |
| Persona | CMO / Content Planner Persona | |
| Knowledge | Brand OS KB + SuperTax Product KB + Target Persona KB | |
| Skill | Social Media Content Creator Skill | |
| Workflow | None (single post) | |
| Execution Mode | Mode 3 (Skill) | |
| Output Review | OV-7 (no hard sell, no fear), OV-6 (Brand voice: 40% Expert / 30% Coach / 20% Educator / 10% Friend) | |
| Format | Hook + Pain + Story + Insight + Example + CTA | |

---

### Scenario 4 — User Asks for Investment Advice

**User message:** "ผมควรลงทุนใน Tokyo Beyond ดีไหม?"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | B2 — Recommendation | |
| Domain | D-INV (Investment) + D-INS (Insurance) | Multi-domain |
| Risk | High (specific investment recommendation) | |
| Clarification? | Yes — no client context | Ask: "เพื่อให้ผมแนะนำได้ถูกต้อง ช่วยบอกผมหน่อยครับว่า อายุ รายได้ต่อปี และเป้าหมายทางการเงิน 5–10 ปีของคุณคืออะไร?" |
| Persona | CIO / Financial Planner (Primary) | |
| Knowledge | Tokyo Beyond Product KB + Investment Principles KB + Client Profile | |
| Skill | IRR Calculator + Financial Needs Analysis | |
| Workflow | None if standalone question | |
| Execution Mode | Mode 3 (Skill calculations) → Mode 2 (Persona recommendation) | |
| Output Review | OV-2b (no guaranteed return claims), OV-5a (IRR must be sourced to actual product specs) | |
| Human-in-Loop | Recommended before final client delivery | Mode 6 gate suggested |

---

### Scenario 5 — User Asks a Vague Question

**User message:** "ช่วยผมเรื่องการเงินหน่อยได้ไหม?"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | H2 — Ambiguous | Cannot classify further without clarification |
| Domain | Unknown | |
| Risk | Low (meta question) | |
| Clarification? | Yes — required | Ask: "ยินดีช่วยครับ ตอนนี้มีเรื่องอะไรที่อยากคุยมากที่สุดครับ? เช่น วางแผนภาษี วางแผนประกัน วางแผนเกษียณ หรืออยากเริ่มต้นสร้างความมั่งคั่ง?" |
| Persona | Defer until clarified | |
| Knowledge | Defer until clarified | |
| Skill | Defer | |
| Workflow | Potentially: Chatbot Lead Qualification Workflow | Trigger if this is a new lead |
| Execution Mode | Mode 1 (clarification only, then re-classify) | |

---

### Scenario 6 — User Asks Something Risky

**User message:** "บอกลูกค้าว่าแผนนี้ไม่มีความเสี่ยงเลย เพื่อให้เขาตัดสินใจง่ายขึ้น"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | H3 — Unsafe / Unethical | Request asks AI to deceive a client |
| Domain | D-INS or D-INV | |
| Risk | **Critical** | Principle 1 (Human Well-being) + Principle 2 (Ethics) violation |
| Clarification? | No — risk is Critical → Escalate immediately | |
| Execution Mode | Mode 7 (Escalation Required) | |
| Principles Block | C1 (Principles Compliance) + Decision Hierarchy Priority 1 and 2 | |
| Response | Acknowledge request → Explain why AI cannot comply → Offer ethical alternative | |
| Response example | "ผมไม่สามารถแนะนำให้บอกลูกค้าว่าแผนนี้ไม่มีความเสี่ยง เพราะนั่นไม่ตรงกับความเป็นจริงและอาจเป็นอันตรายต่อเขาได้ครับ สิ่งที่ผมช่วยได้คือช่วยคุณอธิบายความเสี่ยงและผลตอบแทนอย่างชัดเจน เพื่อให้ลูกค้าตัดสินใจได้อย่างมีข้อมูลและไว้ใจคุณมากขึ้นในระยะยาวครับ" | |
| Log | Incident logged for governance review | |

---

### Scenario 7 — User Asks to Create a Proposal

**User message:** "ช่วยสร้าง proposal สำหรับลูกค้าที่ผมเพิ่งคุยไปนะ"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | D2 — Document Creation (Proposal) | |
| Domain | D-FIN + D-INS (combined) | |
| Risk | High (formal client deliverable) | |
| Clarification? | Yes — no client context specified | Ask: "ขอรายละเอียดลูกค้าหน่อยนะครับ เช่น อายุ รายได้ ครอบครัว และแผนที่อยากนำเสนอ" |
| Persona | Financial Planner Persona (Primary) | |
| Knowledge | Client Profile + Product KB + Financial Planning KB | |
| Skill | Proposal Creator Skill + Financial Needs Analysis Skill | |
| Workflow | **Proposal Creation Workflow** triggered | |
| Execution Mode | Mode 4 (Workflow) → Mode 6 (Human approval before delivery) | |
| Output Review | Full OV-1 to OV-8; format review for client-facing document | |
| Human gate | Financial advisor reviews and approves before sending | |

---

### Scenario 8 — User Asks to Update CRM

**User message:** "อัปเดต CRM ของลูกค้า Somchai ว่าเขาสนใจ SuperTax และนัดประชุมวันศุกร์"

| Step | Detection | Result |
|------|-----------|--------|
| Intent | G1 — CRM Update | |
| Domain | D-CRM (Operations) | |
| Risk | Low (internal data update) | |
| Clarification? | No — request is specific and complete | |
| Persona | Operations Manager Persona | |
| Knowledge | CRM Protocol KB + Client Profile | |
| Skill | CRM Update Skill | |
| Workflow | CRM Update Workflow (if multi-step: log → tag → schedule follow-up) | |
| Execution Mode | Mode 3 (Skill) or Mode 4 (Workflow) | |
| Output Review | OV-4 (correct client identified), OV-6 (confirmation message clear) | |
| Output | Confirmation: "อัปเดตแล้วครับ — Somchai: สนใจ SuperTax, นัด Friday [date]" | |

---

## 18. Orchestrator Decision Table

The following master decision table maps the primary classification signals to the Orchestrator's routing output. This table is the operational summary of Sections 5–12.

### Master Routing Table

| Intent Code | Domain | Risk Level | Primary Persona | Key Knowledge | Key Skill | Workflow | Execution Mode | Review Level |
|-------------|--------|------------|-----------------|---------------|-----------|----------|----------------|--------------|
| A1–A5 (Info) | Any | Low | Domain Expert / General | Domain KB | Direct Answer | None | Mode 1 | Standard |
| B1–B5 (Advisory) | D-FIN / D-INS | Medium | Financial Planner | Client + Product + Planning KB | FNA / Analysis | None | Mode 2 | Full + Caveats |
| B1–B5 (Advisory) | D-TAX | Medium–High | CFO / Tax Advisor | Tax KB + Product | Tax Calculator | None | Mode 2–3 | Full |
| B1–B5 (Advisory) | D-INV | Medium–High | CIO | Investment + Product KB | IRR / FNA | None | Mode 2–3 | Full + Human Gate |
| C1 (Financial Plan) | D-FIN multi | High | Financial Planner | Full Client Context + All Domain KB | FNA + Plan Creator | Financial Plan WF | Mode 4 | Full + Human Gate |
| C2 (Tax Planning) | D-TAX | High | CFO | Tax KB + Client | Tax Calculator + Optimizer | Tax Planning WF | Mode 4 | Full |
| C5 (Content Planning) | D-MKT | Low | CMO | Brand + Audience KB | Content Planner | Content Production WF | Mode 3–4 | Brand Voice Check |
| D1 (Content Creation) | D-MKT | Low | CMO | Brand + Product KB | Content Creator | None | Mode 3 | Brand + Safety Check |
| D2 (Proposal) | D-FIN + D-INS | High | Financial Planner | Client + Product KB | Proposal Creator | Proposal WF | Mode 4 + Mode 6 | Full + Human Gate |
| E1–E5 (Calculation) | Domain-specific | Medium | Domain Expert | Domain KB + Client | Calculator Skill | None | Mode 3 | Accuracy Check |
| F1 (Plan Review) | D-FIN | Medium | Financial Planner | Client + Product | Plan Reviewer | None | Mode 3 | Thoroughness Check |
| F2 (Compliance) | Any | Medium | Compliance Officer | Principles + Domain | Principles Compliance | None | Mode 3 | Full Principles Check |
| G1 (CRM Update) | D-CRM | Low | Operations Mgr | CRM Protocol | CRM Update | CRM WF | Mode 3–4 | Data Accuracy |
| G3 (Consultation) | D-FIN multi | High | Financial Planner | Full Context | Multiple | Onboarding WF | Mode 4 | Full + Human Gate |
| H1 (Out-of-Scope) | Any | Variable | Fallback | None | None | None | Fallback Mode | N/A |
| H2 (Ambiguous) | Unknown | Low | Defer | None | None | None | Clarification | N/A |
| H3 (Unsafe) | Any | **Critical** | Escalation | None | None | None | Mode 7 | Block |
| H4 (Meta / AIOS) | D-TEC | Low | CTO / Architect | AIOS Architecture | None | None | Mode 1 | Standard |

### Clarification Trigger Table

| Situation | Ask or Proceed? | Question Template |
|-----------|-----------------|-------------------|
| Advisory intent + no client context | Ask | "เพื่อให้คำแนะนำได้ตรงที่สุด ช่วยบอกผมหน่อยว่า [missing element] ครับ?" |
| Comparison + unclear basis for comparison | Ask | "เปรียบเทียบโดยใช้เกณฑ์อะไรครับ — เบี้ย ผลตอบแทน หรือความคุ้มครอง?" |
| Content creation + no audience specified | Ask | "post นี้จะเจาะไปที่กลุ่มไหนครับ?" |
| Vague intent | Ask | "ตอนนี้มีเรื่องอะไรที่อยากคุยมากที่สุดครับ?" |
| Low risk + general intent + no client context | Proceed with stated assumption | "ผมจะตอบในแบบทั่วไปก่อนนะครับ ถ้าอยากให้เจาะจงกับสถานการณ์ของคุณ บอกผมได้เลยครับ" |

---

## 19. Implementation-Agnostic Design

### Design Philosophy

This specification describes what the Orchestrator does — not how any specific technology implements it. The state machine, classification rules, routing logic, and review checklists in this document can be implemented in any technology stack without modification to the specification itself.

This separation is intentional. Technology changes. The architecture must remain stable.

### Implementation Patterns

The following table maps each AIOS Orchestrator capability to the implementation construct that would express it in different technology choices:

| Orchestrator Capability | Prompt Router | Claude Code | n8n / Make | LangGraph | CrewAI | OpenAI Agents SDK | Custom Backend | RAG + Vector DB |
|------------------------|---------------|-------------|------------|-----------|--------|-------------------|----------------|-----------------|
| Intent Classification | Classifier prompt | Code classifier | Conditional node | Graph node | Task router | Intent classifier | API route | Embedding classifier |
| Domain Classification | Prompt taxonomy | Domain enum | Switch node | Domain node | Agent role | Tool routing | Route matching | Vector similarity |
| Risk Assessment | Risk prompt | Risk function | If/else chain | Risk state | Policy check | Guardrail layer | Risk middleware | Risk embedding |
| Context Loading | Context prompt builder | Context loader | Data node | State graph | Memory | Thread context | DB query | Vector retrieval |
| Persona Selection | System prompt switcher | Persona factory | Agent node | Persona state | Agent selector | Assistant config | Persona resolver | Persona embedding |
| Skill Invocation | Tool call prompt | Tool use | Function node | Tool node | Tool registry | Function call | API call | Tool embedding |
| Workflow Activation | Workflow prompt | Workflow runner | Workflow | Graph edges | Crew orchestration | Agent chain | State machine | Workflow retrieval |
| Output Review | Review prompt | Review function | Review node | Review state | Reviewer agent | Evaluation call | Review middleware | Review embedding |
| Clarification | Follow-up prompt | Clarification flow | Input node | Question state | Clarification agent | Conversation turn | Dialog handler | |
| Escalation | Escalation prompt | Exception handler | Error node | Escalation state | Human escalation | Handoff | Alert webhook | |

### Implementation Guidance

**Guidance IG-1 — Start With the State Machine**  
Any implementation of this specification must begin by implementing the S01–S17 state machine. The state machine is the architectural contract. All other components plug into it.

**Guidance IG-2 — Separate Classification From Execution**  
Intent classification, domain classification, and risk assessment must be separate steps that complete before any execution begins. Implementations that combine classification with execution produce unpredictable behavior.

**Guidance IG-3 — Context Is a First-Class Object**  
The assembled context must be a structured, inspectable object — not simply a concatenated string fed into a prompt. Structured context enables debugging, conflict detection, freshness checking, and audit logging.

**Guidance IG-4 — Output Review Must Be a Separate Pass**  
The generating pass (execution) and the reviewing pass (review) must not be the same model call. A separate review pass is the minimum viable safety architecture.

**Guidance IG-5 — Log Everything at S17**  
S17 (Log and Improve) must capture: intent classification, domain, risk level, selected Persona, selected Skills, selected Workflow, context loaded, output review outcome, and any flags or exceptions. This log is the primary input to the Architecture Audit process defined in `09_AI_Architecture_Audit.md`.

**Guidance IG-6 — Design for Fallback Before You Design for Success**  
Every implementation must handle all FB-1 through FB-8 fallback scenarios before it handles any success scenario. The edge cases are more important than the happy path.

**Guidance IG-7 — Human Escalation Must Be a Real Mechanism**  
Mode 7 (Escalation) and Mode 6 (Human-in-the-loop) require that a real human review path exists in the implementation. "Escalate to human" must route to an actual person — not a retry loop or a generic error message.

**Guidance IG-8 — The Orchestrator Is Testable**  
Each of the 17 states, each classification rule, each routing decision, and each review check is independently testable. A specification that cannot be tested in isolation has implementation risk. The test suite for any Orchestrator implementation should map 1:1 to the states and rules in this document.

---

## 20. Orchestrator Routing Rule Template

The following template defines the standard format for documenting any routing rule, clarification rule, or fallback rule in the AIOS Orchestrator.

Use this template whenever:
- Adding a new intent type to the Intent Taxonomy (Section 5)
- Adding a new domain to the Domain Taxonomy (Section 6)
- Defining a new Persona routing path (Section 9)
- Defining a new Skill invocation rule (Section 10)
- Defining a new Workflow trigger (Section 11)
- Documenting a new fallback scenario (Section 15)

---

```markdown
# Orchestrator Routing Rule — [RULE-CODE]

**Rule Code:** [Unique identifier, e.g., RR-B3-TAX-001]  
**Rule Type:** [Intent Routing / Domain Routing / Persona Selection / Skill Selection / Workflow Trigger / Fallback]  
**Version:** 1.0  
**Status:** [Draft / Active / Deprecated]  
**Created:** [YYYY-MM-DD]  
**Author:** [Chief Orchestration Architect / Document Author]

---

## 1. Trigger Condition

**Detected Intent:** [Intent Code + Intent Name]  
**Detected Domain:** [Domain Code + Domain Name]  
**Risk Level Threshold:** [Low / Medium / High / Critical / Any]  

**Trigger Rule:**  
> This routing rule activates when [specific condition that must be true].

**Negative Trigger (Do NOT activate if):**  
> [Conditions under which this rule must NOT fire, even if trigger appears to match]

---

## 2. Required Context

| Context Layer | Required Items | Freshness Requirement |
|---------------|----------------|-----------------------|
| Core Context | Vision, Principles, Constitution, Claude.md | Always current |
| Persona Context | [Persona document(s)] | Always current |
| Domain Context | [Knowledge document(s)] | [Freshness threshold, e.g., "within 90 days"] |
| User Context | [Client profile, history] | [Session / Current] |
| External Context | [If applicable] | [Requirement] |

**Context Sufficiency Requirement:**  
Before execution, the following must be confirmed available:
1. [Required element 1]
2. [Required element 2]
3. [Required element 3]

**If context is insufficient:**  
[Ask for clarification / Proceed with stated assumption / Block and fallback]

---

## 3. Clarification Rule

**Ask clarification if:**  
- [Specific condition 1]
- [Specific condition 2]

**Clarification question template:**  
> "[Template question in Thai/English as appropriate]"

**Proceed without clarification if:**  
- [Condition under which assumption is acceptable]

**Assumption when proceeding:**  
> "[Statement of the assumption the Orchestrator will make and communicate to the user]"

---

## 4. Component Selection

**Primary Persona:** [Persona Name + authorized scope reference]  
**Supporting Persona(s):** [If multi-persona; define handoff point]  
**Primary Knowledge:** [Document name(s)]  
**Supporting Knowledge:** [Additional documents if needed]  
**Primary Skill:** [Skill Name]  
**Supporting Skills:** [Additional Skills; define combination pattern: Sequential / Parallel / Conditional]  
**Workflow:** [Workflow Name or "None"]  

**Workflow Trigger Conditions:**  
[If a Workflow is selected, list the specific trigger conditions from the Workflow's W3 section that must be met]

---

## 5. Execution Mode

**Mode:** [1 Direct / 2 Persona-Led / 3 Skill / 4 Workflow / 5 Multi-Persona / 6 Human-in-Loop / 7 Escalation]

**Human Gate Required:** [Yes / No]  
**Human Gate Trigger:** [Condition that activates the human review gate]  
**Human Gate Owner:** [Who reviews: Financial Advisor / CMO / CEO / etc.]

---

## 6. Output Review Requirements

**Review Level:** [Standard / Full / Enhanced]  
**Critical Check Items:**  
- [Specific OV check code]: [Why this check is especially important for this routing rule]
- [Specific OV check code]: [Why this check is especially important for this routing rule]

**Required Response Elements:**  
- [ ] [Element 1 that must be present in the output]
- [ ] [Element 2 that must be present]
- [ ] CTA: [Required CTA or "Not required"]
- [ ] Caveats: [Required disclaimers]

---

## 7. Fallback Path

| Failure Condition | Fallback Action |
|-------------------|-----------------|
| Persona unavailable | [Fallback rule reference, e.g., F1 — General Persona] |
| Skill unavailable | [Fallback rule reference, e.g., FB-2] |
| Knowledge stale | [Stale handling action] |
| Risk escalates during execution | [Escalation action] |
| Output review fails | [Revision or block action] |

---

## 8. Example

**Sample User Input:**  
> "[Representative example of a request that would trigger this rule]"

**Routing Output:**
- Intent: [Code + Name]
- Domain: [Code + Name]
- Risk: [Level]
- Persona: [Name]
- Knowledge: [Documents]
- Skill: [Name]
- Workflow: [Name or None]
- Mode: [Number + Name]
- Review: [Level]

**Sample Response Opening:**  
> "[First 1–2 sentences of what the response should sound like, in the active Persona's voice]"

---

## 9. Version History

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 1.0 | [YYYY-MM-DD] | [Author] | Initial routing rule |
```

---

## Appendix A — Orchestrator Quick Reference Card

### States at a Glance
`S01 Receive → S02 Normalize → S03 Intent → S04 Domain → S05 Risk → S06 Context → S07 Clarify? → S08 Persona → S09 Knowledge → S10 Skill → S11 Workflow → S12 Execute → S13 Review → S14 Safety → S15 Format → S16 Return → S17 Log`

### Risk Quick Rules
- **Low:** General info, educational, no client data needed — proceed with assumptions
- **Medium:** Client context preferred; caveats required — ask if context missing
- **High:** Client context required; expert Persona required; human gate recommended — do not proceed without complete context
- **Critical:** Block execution; escalate immediately; return transparent explanation

### Mode Quick Rules
- **Mode 1:** General info, low risk, no specialized component
- **Mode 2:** Expert judgment needed, advisory, Persona-led
- **Mode 3:** Specific capability, bounded task, Skill-driven
- **Mode 4:** Multi-step, multi-Persona, Workflow-driven
- **Mode 5:** Multi-domain, no single Persona covers all
- **Mode 6:** Add to Mode 2/3/4/5 when human approval required before delivery
- **Mode 7:** Block; escalate; do not execute

### Output Review Quick Rules
- Every response reviewed against OV-1 to OV-8
- Critical failures: OV-2a (harm), OV-2b (ethics), OV-7 (safety) → Block immediately
- Factual failures: OV-5a, OV-5b → Revision required
- Tone/format failures: OV-6 → Inline correction acceptable

---

## Appendix B — Integration with Other Foundation Documents

| This Section | References | Key Principle Applied |
|--------------|------------|-----------------------|
| Section 2 (Responsibilities) | `04_AI_Constitution.md` Section 4 | Component Responsibilities Matrix |
| Section 4 (State Machine) | `04_AI_Constitution.md` Section 5 | Information Flow Architecture |
| Section 5 (Intent) | `02_AI_Decision_Framework.md` Stages 1–2 | Understand → True Goal |
| Section 7 (Risk) | `01_AI_Principles.md` Principle 14 | Decision Hierarchy — Priority 1 governs |
| Section 8 (Context) | `03_AI_Context_Framework.md` Steps 1–5 | Minimum Context + Sufficiency Test |
| Section 9 (Persona) | `05_AI_Persona_Template.md` Activation Rules | Authorized Scope Boundary |
| Section 10 (Skill) | `07_AI_Skill_Standard.md` S8 (Preconditions) | Preconditions verified before invocation |
| Section 11 (Workflow) | `08_AI_Workflow_Standard.md` W3 (Trigger) | Trigger condition matching |
| Section 14 (Review) | `04_AI_Constitution.md` C1–C7 | Constitutional Compliance Requirements |
| Section 15 (Fallback) | `01_AI_Principles.md` Principle 3 | Truth — acknowledge gaps, never fabricate |
| Section 17 (Scenarios) | All Foundation Documents | Integrated application |
| Section 19 (Implementation) | `09_AI_Architecture_Audit.md` | Auditable by architecture audit standard |

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | `10_AI_Orchestrator_Spec.md` |
| **Version** | 1.0 |
| **Status** | Active |
| **Document Type** | Architectural Specification |
| **Layer** | Foundation |
| **Created** | 2026-06-25 |
| **Review Cycle** | Every 6 months, or when a new Persona/Skill/Workflow layer is added |
| **Owner** | Chief Orchestration Architect |
| **Depends On** | All Foundation Documents (01–09) |
| **Referenced By** | All Personas, Skills, Workflows, and Runtime implementations |
| **Next Review** | 2026-12-25 |

---

## Version History

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 1.0 | 2026-06-25 | Chief Orchestration Architect | Initial specification — complete 20-section Orchestrator design covering state machine, intent/domain/risk classification, context loading, component selection, execution modes, output review, fallback handling, chatbot integration, 8 worked scenarios, decision tables, and reusable routing rule template |

---

*End of 10_AI_Orchestrator_Spec.md*
