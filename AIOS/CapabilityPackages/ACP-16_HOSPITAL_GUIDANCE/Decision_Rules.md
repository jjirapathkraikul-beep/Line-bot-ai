# Decision Rules — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**CRITICAL** — ACP-16 is the highest-priority non-trust capability. It overrides any ongoing sales, comparison, or discovery activity.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Hospital-related intent detected (INT-16-01 to INT-16-05) | Intent classifier |
| OR emergency signal detected | Keyword pattern matching |

ACP-16 does NOT require "no trust concern" to activate. It activates immediately and provides emergency guidance before any other state is checked.

Upon activation, IMMEDIATELY set:
- `conversation_state.hospital_guidance_active = true`
- `conversation_state.lead_capture_blocked = true`

---

## Execution Conditions

### Immediacy Rule (HARD RULE)
- Provide guidance in the SAME turn as detection
- NEVER ask questions before providing basic guidance
- If situation is ambiguous, provide emergency protocol first, then ask one clarifying question

### Emergency Protocol Rule (ALWAYS)
- Every hospital guidance response MUST include the emergency protocol:
  - "ถ้าเป็นเรื่องเร่งด่วนฉุกเฉิน ให้ไปโรงพยาบาลใกล้ที่สุดได้เลยครับ ไม่ต้องรอหาโรงพยาบาลในเครือข่าย แล้วแจ้งบริษัทประกันภายใน 24 ชั่วโมง"
  - This protocol MUST appear even if the customer's question is non-emergency

### Network Confirmation Rule
- NEVER confirm that a specific hospital is in the network without verified real-time data
- Acceptable: "โดยทั่วไปโรงพยาบาล [type] มักอยู่ในเครือข่าย แต่แนะนำให้โทรเช็คกับโตเกียวมารีนโดยตรงครับ"
- NOT acceptable: "โรงพยาบาล X อยู่ในเครือข่ายครับ" (without verified data)

### Data Collection Block (ABSOLUTE)
- No data collection during any hospital situation
- Enforced by `lead_capture_blocked = true`

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Guidance provided; customer going to hospital | Close; set post-visit follow-up flag |
| Customer needs specific hospital lookup | Route to ACP-17 or direct to Tokio Marine's finder tool |
| Post-hospital; claim question | Transition to ACP-15 |

---

## Interrupt Conditions

| Interrupt | Priority | Timing |
|---|---|---|
| Trust concern | CRITICAL | After emergency guidance has been provided |
| ACP-11 Lead Capture | BLOCKED | At all times |

Note: ACP-16 does not "suspend" for trust concerns before providing emergency guidance. The emergency protocol is given first.

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer is in emergency (very short messages, urgency signals) | Give emergency protocol immediately; no clarifying questions |
| Network hospital cannot be confirmed | Give general guidance; direct to Tokio Marine's claim line |
| Customer doesn't know policy type | Give general guidance applicable to all policy types |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| All network information uncertain | Emergency protocol + "โทรหาศูนย์บริการโตเกียวมารีนได้เลยครับ" |
| Customer needs location-specific hospital | "คุณจิรวัฒน์ช่วยหาโรงพยาบาลในพื้นที่ให้ได้ครับ" → ACP-17 |
