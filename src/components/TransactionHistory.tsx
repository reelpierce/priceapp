import { useEffect, useState } from 'react';
import { transactionsAPI } from '../services/api';
import './TransactionHistory.css';

interface Transaction {
  id: number;
  type: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  status: string;
  reference: string;
  created_at: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  ngn: '₦',
  eur: '€',
  gbp: '£',
};

const CURRENCY_FLAGS: Record<string, string> = {
  usd: '🇺🇸',
  ngn: '🇳🇬',
  eur: '🇪🇺',
  gbp: '🇬🇧',
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getHistory();
      setTransactions(response.transactions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.from_currency === filter || tx.to_currency === filter;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'From', 'To', 'Amount', 'Received', 'Rate', 'Status', 'Reference'];
    const rows = filteredTransactions.map((tx) => [
      formatDate(tx.created_at),
      tx.type,
      `${tx.from_amount} ${tx.from_currency.toUpperCase()}`,
      `${tx.to_amount} ${tx.to_currency.toUpperCase()}`,
      tx.from_amount,
      tx.to_amount,
      tx.exchange_rate,
      tx.status,
      tx.reference,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="transaction-history">
        <h2 className="history-title">Transaction History</h2>
        <div className="history-loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history">
        <h2 className="history-title">Transaction History</h2>
        <div className="history-error">
          <p>{error}</p>
          <button onClick={fetchTransactions} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <h2 className="history-title">Transaction History</h2>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No transactions yet</h3>
          <p>Your exchange history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h2 className="history-title">Transaction History</h2>
        <button onClick={exportToCSV} className="export-button">
          📥 Export CSV
        </button>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'usd' ? 'active' : ''}`}
          onClick={() => setFilter('usd')}
        >
          🇺🇸 USD
        </button>
        <button
          className={`filter-btn ${filter === 'ngn' ? 'active' : ''}`}
          onClick={() => setFilter('ngn')}
        >
          🇳🇬 NGN
        </button>
        <button
          className={`filter-btn ${filter === 'eur' ? 'active' : ''}`}
          onClick={() => setFilter('eur')}
        >
          🇪🇺 EUR
        </button>
        <button
          className={`filter-btn ${filter === 'gbp' ? 'active' : ''}`}
          onClick={() => setFilter('gbp')}
        >
          🇬🇧 GBP
        </button>
      </div>

      <div className="transactions-list">
        {filteredTransactions.map((tx) => (
          <div key={tx.id} className="transaction-card">
            <div className="transaction-main">
              <div className="transaction-currencies">
                <span className="currency-badge">
                  {CURRENCY_FLAGS[tx.from_currency]} {tx.from_currency.toUpperCase()}
                </span>
                <span className="arrow">→</span>
                <span className="currency-badge">
                  {CURRENCY_FLAGS[tx.to_currency]} {tx.to_currency.toUpperCase()}
                </span>
              </div>
              <div className="transaction-amounts">
                <div className="amount-sent">
                  <span className="label">Sent</span>
                  <span className="value">
                    {CURRENCY_SYMBOLS[tx.from_currency]}{formatNumber(tx.from_amount)}
                  </span>
                </div>
                <div className="amount-received">
                  <span className="label">Received</span>
                  <span className="value">
                    {CURRENCY_SYMBOLS[tx.to_currency]}{formatNumber(tx.to_amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="transaction-meta">
              <div className="transaction-date">{formatDate(tx.created_at)}</div>
              <div className="transaction-rate">
                Rate: 1 {tx.from_currency.toUpperCase()} = {formatNumber(tx.exchange_rate)} {tx.to_currency.toUpperCase()}
              </div>
              <div className={`transaction-status ${getStatusColor(tx.status)}`}>
                {tx.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="empty-state">
          <p>No transactions found for this filter</p>
        </div>
      )}
    </div>
  );
}
