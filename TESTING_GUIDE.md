# 🧪 Testing Guide - Price App

This guide will help you test the complete authentication and wallet system.

## Prerequisites

Before testing, ensure you have:
- ✅ PostgreSQL installed and running
- ✅ Node.js 16+ installed
- ✅ Both frontend and backend dependencies installed

## Setup Steps

### 1. Database Setup

```bash
# Create database
createdb priceapp

# Or using psql
psql -U postgres
CREATE DATABASE priceapp;
\q

# Run schema
cd server
psql -d priceapp -f src/db/schema.sql

# Verify tables created
psql -d priceapp
\dt
# Should show: users, wallets, transactions
\q
```

### 2. Backend Setup

```bash
cd server

# Install dependencies (if not done)
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# PORT=5000
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=priceapp
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key_here

# Start backend server
npm start

# You should see:
# Server running on port 5000
# Database connected successfully
```

### 3. Frontend Setup

```bash
# In project root (new terminal)
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000/api

# Start frontend dev server
npm run dev

# You should see:
# VITE v8.0.9  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

## Test Scenarios

### Test 1: User Registration ✅

1. Open http://localhost:5173
2. You should see the Login screen
3. Click "Register" link at the bottom
4. Fill in the registration form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+2348012345678` (optional)
   - Password: `test123456`
5. Click "Create Account"
6. **Expected Result**: 
   - You should be logged in automatically
   - See your name in the header: "👋 Test User"
   - See the Wallet tab with default balances

**Verify in Database:**
```sql
psql -d priceapp

-- Check user created
SELECT * FROM users WHERE email = 'test@example.com';

-- Check wallets created
SELECT * FROM wallets WHERE user_id = 1;

-- Should show 4 wallets with default balances:
-- USD: 1000.00
-- NGN: 500000.00
-- EUR: 500.00
-- GBP: 400.00
```

### Test 2: User Login ✅

1. Click "Logout" button
2. You should see the Login screen
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `test123456`
4. Click "Login"
5. **Expected Result**: 
   - Successfully logged in
   - See your wallet balances
   - JWT token stored in localStorage

**Verify Token:**
- Open DevTools (F12)
- Go to Application > Local Storage > http://localhost:5173
- Should see `auth_token` with JWT value

### Test 3: View Wallet Balances ✅

1. Click on "💰 Wallet" tab
2. **Expected Result**:
   - See 4 currency cards
   - USD: $1,000.00 🇺🇸
   - NGN: ₦500,000.00 🇳🇬
   - EUR: €500.00 🇪🇺
   - GBP: £400.00 🇬🇧

### Test 4: Currency Exchange (USD → NGN) ✅

1. Click on "🔄 Exchange" tab
2. Select "USD" in the top dropdown (should be default)
3. Enter amount: `100`
4. Select "NGN" in the bottom dropdown (should be default)
5. You should see the receive amount calculated (e.g., ~150,000 NGN)
6. Check your USD balance shows: "Balance: 1,000.00 USD"
7. Click "Exchange Now"
8. **Expected Result**:
   - Success message: "✓ Exchange successful!"
   - USD balance decreased by 100
   - NGN balance increased by exchange amount
   - Amount input cleared

**Verify in Database:**
```sql
-- Check updated balances
SELECT currency, balance FROM wallets WHERE user_id = 1;

-- Check transaction recorded
SELECT * FROM transactions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- type: 'exchange'
-- from_currency: 'usd'
-- to_currency: 'ngn'
-- from_amount: 100.00
-- to_amount: ~150000.00
-- status: 'completed'
```

### Test 5: Currency Exchange (NGN → EUR) ✅

1. In Exchange tab, select "NGN" in top dropdown
2. Enter amount: `50000`
3. Select "EUR" in bottom dropdown
4. Click "Exchange Now"
5. **Expected Result**:
   - NGN balance decreased
   - EUR balance increased
   - Transaction recorded

### Test 6: Insufficient Balance Error ✅

1. In Exchange tab, select "USD"
2. Enter amount: `10000` (more than your balance)
3. Try to exchange
4. **Expected Result**:
   - Error message: "Insufficient USD balance"
   - No balance changes
   - Exchange button should work normally after

### Test 7: Convert Calculator (No Balance Change) ✅

1. Click on "💱 Convert" tab
2. Select any currency pair
3. Enter amounts and test conversions
4. **Expected Result**:
   - Calculations work correctly
   - Exchange rates displayed
   - NO balance changes (this is just a calculator)
   - Can swap currencies with ⇅ button

### Test 8: Logout and Session Persistence ✅

1. Click "Logout" button
2. **Expected Result**:
   - Redirected to Login screen
   - JWT token removed from localStorage
   - Cannot access wallet/exchange without login

### Test 9: Invalid Login ✅

1. Try to login with wrong password
2. **Expected Result**:
   - Error message: "Invalid credentials"
   - Stay on login screen

### Test 10: Duplicate Registration ✅

1. Try to register with existing email
2. **Expected Result**:
   - Error message: "Email already exists"
   - Stay on registration screen

## API Testing (Optional)

You can test the API directly using curl or Postman:

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@example.com",
    "password": "test123",
    "fullName": "API Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@example.com",
    "password": "test123"
  }'
```

### Get Balances (requires token)
```bash
curl http://localhost:5000/api/wallet/balances \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Exchange Currency (requires token)
```bash
curl -X POST http://localhost:5000/api/wallet/exchange \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fromCurrency": "usd",
    "toCurrency": "ngn",
    "fromAmount": 50,
    "exchangeRate": 1500
  }'
```

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: 
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep priceapp`
- Check .env credentials match your PostgreSQL setup

### Issue: "Port 5000 already in use"
**Solution**:
- Change PORT in server/.env to different port (e.g., 5001)
- Update VITE_API_URL in frontend .env accordingly

### Issue: "CORS error in browser"
**Solution**:
- Backend should have CORS enabled for http://localhost:5173
- Check server/src/index.js has correct CORS configuration

### Issue: "Exchange rate not loading"
**Solution**:
- Check internet connection (API requires internet)
- API might be temporarily down - wait and retry
- Check browser console for errors

### Issue: "JWT token expired"
**Solution**:
- Logout and login again
- Token expires after 7 days by default

## Database Inspection Commands

```sql
-- Connect to database
psql -d priceapp

-- View all users
SELECT id, email, full_name, created_at FROM users;

-- View user with balances
SELECT 
  u.email, 
  u.full_name,
  w.currency, 
  w.balance 
FROM users u 
JOIN wallets w ON u.id = w.user_id 
ORDER BY u.id, w.currency;

-- View recent transactions
SELECT 
  u.email,
  t.type,
  t.from_currency,
  t.from_amount,
  t.to_currency,
  t.to_amount,
  t.status,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;

-- Check transaction count per user
SELECT 
  u.email,
  COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.email;
```

## Success Criteria ✅

Your integration is working correctly if:

- ✅ Users can register and login
- ✅ JWT authentication works
- ✅ Wallet balances display correctly
- ✅ Currency exchange updates balances
- ✅ Transactions are recorded in database
- ✅ Error handling works (insufficient balance, invalid credentials)
- ✅ Logout clears session
- ✅ Calculator works without affecting balances
- ✅ All currency pairs work (USD, NGN, EUR, GBP)

## Next Steps

After successful testing:

1. ✅ Commit and push all changes
2. 📝 Update documentation
3. 🚀 Plan payment integration for real deposits/withdrawals
4. 🌐 Deploy to production (Railway + Vercel)
5. 🔒 Add additional security features (2FA, rate limiting)
6. 📊 Add transaction history UI
7. 📧 Add email notifications

---

**Need Help?** Check the logs:
- Backend: Terminal running `npm start` in server/
- Frontend: Browser DevTools Console (F12)
- Database: `psql -d priceapp` and run queries
