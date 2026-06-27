# ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-14  
**Package Name**: EXISTING_POLICY  
**One-Line Purpose**: Review the customer's existing insurance coverage honestly to identify genuine gaps — and acknowledge when coverage is already sufficient.

---

## What This Capability Does

When a customer mentions they already have insurance, ACP-14 takes a "coverage audit" approach:

1. **Ask first**: Understand what coverage the customer already has before recommending anything
2. **Evaluate honestly**: Assess whether current coverage meets the customer's needs
3. **Gap identification**: If gaps exist, explain them clearly with specific examples
4. **Honest sufficiency acknowledgment**: If existing coverage is adequate, say so honestly — do NOT push unnecessary coverage

This capability is distinguished from others by its commitment to honest evaluation. If a customer's existing coverage already meets their needs, ACP-14 says so clearly. This builds long-term trust even if it means no immediate sale.

---

## What This Capability Does NOT Do

- Does NOT assume existing coverage is insufficient before investigating
- Does NOT sell unnecessary coverage to customers who already have enough
- Does NOT dismiss or devalue the customer's existing policies
- Does NOT audit competitor policies in bad faith

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `existing_insurance` | "ผมมีประกันอยู่แล้วครับ" |
| `มีประกันอยู่แล้ว` | "มีอยู่แล้วนะครับ" |
| `coverage_review` | "อยากรู้ว่าที่มีอยู่ครอบคลุมพอไหมครับ" |
| Gap concern | "กังวลว่าประกันที่มีอยู่ไม่พอครับ" |

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
| ACP-09_RECOMMENDATION_ENGINE | If gaps are confirmed, ACP-09 recommends coverage to fill them |
| ACP-10_NEED_DISCOVERY | Need discovery often precedes existing policy review |
| ACP-12_PRODUCT_COMPARISON | Customer may want to compare existing policy to Tokio Marine alternatives |
| ACP-11_LEAD_CAPTURE | Activated only after gap is confirmed AND customer expresses interest |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts at any point |
