# Mobile app

Expo / React Native client for SKUL MOGULZ.

## Run it

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

## API URL

Edit `services/api.ts` and set `BASE_URL` to your computer's LAN IP when testing on a real phone. Emulators can often use `10.0.2.2` (Android) or `localhost` (iOS simulator).

## Notes

- Auth tokens are stored with AsyncStorage
- Navigation uses Expo Router
- Chat uses the same Socket.io backend as the web app
