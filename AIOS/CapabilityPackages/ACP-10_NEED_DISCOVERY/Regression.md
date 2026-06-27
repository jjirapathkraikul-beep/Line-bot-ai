# Regression Tests — NEED_DISCOVERY

**Document ID**: AIOS-ACP-10-REGRESSION  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Test Cases

### TC-10-01: Vague Request Triggers Discovery

**Input**: "อยากทำประกันแต่ไม่รู้จะเริ่มยังไงครับ"  
**Expected Behavior**:
- No product named
- No price mentioned
- No data requested
- One discovery question asked (life stage or concern)
**Pass Criteria**: Response contains exactly one question; zero product names; zero data collection requests

---

### TC-10-02: Life Event Signal Captured

**Input**: "เพิ่งแต่งงานครับ อยากวางแผนประกัน"  
**Expected Behavior**:
- AI acknowledges the life event warmly
- AI explains generally what newlyweds often consider (brief education)
- AI asks ONE follow-up discovery question (existing coverage or budget)
**Pass Criteria**: Life event acknowledged; education provided before asking; exactly one follow-up question

---

### TC-10-03: No Product Pitch During Discovery

**Input**: "ขอคำแนะนำเรื่องประกันหน่อยครับ"  
**Expected Behavior**:
- NO product name in response
- NO price in response
- NO data request in response
- Life stage discovery question asked
**Pass Criteria**: Response contains zero product names, zero prices, zero data requests

---

### TC-10-04: Discovery Sequence Correct Order

**Simulated Multi-Turn**:
- Turn 1: Customer says "อยากทำประกัน"
- Turn 2: Customer answers life stage (มีครอบครัว)
- Turn 3: AI asks about concern (NOT about budget — concern must come before budget)
**Expected Behavior**: Life stage → Concern → (then budget later)  
**Pass Criteria**: Budget question does not appear until turn 3+ after life stage AND concern are established

---

### TC-10-05: Trust Signal During Discovery Triggers ACP-08

**Input** (mid-discovery): "แต่กลัวว่าจะโดนโกงครับ มิจฉาชีพเยอะ"  
**Expected Behavior**:
- ACP-10 is suspended
- ACP-08 (TRUST_ADVISOR) activates immediately
- Discovery state is preserved for resume after trust resolution
**Pass Criteria**: Trust response delivered; NO product mentioned; NO data requested; ACP-10 suspended

---

### TC-10-06: Topic Change During Discovery Followed Gracefully

**Input** (mid-discovery): Customer switches from general inquiry to "อยากถามเรื่องประกันมะเร็งโดยตรงครับ"  
**Expected Behavior**:
- ACP-10 exits
- ACP-03 (CANCER_ADVISOR) activates
- Discovery data already gathered is preserved and passed to ACP-03
**Pass Criteria**: Capability switches without re-asking already-known information

---

### TC-10-07: Discovery Completes and Transitions to Recommendation

**Simulated Multi-Turn**:
- Life stage established: married, 2 children
- Concern established: health costs
- Existing coverage: social security only
- Budget: ~3,000/month
**Expected Behavior**:
- ACP-10 recognizes discovery is complete
- Transitions to ACP-09 (RECOMMENDATION_ENGINE)
- ACP-09 recommendation cites customer's own words
**Pass Criteria**: No re-asking of known facts; recommendation contains specific customer context

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
