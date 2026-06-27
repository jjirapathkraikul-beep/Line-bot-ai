# Conversation Map — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Prior session detected | Customer returns; session history exists |
| Direct follow-up statement | "ตามเรื่องที่คุยไปครับ" |
| High-value signal | "ตัดสินใจแล้วครับ" / "พร้อมสมัครแล้ว" / "อยากนัด" |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| HIGH-VALUE SIGNAL | Purchase readiness detected | ACP-19_CLOSING |
| MEETING REQUEST | Customer wants to meet Jirawat | ACP-17_HUMAN_HANDOFF |
| CONTINUE CONVERSATION | Customer wants to continue prior topic | Re-activate relevant capability (ACP-02 through ACP-14) |
| NEW NEED | Customer's situation has changed | ACP-10_NEED_DISCOVERY |
| INTERRUPT — Trust | Trust signal detected | ACP-08 |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Emergency signal | CRITICAL | Suspend; activate ACP-16 |

---

## Composition Rules

| Phase | Relationship |
|---|---|
| BEFORE | Session history from any prior capability |
| AFTER HIGH-VALUE | ACP-19 or ACP-17 |
| AFTER GENERAL | Re-activate the most relevant prior capability |

---

## Conversation Flow Summary

```
[Returning customer detected]
         |
         v
  [FIRST: Scan for high-value signals in current message]
  - Purchase ready? → ACP-19 immediately
  - Meeting request? → ACP-17 immediately
         |
         v
  [No high-value signal]
         |
         v
  [Warm acknowledgment + prior context reference]
  "ยินดีต้อนรับกลับมานะครับ คุณ[ชื่อ]"
  "ครั้งที่แล้วเราคุยเรื่อง [topic] ครับ"
         |
         v
  [What's brought you back?]
  ONE question: "มีอะไรที่อยากรู้เพิ่มเติมครับ?"
         |
         v
  [Route to appropriate capability based on customer's response]
```
