# FAQ — Insurance Knowledge Base
### Insurance Domain — FAQ Governance and Schema
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## Source of Truth Declaration

| Concern | Source of Truth |
|---|---|
| FAQ taxonomy, categories, and answer policy | **This document** (`Knowledge/FAQ.md`) |
| Runtime FAQ content (actual Q&A entries) | **Google Sheet** (external, managed by operator) |
| FAQ delivery format to LINE users | `Applications/Line_Chatbot_AI/Integrations/Google_Sheet.md` |

This document governs the **governance layer** of FAQ. It defines categories, answer quality standards, and content policy. It does not store the runtime Q&A content.

The runtime Google Sheet is the operational content source. Its URL is configured via the `SHEET_CSV_URL` environment variable in the LINE Chatbot application. The sheet is fetched at runtime and cached for 60 seconds.

---

## 1. Purpose

Define the taxonomy, categories, answer policy, and governance rules for insurance FAQ content. This document ensures that FAQ content — wherever it is stored and delivered — meets domain quality standards and covers the required subject areas.

---

## 2. Scope

This document covers:
- FAQ category taxonomy
- Answer quality standards
- Content ownership and review cadence
- What questions must be answerable by an FAQ-capable system
- Content policy (what may and may not be stated in FAQ answers)

This document does not cover:
- Actual Q&A text entries (see Google Sheet, managed by operator)
- How the chatbot fetches or caches FAQ content (see `Integrations/Google_Sheet.md`)
- Response formatting for LINE messages (see `Applications/Line_Chatbot_AI/UX/Response_Formatting.md`)

---

## 3. FAQ Category Taxonomy

All FAQ entries must be classified under one of the following canonical categories:

| Category | Description | Examples |
|---|---|---|
| `policy` | Questions about insurance policy terms, coverage, and exclusions | ประกันคุ้มครองอะไรบ้าง, ไม่คุ้มครองโรคอะไร |
| `claim` | Questions about how to file and track a claim | เคลมยังไง, ใช้เอกสารอะไรเคลม |
| `product` | Questions about specific products, features, and pricing | เบี้ยประมาณเท่าไหร่, มีแผนไหนบ้าง |
| `process` | Questions about application, underwriting, and onboarding steps | สมัครยังไง, ใช้เวลากี่วัน, ตรวจสุขภาพไหม |
| `tax` | Questions about tax deductions and tax-linked products | ลดหย่อนภาษีได้ไหม, ลดหย่อนได้เท่าไหร่ |
| `general` | General questions that do not fit another category | บริษัทเชื่อถือได้ไหม, ที่ปรึกษาเป็นใคร |

---

## 4. Answer Quality Standards

All FAQ answers stored in the runtime Google Sheet must meet these standards:

| Standard | Rule |
|---|---|
| Accuracy | Answers must reflect current product terms. Outdated answers must be removed or updated. |
| Brevity | Answers must be understandable in a conversational context — maximum 3 sentences. |
| Honesty | Answers must not overstate coverage or make promises not backed by policy terms. |
| Language | Answers must be written in Thai for customer-facing delivery. |
| Attribution | Answers referencing specific products must name the product explicitly. |
| No legal advice | Answers must not constitute legal or tax advice. Refer to a qualified advisor for specific cases. |

---

## 5. Required Coverage

A compliant FAQ set must include answers for at minimum:

- How to file a claim
- What documents are required for a claim
- Whether pre-existing conditions affect coverage
- How to check coverage details
- How to contact a human advisor
- Whether products qualify for tax deduction
- How the application process works
- What happens if a premium is missed

---

## 6. Content Policy

FAQ answers must not:
- Guarantee acceptance or coverage without underwriting
- State specific premium amounts without qualification (they vary by age, product, and health status)
- Make comparisons to competitor products
- Suggest that AI-generated answers replace licensed advisor advice

---

## 7. Review Cadence

| Review Type | Frequency | Responsibility |
|---|---|---|
| Content accuracy review | Quarterly | Domain Content Owner |
| Category taxonomy review | Annually or on product change | AIOS Domain Lead |
| Answer policy review | Annually | AIOS Domain Lead |

---

## 8. Dependencies

- `AIOS/Domains/Insurance/Products/` — Product knowledge that FAQ answers may reference
- `AIOS/Domains/Insurance/Knowledge/Claim.md` — Claim process knowledge
- `Applications/Line_Chatbot_AI/Integrations/Google_Sheet.md` — Runtime content delivery

---

## 9. Future Improvements

- Migrate runtime FAQ content from Google Sheet to a structured knowledge base with version control
- Add attribution metadata to each FAQ entry (product version, effective date, last reviewed)
- Add flagging mechanism for answers that need review when product terms change

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Domain Lead | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Added SoT declaration clarifying split between domain governance (this file) and runtime content (Google Sheet); added taxonomy, quality standards, content policy, and required coverage |
