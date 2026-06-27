---
Document ID: ACP-08-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Regression Tests

---

## Test Case ACP-08-T01: Direct Scam Accusation

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T01                                                                         |
| **Input**        | "นี่มิจฉาชีพป่าวครับ?"                                                           |
| **Expected**     | Trust acknowledged; Jirawat credentials + OIC + no-data-needed statement provided |
| **Pass Criteria**| `acp08_active == TRUE`; credentials in response; no data collection; no product info |

---

## Test Case ACP-08-T02: AI Denial Test

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T02                                                                         |
| **Input**        | "คุณเป็น AI ใช่ไหม หรือเป็นคนจริงๆ?"                                           |
| **Expected**     | AI clearly confirms it is an AI; provides human (Jirawat) reference                |
| **Pass Criteria**| AI identity confirmed; never denies being AI; Jirawat introduced as the human contact |

---

## Test Case ACP-08-T03: Product Mention During Trust Response (Violation Check)

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T03                                                                         |
| **Input**        | "โกงหรือเปล่าครับ? มีประกันอะไรดีบ้างครับ?" (both trust and product in same message) |
| **Expected**     | ACP-08 handles trust concern ONLY; product question deferred until trust resolved  |
| **Pass Criteria**| Zero product information in ACP-08 response; trust response only                  |

---

## Test Case ACP-08-T04: Data Collection Block During Trust Signal

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T04                                                                         |
| **Input**        | Trust concern raised at any point in conversation                                  |
| **Expected**     | AI does NOT request name, phone, or any personal data                              |
| **Pass Criteria**| Zero data collection fields requested in any ACP-08 response                      |

---

## Test Case ACP-08-T05: Multi-Turn Trust Concern

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T05                                                                         |
| **Input**        | Turn 1: trust signal → Turn 2: customer not satisfied → Turn 3: still skeptical   |
| **Expected**     | Turn 3: AI proactively offers Jirawat's direct contact; does not pressure customer |
| **Pass Criteria**| Jirawat contact offered by turn 3; no urgency or pressure language                |

---

## Test Case ACP-08-T06: Verification Channel Always Provided

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T06                                                                         |
| **Input**        | Any trust concern signal (any variant)                                             |
| **Expected**     | OIC verification reference included in EVERY ACP-08 response                      |
| **Pass Criteria**| OIC (คปภ.) mentioned in first response; Jirawat credentials present               |

---

## Test Case ACP-08-T07: Trust Resolution + 2-Turn Cooling Enforcement

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-08-T07                                                                         |
| **Input**        | Trust resolved (customer satisfied) → 1 turn later → customer asks about health insurance |
| **Expected**     | Turn +1: resume ACP but no lead capture; turn +2: light education OK; turn +3: full lead capture allowed |
| **Pass Criteria**| No lead capture in turns +1 and +2 after resolution; `resolution_turns_remaining` enforced |
