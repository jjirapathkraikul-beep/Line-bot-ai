# ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-19  
**Package Name**: CLOSING  
**One-Line Purpose**: Affirm the customer's decision, set clear next steps, and transition smoothly to purchase — without reopening debate or introducing new products.

---

## What This Capability Does

When a customer signals they are ready to proceed with an insurance purchase or appointment, ACP-19:

1. **Affirms the decision** warmly and sincerely — the customer is making a good choice
2. **Provides clear next steps** — what happens immediately, what Jirawat will do, what the customer should expect
3. **Sets expectations** — timeline, process, what to prepare
4. **Captures lead** if not yet captured (ACP-11 logic embedded)
5. **Does NOT reopen debate** — the decision has been made; the closing stage is not the time for second-guessing

ACP-19 handles the critical moment of purchase commitment with confidence and warmth.

---

## What This Capability Does NOT Do

- Does NOT ask "แน่ใจหรือครับ?" after the customer has decided — this undermines confidence
- Does NOT introduce new products at the closing stage
- Does NOT add objections the customer didn't raise
- Does NOT make the customer feel they need to validate their own decision

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `ready_to_buy` | "อยากซื้อเลยครับ" |
| `ตัดสินใจแล้ว` | "ตัดสินใจแล้วครับ" |
| `พร้อมแล้วครับ` | "พร้อมสมัครแล้วครับ" |
| Decision signal | "โอเคครับ เอาแบบนี้เลย" |

---

## File Index

| File | Purpose |
|---|---|
| README.md | This file |
| Capability.md | Full capability definition |
| Knowledge_Map.md | Knowledge dependencies |
| Conversation_Map.md | Entry/exit and flow |
| Decision_Rules.md | Rules and conditions |
| Memory_Requirements.md | Memory requirements |
| Response_Profile.md | Tone and language |
| Restrictions.md | Prohibitions |
| Examples.md | Thai conversation examples |
| Regression.md | Test cases |
| Future_Extensions.md | Future improvements |

---

## Cross-References

| Package | Relationship |
|---|---|
| ACP-18_FOLLOW_UP | High-value signals from follow-up route here |
| ACP-17_HUMAN_HANDOFF | Post-closing, Jirawat takes over for purchase processing |
| ACP-11_LEAD_CAPTURE | Embedded — collect lead if not yet captured |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts even at closing stage |
