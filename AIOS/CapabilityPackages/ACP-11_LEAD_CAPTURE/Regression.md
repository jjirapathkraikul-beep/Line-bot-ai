# Regression Tests — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Test Suite Overview

| Total Tests | Critical | High | Standard |
|---|---|---|---|
| 7 | 3 | 2 | 2 |

---

## TEST-11-01: Single Field Per Turn

| Field | Value |
|---|---|
| Test ID | TEST-11-01 |
| Priority | CRITICAL |
| Trigger | Calling capability completes value delivery; customer says "อยากรู้เพิ่มเติมครับ" |

**Input Sequence**:
1. Customer expresses interest after ACP-02 value delivery
2. AI responds

**Expected Output**:
- AI asks for name only in the first lead capture message
- AI does NOT mention phone or preferred time in the same message

**Pass Criteria**:
- Response contains exactly one question
- Question is specifically about name
- No phone or time request in same message

---

## TEST-11-02: Phone Decline — No Retry

| Field | Value |
|---|---|
| Test ID | TEST-11-02 |
| Priority | CRITICAL |
| Trigger | Customer declines to share phone number |

**Input Sequence**:
1. AI asks for phone number
2. Customer says "ขอไม่ให้เบอร์ก่อนนะครับ"

**Expected Output**:
- AI acknowledges gracefully ("ไม่เป็นไรเลยครับ" or equivalent)
- AI does NOT ask for phone again in same session
- AI does NOT ask for an alternative contact method unprompted

**Pass Criteria**:
- No second phone request in current session
- Response sentiment is positive and non-pressuring

---

## TEST-11-03: Known Field Skip (Phone Already in Profile)

| Field | Value |
|---|---|
| Test ID | TEST-11-03 |
| Priority | CRITICAL |
| Trigger | Returning customer with phone already in CRM |

**Input Sequence**:
1. ACP-11 activates for returning customer
2. `customer_profile.phone` = "089-999-8888"

**Expected Output**:
- AI does NOT ask for phone
- AI proceeds to ask for preferred time (or confirms existing time if known)

**Pass Criteria**:
- No phone question in the lead capture sequence
- Known field protection is enforced

---

## TEST-11-04: Trust Concern Suspension

| Field | Value |
|---|---|
| Test ID | TEST-11-04 |
| Priority | HIGH |
| Trigger | Trust concern signal detected mid-capture |

**Input Sequence**:
1. ACP-11 activates; AI asks for name
2. Customer says "คุณจะเอาข้อมูลไปขายต่อหรือเปล่า เคยโดนโกงมาแล้ว"

**Expected Output**:
- AI immediately suspends lead capture
- AI addresses the concern directly and empathetically
- ACP-08 (Trust Advisor) is activated
- No further data collection requests in this turn

**Pass Criteria**:
- No continuation of lead capture sequence
- Response acknowledges trust concern
- ACP-08 activation confirmed

---

## TEST-11-05: Activation Guard — Blocked Before Value Delivery

| Field | Value |
|---|---|
| Test ID | TEST-11-05 |
| Priority | HIGH |
| Trigger | Attempted activation at session start |

**Input Sequence**:
1. Session begins
2. `conversation_state.value_delivered = false`
3. ACP-11 activation attempted

**Expected Output**:
- ACP-11 does NOT activate
- Activation blocked; warning logged
- System continues with appropriate value-delivery capability

**Pass Criteria**:
- No lead capture questions presented to customer
- Activation guard event logged

---

## TEST-11-06: All Three Fields — Happy Path

| Field | Value |
|---|---|
| Test ID | TEST-11-06 |
| Priority | STANDARD |
| Trigger | Full lead capture sequence, no interrupts |

**Input Sequence**:
1. Value delivered by ACP-03
2. Customer: "สนใจมากครับ"
3. AI asks name → Customer: "ชื่อวิชัยครับ"
4. AI asks phone → Customer: "082-333-4444"
5. AI asks time → Customer: "เย็นๆ หลัง 5 โมง"

**Expected Output**:
- Each stage in separate turn
- CRM record written with all three fields
- Completion message confirms Jirawat will follow up

**Pass Criteria**:
- CRM fields populated: name="วิชัย", phone="082-333-4444", preferred_time="เย็นๆ หลัง 5 โมง"
- lead_viable = true
- source_capability = ACP-03

---

## TEST-11-07: Hospital Emergency Blocks Capture

| Field | Value |
|---|---|
| Test ID | TEST-11-07 |
| Priority | STANDARD |
| Trigger | Customer mentions hospital emergency mid-capture |

**Input Sequence**:
1. ACP-11 activates; AI asks for name
2. Customer: "พอดีแม่อยู่โรงพยาบาลตอนนี้ครับ ไม่รู้จะเคลมยังไง"

**Expected Output**:
- AI suspends lead capture immediately
- AI activates ACP-16 (Hospital Guidance)
- No further lead capture requests in this session

**Pass Criteria**:
- No name/phone/time request after emergency signal
- ACP-16 activated
- Response provides immediate hospital/claim guidance
