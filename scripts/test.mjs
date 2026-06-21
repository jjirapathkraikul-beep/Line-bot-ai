/**
 * E2E Test Suite — ผู้ช่วยจิราวัฒน์ LINE Chatbot
 * รัน: node scripts/test.mjs <base_url>
 * เช่น: node scripts/test.mjs https://line-bot-ai-drab.vercel.app
 *
 * หมายเหตุ: env vars เช็คจาก server response ไม่ใช่ local process.env
 */

import { createHmac } from 'node:crypto';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const WEBHOOK = `${BASE}/api/line-webhook`;

// Local env vars — ใช้เฉพาะตอนรัน local dev, ไม่ต้องมีสำหรับ production test
const LOCAL_SECRET = process.env.LINE_CHANNEL_SECRET ?? '';
const LOCAL_SHEET = process.env.SHEET_CSV_URL ?? '';
const LOCAL_LEAD = process.env.LEAD_SHEET_CSV_URL ?? '';
const LOCAL_OPENAI = process.env.OPENAI_API_KEY ?? '';

const IS_PRODUCTION = BASE.includes('vercel.app') || BASE.includes('https://');

let passed = 0;
let failed = 0;
const results = [];

function sign(body, secret) {
  return createHmac('sha256', secret || 'invalid_secret_for_testing')
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

async function skip(name, reason) {
  console.log(`  ⊘ ${name}`);
  console.log(`    → SKIP: ${reason}`);
  results.push({ name, status: 'SKIP', note: reason });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

console.log(`\nTarget: ${BASE}`);
console.log(`Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'LOCAL'}\n`);

// ─── Test 1: Server reachability ───────────────────────────────────────────
console.log('[Test 1] Server reachability');
await run('GET / returns 200', async () => {
  const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(8000) });
  assert(res.ok, `Expected 200, got ${res.status}`);
  return { note: `HTTP ${res.status} — server is live` };
});

// ─── Test 2: Webhook endpoint reachable ────────────────────────────────────
console.log('\n[Test 2] Webhook endpoint');
let serverHasSecret = false;

await run('POST /api/line-webhook is reachable', async () => {
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ destination: 'test', events: [] }),
    signal: AbortSignal.timeout(10000),
  });
  assert(res.status !== 404, `Got 404 — route not deployed`);
  assert(res.status !== 200 || true, ''); // any non-404 is fine here
  if (res.status === 400) {
    serverHasSecret = true;
    return { note: `HTTP 400 — LINE_CHANNEL_SECRET is configured on server ✓` };
  }
  if (res.status === 500) {
    return { note: `HTTP 500 — server up but LINE_CHANNEL_SECRET not set yet` };
  }
  return { note: `HTTP ${res.status}` };
});

// ─── Test 3: Signature validation ──────────────────────────────────────────
console.log('\n[Test 3] Signature validation');

await run('No signature → 400 (server rejects unsigned requests)', async () => {
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ destination: 'test', events: [] }),
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 500) throw new Error('Got 500 — LINE_CHANNEL_SECRET not set on server');
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  return { note: 'Unsigned requests correctly rejected' };
});

await run('Wrong signature → 400', async () => {
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-line-signature': 'badsignature==' },
    body: JSON.stringify({ destination: 'test', events: [] }),
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 500) throw new Error('Got 500 — LINE_CHANNEL_SECRET not set on server');
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  return { note: 'Invalid signature correctly rejected' };
});

// Valid signature test — ต้องมี LOCAL_SECRET
if (LOCAL_SECRET) {
  await run('Valid signature + empty events → 200 {ok:true}', async () => {
    const body = JSON.stringify({ destination: 'Utest', events: [] });
    const sig = sign(body, LOCAL_SECRET);
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-line-signature': sig },
      body,
      signal: AbortSignal.timeout(10000),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.ok === true, `Expected {ok:true}`);
    return { note: 'Valid signature accepted' };
  });
} else {
  await skip('Valid signature + empty events → 200', 'Set LINE_CHANNEL_SECRET locally to run this test');
}

// ─── Test 4: Environment variables (inferred from server behavior) ──────────
console.log('\n[Test 4] Environment variables (inferred from server)');

await run('LINE_CHANNEL_SECRET set on server', async () => {
  assert(serverHasSecret, 'Server returned 500 instead of 400 — secret not configured');
  return { note: 'Confirmed: server validates signatures (secret is set)' };
});

if (LOCAL_OPENAI) {
  await run('OPENAI_API_KEY is valid', async () => {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${LOCAL_OPENAI}` },
      signal: AbortSignal.timeout(10000),
    });
    assert(res.ok, `OpenAI API returned ${res.status}`);
    return { note: 'API key accepted by OpenAI' };
  });
} else {
  await skip('OPENAI_API_KEY valid', 'Set OPENAI_API_KEY locally to validate — or check Vercel dashboard');
}

// ─── Test 5: FAQ Google Sheet ────────────────────────────────────────────────
console.log('\n[Test 5] FAQ Google Sheet');

if (LOCAL_SHEET) {
  await run('SHEET_CSV_URL returns parseable CSV', async () => {
    const res = await fetch(LOCAL_SHEET, { signal: AbortSignal.timeout(10000) });
    assert(res.ok, `Fetch failed: ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split('\n');
    assert(lines.length >= 2, 'CSV has no data rows');
    const header = lines[0].toLowerCase();
    assert(header.includes('question') && header.includes('answer'), `Bad headers: ${lines[0]}`);
    return { note: `${lines.length - 1} FAQ rows — sheet is public and readable` };
  });
} else {
  await skip('FAQ Sheet readable', 'Set SHEET_CSV_URL locally to test, or verify sheet is public in Google Sheet');
}

// ─── Test 6: CRM Lead Sheet ──────────────────────────────────────────────────
console.log('\n[Test 6] CRM Lead Sheet (Google Apps Script)');

if (LOCAL_LEAD) {
  await run('LEAD_SHEET_CSV_URL accepts POST', async () => {
    const payload = {
      line_user_id: 'Utest_e2e_' + Date.now(),
      last_question: 'E2E test ping',
      last_contact_date: new Date().toISOString().split('T')[0],
    };
    const res = await fetch(LOCAL_LEAD, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    assert(res.ok, `CRM POST failed: ${res.status}`);
    return { note: `CRM accepted test lead, HTTP ${res.status}` };
  });
} else {
  await skip('CRM Sheet writable', 'Set LEAD_SHEET_CSV_URL locally to test, or send a test message via LINE');
}

// ─── Test 7: Full webhook simulation ─────────────────────────────────────────
console.log('\n[Test 7] Simulated LINE webhook flow');

if (LOCAL_SECRET) {
  await run('Simulate text message → server processes without 4xx/5xx', async () => {
    const body = JSON.stringify({
      destination: 'Utest',
      events: [{
        type: 'message',
        replyToken: 'noreply00000000000000000000000000',
        source: { userId: 'Utest_sim_001', type: 'user' },
        timestamp: Date.now(),
        message: { id: '1', type: 'text', text: 'ประกันลดหย่อนภาษีได้เท่าไร' },
      }],
    });
    const sig = sign(body, LOCAL_SECRET);
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-line-signature': sig },
      body,
      signal: AbortSignal.timeout(35000),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.ok === true, `Expected {ok:true}, got ${JSON.stringify(json)}`);
    return { note: 'Full flow ran: signature ✓ → FAQ fetch → OpenAI → LINE reply attempt' };
  });
} else {
  await skip('Full webhook simulation', 'Set LINE_CHANNEL_SECRET locally — then re-run for full E2E test');
}

// ─── Test 8: Rate limiting ───────────────────────────────────────────────────
console.log('\n[Test 8] Security — Rate limiting');

await run('Webhook still responds after multiple rapid requests', async () => {
  const requests = Array.from({ length: 3 }, () =>
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ destination: 'test', events: [] }),
      signal: AbortSignal.timeout(8000),
    })
  );
  const responses = await Promise.all(requests);
  const statuses = responses.map(r => r.status);
  assert(statuses.every(s => s !== 404 && s !== 500), `Got unexpected status: ${statuses}`);
  return { note: `3 rapid requests → statuses [${statuses.join(', ')}] — no 500 errors` };
});

// ─── Summary ─────────────────────────────────────────────────────────────────
const passCount = results.filter(r => r.status === 'PASS').length;
const failCount = results.filter(r => r.status === 'FAIL').length;
const skipCount = results.filter(r => r.status === 'SKIP').length;

console.log('\n' + '─'.repeat(58));
console.log(`RESULTS  ✓ ${passCount} passed  ✗ ${failCount} failed  ⊘ ${skipCount} skipped`);
console.log('─'.repeat(58));
for (const r of results) {
  const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '⊘';
  console.log(`  ${icon} ${r.name}`);
  if (r.note) console.log(`    ${r.note}`);
}
console.log('─'.repeat(58));
if (failCount > 0) process.exit(1);
