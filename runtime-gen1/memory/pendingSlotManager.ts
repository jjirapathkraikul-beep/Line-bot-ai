import { setRuntimeStateMetadata, type StateMetadata } from '../../lib/leadCapture';

export type PendingSlotName =
  | 'preferred_hospital'
  | 'desired_room_amount'
  | 'age'
  | 'budget_annual'
  | 'income_annual'
  | 'phone'
  | string;

export interface PendingSlotState {
  activeFlow: string;
  pendingSlot: PendingSlotName;
  pendingSlotQuestion?: string;
  updatedAt?: number;
  slots: Record<string, string>;
}

export interface PendingSlotResolution {
  field: string;
  value: string;
  fields?: Record<string, string>;
}

const PENDING_SLOT_TTL_MS = 30 * 60 * 1000;
const HEALTH_ADVISORY_STATE = 'gen1_flow:health_insurance';

export interface ThaiAnnualBudgetParseResult {
  min: number;
  max?: number;
  display: string;
}

function asMutableSession(session: unknown): { meta?: StateMetadata } | null {
  if (session !== null && typeof session === 'object') {
    return session as { meta?: StateMetadata };
  }
  return null;
}

function parseLegacyPendingSlot(lastState: string | undefined): string | null {
  if (!lastState?.startsWith('gen1_pending_slot:')) return null;
  return lastState.substring('gen1_pending_slot:'.length) || null;
}

function inferFlowFromSlot(slot: string | null): string {
  if (slot === 'phone') return 'lead_capture';
  if (slot === 'income_annual') return 'tax_planning';
  return 'health_insurance';
}

export function getPendingSlotFromSession(session: unknown, now = Date.now()): PendingSlotState | null {
  const mutableSession = asMutableSession(session);
  const meta = mutableSession?.meta;
  if (!meta) return null;

  const pendingSlot = meta.pendingSlot ?? parseLegacyPendingSlot(meta.lastState);
  if (!pendingSlot) return null;

  const updatedAt = meta.pendingSlotUpdatedAt ?? meta.stateUpdatedAt;
  if (updatedAt && now - updatedAt > PENDING_SLOT_TTL_MS) return null;

  const activeFlow = meta.activeFlow ?? meta.lastIntent ?? inferFlowFromSlot(pendingSlot);
  return {
    activeFlow,
    pendingSlot,
    pendingSlotQuestion: meta.pendingSlotQuestion,
    updatedAt,
    slots: meta.gen1Slots ?? {},
  };
}

export function getPendingSlotFromFacts(
  facts: Array<{ field: string; value: string }>,
  now = Date.now(),
): PendingSlotState | null {
  const byField = new Map(facts.map((fact) => [fact.field, fact.value]));
  const pendingSlot = byField.get('pending_slot');
  if (!pendingSlot) return null;

  const updatedAtRaw = byField.get('pending_slot_updated_at');
  const updatedAt = updatedAtRaw ? Number.parseInt(updatedAtRaw, 10) : undefined;
  if (updatedAt && now - updatedAt > PENDING_SLOT_TTL_MS) return null;

  const slots: Record<string, string> = {};
  for (const fact of facts) {
    if (fact.field.startsWith('slot:')) {
      slots[fact.field.substring('slot:'.length)] = fact.value;
    }
  }

  return {
    activeFlow: byField.get('active_flow') ?? inferFlowFromSlot(pendingSlot),
    pendingSlot,
    pendingSlotQuestion: byField.get('pending_slot_question'),
    updatedAt,
    slots,
  };
}

export function setPendingSlot(
  userId: string,
  session: unknown,
  input: { activeFlow: string; pendingSlot: PendingSlotName; pendingSlotQuestion?: string },
): void {
  const mutableSession = asMutableSession(session);
  if (!mutableSession) return;

  const now = Date.now();
  const meta = mutableSession.meta ?? {
    lastState: 'idle',
    lastIntent: 'none',
    stateUpdatedAt: now,
  };
  const updates: Partial<StateMetadata> = {
    activeFlow: input.activeFlow,
    pendingSlot: input.pendingSlot,
    pendingSlotQuestion: input.pendingSlotQuestion,
    pendingSlotUpdatedAt: now,
    lastState: `gen1_pending_slot:${input.pendingSlot}`,
    lastIntent: input.activeFlow,
  };

  mutableSession.meta = { ...meta, ...updates, stateUpdatedAt: now };
  setRuntimeStateMetadata(userId, updates);
}

export function clearPendingSlot(userId: string, session: unknown, activeFlow?: string): void {
  const mutableSession = asMutableSession(session);
  if (!mutableSession) return;

  const now = Date.now();
  const meta = mutableSession.meta ?? {
    lastState: 'idle',
    lastIntent: 'none',
    stateUpdatedAt: now,
  };
  const flow = activeFlow ?? meta.activeFlow ?? meta.lastIntent ?? 'gen1';
  const updates: Partial<StateMetadata> = {
    activeFlow: flow,
    pendingSlot: undefined,
    pendingSlotQuestion: undefined,
    pendingSlotUpdatedAt: undefined,
    lastState: flow === 'health_insurance' ? HEALTH_ADVISORY_STATE : `gen1_flow:${flow}`,
    lastIntent: flow,
  };

  mutableSession.meta = { ...meta, ...updates, stateUpdatedAt: now };
  setRuntimeStateMetadata(userId, updates);
}

export function saveResolvedSlot(
  userId: string,
  session: unknown,
  activeFlow: string,
  resolution: PendingSlotResolution,
): void {
  const mutableSession = asMutableSession(session);
  if (!mutableSession) return;

  const now = Date.now();
  const meta = mutableSession.meta ?? {
    lastState: 'idle',
    lastIntent: 'none',
    stateUpdatedAt: now,
  };
  const resolvedFields = resolution.fields ?? { [resolution.field]: resolution.value };
  const gen1Slots = {
    ...(meta.gen1Slots ?? {}),
    ...resolvedFields,
  };
  const updates: Partial<StateMetadata> = {
    activeFlow,
    gen1Slots,
    lastIntent: activeFlow,
  };

  mutableSession.meta = { ...meta, ...updates, stateUpdatedAt: now };
  setRuntimeStateMetadata(userId, updates);
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US');
}

function parseBudgetNumberToken(token: string): number | null {
  const cleaned = token.replace(/[,\s]/g, '');
  if (!cleaned) return null;

  const hasMuen = cleaned.includes('หมื่น');
  const digits = cleaned.replace(/[^\d]/g, '');
  if (!digits) return null;

  const value = Number.parseInt(digits, 10);
  if (!Number.isFinite(value)) return null;

  if (hasMuen) return value * 10000;
  if (value >= 1000) return value;
  if (value >= 1 && value <= 9) return value * 10000;
  return value;
}

export function parseThaiAnnualBudget(text: string): ThaiAnnualBudgetParseResult | null {
  const normalized = text.normalize('NFC').toLowerCase().replace(/–|—/g, '-').trim();
  if (!normalized) return null;

  const rangeMatch = normalized.match(/(\d[\d,\s]*)(?:\s*-\s*)(\d[\d,\s]*(?:หมื่น)?)/);
  if (rangeMatch) {
    const leftRaw = rangeMatch[1].replace(/[,\s]/g, '');
    const rightRaw = rangeMatch[2].replace(/[,\s]/g, '');
    let min = parseBudgetNumberToken(leftRaw);
    const max = parseBudgetNumberToken(rightRaw);
    if (!min || !max) return null;

    if (!leftRaw.includes('หมื่น') && Number.parseInt(leftRaw, 10) < 1000 && max >= 10000) {
      const magnitude = 10 ** (String(max).length - String(Number.parseInt(leftRaw, 10)).length);
      min = Number.parseInt(leftRaw, 10) * magnitude;
      if (min < 10000) min = Number.parseInt(leftRaw, 10) * 10000;
    }

    if (min > max) return null;
    return {
      min,
      max,
      display: `${formatAmount(min)}–${formatAmount(max)}`,
    };
  }

  const singleMuenMatch = normalized.match(/(\d[\d,\s]*)\s*หมื่น/);
  if (singleMuenMatch) {
    const amount = parseBudgetNumberToken(`${singleMuenMatch[1]}หมื่น`);
    if (!amount) return null;
    return { min: amount, display: formatAmount(amount) };
  }

  const explicitAmountMatch = normalized.match(/\d[\d,\s]{3,}/);
  if (explicitAmountMatch) {
    const amount = parseBudgetNumberToken(explicitAmountMatch[0]);
    if (!amount) return null;
    return { min: amount, display: formatAmount(amount) };
  }

  return null;
}

export function detectPendingSlotFromAssistantResponse(text: string): {
  activeFlow: string;
  pendingSlot: PendingSlotName;
  pendingSlotQuestion: string;
} | null {
  if (
    text.includes('ปกติเวลาเข้าโรงพยาบาล ใช้โรงพยาบาลไหนเป็นหลัก') ||
    text.includes('ปกติเข้าโรงพยาบาลไหนเป็นหลัก')
  ) {
    return {
      activeFlow: 'health_insurance',
      pendingSlot: 'preferred_hospital',
      pendingSlotQuestion: 'preferred_hospital',
    };
  }

  if (text.includes('ขอทราบอายุผู้เอาประกัน')) {
    return {
      activeFlow: 'health_insurance',
      pendingSlot: 'age',
      pendingSlotQuestion: 'age',
    };
  }

  if (text.includes('ขอทราบงบประมาณต่อปี') || text.includes('งบประมาณต่อปีที่อยากวางไว้คร่าว ๆ หน่อยครับ')) {
    return {
      activeFlow: 'health_insurance',
      pendingSlot: 'budget_annual',
      pendingSlotQuestion: 'budget_annual',
    };
  }

  if (text.includes('อยากดูค่าห้องประมาณเท่าไหร่')) {
    return {
      activeFlow: 'health_insurance',
      pendingSlot: 'desired_room_amount',
      pendingSlotQuestion: 'desired_room_amount',
    };
  }

  if (text.includes('ขอเบอร์ติดต่อกลับ') || text.includes('ขอเบอร์ติดต่อ')) {
    return {
      activeFlow: 'lead_capture',
      pendingSlot: 'phone',
      pendingSlotQuestion: 'phone',
    };
  }

  if (text.includes('รายได้ต่อปีประมาณเท่าไหร่')) {
    return {
      activeFlow: 'tax_planning',
      pendingSlot: 'income_annual',
      pendingSlotQuestion: 'income_annual',
    };
  }

  return null;
}
