export interface BsDebtInstrument {
  id: string; // bigint, primary key, Supabase returns as string
  instrument_type: string; // enum (debt_instrument_type), not null
  deal_id: string; // bigint foreign key, not null, Supabase returns as string
  target_yield_pct: string | null; // numeric, nullable
  created_at: string; // timestamp with time zone, not null (ISO 8601 string)
}
