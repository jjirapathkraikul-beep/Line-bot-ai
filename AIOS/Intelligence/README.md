# AIOS Intelligence Architecture

**Document Series**: Phase 11 — Intelligence Architecture  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect + Human Product Owner  
**Approved From**: Phase 11.0A Architecture & Capability Audit

---

## What This Folder Contains

This folder defines the **AIOS Intelligence Architecture** — the conceptual and governance layer that assigns clear ownership of every intelligence capability in the platform.

Intelligence Architecture does **not** contain runtime code, prompt templates, or product knowledge.  
It defines **who owns what, who consumes what, and how capabilities interact**.

---

## Reading Order

| Order | File | Purpose |
|---|---|---|
| 1 | `00_INTELLIGENCE_OVERVIEW.md` | Why Intelligence Architecture exists; relationship to ACE, AEE, ACP |
| 2 | `01_SINGLE_SOURCE_OF_INTELLIGENCE.md` | SSI principle; one owner per capability |
| 3 | `02_INTELLIGENCE_TAXONOMY.md` | The 7 intelligence domains — mission, owned/consumed capabilities |
| 4 | `03_SHARED_DATA_MODEL.md` | Shared concepts used across all intelligences |
| 5 | `04_SHARED_STATE_MACHINE.md` | Customer and advisor journey states |
| 6 | `05_SHARED_SIGNAL_FRAMEWORK.md` | Signal taxonomy across all intelligence domains |
| 7 | `06_INTELLIGENCE_INTERACTION_MODEL.md` | How the 7 intelligences interact in one customer turn |
| 8 | `07_INTELLIGENCE_ROADMAP.md` | P0–P3 staged roadmap of intelligence capabilities |
| 9 | `08_INTELLIGENCE_GOVERNANCE.md` | How new intelligence capabilities are approved |
| 10 | `09_INTELLIGENCE_BOUNDARY_MAP.md` | Maps each intelligence to existing AIOS folders |

---

## The 7 Intelligence Domains

| # | Intelligence | Primary Question Answered |
|---|---|---|
| 1 | Conversation Intelligence | What is this conversation about and how should it flow? |
| 2 | Customer Intelligence | Who is this customer and what do we know about them? |
| 3 | Commercial Intelligence | What is the commercial potential and what action leads to conversion? |
| 4 | Product Intelligence | What product knowledge is relevant and accurate for this conversation? |
| 5 | Learning Intelligence | What can be improved and how do we govern that improvement? |
| 6 | Business Intelligence | How is AIOS performing as a platform and as a business? |
| 7 | Advisor Intelligence | How do we support the human advisor with the best possible context? |

---

## Relationship to Phase 11.0A Audit

This architecture is derived directly from the **Phase 11.0A Architecture & Capability Audit** findings. All SSI assignments, gap identifications, and roadmap items trace back to that report.

**Key finding from the audit:**
> AIOS has exceptional specification maturity (~90th percentile) and solid Gen1 runtime implementation (~60th percentile). The primary gap is the absence of named intelligence owners for capabilities that already exist or are in progress.

Intelligence Architecture closes that gap by assigning ownership, preventing duplication, and defining the interaction model.

---

## The Core Rule

> **Intelligence documents define ownership and reasoning, not implementation.**

An Intelligence document tells you:
- Which module owns a capability
- Which modules consume it
- What inputs it receives and what outputs it produces
- How it interacts with other intelligences

An Intelligence document does **not** contain:
- TypeScript code or function definitions
- System prompt content
- Insurance product facts or pricing
- Runtime configuration

For implementation, see `runtime-gen1/`.  
For knowledge content, see `AIOS/Domains/`.  
For capability specifications, see `AIOS/CapabilityPackages/`.

---

## Future Domains

This intelligence layer is designed to be domain-independent. While the current implementation serves the Insurance advisory domain, the Intelligence Architecture applies equally to:

- Investment Advisory
- Tax Planning
- Healthcare Advisory
- Hotel / Hospitality
- Content Automation
- Future AI Advisor Departments

Domain-specific knowledge lives in `AIOS/Domains/`. The Intelligence layer does not change per domain.
