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
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  
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

  const handleFromCurrencySelect = (code: CurrencyCode) => {
    setFromCurrency(code);
    setShowFromPicker(false);
  };

  const handleToCurrencySelect = (code: CurrencyCode) => {
    setToCurrency(code);
    setShowToPicker(false);
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
              <button 
                className="currency-picker-button"
                onClick={() => setShowFromPicker(!showFromPicker)}
                disabled={loading}
              >
                <div className="currency-flag">{fromInfo.flag}</div>
                <div className="currency-info-text">
                  <div className="currency-name">{fromInfo.name}</div>
                  <div className="currency-code-small">{fromInfo.code}</div>
                </div>
                <span className="picker-arrow">▼</span>
              </button>

              {showFromPicker && (
                <div className="currency-picker">
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <button
                      key={code}
                      className={`currency-option ${code === fromCurrency ? 'active' : ''}`}
                      onClick={() => handleFromCurrencySelect(code as CurrencyCode)}
                    >
                      <span className="option-flag">{info.flag}</span>
                      <div className="option-info">
                        <div className="option-code">{info.code}</div>
                        <div className="option-name">{info.name}</div>
                      </div>
                      {code === fromCurrency && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                </div>
              )}

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
              <button 
                className="currency-picker-button"
                onClick={() => setShowToPicker(!showToPicker)}
                disabled={loading}
              >
                <div className="currency-flag">{toInfo.flag}</div>
                <div className="currency-info-text">
                  <div className="currency-name">{toInfo.name}</div>
                  <div className="currency-code-small">{toInfo.code}</div>
                </div>
                <span className="picker-arrow">▼</span>
              </button>

              {showToPicker && (
                <div className="currency-picker">
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <button
                      key={code}
                      className={`currency-option ${code === toCurrency ? 'active' : ''}`}
                      onClick={() => handleToCurrencySelect(code as CurrencyCode)}
                    >
                      <span className="option-flag">{info.flag}</span>
                      <div className="option-info">
                        <div className="option-code">{info.code}</div>
                        <div className="option-name">{info.name}</div>
                      </div>
                      {code === toCurrency && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                </div>
              )}

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
