# 10 — Architecture Debt Register

**Document ID**: AIOS-AGS-10  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Architecture Guardian  
**Maintained by**: Chief AI Architect (entries); Architecture Guardian (review); Human Product Owner (resolution approval)

---

## Purpose

The Architecture Debt Register is the permanent, canonical record of all known architecture debt in AIOS.

Architecture debt is any known design decision that is suboptimal, creates maintenance risk, or will need to be corrected in the future. Named debt is managed debt. Hidden debt is hidden risk.

**Rule**: Every piece of architecture debt that is identified — whether from a Guardian approval condition, an HPO exception, or an audit finding — must be registered here. Debt that is not registered does not exist in the governance record. Debt that does not exist in the governance record accumulates silently until it becomes a production failure.

---

## Debt Entry Schema

Each debt entry follows this schema:

```
ID:               DEBT-YYYY-NNN
Date Registered:  YYYY-MM-DD
Title:            [Short descriptive title]
Category:         [Architecture / Technical / SSI / Layer / Knowledge / Duplicate]
Severity:         [Critical / High / Medium / Low]
Origin:           [Guardian review / HPO exception / Audit finding / Self-identified]
Proposal ID:      [ACP-YYYY-NNN or N/A]
Exception ID:     [EXC-YYYY-NNN or N/A]
Description:      [One paragraph: what the debt is]
Impact:           [What happens if this is not resolved]
Affected Components: [List of affected files/modules/documents]
Owner:            [Who is responsible for resolution]
Estimated Cost:   [Time estimate to resolve: hours / days / sprint]
Mitigation:       [What is being done to reduce risk while debt exists]
Target Release:   [Beta / RC / Production / TBD]
Status:           [Open / In Progress / Resolved / Accepted]
Resolved Date:    [YYYY-MM-DD or blank]
Resolution Notes: [How it was resolved, or "Accepted as permanent"]
```

---

## Severity Definitions

| Severity | Definition |
|---|---|
| **Critical** | Debt that poses active risk to customer safety, trust, or medical compliance. Must be resolved before Beta → RC promotion. |
| **High** | Debt that creates significant maintenance risk, scalability constraint, or SSI violation. Must be resolved before RC → Production. |
| **Medium** | Debt that creates moderate maintenance burden or future design constraint. Should be resolved within 2 quarters. |
| **Low** | Debt that is cosmetic, organizational, or low-risk. Resolved when convenient. |

---

## Category Definitions

| Category | Definition |
|---|---|
| **Architecture** | Design decisions that conflict with AIOS layer structure, constitutional principles, or long-term scalability |
| **Technical** | Code-level issues: tight coupling, missing abstraction, poor naming, missing tests |
| **SSI** | Duplicate ownership, shadow implementations, or unregistered capability ownership |
| **Layer** | Components placed in incorrect architectural layers |
| **Knowledge** | Knowledge duplicated across documents, or hardcoded in runtime |
| **Duplicate** | Parallel implementations of the same capability (most common: V1 vs Gen1) |

---

## Registered Debts

---

### DEBT-2026-001

```
ID:               DEBT-2026-001
Date Registered:  2026-06-29
Title:            V1 Intent Classifier Duplicate of Gen1
Category:         Duplicate / SSI
Severity:         High
Origin:           Audit finding (Phase 11.0A)
Proposal ID:      N/A
Exception ID:     N/A
Description:      lib/intentClassifier.ts (V1) and the Gen1 pipeline intent
                  detection are both active. Both classify user intent using
                  different logic and keyword sets. Gen1 is the canonical
                  implementation per SSI-02.
Impact:           V1 and Gen1 may classify the same message differently,
                  causing routing inconsistency if both are active. Maintenance
                  of two classifiers creates divergence over time.
Affected Components: lib/intentClassifier.ts, runtime-gen1/intent/
Owner:            Conversation Intelligence / Lead Runtime Engineer
Estimated Cost:   1 sprint (deprecate V1, migrate callers, write regression tests)
Mitigation:       Gen1 is primary path for all new conversations. V1 is legacy.
Target Release:   RC (must be resolved before Production)
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-002

```
ID:               DEBT-2026-002
Date Registered:  2026-06-29
Title:            V1 Lead Scorer Duplicate of Gen1
Category:         Duplicate / SSI
Severity:         High
Origin:           Audit finding (Phase 11.0A)
Proposal ID:      N/A
Exception ID:     N/A
Description:      lib/scorer.ts (V1) and Gen1 lead scoring logic are both
                  computing lead scores. They may use different criteria,
                  producing different scores for the same customer profile.
                  SSI-04 assigns lead scoring to Commercial Intelligence.
Impact:           Dual scoring creates inconsistent handoff decisions.
                  Which score is authoritative is undefined.
Affected Components: lib/scorer.ts, runtime-gen1/ (lead score computation)
Owner:            Commercial Intelligence / Lead Runtime Engineer
Estimated Cost:   1 sprint (deprecate V1 scorer; test Gen1 scoring parity)
Mitigation:       Gen1 scoring is used for all Beta conversations.
Target Release:   RC
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-003

```
ID:               DEBT-2026-003
Date Registered:  2026-06-29
Title:            V1 Trust Engine Duplicate of Gen1
Category:         Duplicate / SSI
Severity:         High
Origin:           Audit finding (Phase 11.0A)
Proposal ID:      N/A
Exception ID:     N/A
Description:      lib/trustEngine.ts (V1) and Gen1 trust detection are both
                  implemented. SSI-06 assigns trust logic to Customer Intelligence.
                  The Gen1 implementation is the canonical trust detection.
Impact:           V1 trust engine may gate lead capture differently than Gen1.
                  If V1 is still called in any path, trust protection may be
                  inconsistent.
Affected Components: lib/trustEngine.ts, runtime-gen1/ (trust detection)
Owner:            Customer Intelligence / Lead Runtime Engineer
Estimated Cost:   1 sprint (deprecate V1; audit all callers; regression test)
Mitigation:       Gen1 trust detection is active in all Beta conversations.
Target Release:   RC
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-004

```
ID:               DEBT-2026-004
Date Registered:  2026-06-29
Title:            V1 Medical Engine Runtime Hardcode
Category:         Knowledge / SSI
Severity:         Medium
Origin:           Audit finding (Phase 11.0A)
Proposal ID:      N/A
Exception ID:     N/A
Description:      lib/medicalEngine.ts hardcodes medical condition detection
                  keywords and eligibility logic. SSI-03 and SSI-06 assign
                  product knowledge to Product Intelligence and trust/medical
                  flags to Customer Intelligence. The hardcoded keywords should
                  be in knowledge documents, not runtime code.
Impact:           Adding or correcting a medical keyword requires a code
                  deployment instead of a knowledge document update. Medical
                  accuracy is constrained by code release cycles.
Affected Components: lib/medicalEngine.ts, AIOS/Domains/Insurance/Medical/
Owner:            Product Intelligence / Customer Intelligence
Estimated Cost:   2 sprints (extract keywords to knowledge docs; update callers)
Mitigation:       Gen1 medical signal detection is active. V1 medicalEngine
                  is legacy.
Target Release:   Production
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-005

```
ID:               DEBT-2026-005
Date Registered:  2026-06-29
Title:            V1 Lead Capture Duplicate of Gen1
Category:         Duplicate / SSI
Severity:         Medium
Origin:           Audit finding (Phase 11.0A)
Proposal ID:      N/A
Exception ID:     N/A
Description:      lib/leadCapture.ts (V1) and Gen1 lead capture ACP are both
                  active. Lead capture is a sensitive commercial flow that
                  requires trust-gate enforcement. Dual implementation creates
                  risk of trust bypass.
Impact:           If V1 lead capture is ever called without trust-gate check,
                  phone number collection may happen without trust consent.
                  This is a trust violation.
Affected Components: lib/leadCapture.ts, AIOS/CapabilityPackages/ACP-11
Owner:            Commercial Intelligence / Lead Runtime Engineer
Estimated Cost:   1 sprint (deprecate V1; verify trust gate in Gen1 path)
Mitigation:       Gen1 ACP-11 is active for all Beta conversations.
Target Release:   RC
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-006

```
ID:               DEBT-2026-006
Date Registered:  2026-06-29
Title:            RuntimeInput.session Typed as unknown
Category:         Technical / SSI
Severity:         Medium
Origin:           Audit finding (Phase 11.0A) — SSI-09 gap
Proposal ID:      N/A
Exception ID:     N/A
Description:      RuntimeInput.session is typed as unknown in Gen1. Session
                  data (returning customer context) cannot be used without
                  unsafe casting. SSI-09 assigns Session Hydration to
                  Customer Intelligence. A proper CustomerSession type is
                  required.
Impact:           Session-aware features cannot be built without type safety.
                  Returning customers are not recognized unless session is
                  manually cast. This blocks long-term memory implementation
                  (P1-05 in Intelligence Roadmap).
Affected Components: runtime-gen1/ (RuntimeInput type), Customer Intelligence
Owner:            Customer Intelligence
Estimated Cost:   1 sprint (define CustomerSession type; update RuntimeInput)
Mitigation:       Conversation history (getRecentConversationTurnsForUser)
                  provides partial session context.
Target Release:   RC
Status:           Open
Resolved Date:
Resolution Notes:
```

---

### DEBT-2026-007

```
ID:               DEBT-2026-007
Date Registered:  2026-06-29
Title:            Issue Database In-Memory (Not Persisted)
Category:         Technical
Severity:         Critical
Origin:           Phase 11.0A Gap G-20 + Intelligence Roadmap P0-01
Proposal ID:      N/A
Exception ID:     N/A
Description:      runtime-gen1/observability/issueDatabase.ts stores issues
                  in a const _issues[] array. All issues are cleared on
                  every deployment. The learning system has no memory of
                  quality issues across deployments.
Impact:           AIOS cannot learn from quality issues that occurred before
                  the latest deployment. Pattern Library cannot be built from
                  persistent data. Learning velocity is zero between deployments.
Affected Components: runtime-gen1/observability/issueDatabase.ts
Owner:            Learning Intelligence
Estimated Cost:   2-3 hours (pattern: identical to conversationLogger KV writes)
Mitigation:       Manual capture of issues in daily review template.
Target Release:   Beta (before RC gate)
Status:           Open
Resolved Date:
Resolution Notes:
```

---

## Debt Summary Dashboard

| Status | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Open | 1 | 3 | 3 | 0 | 7 |
| In Progress | 0 | 0 | 0 | 0 | 0 |
| Resolved | 0 | 0 | 0 | 0 | 0 |
| Accepted | 0 | 0 | 0 | 0 | 0 |
| **Total** | **1** | **3** | **3** | **0** | **7** |

---

## Debt Review Cadence

| Review | Cadence | Owner | Output |
|---|---|---|---|
| Open Critical Debt Review | Weekly (during Beta) | Architecture Guardian | Critical debts must move to In Progress |
| Debt Register Review | Monthly | Architecture Guardian + HPO | Status update; target release confirmation |
| RC Gate Debt Review | On RC promotion | Architecture Guardian + HPO | All Critical/High debts resolved or accepted before promotion |
| Production Debt Review | Quarterly | Architecture Guardian | Confirm no new Critical debt introduced |

---

## Adding New Debt Entries

Any of the following may create a new debt entry:
- Architecture Guardian APPROVE WITH CONDITIONS decision
- HPO exception approval
- Architecture Audit finding
- AIRR finding (retroactive)
- Self-identification by Chief AI Architect or Lead Runtime Engineer

New entries must be added within 24 hours of identification. The Architecture Guardian reviews and confirms severity within 48 hours of entry.
