# Future Extensions — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-FUTURE-EXTENSIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Planned v1.1 Improvements

| ID | Improvement | Business Rationale | Complexity |
|---|---|---|---|
| FE-14-01 | Policy document upload and AI parsing | Customer uploads their policy PDF; AI extracts coverage details automatically | Very High |
| FE-14-02 | Automated gap score based on coverage vs. need profile | Structured gap assessment using need discovery data + coverage data | High |
| FE-14-03 | Annual review reminder | When customer's situation changes (new child, new job), trigger a review | Medium |
| FE-14-04 | Multi-policy overlap detection | Identify where policies duplicate coverage unnecessarily | High |

---

## Known Gaps

| Gap | Description | Impact |
|---|---|---|
| GAP-14-01 | Cannot read actual policy documents | Assessment based entirely on customer's verbal description, which may be inaccurate | High |
| GAP-14-02 | No access to Thai insurance industry database | Cannot verify policy validity or compare against market benchmarks | High |
| GAP-14-03 | Cannot assess corporate/group insurance | Employees often have group insurance that affects personal coverage needs; AI cannot access group plan details | Medium |

---

## Integration Opportunities

| Integration | Description | Benefit |
|---|---|---|
| OIC (Thai Insurance Commission) database | Verify policy status and basic coverage facts | More accurate gap assessment |
| Jirawat's policy management system | Access customer's Tokio Marine policy records directly | Better context for gap assessment |
| Document OCR pipeline | Parse uploaded policy PDFs | Enable accurate coverage extraction |

---

## Research Items

| Item | Question |
|---|---|
| RI-14-01 | How accurately do customers describe their own insurance coverage? What is the most common misunderstanding? |
| RI-14-02 | Does honest sufficiency acknowledgment lead to higher trust scores and future referrals? |
