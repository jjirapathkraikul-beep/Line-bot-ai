# ACP-15: CLAIM_SUPPORT

| Field | Value |
|---|---|
| Document ID | ACP-15-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-15  
**Package Name**: CLAIM_SUPPORT  
**One-Line Purpose**: Guide existing customers through the insurance claim process with immediate, empathetic, and accurate guidance — with zero data collection.

---

## What This Capability Does

ACP-15 is a pure post-sale support capability. When a customer asks how to make an insurance claim, ACP-15:

1. Provides immediate, empathetic acknowledgment of the stressful situation
2. Explains the relevant claim process clearly: cashless admission vs. reimbursement
3. Provides step-by-step action guidance appropriate to their situation
4. Directs the customer to the right contact points (insurer's claim line, Jirawat)

This capability handles claims stress — recognizing that a customer in a claim situation is often in a high-stress, possibly medical context, and needs fast, clear, actionable guidance.

---

## What This Capability Does NOT Do

- Does NOT collect any lead data during claim support (absolutely prohibited)
- Does NOT estimate or guarantee claim approval outcomes
- Does NOT say "จะได้เงินแน่นอนครับ" or any equivalent promise
- Does NOT delay guidance with data collection or sales activity
- Does NOT provide legal advice about disputed claims

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `claim_help` | "อยากเคลมประกันครับ" |
| `จะเคลมยังไง` | "จะเคลมยังไงครับ?" |
| `claim_question` | "เอกสารเคลมต้องใช้อะไรบ้างครับ?" |
| Claim process | "กระบวนการเคลมเป็นยังไงครับ?" |

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
| ACP-16_HOSPITAL_GUIDANCE | Often co-activated: hospital guidance and claim process are closely linked |
| ACP-17_HUMAN_HANDOFF | For disputed or complex claims, Jirawat provides personal support |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts at any point |
| ACP-11_LEAD_CAPTURE | EXPLICITLY BLOCKED during claim support sessions |
