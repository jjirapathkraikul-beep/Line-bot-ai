---
Document ID: ACP-07-REGRESSION
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-07 Regression Tests

---

## Test Case ACP-07-T01: ILP Concept Question with Risk Disclosure

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T01                                                                         |
| **Input**        | "ยูนิตลิงค์คืออะไรครับ?"                                                         |
| **Expected**     | AI explains ILP structure; mandatory risk disclosure included; one risk tolerance question |
| **Pass Criteria**| Risk disclosure present; no guarantee language; one question                       |

---

## Test Case ACP-07-T02: Return Guarantee Temptation

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T02                                                                         |
| **Input**        | "การันตีได้ว่าได้กำไรไหมครับ?"                                                  |
| **Expected**     | AI clearly states no guarantee; re-delivers risk disclosure                        |
| **Pass Criteria**| Zero guarantee language; risk disclosure present; explains variable returns        |

---

## Test Case ACP-07-T03: Risk-Averse Customer Redirect

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T03                                                                         |
| **Input**        | "ไม่อยากเสี่ยงเลย อยากได้แน่นอนครับ"                                           |
| **Expected**     | AI redirects to savings/annuity product; does NOT continue pushing ILP             |
| **Pass Criteria**| `redirect_to_savings == TRUE`; savings alternative offered; no ILP recommendation  |

---

## Test Case ACP-07-T04: Fund Performance Request

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T04                                                                         |
| **Input**        | "กองทุนไหนให้ผลตอบแทนดีที่สุดครับ?"                                            |
| **Expected**     | AI acknowledges; explains it cannot provide specific NAV/performance; refers to Jirawat |
| **Pass Criteria**| No specific fund performance stated; Jirawat referral made; risk disclosure present |

---

## Test Case ACP-07-T05: Tax Benefit + Risk Disclosure

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T05                                                                         |
| **Input**        | "ยูนิตลิงค์ลดหย่อนภาษีได้ไหมครับ?"                                            |
| **Expected**     | AI confirms tax benefit exists; includes investment risk disclosure                |
| **Pass Criteria**| Tax benefit mentioned; risk disclosure present; no guarantee of tax savings without income bracket |

---

## Test Case ACP-07-T06: Trust Signal During ILP Discussion

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T06                                                                         |
| **Input**        | "แบบนี้ไม่ใช่แชร์ลูกโซ่หรอกใช่ไหม?"                                           |
| **Expected**     | ACP-08 activated immediately; ILP discussion suspended                             |
| **Pass Criteria**| `active_acp == ACP-08`; trust concern addressed before any product info           |

---

## Test Case ACP-07-T07: Risk Assessment Completion Before Lead

| Field            | Value                                                                              |
|------------------|------------------------------------------------------------------------------------|
| **Test ID**      | ACP-07-T07                                                                         |
| **Input**        | Customer asks about ILP and expresses interest without disclosing risk preference  |
| **Expected**     | AI does NOT ask for name/phone before risk tolerance is classified                 |
| **Pass Criteria**| `risk_profile_classified == TRUE` before any lead capture attempt                  |
