import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import axios from 'axios';
import Stripe from 'stripe';

const router = express.Router();

// Initialize payment providers
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// Initialize deposit (Paystack for NGN, Stripe for others)
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate unique reference
    const reference = `DEP-${Date.now()}-${userId}`;

    // Create deposit record
    await pool.query(
      `INSERT INTO deposits (user_id, amount, currency, payment_method, payment_reference, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, amount, currency.toLowerCase(), currency === 'ngn' ? 'paystack' : 'stripe', reference, 'pending']
    );

    // Initialize payment based on currency
    if (currency.toLowerCase() === 'ngn') {
      // Use Paystack for NGN
      if (!paystackSecretKey) {
        return res.status(500).json({ error: 'Paystack not configured' });
      }

      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: user.email,
          amount: Math.round(amount * 100), // Paystack uses kobo
          currency: 'NGN',
          reference: reference,
          callback_url: `${process.env.FRONTEND_URL}/deposit/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return res.json({
        authorization_url: paystackResponse.data.data.authorization_url,
        reference: reference,
      });
    } else {
      // Use Stripe for USD, EUR, GBP
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe not configured' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Wallet Deposit',
                description: `Add ${amount} ${currency.toUpperCase()} to your wallet`,
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/deposit/success?reference=${reference}`,
        cancel_url: `${process.env.FRONTEND_URL}/deposit/cancel`,
        client_reference_id: reference,
        customer_email: user.email,
      });

      return res.json({
        authorization_url: session.url,
        reference: reference,
      });
    }
  } catch (error) {
    console.error('Initialize deposit error:', error);
    res.status(500).json({ error: 'Failed to initialize deposit' });
  }
});

// Verify deposit (Paystack)
router.get('/verify/:reference', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user.userId;

    // Get deposit record
    const depositResult = await pool.query(
      'SELECT * FROM deposits WHERE payment_reference = $1 AND user_id = $2',
      [reference, userId]
    );

    if (depositResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = depositResult.rows[0];

    if (deposit.status === 'completed') {
      return res.json({ status: 'success', deposit });
    }

    // Verify with Paystack
    if (deposit.payment_method === 'paystack') {
      const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      if (paystackResponse.data.data.status === 'success') {
        // Update deposit status
        await pool.query(
          'UPDATE deposits SET status = $1, completed_at = NOW() WHERE id = $2',
          ['completed', deposit.id]
        );

        // Credit user wallet
        await pool.query(
          `INSERT INTO wallets (user_id, currency, balance)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, currency)
           DO UPDATE SET balance = wallets.balance + $3, updated_at = NOW()`,
          [userId, deposit.currency, deposit.amount]
        );

        // Create transaction record
        await pool.query(
          `INSERT INTO transactions (user_id, type, to_currency, to_amount, status, reference)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, 'deposit', deposit.currency, deposit.amount, 'completed', reference]
        );

        return res.json({ status: 'success', deposit });
      }
    }

    res.json({ status: 'pending', deposit });
  } catch (error) {
    console.error('Verify deposit error:', error);
    res.status(500).json({ error: 'Failed to verify deposit' });
  }
});

// Paystack webhook
router.post('/webhook/paystack', async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Get deposit record
      const depositResult = await pool.query(
        'SELECT * FROM deposits WHERE payment_reference = $1',
        [reference]
      );

      if (depositResult.rows.length === 0) {
        return res.status(404).json({ error: 'Deposit not found' });
      }

      const deposit = depositResult.rows[0];

      if (deposit.status !== 'completed') {
        // Update deposit status
        await pool.query(
          'UPDATE deposits SET status = $1, completed_at = NOW() WHERE id = $2',
          ['completed', deposit.id]
        );

        // Credit user wallet
        await pool.query(
          `INSERT INTO wallets (user_id, currency, balance)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, currency)
           DO UPDATE SET balance = wallets.balance + $3, updated_at = NOW()`,
          [deposit.user_id, deposit.currency, deposit.amount]
        );

        // Create transaction record
        await pool.query(
          `INSERT INTO transactions (user_id, type, to_currency, to_amount, status, reference)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [deposit.user_id, 'deposit', deposit.currency, deposit.amount, 'completed', reference]
        );
      }
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const reference = session.client_reference_id;

      // Get deposit record
      const depositResult = await pool.query(
        'SELECT * FROM deposits WHERE payment_reference = $1',
        [reference]
      );

      if (depositResult.rows.length === 0) {
        return res.status(404).json({ error: 'Deposit not found' });
      }

      const deposit = depositResult.rows[0];

      if (deposit.status !== 'completed') {
        // Update deposit status
        await pool.query(
          'UPDATE deposits SET status = $1, completed_at = NOW() WHERE id = $2',
          ['completed', deposit.id]
        );

        // Credit user wallet
        await pool.query(
          `INSERT INTO wallets (user_id, currency, balance)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, currency)
           DO UPDATE SET balance = wallets.balance + $3, updated_at = NOW()`,
          [deposit.user_id, deposit.currency, deposit.amount]
        );

        // Create transaction record
        await pool.query(
          `INSERT INTO transactions (user_id, type, to_currency, to_amount, status, reference)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [deposit.user_id, 'deposit', deposit.currency, deposit.amount, 'completed', reference]
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
