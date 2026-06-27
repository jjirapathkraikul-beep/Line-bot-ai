# Decision Rules — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Price objections are a critical conversion decision point.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Customer intent matches INT-13-01 to INT-13-05 | Intent classifier |
| No active trust concern | Trust Engine |
| Not in restricted context (ACP-15, ACP-16) | Conversation State |

---

## Execution Conditions

### Step 1: Acknowledge (MANDATORY)
- MUST occur before any product redirection
- Minimum acknowledgment: validate the concern ("เข้าใจเลยครับ")
- NEVER skip to product options in the same turn as the objection

### Step 2: Budget Discovery
- If budget amount is known → skip to Step 3
- If unknown → ask ONE question: "ตอนนี้งบประมาณสะดวกอยู่ประมาณเท่าไหร่ครับ?"
- If customer refuses to state budget → work with tiers: "มี 3 ระดับงบที่ผมแนะนำได้ครับ..."

### Step 3: Budget-Matched Redirection
- Show products at or below stated budget
- NEVER show products above stated budget
- Tax framing: if customer files taxes and product is eligible → show after-deduction effective cost
- Lead with lowest viable entry point, not the most expensive within budget

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Customer shows interest in budget-matched product | SUCCESS → ACP-11 |
| No product at budget; customer told honestly | HONEST CLOSE → ACP-17 |
| Trust concern | INTERRUPT → ACP-08 |
| Genuine financial crisis signals | GRACEFUL CLOSE |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Emergency signal | CRITICAL | Suspend; activate ACP-16 |
| Signs of financial distress beyond insurance | HIGH | Do not push any product; offer support; close gracefully |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer states budget then changes it | Accept new budget without comment; re-run Step 3 |
| No product exactly at budget | Offer nearest option; explain trade-off honestly |
| Customer asks "why is it so expensive?" | Explain value drivers briefly; do NOT defend; return to budget-matched options |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| No product at stated budget | "ตรงๆ เลยครับ ถ้างบประมาณประมาณนี้อาจจะยังไม่มีแบบที่ผมแนะนำได้ครับ แต่ให้คุณจิรวัฒน์คุยโดยตรงอาจมีทางออกที่ผมยังไม่รู้ครับ" |
| Customer gives a budget of zero | "ถ้าตอนนี้ยังไม่พร้อมเรื่องงบก็ไม่เป็นไรครับ ถ้าพร้อมเมื่อไหร่ก็ทักมาได้เลยนะครับ" |

---

## Conflict Resolution

| Conflict | Resolution |
|---|---|
| ACP-12 running and price objection occurs mid-comparison | ACP-12 pauses; ACP-13 takes over; ACP-12 may resume after budget is established |
| Customer's stated budget contradicts prior profile data | Use customer's current stated budget; note discrepancy for Jirawat |
