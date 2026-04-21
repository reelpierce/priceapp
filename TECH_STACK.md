# Tech Stack Documentation

## Core Technologies

### Frontend Framework
**React 18.2.0**
- Component-based architecture
- Hooks for state management
- Fast virtual DOM
- Large ecosystem and community

### Language
**TypeScript 5.x**
- Type safety
- Better IDE support
- Catch errors at compile time
- Improved code documentation
- Better refactoring support

### Build Tool
**Vite 5.x**
- Lightning fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules
- Better than Create React App for modern projects

### Package Manager
**npm**
- Standard Node.js package manager
- Reliable dependency management
- Wide compatibility

## Development Dependencies

### React Type Definitions
- `@types/react` - TypeScript types for React
- `@types/react-dom` - TypeScript types for ReactDOM

### Vite Plugins
- `@vitejs/plugin-react` - Official React plugin for Vite

## API Integration

### Currency API
**fawazahmed0/exchange-api**

**Why this API?**
- ✅ Completely free
- ✅ No API key required
- ✅ No rate limits
- ✅ 200+ currencies supported
- ✅ Daily updated rates
- ✅ Multiple CDN endpoints for reliability
- ✅ Simple JSON responses

**Endpoints:**
- Primary: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`
- Fallback: `https://latest.currency-api.pages.dev/v1/currencies/usd.json`

**Response Structure:**
```json
{
  "date": "2024-03-06",
  "usd": {
    "ngn": 1376.5,
    "eur": 0.92
  }
}
```

## Styling Approach

### Pure CSS3
- No framework overhead
- Full control over styling
- Modern CSS features:
  - CSS Grid
  - Flexbox
  - CSS Variables
  - Media queries for responsive design

**Why not Tailwind/Bootstrap?**
- Smaller bundle size
- Learning opportunity
- No additional dependencies
- Easier to customize

## Project Structure

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions (API calls, helpers)
├── types/           # TypeScript type definitions
├── App.tsx          # Main app component
├── main.tsx         # Entry point
├── App.css          # App-specific styles
└── index.css        # Global styles
```

## Development Workflow

1. **Development**: `npm run dev`
   - Starts Vite dev server
   - Hot module replacement
   - Runs on http://localhost:5173

2. **Build**: `npm run build`
   - TypeScript compilation
   - Vite production build
   - Output to `dist/` folder

3. **Preview**: `npm run preview`
   - Preview production build locally
   - Test before deployment

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment Options

### Recommended Platforms
1. **Vercel** - Zero config, automatic deployments
2. **Netlify** - Easy setup, continuous deployment
3. **GitHub Pages** - Free for public repos
4. **Cloudflare Pages** - Fast global CDN

All support static React apps out of the box.

## Performance Considerations

- Vite's code splitting
- Tree shaking for smaller bundles
- Lazy loading components (if needed)
- Debounced API calls
- Memoization for expensive calculations

## Type Safety Benefits

TypeScript helps us:
- Define API response shapes
- Catch bugs before runtime
- Better autocomplete in IDE
- Self-documenting code
- Easier refactoring

## Future Scalability

Easy to add:
- More currencies
- State management (Zustand/Redux if needed)
- Routing (React Router)
- Testing (Vitest, React Testing Library)
- UI library (if design gets complex)
