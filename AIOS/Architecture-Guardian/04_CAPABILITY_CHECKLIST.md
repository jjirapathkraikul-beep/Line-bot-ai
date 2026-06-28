# 04 — Capability Checklist

**Document ID**: AIOS-AGS-04  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Reference**: `01_ARCHITECTURE_GATES.md` (Gate 2 — Capability Audit), `05_SSI_ENFORCEMENT.md` (SSI)

---

## Purpose

Every new capability proposed for AIOS must complete this 14-point checklist before implementation is authorized.

This checklist is the evidence document for Gates 2, 3, 4, and 5. A capability that cannot answer all 14 questions is not ready for architecture review.

No capability review proceeds without a completed checklist.

---

## Definitions

**Capability**: Any discrete unit of logic, data processing, intelligence, or decision-making that AIOS performs. Examples: trust detection, intent classification, lead scoring, memory resolution, knowledge retrieval, handoff triggering, recommendation generation.

**Capability does not mean**: a UI feature, a conversation topic, a product category, or a user-facing option. Those are product features, not capabilities.

---

## The 14-Point Capability Checklist

Complete every item. Do not leave items blank. "N/A" is acceptable with justification.

---

### Point 1 — Problem Statement

**Question**: What specific problem does this capability solve?

**Required form**: "When [condition], AIOS currently [current behavior]. This causes [specific negative outcome]. This capability solves this by [mechanism]."

**Acceptable answer**: "When a customer states their medical condition, AIOS currently does not flag this for compliance review. This causes mandatory uncertainty disclaimers to be omitted. This capability solves this by detecting medical disclosure keywords and setting `isMedicalSignal = true`."

**Unacceptable answer**: "This makes the system smarter." / "It would be useful to have this."

---

### Point 2 — Business Value

**Question**: What measurable business value does this capability deliver?

**Required form**: Which KPI does this improve? By how much? How is improvement measured?

**Reference**: Metric definitions in `AIOS/Beta/09_METRIC_DEFINITIONS.md`

**Acceptable answer**: "Reduces Re-ask Rate by ensuring medical disclosure is remembered across turns. Target: Re-ask Rate from current baseline to ≤ 5%."

**Unacceptable answer**: "Improves the customer experience."

---

### Point 3 — Existing Capability Search

**Question**: Does this capability already exist in AIOS? Where was searched? What was found?

**Required form**: Provide a search log.

| Location | Searched | Found | Notes |
|---|---|---|---|
| `AIOS/Intelligence/` | Yes / No | [what found] | |
| `AIOS/CapabilityPackages/` | Yes / No | [what found] | |
| `AIOS/Execution/` | Yes / No | [what found] | |
| `AIOS/ContextEngine/` | Yes / No | [what found] | |
| `AIOS/Learning/` | Yes / No | [what found] | |
| `runtime-gen1/` | Yes / No | [what found] | |
| `lib/` | Yes / No | [what found] | |
| `Applications/` | Yes / No | [what found] | |

**Result**: Does not exist / Partially exists in [location] / Fully exists in [location]

If partially or fully exists: explain why creation is still required, or confirm that this is an extension.

---

### Point 4 — Owner

**Question**: Who is the single intelligence domain or architectural layer that owns this capability?

**Required form**: Exactly one owner from the list below.

| Owner Option | When Appropriate |
|---|---|
| Conversation Intelligence | Intent, strategy, conversation flow |
| Customer Intelligence | Memory, trust, medical, customer profile |
| Commercial Intelligence | Lead scoring, recommendations, objections |
| Product Intelligence | Knowledge retrieval, product facts, mandatory fragments |
| Learning Intelligence | Quality audit, issue tracking, pattern library |
| Business Intelligence | Analytics events, KPI tracking, business metrics |
| Advisor Intelligence | Handoff context, human advisor interface |
| Foundation Layer (L1-L3) | Vision, Principles, Constitution components |
| Context Engine (ACE) | Context assembly, schema validation |
| Execution Engine (AEE) | Pipeline steps, execution logic |
| Runtime Layer | Gen1 pipeline infrastructure |
| Application Layer | Application-specific logic |

**Owner stated**: ___________

**Justification**: Why this owner and not another?

---

### Point 5 — Consumers

**Question**: Which components will consume this capability?

**Required form**: List every known consumer.

| Consumer | What they consume | Read-only? |
|---|---|---|
| [component] | [what data/output] | Yes / No |
| | | |

**Note**: No consumer may be read-write. If a consumer needs to modify behavior, it must submit a request to the owner, not fork the capability.

---

### Point 6 — Dependencies

**Question**: What does this capability depend on to function?

**Required form**: List every dependency.

| Dependency | Type | Availability |
|---|---|---|
| [component name] | Data / Runtime / Infrastructure / Document | Always / Conditional |
| | | |

**Failure mode**: What happens if a dependency is unavailable? Is graceful degradation defined?

---

### Point 7 — Knowledge Source

**Question**: Where does the knowledge that this capability uses come from?

**Required form**: Identify the authoritative knowledge source.

| Knowledge need | Source | Owned by |
|---|---|---|
| [what knowledge] | [document, database, or rule] | [intelligence domain] |
| | | |

**SSI check**: Is the knowledge owned by the same intelligence domain that owns this capability? If not, identify the knowledge owner and confirm read-only access.

---

### Point 8 — Runtime Impact

**Question**: How does this capability affect the Gen1 pipeline runtime?

**Required form**: Answer each question.

| Question | Answer |
|---|---|
| Which pipeline step(s) does this touch? | |
| Does this change prompt construction (Section 1–13)? | Yes / No / Which section |
| Does this change memory resolution? | Yes / No |
| Does this change decision making? | Yes / No |
| Does this change knowledge resolution? | Yes / No |
| Does this add or modify a log event? | Yes / No / Which event |
| What is the estimated latency impact? | Negligible / < 100ms / 100–500ms / > 500ms |
| Does this require KV reads? | Yes / No / How many |
| Does this require KV writes? | Yes / No / How many |

---

### Point 9 — Commercial Impact

**Question**: Does this capability affect any commercial flow?

**Required form**: Answer each question.

| Question | Answer |
|---|---|
| Does this affect lead scoring? | Yes / No |
| Does this affect lead capture timing? | Yes / No |
| Does this affect recommendation delivery? | Yes / No |
| Does this affect handoff triggering? | Yes / No |
| Does this affect trust flow (which gates lead capture)? | Yes / No |
| Does this affect medical flow (which gates recommendations)? | Yes / No |

If YES to any: this capability requires Commercial Intelligence review in addition to Guardian review.

---

### Point 10 — Learning Impact

**Question**: Does this capability affect the Learning System?

**Required form**: Answer each question.

| Question | Answer |
|---|---|
| Does this change what is logged? | Yes / No |
| Does this add new audit signals? | Yes / No |
| Does this affect issue categorization? | Yes / No |
| Does this affect pattern detection? | Yes / No |
| Does this require new test coverage in the audit schema? | Yes / No |

If YES to any: a Learning Intelligence Change Proposal is required in addition to Guardian review.  
Reference: `AIOS/Learning/06_CHANGE_PROPOSAL.md`

---

### Point 11 — Migration Impact

**Question**: Does this capability require migration of existing data, logic, or behavior?

**Required form**: Answer each question.

| Question | Answer |
|---|---|
| Does this deprecate an existing capability? | Yes / No / Which |
| Does this require data migration in KV? | Yes / No |
| Does this change the behavior of existing customers' sessions? | Yes / No |
| Does this break any existing test? | Yes / No |
| Does this require existing consumers to change their interface? | Yes / No |

If deprecation: provide ADR reference or confirm ADR will be created before implementation.

---

### Point 12 — Removal Strategy

**Question**: How would this capability be removed if it were no longer needed?

**Required form**: Define the removal path.

| Removal question | Answer |
|---|---|
| What would be required to remove this? | |
| What components would break? | |
| What data would be orphaned? | |
| How long would removal take? | |
| Is removal possible without a migration? | Yes / No |

**Note**: If removal requires more than 1 sprint of work, this is architecture debt. Register it in `10_ARCHITECTURE_DEBT_REGISTER.md`.

---

### Point 13 — Domain Independence Test

**Question**: Does this capability work across all AIOS domains, or is it domain-specific?

| Domain | Works without modification? | Modification needed? |
|---|---|---|
| Insurance (current) | Yes / No | |
| Investment | Yes / No | |
| Tax | Yes / No | |
| Healthcare | Yes / No | |
| Hotel | Yes / No | |
| Content Automation | Yes / No | |
| Future AI Advisors | Yes / No | |

If domain-specific: document why it cannot be generalized. Domain-specific capabilities must be placed in `AIOS/Domains/[Domain]/` — not in platform-level packages.

---

### Point 14 — Sensitive Category Check

**Question**: Does this capability touch any sensitive AIOS category?

| Sensitive Category | Touched? | Extra Review Required |
|---|---|---|
| Medical logic or disclosure | Yes / No | If yes: Medical review per INT-08 SC-01 |
| Trust detection or enforcement | Yes / No | If yes: Trust review per INT-08 SC-02 |
| Compliance or regulatory logic | Yes / No | If yes: Compliance review per INT-08 SC-03 |
| Recommendation generation | Yes / No | If yes: Recommendation review per INT-08 SC-04 |
| Lead capture | Yes / No | If yes: Lead capture review per INT-08 SC-05 |
| Human handoff | Yes / No | If yes: Handoff review per INT-08 SC-06 |

Reference for all sensitive categories: `AIOS/Intelligence/08_INTELLIGENCE_GOVERNANCE.md` Section 4.

---

## Checklist Completion Statement

The following statement must be signed by the proposer before submission:

> I confirm that I have completed all 14 points of this Capability Checklist with accurate, specific answers. I have performed a complete search of all 8 AIOS locations for existing capabilities. I understand that incomplete or inaccurate answers will result in Request for Revision and may result in Rejection.

**Proposer**: ___________  
**Date**: YYYY-MM-DD  
**Proposal ID**: ACP-YYYY-NNN
