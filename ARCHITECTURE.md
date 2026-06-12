# QR Restaurant Menu - Architecture

## Project Structure Overview

```
src/
├── components/              # React UI Components
│   ├── common/             # Reusable UI components (Button, Header, etc.)
│   ├── layout/             # Layout wrapper components
│   └── menu/               # Menu-specific components
│
├── pages/                  # Page-level components (with React Router)
│   ├── RestaurantPage.tsx
│   ├── MenuPage.tsx
│   ├── ItemDetailPage.tsx
│   └── NotFoundPage.tsx
│
├── types/                  # TypeScript interfaces and types
│   └── index.ts
│
├── hooks/                  # Custom React hooks
│   ├── useRestaurant.ts
│   ├── useTranslation.ts
│   └── useLanguage.ts
│
├── utils/                  # Utility functions
│   ├── dataLoader.ts       # Load restaurant data
│   └── helpers.ts
│
├── i18n/                   # Internationalization
│   ├── en.json            # English translations
│   ├── es.json            # Spanish translations
│   ├── fr.json            # French translations
│   ├── ru.json            # Russian translations
│   └── index.ts           # i18n setup
│
├── data/                   # Static JSON data
│   ├── restaurants.json    # All restaurants data
│   └── translations.json   # Master translations
│
├── styles/                 # Global styles
│   └── globals.css         # Tailwind and global CSS
│
├── assets/                 # Images, icons
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── App.tsx                 # Main App component with routing
├── main.tsx               # React entry point
└── index.css              # Base styles
```

## Architecture Principles

### 1. **Component Organization**
- **common/** - Reusable components used across the app
- **layout/** - Layout wrappers and structural components
- **menu/** - Menu-specific business logic components

### 2. **Data Flow**
- Restaurant data from JSON
- Global state via Context API or custom hooks
- Language selection stored in localStorage

### 3. **Multi-Restaurant Support**
- Single JSON file contains all restaurant configurations
- URL parameters or hash routing to select restaurant
- Each restaurant has unique ID (e.g., `restaurant_1`)

### 4. **Internationalization**
- Support for 6+ languages
- Translations stored in i18n folder
- Translation keys in JSON data (e.g., `nameKey: "dish_name"`)
- Language preference in localStorage

### 5. **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Touch-friendly interface for restaurant waiters
- Print-friendly styles for showing to staff

## Key Features

✅ QR Code scanning (no special handling - just URLs)
✅ Multi-language support (6+ languages)
✅ Restaurant menu with categories
✅ Dish detail cards with images and info
✅ Allergen information display
✅ Vegetarian/Spicy indicators
✅ Shareable URLs per restaurant
✅ No backend required (static data)
✅ SEO-friendly URLs
✅ Offline-first (all data bundled)

## Technology Stack

- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v6+
- **Styling:** Tailwind CSS
- **State Management:** React Context + Custom Hooks
- **i18n:** Custom solution or i18next (Phase 2)
- **Icons:** Emoji or icon library

## Development Phases

### Phase 1 (Current) ✅
- Project structure
- TypeScript types
- Data schema

### Phase 2
- Core components setup
- React Router configuration
- Data loader utilities

### Phase 3
- Pages implementation
- i18n integration
- Styling with Tailwind

### Phase 4
- QR code handling
- Print functionality
- Performance optimization

### Phase 5
- Testing
- Documentation
- Deployment
