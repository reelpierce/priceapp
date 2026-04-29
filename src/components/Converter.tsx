import { useState } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate';
import type { CurrencyCode, CurrencyInfo } from '../types/currency';
import './Converter.css';

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  usd: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  ngn: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦' },
  eur: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  gbp: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
};

export default function Converter() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('usd');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('ngn');
  
  const { rate, loading, error, lastUpdated, refetch } = useExchangeRate(fromCurrency, toCurrency);

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setAmount(sanitized);
  };

  const calculateConversion = (): string => {
    if (!rate || !amount) return '0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    return formatNumber(num * rate);
  };

  const getResultFontSize = (): string => {
    const result = calculateConversion();
    const length = result.replace(/,/g, '').length;
    
    if (length > 15) return '1.25rem';
    if (length > 12) return '1.5rem';
    if (length > 9) return '2rem';
    return '2.5rem';
  };

  const getInputFontSize = (): string => {
    const length = amount.length;
    
    if (length > 12) return '1.25rem';
    if (length > 9) return '1.5rem';
    if (length > 6) return '2rem';
    return '2.5rem';
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromInfo = CURRENCIES[fromCurrency];
  const toInfo = CURRENCIES[toCurrency];

  return (
    <div className="converter">
      {error && (
        <div className="error">
          <p className="error-message">{error}</p>
          <button onClick={refetch} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {!error && (
        <div className="converter-content">
          <div className={`converter-card ${loading ? 'loading-state' : ''}`}>
            <div className="currency-section">
              <div className="currency-header">
                <div className="currency-flag">{fromInfo.flag}</div>
                <div className="currency-info-text">
                  <div className="currency-name">{fromInfo.name}</div>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                    className="currency-select"
                    disabled={loading}
                  >
                    {Object.entries(CURRENCIES).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="amount-input-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="amount-input"
                  placeholder="0"
                  disabled={loading}
                  style={{ fontSize: getInputFontSize() }}
                />
                <span className="currency-code">{fromInfo.code}</span>
              </div>
            </div>

            <button 
              onClick={handleSwap} 
              className="swap-button" 
              aria-label="Swap currencies"
              disabled={loading}
            >
              <span className="swap-icon">⇅</span>
            </button>

            <div className="currency-section result-section">
              <div className="currency-header">
                <div className="currency-flag">{toInfo.flag}</div>
                <div className="currency-info-text">
                  <div className="currency-name">{toInfo.name}</div>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                    className="currency-select"
                    disabled={loading}
                  >
                    {Object.entries(CURRENCIES).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="result-display">
                {loading ? (
                  <div className="skeleton-text"></div>
                ) : (
                  <>
                    <span className="result-amount" style={{ fontSize: getResultFontSize() }}>
                      {calculateConversion()}
                    </span>
                    <span className="currency-code">{toInfo.code}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {lastUpdated && (
            <div className="last-updated">
              <span className="update-icon">●</span>
              Updated {formatDate(lastUpdated)}
            </div>
          )}

          <button onClick={refetch} className="refresh-button" disabled={loading}>
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>↻</span>
            {loading ? 'Updating...' : 'Refresh Rates'}
          </button>
        </div>
      )}
    </div>
  );
}
