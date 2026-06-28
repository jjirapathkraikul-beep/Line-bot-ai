// KV client abstraction — injectable for tests, real @vercel/kv in production.
// Both conversationLogger and auditQueue share this client.

import { kv } from '@vercel/kv';

export interface KvMinimal {
  set(key: string, value: string, opts?: { ex: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  lpush(key: string, ...values: string[]): Promise<number>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  expire(key: string, seconds: number): Promise<number>;
}

let _client: KvMinimal = kv as unknown as KvMinimal;

export function __setKvClientForTest(mock: KvMinimal | null): void {
  _client = mock ?? (kv as unknown as KvMinimal);
}

export function getKvClient(): KvMinimal {
  return _client;
}
