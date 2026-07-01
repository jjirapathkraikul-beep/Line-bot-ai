import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildPendingIssue, isValidationRiskQuestion } from '../../lib/crmFlowGen1';

test('CRM-GEN1-01: exclusion scope question is validation-risk', () => {
  assert.equal(isValidationRiskQuestion('มะเร็งไม่คุ้มครองจริงไหม'), true);
});

test('CRM-GEN1-02: 120-day waiting period disease-list question is validation-risk', () => {
  assert.equal(isValidationRiskQuestion('waiting period 120 วัน มีโรคอะไรบ้าง'), true);
});

test('CRM-GEN1-02b: validation-risk QA samples are pending-issue eligible', () => {
  const samples = [
    'เห็นว่ามะเร็งไม่คุ้มครองใช่ไหม',
    'เนื้องอกไม่คุ้มครองจริงหรือเปล่า',
    'นิ่วไม่คุ้มครองใช่ไหม',
    'โรครอคอย 120 วันมีอะไรบ้าง',
    'ข้อยกเว้นของ Good Health Prime มีอะไรบ้าง',
    'เคลมมะเร็งได้ไหมถ้าเอกสารเขียนว่า cancer ไม่คุ้มครอง',
  ];

  for (const sample of samples) {
    assert.equal(isValidationRiskQuestion(sample), true, sample);
  }
});

test('CRM-GEN1-02c: pure trust questions are not validation-risk', () => {
  assert.equal(isValidationRiskQuestion('บริษัทนี้น่าเชื่อถือไหม'), false);
  assert.equal(isValidationRiskQuestion('โตเกียวมารีนเชื่อถือได้ไหม'), false);
});

test('CRM-GEN1-03: pending issue preserves advisor handoff context', () => {
  const issue = buildPendingIssue('health_insurance', 'มะเร็งไม่คุ้มครองจริงไหม');
  assert.ok(issue.includes('ลูกค้ามีคำถามที่ต้องการผู้เชี่ยวชาญตอบ'));
  assert.ok(issue.includes('มะเร็งไม่คุ้มครองจริงไหม'));
});
