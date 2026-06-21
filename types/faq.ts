export interface FaqRow {
  category: string;
  question: string;
  answer: string;
  keyword: string;
  updated_at: string;
}

export interface Lead {
  line_user_id: string;
  display_name: string;
  real_name: string;
  age: string;
  gender: string;
  phone: string;
  monthly_income: string;
  purchase_objective: string;
  product_interest: string;
  budget: string;
  preferred_contact_time: string;
  lead_status: string;
  follow_up_status: string;
  last_question: string;
  conversation_summary: string;
  first_contact_date: string;
  last_contact_date: string;
  // legacy fields kept for backward compat
  occupation: string;
  tax_bracket: string;
  marital_status: string;
  children: string;
  interest: string;
  budget_annual: string;
  source: string;
}

export type LeadUpsert = Partial<Lead> & Pick<Lead, 'line_user_id'>;
