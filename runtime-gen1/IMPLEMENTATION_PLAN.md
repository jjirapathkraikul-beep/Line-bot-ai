# Runtime Gen1 Implementation Plan

**Document ID**: GEN1-PLAN-01  
**Version**: 1.0  
**Date**: 2026-06-27  
**Status**: Approved for Implementation  
**Authority**: Senior Software Architect

---

## 1. V1 Freeze Policy Summary

V1 (`v1.9-stability`) is frozen as of 2026-06-27.

**Allowed after freeze**:
- Emergency production bug fixes (infrastructure breakage only)
- Security/dependency patches
- Environment variable changes (no logic)

**Not allowed after freeze**:
- New intent detection rules
- New state machine states
- Prompt improvements
- New lead capture flows
- Hardcoded medical/trust response additions
- Any route.ts logic changes beyond the feature flag insertion (Phase 10.1)

Full freeze policy: `runtime-v1/README.md`

---

## 2. Reuse / Replace Matrix

### A — REUSE (Infrastructure — wrap, do not refactor)

| File | Gen1 Role | Wrapper |
|---|---|---|
| `lib/session.ts` | KV session store | `runtime-gen1/memory/memoryAdapter.ts` |
| `lib/openai.ts` | LLM client | `runtime-gen1/response/responseComposer.ts` |
| `lib/lead.ts` | CRM upsert | `runtime-gen1/adapters/line/crmAdapter.ts` |
| `lib/sheet.ts` | Google Sheets FAQ | `runtime-gen1/knowledge/knowledgeRegistry.ts` |
| `lib/admin.ts` | Admin commands | Unchanged — called from route.ts pre-dispatch |
| `lib/adminNotify.ts` | Admin LINE push | Unchanged — called from Gen1 handoff output |
| `lib/leadService.ts` | CRM save scenarios | Adapter: Gen1 maps ExecutionOutput.lead_update → leadService calls |
| `@line/bot-sdk` | LINE API client | Shared — Gen1 adapter uses same client instance |

### B — FREEZE / REPLACE (Business logic — Gen1 owns this entirely)

| V1 File | Lines | Replace With | Gen1 Component |
|---|---|---|---|
| `lib/leadCapture.ts` | 884 | ACP-11 + ACE Decision Engine | `runtime-gen1/decision/` + `context/` |
| `lib/prompt.ts` | 112 | ACE Context Serializer | `runtime-gen1/response/contextSerializer.ts` |
| `lib/trustEngine.ts` | 42 | ACP-08 + ACE | `runtime-gen1/capability/` + `context/` |
| `lib/medicalEngine.ts` | 48 | ACP-04 + ACE | `runtime-gen1/capability/` + `context/` |
| `lib/intentClassifier.ts` | 132 | Gen1 Intent Detector + ACE fast-paths | `runtime-gen1/capability/intentDetector.ts` |
| `lib/scorer.ts` | 12 | ACP-09 scoring rules | `runtime-gen1/capability/` |
| Intent router in `route.ts` | ~300 | `runtime-gen1/core/aiosRuntime.ts` | Dispatched via feature flag |

### C — NEEDS ADAPTER (Schema translation required)

| V1 Component | Issue | Gen1 Adapter |
|---|---|---|
| V1 session schema | Mixed: state + lead fields + display name in one object | `sessionMapper.ts` — maps to Gen1 `SessionMemory` |
| CRM payload | V1 sends raw fields; Gen1 uses typed `lead_update` | `crmAdapter.ts` — maps `ExecutionOutput.lead_update` → `upsertLead()` |
| Audit log | 21-line stub, no schema | `auditEventSchema.ts` — full ConversationAuditEvent |
| LINE Quick Replies | V1 builds inline; Gen1 uses `ExecutionOutput.responses` | `outputMapper.ts` — maps response.type=QUESTION → QuickReply |
| LINE Flex Messages | V1 uses `richMessages.ts` directly | `outputMapper.ts` — wraps richMessages for handoff scenario |

---

## 3. Phase 10 Implementation Roadmap

### Phase 10.0 — Pre-Implementation Documentation Fix (DONE)

Resolved documentation gaps from AIRR v1.0:
- [x] Capability Registry Reconciliation (CAP↔ACP mapping)
- [x] Knowledge Path Registry (canonical paths)
- [x] AEE↔ACE Integration Point (pipeline doc updated)
- [ ] Application Adapter Bridge Contract — Phase 10.8 will produce this

---

### Phase 10.1 — Runtime Interfaces + Feature Flag (3 days)

**Goal**: Establish the Gen1 entry point and type contracts. V1 continues running for all users.

**Tasks**:
1. Create `runtime-gen1/core/types.ts` — `ExecutionInput`, `ExecutionOutput`, `ExecutionContext` TypeScript types from AIOS schema
2. Create `runtime-gen1/core/aiosRuntime.ts` — stub `handleGen1()` that returns a safe fallback response
3. Modify `route.ts` — add feature flag check (one `if` block; does not touch V1 logic):
   ```typescript
   if (process.env.AI_RUNTIME_MODE === 'gen1') {
     return handleGen1(event, client, session)
   }
   ```
4. Set `AI_RUNTIME_MODE=v1` in production (no behavior change)
5. Test: verify V1 still works after the flag insertion

**Acceptance criteria**:
- `AI_RUNTIME_MODE=v1` → V1 behavior identical to pre-flag
- `AI_RUNTIME_MODE=gen1` → safe fallback text returned (stub)
- TypeScript builds without errors

---

### Phase 10.2 — Intent Detector + Capability Loader (3 days)

**Goal**: Classify customer intent and select the correct ACP package.

**Tasks**:
1. Create `runtime-gen1/capability/intentDetector.ts`:
   - Thai NFC normalization
   - Fast-path flags: `is_trust_signal`, `is_emergency`, `is_medical_signal`
   - Intent classification: keyword-first (port V1 keywords); LLM fallback for unclear
2. Create `runtime-gen1/capability/capabilityRegistry.ts`:
   - CAP-to-ACP mapping table (from `AIOS/AIRR/Capability_Registry_Reconciliation.md`)
3. Create `runtime-gen1/capability/capabilityLoader.ts`:
   - Intent + fast-path flags → primary ACP identifier
   - Priority: CRITICAL (ACP-08) → HIGH (ACP-16, ACP-15) → STANDARD

**Acceptance criteria**:
- Thai input "มิจฉาชีพไหม" → `is_trust_signal = true` → ACP-08
- Thai input "อยู่โรงพยาบาล" → `is_emergency = true` → ACP-16
- Thai input "ประกันสุขภาพ" → `detected_intent = product_health` → ACP-02
- Thai input "ลดหย่อนภาษี" → `detected_intent = product_tax` → ACP-05

---

### Phase 10.3 — Memory Adapter (3 days)

**Goal**: Read and write session memory in the Gen1 schema. Protect known fields.

**Tasks**:
1. Create `runtime-gen1/memory/memoryAdapter.ts` — implements `MemoryInterface`; wraps `lib/session.ts`
2. Create `runtime-gen1/memory/sessionMapper.ts` — V1 session → Gen1 `SessionMemory`
3. Create `runtime-gen1/memory/leadProfileStore.ts` — `fields_captured` protection
4. Create `runtime-gen1/memory/trustProfileStore.ts` — trust concern state management

**Acceptance criteria**:
- Field captured in turn 1 → not in collection targets in turn 2
- Trust concern in turn 1 → `lead_capture_allowed = false` in turns 1 and 2
- `turns_since_trust_concern = 2` → `lead_capture_allowed = true` resumes
- Session missing → all fields null; treat as new session

---

### Phase 10.4 — Knowledge Resolver (3 days)

**Goal**: Load and excerpt domain knowledge by intent.

**Tasks**:
1. Create `runtime-gen1/knowledge/knowledgeRegistry.ts` — path registry from `AIOS/AIRR/Knowledge_Path_Registry.md`
2. Create `runtime-gen1/knowledge/markdownParser.ts` — read AIOS .md files → text
3. Create `runtime-gen1/knowledge/excerptScorer.ts` — relevance scoring
4. Create `runtime-gen1/knowledge/knowledgeResolver.ts` — intent → paths → scored excerpts
5. Add 5-minute in-memory cache for knowledge files (avoid file I/O per turn)
6. Verify mandatory inclusions: medical uncertainty language, investment risk disclosure

**Acceptance criteria**:
- Intent `product_health` → loads `Products/Health_Insurance.md` + `Knowledge/FAQ.md`
- Intent `trust_concern` → loads `Trust/Trust_Engine.md` + ACP-08 restrictions
- Intent `medical_question` → loads `Knowledge/Medical.md` with uncertainty language always included
- Intent `product_investment` → loads `Products/Investment_Linked.md` with risk disclosure always included

---

### Phase 10.5 — Decision Engine (2 days)

**Goal**: Resolve decision.action deterministically before LLM call.

**Tasks**:
1. Create `runtime-gen1/decision/actionTaxonomy.ts` — ACT-01 through ACT-12 types
2. Create `runtime-gen1/decision/constraintResolver.ts` — build active constraint list
3. Create `runtime-gen1/decision/decisionEngine.ts` — context → action with priority logic

**Acceptance criteria**:
- `is_trust_signal = true` → ACT-03 BUILD_TRUST regardless of other context
- `is_emergency = true` → ACT-08 EMERGENCY_GUIDE regardless of other context
- `trust_capture_allowed = false` → COLLECT_LEAD action is blocked
- `fields_captured includes 'name'` → name excluded from collection targets

---

### Phase 10.6 — Context Engine (ACE) (5 days)

**Goal**: Full 15-step context assembly pipeline.

**Tasks**:
1. Create `runtime-gen1/context/types.ts` — full `ExecutionContext` TypeScript type
2. Create `runtime-gen1/context/acpLoader.ts` — read ACP 11 files → typed fragments
3. Create `runtime-gen1/context/cidLoader.ts` — read CID files → behavioral patterns
4. Create `runtime-gen1/context/compressionEngine.ts` — token budget enforcement
5. Create `runtime-gen1/context/contextValidator.ts` — 28 validation rules
6. Create `runtime-gen1/context/contextEngine.ts` — 15-step orchestrator

**Acceptance criteria**: All 8 examples from `AIOS/ContextEngine/15_CONTEXT_EXAMPLES.md` produce correct context (manual verification against example outputs).

---

### Phase 10.7 — LLM Response Composer (3 days)

**Goal**: Send ExecutionContext to LLM; receive and validate structured response.

**Tasks**:
1. Create `runtime-gen1/response/contextSerializer.ts` — ExecutionContext → LLM string format
2. Create `runtime-gen1/response/responseComposer.ts` — wraps `lib/openai.ts`; sends context
3. Create `runtime-gen1/response/responseParser.ts` — LLM text → `Response[]`
4. Create `runtime-gen1/response/responseValidator.ts` — prohibited phrase check; question count

**Acceptance criteria**:
- LLM response containing prohibited phrase → regenerate
- LLM response containing two questions → regenerate with stricter constraint
- Response for trust scenario → does not contain product mention
- Response for emergency scenario → short, actionable, no lead capture

---

### Phase 10.8 — LINE Adapter (3 days)

**Goal**: Full LINE-to-Gen1 bridge. End-to-end LINE webhook → Gen1 → LINE reply.

**Tasks**:
1. Create `runtime-gen1/adapters/line/inputMapper.ts`
2. Create `runtime-gen1/adapters/line/outputMapper.ts`
3. Create `runtime-gen1/adapters/line/lineAdapter.ts` — full `handleGen1()` implementation
4. Wire `handleGen1()` into `route.ts` feature flag dispatch
5. Create `Applications/Line_Chatbot_AI/Integrations/AEE_Adapter_Contract.md` (AIRR GAP-H-03 fix)

**Acceptance criteria**:
- LINE "มิจฉาชีพไหม" → trust response delivered → no phone asked
- LINE "อยากทำประกันสุขภาพ" → education response → one follow-up question
- LINE "ขอชื่อจิราวัฒน์" → warm handoff → admin notified
- `AI_RUNTIME_MODE=gen1` → all above work end-to-end

---

### Phase 10.9 — Analytics + Learning Layer Wiring (2 days)

**Goal**: Emit ConversationAuditEvent after every Gen1 turn.

**Tasks**:
1. Create `runtime-gen1/analytics/auditEventSchema.ts`
2. Create `runtime-gen1/analytics/analyticsEngine.ts`
3. Create `runtime-gen1/analytics/auditWriter.ts`
4. Wire audit emission into `contextEngine.ts` (post-response, async)

---

### Phase 10.10 — Regression + Production Cutover (5 days)

**Goal**: Pass all regression tests; cut over production traffic to Gen1.

**Regression targets**:
- All 20 CID scenario intents correctly handled
- Trust flow: 2-turn suspension verified
- Medical flow: case-by-case language always included
- Emergency flow: no lead capture, immediate guide
- 10 Edge Cases (EC-01 through EC-10)
- Known-field protection: never re-ask captured fields
- V1 still works with `AI_RUNTIME_MODE=v1`

**Cutover sequence**:
1. Deploy with `AI_RUNTIME_MODE=v1` (no change for users)
2. Test `AI_RUNTIME_MODE=gen1` with 1 test LINE account
3. Expand to 5% of traffic (if Vercel supports traffic splitting)
4. Jirawat manual review of Gen1 conversations
5. Switch `AI_RUNTIME_MODE=gen1` for all traffic
6. Monitor for 48 hours
7. V1 code remains deployed (rollback = flip variable)

---

## 4. Risk Register

| Risk ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| RSK-G1-01 | `route.ts` becomes mixed legacy/new — V1 and Gen1 logic entangled | MEDIUM | HIGH | Feature flag dispatches to completely separate handler; V1 block untouched |
| RSK-G1-02 | ExecutionContext too large → LLM context window exceeded | MEDIUM | HIGH | Compression engine (Phase 10.6); test with real Thai conversations |
| RSK-G1-03 | LLM still under-informed — Gen1 context worse than V1 prompt | LOW | HIGH | Parallel quality test: same questions to V1 and Gen1; human comparison |
| RSK-G1-04 | CRM schema mismatch — V1 `upsertLead` fields don't match Gen1 `lead_update` | MEDIUM | MEDIUM | `crmAdapter.ts` maps explicitly; run CRM integration test before cutover |
| RSK-G1-05 | Session migration — returning customers with V1 sessions get broken Gen1 state | HIGH | MEDIUM | `sessionMapper.ts` handles V1 → Gen1 gracefully; treat unknown format as new session |
| RSK-G1-06 | LINE webhook downtime during cutover | LOW | HIGH | Cutover at low-traffic window; V1 rollback in < 2 minutes via env var |
| RSK-G1-07 | AIOS knowledge files incomplete or incorrect paths | MEDIUM | MEDIUM | Knowledge path registry + integration tests before cutover; AIRR GAP-H-02 resolved |
| RSK-G1-08 | No audit trace — Gen1 audit schema not wired | LOW | MEDIUM | Analytics Phase 10.9 before cutover; audit is a hard requirement for Learning Layer |
| RSK-G1-09 | Thai NFC normalization differences between V1 and Gen1 intent detection | LOW | LOW | Port V1 normalization exactly to `intentDetector.ts` first iteration |
| RSK-G1-10 | Admin commands bypass Gen1 entirely — admin sees inconsistent behavior | LOW | LOW | Admin commands handled in `route.ts` before feature flag dispatch; no change needed |

---

## 5. Cutover Strategy

### Three-Stage Feature Flag Plan

```
Stage 1: Shadow mode (V1 serves; Gen1 logs but does not reply)
  AI_RUNTIME_MODE=v1
  Gen1 assembles context + decides action + logs result
  V1 reply is sent; Gen1 result is logged to audit
  Duration: 1 week
  
Stage 2: Gen1 active for test accounts only
  AI_RUNTIME_MODE=gen1_test
  Gen1 serves only whitelisted test userId list
  Jirawat reviews Gen1 responses manually
  Duration: 1 week

Stage 3: Gen1 full production
  AI_RUNTIME_MODE=gen1
  All traffic to Gen1
  V1 code remains deployed
  Rollback: set AI_RUNTIME_MODE=v1 (< 2 minutes)
  Duration: indefinite
```

### Rollback Plan

If Gen1 produces a harmful, incorrect, or broken response:
1. Set `AI_RUNTIME_MODE=v1` in Vercel environment
2. Redeploy (Vercel instant env var reload on next request if supported; or redeploy)
3. V1 resumes serving all traffic
4. Audit Gen1 conversations to identify the failure
5. Fix in Gen1 (never fix in V1)

### V1 Retirement (Future — not in Phase 10 scope)

V1 code and infrastructure will be retired only after:
- Gen1 has served production traffic for 30 days without critical issues
- All V1 regression tests pass in Gen1
- Jirawat approves retirement
- ADR is written documenting the retirement decision

---

## 6. Test Strategy

### 6.1 Unit Tests

| Component | Test File | Cases |
|---|---|---|
| Intent Detector | `__tests__/gen1/intentDetector.test.ts` | 20 intents + 5 edge cases |
| Trust signal detection | " | "มิจฉาชีพ", "โกง", "ไว้ใจได้ไหม", "น่าเชื่อถือไหม" |
| Emergency detection | " | "อยู่โรงพยาบาล", "ฉุกเฉิน" |
| Medical detection | " | "ความดันโลหิตสูง", "เบาหวาน", "มะเร็ง" |
| Capability Loader | `__tests__/gen1/capabilityLoader.test.ts` | All 20 intent → ACP mappings |
| Memory Adapter | `__tests__/gen1/memoryAdapter.test.ts` | Known-field protection, trust suspension |
| Knowledge Resolver | `__tests__/gen1/knowledgeResolver.test.ts` | Path resolution, mandatory inclusions |
| Decision Engine | `__tests__/gen1/decisionEngine.test.ts` | All 12 actions, priority overrides |
| Context Validator | `__tests__/gen1/contextValidator.test.ts` | All 28 rules (HARD + SOFT) |

### 6.2 Conversation Tests

End-to-end context assembly tests (no LLM call — mock LLM):

| Test ID | Scenario | Expected Decision |
|---|---|---|
| CT-01 | "อยากทำประกันสุขภาพ" | ACT-02 ANSWER_THEN_ASK |
| CT-02 | "มิจฉาชีพไหม" | ACT-03 BUILD_TRUST; no lead capture |
| CT-03 | "เป็นความดันโลหิตสูง" | ACT-02 (medical); case-by-case language present |
| CT-04 | "อยู่โรงพยาบาล" | ACT-08 EMERGENCY_GUIDE; no lead capture |
| CT-05 | "ขอชื่อจิราวัฒน์" (after name already captured) | COLLECT_LEAD for phone; name excluded |
| CT-06 | Trust concern → 1 turn later → product question | lead_capture_allowed still false |
| CT-07 | Trust concern → 2 turns later → product question | lead_capture_allowed = true |
| CT-08 | "อยากทำ" mid-field-capture | Topic change handled; ACT-11 REDIRECT |

### 6.3 Regression Tests

Port all V1 regression tests to Gen1 format:
- All 20 ACP Regression.md cases (~140 cases total)
- All 10 edge cases from CID-19
- V1 existing `__tests__/intentRouter.test.ts` scenarios

### 6.4 Manual LINE Tests

Before cutover, manually test these scenarios via LINE:
1. First-time greeting → education response → no data collected
2. Trust concern → verify response + no phone asked for 2+ turns
3. Medical inquiry (hypertension) → case-by-case language present
4. Hospital emergency → immediate guide within 3 seconds
5. Product interest → recommendation → lead capture sequence
6. Return customer → name already known → not re-asked
7. Handoff request → admin notified → context package delivered
8. Admin commands (#reset, #testnotify) still work

### 6.5 Audit Trace Validation

Before cutover:
- Every Gen1 turn emits a ConversationAuditEvent
- All required fields are populated (no null audit_id, no missing decision_action)
- Trust events correctly flag `trust_signal_detected = true`
- Lead events correctly populate `fields_captured_this_turn`

---

## 7. Final Recommendation

**PROCEED with Phase 10 implementation in the sequence defined above.**

The V1 freeze policy protects production stability. The feature flag architecture guarantees instant rollback. The AIOS architecture provides sufficient specification for every Gen1 component.

**Critical success factors**:
1. Phase 10.6 (Context Engine) is the highest-risk component — allocate 5 days minimum
2. Run shadow mode (Stage 1 cutover) for at least 1 week before serving Gen1 to real customers
3. Jirawat must manually review Gen1 conversations before Stage 3 cutover
4. Never merge Gen1 changes into V1 files (use only `runtime-gen1/` and `adapters/`)

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial implementation plan — Phase 10.0 planning sprint |
