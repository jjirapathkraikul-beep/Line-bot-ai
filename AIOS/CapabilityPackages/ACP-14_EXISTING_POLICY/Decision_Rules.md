# Decision Rules — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Honest coverage review builds long-term trust that is foundational to Jirawat's advisory relationship.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Customer mentions having existing insurance | Intent classification INT-14-01 to INT-14-04 |
| No active trust concern | Trust Engine |
| Not in restricted context | Not ACP-15 or ACP-16 |

---

## Execution Conditions

### Investigation Before Recommendation (MANDATORY)
- Ask what the customer has BEFORE assessing or recommending anything
- ONE question: "ตอนนี้มีประกันประเภทไหนบ้างครับ?" or similar
- Do NOT assume insufficiency without data

### Sufficiency Assessment Rule
After understanding what the customer has:
1. Compare against customer's stated needs (from ACP-10 if available, or ask ONE need question)
2. If coverage appears sufficient: say so clearly — no further product push
3. If gap exists: identify it specifically; name the scenario where the gap matters

### Gap Identification Specificity Rule
- Gap identification is only valid if it includes BOTH:
  - (a) The specific coverage type that is missing
  - (b) A concrete real-world scenario where that gap would cause harm

Examples:
- VALID: "ถ้าคุณป่วยเป็นมะเร็ง ประกันสุขภาพทั่วไปที่มีอยู่อาจไม่ครอบคลุมค่าเคมีบำบัดครับ"
- INVALID: "ที่มีอยู่ไม่พอครับ ควรซื้อเพิ่มครับ" (no specifics)

---

## Exit Conditions

| Condition | Exit |
|---|---|
| Coverage sufficient for stated needs | HONEST CLOSE — no further sales push |
| Genuine gap identified AND customer expresses interest | SUCCESS → ACP-09 or ACP-11 |
| Complex portfolio; cannot assess accurately | HANDOFF → ACP-17 |
| Trust concern | INTERRUPT → ACP-08 |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern | CRITICAL | Suspend; activate ACP-08 |
| Emergency signal | CRITICAL | Suspend; activate ACP-16 |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer cannot describe their coverage | Ask simple questions: What company? Health only or life? Approximate annual coverage amount? |
| Customer describes coverage unclearly | Seek clarification once; if still unclear, acknowledge ambiguity honestly |
| Customer's described coverage may be outdated | Recommend they verify with their insurer; do not speculate on current validity |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Cannot assess portfolio from description alone | "ถ้าอยากรู้ชัดๆ คุณจิรวัฒน์ช่วยดูเอกสารกรมธรรม์ให้ได้โดยตรงครับ" |
| Customer provides contradictory information | Accept as given; note discrepancy; flag for Jirawat |

---

## Conflict Resolution

| Conflict | Resolution |
|---|---|
| Gap is found but is minor | Present it as a minor gap; do not overstate its importance |
| Customer insists on buying more despite sufficiency assessment | "ถ้าคุณต้องการผมก็ยินดีช่วยครับ" — do not argue; route to Jirawat for details |
