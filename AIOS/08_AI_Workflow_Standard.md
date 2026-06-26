# AI Workflow Standard
### Universal Standard for All Workflows within AIOS
**Version:** 1.0  
**Effective Date:** 2026-06-25  
**Status:** Active  
**Authority:** Chief Process Architect  
**Document Type:** Architectural Standard  
**Applies To:** All Workflow documents within AIOS (Layer 9)  

---

## Purpose of This Document

This document defines the universal standard that every Workflow within AIOS must follow.

It is not a Workflow. It does not describe how to onboard a client, produce a financial plan, create content, or execute any other multi-step process. Those processes belong in individual Workflow documents created using this standard.

This document defines **what a Workflow is, how it must be structured, how it orchestrates Personas, Skills, and Knowledge, how it handles failure, and how it is maintained** — so that the Workflow layer of AIOS remains consistent, reliable, and auditable at any scale.

### What This Document Contains

**Part I** — The role of Workflows within AIOS and how they differ from Personas, Skills, Knowledge, and Runtime  
**Part II** — Workflow categories and when to use each  
**Part III** — Standard structure for every Workflow document  
**Part IV** — Workflow patterns  
**Part V** — Orchestration: how Workflows coordinate AIOS components  
**Part VI** — Error handling  
**Part VII** — Workflow lifecycle  
**Part VIII** — Quality standards  
**Part IX** — Worked examples across multiple domains  
**Part X** — Reusable Markdown template  

---

## Relationship to AIOS Foundation

Workflows occupy **Layer 9** of the AIOS architecture, as defined in `04_AI_Constitution.md`. They are governed by all layers above them.

```
Layer 1: AI Vision          → Every Workflow serves the organizational mission
Layer 2: AI Principles      → All 15 Principles govern every Workflow step
Layer 3: AI Constitution    → Workflow governance rules W1–W5
Layer 4: Process Layer      → Decision Framework + Context Framework govern Workflow execution
Layer 5: Runtime Layer      → Claude.md defines operational standards for AI execution
Layer 6: Persona Layer      → Personas execute Workflow steps; Workflows do not execute Personas
Layer 7: Knowledge Layer    → Workflows reference Knowledge; they do not contain it
Layer 8: Skill Layer        → Workflows orchestrate Skills; Skills do not orchestrate Workflows
                                    ↓
Layer 9: WORKFLOW LAYER     ← This standard governs this layer
```

**Workflows are the operational expression of the entire AIOS stack.** Every component above Layer 9 is designed, configured, and maintained to make Workflow execution effective. A well-designed Workflow is the proof that the rest of the architecture is working.

---

# Part I — The Role of Workflows within AIOS

## 1.1 What a Workflow Is

A Workflow is a **documented, repeatable process** that orchestrates Personas, Skills, and Knowledge to accomplish a defined multi-step objective. Workflows are the operational layer of AIOS — they convert a trigger (a user request, a scheduled event, or a system condition) into a structured sequence of actions that produces a defined outcome.

A Workflow answers the question: *"Given this objective, what is the precise sequence of steps, decisions, and component invocations required to produce the desired result — reliably, every time?"*

| A Workflow… | A Workflow does NOT… |
|------------|---------------------|
| Defines the sequence of steps | Execute any step itself |
| Assigns each step to a Persona or Skill | Contain domain knowledge |
| Declares decision gates and branches | Make Persona-level recommendations |
| Specifies what happens when steps fail | Perform Skill-level execution |
| Produces a defined outcome | Override the Principles Layer |
| Can be triggered by events | Operate without defined inputs and outputs |

## 1.2 How Workflows Differ from Other AIOS Components

| Component | Primary Question | Owns | Does NOT Own |
|-----------|-----------------|------|-------------|
| **Persona** | *Who is the AI and what judgment does it apply?* | Role, scope, decision calibration | Process sequencing, domain facts, capability execution |
| **Knowledge** | *What is true about this domain?* | Verified facts, definitions, rules | Process, persona behavior, capability execution |
| **Skill** | *How is this specific capability executed?* | Inputs, process, outputs, success/failure criteria | Sequencing, persona identity, domain facts |
| **Workflow** | *In what sequence do components work together to achieve an outcome?* | Step sequence, orchestration, decision gates, handoffs, exception handling | Persona judgment, domain knowledge, Skill execution |
| **Runtime** | *How does the AI model operate within AIOS?* | Model-specific operational standards, priority rules | Sequencing, persona identity, domain knowledge |

### The Four Critical Workflow Boundaries

**Workflow vs. Persona:**  
A Workflow defines *what* a Persona does at each step — the action required, the input to use, the output expected. A Persona decides *how* to do it — the judgment, interpretation, and communication. A Workflow step that says "determine the best product for the client" has entered Persona territory. It should say "Financial Planner Persona: form product recommendation using Decision Framework, informed by [preceding Skill outputs]."

**Workflow vs. Skill:**  
A Workflow specifies *which* Skill to invoke, *when*, and *with what inputs*. A Skill defines *how* the capability executes. A Workflow step that specifies the calculation methodology is embedding Skill logic where it does not belong. It should say "invoke `40_Skill_Calculation_TaxLiability.md` with [inputs]."

**Workflow vs. Knowledge:**  
A Workflow may reference Knowledge documents to confirm preconditions or specify which Knowledge a step requires. It does not contain domain facts. A Workflow step that includes a tax rate or an insurance definition has embedded Knowledge where it does not belong.

**Workflow vs. Runtime:**  
Runtime configuration governs how the AI model operates. A Workflow governs what the AI does. A Workflow step that specifies formatting, response length, or AI model behavior is encroaching on Runtime territory.

## 1.3 Why Workflows Matter for AIOS Quality

Without a Workflow layer, complex tasks would be executed ad hoc — differently by each Persona, on each occasion, with no guarantee that important steps are not missed. In a domain where omitting a risk assessment or failing to check regulatory compliance has real consequences for real people, ad hoc execution is not acceptable.

Workflows create four properties that ad hoc execution cannot:

**Repeatability:** The same workflow, given the same inputs, produces the same type of output — consistently, regardless of which Persona executes it or when.

**Auditability:** Every completed Workflow instance is a traceable record of what was done, by whom, in what order, and with what result. Questions about how a recommendation was reached have a specific answer.

**Improvability:** When a Workflow consistently produces suboptimal outputs at a specific step, that step can be redesigned without touching the rest of the Workflow. Monolithic processes cannot be improved this way.

**Onboardability:** A new Persona added to AIOS can execute any Workflow immediately — because the Workflow tells it exactly what to do at each step. Knowledge is not locked in the heads of experienced agents.

---

# Part II — Workflow Categories

AIOS organizes Workflows into nine categories. Each has a defined purpose, characteristic structure, and primary use context.

## Workflow Category Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AIOS WORKFLOW CATEGORIES                          │
│                                                                     │
│  ┌──────────────────┐  Day-to-day business processes               │
│  │   OPERATIONAL    │  Onboarding, intake, follow-up, reporting    │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Systematic examination and assessment       │
│  │   ANALYTICAL     │  Needs analysis, risk assessment, review     │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Production of content and artifacts         │
│  │    CREATIVE      │  Content plans, proposals, presentations     │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Structured evaluation of options            │
│  │ DECISION SUPPORT │  Comparison, trade-off analysis, scoring     │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Serving user needs through interaction      │
│  │ CUSTOMER SERVICE │  Inquiry handling, consultation, resolution  │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Systematic information gathering            │
│  │    RESEARCH      │  Market research, competitor analysis        │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Holistic financial planning for a client    │
│  │FINANCIAL PLANNING│  Goal → Analysis → Strategy → Plan → Review  │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Verification of regulatory adherence        │
│  │   COMPLIANCE     │  Regulatory checks, audit trails, sign-offs  │
│  └──────────────────┘                                               │
│                                                                     │
│  ┌──────────────────┐  Scheduled, rule-driven execution            │
│  │   AUTOMATION     │  Recurring reports, data updates, triggers   │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Category 1 — Operational Workflows

**Definition:** Workflows that manage recurring, structured business processes — onboarding new clients, processing intake information, handling follow-ups, or generating routine reports.

**When to use:** When the process repeats frequently in a consistent form, involves defined handoffs, and its quality can be evaluated by whether all defined steps were completed.

**Characteristic structure:** Linear, with defined checkpoints and completion confirmation  
**Typical duration:** Short to medium (minutes to hours)  
**Naming prefix:** `20_Workflow_Ops_[Name].md`

**Examples within AIOS:**
- Client Onboarding Workflow — intake, profile creation, initial needs assessment, welcome communication
- Monthly Reporting Workflow — data assembly, analysis, report generation, distribution
- Consultation Follow-up Workflow — post-meeting summary, action items, follow-up schedule

---

## Category 2 — Analytical Workflows

**Definition:** Workflows that guide a systematic examination of a situation, dataset, or artifact — assembling multiple analysis outputs into a coherent picture.

**When to use:** When a comprehensive assessment requires multiple distinct analyses to be conducted, integrated, and interpreted — where each analysis alone is insufficient.

**Characteristic structure:** Sequential analysis steps followed by synthesis  
**Typical duration:** Medium (hours)  
**Naming prefix:** `20_Workflow_Analysis_[Name].md`

**Examples within AIOS:**
- Financial Needs Assessment Workflow — income analysis, protection gap, retirement gap, education gap, synthesis
- Risk Assessment Workflow — risk factor identification, risk scoring, risk profile construction, implications summary
- Business Performance Analysis Workflow — metrics gathering, trend analysis, benchmark comparison, insight synthesis

---

## Category 3 — Creative Workflows

**Definition:** Workflows that guide the production of content, documents, or artifacts through a structured creative process — ensuring consistency, brand alignment, and quality review.

**When to use:** When content or artifact production requires multiple stages (research → draft → review → refine → approve → publish) and quality depends on each stage being completed properly.

**Characteristic structure:** Iterative — drafting, review, and revision cycles  
**Typical duration:** Medium to long  
**Naming prefix:** `20_Workflow_Creative_[Name].md`

**Examples within AIOS:**
- Content Creation Workflow — topic selection, research, draft, brand review, refinement, publication
- Financial Plan Document Workflow — analysis inputs → narrative structure → document creation → review → finalization
- Proposal Creation Workflow — needs summary, strategy outline, document creation, quality review, delivery

---

## Category 4 — Decision Support Workflows

**Definition:** Workflows that structure a complex decision — assembling the information, analyses, and comparisons required to make a well-grounded choice, then presenting the decision clearly.

**When to use:** When a decision requires gathering and integrating multiple inputs before a recommendation can responsibly be made. These Workflows ensure the Decision Framework is fully applied.

**Characteristic structure:** Information gathering → Analysis → Comparison → Decision → Explanation  
**Typical duration:** Medium  
**Naming prefix:** `20_Workflow_Decision_[Name].md`

**Examples within AIOS:**
- Product Selection Workflow — needs assessment, eligibility check, product comparison, recommendation, explanation
- Investment Strategy Decision Workflow — goal clarification, risk profiling, option analysis, strategy recommendation
- Coverage Design Workflow — gap analysis, product matching, coverage design, trade-off presentation

---

## Category 5 — Customer Service Workflows

**Definition:** Workflows that manage interactions with clients — from initial inquiry through resolution, ensuring that every client touchpoint is handled consistently and within defined quality standards.

**When to use:** When a client interaction follows a defined arc (inquiry → clarification → resolution → confirmation) that benefits from structured execution.

**Characteristic structure:** Inquiry → Triage → Response → Confirmation → Follow-up  
**Typical duration:** Short to medium  
**Naming prefix:** `20_Workflow_CS_[Name].md`

**Examples within AIOS:**
- Client Inquiry Handling Workflow — intake, categorize, route to appropriate Persona, resolve, document
- Consultation Booking Workflow — request received, qualification, scheduling, confirmation, preparation
- Complaint Resolution Workflow — receive, acknowledge, investigate, resolve, document, prevent recurrence

---

## Category 6 — Research Workflows

**Definition:** Workflows that systematically gather, assess, and synthesize information on a specific topic — producing a structured knowledge output that informs decisions or enriches the Knowledge Base.

**When to use:** When the information needed to make a decision or produce an artifact does not exist in current Knowledge documents and must be assembled from sources.

**Characteristic structure:** Scope definition → Source identification → Retrieval → Assessment → Synthesis → Output  
**Typical duration:** Medium to long  
**Naming prefix:** `20_Workflow_Research_[Name].md`

**Examples within AIOS:**
- Competitor Analysis Workflow — identify competitors, gather data, analyze, synthesize, produce report
- Market Segment Research Workflow — define segment, gather data, identify patterns, produce profile
- Regulatory Update Research Workflow — identify changed regulations, assess impact, update Knowledge document

---

## Category 7 — Financial Planning Workflows

**Definition:** Comprehensive, multi-stage Workflows that guide a client from goal articulation through a complete financial plan — integrating multiple analytical, decision support, and creation steps into a cohesive client engagement.

**When to use:** When the objective is to produce a complete financial plan or a significant component of one — not just a single analysis or recommendation.

**Characteristic structure:** Relationship → Discovery → Analysis → Strategy → Plan → Review → Implementation  
**Typical duration:** Long (multiple sessions)  
**Naming prefix:** `20_Workflow_FP_[Name].md`

**Examples within AIOS:**
- Complete Financial Planning Workflow — full lifecycle from initial contact to implemented plan
- Retirement Planning Workflow — goal → gap → strategy → product design → implementation
- Estate Planning Workflow — asset inventory → beneficiary mapping → structure design → implementation

---

## Category 8 — Compliance Workflows

**Definition:** Workflows that verify regulatory and Principles compliance — ensuring that outputs, recommendations, and processes meet legal, regulatory, and organizational standards before they are delivered or implemented.

**When to use:** When the output of another Workflow or a significant recommendation must be validated against compliance requirements before finalization.

**Characteristic structure:** Input → Compliance check (Validation Skill) → Review → Approve/Reject → Document  
**Typical duration:** Short to medium  
**Naming prefix:** `20_Workflow_Compliance_[Name].md`

**Examples within AIOS:**
- Recommendation Compliance Check Workflow — proposed recommendation → regulatory check → Principles check → approval
- Product Suitability Compliance Workflow — product recommendation → suitability validation → documentation
- Knowledge Document Compliance Workflow — new KB document → accuracy review → regulatory check → activation

---

## Category 9 — Automation Workflows

**Definition:** Workflows that execute defined, scheduled, or event-triggered processes without requiring human initiation — recurring reports, data maintenance, Knowledge document review scheduling, and similar systematic operations.

**When to use:** When a process recurs on a schedule or is triggered by a system event, the process steps are well-defined, and human judgment is not required at most or all steps.

**Characteristic structure:** Trigger → Precondition check → Execute steps → Validate output → Deliver/Log  
**Typical duration:** Variable; typically short per instance  
**Naming prefix:** `20_Workflow_Auto_[Name].md`

**Examples within AIOS:**
- Monthly Knowledge Review Trigger Workflow — identify documents due for review → notify responsible parties → track completion
- Recurring Client Summary Workflow — scheduled trigger → assemble client data → generate summary → deliver
- System Health Check Workflow — trigger → check all Active Skill and Knowledge document statuses → flag issues → report

---

# Part III — Standard Workflow Structure

Every Workflow document within AIOS must follow this structure, in this section order. Sections marked **[Required]** must be present in every Workflow. Sections marked **[Conditional]** are required when their stated condition applies.

---

## Section W1 — Workflow Header **[Required]**

**Purpose:** Identifies the document as an AIOS Workflow artifact and provides the administrative metadata required before a Persona or system decides to invoke this Workflow.

```markdown
# [Workflow Name]
### AIOS Workflow — [Category Name]
**Workflow ID:** 20_Workflow_[Category]_[Name]
**Version:** [X.Y.Z]
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Status:** [Draft | Active | Deprecated | Retired]
**Workflow Category:** [Operational | Analytical | Creative | Decision Support | Customer Service | Research | Financial Planning | Compliance | Automation]
**Estimated Duration:** [Short (<1 hour) | Medium (1–8 hours) | Long (>8 hours / multi-session)]
**Human-in-the-Loop:** [Yes — at steps [N] | No]
**Multi-Persona:** [Yes — Personas: [list] | No — Single Persona: [name]]
**Trigger Type:** [On-demand | Scheduled | Event-driven]
```

---

## Section W2 — Business Objective **[Required]**

**Purpose:** Connects the Workflow to the organizational outcome it produces. Every Workflow must be justifiable in terms of the value it creates for the client, the organization, or both.

**Required content:**
- The specific business outcome this Workflow produces
- The customer benefit when this Workflow executes well
- The organizational Principle or goal it serves
- What the consequences would be of NOT having this Workflow (what would be done instead, and why that is inferior)

**Why this section exists:** Workflows that cannot articulate their business objective have no basis for existence. This section also forces the Workflow designer to think about the Workflow from the outcome backward — starting with the result, then designing the process to reliably achieve it.

---

## Section W3 — Trigger **[Required]**

**Purpose:** Defines precisely what initiates this Workflow. Ambiguous triggers produce Workflows that are invoked inconsistently — sometimes when appropriate, sometimes when not, and sometimes not at all when they should be.

**Required content:**

```markdown
## Trigger

**Trigger Type:** [On-demand | Scheduled | Event-driven]

**Trigger Conditions:**
This Workflow is initiated when:
1. [Primary trigger condition — specific and unambiguous]
2. [Secondary trigger condition, if applicable]
3. [AND/OR relationship between conditions]

**Who may initiate this Workflow:**
- [Persona or role authorized to trigger]
- [System trigger source, if applicable]

**Trigger Frequency:**
[Once per client engagement | Daily | Weekly | When [condition] is true | As needed]

**What initiates the Workflow should NOT be confused with:**
[Common trigger confusion — a related but distinct situation that should NOT initiate this Workflow]
```

---

## Section W4 — Preconditions **[Required]**

**Purpose:** Defines the conditions that must be true before the Workflow may begin. Preconditions are gates — if any are false, the Workflow does not start until the condition is resolved.

**Required content:**

```markdown
## Preconditions

All of the following must be confirmed before this Workflow begins:

### Data Preconditions
- [ ] [Required data or input is available]
- [ ] [Data freshness requirement is met]

### Component Preconditions
- [ ] Required Personas are available and operating under current Foundation documents
- [ ] Required Skills are Active and within their review cycles
- [ ] Required Knowledge documents are Active and within freshness thresholds

### Authorization Preconditions
- [ ] [Who must have authorized this Workflow to begin]
- [ ] No AI Principle violation would result from executing this Workflow in the current context

### Context Preconditions
- [ ] Core Context is loaded (AI Vision, Principles, Decision Framework, Persona, Runtime)
- [ ] User Context is assembled (if this Workflow serves a specific user)
- [ ] [Any domain-specific context requirement]

**If any precondition is false:**
[Define the specific response — notify [party], resolve [condition], or halt with [message]]
```

---

## Section W5 — Required Personas **[Required]**

**Purpose:** Identifies every Persona that participates in this Workflow, their role, and the steps they are assigned to. Persona assignment is the mechanism through which Workflow steps receive the domain judgment, communication calibration, and decision authority they require.

**Required content:**

```markdown
## Required Personas

| Persona | Document | Role in This Workflow | Steps Assigned |
|---------|----------|----------------------|---------------|
| [Persona name] | `[10_Persona_Name.md]` | [Lead / Support / Reviewer / Approver] | [Step numbers] |
| [Persona name] | `[10_Persona_Name.md]` | [Role] | [Step numbers] |

### Persona Assignment Rules
- Each step must have exactly one assigned Persona
- A step may not be assigned to "any Persona" — ambiguous assignment is an error
- When multiple Personas collaborate on a step, one is designated Lead and the others Support
- Steps that require no Persona judgment (pure Skill execution) are assigned to the most contextually relevant Persona as the responsible party
```

---

## Section W6 — Required Skills **[Required]**

**Purpose:** Lists every Skill invoked in this Workflow, the step where it is invoked, and the inputs it receives. Explicit Skill declaration enables pre-flight checks (are all required Skills Active?) and impact analysis (if this Skill changes, which Workflows are affected?).

**Required content:**

```markdown
## Required Skills

| Skill | Document | Invoked at Step | Inputs Provided | Output Used In |
|-------|----------|----------------|-----------------|----------------|
| [Skill name] | `[40_Skill_Name.md]` | Step [N] | [Input list] | Step [N+X] |

### Skill Availability Requirement
Before the Workflow begins, confirm:
- All listed Skills have Status: Active
- No listed Skill is Deprecated or Retired
- All listed Skills are within their review cycle (or a freshness caveat is accepted)

If a required Skill is unavailable, the Workflow must halt at the step that requires it
and follow the exception handling procedure defined in Section W11.
```

---

## Section W7 — Required Knowledge **[Required]**

**Purpose:** Identifies every Knowledge document drawn upon during this Workflow — either directly by the Workflow's decision gates or by the Skills invoked within it.

**Required content:**

```markdown
## Required Knowledge

| Knowledge Document | Used At | Purpose | Freshness Requirement |
|-------------------|---------|---------|----------------------|
| `30_KB_[Name].md` | Step [N] / Precondition | [Why this Knowledge is needed] | [Current / Within 90 days / Annual] |

### Knowledge Freshness Protocol
- If a required Knowledge document is Stale: proceed with explicit caveat documented in outputs
- If a required Knowledge document is Outdated or Deprecated: halt and flag for Knowledge Manager review
- If a required Knowledge document does not exist: halt, document the gap, escalate to Knowledge Manager
```

---

## Section W8 — Inputs **[Required]**

**Purpose:** Defines every input the Workflow requires to begin and to complete its steps. Input definition is the primary mechanism for reliable invocation — an invoking agent must know exactly what to provide.

**Required content:**

```markdown
## Inputs

### Required Inputs (must be present before Workflow begins)
| Input | Type | Description | Source | Example |
|-------|------|-------------|--------|---------|
| [Input name] | [Type] | [Description] | [Who provides this] | [Example value] |

### Inputs Assembled During Workflow (produced by earlier steps)
| Input | Type | Produced at Step | Used at Step |
|-------|------|-----------------|-------------|
| [Input name] | [Type] | Step [N] | Step [N+X] |

### Optional Inputs
| Input | Type | Description | Default if Absent |
|-------|------|-------------|------------------|
| [Input name] | [Type] | [Description] | [Default] |

### Input Validation
Before Step 1 begins, verify:
- [ ] All required inputs are present
- [ ] All required inputs pass type and format validation
- [ ] Required inputs are within acceptable value ranges
```

---

## Section W9 — Processing Steps **[Required]**

**Purpose:** Defines the complete sequence of steps that comprise this Workflow. This is the Workflow's operational core — the authoritative description of what happens, in what order, and by whom.

**Required content:**

Each step follows this format:

```markdown
## Processing Steps

### Step [N] — [Step Name]
**Assigned to:** [Persona name] (Lead) / [Persona name] (Support)
**Type:** [Persona judgment | Skill invocation | Decision gate | Human checkpoint | Notification | Automated]
**Input:** [What this step consumes — from prior step, from inputs, from Knowledge]
**Action:**
  [If Persona judgment]: [Persona name] applies [specific Decision Framework stage(s)] to [input] and produces [output]
  [If Skill invocation]: Invoke `[40_Skill_Name.md]` with inputs: [input list]
  [If Decision gate]: Evaluate [condition]. If [true]: proceed to Step [N+1]. If [false]: proceed to Step [N+X] / escalate / halt.
  [If Human checkpoint]: Surface [specific information] to [human role] for [review / approval / input]. Workflow pauses until response received.
**Expected output:** [What this step produces, in what format]
**Quality check:** [How to verify this step's output meets the standard before proceeding]
**On failure:** [What happens if this step cannot be completed — see Section W11]
```

### Step Sequence Overview

After defining all steps, provide a visual summary:

```markdown
### Workflow Map

[Trigger] → Step 1 → Step 2 → [Decision Gate A]
                                  → If A=true: Step 3 → Step 4 → Step 5 → [Output]
                                  → If A=false: Step 6 → [Decision Gate B]
                                                           → If B=true: Step 7 → [Output]
                                                           → If B=false: [Escalation]
```

**Step design principles:**

- Every step has one primary output — if a step produces multiple outputs, it should be split
- Steps are written at the right level of abstraction — specific enough to be unambiguous; general enough to remain valid as tools and models evolve
- Steps do not specify implementation details — "perform sentiment analysis on client message" not "use [specific model] with [specific prompt]"
- The sequence is complete — reading only the Steps, a competent Persona should be able to execute the Workflow without consulting other sections
- No step requires a component that has not been declared in Sections W5, W6, or W7

---

## Section W10 — Decision Gates **[Conditional — required when any step contains a branch]**

**Purpose:** Documents every point in the Workflow where execution may take different paths based on a condition. Decision Gates are the explicit branching logic of the Workflow — every branch must be accounted for.

**Required content:**

```markdown
## Decision Gates

### Gate G1 — [Name]
**Located at:** After Step [N]
**Decision type:** [Binary: yes/no | Multi-path: [list paths] | Threshold: [condition]]
**Evaluated by:** [Persona name | Automated check | Human reviewer]
**Evaluation criteria:**
  - [Criterion 1]
  - [Criterion 2]
**Paths:**
  - If [condition A]: → Step [N+1] — [Why this path]
  - If [condition B]: → Step [N+X] — [Why this path]
  - If [condition cannot be evaluated]: → [Escalation] — [Why]
**Decision Framework applied:** [Which Decision Framework stages are relevant]
**Documentation required:** [What must be recorded about this decision]

### Gate G2 — [Name]
[Same structure]
```

**Decision Gate design principles:**

- Every Gate must have a defined path for every possible outcome — "else" paths cannot be undefined
- Gates where the condition cannot be objectively evaluated must specify who makes the judgment call
- Gates that represent Principle-level decisions (e.g., "is this recommendation compliant?") must invoke the full Decision Framework, not a simplified shortcut
- Gates are numbered (G1, G2, etc.) so they can be referenced from Steps and from Exception Handling

---

## Section W11 — Exception Handling **[Required]**

**Purpose:** Defines how the Workflow responds to failures, unexpected conditions, and exceptional situations. A Workflow without exception handling will stall unpredictably and produce inconsistent outcomes when things go wrong — which they will.

**Required content:**

```markdown
## Exception Handling

### Exception Classification

| Class | Definition | Response Posture |
|-------|-----------|-----------------|
| **Recoverable** | Workflow can continue after the exception is resolved, without losing prior progress | Resolve and continue |
| **Partial** | Some steps can be completed; others cannot | Complete what is possible; document gaps; deliver partial output with disclosure |
| **Critical** | Workflow cannot produce a reliable output | Halt; notify; do not deliver |

### Exception Inventory

#### Exception E1 — [Name]
**Trigger:** [What causes this exception]
**Classification:** [Recoverable | Partial | Critical]
**Detection:** [How to recognize this exception has occurred]
**Immediate response:**
  1. [First action]
  2. [Second action]
**Notification:** [Who is notified, how, with what information]
**Recovery path:** [Steps to return to Workflow execution, if recoverable]
**Documentation:** [What must be recorded about this exception]

#### Exception E2 — [Name]
[Same structure]

### General Exception Principles

**E-Principle 1 — Fail visibly, never silently.**  
A Workflow that cannot complete a step must surface the failure. Presenting partial output as complete output is a Principles violation (Principle 3: Truth).

**E-Principle 2 — Preserve prior progress.**  
When an exception occurs, the outputs of completed steps are preserved and documented, even if the Workflow cannot proceed. Rework is preferable to loss of work already done.

**E-Principle 3 — Escalate at the right level.**  
Not every exception requires human intervention. Define the escalation threshold: minor exceptions are handled within the Workflow; major or ambiguous exceptions escalate to a human.

**E-Principle 4 — No exception goes undocumented.**  
Every exception — regardless of whether it is recovered — is logged in the Workflow execution record. The pattern of exceptions is the primary signal for Workflow improvement.

**E-Principle 5 — Principles violations are always Critical.**  
If executing the next step would require violating an AI Principle, the exception is automatically Critical, regardless of the step's importance to the Workflow outcome.
```

---

## Section W12 — Outputs **[Required]**

**Purpose:** Defines precisely what the Workflow produces when it completes successfully. Output definition makes the Workflow's results verifiable and ensures the invoking agent knows what to expect.

**Required content:**

```markdown
## Outputs

### Primary Output
**Format:** [Structure, format, or document type]
**Content:** [What the output contains]
**Recipient:** [Who receives this output]
**Delivery method:** [How it is delivered — directly to user, stored in [location], passed to [next Workflow]]

### Secondary Outputs (if applicable)
[Same structure]

### Execution Record
Every completed Workflow instance produces an execution record containing:
- Workflow ID and version
- Trigger: timestamp and trigger source
- Inputs received
- Steps completed (with timestamps and assigned Personas)
- Decision Gate outcomes
- Exceptions encountered and resolved
- Primary output reference
- Completion status: [Complete | Partial | Failed]
```

---

## Section W13 — Success Criteria **[Required]**

**Purpose:** Defines the measurable conditions that determine whether the Workflow has executed successfully. Success Criteria are the basis for Workflow testing, performance monitoring, and improvement prioritization.

**Required content:**

```markdown
## Success Criteria

This Workflow is successful when:

1. **Completion:** All required steps are completed in the defined sequence
2. **Output quality:** The primary output meets the defined format and content requirements
3. **Principles compliance:** No step required a Principles violation
4. **Exception management:** Any exceptions that occurred were classified, handled, and documented
5. **Timeliness:** Workflow completed within the defined estimated duration or delay was documented
6. [Workflow-specific criterion 1]
7. [Workflow-specific criterion 2]

### Success Measurement
| Criterion | How Measured | Threshold |
|-----------|-------------|-----------|
| Step completion rate | Steps completed / Total steps | 100% (or documented partial) |
| Output conformance | Checklist against output spec | Pass |
| Principles compliance | Principles Check Skill output | Pass |
| Exception rate | Exceptions per 10 executions | [Define acceptable rate] |
```

---

## Section W14 — Failure Conditions **[Required]**

**Purpose:** Defines the specific conditions that constitute Workflow failure — as distinct from exceptions (which may be recoverable). Failure Conditions trigger defined escalation, notification, and remediation processes.

**Required content:**

```markdown
## Failure Conditions

This Workflow has failed when:

1. A Critical exception has occurred and cannot be resolved within the session
2. A Principles violation has been detected and the Workflow cannot continue without committing it
3. A required component (Persona, Skill, Knowledge) is unavailable and no acceptable alternative exists
4. The primary output cannot be produced (not partial — entirely absent)
5. [Workflow-specific failure condition]

### Failure Response
When a Workflow failure is declared:
1. Halt immediately — do not attempt to produce partial output as if it were complete
2. Preserve all completed step outputs
3. Document the failure condition and all relevant context
4. Notify: [who is notified and by what means]
5. Initiate: [remediation or retry process, if one exists]
6. Log: failure event in the execution record
```

---

## Section W15 — Dependencies **[Required]**

**Purpose:** Identifies every external component, system, or condition that this Workflow's execution depends upon. When a dependency changes, this Workflow must be reviewed for impact.

**Required content:**

```markdown
## Dependencies

| Dependency | Type | Impact if Changed |
|-----------|------|-----------------|
| `10_Persona_[Name].md` | Persona | Affects steps [N, N+X] |
| `40_Skill_[Name].md` | Skill | Affects step [N]; may require process revision |
| `30_KB_[Name].md` | Knowledge | Affects preconditions and steps [N, N+X] |
| `04_AI_Constitution.md` | Architectural | Workflow boundary definitions |
| `02_AI_Decision_Framework.md` | Process | Decision Gate methodology |
| [External system or process] | System | Affects [step] |
| [Regulatory requirement] | Regulatory | Affects [compliance check step] |
```

---

## Section W16 — Version History **[Required]**

```markdown
## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0.0 | YYYY-MM-DD | [Author] | Initial Workflow definition |
| 1.1.0 | YYYY-MM-DD | [Author] | [What changed and why] |
```

**Versioning rules for Workflows:**

| Change Type | Version Impact |
|-------------|---------------|
| Correction of error in step description | Patch: X.Y.Z+1 |
| Addition of a new optional step or exception | Minor: X.Y+1.0 |
| Change to required steps, inputs, or outputs | Major: X+1.0.0 |
| Change that alters Decision Gate logic | Major: X+1.0.0 |
| Deprecation | Note in header + Version History |

---

# Part IV — Workflow Patterns

Workflow patterns are reusable structural templates — proven approaches to sequencing work that recur across different domains. Understanding the patterns allows Workflow designers to select the right structure for the task rather than reinventing the architecture from scratch.

## Pattern 1 — Linear (Sequential)

The simplest and most common pattern. Every step follows the previous step in a single unbroken sequence.

```
[Trigger] → Step 1 → Step 2 → Step 3 → ... → Step N → [Output]
```

**Use when:** Every instance of the task requires the same steps in the same order, with no material variation in path.

**Advantages:** Easy to design, test, monitor, and improve. Failures are easy to isolate to a specific step.

**Limitations:** Cannot accommodate situations where different inputs require different processing paths. Becomes brittle when exceptions force workarounds.

**AIOS examples:** Monthly reporting, document generation, scheduled data updates

---

## Pattern 2 — Branching (Conditional)

Execution follows different paths based on a condition evaluated at one or more Decision Gates.

```
[Trigger] → Step 1 → [Gate G1]
                       → If A: Step 2a → Step 3a → [Output A]
                       → If B: Step 2b → Step 3b → [Output B]
                       → If C: [Escalation]
```

**Use when:** The appropriate steps depend on characteristics of the input or on the output of a prior step — different client types, different risk profiles, different eligibility outcomes.

**Design guidance:**
- Every branch must be fully defined — no "else" without a defined path
- All branches must satisfy the same Success Criteria, even if they follow different steps
- Branches should converge to a common output format where possible — divergent output formats create downstream complexity

**AIOS examples:** Client inquiry routing, product eligibility, risk-adjusted planning, compliance with exceptions

---

## Pattern 3 — Looping (Iterative)

One or more steps repeat until a condition is satisfied.

```
[Trigger] → Step 1 → Step 2 → [Condition check]
                                 → If not satisfied: back to Step 2 (or Step 1)
                                 → If satisfied: Step 3 → [Output]
```

**Use when:** The quality of the output improves through iteration — content drafting and refinement, data cleaning, progressive detail gathering.

**Design guidance:**
- Define a maximum iteration count — unbounded loops are an architectural error
- Each iteration must make measurable progress toward the exit condition
- The exit condition must be evaluable without ambiguity — "good enough" is not a valid exit condition; "meets the quality checklist defined in Section [X]" is
- Document the loop explicitly in the Workflow Map

**AIOS examples:** Content refinement cycles, financial plan iteration, proposal revision loops

---

## Pattern 4 — Event-Driven

Workflow initiation is triggered by a system event rather than a human decision.

```
[System event] → [Event detection] → [Precondition check] → Step 1 → ... → [Output]
                                       → If preconditions not met: [Defer / Alert]
```

**Use when:** A defined system condition — a schedule, a data threshold, a status change — should automatically initiate a process without requiring a human to start it.

**Design guidance:**
- The triggering event must be precisely defined — ambiguous triggers produce unpredictable invocations
- Precondition checks are especially important for event-driven Workflows — the event may occur when the system is not ready to execute
- Event-driven Workflows must define what happens when the event occurs but the Workflow cannot run (backlog, defer, alert)

**AIOS examples:** Knowledge document review triggers, scheduled reporting, system health monitoring, client anniversary follow-ups

---

## Pattern 5 — Approval-Based

Workflow execution pauses at defined checkpoints pending human review and approval before proceeding.

```
[Trigger] → Step 1 → Step 2 → [Human Checkpoint: Approval required]
                                  → If approved: Step 3 → [Output]
                                  → If rejected: Step 2 (with revision notes) / [Halt]
                                  → If no response in [timeout]: [Escalation]
```

**Use when:** Outputs at certain stages carry sufficient consequential weight that human review and explicit approval is required before the Workflow proceeds. This is the primary mechanism for Human-in-the-Loop execution within AIOS.

**Design guidance:**
- Define precisely what the approver reviews — not "review the output" but "confirm that [specific criteria] are met"
- Define the timeout — how long the Workflow waits before escalating
- Define what happens after rejection — revision loop, halt, alternative path
- Approval checkpoints must never be skipped by a Persona even when "obviously correct" — the checkpoint exists for precisely those situations where what seems obvious is not

**AIOS examples:** Financial plan approval before client delivery, major recommendation review, regulatory compliance sign-off, Knowledge document publication

---

## Pattern 6 — Escalation

When a step, decision, or exception cannot be resolved within the Workflow's defined authority, it escalates to a higher level of authority.

```
[Step N: Beyond Workflow authority] → [Escalation trigger]
                                        → Level 1: Senior Persona
                                          → Resolved: Resume at Step N+1
                                          → Not resolved: → Level 2: Human expert
                                            → Resolved: Resume at Step N+1
                                            → Not resolved: → Halt + Document
```

**Use when:** The Workflow encounters a situation that exceeds the defined authority of its assigned Personas — a decision with unusually high stakes, a situation not covered by defined rules, or a conflict between Principles.

**Escalation levels:**

| Level | Authority | Trigger |
|-------|----------|---------|
| 1 | Senior Persona or Lead Persona | Step cannot proceed with current Persona's defined authority |
| 2 | Multi-Persona review | Conflicting Persona outputs; high-stakes recommendation |
| 3 | Human review | Principles conflict; unprecedented situation; regulatory ambiguity |
| 4 | Halt | Human review unavailable; proceeding would risk Principles violation |

**Design guidance:**
- Escalation is not failure — it is the correct response to genuinely ambiguous situations
- Every Escalation path must define a resumption point — where the Workflow picks up after the escalation is resolved
- Escalation paths must have defined timeouts — a Workflow that waits indefinitely for escalation resolution will stall

---

## Pattern 7 — Review and Revision

A structured loop in which an artifact is created, reviewed against criteria, returned for revision if needed, and re-reviewed until it meets the standard.

```
[Input] → Creation step → [Review Gate]
                             → Meets standard: → [Output]
                             → Does not meet: → Revision notes → Revision step → [Review Gate] (repeat)
                             → Exceeds revision limit: → [Escalation / Halt]
```

**Use when:** The quality of the output is critical and the first draft is unlikely to be final — financial plans, client proposals, content for publication, compliance documents.

**Design guidance:**
- The review criteria must be defined before creation begins, not after — reviewing against undefined criteria is not a Review and Revision pattern, it is ad hoc judgment
- Revision limit must be defined — what happens when the third (or fifth) revision still does not meet the standard
- The reviewer must be different from the creator — self-review is not a Review and Revision pattern; it is a checklist

---

# Part V — Orchestration

## 5.1 The Orchestration Responsibility

Orchestration is the coordination of AIOS components — Personas, Skills, Knowledge, and Runtime — to accomplish a Workflow's defined objective. The Workflow document is the orchestration specification; the executing Persona (or system) is the orchestration engine.

**The Workflow document tells the orchestrator:**
- What to do at each step
- Who to assign it to
- What to invoke
- What inputs to provide
- What outputs to expect
- What to do when something goes wrong

**The executing Persona (or system) ensures:**
- Steps are executed in the defined sequence
- Inputs are correctly assembled and passed
- Outputs are captured and made available to subsequent steps
- Decision Gates are evaluated correctly
- Exceptions are handled as defined

## 5.2 Orchestrating Personas

**Rule P1 — One Lead Persona per step.**  
Every step has exactly one Lead Persona responsible for its execution. Support Personas may contribute, but the Lead Persona owns the step's output and is accountable for its quality.

**Rule P2 — Persona handoff is explicit.**  
When responsibility transfers from one Persona to another, the handoff is a defined step. The handoff step must transfer: (a) the Active Context Profile as it stands at the time of handoff, (b) a summary of what has been decided and must not be revisited, (c) a statement of what remains open for the receiving Persona.

**Rule P3 — Context survives handoffs.**  
When a Persona hands off to another, the assembled context is passed — not rebuilt from scratch. Rebuilding context is waste; inconsistent context across steps is a quality risk.

**Rule P4 — Persona conflicts escalate.**  
When two Personas assigned to consecutive steps would produce contradictory outputs, the conflict must be surfaced through the Escalation pattern — not resolved by either Persona overriding the other.

**Rule P5 — Personas serve the Workflow; the Workflow does not serve Personas.**  
A Persona may not modify a Workflow step because the step is inconvenient for its scope or preferred method. If a step is inappropriate for the assigned Persona, the Workflow must be redesigned — the Persona does not adapt the Workflow unilaterally.

## 5.3 Orchestrating Skills

**Rule S1 — Skill invocation is explicit.**  
Every Skill invocation is documented in the Processing Step that calls it: Skill name, inputs provided, expected output. Undocumented Skill invocations are not AIOS-compliant.

**Rule S2 — Inputs are assembled before invocation.**  
A Skill may not be invoked until all of its required inputs are available. The Workflow step responsible for invoking the Skill must confirm input availability — not assume it.

**Rule S3 — Skill outputs are captured.**  
The output of every Skill invocation must be captured and made available to subsequent steps. An output that is not captured cannot be referenced — and a Skill that was invoked without using its output was invoked unnecessarily.

**Rule S4 — Skill failure triggers exception handling.**  
When a Skill fails, the Workflow does not attempt to bypass the failure or improvise the Skill's output. The defined Exception Handling procedure is followed.

**Rule S5 — Skills do not chain within the Workflow.**  
One Skill does not directly invoke another. The Workflow mediates all Skill invocations. If it appears that Skill A should always invoke Skill B, the chaining belongs in the Workflow steps — not in Skill A's process.

## 5.4 Orchestrating Knowledge

**Rule K1 — Knowledge access is step-specific.**  
A Workflow step that requires Knowledge declares which Knowledge document and which sections it accesses. Wholesale reference to "the Knowledge Base" is not sufficient.

**Rule K2 — Knowledge freshness is checked at the step level.**  
Each step that accesses Knowledge confirms that the Knowledge document is within its freshness threshold at the time of access — not only at the Workflow's start.

**Rule K3 — Knowledge gaps halt the step.**  
If a required Knowledge document does not exist, is Deprecated, or is confirmed Outdated, the step that requires it cannot proceed. The gap must be escalated to the Knowledge Manager before the Workflow continues.

## 5.5 Orchestrating the Decision Framework

The Decision Framework (`02_AI_Decision_Framework.md`) governs every decision made within a Workflow, at every Decision Gate, and by every assigned Persona.

**Integration rule DF1:** Every Decision Gate must specify which Decision Framework stages are applied. Gates that produce decisions without referencing the Decision Framework are not AIOS-compliant.

**Integration rule DF2:** The Simple Decision Protocol (for low-stakes, well-precedented decisions) and the Full 12-Stage Process (for strategic, ambiguous, or high-stakes decisions) are both available. The Workflow specifies which applies at each gate based on the decision's characteristics.

**Integration rule DF3:** Decision Framework outputs — the reasoning behind a decision, the alternatives considered, the Principles applied — are part of the step's output and must be captured in the execution record.

## 5.6 Orchestrating the Context Framework

The Context Framework (`03_AI_Context_Framework.md`) governs how context is assembled and maintained across the Workflow's steps.

**Integration rule CF1:** At Workflow initiation, Core Context (Layers 1–5) must be confirmed loaded. No Workflow step may proceed without Core Context.

**Integration rule CF2:** User Context is assembled once at Workflow initiation and maintained throughout. Steps do not independently re-assemble User Context — they receive it from the Workflow's context state.

**Integration rule CF3:** Context assembled during one step is available to all subsequent steps. Context does not expire within a single Workflow execution.

**Integration rule CF4:** When a Persona handoff occurs, the Active Context Profile is passed to the receiving Persona in its current state. The receiving Persona confirms context integrity before proceeding.

---

# Part VI — Error Handling

## 6.1 Error Classification

AIOS Workflows distinguish between three types of negative conditions. Confusing them leads to incorrect responses.

| Type | Definition | Response |
|------|-----------|----------|
| **Exception** | An unexpected condition that interrupts normal flow but may be resolvable | Classify, handle per exception procedure, resume or escalate |
| **Failure** | A condition that prevents the Workflow from producing a reliable output | Halt, notify, document, do not deliver |
| **Degradation** | A condition where the Workflow can complete but with reduced quality or completeness | Continue with caveat, document in output, disclose to recipient |

## 6.2 Error Detection

Errors are detected at three points in Workflow execution:

**Before execution — Precondition check:**  
If preconditions are not met, the Workflow does not start. This is not an error — it is the correct response to an uninvocable state. The invoking agent must resolve the precondition before retrying.

**During execution — Step quality check:**  
At the end of each step, the assigned Persona confirms that the step's output meets the defined quality check. If it does not, the exception handling procedure for that step is triggered.

**After execution — Output validation:**  
When the Workflow completes, the primary output is validated against the Output Validation checklist in Section W12 before delivery. An output that fails validation is treated as a failure, not delivered, and the Workflow execution record is updated accordingly.

## 6.3 Error Response Protocol

When an error is detected:

```
Step 1: Classify — Exception | Failure | Degradation
Step 2: Contain — Stop the step or Workflow at the point of detection
                  Do not pass an error forward to subsequent steps
Step 3: Document — Record: what occurred, at what step, with what inputs, with what result
Step 4: Notify — Inform the appropriate party (see Notification Matrix)
Step 5: Respond — Follow the defined exception procedure, halt, or caveat
Step 6: Resume or close — If resolved: resume from the affected step
                          If not resolved: close the execution record as Partial or Failed
```

## 6.4 Notification Matrix

| Error Type | Severity | Notify |
|-----------|---------|--------|
| Precondition not met | Informational | Invoking agent |
| Recoverable exception | Low | Lead Persona for affected step |
| Partial output | Medium | Lead Persona + Workflow owner |
| Skill unavailable | Medium | Workflow owner + Knowledge/Capability Manager |
| Knowledge stale | Medium | Knowledge Manager + Lead Persona |
| Principles violation detected | Critical | Human review + Executive Persona |
| Workflow failure | Critical | Human review + all assigned Personas |

## 6.5 Error Recovery Patterns

**Recovery Pattern R1 — Retry:**  
The same step is attempted again with the same inputs, after the failure condition has been resolved. Appropriate for transient failures (temporary resource unavailability, ambiguous input that has been clarified).

**Recovery Pattern R2 — Revision:**  
The step is re-executed with modified inputs or with additional context that addresses the root cause of the failure. Appropriate for quality failures where the output did not meet the standard because an input was incomplete or incorrect.

**Recovery Pattern R3 — Bypass:**  
The failed step is skipped and the Workflow continues without its output — with the degradation documented in the execution record and disclosed in the output. Appropriate only when the step is not required for a minimum viable output.

**Recovery Pattern R4 — Substitute:**  
An alternative step or Skill is used to produce an approximation of the failed step's output. Appropriate when an exact substitution exists and the substitution's output is documented as an approximation.

**Recovery Pattern R5 — Halt:**  
The Workflow stops. No output is delivered. The execution record is marked Failed. Appropriate when none of the above recovery patterns is applicable, or when delivering any output would require a Principles violation.

---

# Part VII — Workflow Lifecycle

## 7.1 Lifecycle Stages

```
PROPOSED
  ↓
DRAFT
  ↓
REVIEW
  ↓
TESTED
  ↓
ACTIVE ──────────────────────────────────────────┐
  ↓                                              │
UNDER REVISION (update in progress)              │ (if update passes testing)
  ↓                                              │
ACTIVE (new version) ────────────────────────────┘
  ↓
DEPRECATED (replacement available; use is discouraged)
  ↓
RETIRED (archived; no longer executable)
```

## 7.2 Design Process

**Stage 1 — Objective Definition**

Before a single step is written, the Workflow's objective must be defined with precision:

```
Outcome:         [What state exists after the Workflow succeeds that did not exist before]
Trigger:         [What starts the Workflow]
Success criteria: [How to know it succeeded]
Boundaries:      [What this Workflow does NOT do — equally important as what it does]
Components:      [Rough inventory of Personas, Skills, Knowledge required]
Pattern:         [Which Workflow pattern(s) best suit this objective]
```

If the objective cannot be stated precisely, the Workflow is not ready to design. Clarify the objective first.

**Stage 2 — Step Mapping**

Working backward from the outcome, map every step required to produce it. At this stage, the Workflow is a sequence of steps with rough descriptions — not yet the detailed format required by this standard.

Questions to answer at Stage 2:
- What must be true immediately before the output is produced? → That is Step N
- What must be true to produce Step N's input? → That is Step N-1
- Continue backward until reaching the inputs that can be provided at trigger time

**Stage 3 — Component Assignment**

For each step, assign:
- The Persona responsible
- The Skills to be invoked (if any)
- The Knowledge documents to be referenced (if any)
- The Decision Framework stages applicable to any Decision Gates

Confirm that every assigned component exists, is Active, and is within its review cycle.

**Stage 4 — Exception Mapping**

For each step, identify:
- What could prevent this step from completing?
- What would the impact be?
- What is the correct response?

Exception mapping is not creative — it is systematic. Work through every component failure, every missing input, every knowledge gap, every decision that cannot be resolved.

**Stage 5 — Document Creation**

Complete all 16 sections of the Workflow document per this standard. No section may be omitted without documented justification.

**Stage 6 — Boundary Review**

Review the completed Workflow document against the four critical boundaries:
- Does any step embed Persona judgment without assigning it to a Persona? → Assign it
- Does any step perform Skill-level execution rather than invoking a Skill? → Extract to a Skill
- Does any step contain Knowledge (facts, rates, rules)? → Extract to a Knowledge document
- Does any step specify Runtime behavior? → Move to Claude.md

**Stage 7 — Principles Review**

Review every step and Decision Gate against all 15 AI Principles. Particular attention to:
- Principle 1 (Human Wellbeing) — does any step risk client harm?
- Principle 3 (Truth) — does any step produce or present misleading output?
- Principle 14 (Decision Hierarchy) — do Decision Gates follow the correct priority order?
- Principle 15 (No Short-Term Sales Optimization) — does the Workflow serve the client's long-term interest?

## 7.3 Testing Protocol

Before a Workflow is activated, it must be tested under defined conditions.

**Test Case 1 — Standard path:**  
Execute the Workflow with clean, complete, standard inputs. Verify that all steps complete, all outputs match specifications, and all Success Criteria are met.

**Test Case 2 — Edge case:**  
Execute the Workflow with inputs at the boundary of the defined input ranges. Verify that the Workflow handles boundary conditions correctly.

**Test Case 3 — Exception simulation:**  
Deliberately introduce each defined exception condition. Verify that the exception is detected, classified correctly, handled per the exception procedure, and documented.

**Test Case 4 — Missing component:**  
Simulate the unavailability of a required Skill or Knowledge document. Verify that the Workflow halts at the correct step and follows the defined response.

**Test Case 5 — Principles check:**  
Design a test case that, if the Principles Review were absent, would produce a Principles violation. Verify that the Workflow's Principles check detects and halts the violation.

All test cases must pass before a Workflow is activated.

## 7.4 Review and Improvement

**Scheduled review:**  
Every Active Workflow is reviewed at a defined interval, or when:
- A component it depends on (Persona, Skill, Knowledge) is updated
- The exception rate exceeds the acceptable threshold defined in Success Criteria
- A user or Persona reports a quality problem
- A regulatory or organizational change affects the domain the Workflow operates in

**Continuous improvement input:**  
Execution records are the primary source of improvement data. Patterns in exceptions, Decision Gate outcomes, and step completion rates reveal where the Workflow can be improved. Improvement candidates are:
- Steps with high exception rates
- Decision Gates that frequently escalate
- Steps whose outputs frequently fail quality checks
- Patterns of Knowledge documents being stale at the point of access

## 7.5 Deprecation and Retirement

**Deprecation** occurs when:
- A superior replacement Workflow has been activated
- The process the Workflow describes is no longer required
- The components the Workflow depends on are no longer available

**Retirement** occurs after a minimum 90-day transition period. Retired Workflow documents are archived — never deleted. The execution records of completed Workflow instances are retained as part of the organization's operational history.

---

# Part VIII — Quality Standards

## 8.1 The Six Quality Dimensions

### Dimension 1 — Reliability

The Workflow produces its defined output consistently across repeated executions with similar inputs.

**Reliability requirements:**
- Every step has a defined quality check
- Exception handling covers all material failure modes
- No step depends on undocumented assumptions about the state of the system

**Test:** Execute the Workflow five times with structurally similar inputs. Do the outputs have consistent quality and structure? If not, identify which step produces inconsistent results and redesign it.

### Dimension 2 — Repeatability

Any authorized Persona, reading only the Workflow document, can execute the Workflow correctly without additional context or instruction.

**Repeatability requirements:**
- Steps are written at a level of specificity that leaves no room for meaningful interpretation
- Component assignments are unambiguous — "any Persona" is not an assignment
- Decision criteria are stated in evaluable terms — "high quality" is not a criterion; "meets all items in the output validation checklist" is

**Test:** Present the Workflow to a Persona with no prior knowledge of the process. Can it execute the Workflow to the defined standard without asking clarifying questions? If it must ask questions, those questions reveal specification gaps.

### Dimension 3 — Transparency

The Workflow's operation is understandable to any competent reader, and its outputs are traceable to its steps and components.

**Transparency requirements:**
- The Workflow Map (in Section W9) provides a navigable visual overview of the complete process
- Every Decision Gate documents what was evaluated and what the outcome was
- Every output is traceable to the step that produced it
- Exception handling is visible — exceptions are documented, not suppressed

**Test:** Given only the execution record of a completed Workflow instance, can a reader reconstruct what happened at each step, why each decision was made, and how the output was produced?

### Dimension 4 — Scalability

The Workflow performs consistently whether it is executed once per month or hundreds of times per day.

**Scalability requirements:**
- No step accumulates state across instances — each execution is independent
- Component dependencies (Personas, Skills) can handle concurrent invocations without quality degradation
- The Workflow's exception rate does not increase as volume increases

**Test:** Would this Workflow produce the same quality output for its hundredth execution as for its first? If volume would create bottlenecks or quality degradation, identify the constrained step and redesign it.

### Dimension 5 — Maintainability

The Workflow can be updated efficiently when its steps, components, or objectives change.

**Maintainability requirements:**
- Steps are atomic — updating one step does not require rewriting adjacent steps
- Component references use document IDs, not descriptions — when a Skill is renamed, the reference is clear
- Dependencies are declared — when a component changes, the impact on this Workflow is immediately identifiable
- The Version History accurately reflects every change

**Test:** If one of the Workflow's required Skills were replaced by a new version with a different output format, how many changes would be required in the Workflow? The answer should be localized to the step that invokes that Skill — not spread across the entire document.

### Dimension 6 — Auditability

Every Workflow execution produces a complete, tamper-evident record that can be used to review what happened, confirm compliance, and support any subsequent inquiry.

**Auditability requirements:**
- Execution records capture every step's inputs, outputs, and timestamps
- Decision Gate outcomes include the criteria evaluated and the result
- Exceptions are logged with their classification, response, and resolution
- The execution record is immutable — once written, it cannot be modified without creating a new record entry

**Test:** If a client asked "what did the AI do with my information during the financial planning process?" could a complete, accurate answer be derived from the execution record alone?

## 8.2 Quality Review Checklist

Before a Workflow is activated or after a major update:

```
BOUNDARY COMPLIANCE
□ No step embeds Persona judgment without assigning it to a named Persona
□ No step performs Skill execution without invoking a named Skill document
□ No step contains domain knowledge (facts, rates, rules)
□ No step specifies Runtime/model-specific behavior

STRUCTURAL COMPLETENESS
□ All 16 sections present and complete (or Conditional sections justified)
□ Every required input defined with type, source, and validation rule
□ Every step has an assigned Persona, defined input, defined output, and quality check
□ All Decision Gates define all possible paths
□ All exceptions classified, handled, and assigned notification responsibilities
□ Success Criteria are measurable and threshold-defined
□ Failure Conditions are stated

ORCHESTRATION INTEGRITY
□ Context Framework integration declared (Core Context, User Context)
□ Decision Framework stages assigned to all Decision Gates
□ Persona handoff protocol documented for all multi-Persona steps
□ Skill output contracts match next step's input requirements
□ Knowledge freshness requirements specified per step

PRINCIPLES COMPLIANCE
□ Every step reviewed against all 15 AI Principles
□ Principle 1 (Human Wellbeing) — no step risks client harm
□ Principle 3 (Truth) — no step produces misleading output
□ Principle 14 (Decision Hierarchy) — Decision Gates follow correct priority order
□ Principle 15 (No Short-Term Sales Optimization) — Workflow serves client long-term interest

LIFECYCLE READINESS
□ Version 1.0.0 set
□ Effective Date and Last Reviewed set to activation date
□ All 5 test cases passed
□ Workflow added to Workflow Index (20_Workflow_Index.md)
□ All dependent component documents updated to reference this Workflow
```

---

# Part IX — Worked Examples

## Example 1 — Operational Workflow: Client Onboarding

**Workflow ID:** `20_Workflow_Ops_ClientOnboarding`  
**Category:** Operational  
**Business objective:** Ensure every new client is welcomed, profiled, and ready for planning consultation through a consistent, complete onboarding process.

**Structure preview:**

```markdown
# Client Onboarding Workflow
### AIOS Workflow — Operational
**Trigger Type:** On-demand (initiated when a new client engagement is confirmed)
**Estimated Duration:** Medium (2–4 hours across one session)
**Human-in-the-Loop:** Yes — at Step 4 (client confirmation of profile)
**Multi-Persona:** Yes — Customer Success AI (Steps 1–3), Financial Planner AI (Steps 4–6)

## Trigger
This Workflow is initiated when a new client confirms intent to engage and provides
contact information. It is NOT initiated at initial inquiry — only at confirmed engagement.

## Processing Steps

### Step 1 — Intake and Profile Creation
Assigned to: Customer Success AI (Lead)
Type: Skill invocation
Action: Invoke 40_Skill_Ops_ClientIntake.md with: {contact_info, engagement_source}
Output: Structured client profile (partial — awaiting full data)

### Step 2 — Initial Data Gathering
Assigned to: Customer Success AI (Lead)
Type: Persona judgment
Action: Customer Success AI conducts structured intake conversation,
        gathering: income, family structure, goals, existing coverage, timeline.
        Applies Decision Framework Stage S1 (Understand) and S3 (Gather Context)
Output: Complete raw client data set

### Step 3 — Profile Structuring
Assigned to: Customer Success AI (Lead)
Type: Skill invocation
Action: Invoke 40_Skill_Transform_DataStructurer.md with: {raw_client_data}
Output: Structured Client Profile (standard AIOS format)

### Step 4 — Human Checkpoint: Client Profile Confirmation
Assigned to: Customer Success AI (Lead)
Type: Human checkpoint
Action: Present Structured Client Profile to client for review and confirmation.
        Pause Workflow until client confirms accuracy or provides corrections.
Output: Client-confirmed profile

### Step 5 — Financial Needs Preliminary Assessment
Assigned to: Financial Planner AI (Lead)
Type: Skill invocation
Action: Invoke 40_Skill_Analysis_FinancialNeeds.md with: {client_confirmed_profile}
Output: Preliminary needs assessment

### Step 6 — Welcome and Consultation Preparation
Assigned to: Customer Success AI (Lead)
Type: Skill invocation + Persona judgment
Action: Invoke 40_Skill_Creation_SocialMediaContent.md [configured as welcome message]
        with: {client_name, assigned_planner, preliminary_needs_summary}
        Financial Planner AI prepares consultation agenda from preliminary assessment
Output: Welcome communication sent; Consultation agenda prepared

## Decision Gates
### Gate G1 — Client Profile Completeness
After Step 3.
If profile is complete: → Step 4
If profile has gaps: → Return to Step 2 with gap specification
If client unresponsive after 3 contact attempts: → Escalation: notify human team

## Exception Handling
E1: Client provides contradictory information during Step 2
    Classification: Recoverable
    Response: Customer Success AI acknowledges discrepancy, asks for clarification,
              records both versions, flags for Financial Planner review at Step 5

E2: Client does not confirm profile at Step 4 within 48 hours
    Classification: Partial (Workflow cannot proceed past Step 4 without confirmation)
    Response: Send reminder. If no response after 5 business days, halt and notify human team
```

---

## Example 2 — Financial Planning Workflow: Complete Financial Plan

**Workflow ID:** `20_Workflow_FP_CompleteFinancialPlan`  
**Category:** Financial Planning  
**Business objective:** Guide a client from goal articulation to a complete, reviewed, and approved financial plan that addresses protection, savings, investment, and tax needs.

**Structure preview:**

```markdown
# Complete Financial Plan Workflow
### AIOS Workflow — Financial Planning
**Trigger Type:** On-demand (initiated after Client Onboarding Workflow completes)
**Estimated Duration:** Long (multiple sessions: 8–16 hours across 2–4 interactions)
**Human-in-the-Loop:** Yes — Steps 5 (client review) and 8 (human compliance approval)
**Multi-Persona:** Yes — Financial Planner AI (Lead throughout), Tax Advisor AI (Steps 4–5)

## Workflow Map
[Trigger] → Step 1: Goal Clarification
          → Step 2: Full Needs Analysis
          → Step 3: Risk Profiling
          → Step 4: Strategy Development (Financial Planner + Tax Advisor parallel)
          → [Gate G1: Strategy Alignment]
               → Aligned: Step 5: Plan Document Creation
               → Misaligned: Step 4b: Strategy Reconciliation → Step 5
          → Step 5: Human Checkpoint — Client Review
               → Approved: Step 6: Compliance Check
               → Revisions requested: Step 5b: Plan Revision → Step 5 (max 2 loops)
          → Step 6: Compliance Check Workflow [sub-workflow invocation]
               → Passed: Step 7: Plan Finalization
               → Failed: Step 6b: Remediation → Step 6 (max 1 retry)
          → Step 7: Plan Delivery and Next Steps
          → [Output: Delivered financial plan + implementation roadmap]

## Processing Steps (abbreviated)

### Step 4 — Strategy Development (Parallel execution)
Financial Planner AI: Protection strategy using 40_Skill_Decision_ProductSelection.md
Tax Advisor AI:       Tax optimization strategy using 40_Skill_Decision_TaxStrategy.md
Both run in parallel with the same client profile as input.
Output: Two strategy documents — protection and tax

[Gate G1]: Are protection strategy and tax strategy mutually consistent?
  → Evaluated by: Financial Planner AI using Decision Framework Stage S7 (Trade-offs)
  → If consistent: proceed to Step 5
  → If conflict: Step 4b — Financial Planner AI and Tax Advisor AI collaborate to reconcile

### Step 8 — Compliance Check (Human-in-the-Loop)
Assigned to: Compliance Persona (if available) / Financial Planner AI + Human reviewer
Type: Approval-based
Action: Complete Financial Plan submitted for regulatory compliance review.
        Human compliance officer reviews against OIC regulations.
        [Paused until human response received — timeout: 2 business days]
Output: Compliance approval (with any conditions) or rejection with specific findings
```

---

## Example 3 — Creative Workflow: Content Production

**Workflow ID:** `20_Workflow_Creative_ContentProduction`  
**Category:** Creative  
**Business objective:** Produce brand-aligned, audience-calibrated social media content consistently across platforms, from topic brief to published post.

**Structure preview:**

```markdown
# Content Production Workflow
### AIOS Workflow — Creative
**Trigger Type:** On-demand (content brief provided) or Scheduled (weekly content batch)
**Estimated Duration:** Medium (2–4 hours per content batch)
**Human-in-the-Loop:** Yes — Step 4 (human review before publication)
**Multi-Persona:** No — CMO AI (Lead throughout)

## Processing Steps

### Step 1 — Topic and Audience Alignment
Assigned to: CMO AI (Lead)
Type: Persona judgment
Action: CMO AI reviews content brief against Content Pillars (30_KB_CO_BrandOS.md)
        and identifies target persona from 30_KB_CU_[Segment].md
        Applies Decision Framework Stage S2 (True Goal):
        "Is this content educating or promoting? Is the audience correct?"
Output: Approved topic, content pillar classification, target persona, education/promotion ratio

### Step 2 — Content Drafting (per platform)
Assigned to: CMO AI (Lead)
Type: Skill invocation
Action: For each required platform, invoke 40_Skill_Creation_SocialMediaContent.md
        with: {approved_topic, core_message, target_persona, platform, brand_tone}
        [Parallel execution for multiple platforms]
Output: Draft content per platform

### Step 3 — Brand Review
Assigned to: CMO AI (Lead)
Type: Skill invocation
Action: Invoke 40_Skill_Review_ContentQuality.md with: {draft_content, brand_rules}
Output: Review report — pass or fail per item with specific revision notes

### Step 3a — Revision Loop (if review fails)
[Review and Revision pattern — maximum 2 iterations]
CMO AI revises draft per review notes, re-invokes Review Skill.
If still failing after 2 iterations: escalate to human creative review.

### Step 4 — Human Checkpoint: Publication Approval
Type: Approval-based (timeout: 24 hours)
Human reviews final draft. Approves, requests changes, or rejects.

### Step 5 — Publication and Logging
Post-approval: Content delivered to publication channel.
Log: content title, platform, date, target persona, content pillar, human approver.
```

---

## Example 4 — Compliance Workflow: Recommendation Compliance Check

**Workflow ID:** `20_Workflow_Compliance_RecommendationCheck`  
**Category:** Compliance  
**Business objective:** Ensure every significant AI recommendation is validated against regulatory requirements and AI Principles before delivery to a client.

**Structure preview:**

```markdown
# Recommendation Compliance Check Workflow
### AIOS Workflow — Compliance
**Trigger Type:** Event-driven (triggered automatically before any major recommendation delivery)
**Estimated Duration:** Short (30–60 minutes)
**Human-in-the-Loop:** Yes — if Principles or regulatory violation detected
**Multi-Persona:** No — Compliance Persona (Lead) / Financial Planner AI if no Compliance Persona

## Trigger
This Workflow is triggered automatically before any recommendation that involves:
- A specific product recommendation to a specific client
- A tax strategy with financial impact > [defined threshold]
- A financial plan document for client delivery
It is NOT triggered for general educational content or preliminary analyses.

## Processing Steps

### Step 1 — Principles Compliance Check
Type: Skill invocation
Action: Invoke 40_Skill_Validation_PrinciplesCompliance.md with: {recommendation_document}
Output: {status: pass|fail|warning, violations: [...], warnings: [...]}

[Gate G1]: Principles Check result
  → Pass: → Step 2
  → Warning: → Step 2 (with warning noted in execution record)
  → Fail: → CRITICAL EXCEPTION — halt; surface violation; escalate to human review
           [Workflow cannot proceed past a Principles violation]

### Step 2 — Regulatory Suitability Check
Type: Skill invocation
Action: Invoke 40_Skill_Validation_ProductSuitability.md
        with: {recommendation, client_profile, 30_KB_RE_OICRegulations.md}
Output: {suitability_status: suitable|unsuitable|conditional, findings: [...]}

[Gate G2]: Suitability result
  → Suitable: → Step 3
  → Conditional: → Step 3 with conditions noted
  → Unsuitable: → Escalation: notify Financial Planner AI + human review

### Step 3 — Compliance Record
Type: Automated
Action: Generate compliance record: {workflow_id, recommendation_id, timestamp,
        principles_check_result, suitability_result, reviewer, status}
Output: Compliance record stored; recommendation cleared for delivery (if steps 1 and 2 passed)
```

---

## Example 5 — Automation Workflow: Knowledge Review Trigger

**Workflow ID:** `20_Workflow_Auto_KnowledgeReviewTrigger`  
**Category:** Automation  
**Business objective:** Ensure all Knowledge documents are reviewed before their freshness expires — preventing Personas and Skills from operating on stale knowledge without awareness.

**Structure preview:**

```markdown
# Knowledge Review Trigger Workflow
### AIOS Workflow — Automation
**Trigger Type:** Scheduled — runs weekly (every Monday, 08:00)
**Estimated Duration:** Short (automated; <30 minutes)
**Human-in-the-Loop:** Yes — notification to Knowledge Manager; review execution is human
**Multi-Persona:** No — System Automation (no Persona required)

## Trigger
Scheduled execution every Monday. Does NOT require human initiation.
Also triggered event-driven when any regulatory publication is detected that
may affect a Regulatory Knowledge document.

## Processing Steps

### Step 1 — Read Knowledge Index
Action: Read 30_KB_RF_Index.md — retrieve all Active Knowledge documents
        with their Last Reviewed dates and Review Cycles
Output: Full list of Active Knowledge documents with metadata

### Step 2 — Calculate Freshness Status
Action: For each document:
        Days since last review = Today − Last Reviewed
        Review cycle days = [from document metadata]
        Status:
          < 80% of cycle: Current
          80–100% of cycle: Aging (approaching due)
          > 100% of cycle: Stale (overdue)
Output: Freshness status for each document

### Step 3 — Generate Review Report
Action: Invoke 40_Skill_Creation_ReportGenerator.md
        with: {stale_documents, aging_documents, current_count}
Output: Weekly Knowledge Freshness Report

### Step 4 — Notify Knowledge Manager
Action: Deliver report to Knowledge Manager with:
        Priority 1: Stale documents (overdue — action required)
        Priority 2: Aging documents (due within next 14 days)
        Priority 3: Summary statistics
Output: Report delivered

### Step 5 — Log Execution
Action: Record execution: {date, documents_checked, stale_count, aging_count, notifications_sent}
Output: Execution log entry

## Exception Handling
E1: Knowledge Index not readable
    Classification: Critical
    Response: Alert Knowledge Manager immediately; do not attempt to derive status from memory
    Message: "Knowledge Index unavailable. Manual review required."

E2: Zero documents found
    Classification: Critical (Index likely empty or misconfigured)
    Response: Alert Knowledge Manager + system administrator
```

---

# Part X — Reusable Template

The following is the complete, copy-ready template for creating a new AIOS Workflow document. Replace all `[placeholder]` values. Delete `[Conditional]` sections if the condition does not apply. Delete this instruction before activating the Workflow.

---

```markdown
# [Workflow Name]
### AIOS Workflow — [Category Name]
**Workflow ID:** 20_Workflow_[Category]_[Name]
**Version:** 1.0.0
**Effective Date:** [YYYY-MM-DD]
**Last Reviewed:** [YYYY-MM-DD]
**Status:** Draft
**Workflow Category:** [Operational | Analytical | Creative | Decision Support | Customer Service | Research | Financial Planning | Compliance | Automation]
**Estimated Duration:** [Short (<1 hour) | Medium (1–8 hours) | Long (>8 hours / multi-session)]
**Human-in-the-Loop:** [Yes — at steps [N] | No]
**Multi-Persona:** [Yes — Personas: [list] | No — Single Persona: [name]]
**Trigger Type:** [On-demand | Scheduled | Event-driven]

---

## Business Objective

[What specific outcome does this Workflow produce?
What is the client or organizational benefit when it executes well?
Which AI Principle or organizational goal does it serve?
What is the consequence of NOT having this Workflow?]

---

## Trigger

**Trigger Type:** [On-demand | Scheduled | Event-driven]

**Trigger Conditions:**
This Workflow is initiated when:
1. [Primary trigger condition]
2. [Secondary condition, if applicable]

**Who may initiate this Workflow:**
- [Authorized persona or role]
- [System trigger source, if automated]

**Trigger Frequency:** [Once per [event] | Daily | Weekly | As needed]

**NOT triggered by:** [Common confusion — what should NOT start this Workflow]

---

## Preconditions

All of the following must be confirmed before this Workflow begins:

### Data Preconditions
- [ ] [Required data is available]
- [ ] [Data freshness requirement]

### Component Preconditions
- [ ] Required Personas are available and operating under current Foundation documents
- [ ] Required Skills are Active and within their review cycles
- [ ] Required Knowledge documents are Active and within freshness thresholds

### Authorization Preconditions
- [ ] [Authorization requirement]
- [ ] No AI Principle violation would result from executing this Workflow

### Context Preconditions
- [ ] Core Context loaded (AI Vision, Principles, Decision Framework, Persona, Runtime)
- [ ] User Context assembled (if this Workflow serves a specific user)
- [ ] [Domain-specific context requirement]

**If any precondition is false:** [Define the specific response]

---

## Required Personas

| Persona | Document | Role | Steps Assigned |
|---------|----------|------|---------------|
| [Persona name] | `[10_Persona_Name.md]` | [Lead / Support / Reviewer / Approver] | [Step numbers] |

---

## Required Skills

| Skill | Document | Invoked at Step | Inputs | Output Used In |
|-------|----------|----------------|--------|---------------|
| [Skill name] | `[40_Skill_Name.md]` | Step [N] | [Input list] | Step [N+X] |

---

## Required Knowledge

| Knowledge Document | Used At | Purpose | Freshness |
|-------------------|---------|---------|-----------|
| `30_KB_[Name].md` | Step [N] | [Why needed] | [Requirement] |

---

## Inputs

### Required Inputs
| Input | Type | Description | Source | Example |
|-------|------|-------------|--------|---------|
| [Input name] | [Type] | [Description] | [Source] | [Example] |

### Inputs Assembled During Workflow
| Input | Type | Produced at Step | Used at Step |
|-------|------|-----------------|-------------|
| [Input name] | [Type] | Step [N] | Step [N+X] |

### Optional Inputs
| Input | Type | Description | Default if Absent |
|-------|------|-------------|------------------|
| [Input name] | [Type] | [Description] | [Default] |

---

## Processing Steps

### Step 1 — [Step Name]
**Assigned to:** [Persona name] (Lead)
**Type:** [Persona judgment | Skill invocation | Decision gate | Human checkpoint | Automated]
**Input:** [What this step consumes]
**Action:** [Specific action — what the assigned Persona or Skill does]
**Expected output:** [What this step produces]
**Quality check:** [How to verify this step's output before proceeding]
**On failure:** See Exception E[N]

### Step 2 — [Step Name]
**Assigned to:** [Persona name] (Lead)
**Type:** [Type]
**Input:** [Input]
**Action:** [Action]
**Expected output:** [Output]
**Quality check:** [Check]
**On failure:** See Exception E[N]

[Add steps as needed]

### Workflow Map
```
[Trigger] → Step 1 → Step 2 → [Gate G1]
                                 → If [A]: Step 3 → [Output]
                                 → If [B]: Step 4 → [Output]
```

---

## Decision Gates
[Conditional — required when any step contains a branch]

### Gate G1 — [Name]
**Located at:** After Step [N]
**Decision type:** [Binary | Multi-path | Threshold]
**Evaluated by:** [Persona | Automated | Human]
**Evaluation criteria:**
  - [Criterion 1]
  - [Criterion 2]
**Paths:**
  - If [A]: → Step [N+1]
  - If [B]: → Step [N+X]
  - If [undeterminable]: → Escalation
**Decision Framework stages applied:** [Stage numbers]
**Documentation required:** [What is recorded]

---

## Exception Handling

### Exception Classification
| Class | Definition | Response |
|-------|-----------|---------|
| Recoverable | Can continue after resolution | Resolve and continue |
| Partial | Some steps possible; others not | Complete what is possible; disclose gaps |
| Critical | Cannot produce reliable output | Halt; notify; do not deliver |

### Exception E1 — [Name]
**Trigger:** [What causes this exception]
**Classification:** [Recoverable | Partial | Critical]
**Detection:** [How to recognize it]
**Immediate response:**
  1. [Action 1]
  2. [Action 2]
**Notification:** [Who is notified and how]
**Recovery path:** [Steps to resume, if recoverable]
**Documentation:** [What is recorded]

### Exception E2 — [Name]
[Same structure]

### General Exception Principles
- Never present partial output as complete output
- Preserve all completed step outputs regardless of exception
- Log every exception in the execution record
- Principles violations are always Critical — halt immediately

---

## Outputs

### Primary Output
**Format:** [Structure or format]
**Content:** [What it contains]
**Recipient:** [Who receives it]
**Delivery method:** [How it is delivered]

### Execution Record
Every completed instance produces an execution record containing:
- Workflow ID and version executed
- Trigger: timestamp and source
- Inputs received
- Steps completed (with timestamps and Persona assignments)
- Decision Gate outcomes (criteria evaluated + result)
- Exceptions encountered and resolution
- Primary output reference
- Completion status: [Complete | Partial | Failed]

---

## Success Criteria

This Workflow is successful when:

1. **Completion:** All required steps completed in defined sequence
2. **Output quality:** Primary output meets format and content requirements
3. **Principles compliance:** No step required a Principles violation
4. **Exception management:** All exceptions classified, handled, and documented
5. **Timeliness:** Completed within estimated duration or delay documented
6. [Workflow-specific criterion 1]
7. [Workflow-specific criterion 2]

| Criterion | How Measured | Threshold |
|-----------|-------------|-----------|
| Step completion | Steps completed / Total | 100% (or documented partial) |
| Output conformance | Validation checklist | Pass |
| Principles compliance | Principles Check Skill | Pass |
| Exception rate | Exceptions per 10 executions | [Define] |

---

## Failure Conditions

This Workflow has failed when:

1. A Critical exception cannot be resolved within the session
2. A Principles violation is detected and proceeding would require committing it
3. A required component is unavailable with no acceptable alternative
4. The primary output cannot be produced
5. [Workflow-specific failure condition]

**Failure response:**
1. Halt immediately
2. Preserve completed step outputs
3. Document the failure condition
4. Notify: [party and method]
5. Log: failure in execution record
6. Do not deliver any output as if the Workflow succeeded

---

## Dependencies

| Dependency | Type | Impact if Changed |
|-----------|------|-----------------|
| `10_Persona_[Name].md` | Persona | Affects steps [N] |
| `40_Skill_[Name].md` | Skill | Affects step [N] |
| `30_KB_[Name].md` | Knowledge | Affects preconditions and steps [N] |
| `04_AI_Constitution.md` | Architectural | Workflow boundary definitions |
| `02_AI_Decision_Framework.md` | Process | Decision Gate methodology |
| [Other dependency] | [Type] | [Impact] |

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0.0 | [YYYY-MM-DD] | [Author] | Initial Workflow definition |
```

---

## Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 1.0 | 2026-06-25 | Chief Process Architect | Initial Workflow Standard — 10 Parts, 9 Workflow Categories, 16 required Workflow sections, 7 Workflow Patterns, full Orchestration and Error Handling frameworks, 5 worked examples, and reusable template |

---

*This document is the standard governing all Workflow documents within AIOS (Layer 9). It is governed by Layers 1–8 of the AIOS architecture. Any Workflow document that does not comply with this standard is not a valid AIOS Workflow artifact and may not be executed by Personas or automated systems until it is brought into compliance.*
