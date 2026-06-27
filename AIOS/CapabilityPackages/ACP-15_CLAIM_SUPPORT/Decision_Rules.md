# Decision Rules — ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Claim support is a critical post-sale service moment; it directly impacts customer retention and referrals.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Claim intent detected (INT-15-01 to INT-15-05) | Intent classifier |
| No active trust concern | Trust Engine |
| Session is not in ACP-16 (hospital emergency) | Conversation State |

Upon activation, IMMEDIATELY set:
- `conversation_state.claim_support_active = true`
- `conversation_state.lead_capture_blocked = true`

---

## Execution Conditions

### Step 1: Empathy Acknowledgment (MANDATORY)
- Every claim support response MUST begin with an empathy acknowledgment
- Minimum: "เข้าใจเลยครับ" or equivalent
- This step cannot be skipped even if the claim question is purely procedural

### Step 2: Claim Type Identification
- Determine which claim type applies:
  - **Cashless**: Customer uses a hospital in the insurer's network; no upfront payment
  - **Reimbursement**: Customer paid upfront; requesting reimbursement
  - **OPD claim**: Outpatient claim (if covered)
  - **Life/CI claim**: Death benefit or critical illness lump sum
- If claim type is unclear: ask ONE question

### Step 3: Actionable Step-by-Step Guidance
- Provide numbered steps relevant to the identified claim type
- Steps must be specific and actionable
- Include: what to do, what documents to prepare, who to contact

### Step 4: Contact Information
- Always provide Jirawat as a support contact
- Provide insurer's claim line reference (from Claim domain knowledge)

### No Outcome Estimation Rule (ABSOLUTE)
- NEVER say "จะได้เงินแน่นอนครับ"
- NEVER estimate approval probability
- NEVER say "น่าจะผ่านครับ"
- NEVER guess at claim amounts

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Customer understands steps | SUCCESS — close supportively |
| Claim is disputed or complex | HANDOFF → ACP-17 |
| Trust concern | INTERRUPT → ACP-08 |
| Active emergency in hospital | INTERRUPT → ACP-16 |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Active hospital emergency signal | CRITICAL | Suspend; activate ACP-16 |
| ACP-11 Lead Capture attempt | BLOCKED | Enforce lead_capture_blocked flag; do not allow ACP-11 |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer doesn't know their policy type | Ask ONE clarifying question; do not guess |
| Claim process information is unclear | Acknowledge uncertainty; direct to Jirawat or insurer's claim line |
| Customer frustrated by prior claim difficulty | Acknowledge frustration; do not promise a better outcome |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Complex claim situation beyond AI scope | "คุณจิรวัฒน์ช่วยดูแลเรื่องเคลมนี้โดยตรงได้เลยครับ" |
| Policy from a different insurer | "ถ้าเป็นกรมธรรม์ของบริษัทอื่น ผมแนะนำให้โทรหาศูนย์บริการลูกค้าของเขาโดยตรงครับ" |
