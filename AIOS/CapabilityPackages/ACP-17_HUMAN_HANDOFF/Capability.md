# Human Handoff Capability

| Field | Value |
|---|---|
| Document ID | ACP-17-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-17  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Smoothly transfer the conversation to Jirawat Jirapathkraikul with complete context and customer contact information, framed as a positive and natural next step that benefits the customer.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Ensure that every customer who needs personal attention from Jirawat is transferred with full context, appropriate timing, and a positive emotional framing — maximizing Jirawat's ability to continue the relationship productively.

---

## Customer Goal

Feel that the transition to a human advisor is a benefit, not a failure or a referral to someone who "doesn't know." Receive confirmation that a real person will contact them at a convenient time.

---

## Supported Intents

ACP-17 is primarily activated by other capabilities, not by direct intent. However, direct triggers include:

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-17-01 | human_request | "อยากคุยกับคนโดยตรงครับ" |
| INT-17-02 | jirawat_request | "ขอคุยกับคุณจิรวัฒน์ได้ไหม?" |
| INT-17-03 | expert_request | "อยากได้คนที่เชี่ยวชาญกว่านี้ช่วยครับ" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Ready and positive | Warm handoff; collect data naturally |
| Frustrated or tired | Acknowledge frustration; present Jirawat as solution |
| Urgent / emergency | IMMEDIATE handoff; minimal data collection |
| Anxious | Reassure; frame Jirawat as trusted personal advisor |

---

## Conversation Dataset References

- **CID-16**: `AIOS/ConversationDataset/16_HUMAN_HANDOFF.md`

---

## Knowledge Dependencies

- `AIOS/Trust/Trust_Engine.md` — trust state check
- All prior capability contexts (read from ConversationState)

---

## Handoff Types

| Type | Trigger | Data Collection | CRM Priority |
|---|---|---|---|
| IMMEDIATE | Emergency, explicit request, trust resolution | Minimal (phone only if possible) | URGENT flag |
| WARM | Post-value delivery + positive signal | Full: name → phone → preferred time | NORMAL |
| SCHEDULED | Complex question needing Jirawat's expertise | Full: name → phone → preferred time (emphasis on time) | SCHEDULED flag |

---

## Decision Rules (Summary)

1. Frame handoff as positive next step — NEVER as "AI limitation"
2. Collect name → phone → preferred time in strict sequence, one per turn
3. Never ask all 3 in one message
4. Log full conversation context to CRM before handoff completes
5. Trust concern suspends handoff; ACP-08 takes control

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: entire conversation context; trust state; prior data from all capabilities
- Write: full handoff record to CRM including conversation summary

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

ACP-17 IS the lead capture capability in handoff contexts. It subsumes ACP-11. All lead data collected here follows the same field sequence (name, phone, preferred time) with the same one-per-turn rule.

---

## Trust Policy

Trust concern from Trust Engine suspends ACP-17 immediately. ACP-08 takes control. Handoff may resume after trust concern is resolved.

---

## Escalation Rules

ACP-17 is itself the escalation point for all capabilities. It does not escalate further except to Jirawat.

---

## Response Style (Summary)

- Warm and affirming
- Frame Jirawat as a trusted personal advisor, not as a fallback
- Clear about what Jirawat will do and when

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER frame as "AI doesn't know"
- NEVER ask more than 3 fields
- NEVER ask all 3 in one message
- NEVER handoff without logging conversation context

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| Customer declines all contact info | Log conversation context only; note customer declined; close warmly |
| Customer is in emergency during handoff | Immediately switch to IMMEDIATE handoff type; get phone only if possible |
| Trust concern during handoff | Suspend; ACP-08; resume after resolution |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Conversation context logged before handoff | 100% of handoffs have CRM log |
| Phone number captured | ≥ 80% of warm handoffs |
| Positive framing achieved | No negative handoff framing in responses |

---

## Metrics

| Metric | Description |
|---|---|
| handoff_rate | % of sessions that result in a handoff |
| context_logging_rate | % of handoffs with full conversation context in CRM |
| handoff_to_meeting_rate | % of handoffs that result in Jirawat successfully connecting with customer |

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
