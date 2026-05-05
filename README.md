# 💱 Price App

A modern currency exchange platform with real wallet functionality. Convert currencies, manage balances, and execute real exchanges with authentication.

## ✨ Features

- 🔐 **User Authentication** - Secure login/register with JWT
- 💰 **Real Wallet System** - Multi-currency wallet with PostgreSQL backend
- 🔄 **Live Exchange Rates** - Real-time rates from free API
- 💸 **Currency Exchange** - Swap between USD, NGN, EUR, GBP with real balance updates
- 📊 **Transaction History** - Track all your exchanges
- 🔀 **Quick Currency Calculator** - Convert without affecting balances
- 📱 **Mobile-Friendly** - Responsive PWA design
- ⚡ **Fast & Secure** - Built with React 19 + Node.js + PostgreSQL
- 🆓 **Free API** - No rate limits
- 📲 **PWA** - Install as mobile app
- 🌐 **Offline Support** - Works offline with cached rates

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd price-app
```

#### 2. Setup Frontend
```bash
# Install frontend dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:5000/api
```

#### 3. Setup Backend
```bash
cd server

# Install backend dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and configure your database credentials
```

#### 4. Setup Database
```bash
# Create PostgreSQL database
createdb priceapp

# Run schema
psql -d priceapp -f src/db/schema.sql
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

### First Time Setup
1. **Register** - Create an account with email and password
2. **Login** - Sign in to access your wallet
3. **View Wallet** - See your default balances (USD: $1000, NGN: ₦500,000, EUR: €500, GBP: £400)

### Exchange Currencies
1. Go to the **Exchange** tab
2. Select source currency and enter amount
3. Select target currency
4. Click "Exchange Now" to swap currencies
5. Your balances update instantly

### Convert (Calculator Only)
1. Go to the **Convert** tab
2. Use the calculator to check exchange rates
3. No balance changes - just calculations

### 📲 Install as App (PWA)

**On Mobile (iOS/Android):**
1. Open the app in your browser (Safari/Chrome)
2. Tap the "Share" or "Menu" button
3. Select "Add to Home Screen"
4. Launch from your home screen - works offline!

**On Desktop (Chrome/Edge):**
1. Look for the install icon (⊕) in the address bar
2. Click "Install" 
3. App opens in its own window

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 8** - Build tool & dev server
- **PWA** - Progressive Web App with offline support

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### API
- **fawazahmed0/exchange-api** - Free currency rates (no API key needed)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Wallet
- `GET /api/wallet/balances` - Get all currency balances
- `POST /api/wallet/exchange` - Execute currency exchange

### Transactions
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/:reference` - Get specific transaction

See [server/README.md](./server/README.md) for detailed API documentation.

## 📦 Build for Production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd server
# Set NODE_ENV=production in .env
npm start
```

## 🚢 Deployment

### Frontend
Deploy to any static hosting:
- **Vercel** (Recommended)
- **Netlify**
- **Cloudflare Pages**

### Backend
Deploy to:
- **Railway** (Recommended - includes PostgreSQL)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**

### Database
- **Railway PostgreSQL** (Recommended)
- **Heroku Postgres**
- **Supabase**
- **AWS RDS**

## 🔒 Security Features

- JWT-based authentication
- bcrypt password hashing (10 rounds)
- SQL injection protection with parameterized queries
- CORS configuration
- Environment variable protection
- Atomic database transactions for exchanges

## 📱 Mobile Optimization

- Dynamic viewport height (dvh)
- Touch-friendly buttons (44px minimum)
- No zoom on input focus
- Responsive font sizing
- Optimized for one-handed use

## 🗂️ Project Structure

```
price-app/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── Auth/          # Login/Register
│   │   ├── Converter.tsx  # Calculator
│   │   ├── Exchange.tsx   # Exchange platform
│   │   └── Wallet.tsx     # Wallet view
│   ├── context/           # React context (Auth)
│   ├── hooks/             # Custom hooks
│   ├── services/          # API service layer
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── server/                # Backend source
│   └── src/
│       ├── db/           # Database schema & connection
│       ├── middleware/   # Auth middleware
│       └── routes/       # API routes
├── public/               # Static assets & PWA files
└── dist/                 # Production build
```

## 📝 License

MIT - Do whatever you want with it!

## 🤝 Contributing

Feel free to open issues or submit PRs to make this better.

---

Made with ❤️ for the crypto community
