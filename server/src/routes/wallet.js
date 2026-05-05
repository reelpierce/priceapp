import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all wallet balances for user
router.get('/balances', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT currency, balance FROM wallets WHERE user_id = $1',
      [req.user.userId]
    );

    const balances = {};
    result.rows.forEach(row => {
      balances[row.currency] = parseFloat(row.balance);
    });

    res.json({ balances });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

// Exchange currency
router.post('/exchange', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { fromCurrency, toCurrency, fromAmount, exchangeRate } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!fromCurrency || !toCurrency || !fromAmount || !exchangeRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fromAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    await client.query('BEGIN');

    // Check balance
    const balanceResult = await client.query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE',
      [userId, fromCurrency]
    );

    if (balanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const currentBalance = parseFloat(balanceResult.rows[0].balance);
    
    if (currentBalance < fromAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const toAmount = fromAmount * exchangeRate;

    // Deduct from source currency
    await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND currency = $3',
      [fromAmount, userId, fromCurrency]
    );

    // Add to target currency
    await client.query(
      'UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND currency = $3',
      [toAmount, userId, toCurrency]
    );

    // Record transaction
    const reference = `EXC-${Date.now()}-${userId}`;
    await client.query(
      `INSERT INTO transactions (user_id, type, from_currency, to_currency, from_amount, to_amount, exchange_rate, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, 'exchange', fromCurrency, toCurrency, fromAmount, toAmount, exchangeRate, 'completed', reference]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Exchange successful',
      transaction: {
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        exchangeRate,
        reference
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Exchange error:', error);
    res.status(500).json({ error: 'Exchange failed' });
  } finally {
    client.release();
  }
});

export default router;
