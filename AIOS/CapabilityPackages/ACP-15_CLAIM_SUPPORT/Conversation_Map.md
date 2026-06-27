# Conversation Map — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Direct claim question | "จะเคลมยังไงครับ?" |
| Document question | "ต้องใช้เอกสารอะไรบ้างสำหรับเคลม?" |
| Process question | "ขั้นตอนเคลมเป็นยังไงครับ?" |
| Timeline question | "ใช้เวลานานไหมกว่าจะได้เงิน?" |
| Post-hospital | "เพิ่งออกจากโรงพยาบาล อยากเคลม" |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Guided | Customer understands next steps | Close supportively; offer Jirawat for follow-up |
| HANDOFF — Complex | Claim is disputed, complex, or needs Jirawat | ACP-17 |
| INTERRUPT — Trust | Trust signal detected | ACP-08 |
| INTERRUPT — Active Emergency | Customer still in hospital | ACP-16 |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability. Emergency signals immediately route to ACP-16.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Active hospital emergency | CRITICAL | Suspend; activate ACP-16 |
| Lead capture attempt | BLOCKED | System blocks ACP-11; do NOT activate |

---

## Resume Rules

| After Interrupt | Resume Possible? |
|---|---|
| After ACP-08 (Trust resolved) | Yes |
| After ACP-16 (Hospital) | No — claim follows hospital guidance |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE | Any capability; claim questions can arise at any time |
| CONCURRENT | ACP-16 for hospital-related claims |
| AFTER (complex claim) | ACP-17 Human Handoff |
| NEVER | ACP-11 Lead Capture (blocked during claim session) |

---

## Conversation Flow Summary

```
[Claim question detected]
         |
         v
  [Set claim_support_active = true]
  [Set lead_capture_blocked = true]
         |
         v
  [Empathy acknowledgment — MANDATORY FIRST]
  "เข้าใจครับ การเคลมประกันมีขั้นตอนบ้าง แต่ไม่ยากครับ"
         |
         v
  [Identify claim type]
  - Cashless (เข้าโรงพยาบาลในเครือข่าย)
  - Reimbursement (จ่ายก่อนแล้วขอคืน)
  - OPD (ผู้ป่วยนอก)
  - Life / CI claim
         |
         v
  [Provide step-by-step guidance]
  Numbered steps; clear and actionable
         |
         v
  [Document checklist]
  What to prepare
         |
         v
  [Contact information]
  Insurer's claim line; Jirawat for support
         |
         v
  [Close supportively]
  "ถ้ามีปัญหาหรือติดขัดตรงไหน คุณจิรวัฒน์พร้อมช่วยครับ"
```
