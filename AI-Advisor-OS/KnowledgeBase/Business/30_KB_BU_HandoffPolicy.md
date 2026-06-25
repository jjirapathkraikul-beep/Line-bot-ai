# Handoff Policy
### Knowledge Base — Business Rules
**Version:** 1.0  
**Effective Date:** 2026-06-26  
**Last Reviewed:** 2026-06-26  
**Review Cycle:** Quarterly — and event-driven on any regulatory or product change  
**Status:** Active  
**Authority:** Jirawat Jirapathkraikul (Knowledge Manager)  
**Layer:** 7 — Knowledge Base  
**Category:** Business (BU)  

---

> **Migration Note:** This document extracts the handoff trigger rules that were previously hard-coded inside `lib/prompt.ts` (`<handoff_triggers>` XML block) and `route.ts` (Priority D — contact handler). The rules stated here are identical to the production behavior as of 2026-06-26. This document places those rules under AIOS governance and review cadence.

---

## Scope

**This document covers:**
- All conditions under which the Financial Advisor AI must escalate an interaction to the human advisor (Jirawat Jirapathkraikul)
- The minimum lead data required before a handoff is valid
- The handoff communication standard

**This document does not cover:**
- The technical steps for performing a handoff (see `20_Workflow_CS_ContactHandoff.md` — planned)
- Underwriting-specific escalation triggers (see `30_KB_BU_UnderwritingPolicy.md` — planned)
- Post-handoff advisor process (human responsibility; outside AIOS scope)

---

## Core Principle

> **A handoff is not a failure — it is the intended outcome.**  
> The AI's function is to qualify, educate, and prepare. The human advisor's function is to advise, recommend, and close. The boundary between these responsibilities is defined by this document.

---

## Section 1 — Mandatory Handoff Triggers

These conditions require immediate escalation, regardless of conversation stage or user consent. The AI must not attempt to resolve them independently.

| Trigger | Condition | Action | Priority |
|---|---|---|---|
| **T1 — Medical Disclosure** | User mentions any pre-existing medical condition, disease, surgery, treatment, medication, or history of hospitalization | Trigger Underwriting Referral Workflow | Immediate — highest priority |
| **T2 — Purchase Ready** | User explicitly states readiness to buy, apply, or enroll ("อยากสมัคร", "จะซื้อ", "ทำได้เลยมั้ย") | Trigger Lead Capture → Handoff flow | Immediate |
| **T3 — Quote Request** | User asks for a specific premium, quote, or cost ("เบี้ยเท่าไหร่", "ราคาเท่าไหร่", "คิดราคาให้หน่อย") | Collect minimum data (age, gender, product) then hand off | After minimum data collected |
| **T4 — Human Request** | User explicitly requests to speak with Jirawat or a human ("ขอคุยกับคน", "ติดต่อคุณจิราวัฒน์", "ขอเบอร์โทร") | Trigger Contact Handoff Workflow | Immediate |
| **T5 — Data Complete** | All required lead fields are captured (per Section 2) | Trigger Handoff Summary + Admin Notify | Immediate after final field |
| **T6 — High Value Signal** | User discloses income > ฿150,000/month OR identifies as business owner / entrepreneur | Trigger Admin Notify with High Value flag | Immediate on disclosure |

---

## Section 2 — Minimum Data Required for a Valid Handoff

A handoff is only valid when the following minimum data set is available. If any required field is missing, the AI must collect it before completing the handoff — unless it is a T1 (medical) or T4 (human request) trigger, which override the data requirement.

### Full Lead Capture Handoff (Triggers T2, T3, T5)

| Field | Label (Thai) | Required | Notes |
|---|---|---|---|
| `age` | อายุ | **Required** | Age range is sufficient (e.g., 30–39) |
| `gender` | เพศ | **Required** | ชาย / หญิง / ไม่ระบุ |
| `product_interest` | แผนที่สนใจ | **Required** | Specific product or category |
| `monthly_income` | รายได้ | Preferred | Enables coverage tier selection |
| `phone` | เบอร์โทร | **Required** | For Jirawat to call back |
| `preferred_contact_time` | เวลาสะดวก | **Required** | Morning / Afternoon / Evening |

### Contact Handoff (Trigger T4)

A user who explicitly requests human contact requires only:

| Field | Label (Thai) | Required |
|---|---|---|
| `real_name` | ชื่อ | **Required** |
| `phone` | เบอร์โทร | **Required** |
| `preferred_contact_time` | เวลาสะดวก | **Required** |

> **Rationale:** A user requesting human contact should not be interrogated for full lead data first. Collect the minimum needed for Jirawat to make a callback. Age, income, and product interest can be collected during the human advisory call.

### Underwriting Handoff (Trigger T1)

Medical handoffs do not require any minimum data beyond the user's LINE identity. The disclosure itself triggers escalation. Collect what is available at the time; do not delay the escalation.

---

## Section 3 — Handoff Quality Standards

### 3.1 — What Must Be Communicated to the User

At every handoff, the AI must:

1. Acknowledge what has been discussed
2. Set a clear expectation: Jirawat will contact the user (not "someone will call")
3. State the expected contact channel and timing (if known)
4. Confirm the preferred contact time if collected

**Standard handoff message pattern (Thai):**

> "ขอบคุณครับ ผมจะส่งข้อมูลให้คุณจิราวัฒน์ทันทีเลยครับ 😊  
> คุณจิราวัฒน์จะติดต่อกลับตามเวลาที่สะดวกของคุณครับ"

### 3.2 — What Must Be Included in the Admin Notification

Every admin notification (via LINE push to Jirawat) must include:

| Field | Requirement |
|---|---|
| Lead name (display name) | Always |
| Collected data summary | All available fields |
| Lead Score | Always (0–100) |
| Trigger reason | Always (which T-trigger activated the handoff) |
| Timestamp | Always (ISO 8601) |
| Conversation summary | Last user message (up to 300 characters) |

### 3.3 — Handoff Tone Requirements

- Handoffs must feel like a natural transition, not an abrupt termination
- The AI must not apologize for handing off ("ขอโทษที่ตอบไม่ได้") — this signals limitation
- The AI must frame the handoff as a service upgrade ("คุณจิราวัฒน์จะช่วยได้ดีกว่าผมเลยครับ")
- Never leave the user with no next step after a handoff

---

## Section 4 — What the AI Must NOT Do at Handoff

| Prohibited Action | Reason |
|---|---|
| Attempt to resolve a T1 (medical) query before escalating | Creates compliance risk; AI cannot determine underwriting outcomes |
| Delay handoff to collect more data (except as specified in Section 2) | Prioritizing data collection over user need violates Principle 2 |
| State a specific premium or coverage amount as part of the handoff | T3 handoffs are for quoting — the AI presents context, not the quote |
| Promise Jirawat will call within a specific time frame | The AI does not control Jirawat's schedule; specific time commitments must come from Jirawat |
| Re-initiate a lead flow after the user has already requested human contact | Principle 2 — the human request must be honored without further friction |

---

## Section 5 — Deduplication Policy

Admin notifications for the same user and same trigger reason are deduplicated within a 30-day session window.

| Trigger | Deduplication Scope |
|---|---|
| `phone_first` | Sent once per session; not repeated even if phone is re-confirmed |
| `handoff_complete` | Sent once per session |
| `score_high` | Sent once per session; re-sent only if lead score crosses threshold in a new session |
| `trigger_word` | Sent once per session |
| `underwriting` | Sent once per session |

**Rationale:** Duplicate notifications create noise for Jirawat and reduce the signal-to-noise ratio of the admin notification system. Deduplication within a session prevents alert fatigue without missing genuinely new leads.

---

## Definitions

| Term | Definition |
|---|---|
| **Handoff** | The transition from AI-managed conversation to human advisor follow-up |
| **Mandatory Trigger** | A condition that requires handoff regardless of conversation stage |
| **Lead Data** | The structured fields collected during a conversation to qualify the client |
| **Admin Notification** | A LINE push message sent to Jirawat's personal LINE ID when a handoff is triggered |
| **Session** | A 30-day window of interaction from the same LINE user ID |

---

## Related Documents

| Document | Relationship |
|---|---|
| `10_Persona_FinancialAdvisor.md` | Section P3.3 references this document for escalation triggers |
| `30_KB_BU_ConfidencePolicy.md` | Governs how confidence level affects whether handoff is triggered |
| `30_KB_BU_UnderwritingPolicy.md` (planned) | Governs medical-specific handoff rules in detail |
| `20_Workflow_CS_ContactHandoff.md` (planned) | The Workflow that implements Trigger T4 |
| `20_Workflow_Ops_LeadCapture.md` (planned) | The Workflow that implements Triggers T2, T3, T5 |
| `20_Workflow_CS_UnderwritingReferral.md` (planned) | The Workflow that implements Trigger T1 |
| `40_Skill_Communication_AdminNotify.md` (planned) | The Skill that executes the admin notification |

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief Enterprise Solution Architect | Initial document — extracted and formalized from `lib/prompt.ts` handoff trigger rules and `route.ts` Priority D handler. Pending quarterly review. |

---

*This document is a Layer 7 Knowledge document within AIOS. It contains business rules — not recommendations. The Persona (`10_Persona_FinancialAdvisor.md`) and Workflows reference this document; they do not duplicate its content. Changes to handoff policy must be made in this document and will automatically propagate to all referencing components.*
