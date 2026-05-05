# Price App Backend API

Backend server for the Price App currency exchange platform with real wallet functionality.

## 🚀 Features

- ✅ User authentication (Register/Login with JWT)
- ✅ Multi-currency wallets (USD, NGN, EUR, GBP)
- ✅ Real-time currency exchange
- ✅ Transaction history
- ✅ PostgreSQL database
- ✅ Secure password hashing
- ✅ RESTful API

## 📋 Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- npm or yarn

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb priceapp

# Run schema
psql priceapp < src/db/schema.sql
```

**Option B: Use a Cloud Database**
- [Supabase](https://supabase.com) - Free PostgreSQL
- [Railway](https://railway.app) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/priceapp
JWT_SECRET=your-super-secret-key-here
PAYSTACK_SECRET_KEY=sk_test_your_key
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "phone": "+2348012345678"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Wallet

#### Get Balances
```http
GET /api/wallet/balances
Authorization: Bearer <token>
```

#### Exchange Currency
```http
POST /api/wallet/exchange
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromCurrency": "usd",
  "toCurrency": "ngn",
  "fromAmount": 100,
  "exchangeRate": 1376.5
}
```

### Transactions

#### Get Transaction History
```http
GET /api/transactions/history?limit=50&offset=0
Authorization: Bearer <token>
```

#### Get Single Transaction
```http
GET /api/transactions/:reference
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `full_name` - User's full name
- `phone` - Phone number
- `kyc_verified` - KYC verification status
- `created_at` - Registration timestamp

### Wallets Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `currency` - Currency code (usd, ngn, eur, gbp)
- `balance` - Current balance
- `created_at` - Creation timestamp

### Transactions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `type` - Transaction type (exchange, deposit, withdraw)
- `from_currency` - Source currency
- `to_currency` - Target currency
- `from_amount` - Amount sent
- `to_amount` - Amount received
- `exchange_rate` - Exchange rate used
- `status` - Transaction status
- `reference` - Unique reference
- `created_at` - Transaction timestamp

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Database transactions for atomic operations
- ✅ Input validation

## 🚢 Deployment

### Deploy to Railway

1. Create account on [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Add environment variables

### Deploy to Render

1. Create account on [Render.com](https://render.com)
2. Create PostgreSQL database
3. Create Web Service from GitHub
4. Add environment variables
5. Deploy

## 📝 Next Steps

- [ ] Add Paystack integration for deposits
- [ ] Add withdrawal functionality
- [ ] Add email notifications
- [ ] Add KYC verification
- [ ] Add rate limiting
- [ ] Add admin dashboard
- [ ] Add 2FA authentication

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT
