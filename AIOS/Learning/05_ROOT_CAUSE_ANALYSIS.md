# 05 — Root Cause Analysis

**Document ID**: AIOS-LEARN-05  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the Root Cause Analysis (RCA) methodology for AIOS Learning. RCA answers: *Why did the AI behave incorrectly?* The answer must be specific enough to inform a Change Proposal that actually prevents recurrence.

---

## Scope

Every issue in the Improvement Database with severity `HIGH` or `CRITICAL` requires a completed RCA before a Change Proposal can be submitted. Issues with `MEDIUM` severity require at least a root cause category. `LOW` issues may reference an existing RCA from a related issue.

---

## Root Cause Categories

AIOS failures trace to one of ten root cause categories:

| Code | Category | Description |
|---|---|---|
| **RC-K** | Knowledge | Incorrect, missing, or outdated information in the knowledge base |
| **RC-D** | Decision | Wrong routing, priority, or state machine transition |
| **RC-C** | Capability | A required capability is missing, not activated, or not available |
| **RC-M** | Memory | Session data not read, not written, or incorrectly managed |
| **RC-V** | Conversation | Conversation flow design is wrong for the context |
| **RC-X** | Execution | Pipeline bug — correct logic but incorrect execution |
| **RC-A** | Application | Application adapter translated input/output incorrectly |
| **RC-I** | Integration | Third-party integration (channel, CRM, notification) failed |
| **RC-P** | Prompt | System prompt was ambiguous, incomplete, or contradictory |
| **RC-H** | Human Process | The issue is in the human workflow, not the AI system |

---

## Root Cause Definitions

### RC-K — Knowledge

The AI had access to a capability but gave the wrong answer because the underlying knowledge was wrong.

**Examples**:
- FAQ contained incorrect premium amount
- Product coverage description was incomplete
- Knowledge base had no entry for a common question (knowledge gap)

**How to confirm**: Check the knowledge source that was used (or should have been used). Is the information there? Is it correct? Is it current?

**Typical fix scope**: `KNOWLEDGE` — update or add FAQ/product entry

---

### RC-D — Decision

The AI selected the wrong handler, applied the wrong priority, or made the wrong state transition.

**Examples**:
- Trust concern detected but system continued with lead capture
- Medical question routed to generic fallback instead of medical handler
- "ขอปรึกษา" treated as quote request, triggering age capture

**How to confirm**: Trace the routing decisions from the `[Intent]` log or audit trail. Which trigger fired? Which priority was applied? Was there a higher-priority trigger that was missed?

**Typical fix scope**: `DECISION` — update trigger list, priority ordering, or state handler logic

---

### RC-C — Capability

The correct capability exists in the AIOS spec but was not implemented, not available, or not activated for the context.

**Examples**:
- TrustEngine capability existed in spec but was not called
- MedicalEngine existed but was bypassed by state handler
- CapabilityLoader did not check for the relevant capability type

**How to confirm**: Check whether the Capability interface exists in `AIOS/Execution/03_CAPABILITY_LOADER.md`. If yes, was it activated? If not, the issue is RC-D. If it was activated but failed, the issue may be RC-X.

**Typical fix scope**: `CAPABILITY` — implement missing capability or fix activation condition

---

### RC-M — Memory

The AI did not correctly read, write, or use session or profile memory.

**Examples**:
- Phone number was in session but AI asked for it again
- Age was never saved to session, causing repeated collection
- Handoff summary was missing fields because session data was not hydrated

**How to confirm**: Check session data at the time of the failure. Was the field populated? Was `getLeadData()` called? Was the data passed to the prompt context?

**Typical fix scope**: `MEMORY` — fix session read/write or prompt context injection

---

### RC-V — Conversation

The conversation flow design itself was wrong — the sequence of questions and answers was not appropriate for the customer's context.

**Examples**:
- Contact flow started with age question instead of name
- Bot asked for product preference before understanding customer goal
- Conversation branched incorrectly based on customer's previous answer

**How to confirm**: Review the conversation flow document. Was the flow followed? If yes, the flow itself is the problem (RC-V). If no, it may be RC-D or RC-X.

**Typical fix scope**: `PATTERN` — update conversation pattern or flow design

---

### RC-X — Execution

The logic was correct in design but a bug in the execution pipeline caused wrong behavior.

**Examples**:
- Null pointer when session data was missing a field
- Race condition when two messages arrived simultaneously
- Wrong field name in dehydration causing data loss between sessions

**How to confirm**: Check application logs for errors. If the logic would have been correct but an exception or edge case occurred, this is RC-X.

**Typical fix scope**: Implementation fix in application code (not Learning Layer responsibility — escalate to Application team)

---

### RC-A — Application

The Application Adapter incorrectly translated between channel format and AIOS format.

**Examples**:
- Postback payload parsed incorrectly, wrong intent detected
- Rich menu text not normalized before matching
- Response formatter broke Thai text encoding

**How to confirm**: Check the input transformation and output formatting in the Application Adapter. Did it correctly translate the channel message into AIOS input format?

**Typical fix scope**: Application Adapter fix (escalate to Application team)

---

### RC-I — Integration

A third-party service (LINE API, CRM, notification system) failed and the system did not handle it gracefully.

**Examples**:
- LINE reply API returned error but bot continued as if successful
- CRM write failed silently, data was lost
- Admin notification not sent after handoff

**How to confirm**: Check integration logs. Was there a non-200 response from the third-party? Was error handling present?

**Typical fix scope**: Integration error handling (escalate to Application team)

---

### RC-P — Prompt

The system prompt was ambiguous, incomplete, or contradicted correct behavior, causing the language model to choose a wrong response.

**Examples**:
- Prompt did not instruct AI to check known fields before asking
- Prompt said "always confirm customer intent" which caused repeated questions
- Prompt lacked trust concern handling rules, so AI improvised incorrectly

**How to confirm**: Review the system prompt at the time of the issue. Could a reasonable language model, following the prompt literally, have produced the wrong response? If yes, the prompt is the root cause.

**Typical fix scope**: `PROMPT` — update system prompt via approved Change Proposal

---

### RC-H — Human Process

The AI behaved correctly but the surrounding human process (agent response time, escalation procedure, training) was the actual failure point.

**Examples**:
- AI generated correct handoff summary but agent did not read it
- Customer complained about slow human response after correct handoff
- Agent gave wrong information that contradicted AI's correct answer

**How to confirm**: Confirm that AI outputs were correct. If yes, the problem is in how humans consumed or acted on those outputs.

**Typical fix scope**: `PROCESS` — update human workflow, training, or escalation procedures

---

## RCA Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     RCA WORKFLOW                             │
│                                                             │
│  Step 1: REPRODUCE                                          │
│    Load conversation transcript                              │
│    Identify exact failure point (which AI turn failed)       │
│                  ↓                                          │
│  Step 2: HYPOTHESIZE                                        │
│    Select 1–3 candidate root cause categories               │
│    List evidence for each hypothesis                         │
│                  ↓                                          │
│  Step 3: INVESTIGATE                                        │
│    For each hypothesis, check:                              │
│    RC-K: Was knowledge correct?                             │
│    RC-D: Was routing correct?                               │
│    RC-C: Was capability available?                          │
│    RC-M: Was memory used correctly?                         │
│    RC-P: Was prompt clear?                                  │
│    [See investigation checklist below]                      │
│                  ↓                                          │
│  Step 4: CONFIRM                                            │
│    Identify the single primary root cause                   │
│    Document secondary contributing factors                   │
│                  ↓                                          │
│  Step 5: LINK                                               │
│    Update issue in Improvement Database with root_cause     │
│    Link to Pattern Library entry (existing or new)          │
│                  ↓                                          │
│  Step 6: PROPOSE                                            │
│    Create Change Proposal referencing confirmed root cause  │
└─────────────────────────────────────────────────────────────┘
```

---

## Investigation Checklist

For each candidate root cause, answer the following questions:

### RC-K — Knowledge Check
- [ ] What knowledge source should have been used?
- [ ] Was it in the FAQ or product catalog at the time?
- [ ] Was the content correct and current?
- [ ] Was it indexed/retrievable?
- [ ] Did the knowledge resolver select it?

### RC-D — Decision Check
- [ ] What intent was detected?
- [ ] What priority was applied?
- [ ] Was a higher-priority trigger present in the message that was missed?
- [ ] Was the state machine in the correct state?
- [ ] Did the correct handler run?

### RC-C — Capability Check
- [ ] Which capability should have been activated?
- [ ] Is it defined in `AIOS/Execution/03_CAPABILITY_LOADER.md`?
- [ ] Was the activation condition met?
- [ ] Was the capability called?
- [ ] Did it return a response?

### RC-M — Memory Check
- [ ] What fields were in session at the time of failure?
- [ ] Was `getLeadData()` called?
- [ ] Were the fields passed to the prompt context?
- [ ] Was the field written correctly in previous turns?
- [ ] Was session properly hydrated from KV store?

### RC-P — Prompt Check
- [ ] What was the exact prompt text at time of failure?
- [ ] Do the instructions cover this scenario explicitly?
- [ ] Are there any contradictions in the prompt?
- [ ] Could a language model following the prompt literally produce this wrong output?

---

## RCA Document Template

```markdown
## RCA — IMPROVEMENT-YYYYMMDD-NNN

**rca_id**: RCA-YYYYMMDD-NNN
**issue_id**: IMPROVEMENT-YYYYMMDD-NNN
**rca_date**: YYYY-MM-DD
**analyst**: [Name]

### Failure Description
[What went wrong — one paragraph]

### Failure Point
[Which exact AI turn failed, and what was the wrong output]

### Hypotheses
1. [Hypothesis 1 — RC-? category]
2. [Hypothesis 2 — RC-? category]

### Investigation

#### Hypothesis 1: [Category name]
Evidence for:
- 
Evidence against:
- 

#### Hypothesis 2: [Category name]
Evidence for:
- 
Evidence against:
- 

### Confirmed Root Cause
**Primary**: [RC-X] — [explanation]
**Contributing factors**: [RC-Y] — [explanation, if any]

### Why This Happened
[Explain why this root cause was present — what was missing or wrong in the system design]

### Why This Wasn't Caught Earlier
[Was there a test that should have caught this? A review that should have noticed this?]

### Recommended Fix
[Specific, actionable fix — reference the Pattern Library if applicable]

### Pattern Reference
[PATTERN-XXX-NNN or "New pattern required"]

### Linked Proposal
[PROPOSAL-YYYYMMDD-NNN — to be created]
```

---

## RCA Quality Standards

An RCA is considered **complete** when it:
- Identifies a single primary root cause (not "multiple causes" without ranking)
- Provides specific evidence from logs, transcripts, or code
- References the Pattern Library for the solution approach
- Is linked to at least one Change Proposal

An RCA is considered **insufficient** when it:
- Attributes failure to "AI limitation" without specifics
- Says "prompt was not good enough" without identifying which instruction was missing
- Identifies only symptoms rather than causes
- Does not distinguish between RC-D and RC-P for a routing failure

---

## Cross References

- `03_IMPROVEMENT_DATABASE.md` — Issues that require RCA
- `04_PATTERN_LIBRARY.md` — Where confirmed patterns are documented
- `06_CHANGE_PROPOSAL.md` — Output of a completed RCA
- `AIOS/Execution/05_DECISION_PIPELINE.md` — Primary reference for RC-D investigations

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
