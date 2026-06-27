# ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-17  
**Package Name**: HUMAN_HANDOFF  
**One-Line Purpose**: Transfer the conversation to Jirawat with full context, framed as a positive next step — collecting contact information along the way.

---

## What This Capability Does

ACP-17 manages the transition from AI conversation to Jirawat's personal engagement. It:

1. Frames the handoff as a positive, natural next step ("Jirawat can help you with exactly this")
2. Collects name, phone, and preferred contact time (one field per turn)
3. Logs the full conversation context to the CRM so Jirawat arrives fully briefed
4. Handles three handoff types based on urgency and context:

| Type | When | Behavior |
|---|---|---|
| IMMEDIATE | Emergency or explicit request | Contact Jirawat now; minimal data collection |
| WARM | After value delivery + positive signal | Standard lead capture sequence |
| SCHEDULED | Complex question needing Jirawat | Collect preferred time for scheduled callback |

---

## What This Capability Does NOT Do

- Does NOT frame handoff as "AI doesn't know" or "AI can't help" — always positive framing
- Does NOT ask for more than 3 fields (name, phone, preferred time)
- Does NOT ask all 3 fields in one message
- Does NOT initiate handoff before at least attempting to answer the customer's question

---

## Key Activation Signals

ACP-17 is activated by other capabilities, NOT by direct customer intent in most cases.

| Trigger Source | Condition |
|---|---|
| ACP-12 (Comparison) | 3+ rounds without decision |
| ACP-13 (Price Objection) | No product at budget; needs custom solution |
| ACP-14 (Existing Policy) | Complex portfolio |
| ACP-15 (Claim) | Disputed or complex claim |
| Customer explicit request | "อยากคุยกับคนโดยตรงครับ" |
| Emergency / high-urgency | IMMEDIATE handoff type |

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
| ACP-11_LEAD_CAPTURE | ACP-17 subsumes ACP-11; lead capture happens within ACP-17 |
| ACP-15_CLAIM_SUPPORT | Complex claims escalate to ACP-17 |
| ACP-16_HOSPITAL_GUIDANCE | Complex hospital navigation escalates to ACP-17 |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts ACP-17 |
