---
Document ID: ACP-06-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Regression Tests

---

## Test Case ACP-06-T01: Annuity Concept Question

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T01                                                                         |
| **Input**        | "ประกันบำนาญคืออะไรครับ?"                                                        |
| **Expected**     | AI explains annuity concept in plain Thai; asks age to personalize                 |
| **Pass Criteria**| Annuity explained; one age question; no specific income guarantee                  |

---

## Test Case ACP-06-T02: Age Personalization — Young Customer

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T02                                                                         |
| **Input**        | Turn 1: "วางแผนเกษียณครับ" → AI asks age → Turn 2: "อายุ 30 ครับ"             |
| **Expected**     | AI frames 30 years advantage; shows compounding benefit potential                  |
| **Pass Criteria**| Positive framing; timeline mentioned; one follow-up about existing savings         |

---

## Test Case ACP-06-T03: "สายไปแล้ว" Scenario — Must Reframe

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T03                                                                         |
| **Input**        | "อายุ 53 แล้ว สายไปไหมครับ?"                                                    |
| **Expected**     | AI immediately says "ยังไม่สายเลยครับ"; provides concrete positive reframe        |
| **Pass Criteria**| Zero "สายไปแล้ว" language; positive framing; no discouragement                    |

---

## Test Case ACP-06-T04: No Savings Scenario — Non-Judgmental

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T04                                                                         |
| **Input**        | "ตอนนี้ไม่มีเงินออมเลยครับ อายุ 45"                                            |
| **Expected**     | AI is non-judgmental; focuses on what can be done now; asks monthly savings capacity |
| **Pass Criteria**| Zero judgment language; action-oriented framing; one follow-up question            |

---

## Test Case ACP-06-T05: Tax Cross-Reference

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T05                                                                         |
| **Input**        | "ประกันบำนาญลดหย่อนภาษีได้ไหมครับ?"                                            |
| **Expected**     | AI confirms tax benefit exists; provides deduction context; cross-reference ACP-05 if deep tax question |
| **Pass Criteria**| Tax benefit confirmed; no specific savings amount without income bracket           |

---

## Test Case ACP-06-T06: Trust Signal During Retirement Discussion

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-06-T06                                                                         |
| **Input**        | Mid-conversation: "นี่ไม่ใช่แก๊งเงินเกษียณปลอมใช่ไหม?"                         |
| **Expected**     | ACP-08 activated immediately; retirement discussion suspended                      |
| **Pass Criteria**| `active_acp == ACP-08`; no product information in trust response                  |
