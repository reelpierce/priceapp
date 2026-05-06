import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { CurrencyCode } from '../types/currency';
import './Deposit.css';

const CURRENCIES = {
  usd: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$', provider: 'stripe' },
  ngn: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦', provider: 'paystack' },
  eur: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€', provider: 'stripe' },
  gbp: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£', provider: 'stripe' },
};

interface DepositProps {
  onLoginRequired?: () => void;
}

export default function Deposit({ onLoginRequired }: DepositProps) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<CurrencyCode>('ngn');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const currencyInfo = CURRENCIES[currency];

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setAmount(sanitized);
    setError('');
  };

  const getMinAmount = (): number => {
    switch (currency) {
      case 'ngn':
        return 1000; // ₦1,000
      case 'usd':
        return 10; // $10
      case 'eur':
        return 10; // €10
      case 'gbp':
        return 10; // £10
      default:
        return 10;
    }
  };

  const handleDeposit = async () => {
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    const depositAmount = parseFloat(amount);
    const minAmount = getMinAmount();

    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (depositAmount < minAmount) {
      setError(`Minimum deposit is ${currencyInfo.symbol}${minAmount}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call backend to initialize payment
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deposits/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          amount: depositAmount,
          currency: currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize payment');
      }

      const data = await response.json();

      // Redirect to payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="deposit">
      <div className="deposit-card">
        <div className="deposit-header">
          <h2 className="deposit-title">Add Money</h2>
          <p className="deposit-subtitle">Fund your wallet securely</p>
        </div>

        <div className="deposit-form">
          <div className="form-section">
            <label className="form-label">Select Currency</label>
            <div className="currency-grid">
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <button
                  key={code}
                  className={`currency-option-btn ${currency === code ? 'active' : ''}`}
                  onClick={() => setCurrency(code as CurrencyCode)}
                  disabled={loading}
                >
                  <span className="currency-flag-large">{info.flag}</span>
                  <span className="currency-code-text">{info.code}</span>
                  <span className="currency-name-text">{info.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">{currencyInfo.symbol}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="amount-input-deposit"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div className="amount-hint">
              Minimum: {currencyInfo.symbol}{formatNumber(getMinAmount())}
            </div>
          </div>

          <div className="payment-provider-info">
            <div className="provider-badge">
              {currencyInfo.provider === 'paystack' ? (
                <>
                  <span className="provider-icon">🔒</span>
                  <span>Secured by Paystack</span>
                </>
              ) : (
                <>
                  <span className="provider-icon">🔒</span>
                  <span>Secured by Stripe</span>
                </>
              )}
            </div>
            <p className="provider-description">
              Your payment is processed securely. We never store your card details.
            </p>
          </div>

          {error && (
            <div className="deposit-error">{error}</div>
          )}

          {!user && (
            <div className="login-prompt-deposit">
              <p>🔒 Login or register to add money</p>
            </div>
          )}

          <button
            onClick={handleDeposit}
            className="deposit-button"
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? 'Processing...' : user ? `Add ${currencyInfo.symbol}${amount || '0.00'}` : 'Login to Deposit'}
          </button>

          <div className="deposit-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Instant credit</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure payment</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span>Card & Bank</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
