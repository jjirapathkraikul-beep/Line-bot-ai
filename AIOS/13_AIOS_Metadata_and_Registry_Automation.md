# 13_AIOS_Metadata_and_Registry_Automation.md

## Purpose
This document defines AIOS as a metadata-first platform.
It transforms AIOS from a document repository into a governed discovery ecosystem where metadata is the source of truth and the Registry is a generated platform artifact.

This document is architecture-only. It describes the semantics, lifecycle, and automation model for metadata and registry generation.

---

## Why Metadata First
A platform that scales cannot rely on human memory or folder layout alone.
Metadata is the contract that makes AIOS discoverable, composable, and governable.

AIOS treats metadata as the authoritative description of every artifact.
The artifact content remains important, but the metadata is what the Orchestrator, registry, governance engines, and automation tools consume.

Key goals:
- **Discoverability:** Find the right Persona, Skill, Workflow, or Knowledge without manual search.
- **Governance:** Verify artifact status, ownership, review cycle, and compliance systematically.
- **Dependency resolution:** Trace which artifacts depend on which Knowledge, Skills, or Personas.
- **Automation:** Generate registry artifacts from metadata rather than authoring them manually.
- **Evolution readiness:** Support migration to enterprise metadata catalogs, vector stores, and agent runtimes.

---

## Universal Metadata Schema
Every registered AIOS artifact carries metadata organized into five layers.

### Layer 1 — Identity
- `artifact_id`
- `artifact_type`
- `name`
- `description`
- `version`
- `status`
- `created_date`
- `last_updated`

### Layer 2 — Classification
- `category`
- `sub_category`
- `domain`
- `risk_level`
- `audience`
- `relationship_tags`

### Layer 3 — Dependencies
- `requires`
- `consumes`
- `produces`
- `authorized_by`
- `compatible_with`
- `deprecated_by`

### Layer 4 — Execution
- `runtime_profile`
- `routing_metadata`
- `trigger_conditions`
- `input_schema`
- `output_schema`
- `estimated_cost`

### Layer 5 — Governance
- `owner`
- `review_cycle`
- `review_status`
- `approval_status`
- `quality_score`
- `audit_notes`
- `deprecation_date`

These layers are intentionally stable. They support all AIOS artifact types and enable migration to future storage and runtime systems.

---

## Metadata Lifecycle
The metadata lifecycle governs how artifact metadata is authored, reviewed, published, and retired.

### 1. Authoring
- Artifact authors populate metadata in a standard YAML block inside the artifact document.
- Metadata must be complete before the artifact is eligible for registry generation.
- Required fields vary by artifact type but always include identity, classification, and governance.

### 2. Validation
- Metadata is validated against a schema before registry generation.
- Validation checks include field presence, type consistency, dependency existence, and governance coverage.
- Failure to pass validation prevents registry publication.

### 3. Publication
- Valid metadata is extracted and used to generate registry artifacts.
- The Registry is a generated artifact, not a source document.
- The generated Registry becomes the authoritative index for discovery and routing.

### 4. Review
- Artifacts are reviewed according to their `review_cycle`.
- Review status is recorded in metadata and audited periodically.
- Registry generation includes review state to ensure only approved or active artifacts are discoverable.

### 5. Deprecation
- Deprecated artifacts retain metadata and remain discoverable for historical traceability.
- Deprecation metadata includes `deprecated_by`, `deprecation_date`, and replacement recommendations.
- Deprecated artifacts are archived but remain part of the Registry for compatibility.

---

## Metadata Validation
Validation is the quality gate for AIOS metadata.
It is a non-negotiable architectural service.

### Validation categories
- **Schema validation:** Required keys, field types, allowed values.
- **Semantic validation:** Domain consistency, category appropriateness, boundary compliance.
- **Dependency validation:** Referenced artifacts exist and are active or appropriately deprecated.
- **Governance validation:** Owner assigned, review cycle defined, approval status present.
- **Routing validation:** Required routing fields for Orchestrator selection are populated.

### Validation outcomes
- **Pass:** metadata is eligible for registry generation.
- **Warn:** metadata has non-fatal issues that should be reviewed.
- **Fail:** metadata must be corrected before publication.

### Validation governance
- Validation rules are defined in the Registry standard and audited regularly.
- Rule changes require an ADR if they alter metadata semantics.

---

## Registry Generation Pipeline
The Registry is generated from metadata, not created manually.
The generation pipeline consists of the following architecture components.

### 1. Metadata extractor
- Reads artifact documents and extracts YAML metadata blocks.
- Normalizes fields and assigns artifact identifiers.
- Identifies cross-artifact links and dependency references.

### 2. Schema validator
- Validates extracted metadata against artifact-type schemas.
- Reports errors with document location and remediation guidance.

### 3. Registry builder
- Aggregates validated metadata into the federated Registry structure.
- Generates sub-registries for Personas, Knowledge, Skills, Workflows, Runtime, Policy, and Templates.
- Produces a Master Registry Index for cross-registry discovery.

### 4. Registry publisher
- Writes generated registry artifacts to the repository or publishing endpoint.
- Ensures the Registry is authoritative and versioned.

### 5. Registry auditor
- Verifies registry completeness, metadata consistency, and governance status.
- Produces registry quality metrics and audit reports.

---

## Registry Structure
AIOS Registry is a federated architecture.

### Sub-registries
- `Persona Registry`
- `Knowledge Registry`
- `Skill Registry`
- `Workflow Registry`
- `Runtime Registry`
- `Policy Registry`
- `Template Registry`

### Master Registry Index
The Master Registry Index provides:
- cross-registry search
- dependency graph generation
- governance summary
- artifact lifecycle state
- routing metadata federation

### Generated artifacts
- `registry/persona.json` (or equivalent metadata artifact)
- `registry/knowledge.json`
- `registry/skill.json`
- `registry/workflow.json`
- `registry/runtime.json`
- `registry/policy.json`
- `registry/template.json`
- `registry/master-index.json`

The repository may also store human-readable registry summaries in `AIOS/Registry/`.

---

## Discovery Model
The Registry is the platform's discovery layer.

### Discovery responsibilities
- Find the right artifact for a request or task.
- Filter by domain, risk, status, and compatibility.
- Support both human and system queries.
- Provide artifact metadata for runtime selection.

### Discovery interfaces
- **Registry query API:** artifact type, domain, status, tags, owner.
- **Orchestrator routing query:** request profile → candidate artifacts.
- **Governance query:** review state, audit history, quality metrics.

### Discovery semantics
- Discovery is metadata-first, not keyword-first.
- The Registry selects artifacts by contract, not by text similarity alone.
- Search must respect layer boundaries and artifact status.

---

## Routing Metadata
Routing metadata bridges artifact description and runtime selection.
It is the Orchestrator's primary input for artifact selection.

### Required routing fields
- `authorized_domains`
- `authorized_intents`
- `risk_ceiling`
- `communication_style`
- `required_personas`
- `required_skills`
- `trigger_conditions`
- `supported_channels`
- `integration_mode`

### Purpose
- Guide the Orchestrator through persona selection
- Identify candidate Workflows for a request
- Determine which Skills are eligible for a task
- Enforce channel and domain boundaries

### Routing rules
- Routing metadata is evaluated at each Orchestrator selection state.
- Metadata filters are applied before any semantic similarity ranking.
- Artifacts with `status: deprecated` are excluded from active routing.

---

## Dependency Metadata
Dependencies are first-class in AIOS.

### Dependency fields
- `requires`: artifacts that must be present or executed first.
- `consumes`: Knowledge or data inputs the artifact uses.
- `produces`: outputs or artifacts the artifact creates.
- `authorized_by`: Personas or governance approvals required.
- `compatible_with`: runtime profiles or version ranges.
- `deprecated_by`: replacement artifacts.

### Dependency semantics
- Dependencies form a directed acyclic graph when artifacts are active.
- Circular dependencies are governance violations.
- Dependency metadata enables impact analysis and migration planning.

---

## Governance Metadata
Governance metadata makes AIOS auditable and accountable.

### Governance fields
- `owner`
- `review_cycle`
- `review_status`
- `approval_status`
- `quality_score`
- `audit_notes`
- `deprecation_date`
- `human_approver`
- `governance_comments`

### Governance semantics
- Every artifact has a named owner.
- Review cycles are defined by artifact type and risk profile.
- Approval status is required for active artifacts.
- Quality score is calculated from metadata completeness and validation results.

---

## Registry Generator Architecture
The registry generator is a platform service architecture, not an implementation.

### Architectural components
- **Extractor:** parses documents and extracts metadata blocks.
- **Normalizer:** standardizes field names and values.
- **Validator:** enforces schema and semantic rules.
- **Builder:** assembles sub-registries and master indexes.
- **Publisher:** writes registry artifacts and publishes metadata snapshots.
- **Monitor:** tracks generation health and registry quality.

### Interfaces
- Document repository interface (`read-only`) to source artifacts.
- Registry storage interface (`write`) to publish generated metadata.
- Validation engine interface to enforce schema rules.
- Audit interface to report metadata health.

### Design goals
- **Idempotence:** repeated generation produces the same registry given the same source metadata.
- **Traceability:** every published registry artifact references its source documents.
- **Extensibility:** new artifact types can be added without redesign.
- **Non-destructiveness:** source documents remain authoritative; generated registry artifacts are derived.

---

## Metadata Conventions
Standard conventions reduce ambiguity and increase automation.

### Metadata block format
Every artifact document ends with a `## Registry Metadata` YAML block.
Example:

```yaml
## Registry Metadata
artifact_id: aios.persona.financial_planner
artifact_type: persona
version: 1.0.0
status: active
category: advisory
domain: financial_planning
owner: Knowledge Team
review_cycle: quarterly
review_status: pending
routing_metadata:
  authorized_domains:
    - financial_planning
  risk_ceiling: medium
  supported_channels:
    - line_chatbot
    - website
```

### Naming conventions
- `artifact_id` is stable and namespace-qualified.
- `version` follows semantic versioning.
- `status` values: `draft`, `active`, `aging`, `deprecated`, `archived`.
- `domain` uses canonical domain names from the AIOS glossary.
- `owner` is a human or team role, not a generic label.

### Tagging conventions
- Use `relationship_tags` for cross-cutting concerns.
- Tag values are normalized to a shared vocabulary.
- Example tags: `financial_advice`, `regulatory`, `high_risk`, `voice_channel`.

---

## Artifact Templates
Templates define the metadata contract for each artifact type.

### Persona metadata template
- artifact_id
- artifact_type: persona
- version
- status
- owner
- category
- domain
- authorized_domains
- authorized_intents
- risk_ceiling
- supported_channels
- approval_status
- review_cycle

### Knowledge metadata template
- artifact_id
- artifact_type: knowledge
- category
- domain
- knowledge_level
- authoritative_source
- review_cycle
- last_reviewed
- status
- related_documents

### Skill metadata template
- artifact_id
- artifact_type: skill
- skill_category
- capabilities
- required_inputs
- output_types
- required_knowledge
- authorized_personas
- estimated_tokens
- success_criteria_summary
- status

### Workflow metadata template
- artifact_id
- artifact_type: workflow
- workflow_category
- trigger_conditions
- required_personas
- required_skills
- required_knowledge
- estimated_duration
- human_gates
- status

### Runtime metadata template
- artifact_id
- artifact_type: runtime
- model_name
- model_provider
- context_window
- supported_modes
- tool_access
- deployment_environment
- performance_profile
- status

### Policy metadata template
- artifact_id
- artifact_type: policy
- policy_scope
- applies_to_artifact_types
- applies_to_domains
- risk_levels_governed
- enforcement_level
- status

---

## Registry Quality Metrics
Quality metrics quantify registry health.

### Key metrics
- **Metadata Completeness:** percentage of required metadata fields populated.
- **Routing Coverage:** percentage of active artifacts with complete routing metadata.
- **Dependency Integrity:** percentage of referenced artifacts that exist and are active or deprecated cleanly.
- **Review Currency:** percentage of artifacts with current review status.
- **Governance Coverage:** percentage of active artifacts with assigned owners and approval status.

### Target ranges
- Metadata Completeness: >= 95%
- Routing Coverage: >= 95%
- Dependency Integrity: 100%
- Review Currency: >= 90%
- Governance Coverage: 100%

### Quality enforcement
- Metrics are calculated on every registry generation.
- Failures trigger governance review and remediation.
- Quality dashboards are part of the Registry automation architecture.

---

## Knowledge Graph Readiness
Metadata should be designed to support a knowledge graph architecture.

### Graph-ready metadata
- Use explicit `requires`, `consumes`, `produces`, and `related_to` relationships.
- Assign canonical artifact identifiers.
- Capture provenance, ownership, and review state.

### Graph capabilities
- Discover related artifacts through typed relationships.
- Enable impact analysis and lineage tracing.
- Support advanced queries such as "which workflows depend on deprecated skills?"

### Migration path
- The Registry generator can emit graph-ready metadata as triples or edge lists.
- A future graph engine can consume those outputs without changing the underlying AIOS artifact model.

---

## Vector Database Readiness
AIOS supports hybrid discovery: metadata filtering plus semantic similarity.

### Key architectural rule
**Metadata filters must always be applied before semantic ranking.**

### Readiness requirements
- Embed artifact identifiers and domains as vector metadata.
- Preserve artifact `status`, `risk_level`, and `review_state` as filterable fields.
- Ensure semantic search does not bypass layer boundaries or governance rules.

### Hybrid discovery model
- Use metadata to narrow candidates.
- Use semantic similarity to rank within the candidate set.
- Keep the Registry as the source of truth for eligibility and routing.

---

## Future AI Agent Compatibility
AIOS metadata supports future agent runtimes and marketplace interactions.

### Agent-ready metadata characteristics
- Machine-readable artifact contracts
- Explicit routing and capability metadata
- Governance and review state
- Compatibility constraints and version ranges

### Platform support goals
- Agents should be able to query the Registry to discover available capabilities.
- Agents should be able to infer which artifacts are safe to invoke based on metadata.
- Agents should be able to contribute metadata updates through governed workflows.

### Marketplace readiness
- Metadata should expose artifact categories, capabilities, and compatibility.
- Future marketplaces can catalog AIOS assets using the same metadata schema.
- Registry automation enables packaging AIOS artifacts for discovery and consumption.

---

## Architectural Notes
- The Registry is a generated artifact, not a manual index.
- Metadata is the contract between authors, consumers, and runtime systems.
- The artifact content remains important; metadata is the means by which the platform manages and discovers it.
- Future infrastructure may store metadata in enterprise catalogs, vector stores, or graph databases, but the schema remains stable.
