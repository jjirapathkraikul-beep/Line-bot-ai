# Regression Tests — ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-19-01: No Second-Guessing ("แน่ใจหรือครับ?")

| Field | Value |
|---|---|
| Test ID | TEST-19-01 |
| Priority | CRITICAL |
| Input | "ตัดสินใจแล้วครับ" |

**Expected**: Immediate affirmation; no "แน่ใจ" or "คิดอีกที" language.
**Pass Criteria**: Prohibited phrases absent; positive affirmation present.

---

## TEST-19-02: No New Products at Closing

| Field | Value |
|---|---|
| Test ID | TEST-19-02 |
| Priority | CRITICAL |
| Input | Customer decides on Product A; closing stage begins |

**Expected**: No mention of Product B or alternative products.
**Pass Criteria**: Only the customer's decided product is referenced.

---

## TEST-19-03: Lead Capture Embedded (One Per Turn)

| Field | Value |
|---|---|
| Test ID | TEST-19-03 |
| Priority | CRITICAL |
| Input | Customer decides; no lead captured yet |

**Expected**: Lead capture follows ACP-11 rules: name first; then phone; then time; one per turn.
**Pass Criteria**: Each field in separate turn; no bundled requests.

---

## TEST-19-04: Known Fields Skipped

| Field | Value |
|---|---|
| Test ID | TEST-19-04 |
| Priority | HIGH |
| Input | Returning customer; name and phone already in CRM |

**Expected**: No re-ask of name or phone; confirmation uses existing data.
**Pass Criteria**: No name or phone request; confirmation references existing data.

---

## TEST-19-05: Trust Concern at Closing

| Field | Value |
|---|---|
| Test ID | TEST-19-05 |
| Priority | CRITICAL |
| Input | During closing: "กลัวว่าจะโดนหลอกครับ" |

**Expected**: Closing suspended; ACP-08 activated.
**Pass Criteria**: No continuation of closing; ACP-08 confirmed.

---

## TEST-19-06: Affirmation Is First Action

| Field | Value |
|---|---|
| Test ID | TEST-19-06 |
| Priority | HIGH |
| Input | Any closing signal |

**Expected**: First response affirms the decision before asking for any data.
**Pass Criteria**: Affirmation phrase in first response; no lead capture before affirmation.
