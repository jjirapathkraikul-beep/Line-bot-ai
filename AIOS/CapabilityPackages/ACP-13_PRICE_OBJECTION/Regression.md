# Regression Tests — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-13-01: Acknowledgment Precedes Product Alternatives

| Field | Value |
|---|---|
| Test ID | TEST-13-01 |
| Priority | CRITICAL |
| Input | "แพงเกินไปครับ" (no budget stated) |

**Expected**: AI acknowledges concern; asks ONE budget question. Does NOT present products in same turn.
**Pass Criteria**: Acknowledgment phrase present; no product names in first response.

---

## TEST-13-02: No Product Recommendation Exceeding Budget

| Field | Value |
|---|---|
| Test ID | TEST-13-02 |
| Priority | CRITICAL |
| Input | "งบผม 600 บาท/เดือนครับ" |

**Expected**: All products presented are at or below 600 baht/month.
**Pass Criteria**: No product with premium > 600 baht/month appears in response.

---

## TEST-13-03: Tax Deduction Framing When Applicable

| Field | Value |
|---|---|
| Test ID | TEST-13-03 |
| Priority | HIGH |
| Input | Price objection; `customer_profile.tax_filing = true` |

**Expected**: Tax deduction benefit is mentioned as part of effective cost calculation.
**Pass Criteria**: Response includes tax deduction framing; effective cost after deduction shown.

---

## TEST-13-04: "ถูกมากแล้ว" Prohibition

| Field | Value |
|---|---|
| Test ID | TEST-13-04 |
| Priority | CRITICAL |
| Input | "แพงเกินไปครับ" |

**Expected**: Response does NOT contain "ถูกมากแล้ว" or equivalent dismissals.
**Pass Criteria**: Prohibited phrase absent from response.

---

## TEST-13-05: Genuine Hardship — Graceful Close

| Field | Value |
|---|---|
| Test ID | TEST-13-05 |
| Priority | HIGH |
| Input | "ตอนนี้ไม่มีเงินจริงๆ ครับ เป็นหนี้อยู่ด้วย" |

**Expected**: AI does NOT push any product. Acknowledges the difficulty. Closes warmly with offer to return when ready.
**Pass Criteria**: No product recommendation; compassionate tone; invitation to return.

---

## TEST-13-06: Trust Concern During Price Objection

| Field | Value |
|---|---|
| Test ID | TEST-13-06 |
| Priority | CRITICAL |
| Input | During objection handling: "ผมไม่แน่ใจครับ เคยโดนหลอกซื้อประกันมาแล้ว" |

**Expected**: Price objection handling suspended; ACP-08 activated; trust concern addressed.
**Pass Criteria**: No further price/product content; ACP-08 activation confirmed.
