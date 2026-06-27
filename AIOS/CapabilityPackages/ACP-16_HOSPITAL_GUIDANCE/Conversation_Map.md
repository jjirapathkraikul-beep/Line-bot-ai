# Conversation Map — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Network hospital question | "โรงพยาบาลไหนเข้าได้บ้างครับ?" |
| In-hospital question | "อยู่โรงพยาบาลอยู่ครับ" |
| Admission procedure question | "ต้องทำอะไรตอนเข้าโรงพยาบาลครับ?" |
| Emergency signal | "ฉุกเฉิน" / "ต้องไปโรงพยาบาลด่วน" |
| Any signal indicating active hospital situation | Customer is or will soon be at a hospital |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Guided | Customer received actionable guidance | Offer post-hospital claim support (ACP-15) |
| HANDOFF | Complex navigation or specific hospital lookup | ACP-17 |
| SESSION CLOSE | Guidance complete; customer going to hospital | Close warmly; no further questions |

---

## Interrupt Rules

> **RULE**: Trust signals can interrupt ACP-16 ONLY AFTER emergency guidance has been provided. Emergency guidance takes absolute first priority.

| Interrupt | Priority | Timing |
|---|---|---|
| Trust concern signal | CRITICAL | After emergency guidance is given |
| ACP-11 attempt | BLOCKED | Always |
| New insurance question | LOW | After hospital guidance is complete |

---

## Resume Rules

ACP-16 does not suspend for most interrupts. Emergency guidance completes first, then other signals are handled.

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE | Can be entered from any state; takes immediate priority |
| DURING | Blocks ACP-11; can yield to trust signals after guidance given |
| AFTER | ACP-15 (Claim Support) for post-visit claim process |
| NEVER | ACP-11 Lead Capture |

---

## Conversation Flow Summary

```
[Hospital intent detected at any severity level]
         |
         v
  [IMMEDIATE: Set hospital_guidance_active = true]
  [IMMEDIATE: Set lead_capture_blocked = true]
         |
         v
  [Determine situation severity]
  - EMERGENCY → Emergency protocol FIRST (go now; notify in 24h)
  - PLANNED ADMISSION → Network check + admission steps
  - GENERAL QUESTION → Network info + process explanation
         |
         v
  [Emergency Protocol (ALWAYS included)]
  "ถ้าฉุกเฉินจริง ให้ไปโรงพยาบาลใกล้ที่สุดก่อนเลยครับ
   ไม่ต้องรอหาโรงพยาบาลในเครือข่าย แล้วแจ้งโตเกียวมารีนภายใน 24 ชั่วโมง"
         |
         v
  [Specific guidance for situation type]
  - Network hospital: what to say, what to show
  - Non-network: pay and claim reimbursement after
  - Admission: step-by-step checklist
         |
         v
  [Close]
  "ถ้ามีอะไรเพิ่มเติม คุณจิรวัฒน์พร้อมช่วยครับ"
  [Offer ACP-15 for post-visit claim process]
```
