/**
 * Runtime Mode Tests
 * Run: npx tsx --tsconfig tsconfig.json __tests__/gen1/runtimeMode.test.ts
 *
 * Tests the feature flag helper: getRuntimeMode, isGen1Enabled, isShadowMode.
 * Verifies default = 'v1' and all three modes are correctly detected.
 */

import assert from 'node:assert/strict';
import { getRuntimeMode, isGen1Enabled, isShadowMode } from '../../runtime-gen1/core/runtimeMode';

// ─── Minimal test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function withEnv(value: string | undefined, fn: () => void): void {
  const prev = process.env.AI_RUNTIME_MODE;
  if (value === undefined) {
    delete process.env.AI_RUNTIME_MODE;
  } else {
    process.env.AI_RUNTIME_MODE = value;
  }
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.AI_RUNTIME_MODE;
    else process.env.AI_RUNTIME_MODE = prev;
  }
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

console.log('\n🧪 Runtime Mode — Feature Flag Tests\n');

test('Default mode is v1 when env var is not set', () => {
  withEnv(undefined, () => {
    assert.equal(getRuntimeMode(), 'v1');
  });
});

test('Default mode is v1 when env var is empty string', () => {
  withEnv('', () => {
    assert.equal(getRuntimeMode(), 'v1');
  });
});

test('Default mode is v1 for unrecognised value', () => {
  withEnv('production', () => {
    assert.equal(getRuntimeMode(), 'v1');
  });
});

test('AI_RUNTIME_MODE=gen1 → getRuntimeMode returns gen1', () => {
  withEnv('gen1', () => {
    assert.equal(getRuntimeMode(), 'gen1');
  });
});

test('AI_RUNTIME_MODE=shadow → getRuntimeMode returns shadow', () => {
  withEnv('shadow', () => {
    assert.equal(getRuntimeMode(), 'shadow');
  });
});

test('isGen1Enabled returns true only when mode is gen1', () => {
  withEnv('gen1', () => assert.equal(isGen1Enabled(), true));
  withEnv('v1', () => assert.equal(isGen1Enabled(), false));
  withEnv('shadow', () => assert.equal(isGen1Enabled(), false));
  withEnv(undefined, () => assert.equal(isGen1Enabled(), false));
});

test('isShadowMode returns true only when mode is shadow', () => {
  withEnv('shadow', () => assert.equal(isShadowMode(), true));
  withEnv('v1', () => assert.equal(isShadowMode(), false));
  withEnv('gen1', () => assert.equal(isShadowMode(), false));
  withEnv(undefined, () => assert.equal(isShadowMode(), false));
});

test('gen1 and shadow are mutually exclusive', () => {
  withEnv('gen1', () => {
    assert.equal(isGen1Enabled(), true);
    assert.equal(isShadowMode(), false);
  });
  withEnv('shadow', () => {
    assert.equal(isGen1Enabled(), false);
    assert.equal(isShadowMode(), true);
  });
});

// ─── Results ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) {
  console.log('\n⚠️  Some tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed\n');
}
