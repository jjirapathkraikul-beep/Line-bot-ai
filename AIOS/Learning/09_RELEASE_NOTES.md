# 09 — Release Notes

**Document ID**: AIOS-LEARN-09  
**Layer**: Learning  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Define the format and governance of AIOS Learning release notes. Release notes are the official changelog of all improvements made to AIOS through the Learning System. They serve as the public record of what changed, why, and what evidence justified the change.

---

## Scope

Every batch of approved and implemented improvements that goes live is recorded as a Release. Release notes are required before any improvement can be declared `RELEASED` status.

---

## Release ID Format

```
RELEASE-YYYY-MM-DD-vN
```

Where `N` is an incrementing integer within a calendar day (usually `v1`, but `v2` if a second release occurs the same day).

Example: `RELEASE-2026-06-27-v1`

---

## Versioning Scheme

AIOS Learning uses **date-based versioning** for releases. Each release:
- Is named by date and sequence within that date
- References a list of proposals and issues it closes
- Is independent of the application deployment version

The AIOS platform version (not the application version) is tracked separately in the AIOS Registry. Learning releases contribute to AIOS platform minor version increments.

---

## Release Note Template

```markdown
# AIOS Learning Release — RELEASE-YYYY-MM-DD-vN

**release_id**: RELEASE-YYYY-MM-DD-vN
**release_date**: YYYY-MM-DD
**release_manager**: [Name]
**aios_version**: AIOS vX.Y
**status**: [DRAFT | PUBLISHED]

---

## Summary

[2–4 sentence overview of what this release contains and why these changes were made]

---

## Issues Fixed

| Issue ID | Category | Severity | Summary |
|---|---|---|---|
| IMPROVEMENT-YYYYMMDD-NNN | [Category] | [Sev] | [One-line description] |

---

## Proposals Implemented

| Proposal ID | Scope | Summary |
|---|---|---|
| PROPOSAL-YYYYMMDD-NNN | [KNOWLEDGE|DECISION|...] | [One-line description] |

---

## Patterns Added or Updated

| Pattern ID | Action | Summary |
|---|---|---|
| PATTERN-XXX-NNN | [ADDED|UPDATED|DEPRECATED] | [One-line description] |

---

## Knowledge Updated

| Knowledge Source | Change Type | Description |
|---|---|---|
| [FAQ | ProductCatalog | ...] | [ADD|UPDATE|REMOVE] | [Description] |

---

## Capabilities Updated

| Capability | Change | Description |
|---|---|---|
| [CapabilityName] | [ADD|MODIFY|RETIRE] | [Description] |

---

## Regression Test Results

| Test Suite | Tests Run | Passed | Failed | Notes |
|---|---|---|---|---|
| intentRouter.test.ts | N | N | 0 | |
| aiosAdapter.test.ts | N | N | 0 | |

**Overall**: ✓ All regression tests pass / ✗ [N] failures (see notes)

---

## Metrics Impact

| Metric | Before | After | Change |
|---|---|---|---|
| [Metric ID] | [value] | [value] | [+/- delta] |

---

## Lessons Learned

[What did we learn from this release that should inform future proposals or patterns?]

---

## Known Issues

[Are there any remaining known issues not addressed in this release?]

---

## Future Work

[What is planned for the next release?]

---

## Traceability

| Conversation IDs | Audit IDs | Issue IDs | Proposal IDs |
|---|---|---|---|
| [CONV-...] | [AUDIT-...] | [IMPROVEMENT-...] | [PROPOSAL-...] |
```

---

## Published Releases

### RELEASE-2026-06-27-v1

**release_date**: 2026-06-27  
**release_manager**: Chief AI Learning Architect  
**aios_version**: AIOS v1.2 (LINE Chatbot Adapter v2)  
**status**: PUBLISHED

#### Summary

This release implements the AIOS LINE Chatbot Adapter v2, addressing six root behavior failures identified from real customer conversations. The primary improvements are: (1) Trust/fraud concerns now receive pre-built identity verification responses before any data capture; (2) Medical/underwriting questions receive case-by-case answers with one relevant follow-up, not phone capture; (3) Known lead data is passed to the OpenAI system prompt, preventing re-asking of captured fields; (4) Trust triggers have been added to the intent override system, ensuring trust concerns cancel any active data capture state.

#### Issues Fixed

| Issue ID | Category | Severity | Summary |
|---|---|---|---|
| IMPROVEMENT-20260627-001 | TRUST | HIGH | Trust concern during awaiting_phone state not handled; bot continued asking for phone |
| IMPROVEMENT-20260627-002 | MEDICAL | HIGH | Medical question triggered immediate phone capture instead of medical answer |
| IMPROVEMENT-20260627-003 | MEMORY | MEDIUM | Known fields not passed to OpenAI context; AI re-asked captured fields |
| IMPROVEMENT-20260627-004 | DECISION | HIGH | TRUST_TRIGGERS not in ALL_INTENT_TRIGGERS; trust signal did not cancel active state |
| IMPROVEMENT-20260627-005 | INTENT_DETECTION | MEDIUM | "สนใจประกันสุขภาพ" incorrectly triggered category flow instead of product flow |
| IMPROVEMENT-20260627-006 | DECISION | MEDIUM | "ขอปรึกษา" incorrectly triggered quote flow and asked for age |

#### Proposals Implemented

| Proposal ID | Scope | Summary |
|---|---|---|
| PROPOSAL-20260627-001 | DECISION | Insert Priority C trust block; add TRUST_TRIGGERS to ALL_INTENT_TRIGGERS |
| PROPOSAL-20260627-002 | CAPABILITY | MedicalEngine: answer-first pattern for underwriting questions |
| PROPOSAL-20260627-003 | MEMORY | Pass getLeadData() to buildSystemPrompt() as third argument |
| PROPOSAL-20260627-004 | PROMPT | Add known_customer_data XML block and trust/medical rules to system prompt |

#### Patterns Added or Updated

| Pattern ID | Action | Summary |
|---|---|---|
| PATTERN-TRUST-001 | ADDED | Trust Before Lead — cancel state, verify identity, no phone after trust concern |
| PATTERN-MEDICAL-001 | ADDED | Answer Medical Before Capturing — case-by-case + one follow-up |
| PATTERN-MEMORY-001 | ADDED | Known Field Protection — check session before asking |
| PATTERN-DECISION-001 | ADDED | Priority-First Routing — trust always fires before state handlers |

#### Capabilities Added

| Capability | Change | Description |
|---|---|---|
| TrustEngine | ADDED | `isTrustTrigger()` + `buildTrustResponse()` — hardcoded, no OpenAI dependency |
| MedicalEngine | ADDED | `buildMedicalResponse()` — answer-first with context-aware follow-up |
| IntentClassifier | ADDED | 17-intent classifier with 6 priority levels |
| ConversationAudit | ADDED | Structured `[AUDIT]` JSON log per routing decision |

#### Regression Test Results

| Test Suite | Tests Run | Passed | Failed |
|---|---|---|---|
| intentRouter.test.ts | 5 | 5 | 0 |
| aiosAdapter.test.ts | 8 | 8 | 0 |

**Overall**: ✓ All 13 regression tests pass. Zero regressions.

#### Metrics Impact (Estimated)

| Metric | Before | After (Expected) | Notes |
|---|---|---|---|
| Trust Score (CQ-03) | ~2.5 | ~4.5 | Based on 7 known trust failures fixed |
| Repeat Question Rate (CQ-04) | ~12% | ~4% | Known-field protection active |
| Answer Quality — Medical (CQ-07) | ~1.5 | ~3.5 | Medical answer-first pattern |
| TRUST pattern coverage | 0 triggers | 14 triggers | All trust/fraud keywords covered |

#### Lessons Learned

1. **Trigger coverage is a dependency**: Missing a trigger in `ALL_INTENT_TRIGGERS` silently allows the wrong handler to run. Trigger lists must be treated as contracts, not implementation details.
2. **State machines need exit conditions for every high-priority intent**: Every state handler must check all higher-priority intents before continuing its normal flow.
3. **Prompt context injection is essential for field protection**: If known fields are not in the prompt context, the language model cannot know to skip them.

#### Future Work

- Formalize conversation audit logging pipeline (currently manual)
- Establish weekly audit sampling process
- Add more trust trigger variations based on new conversation data

#### Traceability

| Conversations | Audits | Issues | Proposals |
|---|---|---|---|
| CONV-20260625-U001-4891 | AUDIT-20260625-003 | IMPROVEMENT-20260627-001 through 006 | PROPOSAL-20260627-001 through 004 |

---

## Release Governance

### Who Publishes a Release

The **Release Manager** (Chief AI Learning Architect or delegate) publishes the release note after:
- All regression tests pass
- All linked proposals are in `IMPLEMENTED` or `REGRESSION_TESTED` status
- At least one approver has signed off on the release note itself

### Immutability

Published release notes are **immutable**. If an error is discovered post-publication:
- A correction note is appended (never overwriting)
- A new release may follow to fix any issues introduced

### Retention

All release notes are retained permanently in `AIOS/Learning/09_RELEASE_NOTES.md`. They are appended (new releases prepended to this file) — never deleted.

---

## Cross References

- `06_CHANGE_PROPOSAL.md` — Proposals that generate releases
- `07_ACCEPTANCE_PROCESS.md` — How RELEASED status is reached
- `08_LEARNING_METRICS.md` — Metrics updated by releases
- `10_CONTINUOUS_IMPROVEMENT.md` — Where releases fit in the full lifecycle

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release; includes RELEASE-2026-06-27-v1 as first published release |
