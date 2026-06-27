# Decision Rules — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**STANDARD** — Lead capture is important but never overrides safety, trust, or support priorities.

---

## Activation Conditions

All of the following must be TRUE for ACP-11 to activate:

| Condition | Check | Source |
|---|---|---|
| A calling capability has completed value delivery | `calling_capability.value_delivered == true` | Conversation State |
| No active trust concern flag | `trust_engine.concern_active == false` | Trust Engine |
| Current context is NOT ACP-15 (Claim) | `active_capability != ACP-15` | Conversation State |
| Current context is NOT ACP-16 (Hospital) | `active_capability != ACP-16` | Conversation State |
| Customer has expressed interest or positive signal | `customer_sentiment == interested OR positive` | Sentiment Layer |

If ANY condition is FALSE: do not activate. Log blocked activation event.

---

## Preconditions

| Precondition | Description |
|---|---|
| Value has been delivered | The customer has received meaningful, relevant information from a prior capability |
| Customer is not distressed | No emotional distress or crisis signal in recent turns |
| Session is not in restricted context | Not mid-claim, mid-hospital-guidance, or mid-trust-investigation |

---

## Execution Conditions

Once activated, execute in strict sequence:

### Stage 1: Name
- **Rule**: Ask for name only if `customer_profile.name` is NULL or unknown
- **Skip condition**: Name is already known → proceed to Stage 2
- **Response to decline**: Acknowledge; proceed to Stage 2 without retrying name

### Stage 2: Phone
- **Rule**: Ask for phone only if `customer_profile.phone` is NULL or unknown
- **Skip condition**: Phone is already known → proceed to Stage 3
- **Response to decline**: Acknowledge; proceed to Stage 3 without retrying phone
- **Validation**: Phone number must match Thai mobile format (0X-XXXX-XXXX or similar)

### Stage 3: Preferred Contact Time
- **Rule**: Ask for preferred time only after Stage 2 is complete or skipped
- **Skip condition**: Preferred time already known
- **Response to decline**: Acknowledge; complete capability with available fields

### One Question Per Turn (HARD RULE)
- NEVER ask for name AND phone in the same message
- NEVER ask for phone AND preferred time in the same message
- Each stage is one turn

---

## Exit Conditions

| Condition | Exit Type |
|---|---|
| All three fields collected | SUCCESS |
| Phone collected (name or time may be missing) | PARTIAL SUCCESS — lead is viable |
| Customer declines all fields explicitly | GRACEFUL DECLINE |
| Trust signal detected | INTERRUPT |
| Emergency signal detected | INTERRUPT |
| Two consecutive turns with no customer response | TIMEOUT |

---

## Interrupt Conditions

| Interrupt | Priority | Trigger | Action |
|---|---|---|---|
| Trust concern | CRITICAL | Trust Engine flag | Suspend; activate ACP-08; do NOT resume until resolved |
| Emergency / hospital | CRITICAL | Emergency keyword detection | Suspend; activate ACP-16; do NOT resume |
| Claim question | HIGH | Claim intent detected | Pause; activate ACP-15; do NOT resume |
| Explicit request for Jirawat | HIGH | Contact intent | Transition to ACP-17; do NOT resume separately |

---

## Recovery Conditions

| Scenario | Recovery Action |
|---|---|
| Customer provides unexpected answer (e.g., responds to name question with a question) | Answer the customer's question first (Answer Before Asking principle); then return to the field request |
| Customer provides partial phone number | Acknowledge and ask for the complete number in same stage |
| Customer provides name in nickname form | Accept as-is; do not request full name unless policy requires it |
| After trust concern resolved | Resume from the last incomplete stage if customer re-engages |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Customer declines to share any information | End gracefully: "ไม่เป็นไรครับ ถ้าสนใจคุยเพิ่มเติมเมื่อไหร่ก็ทักมาได้เลยครับ" |
| Phone format unrecognized | Accept as entered; do not reject; note for Jirawat |
| Preferred time is vague ("any time") | Accept; record as "flexible" in CRM |

---

## Conflict Resolution

| Conflict | Resolution |
|---|---|
| Customer provides new phone number different from existing record | Use new number; log update; flag for Jirawat review |
| Calling capability and ACP-17 both want to run lead capture | ACP-17 takes precedence; ACP-11 defers |
| Multiple triggers in same turn (e.g., trust signal + customer provides name) | Trust signal wins; suspend regardless of what customer just provided |
