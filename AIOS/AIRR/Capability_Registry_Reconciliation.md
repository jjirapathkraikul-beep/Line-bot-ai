# Capability Registry Reconciliation

**Document ID**: AIOS-AIRR-02  
**Version**: 1.0  
**Date**: 2026-06-27  
**Status**: Active — AIRR Resolution for GAP-C-01  
**Authority**: Chief AI Systems Architect

---

## Problem Statement

Two phases of AIOS development produced two separate capability registries:

| Registry | Defined In | ID Format | Count | Granularity |
|---|---|---|---|---|
| CAP Registry | `AIOS/Execution/03_CAPABILITY_LOADER.md` | CAP-001 to CAP-008 | 8 | Functional systems (TrustEngine, LeadEngine) |
| ACP Registry | `AIOS/CapabilityPackages/00_CAPABILITY_STANDARD.md` | ACP-01 to ACP-20 | 20 | Advisory roles (HEALTH_ADVISOR, TRUST_ADVISOR) |

No document defines how these two registries relate. This is **GAP-C-01** identified in AIRR v1.0.

---

## Resolution: Chosen Architecture

**Option B is adopted**: CAP-NNN remains the AEE runtime API (the Capability Loader interface). Each CAP loads one or more ACP packages at runtime. ACP packages are the specification; CAP is the runtime selector.

```
AEE Capability Loader
  └── Detects intent + context signals
  └── Selects CAP-NNN (functional capability)
  └── Each CAP-NNN → loads ACP-NN package(s)
  └── ACP-NN provides: restrictions, decision rules, response profile, knowledge map
```

### Why Option B

- CAP-NNN provides a stable, small runtime API (8 entries) for the Capability Loader to select from — preventing a 20-entry selection problem at runtime
- ACP-NN provides rich specification per advisory scenario — 20 packages, each deeply specified
- This is consistent with how the AEE Capability Loader already works (functional capabilities, each with activation conditions)
- Backwards compatible: no existing documents need to change their naming

---

## CAP-to-ACP Mapping Table

| CAP ID | CAP Name | Primary ACP | Secondary ACPs | Activation Condition |
|---|---|---|---|---|
| CAP-001 | ConversationIntelligence | ACP-01 GREETING (initial) → routing to others | ACP-10 NEED_DISCOVERY | Always active; determines which ACP to load next |
| CAP-002 | TrustEngine | ACP-08 TRUST_ADVISOR | — | `is_trust_signal = true` OR `trust_concern_active = true` |
| CAP-003 | LeadEngine | ACP-11 LEAD_CAPTURE | ACP-19 CLOSING | Lead capture conditions met + trust safe |
| CAP-004 | FAQEngine | ACP-02 HEALTH_ADVISOR, ACP-03 CANCER, ACP-04 MEDICAL, ACP-05 TAX, ACP-06 RETIREMENT, ACP-07 INVESTMENT | ACP-12 COMPARISON, ACP-14 EXISTING_POLICY | Intent = product inquiry or information request |
| CAP-005 | RecommendationEngine | ACP-09 RECOMMENDATION_ENGINE | ACP-11 LEAD_CAPTURE | Intent = ask_recommendation + sufficient context |
| CAP-006 | ObjectionEngine | ACP-13 PRICE_OBJECTION, ACP-14 EXISTING_POLICY | — | Price objection or existing insurance signals |
| CAP-007 | HandoffEngine | ACP-17 HUMAN_HANDOFF, ACP-15 CLAIM_SUPPORT, ACP-16 HOSPITAL_GUIDANCE | ACP-18 FOLLOW_UP | Handoff trigger, claim, hospital, or follow-up |
| CAP-008 | EmotionResponder | ACP-20 EDGE_CASE_HANDLER | — | Emotion ≥ MEDIUM; edge cases (EC-01 through EC-10) |

---

## Runtime Selection Logic

```
1. AEE Capability Loader evaluates activation conditions for all CAPs
2. CAP-002 (TrustEngine) takes CRITICAL priority — if activated, suspends all other CAPs
3. CAP-007 sub-components (claim/hospital) take HIGH priority
4. Remaining CAPs are evaluated in standard priority order
5. Each activated CAP loads its primary ACP
6. ACE receives the primary ACP identifier and loads ACP fragments
```

---

## ACP Packages Without a CAP Assignment

The following ACP packages are loaded as secondary packages by the corresponding primary CAP. They do not have their own CAP entry:

| ACP | Loaded As Secondary By |
|---|---|
| ACP-10 NEED_DISCOVERY | CAP-001 (when intent is unclear) |
| ACP-12 PRODUCT_COMPARISON | CAP-004 (when comparison intent detected) |
| ACP-14 EXISTING_POLICY | CAP-006 (when existing coverage discussed) |
| ACP-18 FOLLOW_UP | CAP-007 (for returning customers) |
| ACP-19 CLOSING | CAP-003 (after lead captured) |

---

## Implementation Note

The Capability Loader in Phase 10.3 should implement:
1. Evaluate CAP activation conditions → get activated CAP list
2. Apply CAP priority (CAP-002 CRITICAL; CAP-007 sub-units HIGH)
3. For each activated CAP: look up primary ACP identifier from this table
4. Return primary ACP identifier to ACE for context assembly

The Capability Loader does NOT load ACP files directly. ACE (Phase 10.5) loads ACP files.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial — resolves GAP-C-01 from AIRR v1.0 |
