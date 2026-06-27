# 05 — Context Selection Rules

**Document ID**: AIOS-ACE-05  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines the rules ACE applies when deciding what to include in and exclude from the `ExecutionContext`. These rules govern the selection step, which happens across Steps 06–12 of the assembly pipeline.

---

## Governing Principle: Minimal Sufficient Context

**Rule**: Include only what is necessary for the LLM to make the correct decision for THIS turn. Nothing more.

More context is not better context. Including irrelevant documents:
- Dilutes the signal of critical constraints
- Increases token cost
- Makes restrictions harder to notice
- Increases risk of the LLM attending to wrong information

---

## Selection Rule Set

### SR-SEL-01: Intent-Based Loading

Only load knowledge and patterns that are relevant to the detected primary intent.

| Intent | Load | Do NOT load |
|---|---|---|
| `trust_concern` | Trust Engine, ACP-08 Restrictions, identity verification | Product knowledge, pricing, lead capture flow |
| `product_health` | Health insurance knowledge, ACP-02 | Medical underwriting, tax knowledge |
| `medical_question` | Medical underwriting, ACP-04, underwriting uncertainty | Investment products, retirement |
| `product_tax` | Tax knowledge, product fit, income bracket info | Medical, retirement, claims |
| `claim_help` | Claim process, ACP-15, document requirements | Product sales, lead capture |
| `unclear` | ACP-10 NEED_DISCOVERY, discovery question patterns | Any product-specific knowledge |

---

### SR-SEL-02: Capability-Based Loading

Load ACP documents only for the selected primary and secondary capabilities.

- Primary ACP: load fully (all 6 spec sections)
- Secondary ACP: load Restrictions.md and Response_Profile.md only
- Unselected ACPs: load NOTHING

---

### SR-SEL-03: Trust-First Loading

If `is_trust_signal = true`:
1. Load ACP-08 Restrictions.md FIRST
2. Load trust verification knowledge SECOND
3. All other knowledge loading is SUSPENDED until ACP-08 resolves

This ensures trust-related restrictions enter context before any knowledge that might suggest lead capture or product recommendation.

---

### SR-SEL-04: Medical-First Loading

If `is_medical_signal = true`:
1. Load ACP-04 Restrictions.md FIRST (especially: never guarantee outcomes)
2. Load medical underwriting knowledge SECOND
3. Load general product knowledge THIRD only if needed

---

### SR-SEL-05: Lead-Safe Loading

If `trust_profile.lead_capture_allowed = false`:
- Remove `COLLECT_LEAD` from available actions in decision context
- Do not load lead capture flow instructions
- Do not include lead collection prompts in response profile

If `risk_profile.emergency_detected = true`:
- Remove ALL lead capture context
- Load emergency guidance only

---

### SR-SEL-06: No Irrelevant Documents

ACE must NOT load:
- Knowledge documents not referenced in the selected ACP's Knowledge_Map
- ConversationDataset documents not referenced in the selected ACP
- Learning patterns not validated (trust level < HIGH)
- Documents from unregistered sources (not in SR-04 Source Registry)

---

### SR-SEL-07: No Duplicate Knowledge

If two knowledge sources contain the same fact:
- Load only the source with the HIGHER trust level
- If equal trust: load the more specific source (e.g., Medical.md over FAQ.md for medical question)
- Log duplication in `debug`

---

### SR-SEL-08: No Application-Specific Leakage

ACE must NOT include:
- LINE webhook IDs or user IDs in knowledge context
- Vercel deployment environment details
- OpenAI model-specific configuration
- Google Sheets row IDs or field mappings
- Any runtime infrastructure details in the knowledge or decision context

Application-specific details exist in the Application Adapter layer (Layer 4) and must not be reflected back into the AIOS core context.

---

### SR-SEL-09: Conversation Pattern Always Included

Patterns from `CID-20_CONVERSATION_PATTERNS.md` (master patterns CP-01 through CP-10) are **always included** in `selected_conversation_patterns`, regardless of intent.

These patterns are the foundational behavioral rules and must be present in every context assembly.

---

### SR-SEL-10: Restriction Inheritance

If secondary capabilities are loaded, their Hard Prohibitions are **inherited** into the primary context.

Example: If ACP-02 (HEALTH_ADVISOR) is primary and ACP-08 (TRUST_ADVISOR) is activated as an interrupt:
- ACP-08's hard prohibitions (never ask for data during trust concern) are added to the restriction set
- ACP-02's restrictions are suspended while ACP-08 is active
- On ACP-08 resolution, ACP-02 restrictions are restored

---

## Selection Exclusion Checklist

Before finalizing context, verify:

- [ ] No knowledge from unregistered sources
- [ ] No knowledge with relevance score < 0.5
- [ ] No lead capture context when `lead_capture_allowed = false`
- [ ] No product knowledge when `is_trust_signal = true` and trust not resolved
- [ ] No duplicate knowledge from multiple sources
- [ ] No LINE/Vercel/OpenAI-specific details in knowledge context
- [ ] CID-20 master patterns always present

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial selection rules |
