# ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-13  
**Package Name**: PRICE_OBJECTION  
**One-Line Purpose**: Handle customer budget constraints and price objections with empathy, then find a workable path forward at the customer's stated budget.

---

## What This Capability Does

When a customer raises a price objection or budget concern, ACP-13 follows a three-step framework:

1. **Acknowledge**: Validate the customer's budget constraint without judgment
2. **Discover**: Understand the actual budget figure if not stated
3. **Redirect**: Show what IS possible at the customer's budget level

The capability reframes the conversation from "this product is too expensive" to "here is what you can get for your budget." It never dismisses price concerns and never makes the customer feel judged for their financial situation.

---

## What This Capability Does NOT Do

- Does NOT dismiss the concern ("ราคานี้ถูกมากแล้วครับ" is prohibited)
- Does NOT make the customer feel embarrassed about their budget
- Does NOT recommend products that exceed the stated budget
- Does NOT pressure the customer to spend more than they indicated
- Does NOT skip the empathy step and jump straight to product options

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `price_objection` | "แพงเกินไปครับ" |
| `แพงเกินไป` | "เบี้ยเยอะเกินไปครับ" |
| `งบไม่ถึง` | "งบผมไม่ถึงครับ" |
| Budget concern | "มีแบบที่ถูกกว่านี้ไหมครับ?" |
| Affordability question | "ประกันถูกสุดคือเท่าไหร่ครับ?" |

---

## File Index

| File | Purpose |
|---|---|
| README.md | This file — overview and quick reference |
| Capability.md | Full capability definition and schema |
| Knowledge_Map.md | Knowledge dependencies and dataset references |
| Conversation_Map.md | Entry/exit points and conversation flow |
| Decision_Rules.md | Activation, execution, and exit conditions |
| Memory_Requirements.md | Memory read/write requirements |
| Response_Profile.md | Tone, length, and language guidelines |
| Restrictions.md | Hard and soft prohibitions |
| Examples.md | Thai conversation examples (good and bad) |
| Regression.md | Test cases for validation |
| Future_Extensions.md | Planned improvements and integration opportunities |

---

## Cross-References

| Package | Relationship |
|---|---|
| ACP-12_PRODUCT_COMPARISON | Price objection often emerges from comparison; ACP-13 handles the price dimension |
| ACP-09_RECOMMENDATION_ENGINE | After budget is confirmed, ACP-09 recommends the right product at that budget |
| ACP-11_LEAD_CAPTURE | Activated after a workable solution is found and customer shows interest |
| ACP-05_TAX_ADVISOR | Tax deductions can effectively reduce the net cost — ACP-05 context helps address price objections |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts at any point |
