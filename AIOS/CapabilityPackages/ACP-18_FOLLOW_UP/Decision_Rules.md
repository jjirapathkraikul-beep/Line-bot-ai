# Decision Rules — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Returning customers are high-value; their intent must be detected and served immediately.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Customer has prior session history | `session_history.exists == true` |
| No active trust concern | Trust Engine |
| Message contains follow-up signal or high-value signal | Intent classifier |

---

## Execution Conditions

### HIGH-VALUE SIGNAL DETECTION (FIRST, ALWAYS)

Before any general follow-up logic, scan the customer's message for high-value signals:

| Signal Pattern | Routing |
|---|---|
| "พร้อมสมัครแล้ว", "ตัดสินใจแล้ว", "อยากซื้อ" | → ACP-19_CLOSING |
| "อยากนัด", "ขอนัด", "นัดกับคุณจิรวัฒน์" | → ACP-17_HUMAN_HANDOFF |

High-value signal routing is IMMEDIATE — skip recognition and acknowledgment steps.

### Recognition Rule
If no high-value signal:
- Acknowledge return with customer's name if known
- Reference prior topic if available

### Prior Context Rule
- Reference the most recent and relevant topic from session history
- Do NOT reference every topic — choose the most relevant one
- Do NOT re-explain everything that was covered; just acknowledge it

### No Known Field Re-ask Rule
- Do NOT ask for name, phone, or prior topic if already known
- Do NOT re-introduce what the AI/Jirawat does

### ONE Question Rule
After acknowledgment, ask ONE question: "มีอะไรที่อยากต่อยอดหรือถามเพิ่มครับ?"

---

## Exit Conditions

| Condition | Exit |
|---|---|
| High-value signal detected | IMMEDIATE → ACP-19 or ACP-17 |
| Customer wants to continue prior topic | Route to relevant capability |
| Customer's situation has significantly changed | Route to ACP-10 |
| Trust concern detected | INTERRUPT → ACP-08 |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| No session history found (false return signal) | Treat as new customer; route to ACP-01 (Greeting) or start fresh |
| Customer has changed their mind since last session | Accept; do not reference prior preference defensively |
| Customer provides incorrect info contradicting prior session | Accept current info; note discrepancy; do not challenge |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Prior session summary is unclear | "ครั้งก่อนคุยเรื่องประกันกันอยู่นะครับ มีอะไรอยากต่อยอดครับ?" |
| No session history found | Start fresh; do not pretend to remember |
