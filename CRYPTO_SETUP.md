# Cryptocurrency Integration Setup Guide

## Step 1: Update Database Schema

Run the crypto schema update to add crypto support to your database:

### Option A: Using psql command line
```bash
psql -U postgres -d priceapp -f server/src/db/crypto_schema.sql
```

### Option B: Using pgAdmin or any PostgreSQL client
1. Open pgAdmin and connect to your `priceapp` database
2. Open the Query Tool
3. Copy and paste the contents of `server/src/db/crypto_schema.sql`
4. Execute the query

### Option C: Using the Node.js script
```bash
cd server
node run-crypto-schema.js
```

## What the Schema Update Does

1. **Creates new tables:**
   - `crypto_addresses` - Stores user crypto wallet addresses
   - `crypto_deposits` - Tracks incoming crypto deposits
   - `crypto_withdrawals` - Tracks outgoing crypto withdrawals

2. **Updates existing tables:**
   - `wallets.balance` - Increased precision to DECIMAL(20, 8) for crypto
   - `transactions.from_amount` - Increased precision for crypto
   - `transactions.to_amount` - Increased precision for crypto

3. **Adds crypto wallets:**
   - Automatically creates BTC, ETH, and USDT wallets for all existing users

## Step 2: Restart Backend Server

After running the schema update, restart your backend server:

```bash
cd server
npm start
```

## Step 3: Test Crypto Features

The app now supports:

### Cryptocurrencies Added:
- **Bitcoin (BTC)** ₿
- **Ethereum (ETH)** Ξ
- **Tether (USDT)** ₮

### Features Available:
1. **View Crypto Balances** - See BTC, ETH, USDT in your wallet
2. **Exchange Fiat ↔ Crypto** - Convert USD/NGN/EUR/GBP to/from crypto
3. **Exchange Crypto ↔ Crypto** - Convert between BTC, ETH, USDT
4. **Deposit Crypto** - Get your deposit address and send crypto
5. **Withdraw Crypto** - Send crypto to external wallets
6. **Real-time Prices** - Live crypto prices from CoinGecko API

### API Endpoints Added:
- `GET /api/crypto/addresses` - Get user's crypto addresses
- `POST /api/crypto/addresses/generate` - Generate new crypto address
- `POST /api/crypto/deposit/request` - Get deposit address
- `POST /api/crypto/deposit/verify` - Verify deposit transaction
- `POST /api/crypto/withdraw/request` - Request crypto withdrawal
- `GET /api/crypto/deposits` - Get deposit history
- `GET /api/crypto/withdrawals` - Get withdrawal history

## Important Notes

### Mock Addresses (Development)
Currently, the system generates **mock crypto addresses** for development. In production, you'll need to integrate with:
- **Bitcoin**: Use a service like BlockCypher, Blockchain.com API, or run a Bitcoin node
- **Ethereum**: Use Infura, Alchemy, or Web3.js with your own node
- **USDT**: Same as Ethereum (ERC-20) or TRON network

### Withdrawal Fees:
- BTC: 0.0001 BTC
- ETH: 0.001 ETH
- USDT: 1 USDT

### Minimum Withdrawals:
- BTC: 0.0001 BTC
- ETH: 0.001 ETH
- USDT: 10 USDT

### Required Confirmations:
- BTC: 3 confirmations
- ETH: 12 confirmations
- USDT: 12 confirmations

## Production Considerations

For production deployment, you'll need to:

1. **Integrate Real Blockchain APIs:**
   - Use services like Coinbase Commerce, NOWPayments, or Blockchain.com
   - Or run your own nodes for full control

2. **Implement Webhook Handlers:**
   - Listen for deposit confirmations
   - Auto-credit user wallets when deposits are confirmed

3. **Add Security Measures:**
   - Cold wallet storage for majority of funds
   - Hot wallet with limited funds for withdrawals
   - Multi-signature wallets for large transactions
   - Rate limiting on withdrawals
   - 2FA for crypto operations

4. **Compliance:**
   - KYC/AML verification for crypto transactions
   - Transaction monitoring
   - Reporting requirements

## Testing

To test the crypto features:

1. Login to your account
2. Go to Wallet tab - you'll see BTC, ETH, USDT balances
3. Go to Exchange tab - select crypto currencies
4. Go to Deposit tab - select crypto to get deposit address
5. Go to Withdraw tab - select crypto to withdraw

## Troubleshooting

**Schema update fails:**
- Make sure PostgreSQL is running
- Check your database credentials in `server/.env`
- Ensure you have permission to alter tables

**Crypto prices not loading:**
- Check internet connection
- CoinGecko API might be rate-limited (free tier: 10-50 calls/minute)
- Check browser console for errors

**Addresses not generating:**
- Check backend logs
- Ensure crypto routes are properly loaded
- Verify database tables were created

## Need Help?

Check the logs:
- Frontend: Browser console (F12)
- Backend: Terminal where `npm start` is running
- Database: Check PostgreSQL logs
