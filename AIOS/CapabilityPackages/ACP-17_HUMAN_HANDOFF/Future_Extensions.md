# Future Extensions — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-17-01 | Real-time Jirawat availability display | Show actual available time slots for callback based on Jirawat's calendar | High |
| FE-17-02 | Automated calendar invite on handoff completion | When preferred time is captured, automatically create a calendar event for Jirawat | High |
| FE-17-03 | Jirawat push notification on handoff | Immediate notification to Jirawat's phone when a handoff occurs | Medium |
| FE-17-04 | AI-generated Jirawat briefing document | Auto-generate a one-page briefing for Jirawat summarizing the entire conversation | High |
| FE-17-05 | LINE OA optional 4th field | After phone, optionally ask for LINE ID for async communication | Low |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-17-01 | No real-time Jirawat availability | AI cannot confirm that Jirawat is available at preferred time | Medium |
| GAP-17-02 | No automated notification system | Jirawat must manually check CRM for new handoffs | High |
| GAP-17-03 | Context log is summary-only | AI cannot transmit actual conversation transcript to Jirawat | Medium |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| Jirawat's Google Calendar | Real-time availability + automated booking | Eliminates scheduling friction |
| LINE Notify | Push notification to Jirawat on handoff | Immediate awareness of new leads |
| CRM API | Direct write to Jirawat's CRM system | Eliminates manual CRM entry |
| Conversation Archive | Full transcript logging | Jirawat can review complete conversation, not just summary |
