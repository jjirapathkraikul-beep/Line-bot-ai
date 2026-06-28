# 08 — Exception Process

**Document ID**: AIOS-AGS-08  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Human Product Owner (sole exception authority)  
**Reference**: `03_DECISION_MATRIX.md` (REJECT decision), `10_ARCHITECTURE_DEBT_REGISTER.md` (debt registration)

---

## Purpose

Sometimes the Human Product Owner intentionally overrides a Guardian recommendation. This is legitimate — product speed, commercial pressure, or strategic context that the Guardian cannot fully evaluate may make an architectural compromise the right business decision.

The Exception Process exists to:
1. Make the override intentional and documented
2. Quantify the architectural risk being accepted
3. Register the resulting debt so it is not forgotten
4. Schedule a post-implementation review to confirm the impact

**The Guardian records architectural debt instead of blocking progress.**

This is how governance co-exists with innovation.

---

## 1. When an Exception Applies

An exception applies when:

- The Architecture Guardian has issued a REJECT or APPROVE WITH CONDITIONS decision
- The Human Product Owner believes the architectural risk is acceptable given product context
- The Human Product Owner chooses to proceed despite the Guardian's recommendation

An exception does NOT apply when:
- The change violates the AI Constitution (no exception can override the Constitution)
- The change violates AI Principles Level 1–4 (Human Well-being, Ethics, Truth, Long-Term Trust)
- The change requires a medical compliance violation (Medical Compliance = 100%, no exceptions)
- The Guardian has not yet issued a decision (exception requires a decision to override)

---

## 2. Exception Request Form

The proposer (or Human Product Owner directly) submits an Exception Request.

```markdown
## Architecture Guardian — Exception Request

**Exception Request ID**: EXC-YYYY-NNN  
**Date**: YYYY-MM-DD  
**Requestor**: [Human Product Owner / Proposer requesting HPO override]  
**Original Proposal ID**: ACP-YYYY-NNN  
**Guardian Decision Being Overridden**: [REJECT / APPROVE WITH CONDITIONS (specific condition)]  

### 1. What the Guardian Rejected or Conditioned
[Summarize the Guardian's decision in one paragraph]

### 2. Why the Business Context Justifies Proceeding
[Specific business, product, or commercial reason for the exception]
[Vague reasons are not acceptable: "we need to move fast" is not sufficient]
[Acceptable: "Delaying this 6 weeks for full architectural alignment would miss the Q3 commercial deadline, resulting in approximately [impact]. The architectural risk is bounded by [constraint]."]

### 3. What Architectural Risk Is Being Accepted
[Be explicit about what the Guardian identified and what the proposer is accepting]

### 4. Scope Limitation
[What boundaries will prevent this exception from spreading to other components?]
[The exception must be time-bounded or scope-bounded or both]

### 5. Mitigation Plan
[What will be done to reduce the architectural risk?]
[Timeline: by when?]
[Owner: who?]

### 6. Post-Implementation Review Date
[When will this be reviewed to confirm impact?]
[Maximum: 90 days after implementation]

### 7. Acknowledgment
The requestor acknowledges that:
- [ ] This exception creates architectural debt
- [ ] That debt will be registered in the Architecture Debt Register
- [ ] The debt will be reviewed at the stated post-implementation review date
- [ ] The Guardian's concerns are not dismissed; they are deferred

**HPO Signature**: ___________  
**Date**: YYYY-MM-DD
```

---

## 3. Risk Assessment

The Architecture Guardian performs a risk assessment on every exception request. The risk assessment is not a veto — it is information for the HPO's decision.

### Risk Assessment Categories

**Risk Level**: Critical / High / Medium / Low

| Risk Level | Definition | Guardian Action |
|---|---|---|
| Critical | Exception could cause trust failure, medical compliance issue, or data loss | Guardian formally documents concern; HPO must explicitly acknowledge Critical risk |
| High | Exception creates significant architectural debt with compounding risk | Guardian registers debt immediately; schedules 30-day review |
| Medium | Exception creates moderate debt with containable risk | Guardian registers debt; schedules 90-day review |
| Low | Exception creates minor debt with minimal risk | Guardian registers debt; notes in next quarterly audit |

### Risk Assessment Questions

1. **Containment**: Is the exception scoped to a specific component, or could it spread?
2. **Reversibility**: How difficult is it to undo this exception after implementation?
3. **Precedent risk**: Could this exception be cited to justify future violations?
4. **Cascade risk**: Could this exception cause failures in dependent components?
5. **Customer impact**: Could this exception produce a customer-visible failure?

---

## 4. Guardian Response to Exception Request

The Guardian issues an Exception Assessment — not a veto. The HPO uses the assessment to make an informed decision.

```
GUARDIAN EXCEPTION ASSESSMENT

Exception Request ID: EXC-YYYY-NNN
Date: YYYY-MM-DD

Original Decision: [REJECT / APPROVE WITH CONDITIONS]
Gate(s) failed: [list]
Guardian's Core Concern: [One paragraph — the specific architectural risk]

Risk Assessment:
  Risk Level: Critical / High / Medium / Low
  Containment: [Contained / Not contained]
  Reversibility: [Easy / Difficult / Very difficult]
  Precedent Risk: [Low / Medium / High]
  Cascade Risk: [None / Possible / Likely]
  Customer Impact: [None / Possible / Likely]

Architecture Debt to be Created:
  Debt ID: [Pre-registered or TBD]
  Severity: [per Debt Register scale]
  Estimated Resolution Cost: [effort estimate]
  Target Resolution: [recommended timeline]

Guardian Recommendation: [Support exception / Oppose exception / Neutral]
  If support: [conditions recommended]
  If oppose: [specific concern that makes this inadvisable]

Note: This is an assessment, not a veto. The Human Product Owner has final authority.
```

---

## 5. HPO Decision on Exception

After receiving the Guardian's Exception Assessment, the HPO decides:

**Option A — APPROVE EXCEPTION**
> HPO approves the exception. Implementation proceeds. Debt is registered immediately. Post-implementation review is scheduled.

**Option B — REJECT EXCEPTION REQUEST**
> HPO agrees with the Guardian. Original Guardian decision stands. Implementor must redesign or wait.

**Option C — APPROVE EXCEPTION WITH ADDITIONAL CONDITIONS**
> HPO approves, but adds conditions beyond what the Guardian proposed. These conditions are binding.

---

## 6. Post-Exception Implementation

After an exception is approved and implemented:

1. **Debt Registration**: Architecture debt entry created in `10_ARCHITECTURE_DEBT_REGISTER.md` within 24 hours of merge
2. **Debt Classification**: Severity, owner, impact, and target resolution recorded
3. **Post-Implementation Review Scheduled**: On the date specified in the Exception Request
4. **Precedent Protection**: Exception record is flagged as "exception precedent — do not cite without Guardian review"

---

## 7. Post-Implementation Review

At the scheduled review date, the Guardian confirms:

| Check | Question |
|---|---|
| Impact confirmation | Did the exception produce the architectural impact that was predicted? |
| Containment confirmation | Did the exception stay within its declared scope? |
| Precedent check | Has this exception been cited to justify any other deviation? |
| Mitigation progress | Is the mitigation plan on track? |
| Debt evolution | Has the debt grown or shrunk since registration? |

**Review outcomes:**
- **Debt resolved**: Exception was addressed; debt register entry closed
- **Debt on track**: Mitigation plan progressing; next review scheduled
- **Debt growing**: Mitigation plan not progressing; escalate to HPO
- **Unexpected spread**: Exception scope has expanded; Guardian issues new assessment

---

## 8. Exception Register

All exceptions are recorded in the Exception Register (maintained within `10_ARCHITECTURE_DEBT_REGISTER.md` under the Exception category).

The Exception Register ensures:
- No exception is forgotten
- No exception is cited as precedent without review
- The HPO can see the full history of architecture overrides
- The architecture debt created by exceptions is tracked to resolution

---

## 9. Exception Limits

To prevent exception abuse, the following limits apply:

| Limit | Rule |
|---|---|
| Consecutive exceptions | If more than 3 exceptions are requested for the same proposal (or same capability area), the Guardian initiates an Architecture Review to determine if the design itself is the problem |
| Exception precedent | An exception may NOT be cited as precedent for a future proposal without explicit Guardian acknowledgment |
| Exception cascade | If a new proposal is only viable because of a prior exception, both proposals require joint review |
| Exception pattern | If 5+ exceptions are approved in a single quarter, Guardian initiates a quarterly exception review with HPO |
