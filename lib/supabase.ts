import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

export const isSupabaseConfigured = !!(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js-node',
      },
    },
  }
);

export interface WalletTransaction {
  id: string;
  provider: string;
  provider_transaction_id: string;
  transaction_type: string;
  status: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  reference: string | null;
  counterparty: any;
  metadata: any;
  transaction_date: string;
  user_id: string | null;
  kyc_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionStatsByCurrency {
  currency: string;
  total_transaction_count: number;
  total_amount: number;
}

export interface TransactionStatsByType {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}
