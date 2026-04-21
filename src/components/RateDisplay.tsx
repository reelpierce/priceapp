import type { CurrencyCode } from '../types/currency';
import './RateDisplay.css';

interface RateDisplayProps {
  rate: number | null;
  from: CurrencyCode;
  to: CurrencyCode;
  lastUpdated: string | null;
}

export default function RateDisplay({ rate, from, to, lastUpdated }: RateDisplayProps) {
  if (!rate) return null;

  const formatCurrency = (code: CurrencyCode) => code.toUpperCase();
  
  const formatRate = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rate-display">
      <div className="rate-info">
        <span className="rate-label">Current Rate</span>
        <p className="rate-text">
          1 {formatCurrency(from)} = <strong>{formatRate(rate)}</strong> {formatCurrency(to)}
        </p>
      </div>
      {lastUpdated && (
        <p className="last-updated">
          <span className="update-icon">🕒</span>
          Updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
}
