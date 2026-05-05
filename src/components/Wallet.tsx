import { useWallet } from '../hooks/useWallet';
import type { CurrencyCode, CurrencyInfo } from '../types/currency';
import './Wallet.css';

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  usd: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  ngn: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦' },
  eur: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  gbp: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
};

export default function Wallet() {
  const { balances } = useWallet();

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="wallet">
      <h2 className="wallet-title">Your Wallet</h2>
      <div className="wallet-grid">
        {Object.entries(CURRENCIES).map(([code, info]) => {
          const balance = balances[code] || 0;
          return (
            <div key={code} className="wallet-card">
              <div className="wallet-currency-flag">{info.flag}</div>
              <div className="wallet-info">
                <div className="wallet-currency-code">{info.code}</div>
                <div className="wallet-balance">{formatNumber(balance)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
