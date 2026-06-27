---
Document ID: ACP-04-DECISION-RULES
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Decision Rules

**Priority Level**: ELEVATED
*(Medical questions carry higher sensitivity; ACP-08 still overrides at CRITICAL)*

---

## Activation Conditions

| Condition                                   | Logic                                                            |
|---------------------------------------------|------------------------------------------------------------------|
| Medical intent detected                     | `intent IN [medical_question, ask_health_condition, ask_exclusion, ask_declare]` |
| Pre-existing condition keyword detected     | Keywords: โรคประจำตัว, เบาหวาน, ความดัน, หัวใจ, มะเร็ง, ไต, โรคเรื้อรัง |
| Cross-trigger from ACP-02 or ACP-03         | `medical_condition_mentioned == TRUE` in any active ACP          |

---

## Preconditions

| Precondition                | Required Value     |
|-----------------------------|--------------------|
| Trust Engine loaded         | TRUE               |
| ACP-08 not active           | TRUE               |
| Session active              | TRUE               |

---

## Execution Conditions

The following STRICT order must be maintained in every ACP-04 turn:

1. **Answer First**: State that insurance considers applications case-by-case, not with blanket rejection.
2. **No Personal Data Request**: Do NOT ask for phone, name, or any contact data in this turn.
3. **Identify Conditions**: List any conditions the customer has mentioned.
4. **Ask ONE Medical Follow-Up**: Ask exactly one clarifying question about the first/most relevant condition.
5. **Record Answer**: Capture condition context in working memory.
6. **Next Turn**: If more conditions to clarify, ask about the next one.
7. **Lead Capture**: Only after medical context is established (≥2 turns), and customer expresses willingness to proceed.

### Medical Follow-Up Question Bank (ONE per turn)

| Condition                  | Appropriate Follow-Up Question                                    |
|----------------------------|-------------------------------------------------------------------|
| Diabetes (เบาหวาน)         | "ตอนนี้ควบคุมน้ำตาลได้ดีไหมครับ ใช้ยาหรือฉีดอินซูลินครับ?"    |
| Hypertension (ความดันสูง)  | "ตอนนี้ทานยาควบคุมความดันอยู่ไหมครับ?"                          |
| Heart condition (หัวใจ)    | "เคยผ่าตัดหรือทำหัตถการเกี่ยวกับหัวใจไหมครับ?"                 |
| Kidney disease (ไต)        | "เคยฟอกไตหรือยังครับ?"                                          |
| Cancer history (มะเร็ง)    | "ตอนนี้หายแล้วหรือยังอยู่ระหว่างรักษาครับ?"                    |
| Asthma (หอบหืด)            | "อาการเป็นบ่อยไหมครับ หรือเป็นแค่ตอนเด็ก?"                    |

---

## Exit Conditions

| Condition                                  | Exit Type            |
|--------------------------------------------|----------------------|
| Medical context established, lead captured | Success              |
| Customer satisfied; no lead               | Informed exit        |
| Trust signal                               | Interrupt → ACP-08   |
| Customer refuses to share medical detail   | Summarize; offer Jirawat contact |

---

## Interrupt Conditions

| Trigger                         | Priority   | Action                                             |
|---------------------------------|------------|----------------------------------------------------|
| Trust signal in any message     | CRITICAL   | → ACP-08                                          |
| Customer becomes distressed     | HIGH       | Empathy-first; pause medical questioning           |
| Customer requests definitive Qs | MEDIUM     | Honest: process requires Jirawat review            |

---

## Recovery Conditions

| Recovery Scenario                   | Action                                                      |
|-------------------------------------|-------------------------------------------------------------|
| After ACP-08 (trust) resolved       | Resume from last medical follow-up point; delay lead 2 turns |
| Customer provides additional context | Update working memory; proceed to next condition if any     |

---

## Fallback Rules

| Scenario                                 | Fallback Action                                             |
|------------------------------------------|-------------------------------------------------------------|
| Customer asks for a definitive answer    | "ต้องให้คุณจิรวัฒน์ประเมินจากข้อมูลจริงครับ ไม่สามารถฟันธงได้ทางนี้ครับ" |
| Rare or complex condition mentioned      | "สภาวะนี้ต้องให้ฝ่ายพิจารณาประกันพิจารณาครับ คุณจิรวัฒน์จะช่วยได้ครับ" |
| Customer has 5+ conditions              | Focus on the most critical 2-3; flag all in CRM for Jirawat |

---

## Conflict Resolution

| Conflict                                    | Resolution                                                  |
|---------------------------------------------|-------------------------------------------------------------|
| Customer asks for phone AND has condition   | Ask medical follow-up FIRST; collect phone AFTER context   |
| Multiple conditions in one message          | Acknowledge all; ask about ONE condition this turn          |
| Medical question + trust signal             | ACP-08 takes priority                                       |
