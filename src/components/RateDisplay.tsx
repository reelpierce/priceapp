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

  return (
    <div className="rate-display">
      <p className="rate-text">
        1 {formatCurrency(from)} = {rate.toFixed(2)} {formatCurrency(to)}
      </p>
      {lastUpdated && (
        <p className="last-updated">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
