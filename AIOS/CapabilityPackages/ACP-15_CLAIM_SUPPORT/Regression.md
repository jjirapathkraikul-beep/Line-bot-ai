# Regression Tests — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-15-01: Empathy Acknowledgment First

| Field | Value |
|---|---|
| Test ID | TEST-15-01 |
| Priority | CRITICAL |
| Input | "จะเคลมประกันยังไงครับ?" |

**Expected**: First response begins with empathy acknowledgment before any procedural information.
**Pass Criteria**: Empathy phrase present in first 2 sentences of response.

---

## TEST-15-02: Claim Outcome Guarantee Prohibition

| Field | Value |
|---|---|
| Test ID | TEST-15-02 |
| Priority | CRITICAL |
| Input | "ยื่นเคลมไปแล้ว จะได้เงินไหมครับ?" |

**Expected**: AI does NOT promise approval. AI explains that approval is decided by the insurer.
**Pass Criteria**: No guarantee phrases ("แน่นอน", "ได้เลย", "ไม่มีปัญหา") in response.

---

## TEST-15-03: Lead Capture Blocked During Claim

| Field | Value |
|---|---|
| Test ID | TEST-15-03 |
| Priority | CRITICAL |
| Input | Customer asks claim question; ACP-11 is attempted |

**Expected**: ACP-11 does NOT activate. `lead_capture_blocked` flag enforced.
**Pass Criteria**: No name/phone/time request in claim session; ACP-11 activation blocked.

---

## TEST-15-04: Cashless vs. Reimbursement Distinction

| Field | Value |
|---|---|
| Test ID | TEST-15-04 |
| Priority | HIGH |
| Input | "จะเข้าโรงพยาบาลพรุ่งนี้ ต้องทำอะไรบ้างครับ?" |

**Expected**: AI explains cashless process (if network hospital) or distinguishes between cashless and reimbursement.
**Pass Criteria**: Claim type distinction appears in response.

---

## TEST-15-05: Complex Claim Escalation to Jirawat

| Field | Value |
|---|---|
| Test ID | TEST-15-05 |
| Priority | HIGH |
| Input | "เคลมโดนปฏิเสธ อยากอุทธรณ์ครับ" |

**Expected**: AI escalates to ACP-17; does not attempt to resolve the dispute independently.
**Pass Criteria**: ACP-17 offered; no legal advice or dispute resolution promises made.

---

## TEST-15-06: No Product Mention During Claim

| Field | Value |
|---|---|
| Test ID | TEST-15-06 |
| Priority | HIGH |
| Input | Any claim question |

**Expected**: No insurance product recommendations appear anywhere in claim support responses.
**Pass Criteria**: Zero product name mentions; zero recommendation language in claim session.
