import type { ExtractedData, StateMetadata, AwaitingFieldEntry } from './leadCapture';
import { hydrateUserState, dehydrateUserState } from './leadCapture';
import { injectHistory, extractHistory } from './openai';
import { injectNotifiedReasons, extractNotifiedReasons } from './adminNotify';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface UserSession {
  // State machine (TTL enforced via startedAt timestamps — 24h for field/category, 5min for resume)
  awaitingField?:    AwaitingFieldEntry;
  awaitingCategory?: { startedAt: number };
  awaitingResume?:   { startedAt: number };

  // Persistent lead data
  data: ExtractedData;

  // State metadata (last state, intent, pending resume info)
  meta: StateMetadata;

  // Conversation history (self-pruned by openai.ts; KV TTL = 30d)
  history: ChatMessage[];

  // Admin notification dedup per reason (KV TTL = 30d)
  notifiedReasons: string[];

  // Cached LINE display name
  displayName?: string;

  updatedAt: number;
  createdAt: number;
}

// KV key and TTL
const KV_KEY = (userId: string) => `session:${userId}`;
const KV_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

// In-memory fallback used when KV is not configured (local dev)
const memStore = new Map<string, UserSession>();

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet(userId: string): Promise<UserSession | null> {
  if (!isKvConfigured()) return memStore.get(userId) ?? null;
  try {
    const { kv } = await import('@vercel/kv');
    return await kv.get<UserSession>(KV_KEY(userId));
  } catch (err) {
    console.error('[Session] KV get error:', err instanceof Error ? err.message : String(err));
    return memStore.get(userId) ?? null;
  }
}

async function kvSet(userId: string, session: UserSession): Promise<void> {
  if (!isKvConfigured()) { memStore.set(userId, session); return; }
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY(userId), session, { ex: KV_TTL });
  } catch (err) {
    console.error('[Session] KV set error:', err instanceof Error ? err.message : String(err));
    memStore.set(userId, session); // fallback on KV failure
  }
}

function defaultSession(): UserSession {
  const now = Date.now();
  return {
    data: {},
    meta: { lastState: 'idle', lastIntent: 'none', stateUpdatedAt: now },
    history: [],
    notifiedReasons: [],
    updatedAt: now,
    createdAt: now,
  };
}

const STATE_TTL_MS  = 24 * 60 * 60 * 1000; // 24h
const RESUME_TTL_MS =  5 * 60 * 1000;       // 5min

function expireStaleStates(s: UserSession): UserSession {
  const now = Date.now();
  const r = { ...s };
  if (r.awaitingField    && now - r.awaitingField.startedAt    > STATE_TTL_MS)  delete r.awaitingField;
  if (r.awaitingCategory && now - r.awaitingCategory.startedAt > STATE_TTL_MS)  delete r.awaitingCategory;
  if (r.awaitingResume   && now - r.awaitingResume.startedAt   > RESUME_TTL_MS) delete r.awaitingResume;
  return r;
}

export async function loadSession(userId: string): Promise<UserSession> {
  const raw = await kvGet(userId);
  if (!raw) return defaultSession();
  return expireStaleStates(raw);
}

export async function saveSession(userId: string, session: UserSession): Promise<void> {
  await kvSet(userId, { ...session, updatedAt: Date.now() });
}

export async function deleteSession(userId: string): Promise<void> {
  if (!isKvConfigured()) { memStore.delete(userId); return; }
  try {
    const { kv } = await import('@vercel/kv');
    await kv.del(KV_KEY(userId));
  } catch (err) {
    console.error('[Session] KV del error:', err instanceof Error ? err.message : String(err));
    memStore.delete(userId);
  }
}

// ─── Hydrate / Dehydrate bridges ─────────────────────────────────────────────
// Called by route.ts to sync KV ↔ in-memory Maps (leadCapture + openai + adminNotify).

export async function hydrateAll(userId: string): Promise<UserSession> {
  const session = await loadSession(userId);
  hydrateUserState(userId, session);
  injectHistory(userId, session.history);
  injectNotifiedReasons(userId, session.notifiedReasons);
  return session;
}

export function dehydrateAll(userId: string, session: UserSession): UserSession {
  const stateData = dehydrateUserState(userId);
  const history   = extractHistory(userId);
  const notified  = extractNotifiedReasons(userId);
  return {
    ...session,
    // Fallback to session values for required fields (Maps should always be populated after hydrate)
    data:             stateData.data            ?? session.data,
    meta:             stateData.meta            ?? session.meta,
    // Optional state fields: undefined = state was cleared this request (correct)
    awaitingField:    stateData.awaitingField,
    awaitingCategory: stateData.awaitingCategory,
    awaitingResume:   stateData.awaitingResume,
    history,
    notifiedReasons:  notified,
    updatedAt:        Date.now(),
  };
}
