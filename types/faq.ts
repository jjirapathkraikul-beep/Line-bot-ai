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
  phone: string;
  age: string;
  occupation: string;
  monthly_income: string;
  tax_bracket: string;
  marital_status: string;
  children: string;
  interest: string;
  budget_annual: string;
  product_interest: string;
  lead_status: string;
  follow_up_status: string;
  last_question: string;
  conversation_summary: string;
  preferred_contact_time: string;
  source: string;
  first_contact_date: string;
  last_contact_date: string;
}

export type LeadUpsert = Partial<Lead> & Pick<Lead, 'line_user_id'>;
