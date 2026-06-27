# Conversation Map — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger | Example |
|---|---|---|
| Direct intent | Customer explicitly asks to compare | "ต่างกันยังไงครับ แผน A กับ B?" |
| Need-driven | Customer expresses indecision between products | "ไม่รู้จะเลือกแบบไหนดีครับ" |
| Post-recommendation | Customer asks to compare after receiving a recommendation | "แล้วถ้าเทียบกับแผนอื่นล่ะครับ?" |
| Returning context | Returning customer who previously asked about comparison | Follow-up on prior comparison topic |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Preference Expressed | Customer signals preference for one product | Activate ACP-09_RECOMMENDATION_ENGINE or ACP-19_CLOSING |
| SUCCESS — Understood, No Preference | Customer understands but needs more time | Activate ACP-11_LEAD_CAPTURE if appropriate |
| HANDOFF | Customer needs detailed quote or complex clarification | Activate ACP-17_HUMAN_HANDOFF |
| PRICE OBJECTION | Customer raises budget concern post-comparison | Activate ACP-13_PRICE_OBJECTION |
| INTERRUPT — Trust | Trust signal detected | Activate ACP-08_TRUST_ADVISOR |
| INTERRUPT — Emergency | Emergency signal detected | Activate ACP-16_HOSPITAL_GUIDANCE |
| TIMEOUT | No customer response after 2 follow-up prompts | Close or prompt once more |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability regardless of comparison stage.

| Interrupt Trigger | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Emergency / hospital signal | CRITICAL | Suspend; activate ACP-16 |
| Price objection signal | HIGH | Pause comparison; activate ACP-13; return if customer re-engages |
| Customer asks claim question | HIGH | Pause; activate ACP-15; return if customer re-engages |
| Customer requests Jirawat directly | HIGH | Activate ACP-17; end comparison |

---

## Resume Rules

| After Interrupt | Resume Possible? | Condition |
|---|---|---|
| After ACP-08 (Trust resolved) | Yes | Customer re-engages with comparison topic |
| After ACP-13 (Price resolved) | Yes | Customer wants to continue comparison after budget discussion |
| After ACP-15 (Claim) | No | Claim support takes session priority |
| After ACP-16 (Hospital) | No | Hospital situation takes session priority |
| After ACP-17 (Handoff) | No | Jirawat takes over the comparison in person |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE (common) | ACP-10_NEED_DISCOVERY often provides context that personalizes comparison |
| BEFORE (alternative) | ACP-02 through ACP-07 topic advisors may precede comparison |
| CONCURRENT | ACP-08 can interrupt at any time |
| AFTER (preference expressed) | ACP-09_RECOMMENDATION_ENGINE or ACP-19_CLOSING |
| AFTER (interest, no preference) | ACP-11_LEAD_CAPTURE |
| AFTER (price objection) | ACP-13_PRICE_OBJECTION |
| AFTER (complex question) | ACP-17_HUMAN_HANDOFF |

---

## Conversation Flow Summary

```
[Intent: compare products]
         |
         v
  [Check if customer's comparison need is clear]
  - Are the products to compare specified?
  - Is the customer's priority dimension known?
         |
         |-- NO → Ask ONE clarifying question
         |-- YES → Proceed to comparison
         |
         v
  [Select 2-3 most relevant comparison dimensions]
  based on customer's stated priority
         |
         v
  [Present comparison]
  Plain language; avoid jargon
  Personalize framing to customer's context
         |
         v
  [Check customer response]
  - Shows preference → Route to ACP-09 or ACP-19
  - Still undecided → Ask what matters most
  - Price concern → Route to ACP-13
  - Wants Jirawat → Route to ACP-17
  - Understood, needs time → Route to ACP-11
```

*Detailed conversation examples with Thai dialogue: see `Examples.md`*
