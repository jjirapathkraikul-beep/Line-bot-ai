# Decision Rules — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Handoff is a critical conversion and service moment.

---

## Activation Conditions

| Source | Condition |
|---|---|
| Any capability | Determines handoff is appropriate |
| Customer direct request | INT-17-01, INT-17-02, INT-17-03 detected |
| Emergency detected | Immediate handoff regardless of session state |

---

## Handoff Type Selection

| Type | Selection Criteria |
|---|---|
| IMMEDIATE | Emergency signal; explicit "now" request; trust concern resolution |
| WARM | Post-value delivery; positive signal; customer expressed interest |
| SCHEDULED | Complex question; customer wants to continue; no urgency |

---

## Execution Conditions

### Positive Framing Rule (MANDATORY)
- NEVER say "ระบบไม่รู้ครับ", "ตอบไม่ได้ครับ", or any limitation framing
- ALWAYS frame as value-add: "คุณจิรวัฒน์จะช่วยดูแลเรื่องนี้ได้ดียิ่งขึ้นครับ"
- Frame reason for handoff as customer benefit, not AI limitation

### Data Collection Rule (Subsumes ACP-11)
- Collect name → phone → preferred time in strict sequence
- One field per turn — HARD RULE
- Skip fields already known
- Decline → acknowledge gracefully; do not retry

### Context Logging Rule (MANDATORY)
- Before completing handoff, write full context to CRM
- Context package must include: topics discussed, all capabilities activated, customer preference signals, any objections raised, recommended next action for Jirawat

### IMMEDIATE Handoff Data Rule
- In IMMEDIATE handoff, phone number is the only required field
- Name and time are optional if situation is urgent
- CRM log still required; flag as URGENT

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Phone captured; CRM logged | SUCCESS |
| Customer declines all contact; CRM logged | SUCCESS (partial) |
| Trust concern during handoff | INTERRUPT → ACP-08 |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern | CRITICAL | Suspend; ACP-08; resume after resolution |
| Emergency escalation during handoff | HIGH | Switch to IMMEDIATE type; expedite |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer asks more questions during handoff | Answer first (Answer Before Asking); then return to handoff data collection |
| Phone format invalid | Accept as entered; note for Jirawat |
| Customer changes preferred time | Update; do not re-ask other fields |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Customer declines all contact information | "ไม่เป็นไรครับ ถ้าพร้อมคุยเมื่อไหร่ทักมาได้เลยนะครับ" |
| CRM write fails | Log locally; flag for manual entry; do not delay completing handoff conversation |

---

## Conflict Resolution

| Conflict | Resolution |
|---|---|
| ACP-11 and ACP-17 both active | ACP-17 takes precedence; ACP-11 deactivates |
| Customer provides conflicting contact info | Use latest provided; note discrepancy for Jirawat |
