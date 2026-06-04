import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Request withdrawal
router.post('/request', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { amount, currency, bankName, accountNumber, accountName } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!currency || !['usd', 'ngn', 'eur', 'gbp'].includes(currency.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'Bank details are required' });
    }

    // Calculate fee
    const fees = {
      ngn: 100,
      usd: 2,
      eur: 2,
      gbp: 2,
    };
    const fee = fees[currency.toLowerCase()] || 2;
    const totalAmount = amount + fee;

    await client.query('BEGIN');

    // Check balance
    const balanceResult = await client.query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, currency.toLowerCase()]
    );

    if (balanceResult.rows.length === 0 || balanceResult.rows[0].balance < totalAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient balance. You need ${totalAmount.toFixed(2)} ${currency.toUpperCase()} (including ${fee} ${currency.toUpperCase()} fee)` 
      });
    }

    // Deduct from wallet
    await client.query(
      'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 AND currency = $3',
      [totalAmount, userId, currency.toLowerCase()]
    );

    // Generate unique reference
    const reference = `WD-${Date.now()}-${userId}`;

    // Create withdrawal record
    const withdrawalResult = await client.query(
      `INSERT INTO withdrawals 
       (user_id, amount, currency, fee, bank_name, account_number, account_name, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, amount, currency.toLowerCase(), fee, bankName, accountNumber, accountName, 'pending', reference]
    );

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, from_currency, from_amount, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'withdrawal', currency.toLowerCase(), totalAmount, 'completed', reference]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: withdrawalResult.rows[0],
      reference: reference,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal request' });
  } finally {
    client.release();
  }
});

// Get withdrawal history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM withdrawals 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ withdrawals: result.rows });
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal history' });
  }
});

// Get withdrawal by reference
router.get('/:reference', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM withdrawals WHERE reference = $1 AND user_id = $2',
      [reference, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json({ withdrawal: result.rows[0] });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal' });
  }
});

// Admin: Update withdrawal status (for future admin panel)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE withdrawals 
       SET status = $1, 
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json({ withdrawal: result.rows[0] });
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({ error: 'Failed to update withdrawal status' });
  }
});

export default router;
