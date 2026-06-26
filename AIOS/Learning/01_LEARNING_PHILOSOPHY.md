# 01 — Learning Philosophy

**Document ID**: AIOS-LEARN-01  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the governing principles of the AIOS Learning System. Every decision about how AI learns, what triggers a change, and who approves it must be traceable to one of the principles in this document.

---

## Scope

This document applies to all improvement activities within the AIOS Learning Layer. It does not govern:
- Application-level feature changes (governed by Application teams)
- Insurance product decisions (governed by domain owners)
- Prompt tuning or A/B experiments (require Change Proposal per `06_CHANGE_PROPOSAL.md`)

---

## Core Principles

### Principle 1 — Conversation Is the Ground Truth

Every improvement must originate from a real customer conversation. No improvement may be proposed based on:
- Hypothetical scenarios invented by the engineering team
- Competitor analysis alone
- Trends or market research alone

**Rationale**: Real conversations reveal the gap between what AI currently does and what customers actually need. Hypothetical improvements risk optimizing for scenarios that never occur.

**Implication**: Every Change Proposal must reference at least one Conversation ID from the Improvement Database.

---

### Principle 2 — Human-in-the-Loop is Non-Negotiable

The AI system may identify patterns, generate root cause analyses, and draft change proposals. It may **never**:
- Self-approve its own proposals
- Modify knowledge directly
- Modify decision logic directly
- Modify response templates directly

**Rationale**: AI optimization without human oversight risks compounding errors, drifting from brand values, or producing legally non-compliant responses (especially in financial and medical contexts).

**Implication**: Every approved change must carry a human approver signature (name + date) before implementation.

---

### Principle 3 — Traceability from Conversation to Release

Every change deployed to AIOS must be traceable back to the originating conversation(s). The trace chain is:

```
ConversationID → AuditID → IssueID → ProposalID → ChangeID → ReleaseID
```

Breaking this chain invalidates the change for governance purposes and requires re-proposal.

**Implication**: IDs are never recycled. Archives are permanent.

---

### Principle 4 — Safety Over Speed

When a proposed improvement could affect:
- Customer trust
- Medical or health-related responses
- Regulatory compliance
- Handoff to human agents

…the change requires **two independent reviewers** before approval, and a mandatory regression test period of at least 48 hours in a staging environment.

**Rationale**: Speed of improvement must not compromise the integrity of high-stakes interactions. One incorrect medical response or one missed trust concern can cause customer harm.

---

### Principle 5 — Quality Over Quantity

It is better to implement five high-quality improvements per month than fifty shallow ones. The Learning System must prioritize:
1. Issues that affect multiple customers (pattern-level impact)
2. Issues in high-severity categories (Medical, Trust, Compliance)
3. Issues with clear root cause and clear proposed fix

Proposals without clear evidence, clear root cause, or clear fix are returned to Draft status.

---

### Principle 6 — Platform Independence

The Learning Layer must not contain logic specific to:
- LINE Messaging API
- Facebook Messenger
- OpenAI API
- Google Sheets
- Vercel
- Insurance product codes
- Any specific market or region

**Rationale**: Learning insights must be reusable across all AIOS applications. A pattern identified in LINE chatbot conversations must be usable to improve Facebook Messenger behavior and vice versa.

**Implication**: All Conversation Audit fields use platform-neutral terminology. Channel is recorded as metadata only, never as a dependency.

---

### Principle 7 — Versioned Knowledge

Every piece of AIOS knowledge has a version. When learning improves a knowledge artifact:
- The old version is archived, not deleted
- The new version references the change that produced it
- Regression tests from the old version are preserved

**Rationale**: Enables rollback. Enables audit. Enables understanding of why AI behaves the way it does at any point in time.

---

### Principle 8 — Explicit Scope Boundaries

Learning proposals are classified by scope:

| Scope | What Changes | Examples |
|---|---|---|
| **Knowledge** | Facts, FAQs, product info | Correcting wrong premium info |
| **Pattern** | Response strategy for a situation | New trust-building response |
| **Decision** | Routing or prioritization logic | Trust trigger before lead capture |
| **Capability** | Entirely new handling of an intent | Medical underwriting Q&A |
| **Memory** | What data is remembered per session | Adding preferred contact time |
| **Process** | Human workflow around AI | New escalation path |

Each scope has its own review requirements defined in `07_ACCEPTANCE_PROCESS.md`.

---

## Improvement Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    AIOS LEARNING LIFECYCLE                       │
│                                                                  │
│  Real Conversation                                               │
│        ↓                                                         │
│  [AUDIT]     Structured quality review of the conversation       │
│        ↓                                                         │
│  [ISSUE]     Problem logged in Improvement Database              │
│        ↓                                                         │
│  [PATTERN]   Issue linked to existing or new pattern             │
│        ↓                                                         │
│  [RCA]       Root cause identified and confirmed                 │
│        ↓                                                         │
│  [PROPOSAL]  Change proposed with evidence and risk assessment   │
│        ↓                                                         │
│  [REVIEW]    Human(s) evaluate proposal                          │
│        ↓                    ↓                                    │
│  [APPROVED]             [REJECTED]                               │
│        ↓                    ↓                                    │
│  [IMPLEMENT]            [ARCHIVED] with reason                   │
│        ↓                                                         │
│  [REGRESSION TEST]                                               │
│        ↓                                                         │
│  [RELEASE]   Changelog entry published                           │
│        ↓                                                         │
│  New Production Conversations                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Knowledge Governance

### Who Owns What

| Artifact | Owner | Can AI Modify? | Requires Approval? |
|---|---|---|---|
| AIOS Principles | Platform Architect | No | N/A — frozen |
| Knowledge Base entries | Domain Owner | No — proposes only | Yes, Domain Owner |
| Decision rules | AI Architect | No — proposes only | Yes, AI Architect |
| Response patterns | Learning Architect | No — proposes only | Yes, Learning Architect |
| Conversation Audit | Learning System | Yes — generates | No — read-only artifacts |
| Improvement Issues | Learning System | Yes — creates | No — proposals only |
| Change Proposals | Learning System | Yes — drafts | Yes, Human Approver |

---

## Safety Guidelines

### Prohibited Learning Actions

The following actions are **never permitted** without explicit human approval at Director level:

1. Changing any response related to regulatory compliance
2. Changing any response that includes medical or health advice
3. Removing any safety disclaimer or escalation path
4. Changing the definition of a "high-value lead" or "handoff trigger"
5. Changing trust-building response content

### Sensitive Topic Flag

Any improvement proposal that touches the following topics is automatically flagged **SENSITIVE** and requires two approvers:

- Medical conditions
- Legal liability
- Regulatory compliance
- Customer financial risk
- Identity verification / anti-fraud

---

## Definitions

| Term | Definition |
|---|---|
| **Learning** | The process of improving AIOS from observed performance in real conversations |
| **Improvement** | A change to AIOS that measurably improves a quality metric |
| **Audit** | Structured quality review of a single conversation |
| **Issue** | A documented gap between AI performance and expected performance |
| **Pattern** | A reusable solution template for a recurring issue type |
| **Proposal** | A structured recommendation for a specific change to AIOS |
| **Regression Test** | A test case that verifies an existing behavior has not broken after a change |
| **Release** | A versioned batch of approved and implemented improvements |
| **Human-in-the-Loop** | The governance requirement that no AI behavior change is deployed without human approval |

---

## Dependencies

| Dependency | Direction | Interface |
|---|---|---|
| `02_CONVERSATION_AUDIT.md` | Downstream from Learning | Provides audit schema |
| `AIOS/Execution/` | Read-only | Source of execution contract definitions |
| `AIOS/KnowledgeBase/` | Read-only input + write via proposal | Where improvements land after approval |

---

## Future Extensions

- **Automated Audit Scoring**: AI-assisted scoring of Conversation Audit fields (still requires human override capability)
- **Cross-Application Learning**: Aggregate patterns from multiple channels before proposing a platform-wide change
- **Learning Velocity Dashboard**: Real-time view of open issues, in-review proposals, and recent releases

---

## Cross References

- `02_CONVERSATION_AUDIT.md` — how individual conversations are evaluated
- `06_CHANGE_PROPOSAL.md` — how proposals are structured
- `07_ACCEPTANCE_PROCESS.md` — how proposals are approved
- `AIOS/04_AI_Constitution.md` — governing principles at the platform level

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
