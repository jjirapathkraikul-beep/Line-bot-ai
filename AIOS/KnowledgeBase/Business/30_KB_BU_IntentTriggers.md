# Intent Trigger Vocabulary
### Knowledge Base — Business Rules
**Version:** 1.0  
**Effective Date:** 2026-06-26  
**Last Reviewed:** 2026-06-26  
**Review Cycle:** Quarterly — Thai language evolves; new product launches may require vocabulary additions  
**Status:** Active  
**Authority:** Jirawat Jirapathkraikul (Knowledge Manager)  
**Layer:** 7 — Knowledge Base  
**Category:** Business (BU)  

---

> **Migration Note:** This document extracts all intent trigger keyword arrays that were previously hard-coded in `lib/leadCapture.ts` (TypeScript constant arrays) and `route.ts` (Priority Router A–H). The trigger vocabulary listed here is the authoritative source of truth. The code should derive its classification logic from this document — not the reverse.

---

## Scope

**This document covers:**
- All Thai-language keywords and phrases that trigger specific intent classifications in the AIOS Orchestrator
- The mapping of keywords to intent classes (Priority A–H in the current implementation)
- Rules for keyword matching (normalization, partial match, exact match)

**This document does not cover:**
- The routing logic that acts on these intents (see `10_AI_Orchestrator_Spec.md`)
- The Workflows triggered by each intent (see individual `20_Workflow_*.md` documents)
- Rich Menu event payloads (these are system events, not vocabulary — handled by the Orchestrator)

---

## Core Principle

> **Vocabulary is a business decision, not a code decision.**  
> When Jirawat changes how he talks about his products, the trigger vocabulary must change. That change belongs in this document — reviewed and approved by a Knowledge Manager — not inside a TypeScript file that requires a developer and a deployment pipeline.

---

## Section 1 — Intent Priority Map

The AIOS Orchestrator classifies every user message into one of the following intent classes, checked in strict priority order. Higher-priority intents override lower-priority intents.

| Priority | Intent Class | Description | Triggered By |
|---|---|---|---|
| A | `admin.command` | System operator commands | Specific admin tokens (not vocabulary-based) |
| B | `rich_menu.event` | Rich Menu button taps | LINE postback events (not vocabulary-based) |
| C | `underwriting` | Medical or pre-existing condition disclosure | Section 3 — Underwriting Triggers |
| D | `contact.handoff` | Request to speak with Jirawat or a human | Section 4 — Contact Triggers |
| E | `product.mention.[product]` | Named product type mentioned | Section 5 — Product Mention Map |
| F | `quote.request` | Request for price or premium quote | Section 6 — Quote Triggers |
| G | `interest.general` | General interest in insurance or financial planning | Section 7 — Interest Triggers |
| H | `openai.fallback` | No intent matched — route to AI with FAQ | Default when no trigger matched |

> **Priority enforcement rule:** A message that matches triggers in multiple intent classes is always classified at the highest matching priority. A message containing "สนใจประกันสุขภาพ" matches both E (product mention: ประกันสุขภาพ) and G (interest: สนใจ). Priority E applies.

---

## Section 2 — Keyword Normalization Rules

Before matching any keyword, the system applies these normalization steps:

| Step | Rule | Example |
|---|---|---|
| 1 | Trim leading and trailing whitespace | "  สนใจ  " → "สนใจ" |
| 2 | Normalize Thai zero-width characters | Invisible characters removed |
| 3 | Lowercase (for any Latin characters) | "AIDS" → "aids" |
| 4 | Partial match: keyword can appear anywhere in the message | "ผมสนใจประกันมะเร็ง" → matches "ประกันมะเร็ง" |
| 5 | Exact match only for Rich Menu commands and admin tokens | "about_jirawat" — must match exactly |

---

## Section 3 — Underwriting Triggers (Priority C)

These keywords indicate that the user has a medical condition or history that requires human underwriting review. **Match = immediate escalation. No exceptions.**

| Keyword (Thai) | English Context | Notes |
|---|---|---|
| เป็นมะเร็ง | Has cancer | Current condition |
| เคยเป็นมะเร็ง | Had cancer | Past condition |
| เป็นโรค | Has a disease | Broad — catches "เป็นโรคเบาหวาน" etc. |
| โรคประจำตัว | Chronic/underlying condition | Common disclosure phrase |
| เบาหวาน | Diabetes | High-frequency condition |
| ความดัน | Hypertension / blood pressure | High-frequency condition |
| ไขมัน | High cholesterol / lipid disorder | High-frequency condition |
| เคยผ่าตัด | Had surgery | Past surgical history |
| ทำประกันได้ไหม | "Can I get insured?" | Implies concern about insurability |
| รับประกันไหม | "Will they accept me?" | Implies concern about medical acceptance |
| เคลมได้ไหม | "Can I claim?" | Implies existing condition |

**Review note:** Review this list quarterly. Common Thai medical vocabulary evolves with public health discourse. New chronic conditions entering public conversation (e.g., Long COVID) should be added at the next review.

---

## Section 4 — Contact Triggers (Priority D)

These keywords indicate that the user wants to contact Jirawat or be contacted by a human.

| Keyword (Thai) | English Context |
|---|---|
| ติดต่อ | Contact |
| โทร | Call |
| เบอร์โทร | Phone number |
| นัด | Make an appointment |
| คุยกับ | Talk to / speak with |
| ขอคุย | Request to talk |
| อยากคุย | Want to talk |
| พบ | Meet |

**Compound phrase that is especially common:**
- "ติดต่อคุณจิราวัฒน์" — direct contact request
- "ขอเบอร์โทรคุณจิราวัฒน์" — requesting Jirawat's number

---

## Section 5 — Product Mention Map (Priority E)

These keywords map a user message to a specific canonical product name. When a product is mentioned, the system bypasses general category selection and proceeds directly to the data collection flow for that product.

| Keyword (Thai) | Canonical Product | Notes |
|---|---|---|
| ประกันสุขภาพ | ประกันสุขภาพ | Health insurance (generic) |
| สุขภาพ | ประกันสุขภาพ | Shorthand — very common |
| Good Health | ประกันสุขภาพ | English brand name |
| GHP | ประกันสุขภาพ | Abbreviation |
| ประกันมะเร็ง | ประกันมะเร็ง | Cancer insurance (generic) |
| มะเร็ง | ประกันมะเร็ง | Shorthand — very common |
| cancer | ประกันมะเร็ง | English — younger users |
| ลดหย่อนภาษี | ประกันลดหย่อนภาษี | Tax-deductible insurance |
| ภาษี | ประกันลดหย่อนภาษี | Tax — common shorthand |
| SuperTax | ประกันลดหย่อนภาษี | Brand name |
| Tokyo SuperTax | ประกันลดหย่อนภาษี | Full brand name |
| ลงทุน | ประกันลงทุน | Investment-linked insurance |
| ออมทรัพย์ | ประกันลงทุน | Savings-linked |
| ULIP | ประกันลงทุน | Unit-linked investment plan |
| Tokyo Beyond | ประกันลงทุน | Brand name |
| เกษียณ | ประกันลงทุน | Retirement savings |
| retirement | ประกันลงทุน | English — used by professionals |

**Matching rule:** Partial match applies. "ผมสนใจเรื่องลดหย่อนภาษีปีนี้" matches "ลดหย่อนภาษี" → `ประกันลดหย่อนภาษี`.

**Priority over interest trigger:** A message with both a product mention and a general interest keyword (Priority G) resolves at Priority E (product mention). The specific overrides the general.

---

## Section 6 — Quote Triggers (Priority F)

These keywords indicate the user wants a premium quote, price information, or coverage calculation.

| Keyword (Thai) | English Context |
|---|---|
| เบี้ย | Premium |
| ราคา | Price |
| ค่าประกัน | Insurance cost |
| คิดให้หน่อย | "Calculate for me" |
| เสนอราคา | "Give me a quote" |
| ใบเสนอราคา | Quotation document |
| ขอดูตัวเลข | "Show me the numbers" |
| งบ | Budget |
| จ่ายเดือนละเท่าไหร่ | "How much per month?" |

**Note:** Quote triggers launch the full lead capture flow (collecting age, gender, product, income, budget, phone, contact time). All 6 core fields are required before a handoff is possible.

---

## Section 7 — Interest Triggers (Priority G)

These keywords indicate general interest in insurance or financial planning without specifying a product. The system responds by presenting category options (Quick Reply: Health / Cancer / Tax / Investment).

| Keyword (Thai) | English Context |
|---|---|
| สนใจ | Interested |
| อยากรู้ | Want to know |
| ประกัน | Insurance (general) |
| วางแผน | Plan / planning |
| ประกันชีวิต | Life insurance (general) |
| ดูแลครอบครัว | Take care of family |
| ความคุ้มครอง | Coverage / protection |
| ออม | Save / savings |

**Note:** Interest triggers resolve to category selection. If the user then selects a product category (via Quick Reply), the session escalates to Priority E (product mention) for that product.

---

## Section 8 — Rich Menu Command Map (Priority B)

Rich Menu events are LINE postback events — they are not vocabulary-based. The system receives the event payload string and maps it to the correct flow.

| Postback Payload | Canonical Command | Action |
|---|---|---|
| `action=about_jirawat` | `about_jirawat` | Send Flex Message profile card |
| `action=contact_jirawat` | `contact_jirawat` | Initiate Contact Handoff Workflow |
| `action=health_insurance` | `health_insurance` | Initiate Product flow: ประกันสุขภาพ |
| `action=cancer_insurance` | `cancer_insurance` | Initiate Product flow: ประกันมะเร็ง |
| `action=tax_planning` | `tax_planning` | Initiate Product flow: ประกันลดหย่อนภาษี |
| `action=investment_retirement` | `investment_retirement` | Initiate Product flow: ประกันลงทุน |

---

## Section 9 — Admin Command Tokens (Priority A)

Admin commands are exact-match tokens that trigger operational functions. They are only available when the sender's LINE user ID matches the configured `ADMIN_LINE_USER_ID` environment variable.

| Command | Function |
|---|---|
| `#reset` | Clear all session state for the sending user |
| `#testnotify` | Send a test admin notification |

---

## Definitions

| Term | Definition |
|---|---|
| **Intent Trigger** | A keyword or phrase that signals a specific user intent |
| **Intent Class** | The categorized intent resulting from trigger matching (A–H) |
| **Canonical Product** | The standardized product name used internally, regardless of how the user phrased it |
| **Partial Match** | The keyword appears anywhere within the user message (not required to be the entire message) |
| **Exact Match** | The entire value must match exactly (used for Rich Menu payloads and admin tokens only) |
| **Priority Enforcement** | When multiple intent classes match, the highest-priority class always wins |

---

## Related Documents

| Document | Relationship |
|---|---|
| `10_Persona_FinancialAdvisor.md` | References this document in P4.2 (Domain Context) |
| `10_AI_Orchestrator_Spec.md` | Consumes this document to build routing rules |
| `30_KB_BU_HandoffPolicy.md` | Handoff triggers are a subset of D and C intents defined here |
| `30_KB_PR_ProductCatalogue.md` (planned) | Product names referenced here must match canonical names in the product catalogue |

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief Enterprise Solution Architect | Initial document — extracted from `lib/leadCapture.ts` (UNDERWRITING_TRIGGERS, CONTACT_TRIGGERS, INTEREST_TRIGGERS, QUOTE_TRIGGERS, RICH_MENU_TEXT_COMMANDS) and the PRODUCT_MENTION_MAP in `route.ts`. Authoritative as of this date. |

---

*This document is a Layer 7 Knowledge document within AIOS. It contains vocabulary facts — not code. Changes to intent vocabulary must be made in this document by a Knowledge Manager, then reflected in the code implementation. The code must serve this document, not define it.*
