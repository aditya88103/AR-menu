# Restaurant Web App

A modern restaurant menu and admin management app built with React, Vite, Tailwind CSS, and Firebase-friendly architecture. The app supports a public menu view for customers and an admin dashboard for managing dishes, categories, QR code generation, and application settings.

## Key Features

- Customer-facing menu page with dish browsing and cart-style interactions.
- Admin login and protected admin routes using localStorage-based auth.
- Dish management: add new dishes, edit existing dishes, and view dish details.
- Category management to organize menus.
- QR code page for easy restaurant QR generation and sharing.
- Settings page for app configuration.
- Service worker registration for Progressive Web App support.
- AR model viewer support via `@google/model-viewer` and 3D asset rendering.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Zustand
- Three.js
- `@google/model-viewer`
- `qrcode.react`
- `react-hot-toast`
- GitHub Pages deploy support via `gh-pages`

## Project Structure

- `src/`
  - `App.jsx` - Main router and protected route handling.
  - `main.jsx` - App entry point and service worker registration.
  - `index.css` - Global CSS styling.
  - `components/` - Shared UI components.
  - `pages/admin/` - Admin application pages:
    - `Login.jsx`
    - `Dashboard.jsx`
    - `Dishes.jsx`
    - `DishForm.jsx`
    - `Categories.jsx`
    - `QRCode.jsx`
    - `Settings.jsx`
  - `pages/menu/` - Public menu page:
    - `MenuPage.jsx`
  - `hooks/useAuth.js` - Admin authentication helpers.
  - `lib/firebase.js` - Firebase initialization and config.
  - `utils/firestore.js` - Firestore helper utilities.
  - `store/index.js` - Zustand state management store.
  - `data/demoMenu.js` - Sample menu data used for development.
  - `config/restaurant.js` - Restaurant-specific settings and metadata.

- `public/`
  - `manifest.json` - Web manifest for PWA behavior.
  - `sw.js` - Service worker script.

- `scripts/` - Project utility scripts, including `generateFoodModels.mjs`.
- `firestore.rules` - Firestore security rules.
- `vite.config.js` - Vite build configuration.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview the production build locally:

   ```bash
   npm run preview
   ```

## Deployment

This project includes a GitHub Pages deployment flow.

- Build and deploy with:

  ```bash
  npm run deploy
  ```

- The `predeploy` script runs `npm run build` first, then `deploy` publishes the `dist` folder.

## Routing

The app uses `HashRouter` to support client-side routing in static environments.

- `/menu` - Customer-facing menu page.
- `/admin/login` - Admin login page.
- `/admin` - Admin dashboard (protected).
- `/admin/dishes` - Dishes list (protected).
- `/admin/dishes/new` - Create a new dish (protected).
- `/admin/dishes/edit/:id` - Edit an existing dish (protected).
- `/admin/categories` - Category management (protected).
- `/admin/qr` - QR code page (protected).
- `/admin/settings` - Settings page (protected).

## Notes

- Admin authentication is handled through `localStorage` via `useAuth.js`.
- `@google/model-viewer` is included for 3D/AR dish presentation.
- If Firebase is used, configure credentials in `src/lib/firebase.js` and secure Firestore with `firestore.rules`.

## Useful Commands

- `npm run dev` - Start development server.
- `npm run build` - Build production assets.
- `npm run preview` - Preview production build.
- `npm run deploy` - Deploy to GitHub Pages.

## Contact

For enhancements or bug fixes, update the source files under `src/` and verify the app behavior in both the customer menu and admin dashboard flows.
