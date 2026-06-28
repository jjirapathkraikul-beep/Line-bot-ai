# 06 — Layer Validation

**Document ID**: AIOS-AGS-06  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `AIOS/04_AI_Constitution.md` Section 2 — Nine Architectural Layers  
**Note**: This document provides the decision tree and validation rules. Layer definitions are authoritative in the Constitution.

---

## Purpose

Define how the Architecture Guardian validates that a proposed AIOS component is placed in the correct architectural layer.

Layer misplacement is the most common source of architecture debt in AI operating systems. A business rule in the runtime, a runtime detail in a knowledge document, a knowledge fact in a persona — these violations spread through the system and become invisible until they cause failures that are expensive to trace.

---

## 1. Layer Reference

The Architecture Guardian recognizes the following layers. The first 9 are defined in the Constitution. The extended layers are recognized by AGS for practical governance.

### Constitution Layers

| Layer | ID | Name | Primary Contents |
|---|---|---|---|
| 1 | L1 | Vision | `01_AI_Vision.md` only |
| 2 | L2 | Principles | `01_AI_Principles.md` only |
| 3 | L3 | Constitution | `04_AI_Constitution.md`, `Claude.md`, `02_AI_Decision_Framework.md`, `03_AI_Context_Framework.md` |
| 4 | L4 | Process | ACE (Context Engine) — context assembly, schema validation, deterministic pre-processing |
| 5 | L5 | Runtime | Gen1 pipeline, AEE (Execution Engine) — pipeline execution, prompt construction, LLM call, validation |
| 6 | L6 | Persona | AI Persona documents — role, tone, scope, identity |
| 7 | L7 | Knowledge | Knowledge Base documents — domain facts, product information, regulatory rules |
| 8 | L8 | Skills | ACP packages — conversation capability packages, decision rules, response patterns |
| 9 | L9 | Workflows | End-to-end workflow orchestration — multi-step processes |

### AGS Extended Layers

| Layer | ID | Name | Primary Contents |
|---|---|---|---|
| Intelligence | L-INT | Intelligence | Intelligence domain documents (7 domains) — governance, ownership, taxonomy |
| Learning | L-LEARN | Learning | Learning system documents — audits, patterns, change proposals, metrics |
| Application | L-APP | Application | Application-specific code (LINE chatbot, web interfaces) |
| Infrastructure | L-INFRA | Infrastructure | Vercel KV, deployment config, CI/CD, environment |
| Human Process | L-HP | Human Process | Human operating documents — operating model, review templates, manifesto |

---

## 2. Layer Decision Tree

Use this decision tree to determine the correct layer for a proposed component.

```
START — What is the nature of this component?

Is it about WHY AIOS exists?
  YES → Layer 1 (Vision). If it's a new vision statement: escalate to HPO.
  NO  → continue

Is it about HOW AI agents in AIOS must behave (non-negotiable rules)?
  YES → Layer 2 (Principles). Changes require HPO approval.
  NO  → continue

Is it about how AIOS components work together as a governed system?
  YES → Layer 3 (Constitution). Changes require HPO approval.
  NO  → continue

Is it about assembling and validating context BEFORE an LLM call?
  YES → Layer 4 (Process / ACE). Goes in ContextEngine/.
  NO  → continue

Is it pipeline execution logic, prompt construction, or LLM interaction?
  YES → Layer 5 (Runtime / AEE). Goes in runtime-gen1/.
  NO  → continue

Is it defining an AI agent's role, tone, or identity?
  YES → Layer 6 (Persona). Goes in Personas/.
  NO  → continue

Is it a domain fact, product specification, regulatory rule, or reference data?
  YES → Layer 7 (Knowledge). Goes in KnowledgeBase/ or Domains/.
  NO  → continue

Is it a discrete conversation capability package (strategy, pattern, decision)?
  YES → Layer 8 (Skills / ACP). Goes in CapabilityPackages/.
  NO  → continue

Is it a multi-step process connecting multiple capabilities?
  YES → Layer 9 (Workflows). Goes in Workflows/ or Operating Model.
  NO  → continue

Is it defining ownership, governance, or boundaries for intelligence capabilities?
  YES → Intelligence Layer (L-INT). Goes in Intelligence/.
  NO  → continue

Is it about quality, improvement, audit, or pattern tracking?
  YES → Learning Layer (L-LEARN). Goes in Learning/.
  NO  → continue

Is it specific to one application (LINE bot, web interface) only?
  YES → Application Layer (L-APP). Goes in Applications/.
  NO  → continue

Is it infrastructure, deployment, environment, or CI/CD?
  YES → Infrastructure Layer (L-INFRA). Goes in project root config.
  NO  → continue

Is it a human operating process (review templates, reporting, governance)?
  YES → Human Process Layer (L-HP). Goes in Beta/ or Architecture-Guardian/.
  NO  → [Cannot determine layer — escalate to Chief AI Architect]
```

---

## 3. Common Layer Violations

### Violation Type 1 — Business Logic in Runtime

**Description**: Decision rules that belong in ACP packages (Layer 8) are hardcoded in the runtime pipeline (Layer 5).

**Example**: `const shouldTriggerHandoff = leadScore >= 60 && knownFields.length >= 5` hardcoded in `executeGen1.ts` instead of in `ACP-17/Decision_Rules.md`.

**Why it's a violation**: The runtime should execute capability decisions, not contain them. When the handoff threshold changes, it requires a code deployment instead of a knowledge update.

**Correct placement**: Decision rule → ACP-17/Decision_Rules.md (Layer 8). Runtime reads the rule and applies it.

---

### Violation Type 2 — Product Facts in Runtime

**Description**: Product specifications, premium ranges, eligibility criteria, or benefit details are hardcoded in runtime code instead of knowledge documents.

**Example**: `const HEALTH_PREMIUM_MIN = 5000` hardcoded in `executeGen1.ts`.

**Why it's a violation**: Product facts change independently of runtime logic. Hardcoding conflates two separate change frequencies.

**Correct placement**: Product fact → `AIOS/Domains/Insurance/Products/` (Layer 7). Runtime reads from knowledge resolver.

---

### Violation Type 3 — Governance in Knowledge

**Description**: A knowledge document contains rules about how AIOS should behave (governance) rather than facts about the domain.

**Example**: A product knowledge document states "When the customer asks about this product, always follow up with a medical question." This is a conversation strategy rule, not a knowledge fact.

**Why it's a violation**: Governance rules belong in ACP packages. Knowledge documents should be factual, static, and domain-centric.

**Correct placement**: Conversation rule → ACP Decision_Rules (Layer 8). Knowledge document → facts only.

---

### Violation Type 4 — Intelligence in Application

**Description**: An application (e.g., `Applications/Line_Chatbot_AI/`) implements intelligence logic that belongs to the platform.

**Example**: The LINE chatbot app contains its own trust detection logic instead of using the platform's trust detection.

**Why it's a violation**: Application intelligence diverges from platform intelligence. Governance breaks down. Two trust systems produce inconsistent results.

**Correct placement**: Trust logic → Gen1 runtime / Customer Intelligence. Application calls the platform API, does not reimplement.

---

### Violation Type 5 — Persona in Knowledge

**Description**: A knowledge document defines how an AI agent should think or respond (persona behavior) instead of what it should know.

**Example**: "When discussing cancer, always respond with empathy and avoid technical jargon" in a medical knowledge document.

**Why it's a violation**: Communication style and response strategy belong in ACP (Layer 8) or Persona (Layer 6), not knowledge.

**Correct placement**: Communication style → ACP Response_Templates. Medical facts → Knowledge document.

---

### Violation Type 6 — Infrastructure in Constitution

**Description**: Technical infrastructure choices (specific database, specific API vendor, specific deployment platform) appear in Foundation documents (Layers 1–3).

**Example**: "AIOS uses Vercel KV for storage" in the Constitution.

**Why it's a violation**: The Constitution must be vendor-independent. Infrastructure choices belong in infrastructure configuration documents.

**Correct placement**: Vendor reference → Infrastructure config. Constitution → vendor-independent architecture principle.

---

## 4. Layer Boundary Rules

| Boundary | Rule |
|---|---|
| L1 → L2 | Vision informs Principles. Principles may not constrain Vision. |
| L2 → L3 | Principles govern Constitution. Constitution may not weaken Principles. |
| L3 → L4 | Constitution defines what Context Engine assembles. CE may not override Constitution rules. |
| L4 → L5 | Context Engine outputs are inputs to Runtime. Runtime may not modify CE outputs. |
| L5 → L8 | Runtime executes ACP decisions. Runtime may not contain ACP decision logic. |
| L7 → L8 | Knowledge is consumed by ACPs. ACPs may not modify knowledge. |
| L8 → L5 | ACP decisions are executed by runtime. ACPs are not runtime code. |
| L-INT → L5 | Intelligence governs what runtime owns/implements. Runtime may not create intelligence it does not own. |
| L-APP → L5 | Applications call runtime. Applications may not contain runtime logic. |

---

## 5. Layer Validation Evidence Required

For Gate 4, the proposer must provide:

1. **Proposed layer**: explicit layer ID (L1–L9, L-INT, L-LEARN, L-APP, L-INFRA, L-HP)
2. **Layer justification**: one paragraph explaining why this layer is correct for this component's function
3. **Adjacent layers considered**: which adjacent layers were evaluated and why they are incorrect
4. **Boundary compliance**: statement that no layer boundary rules in Section 4 are violated

---

## 6. Layer Validation Certificate

```
LAYER VALIDATION — AIOS Architecture Guardian

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
Proposed Layer: [Layer ID and name]
Proposed Location: [File path or folder]
Layer Justification: [Confirmed / Not Confirmed]
Adjacent Layers Evaluated: [List]
Boundary Compliance: [Confirmed / Violations found]
Violation(s): [None / List]
Layer Validation: PASS / FAIL
```
