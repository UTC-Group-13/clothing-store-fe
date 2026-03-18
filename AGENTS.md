# AI Agent Guide - ShopVN Ecommerce

## Project Overview

ShopVN is a modern ecommerce frontend application built with **Vite**, **React 19**, **TypeScript**, and **Tailwind CSS**. The project uses the FakeStore API for product data and implements a complete shopping cart experience.

## Tech Stack

- **Build Tool**: Vite 8.0
- **Framework**: React 19.2.4 with TypeScript 5.9
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM v7.13.1
- **State Management**: Zustand 5.0.12 (with persist middleware)
- **Data Fetching**: TanStack React Query 5.90.21
- **HTTP Client**: Axios 1.13.6
- **Icons**: Lucide React 0.577.0
- **Notifications**: React Hot Toast 2.6.0

## Architecture

### Project Structure
```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── product/         # ProductCard, ProductList
│   └── cart/            # CartItem
├── pages/               # HomePage, ProductsPage, ProductDetailPage, CartPage
├── store/               # Zustand stores (cartStore.ts)
├── services/            # API services (api.ts)
├── types/               # TypeScript interfaces
├── utils/               # Helper functions (formatPrice, truncateText)
└── hooks/               # Custom React hooks (empty for now)
```

### State Management
- **Cart State**: Zustand store with localStorage persistence (`cartStore.ts`)
- **Server State**: React Query for API data caching and synchronization
- Cart operations: addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems

### API Integration
- Base URL: `https://fakestoreapi.com`
- Endpoints:
  - `GET /products` - All products
  - `GET /products/:id` - Single product
  - `GET /products/categories` - Categories list
  - `GET /products/category/:category` - Products by category

### Routing Structure
- `/` - Home page with featured products and category filters
- `/products` - All products page
- `/product/:id` - Product detail page
- `/cart` - Shopping cart page

## Development Workflow

### Setup & Installation
```bash
npm install
```

### Running the Project
```bash
npm run dev          # Start development server (usually http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

**New Component Pattern:**
```tsx
// Use TypeScript interfaces from types/index.ts
import type { Product } from '../../types';

interface ComponentProps {
  product: Product;
}

const Component = ({ product }: ComponentProps) => {
  // Use Tailwind classes for styling
  return <div className="bg-white rounded-lg shadow-md">...</div>;
};

export default Component;
```

export default Component;
```

**API Service Pattern:**
```typescript
// Add to services/api.ts
export const productService = {
  newEndpoint: async (): Promise<Type> => {
    const response = await api.get('/endpoint');
    return response.data;
  },
};
```

**Zustand Store Pattern:**
```typescript
// Create new store in store/ directory
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  data: Type;
  actions: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: initialValue,
      actions: () => set({ ... }),
    }),
    { name: 'store-name' }
  )
);
```

## Project Conventions

### TypeScript
- All components use `.tsx` extension
- Strict type checking enabled with `verbatimModuleSyntax`
- **Important**: Use `import type` for type-only imports
- Interfaces defined in `types/index.ts`
- Props interfaces named `ComponentNameProps`

**Type Import Pattern:**
```typescript
// Correct ✅
import type { Product, CartItem } from '../types';
import { useCartStore } from '../store/cartStore';

// Incorrect ❌
import { Product, CartItem } from '../types';  // Will cause TS1484 error
```

### Styling with Tailwind
- **Primary color**: `primary-{50-900}` (blue theme)
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Common patterns**:
  - Cards: `bg-white rounded-lg shadow-md`
  - Buttons: `bg-primary-600 hover:bg-primary-700 transition`
  - Container: `container mx-auto px-4`

### Component Organization
- Components are functional with hooks
- Use `useCartStore` for cart operations
- Use `useQuery` for data fetching
- Toast notifications for user feedback

### Formatting & Utilities
- Price formatting: `formatPriceUSD()` for USD, `formatPrice()` for VND
- Text truncation: `truncateText(text, maxLength)`
- Icons from lucide-react: `<ShoppingCart />`, `<Star />`, etc.

## Key Files

- `src/App.tsx` - Main router setup with layout
- `src/main.tsx` - React Query provider and Toast setup
- `src/store/cartStore.ts` - Shopping cart logic
- `src/services/api.ts` - API configuration and endpoints
- `tailwind.config.js` - Tailwind theme customization
- `vite.config.ts` - Vite configuration

## Common Tasks

### Add New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`: `<Route path="/path" element={<Page />} />`
3. Add navigation link in Header/Footer if needed

### Add to Cart Store
1. Add new state/action to `cartStore.ts`
2. Export from interface
3. Use in components: `const action = useCartStore(state => state.action)`

### Fetch New API Data
1. Add service function to `services/api.ts`
2. Use in component with React Query:
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: serviceFunction,
});
```

### Style New Component
- Use Tailwind utility classes
- Reference existing components for patterns
- Use `className` prop for custom styles
- Maintain mobile-first responsive design

## Gotchas & Best Practices

- **TypeScript Imports**: MUST use `import type` for type-only imports due to `verbatimModuleSyntax` setting. Regular imports will cause TS1484 errors.
- **Cart Persistence**: Cart state auto-saves to localStorage (key: `cart-storage`)
- **React Query**: Default refetchOnWindowFocus is disabled in config
- **Toaster**: Already configured in main.tsx, just use `toast.success()` or `toast.error()`
- **Image Loading**: Product images from API may load slowly; use loading states
- **TypeScript Types**: If adding new types, define in `types/index.ts` and export
- **Routing**: Use `Link` from react-router-dom, not `<a>` tags for internal navigation
- **Price Display**: API returns USD, can convert to VND with `formatPrice()` (rate: 1 USD = 23,000 VND)
- **Tailwind Version**: Project uses Tailwind CSS 3.4.1 (not v4) for stability

