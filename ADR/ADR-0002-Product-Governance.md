# ADR-0002: Product Governance Boundary for AIOS

## Status
Proposed

## Context
AIOS is being governed as a platform product. Existing AIOS documentation blends platform architecture, product references, and governance rules. The current mandate is explicit: Product ownership must remain with a human Product Owner, while platform architecture and implementation remain within Claude's authority.

This ADR establishes the governance boundary that separates product definition from platform architecture and implementation. It is intended to make future contributions consistent with the new ownership model and prevent architecture from defining product direction.

## Decision
- Adopt a strict ownership model:
  - Product Owner (Human) owns all product direction, vision, and success metrics.
  - Platform Strategy (ChatGPT) recommends product-aware architectural approaches.
  - Platform Architecture (Claude) owns the architecture design, metadata, compatibility, and governance constructs.
  - Implementation (Claude) executes the platform artifacts and runtime delivery.
- Require that all architecture work affecting product outcomes be based on explicit Product Owner inputs.
- Treat product-level assumptions as provisional until validated by the Product Owner.
- Record product governance decisions in ADRs, product definition checklists, and review reports.

## Consequences
- Architecture work can proceed only when product definition is clear enough to establish platform contracts.
- Product direction remains human-owned, reducing the risk of architecture-led product drift.
- Platform governance becomes a service to product decisions rather than a source of product decisions.
- Review processes must include a Product Owner verification step for any work that touches product scope, consumer promises, or market positioning.

## Governance Rules
1. **Product Definition First.** No major architectural change may be approved without a documented Product Definition Checklist.
2. **Product Approval Required.** Proposed changes that assume product decisions require explicit Product Owner approval before implementation begins.
3. **Product Recommendations Only.** Platform Strategy may offer product trade-offs and gaps, but may not decide product direction.
4. **Architecture Escalation.** If product requirements are incomplete, ambiguous, or conflicting, architecture work pauses and product clarification is requested.
5. **Document Separation.** Product documents belong in AIOS product or business documentation, not in architecture-only governance documents unless explicitly tagged as product input.
6. **Platform Artifact Governance.** Architecture and implementation artifacts should reference product inputs, not replace them.

## Review and Compliance
- Include this ADR as part of the governance review checklist for any architecture or product-facing change.
- Audit the following documents for compliance:
  - `AIOS/Claude.md`
  - `AIOS/14_AIOS_Product_Architecture.md`
  - `AIOS/12_AIOS_Repository_Convention.md`
  - `AIOS/13_AIOS_Metadata_and_Registry_Automation.md`
  - `AIOS/09_AI_Architecture_Audit.md`
- Add a Product Governance Review Report to document how each affected artifact aligns with this ownership model.

## Notes
- This ADR does not define the product itself. It defines the governance boundary that protects product ownership from architecture ownership.
- It assumes the Product Owner will provide the missing product inputs through a separate product definition process.

## Version History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | 2026-06-26 | Claude | Initial creation |
