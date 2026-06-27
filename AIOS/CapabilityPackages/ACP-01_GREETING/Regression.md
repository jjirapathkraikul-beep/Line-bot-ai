---
Document ID: ACP-01-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-01 Regression Tests

---

## Test Case ACP-01-T01: Basic Greeting Response

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T01                                                            |
| **Input**        | "สวัสดีครับ"                                                          |
| **Expected**     | Warm greeting + one open-ended question. No product mention. No data request. |
| **Pass Criteria**| Response contains greeting; contains exactly one question mark; contains no product name; contains no request for name/phone |

---

## Test Case ACP-01-T02: Unclear Intent After Greeting

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T02                                                            |
| **Input**        | Turn 1: "หวัดดีครับ" → Turn 2: "ยังไม่แน่ใจอยากได้คำแนะนำครับ"    |
| **Expected**     | After Turn 2, route to ACP-10 NEED_DISCOVERY                         |
| **Pass Criteria**| `routing_target == ACP-10`; no product ACP activated; no data collected |

---

## Test Case ACP-01-T03: Trust Signal in Opening Message

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T03                                                            |
| **Input**        | "สวัสดีครับ นี่เป็นมิจฉาชีพป่าว?"                                   |
| **Expected**     | ACP-08 activated immediately; ACP-01 does not respond to greeting portion first |
| **Pass Criteria**| `active_acp == ACP-08`; response contains trust acknowledgment, not a standard greeting |

---

## Test Case ACP-01-T04: Clear Product Intent in First Message

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T04                                                            |
| **Input**        | "สวัสดีครับ อยากถามเรื่องประกันสุขภาพครับ"                          |
| **Expected**     | Brief greeting acknowledgment then immediate route to ACP-02           |
| **Pass Criteria**| `routing_target == ACP-02`; greeting phase completed in ≤1 AI turn; no data collected |

---

## Test Case ACP-01-T05: Multi-Product Question in Opening

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T05                                                            |
| **Input**        | "สวัสดีครับ อยากถามทั้งประกันสุขภาพและประกันชีวิตครับ"              |
| **Expected**     | Route to ACP-10 NEED_DISCOVERY to discover primary need first          |
| **Pass Criteria**| `routing_target == ACP-10`; AI does not attempt to answer both products simultaneously |

---

## Test Case ACP-01-T06: No Data Collection Attempt

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T06                                                            |
| **Input**        | Any greeting followed by any intent statement                         |
| **Expected**     | ACP-01 exits without ever requesting name, phone, age, or any personal data |
| **Pass Criteria**| Zero data collection fields in ACP-01 session memory; `crm.lead_captured == FALSE` |

---

## Test Case ACP-01-T07: Returning Customer Recognition

| Field            | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Test ID**      | ACP-01-T07                                                            |
| **Input**        | Session starts with CRM data showing prior customer name and last intent |
| **Expected**     | Greeting uses customer name (if available); does not re-ask for name   |
| **Pass Criteria**| Response contains customer name if in CRM; no question asking for name |
