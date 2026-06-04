// Crypto price service using CoinGecko API (free, no key needed)

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    [currency: string]: number;
  };
}

// Map our currency codes to CoinGecko IDs
const COIN_IDS: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  usdt: 'tether',
};

// Map fiat codes to CoinGecko currency codes
const FIAT_CODES: Record<string, string> = {
  usd: 'usd',
  ngn: 'ngn',
  eur: 'eur',
  gbp: 'gbp',
};

/**
 * Fetch crypto prices from CoinGecko
 * @param cryptoCodes - Array of crypto codes (btc, eth, usdt)
 * @param fiatCodes - Array of fiat codes (usd, ngn, eur, gbp)
 * @returns Object with prices
 */
export async function fetchCryptoPrices(
  cryptoCodes: string[] = ['btc', 'eth', 'usdt'],
  fiatCodes: string[] = ['usd', 'ngn', 'eur', 'gbp']
): Promise<Record<string, Record<string, number>>> {
  try {
    const coinIds = cryptoCodes.map(code => COIN_IDS[code]).join(',');
    const currencies = fiatCodes.map(code => FIAT_CODES[code]).join(',');
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=${currencies}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data: CoinGeckoPriceResponse = await response.json();
    
    // Convert CoinGecko IDs back to our currency codes
    const prices: Record<string, Record<string, number>> = {};
    
    for (const [coinId, priceData] of Object.entries(data)) {
      const cryptoCode = Object.keys(COIN_IDS).find(
        key => COIN_IDS[key] === coinId
      );
      
      if (cryptoCode) {
        prices[cryptoCode] = {};
        for (const [fiatId, price] of Object.entries(priceData)) {
          const fiatCode = Object.keys(FIAT_CODES).find(
            key => FIAT_CODES[key] === fiatId
          );
          if (fiatCode) {
            prices[cryptoCode][fiatCode] = price;
          }
        }
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    throw error;
  }
}

/**
 * Fetch single crypto to fiat price
 */
export async function fetchCryptoPrice(
  cryptoCode: string,
  fiatCode: string
): Promise<number> {
  const prices = await fetchCryptoPrices([cryptoCode], [fiatCode]);
  return prices[cryptoCode]?.[fiatCode] || 0;
}

/**
 * Fetch crypto to crypto exchange rate
 * Uses USD as intermediate currency
 */
export async function fetchCryptoToCryptoRate(
  fromCrypto: string,
  toCrypto: string
): Promise<number> {
  const prices = await fetchCryptoPrices([fromCrypto, toCrypto], ['usd']);
  
  const fromPrice = prices[fromCrypto]?.usd || 0;
  const toPrice = prices[toCrypto]?.usd || 0;
  
  if (fromPrice === 0 || toPrice === 0) {
    throw new Error('Unable to calculate exchange rate');
  }
  
  return fromPrice / toPrice;
}

/**
 * Format crypto amount with appropriate decimals
 */
export function formatCryptoAmount(amount: number, cryptoCode: string): string {
  const decimals: Record<string, number> = {
    btc: 8,
    eth: 6,
    usdt: 2,
  };
  
  const precision = decimals[cryptoCode] || 8;
  return amount.toFixed(precision);
}

/**
 * Validate crypto address format (basic validation)
 */
export function validateCryptoAddress(address: string, cryptoCode: string): boolean {
  const patterns: Record<string, RegExp> = {
    btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    eth: /^0x[a-fA-F0-9]{40}$/,
    usdt: /^0x[a-fA-F0-9]{40}$|^T[A-Za-z1-9]{33}$/, // ETH or TRON
  };
  
  const pattern = patterns[cryptoCode];
  return pattern ? pattern.test(address) : false;
}

/**
 * Get network name for crypto
 */
export function getCryptoNetwork(cryptoCode: string): string {
  const networks: Record<string, string> = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    usdt: 'Ethereum (ERC-20)', // Default to ERC-20
  };
  
  return networks[cryptoCode] || 'Unknown';
}

/**
 * Get minimum withdrawal amount for crypto
 */
export function getMinCryptoWithdrawal(cryptoCode: string): number {
  const minimums: Record<string, number> = {
    btc: 0.0001,
    eth: 0.001,
    usdt: 10,
  };
  
  return minimums[cryptoCode] || 0;
}

/**
 * Get withdrawal fee for crypto
 */
export function getCryptoWithdrawalFee(cryptoCode: string): number {
  const fees: Record<string, number> = {
    btc: 0.0001,
    eth: 0.001,
    usdt: 1,
  };
  
  return fees[cryptoCode] || 0;
}
