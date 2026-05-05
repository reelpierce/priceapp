const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Wallet API
export const walletAPI = {
  getBalances: async () => {
    return apiRequest('/wallet/balances');
  },

  exchange: async (data: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    exchangeRate: number;
  }) => {
    return apiRequest('/wallet/exchange', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Transactions API
export const transactionsAPI = {
  getHistory: async (limit = 50, offset = 0) => {
    return apiRequest(`/transactions/history?limit=${limit}&offset=${offset}`);
  },

  getTransaction: async (reference: string) => {
    return apiRequest(`/transactions/${reference}`);
  },
};
