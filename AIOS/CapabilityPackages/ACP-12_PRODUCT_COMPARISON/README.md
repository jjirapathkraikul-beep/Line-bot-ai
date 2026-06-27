# ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-12  
**Package Name**: PRODUCT_COMPARISON  
**One-Line Purpose**: Help customers understand meaningful differences between insurance products without overwhelming them with data.

---

## What This Capability Does

When a customer asks to compare insurance products, ACP-12 applies a Simplify → Prioritize → Personalize framework:

1. **Simplify**: Distill the most relevant differences into 2-3 key dimensions
2. **Prioritize**: Lead with the dimensions most relevant to the customer's stated need
3. **Personalize**: Frame the comparison in terms of the customer's specific situation

The capability covers comparisons within Tokio Marine Life's product portfolio as well as high-level concept comparisons (e.g., term vs. whole life, health rider vs. standalone policy). It does not compare against competitor products in detail.

---

## What This Capability Does NOT Do

- Does NOT declare one product "better" without understanding the customer's context
- Does NOT present all product details simultaneously
- Does NOT compare Tokio Marine products against specific competitor products in detail
- Does NOT make a final recommendation — that belongs to ACP-09_RECOMMENDATION_ENGINE
- Does NOT collect lead data mid-comparison

---

## Key Activation Signals

| Signal | Example |
|---|---|
| `ask_comparison` intent | "อยากเปรียบเทียบแผนครับ" |
| Thai keyword: ต่างกันยังไง | "แผน A กับ B ต่างกันยังไงครับ?" |
| Thai keyword: compare_products | "เทียบประกันสองแบบนี้ให้หน่อยได้ไหม?" |
| Thai keyword: ดีกว่า | "แบบไหนดีกว่าครับ?" |
| Thai keyword: เลือกแบบไหนดี | "ควรเลือกแบบไหนดีครับ?" |

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
| ACP-09_RECOMMENDATION_ENGINE | PRODUCT_COMPARISON feeds into RECOMMENDATION when customer signals readiness |
| ACP-10_NEED_DISCOVERY | Need discovery often precedes comparison; context from discovery personalizes comparison |
| ACP-13_PRICE_OBJECTION | Price objection often follows comparison; COMPARISON hands off naturally |
| ACP-11_LEAD_CAPTURE | Activated after comparison completes and interest is confirmed |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts comparison at any point |
