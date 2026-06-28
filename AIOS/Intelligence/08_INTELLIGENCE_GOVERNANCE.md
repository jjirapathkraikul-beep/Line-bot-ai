# 08 — Intelligence Governance

**Document ID**: AIOS-INT-08  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect + Human Product Owner  
**Constitutional Basis**: `AIOS/04_AI_Constitution.md` (Section 5 — Governance)

---

## Purpose

This document defines how new intelligence capabilities are proposed, reviewed, approved, and deployed within AIOS. All intelligence capability work — from P0 fixes to P3 future features — must comply with this governance process.

Intelligence Governance does not replace the Learning System's Change Proposal process. It governs the *intelligence layer itself* (adding, modifying, or deprecating intelligence capabilities). Changes to knowledge content, ACP documents, and conversation patterns are governed by `AIOS/Learning/06_CHANGE_PROPOSAL.md`.

---

## 1. Governance Principles

These principles govern all intelligence capability decisions.

**G1 — Human Owns Final Approval**  
Intelligence Architecture recommendations are proposals. The Human Product Owner has final authority over all intelligence capability changes. Architecture documents inform; they do not self-authorize.

**G2 — Architecture Before Implementation**  
No intelligence capability may be implemented before its architecture is documented and SSI-cleared. "We'll document it after" is not acceptable.

**G3 — SSI Clearance Is Mandatory**  
Every proposed capability must pass the 5-gate Architecture Gate in `01_SINGLE_SOURCE_OF_INTELLIGENCE.md` before any work begins.

**G4 — Sensitive Capabilities Require Elevated Review**  
Capabilities affecting medical, trust, compliance, product recommendation, lead capture, or handoff require two reviewers and a mandatory 48-hour staging period before production.

**G5 — Deprecation Is Irreversible Without an ADR**  
Deprecating a capability (e.g., removing `lib/trustEngine.ts`) requires an ADR. Deprecation without an ADR is an architecture violation.

**G6 — Traceability Is Non-Negotiable**  
Every intelligence capability in production must trace back to: Phase 11.0A audit finding or a formal Change Proposal. No capability is deployed without a documented origin.

---

## 2. Intelligence Architecture Review Gate

Before any intelligence capability work is approved, the following five checks must pass. See `01_SINGLE_SOURCE_OF_INTELLIGENCE.md` Section 4 for the full gate process.

| Gate | Check | Pass Condition |
|---|---|---|
| Gate 1 | **Inventory** — Does this capability already exist? | Confirmed it doesn't exist (or found and routed to Gate 2) |
| Gate 2 | **Overlap** — Does an existing capability partially address this? | Overlap < 50%, or extension path identified |
| Gate 3 | **Owner** — Who currently owns the overlapping capability? | Owner intelligence identified; consultation complete |
| Gate 4 | **Placement** — Can this be placed under an existing owner? | Placement confirmed valid per boundary map |
| Gate 5 | **Extension Before Creation** — Is a new intelligence domain truly required? | Confirmed no existing intelligence can own this |

A failed gate means the work stops at that gate until the gate condition is resolved.

---

## 3. Approval Authority by Change Type

| Change Type | Required Approver | Review Cadence |
|---|---|---|
| P0 — Architecture debt fix (non-behavioral) | Chief AI Architect | Immediate |
| P0 — Behavioral change (trust, medical, recommendation) | Chief AI Architect + Human Product Owner | 48h staging minimum |
| P1 — New intelligence capability | Chief AI Architect | Architecture review + Human Product Owner for sensitive categories |
| P1 — ACP Decision_Rules modification | ACP owner + Chief AI Architect + Human Product Owner | Full Learning Change Proposal process |
| P2 — Major capability addition | Chief AI Architect + Human Product Owner | ADR required |
| P3 — Exploratory / future | Human Product Owner | Architecture proposal only; no implementation |
| Deprecation of any active capability | Chief AI Architect + Human Product Owner | ADR required |
| SSI ownership transfer | Human Product Owner | ADR required |

---

## 4. Sensitive Change Categories — Elevated Review

The following capability categories require **two independent reviewers** before any production change:

---

### SC-01 — Medical

**Why**: Medical responses carry compliance and customer safety implications. An incorrect response to a health condition question can mislead a customer's underwriting expectations.

**Extra requirements**:
- Two reviewers (Chief AI Architect + QA Lead)
- Mandatory medical uncertainty language verified in test cases
- Regression test covering all `isMedicalSignal = true` scenarios must pass
- Reference: `AIOS/Learning/01_LEARNING_PHILOSOPHY.md` Principle 4 (Safety Over Speed)

---

### SC-02 — Trust

**Why**: Trust failures destroy customer relationships. A lead capture action during an active trust concern is a constitutional violation (C-04: Customer Safety).

**Extra requirements**:
- BUILD_TRUST_FIRST strategy must be verified in regression tests before and after
- PATTERN-TRUST-001 test cases must all pass
- No commercial action may be possible while `trustConcernActive = true` in any test scenario

---

### SC-03 — Compliance

**Why**: Financial advisory is regulated. Investment risk disclosures, underwriting uncertainty language, and commission disclosure are not optional.

**Extra requirements**:
- Mandatory fragment inclusion must be verified for all affected products
- Any change to mandatory fragments requires Human Product Owner + legal review
- Zero tolerance for removing mandatory fragments

---

### SC-04 — Product Recommendation

**Why**: An incorrect recommendation (wrong product for customer profile) is a commercial failure that also damages trust.

**Extra requirements**:
- ACP-09 regression cases must all pass
- Recommendation rationale must be traceable to loaded knowledge snippet (not hallucinated)
- Human Product Owner reviews recommendation logic for any Decision_Rules change

---

### SC-05 — Lead Capture

**Why**: Lead capture timing and gating are tightly coupled to trust, medical, and commercial logic. Premature or incorrectly-gated lead capture degrades the customer experience and violates CP-03.

**Extra requirements**:
- Trust gate verified: lead capture must be blocked when `trustConcernActive = true`
- Medical gate verified: no lead capture pressure during medical disclosure
- CP-05 (known field protection) regression must pass

---

### SC-06 — Handoff

**Why**: Handoff is the terminal event in the AI conversation. A poor handoff destroys the commercial value of the entire conversation and the advisor's time.

**Extra requirements**:
- ACP-17 regression cases must pass
- Handoff context must include: lead score, trust status, medical status, conversation summary
- Human Product Owner reviews any change to handoff trigger conditions

---

## 5. Intelligence Deprecation Process

Deprecating an intelligence capability (e.g., removing V1 trustEngine, removing a V1 intent classifier) follows this process:

```
Step 1: Verify equivalent Gen1 capability exists and is tested
  └── Run full test suite; confirm 0 failures

Step 2: Declare deprecation intent
  └── Add deprecation notice to the file to be removed
  └── Log issue in issueDatabase with severity P2, category 'other'

Step 3: Create an ADR
  └── ADR must document: what is being deprecated, why, what replaces it,
      migration impact, and rollback plan

Step 4: Chief AI Architect review
  └── Confirm no consumers depend on the deprecated capability

Step 5: Human Product Owner approval
  └── Final sign-off before any file is deleted

Step 6: Execute deprecation
  └── Remove file(s) per ADR scope
  └── Confirm test suite still passes
  └── Commit with message: "deprecate(v1): [capability] — replaced by [Gen1 equivalent]"
```

---

## 6. Intelligence Architecture Change Log

All changes to this document and to SSI assignments must be recorded here.

| Date | Change | Author | Approved By |
|---|---|---|---|
| 2026-06-29 | Phase 11.0B: AIOS Intelligence Architecture v1.0 created | Chief AI Architect | Human Product Owner (pending) |

---

## 7. Conflict Resolution

If two intelligence domains dispute ownership of a capability:

1. The Chief AI Architect proposes a resolution based on the SSI principles in `01_SINGLE_SOURCE_OF_INTELLIGENCE.md`
2. If unresolved: Human Product Owner makes the final determination
3. The determination is recorded as an ADR and the SSI table is updated
4. No work may proceed on the disputed capability until ownership is resolved

If an approved change conflicts with the AI Constitution:

1. The AI Constitution wins — always
2. The change is rejected
3. A new Change Proposal must be designed to achieve the goal without violating the Constitution

---

## 8. Relationship to Learning Intelligence Governance

This governance document covers **intelligence capability changes** (adding, modifying, deprecating intelligence capabilities).

`AIOS/Learning/06_CHANGE_PROPOSAL.md` covers **knowledge and behavior changes** (updating ACP content, knowledge documents, response patterns, decision logic).

Both processes require human approval. Both require traceability.

They are complementary, not competing. A P1-07 item (Decision Rules → ACP-driven) requires BOTH:
- Intelligence Governance (capability change: moving rules from TypeScript to ACP)
- Learning Change Proposal (behavior change: what the new rules say)
