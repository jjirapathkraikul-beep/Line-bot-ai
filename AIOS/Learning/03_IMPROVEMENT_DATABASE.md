# 03 — Improvement Database

**Document ID**: AIOS-LEARN-03  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the canonical schema, template, and process for recording every identified AI improvement opportunity. The Improvement Database is the single source of truth for all known gaps between current and expected AI behavior.

---

## Scope

Every Conversation Audit with result `FLAG` or `FAIL` produces at least one Improvement Issue. Issues may also be created manually by the Learning Architect when a systemic pattern is identified without a single audit trigger.

---

## Issue ID Format

```
IMPROVEMENT-YYYYMMDD-NNN
```

Example: `IMPROVEMENT-20260627-001`

IDs are never recycled. Closed or rejected issues are archived, not deleted.

---

## Issue Schema

### Identification

| Field | Type | Description |
|---|---|---|
| `issue_id` | String | Unique ID in format `IMPROVEMENT-YYYYMMDD-NNN` |
| `created_date` | Date | Date this issue was created |
| `created_by` | String | Human or `SYSTEM` |
| `last_updated` | Date | Most recent modification date |
| `status` | Enum | See Status Lifecycle below |
| `owner` | String | Person responsible for driving this issue to resolution |

### Source

| Field | Type | Description |
|---|---|---|
| `conversation_id` | String | Source conversation (required) |
| `audit_id` | String | Audit that flagged this (required if from audit) |
| `channel` | String | Channel where issue was observed |
| `conversation_date` | Date | When the source conversation occurred |
| `occurrence_count` | Integer | How many times this issue has been observed |
| `related_issues` | Array[String] | IDs of similar or linked issues |

### Classification

| Field | Type | Description |
|---|---|---|
| `category` | Enum | See Categories below |
| `severity` | Enum | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| `priority` | Enum | `P1` / `P2` / `P3` |
| `is_sensitive` | Boolean | Requires two approvers (medical, legal, trust) |
| `affected_capability` | String | Which capability is involved (e.g., `TrustEngine`, `LeadCapture`) |
| `affected_knowledge` | String | Which knowledge source is involved (e.g., `FAQ`, `ProductCatalog`) |
| `affected_decision` | String | Which decision rule is involved |
| `affected_memory` | String | Which memory field or pattern is involved |

### Evidence

| Field | Type | Description |
|---|---|---|
| `customer_message` | String | Verbatim customer message that triggered the issue |
| `ai_response` | String | Verbatim AI response that was problematic |
| `expected_response` | String | What the response should have been |
| `delta` | String | Brief explanation of the gap between actual and expected |

### Analysis

| Field | Type | Description |
|---|---|---|
| `root_cause` | String | Confirmed root cause (from `05_ROOT_CAUSE_ANALYSIS.md`) |
| `root_cause_category` | Enum | See `05_ROOT_CAUSE_ANALYSIS.md` for categories |
| `suggested_fix` | String | Proposed change at a summary level |
| `fix_scope` | Enum | `KNOWLEDGE` / `PATTERN` / `DECISION` / `CAPABILITY` / `MEMORY` / `PROCESS` |

### Lifecycle

| Field | Type | Description |
|---|---|---|
| `linked_proposal_id` | String | Proposal created from this issue |
| `release_id` | String | Release that resolved this issue |
| `regression_tests` | Array[String] | Test case IDs created from this issue |
| `resolution_notes` | String | How the issue was resolved |

---

## Issue Categories

| Category | Description | Examples |
|---|---|---|
| `TRUST` | AI failed to address trust/fraud concern appropriately | Pushed for phone after scam question |
| `MEDICAL` | AI gave wrong or premature response to health question | Guaranteed insurance approval for pre-existing condition |
| `LEAD_CAPTURE` | AI asked for data at wrong time or re-asked known fields | Asked for phone number twice |
| `INTENT_DETECTION` | AI misidentified what the customer wanted | Treated "ขอปรึกษา" as quote request |
| `KNOWLEDGE_GAP` | AI lacked information to answer correctly | No FAQ for a common product question |
| `MEMORY_FAILURE` | AI forgot data already captured in session | Asked for age after customer already gave it |
| `DECISION_ERROR` | AI chose wrong handler or wrong priority | Started lead flow during trust concern |
| `NATURALNESS` | Response was correct but felt robotic or scripted | Used formal bureaucratic Thai in casual context |
| `HANDOFF_FAILURE` | Handoff was triggered incorrectly or summary was incomplete | Incomplete handoff payload to agent |
| `FOLLOW_UP` | AI failed to follow up appropriately | No follow-up after medical question answered |
| `RECOMMENDATION` | AI recommendation was inappropriate or off-target | Recommended tax product to someone asking about health |
| `COMPLIANCE` | Response may have violated regulatory requirements | Guaranteed return on investment |

---

## Status Lifecycle

```
OPEN → ANALYZED → PROPOSED → APPROVED → IN_PROGRESS → IMPLEMENTED → VERIFIED → CLOSED
                                   ↓
                              REJECTED → ARCHIVED
```

| Status | Description |
|---|---|
| `OPEN` | Issue logged, not yet analyzed |
| `ANALYZED` | Root cause confirmed via RCA process |
| `PROPOSED` | Change Proposal created and linked |
| `APPROVED` | Human reviewer approved the proposal |
| `IN_PROGRESS` | Implementation underway |
| `IMPLEMENTED` | Change deployed to AIOS |
| `VERIFIED` | Regression tests pass; issue confirmed resolved |
| `CLOSED` | Fully resolved, archived |
| `REJECTED` | Proposal rejected; issue archived with reason |
| `DUPLICATE` | Merged into another issue |

---

## Markdown Template

```markdown
## IMPROVEMENT-YYYYMMDD-NNN

### Identification
- **issue_id**: IMPROVEMENT-YYYYMMDD-NNN
- **created_date**: YYYY-MM-DD
- **created_by**: 
- **status**: OPEN
- **owner**: 

### Source
- **conversation_id**: 
- **audit_id**: 
- **channel**: 
- **conversation_date**: 
- **occurrence_count**: 1
- **related_issues**: []

### Classification
- **category**: [TRUST|MEDICAL|LEAD_CAPTURE|INTENT_DETECTION|KNOWLEDGE_GAP|MEMORY_FAILURE|DECISION_ERROR|NATURALNESS|HANDOFF_FAILURE|FOLLOW_UP|RECOMMENDATION|COMPLIANCE]
- **severity**: [LOW|MEDIUM|HIGH|CRITICAL]
- **priority**: [P1|P2|P3]
- **is_sensitive**: [true|false]
- **affected_capability**: 
- **affected_knowledge**: 
- **affected_decision**: 
- **affected_memory**: 

### Evidence
**Customer message**:
> [verbatim customer message]

**AI response (actual)**:
> [verbatim AI response]

**Expected response**:
> [what the AI should have said]

**Delta**:
[Brief explanation of the gap]

### Analysis
- **root_cause**: 
- **root_cause_category**: 
- **suggested_fix**: 
- **fix_scope**: [KNOWLEDGE|PATTERN|DECISION|CAPABILITY|MEMORY|PROCESS]

### Lifecycle
- **linked_proposal_id**: 
- **release_id**: 
- **regression_tests**: []
- **resolution_notes**: 
```

---

## Example Issue

```markdown
## IMPROVEMENT-20260627-001

### Identification
- **issue_id**: IMPROVEMENT-20260627-001
- **created_date**: 2026-06-27
- **created_by**: SYSTEM
- **status**: CLOSED
- **owner**: Learning Architect

### Source
- **conversation_id**: CONV-20260625-U001-4891
- **audit_id**: AUDIT-20260625-003
- **channel**: LINE
- **conversation_date**: 2026-06-25
- **occurrence_count**: 7
- **related_issues**: [IMPROVEMENT-20260601-012]

### Classification
- **category**: TRUST
- **severity**: HIGH
- **priority**: P1
- **is_sensitive**: true
- **affected_capability**: LeadCapture (awaiting_phone state)
- **affected_knowledge**: N/A
- **affected_decision**: State handler — awaiting_phone + trust trigger
- **affected_memory**: N/A

### Evidence
**Customer message**:
> "มิจฉาชีพไหม ปลอดภัยไหมถ้าให้เบอร์ไป"

**AI response (actual)**:
> "ฝากเบอร์โทรศัพท์ของคุณลูกค้าได้เลยครับ"

**Expected response**:
> "เข้าใจเลยครับ ปัจจุบันมิจฉาชีพเยอะจริง ๆ [...trust verification content...] ถ้ายังไม่สะดวกให้เบอร์ ผมสามารถตอบคำถามเบื้องต้นในแชตก่อนได้ครับ"

**Delta**:
AI was in awaiting_phone state and continued to ask for phone even after customer 
explicitly expressed trust/fraud concern. Trust signal should cancel active state 
and trigger trust response instead.

### Analysis
- **root_cause**: TRUST_TRIGGERS not included in ALL_INTENT_TRIGGERS; state handler 
  did not check for trust signals before asking next field
- **root_cause_category**: DECISION
- **suggested_fix**: Add TRUST_TRIGGERS to ALL_INTENT_TRIGGERS; insert Priority C trust 
  block before state handlers in the intent router
- **fix_scope**: DECISION

### Lifecycle
- **linked_proposal_id**: PROPOSAL-20260627-001
- **release_id**: RELEASE-2026-06-27-v2
- **regression_tests**: [TEST-ADAPTER-003]
- **resolution_notes**: Fixed in AIOS LINE Adapter v2. Trust now fires at Priority C 
  before any state handler. All 8 regression tests pass.
```

---

## Database Governance

### Fields That May Not Change After Closing

- `issue_id`
- `conversation_id`
- `audit_id`
- `customer_message`
- `ai_response`

### Mandatory Fields Before Status → PROPOSED

- `root_cause` (must be confirmed)
- `suggested_fix` (must be specific)
- `affected_capability` or `affected_knowledge` or `affected_decision`

### Mandatory Fields Before Status → CLOSED

- `linked_proposal_id`
- `release_id`
- `regression_tests` (at least one)
- `resolution_notes`

---

## Dependency Map

| Dependency | Direction | Purpose |
|---|---|---|
| `02_CONVERSATION_AUDIT.md` | Input | Audits that generate issues |
| `05_ROOT_CAUSE_ANALYSIS.md` | Input | Root cause for each issue |
| `06_CHANGE_PROPOSAL.md` | Output | Proposals linked to issues |
| `09_RELEASE_NOTES.md` | Output | Releases that close issues |

---

## Future Extensions

- Web-based Improvement Database UI for non-technical reviewers
- Auto-linking of related issues by semantic similarity
- Issue clustering to identify systemic vs. isolated problems

---

## Cross References

- `02_CONVERSATION_AUDIT.md` — source of issues
- `05_ROOT_CAUSE_ANALYSIS.md` — how root cause is confirmed
- `06_CHANGE_PROPOSAL.md` — what proposals are linked from issues
- `07_ACCEPTANCE_PROCESS.md` — how issues move to APPROVED status

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
