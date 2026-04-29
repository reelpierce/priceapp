// Currency codes we support
export type CurrencyCode = 'usd' | 'ngn' | 'eur' | 'gbp';

// Currency information
export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  symbol: string;
}

// API response structure from fawazahmed0/exchange-api
export interface ExchangeRateResponse {
  date: string;
  [key: string]: string | Record<string, number>;
}

// Parsed exchange rate data
export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  lastUpdated: string;
}

// Hook state
export interface UseExchangeRateResult {
  rate: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refetch: () => Promise<void>;
}
