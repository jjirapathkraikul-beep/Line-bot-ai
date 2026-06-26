# Handoff Payload
### LINE Chatbot Application — Handoff Delivery Format
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

---

> **Boundary Notice:** This document defines the LINE-specific delivery format for human handoff. The business rules governing when and why to hand off are defined at the domain level in:
>
> `AIOS/Domains/Insurance/Human/Human_Handoff.md`
> `AIOS/Domains/Insurance/Human/Escalation_Rules.md`
>
> This document covers implementation only. Do not define handoff trigger conditions or lead readiness criteria here.

---

## Purpose

Define the exact payload formats used by the LINE Chatbot when executing a human handoff. This includes the LINE message format sent to the customer, the CRM payload sent to Google Sheets, and the admin notification format sent to the human advisor.

---

## Scope

This document covers:
- Customer-facing LINE message at handoff
- CRM payload (Google Sheets / Apps Script)
- Admin notification payload (LINE Notify or Push Message to advisor)
- Google Sheet mapping for handoff data

This document does not cover:
- When to trigger a handoff (see `Human/Human_Handoff.md` and `Human/Escalation_Rules.md`)
- Lead readiness rules (see `Human/Human_Handoff.md`)
- Lead field definitions (see `Lead/Lead_Data_Model.md`)

---

## 1. Customer-Facing LINE Message

When a handoff is triggered, the chatbot sends a closing message to the customer confirming that a human advisor will follow up.

### Text Message Format

```
ขอบคุณที่ให้ความสนใจครับ 🙏

ผมได้ส่งข้อมูลของคุณให้ทีมที่ปรึกษาเรียบร้อยแล้ว
ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมงครับ

หากมีคำถามเพิ่มเติมสามารถทักมาได้เลยนะครับ
```

### Optional Flex Message

If lead profile is sufficiently complete, a Flex Message summary card may be sent showing:
- Customer name
- Insurance interest category
- Product interest (if known)
- Next step confirmation

Format follows `Conversation/Flex_Message_Guideline.md`.

---

## 2. CRM Payload (Google Sheets via Apps Script)

At handoff, the following payload is sent to the Apps Script endpoint. Field names must match the column layout in `CRM/CRM_Schema.md`.

```json
{
  "line_user_id": "<string>",
  "display_name": "<string>",
  "real_name": "<string | null>",
  "phone": "<string | null>",
  "age": "<integer | null>",
  "gender": "<string | null>",
  "interest_category": "<string>",
  "product_interest": "<string | null>",
  "budget_annual": "<integer | null>",
  "health_status": "<string | null>",
  "lead_score": "<integer>",
  "lead_status": "handoff",
  "follow_up_status": "pending",
  "conversation_summary": "<string>",
  "last_question": "<string | null>",
  "preferred_contact_time": "<string | null>",
  "source": "LINE OA",
  "last_contact_date": "<ISO date>"
}
```

**Rules:**
- `lead_status` must always be `"handoff"` in the handoff payload.
- `follow_up_status` must always be `"pending"` at initial handoff.
- Null fields must be included explicitly (not omitted) so the Apps Script can clear stale values.
- `first_contact_date` is not included in the handoff payload — it is set only at record creation.

---

## 3. Admin Notification Payload (LINE Push Message to Advisor)

When a hot lead triggers a handoff, an admin push notification is sent to the advisor's LINE account via `lib/adminNotify.ts`.

### Text Notification Format

```
🔥 Hot Lead — Handoff Required

ชื่อ: {real_name | display_name}
เบอร์: {phone | ไม่ระบุ}
สนใจ: {interest_category}
ผลิตภัณฑ์: {product_interest | ไม่ระบุ}
งบ: {budget_annual | ไม่ระบุ} บาท/ปี
คะแนน Lead: {lead_score}
เวลาที่ต้องการให้ติดต่อ: {preferred_contact_time | ไม่ระบุ}

สรุปการสนทนา:
{conversation_summary}

คำถามล่าสุด: {last_question | —}
```

### Delivery Behavior

- Notification is sent only when `lead_score` meets the threshold defined in `Lead/Lead_Scoring.md`.
- Notification is sent only once per handoff event. Repeat triggers within the same session do not resend.
- Failure to deliver the notification must not block the CRM write or the customer-facing message.

---

## 4. Google Sheet Mapping for Handoff Fields

| Payload Field | Sheet Column | Notes |
|---|---|---|
| `lead_status` | N | Always "handoff" at this point |
| `follow_up_status` | O | Always "pending" at handoff |
| `conversation_summary` | Q | AI or template-generated |
| `last_question` | P | Last user message before handoff |
| `lead_score` | Not stored in sheet | Used for notification threshold only |
| `last_contact_date` | U | ISO date, updated on write |

---

## Related Documents

- `AIOS/Domains/Insurance/Human/Human_Handoff.md` — Domain rules for when and why to hand off
- `AIOS/Domains/Insurance/Human/Escalation_Rules.md` — Escalation trigger conditions
- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — Canonical field definitions
- `Applications/Line_Chatbot_AI/CRM/CRM_Schema.md` — Google Sheet column layout
- `Applications/Line_Chatbot_AI/Integrations/Notification.md` — Admin notification delivery
- `Applications/Line_Chatbot_AI/Conversation/Flex_Message_Guideline.md` — Flex message format

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Initial creation — split from domain-level Human_Handoff.md; owns LINE-specific payload, CRM payload, and admin notification format |
