# Price App - Project Spec

## Overview
A React web application for converting Nigerian Naira (NGN) to US Dollar (USD) and vice versa, using real-time exchange rates from a free API.

## Requirements

### Functional Requirements
1. **Currency Conversion**
   - Convert NGN to USD
   - Convert USD to NGN
   - Display current exchange rate
   - Real-time rate updates

2. **User Interface**
   - Clean, modern design
   - Input field for amount
   - Currency selector (NGN/USD)
   - Instant conversion display
   - Last updated timestamp
   - Responsive design (mobile-friendly)

3. **API Integration**
   - Use fawazahmed0/exchange-api (free, no rate limits)
   - Primary endpoint: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`
   - Fallback endpoint: `https://latest.currency-api.pages.dev/v1/currencies/usd.json`
   - Handle API errors gracefully

### Non-Functional Requirements
- Fast load times
- Offline fallback message
- Error handling for network issues
- Accessible UI (keyboard navigation, screen readers)

## Technical Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: CSS3 (modern, clean design)
- **API**: fawazahmed0/exchange-api
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Vite
- **Package Manager**: npm

## API Details
- **Base URL**: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/`
- **Endpoints**:
  - USD rates: `/usd.json` (returns all currencies including NGN)
  - NGN rates: `/ngn.json` (returns all currencies including USD)
- **Response Format**:
  ```json
  {
    "date": "2024-03-06",
    "usd": {
      "ngn": 1376.5,
      "eur": 0.92,
      ...
    }
  }
  ```

## Features Breakdown

### Phase 1: Core Functionality
- [ ] Set up React project with Vite
- [ ] Create basic UI layout
- [ ] Implement API fetch for exchange rates
- [ ] Build conversion logic
- [ ] Display results

### Phase 2: Enhanced UX
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add last updated timestamp
- [ ] Make responsive design
- [ ] Add swap currency button

### Phase 3: Polish
- [ ] Add animations/transitions
- [ ] Optimize performance
- [ ] Add favicon and meta tags
- [ ] Test across browsers

## File Structure
```
price-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Converter.tsx
│   │   └── RateDisplay.tsx
│   ├── hooks/
│   │   └── useExchangeRate.ts
│   ├── utils/
│   │   └── api.ts
│   ├── types/
│   │   └── currency.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── TODO.txt
├── SPEC.md
└── README.md
```

## Success Criteria
- User can convert between NGN and USD instantly
- Exchange rates update automatically
- App works on mobile and desktop
- Graceful error handling when API is down
- Clean, intuitive interface
