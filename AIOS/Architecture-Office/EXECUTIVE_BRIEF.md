# AIOS Executive Brief

## 1. Executive Summary
AIOS is evolving from a LINE chatbot project into a reusable AI Operating System for multiple AI Departments.

The current repository contains an active LINE AI Advisory application, a growing AIOS platform architecture, emerging runtime work, and the first standards for AI workforce governance. AIOS should be understood as a long-term business operating layer for AI-powered departments, not as a single chatbot, prompt collection, or model-specific application.

This brief is the 5-minute starting point for any AI worker, coding agent, reviewer, or future LLM joining the project.

## 2. Vision
AIOS is not a single AI agent or app.

AIOS is a role-based AI Business Operating System designed to support multiple AI Departments and AI-powered business functions, including:

- AI Marketing Department (AIMD)
- AI Sales Department
- AI Finance Department
- AI Operations Department
- LINE AI Advisory

Each department should operate through reusable architecture, clear roles, governed knowledge, capability packages, runtime contracts, learning systems, and human approval.

## 3. Mission
AIOS enables the owner to operate multiple AI-powered business functions using reusable architecture, domain packages, capability packages, runtime contracts, learning systems, and human approval.

The mission is to make AI work consistent, governed, scalable, and maintainable across business functions without depending on one AI vendor, one runtime, one application, or one prompt strategy.

## 4. Core Principles
- **Architecture First:** Understand and preserve the system structure before execution.
- **Context First:** Read the relevant source-of-truth documents before acting.
- **Strategy before Execution:** Clarify direction and boundaries before implementation.
- **Business Goal before Features:** Features must serve an approved business purpose.
- **Reusable Knowledge:** Knowledge should be structured once and reused across departments and applications.
- **Human Approval:** Product direction, architecture changes, reusable knowledge changes, and destructive operations require approval.
- **LLM Independence:** AIOS must not depend on Claude, Codex, ChatGPT, Gemini, or any other single model/vendor.
- **Department-Based Design:** AI business functions should be organized as departments with clear responsibilities.
- **Separation of Concerns:** Keep AIOS core, departments, domains, runtime, applications, and shared assets distinct.

## 5. Current Active Projects
- **LINE AI Advisory:** The current active application. It uses LINE, Next.js, OpenAI integration, lead capture, CRM/handoff flows, and insurance advisory behavior.
- **AIMD:** The upcoming AI Marketing Department. It is being defined as an AIOS Department Composition, not as a standalone app or content generator.
- **AIOS Core Standards:** The platform standards, governance rules, onboarding process, and architecture direction are currently being formalized.
- **AI Workforce Management:** The operating model for multiple AI workers is emerging, including role assignment, permission boundaries, collaboration flow, and review expectations.

## 6. AIMD Direction
AIMD is not a content generator.

AIMD is an AIOS Department Composition responsible for:

- Marketing Strategy
- Campaign Planning
- Brand Management
- Content Planning
- Creative Production
- Performance Review
- Learning

AIMD should initially live under:

```text
AIOS/Departments/AIMD/
```

A future runnable app or dashboard may later live under:

```text
Applications/AIMD_App/
```

The department intelligence and the runnable application surface must remain separate unless an approved architecture decision changes that boundary.

## 7. AI Workforce Model
AIOS assigns responsibility by role, not AI vendor. The canonical source of truth for role allocation, vendor mapping, decision authority, escalation, and RACI is:

```text
AIOS/Architecture-Office/AI_OPERATING_MODEL.md
```

Current summary:

- The Human Product Owner owns product direction, final approval, and production deployment.
- ChatGPT currently supports strategy, AIOS architecture, governance review, Visual DNA, and cross-project consistency.
- Claude Code currently supports runtime implementation, large codebase work, architecture execution, and large implementation tasks.
- Claude currently supports long-form writing, content production, marketing drafts, and knowledge drafting.
- Codex currently supports repository structure, refactoring, static analysis, tests, performance, and code quality.

These mappings are configurable operational defaults. Roles remain stable even when AI vendors or tools change.

## 8. Repository Direction
AIOS should evolve toward a clearer platform and application structure:

```text
AIOS/
  Architecture-Office/
  Departments/
  Domains/
  CapabilityPackages/
  Runtime/
  Registry/
  Learning/

Applications/
  Line_Chatbot_AI/
  AIMD_App/  # future only

Shared/
  contracts/
  schemas/
  adapters/
  integrations/
```

Do not force this refactor immediately. Repository movement should happen only through approved architecture decisions, clear migration plans, and scoped engineering tasks.

## 9. What Not To Change
- Do not treat AIMD as only a content generator.
- Do not hardcode business-specific logic into AIOS Core.
- Do not modify reusable knowledge without approval.
- Do not silently refactor repository structure.
- Do not mix application runtime with AIOS architecture documents.
- Do not assume Claude, Codex, ChatGPT, Gemini, or any other AI system is a permanent dependency.
- Do not create duplicate standards without checking existing files.

## 10. Current Open Questions
- How should `runtime-gen1` be generalized beyond LINE/insurance?
- What is the official department package standard?
- What is the minimum registry metadata for new departments?
- When should capabilities be promoted from department-specific to AIOS-global?
- How should AIMD Lite connect to full AIMD later?

## 11. Required AI Behavior
Any AI joining this project must:

1. Read this Executive Brief.
2. Read `AI_WORKFORCE_ONBOARDING.md` if available.
3. Read `AI_OPERATING_MODEL.md` when role allocation, ownership, escalation, or decision authority matters.
4. Identify its assigned role.
5. Confirm permission level.
6. Analyze before modifying.
7. Ask questions if context is missing.
8. Wait for approval before changing architecture or reusable knowledge.
