import { useEffect, useState } from 'react';
import { walletAPI } from '../services/api';
import { fetchCryptoPrices } from '../services/crypto';
import { FIAT_CURRENCIES, CRYPTO_CURRENCIES } from '../constants/currencies';
import './Wallet.css';

export default function Wallet() {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'ngn'>('usd');

  useEffect(() => {
    fetchBalances();
    fetchPrices();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getBalances();
      setBalances(response.balances);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const prices = await fetchCryptoPrices(['btc', 'eth', 'usdt'], ['usd', 'ngn']);
      // Store USD prices for conversion
      const usdPrices: Record<string, number> = {};
      Object.entries(prices).forEach(([crypto, fiatPrices]) => {
        usdPrices[crypto] = fiatPrices.usd || 0;
      });
      setCryptoPrices(usdPrices);
    } catch (err) {
      console.error('Failed to fetch crypto prices:', err);
    }
  };

  const formatNumber = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const calculateTotalValue = (): number => {
    let total = 0;
    
    // Add fiat balances (convert to selected currency)
    if (selectedCurrency === 'usd') {
      total += balances.usd || 0;
      // Simplified conversion (in production, use real exchange rates)
      total += (balances.ngn || 0) / 1500;
      total += (balances.eur || 0) * 1.1;
      total += (balances.gbp || 0) * 1.3;
    } else {
      total += (balances.usd || 0) * 1500;
      total += balances.ngn || 0;
      total += (balances.eur || 0) * 1650;
      total += (balances.gbp || 0) * 1950;
    }
    
    // Add crypto balances (convert to selected currency)
    const cryptoMultiplier = selectedCurrency === 'usd' ? 1 : 1500;
    total += (balances.btc || 0) * (cryptoPrices.btc || 0) * cryptoMultiplier;
    total += (balances.eth || 0) * (cryptoPrices.eth || 0) * cryptoMultiplier;
    total += (balances.usdt || 0) * (cryptoPrices.usdt || 0) * cryptoMultiplier;
    
    return total;
  };

  const getCryptoValue = (crypto: string, amount: number): number => {
    const price = cryptoPrices[crypto] || 0;
    const multiplier = selectedCurrency === 'usd' ? 1 : 1500;
    return amount * price * multiplier;
  };

  if (loading) {
    return (
      <div className="wallet">
        <h2 className="wallet-title">Your Wallet</h2>
        <div className="wallet-loading">Loading balances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet">
        <h2 className="wallet-title">Your Wallet</h2>
        <div className="wallet-error">
          <p>{error}</p>
          <button onClick={fetchBalances} className="retry-button-wallet">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const fiatCurrencies = FIAT_CURRENCIES;
  const cryptoCurrencies = CRYPTO_CURRENCIES;

  return (
    <div className="wallet">
      <div className="wallet-header">
        <h2 className="wallet-title">Your Wallet</h2>
        <div className="currency-toggle">
          <button
            className={`toggle-btn ${selectedCurrency === 'usd' ? 'active' : ''}`}
            onClick={() => setSelectedCurrency('usd')}
          >
            USD
          </button>
          <button
            className={`toggle-btn ${selectedCurrency === 'ngn' ? 'active' : ''}`}
            onClick={() => setSelectedCurrency('ngn')}
          >
            NGN
          </button>
        </div>
      </div>

      <div className="total-value-card">
        <div className="total-label">Total Portfolio Value</div>
        <div className="total-amount">
          {selectedCurrency === 'usd' ? '$' : '₦'}
          {formatNumber(calculateTotalValue(), 2)}
        </div>
      </div>

      <div className="wallet-section">
        <h3 className="section-title">💵 Fiat Currencies</h3>
        <div className="wallet-grid">
          {fiatCurrencies.map(([code, info]) => {
            const balance = balances[code] || 0;
            return (
              <div key={code} className="wallet-card">
                <div className="wallet-currency-flag">{info.flag}</div>
                <div className="wallet-info">
                  <div className="wallet-currency-code">{info.code}</div>
                  <div className="wallet-balance">
                    {info.symbol}{formatNumber(balance, info.decimals || 2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="wallet-section">
        <h3 className="section-title">₿ Cryptocurrencies</h3>
        <div className="wallet-grid">
          {cryptoCurrencies.map(([code, info]) => {
            const balance = balances[code] || 0;
            const value = getCryptoValue(code, balance);
            return (
              <div key={code} className="wallet-card crypto-card">
                <div className="wallet-currency-flag crypto-flag">{info.flag}</div>
                <div className="wallet-info">
                  <div className="wallet-currency-code">{info.code}</div>
                  <div className="wallet-balance">
                    {formatNumber(balance, info.decimals || 8)}
                  </div>
                  <div className="wallet-value">
                    ≈ {selectedCurrency === 'usd' ? '$' : '₦'}{formatNumber(value, 2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
