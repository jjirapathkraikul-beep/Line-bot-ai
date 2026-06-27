---
Document ID: ACP-01-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                         | Description                                                                                      | Priority |
|-------------------------------------|--------------------------------------------------------------------------------------------------|----------|
| Returning Customer Recognition      | Detect CRM-known customers and deliver a personalized re-greeting using their name and last topic | High     |
| Time-of-Day Greeting Variation      | Morning/afternoon/evening greeting variants for a more natural feel                              | Medium   |
| Confidence-Scored Intent Detection  | Add confidence score to intent classification; ask clarifying question when score < 70%          | High     |
| Topic Menu Fallback                 | When intent unclear after 2 turns, display a structured topic menu instead of routing to ACP-10  | Medium   |

---

## Known Gaps in v1.0

| Gap                                      | Impact                                                       | Planned Fix |
|------------------------------------------|--------------------------------------------------------------|-------------|
| No returning customer detection          | Returning customers receive a generic greeting               | v1.1        |
| Single intent routing (no multi-topic)   | Multi-topic queries default to ACP-10 without prioritization | v1.1        |
| No language detection                    | English or other language greetings may not be handled well  | v1.2        |
| No sentiment analysis at greeting        | Cannot detect subtle anxiety or hesitation without keywords  | v1.2        |

---

## Integration Opportunities

| Integration                              | Value                                                        | Dependency          |
|------------------------------------------|--------------------------------------------------------------|---------------------|
| LINE Rich Menu integration               | Customer's menu selection pre-sets initial intent            | ACP-01 + LINE API   |
| CRM pre-load on session start            | Returning customers get instant personalization              | CRM connector       |
| Analytics event on routing target        | Track which ACPs are most frequently activated for analytics | Analytics pipeline  |
| A/B testing for greeting variants        | Optimize engagement rate by testing greeting message formats | Experiment framework |

---

## Notes
- v1.1 development should prioritize returning customer recognition as it directly improves conversion rate for repeat visitors
- Multi-language support (v1.2) is important if the customer base expands to include English-speaking expatriates in Thailand
