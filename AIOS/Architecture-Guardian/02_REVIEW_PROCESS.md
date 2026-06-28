# 02 — Architecture Review Process

**Document ID**: AIOS-AGS-02  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `00_GUARDIAN_CHARTER.md` (authority), `01_ARCHITECTURE_GATES.md` (gates), `03_DECISION_MATRIX.md` (decisions)

---

## Purpose

Define the complete lifecycle of an architecture review — from proposal submission through final merge authorization. Every architectural change to AIOS must follow this process.

---

## When a Review Is Required

An Architecture Guardian review is required for:

| Change Type | Review Required |
|---|---|
| New capability creation | Full review (all 6 gates) |
| New intelligence domain | Full review + HPO approval |
| New ACP package | Full review |
| New knowledge domain | Full review |
| New runtime module | Full review |
| Modification of existing capability scope | Abbreviated review (Gates 1, 3, 4) |
| Deprecation of an existing capability | Abbreviated review (Gates 1, 3) + ADR |
| Layer migration of an existing component | Full review (focus: Gates 3, 4) |
| New application (under Applications/) | Abbreviated review (Gates 1, 2, 4) |
| Foundation document change | Full review + HPO sign-off mandatory |
| SSI ownership transfer | Full review (focus: Gate 3) |

A review is NOT required for:
- Typo or formatting fixes in documentation
- Adding test cases without changing behavior
- Updating metric values without changing metric definitions
- Knowledge content updates (these go through Learning Change Proposal process)
- ACP Decision_Rules content updates (Learning Change Proposal process)

---

## Full Review Lifecycle

```
Stage 1 — PROPOSAL
  Implementor submits Proposal Form (see Section 3)
  Describes change, business value, proposed layer, proposed owner

Stage 2 — INTAKE
  Architecture Guardian receives proposal
  Classifies: Full Review / Abbreviated Review / No Review Required
  Assigns review priority: P0 (urgent) / P1 (standard) / P2 (low)

Stage 3 — GATE REVIEW (Gates 1–6)
  Guardian runs all applicable gates in sequence
  Each gate: Pass / Conditional Pass / Fail
  First failure stops the review at that gate

Stage 4 — GUARDIAN DECISION
  Apply Decision Matrix (03_DECISION_MATRIX.md)
  Output: Approve / Approve with Conditions / Revise / Reject / Escalate

Stage 5 — IMPLEMENTATION
  Implementor executes approved architecture
  Must follow: approved layer, approved owner, approved design
  Must not deviate without re-opening review

Stage 6 — INDEPENDENT REVIEW
  After implementation, a second reviewer verifies:
    - Implementation matches approved architecture
    - No undisclosed deviations introduced
    - All regression tests pass (for code changes)

Stage 7 — GUARDIAN APPROVAL
  Guardian reviews independent reviewer's confirmation
  Confirms: architecture matches approval
  Issues: Architecture Clearance (final authorization to merge)

Stage 8 — MERGE
  Implementation is merged
  Any architecture debt is registered (10_ARCHITECTURE_DEBT_REGISTER.md)
  Review record is archived
```

---

## Proposal Form

Every proposal must include the following information. Incomplete proposals are returned without review.

```markdown
## Architecture Change Proposal

**Proposal ID**: ACP-YYYY-NNN  
**Date**: YYYY-MM-DD  
**Proposer**: [Role — e.g., Lead Runtime Engineer, Chief AI Architect, Claude]  
**Priority**: P0 / P1 / P2  

### 1. What is being changed or created?
[One paragraph description. Be specific.]

### 2. Why is this change needed?
[Business or technical justification. Reference the AIOS Vision.]

### 3. What AIOS capability or component does this replace or extend?
[Search evidence — what was found, what was ruled out, why new creation is required]

### 4. Proposed architectural layer
[Which of the 9 Constitution layers, or AGS extended layers]

### 5. Proposed owner
[Which intelligence domain or architectural layer owns this]

### 6. Proposed consumers
[Which other components will consume this]

### 7. Expected technical debt, if any
[Be explicit. "None" is acceptable if true.]

### 8. Expected architecture debt, if any
[Be explicit.]

### 9. Does this work across all AIOS domains?
[Insurance, Investment, Tax, Healthcare, Hotel, Content, Future]
[If domain-specific: which domain, and why is it not generalizable?]

### 10. References
[AIOS documents this proposal builds on, modifies, or must align with]
```

---

## Review SLAs

| Priority | Description | Guardian Response | Decision |
|---|---|---|---|
| P0 | P0 production issue; safety/trust/compliance | Within 4 hours | Within 8 hours |
| P1 | Standard new capability or significant change | Within 2 business days | Within 5 business days |
| P2 | Minor change, enhancement, or documentation | Within 5 business days | Within 10 business days |

---

## Gate Review Evidence Standard

For each gate, the Implementor provides evidence. The Guardian evaluates evidence against the gate standard:

| Evidence Level | Definition |
|---|---|
| **Strong** | Specific, referenced, verifiable claim with document links |
| **Adequate** | Claim is plausible and consistent with existing AIOS architecture |
| **Weak** | General statement without specific evidence |
| **Missing** | No evidence provided |

| Gate | Minimum Evidence Level |
|---|---|
| G1 | Strong |
| G2 | Strong (search log required) |
| G3 | Strong (owner named explicitly) |
| G4 | Strong (layer justification required) |
| G5 | Adequate |
| G6 | Adequate (score required from 07_FUTURE_IMPACT.md) |

---

## Independent Review

The Independent Review is performed by a reviewer who was NOT involved in the implementation. The independent reviewer confirms:

**For documentation-only changes:**
- Does the document align with the approved architecture decision?
- Is terminology consistent with AIOS canonical vocabulary?
- Are all cross-references accurate?
- Does the document follow the AIOS document standard (Claude.md)?

**For code changes:**
- Does the implementation match the approved architecture?
- Does the implementation introduce any undisclosed patterns, dependencies, or behaviors?
- Do all existing tests pass?
- Are new tests present for the new behavior?
- Is the implementation contained within the approved layer boundary?

**For capability additions:**
- Is the capability consumed only through the approved interface?
- Does the owner have exclusive write access?
- Are consumers read-only?

### Who May Serve as Independent Reviewer

- Chief AI Architect (for implementation changes)
- Architecture Guardian (for documentation changes)
- Human Product Owner (for any change, at their discretion)

Note: The proposer may NOT serve as the independent reviewer for their own proposal.

---

## Architecture Clearance

Upon successful completion of the independent review, the Architecture Guardian issues Architecture Clearance. This is the final authorization to merge.

**Architecture Clearance format:**

```
ARCHITECTURE CLEARANCE — AIOS Architecture Guardian

Proposal ID: ACP-YYYY-NNN
Date Cleared: YYYY-MM-DD
Review Outcome: [Approved / Approved with Conditions]
Gate Results: G1 PASS | G2 PASS | G3 PASS | G4 PASS | G5 PASS | G6 PASS
Conditions (if any): [List conditions, or "None"]
Architecture Debt Registered: [Debt ID(s), or "None"]
Cleared By: Architecture Guardian
```

No implementation may be merged without an Architecture Clearance document.

---

## Review Failure and Restart

If a proposal fails a gate:

1. Guardian issues failure notice with specific gate, specific reason, and specific evidence required to pass
2. Implementor addresses the failure
3. Implementor resubmits the specific failed gate evidence — does not restart from Gate 1
4. Guardian re-evaluates the failed gate only
5. If the gate now passes: proceed to next gate
6. If the gate fails again: Guardian may require architectural redesign before re-submission

A proposal may be resubmitted a maximum of 3 times per gate failure. After 3 failures on the same gate, the proposal requires Human Product Owner review before any further submission.

---

## Emergency Protocol

For P0 safety, trust, or medical compliance issues:

1. Human Product Owner authorizes implementation immediately (verbal or written)
2. Implementation proceeds without Architecture Clearance
3. Implementation is reviewed within 72 hours (all applicable gates)
4. Any architectural debt created is immediately registered
5. Retroactive Architecture Clearance is issued (or deficit documented if not clearable)

Emergency protocol is logged with timestamp, HPO authorization, and debt status.
