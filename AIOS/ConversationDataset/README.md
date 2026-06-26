# AIOS Conversation Intelligence Dataset v1.0

**Layer**: AIOS Platform — Conversation Intelligence  
**Version**: 1.0  
**Status**: Active  
**Owner**: Chief Conversation Intelligence Architect  
**Last Updated**: 2026-06-27

---

## What Is This Dataset?

The Conversation Intelligence Dataset defines **how AI should think, reason, and respond** during customer conversations. It is not:

- A knowledge base (facts about products) → see `AIOS/KnowledgeBase/`
- A FAQ list (questions and answers) → see `AIOS/KnowledgeBase/`
- A prompt template → see `AIOS/Execution/06_RESPONSE_COMPOSER.md`

It **is**:
- The standard for consultative selling conversation behavior
- The definition of what "good AI conversation" looks like in each scenario
- The ground truth for regression testing AI conversation quality
- The intelligence layer that connects customer intent to the right response strategy

---

## Guiding Principles

Every scenario in this dataset is built on five non-negotiable principles:

| Principle | Rule |
|---|---|
| **Answer First** | AI answers the customer's actual question before asking anything |
| **Educate Before Capture** | AI gives value before collecting personal data |
| **Trust Before Sell** | AI builds credibility before moving toward transaction |
| **Never Sound Like a Form** | Questions feel natural, not like a survey |
| **One Question Per Turn** | AI asks exactly one question per response |

---

## Dataset Coverage

| # | Document | Topic | Priority |
|---|---|---|---|
| 01 | GREETING | First contact, welcome, intent discovery | High |
| 02 | HEALTH_INSURANCE | ประกันสุขภาพ inquiry and education | High |
| 03 | CANCER_INSURANCE | ประกันมะเร็ง specific scenarios | High |
| 04 | MEDICAL_UNDERWRITING | Pre-existing condition and underwriting | Critical |
| 05 | TAX_PLANNING | ลดหย่อนภาษี with insurance | High |
| 06 | RETIREMENT | เกษียณ planning conversation | High |
| 07 | INVESTMENT_LINKED | Unit-linked / ประกันควบการลงทุน | Medium |
| 08 | TRUST_AND_SCAM | Fraud concern, identity verification | Critical |
| 09 | PRODUCT_COMPARISON | Comparing insurance products | Medium |
| 10 | NEED_DISCOVERY | Understanding customer needs | High |
| 11 | RECOMMENDATION | Suggesting the right product | High |
| 12 | PRICE_OBJECTION | Premium too expensive responses | High |
| 13 | EXISTING_INSURANCE | Customer already has insurance | Medium |
| 14 | CLAIM | Claims process and support questions | Medium |
| 15 | HOSPITAL | Hospital network and coverage questions | Medium |
| 16 | HUMAN_HANDOFF | Transferring to human agent | High |
| 17 | FOLLOW_UP | Following up after previous conversation | Medium |
| 18 | CLOSING | When customer is ready to buy | High |
| 19 | EDGE_CASES | Unusual, sensitive, or complex scenarios | High |
| 20 | CONVERSATION_PATTERNS | Reusable multi-turn conversation patterns | High |

---

## Customer Journey Coverage

```
Awareness → Interest → Consideration → Intent → Decision → Post-Purchase

   [01]        [02-07]      [09-13]       [11,18]    [18]       [14,15,17]
 GREETING    PRODUCTS     COMPARISON    RECOMMEND   CLOSING      SUPPORT
              EDUCATION   OBJECTION
                            TRUST [08]
                         DISCOVERY [10]
                         UNDERWRITING [04]
                         EDGE CASES [19]
```

---

## How to Use This Dataset

### For AI Training / Prompt Design
Use the `Expected AI Thinking` and `Expected AI Reply` sections as ground-truth examples for how AI should respond to each scenario type.

### For Regression Testing
Use the `Regression Examples` section — each example documents a `Good Conversation` (AI should do this) and `Bad Conversation` (AI must not do this) pair.

### For Learning System
Use the `Lessons Learned` sections as input to `AIOS/Learning/04_PATTERN_LIBRARY.md` when identifying new patterns.

### For Knowledge Gap Analysis
Use `Knowledge Required` sections across all documents to identify what must be in the Knowledge Base.

---

## Document Structure

Every document in this dataset follows the same structure:

1. Customer Goals
2. Common Customer Questions
3. Expected Intent
4. Expected Emotion
5. Expected Capability
6. Knowledge Required
7. Decision Rules
8. Conversation Strategy
9. Expected AI Thinking
10. Expected AI Reply
11. Follow-up Questions
12. When NOT to Ask for Lead
13. When to Resume Lead Capture
14. Escalation Conditions
15. Regression Examples (Good + Bad Conversation)
16. Lessons Learned
17. Cross References

---

## Relationship to Other AIOS Layers

```
AIOS/ConversationDataset/   ←→   AIOS/Execution/05_DECISION_PIPELINE.md
  (What to do and why)              (How routing decisions work)

AIOS/ConversationDataset/   ←→   AIOS/KnowledgeBase/
  (What knowledge is needed)        (Actual knowledge content)

AIOS/ConversationDataset/   ←→   AIOS/Learning/04_PATTERN_LIBRARY.md
  (Scenario specifications)         (Abstracted reusable patterns)

AIOS/ConversationDataset/   ←→   AIOS/Execution/06_RESPONSE_COMPOSER.md
  (Expected response quality)       (How responses are built)
```

---

## Version History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-06-27 | Chief Conversation Intelligence Architect | Initial release — 20 scenarios |
