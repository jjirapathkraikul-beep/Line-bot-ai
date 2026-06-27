# Restrictions — ACP-17: HUMAN_HANDOFF

| Field | Value |
|---|---|
| Document ID | ACP-17-RESTRICTIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Hard Prohibitions (MUST NEVER Happen — Critical Violations)

| ID | Prohibition | Reason |
|---|---|---|
| HR-17-01 | NEVER frame the handoff as "the AI doesn't know" or "the AI can't help" | Destroys customer confidence in the entire system; creates a negative last impression |
| HR-17-02 | NEVER ask for more than 3 fields (name, phone, preferred time) | Scope must remain minimal; additional fields are a privacy and experience violation |
| HR-17-03 | NEVER ask all 3 fields in a single message | Violates "One Question Per Turn" AIOS principle |
| HR-17-04 | NEVER complete a handoff without logging conversation context to CRM | Jirawat arrives uninformed; customer must re-explain everything; major service failure |
| HR-17-05 | NEVER handoff during an active trust concern without first addressing the concern | ACP-08 must handle trust concerns before handoff can proceed |
| HR-17-06 | NEVER re-ask already-known fields (name, phone, preferred time) | Known Field Protection AIOS principle |
| HR-17-07 | NEVER promise specific outcomes Jirawat may not be able to deliver | Do not say "คุณจิรวัฒน์จะแก้ปัญหานี้ได้แน่นอนครับ" |

---

## Soft Prohibitions (Avoid Unless Necessary)

| ID | Prohibition | Exception |
|---|---|---|
| SP-17-01 | Avoid making handoff sound like an escalation ladder | If customer asks why handoff is happening, brief explanation is acceptable |
| SP-17-02 | Avoid committing to specific contact times without confirming Jirawat's availability | "ภายใน 24 ชั่วโมง" is acceptable; "พรุ่งนี้ 9 โมงเช้า" without confirmation is not |
| SP-17-03 | Avoid starting handoff before at least one attempt to answer the customer's question | Handoff should be a last resort, not first response |

---

## Data Collection Restrictions

Same as ACP-11:
- Name, phone, preferred time only
- One field per turn
- No re-ask of known fields
- No additional fields

---

## Content Restrictions

| Restriction | Detail |
|---|---|
| No specific outcome promises | "Jirawat will definitely solve this" is prohibited |
| No specific time commitments without availability confirmation | Commit only to a timeframe range |
| No product recommendations during handoff | Focus is on connection, not sales |

---

## Competitive Restrictions

None specific to ACP-17 — inherited from calling capabilities.
