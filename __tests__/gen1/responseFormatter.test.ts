// Stabilization Sprint 1 — P0-001/P0-007 Response Formatter Tests
// Verifies Unicode normalization, markdown stripping, whitespace cleanup,
// and combined pipeline behavior.
// Groups: UNICODE (8), MARKDOWN (6), WHITESPACE (5), PIPELINE (3), NOOP (2) = 24 tests

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatResponse } from '../../runtime-gen1/response/responseFormatter';

// ─── UNICODE GROUP ────────────────────────────────────────────────────────────

test('FMT-UNI-01: literal surrogate pair escape → emoji', () => {
  const r = formatResponse({ text: 'สวัสดีครับ \\uD83D\\uDE0A ยินดีต้อนรับ' });
  assert.equal(r.text, 'สวัสดีครับ 😊 ยินดีต้อนรับ');
  assert.ok(r.appliedRules.includes('DECODE_LITERAL_SURROGATE_PAIRS'));
});

test('FMT-UNI-02: multiple literal surrogate pairs decoded', () => {
  const r = formatResponse({ text: '\\uD83D\\uDE0A และ \\uD83D\\uDC4D' });
  assert.equal(r.text, '😊 และ 👍');
});

test('FMT-UNI-03: literal BMP escape decoded', () => {
  const r = formatResponse({ text: 'hello \\u0041 world' });
  assert.equal(r.text, 'hello A world');
  assert.ok(r.appliedRules.includes('DECODE_LITERAL_BMP_ESCAPES'));
});

test('FMT-UNI-04: adjacent lone surrogates (from llmAdapter partial decode) — output is correct emoji', () => {
  // In JavaScript, String.fromCharCode(0xD83D) + String.fromCharCode(0xDE0A) IS the emoji 😊
  // at the UTF-16 code unit level — it is already a valid surrogate pair in memory.
  // The formatter passes the text through and the emoji is intact.
  const hi = String.fromCharCode(0xD83D);
  const lo = String.fromCharCode(0xDE0A);
  const r = formatResponse({ text: `สวัสดี ${hi}${lo} ครับ` });
  assert.equal(r.text, 'สวัสดี 😊 ครับ');
});

test('FMT-UNI-05: lone high surrogate removed', () => {
  const loneHigh = String.fromCharCode(0xD83D);
  const r = formatResponse({ text: `text ${loneHigh} more` });
  assert.ok(!r.text.includes(loneHigh), 'lone high surrogate must be removed');
  assert.ok(r.appliedRules.includes('REMOVE_LONE_SURROGATES'));
});

test('FMT-UNI-06: real emoji characters preserved unchanged', () => {
  const r = formatResponse({ text: 'ยินดีต้อนรับ 😊 👍 ✅ 1️⃣' });
  assert.equal(r.text, 'ยินดีต้อนรับ 😊 👍 ✅ 1️⃣');
  assert.equal(r.changed, false);
});

test('FMT-UNI-07: surrogate pair escape + BMP escape decoded in one pass', () => {
  const r = formatResponse({ text: '\\uD83D\\uDE0A \\u0041' });
  assert.equal(r.text, '😊 A');
});

test('FMT-UNI-08: Thai text without escapes passes through unchanged', () => {
  const r = formatResponse({ text: 'ประกันชีวิตคุ้มครองครอบครัวครับ' });
  assert.equal(r.changed, false);
  assert.equal(r.appliedRules.length, 0);
});

// ─── MARKDOWN GROUP ───────────────────────────────────────────────────────────

test('FMT-MD-01: **bold** markers stripped', () => {
  const r = formatResponse({ text: 'นี่คือ **ประกันสุขภาพ** ที่ดีที่สุด' });
  assert.equal(r.text, 'นี่คือ ประกันสุขภาพ ที่ดีที่สุด');
  assert.ok(r.appliedRules.includes('STRIP_MARKDOWN'));
});

test('FMT-MD-02: # header stripped', () => {
  const r = formatResponse({ text: '# แนะนำประกัน\nรายละเอียด' });
  assert.equal(r.text, 'แนะนำประกัน\nรายละเอียด');
});

test('FMT-MD-03: ## h2 header stripped', () => {
  const r = formatResponse({ text: '## ประกันสุขภาพ\nรายละเอียด' });
  assert.equal(r.text, 'ประกันสุขภาพ\nรายละเอียด');
});

test('FMT-MD-04: --- horizontal rule removed', () => {
  const r = formatResponse({ text: 'บรรทัดแรก\n---\nบรรทัดสอง' });
  assert.ok(!r.text.includes('---'), 'horizontal rule must be removed');
});

test('FMT-MD-05: `inline code` backticks stripped', () => {
  const r = formatResponse({ text: 'ใช้คำสั่ง `test` นะครับ' });
  assert.equal(r.text, 'ใช้คำสั่ง test นะครับ');
});

test('FMT-MD-06: emoji bullet points (1️⃣ ✅) preserved — not markdown', () => {
  const input = '1️⃣ ประกันชีวิต\n2️⃣ ประกันสุขภาพ\n✅ ดีที่สุดสำหรับคุณ';
  const r = formatResponse({ text: input });
  assert.equal(r.changed, false);
  assert.equal(r.text, input);
});

// ─── WHITESPACE GROUP ─────────────────────────────────────────────────────────

test('FMT-WS-01: trailing spaces removed per line', () => {
  const r = formatResponse({ text: 'สวัสดี   \nครับ  ' });
  assert.equal(r.text, 'สวัสดี\nครับ');
  assert.ok(r.appliedRules.includes('NORMALIZE_WHITESPACE'));
});

test('FMT-WS-02: three or more blank lines collapsed to one', () => {
  const r = formatResponse({ text: 'บรรทัด 1\n\n\n\nบรรทัด 2' });
  assert.equal(r.text, 'บรรทัด 1\n\nบรรทัด 2');
});

test('FMT-WS-03: leading and trailing whitespace trimmed', () => {
  const r = formatResponse({ text: '  \n  สวัสดีครับ  \n  ' });
  assert.equal(r.text, 'สวัสดีครับ');
});

test('FMT-WS-04: single blank line (paragraph break) preserved', () => {
  const input = 'บรรทัด 1\n\nบรรทัด 2';
  const r = formatResponse({ text: input });
  assert.equal(r.text, input);
  assert.equal(r.changed, false);
});

test('FMT-WS-05: trailing tab removed', () => {
  const r = formatResponse({ text: 'hello\t\nworld' });
  assert.ok(!r.text.includes('\t'), 'tab must be removed from end of line');
});

// ─── PIPELINE GROUP (combined scenarios) ─────────────────────────────────────

test('FMT-PIPE-01: surrogate + markdown + whitespace all fixed in one pass', () => {
  const r = formatResponse({ text: '## แนะนำ \\uD83D\\uDE0A\n\n**ประกันสุขภาพ** ดีครับ   ' });
  assert.ok(!r.text.includes('##'), 'header not stripped');
  assert.ok(!r.text.includes('\\uD83D'), 'surrogate escape leaked');
  assert.ok(!r.text.includes('**'), 'bold not stripped');
  assert.ok(!r.text.endsWith(' '), 'trailing space not removed');
  assert.ok(r.text.includes('😊'), 'decoded emoji missing');
  assert.equal(r.changed, true);
});

test('FMT-PIPE-02: real-world cancer care response cleaned correctly', () => {
  const input = '## Cancer Care คืออะไรครับ?\n\n**ประกันมะเร็ง** คือการคุ้มครองค่ารักษา \\uD83D\\uDC4D\n\nดูแลได้ครับ 😊   ';
  const r = formatResponse({ text: input });
  assert.ok(!r.text.includes('##'), 'header leaked');
  assert.ok(!r.text.includes('**'), 'bold leaked');
  assert.ok(!r.text.includes('\\uD83D'), 'unicode escape leaked');
  assert.ok(r.text.includes('👍'), 'decoded emoji missing');
  assert.ok(r.text.includes('😊'), 'existing emoji preserved');
  assert.equal(r.changed, true);
});

test('FMT-PIPE-03: changed=false and no rules applied for already-clean text', () => {
  const r = formatResponse({ text: 'สวัสดีครับ\n\nมีอะไรให้ช่วยไหมครับ? 😊' });
  assert.equal(r.changed, false);
  assert.equal(r.appliedRules.length, 0);
});

// ─── NOOP GROUP ───────────────────────────────────────────────────────────────

test('FMT-NOOP-01: empty string returns empty unchanged', () => {
  const r = formatResponse({ text: '' });
  assert.equal(r.text, '');
});

test('FMT-NOOP-02: emoji numbered list with em-dash preserved exactly', () => {
  const input = '1️⃣ ประกันชีวิต — งบ 2,000–3,000 บาท/เดือน\n2️⃣ ประกันสุขภาพ — งบ 1,500–2,500 บาท/เดือน';
  const r = formatResponse({ text: input });
  assert.equal(r.changed, false);
  assert.equal(r.text, input);
});
