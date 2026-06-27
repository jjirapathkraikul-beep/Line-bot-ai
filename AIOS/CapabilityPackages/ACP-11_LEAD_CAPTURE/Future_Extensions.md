# Future Extensions — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-11-01 | LINE OA ID as optional 4th field | Many Thai customers prefer LINE over phone calls; adds a contact channel | Low |
| FE-11-02 | Lead quality scoring | Assign an intent score based on the calling capability and customer sentiment to prioritize Jirawat's follow-up queue | Medium |
| FE-11-03 | Automated CRM record creation via API | Replace manual logging with direct CRM write via API integration | High |
| FE-11-04 | Preferred contact day (in addition to time) | Jirawat can schedule calls more efficiently with day-level granularity | Low |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-11-01 | No validation of phone number format | Invalid phone numbers may be stored; Jirawat may not be able to reach customer | Medium |
| GAP-11-02 | No deduplication logic | Returning customer with different phone may create duplicate CRM record | Medium |
| GAP-11-03 | No lead expiry management | Leads captured but not followed up have no auto-expiry; stale leads accumulate | Low |
| GAP-11-04 | Preferred time is free text | CRM field is string-based; no scheduling system integration yet | Low |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Jirawat CRM API | Direct write to CRM instead of log-based capture | Real-time lead availability; Jirawat notified immediately |
| LINE Official Account | Cross-channel lead capture; customer consents to LINE follow-up | Reaches customers who prefer LINE messaging |
| Calendar Integration | Preferred time maps to Jirawat's actual calendar availability | Reduces scheduling friction; avoids conflicts |
| Lead Scoring Engine | ML-based scoring using conversation features | Helps Jirawat prioritize high-value leads |

---

## Research Items

| Item | Question |
|---|---|
| RI-11-01 | What is the optimal point in the conversation to transition to lead capture? Is waiting for explicit interest expression better than waiting for natural topic completion? |
| RI-11-02 | Do customers who provide all three fields convert at higher rates than those who provide only phone? |
| RI-11-03 | What is the impact of lead capture sequence order on completion rates? (Name first vs. Phone first) |

---

## Deprecation Notes

No features in ACP-11 v1.0 are planned for deprecation.
