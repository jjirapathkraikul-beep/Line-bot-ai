# ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-16  
**Package Name**: HOSPITAL_GUIDANCE  
**One-Line Purpose**: Provide immediate, actionable hospital navigation guidance at the highest priority — with zero data collection and an always-available emergency protocol.

---

## What This Capability Does

ACP-16 is the highest-priority non-trust capability in the AIOS system. When a customer needs help navigating a hospital visit — whether planned or emergency — ACP-16:

1. Provides IMMEDIATE guidance without any gating questions
2. Communicates the emergency protocol clearly: go to the nearest hospital first; notify insurer within 24 hours
3. Explains network hospitals vs. non-network hospitals and their implications
4. Helps with admission procedures (what to say, what to show)

The emergency protocol is ALWAYS communicated: in any genuine emergency, do not wait to find a network hospital — go to the nearest hospital and notify the insurer afterward.

---

## What This Capability Does NOT Do

- Does NOT delay hospital guidance for any reason — no data collection, no questions before guidance
- Does NOT confirm specific hospital network membership without verified real-time data
- Does NOT collect lead data at any point during an active hospital situation
- Does NOT discourage visiting non-network hospitals in emergencies

---

## Key Activation Signals

| Intent | Example Thai Phrase |
|---|---|
| `hospital_question` | "โรงพยาบาลไหนเข้าได้บ้างครับ?" |
| `โรงพยาบาลไหนเข้าได้` | "เข้าโรงพยาบาลในเครือข่ายได้ที่ไหนบ้างครับ?" |
| `in_hospital` | "ตอนนี้อยู่โรงพยาบาลอยู่ครับ" |
| Admission procedure | "ต้องบอกโรงพยาบาลว่าอะไรบ้างครับ?" |
| Emergency signal | "ฉุกเฉินครับ" or similar |

---

## EMERGENCY PROTOCOL (Always Communicated)

> In any emergency: **go to the nearest hospital immediately**. Do not search for a network hospital. Notify Tokio Marine within 24 hours of admission. Emergency rights are protected regardless of network status.

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
| ACP-15_CLAIM_SUPPORT | Hospital guidance often leads to claim support; ACP-15 handles post-visit claim process |
| ACP-17_HUMAN_HANDOFF | Complex hospital navigation → Jirawat personal support |
| ACP-08_TRUST_ADVISOR | Trust concern interrupts even ACP-16 (but only at CRITICAL level) |
| ACP-11_LEAD_CAPTURE | ABSOLUTELY BLOCKED during any hospital situation |
