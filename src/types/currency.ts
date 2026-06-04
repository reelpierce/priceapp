// Currency codes we support (fiat + crypto)
export type FiatCurrencyCode = 'usd' | 'ngn' | 'eur' | 'gbp';
export type CryptoCurrencyCode = 'btc' | 'eth' | 'usdt';
export type CurrencyCode = FiatCurrencyCode | CryptoCurrencyCode;

// Currency type
export type CurrencyType = 'fiat' | 'crypto';

// Currency information
export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  type: CurrencyType;
  network?: string; // For crypto: 'bitcoin', 'ethereum', 'tron'
  decimals?: number; // Precision for display
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
