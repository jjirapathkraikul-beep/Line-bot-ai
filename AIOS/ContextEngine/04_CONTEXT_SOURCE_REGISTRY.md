# 04 — Context Source Registry

**Document ID**: AIOS-ACE-04  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines all sources from which ACE may read context. Every source in the registry has a defined type, owner, freshness policy, trust level, and runtime access rules.

ACE must ONLY read from registered sources. Any new source requires a registry entry before ACE may use it.

---

## Source Registry

### SR-01: AIOS Core Foundation

| Field | Value |
|---|---|
| Source ID | SR-01 |
| Path | `AIOS/Core/` |
| Type | Documentation |
| Owner | Chief AI Architect |
| Freshness | Stable — changes require major version bump |
| Trust Level | AUTHORITATIVE |
| Runtime Readable | NO — design-time only |
| Human Approval Required | YES for any change |
| ACE Usage | Vision and principles are internalized at design time; not loaded per-request |

---

### SR-02: AI Execution Engine

| Field | Value |
|---|---|
| Source ID | SR-02 |
| Path | `AIOS/Execution/` |
| Type | Architecture Documentation |
| Owner | Chief AI Execution Architect |
| Freshness | Stable |
| Trust Level | AUTHORITATIVE |
| Runtime Readable | NO |
| Human Approval Required | YES |
| ACE Usage | AEE provides intent + ACP selection result to ACE as input; ACE does not read AEE docs at runtime |

---

### SR-03: Capability Packages (ACP)

| Field | Value |
|---|---|
| Source ID | SR-03 |
| Path | `AIOS/CapabilityPackages/ACP-*/` |
| Type | Capability Specification |
| Owner | Chief AI Capability Architect |
| Freshness | Versioned; ACE uses `version` field to detect staleness |
| Trust Level | AUTHORITATIVE |
| Runtime Readable | YES — fragments loaded per request |
| Human Approval Required | YES for Restrictions.md and Lead Policy changes |
| ACE Usage | Steps 06, 07, 10, 11, 12 — reads Capability.md, Restrictions.md, Response_Profile.md, Memory_Requirements.md |
| Read Mode | Fragment only — never full document |

---

### SR-04: Conversation Intelligence Dataset

| Field | Value |
|---|---|
| Source ID | SR-04 |
| Path | `AIOS/ConversationDataset/` |
| Type | Conversation Intelligence |
| Owner | Chief Conversation Intelligence Architect |
| Freshness | Versioned |
| Trust Level | HIGH |
| Runtime Readable | YES — examples and patterns loaded per request |
| Human Approval Required | YES for Decision Rules and Restrictions changes |
| ACE Usage | Step 07 — loads relevant CID document excerpts (examples, follow-up strategy, lead timing) |
| Read Mode | Summary + 1 good example + 1 bad example per referenced CID |

---

### SR-05: Domain Knowledge — Insurance

| Field | Value |
|---|---|
| Source ID | SR-05 |
| Path | `AIOS/Domains/Insurance/` |
| Type | Product and Regulatory Knowledge |
| Owner | Insurance Domain Team |
| Freshness | Review quarterly or when regulations change |
| Trust Level | HIGH |
| Runtime Readable | YES — excerpts loaded per request |
| Human Approval Required | YES for any product fact change |
| ACE Usage | Step 08 — resolves insurance knowledge by intent |
| Read Mode | Excerpt only; relevance scored; < 0.5 relevance excluded |

---

### SR-06: Domain Knowledge — Medical

| Field | Value |
|---|---|
| Source ID | SR-06 |
| Path | `AIOS/Domains/Insurance/Medical/` |
| Type | Medical Underwriting Knowledge |
| Owner | Insurance Domain Team |
| Freshness | Review when OIC guidelines change |
| Trust Level | HIGH |
| Runtime Readable | YES |
| Human Approval Required | YES |
| ACE Usage | Step 08 — loaded when `is_medical_signal = true` |
| Special Rule | NEVER use to diagnose; excerpts must include underwriting uncertainty language |

---

### SR-07: Domain Knowledge — Tax

| Field | Value |
|---|---|
| Source ID | SR-07 |
| Path | `AIOS/Domains/Insurance/Tax/` |
| Type | Tax Deduction Knowledge |
| Owner | Insurance Domain Team |
| Freshness | Review annually (Thai Revenue Department changes) |
| Trust Level | HIGH |
| Runtime Readable | YES |
| Human Approval Required | YES |
| ACE Usage | Step 08 — loaded when `primary_intent` is tax-related |

---

### SR-08: Learning Layer

| Field | Value |
|---|---|
| Source ID | SR-08 |
| Path | `AIOS/Learning/` |
| Type | Pattern Library and Improvement Database |
| Owner | Chief AI Learning Architect |
| Freshness | Updated as patterns are validated |
| Trust Level | MEDIUM (human-approved patterns are HIGH) |
| Runtime Readable | YES — approved patterns only |
| Human Approval Required | YES before pattern is used in context |
| ACE Usage | Step 07 — may load validated conversation patterns that complement CID references |

---

### SR-09: Memory Store (Runtime)

| Field | Value |
|---|---|
| Source ID | SR-09 |
| Type | Runtime Key-Value Store |
| Owner | Application Layer |
| Freshness | Per-session; TTL-managed |
| Trust Level | HIGH (customer-stated data) / MEDIUM (inferred data) |
| Runtime Readable | YES |
| Human Approval Required | NO — runtime data |
| ACE Usage | Steps 02, 10 — session state, lead profile, trust profile |
| Security Note | PII (phone, name) must be stored encrypted; ACE reads and handles but does not log raw PII |

---

### SR-10: CRM (Customer Relationship Data)

| Field | Value |
|---|---|
| Source ID | SR-10 |
| Type | CRM Records |
| Owner | Jirawat / Application Layer |
| Freshness | Near-real-time |
| Trust Level | HIGH |
| Runtime Readable | YES — read for returning customers |
| Human Approval Required | NO for read; YES for write policy |
| ACE Usage | Step 02 — pre-populate lead_profile for returning customers |
| Security Note | PII protected; not logged in debug output |

---

### SR-11: FAQ Runtime Source

| Field | Value |
|---|---|
| Source ID | SR-11 |
| Path | `lib/faq.ts` or equivalent runtime FAQ loader |
| Type | Runtime FAQ Data |
| Owner | Application Layer |
| Freshness | Loaded from Google Sheets or static file at runtime |
| Trust Level | MEDIUM |
| Runtime Readable | YES |
| Human Approval Required | NO for content; YES for schema changes |
| ACE Usage | Step 08 — supplementary knowledge when no dedicated domain knowledge matches |

---

### SR-12: Audit Logs

| Field | Value |
|---|---|
| Source ID | SR-12 |
| Type | Conversation Audit Records |
| Owner | Learning Layer |
| Freshness | Append-only; real-time |
| Trust Level | INTERNAL |
| Runtime Readable | NO during context assembly — write only at end of pipeline |
| Human Approval Required | NO for write; YES for access grants |
| ACE Usage | Step 15 — analytics fields written to audit log after context assembly |

---

## Source Trust Hierarchy

```
AUTHORITATIVE  →  Core, AEE, ACP Restrictions
HIGH           →  Domain Knowledge, ConversationDataset, Memory Store, CRM
MEDIUM         →  Learning Layer (unvalidated), FAQ, Inferred data
LOW            →  External/unverified sources (not registered; ACE must not use)
```

---

## Source Freshness Policy

| Staleness Risk | Policy |
|---|---|
| Tax rates change | SR-07 must be reviewed when Thai Revenue Dept. publishes annual changes |
| Medical guidelines change | SR-06 must be reviewed when OIC underwriting guidelines change |
| ACP Restrictions change | SR-03 version bump required; ACE must re-load |
| FAQ content changes | SR-11 updates propagate automatically if source is live |
| Memory store TTL expires | SR-09 — treat as new session |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial registry — 12 sources |
