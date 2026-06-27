/**
 * Runtime execute() Tests
 * Run: npx tsx --tsconfig tsconfig.json __tests__/gen1/runtime.test.ts
 *
 * Tests the Gen1 execute() entry point: verifies RuntimeOutput shape,
 * placeholder text, trace fields, and version string.
 */

import assert from 'node:assert/strict';
import { execute, RUNTIME_VERSION } from '../../runtime-gen1/core/runtime';
import type { RuntimeInput } from '../../runtime-gen1/core/types';

// ─── Minimal test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void): void {
  const maybePromise = (() => {
    try {
      return fn();
    } catch (err) {
      console.log(`  ❌ ${name}`);
      console.log(`     ${err instanceof Error ? err.message : String(err)}`);
      failed++;
      return undefined;
    }
  })();

  if (maybePromise instanceof Promise) {
    maybePromise.then(() => {
      console.log(`  ✅ ${name}`);
      passed++;
    }).catch((err: unknown) => {
      console.log(`  ❌ ${name}`);
      console.log(`     ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    });
    pendingPromises.push(maybePromise.catch(() => { /* handled above */ }));
  } else {
    console.log(`  ✅ ${name}`);
    passed++;
  }
}

const pendingPromises: Promise<void>[] = [];

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const INPUT: RuntimeInput = {
  userId: 'U1234567890abcdef',
  message: 'สนใจประกันสุขภาพครับ',
  session: {},
  displayName: 'ทดสอบ',
  replyToken: 'test-reply-token',
  timestamp: '2026-06-27T00:00:00.000Z',
};

// ─── Test Cases ───────────────────────────────────────────────────────────────

console.log('\n🧪 Runtime execute() — Gen1 Stub Tests\n');

test('RUNTIME_VERSION is defined and non-empty', () => {
  assert.ok(typeof RUNTIME_VERSION === 'string', 'RUNTIME_VERSION must be a string');
  assert.ok(RUNTIME_VERSION.length > 0, 'RUNTIME_VERSION must not be empty');
});

test('execute() returns a RuntimeOutput object', async () => {
  const output = await execute(INPUT);
  assert.ok(output !== null && typeof output === 'object', 'output must be an object');
});

test('execute() output.text is a non-empty string', async () => {
  const output = await execute(INPUT);
  assert.ok(typeof output.text === 'string', 'output.text must be a string');
  assert.ok(output.text.length > 0, 'output.text must not be empty');
});

test('execute() output.decision is a non-empty string', async () => {
  const output = await execute(INPUT);
  assert.ok(typeof output.decision === 'string', 'output.decision must be a string');
  assert.ok(output.decision.length > 0, 'output.decision must not be empty');
});

test('execute() output.runtimeVersion matches RUNTIME_VERSION', async () => {
  const output = await execute(INPUT);
  assert.equal(output.runtimeVersion, RUNTIME_VERSION);
});

test('execute() output.trace has all required fields', async () => {
  const output = await execute(INPUT);
  const t = output.trace;
  assert.ok(typeof t.mode === 'string',               'trace.mode must be a string');
  assert.ok(typeof t.userId_masked === 'string',      'trace.userId_masked must be a string');
  assert.ok(typeof t.message_preview === 'string',    'trace.message_preview must be a string');
  assert.ok(typeof t.runtimeVersion === 'string',     'trace.runtimeVersion must be a string');
  assert.ok(typeof t.decision === 'string',           'trace.decision must be a string');
  assert.ok(typeof t.timestamp === 'string',          'trace.timestamp must be a string');
});

test('execute() trace.userId_masked masks the userId', async () => {
  const output = await execute(INPUT);
  assert.ok(
    output.trace.userId_masked.includes('***'),
    'userId_masked must contain ***'
  );
  assert.ok(
    !output.trace.userId_masked.includes('U1234567890abcdef'),
    'userId_masked must not contain the full userId'
  );
});

test('execute() trace.message_preview is truncated to 40 chars max', async () => {
  const longInput: RuntimeInput = {
    ...INPUT,
    message: 'A'.repeat(100),
  };
  const output = await execute(longInput);
  assert.ok(
    output.trace.message_preview.length <= 40,
    'message_preview must be at most 40 characters'
  );
});

test('execute() trace.timestamp matches input timestamp', async () => {
  const output = await execute(INPUT);
  assert.equal(output.trace.timestamp, INPUT.timestamp);
});

test('execute() is safe with empty message', async () => {
  const output = await execute({ ...INPUT, message: '' });
  assert.ok(output.text.length > 0, 'must return a non-empty reply even for empty message');
});

// ─── Results (wait for all async tests) ──────────────────────────────────────

Promise.all(pendingPromises).then(() => {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed\n');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed\n');
  }
});
