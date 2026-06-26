# Lead Status
### Insurance Domain — Lead Lifecycle State Machine
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** AIOS Domain Lead

---

## 1. Purpose

Define the canonical lifecycle states of an insurance lead, the valid transitions between states, and the business conditions that trigger each transition.

---

## 2. Scope

This document covers:
- All valid lead status values and their business meaning
- Allowed state transitions and triggering conditions
- Automated vs manual transitions
- Audit requirements

This document does not cover:
- How any application stores or persists state (Application concern)
- Session infrastructure, KV stores, or in-memory fallback (Application concern)
- Channel-specific delivery of state change notifications (Application concern)

---

## 3. Inputs

- Customer profile completeness
- Lead score (from `Lead_Scoring.md`)
- Conversation readiness indicators
- Advisor feedback from previous contacts

---

## 4. Outputs

- Canonical lead status value (written to `lead_status` field per `Lead_Data_Model.md`)
- Transition audit log entry
- Escalation trigger when entering `handoff` state

---

## 5. Lead Status Taxonomy

| Status | Meaning | Entry Condition |
|---|---|---|
| `new` | First contact made; no qualification data collected yet | Created on first customer interaction |
| `engaged` | Customer is actively conversing; partial profile data collected | Customer has responded to at least one qualifying question |
| `qualified` | Customer meets minimum qualification criteria for advisor follow-up | Lead score ≥ threshold defined in `Lead_Scoring.md`; required fields populated |
| `handoff` | Lead has been transferred to a human advisor | Escalation rule met per `Human/Escalation_Rules.md`; advisor notified |
| `nurture` | Customer is not ready now; requires long-term follow-up | Customer explicitly deferred or lead score below threshold |
| `closed_won` | Insurance application completed; sale confirmed | Advisor confirms sale outcome |
| `closed_lost` | Customer declined; no further follow-up warranted | Customer explicitly declined or no response after defined follow-up attempts |

---

## 6. Allowed Transitions

```
new → engaged
new → closed_lost (customer immediately disengages)

engaged → qualified
engaged → nurture
engaged → closed_lost

qualified → handoff
qualified → nurture (re-evaluation)
qualified → closed_lost

handoff → closed_won
handoff → nurture (advisor unable to close; return to nurture)
handoff → closed_lost

nurture → engaged (customer re-engages)
nurture → closed_lost

closed_won → [terminal state]
closed_lost → [terminal state]
```

---

## 7. Dependencies

- `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` — Score thresholds that trigger status transitions
- `AIOS/Domains/Insurance/Lead/Lead_Qualification.md` — Qualification criteria for `qualified` state
- `AIOS/Domains/Insurance/Human/Escalation_Rules.md` — Rules that trigger `handoff` state
- `AIOS/Domains/Insurance/Lead/Lead_Data_Model.md` — `lead_status` field definition

---

## 8. Future Improvements

- Define SLA per status (e.g., max time in `handoff` before escalation)
- Add re-engagement rules for `closed_lost` leads after defined period
- Visualize state transitions as a formal state diagram

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Domain Lead | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Removed application dependencies (Session State, Vercel KV); replaced with domain-neutral inputs/outputs; added full state taxonomy and transition rules |
