# 12_AIOS_Repository_Convention.md

## Purpose
This document defines the permanent repository architecture standard for AIOS as a reusable platform product.
It establishes the official conventions for how AIOS and its consumers are organized, named, versioned, released, and evolved.

This document is the reference for every future contributor, application integration, and platform evolution decision.

---

## Philosophy
AIOS is a platform, not an application.
The repository exists to make platform assets discoverable, governed, reusable, and consumable by multiple applications without duplication.

Key principles:
- **Platform first:** AIOS contains the single source of truth for capabilities, knowledge, workflows, personas, and governance.
- **Consumer isolation:** Applications consume AIOS; they do not own AIOS.
- **Boundary clarity:** Platform artifacts and application artifacts are separated by folder, naming, and governance.
- **Metadata awareness:** Artifact metadata and registry records are first-class citizens.
- **Evolution over redesign:** The repository structure must scale without requiring architectural redesign.
- **Governed change:** All structural changes are recorded through ADRs and versioned by layer.

---

## Repository Hierarchy
The AIOS repository is organized around a stable top-level layout.

```
AIOS/
  01_AI_Vision.md
  01_AI_Principles.md
  02_AI_Constitution.md
  03_AI_Context_Framework.md
  04_AI_Decision_Framework.md
  05_AI_Persona_Template.md
  06_AI_Knowledge_Standard.md
  07_AI_Skill_Standard.md
  08_AI_Workflow_Standard.md
  09_AI_Architecture_Audit.md
  10_AI_Orchestrator_Spec.md
  11_AI_Registry_Standard.md
  Claude.md
  README.md
  Personas/
  Workflows/
  KnowledgeBase/
  Skills/
  Registry/
  Templates/
  ADR/
  Shared/
  _archive/
Applications/
  Line_Chatbot_AI/
  Website_AI/
  CRM_AI/
  Facebook_AI/
  Voice_AI/
  FutureApp_X/
Shared/
ADR/
```

### Root Directory
- `AIOS/` is the platform layer.
- `Applications/` contains consumer apps that implement channel-specific integration.
- `Shared/` contains cross-application assets not owned by any one app.
- `ADR/` contains architectural decision records.
- `_archive/` is an append-only store for deprecated documents.

All platform artifacts that are part of AIOS live under `AIOS/` unless explicitly defined as shared or governance support.

---

## AIOS Folder Convention
AIOS is organized by artifact category, not by technology.
Each folder contains only one type of artifact.

### Foundation
- Core platform documents remain highly visible at the AIOS root.
- Foundation documents are the governance and architecture anchors.
- Example files: `01_AI_Vision.md`, `01_AI_Principles.md`, `02_AI_Constitution.md`.

### Personas/
- Contains all active and draft Persona definitions.
- File naming: `10_Persona_[Role].md`.
- Persona documents define role, scope, decision style, and approved capabilities.

### Workflows/
- Contains all orchestrated, multi-step process definitions.
- File naming: `20_Workflow_[Category]_[Name].md`.
- Workflows coordinate Personas, Skills, and Knowledge.

### KnowledgeBase/
- Contains all verified domain facts and business knowledge.
- File naming: `30_KB_[Category]_[Name].md`.
- Categories include: `Core`, `Business`, `Domain`, `Product`, `Customer`, `Technical`, `Regulatory`, `Historical`, `Reference`.

### Skills/
- Contains reusable capability definitions.
- File naming: `40_Skill_[Category]_[Name].md`.
- Categories include: `Analysis`, `Planning`, `Recommendation`, `Automation`, `Validation`, `Composition`, `Tooling`.

### Registry/
- Contains registry artifacts and generated registry metadata if stored in the repository.
- File naming: `90_Registry_[Application|Artifact].md`.
- The registry describes the discovery, dependency, and governance state of all AIOS artifacts.

### Templates/
- Contains reusable authoring templates.
- File naming: `50_Template_[Type]_[Name].md`.
- Templates are the starting point for new AIOS artifacts.

### Shared/
- Contains cross-application platform utilities, common prompts, shared schemas, and universal connector definitions.
- This folder is for reusable support assets, not application-specific behavior.

### ADR/
- Contains architectural decision records.
- File naming: `ADR-XXXX-[ShortTitle].md`.
- Every structural, governance, or boundary decision is recorded here.

### _archive/
- Contains deprecated or retired artifacts.
- Documents are moved here when they are no longer active but must remain part of the platform history.
- Files are never deleted from archive.

---

## Application Folder Convention
Each application is a consumer of AIOS.
Applications may include channel-specific code, adapters, tests, and integration documentation.

General rules:
- Application folders live under `Applications/`.
- Applications may use `aios/` or `platform/` adapters, but they must not duplicate AIOS platform artifacts.
- Application-specific AIOS extensions are only permitted as thin adapters when no platform equivalent exists.
- AIOS platform docs are never authored inside application folders.

Recommended application structure:

```
Applications/Line_Chatbot_AI/
  README.md
  app/
  lib/
  types/
  tests/
  config/
  docs/
  integration/
  aios-consumer.md
```

### Application contents
- `README.md` describes application purpose, AIOS dependencies, and compatibility requirements.
- `app/`, `lib/`, `types/`, and `tests/` contain application-specific implementation.
- `integration/` contains channel adapters and runtime integration documentation.
- `aios-consumer.md` describes which AIOS artifacts the application consumes and how.

---

## Knowledge Organization
Knowledge documents are the single source of truth for domain facts.

### Category naming
- `Core`: platform mission, values, identity
- `Business`: strategy, market, processes
- `Domain`: professional domain knowledge
- `Product`: product and service specifications
- `Customer`: user segments and behaviors
- `Technical`: systems and architecture knowledge
- `Regulatory`: compliance and legal requirements
- `Historical`: cases, patterns, lessons learned
- `Reference`: tables, glossaries, mappings

### Document structure
Every knowledge document must include:
- Header metadata (`Version`, `Effective Date`, `Status`, `Review Cycle`)
- Scope section
- Core concepts and definitions
- Rules and constraints
- Related documents
- Version history
- Registry metadata block

### Single source principle
- Every fact must live in one knowledge document.
- If a fact is used in multiple places, reference the authoritative document.
- Duplicate knowledge is a governance violation.

---

## Skill Organization
Skills are reusable capabilities, not Personas.

### Naming
`40_Skill_[Category]_[Name].md`

### Categories
- `Analysis`
- `Planning`
- `Recommendation`
- `Automation`
- `Validation`
- `Composition`
- `Tooling`

### Skill requirements
- Clear capability statement
- Required inputs and outputs
- Authorized Personas
- Required Knowledge dependencies
- Success criteria and failure modes
- Registry metadata

### Boundaries
- Skills do not contain domain knowledge.
- Skills do not make final recommendations.
- Skills are invoked by Personas or Workflows.

---

## Workflow Organization
Workflows are the orchestrated sequences that deliver multi-step outcomes.

### Naming
`20_Workflow_[Category]_[Name].md`

### Requirements
- Trigger conditions
- Required Personas
- Required Skills
- Required Knowledge
- Human gates and decision points
- Exception handling
- Execution traceability
- Registry metadata

### Workflow boundaries
- Workflows do not embed knowledge facts.
- Workflows do not replace Personas.
- Workflows orchestrate steps; they do not perform them.

---

## Persona Organization
Personas define expert identity and judgment.

### Naming
`10_Persona_[Name].md`

### Requirements
- Role statement
- Scope and boundaries
- Decision style calibration
- Authorized Knowledge and Skills
- Communication style
- Escalation rules
- Registry metadata

### Persona boundaries
- Personas do not own platform Knowledge.
- Personas do not define workflow sequencing.
- Personas apply decision frameworks to real requests.

---

## Registry Organization
The Registry is the discovery and governance index.

### Structure
- `AIOS/Registry/` contains registry documents and metadata reference artifacts.
- Each AIOS artifact contains a `## Registry Metadata` section.
- Registry entries may be generated from artifact metadata.

### Registry responsibilities
- Discovery of Personas, Skills, Workflows, and Knowledge
- Dependency resolution
- Routing metadata for the Orchestrator
- Governance status and review state
- Historical lineage and audit readiness

---

## Testing Organization
Testing is architecture, not code.

### Platform tests
- `AIOS/tests/` contains architecture validation, registry health checks, and metadata consistency tests.
- Tests verify artifact metadata, dependency integrity, naming conventions, and registry completeness.

### Application tests
- Each application contains its own consumer tests.
- Applications verify AIOS contract compliance, adapter behavior, and runtime integration.

### Test naming
- `XX_[Type]_[Scope]_[Description].md` for architecture test plans
- `test_*.spec` for executable tests within application folders

---

## Naming Convention
File and folder naming are the foundation of discoverability.

### File naming rules
- Use `NN_Category_Descriptor.md`
- Zero-pad numeric prefixes: `01_`, `10_`, `20_`, `30_`, `40_`, `50_`, `90_`
- Use underscores as separators
- Use TitleCase for descriptor segments
- Avoid spaces, hyphens, and special characters
- Make names self-explanatory

### Folder naming rules
- Use TitleCase
- No spaces or special characters
- Use plural nouns for category folders
- Keep folder names stable over time

### Examples
- `10_Persona_FinancialPlanner.md`
- `20_Workflow_CustomerConsultation.md`
- `30_KB_Regulatory_FundTaxRules.md`
- `40_Skill_PortfolioAnalysis.md`
- `90_Registry_LineChatbot.md`

---

## Semantic Versioning
AIOS uses semantic versioning across all documents and released artifacts.

### Format
`MAJOR.MINOR.PATCH`

### Meaning
- `MAJOR`: Breaking change that may require downstream artifact updates.
- `MINOR`: Additive, backward-compatible enhancement.
- `PATCH`: Corrections that do not alter behavior.

### Layer velocity
- Vision: very low
- Principles: low
- Constitution: low
- Process: moderate
- Runtime: moderate
- Personas: moderate
- Knowledge: high
- Skills: moderate
- Workflows: moderate

---

## AIOS Release Strategy
The platform is released as a set of managed artifacts rather than a single monolithic product.

### Release elements
- `AIOS/VERSION` or root release marker
- `CHANGELOG.md` for platform-level releases
- `RELEASE_NOTES/` for published release notes
- Registry version annotations

### Release cadence
- `PATCH` releases for fixes and metadata corrections
- `MINOR` releases for new platform capabilities, new Persona/Skill/Workflow artifacts, and compatibility-preserving improvements
- `MAJOR` releases for breaking changes to platform contracts, registry schema, or artifact boundaries

### Release decision criteria
- Platform release occurs when a set of coordinated artifacts reaches readiness and governance approval.
- Major releases require an ADR or change proposal, impact analysis, and human governance sign-off.

---

## Application Dependency Strategy
Applications declare and consume AIOS capabilities explicitly.

### Dependency rules
- Applications depend on AIOS metadata and registry contracts, not raw document copies.
- Cross-application assets in `Shared/` are consumed by applications when the dependency is genuinely shared.
- Applications should use a small, explicit adapter layer for AIOS consumption.
- Applications must document their AIOS dependencies in a consumer manifest.

### Version pinning
- Applications pin the AIOS release or registry version they support.
- Compatibility requirements are documented in each application's `README.md`.

---

## Repository Evolution
The repository must evolve through governed, auditable steps.

### Evolution mechanisms
- Use ADRs for architecture decisions
- Use semantic versioning for all document changes
- Archive deprecated artifacts rather than deleting them
- Keep platform boundaries stable and explicit

### Stability rules
- Never move a platform artifact into an application folder without an ADR.
- Never duplicate knowledge or skill artifacts across folders.
- When a folder convention changes, document the migration plan in ADR and maintain compatibility during transition.

---

## Examples
### Platform artifact example
`AIOS/Personas/10_Persona_FinancialPlanner.md`

### Workflow artifact example
`AIOS/Workflows/20_Workflow_CustomerConsultation.md`

### Knowledge artifact example
`AIOS/KnowledgeBase/Product/30_KB_Product_LifeInsuranceSuperTax.md`

### Registry artifact example
`AIOS/Registry/90_Registry_LineChatbot.md`

### Application consumer example
`Applications/Line_Chatbot_AI/aios-consumer.md`

---

## Migration Guide
When AIOS evolves, migrate artifacts safely.

### Migration principles
1. Preserve the single source of truth.
2. Do not duplicate platform content in applications.
3. Record all structural changes in an ADR.
4. Update registry metadata before moving artifacts.
5. Validate application compatibility before completing the migration.

### Common migration scenarios
- **New folder convention:** introduce the convention, phase in the new structure, update registry metadata, archive old paths gradually.
- **Artifact relocation:** move only one category at a time, update references, and produce a migration note.
- **Repository refactor:** coordinate with application owners and preserve the old release until consumers are updated.

---

## Future Scalability
This repository convention is designed for 10+ years of growth.

### Scalability drivers
- Stable layer boundaries that avoid redesign
- Metadata-driven discovery and governance
- Clear folder and naming rules that support hundreds of artifacts
- Application dependency contracts that preserve platform ownership
- Versioning and release discipline that manage change safely

### Scalability signals
- Support for 500+ Personas
- Support for 5,000+ Knowledge documents
- Support for 2,000+ Skills and Workflows
- Support for multiple application channels and future AI products

### Long-term maintainability
- Maintain a minimal root structure.
- Keep platform governance visible and accessible.
- Evolve conventions through ADRs, not through undocumented drift.
