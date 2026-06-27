# Future Extensions — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-18-01 | Proactive follow-up messaging | AI sends a message after 7 days if customer hasn't returned: "คุณ[ชื่อ] ครั้งที่แล้วคุยเรื่อง[topic] ยังสนใจอยู่ไหมครับ?" | High |
| FE-18-02 | Sentiment drift detection | If customer's sentiment has shifted negative since last session, flag for Jirawat's attention before AI responds | High |
| FE-18-03 | Lead score update on return | Each return visit increases the customer's lead score | Medium |
| FE-18-04 | Personalized re-engagement message based on time elapsed | Different tone for "return after 1 day" vs. "return after 3 months" | Medium |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-18-01 | No proactive outreach capability | AI can only respond; cannot initiate follow-up messages | High |
| GAP-18-02 | Session history retention limit | If session history is older than [N] days, accuracy of context reference degrades | Medium |
| GAP-18-03 | Cannot detect customer mood shift since last session without new messages | Prior sentiment data may be stale | Low |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| LINE Broadcast API | Proactive follow-up messaging to opted-in customers | Significantly increases return customer rate |
| Lead Score Engine | Return visit updates lead score automatically | Jirawat can prioritize outreach |
| CRM Timeline | Visual timeline of customer touchpoints | Jirawat has full relationship context |

---

## Research Items

| Item | Question |
|---|---|
| RI-18-01 | What is the optimal follow-up wait time before a proactive message increases rather than decreases conversion? |
| RI-18-02 | Which high-value signal phrases are most reliable in Thai? Are there regional variations? |
