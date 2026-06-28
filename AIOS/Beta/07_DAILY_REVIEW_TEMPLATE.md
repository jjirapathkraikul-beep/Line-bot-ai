# 07 — Daily Review Template

**Document ID**: AIOS-BETA-07  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Usage**: Complete every morning during Beta  
**Reference**: `04_WEEKLY_OPERATING_RHYTHM.md` — Daily Operating Cycle

---

## How to Use This Template

Copy this template into your daily review notes. Fill out each section based on the previous day's conversation logs.

**Time required**: 15–30 minutes  
**When**: First thing each morning  
**Who**: Human Product Owner or designated conversation reviewer

**Rule**: If you find a P0 issue, stop the review immediately. Fix P0 before anything else.

---

---

# Daily Conversation Review

**Review Date**: YYYY-MM-DD  
**Reviewer**: ___________  
**Conversations Reviewed**: ___ / ___ (reviewed / total from yesterday)  
**Review Period**: Yesterday (YYYY-MM-DD)

---

## 1. P0 Scan — Check This First

*A P0 issue means a trust failure, medical compliance violation, hallucination, or any response that could harm the customer.*

| Check | Observed? | Conversation ID(s) |
|---|---|---|
| Bot claimed it cannot see prior messages when history was available | Yes / No | |
| Bot gave incorrect medical information or guaranteed approval | Yes / No | |
| Bot asked for phone number during active trust concern | Yes / No | |
| Bot hallucinated a product detail not in knowledge documents | Yes / No | |
| Bot re-asked a question the customer had clearly answered in the same session | Yes / No | |
| Bot gave a response unrelated to the customer's question | Yes / No | |
| Pipeline error / fallback activated unexpectedly | Yes / No | |

**P0 Issues Found**: ___ (if > 0, stop here and fix before proceeding)

**P0 Action Required**: ___________

---

## 2. Today's Conversations

| Metric | Value |
|---|---|
| Total conversations yesterday | |
| Total turns (messages) | |
| Conversations that reached CONSIDERING or higher | |
| Conversations that triggered handoff | |
| Conversations that dropped off (no meaningful progression) | |
| Fallback responses triggered | |
| Trust concern detected (isTrustSignal = true) | |
| Medical concern detected (isMedicalSignal = true) | |
| Human request detected (isHumanRequest = true) | |

---

## 3. Top Problems Observed

*List up to 5 specific problems observed in today's conversations. Include ConversationID where possible.*

| # | Problem Description | ConversationID | Severity (P0/P1/P2) | Category |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Category options**: `conversation_flow`, `intent_detection`, `recommendation_quality`, `memory_continuity`, `lead_capture`, `trust_flow`, `medical_flow`, `language_quality`, `fallback_triggered`, `latency`, `other`

---

## 4. Knowledge Gaps

*Were there questions that AIOS could not answer well because the knowledge was missing or incomplete?*

| Question the customer asked | Did AIOS have good knowledge? | Missing knowledge topic | Priority |
|---|---|---|---|
| | Yes / Partial / No | | |
| | Yes / Partial / No | | |
| | Yes / Partial / No | | |

---

## 5. Customer Confusion

*Were there moments where the customer seemed confused by AIOS's response?*

| What confused the customer | Likely cause | ConversationID |
|---|---|---|
| | | |
| | | |

---

## 6. Memory Failures

*Did AIOS re-ask something the customer had already answered? Did AIOS fail to recall conversation history?*

| What was re-asked | What the customer had stated | ConversationID |
|---|---|---|
| | | |
| | | |

**Re-ask count today**: ___  
**History load effective (fieldsFromHistory > 0)**: Yes / No / Partial

---

## 7. Recommendation Observations

*Were product recommendations relevant? Were they delivered at the right time?*

| Recommendation delivered | Customer response | Was timing appropriate? | Issue? |
|---|---|---|---|
| | Positive / Neutral / Rejected | Yes / Too early / Too late | |
| | | | |

---

## 8. Commercial Insights

*What commercial signals were observed today?*

| Signal Type | Count | Notable observation |
|---|---|---|
| Buying intent expressed | | |
| Price objection | | |
| Callback request | | |
| Handoff triggered | | |
| Drop-off at CONSIDERING | | |
| Lost opportunity | | |

---

## 9. Action Items

*What needs to happen as a result of today's review?*

| Action | Priority | Owner | Due |
|---|---|---|---|
| | P0 / P1 / P2 | | Today / This Week / Backlog |
| | | | |
| | | | |
| | | | |

---

## 10. Daily Summary

**Green today?** Yes / No / Partial

**Most important thing learned today**:

> ___________

**Biggest risk observed today**:

> ___________

**Confidence AIOS improved from yesterday?** Yes / No / Same  
**Explanation if No/Same**:

> ___________

---

*Daily review complete. Share with Chief AI Architect if any P1+ items found.*  
*Add P0 items to issueDatabase immediately.*  
*P1+ items added to weekly review backlog.*
