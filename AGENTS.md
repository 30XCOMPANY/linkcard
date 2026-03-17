# LinkCard - LinkedIn Business Card Generator
Expo SDK 55 + expo-router + Zustand + react-native-css + Supabase + Express API

<directory>
app/ - Expo Router screens and tab stacks (1 top-level app shell, onboarding flow, tab-local stacks)
src/components/ - Presentational components: card renderer, avatar, QR, adaptive glass
src/css/ - Tailwind v4 token bridge and global CSS entry
src/design-system/ - Shared iOS grouped-settings primitives and inline controls
src/lib/ - Icons, haptics, springs, accent palette, cn helper
src/services/ - Supabase, sharing, wallet, notifications, offline sync
src/stores/ - Zustand state and persistence
src/tw/ - react-native-css wrappers for View/Text/ScrollView/Link/Image
src/types/ - App domain types and card interfaces
api/ - Express/Vercel API routes and backend services
</directory>

<config>
app.json - Expo runtime config
babel.config.js - Expo Babel preset + Reanimated plugin
metro.config.js - Single NativeWind/react-native-css Metro pipeline
postcss.config.mjs - Tailwind v4 PostCSS plugin
tsconfig.json - TypeScript config with @/ path alias
vercel.json - Vercel routing for api/
</config>

法则:
- Settings-like screens must consume `src/design-system/settings.tsx`; page files must not invent their own grouped-list radius/material rules.
- `src/css/sf.css` owns token bridging only; spacing reference vars stay out of `@theme`.
- Core hero components may use explicit RN layout when className layout utilities are unstable.
