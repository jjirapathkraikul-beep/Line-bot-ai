# AI Knowledge Standard
### Universal Standard for All Knowledge Documents within AIOS
**Version:** 1.0  
**Effective Date:** 2026-06-25  
**Status:** Active  
**Authority:** Chief Knowledge Architect  
**Document Type:** Architectural Standard  
**Applies To:** All Knowledge Base documents within AIOS (Layer 7)  

---

## Purpose of This Document

This document defines the universal standard that every knowledge document within AIOS must follow.

It is not a knowledge base. It does not contain facts about tax, insurance, investment, brand, products, regulations, or any other domain. Those facts belong in individual Knowledge Base documents that are created using this standard.

This document defines **what a knowledge document must look like, how it must be structured, how it must be maintained, and how it must relate to other documents** — so that the knowledge layer of AIOS remains accurate, navigable, and trustworthy at any scale.

### What This Document Contains

**Part I** — The role of knowledge within AIOS and how it differs from other components  
**Part II** — Knowledge categories and when to use each  
**Part III** — Standard structure for every knowledge document  
**Part IV** — File organization, naming, and folder hierarchy  
**Part V** — Knowledge relationships and the single-source principle  
**Part VI** — Quality standards  
**Part VII** — Knowledge lifecycle  
**Part VIII** — Worked examples for different knowledge types  
**Part IX** — Reusable Markdown template  

---

## Relationship to AIOS Foundation

Knowledge documents occupy **Layer 7** of the AIOS architecture, as defined in `04_AI_Constitution.md`. They are governed by all layers above them.

```
Layer 1: AI Vision          → Every knowledge document serves the organizational mission
Layer 2: AI Principles      → Knowledge must comply with all 15 Principles
Layer 3: AI Constitution    → Knowledge documents follow constitutional governance rules
Layer 4: Process Layer      → The Context Framework governs how knowledge is assembled and used
Layer 5: Runtime Layer      → Claude.md defines operational standards for knowledge use
Layer 6: Persona Layer      → Personas reference knowledge; they do not contain it
                                    ↓
Layer 7: KNOWLEDGE BASE     ← This standard governs this layer
                                    ↓
Layer 8: Skills             → Skills may invoke knowledge within their defined scope
Layer 9: Workflows          → Workflows reference knowledge as required by their steps
```

**Critical boundary:** Knowledge documents contain facts, definitions, frameworks, and standards. They do not contain recommendations, persona behaviors, workflow steps, or user-specific advice. The moment a knowledge document says "you should" or "the AI must recommend," it has exceeded its boundary and must be restructured.

---

# Part I — The Role of Knowledge within AIOS

## 1.1 What Knowledge Is

Knowledge is the verified, structured factual substrate of AIOS. It is what the AI knows before a user asks anything. It is the difference between a generic language model and a system that can give specific, accurate, domain-grounded advice.

Knowledge within AIOS answers three types of questions:

| Question Type | Example | Where the Answer Lives |
|--------------|---------|----------------------|
| **What is true?** | What are the current income tax brackets? | Knowledge Base document |
| **What does this mean?** | What is the definition of "กองทุนรวมหุ้นระยะยาว (LTF)"? | Knowledge Base document |
| **What are the rules?** | What is the maximum deductible amount for health insurance premiums? | Knowledge Base document |

Knowledge does NOT answer:
- What should this specific person do? → That is a Persona + Decision Framework output
- How should this task be sequenced? → That is a Workflow
- What capability is needed? → That is a Skill

## 1.2 How Knowledge Differs from Other AIOS Components

| Component | Contains | Does NOT Contain |
|-----------|---------|-----------------|
| **Knowledge** | Facts, definitions, frameworks, rules, standards | Recommendations, persona behaviors, process steps |
| **Persona** | Role identity, scope, communication style | Domain facts, workflow steps |
| **Skill** | A bounded executable capability | Decisions, knowledge, persona behaviors |
| **Workflow** | Sequenced process steps | Domain facts, persona identity, values |
| **Runtime** | Model-specific operational standards | Domain knowledge, persona identity |
| **Principles** | Non-negotiable values and behaviors | Domain facts, process steps |

### The Knowledge-Recommendation Boundary

This boundary is the most commonly violated in practice. It is stated explicitly here and must be enforced strictly.

**Knowledge:** *"The standard formula for calculating human life value is: Annual income × Years to retirement, adjusted for existing assets and liabilities."*

**Recommendation (belongs in Persona output, not in Knowledge):** *"Based on your income of ฿120,000/month and 27 years to retirement, your human life value is approximately ฿23.4M. You are currently underinsured by ฿20.4M."*

The formula lives in the Knowledge Base. The calculation applied to the specific user's data, producing a specific recommendation, is the Persona's output — generated by running the Decision Framework over User Context combined with Knowledge.

## 1.3 Why Knowledge Quality Determines System Quality

Every recommendation produced by any AI Persona within AIOS is ultimately bounded by the quality of the knowledge it draws upon. A sound decision process applied to inaccurate knowledge produces an inaccurate recommendation. A thorough context-gathering process that assembles stale knowledge produces outdated advice.

Knowledge quality is therefore not a documentation concern — it is a product quality concern. The investment in maintaining accurate, current, well-structured knowledge directly determines the value that AIOS delivers to the humans it serves.

---

# Part II — Knowledge Categories

AIOS organizes knowledge into nine categories. Each category has a defined purpose, a defined update frequency, and a defined audience of consuming components.

## Knowledge Category Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AIOS KNOWLEDGE CATEGORIES                         │
│                                                                     │
│  ┌──────────────────┐  Foundation facts about the organization      │
│  │  CORE KNOWLEDGE  │  Stable, rarely changes                       │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  How the business operates                    │
│  │ BUSINESS KNOW.   │  Brand, strategy, products, processes         │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  What the domain requires                     │
│  │  DOMAIN KNOW.    │  Tax, insurance, investment, financial         │
│  └──────────────────┘  planning principles                          │
│                                                                     │
│  ┌──────────────────┐  Specific products and services               │
│  │  PRODUCT KNOW.   │  Features, pricing, eligibility, terms        │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Who the users are                            │
│  │  CUSTOMER KNOW.  │  Personas, segments, behaviors, needs         │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  How systems and tools work                   │
│  │  TECHNICAL KNOW. │  Platforms, integrations, architecture        │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  What the law and regulation requires         │
│  │ REGULATORY KNOW. │  Compliance, licensing, legal constraints     │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  What happened and what was learned           │
│  │ HISTORICAL KNOW. │  Case studies, patterns, prior decisions      │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Lookup tables, glossaries, indexes           │
│  │ REFERENCE KNOW.  │  Definitions, codes, tables, conversions      │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Category 1 — Core Knowledge

**Definition:** Foundational facts about the organization — its history, identity, values, and operating context — that underpin everything the AI communicates.

**Examples:**
- Organization history and background
- Founder story and key milestones
- Brand identity, values, and positioning
- Mission and purpose (operational expression of the AI Vision)
- Key differentiators and competitive position

**Naming prefix:** `30_KB_Core_[Topic].md`  
**Review cycle:** Annual, or when organizational identity changes significantly  
**Primary consumers:** CMO Persona, CEO Persona, Customer Success Persona  
**Stability:** High — this knowledge changes slowly  

**When to create a Core Knowledge document:**  
When the topic represents a foundational fact about who the organization is that multiple Personas need to draw upon.

---

## Category 2 — Business Knowledge

**Definition:** How the organization operates — its processes, strategy, competitive position, internal structure, and market context.

**Examples:**
- Business model and revenue streams
- Competitive landscape and differentiation
- Go-to-market strategy
- Operational SOPs (Standard Operating Procedures)
- Partnership and distribution structures
- Market research and market sizing

**Naming prefix:** `30_KB_Business_[Topic].md`  
**Review cycle:** Annual for strategy; quarterly for competitive intelligence; as-needed for SOPs  
**Primary consumers:** CEO Persona, CFO Persona, CMO Persona  
**Stability:** Medium — strategy evolves; competitive data changes frequently  

---

## Category 3 — Domain Knowledge

**Definition:** Verified professional knowledge about the domains in which the AI advises — tax, insurance, investment, financial planning, and any other professional field AIOS serves.

**Examples:**
- Financial planning principles and frameworks
- Insurance mechanics and coverage types
- Investment theory and asset allocation
- Tax system structure and deduction categories
- Retirement planning frameworks
- Risk management principles

**Naming prefix:** `30_KB_Domain_[Field].md`  
**Review cycle:** Annual — or immediately when significant regulatory or market changes occur  
**Primary consumers:** Financial Planner Persona, Tax Advisor Persona, Investment Advisor Persona  
**Stability:** Medium — foundational principles are stable; specific rules and rates change  

**Important:** Domain Knowledge documents contain principles and frameworks, not specific current rates or regulatory figures. Current rates belong in Regulatory Knowledge (Category 7) or Product Knowledge (Category 4).

---

## Category 4 — Product Knowledge

**Definition:** Specific, current information about the products and services offered by or relevant to the organization — their features, eligibility criteria, pricing, terms, and conditions.

**Examples:**
- Life insurance products (SuperTax, Good Health Prime, Tokyo Beyond, Critical Illness)
- Health insurance specifications
- Investment product details
- Product comparison frameworks
- Pricing structures and premium tables
- Eligibility criteria and underwriting guidelines

**Naming prefix:** `30_KB_Product_[ProductName].md`  
**Review cycle:** Annual minimum — or immediately when a product is updated, repriced, or discontinued  
**Primary consumers:** Financial Planner Persona, Tax Advisor Persona, Customer Success Persona  
**Stability:** Low to medium — products change more frequently than principles  

**Critical:** Product Knowledge documents must carry a clear `Last Reviewed` date and explicit coverage of when their information was last confirmed as current. Using outdated Product Knowledge in a client recommendation is a significant quality and trust risk.

---

## Category 5 — Customer Knowledge

**Definition:** Structured knowledge about the people the organization serves — their profiles, needs, behaviors, pain points, decision patterns, and segmentation.

**Examples:**
- Customer persona profiles (Salaryman Premium, Young Professional, Working Mom, SME Owner)
- Customer lifecycle stages and typical journeys
- Common objections and how they reflect real concerns
- Needs analysis frameworks for different segments
- Customer success patterns — what distinguishes clients who achieve their goals

**Naming prefix:** `30_KB_Customer_[Segment].md`  
**Review cycle:** Annual — or when significant market or behavioral shifts are observed  
**Primary consumers:** All client-facing Personas, CMO Persona, Customer Success Persona  
**Stability:** Medium — personas evolve gradually; specific behavioral patterns may shift faster  

**Boundary note:** Customer Knowledge describes *types* of customers — not specific individual customers. Specific client data belongs in User Context (assembled per the Context Framework), not in a shared Knowledge Base document.

---

## Category 6 — Technical Knowledge

**Definition:** Knowledge about the systems, platforms, tools, and technical architecture that AIOS and the organization rely upon.

**Examples:**
- Platform and technology stack descriptions
- Integration specifications
- API documentation summaries
- System architecture documentation
- Technical constraints and dependencies
- Tool usage guides

**Naming prefix:** `30_KB_Technical_[System].md`  
**Review cycle:** As-needed — triggered by system changes, not by calendar  
**Primary consumers:** Developer Persona, CTO Persona, CIO Persona  
**Stability:** Variable — foundational architecture is stable; specific tool details change frequently  

---

## Category 7 — Regulatory Knowledge

**Definition:** Knowledge about legal requirements, industry regulations, licensing requirements, compliance obligations, and regulatory constraints relevant to the organization's operations.

**Examples:**
- Insurance regulatory requirements (OIC regulations)
- Tax law and current regulations (Revenue Code provisions)
- Financial advice licensing requirements
- Data privacy regulations
- Consumer protection requirements
- Industry codes of conduct

**Naming prefix:** `30_KB_Regulatory_[Domain].md`  
**Review cycle:** Event-driven — updated immediately when regulations change; confirmed annually  
**Primary consumers:** Tax Advisor Persona, Financial Planner Persona, Compliance-related Personas  
**Stability:** Low for specific provisions — regulations change by legislative or regulatory action  

**Critical:** Regulatory Knowledge has the shortest effective shelf life and the highest risk of consequential error if outdated. Every Regulatory Knowledge document must carry a `Regulatory As-Of` date specifying the date through which its content is confirmed current. Using regulatory knowledge past its `Regulatory As-Of` date without re-verification is a compliance risk.

---

## Category 8 — Historical Knowledge

**Definition:** Documented record of significant past events, decisions, case studies, patterns, and lessons learned that inform current decision-making.

**Examples:**
- Significant business decisions and their outcomes
- Case studies (anonymized) of client engagements
- Market trend history and pattern analysis
- Prior strategy changes and the reasoning behind them
- Documented errors and the corrective actions taken

**Naming prefix:** `30_KB_Historical_[Topic].md`  
**Review cycle:** Append-only for historical records; periodic review for pattern analysis  
**Primary consumers:** CEO Persona, CIO Persona, Strategic planning Workflows  
**Stability:** High for historical records (the past does not change); medium for ongoing pattern analysis  

**Note:** Historical Knowledge is read for learning, not for current fact. When drawing on Historical Knowledge, AI agents must confirm that prior patterns are still relevant to current conditions.

---

## Category 9 — Reference Knowledge

**Definition:** Lookup information — tables, glossaries, indexes, conversion references, code definitions, and structured data sets that support other knowledge documents and AI reasoning.

**Examples:**
- Glossary of AIOS terms and domain-specific terminology
- Tax rate tables and deduction limits
- Insurance coverage code definitions
- Geographic and demographic data tables
- Calculation reference tables (annuity factors, compound interest tables)
- AIOS Knowledge Index

**Naming prefix:** `30_KB_Reference_[Type].md`  
**Review cycle:** Domain-specific — tax tables annually; glossary when new terms are introduced  
**Primary consumers:** All Personas; used as supporting reference by all knowledge-consuming workflows  
**Stability:** Variable — glossary terms are stable; rate tables change annually  

**Special reference documents:**
- `30_KB_Reference_Glossary.md` — The master glossary for all AIOS-defined terms. Every new term introduced anywhere in AIOS must be defined here first.
- `30_KB_Reference_Index.md` — The master index of all Knowledge Base documents. Essential for scalable navigation.

---

# Part III — Standard Structure

Every knowledge document within AIOS must follow this structure, in this section order. Sections marked **[Required]** must be present in every document. Sections marked **[Conditional]** are required when their stated condition applies.

---

## Section K1 — Document Header **[Required]**

**Purpose:** Identifies the document as an AIOS Knowledge artifact, establishes its administrative metadata, and provides the essential information an AI agent needs before deciding whether to read the document.

```markdown
# [Knowledge Domain]: [Specific Topic]
### Knowledge Base — [Category Name]
**Version:** [X.Y.Z]
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Next Review Due:** [YYYY-MM-DD]
**Review Cycle:** [Monthly | Quarterly | Semi-Annual | Annual | Event-Driven]
**Status:** [Draft | Active | Aging | Stale | Deprecated | Archived]
**Knowledge Category:** [Core | Business | Domain | Product | Customer | Technical | Regulatory | Historical | Reference]
**Regulatory As-Of:** [YYYY-MM-DD] — required for Regulatory and Product categories only
**Authority:** [Who owns and is responsible for this document]
**Primary Personas:** [Which Personas draw on this document most frequently]
```

**Design notes:**
- `Last Reviewed` and `Next Review Due` are the most operationally critical fields — they drive the Context Framework's freshness assessment
- `Regulatory As-Of` is separate from `Last Reviewed` because a document may have been reviewed (for formatting, structure) without confirming regulatory currency
- `Status` must be set to `Aging` when the `Next Review Due` date has passed without review — this signals to AI agents that a caveat is required when using this content

---

## Section K2 — Purpose **[Required]**

**Purpose:** Explains what this specific document is for and why it exists within AIOS. Must be specific enough that a reader can immediately determine whether this document is relevant to their task.

**Required content:**
- What question or need this document addresses
- Who within AIOS uses this document and for what
- What this document is NOT for (explicit exclusions)

**Length:** 2–5 sentences. This section is read by AI agents during context selection to determine relevance. Precision matters more than completeness here.

---

## Section K3 — Scope **[Required]**

**Purpose:** Defines the precise boundaries of this document's coverage — what it includes and what it explicitly excludes.

**Required content:**

```markdown
## Scope

### This document covers:
- [Topic 1]
- [Topic 2]
- [Topic 3]

### This document does NOT cover:
- [Excluded topic 1] → See [Document reference]
- [Excluded topic 2] → See [Document reference]

### Applicable context:
- Geographic scope: [e.g., Thailand only]
- Temporal scope: [e.g., Tax year 2026; confirmed as of 2026-06-25]
- Audience scope: [e.g., Individual taxpayers, not corporate entities]
```

**Why this section matters:** Without explicit scope, AI agents cannot determine when a knowledge document's content is being applied outside its valid range. A tax document that applies only to individual taxpayers must say so explicitly — otherwise it may be applied to a corporate entity incorrectly.

---

## Section K4 — Definitions **[Required]**

**Purpose:** Defines every specialized term used in this document. Eliminates ambiguity and ensures consistent interpretation by AI agents across sessions and models.

**Required content:**
- Every term that has a specific or non-obvious meaning in this domain
- Every acronym used in this document
- Terms that are defined in the AIOS Glossary (`30_KB_Reference_Glossary.md`) are referenced here rather than redefined

**Format:**

```markdown
## Definitions

**[Term]:** [Definition — precise, unambiguous, stated in plain language]
*Reference: See also `30_KB_Reference_Glossary.md` → [Term]*

**[Acronym]:** [Full form] — [Definition if not self-evident]
```

**Terminology governance rule:** If a term is defined in this document that does not yet exist in the AIOS Glossary, add it to the Glossary as part of this document's creation process.

---

## Section K5 — Core Concepts **[Required]**

**Purpose:** Presents the foundational ideas and frameworks that the reader must understand before the detailed information becomes meaningful. This section is the conceptual foundation — the "mental model" that makes the detail coherent.

**Required content:**
- The 3–7 most important concepts or principles in this knowledge domain
- Each concept explained clearly, with enough depth to be actionable
- Relationships between concepts made explicit

**Format:**

```markdown
## Core Concepts

### [Concept 1 Name]
[Clear explanation — 2–5 sentences]
[Why this concept matters for the domain]

### [Concept 2 Name]
[Clear explanation]
[Relationship to Concept 1, if applicable]

[Continue for all core concepts]
```

**Design note:** Core Concepts should be stable even when the detailed information changes. Tax brackets change annually; the concept of progressive taxation is stable. The Core Concepts section should capture the stable ideas, while the Detailed Information section captures the current specifics.

---

## Section K6 — Detailed Information **[Required]**

**Purpose:** Contains the substantive, specific knowledge content of the document. This is the primary reference section — structured for selective reading by AI agents who need specific facts without reading the entire document.

**Required content:**
- The specific facts, rules, figures, frameworks, and standards that constitute this document's knowledge
- Organized into clearly labelled subsections that allow targeted reading
- Every factual claim either sourced or traceable

**Structural requirements:**
- Use clear H3 and H4 subheadings to create a navigable structure
- Place the most important and most frequently referenced information first
- Use tables where structured data exists (rates, limits, comparison of options)
- Use numbered lists for sequential processes or ordered information
- Use bullet lists for unordered sets of items

**Source citation within this section:**

```markdown
[Factual claim] *(Source: [Document name, Section, and date])*
```

For regulatory information:

```markdown
[Regulatory statement] *(Revenue Code Section [X], as of [date])*
```

---

## Section K7 — Rules and Constraints **[Required for Regulatory, Product, and Domain categories]**

**Purpose:** Explicitly enumerates the binding rules, limits, thresholds, and constraints that apply to the subject matter of this document. Separates rules from explanatory content so AI agents can find constraints quickly without reading the full detail.

**Format:**

```markdown
## Rules and Constraints

### Hard Rules (non-negotiable — defined by law, regulation, or product terms)
- [Rule 1]: [Statement]
- [Rule 2]: [Statement]

### Soft Rules (conventions, best practices, defaults that may have exceptions)
- [Rule 1]: [Statement] — [Condition under which exception applies]

### Numerical Limits and Thresholds
| Item | Limit | Effective Date | Source |
|------|-------|---------------|--------|
| [Item] | [Amount/Limit] | [Date] | [Source] |
```

---

## Section K8 — Worked Examples **[Conditional — required when the application of this knowledge is non-obvious]**

**Purpose:** Demonstrates how the knowledge in this document applies to real situations. Worked examples are the primary mechanism for ensuring that AI agents apply knowledge correctly — especially in domains where misapplication is a significant risk.

**Required content:**
- At least two worked examples illustrating the most common application of this knowledge
- One example of a boundary case — where the knowledge applies in a non-obvious way
- One example of a situation where this knowledge does NOT apply (and what to do instead)

**Format:**

```markdown
## Worked Examples

### Example 1 — [Scenario name]
**Situation:** [Brief description of the specific situation]
**Relevant knowledge applied:** [Which parts of this document apply]
**Application:** [Step-by-step application of the knowledge]
**Result:** [What the knowledge produces in this situation]
**Note:** [Any caveats, exceptions, or limitations relevant to this example]

### Example 2 — [Scenario name]
[Same structure]

### Boundary Example — [Scenario name]
[Same structure — emphasize why this case is at the edge of the document's scope]

### Non-Application Example — [When this document does NOT apply]
**Situation:** [Description]
**Why this document does not apply:** [Explanation]
**What to use instead:** [Reference to the correct document]
```

---

## Section K9 — Common Questions **[Conditional — required for Customer and Domain categories]**

**Purpose:** Addresses the questions most frequently raised in connection with this knowledge domain. Written from the perspective of the user encountering this knowledge — not from the perspective of the author explaining it. This section translates technical knowledge into accessible Q&A format.

**Format:**

```markdown
## Common Questions

**Q: [Question as a user would naturally ask it]**  
A: [Answer — direct, specific, jargon-free]

**Q: [Question]**  
A: [Answer]
```

**Design note:** Common Questions should be updated as new patterns emerge. When an AI agent encounters a question not covered here, and the answer requires applying knowledge from this document, that Q&A pair is a candidate for addition.

---

## Section K10 — Assumptions **[Required]**

**Purpose:** Makes explicit the conditions that must be true for the information in this document to be valid and applicable. Every knowledge document rests on assumptions — stating them explicitly allows AI agents to recognize when conditions have changed and the knowledge may no longer apply.

**Format:**

```markdown
## Assumptions

This document assumes:

1. **[Assumption name]:** [Statement of what is assumed]
   *Risk if wrong:* [What would be different if this assumption is incorrect]

2. **[Assumption name]:** [Statement]
   *Risk if wrong:* [Impact]
```

**Mandatory assumption for all knowledge documents:**

> *"The information in this document was accurate as of the Last Reviewed date. Changes in law, regulation, product terms, or market conditions after that date are not reflected unless explicitly noted."*

---

## Section K11 — Related Knowledge **[Required]**

**Purpose:** Maps this document to other knowledge documents within AIOS that are related, complementary, or prerequisite. Enables efficient navigation of the Knowledge Base and prevents AI agents from applying this document in isolation when related knowledge is material.

**Format:**

```markdown
## Related Knowledge

### Prerequisite Documents (read before this one)
- `[Document name]` — [Why it should be read first]

### Companion Documents (read alongside this one)
- `[Document name]` — [How it complements this document]

### Documents This One References
- `[Document name]`, Section [X] — [What is referenced]

### Documents That Reference This One
- `[Document name]` — [How it uses this document]

### Superseded Documents
- `[Document name]` (Archived [date]) — [What changed and why]
```

---

## Section K12 — Dependencies **[Conditional — required when this document's validity depends on external factors]**

**Purpose:** Identifies external documents, systems, regulations, or data sources that this knowledge document depends upon. If a dependency changes, this document may need to be reviewed and updated.

**Format:**

```markdown
## Dependencies

| Dependency | Type | Impact If Changed |
|-----------|------|------------------|
| [Regulation name] | Legal | This document's [section] may be outdated |
| [Product specification] | Product | Eligibility criteria in [section] may change |
| [External data source] | Data | [Section] figures may no longer be current |
```

---

## Section K13 — Version History **[Required]**

**Purpose:** Provides a complete, traceable record of all changes to this document. Every change — however minor — must be logged here.

**Required format:**

```markdown
## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | YYYY-MM-DD | [Author] | Initial document |
| 1.1 | YYYY-MM-DD | [Author] | [What changed and why] |
| 2.0 | YYYY-MM-DD | [Author] | [Major revision — what changed] |
```

**Versioning rules for knowledge documents:**

| Change Type | Version Impact |
|-------------|---------------|
| Typographical or formatting correction | Patch: X.Y.Z+1 |
| Clarification without meaning change | Patch: X.Y.Z+1 |
| New content added (does not change existing) | Minor: X.Y+1.0 |
| Existing content revised | Minor or Major depending on impact |
| Foundational restructuring | Major: X+1.0.0 |
| Annual review with no content changes | Note in Version History; no version increment |

---

# Part IV — File Organization

## 4.1 Naming Convention

Every Knowledge Base document follows this naming pattern:

```
30_KB_[Category]_[Domain]_[Specifics].md

Where:
  30     = Knowledge Base prefix (Layer 7 identifier)
  KB     = Knowledge Base designator
  [Category] = Two-letter category code (see table below)
  [Domain]   = Domain name in TitleCase
  [Specifics] = Optional additional specificity in TitleCase

Examples:
  30_KB_Domain_TaxPlanning.md
  30_KB_Product_GoodHealthPrime.md
  30_KB_Customer_SalarymanPremium.md
  30_KB_Regulatory_InsuranceOIC.md
  30_KB_Reference_Glossary.md
  30_KB_Business_BrandOS.md
```

## Category Codes

| Category | Code | Example |
|----------|------|---------|
| Core Knowledge | CO | `30_KB_CO_OrganizationHistory.md` |
| Business Knowledge | BU | `30_KB_BU_CompetitiveLandscape.md` |
| Domain Knowledge | DO | `30_KB_DO_InsurancePrinciples.md` |
| Product Knowledge | PR | `30_KB_PR_SuperTax.md` |
| Customer Knowledge | CU | `30_KB_CU_WorkingMom.md` |
| Technical Knowledge | TE | `30_KB_TE_PlatformArchitecture.md` |
| Regulatory Knowledge | RE | `30_KB_RE_TaxRegulations2026.md` |
| Historical Knowledge | HI | `30_KB_HI_MarketTrends2020_2025.md` |
| Reference Knowledge | RF | `30_KB_RF_Glossary.md` |

## 4.2 Folder Hierarchy

```
KnowledgeBase/
│
├── Core/
│   ├── 30_KB_CO_OrganizationIdentity.md
│   ├── 30_KB_CO_BrandOS.md
│   └── 30_KB_CO_FounderStory.md
│
├── Business/
│   ├── 30_KB_BU_BusinessModel.md
│   ├── 30_KB_BU_CompetitiveLandscape.md
│   ├── 30_KB_BU_MarketResearch.md
│   └── 30_KB_BU_SOP_[ProcessName].md
│
├── Domain/
│   ├── 30_KB_DO_FinancialPlanningPrinciples.md
│   ├── 30_KB_DO_InsurancePrinciples.md
│   ├── 30_KB_DO_InvestmentPrinciples.md
│   ├── 30_KB_DO_TaxPlanningPrinciples.md
│   └── 30_KB_DO_LegacyPlanningPrinciples.md
│
├── Product/
│   ├── 30_KB_PR_SuperTax.md
│   ├── 30_KB_PR_GoodHealthPrime.md
│   ├── 30_KB_PR_TokyoBeyond.md
│   ├── 30_KB_PR_CriticalIllness.md
│   └── 30_KB_PR_ProductComparison.md
│
├── Customer/
│   ├── 30_KB_CU_SalarymanPremium.md
│   ├── 30_KB_CU_YoungProfessional.md
│   ├── 30_KB_CU_WorkingMom.md
│   ├── 30_KB_CU_SMEOwner.md
│   └── 30_KB_CU_SegmentationFramework.md
│
├── Technical/
│   ├── 30_KB_TE_AIOSArchitecture.md
│   └── 30_KB_TE_[SystemName].md
│
├── Regulatory/
│   ├── 30_KB_RE_TaxCode[Year].md
│   ├── 30_KB_RE_OICRegulations.md
│   └── 30_KB_RE_ConsumerProtection.md
│
├── Historical/
│   ├── 30_KB_HI_OrganizationDecisions.md
│   └── 30_KB_HI_MarketPatterns.md
│
├── Reference/
│   ├── 30_KB_RF_Glossary.md          ← Master glossary (mandatory)
│   ├── 30_KB_RF_Index.md             ← Master index (mandatory)
│   ├── 30_KB_RF_TaxRates[Year].md
│   └── 30_KB_RF_InsuranceCodes.md
│
└── _archive/
    └── [Deprecated documents]
```

## 4.3 Mandatory Index Document

The file `30_KB_RF_Index.md` is the master index of the entire Knowledge Base. It is updated whenever a new document is added, deprecated, or archived.

**Index entry format:**

```markdown
| Document | Category | Topic | Last Reviewed | Status | Primary Personas |
|----------|----------|-------|--------------|--------|-----------------|
| `30_KB_PR_SuperTax.md` | Product | SuperTax insurance product specifications | 2026-06-25 | Active | Financial Planner, Tax Advisor |
```

The Index enables the Context Framework's "Index Before Reading" principle (Principle S1 in `03_AI_Context_Framework.md`) — AI agents consult the Index to identify the most relevant documents before reading any of them.

## 4.4 Document Metadata Summary

Each document's header provides the machine-readable metadata that the Index draws upon. The metadata fields that matter most for context assembly are:

| Field | Why It Matters |
|-------|---------------|
| `Last Reviewed` | Determines freshness; drives caveat requirements |
| `Next Review Due` | Enables proactive review scheduling |
| `Status` | Instantly signals whether the document can be used without caveat |
| `Knowledge Category` | Enables category-based filtering during context selection |
| `Primary Personas` | Enables persona-based filtering during context selection |

---

# Part V — Knowledge Relationships

## 5.1 The Single Source of Truth Principle

Every fact, definition, or rule must exist in exactly one Knowledge Base document. When the same information is needed in multiple documents, the other documents reference it — they never copy it.

**Why this matters:** When a tax deduction limit changes, it must be updated in exactly one place. If the same figure appears in five documents, it will be updated in one and remain stale in four — creating a system that gives different answers depending on which document an AI agent happens to read.

**Enforcement:**

```
Before adding a fact to a document, search the Knowledge Base to confirm it
does not already exist elsewhere.

If it exists:
  - Reference the authoritative document
  - Do not copy the content

If it does not exist:
  - Add it to the most appropriate document
  - If no appropriate document exists, create one
  - Update the Index
```

## 5.2 Reference Syntax

When a document references another document, use this syntax:

```markdown
[Statement that relies on another document]
*(See `30_KB_RE_TaxCode2026.md`, Section: Deduction Limits for current figures)*
```

For inline references within a document:

```markdown
For definitions of terms used in this section, see `30_KB_RF_Glossary.md`.
```

For cross-document dependencies:

```markdown
This section assumes familiarity with the Financial Planning Principles framework.
Reference: `30_KB_DO_FinancialPlanningPrinciples.md`, Section: Core Concepts
```

## 5.3 Modular Design Principles

**Principle M1 — One topic per document:**  
Each Knowledge Base document addresses one primary topic. If a document grows to cover multiple unrelated topics, split it.

**Principle M2 — Depth over breadth:**  
A document about one topic should be deep — comprehensive within its scope. A document that covers many topics shallowly is harder to navigate and harder to maintain than multiple focused documents.

**Principle M3 — Explicit over implicit:**  
Every relationship between documents is stated explicitly in the Related Knowledge section. No implicit dependencies.

**Principle M4 — Stable interfaces:**  
When other documents reference a section of this document, the section heading becomes a "stable interface." If the heading changes, references break. Before changing a section heading, check which documents reference it and update them.

**Principle M5 — Reference chains must be bounded:**  
A document may reference another document, which may reference another. But reference chains must be bounded — no document should require more than three hops to access the information needed. If longer chains develop, restructure.

## 5.4 Knowledge Graph Maintenance

As the Knowledge Base grows, the relationships between documents form a knowledge graph. The Chief Knowledge Architect (or equivalent role) is responsible for maintaining the integrity of this graph:

- Ensuring no circular dependencies exist
- Ensuring all references are valid (pointing to existing, active documents)
- Ensuring no topic area is covered by multiple documents without clear differentiation
- Ensuring the Index accurately reflects the current state of the graph

---

# Part VI — Quality Standards

## 6.1 The Five Quality Dimensions

Every Knowledge Base document must meet these five quality standards before activation and at every subsequent review.

### Dimension 1 — Accuracy

Every factual claim in the document is correct as of the `Last Reviewed` date.

**Test:** Could any statement in this document be shown to be factually incorrect by checking against authoritative sources? If yes, correct it before publication.

**Accuracy requirements:**
- All numerical figures are sourced and dated
- All regulatory references are current as of the `Regulatory As-Of` date
- All product information has been confirmed against official product documentation
- No claim is presented as fact without a basis that can be verified

### Dimension 2 — Completeness

The document covers its stated scope completely. No material topic within the declared scope is missing.

**Test:** If an AI agent relied solely on this document for knowledge about its stated topic, would it have enough information to answer the questions that typically arise? If a significant gap exists, fill it or expand the scope declaration to acknowledge it.

**Completeness requirements:**
- All terms used are defined in Section K4 (Definitions)
- All rules and constraints relevant to the scope are captured in Section K7
- Common questions within the scope are addressed in Section K9

### Dimension 3 — Consistency

The document is internally consistent — it does not contradict itself. It is also consistent with other Knowledge Base documents it references or that reference it.

**Test:** Read the document in sections. Does Section K6 (Detailed Information) contradict Section K5 (Core Concepts) anywhere? Does this document's definition of a term differ from the definition in `30_KB_RF_Glossary.md`?

**Consistency requirements:**
- All terminology is consistent with the AIOS Glossary
- Numerical figures are consistent across all sections
- No statement in this document contradicts a statement in a higher-priority document

### Dimension 4 — Traceability

Every factual claim can be traced to an authoritative source. Claims of uncertain origin are labelled as inferences or flagged for verification.

**Test:** For each factual claim, can you identify the source? If not, the claim must be either sourced or labelled as unverified.

**Traceability requirements:**
- Regulatory claims cite the specific regulation, section, and date
- Product claims cite the official product documentation and version
- Market data claims cite the source and date
- Inferences are labelled as such: *(Inference based on [reasoning])*

### Dimension 5 — Maintainability

The document can be updated efficiently when its subject matter changes. Structure, format, and relationships are designed to support easy updates.

**Test:** If the primary reviewer received this document and needed to update a specific figure, how long would it take them to find the relevant section and make the change? If the answer is "more than five minutes for a simple update," the document needs restructuring.

**Maintainability requirements:**
- Structured with navigable headings and clear section boundaries
- Tables used for data that changes (rates, limits, codes) — tables are easier to update than prose
- Single-source principle followed — no figures duplicated within the document
- Related Knowledge section current — all references point to existing documents

## 6.2 Quality Review Checklist

Before a Knowledge document is activated or after a review cycle:

```
ACCURACY
□ All numerical figures are sourced and dated
□ All regulatory references carry an as-of date
□ All product information confirmed against current official documentation
□ No unverified assertions presented as fact

COMPLETENESS
□ Scope declared (what is in, what is out)
□ All terms used are defined
□ All rules and constraints documented
□ Common questions addressed (for applicable categories)
□ Worked examples present (for applicable categories)

CONSISTENCY
□ All terminology matches the AIOS Glossary
□ No internal contradictions
□ No contradictions with related Knowledge documents
□ No contradictions with AI Principles

TRACEABILITY
□ Every regulatory claim cites the specific source
□ Every numerical figure is dated
□ Inferences labelled as inferences
□ Version History up to date

MAINTAINABILITY
□ Structured with navigable headings
□ Data in tables, not prose
□ No duplicated figures within document
□ Related Knowledge section current
□ Index entry up to date
```

---

# Part VII — Knowledge Lifecycle

## 7.1 Lifecycle Stages

```
PROPOSED
  ↓
DRAFT
  ↓
REVIEW
  ↓
ACTIVE ──────────────────────────────────────────┐
  ↓                                              │
AGING (approaching review date)                 │ (if review confirms currency)
  ↓                                              │
STALE (past review date; not yet reviewed) ──────┘
  ↓
DEPRECATED (confirmed outdated; replacement available)
  ↓
ARCHIVED
```

## 7.2 Creation Process

**Stage 1 — Need Identification**  
A gap in the Knowledge Base is identified — either by a Persona that cannot find needed knowledge, by a human knowledge worker, or through the review process of an existing document that reveals a missing adjacent topic.

Document the need:
```
Gap identified: [What knowledge is missing]
Category:       [Which category it belongs to]
Requestor:      [Who identified the gap]
Priority:       [High / Medium / Low based on how frequently the gap affects outputs]
```

**Stage 2 — Author Assignment**  
A human Knowledge Author (domain expert or Knowledge Architect) is assigned to create the document. AI agents may assist in structuring and drafting, but a human with domain expertise must verify all factual content before the document is activated.

**Stage 3 — Draft Creation**  
Using the template in Part IX of this document, the author creates the initial draft, populating all required sections.

**Stage 4 — Accuracy Review**  
A second domain expert reviews all factual claims against authoritative sources. This review is not optional for Regulatory, Product, and Domain Knowledge categories.

**Stage 5 — Consistency Review**  
The document is checked for consistency with:
- The AIOS Glossary (`30_KB_RF_Glossary.md`)
- Related Knowledge documents identified in Section K11
- AI Principles (no knowledge content may conflict with any Principle)

**Stage 6 — Activation**  
Status is set to `Active`. The document is added to the Knowledge Index (`30_KB_RF_Index.md`). The `Effective Date` and `Last Reviewed` date are set to the activation date. The `Next Review Due` date is calculated from the Review Cycle.

## 7.3 Review Process

**Scheduled review:**  
Every Active document has a `Next Review Due` date calculated from its Review Cycle. When that date arrives:

```
Step 1: Retrieve the document
Step 2: Verify all factual claims against current authoritative sources
Step 3: Update any content that has changed
Step 4: Update `Last Reviewed` date
Step 5: Recalculate `Next Review Due`
Step 6: Update Status:
          - If content is current → remain Active
          - If minor updates made → remain Active (increment patch version)
          - If significant updates made → Active (increment minor or major version)
          - If content cannot be confirmed current → set to Stale
```

**Event-driven review:**  
For Regulatory and Product categories, review is also triggered by:
- A regulatory change published in the relevant jurisdiction
- A product update announced by the product provider
- A significant market event that may affect the document's validity

When an event trigger occurs:
```
Step 1: Identify all Knowledge documents potentially affected by the event
Step 2: Review each identified document immediately
Step 3: Update or flag documents as needed
Step 4: Log the event in Version History: "Event-driven review triggered by [event]"
```

## 7.4 Update Process

**For minor updates (patch or minor version):**
1. Update the relevant section
2. Update `Last Reviewed` date
3. Recalculate `Next Review Due`
4. Increment version number
5. Log the change in Version History

**For major updates (major version):**
1. Follow the update process above
2. Additionally, check all documents that reference this one — do they need to be updated?
3. If yes, update or flag referenced documents
4. Notify the AI agent community of the major version change

## 7.5 Deprecation Process

A document is deprecated when:
- Its content has been superseded by a replacement document
- The knowledge domain it covered is no longer relevant to AIOS's mission
- The document has been confirmed as irreparably outdated

**Deprecation steps:**
1. Set Status to `Deprecated`
2. Add a deprecation notice at the top of the document:

```markdown
> **DEPRECATED:** This document was deprecated on [date].
> **Reason:** [Why it was deprecated]
> **Replaced by:** `[Replacement document name]` (if applicable)
> **Do not use this document** for new recommendations without consulting the replacement.
```

3. Update the Knowledge Index to reflect deprecated status
4. Update all documents that reference this one to point to the replacement

## 7.6 Archiving Process

Deprecated documents are archived — moved to the `_archive/` folder — after a transition period of at least 90 days. They are never deleted.

**Why archiving is permanent:**  
Historical knowledge documents contain the organization's institutional memory. Understanding why a prior knowledge framework was replaced is often as valuable as the replacement itself. Deleted documents cannot be consulted when questions arise about prior decisions.

---

# Part VIII — Worked Examples

## Example 1 — Product Knowledge Document: SuperTax Insurance Product

**Category:** Product Knowledge  
**Naming:** `30_KB_PR_SuperTax.md`  
**Review cycle:** Annual, plus event-driven when product terms change  

**Structure preview:**

```markdown
# SuperTax: Product Knowledge
### Knowledge Base — Product Knowledge
**Version:** 2.1.0
**Last Reviewed:** 2026-06-25
**Next Review Due:** 2027-06-25
**Review Cycle:** Annual + Event-Driven
**Status:** Active
**Regulatory As-Of:** 2026-01-01

## Purpose
This document provides complete, current product specifications for the SuperTax
whole life insurance product. Used by the Financial Planner and Tax Advisor Personas
when advising clients on protection plus tax deduction planning.

## Scope
Covers: Product structure, coverage terms, premium schedule, tax deduction eligibility,
        and surrender value framework.
Does NOT cover: General tax planning principles (see 30_KB_DO_TaxPlanningPrinciples.md);
                comparison with competing products (see 30_KB_BU_ProductComparison.md).

## Definitions
**Whole Life Insurance:** A permanent life insurance contract providing lifetime coverage
with a savings component...

## Core Concepts
### How SuperTax Creates Dual Value
[Explanation of protection + tax benefit mechanism]

### The Tax Deduction Mechanism
[How deductions work; reference to 30_KB_RE_TaxCode2026.md for current limits]

## Detailed Information
### Coverage Structure
[Specific coverage amounts, benefit structure]

### Premium Schedule
[Age-based premium table]

### Tax Deduction Eligibility
*(See 30_KB_RE_TaxCode2026.md, Section: Life Insurance Deduction Limits for current figures)*

### Surrender Value Schedule
[Table of surrender values by year]

## Rules and Constraints
### Hard Rules
- Maximum annual tax deduction: [Amount — source: Tax Code 2026]
- Minimum premium payment period: [Years]
...
```

---

## Example 2 — Customer Knowledge Document: Salaryman Premium Persona

**Category:** Customer Knowledge  
**Naming:** `30_KB_CU_SalarymanPremium.md`  
**Review cycle:** Annual  

**Structure preview:**

```markdown
# Salaryman Premium: Customer Segment Knowledge
### Knowledge Base — Customer Knowledge
**Version:** 1.2.0
**Last Reviewed:** 2026-06-25
**Next Review Due:** 2027-06-25
**Review Cycle:** Annual
**Status:** Active
**Primary Personas:** Financial Planner AI, Tax Advisor AI, CMO AI, Customer Success AI

## Purpose
Describes the Salaryman Premium customer segment — the primary target audience
for the JIRAWAT Family Wealth Coach brand. Used by all client-facing Personas to
calibrate communication, prioritize concerns, and identify the most relevant products.

## Scope
Covers: Demographic profile, psychographic profile, financial situation, pain points,
        decision patterns, and communication preferences.
Does NOT cover: Individual client profiles (assembled per Context Framework, User Context);
                product recommendations for this segment (generated by Persona + Decision Framework).

## Definitions
**Salaryman Premium:** [Definition of this segment as used within AIOS]

## Core Concepts
### Who This Person Is
[Detailed profile: age 35–50, Manager/Director/Professional,
income ฿80,000–฿300,000/month, family with children, mortgage, tax exposure]

### What This Person Fears
[Protection gap anxiety, retirement inadequacy, children's education uncertainty,
tax burden, loss of income]

### How This Person Makes Decisions
[Evidence-driven, prefers to understand before deciding,
skeptical of salespeople, trusts advisors who respect their intelligence]

## Detailed Information
### Demographic Profile
[Age, income, family structure, education, career stage]

### Financial Situation
[Typical asset structure, liability profile, insurance gap patterns]

### Pain Points — Primary
[Protect Family keyword: specific fears and their financial implications]

### Communication Preferences
[Formal but human, data-supported, respects their time, does not talk down to them]

## Common Questions
**Q: What is the most important thing to this customer?**
A: Security for their family if something happens to them before they achieve financial
   independence. The fear is not poverty — it is disrupting the family's trajectory.
```

---

## Example 3 — Regulatory Knowledge Document: Thai Income Tax

**Category:** Regulatory Knowledge  
**Naming:** `30_KB_RE_ThaiIncomeTax2026.md`  
**Review cycle:** Annual (January, following budget announcement)  

**Structure preview:**

```markdown
# Thai Personal Income Tax: 2026 Regulations
### Knowledge Base — Regulatory Knowledge
**Version:** 1.0.0
**Last Reviewed:** 2026-01-15
**Next Review Due:** 2027-01-15
**Review Cycle:** Annual — updated each January after budget announcement
**Status:** Active
**Regulatory As-Of:** 2026-01-01
**Primary Personas:** Tax Advisor AI, Financial Planner AI

## Purpose
Provides current Thai personal income tax structure, brackets, and deduction limits
for tax year 2026. Used by Tax Advisor and Financial Planner Personas when advising
on tax optimization strategies.

⚠️ REGULATORY DOCUMENT: All figures are as-of 2026-01-01.
   Verify against official Revenue Department publications before advising on
   high-value tax transactions.

## Scope
Covers: Personal income tax brackets, standard deduction, allowable deductions,
        specific deduction categories relevant to AIOS's client base.
Does NOT cover: Corporate income tax; VAT; property tax; international tax treaties.
Geographic scope: Thailand only.
Temporal scope: Tax year 2026 (January 1 – December 31, 2026).

## Rules and Constraints

### Tax Brackets (Tax Year 2026)
| Taxable Income (THB) | Rate |
|---------------------|------|
| 0 – 150,000 | 0% (exempt) |
| 150,001 – 300,000 | 5% |
| 300,001 – 500,000 | 10% |
| 500,001 – 750,000 | 15% |
| 750,001 – 1,000,000 | 20% |
| 1,000,001 – 2,000,000 | 25% |
| 2,000,001 – 5,000,000 | 30% |
| Over 5,000,001 | 35% |
*(Source: Revenue Department, Royal Gazette, [date])*

### Key Deduction Limits (Tax Year 2026)
| Deduction Category | Annual Limit (THB) | Notes |
|-------------------|-------------------|-------|
| Life insurance premium | 100,000 | Must be 10+ year policy |
| Health insurance premium | 25,000 | Included in life insurance limit |
| LTF / SSF contribution | [Amount] | [Conditions] |
| Pension fund (PVD/RMF) | 500,000 | Combined limit |
| Personal allowance | 60,000 | Per taxpayer |
| Spouse allowance | 60,000 | If spouse has no income |
| Child allowance | 30,000 | Per child |
```

---

## Example 4 — Domain Knowledge Document: Financial Planning Principles

**Category:** Domain Knowledge  
**Naming:** `30_KB_DO_FinancialPlanningPrinciples.md`  
**Review cycle:** Every 3–5 years (foundational principles are stable)  

**Structure preview:**

```markdown
# Financial Planning: Domain Principles
### Knowledge Base — Domain Knowledge
**Version:** 1.0.0
**Last Reviewed:** 2026-06-25
**Next Review Due:** 2031-06-25
**Review Cycle:** Every 5 years (foundational principles are stable)
**Status:** Active
**Primary Personas:** Financial Planner AI, Investment Advisor AI, Tax Advisor AI

## Purpose
Provides the foundational principles of personal financial planning that govern
how the Financial Planner and related Personas reason about client situations.
These are durable principles — not current rates or product specifications.

## Core Concepts
### The Financial Planning Hierarchy
[Protection before savings; savings before investment;
investment before advanced strategies]

### The Human Life Value Concept
[How to think about insurance needs as income replacement]
*Calculation methodology: Annual income × Years to retirement × adjustment factors*
*For current implementation, see 30_KB_DO_InsurancePrinciples.md*

### The Emergency Fund Principle
[3–6 months of expenses; why this comes before insurance; why before investment]

### Compounding as the Core Mechanism
[Time value of money; why starting early is the dominant variable]

### The Family Wealth Journey Framework
| Stage | Life Phase | Primary Goal | Key Products |
|-------|-----------|-------------|-------------|
| 1. Secure Yourself | 25–35 | Income protection | Health, CI, Term Life |
| 2. Build Your Family | 30–45 | Family protection + education | Whole Life, Savings |
| 3. Grow Your Wealth | 35–55 | Retirement + passive income | Investment, Tax-advantaged |
| 4. Protect Your Legacy | 50+ | Estate transfer, spouse protection | Permanent Life, Estate Planning |
```

---

# Part IX — Reusable Template

The following is the complete, copy-ready template for creating a new Knowledge Base document. Replace all `[placeholder]` values. Delete sections marked as `[Conditional]` if the condition does not apply. Delete this instruction before activating the document.

---

```markdown
# [Knowledge Domain]: [Specific Topic]
### Knowledge Base — [Category Name]
**Version:** 1.0.0
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Next Review Due:** [YYYY-MM-DD]
**Review Cycle:** [Monthly | Quarterly | Semi-Annual | Annual | Event-Driven | Every N Years]
**Status:** Draft
**Knowledge Category:** [Core | Business | Domain | Product | Customer | Technical | Regulatory | Historical | Reference]
**Regulatory As-Of:** [YYYY-MM-DD] ← Required for Regulatory and Product categories; delete for others
**Authority:** [Human owner responsible for this document]
**Primary Personas:** [List of Personas that draw on this document]

---

## Purpose

[2–5 sentences. What question does this document answer?
Who uses it and for what? What is it explicitly NOT for?]

---

## Scope

### This document covers:
- [Topic 1]
- [Topic 2]
- [Topic 3]

### This document does NOT cover:
- [Excluded topic 1] → See `[Document reference]`
- [Excluded topic 2] → See `[Document reference]`

### Applicable context:
- Geographic scope: [e.g., Thailand only | Global]
- Temporal scope: [e.g., As of YYYY-MM-DD | Tax year YYYY | Evergreen]
- Audience scope: [e.g., Individual clients | Internal AI agents | Both]

---

## Definitions

**[Term 1]:** [Definition — precise, unambiguous, plain language]

**[Term 2]:** [Definition]

**[Acronym]:** [Full form] — [Definition if not self-evident]

*For additional terms, see `30_KB_RF_Glossary.md`.*

---

## Core Concepts

### [Concept 1 Name]
[Clear explanation — 2–5 sentences]
[Why this concept matters for the domain]

### [Concept 2 Name]
[Explanation]
[Relationship to Concept 1, if applicable]

### [Concept 3 Name]
[Explanation]

[Add concepts as needed. Aim for 3–7 core concepts.]

---

## Detailed Information

### [Subsection 1 — most important or most frequently referenced]

[Substantive content. Use tables for structured data.
Cite sources inline: *(Source: [Name], [Date])*]

### [Subsection 2]

[Content]

### [Subsection 3]

[Content]

[Add subsections as needed to cover the full scope.]

---

## Rules and Constraints
[Conditional — required for Regulatory, Product, and Domain categories]

### Hard Rules
- [Rule 1]: [Statement] *(Source: [Reference])*
- [Rule 2]: [Statement] *(Source: [Reference])*

### Soft Rules / Best Practices
- [Rule 1]: [Statement] — [Exception condition if applicable]

### Numerical Limits and Thresholds
| Item | Limit / Value | Effective Date | Source |
|------|--------------|---------------|--------|
| [Item] | [Value] | [Date] | [Source] |

---

## Worked Examples
[Conditional — required when application of this knowledge is non-obvious]

### Example 1 — [Scenario name]
**Situation:** [Brief description]
**Relevant knowledge applied:** [Which sections]
**Application:** [Step-by-step]
**Result:** [Outcome]
**Note:** [Caveats or limitations]

### Example 2 — [Scenario name]
[Same structure]

### Boundary Example — [When this knowledge applies in a non-obvious way]
[Same structure — emphasize the edge case]

### Non-Application Example
**Situation:** [Description]
**Why this document does not apply:** [Explanation]
**What to use instead:** `[Document reference]`

---

## Common Questions
[Conditional — required for Customer and Domain categories]

**Q: [Question as a user would naturally ask it]**  
A: [Answer — direct, plain language]

**Q: [Question]**  
A: [Answer]

**Q: [Question]**  
A: [Answer]

---

## Assumptions

This document assumes:

1. **[Assumption name]:** [Statement of what is assumed]  
   *Risk if wrong:* [Impact]

2. **[Assumption name]:** [Statement]  
   *Risk if wrong:* [Impact]

3. **Standard assumption (all documents):** The information in this document was accurate
   as of the Last Reviewed date. Changes in law, regulation, product terms, or market
   conditions after that date are not reflected unless explicitly noted.

---

## Related Knowledge

### Prerequisite Documents
- `[Document name]` — [Why it should be read first]

### Companion Documents
- `[Document name]` — [How it complements this document]

### Documents This One References
- `[Document name]`, Section [X] — [What is referenced]

### Documents That Reference This One
- `[Document name]` — [How it uses this document]

### Superseded Documents
- [None] ← or: `[Document name]` (Archived [date]) — [What changed]

---

## Dependencies
[Conditional — required when this document's validity depends on external factors]

| Dependency | Type | Impact If Changed |
|-----------|------|------------------|
| [Dependency name] | [Legal | Product | Data | System] | [Section affected + impact] |

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0.0 | [YYYY-MM-DD] | [Author] | Initial document |
```

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | 2026-06-25 | Chief Knowledge Architect | Initial Knowledge Standard — 9 Parts, 9 Knowledge Categories, 13 required document sections, lifecycle framework, 4 worked examples, and reusable template |

---

*This document is the standard governing all Knowledge Base documents within AIOS (Layer 7). It is governed by Layers 1–6 of the AIOS architecture. Any Knowledge Base document that does not comply with this standard is not a valid AIOS knowledge artifact and may not be referenced by Personas, Skills, or Workflows until it is brought into compliance.*
