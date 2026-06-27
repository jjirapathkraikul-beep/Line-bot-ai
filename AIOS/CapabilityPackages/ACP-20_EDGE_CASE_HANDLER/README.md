# ACP-20: EDGE_CASE_HANDLER

| Field | Value |
|---|---|
| Document ID | ACP-20-README |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Overview

**Package ID**: ACP-20  
**Package Name**: EDGE_CASE_HANDLER  
**One-Line Purpose**: Handle sensitive, unusual, or complex scenarios that fall outside standard capabilities — each with a specific, ethically-sound protocol.

---

## What This Capability Does

ACP-20 manages 10 defined edge case categories. Unlike other capabilities that are triggered by insurance-related intents, ACP-20 is detected by **content pattern analysis** — the system identifies signals in message content that suggest an unusual or sensitive context.

Each edge case has its own specific handling protocol. The unifying principle is: **handle with care, honesty, and humanity first; commercial activity second or not at all**.

---

## Edge Cases Covered

| ID | Category | Key Principle |
|---|---|---|
| EC-01 | Self-harm / suicide signals | Safety resources only; no insurance discussion |
| EC-02 | Terminal illness | Honest + empathetic; no new product push |
| EC-03 | Financial crisis | Options for existing policies; no new product |
| EC-04 | Competitor comparison requests | Factual only; no disparagement; redirect to Jirawat |
| EC-05 | "Are you a bot?" | Transparent acknowledgment; never deny |
| EC-06 | Off-topic questions | Gentle redirect |
| EC-07 | Angry / frustrated customer | De-escalate first; everything else second |
| EC-08 | Guaranteed return requests | Honest disclosure of investment risk |
| EC-09 | Minor / underage customer | Guardian requirement; honest process explanation |
| EC-10 | Customer misinformation | Gentle correction; never confrontational |

---

## What This Capability Does NOT Do

- Does NOT deny being an AI (EC-05)
- Does NOT discuss insurance payouts in a self-harm context (EC-01)
- Does NOT attack or defame competitor companies (EC-04)
- Does NOT push new products in EC-01, EC-02, EC-03 contexts
- Does NOT confirm false insurance claims made by customers (EC-10)

---

## Activation

ACP-20 is activated by **content pattern detection**, not intent classification. The system scans for signal patterns that match each EC category.

---

## File Index

| File | Purpose |
|---|---|
| README.md | This file |
| Capability.md | Full capability definition including all 10 EC protocols |
| Knowledge_Map.md | Knowledge dependencies |
| Conversation_Map.md | Entry/exit and flow |
| Decision_Rules.md | Detection and handling rules per EC |
| Memory_Requirements.md | Memory requirements |
| Response_Profile.md | Tone and language per EC type |
| Restrictions.md | Hard prohibitions per EC |
| Examples.md | Thai conversation examples |
| Regression.md | Test cases per EC |
| Future_Extensions.md | Future improvements |

---

## Cross-References

| Package | Relationship |
|---|---|
| ACP-08_TRUST_ADVISOR | EC-01, EC-04 may route to ACP-08 |
| ACP-17_HUMAN_HANDOFF | EC-02, EC-03, EC-07 may route to Jirawat after de-escalation |
| ACP-16_HOSPITAL_GUIDANCE | EC-01 if physical self-harm → emergency protocol |
| All other capabilities | ACP-20 can interrupt any capability when an edge case signal is detected |
