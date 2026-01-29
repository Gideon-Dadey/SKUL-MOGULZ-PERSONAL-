
# SKUL MOGULZ Mobile

This is the React Native mobile application for SKUL MOGULZ, built with Expo and React Native.

## Features
- **Cross-platform**: Works on both iOS and Android.
- **Authentication**: Secure login and registration.
- **Real-time**: Socket.io integration for instant updates.
- **Premium UI**: Modern appearance with dark mode support.
- **Native Navigation**: Smooth transitions using Expo Router.

## Getting Started

### Prerequisites
- Node.js
- Expo Go app on your physical device (or an emulator)

### Installation
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the app
Start the development server:
```bash
npx expo start
```
- For **Android**: Press `a` (requires Android Studio emulator or physical device).
- For **iOS**: Press `i` (requires macOS and Xcode simulator or physical device).
- Scan the QR code with the **Expo Go** app to run on your phone.

## Technical Details
- **Navigation**: Expo Router ((tabs) and (auth) groups)
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage for persistent authentication
- **API**: Axios with interceptors for JWT
- **Real-time**: Socket.io-client
