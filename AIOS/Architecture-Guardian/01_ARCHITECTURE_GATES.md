# 01 — Architecture Gates

**Document ID**: AIOS-AGS-01  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Constitutional Basis**: `AIOS/04_AI_Constitution.md` Section 3 — Layer Governance  
**Reference**: `AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md` (SSI 5-gate model, extended here)

---

## Purpose

Define the six mandatory review gates that every proposed AIOS architectural change must pass before implementation is authorized.

**These gates are not optional.** They are not bureaucracy. They are the minimum evidence standard for a change to be considered architecturally safe.

---

## Gate Overview

| Gate | Name | Question | Failure Result |
|---|---|---|---|
| G1 | Vision Alignment | Does this align with AIOS Vision? | Immediate reject |
| G2 | Capability Audit | Does this capability already exist? | Route to existing; stop new creation |
| G3 | SSI Validation | Is ownership correct and singular? | Assign correct owner; stop implementation |
| G4 | Layer Validation | Is this in the correct architectural layer? | Reassign to correct layer |
| G5 | Business Value | Does value justify complexity? | Request revision |
| G6 | Future Impact | What is the 5-year architectural impact? | Impact score must be documented |

Gates are sequential. A failure at any gate stops the review at that gate. The implementor must resolve the gate failure before proceeding.

---

## Gate 1 — Vision Alignment

### Question
**Does this proposed change align with the AIOS Vision as defined in `01_AI_Vision.md`?**

### What to Evaluate

**1A — Direct Vision Alignment**  
Does the proposed change serve the AIOS mission? Does it extend the platform's capability to serve its intended purpose?

**1B — Scope Containment**  
Does the proposed change stay within the declared scope of AIOS? Changes that introduce capabilities beyond the AIOS vision scope require explicit Human Product Owner approval before this gate can pass.

**1C — Principles Compliance**  
Does the proposed change comply with all 15 AI Principles (`01_AI_Principles.md`)? A change that violates a Principle fails Gate 1 regardless of any other consideration.

**1D — Constitutional Compatibility**  
Does the proposed change respect the 9-layer architecture as defined in the Constitution? A change that requires redefining a layer boundary or creating a new layer fails Gate 1 and requires Constitutional review.

### Evidence Required

- Explicit reference to which AIOS Vision statement(s) this change serves
- Statement of which AI Principles apply and confirmation of compliance
- Statement of scope: is this within AIOS declared scope, or does it require scope extension?

### Pass Condition

All of 1A, 1B, 1C, 1D are confirmed.

### Failure Actions

| Failure Type | Action |
|---|---|
| Vision misalignment | Reject. Request HPO to confirm whether product direction has changed. |
| Scope extension | Pause. Escalate to HPO for explicit scope approval before proceeding. |
| Principles violation | Reject. The change must be redesigned to comply. |
| Constitutional incompatibility | Reject. Constitutional review required before this change can be reconsidered. |

---

## Gate 2 — Capability Audit

### Question
**Does this capability already exist somewhere in AIOS? Can an existing capability be extended to meet this need?**

### Philosophy

> **Reuse Before Create. Extend Before Build. Merge Before Duplicate.**

The Phase 11.0A Architecture Audit found ~35% duplication between V1 and Gen1 caused by creating capabilities without first auditing what already exists. Gate 2 prevents recurrence.

### What to Search

The implementor must demonstrate they searched ALL of the following before claiming a capability does not exist:

| Location | What to Search |
|---|---|
| `AIOS/Intelligence/` | All 7 intelligence domains + taxonomy |
| `AIOS/CapabilityPackages/` | All 20 ACP packages (ACP-01 to ACP-20) |
| `AIOS/Execution/` | AEE documents |
| `AIOS/ContextEngine/` | ACE documents |
| `AIOS/Learning/` | All 10 Learning documents |
| `runtime-gen1/` | All pipeline modules |
| `lib/` | V1 library modules |
| `Applications/` | Application-specific logic |

### Reuse Decision Tree

```
Does the capability exist anywhere in AIOS?
  │
  ├── YES, exactly → Use it. Do not create. Gate 2 PASS.
  │
  ├── YES, partially (>50% overlap) → Extend existing. Define extension scope.
  │   Guardian reviews extension proposal. Gate 2 CONDITIONAL PASS.
  │
  ├── YES, in wrong layer → Move it. Do not duplicate. Gate 2 → Gate 4.
  │
  ├── YES, in deprecated state → Evaluate revival vs new creation.
  │   Document rationale. Gate 2 CONDITIONAL PASS.
  │
  └── NO → New creation permitted. Document search evidence. Gate 2 PASS.
```

### Evidence Required

- Search log: which directories were searched, what was found
- For "does not exist" finding: explicit evidence of search in all 8 locations above
- For "partially exists" finding: description of the overlap and the extension plan

### Pass Condition

Search evidence provided. Finding confirmed as: does-not-exist, partial-exists-with-extension-plan, or full-exists-with-reuse-plan.

### Failure Actions

| Failure Type | Action |
|---|---|
| No search evidence | Request revision. No approval without evidence of search. |
| Duplicate found, creation still proposed | Reject. Document why reuse was evaluated and rejected (if legitimate technical reason exists). |
| Partial overlap, no extension plan | Request revision. Define the extension plan. |

---

## Gate 3 — SSI Validation

### Question
**Is there exactly one owner for this capability? Is the owner the correct intelligence domain or architectural layer?**

### Reference
`AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md` — SSI Principle and 10 SSI Ownership Tables  
`AIOS/Architecture-Guardian/05_SSI_ENFORCEMENT.md` — SSI enforcement details

### SSI Checks

**3A — Ownership Assignment**  
Every capability must have exactly one declared owner. The owner is:
- An AIOS Intelligence Domain (one of 7), or
- An AIOS Architectural Layer (Foundation, ACE, AEE, ACP, Runtime, Application)

**3B — Owner Uniqueness**  
Verify that no other intelligence domain or layer currently claims or implements this capability. Use the SSI Ownership Tables and the Architecture Debt Register.

**3C — Consumer Boundary**  
Identify all expected consumers of this capability. Verify that no consumer is performing logic that belongs to the owner. Consumer access is read-only.

**3D — Deprecation Plan**  
If this new capability supersedes an existing implementation (e.g., Gen1 replaces V1), the deprecation plan must be specified. No parallel ownership is permitted without an explicit time-boxed migration plan.

### Evidence Required

- Named owner
- Named consumers (all of them)
- SSI conflict check: which existing capabilities were evaluated for overlap
- For supersession: deprecation plan with target release

### Pass Condition

One owner. No duplicate ownership. Consumer boundary defined. Deprecation plan provided if applicable.

### Failure Actions

| Failure Type | Action |
|---|---|
| No owner named | Request revision. No capability without an owner. |
| Multiple owners proposed | Reject. Design must converge to one owner. |
| Consumer performing owner logic | Flag as boundary violation. Consumer logic must be removed. |
| Missing deprecation plan | Request revision. Parallel ownership is architectural debt. |

---

## Gate 4 — Layer Validation

### Question
**Is this component placed in the correct architectural layer as defined in the AIOS Constitution?**

### Reference
`AIOS/04_AI_Constitution.md` Section 2 — Nine Architectural Layers  
`AIOS/Architecture-Guardian/06_LAYER_VALIDATION.md` — Full layer decision tree

### The Nine AIOS Layers (Constitution)

| Layer | Name | What Belongs Here |
|---|---|---|
| 1 | Vision | AI Vision document. Nothing else. |
| 2 | Principles | AI Principles. Nothing else. |
| 3 | Constitution | Constitution, Claude.md, Decision Framework, Context Framework |
| 4 | Process | ACE (AI Context Engine) — 15 documents |
| 5 | Runtime | Gen1 pipeline, AEE execution |
| 6 | Persona | AI Persona documents |
| 7 | Knowledge | Knowledge Base documents, product facts |
| 8 | Skills | ACP packages (ACP-01 to ACP-20) |
| 9 | Workflows | End-to-end workflow orchestration |

Extended layers recognized by AGS (not in Constitution but in practice):

| Layer | Name | What Belongs Here |
|---|---|---|
| L-INT | Intelligence | Intelligence domain documents (7 domains) |
| L-LEARN | Learning | Learning governance documents |
| L-APP | Application | Application-specific code (Line_Chatbot_AI, etc.) |
| L-INFRA | Infrastructure | Vercel KV, deployment config, CI/CD |

### Layer Check

The implementor must demonstrate that the proposed component's **function** matches the **layer's defined responsibility**. If it does not, the component must be redesigned or relocated.

See `06_LAYER_VALIDATION.md` for the full decision tree.

### Evidence Required

- Proposed layer
- Justification: why this layer is correct for this component's function
- Evidence that adjacent layers were considered and ruled out

### Pass Condition

Component function matches layer responsibility. No layer boundary violations in the proposed design.

### Failure Actions

| Failure Type | Action |
|---|---|
| Wrong layer identified | Reject. Redesign for correct layer. |
| Layer boundary violation (crosses layers) | Reject. Each concern must live in exactly one layer. |
| No layer specified | Request revision. Layer assignment is mandatory. |

---

## Gate 5 — Business Value

### Question
**Does the business value of this change justify the architectural complexity it introduces?**

### Philosophy

Every capability added to AIOS increases its maintenance surface. The question is never "is this useful?" — it is "is this useful enough to justify its cost to the system?"

### The Value-Complexity Equation

```
Value Score (V)   — benefit to AIOS mission
Complexity Cost (C) — maintenance surface added
Risk Score (R)    — probability of creating future debt

Approval threshold: V / (C × R) ≥ 1.0
```

*Qualitative version (used in practice):*

**Approve** if: value is clear, complexity is minimal, risk is low  
**Approve with Conditions** if: value is clear, complexity is moderate, conditions reduce risk  
**Request Revision** if: value is unclear, or complexity is high relative to value  
**Reject** if: value does not exist, or complexity creates negative expected return

### Business Value Questions

| Question | Strong Answer | Weak Answer |
|---|---|---|
| What customer problem does this solve? | Specific, observed, measurable | Hypothetical, inferred, assumed |
| What happens if we don't build this? | System has a clear gap | System works without it |
| How many customers benefit? | All customers, or a large known segment | A hypothetical future case |
| Does it need to be here, or could a simpler solution work? | This is the minimal viable approach | Simpler solutions were not evaluated |
| Is this building for today or for a hypothetical future? | Today's proven need | "We might need this someday" |

### Evidence Required

- Business value statement (one paragraph)
- What is the cost of NOT building this?
- Complexity score (low / medium / high)
- Confirmation that simpler alternatives were evaluated

### Pass Condition

Business value is clear, specific, and proportionate to the complexity introduced.

### Failure Actions

| Failure Type | Action |
|---|---|
| Value is hypothetical | Request revision. Prove the need exists now. |
| Complexity is high relative to value | Request revision. Redesign for minimum complexity. |
| Simpler solution exists | Request revision. Build the simpler solution first. |
| Value is not articulated | Request revision. No approval without clear value. |

---

## Gate 6 — Future Impact

### Question
**What is the 5-year architectural impact of this change? Does it increase or decrease AIOS's ability to scale, maintain, and evolve?**

### Reference
`AIOS/Architecture-Guardian/07_FUTURE_IMPACT.md` — Full scoring framework

### Five-Year Impact Categories

| Category | Question |
|---|---|
| Maintainability | Will this be harder or easier to maintain in 2 years? |
| Scalability | Does this scale as AIOS grows to multiple domains? |
| Testability | Can this be reliably tested? |
| Reusability | Can this be reused across domains without modification? |
| Governance | Does this add governance complexity that compounds? |
| Migration Cost | What is the cost to change or remove this later? |
| Technical Debt | Does this create known technical debt? |
| Architecture Debt | Does this create known architecture debt? |

### Minimum Gate 6 Requirements

Every proposal must answer:
1. What is the technical debt incurred, if any?
2. What is the architecture debt incurred, if any?
3. What would it cost to remove this component in 2 years?
4. Does this scale to 10 domains?

### Evidence Required

- Future Impact Score from `07_FUTURE_IMPACT.md`
- Explicit statement of any technical or architecture debt incurred
- Confirmation that the change scales beyond the current domain

### Pass Condition

Future Impact Score ≥ 60 (on 100-point scale), OR explicit HPO acknowledgment of score below 60 with debt registered.

### Failure Actions

| Failure Type | Action |
|---|---|
| Score < 40, no exception | Reject. Fundamental redesign required. |
| Score 40–60, no exception | Request revision. Improve the design or obtain HPO acknowledgment. |
| Score ≥ 60, debt present | Approve with condition: debt registered in Architecture Debt Register. |
| No score provided | Request revision. Score is mandatory. |

---

## Gate Summary

| Gate | Name | Failure Type | Action on Failure |
|---|---|---|---|
| G1 | Vision Alignment | Hard gate | Immediate reject |
| G2 | Capability Audit | Redirect gate | Route to existing capability |
| G3 | SSI Validation | Assignment gate | Assign correct owner |
| G4 | Layer Validation | Placement gate | Redesign for correct layer |
| G5 | Business Value | Quality gate | Request revision |
| G6 | Future Impact | Documentation gate | Score + debt register required |

---

## Gate Bypass Rules

There is only one condition under which gates may be bypassed:

**P0 Security or Safety Hotfix** — A production issue that constitutes an active safety, trust, or medical compliance failure may proceed to implementation with a single Human Product Owner authorization. The hotfix must be reviewed retroactively through all 6 gates within 72 hours of deployment, and any architectural debt created must be registered immediately.

No other bypass is permitted.
