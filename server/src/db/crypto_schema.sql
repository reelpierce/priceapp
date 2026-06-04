-- Crypto Integration Schema Updates

-- Add crypto addresses table for user crypto wallets
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL, -- 'btc', 'eth', 'usdt'
  address VARCHAR(255) NOT NULL,
  network VARCHAR(50), -- 'bitcoin', 'ethereum', 'tron' (for USDT)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency, network)
);

-- Add crypto deposits table (separate from fiat deposits)
CREATE TABLE IF NOT EXISTS crypto_deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL, -- 'btc', 'eth', 'usdt'
  amount DECIMAL(20, 8) NOT NULL, -- Higher precision for crypto
  network VARCHAR(50),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  tx_hash VARCHAR(255) UNIQUE,
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirming', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Add crypto withdrawals table (separate from fiat withdrawals)
CREATE TABLE IF NOT EXISTS crypto_withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL, -- 'btc', 'eth', 'usdt'
  amount DECIMAL(20, 8) NOT NULL, -- Higher precision for crypto
  fee DECIMAL(20, 8) DEFAULT 0,
  network VARCHAR(50),
  to_address VARCHAR(255) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  reference VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Update wallets table to support higher precision for crypto
-- Note: This alters existing table, run carefully
ALTER TABLE wallets ALTER COLUMN balance TYPE DECIMAL(20, 8);

-- Update transactions table to support higher precision
ALTER TABLE transactions ALTER COLUMN from_amount TYPE DECIMAL(20, 8);
ALTER TABLE transactions ALTER COLUMN to_amount TYPE DECIMAL(20, 8);

-- Create indexes for crypto tables
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_currency ON crypto_addresses(currency);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user_id ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_tx_hash ON crypto_deposits(tx_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_user_id ON crypto_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_tx_hash ON crypto_withdrawals(tx_hash);

-- Insert default crypto wallets for existing users (optional)
-- This will create BTC, ETH, USDT wallets for all existing users
INSERT INTO wallets (user_id, currency, balance)
SELECT id, 'btc', 0.00000000 FROM users
ON CONFLICT (user_id, currency) DO NOTHING;

INSERT INTO wallets (user_id, currency, balance)
SELECT id, 'eth', 0.00000000 FROM users
ON CONFLICT (user_id, currency) DO NOTHING;

INSERT INTO wallets (user_id, currency, balance)
SELECT id, 'usdt', 0.00000000 FROM users
ON CONFLICT (user_id, currency) DO NOTHING;
