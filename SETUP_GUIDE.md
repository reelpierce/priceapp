# 🚀 Complete Setup Guide - Real Wallet System

This guide will help you set up the complete Price App with real wallet functionality.

## 📦 What We Built

1. ✅ **Backend API** - Node.js + Express + PostgreSQL
2. ✅ **User Authentication** - Register/Login with JWT
3. ✅ **Real Wallets** - Database-backed currency wallets
4. ✅ **Currency Exchange** - Secure exchange between currencies
5. ✅ **Transaction History** - Track all exchanges

## 🎯 Quick Start (Development)

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Docker:
docker run --name priceapp-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

### Step 2: Create Database

```bash
# Create database
createdb priceapp

# Or using psql:
psql postgres
CREATE DATABASE priceapp;
\q
```

### Step 3: Setup Backend

```bash
cd server
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/priceapp

# Run database schema
psql priceapp < src/db/schema.sql

# Start server
npm run dev
```

Server should be running on `http://localhost:5000`

### Step 4: Test API

```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Price App API is running"}
```

## 🌐 Next Steps: Connect Frontend

### Update Frontend to Use Real API

1. Create API service file
2. Add authentication
3. Connect wallet to backend
4. Add login/register pages

Would you like me to:
1. ✅ Update the frontend to connect to the backend?
2. ✅ Add login/register pages?
3. ✅ Integrate Paystack for real deposits?
4. ✅ Deploy to production (Railway/Render)?

## 🚢 Production Deployment

### Option 1: Railway (Recommended - Easiest)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Add PostgreSQL database
5. Deploy from GitHub repo
6. Add environment variables
7. Done! ✅

### Option 2: Render

1. Go to [Render.com](https://render.com)
2. Create PostgreSQL database
3. Create Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy

### Option 3: Vercel + Supabase

1. Database: [Supabase](https://supabase.com) (Free PostgreSQL)
2. Backend: Deploy to Vercel or Railway
3. Frontend: Already on Vercel

## 💳 Payment Integration (Next Phase)

### Paystack Setup (for NGN deposits)

1. Create account: [Paystack.com](https://paystack.com)
2. Get API keys from dashboard
3. Add to `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_your_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_key
   ```
4. Implement deposit endpoint
5. Add webhook for payment verification

### Stripe Setup (for USD/EUR/GBP)

1. Create account: [Stripe.com](https://stripe.com)
2. Get API keys
3. Add to `.env`
4. Implement payment flow

## 🔐 Security Checklist

Before going live:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS (SSL certificate)
- [ ] Add rate limiting
- [ ] Implement KYC verification
- [ ] Add email verification
- [ ] Enable 2FA
- [ ] Add transaction limits
- [ ] Implement withdrawal approval system
- [ ] Add fraud detection
- [ ] Get proper licenses (if required in your country)

## 📞 Support

Need help? Let me know what you want to do next:
1. Connect frontend to backend
2. Add Paystack integration
3. Deploy to production
4. Add more features

## ⚠️ Important Legal Notice

This is a development template. Before handling real money:
1. Consult with a lawyer about financial regulations
2. Get necessary licenses
3. Implement proper KYC/AML
4. Get insurance
5. Have proper terms of service
6. Comply with local laws

---

Ready to continue? Let me know which step you want to tackle next! 🚀
