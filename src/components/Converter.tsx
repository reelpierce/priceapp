import { useState } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate';
import RateDisplay from './RateDisplay';
import type { CurrencyCode } from '../types/currency';
import './Converter.css';

export default function Converter() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('usd');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('ngn');

  const { rate, loading, error, lastUpdated, refetch } = useExchangeRate(fromCurrency, toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const calculateConversion = (): string => {
    if (!rate || !amount) return '0.00';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0.00';
    return (numAmount * rate).toFixed(2);
  };

  return (
    <div className="converter">
      {loading && <div className="loading">Loading rates...</div>}
      
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={refetch}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <RateDisplay 
            rate={rate} 
            from={fromCurrency} 
            to={toCurrency} 
            lastUpdated={lastUpdated}
          />

          <div className="converter-form">
            <div className="input-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="any"
              />
            </div>

            <div className="currency-selector">
              <div className="select-group">
                <label htmlFor="from-currency">From</label>
                <select
                  id="from-currency"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                >
                  <option value="usd">USD</option>
                  <option value="ngn">NGN</option>
                </select>
              </div>

              <button 
                className="swap-button" 
                onClick={handleSwap}
                aria-label="Swap currencies"
              >
                ⇄
              </button>

              <div className="select-group">
                <label htmlFor="to-currency">To</label>
                <select
                  id="to-currency"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                >
                  <option value="usd">USD</option>
                  <option value="ngn">NGN</option>
                </select>
              </div>
            </div>

            <div className="result">
              <p className="result-label">Converted Amount</p>
              <p className="result-value">
                {calculateConversion()} {toCurrency.toUpperCase()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
