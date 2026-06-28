# 03 — Decision Matrix

**Document ID**: AIOS-AGS-03  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `02_REVIEW_PROCESS.md` (process), `00_GUARDIAN_CHARTER.md` (authority)

---

## Purpose

Define the five Guardian decision types, when each applies, what evidence is required, who has authority, and what the next step is.

Every Architecture Guardian decision produces exactly one of these five outcomes.

---

## Decision Type 1 — APPROVE

### Definition
The proposal passes all applicable gates. No conditions. No architectural debt. Implementation is authorized.

### When to Use
- All 6 gates pass with Strong or Adequate evidence
- No technical or architecture debt is introduced
- Implementation is straightforward and contained within the approved layer

### Required Evidence
- Gate results: all Pass or Conditional Pass
- Capability search evidence (Gate 2): search log provided and complete
- SSI owner: confirmed and singular (Gate 3)
- Layer: confirmed correct (Gate 4)
- Business value: articulated and proportionate (Gate 5)
- Future Impact Score: ≥ 70 (Gate 6)

### Authority
Architecture Guardian may approve without HPO involvement.

### Next Step
Architecture Clearance issued. Implementation proceeds. No debt registered.

### APPROVE notice format
```
GUARDIAN DECISION: APPROVE

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
All 6 gates: PASS
Architecture Debt: None
Architecture Clearance: Issued
```

---

## Decision Type 2 — APPROVE WITH CONDITIONS

### Definition
The proposal passes all applicable gates, but implementation must satisfy one or more conditions. Conditions are specific, measurable, and verified before Architecture Clearance is issued.

### When to Use
- Gates pass, but one or more of the following apply:
  - A deprecation plan is required but not yet complete
  - Architecture debt is incurred and must be registered
  - A regression test for the new capability must be written before merge
  - A review milestone is required (e.g., re-review in 90 days)
  - An existing capability must be extended before the new one is used
  - A boundary condition requires monitoring

### Required Evidence
- Gate results: all Pass or Conditional Pass
- Condition list: each condition is specific, measurable, and has an owner and due date
- Architecture debt: pre-registered in `10_ARCHITECTURE_DEBT_REGISTER.md` with debt ID

### Authority
Architecture Guardian approves. HPO notification required if conditions include architecture debt of Severity ≥ Medium.

### Next Step
Implementation proceeds under conditions. Guardian verifies condition completion before issuing Architecture Clearance. Architecture Clearance is not issued until all conditions are met.

### APPROVE WITH CONDITIONS notice format
```
GUARDIAN DECISION: APPROVE WITH CONDITIONS

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
Gate results: [list each gate and result]
Conditions:
  CON-01: [Condition description] — Owner: [name] — Due: YYYY-MM-DD
  CON-02: [Condition description] — Owner: [name] — Due: YYYY-MM-DD
Architecture Debt: [Debt ID(s) registered, or "None"]
Architecture Clearance: Pending condition completion
```

---

## Decision Type 3 — REQUEST REVISION

### Definition
The proposal does not yet meet the gate standard, but the underlying change is architecturally viable. The implementor must revise the proposal and resubmit.

### When to Use
- One or more gates have Weak or Missing evidence
- The proposed design is directionally correct but needs refinement
- The capability search is incomplete (Gate 2)
- The owner is unspecified or ambiguous (Gate 3)
- The layer is likely correct but the justification is missing (Gate 4)
- The business value is plausible but not articulated (Gate 5)
- The Future Impact Score is missing (Gate 6)

### Required Evidence
- Guardian specifies exactly which gate(s) failed
- Guardian specifies exactly what evidence would satisfy the gate
- Guardian specifies which aspects of the proposal are acceptable as-is

### Authority
Architecture Guardian may issue without HPO involvement.

### Next Step
Proposal is returned to implementor with specific revision instructions. Implementor revises and resubmits the specific failed gate(s). Full restart is not required.

### REQUEST REVISION notice format
```
GUARDIAN DECISION: REQUEST REVISION

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
Gate(s) requiring revision:
  Gate N: [What is missing] — [What is needed to pass]
Acceptable as-is:
  - [List parts of proposal that do not need revision]
Resubmit by: YYYY-MM-DD
```

---

## Decision Type 4 — REJECT

### Definition
The proposal fails one or more mandatory gates in a way that cannot be resolved by revision. The change as proposed is not architecturally acceptable.

### When to Use
- Gate 1 fails: the change does not align with AIOS Vision or violates AI Principles
- Gate 2 fails: the capability already exists and reuse is technically feasible
- Gate 3 fails: the proposed ownership creates SSI violation that cannot be resolved
- Gate 4 fails: the proposed layer placement is fundamentally incorrect and cannot be corrected by redesign alone
- Gate 5 fails: the business value does not exist or is so weak it cannot justify any complexity
- A proposal has been revised 3 times and still fails the same gate

### Required Evidence
- Guardian specifies which gate(s) failed and why they are not revisions-fixable
- Guardian specifies what alternative approach would be acceptable, if one exists

### Authority
Architecture Guardian may reject. HPO may override a rejection via Exception Process (`08_EXCEPTION_PROCESS.md`).

### Next Step
Proposal is archived. If HPO wishes to override, the Exception Process is initiated. If a different approach is viable, a new proposal may be submitted.

### REJECT notice format
```
GUARDIAN DECISION: REJECT

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
Gate(s) failed: [list]
Reason(s): [specific, not general]
Alternative approach (if any): [description, or "No viable alternative identified"]
HPO override: Available via 08_EXCEPTION_PROCESS.md
```

---

## Decision Type 5 — ESCALATE

### Definition
The Architecture Guardian cannot make a determination and requires Human Product Owner involvement before proceeding.

### When to Use
- The proposal has product-level implications that are outside the Guardian's authority
- Two or more reviewers disagree and consensus cannot be reached
- The proposal requires a change to the AI Vision, AI Principles, or Constitution
- The proposal is a novel case with no clear precedent in AIOS architecture
- A rejected proposal is being contested by the implementor
- The proposal affects business goals, commercial strategy, or product scope

### Required Evidence
- Guardian provides full gate results (including any partial passes)
- Guardian provides a clear statement of the specific decision that requires HPO input
- Guardian provides its recommendation (Approve / Reject / specific condition)
- Guardian provides the consequences of each option

### Authority
Architecture Guardian initiates escalation. Human Product Owner has final authority.

### Next Step
Guardian issues Escalation Notice. Implementation is paused until HPO responds. HPO response time: 5 business days for standard; 24 hours for P0.

### ESCALATE notice format
```
GUARDIAN DECISION: ESCALATE

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD
Gate results to date: [partial results]
Decision required: [Exactly what HPO must decide]
Option A: [Approve] — Consequence: [impact]
Option B: [Reject] — Consequence: [impact]
Guardian recommendation: [Option A / B / specific condition]
Evidence: [Document references]
HPO response required by: YYYY-MM-DD
Implementation: PAUSED pending HPO response
```

---

## Decision Authority Table

| Decision | Guardian Authority | HPO Required |
|---|---|---|
| APPROVE | Yes | No (notification optional) |
| APPROVE WITH CONDITIONS (no debt) | Yes | No |
| APPROVE WITH CONDITIONS (Severity ≥ Medium debt) | Yes | Notification required |
| REQUEST REVISION | Yes | No |
| REJECT | Yes | No (HPO may override via Exception) |
| ESCALATE | Initiates only | Required to resolve |

---

## Decision Timeline

| Decision Type | Maximum Time to Decide |
|---|---|
| APPROVE | 1 business day after all gate evidence received |
| APPROVE WITH CONDITIONS | 2 business days after all gate evidence received |
| REQUEST REVISION | 1 business day after evidence received |
| REJECT | 2 business days after all gate evidence received |
| ESCALATE | Same day escalation initiated; HPO has 5 days to respond |

---

## Decision Record

Every decision — regardless of type — is recorded. The decision record includes:

- Proposal ID
- Decision type and date
- Gate results
- Rationale (brief)
- Architecture debt (if any): Debt ID from `10_ARCHITECTURE_DEBT_REGISTER.md`
- Conditions (if any)
- Reviewer(s)

Decision records are the audit trail of architecture governance. They are permanent and may not be deleted.
