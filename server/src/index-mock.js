import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock user storage
const users = new Map();
const wallets = new Map();
let userIdCounter = 1;

// Mock register
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, phone } = req.body;
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const userId = userIdCounter++;
  const user = { id: userId, email, fullName, phone, kycVerified: false };
  users.set(email, { ...user, password });
  
  // Create default wallets
  wallets.set(userId, {
    usd: 1000,
    ngn: 500000,
    eur: 500,
    gbp: 400
  });
  
  const token = `mock-token-${userId}`;
  res.json({ token, user });
});

// Mock login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  const token = `mock-token-${user.id}`;
  res.json({ token, user: userWithoutPassword });
});

// Mock get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = parseInt(token?.split('-')[2]);
  
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Mock get balances
app.get('/api/wallet/balances', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = parseInt(token?.split('-')[2]);
  
  const balances = wallets.get(userId) || { usd: 0, ngn: 0, eur: 0, gbp: 0 };
  res.json({ balances });
});

// Mock exchange
app.post('/api/wallet/exchange', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = parseInt(token?.split('-')[2]);
  const { fromCurrency, toCurrency, fromAmount, exchangeRate } = req.body;
  
  const userWallets = wallets.get(userId);
  if (!userWallets) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  if (userWallets[fromCurrency] < fromAmount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  const toAmount = fromAmount * exchangeRate;
  userWallets[fromCurrency] -= fromAmount;
  userWallets[toCurrency] += toAmount;
  
  res.json({
    success: true,
    transaction: {
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      exchangeRate
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`⚠️  Using in-memory storage (data will be lost on restart)`);
});
