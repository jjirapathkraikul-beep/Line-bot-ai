---
Document ID: ACP-08-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                              | Description                                                                                     | Priority |
|------------------------------------------|-------------------------------------------------------------------------------------------------|----------|
| Real-Time OIC License Verification API   | Direct link to OIC agent lookup API so customer can verify Jirawat's license number in real time | High    |
| Trust Resolution Detection               | NLU model to detect when customer signals trust concern is resolved (e.g., "โอเคครับ เข้าใจแล้ว") | High |
| Automatic Jirawat Alert on Trust Signal  | Notify Jirawat via LINE/phone when trust signal is detected, enabling proactive human outreach  | High     |

---

## Planned v1.2 Improvements

| Enhancement                              | Description                                                                                     | Priority |
|------------------------------------------|-------------------------------------------------------------------------------------------------|----------|
| Trust Signal Library Expansion           | Expand Thai trust signal keyword list based on emerging scam patterns in Thailand               | Medium   |
| Multi-Channel Verification Links         | Provide direct deep-links to OIC verification, Tokio Marine Thailand website, and Jirawat's LINE official account | Medium |
| Post-Trust Sentiment Analysis            | Detect lingering skepticism after "resolution" to extend cooling period automatically           | Medium   |

---

## Known Gaps in v1.0

| Gap                                              | Impact                                                              | Planned Fix |
|--------------------------------------------------|---------------------------------------------------------------------|-------------|
| No real-time OIC verification link               | Customer must manually search OIC website; friction reduces trust   | v1.1        |
| Trust resolution detection relies on manual flag | AI cannot automatically detect when trust concern is truly resolved | v1.1        |
| No immediate Jirawat notification                | Jirawat finds out about trust signals only after reviewing CRM      | v1.1        |
| Trust signal library is static                   | New scam patterns not automatically added                           | v1.2        |

---

## Integration Opportunities

| Integration                                   | Value                                                              | Dependency            |
|-----------------------------------------------|--------------------------------------------------------------------|-----------------------|
| OIC Agent Verification API                    | Real-time license check by customer                                | OIC API access        |
| LINE Notify for Jirawat                       | Instant alert when trust concern detected                          | LINE API              |
| PDPA Compliance Reference Integration         | Link to privacy policy for data concern resolution                 | Legal/compliance team |
| Anti-Scam Signal Feed                         | Subscribe to Thai NCSA scam alert feed to update trust signals     | NCSA API              |

---

## Notes
- Real-time OIC verification (v1.1) is the single highest-value improvement for this capability
- The automatic Jirawat notification enables human rescue of trust-flagged conversations before the customer leaves
- Trust signal library must be treated as a living document — scam tactics evolve continuously in Thailand
