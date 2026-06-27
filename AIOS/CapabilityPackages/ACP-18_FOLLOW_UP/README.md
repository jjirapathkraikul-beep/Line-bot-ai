# ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-18  
**Package Name**: FOLLOW_UP  
**One-Line Purpose**: Re-engage returning customers with contextual continuity, warm recognition, and immediate detection of high-value purchase signals.

---

## What This Capability Does

When a returning customer resumes a prior conversation, ACP-18:

1. **Warmly acknowledges** their return without re-introducing the system
2. **References prior context** when available (what they discussed, what they were interested in)
3. **Detects high-value signals** immediately (purchase readiness, decision made, wants to schedule)
4. **Updates the lead record** if new contact information is provided
5. **Routes efficiently** to the appropriate capability based on the returning customer's need

This capability treats returning customers as ongoing relationships, not new conversations.

---

## What This Capability Does NOT Do

- Does NOT re-introduce everything from scratch to a returning customer
- Does NOT re-ask for information already captured in prior sessions
- Does NOT ignore high-value purchase signals by continuing small talk

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `follow_up` | "สวัสดีครับ กลับมาถามอีกทีครับ" |
| `ตามเรื่องที่คุยไป` | "ตามเรื่องที่คุยไปครับ" |
| `returning_customer` | Any message from a customer with prior session history |
| High-value signal | "พร้อมสมัครแล้วครับ", "ตัดสินใจแล้วครับ", "อยากนัดครับ" |

---

## High-Value Purchase Signals (IMMEDIATE ROUTING)

When these signals are detected, skip general follow-up and route immediately:

| Signal | Thai Examples | Route To |
|---|---|---|
| Purchase readiness | "พร้อมสมัครแล้วครับ", "ตัดสินใจแล้วครับ" | ACP-19_CLOSING |
| Meeting request | "อยากนัดครับ", "ขอนัดคุณจิรวัฒน์ได้ไหม?" | ACP-17_HUMAN_HANDOFF |
| Explicit purchase intent | "อยากซื้อเลยครับ" | ACP-19_CLOSING |

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
| ACP-19_CLOSING | High-value signals route directly here |
| ACP-17_HUMAN_HANDOFF | Meeting requests route here |
| ACP-11_LEAD_CAPTURE | Lead update if new contact info provided |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts |
| ACP-10_NEED_DISCOVERY | May re-activate if situation has changed significantly |
