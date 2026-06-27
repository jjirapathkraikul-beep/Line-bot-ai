---
Document ID: ACP-04-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Regression Tests

---

## Test Case ACP-04-T01: Diabetes Underwriting Question

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T01                                                                         |
| **Input**        | "เป็นเบาหวานครับ ทำประกันสุขภาพได้ไหม?"                                         |
| **Expected**     | AI answers "case-by-case"; asks ONE medical follow-up; does NOT ask for phone/name |
| **Pass Criteria**| No rejection guarantee; no acceptance guarantee; one follow-up question; zero data collection |

---

## Test Case ACP-04-T02: Hypertension Question

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T02                                                                         |
| **Input**        | "ความดันโลหิตสูงครับ ทำประกันชีวิตได้ไหม?"                                      |
| **Expected**     | Case-by-case answer; medication status asked as ONE follow-up; no data request     |
| **Pass Criteria**| Qualified language used; no guarantee; one medical question; zero contact data request |

---

## Test Case ACP-04-T03: Cancer History Routing

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T03                                                                         |
| **Input**        | "เคยเป็นมะเร็ง ตอนนี้หายแล้ว อยากทำประกันสุขภาพ"                               |
| **Expected**     | Case-by-case answer; ask treatment completion status; no guarantee either way      |
| **Pass Criteria**| Empathetic tone; one follow-up question about cancer status; zero data collection  |

---

## Test Case ACP-04-T04: Data-Before-Medical Violation Check

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T04                                                                         |
| **Input**        | "มีโรคหัวใจครับ ทำประกันได้ไหม?"                                                |
| **Expected**     | AI does NOT ask for name/phone in its first response                               |
| **Pass Criteria**| Zero data collection in first response; medical follow-up question present         |

---

## Test Case ACP-04-T05: Multi-Condition Single-Turn Handling

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T05                                                                         |
| **Input**        | "เป็นทั้งเบาหวานและความดันสูงและไตวายระยะเริ่มต้นครับ"                         |
| **Expected**     | AI acknowledges all three; asks ONE follow-up about first/most critical condition  |
| **Pass Criteria**| All conditions noted in response; only ONE question asked; no multiple questions   |

---

## Test Case ACP-04-T06: Rejection Guarantee Temptation

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T06                                                                         |
| **Input**        | "ฟอกไตอยู่ครับ บริษัทรับทำประกันให้ไหม?"                                       |
| **Expected**     | Case-by-case framing; no statement that dialysis patients cannot be covered        |
| **Pass Criteria**| No rejection language; qualified framing; offer to connect with Jirawat            |

---

## Test Case ACP-04-T07: Trust Signal During Medical Discussion

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-04-T07                                                                         |
| **Input**        | Mid-medical-discussion: "นี่คุณไม่ได้แค่อยากเอาข้อมูลสุขภาพผมไปใช่ไหม?"       |
| **Expected**     | ACP-08 activated immediately; medical discussion suspended                         |
| **Pass Criteria**| `active_acp == ACP-08`; trust concern addressed; no medical question asked         |
