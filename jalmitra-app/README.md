# JalMitra App

React Native (Expo SDK 54) mobile app for JalMitra. See the [main README](../README.md) for the full project overview, backend setup and API reference.

## Run

```bash
npm install
cp .env.example .env    # then set EXPO_PUBLIC_API_URL to your backend
npx expo start
```

`EXPO_PUBLIC_API_URL` must be reachable from the device:

| Where the app runs | Value |
|---|---|
| Physical phone (Expo Go) | `http://<your-computer-LAN-IP>:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| iOS simulator / web | `http://localhost:8000` |

Restart `npx expo start` after changing `.env`.

## Layout

- `App.js`: entry point with navigation, the login gate and theme providers
- `src/screens/`: Home, Pump, Fields, Analytics, Saathi (chat), Alerts, History, Profile, Settings, Login, Splash
- `src/components/`: shared UI (SensorCard, PumpButton, RecommendationBanner, ...)
- `src/context/`: auth and theme state
- `src/services/api.js`: Axios client that attaches the JWT to every request
