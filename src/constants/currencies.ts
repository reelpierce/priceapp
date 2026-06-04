import type { CurrencyCode, CurrencyInfo } from '../types/currency';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  // Fiat currencies
  usd: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$', type: 'fiat', decimals: 2 },
  ngn: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦', type: 'fiat', decimals: 2 },
  eur: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€', type: 'fiat', decimals: 2 },
  gbp: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£', type: 'fiat', decimals: 2 },
  // Cryptocurrencies
  btc: { code: 'BTC', name: 'Bitcoin', flag: '₿', symbol: '₿', type: 'crypto', network: 'bitcoin', decimals: 8 },
  eth: { code: 'ETH', name: 'Ethereum', flag: 'Ξ', symbol: 'Ξ', type: 'crypto', network: 'ethereum', decimals: 6 },
  usdt: { code: 'USDT', name: 'Tether', flag: '₮', symbol: '₮', type: 'crypto', network: 'ethereum', decimals: 2 },
};

export const FIAT_CURRENCIES = Object.entries(CURRENCIES).filter(([_, info]) => info.type === 'fiat');
export const CRYPTO_CURRENCIES = Object.entries(CURRENCIES).filter(([_, info]) => info.type === 'crypto');
