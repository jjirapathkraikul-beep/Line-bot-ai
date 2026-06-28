# 01 — Single Source of Intelligence (SSI)

**Document ID**: AIOS-INT-01  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect  
**Approved From**: Phase 11.0A Architecture & Capability Audit

---

## 1. The SSI Principle

**Single Source of Intelligence (SSI):** Every intelligence capability in AIOS has exactly one owner. No capability may be owned by more than one intelligence domain. Any module may *consume* a capability, but only one intelligence domain may *own*, *govern*, and *evolve* it.

This principle exists because:
- Duplicate ownership creates divergent behavior (two intent classifiers, two trust engines, two lead scorers were found in the Phase 11.0A audit)
- When a capability has two owners, bugs never have a clear fix path
- When a capability has two owners, governance (Change Proposals, Pattern Library entries) is applied twice or not at all
- Duplication grows — each new capability risks spawning a V1 equivalent

SSI is the antidote to capability sprawl.

---

## 2. Owner vs Consumer

| Role | Definition | Rights | Example |
|---|---|---|---|
| **Owner** | The intelligence domain responsible for this capability's correctness, evolution, and governance | May modify, deprecate, extend, or propose changes | Customer Intelligence owns trust memory |
| **Consumer** | Any intelligence domain that reads or depends on the output of this capability | May read output; must not modify the capability directly | Commercial Intelligence consumes trust state to gate lead capture |

**Rule:** A consumer that needs a capability to behave differently must submit a request to the owner, not fork the capability.

---

## 3. Anti-Duplication Rules

The following are architecture violations. They require correction before any feature built on them is committed.

| Rule | Violation | Consequence |
|---|---|---|
| **AD-01** | Two intelligence domains implement the same capability | Architecture smell; one must be deprecated and deleted |
| **AD-02** | A capability is defined in an Intelligence document AND hardcoded in runtime TypeScript | Runtime code must read from the canonical source |
| **AD-03** | A runtime module contains business logic that belongs to an intelligence domain | Business logic must move to ACP Decision_Rules or an Intelligence-owned document |
| **AD-04** | A domain knowledge document embeds intelligence rules (e.g., a product doc contains lead capture logic) | Rule must move to the appropriate Intelligence document |
| **AD-05** | An application module (Applications/) implements intelligence that belongs to the platform | Application logic must become a platform capability owned by an Intelligence domain |

---

## 4. Architecture Gate — Five Checks Before Creating a Capability

Before any new intelligence capability is created, the following five checks must be completed in order. If any check fails, the work stops at that check.

### Gate 1 — Inventory
*Does this capability already exist?*

Search: `AIOS/Intelligence/`, `AIOS/CapabilityPackages/`, `AIOS/Execution/`, `AIOS/ContextEngine/`, `runtime-gen1/`, `lib/`.

If found: go to Gate 2. If not found: skip to Gate 5.

### Gate 2 — Overlap
*Does an existing capability partially address this need?*

Compare the proposed capability against existing ones. If ≥50% overlaps with an existing capability, it is a partial duplicate.

If partial: go to Gate 3. If no overlap: go to Gate 5.

### Gate 3 — Owner
*Who currently owns the overlapping capability?*

Identify the owner intelligence domain. Contact that owner before proceeding.

If owner agrees to extend: go to Gate 4. If owner disagrees: escalate to Human Product Owner.

### Gate 4 — Placement
*Can this capability be added to the existing owner's scope?*

Verify the proposed extension does not violate:
- Intelligence boundary (`09_INTELLIGENCE_BOUNDARY_MAP.md`)
- Domain independence principle
- AI Constitution constraints

If placement is valid: extend the existing capability. Work complete — no new capability created.

### Gate 5 — Extension Before Creation
*If no existing capability covers this need, can the scope of an existing intelligence be extended?*

Before creating a new intelligence domain or a standalone capability, confirm:
- The new capability cannot reasonably be placed under any existing intelligence domain
- The new capability requires distinct ownership, distinct inputs, and distinct outputs

If extension is possible: extend. Only if extension is impossible: create.

---

## 5. SSI Ownership Table

The following defines the authoritative owner for every major capability in AIOS. This table is the governance record. Any change requires Human Product Owner approval and an ADR.

---

### SSI-01 — Conversation Memory

| Field | Value |
|---|---|
| **Capability** | Storing, retrieving, and managing all facts known about the current conversation — working memory, session state, cross-turn history |
| **Owner** | Customer Intelligence |
| **Implementation** | `runtime-gen1/memory/memoryResolver.ts`, `runtime-gen1/observability/conversationLogger.ts`, `AIOS/ContextEngine/07_MEMORY_RESOLUTION.md` |
| **Consumers** | Conversation Intelligence (strategy selection), Commercial Intelligence (lead state), Advisor Intelligence (handoff context), Decision Engine |
| **Anti-duplication rule** | No ACP document, runtime module, or application may maintain its own memory store for customer facts. All facts flow through Customer Intelligence |

---

### SSI-02 — Intent Classification

| Field | Value |
|---|---|
| **Capability** | Classifying customer messages into structured intents with confidence scores |
| **Owner** | Conversation Intelligence |
| **Implementation** | `runtime-gen1/capability/intentDetector.ts` |
| **Consumers** | AEE Capability Loader, Decision Engine, Strategy Engine |
| **Anti-duplication rule** | `lib/intentClassifier.ts` (V1) must be deprecated. No second intent system may exist in AIOS at any time |

---

### SSI-03 — Product Knowledge

| Field | Value |
|---|---|
| **Capability** | Maintaining accurate, current, and complete knowledge about products, underwriting, tax, claims, and mandatory disclosure requirements |
| **Owner** | Product Intelligence |
| **Implementation** | `AIOS/Domains/Insurance/Products/`, `AIOS/Domains/Insurance/Knowledge/`, `AIOS/AIRR/Knowledge_Path_Registry.md`, `runtime-gen1/knowledge/knowledgeResolver.ts` |
| **Consumers** | ACE Knowledge Resolution, ACP-02 through ACP-07, all ACP Knowledge_Maps |
| **Anti-duplication rule** | Product knowledge may not be embedded in prompt templates, decision rules, or capability packages. It must live in Product Intelligence's knowledge base and be loaded via the Knowledge Path Registry |

---

### SSI-04 — Lead Scoring

| Field | Value |
|---|---|
| **Capability** | Computing lead quality score from captured customer fields and signals |
| **Owner** | Commercial Intelligence |
| **Implementation** | `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` (authoritative definition), `runtime-gen1/memory/memoryResolver.ts` (current runtime implementation) |
| **Consumers** | Customer Intelligence (stores score), Advisor Intelligence (receives score on handoff), Business Intelligence (aggregates) |
| **Anti-duplication rule** | `lib/scorer.ts` (V1) must be deprecated. Exactly one lead scoring algorithm may exist. Commercial Intelligence owns the definition; runtime implements it |

---

### SSI-05 — Decision Rules

| Field | Value |
|---|---|
| **Capability** | Defining which action the AI takes given a specific combination of intent, memory state, capability, and restrictions |
| **Owner** | Capability Packages (ACP-XX/Decision_Rules.md) — the Decision Engine is the rule interpreter |
| **Implementation** | `AIOS/CapabilityPackages/*/Decision_Rules.md` (authoritative), `runtime-gen1/decision/decisionRules.ts` (current hardcoded implementation — target for migration) |
| **Consumers** | Decision Engine, Strategy Engine |
| **Anti-duplication rule** | Business decision rules must not be hardcoded in runtime TypeScript. The Decision Engine must be a rule interpreter that reads from ACP Decision_Rules documents. Any hardcoded rule in `decisionRules.ts` is a P1 migration item |

---

### SSI-06 — Trust Logic

| Field | Value |
|---|---|
| **Capability** | Detecting trust concerns, managing trust state, governing lead capture gates when trust is active |
| **Owner** | Customer Intelligence (trust dimension of the customer profile) |
| **Specification** | `AIOS/Domains/Insurance/Trust/Trust_Engine.md`, `AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/` |
| **Implementation** | `runtime-gen1/memory/memoryResolver.ts` (trustMemory), `runtime-gen1/capability/intentDetector.ts` (isTrustSignal) |
| **Consumers** | Conversation Intelligence (strategy selection — BUILD_TRUST_FIRST), Decision Engine (lead capture gate), Commercial Intelligence (lead capture suspension) |
| **Anti-duplication rule** | `lib/trustEngine.ts` (V1) must be deprecated. ACP-08 TRUST_ADVISOR is the specification. Runtime trust logic is owned by Customer Intelligence |

---

### SSI-07 — Analytics Events

| Field | Value |
|---|---|
| **Capability** | Defining the analytics event taxonomy and emitting structured events at each pipeline step |
| **Owner** | Business Intelligence |
| **Specification** | `AIOS/Execution/08_ANALYTICS_ENGINE.md` (event taxonomy EVT-P through EVT-T) |
| **Implementation** | Currently: `runtime-gen1/observability/conversationLogger.ts` (one post-turn log). Target: per-step event emission per AEE-08 spec |
| **Consumers** | Learning Intelligence (quality events), Commercial Intelligence (lead events), Advisor Intelligence (handoff events), all platform stakeholders |
| **Anti-duplication rule** | No module may define its own analytics schema or event format. All events conform to the AEE-08 taxonomy and flow to Business Intelligence |

---

### SSI-08 — Learning Governance

| Field | Value |
|---|---|
| **Capability** | Governing the process by which real conversation quality issues become approved AIOS improvements |
| **Owner** | Learning Intelligence |
| **Specification** | `AIOS/Learning/` (all 10 documents) |
| **Implementation** | `runtime-gen1/observability/auditQueue.ts` (data collection), `runtime-gen1/observability/issueDatabase.ts` (issue registry) |
| **Consumers** | Human Product Owner (approvals), all intelligence domains (consume approved patterns) |
| **Anti-duplication rule** | No intelligence domain may modify AIOS knowledge, decision rules, or ACP content without a Change Proposal processed through Learning Intelligence. No self-approvals. |

---

### SSI-09 — Session Hydration

| Field | Value |
|---|---|
| **Capability** | Reading and writing the customer's session state — what is known from the current session in KV |
| **Owner** | Customer Intelligence |
| **Current state** | `RuntimeInput.session: unknown` — partially owned by V1 `hydrateAll`. This is a known architecture smell (S-08 in audit) |
| **Target state** | `CustomerSession` type owned by Gen1 Customer Intelligence; V1 `hydrateAll` deprecated |
| **Consumers** | All runtime pipeline steps (read); Memory Resolver (read/write) |
| **Anti-duplication rule** | Session hydration must not be split between V1 and Gen1. One session owner; one hydration call |

---

### SSI-10 — Human Handoff Context

| Field | Value |
|---|---|
| **Capability** | Building the context package delivered to a human advisor when a conversation is escalated |
| **Owner** | Advisor Intelligence |
| **Specification** | `AIOS/CapabilityPackages/ACP-17_HUMAN_HANDOFF/`, `AIOS/Domains/Insurance/Human/` |
| **Implementation** | `runtime-gen1/` handoff decision rules, conversation strategy HANDOFF_WITH_CONTEXT |
| **Consumers** | Human advisor, admin notification system |
| **Anti-duplication rule** | Handoff context must not be assembled ad hoc in application code. Advisor Intelligence owns the schema and enrichment logic |

---

## 6. SSI Violation Severity

| Violation Type | Severity | Action Required |
|---|---|---|
| Two active implementations of same capability | CRITICAL | Immediate deprecation of one; no new features until resolved |
| Business rule hardcoded in runtime code | HIGH | P1 migration to ACP Decision_Rules |
| Application module duplicating platform intelligence | HIGH | Move to platform; application becomes consumer |
| V1 module not yet deprecated while Gen1 equivalent exists | MEDIUM | Schedule deprecation in next release |
| Knowledge embedded in prompt template | MEDIUM | Move to knowledge document; prompt references it |
| Analytics event without owner intelligence | LOW | Assign to Business Intelligence |
