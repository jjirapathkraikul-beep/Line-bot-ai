---
Document ID: ACP-08-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Decision Rules

**Priority Level**: CRITICAL — overrides ALL other capabilities

---

## Activation Conditions

ACP-08 activates on ANY of the following, from ANY conversation state:

| Condition                            | Signal Type                                               |
|--------------------------------------|-----------------------------------------------------------|
| Trust signal keyword detected        | มิจฉาชีพ, โกง, ต้มตุ๋น, หลอก, ฉ้อโกง, แก๊ง, น่าเชื่อถือไหม |
| Trust intent classified              | `intent == trust_concern OR fraud_concern`                |
| Verification request detected        | "ตรวจสอบ", "ยืนยัน", "ใบอนุญาต", "ลองโทรหา"            |
| Data theft fear detected             | Customer expresses fear about data being stolen           |

---

## Preconditions

None. ACP-08 has no preconditions. It activates immediately on any trust signal regardless of:
- Which ACP is currently active
- What stage of the conversation has been reached
- Whether any data has been collected
- Whether educational value has been delivered

---

## Execution Conditions

MANDATORY SEQUENCE — no deviation permitted:

1. **Suspend all active ACPs**: Immediately freeze the current ACP's state.
2. **Block all data collection**: No name, phone, or personal data requests.
3. **Block all product mentions**: No insurance product discussion.
4. **Acknowledge concern in first sentence**: Do not answer any other topic first.
5. **Provide verifiable credentials** (all of the following):
   - Jirawat Jirapathkraikul — full name
   - Insurance agent license ID (from `AIOS/Trust/Trust_Engine.md`)
   - Tokio Marine Life Insurance Thailand — registered company
   - OIC verification URL or process
6. **Offer to answer without personal data**: "ถามได้เลยโดยไม่ต้องให้ข้อมูลใดๆ ก่อนครับ"
7. **Direct to official verification**: "สามารถตรวจสอบใบอนุญาตได้ที่ คปภ. (OIC) ครับ"

---

## Post-Trust-Resolution Conditions

After customer signals that their concern is resolved:

1. **Start 2-turn cooling period**: No lead capture, no product mentions for 2 turns.
2. **Resume suspended ACP**: After cooling period, resume from where suspended.
3. **Maintain `trust_signal_in_session = TRUE`**: Permanently flagged; Jirawat notified.
4. **Proceed with caution mode**: Higher empathy, lower sales urgency for remainder of session.

---

## Exit Conditions

| Condition                              | Exit Action                                            |
|----------------------------------------|--------------------------------------------------------|
| Customer satisfied; cooling period complete | Resume suspended ACP in caution mode             |
| Customer requests Jirawat direct       | Provide contact; session may close                     |
| Customer leaves conversation           | Session closed; CRM flag written                       |
| Trust unresolved after 3 turns         | Proactively offer Jirawat direct call                  |

---

## Fallback Rules

| Scenario                                    | Fallback Action                                        |
|---------------------------------------------|--------------------------------------------------------|
| Customer won't accept any verification      | Respect decision; do not pressure; offer Jirawat call  |
| Trust Engine false positive (not real concern) | ACP-08 response still applies; it is low-cost insurance |
| Customer trusts AI but not Jirawat          | Acknowledge; explain AI is Jirawat's assistant         |

---

## Conflict Resolution

ACP-08 has no conflicts. It overrides everything. No exception is documented because no exception is permitted.
