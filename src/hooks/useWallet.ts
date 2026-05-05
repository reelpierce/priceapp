import { useState, useEffect } from 'react';
import type { WalletBalance, Transaction } from '../types/wallet';
import type { CurrencyCode } from '../types/currency';

const STORAGE_KEY = 'price-app-wallet';

const DEFAULT_BALANCES: WalletBalance = {
  usd: 1000,
  ngn: 500000,
  eur: 500,
  gbp: 400,
};

export function useWallet() {
  const [balances, setBalances] = useState<WalletBalance>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.balances || DEFAULT_BALANCES;
    }
    return DEFAULT_BALANCES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.transactions || [];
    }
    return [];
  });

  // Save to localStorage whenever balances or transactions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balances, transactions }));
  }, [balances, transactions]);

  const getBalance = (currency: CurrencyCode): number => {
    return balances[currency] || 0;
  };

  const exchange = (
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    fromAmount: number,
    rate: number
  ): boolean => {
    const currentBalance = getBalance(fromCurrency);
    
    if (currentBalance < fromAmount) {
      return false; // Insufficient balance
    }

    const toAmount = fromAmount * rate;

    // Update balances
    setBalances(prev => ({
      ...prev,
      [fromCurrency]: (prev[fromCurrency] || 0) - fromAmount,
      [toCurrency]: (prev[toCurrency] || 0) + toAmount,
    }));

    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'exchange',
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      rate,
      timestamp: Date.now(),
    };

    setTransactions(prev => [transaction, ...prev]);

    return true;
  };

  const deposit = (currency: CurrencyCode, amount: number) => {
    setBalances(prev => ({
      ...prev,
      [currency]: (prev[currency] || 0) + amount,
    }));

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      fromCurrency: currency,
      fromAmount: amount,
      timestamp: Date.now(),
    };

    setTransactions(prev => [transaction, ...prev]);
  };

  const resetWallet = () => {
    setBalances(DEFAULT_BALANCES);
    setTransactions([]);
  };

  return {
    balances,
    transactions,
    getBalance,
    exchange,
    deposit,
    resetWallet,
  };
}
