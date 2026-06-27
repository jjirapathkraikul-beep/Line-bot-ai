# Closing Capability

| Field | Value |
|---|---|
| Document ID | ACP-19-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-19  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Affirm the customer's purchase decision, provide clear next steps, and transition smoothly to Jirawat's personal engagement — without reopening debate, introducing doubts, or adding friction.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Convert expressed purchase intent into confirmed leads and scheduled appointments with Jirawat, with maximum efficiency and minimum friction.

---

## Customer Goal

Feel confident in their decision, know exactly what happens next, and feel that the transition to purchase is smooth and professionally handled.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-19-01 | ready_to_buy | "อยากซื้อเลยครับ" |
| INT-19-02 | ตัดสินใจแล้ว | "ตัดสินใจแล้วครับ เอาแบบนี้" |
| INT-19-03 | พร้อมแล้วครับ | "พร้อมสมัครแล้วครับ" |
| INT-19-04 | commitment_signal | "โอเคครับ เอาแบบนี้เลย" |
| INT-19-05 | appointment_request | "นัดกับคุณจิรวัฒน์ได้ไหมครับ?" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Confident and ready | Affirm decisively; move to next steps immediately |
| Excited | Match energy warmly; proceed efficiently |
| Slightly nervous | Reassure briefly; do NOT over-explain which could amplify nerves |
| Determined | Respect decisiveness; proceed without delay |

---

## Conversation Dataset References

- **CID-18**: `AIOS/ConversationDataset/18_CLOSING.md`

---

## Knowledge Dependencies

- `AIOS/Trust/Trust_Engine.md` — trust state check
- `AIOS/Domains/Insurance/` — process knowledge for what happens after commitment

---

## Decision Rules (Summary)

1. Affirm the decision warmly and immediately
2. Provide 2-3 concrete next steps
3. Collect lead if not already captured (ACP-11 embedded)
4. Route to ACP-17 for Jirawat engagement
5. NEVER re-open debate or introduce doubt

Full rules: see `Decision_Rules.md`

---

## Lead Policy

If lead is not yet captured: collect name → phone → preferred time in this stage (ACP-11 logic embedded, same rules). If lead is already captured: confirm and proceed.

---

## Trust Policy

Trust concern from Trust Engine suspends ACP-19. ACP-08 takes control. After resolution, return to closing if customer re-confirms readiness.

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer ready; Jirawat engagement needed | Activate ACP-17 |
| Trust concern during closing | Activate ACP-08 |

---

## Response Style (Summary)

- Decisive, warm, confident
- No hesitation or second-guessing
- Clear about what happens next

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER ask "แน่ใจหรือครับ?"
- NEVER introduce new products at closing
- NEVER add objections the customer didn't raise
- NEVER make customer re-justify their decision

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| Customer shows sudden doubt | Address the specific doubt; do not dismiss; do not reopen full debate |
| Trust concern at closing | ACP-08; return to closing after resolution if customer re-confirms |
| Customer cannot commit at this moment | Acknowledge gracefully; schedule callback; do not pressure |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Lead captured at closing | ≥ 90% of closing interactions |
| Customer confirms understanding of next steps | Positive acknowledgment |
| No doubt introduced by AI at closing | Zero "are you sure?" instances |

---

## Metrics

| Metric | Description |
|---|---|
| closing_to_lead_rate | % of closing interactions resulting in captured lead |
| closing_to_appointment_rate | % of closing interactions resulting in scheduled Jirawat appointment |
| doubt_introduction_count | Number of times AI introduced unnecessary doubt at closing (should be zero) |

---

## Future Extensions (Summary)

- Automated appointment scheduling
- Post-closing onboarding message
- Digital application form integration

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
