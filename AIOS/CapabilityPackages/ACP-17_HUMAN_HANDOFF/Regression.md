# Regression Tests — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-17-01: Positive Framing (No Limitation Language)

| Field | Value |
|---|---|
| Test ID | TEST-17-01 |
| Priority | CRITICAL |
| Input | Any handoff trigger |

**Expected**: Response uses positive framing about Jirawat's capability; no limitation phrases.
**Pass Criteria**: No "ตอบไม่ได้", "ระบบไม่รู้", "ไม่สามารถ" in handoff framing.

---

## TEST-17-02: One Field Per Turn

| Field | Value |
|---|---|
| Test ID | TEST-17-02 |
| Priority | CRITICAL |
| Input | Handoff initiated; customer has not provided any fields |

**Expected**: First data collection message asks for name only.
**Pass Criteria**: Only name requested in first handoff data collection message; no phone or time.

---

## TEST-17-03: CRM Context Logged Before Completion

| Field | Value |
|---|---|
| Test ID | TEST-17-03 |
| Priority | CRITICAL |
| Input | Full handoff sequence completed |

**Expected**: CRM write includes: topics_discussed, capabilities_activated, customer_interest, conversation_summary.
**Pass Criteria**: CRM log contains all required fields before handoff is marked complete.

---

## TEST-17-04: Trust Concern Suspends Handoff

| Field | Value |
|---|---|
| Test ID | TEST-17-04 |
| Priority | CRITICAL |
| Input | During handoff: "กลัวว่าจะโดนหลอกนะครับ" |

**Expected**: Handoff suspended; ACP-08 activated; trust concern addressed.
**Pass Criteria**: No continuation of data collection after trust signal; ACP-08 confirmation.

---

## TEST-17-05: Known Fields Skipped

| Field | Value |
|---|---|
| Test ID | TEST-17-05 |
| Priority | HIGH |
| Input | Returning customer; name and phone already in profile |

**Expected**: Handoff skips name and phone; asks only for preferred time.
**Pass Criteria**: No re-ask of known fields; only preferred time requested.

---

## TEST-17-06: IMMEDIATE Handoff — Phone Only

| Field | Value |
|---|---|
| Test ID | TEST-17-06 |
| Priority | HIGH |
| Input | Emergency or urgent claim dispute; IMMEDIATE handoff type |

**Expected**: Only phone is requested; name and preferred time are optional and not pushed.
**Pass Criteria**: Phone captured; no persistent name/time requests in urgent context.
