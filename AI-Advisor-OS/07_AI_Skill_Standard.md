# AI Skill Standard
### Universal Standard for All AI Skills within AIOS
**Version:** 1.0  
**Effective Date:** 2026-06-25  
**Status:** Active  
**Authority:** Chief Capability Architect  
**Document Type:** Architectural Standard  
**Applies To:** All Skill documents within AIOS (Layer 8)  

---

## Purpose of This Document

This document defines the universal standard that every AI Skill within AIOS must follow.

It is not a Skill. It does not perform financial analysis, generate content, calculate taxes, or execute any other bounded capability. Those capabilities belong in individual Skill documents created using this standard.

This document defines **what a Skill is, how it must be structured, how it integrates with other AIOS components, how it is maintained, and how Skills compose into larger capabilities** — so that the Skill layer of AIOS remains precise, reusable, and trustworthy at any scale.

### What This Document Contains

**Part I** — The role of Skills within AIOS and how they differ from Personas, Knowledge, Workflows, and Runtime  
**Part II** — Skill categories and when to use each  
**Part III** — Standard structure for every Skill document  
**Part IV** — Skill lifecycle  
**Part V** — Skill composition and orchestration  
**Part VI** — Integration with AIOS components  
**Part VII** — Quality standards  
**Part VIII** — Worked examples across multiple domains  
**Part IX** — Reusable Markdown template  

---

## Relationship to AIOS Foundation

Skills occupy **Layer 8** of the AIOS architecture, as defined in `04_AI_Constitution.md`. They are governed by all layers above them.

```
Layer 1: AI Vision          → Skills serve the organizational mission
Layer 2: AI Principles      → All 15 Principles govern Skill execution
Layer 3: AI Constitution    → Skill governance rules Sk1–Sk4
Layer 4: Process Layer      → Decision Framework + Context Framework govern how Skills are invoked
Layer 5: Runtime Layer      → Claude.md defines operational standards for Skill use
Layer 6: Persona Layer      → Personas invoke Skills; Skills do not invoke Personas
Layer 7: Knowledge Layer    → Skills draw on Knowledge; they do not contain it
                                    ↓
Layer 8: SKILL LAYER        ← This standard governs this layer
                                    ↓
Layer 9: Workflows          → Workflows orchestrate Skill sequences
```

**Critical boundary from `04_AI_Constitution.md`:**

> *"Skills are tools, not agents — they are invoked by Personas within Workflows, not autonomous. Skills execute; they do not decide."*

This boundary is the most important constraint governing Skill design. Every design decision in a Skill document must be consistent with this constraint.

---

# Part I — The Role of Skills within AIOS

## 1.1 What a Skill Is

A Skill is a **reusable, bounded, documented capability** that executes a specific, well-defined type of task within AIOS. Skills are the atomic units of capability — the building blocks from which complex, multi-step AI operations are assembled.

A Skill answers the question: *"Given these specific inputs, how is this specific type of task executed, and what does it produce?"*

| A Skill… | A Skill does NOT… |
|----------|-----------------|
| Accepts defined inputs | Make strategic decisions about whether to execute |
| Executes a defined process | Contain its own judgment about what the user needs |
| Produces defined outputs | Decide which Skill to invoke next |
| Can be invoked by any authorized Persona | Operate autonomously without invocation |
| References Knowledge it needs | Contain domain knowledge |
| Reports failure conditions | Override Principle constraints |

## 1.2 How Skills Differ from Other AIOS Components

This is the most frequently confused distinction within AIOS. The table below makes it explicit.

| Component | Primary Question It Answers | Contains | Does NOT Contain |
|-----------|---------------------------|---------|----------------|
| **Persona** | *Who is the AI in this context? What judgment does it apply?* | Role identity, scope, decision calibration, communication style | Domain facts, executable processes, sequential steps |
| **Knowledge** | *What is true about this domain?* | Verified facts, definitions, frameworks, rules | Recommendations, persona behaviors, executable processes |
| **Workflow** | *What sequence of steps achieves this goal?* | Step sequences, branching logic, orchestration, handoffs | Persona identity, domain facts, capability execution |
| **Skill** | *How is this specific capability executed?* | Inputs, process, outputs, success/failure criteria | Domain facts, persona identity, sequential orchestration |
| **Runtime** | *How does this AI model operate within AIOS?* | Model-specific operational standards, priority rules, escalation thresholds | Domain knowledge, persona identity, capability execution |

### The Four Critical Boundaries

**Skill vs. Persona:**  
A Skill performs a specific capability. A Persona decides *which* capability to invoke, *when*, and *why* — and integrates the Skill's output into a coherent response. The financial analysis Skill performs the analysis. The Financial Planner Persona decides whether the analysis is appropriate for the client's situation, communicates the result, and takes responsibility for the recommendation.

**Skill vs. Knowledge:**  
Knowledge contains facts. A Skill uses facts — it reads them from Knowledge documents, applies them to inputs, and produces outputs. A Tax Calculation Skill uses tax bracket data from `30_KB_RE_ThaiIncomeTax2026.md`. It does not contain the tax bracket data itself.

**Skill vs. Workflow:**  
A Workflow orchestrates a sequence of steps — it calls Skills in a defined order. A Skill is a single step in that sequence. A "Financial Planning Workflow" may invoke a "Needs Analysis Skill," then a "Risk Assessment Skill," then a "Product Recommendation Skill" in sequence. Each Skill is atomic; the Workflow is the composition.

**Skill vs. Runtime:**  
Runtime configuration defines how the AI model operates. A Skill defines what the model executes. Runtime says "always check for Principle violations before producing output." A Skill says "given income and deduction inputs, calculate tax liability using these steps."

## 1.3 Why Skills Matter for AIOS Quality

Skills are the mechanism through which AIOS achieves consistent, testable, reusable capability. Without a Skill layer:

- The same capability would be reimplemented differently by every Persona, producing inconsistent results
- Capabilities could not be tested independently of the Personas that invoke them
- Complex operations could not be built from simpler, proven components
- Changes to how a specific capability works would require updating every Persona that uses it

With a well-designed Skill layer, AIOS achieves:
- **Consistency** — the same capability produces the same type of output regardless of which Persona invoked it
- **Testability** — Skills can be validated independently with defined inputs and expected outputs
- **Reusability** — a Skill designed for one Persona can be used by any Persona with compatible scope
- **Maintainability** — changes to a capability are made in one Skill document, not in every document that uses it

---

# Part II — Skill Categories

AIOS organizes Skills into eleven categories. Each category has a defined purpose, a defined invocation pattern, and distinct characteristics that govern its design.

## Skill Category Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AIOS SKILL CATEGORIES                          │
│                                                                     │
│  ┌──────────────────┐  Examine inputs and extract insights          │
│  │    ANALYSIS      │  Produces: findings, patterns, assessments    │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Build structured plans for future action     │
│  │    PLANNING      │  Produces: plans, schedules, roadmaps         │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Produce new artifacts from inputs            │
│  │    CREATION      │  Produces: documents, content, designs        │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Structure choices and present options        │
│  │DECISION SUPPORT  │  Produces: option matrices, comparisons,      │
│  └──────────────────┘  trade-off analyses                           │
│                                                                     │
│  ┌──────────────────┐  Perform precise numerical operations         │
│  │  CALCULATION     │  Produces: numbers, projections, models       │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Retrieve and synthesize information          │
│  │    RESEARCH      │  Produces: summaries, fact sets, source lists │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Format and deliver messages                  │
│  │ COMMUNICATION    │  Produces: messages, emails, scripts, posts   │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Execute repeatable operational steps         │
│  │   AUTOMATION     │  Produces: completed actions, confirmations   │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Evaluate artifacts against criteria          │
│  │     REVIEW       │  Produces: assessments, scores, feedback      │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Check conformance to rules or standards      │
│  │   VALIDATION     │  Produces: pass/fail, compliance report       │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Convert content from one form to another     │
│  │ TRANSFORMATION   │  Produces: reformatted or restructured output │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Category 1 — Analysis

**Definition:** Skills that examine one or more inputs and extract patterns, insights, assessments, or conclusions that are not immediately visible in the raw inputs.

**When to use:** When the value to be created lies in *interpreting* the inputs — not just reporting them or transforming their format.

**Characteristic inputs:** Raw data, documents, statements, portfolios, behaviors, situations  
**Characteristic outputs:** Findings, risk assessments, needs analyses, pattern reports, gap analyses  
**Naming prefix:** `40_Skill_Analysis_[Domain].md`

**Examples within AIOS:**
- Financial Needs Analysis — given income, expenses, goals, assess protection and savings gaps
- Risk Profile Assessment — given client responses, identify risk tolerance classification
- Competitor Analysis — given competitor data, extract positioning, strengths, and gaps
- Cash Flow Analysis — given income and expense data, identify patterns and capacity

**Design guidance:** An Analysis Skill produces findings — not recommendations. The Persona that invokes it integrates those findings into a recommendation using the Decision Framework. A Skill that says "therefore the client should buy X" has exceeded its boundary.

---

## Category 2 — Planning

**Definition:** Skills that build structured plans — sequences of actions, timelines, resource allocations, or goal roadmaps — from goal and constraint inputs.

**When to use:** When the output is a forward-looking structure that guides action rather than an assessment of a current state.

**Characteristic inputs:** Goals, constraints, timelines, resources, priorities  
**Characteristic outputs:** Plans, roadmaps, schedules, milestone frameworks, content calendars  
**Naming prefix:** `40_Skill_Planning_[Domain].md`

**Examples within AIOS:**
- Financial Plan Structure — given client goals and constraints, produce a structured planning framework
- Content Calendar — given topics, platforms, and cadence, produce a publishing schedule
- Retirement Roadmap — given current age, income, and target retirement, produce milestone structure
- Estate Plan Framework — given assets, beneficiaries, and objectives, produce planning structure

**Design guidance:** A Planning Skill produces structure and sequence — not the judgment behind why those goals matter. Goal prioritization belongs to the Persona + Decision Framework. The Skill's role is to translate established priorities into an organized plan.

---

## Category 3 — Creation

**Definition:** Skills that produce new artifacts — documents, content, communications, templates, or designs — from specified inputs and requirements.

**When to use:** When the output is a new artifact that did not exist before the Skill was invoked, and the Skill's work is to construct that artifact to specification.

**Characteristic inputs:** Topic, audience, purpose, format, tone, source material, length requirements  
**Characteristic outputs:** Reports, proposals, social media posts, summaries, templates, presentations, scripts  
**Naming prefix:** `40_Skill_Creation_[Domain].md`

**Examples within AIOS:**
- Financial Report Generator — produce a client-facing financial summary from analysis data
- Content Creator — produce social media content from topic, persona, and platform inputs
- Proposal Writer — produce a client proposal from needs analysis and product recommendation data
- Meeting Summary Creator — produce a structured summary from raw meeting notes

**Design guidance:** A Creation Skill produces a specific artifact format. The *content* that goes into the artifact comes from other inputs — analysis outputs, knowledge documents, Persona decisions. The Skill's role is to assemble and format. When a Creation Skill requires judgment about what the content should say, that judgment belongs upstream (in the Persona or Decision Framework), not embedded in the Skill.

---

## Category 4 — Decision Support

**Definition:** Skills that structure choices — producing option matrices, comparison frameworks, trade-off analyses, or decision criteria structures that a Persona uses to form a recommendation.

**When to use:** When the Persona's decision requires a systematic comparison of alternatives, and the comparison has a defined structure that can be executed as a repeatable process.

**Characteristic inputs:** Decision criteria, available options, constraints, weightings, user priorities  
**Characteristic outputs:** Option matrices, comparison tables, trade-off summaries, scored alternatives  
**Naming prefix:** `40_Skill_Decision_[Domain].md`

**Examples within AIOS:**
- Product Comparison Matrix — compare insurance products across defined criteria for a specific client profile
- Investment Option Comparison — compare asset allocation options against risk profile and time horizon
- Coverage Gap Analysis — identify gaps between current coverage and required coverage
- Tax Strategy Options — enumerate available tax optimization strategies and their comparative impact

**Design guidance:** Decision Support Skills produce structured input for a decision — not the decision itself. The Persona makes the recommendation; the Skill organizes the landscape. A Decision Support Skill that concludes "Option A is the best choice" has become a Persona. It should instead produce "Option A scores highest on criteria X and Y; Option B scores highest on criteria Z" and leave the conclusion to the Persona.

---

## Category 5 — Calculation

**Definition:** Skills that perform precise, rule-governed numerical operations — producing figures, projections, models, or quantitative outputs from numerical inputs.

**When to use:** When the output is a number or set of numbers derived by applying a defined mathematical or logical formula to defined inputs, and accuracy is verifiable.

**Characteristic inputs:** Numerical values, rates, periods, formulas, base data  
**Characteristic outputs:** Tax liability, insurance premium, investment projection, IRR, coverage amount, savings target  
**Naming prefix:** `40_Skill_Calculation_[Domain].md`

**Examples within AIOS:**
- Tax Liability Calculator — given income, deductions, and applicable rates, calculate net tax liability
- Human Life Value Calculator — given income and retirement horizon, calculate protection need
- Compound Growth Projector — given principal, rate, and period, project future value
- Insurance Premium Estimator — given age, coverage amount, and product terms, estimate premium
- Retirement Savings Calculator — given target amount, timeline, and expected return, calculate required monthly savings

**Design guidance:** Calculation Skills must be deterministic — the same inputs must always produce the same outputs. Every formula, rate, and assumption must be documented in the Skill. Rates that change over time (tax rates, product premiums) must be referenced from the appropriate Knowledge document rather than hardcoded into the Skill. This keeps the Skill valid even when rates change — only the Knowledge document needs updating.

---

## Category 6 — Research

**Definition:** Skills that retrieve, synthesize, and organize information from Knowledge documents or external sources to address a specific information need.

**When to use:** When the task requires systematically gathering and presenting information from multiple sources, rather than applying a formula or framework to known inputs.

**Characteristic inputs:** Research question, scope, source constraints, required depth  
**Characteristic outputs:** Summaries, fact sets, source lists, synthesized briefings, market research reports  
**Naming prefix:** `40_Skill_Research_[Domain].md`

**Examples within AIOS:**
- Regulatory Research — retrieve and synthesize current rules applicable to a specific situation
- Market Research Summary — synthesize available knowledge on a market segment or competitor
- Product Knowledge Brief — compile relevant product information for a specific client need
- Industry Trend Summary — synthesize recent developments in a specific domain

**Design guidance:** Research Skills aggregate and present — they do not interpret for the purpose of making a recommendation. The Persona interprets research findings and integrates them into advice. A Research Skill that starts drawing conclusions from its gathered material is encroaching on the Persona's function. However, Research Skills may and should structure their output to highlight the most relevant findings for the stated context.

---

## Category 7 — Communication

**Definition:** Skills that format, adapt, and deliver messages — translating content into specific communication formats, tones, and channels.

**When to use:** When the value is in how something is said — the format, tone, channel adaptation, length, or language — rather than in determining what should be said.

**Characteristic inputs:** Core message, audience, channel, tone requirements, length constraints  
**Characteristic outputs:** Social media posts, emails, client letters, scripts, LINE messages, presentation scripts  
**Naming prefix:** `40_Skill_Communication_[Domain].md`

**Examples within AIOS:**
- Social Media Formatter — adapt a core message to platform-specific format and tone (Facebook, TikTok, LINE)
- Client Email Writer — format an advisory summary as a professional client email
- Follow-up Message Generator — produce a follow-up message template for a specific consultation outcome
- Educational Post Creator — format a financial concept explanation as an accessible public post

**Design guidance:** Communication Skills adapt *what the Persona has already decided to say*. They are the last mile — taking a Persona's determined content and fitting it to a specific format or channel. A Communication Skill should not decide *what* the message should say. When a Communication Skill is being asked to determine the content as well as the format, the task has been improperly scoped.

---

## Category 8 — Automation

**Definition:** Skills that execute defined, repeatable operational actions — performing a step or set of steps that would otherwise require manual execution.

**When to use:** When the task is well-defined, the steps are repeatable, the inputs are consistent, and the value is in reliable execution rather than in judgment.

**Characteristic inputs:** Trigger conditions, data inputs, target systems or formats  
**Characteristic outputs:** Completed actions, confirmations, logs, structured data outputs  
**Naming prefix:** `40_Skill_Automation_[Domain].md`

**Examples within AIOS:**
- Document Population — populate a template document from structured data inputs
- Data Formatter — transform raw data into a defined structured format
- Checklist Executor — work through a defined checklist and confirm completion of each item
- Report Scheduler — produce a recurring report on a defined schedule from defined inputs

**Design guidance:** Automation Skills are the most mechanical Skills in AIOS — they are closest to pure execution. Their design must be especially precise because they are most likely to be invoked in high-volume, low-oversight contexts. Every Automation Skill must define its failure handling explicitly — what happens when an input is missing, malformed, or out of range. Automation Skills that involve consequential external actions (sending communications, creating records) must include a confirmation step before execution.

---

## Category 9 — Review

**Definition:** Skills that evaluate an existing artifact against a defined set of criteria and produce an assessment, score, or structured feedback.

**When to use:** When an artifact exists and the task is to evaluate its quality, completeness, appropriateness, or effectiveness against known standards.

**Characteristic inputs:** Artifact to be reviewed, evaluation criteria, context, standards reference  
**Characteristic outputs:** Assessment report, scored rubric, structured feedback, improvement recommendations  
**Naming prefix:** `40_Skill_Review_[Domain].md`

**Examples within AIOS:**
- Financial Plan Review — evaluate a proposed financial plan against standard completeness and suitability criteria
- Content Quality Review — evaluate a piece of content against brand, tone, and effectiveness criteria
- Proposal Review — evaluate a client proposal against persuasiveness, accuracy, and completeness standards
- Resume Review — evaluate a resume against position requirements and presentation standards

**Design guidance:** Review Skills assess against criteria — they do not make judgments that go beyond those criteria. A Review Skill that produces "this plan is good" without reference to the criteria against which it was assessed has failed its design standard. Every finding in a Review Skill's output must trace to a specific criterion. When a Review Skill must *determine* the criteria (not just apply them), the criteria-determination is a Planning or Decision Support Skill that should be invoked upstream.

---

## Category 10 — Validation

**Definition:** Skills that check conformance of a document, data set, plan, or process against a defined rule set or standard, producing a pass/fail or compliance status.

**When to use:** When the question is binary or categorical — does this artifact comply with this standard? — rather than qualitative (how good is this?).

**Characteristic inputs:** Item to be validated, applicable ruleset or standard, threshold definitions  
**Characteristic outputs:** Pass/fail determination, compliance report, specific violations identified, remediation required  
**Naming prefix:** `40_Skill_Validation_[Domain].md`

**Examples within AIOS:**
- Document Standard Compliance — check that a new AIOS document follows the required standard
- Principles Compliance Check — check that a proposed recommendation does not violate any AI Principle
- Product Eligibility Validation — check that a client meets the eligibility criteria for a specific product
- Data Completeness Validation — check that all required fields in a data set are present and correctly formatted

**Design guidance:** Validation Skills are the most objective Skills in AIOS — their output should be reproducible by any party applying the same rules to the same input. Avoid Validation Skills that require judgment. If a check requires judgment, it is a Review Skill, not a Validation Skill. Validation Skills must document every rule they check so that their outputs can be audited.

---

## Category 11 — Transformation

**Definition:** Skills that convert existing content from one form to another — restructuring, reformatting, translating, summarizing, or expanding without altering the underlying meaning.

**When to use:** When the primary value is in changing the form, structure, or accessibility of content that already exists, rather than creating new content or analyzing existing content.

**Characteristic inputs:** Source content, target format or structure, transformation requirements  
**Characteristic outputs:** Reformatted document, translated text, compressed summary, structured extraction  
**Naming prefix:** `40_Skill_Transform_[Domain].md`

**Examples within AIOS:**
- Financial Data Structurer — transform raw financial inputs into a standard structured format
- Summary Generator — compress a long document into a defined summary structure
- Language Simplifier — convert technical language into accessible plain language
- Format Converter — convert content between formats (e.g., prose to table, table to narrative)

**Design guidance:** Transformation Skills change form, not meaning. A Transformation Skill that adds interpretation, judgment, or new information during transformation has become a Creation or Analysis Skill. The test: if the transformed output contains information that was not in the input, the Skill has exceeded its Transformation boundary. When summarization requires judgment about what is important, it crosses into Analysis territory — be explicit about which function the Skill is performing.

---

# Part III — Standard Skill Structure

Every Skill document within AIOS must follow this structure, in this section order. Sections marked **[Required]** must be present in every Skill. Sections marked **[Conditional]** are required when their stated condition applies.

---

## Section S1 — Skill Header **[Required]**

**Purpose:** Identifies the document as an AIOS Skill artifact, establishes its administrative metadata, and provides the essential information an orchestrating Persona or Workflow needs before invoking the Skill.

```markdown
# [Skill Name]
### AIOS Skill — [Category Name]
**Skill ID:** 40_Skill_[Category]_[Name]
**Version:** [X.Y.Z]
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Status:** [Draft | Active | Deprecated | Retired]
**Skill Category:** [Analysis | Planning | Creation | Decision Support | Calculation | Research | Communication | Automation | Review | Validation | Transformation]
**Authority Level:** Layer 8 — executes under Persona authorization
**Authorized Personas:** [List of Personas permitted to invoke this Skill]
**Estimated Execution Complexity:** [Low | Medium | High]
```

**Design notes:**
- `Authorized Personas` may be set to "Any authorized Persona" if the Skill is universally available
- `Estimated Execution Complexity` guides Personas and Workflows in resource planning — a High complexity Skill in a simple task context may indicate the wrong Skill has been selected
- The Skill ID must match the document file name exactly

---

## Section S2 — Purpose **[Required]**

**Purpose:** States what this Skill does and why it exists within AIOS. Must be specific enough that any Persona reading it can immediately determine whether this Skill is relevant to the current task.

**Required content:**
- What specific capability this Skill provides
- What type of problem it solves
- What it explicitly does NOT do

**Length:** 2–5 sentences. Brevity matters — this section is read during context selection to determine Skill relevance.

**Format:**

```markdown
## Purpose

This Skill [does X]. It is designed for [situations where Y]. It does NOT [common
misconception about scope — boundary clarification].
```

---

## Section S3 — Business Objective **[Required]**

**Purpose:** Connects the Skill to the organizational outcomes it contributes to. Ensures every Skill can be justified in terms of the value it creates for the humans the organization serves, not merely its technical function.

**Required content:**
- The specific business outcome this Skill supports
- The organizational principle or goal it serves
- The customer benefit that is enabled when this Skill is executed well

**Why this section exists:** Skills that cannot articulate their business objective have no business being in AIOS. This section is also a design check — if the Skill's purpose cannot be connected to a meaningful business outcome, the Skill may be designed at the wrong level of abstraction.

---

## Section S4 — Inputs **[Required]**

**Purpose:** Defines precisely what the Skill requires to execute. Input clarity is the primary enabler of Skill reusability — a Skill with vague inputs cannot be reliably invoked.

**Required content:**

```markdown
## Inputs

### Required Inputs
| Input | Type | Description | Example |
|-------|------|-------------|---------|
| [Input name] | [Data type / format] | [What it is and why it is needed] | [Example value] |

### Optional Inputs
| Input | Type | Description | Default if Absent |
|-------|------|-------------|------------------|
| [Input name] | [Type] | [Description] | [Default behavior] |

### Input Validation Rules
- [Input 1]: [Validation rule — what constitutes a valid value]
- [Input 2]: [Validation rule]
```

**Design guidance:**
- Every required input must be truly required — if the Skill can execute without it, it is optional
- Every optional input must define a default behavior — what happens when it is absent
- Input types should be as specific as possible: "monetary amount in THB" rather than "number"
- If two Personas would provide the same input in different formats, standardize the format in this section

---

## Section S5 — Required Context **[Required]**

**Purpose:** Identifies the AIOS context categories (as defined in `03_AI_Context_Framework.md`) that the Skill requires to be assembled before execution. Skills do not assemble context independently — they declare what they need and the invoking Persona or Workflow ensures it is available.

**Required content:**

```markdown
## Required Context

| Context Category | Required Fields | Purpose |
|-----------------|----------------|---------|
| [Category name] | [Specific fields needed] | [Why this context is needed] |
```

**Context categories available (from `03_AI_Context_Framework.md`):**
Core Context, Persona Context, Domain Context, User Context, Project Context, Task Context, Historical Context, External Context

**Design guidance:** Skills should declare the minimum context they need — not a superset. Over-declaring context creates unnecessary dependency and slows invocation. Under-declaring context creates Skills that produce outputs based on incomplete information.

---

## Section S6 — Required Knowledge **[Required]**

**Purpose:** Identifies the Knowledge Base documents this Skill draws upon. Skills do not contain domain knowledge — they reference it. This section ensures that the Knowledge required for accurate Skill execution is explicitly declared.

**Required content:**

```markdown
## Required Knowledge

| Knowledge Document | Sections Used | Freshness Requirement |
|-------------------|--------------|----------------------|
| `30_KB_[Document].md` | [Specific sections] | [Current / Within 90 days / Annual review] |
```

**Design guidance:**
- If a required Knowledge document is stale or missing, the Skill must not execute without flagging this condition
- Knowledge sections should be as specific as possible — "Section K6, Tax Brackets table" rather than the entire document
- When no Knowledge is required (rare, for purely logical Skills), state "No Knowledge documents required — this Skill applies logic to inputs only"

---

## Section S7 — Required Persona **[Required]**

**Purpose:** Specifies whether this Skill requires a specific Persona context to execute, or whether it is persona-independent.

**Most Skills are persona-independent** — designed to be invoked by any Persona with appropriate authorization. Some Skills, however, require the invoking Persona to provide domain judgment at a specific point in the process, making them persona-dependent by design.

**Required content:**

```markdown
## Required Persona

**Persona Independence:** [Independent — any authorized Persona may invoke | Dependent — requires specific Persona context]

**If Persona-Dependent:**
- Required Persona type: [Persona name or category]
- Why: [Specific judgment this Persona must provide during Skill execution]
- Boundary: [Where Persona judgment ends and Skill execution begins]
```

---

## Section S8 — Preconditions **[Required]**

**Purpose:** States the conditions that must be true before this Skill can be invoked. Preconditions are checks that belong before the Skill begins, not within the Skill's process.

**Required content:**

```markdown
## Preconditions

All of the following must be true before this Skill may be invoked:

1. [Precondition 1] — [Consequence if false]
2. [Precondition 2] — [Consequence if false]
3. All required inputs are present and validated
4. All required Knowledge documents have status Active and are within freshness thresholds
5. The invoking Persona has confirmed this Skill is appropriate for the current task context
6. No AI Principle violation would result from executing this Skill in the current context
```

**Design guidance:** Preconditions are gates, not steps. If a precondition is false, the Skill does not execute — the invoking Persona must resolve the condition first. Do not include in Preconditions anything that the Skill itself resolves during execution.

---

## Section S9 — Process **[Required]**

**Purpose:** Defines the step-by-step execution of the Skill. This is the Skill's core definition — the sequence of actions that transforms inputs into outputs.

**Required content:**

```markdown
## Process

### Step 1 — [Step name]
**Action:** [What happens in this step]
**Input used:** [Which inputs this step consumes]
**Output of this step:** [What this step produces]
**Decision point:** [If this step involves a decision — see Section S10]

### Step 2 — [Step name]
[Same structure]

[Continue for all steps]

### Process Summary
```
Input → [Step 1] → [Step 2] → [Step N] → Output
```
```

**Design guidance:**
- Steps must be ordered — the output of each step is available to subsequent steps
- Steps should be atomic — a step should do one thing
- Steps must not contain judgment that belongs to a Persona — if a step requires "determine whether this is appropriate," the Skill has been invoked too early
- Steps that depend on external systems must identify those dependencies explicitly
- The Process must be executable without ambiguity — a new Persona reading the Process must be able to execute it without additional clarification

---

## Section S10 — Decision Points **[Conditional — required when the process contains branches]**

**Purpose:** Documents every point in the Process where the execution path may diverge based on a condition. Decision points are explicit — implicit branching is an architectural error.

**Required content:**

```markdown
## Decision Points

### Decision Point D1 — [Name]
**Location:** After Step [N]
**Condition:** [What is evaluated]
**If true:** [Action or path]
**If false:** [Action or path]
**Who decides:** [The Skill's defined logic | The invoking Persona | A Validation Skill]

### Decision Point D2 — [Name]
[Same structure]
```

**Critical rule:** A Decision Point where "who decides" is "the Persona" means the Skill must pause and surface the decision to the Persona — it does not mean the Skill makes a Persona-level judgment internally. Skills that make Persona-level decisions autonomously violate the Layer 8 boundary.

---

## Section S11 — Outputs **[Required]**

**Purpose:** Defines precisely what the Skill produces when it executes successfully. Output definition is the primary mechanism for quality control — it makes the Skill's results verifiable.

**Required content:**

```markdown
## Outputs

### Primary Output
**Format:** [Structure or format of the output]
**Content:** [What the output contains]
**Example:** [Illustrative example of a well-formed output]

### Secondary Outputs (if applicable)
[Same structure for any additional outputs]

### Output Validation
Before passing output to the invoking Persona or Workflow, confirm:
- [ ] [Validation check 1]
- [ ] [Validation check 2]
- [ ] Output does not contain recommendations that should come from the Persona
- [ ] Output does not contain information not derived from the inputs and Knowledge
```

---

## Section S12 — Success Criteria **[Required]**

**Purpose:** Defines the measurable conditions that determine whether the Skill has executed successfully. Success Criteria are the basis for Skill testing and continuous improvement.

**Required content:**

```markdown
## Success Criteria

A Skill execution is successful when:

1. **Completeness:** All declared outputs are present and non-empty
2. **Accuracy:** [Domain-specific accuracy standard — e.g., "all calculations traceable to input values and Knowledge-sourced formulas"]
3. **Relevance:** Output directly addresses the stated input requirements
4. **Boundary compliance:** Output does not contain Persona-level recommendations or judgments
5. **Principles compliance:** No AI Principle has been violated in producing the output
6. [Skill-specific criterion 1]
7. [Skill-specific criterion 2]
```

---

## Section S13 — Limitations **[Required]**

**Purpose:** States explicitly what this Skill cannot do, what situations it is not designed for, and where its outputs may be unreliable. Limitations protect against misuse and set appropriate expectations.

**Required content:**

```markdown
## Limitations

This Skill:

- **Cannot** [limitation 1] — [Consequence of attempting to use Skill beyond this boundary]
- **Cannot** [limitation 2]
- **Produces unreliable output when** [condition] — [Why and what to do instead]
- **Is not appropriate for** [situation] — [Use [alternative] instead]
- **Does not replace** [related but distinct function]
```

---

## Section S14 — Failure Handling **[Required]**

**Purpose:** Defines how the Skill behaves when it cannot complete successfully — covering every material failure mode and specifying the appropriate response for each.

**Required content:**

```markdown
## Failure Handling

### Failure Mode F1 — [Name]
**Trigger:** [What causes this failure]
**Detection:** [How to recognize this failure has occurred]
**Response:** [What the Skill does — abort, partial output, escalate, request input]
**Communication:** [What the invoking Persona or Workflow must be told]

### Failure Mode F2 — [Name]
[Same structure]

### General Failure Principles
- When a required input is missing: [Default behavior]
- When a required Knowledge document is stale: [Default behavior]
- When a Principles violation would result: [Default behavior — always: abort and report]
- When output confidence is low: [Default behavior]
```

**Design guidance:** A Skill that fails silently — producing a low-quality output without flagging the failure — is worse than a Skill that fails loudly. Prefer explicit failure over silent degradation. When in doubt about output quality, the Skill should surface its uncertainty to the invoking Persona rather than presenting a questionable output as reliable.

---

## Section S15 — Related Skills **[Required]**

**Purpose:** Maps this Skill to other Skills in AIOS that are complementary, frequently co-invoked, or that handle adjacent use cases. Enables Workflow designers to build complete capability chains efficiently.

**Required content:**

```markdown
## Related Skills

### Skills Frequently Invoked Before This One
| Skill | Why It Precedes This Skill |
|-------|--------------------------|
| `40_Skill_[Name].md` | [Its output is typically an input to this Skill] |

### Skills Frequently Invoked After This One
| Skill | Why It Follows This Skill |
|-------|--------------------------|
| `40_Skill_[Name].md` | [This Skill's output is typically an input to it] |

### Alternative Skills (when this one is not appropriate)
| Skill | When to Use It Instead |
|-------|----------------------|
| `40_Skill_[Name].md` | [Scenario where that Skill is more appropriate] |

### Skills This One Composes (if this is a composite Skill)
| Skill | Role in Composition |
|-------|-------------------|
| `40_Skill_[Name].md` | [What it contributes] |
```

---

## Section S16 — Dependencies **[Required]**

**Purpose:** Identifies all external components, systems, and conditions that this Skill's execution depends upon. When a dependency changes, this Skill may need to be reviewed and updated.

**Required content:**

```markdown
## Dependencies

| Dependency | Type | Impact If Changed |
|-----------|------|-----------------|
| `30_KB_[Document].md` | Knowledge | [Section affected] |
| `04_AI_Constitution.md`, Layer 8 boundaries | Architectural | Skill boundary definition |
| [External system or API] | System | [Affected process steps] |
| [Regulatory rule] | Regulatory | [Affected calculation or criteria] |
```

---

## Section S17 — Version History **[Required]**

**Purpose:** Complete record of all changes to this Skill. Every change — however minor — must be logged here.

**Required format:**

```markdown
## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0.0 | YYYY-MM-DD | [Author] | Initial Skill definition |
| 1.1.0 | YYYY-MM-DD | [Author] | [What changed and why] |
```

**Versioning rules for Skills:**

| Change Type | Version Impact |
|-------------|---------------|
| Correction of error in process or output | Patch: X.Y.Z+1 |
| Addition of optional input or failure mode | Minor: X.Y+1.0 |
| Change to required inputs or outputs | Major: X+1.0.0 |
| Change to process that affects output | Major: X+1.0.0 |
| Deprecation | Note in header + Version History |

---

# Part IV — Skill Lifecycle

## 4.1 Lifecycle Stages

```
PROPOSED
  ↓
DRAFT
  ↓
REVIEW
  ↓
ACTIVE ──────────────────────────────────────┐
  ↓                                          │
IMPROVED (minor/major update in progress)    │ (if update validates successfully)
  ↓                                          │
ACTIVE (new version) ────────────────────────┘
  ↓
DEPRECATED (confirmed: use is discouraged; replacement available)
  ↓
RETIRED (removed from active Skill Index; archived)
```

## 4.2 Design Process

**Stage 1 — Need Identification**

A Skill need is identified when a Persona or Workflow requires a bounded capability that:
- Recurs across multiple tasks or clients
- Would be executed inconsistently without a defined process
- Is complex enough that ad hoc execution produces variable quality
- Would be executable by any Persona with domain access, not just one

Document the need:
```
Capability needed:     [What the Skill should do]
Category:              [Which Skill category it fits]
Requested by:          [Persona or Workflow that identified the need]
Frequency of need:     [How often this capability will be invoked]
Boundary from Persona: [What the Persona will decide; what the Skill will execute]
```

**Stage 2 — Skill Author Assignment**

A human Skill Author (domain expert or Capability Architect) is assigned. AI agents may assist in structuring and drafting the Skill, but the Skill's process steps and success criteria must be validated by a human with domain expertise before the Skill is activated.

**Stage 3 — Draft Creation**

Using the template in Part IX, the author creates the Skill draft. Every section must be completed — partially defined Skills cannot be activated. When a section does not apply, the reason must be stated; the section may not simply be omitted.

**Stage 4 — Boundary Review**

The Skill draft is reviewed against the four critical boundaries (Skill vs. Persona, Skill vs. Knowledge, Skill vs. Workflow, Skill vs. Runtime). A Skill that blurs any of these boundaries must be restructured before proceeding.

Boundary review questions:
- Does the Skill make any judgment that belongs to a Persona? → If yes, move that judgment upstream
- Does the Skill contain domain knowledge that belongs in a Knowledge document? → If yes, extract to Knowledge; reference it
- Does the Skill orchestrate multiple capabilities that should be a Workflow? → If yes, decompose into atomic Skills + Workflow
- Does the Skill specify model-specific behavior? → If yes, that belongs in Runtime (Claude.md), not the Skill

**Stage 5 — Principles Compliance Review**

The Skill's process and outputs are reviewed against all 15 AI Principles. Particular attention to:
- Principle 3 (Truth) — does the Skill produce outputs that could be misleading?
- Principle 14 (Decision Hierarchy) — does the Skill follow the correct priority order?
- Principle 15 (No Short-Term Sales Optimization) — does the Skill serve the client's interest?

**Stage 6 — Test Execution**

Before activation, the Skill must be tested with at minimum:
- Two standard-case inputs (typical use)
- One edge-case input (boundary condition)
- One failure-case input (missing required input, stale Knowledge)

Outputs are evaluated against the defined Success Criteria.

**Stage 7 — Activation**

Status is set to Active. The Skill is added to the Skill Index (`40_Skill_Index.md`). The `Effective Date` and `Last Reviewed` date are set to the activation date. Authorized Personas are notified that the Skill is available.

## 4.3 Review and Improvement Process

**Scheduled review:**

Every Active Skill is reviewed:
- Annually as a minimum
- When any Knowledge document it depends on is updated
- When a Persona reports inconsistent or low-quality outputs from the Skill
- When the domain it operates in changes materially

Review scope:
- Confirm all process steps are still appropriate
- Confirm all Knowledge references are still valid and current
- Confirm Success Criteria are still measurable
- Confirm Limitations accurately reflect current constraints
- Test with current inputs to confirm output quality

**Event-driven review:**

Triggered immediately when:
- A required Knowledge document is updated (check if the update affects this Skill's process)
- A Principles change occurs (check compliance)
- A Persona reports a Skill failure or unexpected output
- A regulatory change affects the domain this Skill operates in

## 4.4 Deprecation and Retirement

**Deprecation** occurs when:
- A superior replacement Skill has been activated
- The use case the Skill addressed is no longer relevant
- The Skill's Knowledge dependencies have become permanently unavailable

**Deprecation process:**
1. Set Status to `Deprecated`
2. Add deprecation notice at top of document:

```markdown
> **DEPRECATED:** This Skill was deprecated on [date].
> **Reason:** [Why it was deprecated]
> **Replaced by:** `[Replacement Skill name]` (if applicable)
> **Effect:** Invoking this Skill after [date] will produce a deprecation warning.
>             Personas should migrate to [replacement] by [date].
```

3. Update Skill Index
4. Notify Personas that reference this Skill — update their Authorized Skills tables

**Retirement** occurs after a transition period of at least 90 days following deprecation. The Skill document is moved to `_archive/`. It is never deleted — archived Skills preserve institutional knowledge about why capabilities were built and why they were replaced.

---

# Part V — Skill Composition

## 5.1 What Composition Is

Skill composition is the practice of building complex, multi-step capabilities from simpler, proven atomic Skills. Rather than creating a single large Skill that handles an entire complex process, composition assembles atomic Skills into a capability chain, typically orchestrated by a Workflow.

**Why composition is preferred over large monolithic Skills:**

| Monolithic Skill | Composed Skills |
|----------------|----------------|
| Hard to test independently | Each atomic Skill is independently testable |
| Failures are hard to isolate | Failures are traceable to a specific Skill |
| Changes affect the entire process | Changes to one Skill do not affect others |
| Cannot reuse components in other contexts | Each atomic Skill is reusable independently |
| Version changes require full revalidation | Only changed Skills need revalidation |

## 5.2 Composition Patterns

### Pattern C1 — Sequential Chain
The most common pattern. Skills are executed in sequence, where the output of each Skill is an input to the next.

```
[Input] → Skill A → [Intermediate Output A] → Skill B → [Intermediate Output B] → Skill C → [Final Output]
```

**Example:**
```
[Client data] 
  → Needs Analysis Skill (Analysis)
  → [Needs assessment]
  → Risk Profile Skill (Analysis)
  → [Risk profile]
  → Product Comparison Skill (Decision Support)
  → [Option matrix]
  → Proposal Writer Skill (Creation)
  → [Client proposal]
```

### Pattern C2 — Parallel Execution
Multiple Skills execute simultaneously on the same input, with their outputs merged.

```
           → Skill A → [Output A] ─┐
[Input] ──►→ Skill B → [Output B] ─┤ → [Merged Output]
           → Skill C → [Output C] ─┘
```

**Example:**
```
[Client financial profile]
  → Tax Liability Calculator (Calculation) → [Tax position]
  → Investment Projection Skill (Calculation) → [Growth projection]
  → Coverage Gap Analysis (Decision Support) → [Protection gaps]
  → [All three outputs] → Financial Plan Creator (Creation) → [Complete plan]
```

### Pattern C3 — Conditional Branch
Execution follows different Skill paths based on a condition.

```
[Input] → Validation Skill → [Result]
                           → If Pass: Skill A → [Output A]
                           → If Fail: Skill B → [Output B / Error handling]
```

**Example:**
```
[Client data]
  → Eligibility Validation Skill
    → If Eligible: Product Recommendation Skill → [Recommendation]
    → If Not Eligible: Alternative Options Skill → [Alternative options]
```

### Pattern C4 — Loop (Iterative)
A Skill executes repeatedly until a condition is met.

```
[Input] → Skill A → [Output] → [Condition check] → If not met: back to Skill A
                             → If met: [Final Output]
```

**Use sparingly.** Loops are appropriate when the number of iterations is data-driven and bounded. Unbounded loops must define a maximum iteration count.

## 5.3 Orchestration Principles

**O1 — Workflows own orchestration:**  
Composition logic — which Skill to invoke, in what order, with what inputs — belongs in Workflows (Layer 9), not in Skills. A Skill that invokes another Skill is performing orchestration and has exceeded its boundary.

**O2 — Atomic Skills before composite:**  
Before creating a composite Skill (a Skill that wraps multiple Skills), confirm that a Workflow would not be more appropriate. Composite Skills are justified only when the composition is truly reusable as a unit — invoked together reliably enough that wrapping them creates more value than composing them in a Workflow.

**O3 — Output contracts are strict:**  
When Skills are composed, each Skill's output must precisely match the next Skill's input requirements. Mismatches are not resolved by the orchestrating Workflow — they are design errors that must be corrected in the Skill definitions.

**O4 — Failure propagates explicitly:**  
When a Skill in a composition fails, it must signal failure explicitly. The orchestrating Workflow must define how to handle that signal — abort, retry, branch, or escalate. Composition does not hide failures.

**O5 — Composition does not change Skill boundaries:**  
A Skill invoked as part of a composition has the same boundaries as when invoked standalone. Composition does not grant a Skill permission to exceed its defined authority. A Calculation Skill in a composition does not make recommendations; a Review Skill in a composition does not generate new content.

---

# Part VI — Integration

## 6.1 Integration with Personas

Skills are the primary mechanism through which Personas exercise their domain capabilities. The integration works as follows:

```
PERSONA RESPONSIBILITY                    SKILL RESPONSIBILITY
─────────────────────────────────────    ─────────────────────────────────────
Understand the user's situation          Receive defined inputs
Determine the True Goal                  Execute the defined process
Gather and assemble context              Apply relevant Knowledge
Identify which Skill(s) to invoke        Produce defined outputs
Validate preconditions are met           Report failures and limitations
Invoke the Skill with correct inputs     Stop at the output boundary
Integrate Skill output with reasoning   
Communicate the result to the user      
Take responsibility for the outcome     
```

**Integration rules:**

**I1 — Personas do not present raw Skill output to users.**  
A Skill's output is material for the Persona's reasoning, not a direct response. The Persona integrates the Skill output with the user's context, prior reasoning, and communication calibration before producing a response.

**I2 — Personas invoke Skills — Skills do not invoke Personas.**  
The authority relationship is one-directional. A Skill may never require a Persona to take a specific action — it may only produce output that a Persona uses.

**I3 — Persona authorization gates Skill access.**  
The Authorized Personas section of each Skill defines which Personas may invoke it. A Persona that is not authorized may not invoke the Skill — even if the Skill's output would be useful. If a Persona regularly needs a Skill it is not authorized for, the authorization should be reviewed — not circumvented.

**I4 — Skill failure does not prevent Persona response.**  
When a Skill fails, the Persona must still respond to the user — acknowledging the limitation and explaining what can be provided without the Skill's output. A Persona that cannot respond because a Skill failed has made itself dependent on a component it should use but not require.

## 6.2 Integration with Knowledge

Skills reference Knowledge documents for the domain facts they need to execute their process. This integration is the mechanism through which Knowledge currency directly affects Skill output quality.

**Integration rules:**

**K1 — Skills declare their Knowledge dependencies explicitly.**  
The Required Knowledge section (S6) must list every Knowledge document the Skill draws upon. Undeclared Knowledge use creates hidden dependencies that cannot be managed.

**K2 — Skills check Knowledge freshness before execution.**  
If a required Knowledge document is Stale or Outdated (as defined in `06_AI_Knowledge_Standard.md`, Part VI), the Skill must flag this condition before executing. The Skill may still execute with a freshness caveat, but it must not execute as if the Knowledge is current when it is not.

**K3 — Skills never contain Knowledge.**  
No domain fact, definition, rate, rule, or regulatory provision belongs inside a Skill document. If it is tempting to embed a fact in a Skill's process steps, that fact belongs in a Knowledge document that the Skill references. The test: if you imagine the fact changing, would you need to update the Skill? If yes, the fact is in the wrong place.

**K4 — Knowledge changes may invalidate Skills.**  
When a Knowledge document is updated, the Skill's dependency must be reviewed. The Skill's process may have been designed around the prior version of the Knowledge. The Skill's review cycle must include reviewing its Knowledge dependencies.

## 6.3 Integration with Workflows

Workflows orchestrate Skills. The relationship is explicit and directional: Workflows invoke Skills; Skills do not invoke Workflows.

**Integration rules:**

**W1 — Workflows define the composition; Skills define the execution.**  
The Workflow specifies which Skills to invoke, in what sequence, with what inputs, and what to do with their outputs. The Skill specifies how a specific capability is executed. These are distinct documents with distinct responsibilities.

**W2 — Skill outputs must be typed for Workflow consumption.**  
When a Skill is designed to be invoked within a Workflow, its output format must be defined precisely enough that the Workflow can pass it to the next step without transformation. If transformation is needed, a Transformation Skill should be inserted explicitly in the Workflow.

**W3 — Workflows own failure orchestration.**  
When a Skill in a Workflow fails, the Workflow defines the response — not the Skill. The Skill signals the failure; the Workflow decides what to do about it. Skills must not embed Workflow-level failure handling.

## 6.4 Integration with the Decision Framework

Skills interact with the Decision Framework at two points:

**Point 1 — Pre-invocation (Stage S8: Apply Principles)**  
Before invoking any Skill, the Persona applies Stage S8 of the Decision Framework: confirming that invoking this Skill in this context does not violate any AI Principle. No Skill may be invoked in a context where its execution would require or produce a Principles violation.

**Point 2 — Post-output (Stage S10: Explain Reasoning)**  
When a Persona presents output derived from a Skill, Stage S10 requires that the reasoning behind the recommendation be explained. The Persona must be able to articulate why the Skill was invoked, what it produced, and how that output informed the recommendation.

## 6.5 Integration with the Context Framework

The Context Framework (`03_AI_Context_Framework.md`) governs how context is assembled before any task. Skills contribute to and draw from this context as follows:

**Drawing from context:**  
The Required Context section (S5) of each Skill declares what context it needs. This declaration is an input to the context assembly process — when a Persona prepares to invoke a Skill, it confirms that the declared context is available.

**Contributing to context:**  
Skill outputs may become part of the Historical Context for subsequent tasks. A completed Financial Needs Analysis is a relevant historical input to the next time the same client's situation is assessed.

**Context does not override Skill boundaries:**  
Even if context strongly suggests a specific conclusion, a Skill may not exceed its defined boundary to produce that conclusion. The Skill produces what it is designed to produce; the Persona integrates context with Skill outputs to form a conclusion.

---

# Part VII — Quality Standards

## 7.1 The Six Quality Dimensions

Every Skill must meet these six quality dimensions at activation and at every subsequent review.

### Dimension 1 — Accuracy

The Skill produces correct outputs when given correct inputs and current Knowledge. Accuracy is domain-specific — a Calculation Skill has a different accuracy standard than a Communication Skill.

**Accuracy requirements:**
- Every process step produces its declared output when given valid inputs
- Calculations are mathematically correct and traceable to inputs and Knowledge-sourced formulas
- No step introduces information not present in the inputs or Knowledge
- Failure modes are correctly detected and reported

**Test:** Run the Skill with known inputs whose correct output is independently verifiable. Does the Skill produce the expected output?

### Dimension 2 — Reusability

The Skill is designed to be invoked by multiple Personas in multiple contexts without modification.

**Reusability requirements:**
- Inputs are defined in terms of data, not Persona-specific formats
- Process steps do not assume a specific Persona context
- The Skill produces the same type of output regardless of which authorized Persona invokes it
- The Skill does not contain references to specific users, clients, or sessions

**Test:** Could this Skill be invoked by two different Personas to solve two different specific instances of the same general problem? If yes, it is reusable. If it only makes sense for one Persona in one specific context, it should be part of that Persona's definition, not a standalone Skill.

### Dimension 3 — Maintainability

The Skill can be updated efficiently when its domain, Knowledge, or process changes.

**Maintainability requirements:**
- Process steps are atomic and labelled — a specific step can be updated without rewriting the entire process
- Knowledge is referenced, not embedded — rate changes require only Knowledge document updates, not Skill updates
- Dependencies are explicitly declared — when a dependency changes, the impact on this Skill is immediately identifiable
- The Version History accurately reflects every change made

**Test:** If the primary Knowledge document this Skill depends on were updated, how many changes would be required in the Skill itself? If the answer is "many," the Skill is over-dependent on Knowledge content that should remain external.

### Dimension 4 — Transparency

The Skill's process is understandable, its outputs are traceable to its inputs and Knowledge, and its limitations are honestly declared.

**Transparency requirements:**
- Process steps are described in plain language — a competent reader can understand what the Skill does without executing it
- Outputs include traceability information — the Persona that integrates the output can explain where it came from
- Limitations explicitly state what the Skill cannot do — no Skill presents itself as capable of more than it is
- Decision points are explicit — no hidden branching logic

**Test:** Could a Persona explain to a user how this Skill produced its output, step by step? If no — if the process is a "black box" — the Skill fails the transparency standard.

### Dimension 5 — Scalability

The Skill performs consistently whether it is invoked once per month or a thousand times per day.

**Scalability requirements:**
- Process steps do not depend on state that accumulates across invocations
- No Skill stores persistent data from one invocation to use in a subsequent invocation (that is a Workflow or system function)
- Performance is consistent regardless of invocation frequency

**Test:** Would this Skill produce the same quality output for invocation #1 as for invocation #1000? If performance would degrade or behavior would change, a scalability issue exists.

### Dimension 6 — Consistency

The Skill produces the same type of output when given the same type of input, regardless of which Persona invoked it, which session it was invoked in, or what time it was invoked.

**Consistency requirements:**
- The same inputs always produce outputs of the same structure and type
- Variation in output is explained by variation in inputs or Knowledge — not by invocation context
- Success Criteria are met consistently, not intermittently

**Test:** Invoke the Skill three times with identical inputs across different sessions. Do the outputs have the same structure and quality? If not, a consistency issue exists.

## 7.2 Quality Review Checklist

Before a Skill is activated or after a major review:

```
BOUNDARY COMPLIANCE
□ Skill does not make Persona-level recommendations or judgments
□ Skill does not contain domain knowledge (only references it)
□ Skill does not orchestrate other Skills (that belongs in Workflows)
□ Skill does not specify model-specific behavior (that belongs in Runtime)

STRUCTURAL COMPLETENESS
□ All 17 sections present and complete (or Conditional sections justified)
□ Every required input is defined with type and validation rule
□ Every optional input defines a default behavior
□ Process steps are atomic and ordered
□ All Decision Points are explicit
□ Failure modes cover all material failure scenarios
□ Success Criteria are measurable

INTEGRATION READINESS
□ Required Context declared using standard Context categories
□ Required Knowledge documents are identified by name and section
□ Related Skills mapped
□ Authorized Personas confirmed

PRINCIPLES COMPLIANCE
□ Execution does not require violation of any AI Principle
□ Output does not mislead (Principle 3)
□ Process follows Decision Hierarchy where applicable (Principle 14)
□ Skill does not optimize for short-term sales over client benefit (Principle 15)

LIFECYCLE READINESS
□ Version 1.0.0 set
□ Effective Date and Last Reviewed set to activation date
□ Skill added to Skill Index (40_Skill_Index.md)
□ Authorized Personas' documents updated to reference this Skill
```

---

# Part VIII — Worked Examples

## Example 1 — Calculation Skill: Tax Liability Calculator

**Skill ID:** `40_Skill_Calculation_TaxLiability`  
**Category:** Calculation  
**Business objective:** Enable accurate tax liability estimation to support SuperTax planning conversations and general tax optimization advice.

**Structure preview:**

```markdown
# Tax Liability Calculator
### AIOS Skill — Calculation
**Status:** Active
**Authorized Personas:** Financial Planner AI, Tax Advisor AI

## Purpose
Calculates estimated personal income tax liability for a Thai individual taxpayer,
given gross income and eligible deductions. Does NOT recommend which deductions to
take — that is a Tax Advisor Persona function. Does NOT account for corporate income
tax, VAT, or non-resident tax status.

## Business Objective
Supports accurate, data-grounded financial planning conversations. Enables the Tax
Advisor Persona to show clients their current tax position and the concrete impact
of deduction strategies in precise numbers.

## Inputs
| Input | Type | Description | Example |
|-------|------|-------------|---------|
| gross_annual_income | Monetary (THB) | Total annual income before deductions | 1,800,000 |
| deductions | Structured list | Eligible deductions by category | [{type: "life_insurance", amount: 100000}] |
| tax_year | Year (YYYY) | Tax year for applicable rates | 2026 |

## Required Knowledge
| Document | Sections | Freshness |
|----------|---------|-----------|
| 30_KB_RE_ThaiIncomeTax2026.md | Tax Brackets table, Deduction Limits table | Must be Current or Aging |

## Process
### Step 1 — Validate deductions against Knowledge limits
For each declared deduction, confirm it does not exceed the limit in the Knowledge
document. Cap at limit; flag if input exceeds limit.

### Step 2 — Calculate total allowable deductions
Sum all validated deductions.

### Step 3 — Calculate taxable income
Taxable income = Gross income − Total allowable deductions

### Step 4 — Apply progressive tax brackets from Knowledge document
Apply each bracket rate to the portion of taxable income within that bracket.
Sum the results to produce gross tax liability.

### Step 5 — Produce output structure
Return: {taxable_income, total_deductions, tax_liability, effective_rate,
         marginal_rate, deductions_detail, knowledge_source, as_of_date}

## Failure Handling
### F1 — Knowledge document stale
Response: Execute with caveat. Output includes: "Tax rates sourced from
[document] last reviewed [date]. Rates should be confirmed for current year."

### F2 — Deduction type not recognized
Response: Exclude from calculation; flag: "Deduction type '[type]' not
recognized in current Knowledge. Excluded from calculation."
```

---

## Example 2 — Analysis Skill: Financial Needs Analysis

**Skill ID:** `40_Skill_Analysis_FinancialNeeds`  
**Category:** Analysis  
**Business objective:** Provide a structured, complete picture of a client's protection and savings gaps before any product recommendation is made. Implements the "Goal First, Product Second" Principle.

**Structure preview:**

```markdown
# Financial Needs Analysis
### AIOS Skill — Analysis

## Purpose
Analyzes a client's financial situation and identifies gaps between their current
position and the level of protection and savings required to achieve their stated
goals. Does NOT recommend products or solutions — it produces a structured gap
assessment that the Financial Planner Persona uses to form recommendations.

## Inputs
| Input | Type | Description |
|-------|------|-------------|
| current_income | Monetary (THB/month) | Current monthly income |
| family_structure | Structured | Spouse (Y/N), children (count, ages) |
| current_assets | Structured list | Asset types and values |
| current_liabilities | Structured list | Liability types and remaining balances |
| current_coverage | Structured list | Existing insurance: type, coverage amount |
| stated_goals | Structured list | Client's declared financial goals with timelines |
| time_horizon_years | Integer | Years to target retirement or primary goal |

## Process
### Step 1 — Calculate Human Life Value (HLV)
HLV = Annual income × Remaining working years, adjusted for existing assets
Reference: 30_KB_DO_FinancialPlanningPrinciples.md, Section: HLV Framework

### Step 2 — Identify protection gap
Protection gap = HLV − Current life coverage

### Step 3 — Calculate income replacement need
Income replacement = Monthly income × 12 × Years to retirement

### Step 4 — Assess health coverage adequacy
Compare current health coverage to standard adequacy criteria
Reference: 30_KB_DO_InsurancePrinciples.md, Section: Adequate Coverage Standards

### Step 5 — Calculate education funding need (if children present)
For each child: years to university × estimated annual cost (from Knowledge)
Reference: 30_KB_RF_EducationCostReference.md

### Step 6 — Calculate retirement funding gap
Target retirement fund − Current projected savings at retirement = Gap

### Step 7 — Produce structured gap assessment
Return: {hlv, protection_gap, health_coverage_status, education_gap,
         retirement_gap, priority_ranking, knowledge_sources}

## Success Criteria
1. All six gap categories assessed (or explicitly flagged as "not applicable")
2. All figures traceable to inputs and Knowledge-sourced formulas
3. No recommendation produced — output is assessment only
4. Priority ranking present based on standard planning hierarchy
```

---

## Example 3 — Creation Skill: Social Media Content Creator

**Skill ID:** `40_Skill_Creation_SocialMediaContent`  
**Category:** Creation  
**Business objective:** Enable consistent, high-quality content production across platforms while maintaining brand tone, education-first approach, and CTA consistency.

**Structure preview:**

```markdown
# Social Media Content Creator
### AIOS Skill — Creation

## Purpose
Produces platform-adapted social media content from a core message and topic input.
Formats for Facebook, Instagram, TikTok, or LINE OA according to platform-specific
structure requirements. Does NOT determine what the core message should say —
the invoking Persona provides the core message and the Skill adapts it.

## Inputs
| Input | Required | Description |
|-------|---------|-------------|
| core_message | Required | The main idea to communicate (from Persona) |
| topic_category | Required | Content Pillar (from Knowledge: 30_KB_CO_BrandOS.md) |
| target_persona | Required | Which customer persona this is written for |
| platform | Required | facebook | instagram | tiktok | line_oa |
| content_length | Optional | short | medium | long (default: medium) |
| include_cta | Optional | true | false (default: true) |

## Required Knowledge
| Document | Sections Used |
|----------|-------------|
| 30_KB_CO_BrandOS.md | Tone of Voice, DOs/DON'Ts, CTA standard |
| 30_KB_CU_[TargetPersona].md | Communication preferences for that segment |

## Process
### Step 1 — Load platform format template from Knowledge
Each platform has a defined structure (Facebook: Hook→Pain→Story→Insight→Example→CTA)

### Step 2 — Load persona communication preferences
Calibrate language register, complexity level, and terminology for target audience

### Step 3 — Apply brand tone calibration
40% Financial Expert / 30% Family Coach / 20% Educator / 10% Friend
Enforce all DON'Ts from Brand OS

### Step 4 — Draft content to platform structure
Map core message components to platform template slots

### Step 5 — Validate against Brand DO/DON'T checklist
Automated check against documented brand rules

### Step 6 — Append CTA if include_cta = true
Standard CTA: พิมพ์ "บ้านเขียว" (from 30_KB_CO_BrandOS.md, Section: CTA Standard)

## Limitations
- Cannot determine what the core message should say
- Cannot verify factual accuracy of the core message (that is the Persona's responsibility)
- Produces one draft — revision requests require re-invocation with updated inputs
```

---

## Example 4 — Review Skill: Financial Plan Review

**Skill ID:** `40_Skill_Review_FinancialPlan`  
**Category:** Review  
**Business objective:** Ensure every financial plan produced by AIOS meets the completeness and suitability criteria established by professional financial planning standards and AIOS Principles before being presented to a client.

**Structure preview:**

```markdown
# Financial Plan Review
### AIOS Skill — Review

## Purpose
Evaluates a draft financial plan against a defined set of completeness, suitability,
and Principles compliance criteria. Produces a structured assessment identifying what
meets the standard and what requires revision. Does NOT revise the plan —
it assesses it and returns findings to the invoking Persona.

## Inputs
| Input | Required | Description |
|-------|---------|-------------|
| draft_plan | Required | The financial plan artifact to be reviewed |
| client_profile | Required | Client context for suitability assessment |
| review_depth | Optional | standard | comprehensive (default: standard) |

## Required Knowledge
| Document | Sections |
|----------|---------|
| 30_KB_DO_FinancialPlanningPrinciples.md | Plan Completeness Criteria |
| 30_KB_RE_OICRegulations.md | Regulatory suitability requirements |

## Process
### Step 1 — Completeness check (11 criteria)
Does the plan include: client profile summary, stated goals, needs analysis,
protection assessment, savings strategy, investment strategy, tax strategy,
timeline, assumptions declared, limitations stated, next actions defined?

### Step 2 — Suitability check
Is the strategy appropriate for the stated client profile and risk tolerance?

### Step 3 — Principles compliance check
Does any element of the plan risk violating an AI Principle?
Specifically: Principle 1 (Client Wellbeing), Principle 15 (No Sales Optimization)

### Step 4 — Produce structured review output
Return: {completeness_score, completeness_gaps, suitability_status,
         suitability_issues, principles_compliance, overall_recommendation,
         required_revisions, review_criteria_reference}

## Success Criteria
Every finding in the review output traces to a specific criterion
in the Required Knowledge or AI Principles — no subjective assessments
```

---

## Example 5 — Validation Skill: Principles Compliance Check

**Skill ID:** `40_Skill_Validation_PrinciplesCompliance`  
**Category:** Validation  
**Business objective:** Ensure that any significant recommendation, content, or output produced by AIOS is checked against all 15 AI Principles before being finalized. Acts as a systematic guardrail across all Personas and Workflows.

**Structure preview:**

```markdown
# Principles Compliance Check
### AIOS Skill — Validation
**Authorized Personas:** All Personas
**Estimated Execution Complexity:** Low

## Purpose
Validates that a proposed output or recommendation does not violate any of the
15 AI Principles defined in 01_AI_Principles.md. Produces a pass/fail result with
specific findings for any Principle where a potential violation is detected.

## Required Knowledge
| Document | Sections |
|----------|---------|
| 01_AI_Principles.md | All 15 Principles, Expected Behaviors sections |

## Process
For each of the 15 Principles:
  1. Read the Principle's Expected Behaviors
  2. Assess whether the proposed output is consistent with those behaviors
  3. If inconsistent: flag the specific Principle, the specific behavior,
     and the specific element of the output that conflicts

## Outputs
{
  overall_status: pass | fail | warning,
  violations: [{principle_id, principle_name, specific_behavior, conflict_description}],
  warnings: [{principle_id, reason}],
  reviewed_at: timestamp
}

## Failure Handling
This Skill does not fail — it always produces an assessment.
If the input is too ambiguous to assess, it returns:
{overall_status: "indeterminate", reason: "Input requires Persona clarification
before Principles assessment is possible"}
```

---

# Part IX — Reusable Template

The following is the complete, copy-ready template for creating a new AIOS Skill document. Replace all `[placeholder]` values. Delete sections marked `[Conditional]` if the condition does not apply. Delete this instruction before activating the Skill.

---

```markdown
# [Skill Name]
### AIOS Skill — [Category Name]
**Skill ID:** 40_Skill_[Category]_[Name]
**Version:** 1.0.0
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Status:** Draft
**Skill Category:** [Analysis | Planning | Creation | Decision Support | Calculation | Research | Communication | Automation | Review | Validation | Transformation]
**Authority Level:** Layer 8 — executes under Persona authorization
**Authorized Personas:** [List of authorized Personas, or "Any authorized Persona"]
**Estimated Execution Complexity:** [Low | Medium | High]

---

## Purpose

[2–5 sentences. What specific capability does this Skill provide?
What type of problem does it solve? What does it explicitly NOT do?]

---

## Business Objective

[What organizational or client-facing outcome does this Skill support?
Which organizational principle or goal does it serve?
What is the customer benefit when this Skill executes well?]

---

## Inputs

### Required Inputs
| Input | Type | Description | Example |
|-------|------|-------------|---------|
| [input_name] | [Data type / format] | [What it is and why it is needed] | [Example value] |
| [input_name] | [Data type / format] | [Description] | [Example] |

### Optional Inputs
| Input | Type | Description | Default if Absent |
|-------|------|-------------|------------------|
| [input_name] | [Type] | [Description] | [Default behavior] |

### Input Validation Rules
- [input_name]: [What constitutes a valid value]
- [input_name]: [Validation rule]

---

## Required Context

| Context Category | Required Fields | Purpose |
|-----------------|----------------|---------|
| [Category name] | [Specific fields needed] | [Why needed] |

*Context categories: Core, Persona, Domain, User, Project, Task, Historical, External*

---

## Required Knowledge

| Knowledge Document | Sections Used | Freshness Requirement |
|-------------------|--------------|----------------------|
| `30_KB_[Document].md` | [Specific sections] | [Current / Within 90 days / Annual] |

*If no Knowledge is required, state: "No Knowledge documents required — this Skill applies logic to inputs only."*

---

## Required Persona

**Persona Independence:** [Independent — any authorized Persona may invoke | Dependent — requires specific Persona context]

**If Persona-Dependent:**
- Required Persona type: [Persona name or category]
- Why: [What judgment this Persona must provide during Skill execution]
- Boundary: [Where Persona judgment ends and Skill execution begins]

---

## Preconditions

All of the following must be true before this Skill may be invoked:

1. [Precondition 1] — [Consequence if false]
2. [Precondition 2] — [Consequence if false]
3. All required inputs are present and pass input validation rules
4. All required Knowledge documents have status Active and are within freshness thresholds
5. The invoking Persona has confirmed this Skill is appropriate for the current task context
6. No AI Principle violation would result from executing this Skill in the current context

---

## Process

### Step 1 — [Step name]
**Action:** [What happens in this step]
**Input used:** [Which inputs this step consumes]
**Output of this step:** [What this step produces]

### Step 2 — [Step name]
**Action:** [Action]
**Input used:** [Inputs]
**Output of this step:** [Output]

### Step 3 — [Step name]
**Action:** [Action]
**Input used:** [Inputs]
**Output of this step:** [Output]

[Add steps as needed]

### Process Summary
```
Input → [Step 1 name] → [Step 2 name] → [Step N name] → Output
```

---

## Decision Points
[Conditional — required when the process contains branches]

### Decision Point D1 — [Name]
**Location:** After Step [N]
**Condition:** [What is evaluated]
**If true:** [Action or path]
**If false:** [Action or path]
**Who decides:** [The Skill's defined logic | The invoking Persona | A Validation Skill]

---

## Outputs

### Primary Output
**Format:** [Structure or format]
**Content:** [What the output contains]
**Example:**
```
[Illustrative example of a well-formed output]
```

### Secondary Outputs
[If applicable — same structure]

### Output Validation
Before passing output to the invoking Persona or Workflow, confirm:
- [ ] [Validation check 1]
- [ ] [Validation check 2]
- [ ] Output does not contain recommendations that should come from the Persona
- [ ] Output does not contain information not derived from inputs and Knowledge

---

## Success Criteria

A Skill execution is successful when:

1. **Completeness:** All declared outputs are present and non-empty
2. **Accuracy:** [Domain-specific accuracy standard]
3. **Relevance:** Output directly addresses the stated input requirements
4. **Boundary compliance:** Output does not contain Persona-level recommendations or judgments
5. **Principles compliance:** No AI Principle has been violated in producing the output
6. [Skill-specific criterion 1]
7. [Skill-specific criterion 2]

---

## Limitations

This Skill:

- **Cannot** [limitation 1] — [Consequence]
- **Cannot** [limitation 2]
- **Produces unreliable output when** [condition] — [Why and what to do]
- **Is not appropriate for** [situation] — [Use [alternative] instead]
- **Does not replace** [related but distinct function]

---

## Failure Handling

### Failure Mode F1 — [Name]
**Trigger:** [What causes this failure]
**Detection:** [How to recognize it]
**Response:** [What the Skill does — abort, partial output, escalate, request input]
**Communication:** [What the invoking Persona or Workflow must be told]

### Failure Mode F2 — [Name]
**Trigger:** [Trigger]
**Detection:** [Detection]
**Response:** [Response]
**Communication:** [Communication]

### General Failure Principles
- When a required input is missing: [Default behavior]
- When a required Knowledge document is stale: [Default behavior]
- When a Principles violation would result: Abort and report to invoking Persona
- When output confidence is low: Surface uncertainty; do not present as reliable

---

## Related Skills

### Skills Frequently Invoked Before This One
| Skill | Why It Precedes This Skill |
|-------|--------------------------|
| `40_Skill_[Name].md` | [Relationship] |

### Skills Frequently Invoked After This One
| Skill | Why It Follows This Skill |
|-------|--------------------------|
| `40_Skill_[Name].md` | [Relationship] |

### Alternative Skills
| Skill | When to Use It Instead |
|-------|----------------------|
| `40_Skill_[Name].md` | [Scenario] |

### Skills This One Composes
[If applicable]
| Skill | Role in Composition |
|-------|-------------------|
| `40_Skill_[Name].md` | [Contribution] |

---

## Dependencies

| Dependency | Type | Impact If Changed |
|-----------|------|-----------------|
| `30_KB_[Document].md` | Knowledge | [Section affected + impact] |
| `04_AI_Constitution.md`, Layer 8 | Architectural | Skill boundary definition |
| [Other dependency] | [Type] | [Impact] |

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0.0 | [YYYY-MM-DD] | [Author] | Initial Skill definition |
```

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | 2026-06-25 | Chief Capability Architect | Initial Skill Standard — 9 Parts, 11 Skill Categories, 17 required Skill sections, composition patterns, integration rules, 5 worked examples, and reusable template |

---

*This document is the standard governing all Skill documents within AIOS (Layer 8). It is governed by Layers 1–7 of the AIOS architecture. Any Skill document that does not comply with this standard is not a valid AIOS Skill artifact and may not be invoked by Personas or Workflows until it is brought into compliance.*
