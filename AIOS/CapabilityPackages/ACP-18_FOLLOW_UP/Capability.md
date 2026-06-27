# Follow-Up Capability

| Field | Value |
|---|---|
| Document ID | ACP-18-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-18  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Re-engage returning customers with contextual warmth and continuity, immediately detect and act on high-value purchase signals, and update lead records with any new information.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Convert returning customer interactions into sales by detecting readiness signals immediately, maintaining relationship continuity, and reducing friction for customers who have already expressed interest.

---

## Customer Goal

Feel recognized as a returning customer; receive continuity from prior conversations without repeating themselves; be served efficiently.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-18-01 | follow_up | "กลับมาถามอีกทีนะครับ" |
| INT-18-02 | ตามเรื่องที่คุยไป | "ตามเรื่องประกันสุขภาพที่คุยไปครับ" |
| INT-18-03 | returning_customer | Any message from customer with prior history |
| INT-18-04 | purchase_ready | "ตัดสินใจแล้วครับ" / "พร้อมแล้วครับ" |
| INT-18-05 | meeting_request | "อยากนัดคุณจิรวัฒน์ครับ" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Positive / ready | Recognize warmly; route to closing or handoff immediately |
| Still considering | Acknowledge return; offer to continue where left off |
| Uncertain / changed mind | Accept change; do not argue; re-discover needs if necessary |
| Frustrated (prior bad experience) | Acknowledge; apologize if warranted; offer fresh start |

---

## Conversation Dataset References

- **CID-17**: `AIOS/ConversationDataset/17_FOLLOW_UP.md`

---

## Knowledge Dependencies

- `AIOS/Trust/Trust_Engine.md` — trust state check
- Customer Profile — prior session data
- Conversation State — prior session context

---

## High-Value Signal Detection (CRITICAL ROUTING RULE)

The following signals trigger IMMEDIATE routing without general follow-up:

| Signal | Route |
|---|---|
| "พร้อมสมัครแล้วครับ" | → ACP-19_CLOSING immediately |
| "ตัดสินใจแล้วครับ" | → ACP-19_CLOSING immediately |
| "อยากซื้อเลยครับ" | → ACP-19_CLOSING immediately |
| "อยากนัดครับ" | → ACP-17_HUMAN_HANDOFF immediately |
| "ขอนัดคุณจิรวัฒน์" | → ACP-17_HUMAN_HANDOFF immediately |

These signals MUST NOT be processed by ACP-18's general follow-up flow. Route immediately.

---

## Decision Rules (Summary)

1. Recognize returning customer immediately with warm acknowledgment
2. Reference prior context if available
3. Detect high-value signals first — route before general follow-up
4. Update lead record if new contact info provided
5. Do NOT re-ask previously captured information

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: all prior session data, customer profile, trust state
- Write: updated lead if new info; follow_up_session flag

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

Update existing lead record if customer provides new or changed contact information. Do not create a duplicate. If lead is not yet captured and customer is returning, activate ACP-11 at appropriate time.

---

## Trust Policy

Trust concern from Trust Engine suspends ACP-18. ACP-08 takes control.

---

## Escalation Rules

| Condition | Action |
|---|---|
| High-value purchase signal | Route to ACP-19 immediately |
| Meeting request | Route to ACP-17 immediately |
| Trust concern | Route to ACP-08 |
| Customer's situation has changed significantly | Re-activate ACP-10 Need Discovery |

---

## Success Criteria

| Criterion | Target |
|---|---|
| High-value signals routed within 1 turn | 100% |
| Prior context referenced correctly | Customer confirms recognition |
| No known fields re-asked | Zero known field re-asks |

---

## Metrics

| Metric | Description |
|---|---|
| return_to_closing_rate | % of returning customers who proceed to ACP-19 |
| high_value_signal_detection_rate | % of high-value signals correctly routed immediately |
| context_continuity_rate | % of returning customers who experienced correct prior-context acknowledgment |

---

## Future Extensions (Summary)

- Proactive follow-up messaging
- Sentiment drift detection
- Lead score update on return

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
