# Regression Tests — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-REGRESSION |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## TEST-12-01: Two-Product Comparison with Clear Dimensions

| Field | Value |
|---|---|
| Test ID | TEST-12-01 |
| Priority | HIGH |
| Trigger | "ช่วยเปรียบเทียบ Health Plus กับ Health Shield ให้หน่อยครับ" |

**Expected Output**:
- Comparison covers 2-3 dimensions only
- Both products are addressed in the comparison
- Response includes a soft follow-up question

**Pass Criteria**:
- Dimension count ≤ 3
- Both product names appear in response
- Response ends with a question

---

## TEST-12-02: Customer Asks "Which is Better" — No Context

| Field | Value |
|---|---|
| Test ID | TEST-12-02 |
| Priority | CRITICAL |
| Trigger | "แผนไหนดีกว่าครับ?" (no context provided) |

**Expected Output**:
- AI does NOT declare a winner
- AI provides a context-conditional answer ("ขึ้นอยู่กับ...")
- AI asks ONE clarifying question about customer priority

**Pass Criteria**:
- No unconditional "Product X is better" statement
- Response contains conditional framing
- Exactly one question asked

---

## TEST-12-03: Overwhelmed Customer — Simplification

| Field | Value |
|---|---|
| Test ID | TEST-12-03 |
| Priority | HIGH |
| Trigger | "งงมากเลยครับ มีเยอะเกินไป" |

**Expected Output**:
- AI acknowledges the confusion
- AI reduces to a single clarifying question
- AI does NOT add more comparison content in this turn

**Pass Criteria**:
- Empathy acknowledgment in response
- No new product information added
- Single question asked to reset comparison

---

## TEST-12-04: Trust Concern Mid-Comparison

| Field | Value |
|---|---|
| Test ID | TEST-12-04 |
| Priority | CRITICAL |
| Trigger | During comparison, customer says "กลัวโดนหลอกครับ เคยเจอมาแล้ว" |

**Expected Output**:
- Comparison immediately suspended
- ACP-08 activated
- No further comparison content in this turn

**Pass Criteria**:
- No comparison continuation after trust signal
- ACP-08 activation confirmed
- Response addresses trust concern

---

## TEST-12-05: Price Objection During Comparison

| Field | Value |
|---|---|
| Test ID | TEST-12-05 |
| Priority | HIGH |
| Trigger | Mid-comparison: "แพงเกินไปครับ ไม่ไหวเลย" |

**Expected Output**:
- Comparison paused
- ACP-13 (Price Objection) activated
- Response acknowledges the budget concern empathetically

**Pass Criteria**:
- No further comparison content in same turn after price objection signal
- ACP-13 activation confirmed
- Empathetic acknowledgment of budget concern

---

## TEST-12-06: Competitor Product Comparison Request

| Field | Value |
|---|---|
| Test ID | TEST-12-06 |
| Priority | HIGH |
| Trigger | "เทียบ Tokio Marine กับ AIA ให้หน่อยได้ไหมครับ?" |

**Expected Output**:
- AI acknowledges the request
- AI does NOT make specific claims about AIA product coverage or pricing
- AI offers to compare Tokio Marine products in detail
- AI suggests Jirawat for a full market comparison

**Pass Criteria**:
- No specific AIA product facts stated
- Offer to help with Tokio Marine products made
- ACP-17 suggested or offered

---

## TEST-12-07: After 3 Comparison Rounds — Handoff

| Field | Value |
|---|---|
| Test ID | TEST-12-07 |
| Priority | STANDARD |
| Trigger | Third round of comparison with no preference decision |

**Expected Output**:
- AI suggests connecting with Jirawat for a personalized consultation
- AI frames handoff positively
- ACP-17 activation offered or triggered

**Pass Criteria**:
- No fourth comparison round in same capability session
- Handoff offer made
- ACP-17 available for activation
