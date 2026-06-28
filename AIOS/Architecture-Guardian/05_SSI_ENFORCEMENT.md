# 05 — SSI Enforcement

**Document ID**: AIOS-AGS-05  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md` (SSI Definition)  
**Note**: This document ENFORCES SSI. The definition, ownership tables, and anti-duplication rules are in `AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md`. Do not duplicate those here.

---

## Purpose

Define how the Architecture Guardian detects, prevents, and remedies Single Source of Intelligence (SSI) violations across all AIOS components.

SSI is the principle that every intelligence capability has exactly one owner. This document is the enforcement mechanism.

---

## 1. What the Guardian Verifies

For every architectural review, the Guardian must verify the following SSI properties:

### 1.1 — Correct Owner

**Check**: Does the proposed capability have exactly one named owner?

**Verify against**: `AIOS/Intelligence/01_SINGLE_SOURCE_OF_INTELLIGENCE.md` — SSI Ownership Tables (SSI-01 to SSI-10)

| SSI Assignment | Owner | What it Governs |
|---|---|---|
| SSI-01 | Customer Intelligence | Conversation Memory |
| SSI-02 | Conversation Intelligence | Intent Classification |
| SSI-03 | Product Intelligence | Product Knowledge |
| SSI-04 | Commercial Intelligence | Lead Scoring |
| SSI-05 | Capability Packages (ACP) | Decision Rules |
| SSI-06 | Customer Intelligence | Trust Logic |
| SSI-07 | Business Intelligence | Analytics Events |
| SSI-08 | Learning Intelligence | Learning Governance |
| SSI-09 | Customer Intelligence | Session Hydration |
| SSI-10 | Advisor Intelligence | Human Handoff Context |

**Pass**: Proposed owner matches SSI table, or no conflict with any SSI assignment.  
**Fail**: Proposed owner conflicts with an existing SSI assignment.

---

### 1.2 — No Duplicate Intelligence

**Check**: Does any other intelligence domain or runtime module implement the same intelligence that this capability claims to own?

**Search locations**:
1. `AIOS/Intelligence/` — all 7 domain documents
2. `AIOS/CapabilityPackages/` — ACP-01 to ACP-20 Decision_Rules
3. `runtime-gen1/` — all pipeline modules
4. `lib/` — V1 library modules (known duplicates: see Section 3)

**Pass**: No duplicate implementation found.  
**Fail**: Duplicate implementation exists.

---

### 1.3 — No Duplicate Memory

**Check**: Does any other component maintain the same customer memory that this capability claims to own?

**Known canonical owners**:
- Customer facts (`gender`, `age`, `occupation`, `income`, etc.) → Customer Intelligence → `memoryResolver.ts`
- Conversation history → Customer Intelligence → `conversationLogger.ts` + `getRecentConversationTurnsForUser()`
- Trust state → Customer Intelligence → trust detection in Gen1 pipeline
- Medical state → Customer Intelligence → medical detection in Gen1 pipeline
- Session state → Customer Intelligence → `RuntimeInput.session`

**Pass**: Proposed memory field is not already owned.  
**Fail**: Memory field is already owned by Customer Intelligence or another component.

---

### 1.4 — No Duplicate Knowledge

**Check**: Is the same product knowledge available in multiple locations?

**Known canonical owner**: Product Intelligence → `AIOS/KnowledgeBase/`, `AIOS/Domains/`

**Violation pattern**: A runtime module hardcodes product facts (premium ranges, eligibility rules, coverage terms) instead of reading from the Knowledge Base.

**Pass**: Knowledge lives in exactly one location.  
**Fail**: Knowledge is duplicated across knowledge documents or hardcoded in runtime.

---

### 1.5 — No Duplicate Lead Scoring

**Check**: Is lead scoring implemented in more than one place?

**Known canonical owner**: Commercial Intelligence → `lib/scorer.ts` (V1) is being deprecated; Gen1 is the canonical scoring location.

**Violation pattern**: V1 `lib/scorer.ts` and Gen1 lead scoring coexist with different logic.

**Pass**: Lead scoring logic exists in exactly one active implementation.  
**Fail**: Lead scoring logic exists in two or more active implementations.

---

### 1.6 — No Duplicate Product Logic

**Check**: Is product eligibility, pricing, or benefit logic implemented in more than one place?

**Known canonical owner**: Product Intelligence → `AIOS/Domains/Insurance/Products/` and `AIOS/Domains/Insurance/Knowledge/`

**Violation pattern**: `lib/medicalEngine.ts` (V1) implements medical eligibility logic that duplicates knowledge document content.

**Pass**: Product logic in one location only.  
**Fail**: Product logic exists in knowledge documents AND hardcoded in runtime modules.

---

### 1.7 — No Duplicate Analytics

**Check**: Is analytics event tracking implemented in more than one place?

**Known canonical owner**: Business Intelligence → Analytics events taxonomy in `AIOS/Intelligence/02_INTELLIGENCE_TAXONOMY.md`

**Violation pattern**: Multiple pipeline steps emit `analyticsReady` events for the same business event; or V1 and Gen1 emit different event schemas for the same business event.

**Pass**: Analytics event schema is singular and owned by Business Intelligence.  
**Fail**: Multiple event schemas exist for the same business event.

---

## 2. SSI Violation Types

| Violation Type | Code | Severity | Description |
|---|---|---|---|
| Dual Owner | SSI-V01 | Critical | Two intelligence domains both claim to own the same capability |
| Orphaned Capability | SSI-V02 | High | A capability exists with no declared owner |
| Shadow Implementation | SSI-V03 | High | A consumer implements owner logic instead of consuming the owner's output |
| Knowledge Duplication | SSI-V04 | Medium | The same fact exists in two or more knowledge documents |
| Runtime Hardcode | SSI-V05 | Medium | Runtime module hardcodes logic that should be in an intelligence-owned document |
| Deprecated Parallel | SSI-V06 | Medium | A deprecated capability and its replacement coexist without a migration plan |
| Consumer Fork | SSI-V07 | High | A consumer forks a capability instead of requesting a change from the owner |
| Boundary Bleed | SSI-V08 | Medium | An intelligence domain modifies another domain's capability without permission |

---

## 3. Known Existing Violations (Registered Architectural Debt)

These violations were identified in the Phase 11.0A Architecture Audit. They are registered in `10_ARCHITECTURE_DEBT_REGISTER.md` and are in various stages of remediation.

| Violation | Type | Status | Target Resolution |
|---|---|---|---|
| `lib/intentClassifier.ts` vs Gen1 intent detection | SSI-V01 (Dual Owner) | Registered | Gen1 becomes canonical; V1 deprecated |
| `lib/scorer.ts` vs Gen1 lead scoring | SSI-V01 (Dual Owner) | Registered | Gen1 becomes canonical; V1 deprecated |
| `lib/trustEngine.ts` vs Gen1 trust detection | SSI-V01 (Dual Owner) | Registered | Gen1 becomes canonical; V1 deprecated |
| `lib/medicalEngine.ts` vs Knowledge documents | SSI-V05 (Runtime Hardcode) | Registered | Knowledge documents become canonical; V1 deprecated |
| `lib/leadCapture.ts` vs Gen1 lead capture | SSI-V01 (Dual Owner) | Registered | Gen1 becomes canonical; V1 deprecated |

These are known debts. New violations of the same type are not acceptable — the existing debt does not justify creating new debt.

---

## 4. SSI Violation Response

| Violation Code | Guardian Response |
|---|---|
| SSI-V01 (Dual Owner) | Reject proposal. Assign single owner. Other implementation must be deprecated. |
| SSI-V02 (Orphaned) | Request Revision. Owner must be assigned before any other review proceeds. |
| SSI-V03 (Shadow Implementation) | Reject proposal. Consumer must be redesigned to consume owner output. |
| SSI-V04 (Knowledge Duplication) | Request Revision. One document is canonical; other must reference it. |
| SSI-V05 (Runtime Hardcode) | Reject proposal. Logic must move to intelligence-owned document. |
| SSI-V06 (Deprecated Parallel) | Approve with Condition: migration plan required; parallel state is time-boxed. |
| SSI-V07 (Consumer Fork) | Reject proposal. Change request must go to the owner. |
| SSI-V08 (Boundary Bleed) | Reject proposal. Cross-domain modification requires owner consent. |

---

## 5. SSI Compliance Certificate

Upon completing SSI verification, the Guardian issues an SSI Compliance Certificate (part of Architecture Clearance):

```
SSI COMPLIANCE — AIOS Architecture Guardian

Proposal ID: ACP-YYYY-NNN
Date: YYYY-MM-DD

SSI Checks:
  1.1 Correct Owner: PASS / FAIL — [details]
  1.2 No Duplicate Intelligence: PASS / FAIL — [details]
  1.3 No Duplicate Memory: PASS / FAIL — [details]
  1.4 No Duplicate Knowledge: PASS / FAIL — [details]
  1.5 No Duplicate Lead Scoring: PASS / FAIL — [details]
  1.6 No Duplicate Product Logic: PASS / FAIL — [details]
  1.7 No Duplicate Analytics: PASS / FAIL — [details]

SSI Violations Detected: [None / List]
SSI Status: CLEAN / VIOLATION [code] — [remediation required]
```

---

## 6. SSI Enforcement Frequency

| Trigger | When |
|---|---|
| New capability proposed | Every proposal (Gate 3) |
| Existing capability scope changed | Every scope change |
| New intelligence domain proposed | Full SSI audit of all 10 assignments |
| New runtime module added | Check against all 7 SSI intelligence domains |
| Quarterly SSI audit | Check entire AIOS architecture for drift from known assignments |
