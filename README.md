# LinkCard

> Your dynamic digital business card, powered by LinkedIn

LinkCard is a React Native mobile app that creates beautiful, context-aware digital business cards from your LinkedIn profile. Share different versions of your card for different situations, and keep everything synced automatically.

## Features

- **LinkedIn Sync**: Import your profile data from LinkedIn and keep it up-to-date automatically
- **Multiple Card Versions**: Create different cards for different contexts (Professional, Networking, Personal)
- **Smart Sharing**: Choose exactly what information to share with each person
- **Apple Wallet**: Add your business card to Apple Wallet for instant access
- **Beautiful Templates**: Four stunning card designs inspired by Bento.me's aesthetic
- **QR Code Integration**: LinkedIn-compatible QR codes for easy connections

## Screenshots

Coming soon!

## Tech Stack

### Mobile App
- **React Native** with Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native Reanimated** for smooth animations
- **Expo Router** for navigation

### Backend API
- **Node.js** with Express
- **TypeScript**
- **PassKit Generator** for Apple Wallet passes
- **Zod** for validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on your device)

### Installation

1. Clone the repository:
```bash
cd linkcard
```

2. Install mobile app dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd api
npm install
cd ..
```

4. Copy the environment file:
```bash
cp .env.example .env
```

5. Start the backend server:
```bash
cd api
npm run dev
```

6. In a new terminal, start the mobile app:
```bash
npm start
```

7. Press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
linkcard/
├── app/                        # Expo Router screens
│   ├── _layout.tsx            # Root layout
│   ├── index.tsx              # Home screen
│   ├── onboarding.tsx         # LinkedIn import flow
│   └── share.tsx              # Smart sharing screen
├── src/
│   ├── components/
│   │   ├── ui/                # Design system components
│   │   ├── cards/             # Business card templates
│   │   └── qr/                # QR code components
│   ├── services/              # API & business logic
│   ├── stores/                # Zustand state
│   ├── constants/             # Theme & config
│   └── types/                 # TypeScript definitions
└── api/                       # Backend API
    └── src/
        ├── routes/            # API endpoints
        └── services/          # Business logic
```

## Card Templates

### Classic
Traditional business card layout with a professional feel.

### Modern
Bold, gradient-heavy design with prominent typography.

### Minimal
Clean, typography-focused with elegant simplicity.

### Bento
Grid-based layout inspired by Bento.me's playful aesthetic.

## Apple Wallet Integration

To enable Apple Wallet features, you'll need:

1. Apple Developer Program membership ($99/year)
2. Pass Type ID registered in Apple Developer portal
3. Pass signing certificate (.p12 file)
4. WWDR certificate

See [Apple's PassKit documentation](https://developer.apple.com/documentation/passkit) for setup instructions.

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |
| `PASS_TYPE_ID` | Apple Wallet Pass Type ID |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `SHARE_BASE_URL` | Base URL for shared card links |

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Design inspired by [Bento.me](https://bento.me)
- Built with [Expo](https://expo.dev)
- Icons by [Ionicons](https://ionic.io/ionicons)


