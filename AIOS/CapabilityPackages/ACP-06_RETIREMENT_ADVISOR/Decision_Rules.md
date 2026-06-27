---
Document ID: ACP-06-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-06 Decision Rules

**Priority Level**: STANDARD

---

## Activation Conditions

| Condition                             | Logic                                                            |
|---------------------------------------|------------------------------------------------------------------|
| Retirement intent detected            | `intent IN [product_retirement, ask_retirement, ask_pension, fear_retirement]` |
| Retirement keyword in message         | Keywords: เกษียณ, บำนาญ, ออมเงิน, วัยชรา, retirement           |
| ACP-10 routing with retirement concern| `routing_target == ACP-06`                                       |

---

## Execution Conditions

1. **Answer First with Positive Framing**: Always begin with reassurance — "ยังไม่สายครับ" or "เริ่มตอนนี้ก็ยังดีมากครับ"
2. **Never Say "สายไปแล้ว"**: This phrase is absolutely prohibited regardless of customer's age.
3. **Ask Age Next**: One question — "ขอทราบอายุปัจจุบันครับ?"
4. **Personalize Timeline**: After age, explain remaining savings years and target monthly contribution.
5. **Ask Existing Savings**: One question — "ตอนนี้มีเงินออมหรือสิ่งที่เตรียมไว้เพื่อเกษียณบ้างไหมครับ?"
6. **Integrate Savings Picture**: Note existing savings as a complement to insurance component.
7. **Lead Capture**: After age + existing savings captured and retirement goal articulated.

### Age-Based Framing Guide

| Customer Age | Framing Approach                                                         |
|--------------|--------------------------------------------------------------------------|
| 25–35        | Time advantage: compounding works powerfully; small premium, big result  |
| 36–45        | Prime earning years; still strong savings potential                      |
| 46–55        | Focus; disciplined saving for 10-15 years creates meaningful retirement income |
| 56–60        | Every year counts; annuity products can still provide guaranteed income  |
| 60+          | Annuity products start immediately; still valuable for the years ahead   |

---

## Exit Conditions

| Condition                             | Exit Type         |
|---------------------------------------|-------------------|
| Lead captured                         | Success           |
| Customer satisfied; no lead           | Informed exit     |
| Trust signal                          | Interrupt → ACP-08|

---

## Interrupt Conditions

| Trigger                           | Priority  | Action                                              |
|-----------------------------------|-----------|-----------------------------------------------------|
| Trust signal                      | CRITICAL  | → ACP-08                                           |
| Customer says "สายไปแล้ว"        | HIGH      | Immediately reframe — never agree with this belief  |
| Investment return guarantee ask   | MEDIUM    | Redirect to savings-based product; risk disclosure if ILP |

---

## Fallback Rules

| Scenario                                | Fallback Action                                           |
|-----------------------------------------|-----------------------------------------------------------|
| Customer has very little savings        | Non-judgmental; "เริ่มจากเล็กๆ ก็ได้ครับ"; focus on starting |
| Customer wants guaranteed income        | Highlight annuity product; explain how it provides fixed monthly income |
| Customer already has a pension          | Acknowledge; explore how insurance can supplement it      |
