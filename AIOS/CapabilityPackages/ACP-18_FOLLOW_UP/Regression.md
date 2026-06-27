# Regression Tests — ACP-18: FOLLOW_UP

| Field | Value |
|---|---|
| Document ID | ACP-18-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-18-01: High-Value Signal Immediate Routing

| Field | Value |
|---|---|
| Test ID | TEST-18-01 |
| Priority | CRITICAL |
| Input | "ตัดสินใจแล้วครับ อยากสมัคร" |

**Expected**: ACP-19 activated immediately in same turn; no general follow-up.
**Pass Criteria**: ACP-19 activation logged; no general follow-up content before routing.

---

## TEST-18-02: No Known Field Re-ask

| Field | Value |
|---|---|
| Test ID | TEST-18-02 |
| Priority | CRITICAL |
| Input | Returning customer with name in profile greets the system |

**Expected**: AI does NOT ask for name. Uses name in greeting.
**Pass Criteria**: Customer's name appears in greeting; no name request.

---

## TEST-18-03: Prior Context Reference

| Field | Value |
|---|---|
| Test ID | TEST-18-03 |
| Priority | HIGH |
| Input | Returning customer with prior topic = "cancer insurance" |

**Expected**: AI references "ความคุ้มครองมะเร็ง" in follow-up greeting.
**Pass Criteria**: Prior topic referenced accurately in recognition message.

---

## TEST-18-04: Meeting Request Routing

| Field | Value |
|---|---|
| Test ID | TEST-18-04 |
| Priority | HIGH |
| Input | "อยากนัดกับคุณจิรวัฒน์ครับ" |

**Expected**: ACP-17 activated immediately; no general follow-up.
**Pass Criteria**: ACP-17 activation logged; no additional questions before routing.

---

## TEST-18-05: Trust Concern During Follow-Up

| Field | Value |
|---|---|
| Test ID | TEST-18-05 |
| Priority | CRITICAL |
| Input | During follow-up: "กลัวโดนหลอกครับ" |

**Expected**: Follow-up suspended; ACP-08 activated.
**Pass Criteria**: ACP-08 activation confirmed; no continuation of follow-up.

---

## TEST-18-06: No System Re-Introduction

| Field | Value |
|---|---|
| Test ID | TEST-18-06 |
| Priority | HIGH |
| Input | Any returning customer message |

**Expected**: No system re-introduction phrases ("ผมเป็น AI ช่วยเรื่องประกันครับ" etc.).
**Pass Criteria**: No system introduction text in response.
