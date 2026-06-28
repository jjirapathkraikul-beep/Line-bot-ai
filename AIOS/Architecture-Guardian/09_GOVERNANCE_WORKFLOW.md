# 09 — Governance Workflow

**Document ID**: AIOS-AGS-09  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `AIOS/Architecture-Office/AI_OPERATING_MODEL.md` (roles), `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` (intelligence governance), `AIOS/Learning/06_CHANGE_PROPOSAL.md` (content governance)

---

## Purpose

Illustrate how the Architecture Guardian System (AGS) interacts with every other governance actor in AIOS — and how work flows through the complete governance ecosystem.

---

## 1. Governance Actor Map

| Actor | Role | Relationship to AGS |
|---|---|---|
| **Human Product Owner (HPO)** | Supreme authority; product vision and strategy | AGS reports to HPO; cannot override HPO |
| **Architecture Guardian (AGS)** | Architecture gate for all significant changes | This document |
| **Chief AI Architect (CAA)** | Implementation authority; executes approved architecture | AGS gates CAA proposals; CAA implements Guardian decisions |
| **Architecture Office** | Governs the operating model, onboarding, and standards | AGS enforces standards set by Architecture Office |
| **AIRR** | One-time phase readiness review | AIRR reviews completed; AGS is continuous |
| **Architecture Audit** | Annual retrospective audit | Audit is retrospective; AGS is proactive |
| **Intelligence Governance** | Governs intelligence-layer capability changes | AGS gates proposals BEFORE they reach Intelligence Governance |
| **Learning Intelligence** | Governs quality, patterns, change proposals | AGS gates architectural changes; Learning governs content changes |
| **Commercial Intelligence** | Governs commercial capability changes | AGS reviews commercial proposals with commercial impact flag |
| **Business Intelligence** | Governs analytics and business metrics | AGS reviews analytics proposals |
| **Advisor Intelligence** | Governs handoff and advisor capabilities | AGS reviews advisor proposals |
| **Codex Review** | Code review for implementation quality | AGS clearance precedes code review |
| **Claude (Implementation)** | Primary AI implementor | Claude proposes architecture to AGS; implements after clearance |
| **ChatGPT (Architecture)** | Architecture advisor; design proposals | ChatGPT proposals treated as implementor proposals |

---

## 2. Complete Governance Workflow

### Primary Path: Standard Architectural Change

```
TRIGGER
  Human Product Owner identifies product need OR
  Chief AI Architect identifies technical need OR
  Claude / ChatGPT proposes architectural addition

       │
       ▼
PROPOSAL CREATION
  Proposer completes:
    • Architecture Change Proposal (02_REVIEW_PROCESS.md)
    • Capability Checklist (04_CAPABILITY_CHECKLIST.md)
    • Future Impact Assessment (07_FUTURE_IMPACT.md)

       │
       ▼
ARCHITECTURE GUARDIAN INTAKE
  Guardian classifies: Full / Abbreviated / No Review Required
  Guardian assigns priority: P0 / P1 / P2

       │
       ▼
SIX-GATE REVIEW (01_ARCHITECTURE_GATES.md)
  Gate 1: Vision Alignment → PASS / FAIL
  Gate 2: Capability Audit → PASS / ROUTE TO EXISTING / FAIL
  Gate 3: SSI Validation → PASS / FAIL
  Gate 4: Layer Validation → PASS / FAIL
  Gate 5: Business Value → PASS / REVISION
  Gate 6: Future Impact → PASS / REVISION

       │
       ├── GATE FAILURE ─────────────────────────────────────────────────┐
       │   (see Failure Paths below)                                      │
       │                                                                  │
       ▼                                                                  │
GUARDIAN DECISION (03_DECISION_MATRIX.md)                                 │
  APPROVE                                                                 │
  APPROVE WITH CONDITIONS                                                 │
  REQUEST REVISION ──────────────────────────────────────────────────────┘
  REJECT ────────────────────────────────────────────→ EXCEPTION PROCESS?
  ESCALATE ─────────────────────────────────────────→ HPO

       │ (on APPROVE or APPROVE WITH CONDITIONS)
       ▼
IMPLEMENTATION
  Chief AI Architect directs implementation
  Claude / runtime engineers implement
  Must stay within approved architecture; deviations reopen review

       │
       ▼
INDEPENDENT REVIEW
  Second reviewer confirms implementation matches approved architecture
  All tests pass (for code changes)
  All documents comply with AIOS standard (for documentation)

       │
       ▼
ARCHITECTURE CLEARANCE (02_REVIEW_PROCESS.md)
  Guardian issues Architecture Clearance
  Conditions (if any) confirmed as met
  Architecture debt registered (if any)

       │
       ▼
MERGE
  Implementation is merged
  Review record archived
  Debt register updated

       │
       ▼
POST-MERGE (ongoing)
  Beta daily review monitors new capability behavior
  Learning intelligence logs quality signals
  Architecture Debt Register tracks resolution progress
```

---

## 3. Failure Paths

### Path A: Gate Failure — Revision Required

```
Gate N fails
  │
  ▼
REQUEST REVISION issued by Guardian
  │
  ▼
Proposer revises specific failed gate evidence
  │
  ▼
Resubmit gate N only (not full restart)
  │
  ├── PASS → proceed to gate N+1
  └── FAIL again → if 3rd failure: HPO review required
```

### Path B: Gate Failure — Reject

```
Gate N fails (non-revisable)
  │
  ▼
REJECT issued by Guardian
  │
  ├── Proposer accepts → proposal archived
  │
  └── Proposer contests → EXCEPTION PROCESS (08_EXCEPTION_PROCESS.md)
        │
        ├── HPO APPROVE EXCEPTION → proceed with debt registration
        └── HPO REJECT EXCEPTION → proposal archived
```

### Path C: Escalation

```
Guardian cannot decide
  │
  ▼
ESCALATE issued by Guardian
  │
  ▼
HPO receives Escalation Notice
  │
  ├── HPO APPROVE → equivalent to APPROVE or APPROVE WITH CONDITIONS
  ├── HPO REJECT → equivalent to REJECT
  └── HPO REVISE → proposal returned with HPO guidance
```

---

## 4. AGS × Architecture Office

The Architecture Office (`AIOS/Architecture-Office/`) defines the operating model, standards, and onboarding for all AIOS participants.

| Architecture Office Document | AGS Relationship |
|---|---|
| `AI_OPERATING_MODEL.md` | AGS enforces the role authority structure defined here |
| `AIOS_INFORMATION_ARCHITECTURE_STANDARD.md` | AGS enforces information architecture standards in every proposal |
| `AI_WORKFORCE_ONBOARDING.md` | AGS expectations are introduced in onboarding |
| `AIRR_v1.0.md` | AIRR is historical readiness review; AGS is the ongoing successor |

When the Architecture Office updates its standards, AGS gate criteria are updated to reflect the new standards within 30 days.

---

## 5. AGS × Intelligence Governance

Intelligence Governance (`AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md`) governs changes within the intelligence layer.

| Stage | AGS | Intelligence Governance |
|---|---|---|
| Before intelligence capability proposal | AGS gates the proposal | Not yet involved |
| After AGS APPROVE | AGS clearance triggers Intelligence Governance review | Receives AGS-approved proposal |
| Intelligence Governance review | Observes | Runs intelligence-layer gate (SSI clearance, sensitive category check) |
| After Intelligence Governance approval | Observes | Implementation authorized |
| Post-implementation | Monitors drift | Monitors SSI compliance |

**Key interaction**: AGS gates architectural validity; Intelligence Governance gates intelligence-layer compliance. Both must pass before implementation.

For proposals touching intelligence capabilities, the sequence is:
1. AGS review → AGS clearance
2. Intelligence Governance review → IG clearance
3. HPO sign-off (for sensitive categories)
4. Implementation

---

## 6. AGS × Learning Intelligence

Learning Intelligence governs content changes (knowledge, ACP, patterns). AGS governs architectural changes.

**Boundary**: If a proposal changes what AIOS does (new behavior, new capability), it goes through AGS. If a proposal changes what AIOS says or knows (content update), it goes through Learning Change Proposal.

| Change Type | Governance Path |
|---|---|
| New ACP package | AGS (new capability) → Learning (content review) |
| Updated ACP Decision_Rules | Learning Change Proposal only |
| New knowledge document | AGS (if new capability domain) / Learning (if content update) |
| Updated knowledge content | Learning Change Proposal only |
| New issue category | AGS (architectural) → Learning (operational) |
| Pattern Library entry | Learning only |

When a change has both architectural and content components (common), both processes run in sequence:
1. AGS reviews architectural component → issues clearance
2. Learning reviews content component → issues change proposal approval
3. Both must be complete before merge

---

## 7. AGS × Beta Operating System

The Beta Operating System (`AIOS/Beta/`) defines how AIOS operates during Beta. AGS governs the architecture changes that arise from Beta learning.

| Beta Signal | AGS Response |
|---|---|
| P0 issue identified in daily review | AGS Emergency Protocol activated (Gate 6 bypass with 72h retroactive review) |
| Change Proposal from weekly cycle | AGS full or abbreviated review |
| Architecture drift detected in weekly cycle | AGS flags for Guardian attention |
| Monthly strategic review | AGS reviews Architecture Debt Register with HPO |
| RC Gate assessment | AGS issues architecture clearance for Beta → RC promotion |

The Beta weekly rhythm and AGS review cadence are aligned:
- Monday: Change Proposals submitted → AGS intake
- Tuesday-Wednesday: AGS gate review
- Thursday: AGS decision issued → HPO approval if needed
- Thursday-Friday: Implementation under clearance

---

## 8. AGS × Commercial, Business, and Advisor Intelligence

For domain intelligence changes with specialized impact:

| Change Involves | Specialist Review Required |
|---|---|
| Lead scoring, qualification, handoff timing | Commercial Intelligence review (after AGS clearance) |
| Analytics event schema, KPI definitions | Business Intelligence review (after AGS clearance) |
| Human handoff context, advisor brief | Advisor Intelligence review (after AGS clearance) |
| Medical or trust logic | Sensitive category review per INT-08 SC-01/SC-02 |

**Sequence**: AGS → Specialist Intelligence domain → HPO (if sensitive) → Implementation

---

## 9. AGS × Claude and ChatGPT

Claude (primary implementation AI) and ChatGPT (architecture advisor) are implementors in the AIOS governance model. They are not governance authorities.

| Actor | AGS Relationship |
|---|---|
| Claude | Proposes architecture; implements after clearance; subject to drift detection in Gate 6 |
| ChatGPT | Proposes architecture; subject to same gates as Claude |
| Neither | May self-approve; may approve exceptions; may override Guardian |

**Drift detection**: The Guardian applies extra scrutiny to AI-generated proposals for architectural drift (`07_FUTURE_IMPACT.md` Section 5). AI systems generate plausible-sounding but drift-inducing patterns. The Guardian is skeptical by default.

---

## 10. Governance Interaction Summary

```
Human Product Owner
  ├── Approves exceptions (08)
  ├── Resolves escalations (03)
  ├── Signs monthly architecture debt review
  └── Issues RC gate approval
  
Architecture Guardian (AGS)
  ├── Gates all proposals (01)
  ├── Enforces SSI (05)
  ├── Validates layers (06)
  ├── Scores future impact (07)
  ├── Issues clearances (02)
  └── Maintains debt register (10)
  
Intelligence Governance
  ├── Receives AGS-cleared proposals
  ├── Gates intelligence-layer compliance
  └── Issues IG clearance
  
Learning Intelligence
  ├── Receives AGS-cleared content proposals
  ├── Reviews content changes
  └── Issues Change Proposal approval
  
Architecture Office
  ├── Sets standards (AGS enforces)
  └── Onboards participants
  
Chief AI Architect
  ├── Directs implementation after clearance
  └── Conducts independent review
  
Claude / ChatGPT
  ├── Propose architecture
  └── Implement after clearance
```
