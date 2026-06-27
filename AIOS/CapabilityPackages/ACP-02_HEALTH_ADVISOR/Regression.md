---
Document ID: ACP-02-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-02 Regression Tests

---

## Test Case ACP-02-T01: IPD Question Answered First

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T01                                                                  |
| **Input**        | "ประกันสุขภาพคุ้มครองค่านอนโรงพยาบาลไหมครับ?"                             |
| **Expected**     | AI explains IPD coverage concept in plain Thai before asking any question   |
| **Pass Criteria**| Response contains IPD explanation; no data request in first response        |

---

## Test Case ACP-02-T02: Premium Request Without Age

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T02                                                                  |
| **Input**        | "เบี้ยประกันสุขภาพเท่าไหร่ครับ?"                                          |
| **Expected**     | AI explains premium varies by age; asks for age before any figure           |
| **Pass Criteria**| No specific baht figure in response; age question asked; no name/phone asked |

---

## Test Case ACP-02-T03: Pre-existing Condition Routing

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T03                                                                  |
| **Input**        | "อยากทำประกันสุขภาพครับ แต่เป็นความดันโลหิตสูงอยู่ครับ ทำได้ไหม?"       |
| **Expected**     | AI answers positively (case-by-case basis); asks ONE medical follow-up; routes to ACP-04 |
| **Pass Criteria**| No guarantee of approval; no guarantee of rejection; ACP-04 activated; single question asked |

---

## Test Case ACP-02-T04: Trust Signal During Health Inquiry

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T04                                                                  |
| **Input**        | Mid-conversation: "แน่ใจนะว่าไม่ใช่แก๊งโกง?"                            |
| **Expected**     | ACP-08 TRUST_ADVISOR activated immediately; health education suspended      |
| **Pass Criteria**| `active_acp == ACP-08`; lead capture suspended; no product info in response |

---

## Test Case ACP-02-T05: Co-payment Question

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T05                                                                  |
| **Input**        | "ประกันสุขภาพต้องจ่ายเองด้วยไหมครับ?"                                    |
| **Expected**     | AI explains co-payment concept in plain Thai; explains when it applies      |
| **Pass Criteria**| Response contains co-payment explanation; no specific amount quoted without context |

---

## Test Case ACP-02-T06: Family Coverage Question

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T06                                                                  |
| **Input**        | "อยากทำประกันสุขภาพให้ลูกด้วย มีแผนครอบครัวไหมครับ?"                    |
| **Expected**     | AI confirms family/child coverage is available; explains how it works; asks child's age |
| **Pass Criteria**| Family option acknowledged; child age asked (not parent's first); one question only |

---

## Test Case ACP-02-T07: Lead Capture Timing Compliance

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| **Test ID**      | ACP-02-T07                                                                  |
| **Input**        | Customer sends: Turn 1: "อยากทำประกันสุขภาพ" — AI responds with education |
| **Expected**     | Lead capture (name/phone request) does NOT appear in Turn 1 AI response     |
| **Pass Criteria**| `education_turn_count >= 1` before any lead capture attempt; zero data collection in Turn 1 |
