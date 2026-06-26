# KPI — LINE Chatbot Application
### Application-Level Performance Metrics
**Version:** 2.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Application Maintainers

---

> **Boundary Notice:** This document defines operational KPIs for the LINE Chatbot AI. Where KPIs reference trust metrics or lead scoring metrics, this document **measures** outcomes but does not **define** the meaning of those metrics.
>
> - Trust score definition: `AIOS/Domains/Insurance/Trust/Trust_Engine.md`
> - Lead score definition: `AIOS/Domains/Insurance/Lead/Lead_Scoring.md`
> - Lead status taxonomy: `AIOS/Domains/Insurance/Lead/Lead_Status.md`

---

## 1. Purpose

Define the key performance indicators used to evaluate the operational effectiveness of the LINE Chatbot AI. These metrics inform decisions about bot quality, lead pipeline health, and operational reliability.

---

## 2. Scope

This document covers:
- Conversation quality KPIs
- Lead pipeline KPIs
- Integration reliability KPIs
- Trust-related operational metrics (measured, not defined here)

This document does not cover:
- Trust scoring algorithm or signal weights (see `Trust/Trust_Engine.md`)
- Lead scoring algorithm (see `Lead/Lead_Scoring.md`)
- Lead lifecycle state definitions (see `Lead/Lead_Status.md`)

---

## 3. Conversation Quality KPIs

| KPI | Definition | Target |
|---|---|---|
| **FAQ Resolution Rate** | % of FAQ-type questions answered without human handoff | ≥ 80% |
| **Intent Recognition Rate** | % of messages where intent is correctly classified by the router | ≥ 90% |
| **Fallback Rate** | % of messages that trigger a fallback response | ≤ 10% |
| **Avg Response Time** | Time from LINE webhook receipt to reply sent (p95) | ≤ 5 seconds |
| **Session Completion Rate** | % of sessions where a user reaches Tier 1 lead data collection | ≥ 50% |

---

## 4. Lead Pipeline KPIs

| KPI | Definition | Target | Domain Reference |
|---|---|---|---|
| **Lead Capture Rate** | % of new users who reach `engaged` status | ≥ 60% | `Lead_Status.md` → `engaged` |
| **Qualification Rate** | % of engaged leads who reach `qualified` status | ≥ 30% | `Lead_Status.md` → `qualified` |
| **Handoff Rate** | % of qualified leads who trigger a handoff | ≥ 80% | `Lead_Status.md` → `handoff` |
| **Avg Lead Score at Handoff** | Mean lead score of leads at time of handoff | ≥ 60 | `Lead_Scoring.md` |
| **Nurture Rate** | % of leads that enter `nurture` status | Tracked, no target | `Lead_Status.md` → `nurture` |

---

## 5. Integration Reliability KPIs

| KPI | Definition | Target |
|---|---|---|
| **CRM Write Success Rate** | % of CRM write attempts that succeed (HTTP 200 from Apps Script) | ≥ 99% |
| **FAQ Fetch Success Rate** | % of FAQ sheet fetches that return valid data | ≥ 99% |
| **Admin Notification Delivery Rate** | % of handoff events where admin notification is delivered | ≥ 98% |
| **Session Persistence Rate** | % of multi-turn sessions where state is correctly restored | ≥ 95% |

---

## 6. Trust-Related Operational Metrics

The following metrics are **measured by this application** to track operational outcomes. Their definitions are owned by `AIOS/Domains/Insurance/Trust/Trust_Engine.md`.

| Metric | What the App Measures | Domain Definition |
|---|---|---|
| **Escalation Rate** | % of sessions that trigger escalation based on trust score | See `Trust_Engine.md` for trust score definition |
| **Fraud Flag Rate** | % of sessions flagged by trust signals as suspicious | See `Trust/Fraud_Handling.md` |
| **Low-Trust Handoff Rate** | % of handoffs triggered specifically by low trust score | See `Trust_Engine.md` |

The application records these metrics from conversation outcomes. It does not define what constitutes a trust signal, trust threshold, or fraud flag — those are domain definitions.

---

## 7. KPI Review Cadence

| Frequency | Review |
|---|---|
| Weekly | FAQ resolution rate, fallback rate, response time |
| Monthly | Lead pipeline KPIs, integration reliability |
| Quarterly | Full KPI review against targets; adjust targets if needed |

---

## 8. Dependencies

- `AIOS/Domains/Insurance/Trust/Trust_Engine.md` — Trust score and signal definitions (referenced, not redefined)
- `AIOS/Domains/Insurance/Lead/Lead_Scoring.md` — Lead score definition (referenced, not redefined)
- `AIOS/Domains/Insurance/Lead/Lead_Status.md` — Lead status taxonomy (referenced, not redefined)
- `Applications/Line_Chatbot_AI/Analytics/Conversation_Score.md` — Conversation scoring input
- `Applications/Line_Chatbot_AI/Analytics/Customer_Journey.md` — Journey funnel data

---

## 9. Future Improvements

- Add alerting for KPI regressions (e.g., fallback rate spike > 20%)
- Build dashboard from CRM data + webhook logs
- Add A/B test tracking for conversation flow variants

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Application Maintainers | Initial creation |
| 2.0 | 2026-06-26 | AIOS Boundary Cleanup Sprint | Added boundary notice; separated measurement from definition; trust and lead metrics now reference domain docs instead of defining locally; added full KPI table with targets |
