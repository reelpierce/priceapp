import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Get user's crypto addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM crypto_addresses WHERE user_id = $1 AND is_active = TRUE',
      [userId]
    );

    res.json({ addresses: result.rows });
  } catch (error) {
    console.error('Get crypto addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch crypto addresses' });
  }
});

// Generate new crypto address for user
router.post('/addresses/generate', authenticateToken, async (req, res) => {
  try {
    const { currency, network } = req.body;
    const userId = req.user.userId;

    if (!['btc', 'eth', 'usdt'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency' });
    }

    // Check if address already exists
    const existing = await pool.query(
      'SELECT * FROM crypto_addresses WHERE user_id = $1 AND currency = $2 AND network = $3',
      [userId, currency, network || getCryptoNetwork(currency)]
    );

    if (existing.rows.length > 0) {
      return res.json({ address: existing.rows[0] });
    }

    // Generate a mock address (in production, use actual blockchain API)
    const address = generateMockAddress(currency);
    const networkName = network || getCryptoNetwork(currency);

    const result = await pool.query(
      `INSERT INTO crypto_addresses (user_id, currency, address, network)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, currency, address, networkName]
    );

    res.json({ address: result.rows[0] });
  } catch (error) {
    console.error('Generate crypto address error:', error);
    res.status(500).json({ error: 'Failed to generate crypto address' });
  }
});

// Request crypto deposit (returns address to send to)
router.post('/deposit/request', authenticateToken, async (req, res) => {
  try {
    const { currency, network } = req.body;
    const userId = req.user.userId;

    if (!['btc', 'eth', 'usdt'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency' });
    }

    // Get or create address
    let addressResult = await pool.query(
      'SELECT * FROM crypto_addresses WHERE user_id = $1 AND currency = $2 AND is_active = TRUE',
      [userId, currency]
    );

    if (addressResult.rows.length === 0) {
      // Generate new address
      const address = generateMockAddress(currency);
      const networkName = network || getCryptoNetwork(currency);

      addressResult = await pool.query(
        `INSERT INTO crypto_addresses (user_id, currency, address, network)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, currency, address, networkName]
      );
    }

    const depositAddress = addressResult.rows[0];

    res.json({
      currency,
      network: depositAddress.network,
      address: depositAddress.address,
      message: 'Send crypto to this address. Funds will be credited after confirmations.',
      requiredConfirmations: getRequiredConfirmations(currency),
    });
  } catch (error) {
    console.error('Crypto deposit request error:', error);
    res.status(500).json({ error: 'Failed to process deposit request' });
  }
});

// Verify crypto deposit (webhook/manual check)
router.post('/deposit/verify', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { txHash, currency, amount } = req.body;
    const userId = req.user.userId;

    if (!txHash || !currency || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Check if deposit already exists
    const existing = await client.query(
      'SELECT * FROM crypto_deposits WHERE tx_hash = $1',
      [txHash]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.json({ 
        message: 'Deposit already processed',
        deposit: existing.rows[0] 
      });
    }

    // Get user's crypto address
    const addressResult = await client.query(
      'SELECT * FROM crypto_addresses WHERE user_id = $1 AND currency = $2',
      [userId, currency]
    );

    if (addressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Crypto address not found' });
    }

    const toAddress = addressResult.rows[0].address;

    // Create deposit record
    const depositResult = await client.query(
      `INSERT INTO crypto_deposits 
       (user_id, currency, amount, network, to_address, tx_hash, confirmations, required_confirmations, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        currency,
        amount,
        addressResult.rows[0].network,
        toAddress,
        txHash,
        0,
        getRequiredConfirmations(currency),
        'confirming'
      ]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Deposit is being confirmed',
      deposit: depositResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify crypto deposit error:', error);
    res.status(500).json({ error: 'Failed to verify deposit' });
  } finally {
    client.release();
  }
});

// Complete crypto deposit (called after confirmations - webhook/cron job)
router.post('/deposit/complete', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { txHash } = req.body;

    await client.query('BEGIN');

    // Get deposit
    const depositResult = await client.query(
      'SELECT * FROM crypto_deposits WHERE tx_hash = $1 AND status = $2',
      [txHash, 'confirming']
    );

    if (depositResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Deposit not found or already completed' });
    }

    const deposit = depositResult.rows[0];

    // Update deposit status
    await client.query(
      'UPDATE crypto_deposits SET status = $1, completed_at = NOW() WHERE id = $2',
      ['completed', deposit.id]
    );

    // Credit user wallet
    await client.query(
      `INSERT INTO wallets (user_id, currency, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, currency)
       DO UPDATE SET balance = wallets.balance + $3, updated_at = NOW()`,
      [deposit.user_id, deposit.currency, deposit.amount]
    );

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, to_currency, to_amount, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [deposit.user_id, 'deposit', deposit.currency, deposit.amount, 'completed', txHash]
    );

    await client.query('COMMIT');

    res.json({ message: 'Deposit completed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Complete crypto deposit error:', error);
    res.status(500).json({ error: 'Failed to complete deposit' });
  } finally {
    client.release();
  }
});

// Request crypto withdrawal
router.post('/withdraw/request', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { currency, amount, toAddress, network } = req.body;
    const userId = req.user.userId;

    if (!currency || !amount || !toAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['btc', 'eth', 'usdt'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency' });
    }

    // Validate address format
    if (!validateAddress(toAddress, currency)) {
      return res.status(400).json({ error: 'Invalid crypto address format' });
    }

    const fee = getCryptoFee(currency);
    const totalAmount = parseFloat(amount) + fee;

    await client.query('BEGIN');

    // Check balance
    const balanceResult = await client.query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, currency]
    );

    if (balanceResult.rows.length === 0 || parseFloat(balanceResult.rows[0].balance) < totalAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient balance. You need ${totalAmount} ${currency.toUpperCase()} (including ${fee} ${currency.toUpperCase()} fee)` 
      });
    }

    // Deduct from wallet
    await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 AND currency = $3',
      [totalAmount, userId, currency]
    );

    // Generate reference
    const reference = `CW-${Date.now()}-${userId}`;

    // Create withdrawal record
    const withdrawalResult = await client.query(
      `INSERT INTO crypto_withdrawals 
       (user_id, currency, amount, fee, network, to_address, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, currency, amount, fee, network || getCryptoNetwork(currency), toAddress, 'pending', reference]
    );

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, from_currency, from_amount, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'withdrawal', currency, totalAmount, 'completed', reference]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: withdrawalResult.rows[0],
      reference: reference,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Crypto withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal request' });
  } finally {
    client.release();
  }
});

// Get crypto deposit history
router.get('/deposits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM crypto_deposits 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Get crypto deposits error:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
});

// Get crypto withdrawal history
router.get('/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM crypto_withdrawals 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ withdrawals: result.rows });
  } catch (error) {
    console.error('Get crypto withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// Helper functions
function generateMockAddress(currency) {
  // In production, use actual blockchain API to generate real addresses
  const prefixes = {
    btc: '1',
    eth: '0x',
    usdt: '0x', // ERC-20
  };
  
  const prefix = prefixes[currency] || '0x';
  const length = currency === 'btc' ? 34 : 40;
  const chars = currency === 'btc' 
    ? '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    : '0123456789abcdef';
  
  let address = prefix;
  for (let i = prefix.length; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}

function getCryptoNetwork(currency) {
  const networks = {
    btc: 'bitcoin',
    eth: 'ethereum',
    usdt: 'ethereum', // Default to ERC-20
  };
  return networks[currency] || 'unknown';
}

function getRequiredConfirmations(currency) {
  const confirmations = {
    btc: 3,
    eth: 12,
    usdt: 12,
  };
  return confirmations[currency] || 3;
}

function getCryptoFee(currency) {
  const fees = {
    btc: 0.0001,
    eth: 0.001,
    usdt: 1,
  };
  return fees[currency] || 0;
}

function validateAddress(address, currency) {
  const patterns = {
    btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    eth: /^0x[a-fA-F0-9]{40}$/,
    usdt: /^0x[a-fA-F0-9]{40}$|^T[A-Za-z1-9]{33}$/,
  };
  
  const pattern = patterns[currency];
  return pattern ? pattern.test(address) : false;
}

export default router;
