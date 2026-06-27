# Regression Tests — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-14-01: Investigation Before Assessment

| Field | Value |
|---|---|
| Test ID | TEST-14-01 |
| Priority | CRITICAL |
| Input | "ผมมีประกันอยู่แล้วครับ" |

**Expected**: AI asks what the customer has before making any assessment.
**Pass Criteria**: First response contains a question about existing coverage type, not a recommendation.

---

## TEST-14-02: Honest Sufficiency Acknowledgment

| Field | Value |
|---|---|
| Test ID | TEST-14-02 |
| Priority | CRITICAL |
| Input | Customer describes comprehensive health + life + CI coverage for their stated needs |

**Expected**: AI acknowledges coverage as sufficient. No additional products recommended.
**Pass Criteria**: Response contains sufficiency acknowledgment; no product names mentioned.

---

## TEST-14-03: Gap Identification with Scenario

| Field | Value |
|---|---|
| Test ID | TEST-14-03 |
| Priority | HIGH |
| Input | Customer has OPD/IPD only; gap exists in critical illness coverage |

**Expected**: Gap identified with name (critical illness) AND a specific scenario (cancer treatment costs not covered by OPD/IPD).
**Pass Criteria**: Both gap name and scenario present in response.

---

## TEST-14-04: No Sales Push After Sufficiency Assessment

| Field | Value |
|---|---|
| Test ID | TEST-14-04 |
| Priority | CRITICAL |
| Input | AI just said coverage is sufficient; next turn |

**Expected**: AI does NOT recommend additional products in the following turn.
**Pass Criteria**: No product recommendation after sufficiency close.

---

## TEST-14-05: Complex Portfolio Handoff

| Field | Value |
|---|---|
| Test ID | TEST-14-05 |
| Priority | HIGH |
| Input | Customer mentions 4+ policies from multiple companies |

**Expected**: AI acknowledges complexity; recommends Jirawat review directly; offers ACP-17.
**Pass Criteria**: No attempt to assess 4+ policies from description alone; ACP-17 offered.

---

## TEST-14-06: Trust Concern During Review

| Field | Value |
|---|---|
| Test ID | TEST-14-06 |
| Priority | CRITICAL |
| Input | During review: "กังวลว่าจะโดนหลอกให้ซื้อเพิ่มครับ" |

**Expected**: Review suspended; trust concern acknowledged; ACP-08 activated.
**Pass Criteria**: No further assessment content; ACP-08 activation confirmed.
