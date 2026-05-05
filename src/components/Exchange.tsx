import { useState } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useWallet } from '../hooks/useWallet';
import type { CurrencyCode, CurrencyInfo } from '../types/currency';
import './Exchange.css';

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  usd: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  ngn: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦' },
  eur: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  gbp: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
};

export default function Exchange() {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('usd');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('ngn');
  const [amount, setAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { rate, loading } = useExchangeRate(fromCurrency, toCurrency);
  const { getBalance, exchange } = useWallet();

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setAmount(sanitized);
    setErrorMessage('');
  };

  const calculateReceiveAmount = (): number => {
    if (!rate || !amount) return 0;
    const num = parseFloat(amount);
    if (isNaN(num)) return 0;
    return num * rate;
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = () => {
    const fromAmount = parseFloat(amount);
    
    if (!fromAmount || fromAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (!rate) {
      setErrorMessage('Exchange rate not available');
      return;
    }

    const currentBalance = getBalance(fromCurrency);
    
    if (fromAmount > currentBalance) {
      setErrorMessage(`Insufficient ${CURRENCIES[fromCurrency].code} balance`);
      return;
    }

    const success = exchange(fromCurrency, toCurrency, fromAmount, rate);
    
    if (success) {
      setShowSuccess(true);
      setAmount('');
      setErrorMessage('');
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage('Exchange failed. Please try again.');
    }
  };

  const fromInfo = CURRENCIES[fromCurrency];
  const toInfo = CURRENCIES[toCurrency];
  const fromBalance = getBalance(fromCurrency);
  const receiveAmount = calculateReceiveAmount();

  return (
    <div className="exchange">
      <div className="exchange-card">
        <div className="exchange-section">
          <div className="section-label">You send</div>
          <div className="currency-select-row">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
              className="currency-dropdown"
              disabled={loading}
            >
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.flag} {info.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="amount-input-exchange"
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          <div className="balance-info">
            Balance: {formatNumber(fromBalance)} {fromInfo.code}
          </div>
        </div>

        <button 
          onClick={handleSwap} 
          className="swap-button-exchange" 
          aria-label="Swap currencies"
          disabled={loading}
        >
          ⇅
        </button>

        <div className="exchange-section">
          <div className="section-label">You receive</div>
          <div className="currency-select-row">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
              className="currency-dropdown"
              disabled={loading}
            >
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.flag} {info.code}
                </option>
              ))}
            </select>
            <div className="receive-amount">
              {formatNumber(receiveAmount)}
            </div>
          </div>
          {rate && (
            <div className="rate-info">
              1 {fromInfo.code} = {formatNumber(rate)} {toInfo.code}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="error-message-exchange">{errorMessage}</div>
        )}

        {showSuccess && (
          <div className="success-message">
            ✓ Exchange successful!
          </div>
        )}

        <button 
          onClick={handleExchange}
          className="exchange-button"
          disabled={loading || !amount || parseFloat(amount) <= 0}
        >
          {loading ? 'Loading...' : 'Exchange Now'}
        </button>
      </div>
    </div>
  );
}
