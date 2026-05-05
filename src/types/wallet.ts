import type { CurrencyCode } from './currency';

export interface WalletBalance {
  [key: string]: number; // currency code -> amount
}

export interface Transaction {
  id: string;
  type: 'exchange' | 'deposit' | 'withdraw';
  fromCurrency: CurrencyCode;
  toCurrency?: CurrencyCode;
  fromAmount: number;
  toAmount?: number;
  rate?: number;
  timestamp: number;
}

export interface WalletState {
  balances: WalletBalance;
  transactions: Transaction[];
}
