# 06 — Change Proposal

**Document ID**: AIOS-LEARN-06  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the structure and lifecycle of a Change Proposal — the formal mechanism by which the Learning System requests an improvement to AIOS. Every change to AIOS knowledge, decision logic, capabilities, memory, or prompts must go through this process.

---

## Scope

A Change Proposal is required for any change to:
- Knowledge base entries (add, update, remove)
- Decision rules or priority ordering
- Capability activation conditions
- Session memory fields or handling
- System prompt content
- Response patterns or templates
- Handoff triggers or handoff summary format

A Change Proposal is NOT required for:
- Application-level bug fixes (RC-X or RC-A root causes) — handled by Application team
- Integration fixes (RC-I root causes) — handled by Application team
- Grammar/spelling corrections that do not change meaning

---

## Proposal ID Format

```
PROPOSAL-YYYYMMDD-NNN
```

Example: `PROPOSAL-20260627-001`

---

## Proposal Lifecycle

```
DRAFT → READY_FOR_REVIEW → IN_REVIEW → APPROVED → IN_PROGRESS → IMPLEMENTED → CLOSED
                                            ↓
                                        REJECTED → ARCHIVED (with reason)
                                            ↓
                                        NEEDS_REVISION → DRAFT (restart)
```

---

## Proposal Schema

### Identification

| Field | Type | Description |
|---|---|---|
| `proposal_id` | String | `PROPOSAL-YYYYMMDD-NNN` |
| `created_date` | Date | Date proposal was created |
| `created_by` | String | Person or system creating the proposal |
| `status` | Enum | See lifecycle above |
| `linked_issue_ids` | Array[String] | Issues this proposal addresses |
| `linked_rca_id` | String | RCA that produced this proposal |
| `pattern_reference` | String | Pattern from Pattern Library this implements |

### Classification

| Field | Type | Description |
|---|---|---|
| `change_scope` | Enum | `KNOWLEDGE` / `DECISION` / `CAPABILITY` / `MEMORY` / `PROMPT` / `PATTERN` / `PROCESS` |
| `change_type` | Enum | `ADD` / `MODIFY` / `REMOVE` / `REFACTOR` |
| `severity_of_original_issue` | Enum | Inherited from linked issue |
| `is_sensitive` | Boolean | Requires two approvers |
| `priority` | Enum | `P1` / `P2` / `P3` |
| `estimated_effort` | Enum | `SMALL` (< 2h) / `MEDIUM` (2–8h) / `LARGE` (> 8h) |

### Problem Section

| Field | Type | Description |
|---|---|---|
| `problem_statement` | String | What is wrong, stated from the customer's perspective |
| `evidence_summary` | String | Brief summary of evidence (full detail in linked audit/issue) |
| `conversation_references` | Array[String] | Conversation IDs demonstrating the problem |
| `occurrence_count` | Integer | How many times this issue has been observed |
| `customer_impact` | String | How this affects the customer experience |
| `business_impact` | String | How this affects business outcomes |

### Analysis Section

| Field | Type | Description |
|---|---|---|
| `root_cause_summary` | String | Confirmed root cause (from linked RCA) |
| `root_cause_category` | String | RC code from `05_ROOT_CAUSE_ANALYSIS.md` |
| `affected_documents` | Array[String] | AIOS documents that need updating |
| `affected_capabilities` | Array[String] | Capabilities involved |
| `affected_knowledge_sources` | Array[String] | Knowledge sources involved |

### Proposed Change Section

| Field | Type | Description |
|---|---|---|
| `recommended_change` | String | Specific description of what should change |
| `current_behavior` | String | Exact current behavior (quote from code/docs) |
| `proposed_behavior` | String | Exact proposed behavior |
| `implementation_notes` | String | Guidance for the implementer |
| `migration_impact` | String | What existing behavior changes as a result |

### Risk Section

| Field | Type | Description |
|---|---|---|
| `risk_level` | Enum | `LOW` / `MEDIUM` / `HIGH` |
| `risk_description` | String | What could go wrong |
| `risk_mitigation` | String | How to mitigate |
| `rollback_plan` | String | How to revert if needed |

### Testing Section

| Field | Type | Description |
|---|---|---|
| `regression_tests_required` | Array[String] | Existing tests that must still pass |
| `new_tests_required` | Array[String] | New test cases to be written |
| `acceptance_criteria` | Array[String] | How to verify the change is working |

### Approval Section

| Field | Type | Description |
|---|---|---|
| `approver_1` | String | Required approver name |
| `approver_1_date` | Date | Date of approval |
| `approver_2` | String | Required for sensitive changes only |
| `approver_2_date` | Date | Date of second approval |
| `rejection_reason` | String | If rejected, why |
| `revision_notes` | String | If needs revision, what to change |

---

## Proposal Template

```markdown
## PROPOSAL-YYYYMMDD-NNN

### Identification
- **proposal_id**: PROPOSAL-YYYYMMDD-NNN
- **created_date**: YYYY-MM-DD
- **created_by**: 
- **status**: DRAFT
- **linked_issue_ids**: []
- **linked_rca_id**: 
- **pattern_reference**: 

### Classification
- **change_scope**: [KNOWLEDGE|DECISION|CAPABILITY|MEMORY|PROMPT|PATTERN|PROCESS]
- **change_type**: [ADD|MODIFY|REMOVE|REFACTOR]
- **is_sensitive**: [true|false]
- **priority**: [P1|P2|P3]
- **estimated_effort**: [SMALL|MEDIUM|LARGE]

---

### Problem

**Problem statement**:
[What is wrong, stated from the customer's perspective]

**Evidence summary**:
[Brief summary — full detail in linked audit/issue]

**Conversation references**: 
- [CONV-ID-1]
- [CONV-ID-2]

**Occurrence count**: N

**Customer impact**:
[How does this affect the customer?]

**Business impact**:
[How does this affect business outcomes?]

---

### Analysis

**Root cause summary**:
[1–2 sentence summary of confirmed root cause]

**Root cause category**: RC-[X]

**Affected documents**:
- [AIOS/... ]

**Affected capabilities**:
- [CapabilityName]

**Affected knowledge sources**:
- [FAQ | ProductCatalog | ... ]

---

### Proposed Change

**Recommended change**:
[Specific, actionable description of what should change]

**Current behavior**:
```
[Exact current behavior — quote from code, document, or transcript]
```

**Proposed behavior**:
```
[Exact proposed behavior — be precise]
```

**Implementation notes**:
[Guidance for the implementer — file paths, function names, document sections]

**Migration impact**:
[What existing behavior will change? What will break? What needs updating?]

---

### Risk

- **risk_level**: [LOW|MEDIUM|HIGH]
- **risk_description**: 
- **risk_mitigation**: 
- **rollback_plan**: 

---

### Testing

**Regression tests required** (must still pass):
- [ ] [TEST-ID-1]
- [ ] [TEST-ID-2]

**New tests required**:
- [ ] [Description of new test case 1]
- [ ] [Description of new test case 2]

**Acceptance criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

---

### Approval

| Approver | Date | Decision | Notes |
|---|---|---|---|
| [Name] | | [APPROVED / REJECTED / REVISION] | |
| [Name — sensitive only] | | | |
```

---

## Example Proposal

```markdown
## PROPOSAL-20260627-001

### Identification
- **proposal_id**: PROPOSAL-20260627-001
- **created_date**: 2026-06-27
- **created_by**: Learning Architect
- **status**: CLOSED
- **linked_issue_ids**: [IMPROVEMENT-20260627-001]
- **linked_rca_id**: RCA-20260627-001
- **pattern_reference**: PATTERN-TRUST-001

### Classification
- **change_scope**: DECISION
- **change_type**: ADD
- **is_sensitive**: true
- **priority**: P1
- **estimated_effort**: MEDIUM

### Problem

**Problem statement**:
When a customer asks if the LINE account is legitimate or expresses fear of being scammed,
the bot continues to ask for their phone number. This destroys trust and typically ends
the conversation.

**Evidence summary**:
7 conversations where customer sent trust concern while bot was in awaiting_phone state.
In 6 of 7 cases, customer ended the conversation within 2 turns.

**Conversation references**:
- CONV-20260625-U001-4891
- CONV-20260618-U002-2201

**Occurrence count**: 7

**Customer impact**:
Customer receives a phone number request after expressing a scam concern — 
exactly what a real scammer would do. Trust destroyed, conversation lost.

**Business impact**:
Estimated 7 lost leads per 2 weeks from this pattern. High probability customers
do not return.

### Analysis

**Root cause summary**:
TRUST_TRIGGERS was not included in ALL_INTENT_TRIGGERS. The awaiting_phone state
handler checked for contact/quote/interest triggers but not trust triggers. When
a trust message arrived during awaiting_phone, no trigger matched, and the handler
continued asking for phone.

**Root cause category**: RC-D (Decision)

**Affected documents**:
- AIOS/Execution/05_DECISION_PIPELINE.md (Priority ordering)

**Affected capabilities**:
- TrustEngine (CAP-002) — needed to be called but wasn't

**Affected knowledge sources**: None

### Proposed Change

**Recommended change**:
1. Add TRUST_TRIGGERS to ALL_INTENT_TRIGGERS so state handlers can detect trust signals
2. Insert Priority C trust block before all state handlers in the intent router
3. Trust block must: cancel active capture, call TrustEngine, log audit event, return

**Current behavior**:
State handler awaiting_phone: checks triggers → no trust match → asks for phone

**Proposed behavior**:
Intent router Priority C (before all states): if isTrustTrigger(msg) → cancel state,
call buildTrustResponse(), log audit, return — never reaches state handler

**Implementation notes**:
- Add `import { TRUST_TRIGGERS } from './trustEngine'` to leadCapture.ts
- Add TRUST_TRIGGERS to ALL_INTENT_TRIGGERS array
- In route.ts, insert Priority C block before Priority D (old underwriting block)

**Migration impact**:
Any conversation in awaiting_phone, awaiting_age, or awaiting_name state where a
trust message is sent will now exit that state and enter trust response mode.
Previous behavior was incorrect; migration impact is intentional fix.

### Risk

- **risk_level**: LOW
- **risk_description**: Edge case where customer sends trust concern and then immediately
  provides their phone number — new flow may delay phone capture by one turn.
- **risk_mitigation**: Trust response includes an invitation to continue in chat;
  customer can still provide phone in the next turn.
- **rollback_plan**: Remove TRUST_TRIGGERS from ALL_INTENT_TRIGGERS; remove Priority C block.

### Testing

**Regression tests required**:
- [ ] TEST-ROUTER-001 through TEST-ROUTER-005 (intentRouter.test.ts)

**New tests required**:
- [ ] awaiting_phone + trust trigger → trust response, not phone question
- [ ] awaiting_age + trust trigger → trust response, not age question

**Acceptance criteria**:
- [ ] isTrustTrigger("มิจฉาชีพไหม") returns true
- [ ] buildTrustResponse() contains verification info, no phone request
- [ ] Trust response fires before any state handler
- [ ] All 8 regression tests in aiosAdapter.test.ts pass

### Approval

| Approver | Date | Decision | Notes |
|---|---|---|---|
| Learning Architect | 2026-06-27 | APPROVED | P1 — immediate implementation |
| AI Architect | 2026-06-27 | APPROVED | Sensitive topic: identity trust |
```

---

## Risk Level Assignment

| Risk Level | Criteria |
|---|---|
| **LOW** | Change affects a single, well-understood code path; rollback is trivial; regression tests exist |
| **MEDIUM** | Change affects multiple code paths or has non-trivial edge cases; rollback requires code change |
| **HIGH** | Change affects customer-facing behavior in sensitive category (trust, medical, compliance); rollback requires hotfix |

---

## Priority Assignment

| Priority | Criteria |
|---|---|
| **P1** | CRITICAL or HIGH severity issue; affects customer trust, medical safety, or handoff completeness |
| **P2** | MEDIUM severity; affects lead quality, recommendation accuracy, or naturalness |
| **P3** | LOW severity; minor improvements to naturalness, follow-up, or edge case handling |

---

## Cross References

- `05_ROOT_CAUSE_ANALYSIS.md` — Input to every proposal
- `07_ACCEPTANCE_PROCESS.md` — How proposals move to APPROVED
- `04_PATTERN_LIBRARY.md` — Pattern referenced by proposals
- `08_LEARNING_METRICS.md` — Metrics that proposals should improve

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
