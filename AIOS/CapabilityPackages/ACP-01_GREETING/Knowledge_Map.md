---
Document ID: ACP-01-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                             | Usage in ACP-01                                              |
|--------------------------------------------|--------------------------------------------------------------|
| `AIOS/Domains/Insurance/FAQ.md`            | Answer any basic FAQ that surfaces in the greeting turn      |
| `AIOS/Trust/Trust_Engine.md`               | Trust signal patterns always monitored during greeting phase |

---

## Conversation Dataset References

| Dataset ID | File Path                                    | Usage                                                        |
|------------|----------------------------------------------|--------------------------------------------------------------|
| CID-01     | `AIOS/ConversationDataset/01_GREETING.md`    | Greeting conversation patterns, ideal flows, and anti-patterns |

---

## Learning Layer References

| Learning Source                            | Purpose                                                      |
|--------------------------------------------|--------------------------------------------------------------|
| `AIOS/Learning/Intent_Detection_Log.md`    | Historical intent detection results to improve routing accuracy |
| `AIOS/Learning/Greeting_Feedback.md`       | Customer satisfaction signals from greeting interactions     |

---

## Knowledge NOT Required for ACP-01

The following knowledge domains are explicitly OUT OF SCOPE for the greeting capability. ACP-01 must not access or reference these until the customer is routed to the appropriate ACP:

- Product-specific knowledge (health, cancer, retirement, investment, tax)
- Premium tables or pricing data
- Underwriting or medical eligibility criteria
- Tax deduction limits or calculations
- Investment return data

---

## Knowledge Dependency Graph

```
ACP-01_GREETING
    ├── READS: AIOS/Trust/Trust_Engine.md        [always active]
    ├── READS: AIOS/Domains/Insurance/FAQ.md     [if basic FAQ surfaced]
    └── READS: AIOS/ConversationDataset/01_GREETING.md  [conversation patterns]
```

---

## Notes
- All insurance product knowledge is loaded ONLY after routing to the appropriate advisory ACP
- Trust Engine knowledge is always loaded; it cannot be disabled for any capability
