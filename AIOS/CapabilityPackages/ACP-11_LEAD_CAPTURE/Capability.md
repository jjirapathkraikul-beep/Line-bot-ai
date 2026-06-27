# Lead Capture Capability

| Field | Value |
|---|---|
| Document ID | ACP-11-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-11  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Collect customer contact information (name, phone number, preferred contact time) in a natural, non-pressuring conversational sequence after another capability has delivered meaningful value and the customer has expressed genuine interest.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Ensure that every interested customer interaction results in a CRM record so Jirawat can follow up with a personalized consultation call within the agreed timeframe.

---

## Customer Goal

Receive a callback from Jirawat at a time that is convenient for the customer, to continue the insurance discussion with a human advisor.

---

## Supported Intents

This capability is NOT triggered by customer intent. It is activated programmatically by other capabilities after value delivery.

| Trigger Source | Condition |
|---|---|
| Any ACP-02 to ACP-10 | Customer expresses interest post-value delivery |
| ACP-17 HUMAN_HANDOFF | Handoff preparation requires contact data |
| ACP-19 CLOSING | Customer indicates purchase readiness |

---

## Supported Emotions

| Emotion | Handling |
|---|---|
| Curious / Interested | Standard lead capture sequence |
| Hesitant | Soften request; make clear it is optional |
| Trusting | Standard sequence; proceed smoothly |
| Anxious (trust concern) | SUSPEND lead capture; do not collect data |
| Frustrated | Do not attempt lead capture; de-escalate first |

---

## Conversation Dataset References

- **CID-16**: `AIOS/ConversationDataset/16_HUMAN_HANDOFF.md` — contains handoff and lead capture conversation patterns

---

## Knowledge Dependencies

- `AIOS/Trust/Trust_Engine.md` — determines whether trust concern is active (blocks lead capture)
- `AIOS/Domains/Insurance/FAQ.md` — general FAQ context

---

## Decision Rules (Summary)

1. NEVER activate before value has been delivered by another capability
2. Collect fields in strict order: Name → Phone → Preferred Time
3. One field per conversational turn
4. If customer declines any field, acknowledge gracefully and do not retry
5. If trust concern is detected at any point, suspend immediately
6. If field is already known from prior conversation, skip it

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: customer name, phone if already captured; trust state; which capability called this
- Write: name, phone, preferred_contact_time to CRM; lead_captured flag; triggering_capability

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

This capability IS the lead capture mechanism. It is responsible for writing the lead record to the CRM. The lead is considered captured when at minimum a phone number has been recorded.

---

## Trust Policy

If a trust signal is detected at any point during lead capture:
1. Immediately suspend the lead capture sequence
2. Activate ACP-08_TRUST_ADVISOR
3. Do NOT resume lead capture until trust concern is resolved

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer explicitly asks to speak to Jirawat | Activate ACP-17_HUMAN_HANDOFF (subsumes lead capture) |
| Customer expresses emergency or urgent health concern | Activate ACP-16_HOSPITAL_GUIDANCE; abort lead capture |
| Customer asks claim question mid-capture | Activate ACP-15_CLAIM_SUPPORT; defer lead capture |

---

## Response Style (Summary)

- Warm and conversational, not form-filling
- One question per message
- Acknowledge each answer before asking the next question
- Never sound transactional or pushy

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER activate before value delivery
- NEVER ask multiple fields in one turn
- NEVER collect during trust concern, claim, or hospital emergency
- NEVER re-ask a known field
- NEVER push after decline

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Detection | Recovery |
|---|---|---|
| Customer declines all fields | Customer says no / doesn't respond | Acknowledge gracefully; end capability; do not re-attempt in same session |
| Trust concern during capture | Trust Engine signal | Suspend capture; activate ACP-08 |
| Customer goes off-topic | Intent classifier detects new topic | Pause capture; handle new topic; return if appropriate |
| Calling capability did not deliver value | Activation guard check fails | Block activation; log warning |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Lead capture rate (interested customers) | ≥ 70% |
| Average fields captured per lead | ≥ 2 of 3 |
| Customer satisfaction (post-capture) | No negative sentiment expressed |
| Data accuracy | Phone number format valid |

---

## Regression Tests (Summary)

- TEST-11-01: Single field per turn verification
- TEST-11-02: Decline handling — no retry
- TEST-11-03: Already-known field skip
- TEST-11-04: Trust concern suspension
- TEST-11-05: Activation guard — no capture before value delivery

Full test cases: see `Regression.md`

---

## Metrics

| Metric | Description |
|---|---|
| lead_capture_rate | % of interested customers who provide at least a phone number |
| fields_per_lead_avg | Average number of fields collected per lead |
| decline_rate | % of customers who decline to share any contact information |
| premature_activation_count | Number of times activation guard blocked premature capture |

---

## Future Extensions (Summary)

- LINE OA ID capture as optional 4th field
- Lead quality scoring based on conversation context
- Automated CRM record creation via API

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
