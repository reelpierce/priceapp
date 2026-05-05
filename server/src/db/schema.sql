-- Database Schema for Price App

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table (one wallet per user per currency)
CREATE TABLE wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  balance DECIMAL(20, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency)
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'withdraw', 'exchange'
  from_currency VARCHAR(10),
  to_currency VARCHAR(10),
  from_amount DECIMAL(20, 2),
  to_amount DECIMAL(20, 2),
  exchange_rate DECIMAL(20, 8),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  reference VARCHAR(255) UNIQUE,
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits table (for tracking payment gateway deposits)
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_method VARCHAR(50), -- 'paystack', 'bank_transfer', etc.
  payment_reference VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Withdrawals table
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  account_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  reference VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
