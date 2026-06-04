import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FIAT_CURRENCIES } from '../constants/currencies';
import type { FiatCurrencyCode } from '../types/currency';
import './Withdraw.css';

const CURRENCIES = Object.fromEntries(FIAT_CURRENCIES);

interface WithdrawProps {
  onLoginRequired?: () => void;
}

export default function Withdraw({ onLoginRequired }: WithdrawProps) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<FiatCurrencyCode>('ngn');
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const currencyInfo = CURRENCIES[currency];

  // Fetch balance when currency changes
  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [currency, user]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/balances`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setBalance(data.balances[currency] || 0);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setAmount(sanitized);
    setError('');
  };

  const handleAccountNumberChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setAccountNumber(sanitized);
  };

  const getMinWithdrawal = (): number => {
    switch (currency) {
      case 'ngn':
        return 5000; // ₦5,000
      case 'usd':
        return 20; // $20
      case 'eur':
        return 20; // €20
      case 'gbp':
        return 20; // £20
      default:
        return 20;
    }
  };

  const getWithdrawalFee = (): number => {
    switch (currency) {
      case 'ngn':
        return 100; // ₦100
      case 'usd':
        return 2; // $2
      case 'eur':
        return 2; // €2
      case 'gbp':
        return 2; // £2
      default:
        return 2;
    }
  };

  const calculateTotal = (): number => {
    const withdrawAmount = parseFloat(amount) || 0;
    return withdrawAmount + getWithdrawalFee();
  };

  const handleWithdraw = async () => {
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const minAmount = getMinWithdrawal();
    const total = calculateTotal();

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < minAmount) {
      setError(`Minimum withdrawal is ${currencyInfo.symbol}${minAmount}`);
      return;
    }

    if (total > balance) {
      setError(`Insufficient balance. You need ${currencyInfo.symbol}${formatNumber(total)} (including fee)`);
      return;
    }

    if (!bankName.trim()) {
      setError('Please enter bank name');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Please enter account number');
      return;
    }

    if (!accountName.trim()) {
      setError('Please enter account name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/withdrawals/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency: currency,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal request failed');
      }

      await response.json();
      
      setSuccess(true);
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

      // Refresh balance
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
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
    <div className="withdraw">
      <div className="withdraw-card">
        <div className="withdraw-header">
          <h2 className="withdraw-title">Withdraw Money</h2>
          <p className="withdraw-subtitle">Transfer to your bank account</p>
        </div>

        {user && (
          <div className="balance-display">
            <span className="balance-label">Available Balance</span>
            <span className="balance-amount">
              {currencyInfo.symbol}{formatNumber(balance)}
            </span>
          </div>
        )}

        <div className="withdraw-form">
          <div className="form-section">
            <label className="form-label">Select Currency</label>
            <div className="currency-grid">
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <button
                  key={code}
                  className={`currency-option-btn ${currency === code ? 'active' : ''}`}
                  onClick={() => {
                    setCurrency(code as FiatCurrencyCode);
                    if (user) fetchBalance();
                  }}
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
            <label className="form-label">Withdrawal Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">{currencyInfo.symbol}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="amount-input-withdraw"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div className="amount-hint">
              Min: {currencyInfo.symbol}{formatNumber(getMinWithdrawal())} • 
              Fee: {currencyInfo.symbol}{formatNumber(getWithdrawalFee())}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Bank Details</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="text-input"
              placeholder="Bank Name"
              disabled={loading}
            />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              className="text-input"
              placeholder="Account Number"
              disabled={loading}
              maxLength={20}
            />
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="text-input"
              placeholder="Account Name"
              disabled={loading}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="withdrawal-summary">
              <div className="summary-row">
                <span>Withdrawal Amount</span>
                <span>{currencyInfo.symbol}{formatNumber(parseFloat(amount))}</span>
              </div>
              <div className="summary-row">
                <span>Processing Fee</span>
                <span>{currencyInfo.symbol}{formatNumber(getWithdrawalFee())}</span>
              </div>
              <div className="summary-row total">
                <span>Total Deducted</span>
                <span>{currencyInfo.symbol}{formatNumber(calculateTotal())}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="withdraw-error">{error}</div>
          )}

          {success && (
            <div className="withdraw-success">
              ✓ Withdrawal request submitted! Processing time: 24-48 hours
            </div>
          )}

          {!user && (
            <div className="login-prompt-withdraw">
              <p>🔒 Login or register to withdraw money</p>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            className="withdraw-button"
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? 'Processing...' : user ? 'Request Withdrawal' : 'Login to Withdraw'}
          </button>

          <div className="withdraw-info">
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <span>Processing: 24-48 hours</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <span>Secure transfer</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📧</span>
              <span>Email confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
