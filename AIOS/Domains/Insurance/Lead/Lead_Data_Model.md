# Lead Data Model — Insurance Domain
### Canonical Source of Truth for Insurance Lead Fields
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## Purpose

This document is the single source of truth for all fields that constitute an insurance lead within the AIOS Insurance Domain. No application may redefine the meaning, type, or ownership of any field listed here. Applications may add implementation-specific metadata (storage keys, column mappings) but must reference this document as the authoritative definition.

---

## Scope

This document covers:
- All canonical lead fields, their meaning, and their ownership
- Required vs optional classification
- Data type and example values
- Application write permission (whether an app may populate this field)
- Application redefinition permission (always No for all fields)

This document does not cover:
- Google Sheet column mapping (see `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md`)
- CRM sync protocol (see `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md`)
- Session state or persistence implementation (Application concern)

---

## Field Definitions

### Identity Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `line_user_id` | Unique identifier assigned by the LINE platform for the user. Primary key for lead records originating from LINE channel. | Domain | Yes | string | `U1a2b3c4d5e6f` | Yes (system-assigned at first contact) | No |
| `channel` | Source channel through which the lead was acquired. Allows multi-channel tracking if additional channels are added in future. | Domain | Yes | string (enum) | `LINE`, `WEB`, `REFERRAL` | Yes | No — enum values are domain-defined |
| `display_name` | Display name as provided by the LINE platform at the time of first contact. May differ from legal name. | Domain | Yes | string | `สมชาย ใจดี` | Yes | No |
| `real_name` | Legal or preferred real name provided by the customer during conversation. | Domain | No | string | `สมชาย วงษ์สุขใจ` | Yes | No |

### Contact Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `phone` | Customer phone number provided during lead capture. Used for follow-up contact. | Domain | No | string | `0812345678` | Yes | No |
| `preferred_contact_time` | Customer's stated preference for when to be contacted. Used to schedule follow-up. | Domain | No | string | `เช้า`, `เย็นหลัง 18:00`, `วันหยุด` | Yes | No |

### Demographic Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `age` | Customer age in years at time of capture. Used for product eligibility and underwriting. | Domain | No | integer | `35` | Yes | No |
| `gender` | Customer gender. Used for product eligibility (e.g., cancer insurance) and pricing. | Domain | No | string (enum) | `ชาย`, `หญิง`, `ไม่ระบุ` | Yes | No — enum values are domain-defined |
| `occupation` | Customer occupation or profession. Used for risk assessment and product relevance. | Domain | No | string | `พนักงานบริษัท`, `ข้าราชการ`, `ธุรกิจส่วนตัว` | Yes | No |
| `marital_status` | Marital status. Informs family protection needs and product recommendation. | Domain | No | string (enum) | `โสด`, `แต่งงาน`, `หย่าร้าง`, `ม่าย` | Yes | No — enum values are domain-defined |
| `children` | Number of dependent children. Informs family protection and education planning needs. | Domain | No | integer | `2` | Yes | No |

### Financial Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `monthly_income` | Estimated monthly income in THB. Used for affordability assessment and product matching. | Domain | No | integer | `45000` | Yes | No |
| `tax_bracket` | Estimated income tax bracket as percentage. Used for tax-deductible product recommendations. | Domain | No | string | `20%`, `25%`, `30%` | Yes | No |
| `budget_annual` | Maximum annual premium budget stated by the customer in THB. Used for product filtering. | Domain | No | integer | `30000` | Yes | No |
| `tax_goal` | Stated tax planning objective. Used to recommend tax-deductible insurance products. | Domain | No | string | `ลดหย่อนสูงสุด`, `วางแผนเกษียณ` | Yes | No |
| `investment_goal` | Stated investment objective relevant to investment-linked or retirement products. | Domain | No | string | `เกษียณอายุ 60`, `สะสมทรัพย์`, `ผลตอบแทนระยะยาว` | Yes | No |

### Health Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `health_status` | Customer's general health status as declared. Relevant for health and life underwriting. | Domain | No | string (enum) | `สุขภาพดี`, `มีโรคประจำตัว`, `ไม่แน่ใจ` | Yes | No — enum values are domain-defined |
| `cancer_status` | Customer's declared cancer history or family cancer history. Required for cancer product eligibility. | Domain | No | string (enum) | `ไม่มีประวัติ`, `มีประวัติครอบครัว`, `เคยเป็น` | Yes | No — enum values are domain-defined |

### Interest and Product Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `interest_category` | Broad category of insurance interest expressed by the customer. Top-level signal for intent routing. | Domain | No | string (enum) | `ประกันสุขภาพ`, `ประกันชีวิต`, `ประกันมะเร็ง`, `ประกันเกษียณ`, `วางแผนภาษี`, `ลงทุน` | Yes | No — enum values are domain-defined |
| `product_interest` | Specific product(s) the customer has expressed interest in. May be multiple. | Domain | No | string | `เมืองไทย Happy Health`, `Tokyo Marine CI` | Yes | No |

### Lead Qualification and Scoring Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `lead_score` | Numeric score computed by the lead scoring algorithm defined in `Lead/Lead_Scoring.md`. Higher = higher priority. Application may write but must not modify scoring logic. | Domain | No | integer (0–100) | `72` | Yes (computed by app using domain rules) | No — scoring algorithm is domain-owned |
| `lead_status` | Canonical lifecycle state of the lead. Valid values defined in `Lead/Lead_Status.md`. | Domain | Yes | string (enum) | `new`, `engaged`, `qualified`, `handoff`, `closed_won`, `closed_lost`, `nurture` | Yes (transitions must follow domain rules) | No — state taxonomy is domain-owned |
| `follow_up_status` | Current follow-up action state. Tracks where in the advisor follow-up workflow the lead sits. | Domain | No | string (enum) | `pending`, `scheduled`, `completed`, `no_response` | Yes | No |

### Conversation Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `conversation_summary` | Concise AI-generated or rule-generated summary of the conversation at point of capture or handoff. | Domain | No | string | `ลูกค้าสนใจประกันสุขภาพ วงเงินงบ 2,500/เดือน ต้องการคุ้มครองผู้ป่วยใน` | Yes | No |
| `last_question` | The most recent question or topic the customer raised. Provides advisor with conversation context. | Domain | No | string | `มีโรคประจำตัวสมัครได้ไหม` | Yes | No |

### Tracking Fields

| Field | Description | Owner | Required | Type | Example | App May Write | App May Redefine |
|---|---|---|---|---|---|---|---|
| `source` | Traffic or referral source of the lead. Used for acquisition analytics. | Domain | No | string | `LINE OA`, `Referral`, `Facebook` | Yes | No |
| `first_contact_date` | ISO 8601 date of the first customer interaction. Set at creation and never overwritten. | Domain | Yes | string (ISO date) | `2026-06-26` | Yes (set once at creation) | No |
| `last_contact_date` | ISO 8601 date of the most recent customer interaction. Updated on each contact. | Domain | Yes | string (ISO date) | `2026-06-26` | Yes (updated on each contact) | No |

---

## Ownership Summary

| Category | Field Count | App May Write | App May Redefine |
|---|---|---|---|
| Identity | 4 | Yes | No |
| Contact | 2 | Yes | No |
| Demographic | 5 | Yes | No |
| Financial | 5 | Yes | No |
| Health | 2 | Yes | No |
| Interest & Product | 2 | Yes | No |
| Qualification & Scoring | 3 | Yes (per domain rules) | No |
| Conversation | 2 | Yes | No |
| Tracking | 3 | Yes | No |
| **Total** | **28** | **Yes — all** | **No — all** |

---

## Application Integration Rules

1. Applications must use the field names exactly as defined in this document.
2. Applications may add implementation-specific wrapper fields (e.g., `kv_session_key`, `sheet_row_index`) but must not rename or shadow canonical fields.
3. Any enum field's allowed values are defined here. Applications must not accept or store values outside the defined enum.
4. `lead_score` is computed by the Application using the algorithm in `Lead/Lead_Scoring.md`. The Application owns the computation but not the scoring definition.
5. `lead_status` transitions must follow the state machine in `Lead/Lead_Status.md`. Applications must not invent new states.

---

## Related Documents

- `AIOS/Domains/Insurance/Domain_Contract.md` — Formal interface contract
- `AIOS/Domains/Insurance/Lead/Lead_Status.md` — Lead lifecycle state machine
- `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` — Scoring algorithm
- `AIOS/Domains/Insurance/Lead/Lead_Qualification.md` — Qualification criteria
- `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` — Google Sheet mapping (implementation)
- `Applications/Line_Chatbot_AI/Integrations/Lead_Synchronization.md` — Sync protocol

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Initial creation — canonical lead field definitions extracted from application layer |
