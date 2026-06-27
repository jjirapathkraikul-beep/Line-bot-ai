# Future Extensions — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-16-01 | Real-time hospital network lookup by location | Customer enters their location; AI returns nearest network hospitals | Very High |
| FE-16-02 | Emergency contact quick-dial | Provide Tokio Marine's 24-hour emergency line as a tap-to-call button in LINE | Medium |
| FE-16-03 | Automatic Jirawat notification when hospital session detected | Jirawat is alerted immediately when a customer is in a hospital situation | Medium |
| FE-16-04 | Post-hospital claim support prompt (48h follow-up) | Proactive message to help customer start claim after discharge | High |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-16-01 | No real-time hospital network data | AI cannot confirm specific hospitals; must direct to Tokio Marine | High |
| GAP-16-02 | No emergency services integration | Cannot call ambulance or emergency services directly | High (but out of scope) |
| GAP-16-03 | No real-time claim pre-authorization | For planned admissions, AI cannot pre-authorize cashless treatment | High |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Tokio Marine Hospital Network API | Real-time network membership verification | Accurate hospital network guidance |
| LINE Location Services | Customer shares location; AI returns nearest network hospitals | Dramatically improves usefulness |
| Jirawat Alert System | Push notification when hospital session detected | Proactive support from Jirawat |
| Tokio Marine Emergency Line | Tap-to-call emergency line integration | Faster connection to insurer support |

---

## Research Items

| Item | Question |
|---|---|
| RI-16-01 | What hospital-related questions do customers most frequently ask? Are there common scenarios not yet covered? |
| RI-16-02 | What is the average time between a hospital guidance session and a claim submission? Can we proactively prompt claim support? |
