import type { RuntimeMode } from './types';

export function getRuntimeMode(): RuntimeMode {
  const mode = process.env.AI_RUNTIME_MODE;
  if (mode === 'gen1') return 'gen1';
  if (mode === 'shadow') return 'shadow';
  return 'v1';
}

export function isGen1Enabled(): boolean {
  return getRuntimeMode() === 'gen1';
}

export function isShadowMode(): boolean {
  return getRuntimeMode() === 'shadow';
}
