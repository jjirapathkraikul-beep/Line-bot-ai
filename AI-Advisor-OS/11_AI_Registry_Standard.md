# 11_AI_Registry_Standard.md
### Universal Registry and Metadata Specification — AIOS

**Version:** 1.0  
**Status:** Active  
**Document Type:** Architectural Specification  
**Layer:** Foundation — Discovery and Governance  
**Prefix:** 11  
**Created:** 2026-06-25  
**Scope:** All AIOS components across all layers, domains, and runtime environments

---

> *"A system that cannot discover its own components cannot grow. A system that cannot describe its own components cannot be trusted."*

---

## Document Hierarchy

This document occupies a unique position in the Foundation Layer. While documents 01–10 define what AIOS components are and how they behave, this document defines how they are found, described, related, and governed at scale.

| Priority | Document | This Document's Relationship |
|----------|----------|------------------------------|
| 1 | `01_AI_Vision.md` | All registered artifacts must trace back to Vision alignment |
| 2 | `01_AI_Principles.md` | Registry governance enforces Principles compliance as a registration requirement |
| 3 | `04_AI_Constitution.md` | Registry respects and enforces layer boundary rules from the Constitution |
| 4 | `02_AI_Decision_Framework.md` | Registry metadata informs Decision Framework stage: Gather Context |
| 5 | `03_AI_Context_Framework.md` | Registry is the primary source for Context assembly |
| 6 | `05_AI_Persona_Template.md` | Persona documents must comply with Persona Registry metadata schema |
| 7 | `06_AI_Knowledge_Standard.md` | Knowledge documents must comply with Knowledge Registry metadata schema |
| 8 | `07_AI_Skill_Standard.md` | Skill documents must comply with Skill Registry metadata schema |
| 9 | `08_AI_Workflow_Standard.md` | Workflow documents must comply with Workflow Registry metadata schema |
| 10 | `09_AI_Architecture_Audit.md` | Registry health is an auditable architecture dimension |
| 11 | `10_AI_Orchestrator_Spec.md` | Orchestrator consumes Registry at every routing step (S08–S11) |

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Registry Architecture](#2-registry-architecture)
3. [Universal Metadata Model](#3-universal-metadata-model)
4. [Artifact Metadata Templates](#4-artifact-metadata-templates)
5. [Routing Metadata](#5-routing-metadata)
6. [Discovery Protocol](#6-discovery-protocol)
7. [Registry Query Model](#7-registry-query-model)
8. [Registry Relationships](#8-registry-relationships)
9. [Registry Governance](#9-registry-governance)
10. [Registry Quality Standards](#10-registry-quality-standards)
11. [Registry Health Metrics](#11-registry-health-metrics)
12. [Registry Examples](#12-registry-examples)
13. [Migration Strategy](#13-migration-strategy)
14. [Metadata Templates](#14-metadata-templates)
15. [Future Evolution](#15-future-evolution)

---

## 1. Purpose

### Why AIOS Requires a Registry

As AIOS grows from a set of carefully authored Foundation documents into a living ecosystem of hundreds of Personas, thousands of Knowledge files, and thousands of Skills and Workflows, a fundamental problem emerges: discovery.

In a small system, humans can remember where things are. They can read the README, scan the folder, and find the right document. At scale — 500 Personas, 5,000 Knowledge files, 2,000 Skills, 2,000 Workflows, multiple runtimes, multiple domains — memory fails, navigation fails, and coherence fails. The Orchestrator cannot route accurately if it cannot discover reliably. Governance cannot be enforced if components cannot be consistently described. Audits cannot be complete if relationships cannot be traced.

**The Registry exists to solve the discovery and governance problem at any scale.**

It is the single, authoritative index of every AIOS artifact. It describes what every component is, what it depends on, how it should be routed, when it was last reviewed, and whether it is still current. Every component that exists in AIOS must be registered. Every component that is registered must be discoverable. Every component that is discoverable must be governable.

Without the Registry, AIOS is a collection of files. With the Registry, AIOS is an operating system.

### Defining the Registry Against Adjacent Systems

The Registry is frequently confused with other systems it resembles. These distinctions are critical.

| System | What It Contains | What It Does | How It Differs from the Registry |
|--------|------------------|--------------|----------------------------------|
| **Registry** | Metadata describing every AIOS artifact | Enables discovery, routing, dependency resolution, and governance | Contains descriptions of things, not the things themselves. The map, not the territory. |
| **Knowledge Base** | Factual domain content (tax rules, product specs, financial principles) | Provides facts for AI agents to reason with | Contains the content of Knowledge documents; Registry describes those documents |
| **Database** | Transactional or operational records (client data, CRM records) | Stores and retrieves changing business data | Contains business records; Registry contains architectural metadata |
| **Search Index** | Tokenized, inverted index of document text | Enables full-text search across document bodies | Enables finding text within documents; Registry enables finding the right document for a task |
| **Vector Database** | High-dimensional embeddings of text chunks | Enables semantic similarity search | Enables "find similar content"; Registry enables "find the component responsible for this capability" |
| **Runtime** | Active session configuration (Claude.md) | Governs how the AI model operates in a specific session | Contains operational rules; Registry contains component inventory and routing rules |
| **Orchestrator** | Routing logic, state machine, execution modes | Routes requests to the right components | Consumes Registry to make routing decisions; does not store component metadata |

### Why Registry Is the Discovery Layer

The Registry is distinct from all other layers precisely because it is **about** the other layers rather than **part** of them. It is the meta-layer — the layer that knows about all other layers, describes their contents, and makes their contents findable.

In the AIOS 9-layer architecture, the Registry operates as a horizontal governance service that touches every vertical layer:

```
┌──────────────────────────────────────────────────────────────┐
│                   AIOS LAYER ARCHITECTURE                    │
│                                                              │
│  Layer 1  Vision          ◀──┐                              │
│  Layer 2  Principles      ◀──┤                              │
│  Layer 3  Constitution    ◀──┤                              │
│  Layer 4  Decision FW     ◀──┤  REGISTRY                   │
│  Layer 5  Runtime         ◀──┤  (Discovery Layer)          │
│  Layer 6  Personas        ◀──┤                              │
│  Layer 7  Knowledge       ◀──┤  Indexes, describes,        │
│  Layer 8  Skills          ◀──┤  governs, and routes        │
│  Layer 9  Workflows       ◀──┘  all layers                 │
│                                                              │
│  The Registry is not in the stack.                          │
│  The Registry is what makes the stack navigable.            │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Registry Architecture

### Component Overview

The AIOS Registry is a federated architecture composed of seven specialized sub-registries, coordinated by a Master Registry Index. Each sub-registry manages one artifact type. The Master Registry Index provides cross-registry discovery, dependency resolution, and governance reporting.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AIOS REGISTRY ARCHITECTURE                        │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    MASTER REGISTRY INDEX                          │  │
│  │  • Cross-registry search           • Dependency graph            │  │
│  │  • Routing resolution              • Health score aggregation    │  │
│  │  • Conflict detection              • Governance reporting        │  │
│  └─────────────┬─────────────────────────────────────────┬──────────┘  │
│                │                                         │             │
│      ┌─────────┴──────────────────────────────┐         │             │
│      ▼                                        ▼         ▼             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ PERSONA  │  │KNOWLEDGE │  │  SKILL   │  │WORKFLOW  │              │
│  │REGISTRY  │  │REGISTRY  │  │REGISTRY  │  │REGISTRY  │              │
│  │          │  │          │  │          │  │          │              │
│  │Who is    │  │What is   │  │What can  │  │How work  │              │
│  │available │  │known     │  │be done   │  │flows     │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                             │
│  │RUNTIME   │  │ POLICY   │  │TEMPLATE  │                             │
│  │REGISTRY  │  │REGISTRY  │  │REGISTRY  │                             │
│  │          │  │          │  │          │                             │
│  │How AI    │  │What rules│  │Reusable  │                             │
│  │executes  │  │govern    │  │structures│                             │
│  └──────────┘  └──────────┘  └──────────┘                             │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    REGISTRY SERVICES                              │  │
│  │  • Discovery Service    • Dependency Resolver   • Health Monitor  │  │
│  │  • Routing Advisor      • Conflict Detector     • Audit Reporter  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Seven Sub-Registries

#### 2.1 — Persona Registry

**Purpose:** Indexes all AI Persona definitions in AIOS. Enables the Orchestrator to discover which Persona is authorized to handle a specific intent, domain, and risk level.

**Indexed artifacts:** All documents with prefix `10–19` matching `1X_Persona_[Name].md`

**Key metadata:** authorized_domains, authorized_intents, risk_ceiling, communication_style, authorized_skills, excluded_topics

**Interaction with AIOS:** The Orchestrator queries the Persona Registry at State S08 (Select Persona). The Context Framework queries it to assemble Persona context. The Audit Standard measures Persona Registry completeness as a governance dimension.

**Scale target:** 500+ Personas across all business domains and specializations

#### 2.2 — Knowledge Registry

**Purpose:** Indexes all Knowledge Base documents. Enables the Orchestrator to find the correct domain knowledge, verify its freshness, and assemble the minimum required context for each request.

**Indexed artifacts:** All documents with prefix `30–39` matching `30_KB_[Category]_[Domain].md`

**Key metadata:** knowledge_category (CO/BU/DO/PR/CU/TE/RE/HI/RF), domain, freshness_threshold, last_reviewed, knowledge_level (foundational/operational/reference), authoritative_source

**Interaction with AIOS:** Orchestrator queries at S09 (Select Knowledge). Context Framework uses it to assemble Domain Context layer. Audit Standard tracks stale Knowledge as a governance risk.

**Scale target:** 5,000+ Knowledge files across all domains, products, regulations, and markets

#### 2.3 — Skill Registry

**Purpose:** Indexes all executable Skill definitions. Enables the Orchestrator to identify which Skills can be invoked for a given capability need, verify preconditions, and determine composition patterns.

**Indexed artifacts:** All documents with prefix `40–49` matching `40_Skill_[Category]_[Name].md`

**Key metadata:** skill_category (AN/PL/CR/DS/CA/RE/CO/AU/RV/VA/TR), capabilities, required_inputs, output_types, composition_pattern, estimated_tokens, success_criteria_summary

**Interaction with AIOS:** Orchestrator queries at S10 (Select Skill). Workflow documents reference it for step definitions. Audit Standard measures Skill coverage against identified capability gaps.

**Scale target:** 2,000+ Skills across all domains and specializations

#### 2.4 — Workflow Registry

**Purpose:** Indexes all Workflow definitions. Enables the Orchestrator to identify which Workflow should be triggered for a multi-step task, verify trigger conditions, and determine execution dependencies.

**Indexed artifacts:** All documents with prefix `20–29` matching `20_Workflow_[Category]_[Name].md`

**Key metadata:** workflow_category, trigger_conditions, required_personas, required_skills, required_knowledge, estimated_duration, output_type, human_gates

**Interaction with AIOS:** Orchestrator queries at S11 (Select Workflow). Audit Standard measures Workflow Registry coverage against operational processes.

**Scale target:** 2,000+ Workflows across all operational, analytical, and creative process types

#### 2.5 — Runtime Registry

**Purpose:** Indexes all runtime configuration profiles. Enables multi-model, multi-environment deployments of AIOS where different AI models and deployment contexts require different operating configurations.

**Indexed artifacts:** All runtime configuration documents (`Claude.md` and future equivalents)

**Key metadata:** model_name, model_provider, capabilities, context_window, supported_modes, tool_access, deployment_environment, performance_profile

**Interaction with AIOS:** Orchestrator uses it to select the appropriate runtime for a task. Architecture Audit measures runtime coverage and compatibility.

**Scale target:** Multiple AI runtimes across providers and deployment environments

#### 2.6 — Policy Registry

**Purpose:** Indexes all governance policies, compliance rules, and behavioral constraints. Enables the Orchestrator and all components to discover applicable policies for a given domain, risk level, or artifact type.

**Indexed artifacts:** All policy documents matching `9X_Policy_[Domain]_[Name].md`

**Key metadata:** policy_scope, applies_to_artifact_types, applies_to_domains, risk_levels_governed, enforcement_level (mandatory/recommended/optional), regulatory_basis

**Interaction with AIOS:** Orchestrator applies Policy Registry at S14 (Safety Check). Audit Standard uses Policy Registry to verify compliance coverage.

**Scale target:** 200+ policies governing all domains, risk levels, and artifact types

#### 2.7 — Template Registry

**Purpose:** Indexes all reusable document and prompt templates. Enables consistent, governed creation of new AIOS artifacts.

**Indexed artifacts:** All template documents with prefix `50–59` matching `50_Template_[Type]_[Name].md`

**Key metadata:** template_type (document/prompt/workflow-step/response-format), produces_artifact_type, mandatory_sections, optional_sections, version

**Interaction with AIOS:** Knowledge authors, Skill designers, and Workflow architects use the Template Registry to find the appropriate starting template.

**Scale target:** 100+ templates covering all artifact types and common use cases

### Master Registry Index

The Master Registry Index is the single entry point for all cross-registry queries. It maintains:

- **Artifact inventory:** Count and status of all registered artifacts by type
- **Dependency graph:** Full directed graph of inter-artifact dependencies
- **Routing index:** Pre-computed routing table for common intent + domain + risk combinations
- **Health dashboard:** Aggregate health metrics from all sub-registries
- **Conflict log:** Active conflicts, duplicates, and broken dependencies

The Master Registry Index corresponds to the file `90_Registry_Index.md` in the Meta prefix range (90–99).

---

## 3. Universal Metadata Model

### Architecture Overview

Every registered AIOS artifact carries metadata organized into five layers. The layers progress from identity (what is this?) through classification (what is it for?), dependencies (what does it need?), execution (how does it run?), and governance (how is it managed?).

```
┌─────────────────────────────────────────────────────────┐
│              UNIVERSAL METADATA MODEL                   │
│                                                         │
│  Layer 1: IDENTITY          Who am I?                  │
│  ─────────────────────────────────────────────────────  │
│  Layer 2: CLASSIFICATION    What do I do and for whom? │
│  ─────────────────────────────────────────────────────  │
│  Layer 3: DEPENDENCIES      What do I need?            │
│  ─────────────────────────────────────────────────────  │
│  Layer 4: EXECUTION         How do I run?              │
│  ─────────────────────────────────────────────────────  │
│  Layer 5: GOVERNANCE        How am I managed?          │
└─────────────────────────────────────────────────────────┘
```

---

### Layer 1 — Identity

These fields uniquely identify an artifact and provide the minimum information needed to recognize it.

---

#### `id`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Human-readable, stable identifier for this artifact within AIOS. Used in cross-references, routing rules, and dependency declarations. |
| **Type** | String |
| **Required** | Yes |
| **Format** | `[prefix]_[ArtifactType]_[Domain]_[Name]` — mirroring the file naming convention from `README.md` |
| **Example** | `40_Skill_CA_TaxCalculator`, `10_Persona_FinancialPlanner`, `30_KB_RE_TaxThailand2026` |
| **Validation** | Must match the document filename (without `.md`). Must be unique across the Registry. Must conform to the AIOS naming convention: digits, underscores, and PascalCase only. No spaces. |
| **Mutability** | Immutable once registered. Renaming an artifact creates a new registration; the old ID is deprecated. |

---

#### `uuid`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Machine-generated, globally unique identifier. Stable even if the artifact is renamed. Used by automated systems, version control, and future database implementations. |
| **Type** | String (UUID v4 format) |
| **Required** | Yes |
| **Format** | Standard UUID: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| **Example** | `a3f9b2c1-4d5e-4a6f-b7c8-d9e0f1a2b3c4` |
| **Validation** | Must be globally unique. Generated at registration. Never reused, even after deprecation. |
| **Mutability** | Immutable. Persists through renames, version changes, and status changes. |

---

#### `name`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Short, human-readable artifact name. Used in UI displays, log outputs, and audit reports. |
| **Type** | String |
| **Required** | Yes |
| **Max Length** | 60 characters |
| **Example** | `Tax Liability Calculator`, `Financial Planner`, `Thai Income Tax 2026` |
| **Validation** | Must be unique within its artifact type. Title case. No technical codes or IDs. Written in the primary communication language of the artifact. |

---

#### `title`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Full descriptive title, including artifact type context. Used in formal documentation and registry listings. |
| **Type** | String |
| **Required** | Yes |
| **Max Length** | 120 characters |
| **Example** | `Tax Liability Calculator — Financial Planning Skill`, `Thai Financial Planner — Core Persona`, `Thai Income Tax Deductions 2026 — Regulatory Knowledge` |
| **Validation** | Must follow format: `[Name] — [ArtifactType]`. Must clearly convey what the artifact does and what type it is. |

---

#### `description`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Concise explanation of what this artifact is, what problem it solves, and when to use it. This is the primary text the Orchestrator and human authors read during discovery. |
| **Type** | String |
| **Required** | Yes |
| **Length** | 100–500 characters |
| **Example** | `Calculates Thai personal income tax liability for a given fiscal year, generating three comparison scenarios: no optimization, partial optimization, full optimization. Outputs a structured tax position report.` |
| **Validation** | Must answer: What does it do? When should I use it? What does it produce? Must not contain implementation details. Must be written so an AI agent reading only this field would know whether to select this artifact. |

---

#### `artifact_type`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Identifies which Registry this artifact belongs to and which schema governs its metadata. |
| **Type** | Enum |
| **Required** | Yes |
| **Allowed Values** | `Persona`, `Knowledge`, `Skill`, `Workflow`, `Runtime`, `Policy`, `Template` |
| **Example** | `Skill` |
| **Validation** | Must match the sub-registry the artifact is registered in. Must align with the document prefix range. |

---

#### `version`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Semantic version of this artifact. Enables controlled updates, compatibility tracking, and rollback. |
| **Type** | String |
| **Required** | Yes |
| **Format** | MAJOR.MINOR.PATCH following semantic versioning convention defined in `04_AI_Constitution.md` |
| **Example** | `1.0.0`, `2.3.1` |
| **Validation** | MAJOR: incremented on breaking changes (incompatible with prior dependents). MINOR: new capability, backwards compatible. PATCH: bug fix or clarification, no behavioral change. Must be incremented on every registered update. |

---

#### `status`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lifecycle stage of the artifact. Governs whether the artifact may be used by the Orchestrator in production. |
| **Type** | Enum |
| **Required** | Yes |
| **Allowed Values** | `Draft`, `Review`, `Active`, `Improved`, `Stale`, `Deprecated`, `Retired`, `Archived` |
| **Routing Rule** | Only `Active` artifacts may be selected by the Orchestrator for production requests. `Stale` artifacts may be loaded with caveat. `Deprecated`, `Retired`, and `Archived` artifacts must not be loaded. |
| **Example** | `Active` |

---

#### `owner`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Identifies the human or team responsible for this artifact's accuracy, currency, and governance. |
| **Type** | String |
| **Required** | Yes |
| **Example** | `Chief Knowledge Architect`, `Financial Planning Team`, `จิราวัฒน์` |
| **Validation** | Must be a named individual or team, not a generic role like "Admin". Must be contactable for review requests. |

---

### Layer 2 — Classification

These fields describe what the artifact does and for whom, enabling intent-based and domain-based discovery.

---

#### `domain`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary business domain this artifact serves. Maps to the Domain Taxonomy in `10_AI_Orchestrator_Spec.md`. |
| **Type** | Enum (single value) or Array (multiple values) |
| **Required** | Yes |
| **Allowed Values** | `D-FIN` (Personal Finance), `D-INS` (Insurance), `D-TAX` (Tax), `D-INV` (Investment), `D-MKT` (Marketing), `D-SAL` (Sales), `D-CRM` (CRM), `D-BIZ` (Business), `D-TEC` (Technology), `D-LEG` (Legal/Compliance), `D-PRD` (Productivity), `D-GEN` (General) |
| **Example** | `D-TAX` or `["D-TAX", "D-FIN"]` |
| **Validation** | At least one domain required. Multi-domain artifacts must justify each domain. |

---

#### `subdomain`

| Attribute | Value |
|-----------|-------|
| **Purpose** | More granular classification within the primary domain. Enables precise routing for specialized requests. |
| **Type** | String or Array |
| **Required** | Optional |
| **Example** | `personal_income_tax`, `whole_life_insurance`, `equity_investment`, `facebook_content` |
| **Validation** | Free text; should use lowercase with underscores. Should be consistent across artifacts in the same domain. |

---

#### `business_area`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Maps this artifact to a specific area of the AIOS business model. Enables business-impact reporting and prioritization. |
| **Type** | Enum |
| **Required** | Optional |
| **Allowed Values** | `client_advisory`, `content_creation`, `business_development`, `compliance`, `internal_operations`, `system_architecture` |
| **Example** | `client_advisory` |

---

#### `persona`

| Attribute | Value |
|-----------|-------|
| **Purpose** | For non-Persona artifacts: identifies which Persona(s) are authorized to use this artifact. For Persona artifacts: self-referential identifier. |
| **Type** | Array of Persona IDs |
| **Required** | Yes for Skills; Optional for Knowledge and Workflows |
| **Example** | `["10_Persona_FinancialPlanner", "10_Persona_TaxAdvisor"]` |
| **Validation** | All referenced Persona IDs must exist in the Persona Registry with status `Active`. |

---

#### `capabilities`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Describes what this artifact can do, expressed as a list of capability verbs. Enables capability-based discovery independent of artifact name. |
| **Type** | Array of strings |
| **Required** | Yes for Skills and Workflows; Recommended for Personas |
| **Example** | `["calculate_tax_liability", "compare_deduction_scenarios", "generate_tax_position_report"]` |
| **Validation** | Each capability should be a verb phrase. No more than 10 per artifact. Should be specific enough to distinguish from similar artifacts. |

---

#### `intent`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Maps this artifact to the Intent Taxonomy from `10_AI_Orchestrator_Spec.md`. Enables intent-based routing. |
| **Type** | Array of Intent Codes |
| **Required** | Yes for Skills and Workflows; Recommended for Personas |
| **Allowed Values** | A1–A5, B1–B5, C1–C6, D1–D5, E1–E5, F1–F4, G1–G5, H1–H4 |
| **Example** | `["E1", "B3"]` |
| **Validation** | Must reference valid codes from the Intent Taxonomy. |

---

#### `tags`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Free-form keywords for search and filtering. Supplements structured classification. |
| **Type** | Array of strings |
| **Required** | Optional |
| **Example** | `["SuperTax", "ลดหย่อนภาษี", "2026", "พนักงานประจำ"]` |
| **Validation** | May include Thai-language terms. No maximum count. Should not duplicate domain or capability fields. |

---

#### `language`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary language this artifact is authored in and designed to operate with. |
| **Type** | Array of ISO 639-1 codes |
| **Required** | Yes |
| **Allowed Values** | `th` (Thai), `en` (English), `th-en` (Thai-English mixed) |
| **Example** | `["th-en"]` |
| **Validation** | Must accurately reflect the languages present in the artifact. |

---

#### `audience`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Identifies the target customer persona(s) this artifact is designed to serve. Maps to the four AIOS customer personas. |
| **Type** | Array of strings |
| **Required** | Optional |
| **Allowed Values** | `salaryman_premium`, `young_professional`, `working_mom`, `sme_owner`, `all`, `internal` |
| **Example** | `["salaryman_premium", "working_mom"]` |
| **Validation** | `internal` indicates the artifact is used by AIOS internal processes only, not client-facing. |

---

### Layer 3 — Dependencies

These fields describe what other artifacts this artifact requires to function. They enable dependency resolution and impact analysis.

---

#### `required_personas`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists Persona IDs that must be active when this artifact is executed. For Workflows: which Personas must be available. |
| **Type** | Array of Persona IDs |
| **Required** | Yes for Workflows; Optional for Skills |
| **Example** | `["10_Persona_FinancialPlanner", "10_Persona_TaxAdvisor"]` |
| **Validation** | All IDs must exist in Persona Registry with status `Active`. Circular dependencies not allowed. |

---

#### `required_knowledge`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists Knowledge document IDs that must be loaded before this artifact can execute correctly. |
| **Type** | Array of Knowledge IDs |
| **Required** | Yes if artifact depends on specific domain facts |
| **Example** | `["30_KB_RE_TaxThailand2026", "30_KB_PR_SuperTax"]` |
| **Validation** | All IDs must exist in Knowledge Registry. Status check required at execution time: if any required Knowledge is `Stale`, execution proceeds with caveat; if `Deprecated` or `Retired`, execution is blocked. |

---

#### `required_skills`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists Skill IDs that this artifact invokes. For Workflows: Skills called within workflow steps. |
| **Type** | Array of Skill IDs |
| **Required** | Yes for Workflows that invoke Skills |
| **Example** | `["40_Skill_CA_TaxCalculator", "40_Skill_AN_FinancialNeedsAnalysis"]` |
| **Validation** | All IDs must exist in Skill Registry with status `Active`. Skills with status `Deprecated` or `Retired` block execution. |

---

#### `required_workflows`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists Workflow IDs that this artifact depends on or can invoke as a sub-workflow. |
| **Type** | Array of Workflow IDs |
| **Required** | Optional |
| **Example** | `["20_Workflow_CP_ComplianceCheck"]` |
| **Validation** | Circular Workflow dependencies are not allowed and will fail Registry validation. |

---

#### `runtime`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Identifies which Runtime configuration(s) this artifact is compatible with. |
| **Type** | Array of Runtime IDs |
| **Required** | Recommended |
| **Example** | `["RT_Claude_Sonnet", "RT_Claude_Opus"]` |
| **Validation** | `null` indicates compatibility with all registered runtimes. |

---

#### `external_tools`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists external systems, APIs, or tools this artifact requires that are outside AIOS. |
| **Type** | Array of strings |
| **Required** | Yes if external tools are required |
| **Example** | `["CRM_API", "LINE_OA_Webhook", "Google_Calendar_API"]` |
| **Validation** | External tools are dependencies outside AIOS governance. Their availability must be verified at execution time. Unavailability triggers fallback. |

---

#### `parent`

| Attribute | Value |
|-----------|-------|
| **Purpose** | References the artifact this was derived from. Establishes version lineage and template inheritance. |
| **Type** | Artifact ID (string) or null |
| **Required** | Optional |
| **Example** | `"40_Skill_CA_TaxCalculator_v1"` (if this is a specialization) |
| **Validation** | Must exist in Registry if provided. |

---

#### `children`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists artifacts that were derived from this one. Enables impact analysis when updating. |
| **Type** | Array of Artifact IDs |
| **Required** | Optional; maintained by Registry automatically |
| **Example** | `["40_Skill_CA_TaxCalculator_Corporate", "40_Skill_CA_TaxCalculator_Individual"]` |

---

#### `related_artifacts`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Non-dependency relationships — artifacts that are thematically or operationally related but not required. |
| **Type** | Array of Artifact IDs |
| **Required** | Optional |
| **Example** | `["30_KB_RE_TaxThailand2025", "40_Skill_PL_TaxPlanningStrategy"]` |

---

### Layer 4 — Execution

These fields govern how the Orchestrator selects and executes this artifact.

---

#### `risk_level`

| Attribute | Value |
|-----------|-------|
| **Purpose** | The minimum risk level at which this artifact should be invoked. Artifacts with higher inherent risk trigger enhanced review and context requirements. |
| **Type** | Enum |
| **Required** | Yes |
| **Allowed Values** | `Low`, `Medium`, `High`, `Critical` |
| **Example** | `High` (for a specific financial recommendation Skill) |
| **Validation** | Must align with the risk assessment in the artifact's own document. |

---

#### `execution_mode`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Preferred execution mode from `10_AI_Orchestrator_Spec.md`. Guides the Orchestrator on how to invoke this artifact. |
| **Type** | Enum |
| **Required** | Yes for Skills and Workflows |
| **Allowed Values** | `Mode1_DirectAnswer`, `Mode2_PersonaLed`, `Mode3_SkillExecution`, `Mode4_WorkflowExecution`, `Mode5_MultiPersona`, `Mode6_HumanInLoop`, `Mode7_Escalation` |
| **Example** | `Mode3_SkillExecution` |

---

#### `confidence_required`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Minimum AI confidence level required to proceed without escalation. |
| **Type** | Float (0.0 to 1.0) |
| **Required** | Optional |
| **Example** | `0.85` |
| **Validation** | If AI confidence in its output falls below this threshold, the artifact's fallback strategy is triggered. |

---

#### `requires_review`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Whether this artifact's output requires human review before delivery to the end user. |
| **Type** | Boolean |
| **Required** | Yes |
| **Example** | `true` (for any artifact producing client-facing proposals or recommendations) |

---

#### `requires_clarification`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Whether this artifact typically requires the Orchestrator to ask a clarifying question before invocation. |
| **Type** | Boolean |
| **Required** | Yes |
| **Example** | `true` (if the artifact needs client-specific data not present in a typical initial request) |

---

#### `estimated_tokens`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Approximate token consumption for executing this artifact. Enables context budget management. |
| **Type** | Integer |
| **Required** | Optional |
| **Example** | `2500` |
| **Validation** | Used for context window planning in multi-component tasks. Not a hard limit. |

---

#### `estimated_latency`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Expected execution time in seconds. Enables SLA planning and user expectation setting. |
| **Type** | Integer (seconds) |
| **Required** | Optional |
| **Example** | `15` |

---

#### `priority`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Routing priority when multiple artifacts match a query. Higher priority artifacts are selected first. |
| **Type** | Integer (1–100) |
| **Required** | Yes |
| **Default** | `50` |
| **Example** | `80` (higher priority — prefer this artifact when multiple candidates match) |
| **Validation** | Priority 80–100: system-critical; 60–79: primary production; 40–59: standard; 20–39: supplementary; 1–19: experimental or fallback only |

---

### Layer 5 — Governance

These fields manage the lifecycle, quality, and compliance of the artifact.

---

#### `approval_status`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Tracks the approval state through the registration process. Only `Approved` artifacts may have status `Active`. |
| **Type** | Enum |
| **Required** | Yes |
| **Allowed Values** | `Pending`, `UnderReview`, `Approved`, `Rejected`, `ConditionalApproval` |
| **Example** | `Approved` |

---

#### `quality_score`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Numerical quality assessment produced during review. Corresponds to the Registry Quality Standards in Section 10. |
| **Type** | Float (0.0 to 10.0) |
| **Required** | Yes (set during review; 0.0 before first review) |
| **Threshold** | Artifacts with quality_score below 6.0 may not be set to `Active` status. |
| **Example** | `8.5` |

---

#### `review_frequency`

| Attribute | Value |
|-----------|-------|
| **Purpose** | How often this artifact must be reviewed for currency and accuracy. |
| **Type** | Enum |
| **Required** | Yes |
| **Allowed Values** | `monthly`, `quarterly`, `semi-annual`, `annual`, `on-change-trigger` |
| **Example** | `annual` (for stable Domain Knowledge); `monthly` (for rapidly changing Regulatory Knowledge) |
| **Default by Type** | Knowledge (regulatory): `quarterly`; Knowledge (domain): `annual`; Skills: `semi-annual`; Workflows: `annual`; Personas: `annual` |

---

#### `review_owner`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Who is responsible for conducting the next scheduled review. |
| **Type** | String |
| **Required** | Yes |
| **Example** | `Chief Knowledge Architect`, `Tax Domain Lead` |

---

#### `last_review`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Date of the most recent review that confirmed this artifact is current and accurate. |
| **Type** | Date (ISO 8601: YYYY-MM-DD) |
| **Required** | Yes |
| **Example** | `2026-06-25` |
| **Validation** | If `last_review` + `review_frequency` < today → artifact status should be set to `Stale`. |

---

#### `next_review`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Scheduled date for the next review. Automatically computed from `last_review` + `review_frequency`. |
| **Type** | Date (ISO 8601) |
| **Required** | Yes |
| **Example** | `2027-06-25` |

---

#### `deprecated`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Whether this artifact has been officially deprecated. |
| **Type** | Boolean |
| **Required** | Yes |
| **Default** | `false` |
| **Validation** | If `true`, `replacement` must be populated. Deprecated artifacts must not be loaded in production. |

---

#### `replacement`

| Attribute | Value |
|-----------|-------|
| **Purpose** | ID of the artifact that replaces this one when deprecated. |
| **Type** | Artifact ID (string) or null |
| **Required** | Required if `deprecated: true` |
| **Example** | `"30_KB_RE_TaxThailand2027"` |

---

#### `compliance`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lists compliance requirements or regulatory standards this artifact addresses or must conform to. |
| **Type** | Array of strings |
| **Required** | Optional |
| **Example** | `["TLAA_2535", "PDPA_2562", "SEC_Investment_Advisor_Rules"]` |
| **Validation** | Must reference valid Policy Registry entries where available. |

---

## 4. Artifact Metadata Templates

### 4.1 — Persona Metadata Template

```yaml
# AIOS Registry — Persona Metadata
# Schema Version: 1.0

identity:
  id: "10_Persona_FinancialPlanner"
  uuid: "a3f9b2c1-4d5e-4a6f-b7c8-d9e0f1a2b3c4"
  name: "Financial Planner"
  title: "Thai Family Financial Planner — Core Persona"
  description: >
    Primary client-facing Persona for personal financial planning, insurance advisory,
    and family wealth strategy. Authorized for D-FIN, D-INS, and integrated D-TAX
    financial planning. Communicates in warm, professional Thai-English style.
    Uses the Family Wealth Journey™ framework.
  artifact_type: "Persona"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Persona Architect"

classification:
  domain: ["D-FIN", "D-INS", "D-TAX"]
  subdomain: ["personal_financial_planning", "insurance_advisory", "family_wealth"]
  business_area: "client_advisory"
  capabilities:
    - "conduct_financial_needs_analysis"
    - "recommend_insurance_coverage"
    - "advise_on_tax_reduction_strategies"
    - "build_family_wealth_plan"
    - "explain_financial_concepts"
    - "qualify_client_goals"
  intent: ["B1", "B2", "B3", "C1", "C3", "E2", "G3"]
  tags: ["ครอบครัว", "วางแผนการเงิน", "ประกันชีวิต", "Family Wealth Journey"]
  language: ["th-en"]
  audience: ["salaryman_premium", "working_mom", "young_professional"]

dependencies:
  required_knowledge:
    - "30_KB_CO_BrandOS"
    - "30_KB_DO_FinancialPlanningPrinciples"
    - "30_KB_PR_GoodHealthPrime"
    - "30_KB_PR_SuperTax"
    - "30_KB_CU_SalarymanPremium"
  required_skills: []  # Persona selects skills at runtime based on task
  runtime: ["RT_Claude_Sonnet", "RT_Claude_Opus"]
  external_tools: []

execution:
  risk_level: "High"
  execution_mode: "Mode2_PersonaLed"
  confidence_required: 0.85
  requires_review: true
  requires_clarification: true
  estimated_tokens: 3000
  priority: 90

governance:
  approval_status: "Approved"
  quality_score: 9.0
  review_frequency: "annual"
  review_owner: "Chief Persona Architect"
  last_review: "2026-06-25"
  next_review: "2027-06-25"
  deprecated: false
  replacement: null
  compliance: []

routing_rules:
  if_intent: ["B1", "B2", "B3", "C1", "C3"]
  if_domain: ["D-FIN", "D-INS"]
  if_risk: ["Medium", "High"]
  priority: 90
  fallback_strategy: "escalate_to_human_review"
```

---

### 4.2 — Knowledge Metadata Template

```yaml
# AIOS Registry — Knowledge Metadata
# Schema Version: 1.0

identity:
  id: "30_KB_RE_TaxThailand2026"
  uuid: "b4e8c3d2-5e6f-4b7a-c8d9-e0f1a2b3c4d5"
  name: "Thai Income Tax 2026"
  title: "Thai Personal Income Tax — Regulatory Knowledge 2026"
  description: >
    Authoritative reference for Thai personal income tax rates, brackets, allowable
    deductions, and contribution limits for fiscal year 2026. Covers all deduction
    categories: personal, family, insurance, provident fund, and investment products.
    Source: Thai Revenue Department official 2026 regulations.
  artifact_type: "Knowledge"
  version: "1.0.0"
  status: "Active"
  owner: "Tax Domain Lead"

classification:
  domain: ["D-TAX"]
  subdomain: ["personal_income_tax", "tax_deductions", "tax_brackets"]
  business_area: "client_advisory"
  knowledge_category: "RE"  # Regulatory
  knowledge_level: "operational"  # foundational / operational / reference
  capabilities:
    - "provide_tax_bracket_rates"
    - "define_allowable_deductions"
    - "specify_contribution_limits"
    - "clarify_regulatory_requirements"
  intent: ["A1", "E1", "B3", "C2"]
  tags: ["ภาษีเงินได้บุคคลธรรมดา", "ลดหย่อนภาษี", "2026", "กรมสรรพากร"]
  language: ["th-en"]
  audience: ["salaryman_premium", "young_professional", "sme_owner", "internal"]
  authoritative_source: "Thai Revenue Department — RD.go.th — 2026 Tax Year Regulations"

dependencies:
  required_knowledge:
    - "30_KB_RE_PDPA"  # If client data handling is referenced
  required_skills: []
  required_workflows: []
  runtime: null  # Compatible with all runtimes
  external_tools: []
  related_artifacts:
    - "30_KB_RE_TaxThailand2025"
    - "30_KB_PR_SuperTax"

execution:
  risk_level: "Medium"
  execution_mode: "Mode1_DirectAnswer"  # Knowledge is loaded; Persona answers
  requires_review: false
  requires_clarification: false
  estimated_tokens: 800
  priority: 80

governance:
  approval_status: "Approved"
  quality_score: 9.2
  review_frequency: "quarterly"
  review_owner: "Tax Domain Lead"
  last_review: "2026-06-25"
  next_review: "2026-09-25"
  deprecated: false
  replacement: null
  compliance: ["Revenue_Code_Thailand", "RD_2026_Circular"]
  freshness_threshold_days: 90
```

---

### 4.3 — Skill Metadata Template

```yaml
# AIOS Registry — Skill Metadata
# Schema Version: 1.0

identity:
  id: "40_Skill_CA_TaxCalculator"
  uuid: "c5f9d4e3-6f7a-4c8b-d9e0-f1a2b3c4d5e6"
  name: "Tax Liability Calculator"
  title: "Thai Personal Income Tax Calculator — Calculation Skill"
  description: >
    Calculates Thai personal income tax liability for a specified fiscal year.
    Accepts gross income, existing deduction categories, and optional optimization
    parameters. Produces a structured tax position report with three scenarios:
    current position, partial optimization, and maximum optimization.
  artifact_type: "Skill"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Skill Architect"

classification:
  domain: ["D-TAX"]
  subdomain: ["tax_calculation", "deduction_optimization"]
  skill_category: "CA"  # Calculation
  business_area: "client_advisory"
  capabilities:
    - "calculate_gross_tax_liability"
    - "apply_standard_deductions"
    - "model_deduction_optimization_scenarios"
    - "generate_tax_position_report"
  intent: ["E1", "B3"]
  tags: ["ภาษีเงินได้", "คำนวณภาษี", "ลดหย่อน", "SuperTax"]
  language: ["th-en"]
  audience: ["salaryman_premium", "young_professional", "sme_owner", "internal"]

dependencies:
  required_personas: []  # Any authorized Persona may invoke
  required_knowledge:
    - "30_KB_RE_TaxThailand2026"
  required_skills: []
  required_workflows: []
  runtime: null
  external_tools: []
  related_artifacts:
    - "40_Skill_PL_TaxPlanningStrategy"
    - "40_Skill_CR_TaxProposalCreator"

execution:
  risk_level: "Medium"
  execution_mode: "Mode3_SkillExecution"
  confidence_required: 0.92  # High confidence required for financial calculations
  requires_review: false
  requires_clarification: true  # Needs: fiscal year, income figure, current deductions
  estimated_tokens: 1500
  estimated_latency: 10
  priority: 75

composition:
  can_be_composed_with:
    - "40_Skill_PL_TaxPlanningStrategy"
    - "40_Skill_RV_FinancialPlanReview"
  composition_pattern: "Sequential"  # Tax Calculator → then Plan Strategy uses its output
  is_sub_skill_of: null

governance:
  approval_status: "Approved"
  quality_score: 9.0
  review_frequency: "semi-annual"
  review_owner: "Chief Skill Architect"
  last_review: "2026-06-25"
  next_review: "2026-12-25"
  deprecated: false
  replacement: null
  compliance: ["Revenue_Code_Thailand"]
```

---

### 4.4 — Workflow Metadata Template

```yaml
# AIOS Registry — Workflow Metadata
# Schema Version: 1.0

identity:
  id: "20_Workflow_FP_CompletePlan"
  uuid: "d6a0e5f4-7a8b-4d9c-e0f1-a2b3c4d5e6f7"
  name: "Complete Financial Plan"
  title: "Complete Family Financial Plan — Financial Planning Workflow"
  description: >
    End-to-end workflow for creating a complete financial plan for a Thai family.
    Covers needs analysis, protection planning, tax optimization, investment strategy,
    and education/retirement planning. Produces a formal plan document ready for
    client presentation after human advisor review.
  artifact_type: "Workflow"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Workflow Architect"

classification:
  domain: ["D-FIN", "D-INS", "D-TAX", "D-INV"]
  workflow_category: "FP"  # Financial Planning
  business_area: "client_advisory"
  capabilities:
    - "conduct_financial_needs_analysis"
    - "model_protection_coverage"
    - "calculate_tax_optimization"
    - "design_investment_allocation"
    - "produce_financial_plan_document"
  intent: ["C1"]
  tags: ["แผนการเงิน", "ครอบครัว", "เกษียณ", "ประกัน", "ภาษี"]
  language: ["th-en"]
  audience: ["salaryman_premium", "working_mom"]

dependencies:
  required_personas:
    - "10_Persona_FinancialPlanner"
  required_knowledge:
    - "30_KB_DO_FinancialPlanningPrinciples"
    - "30_KB_RE_TaxThailand2026"
    - "30_KB_PR_SuperTax"
    - "30_KB_PR_GoodHealthPrime"
  required_skills:
    - "40_Skill_AN_FinancialNeedsAnalysis"
    - "40_Skill_CA_TaxCalculator"
    - "40_Skill_CR_FinancialPlanDocument"
    - "40_Skill_RV_FinancialPlanReview"
    - "40_Skill_VA_PrinciplesComplianceCheck"
  required_workflows: []
  runtime: null
  external_tools: ["CRM_API"]

trigger_conditions:
  - "Client profile is complete (income, family, goals, existing coverage)"
  - "Engagement confirmed: client has agreed to a full planning session"
  - "No active conflicting Workflow instance for the same client"

execution:
  risk_level: "High"
  execution_mode: "Mode4_WorkflowExecution"
  requires_review: true
  requires_clarification: true
  human_gates:
    - stage: "Plan Review"
      owner: "Financial Advisor"
      condition: "Before plan is presented to client"
  estimated_tokens: 12000
  estimated_latency: 300
  priority: 85

output:
  type: "FinancialPlanDocument"
  format: "Structured Markdown / PDF"
  deliverable_to: "client"

governance:
  approval_status: "Approved"
  quality_score: 8.8
  review_frequency: "annual"
  review_owner: "Chief Workflow Architect"
  last_review: "2026-06-25"
  next_review: "2027-06-25"
  deprecated: false
  replacement: null
  compliance: ["TLAA_2535", "SEC_Financial_Planning_Rules"]
```

---

### 4.5 — Runtime Metadata Template

```yaml
# AIOS Registry — Runtime Metadata
# Schema Version: 1.0

identity:
  id: "RT_Claude_Sonnet"
  uuid: "e7b1f6a5-8b9c-4e0d-f1a2-b3c4d5e6f7a8"
  name: "Claude Sonnet"
  title: "Claude Sonnet — Primary AIOS Runtime"
  description: >
    Primary runtime for all production AIOS operations. Provides the optimal
    balance of capability, speed, and cost for client advisory, content creation,
    and financial planning tasks. Configured by Claude.md.
  artifact_type: "Runtime"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Technology Architect"

classification:
  domain: ["D-GEN"]
  capabilities:
    - "text_generation"
    - "tool_use"
    - "structured_output"
    - "long_context_reasoning"
    - "multi_turn_conversation"
  language: ["th-en", "en", "th"]

execution:
  context_window: 200000
  supported_modes: ["Mode1", "Mode2", "Mode3", "Mode4", "Mode5", "Mode6"]
  tool_access: true
  max_output_tokens: 8192
  deployment_environment: "production"

governance:
  approval_status: "Approved"
  quality_score: 9.5
  review_frequency: "quarterly"
  review_owner: "Chief Technology Architect"
  last_review: "2026-06-25"
  next_review: "2026-09-25"
  deprecated: false
  replacement: null
```

---

### 4.6 — Policy Metadata Template

```yaml
# AIOS Registry — Policy Metadata
# Schema Version: 1.0

identity:
  id: "90_Policy_INS_RecommendationStandards"
  uuid: "f8c2a7b6-9c0d-4f1e-a2b3-c4d5e6f7a8b9"
  name: "Insurance Recommendation Standards"
  title: "Insurance Product Recommendation Standards — D-INS Policy"
  description: >
    Defines the minimum standards for any insurance product recommendation
    produced by AIOS. Requires documented needs analysis, IRR disclosure,
    scenario modeling, and prohibition on guaranteed return claims.
  artifact_type: "Policy"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Compliance Officer"

classification:
  domain: ["D-INS"]
  policy_scope: "recommendation_quality"
  applies_to_artifact_types: ["Skill", "Workflow", "Persona"]
  applies_to_domains: ["D-INS"]
  risk_levels_governed: ["Medium", "High", "Critical"]
  enforcement_level: "mandatory"
  regulatory_basis: ["TLAA_2535", "OIC_Circular_2024"]
  intent: ["B2", "C3"]

governance:
  approval_status: "Approved"
  quality_score: 9.3
  review_frequency: "semi-annual"
  review_owner: "Chief Compliance Officer"
  last_review: "2026-06-25"
  next_review: "2026-12-25"
  deprecated: false
  replacement: null
```

---

### 4.7 — Template Metadata Template

```yaml
# AIOS Registry — Template Metadata
# Schema Version: 1.0

identity:
  id: "50_Template_WF_ClientProposal"
  uuid: "a9d3b8c7-0d1e-4a2f-b3c4-d5e6f7a8b9c0"
  name: "Client Financial Proposal"
  title: "Client Financial Proposal — Document Template"
  description: >
    Reusable template for creating professional financial proposals for clients.
    Includes sections for executive summary, current situation analysis, coverage
    gaps, recommended solutions, cost-benefit comparison, and next steps.
  artifact_type: "Template"
  version: "1.0.0"
  status: "Active"
  owner: "Chief Documentation Architect"

classification:
  template_type: "document"
  produces_artifact_type: "ClientProposal"
  domain: ["D-FIN", "D-INS"]
  capabilities:
    - "structure_financial_proposal"
    - "standardize_recommendation_format"

execution:
  mandatory_sections:
    - "executive_summary"
    - "current_situation"
    - "coverage_gaps"
    - "recommended_solutions"
    - "cost_benefit_analysis"
    - "next_steps"
  optional_sections:
    - "appendix_calculations"
    - "appendix_product_specifications"

governance:
  approval_status: "Approved"
  quality_score: 8.5
  review_frequency: "annual"
  review_owner: "Chief Documentation Architect"
  last_review: "2026-06-25"
  next_review: "2027-06-25"
  deprecated: false
  replacement: null
```

---

## 5. Routing Metadata

### Purpose of Routing Metadata

The Routing Metadata block is a specialized subset of the Classification and Execution layers, designed specifically for consumption by the AI Orchestrator. While general metadata describes what an artifact is, Routing Metadata describes how the Orchestrator should select it.

Routing Metadata is the interface contract between the Registry and the Orchestrator.

### Routing Metadata Schema

```yaml
routing_rules:
  # TRIGGER CONDITIONS — when should the Orchestrator consider this artifact?
  if_intent:
    - "E1"    # Tax Calculation
    - "B3"    # Tax Strategy Consultation
  if_domain:
    - "D-TAX"
  if_risk:
    - "Low"
    - "Medium"
    - "High"

  # PREFERENCE — which complementary artifacts should accompany this one?
  preferred_persona: "10_Persona_TaxAdvisor"       # Preferred invoking Persona
  preferred_skill: null                             # Self (this IS the skill)
  preferred_workflow: "20_Workflow_TP_TaxPlanning"  # Preferred parent Workflow
  preferred_runtime: "RT_Claude_Sonnet"

  # EXCLUSION — when must the Orchestrator NOT select this artifact?
  excluded_if_risk: ["Critical"]
  excluded_if_domain: ["D-MKT", "D-CRM"]
  excluded_if_intent: ["D1", "D2", "G1"]

  # FALLBACK — what to do if this artifact fails or is unavailable
  fallback_strategy:
    on_unavailable: "use_persona_general_capability"
    on_stale_dependency: "proceed_with_caveat"
    on_review_failure: "revision_required"
    on_critical_failure: "escalate_to_human"

  # PRIORITY — tie-breaking when multiple artifacts match
  priority: 75

  # CONTEXT — what additional context this artifact signals as required
  signals_required_context:
    - "client_income_data"
    - "current_tax_year_kb"
    - "existing_deductions_data"
```

### How the Orchestrator Consumes Routing Metadata

At each selection state (S08–S11) in the Orchestration State Machine, the Orchestrator queries the Registry for artifacts whose Routing Metadata matches the current request profile:

**Step 1 — Build the Request Profile:**  
From the outputs of S03 (Intent), S04 (Domain), and S05 (Risk), the Orchestrator constructs a request profile: `{intent: "E1", domain: "D-TAX", risk: "Medium"}`.

**Step 2 — Query Routing Metadata:**  
Query the Registry for all artifacts where `if_intent` contains `"E1"` AND `if_domain` contains `"D-TAX"` AND `if_risk` includes `"Medium"`.

**Step 3 — Filter by Status:**  
Exclude all artifacts where `status` is not `Active`. Flag artifacts where `status` is `Stale` for caveat handling.

**Step 4 — Filter by Exclusions:**  
Remove artifacts where the current risk is in `excluded_if_risk`, or the domain is in `excluded_if_domain`.

**Step 5 — Sort by Priority:**  
Sort remaining candidates by `priority` descending. The highest-priority artifact is the primary selection.

**Step 6 — Resolve Dependencies:**  
From the selected artifact's `required_knowledge`, `required_skills`, and `required_personas`, build the full dependency set. Verify all dependencies are `Active` in the Registry.

**Step 7 — Assemble Context Signals:**  
From `signals_required_context`, add required context items to the Context Assembly list for S06.

---

## 6. Discovery Protocol

### What Is Discovery?

Discovery is the process by which the Orchestrator (or any querying agent) moves from a user request to a fully resolved set of components ready for execution. Discovery is not search — it is structured resolution through a defined sequence of steps, each governed by the Registry.

### The Nine-Stage Discovery Protocol

```
┌──────────────────────────────────────────────────────────────────┐
│                   DISCOVERY PROTOCOL                             │
│                                                                  │
│  Stage 1: USER REQUEST                                          │
│    Raw user input received by the interface layer               │
│    ↓                                                            │
│  Stage 2: INTENT DETECTION                                      │
│    Classify to Intent Taxonomy (A–H codes)                      │
│    Classify to Domain Taxonomy (D-xxx codes)                    │
│    Assess Risk Level (Low / Medium / High / Critical)           │
│    ↓                                                            │
│  Stage 3: REGISTRY QUERY                                        │
│    Submit {intent, domain, risk} profile to Registry            │
│    Query Persona Registry → candidate Personas                  │
│    Query Skill Registry → candidate Skills                      │
│    Query Workflow Registry → candidate Workflows                │
│    Query Knowledge Registry → required Knowledge                │
│    ↓                                                            │
│  Stage 4: CANDIDATE SELECTION                                   │
│    Apply status filter (Active only)                            │
│    Apply exclusion filter                                       │
│    Apply priority ranking                                       │
│    Select primary and fallback candidates per component type    │
│    ↓                                                            │
│  Stage 5: DEPENDENCY RESOLUTION                                 │
│    For each selected candidate:                                 │
│      - Resolve required_personas                                │
│      - Resolve required_knowledge (check freshness)            │
│      - Resolve required_skills                                  │
│      - Resolve required_workflows                               │
│    Build full dependency set (recursive)                        │
│    Detect circular dependencies → block if found               │
│    Detect missing dependencies → apply fallback                │
│    ↓                                                            │
│  Stage 6: CONTEXT ASSEMBLY                                      │
│    From signals_required_context of all selected artifacts:     │
│    Build the Context Loading list                               │
│    Apply Minimum Context Principle                              │
│    Run Context Sufficiency Test                                 │
│    → If insufficient: return to Stage 2 with clarification     │
│    ↓                                                            │
│  Stage 7: EXECUTION PREPARATION                                 │
│    Confirm all components are available                         │
│    Confirm all dependencies are resolved                        │
│    Confirm context is sufficient                                │
│    Assemble the Execution Package:                              │
│    {persona, knowledge, skills, workflow, context, runtime}     │
│    ↓                                                            │
│  Stage 8: EXECUTION                                             │
│    Delegate Execution Package to Orchestrator S12              │
│    Monitor execution; capture outputs                           │
│    ↓                                                            │
│  Stage 9: VALIDATION AND LOGGING                               │
│    Apply Output Review (OV-1 to OV-8)                         │
│    Apply Safety Check (C1–C7)                                  │
│    Log discovery path for audit trail                          │
│    Return response or trigger revision                         │
└──────────────────────────────────────────────────────────────────┘
```

### Stage Details

#### Stage 3 — Registry Query: Query Anatomy

Every Registry query has three required components:

| Component | Description | Example |
|-----------|-------------|---------|
| **Primary filters** | Must-match conditions | `intent IN ["E1"] AND domain IN ["D-TAX"]` |
| **Risk filter** | Risk level compatibility | `risk_level IN ["Low", "Medium"]` |
| **Status filter** | Lifecycle gate | `status = "Active"` |
| **Sort key** | Priority ordering | `ORDER BY priority DESC` |

#### Stage 5 — Dependency Resolution: Depth and Loops

Dependency resolution is recursive: each resolved dependency may have its own dependencies. The resolution algorithm must:

1. Build a directed acyclic graph (DAG) of all dependencies
2. Detect any cycle in the graph → fail with `CircularDependency` error
3. Traverse the graph in topological order
4. Check each node against the Registry for status and freshness
5. Apply fallback rules for any unresolvable node

**Dependency depth limit:** Maximum 5 levels deep. Beyond 5 levels, the Orchestrator logs a structural complexity warning and treats level 6+ dependencies as advisory only.

#### Stage 6 — Context Assembly: Minimum Context Check

After dependency resolution, the Orchestrator knows the full set of Knowledge documents required. Before loading, it applies:

1. **Deduplication:** Multiple artifacts may require the same Knowledge document. Load once.
2. **Freshness gate:** Stale Knowledge documents are flagged, not blocked (unless risk is High).
3. **Conflict check:** If two required Knowledge documents contain conflicting information, apply Context Priority Hierarchy from `03_AI_Context_Framework.md`.
4. **Sufficiency test:** Apply the five-question Sufficiency Test. If insufficient, generate a clarifying question.

---

## 7. Registry Query Model

### Query Interface Principles

The Registry Query Model defines how AI agents, the Orchestrator, and governance tools interact with the Registry. This model is architecture-only — it describes the logical query interface, not any specific query language or implementation.

**Principle QM-1 — Queries Are Declarative, Not Imperative**  
A Registry query describes what is needed, not how to find it. The query specifies intent, domain, risk, and capability. The Registry resolves to the best matching artifacts.

**Principle QM-2 — Every Query Returns a Ranked List**  
Registry queries never return a single artifact. They return an ordered list of candidates, ranked by priority, with fallbacks. The Orchestrator selects from the list — the Registry does not select for it.

**Principle QM-3 — Queries Are Auditable**  
Every Registry query is logged with its parameters, the list of candidates returned, and which candidate was selected. This log is the primary input for routing accuracy measurement (Section 11, Metric M8).

**Principle QM-4 — Queries Support Null Results**  
A Registry query that returns zero candidates is a valid result. It triggers the fallback protocol, not an error. The Registry must never return a stale, deprecated, or retired artifact to avoid a null result.

### Query Types

#### QT-1 — Find Persona by Intent

**Query purpose:** Given an intent code and domain, find the authorized Persona(s).

```
QUERY TYPE:     PersonaLookup
INPUT:
  intent:       [Array of Intent Codes]
  domain:       [Array of Domain Codes]
  risk_level:   [Low | Medium | High | Critical]
OUTPUT:
  candidates:   [Ranked list of Persona IDs]
  primary:      [Highest-priority match]
  fallback:     [Second-priority match]
  null_result:  [true | false]
  null_reason:  [String if null_result is true]

FILTERS APPLIED:
  - artifact_type = "Persona"
  - status = "Active"
  - domain contains at least one value from input.domain
  - intent contains at least one value from input.intent
  - risk_level >= input.risk_level (Persona must handle this risk level)
```

**Example:**
```
Input:  {intent: ["B3"], domain: ["D-TAX"], risk_level: "High"}
Result: {
  primary: "10_Persona_TaxAdvisor",
  fallback: "10_Persona_FinancialPlanner",
  null_result: false
}
```

---

#### QT-2 — Find Skill by Capability

**Query purpose:** Given a capability need, find Skills that provide it.

```
QUERY TYPE:     SkillLookup
INPUT:
  capability:   [String — capability verb phrase]
  domain:       [Array of Domain Codes]
  risk_level:   [Low | Medium | High | Critical]
OUTPUT:
  candidates:   [Ranked list of Skill IDs]
  primary:      [Highest-priority match]
  fallback:     [Second-priority match]
  preconditions: [Aggregated list of required preconditions]
```

**Example:**
```
Input:  {capability: "calculate_tax_liability", domain: ["D-TAX"]}
Result: {
  primary: "40_Skill_CA_TaxCalculator",
  fallback: null,
  preconditions: ["client_income_data", "30_KB_RE_TaxThailand2026"]
}
```

---

#### QT-3 — Find Knowledge by Domain

**Query purpose:** Given a domain and optional subdomain, find relevant Knowledge documents.

```
QUERY TYPE:     KnowledgeLookup
INPUT:
  domain:       [Array of Domain Codes]
  subdomain:    [Optional Array of strings]
  knowledge_category: [Optional: CO|BU|DO|PR|CU|TE|RE|HI|RF]
  freshness_required: [Boolean]
OUTPUT:
  candidates:   [Ranked list of Knowledge IDs]
  fresh:        [Subset where last_review within freshness_threshold]
  stale:        [Subset where last_review past freshness_threshold]
  authoritative: [Primary authoritative source for each returned document]
```

---

#### QT-4 — Resolve Dependencies

**Query purpose:** Given an artifact ID, return the full transitive dependency set.

```
QUERY TYPE:     DependencyResolution
INPUT:
  artifact_id:  [String]
  depth_limit:  [Integer, default 5]
OUTPUT:
  dependency_tree:  [DAG of all resolved dependencies]
  resolved:         [List of dependency IDs with status]
  unresolved:       [List of missing or unavailable dependencies]
  circular_detected: [Boolean]
  circular_path:    [String if circular_detected is true]
  stale_detected:   [Boolean]
  stale_artifacts:  [List of stale dependency IDs]
```

---

#### QT-5 — Locate Fallback Components

**Query purpose:** Given an unavailable artifact, find the best available substitute.

```
QUERY TYPE:     FallbackResolution
INPUT:
  unavailable_id:   [String — artifact that failed]
  failure_reason:   [unavailable | stale | deprecated | unknown]
  request_profile:  {intent, domain, risk_level}
OUTPUT:
  fallback_artifact: [Best substitute artifact ID, or null]
  fallback_strategy: [String — recommended fallback action]
  caveat_required:   [Boolean]
  caveat_text:       [String if caveat_required is true]
```

---

#### QT-6 — Discover Compatible Workflows

**Query purpose:** Given an intent and set of required outputs, find Workflows that cover the full task.

```
QUERY TYPE:     WorkflowDiscovery
INPUT:
  intent:           [Array of Intent Codes]
  domain:           [Array of Domain Codes]
  required_outputs: [Optional Array of output type strings]
  available_context: [List of context items already assembled]
OUTPUT:
  candidates:       [Ranked list of Workflow IDs]
  trigger_match:    [For each candidate: which trigger conditions are met]
  missing_trigger:  [For each candidate: which trigger conditions are not met]
  ready_to_trigger: [Subset where all trigger conditions are met]
```

---

## 8. Registry Relationships

### Relationship Model Overview

The Registry tracks relationships between artifacts as a directed graph. Each relationship has a type, direction, and cardinality. Understanding these relationships enables dependency resolution, impact analysis, and discovery path tracing.

### Core Relationship Types

| Relationship Type | From → To | Description | Cardinality |
|-------------------|-----------|-------------|-------------|
| `INVOKES` | Workflow → Skill | Workflow calls this Skill in one of its steps | Many-to-many |
| `REQUIRES` | Workflow → Persona | Workflow requires this Persona to be active | Many-to-many |
| `REFERENCES` | Persona → Knowledge | Persona references this Knowledge document during execution | Many-to-many |
| `LOADS` | Skill → Knowledge | Skill requires this Knowledge to be loaded | Many-to-many |
| `PRODUCES` | Skill → Template | Skill uses this Template to structure its output | Many-to-one |
| `GOVERNS` | Policy → Workflow | Policy applies to this Workflow's execution | Many-to-many |
| `GOVERNS` | Policy → Skill | Policy applies to this Skill's output | Many-to-many |
| `DERIVES_FROM` | Knowledge → Knowledge | This Knowledge document was derived from another | Many-to-one |
| `SUPERSEDES` | Knowledge → Knowledge | This document replaces a deprecated predecessor | One-to-one |
| `COMPOSES_WITH` | Skill → Skill | Skill can be combined with this Skill | Many-to-many |
| `SUB_WORKFLOW` | Workflow → Workflow | Workflow invokes this Workflow as a sub-process | Many-to-many |
| `CHECKS` | Skill (Validation) → Any | Validation Skill reviews this artifact type's outputs | One-to-many |

### Relationship Diagrams

#### Diagram 1 — Workflow Relationship Map

```
┌────────────────────────────────────────────────────────────────────┐
│              WORKFLOW RELATIONSHIP MAP                             │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   WORKFLOW                                   │  │
│  │         Complete Financial Plan                             │  │
│  └──────┬───────────────┬───────────────┬───────────────┬──────┘  │
│         │ REQUIRES      │ INVOKES       │ REQUIRES      │ GOVERNS │
│         ▼               ▼               ▼               ▼         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │ PERSONA  │    │  SKILL   │    │KNOWLEDGE │    │ POLICY   │    │
│  │Financial │    │FNA Skill │    │Tax 2026  │    │Ins. Rec. │    │
│  │Planner   │    │          │    │          │    │Standards │    │
│  └──────────┘    └────┬─────┘    └──────────┘    └──────────┘    │
│                       │ LOADS                                     │
│                       ▼                                           │
│                ┌──────────┐                                       │
│                │KNOWLEDGE │                                       │
│                │FP Princ. │                                       │
│                └──────────┘                                       │
└────────────────────────────────────────────────────────────────────┘
```

#### Diagram 2 — Knowledge Relationship Map

```
┌────────────────────────────────────────────────────────────────────┐
│              KNOWLEDGE RELATIONSHIP MAP                            │
│                                                                    │
│  ┌──────────────┐   SUPERSEDES   ┌──────────────────────────────┐ │
│  │ Tax 2026 KB  │ ──────────────▶│ Tax 2025 KB (Deprecated)     │ │
│  └──────┬───────┘                └──────────────────────────────┘ │
│         │ DERIVES_FROM                                             │
│         ▼                                                          │
│  ┌──────────────┐                                                  │
│  │ Revenue Dept │                                                  │
│  │ Source Docs  │  (External — not in AIOS)                       │
│  └──────────────┘                                                  │
│                                                                    │
│  ┌──────────────┐   RELATED_TO   ┌──────────────┐                 │
│  │ Tax 2026 KB  │ ◀─────────────▶│ SuperTax KB  │                 │
│  └──────────────┘                └──────────────┘                 │
│                                                                    │
│  ┌──────────────┐   LOADS        ┌──────────────┐                 │
│  │ Tax Calc     │ ──────────────▶│ Tax 2026 KB  │                 │
│  │   Skill      │                └──────────────┘                 │
│  └──────────────┘                                                  │
└────────────────────────────────────────────────────────────────────┘
```

#### Diagram 3 — Skill Composition Map

```
┌────────────────────────────────────────────────────────────────────┐
│              SKILL COMPOSITION MAP — Tax Planning                  │
│                                                                    │
│  ┌─────────────┐                                                   │
│  │Tax Calculator│  Sequential Output feeds Input                   │
│  │   Skill     │──────────────────────────┐                       │
│  └──────┬──────┘                          │                       │
│         │ LOADS                           ▼                       │
│         ▼                      ┌─────────────────┐                │
│  ┌──────────────┐              │Tax Planning     │                 │
│  │ Tax 2026 KB  │              │Strategy Skill   │                 │
│  └──────────────┘              └────────┬────────┘                │
│                                         │ Conditional              │
│                                         ▼ (if gap > ฿50k)         │
│                                ┌─────────────────┐                │
│                                │SuperTax Product  │                │
│                                │Proposal Skill    │                │
│                                └─────────────────┘                │
└────────────────────────────────────────────────────────────────────┘
```

#### Diagram 4 — Policy Governance Map

```
┌────────────────────────────────────────────────────────────────────┐
│              POLICY GOVERNANCE MAP                                 │
│                                                                    │
│  ┌───────────────────┐   GOVERNS    ┌────────────────────────┐    │
│  │ Insurance Rec.    │─────────────▶│ Insurance Advisory     │    │
│  │ Standards Policy  │              │ Persona                │    │
│  └───────────────────┘              └────────────────────────┘    │
│           │                                                        │
│           │ GOVERNS                                                │
│           ▼                                                        │
│  ┌────────────────────────┐                                        │
│  │ Product Comparison     │                                        │
│  │ Skill                  │                                        │
│  └────────────────────────┘                                        │
│           │                                                        │
│           │ GOVERNS                                                │
│           ▼                                                        │
│  ┌────────────────────────┐                                        │
│  │ Client Proposal        │                                        │
│  │ Workflow               │                                        │
│  └────────────────────────┘                                        │
└────────────────────────────────────────────────────────────────────┘
```

### Impact Analysis Using Relationships

When an artifact is updated, deprecated, or retired, the Registry uses the relationship graph to identify all affected artifacts:

**Impact Analysis Query:**  
*"If I deprecate `30_KB_RE_TaxThailand2026`, what else is affected?"*

Steps:
1. Find all artifacts where `required_knowledge` contains `30_KB_RE_TaxThailand2026`
2. For each found artifact, find all artifacts that depend on it
3. Continue recursively until the full impact set is identified
4. Classify by severity: direct dependents (Level 1), indirect dependents (Level 2+)
5. Generate impact report before allowing deprecation to proceed

---

## 9. Registry Governance

### The Governance Lifecycle

Every AIOS artifact must pass through a defined lifecycle before it can be used in production and must continue to be actively maintained to remain in production.

```
REGISTRATION REQUEST
  ↓
DRAFT CREATION
  Author creates artifact using appropriate Template
  ↓
SELF-REGISTRATION
  Author populates metadata using artifact type template
  Submits registration to Review Queue
  ↓
METADATA REVIEW
  Registry custodian verifies:
    - All required fields populated
    - IDs are unique and follow naming conventions
    - Dependencies exist in Registry
    - Quality score assessment performed
  ↓
CONTENT REVIEW
  Domain expert or architect reviews artifact content:
    - Accuracy of claims
    - Layer boundary compliance
    - Principles alignment
    - Completeness against standard (06/07/08/05)
  ↓
APPROVAL
  Approved → status: Active, approval_status: Approved
  Rejected → status: Draft, rejection reason documented
  Conditional → status: Review, conditions documented
  ↓
ACTIVE PRODUCTION USE
  Orchestrator may select this artifact
  ↓
SCHEDULED REVIEW
  At next_review date:
    Content Owner conducts review
    If current → update last_review, update next_review, status remains Active
    If outdated → status: Stale, update flagged
    ↓
  STALE STATUS
  Orchestrator loads with caveat
  Update must be completed within defined SLA:
    - Regulatory Knowledge: 30 days
    - Product Knowledge: 60 days
    - Domain Knowledge: 90 days
    - Skills/Workflows: 90 days
  ↓
  [UPDATE PATH]                    [DEPRECATION PATH]
  Author updates content           Owner confirms replacement exists
  Version incremented              status: Deprecated
  Re-enters CONTENT REVIEW         replacement: [new artifact ID]
  On approval → status: Active     Dependents notified
  Old version → status: Archived   ↓
                                   RETIREMENT
                                   After 90-day grace period
                                   status: Retired
                                   Removed from active routing
                                   ↓
                                   ARCHIVE
                                   status: Archived
                                   Preserved for audit history
```

### Registration Requirements

For an artifact to be registered, the following conditions must all be met:

| Requirement | Rule |
|-------------|------|
| R-1: Unique ID | The `id` does not exist in any sub-registry |
| R-2: Naming convention | The `id` follows the AIOS naming convention from `README.md` |
| R-3: Complete Identity Layer | All required Identity fields populated |
| R-4: Valid dependencies | All declared dependency IDs exist in their respective registries |
| R-5: Content standard compliance | The artifact document follows its type's standard (05, 06, 07, or 08) |
| R-6: Owner identified | A specific, named `owner` is declared |
| R-7: Review schedule | `review_frequency` and `review_owner` declared |
| R-8: Principles alignment | At least one documented review for Principles compliance |

### Versioning Rules

| Change Type | Version Change | Review Required | Dependents Notified |
|-------------|----------------|-----------------|---------------------|
| Fix a typo, clarify wording | PATCH (1.0.0 → 1.0.1) | No | No |
| Add new capability or section | MINOR (1.0.0 → 1.1.0) | Recommended | Optional |
| Change core behavior, remove capability | MAJOR (1.0.0 → 2.0.0) | Required | Yes |
| Breaking change to output format | MAJOR | Required | Yes — dependency check required |
| Deprecation | Status change only | Required | Yes — mandatory |

### Deprecation Rules

| Rule | Requirement |
|------|-------------|
| DEP-1 | A replacement artifact must exist and be `Active` before deprecation can proceed |
| DEP-2 | All direct dependents must be notified and given 30-day migration window |
| DEP-3 | Deprecated artifacts remain in Registry (status: `Deprecated`) for 90 days before Retirement |
| DEP-4 | The `replacement` field must be populated with the successor artifact ID |
| DEP-5 | Orchestrator routing tables must be updated to use the replacement before deprecation takes effect |

---

## 10. Registry Quality Standards

### The Seven Quality Dimensions

Every artifact registered in AIOS is evaluated against seven quality dimensions. These dimensions are used both to compute the `quality_score` during review and to generate Registry Health Metrics in Section 11.

#### QS-1 — Consistency

**Definition:** Metadata fields are internally consistent with each other and with the artifact's content.

**Checks:**
- `domain` in metadata matches the domain of referenced Knowledge documents
- `intent` codes match the artifact's stated purpose
- `required_knowledge` freshness thresholds are compatible with artifact's risk level
- `version` history in the document matches registered version

**Scoring rubric:** 10 = No inconsistencies; 8–9 = 1–2 minor; 6–7 = 3–5 inconsistencies; <6 = Material inconsistencies; reject

#### QS-2 — Completeness

**Definition:** All required metadata fields are populated with substantive values. No fields left at default or empty when content is expected.

**Checks:**
- All required fields in each metadata layer are populated
- `description` answers: what, when, and what it produces
- `capabilities` list is specific and non-trivial
- `routing_rules` are specific enough to meaningfully narrow Orchestrator selection

**Scoring rubric:** 10 = All required fields substantively complete; 8–9 = 1–2 minor gaps; 6–7 = Optional fields missing; <6 = Required fields incomplete; reject

#### QS-3 — Uniqueness

**Definition:** The artifact is distinct from existing registered artifacts. No duplicated capability, purpose, or content.

**Checks:**
- No other artifact with the same `capabilities` and `domain` combination at the same specificity level
- `id` is unique across all registries
- `uuid` is globally unique
- Artifact purpose does not overlap materially with an existing `Active` artifact

**Scoring rubric:** 10 = Fully unique; 8–9 = Minimal overlap, differentiated; 6–7 = Some overlap but distinct scope; <6 = Substantial duplication; reject or merge

#### QS-4 — Discoverability

**Definition:** The artifact will be found by the Orchestrator when it should be, and not found when it should not be.

**Checks:**
- `routing_rules.if_intent` covers all appropriate intent codes, and only those
- `routing_rules.if_domain` is not over-broad (does not match unrelated domains)
- `description` contains terms that would appear in natural language routing queries
- `tags` include language-specific terms (Thai and English) for the primary use cases
- `priority` is calibrated to match the artifact's intended selection frequency

**Scoring rubric:** 10 = Precisely discoverable; 8–9 = Minor routing precision issues; 6–7 = Over- or under-specified routing; <6 = Would not be found in expected scenarios; reject

#### QS-5 — Maintainability

**Definition:** The metadata and artifact can be updated, reviewed, and evolved without disrupting dependent artifacts.

**Checks:**
- `review_owner` is a specific, active individual or team
- `review_frequency` is appropriate for the domain's change rate
- Dependency declarations are specific (not wildcard or over-broad)
- Version history is documented and accurate
- MAJOR version changes are isolated from non-breaking changes

**Scoring rubric:** 10 = Easily maintainable; 8–9 = Minor issues; 6–7 = Some risk of update friction; <6 = Maintenance is risky; recommend refactoring

#### QS-6 — Scalability

**Definition:** The metadata schema supports the artifact being part of a system with 500+ Personas, 5,000+ Knowledge files, 2,000+ Skills, and 2,000+ Workflows without structural changes.

**Checks:**
- Dependency declarations use IDs, not file paths or fragile references
- Routing rules are expressed as portable criteria, not hardcoded system-specific values
- `uuid` provides stable reference independent of naming changes
- No assumptions about directory structure or file system layout

**Scoring rubric:** 10 = Fully scalable; 8–9 = Minor scalability assumptions; 6–7 = Some fragile references; <6 = Would break at scale; reject

#### QS-7 — Auditability

**Definition:** The artifact's history, decisions, and governance state can be fully reconstructed from Registry records.

**Checks:**
- `version` history is complete and traceable
- `approval_status` history is documented
- `last_review` and `next_review` are current and accurate
- Deprecation and retirement events are documented with rationale
- `owner` is traceable to an accountable person

**Scoring rubric:** 10 = Fully auditable; 8–9 = Minor gaps; 6–7 = Some history gaps; <6 = Cannot be reliably audited; flag for governance review

### Computing the Quality Score

```
Quality Score = 
  (QS-1_Consistency × 0.15) +
  (QS-2_Completeness × 0.20) +
  (QS-3_Uniqueness × 0.15) +
  (QS-4_Discoverability × 0.20) +
  (QS-5_Maintainability × 0.15) +
  (QS-6_Scalability × 0.08) +
  (QS-7_Auditability × 0.07)

All dimensions scored 0.0–10.0
Quality Score range: 0.0–10.0
```

| Score | Rating | Action |
|-------|--------|--------|
| 9.0–10.0 | Excellent | Activate; recognize as reference artifact |
| 7.5–8.9 | Good | Activate; minor improvements recommended |
| 6.0–7.4 | Acceptable | Activate with improvement plan; re-review within 60 days |
| 4.0–5.9 | Below Standard | Do not activate; return for rework |
| 0.0–3.9 | Deficient | Reject; author must rebuild against standard |

---

## 11. Registry Health Metrics

### Purpose

Registry Health Metrics provide quantitative visibility into the state of the AIOS discovery layer. These metrics are produced during the Architecture Audit process (governed by `09_AI_Architecture_Audit.md`) and can be tracked over time to detect degradation before it affects operational quality.

### The Ten Registry KPIs

#### M1 — Coverage Rate

**Definition:** Percentage of AIOS-operational components that have a Registry entry.

**Formula:** `(Registered artifacts / Known operational artifacts) × 100`

**Target:** ≥ 95%

**Interpretation:**
- 95–100%: Full coverage — all operational components are discoverable
- 85–94%: Minor gaps — some components operating outside governance
- 70–84%: Material gaps — governance is incomplete
- <70%: Critical gap — substantial shadow inventory outside Registry

**Data source:** Comparison of file system artifact count vs. Registry entry count, by artifact type

---

#### M2 — Metadata Completeness Score

**Definition:** Average Quality Score across all registered `Active` artifacts.

**Formula:** `SUM(quality_score for all Active artifacts) / COUNT(Active artifacts)`

**Target:** ≥ 7.5

**Interpretation:**
- ≥ 8.0: Registry is high-quality and trustworthy
- 7.0–7.9: Registry is adequate; improvement focus recommended
- 6.0–6.9: Registry quality is slipping; audit required
- <6.0: Registry quality is insufficient; systematic review required

---

#### M3 — Broken Dependency Rate

**Definition:** Percentage of registered artifacts that have at least one dependency that does not exist or is not `Active` in the Registry.

**Formula:** `(Artifacts with broken dependencies / Total registered artifacts) × 100`

**Target:** ≤ 2%

**Interpretation:**
- 0–2%: Healthy dependency graph
- 3–5%: Minor broken references; maintenance backlog exists
- 6–10%: Dependency health is degrading; immediate audit needed
- >10%: Critical — routing is unreliable; system integrity at risk

**Common causes:** Artifact renamed without updating dependents; artifact deprecated without dependency notification; artifact removed without retirement process

---

#### M4 — Duplicate Artifact Rate

**Definition:** Percentage of registered artifact pairs with substantially overlapping capabilities and domain scope.

**Formula:** `(Pairs with >80% capability overlap / Total artifact pairs within same domain) × 100`

**Target:** ≤ 5%

**Interpretation:**
- 0–5%: Registry is well-curated; minimal redundancy
- 6–10%: Some redundancy; deduplication recommended
- >10%: Registry is cluttered; routing precision is degraded

---

#### M5 — Orphan Artifact Rate

**Definition:** Percentage of registered `Active` artifacts that have zero inbound relationships (no other artifact depends on them) and have not been invoked in the most recent audit period.

**Formula:** `(Active artifacts with zero inbound relationships AND zero invocations) / Total Active artifacts × 100`

**Target:** ≤ 10%

**Interpretation:**
- Orphan artifacts are candidates for deprecation or improvement
- High orphan rates indicate over-registration or capability gaps in connecting artifacts

---

#### M6 — Stale Artifact Rate

**Definition:** Percentage of `Active` artifacts where `next_review` is in the past.

**Formula:** `(Active artifacts where next_review < today) / Total Active artifacts × 100`

**Target:** ≤ 5%

**Interpretation:**
- 0–5%: Review governance is healthy
- 6–15%: Review backlog is growing; risk of outdated content
- >15%: Review governance is failing; critical for Regulatory Knowledge

**Priority action:** Stale Regulatory Knowledge (D-TAX, D-LEG, D-INS) must be flagged as Priority 1. Stale status in these domains is a governance risk, not just a quality issue.

---

#### M7 — Routing Accuracy Rate

**Definition:** Percentage of Orchestrator routing queries that selected the expected primary artifact (validated through audit review of logged routing decisions).

**Formula:** `(Routing queries where primary selection was confirmed optimal / Total reviewed routing queries) × 100`

**Target:** ≥ 90%

**Interpretation:**
- ≥ 95%: Routing metadata is precise and well-calibrated
- 88–94%: Minor routing precision issues; metadata tuning recommended
- 80–87%: Routing is inconsistent; routing metadata audit required
- <80%: Routing is unreliable; Registry quality is insufficient for production use

**Measurement method:** Human or automated review of a sample of Orchestrator routing logs, validating the selected artifact against the optimal artifact for each request profile

---

#### M8 — Discovery Latency

**Definition:** Average time in seconds to complete the full Discovery Protocol (Stages 1–7) for a standard request.

**Formula:** Average of logged discovery completion times across a representative sample

**Target:** ≤ 3 seconds for simple requests; ≤ 10 seconds for complex multi-dependency requests

**Interpretation:**
- Discovery latency above target typically indicates:
  - Excessive dependency depth (reduce to maximum 3 levels for most artifacts)
  - Stale freshness checks requiring network calls
  - Registry size exceeding in-memory capacity (implementation concern)

---

#### M9 — Fallback Invocation Rate

**Definition:** Percentage of Orchestrator routing queries that resulted in a fallback selection (primary candidate unavailable or failed).

**Formula:** `(Routing queries invoking fallback / Total routing queries) × 100`

**Target:** ≤ 8%

**Interpretation:**
- 0–8%: Routing is reliable; fallbacks are rare edge cases
- 9–15%: Fallback rate is elevated; investigate primary artifact availability
- >15%: Systemic routing failures; coverage or metadata quality issues

**Common causes:** Artifacts stuck in `Stale` status; missing artifacts for common request types; over-restrictive `excluded_if_*` rules

---

#### M10 — Registry Quality Score (RQS)

**Definition:** Composite health score for the entire Registry, combining all nine individual metrics.

**Formula:**
```
RQS = 
  (M1_Coverage × 0.20) +
  (M2_Completeness × 0.20) +
  (10 − M3_BrokenDependencies_normalized × 0.15) +
  (10 − M4_Duplicates_normalized × 0.10) +
  (10 − M5_Orphans_normalized × 0.08) +
  (10 − M6_Stale_normalized × 0.12) +
  (M7_RoutingAccuracy × 0.10) +
  (10 − M8_Latency_normalized × 0.03) +
  (10 − M9_FallbackRate_normalized × 0.02)
```

*Normalization: each metric is scaled to 0–10 relative to its target threshold.*

| RQS | Rating | Governance Action |
|-----|--------|--------------------|
| 9.0–10.0 | Excellent | Routine maintenance |
| 7.5–8.9 | Good | Minor improvements |
| 6.0–7.4 | Adequate | Improvement plan required within 30 days |
| 4.0–5.9 | Below Standard | Immediate audit; remediation plan within 14 days |
| <4.0 | Critical | Registry freeze; all new registrations suspended until remediation |

---

## 12. Registry Examples

### Example 1 — Tax Reduction Planning

**User request:** "ช่วยวางแผนลดภาษีสำหรับลูกค้าที่รายได้ปีละ 2.4 ล้านบาท"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | B3 (Tax Strategy), E1 (Calculation) | |
| Domain | D-TAX | |
| Risk | High (specific client) | |
| Persona Query | `intent IN [B3], domain IN [D-TAX], risk = High` | `10_Persona_TaxAdvisor` (priority 85), fallback: `10_Persona_FinancialPlanner` |
| Knowledge Query | `domain IN [D-TAX], status = Active` | `30_KB_RE_TaxThailand2026` (primary), `30_KB_PR_SuperTax` |
| Skill Query | `capability = "calculate_tax_liability"` | `40_Skill_CA_TaxCalculator` |
| Workflow Query | `intent IN [C2], trigger_met = true` | `20_Workflow_TP_TaxPlanning` (if full plan; else no workflow) |
| Dependencies resolved | Tax Calculator → Tax 2026 KB (Active, fresh) | All resolved |
| Context signals | `client_income_data`, `current_deductions` | → Clarification required |
| Execution mode | Mode 3 → Mode 2 | Skill execution → Persona recommendation |

---

### Example 2 — Insurance Planning

**User request:** "อยากรู้ว่าลูกค้าควรซื้อ Good Health Prime หรือ Critical Illness"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | A3 (Comparison), B2 (Recommendation) | |
| Domain | D-INS | |
| Risk | Medium → High (after client context loaded) | |
| Persona | `10_Persona_FinancialPlanner` | Insurance scope authorized |
| Knowledge | `30_KB_PR_GoodHealthPrime`, `30_KB_PR_CriticalIllness`, `30_KB_CU_[ClientPersona]` | |
| Skill | `40_Skill_AN_ProductComparison` | |
| Policy | `90_Policy_INS_RecommendationStandards` | Applied — no guarantee claims |
| Workflow | None (single comparison task) | |
| Execution mode | Mode 3 → Mode 2 | |

---

### Example 3 — Investment Analysis

**User request:** "วิเคราะห์ว่า Tokyo Beyond มี IRR คุ้มค่าสำหรับลูกค้าอายุ 40 ปีไหม?"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | B4 (Risk Assessment), E3 (IRR Calculation) | |
| Domain | D-INV + D-INS | Multi-domain |
| Risk | High (specific client + investment) | |
| Persona | `10_Persona_CIO` (primary), `10_Persona_FinancialPlanner` (supporting) | |
| Knowledge | `30_KB_PR_TokyoBeyond`, `30_KB_DO_InvestmentPrinciples` | |
| Skill | `40_Skill_CA_IRRCalculator`, `40_Skill_AN_InvestmentAnalysis` | Sequential |
| Human gate | Recommended before client delivery | Mode 6 gate |
| Execution mode | Mode 3 + Mode 5 + Mode 6 | Multi-persona + Human gate |

---

### Example 4 — Content Planning

**User request:** "วางแผน Content สำหรับ Facebook เดือนหน้า theme เรื่องภาษี"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | C5 (Content Planning) | |
| Domain | D-MKT + D-TAX (theme knowledge) | |
| Risk | Low | |
| Persona | `10_Persona_CMO` | |
| Knowledge | `30_KB_CO_BrandOS`, `30_KB_RE_TaxThailand2026` (for content accuracy), `30_KB_CU_SalarymanPremium` | |
| Skill | `40_Skill_PL_ContentPlanner` | |
| Workflow | `20_Workflow_CR_ContentProduction` (if full month plan) | |
| Execution mode | Mode 3 or Mode 4 | |
| Clarification | Audience persona? Hook style? | |

---

### Example 5 — Customer Consultation

**User request:** "ลูกค้าใหม่ส่ง LINE มา สนใจวางแผนการเงิน"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | G3 (Client Consultation) | |
| Domain | D-FIN (initial) | May expand after qualification |
| Risk | Medium | New client, no profile yet |
| Persona | `10_Persona_FinancialPlanner` | |
| Knowledge | `30_KB_CU_[Persona matching initial signals]` | |
| Skill | (Multiple, determined within Workflow) | |
| Workflow | `20_Workflow_OP_ClientOnboarding` | Triggered by new client signal |
| Execution mode | Mode 4 (Workflow) | |
| Context signal | New client → build profile during Workflow | |

---

### Example 6 — Document Review

**User request:** "ช่วย review proposal ที่ผมเขียนก่อนส่งลูกค้า"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | F1 (Document Review) | |
| Domain | D-FIN + D-INS (based on proposal content) | |
| Risk | High (client-facing document) | |
| Persona | `10_Persona_FinancialPlanner` | |
| Knowledge | Loaded after document review identifies topics | |
| Skill | `40_Skill_RV_FinancialPlanReview`, `40_Skill_VA_PrinciplesComplianceCheck` | Sequential |
| Workflow | None (standalone review) | |
| Execution mode | Mode 3 | |
| Human gate | No — advisor is doing the reviewing | |

---

### Example 7 — CRM Update

**User request:** "อัปเดตว่า Somchai นัด follow-up วันศุกร์นี้ สนใจ SuperTax"

**Discovery path:**

| Stage | Query | Result |
|-------|-------|--------|
| Intent | G1 (CRM Update) | |
| Domain | D-CRM | |
| Risk | Low | Internal data update |
| Persona | `10_Persona_OperationsManager` | |
| Knowledge | `30_KB_CRM_UpdateProtocol` | |
| Skill | `40_Skill_AU_CRMUpdate` | |
| Workflow | None or `20_Workflow_CRM_Update` | |
| Execution mode | Mode 3 | |
| External tools | `CRM_API` | Must be available |

---

## 13. Migration Strategy

### The Migration Principle

The AIOS file-based architecture is designed with migration in mind. Because all metadata is captured in structured YAML blocks within Markdown documents, and because the Registry Standard defines a stable schema, migration to more powerful discovery and storage infrastructure does not require redesigning AIOS — it requires only implementing the Registry schema in the target platform.

**Migration Principle:** The Registry metadata schema is the migration contract. Any platform that can store and query this schema can host the AIOS Registry.

### Migration Path 1 — File-Based to Registry-Driven Architecture

**Current state:** AIOS artifacts exist as Markdown files in a folder hierarchy. The Registry Index (`90_Registry_Index.md`) is a manually maintained Markdown document.

**Target state:** A dedicated Registry service maintains the metadata in a queryable format. Artifacts remain as Markdown files; the Registry becomes their authoritative index.

**Migration steps:**
1. Extract YAML metadata blocks from all existing artifacts (automated parsing)
2. Populate the Registry service with the extracted metadata
3. Validate against the Universal Metadata Model schema
4. Verify all declared dependencies exist in the Registry
5. Compute initial Quality Scores and Registry Health Metrics
6. Configure the Orchestrator to query the Registry service instead of file-system scanning
7. Run parallel validation: compare Registry-driven routing vs. prior routing for 30 days

**Risk:** Low. Artifact content unchanged. Only the discovery mechanism changes.

---

### Migration Path 2 — File-Based to RAG (Retrieval-Augmented Generation)

**Target state:** Artifact content is chunked and embedded in a vector store. The Registry metadata governs which chunks are candidate sources for any given query.

**Migration steps:**
1. Complete Registry migration (Path 1 first)
2. Parse each artifact document into content chunks
3. Attach Registry metadata to each chunk as vector metadata fields
4. Embed chunks and load into vector store
5. Configure Orchestrator to use Registry for component selection and vector store for content retrieval within selected components
6. The Registry remains the routing layer; the vector store becomes the content retrieval layer

**Architecture principle:** RAG does not replace the Registry. It complements it. The Registry answers "which artifact?" The vector store answers "which passage within that artifact?" The Orchestrator queries Registry first, then retrieves from the vector store within the Registry-identified scope.

---

### Migration Path 3 — File-Based to Vector Database

**Target state:** All artifact metadata and content is stored in a vector database with both semantic search and structured metadata filtering.

**Migration steps:**
1. Complete Registry migration (Path 1)
2. Map Universal Metadata Model fields to vector database metadata schema
3. Embed artifact descriptions and capabilities using a stable embedding model
4. Load embeddings + metadata into the vector database
5. Implement hybrid queries: metadata filters (domain, intent, risk, status) + semantic similarity (description match)
6. The Registry schema serves as the metadata filter specification

**Key design decision:** Vector similarity alone must not replace Registry routing. Semantic similarity does not respect layer boundaries, status filters, or risk-level gates. Registry metadata filters must always be applied before semantic ranking.

---

### Migration Path 4 — File-Based to Knowledge Graph

**Target state:** AIOS artifacts and their relationships are represented as nodes and edges in a knowledge graph (e.g., RDF, Labeled Property Graph).

**Migration steps:**
1. Complete Registry migration (Path 1)
2. Map artifact types to node types in the graph schema
3. Map Registry relationship types (Section 8) to graph edge types
4. Migrate dependency declarations to directed graph edges
5. Migrate routing rules to graph traversal queries
6. The Registry Relationship Model becomes the graph schema

**Advantage:** Knowledge graphs excel at dependency resolution and impact analysis — the operations defined in Section 7 (QT-4 and QT-5) become native graph traversal queries.

---

### Migration Path 5 — Enterprise Metadata Catalog

**Target state:** AIOS Registry is integrated with an enterprise metadata catalog (e.g., Apache Atlas, DataHub, Alation, Collibra) for organization-wide governance.

**Migration steps:**
1. Map Universal Metadata Model to enterprise catalog schema
2. Register artifact types as catalog entity types
3. Map governance fields (approval_status, quality_score, review_frequency) to catalog governance workflows
4. Integrate Registry Health Metrics with catalog data quality dashboards
5. The AIOS Registry becomes a domain within the enterprise catalog

**Key benefit:** AIOS artifacts become discoverable and governable alongside other enterprise data and AI assets under a unified governance framework.

---

### Cross-Path Design Guarantees

Regardless of which migration path is chosen:

1. **The Universal Metadata Model schema is unchanged** — all five layers and all fields remain valid in any target architecture
2. **The Discovery Protocol is unchanged** — the nine stages map to different implementations but the logical flow is identical
3. **The Registry Relationship Model is unchanged** — relationships are defined once and expressed in any graph-capable target
4. **Registry Health Metrics are unchanged** — the KPI definitions are implementation-agnostic
5. **The Orchestrator's query interface is unchanged** — QT-1 through QT-6 define the logical query types; implementation changes what executes them, not what they ask

---

## 14. Metadata Templates

### Full Markdown Registration Block

Every AIOS artifact document must include a Registration Block as its final section, formatted as a fenced YAML code block with the heading `## Registry Metadata`. This block is the machine-readable registration record for the artifact.

#### Minimal Registration Block (Any Artifact Type)

```markdown
## Registry Metadata

​```yaml
# AIOS Registry Entry
# Generated: [YYYY-MM-DD]
# Schema Version: 1.0

identity:
  id: ""
  uuid: ""
  name: ""
  title: ""
  description: ""
  artifact_type: ""        # Persona | Knowledge | Skill | Workflow | Runtime | Policy | Template
  version: "1.0.0"
  status: "Draft"          # Draft | Review | Active | Stale | Deprecated | Retired | Archived
  owner: ""

classification:
  domain: []               # D-FIN | D-INS | D-TAX | D-INV | D-MKT | D-SAL | D-CRM | D-BIZ | D-TEC | D-LEG | D-PRD | D-GEN
  subdomain: []
  capabilities: []
  intent: []               # A1-A5 | B1-B5 | C1-C6 | D1-D5 | E1-E5 | F1-F4 | G1-G5 | H1-H4
  tags: []
  language: []             # th | en | th-en
  audience: []             # salaryman_premium | young_professional | working_mom | sme_owner | all | internal

dependencies:
  required_personas: []
  required_knowledge: []
  required_skills: []
  required_workflows: []
  runtime: null
  external_tools: []
  related_artifacts: []

execution:
  risk_level: ""           # Low | Medium | High | Critical
  execution_mode: ""       # Mode1_DirectAnswer through Mode7_Escalation
  requires_review: false
  requires_clarification: false
  priority: 50

routing_rules:
  if_intent: []
  if_domain: []
  if_risk: []
  preferred_persona: null
  preferred_workflow: null
  preferred_runtime: null
  excluded_if_risk: []
  excluded_if_domain: []
  fallback_strategy:
    on_unavailable: "use_persona_general_capability"
    on_stale_dependency: "proceed_with_caveat"
    on_critical_failure: "escalate_to_human"
  priority: 50

governance:
  approval_status: "Pending"
  quality_score: 0.0
  review_frequency: ""    # monthly | quarterly | semi-annual | annual | on-change-trigger
  review_owner: ""
  last_review: ""
  next_review: ""
  deprecated: false
  replacement: null
  compliance: []
​```
```

#### Extended Skill Registration Block

Adds Skill-specific fields:

```markdown
## Registry Metadata

​```yaml
# [All fields from Minimal Block, plus:]

classification:
  skill_category: ""       # AN | PL | CR | DS | CA | RE | CO | AU | RV | VA | TR

execution:
  confidence_required: 0.85
  estimated_tokens: 0
  estimated_latency: 0

composition:
  can_be_composed_with: []
  composition_pattern: ""  # Sequential | Parallel | Conditional | Loop
  is_sub_skill_of: null
​```
```

#### Extended Workflow Registration Block

Adds Workflow-specific fields:

```markdown
## Registry Metadata

​```yaml
# [All fields from Minimal Block, plus:]

classification:
  workflow_category: ""    # OP | AN | CR | DS | CS | RE | FP | CP | AU

trigger_conditions: []

execution:
  human_gates: []
  estimated_tokens: 0
  estimated_latency: 0

output:
  type: ""
  format: ""
  deliverable_to: ""       # client | internal | system
​```
```

#### Extended Knowledge Registration Block

Adds Knowledge-specific fields:

```markdown
## Registry Metadata

​```yaml
# [All fields from Minimal Block, plus:]

classification:
  knowledge_category: ""   # CO | BU | DO | PR | CU | TE | RE | HI | RF
  knowledge_level: ""      # foundational | operational | reference
  authoritative_source: ""

governance:
  freshness_threshold_days: 90
​```
```

---

## 15. Future Evolution

### The Registry as AIOS Scales

The Registry Standard is designed to remain architecturally stable while the AIOS ecosystem grows by orders of magnitude. This section describes how the Registry enables future AIOS capabilities without requiring changes to the core specification.

### FE-1 — AI Agents

As AIOS evolves toward autonomous AI agents — systems that can initiate tasks, discover components, and act without human prompting for each step — the Registry becomes the agents' primary interface to the AIOS ecosystem.

An AI agent can:
- Query the Registry to discover what capabilities are available in a domain
- Resolve dependencies to understand what context it needs before acting
- Check governance fields to understand whether a human gate is required
- Use the Discovery Protocol to plan a multi-step task before executing it

The Registry enables agents to be self-sufficient without being unconstrained. An agent that can only access components registered (and therefore governed) in the Registry cannot act outside AIOS boundaries.

**No architectural change required.** The Registry query model (QT-1 through QT-6) is already designed for machine consumption.

---

### FE-2 — Multi-Agent Collaboration

When multiple AI agents collaborate on a task — each specializing in a domain, coordinated by a lead agent — the Registry becomes the shared coordination layer.

Each agent can:
- Register its own active capability set as a runtime registration
- Discover peer agents by querying the Persona Registry for complementary capabilities
- Declare handoff points in Workflow dependencies
- Share a single dependency resolution result across all collaborating agents

**The Registry becomes the shared memory of a multi-agent team.**

No change to the core metadata schema is required. Multi-agent entries use the same schema with `artifact_type: "Runtime"` entries representing each agent instance.

---

### FE-3 — Autonomous Workflows

In autonomous workflow execution, a Workflow does not require a human to initiate each step. The Workflow is triggered by conditions in the Registry (e.g., a Knowledge document transitions to `Stale` status and triggers the Knowledge Review Workflow automatically).

This is already described in `08_AI_Workflow_Standard.md` for event-driven workflow patterns. The Registry enables it by providing:
- Status change events (artifact transitions from `Active` to `Stale`)
- Dependency graph traversal (identify which Workflows depend on the changed artifact)
- Trigger condition matching (does the status change satisfy a Workflow's `trigger_conditions`?)

**No architectural change required.** Status fields, dependency graph, and trigger conditions are already in the Registry schema.

---

### FE-4 — Dynamic Routing

As AIOS accumulates routing logs (S17 in the Orchestrator State Machine), patterns emerge: some artifacts are consistently selected over alternatives; some routing rules are never triggered; some domains consistently require fallback. This data enables dynamic, evidence-based routing optimization.

Future routing systems can:
- Adjust `priority` scores based on observed routing accuracy (M7)
- Flag `excluded_if_*` rules that incorrectly exclude high-performing artifacts
- Identify clusters of intents that consistently route to the same Persona and propose a combined routing rule

**The Registry schema supports this without change.** `priority` is already a mutable governance field. Routing logs are already generated at S17. The future addition is the optimization algorithm that reads the logs and proposes Registry updates.

---

### FE-5 — Self-Discovery

A sufficiently advanced AIOS implementation can query its own Registry to answer questions about its own capabilities:

- "What domains can I advise on?" → Query Persona Registry by domain
- "Can I calculate IRR?" → Query Skill Registry by capability
- "What workflows do I have for new clients?" → Query Workflow Registry by intent
- "What Knowledge do I have about tax law?" → Query Knowledge Registry by domain + category

This is not a future feature — it is already possible with the current Registry design. The Orchestrator intent code H4 (Meta / AIOS system questions) routes to this exact behavior.

**No architectural change required.**

---

### FE-6 — Self-Documentation

As new artifacts are created, the Registry accumulates structured metadata that can be used to generate documentation automatically:

- The Master Registry Index can generate its own README from Registry data
- Capability matrices (which domains × intents × personas are covered) are derivable from the Registry
- Coverage gap analysis (which domains have fewer than N registered Skills) is derivable
- Dependency maps can be auto-generated from relationship data

Over time, the Registry becomes the single source of truth for AIOS documentation — not just for machines, but for the humans who maintain and extend the system.

**The self-documentation capability is a natural consequence of consistently maintained Registry metadata.** It does not require a new architectural layer.

---

### Architectural Stability Guarantee

The Universal Metadata Model, Discovery Protocol, Query Model, Relationship Model, Quality Standards, and Health Metrics defined in this document are designed to remain stable across:

- Registry size growth (10× to 1,000× current scale)
- Technology migrations (file system → database → graph → cloud)
- AI model changes (Claude Sonnet → future models → multi-model)
- Organizational growth (single-person → team → enterprise)
- Business domain expansion (Thai market → regional → global)

Any future evolution of the Registry adds to this specification. It does not replace it.

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | `11_AI_Registry_Standard.md` |
| **Version** | 1.0 |
| **Status** | Active |
| **Document Type** | Architectural Specification |
| **Layer** | Foundation — Discovery and Governance |
| **Created** | 2026-06-25 |
| **Review Cycle** | Annual, or when Registry scale exceeds 2× current baseline |
| **Owner** | Chief Metadata and Discovery Architect |
| **Depends On** | All Foundation Documents (01–10) |
| **Referenced By** | All AIOS artifacts (through metadata compliance), Orchestrator (routing queries), Audit Standard (Registry health metrics) |
| **Next Review** | 2027-06-25 |

---

## Version History

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 1.0 | 2026-06-25 | Chief Metadata and Discovery Architect | Initial specification — complete 15-section Registry architecture covering 7 sub-registries, 5-layer Universal Metadata Model with 30+ fields, 7 artifact YAML templates, routing metadata schema, 9-stage discovery protocol, 6 query types, 4 relationship diagrams, 9-stage governance lifecycle, 7 quality dimensions with scoring formula, 10 health KPIs, 7 worked discovery examples, 5 migration paths, full Markdown registration templates, and 6 future evolution patterns |

---

*End of 11_AI_Registry_Standard.md*
