export type HospitalRateConfidence = 'High' | 'Medium' | 'Low';
export type HospitalMappingSource = 'ghp_mapping_amount' | 'room_food_fallback' | 'total_daily_proxy' | 'missing';

export interface HospitalRoomRateRecord {
  hospitalNameTh: string;
  aliases: string[];
  province: string;
  area: string;
  roomType: string;
  checkedDate?: string;
  totalDailyCharge?: number;
  roomCharge?: number;
  foodCharge?: number;
  ghpMappingAmount?: number;
  suggestedGhpPlan: number;
  confidence: HospitalRateConfidence;
  dataCompleteness: string;
  sourceType: string;
  sourceUrl?: string;
  mappingNote: string;
}

export interface HospitalMappingResolution {
  amount?: number;
  source: HospitalMappingSource;
  confidence: HospitalRateConfidence;
  plan: number;
  shortfallRisk: boolean;
}

const GHP_ROOM_PLAN_TIERS = [2000, 3000, 4000, 6000, 8000, 10000, 12000];

export const HOSPITAL_ROOM_RATE_REFERENCES: HospitalRoomRateRecord[] = [
  {
    hospitalNameTh: 'โรงพยาบาลนนทเวช',
    aliases: ['นนทเวช', 'รพ นนทเวช', 'รพ.นนทเวช', 'โรงพยาบาลนนทเวช', 'nonthavej'],
    province: 'นนทบุรี',
    area: 'งามวงศ์วาน',
    roomType: 'Superior A',
    checkedDate: '2026-07-02',
    totalDailyCharge: 7860,
    roomCharge: 3900,
    foodCharge: 660,
    ghpMappingAmount: 4560,
    suggestedGhpPlan: 6000,
    confidence: 'High',
    dataCompleteness: 'Full room+food components available',
    sourceType: 'Official hospital website',
    sourceUrl: 'https://www.nonthavej.co.th/superior-a.php',
    mappingNote: 'Use ghp_mapping_amount 4,560 for GHP room-plan comparison; do not map from total daily charge 7,860.',
  },
  {
    hospitalNameTh: 'โรงพยาบาลเมดพาร์ค',
    aliases: ['เมดพาร์ค', 'รพ เมดพาร์ค', 'รพ.เมดพาร์ค', 'โรงพยาบาลเมดพาร์ค', 'medpark'],
    province: 'กรุงเทพฯ',
    area: 'พระราม 4',
    roomType: 'Executive Lake View',
    checkedDate: '2026-07-02',
    totalDailyCharge: 12800,
    roomCharge: 5700,
    foodCharge: 1500,
    ghpMappingAmount: 7200,
    suggestedGhpPlan: 8000,
    confidence: 'High',
    dataCompleteness: 'Full room+food components available',
    sourceType: 'Official hospital website',
    sourceUrl: 'https://www.medparkhospital.com/rooms?room=executive-lake-view',
    mappingNote: 'Use ghp_mapping_amount 7,200 for GHP room-plan comparison.',
  },
  {
    hospitalNameTh: 'โรงพยาบาลเกษมราษฎร์ อินเตอร์เนชั่นแนล',
    aliases: [
      'เกษมราษฎร์ อินเตอร์',
      'เกษมราษฎร์ อินเตอร์เนชั่นแนล',
      'เกษมราษฎร์ รัตนาธิเบศร์',
      'kasemrad inter',
      'kasemrad international',
    ],
    province: 'นนทบุรี',
    area: 'รัตนาธิเบศร์',
    roomType: 'VIP Silver Room',
    checkedDate: '2026-07-02',
    totalDailyCharge: 9460,
    roomCharge: 4000,
    foodCharge: 910,
    ghpMappingAmount: 4910,
    suggestedGhpPlan: 6000,
    confidence: 'High',
    dataCompleteness: 'Full room+food components available',
    sourceType: 'Official hospital website / user screenshot',
    sourceUrl: 'https://kasemradinter.com/our-services/ward/vip-silver-room/',
    mappingNote: 'Use ghp_mapping_amount 4,910; do not map from total daily charge 9,460.',
  },
];

export function mapGhpPlanFromAmount(amount: number): number {
  return GHP_ROOM_PLAN_TIERS.find((tier) => amount <= tier) ?? GHP_ROOM_PLAN_TIERS[GHP_ROOM_PLAN_TIERS.length - 1];
}

export function normalizeHospitalLookupText(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/โรงพยาบาล/g, '')
    .replace(/รพ\.?/g, '')
    .replace(/[()\-_/.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findHospitalRoomRate(query: string): HospitalRoomRateRecord | null {
  const normalizedQuery = normalizeHospitalLookupText(query);
  if (!normalizedQuery) return null;

  return HOSPITAL_ROOM_RATE_REFERENCES.find((record) => {
    const names = [record.hospitalNameTh, ...record.aliases].map(normalizeHospitalLookupText);
    return names.some((alias) => alias && (normalizedQuery.includes(alias) || alias.includes(normalizedQuery)));
  }) ?? null;
}

export function resolveHospitalMapping(record: HospitalRoomRateRecord): HospitalMappingResolution {
  if (record.ghpMappingAmount) {
    return {
      amount:        record.ghpMappingAmount,
      source:        'ghp_mapping_amount',
      confidence:    record.confidence,
      plan:          mapGhpPlanFromAmount(record.ghpMappingAmount),
      shortfallRisk: record.ghpMappingAmount > 12000,
    };
  }

  if (record.roomCharge && record.foodCharge) {
    const amount = record.roomCharge + record.foodCharge;
    return {
      amount,
      source:        'room_food_fallback',
      confidence:    record.confidence,
      plan:          mapGhpPlanFromAmount(amount),
      shortfallRisk: amount > 12000,
    };
  }

  if (record.totalDailyCharge) {
    return {
      amount:        record.totalDailyCharge,
      source:        'total_daily_proxy',
      confidence:    record.confidence === 'High' ? 'Medium' : record.confidence,
      plan:          mapGhpPlanFromAmount(record.totalDailyCharge),
      shortfallRisk: record.totalDailyCharge > 12000,
    };
  }

  return {
    source:        'missing',
    confidence:    'Low',
    plan:          6000,
    shortfallRisk: false,
  };
}
