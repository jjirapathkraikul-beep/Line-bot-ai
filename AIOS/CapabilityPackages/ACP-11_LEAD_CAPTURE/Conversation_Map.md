# Conversation Map — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

This capability has no direct customer-facing entry point. It is always activated by another capability.

| Calling Capability | Activation Signal |
|---|---|
| ACP-02 through ACP-10 | Post-value delivery; customer expresses interest signal |
| ACP-17 HUMAN_HANDOFF | Handoff preparation; contact info needed |
| ACP-19 CLOSING | Customer signals readiness; lead not yet captured |

**Activation Guard**: Before entering, the system MUST confirm:
1. At least one prior capability has completed a value-delivery cycle
2. No active trust concern flag in Trust Engine
3. Not inside ACP-15 or ACP-16 session

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS | At least phone number captured | Lead written to CRM; return to calling capability or close |
| PARTIAL SUCCESS | Name captured but no phone | Partial record written; flag for follow-up |
| GRACEFUL DECLINE | Customer declines all fields | No record written; session ends positively |
| INTERRUPT — Trust | Trust signal detected | Suspend; transfer to ACP-08_TRUST_ADVISOR |
| INTERRUPT — Emergency | Emergency or hospital signal | Transfer to ACP-16_HOSPITAL_GUIDANCE |
| TIMEOUT | No customer response after 2 turns | Write partial record if any; close session |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability regardless of capture stage.

| Interrupt Trigger | Priority | Action |
|---|---|---|
| Trust concern signal (scam, fraud suspicion) | CRITICAL | Immediately suspend; activate ACP-08 |
| Emergency / urgent health signal | CRITICAL | Immediately suspend; activate ACP-16 |
| Customer asks claim question | HIGH | Pause; activate ACP-15; return if customer re-engages |
| Customer explicitly asks for Jirawat | HIGH | Transition to ACP-17; subsume lead capture there |
| Customer goes off-topic | STANDARD | Handle gracefully; return to lead capture if re-engagement occurs |

---

## Resume Rules

| After Interrupt | Resume Possible? | Condition |
|---|---|---|
| After ACP-08 (Trust resolved) | Yes | Trust concern fully resolved; customer re-engages |
| After ACP-16 (Hospital) | No | Hospital guidance takes priority for session |
| After ACP-15 (Claim) | No | Claim support takes priority for session |
| After ACP-17 (Handoff) | No | Handoff subsumes lead capture |
| After off-topic handling | Yes | Customer returns to insurance discussion |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE (required) | Any one of ACP-02 through ACP-10 must have delivered value |
| CONCURRENT | ACP-08 can interrupt at any time |
| AFTER (on success) | ACP-17 if handoff needed; ACP-19 if closing appropriate |
| AFTER (on decline) | Session ends; no subsequent sales capability |

---

## Conversation Flow Summary

```
[Called by another capability]
         |
         v
  [Activation Guard Check]
  - Value delivered? YES
  - Trust concern? NO
  - Restricted context (claim/hospital)? NO
         |
         v
  [Stage 1: Name Collection]
  "ขอทราบชื่อของคุณได้ไหมครับ?"
  Customer responds → store name
         |
         v
  [Stage 2: Phone Collection]
  "ขอเบอร์โทรศัพท์ที่ติดต่อได้สักเบอร์นะครับ"
  Customer responds → store phone
  Customer declines → acknowledge; skip to Stage 3
         |
         v
  [Stage 3: Preferred Time Collection]
  "สะดวกให้คุณจิรวัฒน์โทรกลับช่วงไหนครับ?"
  Customer responds → store preferred_time
  Customer declines → acknowledge; complete with available fields
         |
         v
  [CRM Write]
  Write lead record
         |
         v
  [Completion Message]
  Confirm Jirawat will follow up
  Return to calling capability or close
```

*Detailed conversation examples with Thai dialogue: see `Examples.md`*
