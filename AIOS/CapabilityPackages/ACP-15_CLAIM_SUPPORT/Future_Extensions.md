# Future Extensions — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-15-01 | Claim status tracker integration | Customer can check their claim status directly in the chat | High |
| FE-15-02 | Document checklist generator | AI generates a personalized document list based on claim type and policy | Medium |
| FE-15-03 | Direct claim notification to Jirawat | When a customer reports a claim, Jirawat is notified automatically | Medium |
| FE-15-04 | Claim form download link | Provide direct download link for the correct claim form | Low |
| FE-15-05 | Hospital network checker | Customer enters hospital name; AI confirms if it's in the cashless network | High |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-15-01 | Cannot access real-time claim status | Customer must contact insurer separately for claim status | High |
| GAP-15-02 | Cannot verify hospital network membership in real time | Network information may be outdated; customer may be given incorrect cashless guidance | High |
| GAP-15-03 | No ability to initiate claims directly | Customer must use insurer's own systems to submit claim | Medium |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Tokio Marine Claim API | Real-time claim submission and status | Dramatically improves customer experience |
| Hospital Network API | Live hospital network verification | Prevents incorrect cashless guidance |
| Jirawat's CRM Notification | Automatic alert when customer reports a claim | Jirawat can proactively follow up |

---

## Research Items

| Item | Question |
|---|---|
| RI-15-01 | What are the most common claim process questions Thai customers ask? Are there systematic gaps in guidance? |
| RI-15-02 | What is the correlation between excellent claim support and policy renewal rates? |
