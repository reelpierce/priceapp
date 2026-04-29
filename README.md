# 💱 Price App

A fast, simple React web app for converting Nigerian Naira (NGN) to US Dollar (USD) and back. Built for crypto bros and anyone who needs quick currency conversions.

## ✨ Features

- 🔄 Real-time exchange rates
- 💸 Convert NGN ↔ USD instantly
- 📱 Mobile-friendly responsive design
- ⚡ Fast and lightweight
- 🆓 Uses free API (no rate limits)
- 📲 **PWA - Install as mobile app**
- 🌐 **Works offline with cached rates**
- 🎯 **Touch-optimized for mobile**
- 🌓 Dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Clone or download this project
cd price-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

1. Enter the amount you want to convert
2. Click the swap button to switch between NGN → USD or USD → NGN
3. See the converted amount instantly
4. Tap "Refresh Rates" to get the latest exchange rates

### 📲 Install as App (PWA)

**On Mobile (iOS/Android):**
1. Open the app in your browser (Safari/Chrome)
2. Tap the "Share" or "Menu" button
3. Select "Add to Home Screen"
4. The app will install like a native app
5. Launch from your home screen - works offline!

**On Desktop (Chrome/Edge):**
1. Look for the install icon (⊕) in the address bar
2. Click "Install" 
3. App opens in its own window

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 8** - Build tool & dev server
- **PWA** - Progressive Web App with offline support
- **fawazahmed0/exchange-api** - Free currency API

## 🔌 API

This app uses the free [exchange-api](https://github.com/fawazahmed0/exchange-api) which provides:
- 200+ currencies
- No rate limits
- Daily updates
- No API key required

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder, ready to deploy.

## 🚢 Deployment

Deploy to any static hosting service:
- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

All support PWA features out of the box!

## 📱 Mobile Optimization

- Dynamic viewport height (dvh) for proper mobile display
- Touch-friendly buttons (44px minimum)
- No zoom on input focus
- Responsive font sizing for large numbers
- Optimized for one-handed use

## 📝 License

MIT - Do whatever you want with it!

## 🤝 Contributing

Feel free to open issues or submit PRs to make this better.

---

Made with ❤️ for the crypto community
