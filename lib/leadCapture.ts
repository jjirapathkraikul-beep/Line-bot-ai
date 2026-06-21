import type { LeadUpsert } from '@/types/faq';

type CaptureStep =
  | 'name' | 'age' | 'gender' | 'phone'
  | 'objective' | 'product' | 'budget' | 'contact_time'
  | 'done';

export interface CaptureData {
  real_name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  purchase_objective?: string;
  product_interest?: string;
  budget?: string;
  preferred_contact_time?: string;
}

interface CaptureState {
  step: CaptureStep;
  data: CaptureData;
  startedAt: number;
}

const CAPTURE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min session
const captureMap = new Map<string, CaptureState>();

const TRIGGER_KEYWORDS = [
  'ติดต่อคุณจิราวัฒน์',
  'ขอใบเสนอราคา',
  'สนใจสมัคร',
  'เช็กเบี้ย',
  'ขอนัดคุย',
];

const SKIP_KEYWORDS = ['ข้าม', 'ไม่สะดวก', 'ไม่บอก', 'skip', 'ไม่ระบุ', 'ไม่ทราบ', 'ไม่แจ้ง'];
const CANCEL_KEYWORDS = ['ยกเลิก', 'cancel', 'หยุด', 'ออก', 'เลิก'];

const OBJECTIVE_MAP: Record<string, string> = {
  '1': 'ลดหย่อนภาษี',
  '2': 'ประกันสุขภาพ',
  '3': 'มะเร็ง/โรคร้ายแรง',
  '4': 'วางแผนเกษียณ',
  '5': 'ลงทุนระยะยาว',
  '6': 'คุ้มครองครอบครัว',
};

const PRODUCT_MAP: Record<string, string> = {
  '1': 'Tokyo SuperTax',
  '2': 'Good Health Prime',
  '3': 'Tokio Cancer Care',
  '4': 'Tokyo Beyond',
  '5': 'ยังไม่แน่ใจ อยากให้แนะนำ',
};

export function shouldStartCapture(text: string): boolean {
  return TRIGGER_KEYWORDS.some((kw) => text.includes(kw));
}

function isExpired(state: CaptureState): boolean {
  return Date.now() - state.startedAt > CAPTURE_TIMEOUT_MS;
}

export function isCapturing(userId: string): boolean {
  const state = captureMap.get(userId);
  if (!state) return false;
  if (isExpired(state) || state.step === 'done') {
    captureMap.delete(userId);
    return false;
  }
  return true;
}

export function cancelCapture(userId: string): void {
  captureMap.delete(userId);
}

export function startCapture(userId: string): string {
  captureMap.set(userId, { step: 'name', data: {}, startedAt: Date.now() });
  return (
    'ยินดีครับ 😊 เพื่อให้คุณจิราวัฒน์ติดต่อกลับได้ตรงประเด็น\n' +
    'ขอทราบชื่อของคุณลูกค้าก่อนได้เลยครับ\n\n' +
    '(พิมพ์ "ข้าม" เพื่อข้ามคำถามนั้น หรือ "ยกเลิก" เพื่อออกจากขั้นตอนนี้ได้เลยครับ)'
  );
}

export interface CaptureResult {
  reply: string;
  done: boolean;
  cancelled?: boolean;
  leadData?: CaptureData;
}

export function handleCapture(userId: string, text: string): CaptureResult {
  const state = captureMap.get(userId);
  if (!state) return { reply: '', done: true };

  const trimmed = text.trim();

  // Cancel flow
  if (CANCEL_KEYWORDS.some((kw) => trimmed.includes(kw))) {
    captureMap.delete(userId);
    return {
      reply: 'รับทราบครับ ยกเลิกขั้นตอนแล้ว\nหากต้องการนัดคุยหรือขอใบเสนอราคาในภายหลัง พิมพ์ "ติดต่อคุณจิราวัฒน์" ได้เลยครับ 😊',
      done: true,
      cancelled: true,
    };
  }

  const skip = SKIP_KEYWORDS.some((kw) => trimmed.toLowerCase().includes(kw));
  const answer = skip ? '' : trimmed;

  switch (state.step) {
    case 'name': {
      state.data.real_name = answer;
      state.step = 'age';
      const greeting = answer ? `ขอบคุณครับคุณ${answer}\n` : '';
      return { reply: `${greeting}ขอทราบอายุประมาณเท่าไรครับ?`, done: false };
    }

    case 'age': {
      state.data.age = answer;
      state.step = 'gender';
      return { reply: 'ขอทราบเพศครับ\nชาย / หญิง / ไม่สะดวกแจ้ง', done: false };
    }

    case 'gender': {
      state.data.gender = answer;
      state.step = 'phone';
      return { reply: 'ขอเบอร์ติดต่อกลับที่สะดวกครับ', done: false };
    }

    case 'phone': {
      state.data.phone = answer;
      state.step = 'objective';
      return {
        reply:
          'สนใจวางแผนเรื่องไหนเป็นหลักครับ?\n' +
          '1. ลดหย่อนภาษี\n' +
          '2. ประกันสุขภาพ\n' +
          '3. มะเร็ง/โรคร้ายแรง\n' +
          '4. วางแผนเกษียณ\n' +
          '5. ลงทุนระยะยาว\n' +
          '6. คุ้มครองครอบครัว',
        done: false,
      };
    }

    case 'objective': {
      state.data.purchase_objective = OBJECTIVE_MAP[answer] ?? answer;
      state.step = 'product';
      return {
        reply:
          'สนใจแผนไหนเป็นพิเศษไหมครับ?\n' +
          '1. Tokyo SuperTax\n' +
          '2. Good Health Prime\n' +
          '3. Tokio Cancer Care\n' +
          '4. Tokyo Beyond\n' +
          '5. ยังไม่แน่ใจ อยากให้แนะนำ',
        done: false,
      };
    }

    case 'product': {
      state.data.product_interest = PRODUCT_MAP[answer] ?? answer;
      state.step = 'budget';
      return {
        reply:
          'งบประมาณที่วางแผนไว้ประมาณเท่าไรครับ?\n' +
          'เช่น 3,000 บาท/เดือน หรือ 50,000 บาท/ปี',
        done: false,
      };
    }

    case 'budget': {
      state.data.budget = answer;
      state.step = 'contact_time';
      return {
        reply:
          'สะดวกให้คุณจิราวัฒน์ติดต่อกลับช่วงไหนครับ?\n' +
          'เช่น วันนี้เย็น / พรุ่งนี้เช้า / หลังเลิกงาน',
        done: false,
      };
    }

    case 'contact_time': {
      state.data.preferred_contact_time = answer;
      state.step = 'done';

      const d = state.data;
      const summary =
        'ขอบคุณครับ ผมสรุปข้อมูลให้นะครับ 😊\n\n' +
        `ชื่อ: ${d.real_name || '-'}\n` +
        `อายุ: ${d.age || '-'}\n` +
        `เพศ: ${d.gender || '-'}\n` +
        `เบอร์: ${d.phone || '-'}\n` +
        `วัตถุประสงค์: ${d.purchase_objective || '-'}\n` +
        `แผนที่สนใจ: ${d.product_interest || '-'}\n` +
        `งบประมาณ: ${d.budget || '-'}\n` +
        `เวลาสะดวก: ${d.preferred_contact_time || '-'}\n\n` +
        'ผมจะส่งข้อมูลให้คุณจิราวัฒน์ติดต่อกลับโดยเร็วที่สุดครับ 🙏';

      const leadData = { ...d };
      captureMap.delete(userId);

      return { reply: summary, done: true, leadData };
    }

    default:
      captureMap.delete(userId);
      return { reply: '', done: true };
  }
}

export function buildLeadFromCapture(userId: string, data: CaptureData): LeadUpsert {
  const today = new Date().toISOString().split('T')[0];
  return {
    line_user_id: userId,
    real_name: data.real_name ?? '',
    age: data.age ?? '',
    gender: data.gender ?? '',
    phone: data.phone ?? '',
    purchase_objective: data.purchase_objective ?? '',
    product_interest: data.product_interest ?? '',
    budget: data.budget ?? '',
    preferred_contact_time: data.preferred_contact_time ?? '',
    lead_status: 'qualified',
    follow_up_status: 'pending',
    last_contact_date: today,
    first_contact_date: today,
  };
}
