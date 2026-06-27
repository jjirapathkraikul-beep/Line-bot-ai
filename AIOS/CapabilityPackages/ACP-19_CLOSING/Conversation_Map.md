# Conversation Map — ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Direct readiness signal | "ตัดสินใจแล้วครับ" / "พร้อมแล้วครับ" |
| From ACP-18 Follow-Up | High-value signal detected in returning customer |
| From ACP-09 Recommendation | Customer accepts recommendation |
| Appointment request | "อยากนัดกับคุณจิรวัฒน์ครับ" |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Lead Captured | Phone captured; closing complete | ACP-17 for Jirawat engagement |
| SUCCESS — Lead Existed | Lead already in CRM; closing acknowledged | ACP-17 for appointment |
| TRUST INTERRUPT | Trust concern during closing | ACP-08; return if re-confirmed |
| GRACEFUL PAUSE | Customer not ready to commit right now | Acknowledge; leave door open; no pressure |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Emergency signal | CRITICAL | Suspend; activate ACP-16 |

---

## Resume Rules

| After Interrupt | Resume? | Condition |
|---|---|---|
| After ACP-08 | Yes | Customer re-confirms readiness |
| After ACP-16 | No | Hospital situation takes priority |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE | ACP-09 Recommendation or ACP-18 Follow-Up (high-value signal) |
| EMBEDDED | ACP-11 Lead Capture logic (if lead not yet captured) |
| AFTER | ACP-17 Human Handoff for Jirawat engagement |

---

## Conversation Flow Summary

```
[Closing signal detected]
         |
         v
  [Step 1: Affirm decision]
  "ดีมากเลยครับ ที่ตัดสินใจแบบนี้คือทางเลือกที่ดีครับ"
  No second-guessing; no "แน่ใจหรือ?"
         |
         v
  [Step 2: Clear next steps — 2-3 steps]
  What Jirawat will do
  What customer should prepare
  Expected timeline
         |
         v
  [Step 3: Lead capture if needed]
  Name → Phone → Preferred time (one per turn; skip if known)
         |
         v
  [Step 4: Confirmation]
  "คุณจิรวัฒน์จะติดต่อกลับ [when] เพื่อดำเนินการต่อครับ"
         |
         v
  [Route to ACP-17 for Jirawat engagement]
```
