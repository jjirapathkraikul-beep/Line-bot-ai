# Decision Rules — ACP-19: CLOSING

| Field | Value |
|---|---|
| Document ID | ACP-19-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Closing is the most commercially important stage; errors here directly cost sales.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Closing intent detected (INT-19-01 to INT-19-05) | Intent classifier |
| No active trust concern | Trust Engine |
| Not in restricted context | Not ACP-15 or ACP-16 |

---

## Execution Conditions

### Step 1: Affirmation (MANDATORY)
- Warmly affirm the decision in the first turn
- NEVER ask "แน่ใจหรือครับ?" — the customer has already decided
- Affirmation must be genuine and specific to what was decided

### Step 2: Next Steps (MANDATORY)
- Provide 2-3 concrete next steps
- Include: what Jirawat will do, when, and what the customer should prepare
- Steps must be actionable and time-specific if possible

### Step 3: Lead Capture (IF NEEDED)
- If lead not yet captured: follow ACP-11 rules exactly (name → phone → time; one per turn)
- If lead already captured: confirm and proceed
- Do NOT re-ask known fields

### Step 4: Confirmation
- Confirm the complete picture: who calls, when, what for
- End with warmth

### No New Products Rule (ABSOLUTE)
- NEVER introduce or suggest additional products at closing stage
- The customer has decided; respect that decision

### No Debate Reopening Rule (ABSOLUTE)
- NEVER raise objections the customer did not raise
- NEVER re-open comparison, price, or feature discussions

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Lead captured; confirmation given | SUCCESS → ACP-17 |
| Lead already captured; closing confirmed | SUCCESS → ACP-17 |
| Trust concern | INTERRUPT → ACP-08 |
| Customer suddenly hesitant | Address specific hesitation only; do not reopen full debate |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern | CRITICAL | Suspend; ACP-08; return if re-confirmed |
| Emergency signal | CRITICAL | Suspend; ACP-16 |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer expresses sudden doubt about one aspect | Address that specific aspect only; do NOT open broader debate |
| Customer says "let me think a bit more" | Accept gracefully; "ได้เลยครับ ถ้าพร้อมแล้วทักมาได้เลยนะครับ" |
| Trust concern after affirmation | Suspend; ACP-08; if resolved, ask ONE question to re-confirm readiness |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Customer postpones | "ได้เลยครับ ถ้าพร้อมทักมาได้เลยครับ คุณจิรวัฒน์พร้อมช่วยเสมอครับ" |
| Customer changes decision | Accept; do not argue; ask if there's anything to address; offer to continue later |
