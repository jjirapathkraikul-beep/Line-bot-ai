# AIOS Architecture Guardian System (AGS)

**Document ID**: AIOS-AGS-README  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief Enterprise Architect  
**Constitutional Basis**: `AIOS/04_AI_Constitution.md` (Section 1 — Purpose, Section 5 — Governance)

---

## What AGS Is

The Architecture Guardian System (AGS) is the permanent, proactive governance mechanism that protects AIOS from architecture degradation over time.

AGS is not a committee. It is not a periodic review. It is not a post-mortem.

**AGS is a gate.** Every significant change to AIOS must pass through it before implementation begins.

---

## Why AGS Exists

AIOS has grown from a chatbot prototype to a 9-layer governed AI Operating System. That growth was managed. But growth without a permanent guardian eventually becomes drift — and drift compounds.

The Phase 11.0A Architecture Audit found:
- ~35% duplication between V1 and Gen1
- 5 libraries duplicated across architectural boundaries
- 12 architecture smells
- 20 capability gaps
- 10 SSI ownership violations

These problems did not arrive in a single bad decision. They arrived one reasonable-looking shortcut at a time.

AGS exists to catch the shortcut before it becomes the debt.

---

## What AGS Prevents

| Threat | AGS Response |
|---|---|
| Architecture Debt | Blocks implementation without architecture clearance |
| Technical Debt | Requires future impact assessment before approval |
| Duplicate Capabilities | Mandatory capability inventory check |
| Duplicate Knowledge | SSI enforcement across all knowledge domains |
| Wrong Ownership | Layer validation with explicit owner assignment |
| Wrong Layer Placement | 10-layer decision tree |
| Feature Creep | Business value gate before acceptance |
| Scope Creep | Vision alignment gate before acceptance |
| AI-generated Architecture Drift | Architecture Gate before any AI-proposed addition |
| Governance Violations | Review process + exception register |

---

## What AGS Is NOT

AGS is not a replacement for:

| System | AGS Relationship |
|---|---|
| `AIOS/04_AI_Constitution.md` | AGS enforces the Constitution; cannot override it |
| `AIOS/09_AI_Architecture_Audit.md` | Audit is retrospective (annual); AGS is proactive (per change) |
| `AIOS/AIRR/AIRR_v1.0.md` | AIRR is a one-time readiness review; AGS is continuous |
| `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` | Intelligence Governance covers the Intelligence layer; AGS covers all 9 layers |
| `AIOS/Learning/06_CHANGE_PROPOSAL.md` | Change Proposals cover knowledge/ACP content; AGS covers architecture |
| Human Product Owner | Human retains final authority; AGS cannot override |

AGS EXTENDS all of the above. It does not replace any of them.

---

## Where AGS Sits in the Governance Stack

```
AIOS Governance Stack
─────────────────────────────────────────────────────────────
Layer 0: Human Product Owner (final authority — non-delegable)
─────────────────────────────────────────────────────────────
Layer 1: AI Constitution (04_AI_Constitution.md)
         — governs all components, cannot be overridden
─────────────────────────────────────────────────────────────
Layer 2: Architecture Guardian System ← YOU ARE HERE
         — proactive gate; per-change; all architectural layers
─────────────────────────────────────────────────────────────
Layer 3: Intelligence Governance (Intelligence/08)
         — governs intelligence-layer capability changes
─────────────────────────────────────────────────────────────
Layer 4: Learning Change Proposals (Learning/06)
         — governs knowledge/ACP/pattern content changes
─────────────────────────────────────────────────────────────
Layer 5: Architecture Audit (09_AI_Architecture_Audit.md)
         — periodic retrospective audit
─────────────────────────────────────────────────────────────
Layer 6: AIRR (AIRR/AIRR_v1.0.md)
         — one-time phase readiness reviews
─────────────────────────────────────────────────────────────
```

---

## AGS Document Index

| File | Content | Read When |
|---|---|---|
| `00_GUARDIAN_CHARTER.md` | Mission, authority, principles, ethics | First; always |
| `01_ARCHITECTURE_GATES.md` | 6 mandatory review gates | Every proposed change |
| `02_REVIEW_PROCESS.md` | Full review lifecycle | Every review |
| `03_DECISION_MATRIX.md` | Decision types and authority | Making a Guardian decision |
| `04_CAPABILITY_CHECKLIST.md` | 14-point capability evaluation form | Every new capability |
| `05_SSI_ENFORCEMENT.md` | Single Source of Intelligence enforcement | Any intelligence change |
| `06_LAYER_VALIDATION.md` | 10-layer decision tree | Any layer placement question |
| `07_FUTURE_IMPACT.md` | Weighted future impact scoring | Any non-trivial change |
| `08_EXCEPTION_PROCESS.md` | Exception request and documentation | When HPO overrides Guardian |
| `09_GOVERNANCE_WORKFLOW.md` | Full governance interaction model | Understanding system-wide flow |
| `10_ARCHITECTURE_DEBT_REGISTER.md` | Canonical debt registry | Tracking architecture debt |
| `11_GUARDIAN_MANIFESTO.md` | Philosophy and principles | Understanding why AGS exists |

---

## Reading Order

For any new team member or AI collaborator joining AIOS:

1. `00_GUARDIAN_CHARTER.md` — understand the Guardian's authority and limits
2. `11_GUARDIAN_MANIFESTO.md` — understand the philosophy
3. `01_ARCHITECTURE_GATES.md` — understand the six gates
4. `09_GOVERNANCE_WORKFLOW.md` — understand how AGS interacts with the rest of AIOS

For any proposed change to AIOS:

1. `01_ARCHITECTURE_GATES.md` — run all six gates
2. `04_CAPABILITY_CHECKLIST.md` — complete the capability evaluation
3. `06_LAYER_VALIDATION.md` — validate layer placement
4. `05_SSI_ENFORCEMENT.md` — verify SSI compliance
5. `07_FUTURE_IMPACT.md` — score future impact
6. `02_REVIEW_PROCESS.md` — follow the review lifecycle
7. `03_DECISION_MATRIX.md` — determine the decision type

---

## Domain Independence

AGS is domain-independent. It governs architecture across:

- Insurance (current active domain)
- Investment
- Tax
- Healthcare
- Hotel
- Content Automation
- Future AI Advisor domains

No domain is exempt from AGS governance.
