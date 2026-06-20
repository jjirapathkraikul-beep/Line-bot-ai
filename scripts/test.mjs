/**
 * E2E Test Suite — ผู้ช่วยจิราวัฒน์ LINE Chatbot
 * รัน: node scripts/test.mjs [base_url]
 * ถ้าไม่ระบุ base_url จะใช้ http://localhost:3000
 */

import { createHmac } from 'node:crypto';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const WEBHOOK = `${BASE}/api/line-webhook`;

const LINE_SECRET = process.env.LINE_CHANNEL_SECRET ?? '';
const SHEET_URL = process.env.SHEET_CSV_URL ?? '';
const LEAD_URL = process.env.LEAD_SHEET_CSV_URL ?? '';
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? '';

let passed = 0;
let failed = 0;
const results = [];

function sign(body) {
  return createHmac('sha256', LINE_SECRET || 'test_secret')
    .update(body)
    .digest('base64');
}

async function run(name, fn) {
  try {
    const result = await fn();
    console.log(`  ✓ ${name}`);
    if (result?.note) console.log(`    → ${result.note}`);
    passed++;
    results.push({ name, status: 'PASS', note: result?.note });
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
    failed++;
    results.push({ name, status: 'FAIL', note: err.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// ─── Test 1: Server reachability ───────────────────────────────────────────
console.log('\n[Test 1] Server reachability');
await run('GET / returns 200', async () => {
  const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) });
  assert(res.ok, `Expected 200, got ${res.status}`);
  return { note: `HTTP ${res.status}` };
});

// ─── Test 2: Webhook endpoint reachable ────────────────────────────────────
console.log('\n[Test 2] Webhook endpoint reachability');
await run('POST /api/line-webhook exists (not 404)', async () => {
  const body = JSON.stringify({ destination: 'test', events: [] });
  const sig = sign(body);
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-line-signature': sig },
    body,
    signal: AbortSignal.timeout(5000),
  });
  assert(res.status !== 404, `Got 404 — route not found`);
  return { note: `HTTP ${res.status}` };
});

// ─── Test 3: Signature validation ──────────────────────────────────────────
console.log('\n[Test 3] Signature validation');
await run('Missing signature → 400 (or 500 if env not set)', async () => {
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ destination: 'test', events: [] }),
    signal: AbortSignal.timeout(5000),
  });
  if (!LINE_SECRET) {
    assert(res.status === 500, `Expected 500 (no env vars), got ${res.status}`);
    return { note: 'HTTP 500 — LINE_CHANNEL_SECRET not set (expected in local-no-env mode)' };
  }
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  return { note: 'Signature validation working' };
});

await run('Wrong signature → 400 (or 500 if env not set)', async () => {
  const body = JSON.stringify({ destination: 'test', events: [] });
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-line-signature': 'invalidsignature==' },
    body,
    signal: AbortSignal.timeout(5000),
  });
  if (!LINE_SECRET) {
    assert(res.status === 500, `Expected 500 (no env vars), got ${res.status}`);
    return { note: 'HTTP 500 — LINE_CHANNEL_SECRET not set (expected in local-no-env mode)' };
  }
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  return { note: 'Invalid signature rejected' };
});

await run('Empty events body → 200 (signature valid)', async () => {
  if (!LINE_SECRET) throw new Error('LINE_CHANNEL_SECRET not set — skipping live test');
  const body = JSON.stringify({ destination: 'Utest', events: [] });
  const sig = sign(body);
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-line-signature': sig },
    body,
    signal: AbortSignal.timeout(10000),
  });
  assert(res.ok, `Expected 200, got ${res.status}`);
  const json = await res.json();
  assert(json.ok === true, `Expected {ok:true}, got ${JSON.stringify(json)}`);
  return { note: 'Valid signature accepted, returned {ok:true}' };
});

// ─── Test 4: Environment variables ─────────────────────────────────────────
console.log('\n[Test 4] Environment variables');
const envChecks = {
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET: LINE_SECRET,
  OPENAI_API_KEY: OPENAI_KEY,
  SHEET_CSV_URL: SHEET_URL,
  LEAD_SHEET_CSV_URL: LEAD_URL,
};
for (const [key, val] of Object.entries(envChecks)) {
  await run(`${key} is set`, async () => {
    assert(val, `${key} is empty or missing`);
    const masked = val.length > 8 ? val.slice(0, 4) + '****' + val.slice(-4) : '****';
    return { note: masked };
  });
}

// ─── Test 5: FAQ sheet ──────────────────────────────────────────────────────
console.log('\n[Test 5] FAQ Google Sheet');
await run('SHEET_CSV_URL returns parseable CSV', async () => {
  assert(SHEET_URL, 'SHEET_CSV_URL not set — cannot test');
  const res = await fetch(SHEET_URL, { signal: AbortSignal.timeout(10000) });
  assert(res.ok, `Fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  assert(lines.length >= 2, 'CSV has no data rows');
  const header = lines[0].toLowerCase();
  assert(header.includes('question') && header.includes('answer'), `Headers missing: ${lines[0]}`);
  return { note: `${lines.length - 1} FAQ rows found` };
});

// ─── Test 6: CRM endpoint ───────────────────────────────────────────────────
console.log('\n[Test 6] CRM Lead Sheet (Google Apps Script)');
await run('LEAD_SHEET_CSV_URL accepts POST', async () => {
  assert(LEAD_URL, 'LEAD_SHEET_CSV_URL not set — cannot test');
  const payload = {
    line_user_id: 'Utest_e2e_' + Date.now(),
    last_question: 'E2E test ping',
    last_contact_date: new Date().toISOString().split('T')[0],
  };
  const res = await fetch(LEAD_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  assert(res.ok, `CRM POST failed: ${res.status}`);
  return { note: `CRM accepted payload, HTTP ${res.status}` };
});

// ─── Test 7: Simulated full LINE webhook (needs all env vars) ───────────────
console.log('\n[Test 7] Simulated LINE webhook flow');
await run('Simulate text message → reply flow', async () => {
  assert(LINE_SECRET, 'LINE_CHANNEL_SECRET not set');
  const body = JSON.stringify({
    destination: 'Utest',
    events: [
      {
        type: 'message',
        replyToken: 'noreply00000000000000000000000000',
        source: { userId: 'Utest_sim_001', type: 'user' },
        timestamp: Date.now(),
        message: { id: '1', type: 'text', text: 'ประกันลดหย่อนภาษีได้เท่าไร' },
      },
    ],
  });
  const sig = sign(body);
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-line-signature': sig },
    body,
    signal: AbortSignal.timeout(30000),
  });
  // Signature passes, flow runs — LINE reply will fail (invalid replyToken)
  // but we expect the server to return 200 (errors in reply are swallowed)
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const json = await res.json();
  assert(json.ok === true, `Expected {ok:true}`);
  return { note: 'Webhook accepted + processed (LINE reply fail is expected in test env)' };
});

// ─── Test 8: OpenAI API key validity ────────────────────────────────────────
console.log('\n[Test 8] OpenAI API key');
await run('OPENAI_API_KEY is valid (models list)', async () => {
  assert(OPENAI_KEY, 'OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    signal: AbortSignal.timeout(10000),
  });
  assert(res.ok, `OpenAI API returned ${res.status} — key may be invalid`);
  return { note: 'API key accepted by OpenAI' };
});

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(55));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(55));
for (const r of results) {
  const icon = r.status === 'PASS' ? '✓' : '✗';
  console.log(`  ${icon} ${r.name}`);
  if (r.note) console.log(`    ${r.note}`);
}
console.log('─'.repeat(55));
if (failed > 0) process.exit(1);
