import type { ExchangeRateResponse, CurrencyCode } from '../types/currency';

const PRIMARY_API = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
const FALLBACK_API = 'https://latest.currency-api.pages.dev/v1/currencies';

/**
 * Fetches exchange rates for a given base currency
 * Tries primary endpoint first, falls back to secondary if it fails
 */
export async function fetchExchangeRate(
  baseCurrency: CurrencyCode
): Promise<ExchangeRateResponse> {
  const endpoint = `${baseCurrency}.json`;
  
  try {
    // Try primary API
    const response = await fetch(`${PRIMARY_API}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Primary API failed: ${response.status}`);
    }
    return await response.json();
  } catch (primaryError) {
    console.warn('Primary API failed, trying fallback...', primaryError);
    
    try {
      // Try fallback API
      const response = await fetch(`${FALLBACK_API}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Fallback API failed: ${response.status}`);
      }
      return await response.json();
    } catch (fallbackError) {
      throw new Error('Both API endpoints failed. Please check your connection.');
    }
  }
}

/**
 * Extracts the exchange rate between two currencies from API response
 */
export function extractRate(
  response: ExchangeRateResponse,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  const rates = response[from];
  
  if (typeof rates === 'object' && rates !== null) {
    const rate = rates[to];
    if (typeof rate === 'number') {
      return rate;
    }
  }
  
  throw new Error(`Rate not found for ${from} to ${to}`);
}
