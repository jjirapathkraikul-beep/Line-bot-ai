# V1 Freeze Policy

**Version**: 1.9-stability (FROZEN)  
**Date Frozen**: 2026-06-27  
**Status**: FROZEN — Emergency fixes only  
**Authority**: Senior Software Architect

---

## What Is V1?

V1 is the current production LINE Chatbot AI codebase at version `v1.9-stability`. It handles all live customer conversations through a priority-based intent router and a stateful field-capture flow.

V1 is fully operational and deployed. It must not be modified beyond emergency bug fixes and infrastructure stability patches.

---

## V1 Code Boundary

All files below are frozen under this policy.

### Frozen Business Logic (DO NOT EXTEND)

| File | Size | What It Does | Why Frozen |
|---|---|---|---|
| `app/api/line-webhook/route.ts` | 681 lines | Priority intent router B→H + state handlers | Core V1 conversation orchestrator |
| `lib/leadCapture.ts` | 884 lines | Field capture state machine, resume, category flow | V1 state machine — do not expand |
| `lib/prompt.ts` | 112 lines | OpenAI system prompt builder | V1 prompt — Gen1 replaces this |
| `lib/trustEngine.ts` | 42 lines | Hardcoded trust/scam response | Gen1 replaces with ACP-08 + ACE |
| `lib/medicalEngine.ts` | 48 lines | Hardcoded medical response | Gen1 replaces with ACP-04 + ACE |
| `lib/intentClassifier.ts` | 132 lines | V1 keyword-based intent classifier | Gen1 replaces with ACE intent detection |
| `lib/scorer.ts` | 12 lines | Hardcoded lead scorer | Gen1 replaces with ACP-09 scoring |
| `lib/richMessages.ts` | 260 lines | LINE Flex/Rich message templates | Adapter layer in Gen1 |

### Frozen Infrastructure (REUSE PERMITTED — DO NOT REFACTOR)

| File | Size | What It Does | Gen1 Status |
|---|---|---|---|
| `lib/session.ts` | 139 lines | Vercel KV session read/write | Reuse via MemoryAdapter |
| `lib/openai.ts` | 128 lines | OpenAI chat completion client | Reuse via LLMAdapter |
| `lib/lead.ts` | 75 lines | CRM upsert (Vercel KV → Google Sheets) | Reuse via CRMAdapter |
| `lib/sheet.ts` | 74 lines | Google Sheets FAQ reader | Reuse via KnowledgeAdapter |
| `lib/admin.ts` | 110 lines | Admin command handler | Reuse unchanged |
| `lib/adminNotify.ts` | 115 lines | Admin LINE push notification | Reuse unchanged |
| `lib/leadService.ts` | 123 lines | CRM save helpers per scenario | Adapter in Gen1 |
| `lib/conversationAudit.ts` | 21 lines | Audit event logger (stub) | Expand in Gen1 |

---

## V1 Freeze Rules

### What Is Allowed in V1 After Freeze

1. **Emergency bug fixes** — production breakage that cannot wait for Gen1 cutover
2. **Infrastructure stability** — dependency security patches, Vercel KV connection issues, LINE SDK updates
3. **Environment variable changes** — adding/changing secrets, not logic changes
4. **Admin command fixes** — `#reset`, `#testnotify` bugs only
5. **Rate limiting tuning** — adjusting RATE_LIMIT_MAX or window (no logic change)

### What Is NOT Allowed in V1 After Freeze

| Action | Reason |
|---|---|
| Add new intent detection keywords | Extend V1's intent router → must go in Gen1 |
| Add new state machine states | Expand V1 state machine → must go in Gen1 |
| Improve prompt.ts | Change V1 conversation logic → Gen1 only |
| Add new field capture flows | Extend V1 lead capture → Gen1 ACP-11 |
| Add new medical responses | Hardcoded additions → Gen1 ACP-04 |
| Add new trust responses | Hardcoded additions → Gen1 ACP-08 |
| Refactor route.ts architecture | Destabilizes V1 → not allowed |
| Add new CRM fields to V1 flow | Schema changes → Gen1 adapter |

### Emergency Fix Process

If an emergency fix is required:
1. Create a branch `hotfix/v1-[description]`
2. Apply the minimal fix only
3. Test manually on LINE
4. Deploy via Vercel
5. Document the change in this file's version history
6. Note the fix in Gen1 planning if it reveals an architectural lesson

---

## V1 Technical Summary (for Gen1 Planning)

### Intent Priority Router (route.ts lines 353–569)

```
Priority B: Rich Menu commands (postback + text)
Priority C: Trust / Fraud concern (isTrustTrigger → buildTrustResponse)
Priority D: Medical underwriting (isUnderwritingTrigger → buildMedicalResponse)
Priority D: Contact trigger (isContactTrigger → field capture or handoff summary)
Priority E: Product mention (extractProductFromText → premium quote flow)
Priority F: Quote trigger (isQuoteTrigger → handoff flow)
Priority G: Interest trigger (isInterestTrigger → 6-category quick reply)
Priority H: OpenAI fallback (buildSystemPrompt + getChatReply)
```

### State Machine (leadCapture.ts 884 lines)

States:
- `AWAITING_FIELD` — collecting a specific lead field (name, phone, age, gender, time)
- `AWAITING_CATEGORY` — waiting for customer to pick an insurance category
- `AWAITING_RESUME` — customer returned after an expired session; asking if they want to resume

Flows:
- `handoff` — Name + Phone + Time → handoff to Jirawat
- `premium_quote` — Age + Gender + Product → premium quote summary
- `contact_jirawat` — Name + Phone + Time (shortcut)

### Known V1 Limitations

1. **Intent detection is keyword-only** — `isInterestTrigger`, `isQuoteTrigger` etc. are regex/keyword lists, not semantic
2. **Prompt is static** — `buildSystemPrompt` builds the same prompt regardless of conversation state
3. **Trust and medical are hardcoded** — `trustEngine.ts` and `medicalEngine.ts` do not load from AIOS knowledge
4. **No conversation memory across sessions** — each session starts fresh
5. **No known-field protection in OpenAI** — GPT may re-ask fields already captured
6. **No audit trail** — `conversationAudit.ts` is a 21-line stub; no actual audit store

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.9-stability (frozen) | 2026-06-27 | Frozen for Gen1 development |
