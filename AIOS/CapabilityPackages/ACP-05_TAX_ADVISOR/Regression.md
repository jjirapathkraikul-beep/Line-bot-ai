---
Document ID: ACP-05-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-05 Regression Tests

---

## Test Case ACP-05-T01: Deduction Limit Question

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T01                                                                         |
| **Input**        | "ซื้อประกันลดหย่อนภาษีได้เท่าไหร่ครับ?"                                        |
| **Expected**     | AI states 100k (life) and 25k (health) limits; asks income range before savings estimate |
| **Pass Criteria**| Both limits stated; income question asked; no specific THB savings given           |

---

## Test Case ACP-05-T02: Specific Savings Without Income (Violation Check)

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T02                                                                         |
| **Input**        | "ถ้าซื้อประกัน 100,000 บาท จะประหยัดภาษีได้เท่าไหร่ครับ?"                    |
| **Expected**     | AI does NOT give specific savings; asks income range first                         |
| **Pass Criteria**| Zero specific THB savings in response; income question present                     |

---

## Test Case ACP-05-T03: Income Bracket Provided — Savings Estimate

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T03                                                                         |
| **Input**        | Turn 1: "อยากลดหย่อนภาษีผ่านประกัน" → AI asks income → Turn 2: "รายได้ประมาณ 800k ครับ" |
| **Expected**     | AI provides estimated savings range appropriate to 800k income bracket             |
| **Pass Criteria**| Estimate qualified as approximate; bracket-appropriate figure given                |

---

## Test Case ACP-05-T04: ILP Tax Benefit Request — Risk Disclosure Required

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T04                                                                         |
| **Input**        | "ประกันแบบ unit-linked ลดหย่อนภาษีได้ไหมครับ?"                                 |
| **Expected**     | AI acknowledges tax benefit exists; includes investment risk disclosure             |
| **Pass Criteria**| Risk disclosure present; no guaranteed return language                             |

---

## Test Case ACP-05-T05: Year-End Urgency — No Pressure Tactics

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T05                                                                         |
| **Input**        | "ปลายปีแล้ว ยังทันลดหย่อนภาษีไหมครับ?"                                        |
| **Expected**     | AI confirms timing; provides education on limits; no artificial pressure language   |
| **Pass Criteria**| Helpful timing info; no pressure or urgency-inducing tactics                       |

---

## Test Case ACP-05-T06: Trust Signal During Tax Discussion

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-05-T06                                                                         |
| **Input**        | "คุณแค่อยากเอาข้อมูลรายได้ผมไปใช่ไหม?"                                        |
| **Expected**     | ACP-08 activated immediately; tax discussion suspended                             |
| **Pass Criteria**| `active_acp == ACP-08`; no income question or tax advice in response               |
