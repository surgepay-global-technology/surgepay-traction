/**
 * Client-side types for dashboard API JSON success bodies (typically { data: ... }).
 * Keep in sync with app/api route handlers used by the dashboard.
 */

export interface CurrencyTotal {
  currency: string;
  tx_count: number;
  total: string;
}

export interface TransactionOverviewRow {
  successful_transaction_count: number;
  currencies: CurrencyTotal[];
}

export interface TransactionStatsByCurrency {
  currency: string;
  total_transaction_count: number;
  total_amount: number;
}

export interface TransactionStatsByTypeRow {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}

export interface WalletTransactionRow {
  id: string;
  transaction_type: string;
  status: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  metadata?: Record<string, unknown>;
}

export interface RecentTransactionsPagination {
  total: number | null;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface WalletsAllData {
  total_unique_wallets: number;
  total_unique_users: number;
  wallet_addresses: string[];
  wallet_details: Record<string, { txCount: number; totalVolume: number }>;
}

export interface UsersStats {
  total_users: number;
  tier1_verified: number;
  tier2_verified: number;
  tier3_verified: number;
}

export interface AppDownloadsData {
  apple_downloads: number | null;
  google_play_downloads: number | null;
  total_downloads: number;
}
