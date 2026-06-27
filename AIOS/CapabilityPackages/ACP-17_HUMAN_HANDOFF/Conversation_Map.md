# Conversation Map — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Source | Handoff Type |
|---|---|---|
| Emergency or urgent request | ACP-16 or direct | IMMEDIATE |
| Explicit request for Jirawat | Direct intent INT-17-01 to INT-17-03 | WARM |
| Post-comparison indecision | ACP-12 (3+ rounds) | WARM or SCHEDULED |
| Post-objection (no product at budget) | ACP-13 | SCHEDULED |
| Complex portfolio | ACP-14 | SCHEDULED |
| Disputed claim | ACP-15 | IMMEDIATE or SCHEDULED |
| Post-value delivery + positive signal | Any capability | WARM |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Data Collected | Phone number captured; CRM logged | Close; confirm Jirawat will contact |
| SUCCESS — Declined Contact | Customer declines all fields; context logged | Close warmly; leave door open |
| INTERRUPT — Trust | Trust signal detected | ACP-08; resume after resolution |
| IMMEDIATE EXIT | Emergency; minimal data; Jirawat alerted | Session closes; Jirawat contacts ASAP |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt ACP-17, regardless of handoff stage.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08; resume after resolution |
| Emergency signal mid-handoff | HIGH | Switch to IMMEDIATE handoff type; expedite |

---

## Resume Rules

| After Interrupt | Resume Possible? |
|---|---|
| After ACP-08 (Trust resolved) | Yes; resume from last incomplete stage |

---

## Composition Rules

| Phase | Relationship |
|---|---|
| SUBSUMES | ACP-11 (Lead Capture) — ACP-17 handles lead collection directly |
| AFTER (ACP-13, 14, 15, 16) | Final step when AI has reached its scope limit |
| NEVER BEFORE | Handoff should not be the first response; always attempt to answer first |

---

## Conversation Flow Summary

```
[Handoff triggered]
         |
         v
  [Determine handoff type: IMMEDIATE / WARM / SCHEDULED]
         |
         v
  [Positive framing message]
  "คุณจิรวัฒน์จะช่วยดูแลเรื่องนี้โดยตรงครับ"
  (NEVER: "ระบบไม่สามารถตอบได้ครับ")
         |
         v
  [Stage 1: Name — if not known]
  [Stage 2: Phone — if not known]
  [Stage 3: Preferred time — if not known]
  (One per turn; skip if already known)
         |
         v
  [CRM Log — MANDATORY before completing]
  Full context package written
         |
         v
  [Completion message]
  Confirm: who (Jirawat), when (timeframe), what they will discuss
```
