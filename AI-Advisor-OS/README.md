# JIRAWAT | Family Wealth Coach — AI Operating System (AIOS)

> *"I will not recommend what you don't understand, and I will not sell what cannot be explained in numbers."*

---

## Welcome

This is the official documentation repository for the **JIRAWAT AIOS** — an enterprise-grade AI Operating System built to power consistent, principled, and trustworthy financial advisory services for Thai families.

AIOS is not a chatbot. It is not a collection of prompts. It is a structured, governed architecture that defines how AI agents reason, decide, communicate, and improve — reliably, at scale, across every client interaction.

If you are a human contributor, this README will orient you to the entire system in under 15 minutes.

If you are an AI agent being instantiated within AIOS, reading this document is your first required step before any other action.

---

## Table of Contents

1. [What is AIOS](#1-what-is-aios)
2. [Vision](#2-vision)
3. [Architecture Overview](#3-architecture-overview)
4. [Repository Structure](#4-repository-structure)
5. [Core Documents](#5-core-documents)
6. [Reading Order](#6-reading-order)
7. [AI Development Lifecycle](#7-ai-development-lifecycle)
8. [Standards](#8-standards)
9. [Personas](#9-personas)
10. [Knowledge](#10-knowledge)
11. [Skills](#11-skills)
12. [Workflows](#12-workflows)
13. [Governance](#13-governance)
14. [Architecture Review](#14-architecture-review)
15. [Versioning](#15-versioning)
16. [Roadmap](#16-roadmap)
17. [Contribution Guide](#17-contribution-guide)
18. [Frequently Asked Questions](#18-frequently-asked-questions)
19. [Glossary](#19-glossary)

---

## 1. What is AIOS

AIOS stands for **AI Operating System**. It is the complete architectural layer that governs how AI agents operate within the JIRAWAT | Family Wealth Coach business.

Think of AIOS the way you would think of an operating system on a computer: it is the software layer that sits between the raw hardware (the AI model) and the applications (specific AI behaviors like giving financial advice, creating content, or analyzing tax situations). Without AIOS, the AI is a capable but ungoverned general-purpose system. With AIOS, it becomes a consistent, principled, domain-expert system with a defined identity, verifiable reasoning, and institutional memory.

### What AIOS Provides

| Without AIOS | With AIOS |
|-------------|-----------|
| General-purpose AI responses | Domain-expert advice within defined scope |
| Inconsistent reasoning | Principled 12-stage decision process |
| No institutional memory | Verified, maintained Knowledge Base |
| Ad hoc task execution | Structured, auditable Workflows |
| No governance | Constitutional architecture with audit standard |
| Single monolithic behavior | Multiple specialized Personas with clear boundaries |
| Undocumented assumptions | Every assumption explicit and traceable |

### What AIOS Is Not

- **Not a chatbot configuration.** AIOS is a multi-layer architecture. The AI model is one component of Layer 5 — not the system itself.
- **Not a prompt library.** Prompts are outputs of Persona documents, not the architecture itself.
- **Not static.** AIOS is designed to evolve — with a governance process for safe evolution.
- **Not model-dependent.** AIOS is designed to function correctly with any AI model that respects its constraints. The architecture outlasts any specific model version.

---

## 2. Vision

The JIRAWAT AIOS exists to serve one mission:

> **Help Thai families build financial security and freedom through planning that is understandable, transparent, and explainable in numbers.**

Every architectural decision in AIOS traces back to this mission. When a design choice is unclear, the question that resolves it is: *"Which option better serves Thai families on their path to financial security?"*

The four strategic pillars that translate this vision into architecture:

```
PROTECT   →   Build the foundation of security before everything else
EDUCATE   →   No recommendation without understanding first
TRUST     →   Every claim explainable; every number traceable
LEGACY    →   Design for the long term, not the next transaction
```

The AI Vision document (`01_AI_Vision.md`) is the supreme authority in AIOS. No component, instruction, or business directive overrides the Vision.

---

## 3. Architecture Overview

AIOS is organized into **9 architectural layers**. Each layer has a defined purpose, a defined scope, and a defined relationship to the layers above and below it. Higher layers govern lower layers — not the reverse.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   LAYER 1: AI VISION                                                │
│   The organizational mission. The supreme authority.                │
│   Document: 01_AI_Vision.md                                        │
│                                                                     │
│   LAYER 2: AI PRINCIPLES                                            │
│   15 non-negotiable values. Cannot be overridden.                  │
│   Document: 01_AI_Principles.md                                    │
│                                                                     │
│   LAYER 3: AI CONSTITUTION                                          │
│   The governing architecture. Layer boundaries and authority.       │
│   Document: 04_AI_Constitution.md                                  │
│                                                                     │
│   LAYER 4: PROCESS LAYER                                            │
│   How decisions are made. How context is assembled.                 │
│   Documents: 02_AI_Decision_Framework.md, 03_AI_Context_Framework.md│
│                                                                     │
│   LAYER 5: RUNTIME LAYER                                            │
│   How the AI model operates. Operational configuration.             │
│   Document: Claude.md                                              │
│                                                                     │
│   LAYER 6: PERSONA LAYER                                            │
│   Who the AI is in a given context. Role, scope, judgment.          │
│   Documents: 10_Persona_[Name].md                                  │
│                                                                     │
│   LAYER 7: KNOWLEDGE LAYER                                          │
│   What the AI knows. Verified domain facts and frameworks.          │
│   Documents: 30_KB_[Category]_[Name].md                            │
│                                                                     │
│   LAYER 8: SKILL LAYER                                              │
│   What the AI can do. Bounded, reusable capabilities.               │
│   Documents: 40_Skill_[Category]_[Name].md                         │
│                                                                     │
│   LAYER 9: WORKFLOW LAYER                                           │
│   How multi-step processes execute. Orchestration.                  │
│   Documents: 20_Workflow_[Category]_[Name].md                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Authority Hierarchy

```
Layer 1 (Vision)
    governs ↓
Layer 2 (Principles)
    governs ↓
Layer 3 (Constitution)
    governs ↓
Layer 4 (Process)
    governs ↓
Layer 5 (Runtime)
    governs ↓
Layer 6 (Personas)       ← invoke →  Layer 8 (Skills)
    reference ↓                           reference ↓
Layer 7 (Knowledge)      ← reference ←  Layer 8 (Skills)
                         ← orchestrated by ← Layer 9 (Workflows)
```

### The Critical Layer Boundaries

Each layer has exactly one job. When a component absorbs the job of another layer, the architecture breaks. These boundaries are the most important design rules in AIOS:

| Layer | Its Job | What It Must NOT Do |
|-------|---------|-------------------|
| Knowledge (7) | Contain facts | Make recommendations |
| Skills (8) | Execute capabilities | Make persona-level decisions |
| Workflows (9) | Orchestrate sequences | Contain domain knowledge |
| Personas (6) | Apply judgment | Execute skill-level capabilities |

---

## 4. Repository Structure

```
AI-Advisor-OS/
│
├── README.md                          ← You are here. Start here.
├── Claude.md                          ← Runtime configuration for AI model
│
│── Foundation Documents (00–09)
│   ├── 01_AI_Vision.md                ← Layer 1: Mission and purpose
│   ├── 01_AI_Principles.md            ← Layer 2: 15 governing principles
│   ├── 02_AI_Decision_Framework.md    ← Layer 4: 12-stage decision process
│   ├── 03_AI_Context_Framework.md     ← Layer 4: Context assembly standard
│   ├── 04_AI_Constitution.md          ← Layer 3: Architecture and governance
│   ├── 05_AI_Persona_Template.md      ← Design standard for all Personas
│   ├── 06_AI_Knowledge_Standard.md    ← Design standard for all Knowledge docs
│   ├── 07_AI_Skill_Standard.md        ← Design standard for all Skills
│   ├── 08_AI_Workflow_Standard.md     ← Design standard for all Workflows
│   └── 09_AI_Architecture_Audit.md   ← Permanent governance audit standard
│
├── Personas/                          ← Layer 6 (prefix 10–19)
│   ├── 10_Persona_FinancialPlanner.md
│   ├── 10_Persona_TaxAdvisor.md
│   ├── 10_Persona_CMO.md
│   └── [additional personas]
│
├── Workflows/                         ← Layer 9 (prefix 20–29)
│   ├── 20_Workflow_Index.md           ← Master index of all Workflows
│   ├── 20_Workflow_FP_CompleteFinancialPlan.md
│   ├── 20_Workflow_Ops_ClientOnboarding.md
│   ├── 20_Workflow_Creative_ContentProduction.md
│   └── [additional workflows]
│
├── KnowledgeBase/                     ← Layer 7 (prefix 30–39)
│   ├── Core/
│   │   └── 30_KB_CO_BrandOS.md
│   ├── Business/
│   │   └── 30_KB_BU_CompetitiveLandscape.md
│   ├── Domain/
│   │   ├── 30_KB_DO_FinancialPlanningPrinciples.md
│   │   ├── 30_KB_DO_InsurancePrinciples.md
│   │   └── 30_KB_DO_TaxPlanningPrinciples.md
│   ├── Product/
│   │   ├── 30_KB_PR_SuperTax.md
│   │   ├── 30_KB_PR_GoodHealthPrime.md
│   │   └── 30_KB_PR_TokyoBeyond.md
│   ├── Customer/
│   │   ├── 30_KB_CU_SalarymanPremium.md
│   │   ├── 30_KB_CU_YoungProfessional.md
│   │   ├── 30_KB_CU_WorkingMom.md
│   │   └── 30_KB_CU_SMEOwner.md
│   ├── Regulatory/
│   │   ├── 30_KB_RE_ThaiIncomeTax[Year].md
│   │   └── 30_KB_RE_OICRegulations.md
│   └── Reference/
│       ├── 30_KB_RF_Glossary.md       ← Master glossary (mandatory)
│       └── 30_KB_RF_Index.md          ← Master KB index (mandatory)
│
├── Skills/                            ← Layer 8 (prefix 40–49)
│   ├── 40_Skill_Index.md              ← Master index of all Skills
│   ├── 40_Skill_Analysis_FinancialNeeds.md
│   ├── 40_Skill_Calculation_TaxLiability.md
│   ├── 40_Skill_Creation_SocialMediaContent.md
│   ├── 40_Skill_Review_FinancialPlan.md
│   └── [additional skills]
│
├── Templates/                         ← Reusable templates (prefix 50–59)
│   └── [template documents]
│
└── _archive/                          ← Deprecated documents (never deleted)
    └── [archived documents]
```

### Prefix Reference

| Prefix | Layer | Document Type |
|--------|-------|--------------|
| 00–09 | Foundation | Core architecture documents |
| 10–19 | Persona | AI Persona definitions |
| 20–29 | Workflow | Multi-step process definitions |
| 30–39 | Knowledge | Verified domain knowledge |
| 40–49 | Skill | Bounded executable capabilities |
| 50–59 | Template | Reusable document templates |
| 90–99 | Meta | Governance, audit records, indexes |

---

## 5. Core Documents

These are the eleven documents that constitute the Foundation Layer. Every other document in AIOS is governed by at least one of these. Read them in the order listed in Section 6.

| Document | Size | What It Defines | Read If You Are |
|----------|------|----------------|----------------|
| `01_AI_Vision.md` | ~5KB | Mission, purpose, target audience | Everyone — first |
| `01_AI_Principles.md` | ~40KB | 15 governing values with examples | Everyone |
| `02_AI_Decision_Framework.md` | ~48KB | 12-stage decision process | Personas, Workflow designers |
| `03_AI_Context_Framework.md` | ~57KB | How context is assembled and prioritized | Personas, Skill designers |
| `04_AI_Constitution.md` | ~62KB | 9-layer architecture, authority, governance | Architects, all contributors |
| `05_AI_Persona_Template.md` | ~49KB | Standard for designing Personas | Persona authors |
| `06_AI_Knowledge_Standard.md` | ~63KB | Standard for Knowledge documents | Knowledge contributors |
| `07_AI_Skill_Standard.md` | ~86KB | Standard for Skill documents | Skill designers |
| `08_AI_Workflow_Standard.md` | ~92KB | Standard for Workflow documents | Workflow designers |
| `09_AI_Architecture_Audit.md` | ~76KB | Permanent governance audit standard | Governance auditors |
| `Claude.md` | ~32KB | Runtime operational configuration | AI model, AI system designers |

**Total Foundation Layer: ~610KB of architectural specification**

---

## 6. Reading Order

### For Human Contributors — New to AIOS (15-minute orientation)

```
START HERE
    │
    ▼
01_AI_Vision.md           (~5 min)
    "What is this system trying to accomplish?"
    │
    ▼
01_AI_Principles.md       (~10 min: read Summary Table on last page first)
    "What values govern every decision?"
    │
    ▼
04_AI_Constitution.md     (~15 min: read Sections 1–3 and the Layer diagram)
    "How is the architecture organized?"
    │
    ▼
This README                (you are here — 5 min remaining)
    "How do I navigate the project?"
    │
    ▼
[The document most relevant to your contribution role — see Role Map below]
```

### Reading Map by Contribution Role

| Your Role | Read First | Read Second | Read Third |
|-----------|-----------|-------------|-----------|
| **Persona Author** | Foundation (above) | `05_AI_Persona_Template.md` | `02_AI_Decision_Framework.md` |
| **Knowledge Contributor** | Foundation (above) | `06_AI_Knowledge_Standard.md` | `03_AI_Context_Framework.md` |
| **Skill Designer** | Foundation (above) | `07_AI_Skill_Standard.md` | `06_AI_Knowledge_Standard.md` |
| **Workflow Designer** | Foundation (above) | `08_AI_Workflow_Standard.md` | `07_AI_Skill_Standard.md` |
| **Governance Auditor** | Full Foundation | `09_AI_Architecture_Audit.md` | All component types |
| **System Architect** | Full Foundation | All Standards | `09_AI_Architecture_Audit.md` |

### For AI Agents — Instantiation Reading Order

An AI agent being instantiated within AIOS must read in this exact order before any task:

```
Priority 1: 01_AI_Vision.md
Priority 2: 01_AI_Principles.md
Priority 3: 04_AI_Constitution.md
Priority 4: Claude.md (Runtime configuration)
Priority 5: Active Persona document (10_Persona_[Name].md)
Priority 6: Relevant Knowledge documents (30_KB_*.md) for the current task
Priority 7: Required Skill documents (40_Skill_*.md) as needed
Priority 8: Active Workflow document (20_Workflow_*.md) if executing a Workflow
```

No AI agent may skip Priority 1–4. No exceptions.

---

## 7. AI Development Lifecycle

The lifecycle of any AIOS component — Persona, Knowledge, Skill, or Workflow — follows these stages:

```
┌──────────────────────────────────────────────────────────────────┐
│                   AIOS COMPONENT LIFECYCLE                        │
│                                                                  │
│  IDENTIFY NEED                                                   │
│  "What capability, knowledge, or process is missing?"            │
│       ↓                                                          │
│  SELECT STANDARD                                                 │
│  "Which layer does this belong to? What standard governs it?"    │
│       ↓                                                          │
│  DRAFT                                                           │
│  "Use the template from the relevant standard document."         │
│       ↓                                                          │
│  BOUNDARY REVIEW                                                 │
│  "Does this component stay within its layer's boundary?"         │
│       ↓                                                          │
│  PRINCIPLES REVIEW                                               │
│  "Does this comply with all 15 Principles?"                      │
│       ↓                                                          │
│  HUMAN REVIEW (required for first activation)                    │
│  "Has a domain expert verified the content?"                     │
│       ↓                                                          │
│  ACTIVATE                                                        │
│  "Set Status: Active. Add to Index. Update dependencies."        │
│       ↓                                                          │
│  MAINTAIN                                                        │
│  "Review on schedule. Update when dependencies change."          │
│       ↓                                                          │
│  DEPRECATE → ARCHIVE (never delete)                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### The Development Decision Tree

When building something new for AIOS, start here:

```
What are you building?
        │
        ├── "It knows something" ────────────────→ Knowledge document (Layer 7)
        │                                           Standard: 06_AI_Knowledge_Standard.md
        │
        ├── "It does something specific" ─────────→ Skill document (Layer 8)
        │                                           Standard: 07_AI_Skill_Standard.md
        │
        ├── "It sequences multiple things" ─────────→ Workflow document (Layer 9)
        │                                           Standard: 08_AI_Workflow_Standard.md
        │
        ├── "It IS someone (role identity)" ────────→ Persona document (Layer 6)
        │                                           Standard: 05_AI_Persona_Template.md
        │
        └── "It governs something above" ──────────→ Foundation document (Layers 1–5)
                                                    Requires: Constitutional Amendment Process
```

---

## 8. Standards

AIOS uses a standards-first development approach. Before any new component is created, the relevant standard is read and the appropriate template is used. There are no freeform additions.

### The Five Design Standards

| Standard | Governs | Template Included | Key Sections |
|----------|---------|------------------|-------------|
| `05_AI_Persona_Template.md` | All Persona (Layer 6) documents | Yes — Part IV | P1–P10 (10 required sections) |
| `06_AI_Knowledge_Standard.md` | All Knowledge (Layer 7) documents | Yes — Part IX | K1–K13 (13 required sections) |
| `07_AI_Skill_Standard.md` | All Skill (Layer 8) documents | Yes — Part IX | S1–S17 (17 required sections) |
| `08_AI_Workflow_Standard.md` | All Workflow (Layer 9) documents | Yes — Part X | W1–W16 (16 required sections) |
| `09_AI_Architecture_Audit.md` | All audit and governance acts | Yes — Part X | Checklists A–E |

### Universal Document Requirements

Every document in AIOS — regardless of type — must satisfy these six requirements before activation (from `04_AI_Constitution.md`, Section 9):

```
C1  Constitutional acknowledgment — document acknowledges its layer and authority hierarchy
C2  Principles compliance — verified compliant with all 15 AI Principles
C3  Standard document format — mandatory header, headings, Version History, Scope
C4  Defined boundaries — explicit statement of what the document covers and does not cover
C5  Internal linking — all references use standard format: `[Document.md]`, Section [X]
C6  No knowledge duplication — references authoritative source; never copies it
```

---

## 9. Personas

Personas are Layer 6 of AIOS. A Persona is the AI's identity and judgment framework for a specific domain and role.

### What a Persona Is

A Persona defines:
- **Who the AI is** in this context (name, role, domain scope)
- **What it knows** (which Knowledge documents it draws upon)
- **How it decides** (Decision Framework calibration for its domain)
- **How it communicates** (tone, vocabulary, format)
- **Who it works with** (collaboration rules with other Personas, Skills, Workflows)

### What a Persona Is Not

A Persona does **not** contain domain knowledge (Layer 7), Skill execution steps (Layer 8), or Workflow orchestration (Layer 9). Persona scope creep is the most common architectural error in AI system design.

### Planned Personas

| Persona | Domain | Primary Workflows | Status |
|---------|--------|------------------|--------|
| Financial Planner AI | Holistic financial planning | Complete Financial Plan, Client Onboarding | Planned |
| Tax Advisor AI | Tax optimization, SuperTax planning | Tax Planning Workflow | Planned |
| CMO AI | Content creation, brand management | Content Production Workflow | Planned |
| Customer Success AI | Client intake, relationship management | Client Onboarding Workflow | Planned |
| Investment Advisor AI | Portfolio, unit-linked, FIRE planning | Investment Analysis Workflow | Planned |

### Design Standard

All Personas must comply with `05_AI_Persona_Template.md`. The standard requires 10 sections (P1–P10) and a 35-item quality checklist.

---

## 10. Knowledge

Knowledge is Layer 7 of AIOS. It contains the verified domain facts that AI Personas draw upon when forming advice.

### Knowledge Categories

| Category | Code | Contains | Review Cycle |
|----------|------|---------|-------------|
| Core Knowledge | CO | Organization identity, brand, history | Annual |
| Business Knowledge | BU | Business model, competitive landscape, SOPs | Annual/Quarterly |
| Domain Knowledge | DO | Financial planning, insurance, investment, tax principles | Annual |
| Product Knowledge | PR | SuperTax, Good Health Prime, Tokyo Beyond, Critical Illness | Annual + Event-driven |
| Customer Knowledge | CU | Persona profiles, segments, behaviors | Annual |
| Technical Knowledge | TE | Systems, platforms, architecture | Event-driven |
| Regulatory Knowledge | RE | Thai tax law, OIC regulations, compliance | Annual + Event-driven |
| Historical Knowledge | HI | Case studies, decisions, patterns | Append-only |
| Reference Knowledge | RF | Glossary, indexes, rate tables | Per domain |

### The Four Customer Personas (from Knowledge Layer)

| Persona | Age | Income | Primary Fear | Keyword |
|---------|-----|--------|-------------|---------|
| Salaryman Premium | 35–50 | ฿80K–฿300K/mo | Family unprotected if I'm gone | Protect Family |
| Young Professional | 28–35 | ฿80K–฿200K/mo | No plan for first ฿10M | Grow Wealth |
| Working Mom | 30–45 | Variable | Children lose their path | Protect Children |
| SME Owner | 35–55 | Variable | Business disrupted, estate chaos | Protect Business |

### Knowledge Quality Standard

Knowledge documents must satisfy five quality dimensions: Accuracy, Completeness, Consistency, Traceability, and Maintainability. Full detail in `06_AI_Knowledge_Standard.md`.

**Critical rule:** Knowledge documents contain facts — not recommendations. A Knowledge document that says "clients should be recommended X" has violated its layer boundary.

---

## 11. Skills

Skills are Layer 8 of AIOS. A Skill is a reusable, bounded, documented capability that executes a specific type of task.

### Skill Categories

| Category | What It Does | Characteristic Output |
|----------|-------------|----------------------|
| Analysis | Examines inputs, extracts insights | Findings, assessments, gap analyses |
| Planning | Builds structured forward plans | Plans, roadmaps, schedules |
| Creation | Produces new artifacts | Documents, content, proposals |
| Decision Support | Structures choices | Option matrices, comparisons |
| Calculation | Performs numerical operations | Figures, projections, IRR |
| Research | Retrieves and synthesizes information | Summaries, fact sets |
| Communication | Formats and adapts messages | Posts, emails, scripts |
| Automation | Executes repeatable operational steps | Completed actions, confirmations |
| Review | Evaluates artifacts against criteria | Assessments, scored rubrics |
| Validation | Checks conformance to rules | Pass/fail, compliance reports |
| Transformation | Converts content between forms | Reformatted outputs |

### Priority Skills for AIOS

| Skill | Category | Primary Knowledge | Primary Workflow |
|-------|----------|-----------------|-----------------|
| Financial Needs Analysis | Analysis | Financial Planning Principles | Complete Financial Plan |
| Tax Liability Calculator | Calculation | Thai Income Tax Regulations | Tax Planning Workflow |
| Social Media Content Creator | Creation | Brand OS, Customer Personas | Content Production Workflow |
| Product Comparison Matrix | Decision Support | Product Knowledge (all) | Product Selection Workflow |
| Financial Plan Review | Review | Financial Planning Principles | Complete Financial Plan |
| Principles Compliance Check | Validation | AI Principles | All Workflows |

### The Skill Boundary

Skills execute — they do not decide. A Skill that produces "the client should buy X" has exceeded its boundary and become a Persona function.

---

## 12. Workflows

Workflows are Layer 9 of AIOS. A Workflow is a documented, repeatable process that orchestrates Personas, Skills, and Knowledge to accomplish a defined multi-step objective.

### Workflow Categories

| Category | When to Use | Typical Duration |
|----------|------------|----------------|
| Operational | Recurring, structured business processes | Short–Medium |
| Analytical | Systematic multi-part examination | Medium |
| Creative | Artifact production with review cycles | Medium–Long |
| Decision Support | Structured evaluation of options | Medium |
| Customer Service | Client interaction from inquiry to resolution | Short–Medium |
| Research | Systematic information gathering | Medium–Long |
| Financial Planning | End-to-end client planning engagement | Long / Multi-session |
| Compliance | Verification before output delivery | Short–Medium |
| Automation | Scheduled, event-triggered processes | Short |

### Core Workflows

| Workflow | Category | Personas | Skills | Duration |
|----------|----------|---------|--------|---------|
| Client Onboarding | Operational | Customer Success, Financial Planner | Intake, Profile Structurer | Medium |
| Complete Financial Plan | Financial Planning | Financial Planner, Tax Advisor | Needs Analysis, Product Comparison, Plan Creator | Long |
| Content Production | Creative | CMO | Content Creator, Brand Reviewer | Medium |
| Recommendation Compliance Check | Compliance | All | Principles Check, Suitability Validation | Short |
| Knowledge Review Trigger | Automation | System | None | Short (automated) |

### Workflow Design Principles

Seven workflow patterns are available: Linear, Branching, Looping, Event-Driven, Approval-Based, Escalation, Review and Revision. Details in `08_AI_Workflow_Standard.md`.

**The orchestration rule:** Workflows own orchestration. Skills do not invoke other Skills. Personas do not sequence steps. The Workflow document is the single source of truth for how a multi-step process works.

---

## 13. Governance

AIOS is a governed system. Every structural change follows a defined process. No component is activated without human review. No Foundation document changes without documented human approval.

### Governance Principles

```
1. HUMAN AUTHORITY IS FINAL
   AI agents propose, analyze, and draft.
   Humans decide, approve, and sign off.
   No governance act is complete without human authorization.

2. EVERY CHANGE IS DOCUMENTED
   Every change to every document is logged in the document's Version History.
   Silent changes are not permissible.

3. FOUNDATION CHANGES REQUIRE CONSTITUTIONAL PROCESS
   Changes to Layers 1–3 (Vision, Principles, Constitution) require:
   a) A formal Change Proposal document
   b) An impact analysis of all downstream components
   c) Explicit human approval
   d) Simultaneous update of all affected documents

4. DEPRECATION BEFORE DELETION
   No document is ever deleted from AIOS.
   Documents are deprecated (use discouraged) then archived (moved to _archive/).
   The historical record is permanent.

5. SELF-AUDIT IS NOT GOVERNANCE
   An AI agent cannot audit its own components.
   An author cannot approve their own changes.
   Independence is required for all governance acts.
```

### Change Classification

| Change Type | Version Impact | Process Required |
|------------|---------------|-----------------|
| Typo or formatting correction | PATCH (X.Y.Z+1) | Direct edit; note in Version History |
| Content clarification (no meaning change) | PATCH | Edit with comment |
| Content addition (backwards compatible) | MINOR (X.Y+1.0) | Edit with justification |
| Structural or philosophical change | MAJOR (X+1.0.0) | Change Proposal document required |
| Change to Foundation documents | MAJOR | Human approval required |

### Governance Roles

| Role | Responsibility | Human Required |
|------|---------------|---------------|
| Knowledge Manager | Maintains Layer 7; schedules reviews | Yes |
| Capability Architect | Maintains Layer 8; manages Skill lifecycle | Yes |
| Process Architect | Maintains Layer 9; manages Workflow lifecycle | Yes |
| Chief AI Governance Auditor | Conducts and approves architecture audits | Yes |
| Approving Authority | Final approval for Foundation changes | Yes (senior leadership) |

---

## 14. Architecture Review

AIOS conducts formal architecture reviews on a defined schedule, governed by `09_AI_Architecture_Audit.md`.

### The Architecture Health Score

Every audit produces an **Architecture Health Score (AHS)** across 10 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|----------------|
| H1 Architecture Integrity | 15% | Layer boundary compliance |
| H2 Consistency | 12% | Cross-component coherence |
| H3 Maintainability | 10% | Update efficiency; single-source compliance |
| H4 Modularity | 10% | Component independence |
| H5 Knowledge Quality | 12% | Freshness, accuracy, coverage |
| H6 Workflow Quality | 10% | Completeness, exception handling |
| H7 Decision Quality | 10% | Decision Framework integration |
| H8 Governance | 10% | Process compliance; documentation |
| H9 Principles Compliance | 16% | All 15 Principles across all components |
| H10 Future Readiness | 5% | Scalability, index completeness |

**Score interpretation:**

| AHS | Status | Action |
|-----|--------|--------|
| 9.0–10.0 | Excellent | Standard maintenance |
| 8.0–8.9 | Good | Address findings in next cycle |
| 7.0–7.9 | Acceptable | Improvement plan within 30 days |
| 6.0–6.9 | Needs Attention | Immediate improvement plan |
| 5.0–5.9 | At Risk | Restrict use of affected components |
| < 5.0 | Critical | Suspend affected components; immediate human review |

### Audit Cadence

| Component Type | Standard Frequency | Also Triggered By |
|---------------|-------------------|-----------------|
| Foundation documents | Annual | Any Major version change |
| Personas | Annual | Principles change; domain change |
| Knowledge documents | Per Review Cycle field | Regulatory change; product update |
| Skills | Annual | Knowledge dependency update |
| Workflows | Annual | Component dependency change |

---

## 15. Versioning

AIOS uses **semantic versioning** across all documents.

```
MAJOR.MINOR.PATCH

MAJOR  Breaking change — downstream components may require updates
MINOR  Additive change — backwards compatible; new content added
PATCH  Correction only — no behavioral or meaning change
```

### Version Stability by Layer

```
Layer 1: Vision              ████░░░░░░  Very stable (years between MAJOR changes)
Layer 2: Principles          ████░░░░░░  Stable (only when foundational learning requires)
Layer 3: Constitution        █████░░░░░  Low-moderate (architecture evolves slowly)
Layer 4: Process             ██████░░░░  Moderate (improves with operational experience)
Layer 5: Runtime             ██████░░░░  Moderate (responds to AI model evolution)
Layer 6: Personas            ███████░░░  Variable (scope and calibration improve)
Layer 7: Knowledge           ████████░░  Frequent PATCH/MINOR (facts change; rates update)
Layer 8: Skills              ███████░░░  Moderate (capabilities improve; knowledge changes)
Layer 9: Workflows           ███████░░░  Moderate (processes improve with experience)
```

**Rule:** High version velocity in Foundation documents (Layers 1–3) is a governance warning signal — it indicates either poor initial design or insufficient stability in the organizational mission and values.

---

## 16. Roadmap

### Phase 1 — Foundation (Complete ✓)

The Foundation Layer is complete. All 10 architectural standards are in place.

| Document | Status | Version |
|----------|--------|---------|
| 01_AI_Vision.md | ✓ Active | 1.0 |
| 01_AI_Principles.md | ✓ Active | 1.0 |
| 02_AI_Decision_Framework.md | ✓ Active | 1.0 |
| 03_AI_Context_Framework.md | ✓ Active | 1.0 |
| 04_AI_Constitution.md | ✓ Active | 1.0 |
| 05_AI_Persona_Template.md | ✓ Active | 1.0 |
| 06_AI_Knowledge_Standard.md | ✓ Active | 1.0 |
| 07_AI_Skill_Standard.md | ✓ Active | 1.0 |
| 08_AI_Workflow_Standard.md | ✓ Active | 1.0 |
| 09_AI_Architecture_Audit.md | ✓ Active | 1.0 |
| Claude.md | ✓ Active | 1.0 |

---

### Phase 2 — Core Personas and Knowledge (Next)

Build the minimum viable operational layer that allows the Financial Planner Persona to serve a real client engagement end-to-end.

**Priority order:**

```
1. 30_KB_RF_Glossary.md               ← Define all AIOS terms (prerequisite for all KB)
2. 30_KB_DO_FinancialPlanningPrinciples.md
3. 30_KB_DO_InsurancePrinciples.md
4. 30_KB_RE_ThaiIncomeTax[Year].md
5. 30_KB_PR_SuperTax.md
6. 30_KB_PR_GoodHealthPrime.md
7. 30_KB_CU_SalarymanPremium.md       ← Primary target persona
8. 30_KB_CO_BrandOS.md                ← Brand identity and tone
9. 10_Persona_FinancialPlanner.md     ← First active Persona
10. 30_KB_RF_Index.md                 ← Index after initial KB population
```

---

### Phase 3 — Core Skills

Build the Skills required to execute the Financial Planner Persona's primary capability chain.

```
1. 40_Skill_Index.md                  ← Create index before adding Skills
2. 40_Skill_Validation_PrinciplesCompliance.md   ← Required by all Workflows
3. 40_Skill_Analysis_FinancialNeeds.md
4. 40_Skill_Calculation_TaxLiability.md
5. 40_Skill_Decision_ProductSelection.md
6. 40_Skill_Creation_FinancialPlanReport.md
7. 40_Skill_Review_FinancialPlan.md
```

---

### Phase 4 — Core Workflows

Build the Workflows that assemble the Phase 2 and Phase 3 components into complete client experiences.

```
1. 20_Workflow_Index.md               ← Create index before adding Workflows
2. 20_Workflow_Compliance_RecommendationCheck.md   ← Required before any client delivery
3. 20_Workflow_Ops_ClientOnboarding.md
4. 20_Workflow_FP_CompleteFinancialPlan.md
```

---

### Phase 5 — Expansion

After Phase 4 is operational and the first Architecture Audit is complete:

```
Additional Personas:    Tax Advisor AI, CMO AI, Customer Success AI, Investment Advisor AI
Additional Knowledge:   Remaining products, Regulatory updates, Market research
Additional Skills:      Content creation, Investment analysis, Competitor analysis
Additional Workflows:   Content Production, Tax Planning, Estate Planning
First Audit:            Full Architecture Audit per 09_AI_Architecture_Audit.md
```

---

## 17. Contribution Guide

### Before You Contribute

1. Read this README completely
2. Read `01_AI_Vision.md` and `01_AI_Principles.md`
3. Read the relevant standard for the layer you are contributing to
4. Confirm the component you are building does not already exist (check the relevant Index document)
5. Confirm the component belongs in the layer you intend (use the Development Decision Tree in Section 7)

### Creating a New Component

```
Step 1: Read the applicable standard
        Persona → 05_AI_Persona_Template.md
        Knowledge → 06_AI_Knowledge_Standard.md
        Skill → 07_AI_Skill_Standard.md
        Workflow → 08_AI_Workflow_Standard.md

Step 2: Copy the template from Part IX (or Part X) of the standard

Step 3: Complete every required section
        No section may be left blank without documented justification
        No section may be omitted from an Active document

Step 4: Conduct boundary review
        Does this component stay within its layer's boundary?
        The four critical boundaries are documented in the relevant standard

Step 5: Conduct Principles review
        Run through all 15 Principles in 01_AI_Principles.md
        Particularly: Principle 1, 2, 3, 14, 15

Step 6: Submit for human review
        All new components require human review before first activation
        This is Constitutional Compliance Requirement C7

Step 7: On activation:
        Set Status: Active
        Add to the relevant Index document
        Update any documents that should reference this component
        Set Effective Date and Last Reviewed to activation date
```

### Document Naming Rules

```
Use underscore (_) as separator — never hyphen or space
Use TitleCase for descriptors
Use zero-padded prefix: 01_, not 1_
Name must be self-explanatory without opening the file

Examples:
  ✓  30_KB_RE_ThaiIncomeTax2026.md
  ✗  tax-regulations.md
  ✗  30_KB_Tax.md (not descriptive enough)
  ✗  30_kb_thai_income_tax.md (not TitleCase)
```

### What Not to Do

```
✗  Do not add content to a document without updating its Version History
✗  Do not delete any document — deprecate and archive instead
✗  Do not duplicate content from another document — reference it
✗  Do not create a document without using the applicable template
✗  Do not embed recommendations in a Knowledge document
✗  Do not embed Knowledge (facts, rates) in a Skill document
✗  Do not activate a component without human review
✗  Do not change a Foundation document without the Constitutional Amendment Process
✗  Do not create a Skill that invokes another Skill (Workflow responsibility)
✗  Do not create a Workflow step without assigning it to a specific named Persona
```

---

## 18. Frequently Asked Questions

**Q: I want to add a new type of advice to the AI. Where do I start?**

Start by identifying what layer the addition belongs to. Is it a new fact or rule the AI needs to know? → Knowledge document. Is it a new repeatable capability? → Skill document. Is it a new multi-step process? → Workflow document. Is it a new role or domain identity? → Persona document. Use the Development Decision Tree in Section 7.

---

**Q: Can I modify an existing Persona document to add a new capability?**

Yes — with important constraints. Adding capabilities to a Persona is a MINOR version change and requires verifying that: (a) the new capability belongs in the Persona layer (not a Skill), (b) all required Knowledge and Skills for the new capability exist and are Active, and (c) the Principles review is re-conducted for the modified Persona. Update the Version History.

---

**Q: A Knowledge document is outdated. Can the AI update it automatically?**

No. Knowledge documents are updated by a human Knowledge Manager. AI agents may flag a document as requiring review (and should do so when they detect stale or potentially inaccurate content), but the update itself requires human verification. This is Constitutional Compliance Requirement C7 and Principle 3 (Truth Before Agreement).

---

**Q: Can I create a new AI Principle?**

Adding a new Principle to `01_AI_Principles.md` is a MAJOR change to a Layer 2 Foundation document. It requires the full Constitutional Amendment Process (Change Proposal → Impact Analysis → Principles Review → Human Approval → Implementation → Communication). This process exists because every new Principle affects every component in the system.

---

**Q: What happens when two Principles conflict?**

Principle 14 (Decision Hierarchy) defines the resolution order. The hierarchy is: Human Well-being (1) → Ethics (2) → Truth (3) → Long-Term Trust (4) → AI Vision (5) → Brand Integrity (6) → Customer Success (7) → Long-Term Business Value (8) → Revenue (9) → Speed (10) → Convenience (11). Higher levels always override lower levels.

---

**Q: Can a Skill invoke another Skill?**

No. This is Orchestration Principle O1 from `07_AI_Skill_Standard.md`: "Composition logic — which Skill to invoke, in what order, with what inputs — belongs in Workflows (Layer 9), not in Skills." A Skill that invokes another Skill has exceeded its layer boundary and must be redesigned as a Workflow.

---

**Q: How do I know if a Knowledge document is too old to use?**

Check the document's `Last Reviewed` date against its `Review Cycle` field. The freshness standards from `03_AI_Context_Framework.md` apply: documents reviewed within their cycle are Current (use directly); documents within 30 days of their review date are Aging (use with a note); documents past their review date are Stale (use with explicit caveat; flag for review). Documents confirmed as inaccurate are Outdated and must not be used.

---

**Q: A Workflow keeps failing at the same step. What should I do?**

First, check the exception handling definition for that step in the Workflow document. If the exception is not covered, that is a Medium Risk finding. Second, review the Step's assigned Skill — is the Skill's Required Knowledge current? Is the Skill itself within its review cycle? Third, if the pattern persists across multiple executions, file an Improvement Action (see `09_AI_Architecture_Audit.md`, Part VII). Recurring failures at a specific step are the primary signal for Workflow improvement.

---

**Q: Who has the authority to activate a new document?**

Every new document requires human review before activation (Constitutional Compliance Requirement C7). The human authority level depends on the layer: Foundation documents require senior leadership approval; Persona, Knowledge, Skill, and Workflow documents require the relevant role owner (Persona Architect, Knowledge Manager, Capability Architect, Process Architect respectively) plus the Governance Auditor.

---

## 19. Glossary

*For the complete AIOS Glossary, see `30_KB_RF_Glossary.md`. The terms below are the most essential for navigating this README.*

---

**Active Context Profile**  
The assembled set of context categories (from `03_AI_Context_Framework.md`) that an AI agent holds during a specific task execution. Built before every significant decision, maintained throughout a Workflow, transferred between Personas on handoff.

**AIOS (AI Operating System)**  
The complete 9-layer architectural system that governs how AI agents operate within the JIRAWAT brand. Includes all Foundation documents, Personas, Knowledge documents, Skills, and Workflows.

**Architecture Health Score (AHS)**  
A quantitative assessment of AIOS architecture quality, scored 0–10 across 10 dimensions. Produced at each formal architecture audit per `09_AI_Architecture_Audit.md`.

**Boundary Violation**  
When a component absorbs the responsibility of a different layer — e.g., a Knowledge document that contains a recommendation, or a Skill that performs Persona-level judgment. The most common architectural error in AIOS.

**Constitutional Amendment Process**  
The six-step process required to change Foundation documents (Layers 1–3): Proposal → Impact Analysis → Principles Review → Human Approval → Implementation → Communication. Defined in `04_AI_Constitution.md`.

**Core Context**  
The highest-priority context category: the AI Vision, Principles, Constitution, and Runtime configuration. Must be confirmed loaded before any AIOS task.

**Decision Gate**  
An explicit branch point in a Workflow where execution follows different paths based on a defined condition. All possible paths must be declared. Defined per `08_AI_Workflow_Standard.md`.

**Decision Hierarchy**  
Principle 14 of the AI Principles. The priority ordering for resolving Principle conflicts: Human Well-being (1) → Ethics (2) → Truth (3) → Long-Term Trust (4) → AI Vision (5) → Brand Integrity (6) → Customer Success (7) → Long-Term Business Value (8) → Revenue (9) → Speed (10) → Convenience (11).

**Domain Context**  
The Knowledge Base documents relevant to a specific task — the third priority category in the Context Framework. Checked for freshness before use.

**Family Wealth Journey™**  
The four-stage framework that defines how the JIRAWAT brand serves clients across their financial lifecycle: (1) Secure Yourself (25–35), (2) Build Your Family (30–45), (3) Grow Your Wealth (35–55), (4) Protect Your Legacy (50+).

**Foundation Layer**  
Layers 1–5 of AIOS: Vision, Principles, Constitution, Process (Decision + Context Frameworks), and Runtime. These documents govern all other documents. Prefixes 00–09 plus `Claude.md`.

**Human-in-the-Loop**  
A Workflow design pattern where execution pauses at defined checkpoints pending human review and approval before proceeding. Required for high-stakes outputs including financial plan delivery and compliance sign-off.

**Knowledge Manager**  
The human role responsible for maintaining the accuracy and currency of the Knowledge Base (Layer 7). Schedules reviews, executes updates, and resolves Knowledge gap flags raised by AI agents.

**Last Reviewed**  
A mandatory header field in every Knowledge document specifying the date the document's content was last verified against authoritative sources. Drives the freshness classification.

**Layer Boundary**  
The precise definition of what a component at each architectural layer is and is not responsible for. Boundary integrity is the primary maintainability and reliability property of AIOS.

**Persona**  
Layer 6 of AIOS. The AI's identity, role, domain scope, and judgment framework for a specific context. Analogous to a specialist professional (Financial Planner, Tax Advisor, CMO) rather than a generalist.

**Principles Compliance Check**  
A Validation Skill (`40_Skill_Validation_PrinciplesCompliance.md`) that verifies a proposed output against all 15 AI Principles before delivery. Required by the Compliance Workflow.

**Semantic Versioning**  
The MAJOR.MINOR.PATCH versioning system used across all AIOS documents. MAJOR: breaking change. MINOR: additive, backwards compatible. PATCH: correction only.

**Single Source of Truth**  
The principle that every fact, definition, or rule in AIOS exists in exactly one document. Other documents reference the authoritative source; they do not copy it. Violations create maintenance inconsistency.

**Skill**  
Layer 8 of AIOS. A reusable, bounded, documented capability that executes a specific type of task. Skills are tools, not agents — they are invoked by Personas within Workflows, not autonomous.

**Stale**  
A Knowledge document status indicating the document's Last Reviewed date is past its defined Review Cycle. Stale documents may be used with an explicit caveat but should be flagged for immediate review.

**Workflow**  
Layer 9 of AIOS. A documented, repeatable process that orchestrates Personas, Skills, and Knowledge to accomplish a defined multi-step objective. Workflows are the operational expression of the entire AIOS stack.

---

## Document Information

| Field | Value |
|-------|-------|
| **Document** | AIOS README — Official Project Entry Point |
| **Version** | 1.0 |
| **Effective Date** | 2026-06-25 |
| **Last Reviewed** | 2026-06-25 |
| **Status** | Active |
| **Authority** | Chief Documentation Architect |
| **Applies To** | All AIOS contributors — human and AI |

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | 2026-06-25 | Chief Documentation Architect | Initial README — 20 sections, complete architecture navigation, reading maps, development lifecycle, contribution guide, FAQ (9 items), glossary (21 terms) |

---

*This README is the primary entry point and navigation document for AIOS. It is governed by `04_AI_Constitution.md` and subordinate to `01_AI_Vision.md` and `01_AI_Principles.md`. All content in this document that conflicts with Foundation documents must be resolved in favor of the Foundation documents. This README should be updated whenever the Foundation Layer changes materially.*
