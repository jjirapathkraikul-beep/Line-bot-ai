# 02 — Conversation Audit

**Document ID**: AIOS-LEARN-02  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the standard schema, scoring rubrics, and process for auditing a single AI conversation. A Conversation Audit is the primary input to the AIOS Learning System.

---

## Scope

Every conversation flagged for learning review undergoes a structured audit. Audits may be:
- **Triggered automatically**: by low trust score, no intent match, handoff failure, or user drop-off
- **Triggered manually**: by human reviewer identifying an interesting case
- **Sampled systematically**: random sample (e.g., 5% of daily volume)

---

## Audit Schema

### Header Fields

| Field | Type | Description |
|---|---|---|
| `audit_id` | String | Unique ID — format: `AUDIT-YYYYMMDD-NNN` |
| `conversation_id` | String | Source conversation ID from the application layer |
| `channel` | Enum | `LINE` / `FACEBOOK` / `VOICE` / `WEBSITE` / `OTHER` |
| `audit_date` | Date | Date the audit was performed |
| `auditor` | String | Human name or `SYSTEM` for automated audits |
| `audit_type` | Enum | `AUTOMATED` / `MANUAL` / `SAMPLED` |
| `conversation_date` | Date | Date the original conversation occurred |
| `session_duration_sec` | Integer | Total conversation duration in seconds |
| `message_count` | Integer | Total messages (AI + customer) |

---

### Customer Context Fields

| Field | Type | Description |
|---|---|---|
| `customer_id` | String | Anonymized or hashed customer identifier |
| `customer_type` | Enum | `NEW` / `RETURNING` / `UNKNOWN` |
| `channel_entry_point` | String | How the customer entered (e.g., `rich_menu_health`, `direct_message`) |
| `customer_goal` | String | What the customer was trying to accomplish (inferred) |
| `customer_emotion` | Enum | `NEUTRAL` / `CURIOUS` / `ANXIOUS` / `FRUSTRATED` / `TRUSTING` / `SUSPICIOUS` |
| `conversation_stage` | Enum | `AWARENESS` / `INTEREST` / `CONSIDERATION` / `INTENT` / `HANDOFF` |

---

### Intent Fields

| Field | Type | Description |
|---|---|---|
| `primary_intent` | String | Main intent detected (e.g., `product_health`, `trust_concern`) |
| `secondary_intents` | Array[String] | Other intents detected during conversation |
| `intent_detected_correctly` | Boolean | Did the AI correctly identify the customer's intent? |
| `intent_detection_failure_reason` | String | If `false`, why did intent detection fail? |
| `state_transitions` | Array[String] | Ordered list of state changes during conversation |

---

### Quality Scoring Fields

All scoring fields use a **1–5 integer scale** unless otherwise noted.

| Field | Scale | Description |
|---|---|---|
| `answer_quality` | 1–5 | Did the AI answer the customer's actual question? |
| `question_quality` | 1–5 | Were the AI's questions relevant, single, and non-repetitive? |
| `naturalness` | 1–5 | Did the response feel natural vs. robotic / scripted? |
| `decision_quality` | 1–5 | Did the AI make the right routing / prioritization decision? |
| `recommendation_quality` | 1–5 | If a recommendation was made, was it appropriate? |
| `memory_usage` | 1–5 | Did the AI use previously captured information correctly? |
| `knowledge_usage` | 1–5 | Did the AI use the right knowledge (FAQ, product info, etc.)? |
| `trust_score` | 1–5 | Did the AI adequately address trust/credibility when needed? |
| `lead_score` | 1–5 | Quality of lead data captured (or appropriateness of not capturing) |
| `customer_satisfaction` | 1–5 | Estimated customer satisfaction (from signals, not always explicit) |

---

### Outcome Fields

| Field | Type | Description |
|---|---|---|
| `handoff_triggered` | Boolean | Did the conversation result in a human handoff? |
| `handoff_quality` | 1–5 or N/A | Was the handoff summary complete and accurate? |
| `lost_opportunity` | Boolean | Did the AI miss a chance to serve the customer better? |
| `lost_opportunity_description` | String | Description of what was missed |
| `conversation_completed` | Boolean | Did the customer reach their goal? |
| `repeat_question_detected` | Boolean | Did the AI ask the same question more than once? |

---

### Audit Result Fields

| Field | Type | Description |
|---|---|---|
| `overall_audit_result` | Enum | `PASS` / `FLAG` / `FAIL` |
| `severity` | Enum | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| `root_cause_hypothesis` | String | Initial hypothesis about root cause |
| `improvement_suggestion` | String | Brief recommendation from auditor |
| `improvement_priority` | Enum | `P1` / `P2` / `P3` |
| `regression_test_required` | Boolean | Should a new regression test be written? |
| `linked_issue_id` | String | If issue created, reference to `IMPROVEMENT-NNN` |
| `acceptance_status` | Enum | `OPEN` / `PROPOSED` / `IMPLEMENTED` / `CLOSED` |
| `notes` | String | Free-text auditor notes |

---

## Scoring Rubrics

### Answer Quality (1–5)

| Score | Criteria |
|---|---|
| **5** | AI answered the customer's exact question clearly, completely, and before asking anything |
| **4** | AI answered the question but with minor omissions or unnecessary preamble |
| **3** | AI partially answered; key information was missing or buried |
| **2** | AI deflected, gave a generic response, or answered a different question |
| **1** | AI did not answer at all; jumped to data capture or irrelevant response |

### Question Quality (1–5)

| Score | Criteria |
|---|---|
| **5** | AI asked exactly one question, perfectly relevant, not previously answered |
| **4** | AI asked one question with minor framing issue |
| **3** | AI asked one question but it was already partially answered |
| **2** | AI asked multiple questions in one message |
| **1** | AI asked a question already answered, or asked irrelevant/inappropriate question |

### Naturalness (1–5)

| Score | Criteria |
|---|---|
| **5** | Response feels like a knowledgeable friend — warm, clear, appropriate length |
| **4** | Mostly natural; one slightly robotic phrase or unnecessary filler |
| **3** | Noticeable AI/scripted feel but still usable |
| **2** | Clearly scripted, formulaic, or uses corporate language in inappropriate context |
| **1** | Feels like a form, FAQ bot, or automated system — no personality |

### Decision Quality (1–5)

| Score | Criteria |
|---|---|
| **5** | Correct intent detected, correct priority applied, correct handler invoked |
| **4** | Correct handler but minor priority issue |
| **3** | Correct handler but missed a higher-priority signal |
| **2** | Wrong handler invoked; customer had to repeat themselves |
| **1** | Completely wrong decision; caused negative customer experience |

### Trust Score (1–5)

| Score | Criteria |
|---|---|
| **5** | Trust concern was identified and addressed with full verification information before any data request |
| **4** | Trust concern addressed but one element missing |
| **3** | Trust concern partially addressed |
| **2** | Trust concern detected but response was defensive rather than helpful |
| **1** | Trust concern not detected, or AI pushed for data immediately after trust signal |

### Memory Usage (1–5)

| Score | Criteria |
|---|---|
| **5** | AI used all previously captured fields correctly; never asked a known question |
| **4** | One previously captured field was not used but no repeated question |
| **3** | AI asked for a field that was partially captured |
| **2** | AI asked for a field that was fully captured in the same session |
| **1** | AI asked for the same field multiple times in the same session |

### Lead Score (1–5)

| Score | Criteria |
|---|---|
| **5** | Lead capture was timely, non-intrusive, and captured the right fields for the context |
| **4** | Lead captured with minor timing issue |
| **3** | Lead capture attempted but in wrong context (e.g., after trust concern) |
| **2** | Lead capture forced before customer's question was answered |
| **1** | Lead capture blocked customer from getting the information they needed |

---

## Audit Result Criteria

| Result | Criteria |
|---|---|
| **PASS** | All scoring fields ≥ 3, no critical failures, customer goal achieved |
| **FLAG** | One or more fields < 3, OR customer goal not achieved, OR repeat question detected |
| **FAIL** | Any field = 1, OR trust concern mishandled, OR wrong medical/legal response |

---

## Severity Assignment

| Severity | Criteria |
|---|---|
| **CRITICAL** | Any FAIL result touching trust, medical, legal, or compliance topics |
| **HIGH** | FAIL result in any non-sensitive category; or multiple FLAG results in one conversation |
| **MEDIUM** | Single FLAG result with clear improvement path |
| **LOW** | Minor naturalness or question framing issue only |

---

## Audit Process

```
Step 1: TRIGGER
  Automated flag OR manual selection OR random sample

Step 2: LOAD
  Pull full conversation transcript and session data

Step 3: SCORE
  Complete all scoring fields using rubrics above

Step 4: CLASSIFY
  Assign audit_result and severity

Step 5: HYPOTHESIZE
  Write root_cause_hypothesis (1–2 sentences)

Step 6: PROPOSE
  Write improvement_suggestion (1–2 sentences)

Step 7: LOG
  Create audit record in Improvement Database
  Set linked_issue_id if issue created

Step 8: ROUTE
  P1 issues → immediate escalation to Learning Architect
  P2 issues → next sprint planning
  P3 issues → backlog
```

---

## Audit Frequency Standards

| Trigger Type | Target Frequency |
|---|---|
| Automated (low trust / no intent match) | 100% of flagged conversations |
| Post-handoff conversations | 100% |
| Random sample | 5% of daily volume |
| Manual escalation | As needed |

---

## Audit Template (Markdown)

```markdown
## Conversation Audit — AUDIT-YYYYMMDD-NNN

**conversation_id**: [ID]  
**channel**: [LINE|FACEBOOK|VOICE|WEBSITE|OTHER]  
**audit_date**: YYYY-MM-DD  
**auditor**: [Name or SYSTEM]  
**audit_type**: [AUTOMATED|MANUAL|SAMPLED]  

### Customer Context
- **customer_goal**: 
- **customer_emotion**: 
- **conversation_stage**: 
- **primary_intent**: 

### Quality Scores
| Dimension | Score | Notes |
|---|---|---|
| Answer Quality | /5 | |
| Question Quality | /5 | |
| Naturalness | /5 | |
| Decision Quality | /5 | |
| Trust Score | /5 | |
| Memory Usage | /5 | |
| Lead Score | /5 | |
| Knowledge Usage | /5 | |
| Recommendation Quality | /5 | |
| Customer Satisfaction | /5 | |

### Outcome
- **handoff_triggered**: 
- **lost_opportunity**: 
- **repeat_question_detected**: 
- **conversation_completed**: 

### Audit Result
- **overall_audit_result**: [PASS|FLAG|FAIL]
- **severity**: [LOW|MEDIUM|HIGH|CRITICAL]
- **root_cause_hypothesis**: 
- **improvement_suggestion**: 
- **improvement_priority**: [P1|P2|P3]
- **regression_test_required**: [Yes|No]
- **linked_issue_id**: 
- **acceptance_status**: OPEN
```

---

## Dependencies

| Dependency | Direction | Purpose |
|---|---|---|
| Application `[AUDIT]` log events | Input | Raw conversation data |
| `03_IMPROVEMENT_DATABASE.md` | Output | Issues created from audits |
| `05_ROOT_CAUSE_ANALYSIS.md` | Output | RCA triggered by FAIL/FLAG audits |

---

## Future Extensions

- Automated scoring of Answer Quality and Naturalness using an AI reviewer (still requiring human override)
- Trend dashboard showing average scores per intent category over time
- Automatic clustering of similar audit results to surface patterns faster

---

## Cross References

- `01_LEARNING_PHILOSOPHY.md` — Principle 1 (Conversation Is Ground Truth)
- `03_IMPROVEMENT_DATABASE.md` — Where audit findings become issues
- `05_ROOT_CAUSE_ANALYSIS.md` — How root cause hypothesis is investigated

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
