import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRate, extractRate } from '../utils/api';
import type { CurrencyCode, UseExchangeRateResult } from '../types/currency';

/**
 * Custom hook to fetch and manage exchange rates
 */
export function useExchangeRate(
  from: CurrencyCode = 'usd',
  to: CurrencyCode = 'ngn'
): UseExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchExchangeRate(from);
      const exchangeRate = extractRate(response, from, to);
      
      setRate(exchangeRate);
      setLastUpdated(response.date as string);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rate';
      setError(errorMessage);
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    refetch: fetchRate,
  };
}
