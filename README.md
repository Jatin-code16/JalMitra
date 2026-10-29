# 💧 JalMitra — Smart Irrigation Assistant for Smallholder Farmers

> *Smart Farming. Smarter Irrigation.*

JalMitra helps small farmers decide **when and how much to irrigate**. Soil-moisture, temperature and humidity readings from the field feed a crop-aware recommendation engine. Farmers can see live field conditions, switch their water pump on or off remotely over MQTT, track weekly water usage, and ask questions in Hindi/Hinglish to **Saathi**, an AI assistant powered by Google Gemini.

---

## ✨ Features

| Area | What it does |
|---|---|
| **OTP login** | Phone-number login for Indian mobile numbers with a 6-digit OTP. New farmers are registered automatically, and the app issues a JWT that lasts 7 days. |
| **Live dashboard** | Shows the latest soil moisture, temperature and humidity, and whether the sensor is online (a reading in the last 30 s). Refreshes every 30 s. |
| **Irrigation recommendation** | A rule-based engine returns `irrigate` / `skip` / `monitor` with a confidence score, a reason in Hindi, alerts and the next time to check. It uses crop profiles for wheat, rice, cotton, sugarcane and maize. |
| **Remote pump control** | Turns the pump ON or OFF for 1–180 minutes. Commands go to the field device over MQTT, and the device sends back confirmation and status. Repeated ON/ON or OFF/OFF commands are rejected. |
| **Analytics** | Weekly summary: water used, change from last week, pump runs, average moisture and temperature, days irrigated or skipped, and a plain-language insight. |
| **Saathi chatbot** | A Gemini-powered assistant that knows the farm's current state (sensor data, crop, recommendation, pump status). It answers in Hindi, can read replies aloud (`expo-speech`), and offers quick-reply suggestions. |
| **Farmer-first UI** | Hindi-flavoured navigation (*Ghar, Sinchai, Khet, Jaankari, Saathi*), light/dark themes, and alerts, history, fields and profile screens. |
| **Farm simulator** | Sends realistic fake sensor data and responds to pump commands, so the whole system can be demoed without hardware. |

---

## 🏗️ Architecture

```
┌──────────────────────┐        HTTPS / JSON (JWT)        ┌───────────────────────────┐
│  JalMitra App        │ ───────────────────────────────▶ │  FastAPI Backend          │
│  (React Native/Expo) │ ◀─────────────────────────────── │  /auth /sensors /pump     │
└──────────────────────┘                                  │  /analytics /chat         │
                                                          └──────┬─────────┬──────────┘
                                                                 │         │
                                          SQLAlchemy (async)     │         │  Gemini API
                                                                 ▼         ▼
                                                   ┌──────────────┐   ┌──────────────┐
                                                   │ PostgreSQL   │   │ Google       │
                                                   │ (local or    │   │ Gemini       │
                                                   │  Supabase)   │   └──────────────┘
                                                   └──────────────┘
                                                                 ▲
             POST /sensors/data                                  │
┌──────────────────────────┐ ────────────────────────────────────┘
│ Field device (ESP32) or  │
│ simulator/farm_simulator │ ◀──── MQTT: jalmitra/{farm_id}/pump/command
└──────────────────────────┘ ────▶ MQTT: jalmitra/{farm_id}/pump/{confirmation,status}
```

### MQTT topics

| Topic | Direction | Purpose |
|---|---|---|
| `jalmitra/{farm_id}/pump/command` | Backend → device | ON/OFF command with duration |
| `jalmitra/{farm_id}/pump/confirmation` | Device → backend | Device confirms it carried out the command |
| `jalmitra/{farm_id}/pump/status` | Device → backend | Regular pump status updates |
| `jalmitra/{farm_id}/sensors/data` | Device → backend | Sensor topic (reserved; sensor data currently goes over HTTP) |

---

## 🧰 Tech Stack

**Mobile app** (`jalmitra-app/`)
- React Native 0.81 · React 19 · Expo SDK 54
- React Navigation (bottom tabs + stack)
- Axios with JWT interceptors · AsyncStorage
- `expo-speech` / `expo-av` for voice, `react-native-svg` for charts

**Backend** (`jalmitra-backend/`)
- Python 3.11 · FastAPI · Uvicorn
- SQLAlchemy 2 (async) + asyncpg → PostgreSQL (Supabase supported, with SSL)
- paho-mqtt (MQTT v5, TLS on port 8883)
- python-jose (JWT) · pydantic-settings
- google-generativeai (default model `gemini-2.5-flash`)
- pytest + pytest-asyncio + httpx for tests
- Docker image for deployment

---

## 📁 Project Structure

```
JalMitra/
├── JalMitra_Minor_Project_Report.md   # Full academic project report
├── jalmitra-app/                      # React Native (Expo) mobile app
│   ├── App.js                         # Entry: navigation, auth gate, theme
│   └── src/
│       ├── screens/                   # Home, Pump, Fields, Analytics, Chat, Alerts,
│       │                              # History, Profile, Settings, Login, Splash
│       ├── components/                # SensorCard, PumpButton, RecommendationBanner, ...
│       ├── context/                   # AuthContext, ThemeContext
│       ├── services/api.js            # Axios client + API wrappers
│       ├── hooks/                     # useFarm
│       └── constants/                 # colors, strings, theme tokens
└── jalmitra-backend/                  # FastAPI backend
    ├── main.py                        # App, CORS, routers, lifespan (DB + MQTT)
    ├── config.py                      # Settings loaded from .env
    ├── api/                           # auth, sensors, pump, analytics, chatbot routers
    │                                  # + deps.py (JWT farm-ownership & device-key checks)
    ├── db/                            # connection, models, crud, seed
    ├── ml/recommendation.py           # Crop-aware irrigation recommendation engine
    ├── mqtt/                          # MQTT client, topics, message handlers
    ├── services/                      # OTP, JWT, Gemini chatbot, notifications
    ├── simulator/farm_simulator.py    # Simulated field device
    ├── tests/                         # pytest suite + simple load test
    └── Dockerfile
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11
- **PostgreSQL** 14+ (local) or a **Supabase** project
- An **MQTT broker**, e.g. [Mosquitto](https://mosquitto.org/) locally or HiveMQ Cloud (optional: everything except pump commands works without one)
- A **Google Gemini API key** for the Saathi chatbot
- The **Expo Go** app on your phone, or an Android/iOS emulator

### 1. Backend

```bash
cd jalmitra-backend

python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env         # then fill in the values
```

Settings in `jalmitra-backend/.env` (see [.env.example](jalmitra-backend/.env.example)):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | e.g. `postgresql+asyncpg://postgres:password@localhost:5432/jalmitra` |
| `JWT_SECRET` | ✅ | Long random string |
| `GEMINI_API_KEY` | ✅ | For the Saathi chatbot |
| `DEBUG` | | Default `true`. Set `false` in production to hide `debug_otp` |
| `MQTT_BROKER` / `MQTT_PORT` | | Default `localhost:1883`. Port `8883` turns on TLS |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | | Empty by default (no broker auth) |
| `DEVICE_API_KEY` | | If set, `POST /sensors/data` requires a matching `X-Device-Key` header |
| `GEMINI_MODEL` | | Default `gemini-2.5-flash` |
| `JWT_EXPIRE_MINUTES` | | Default `10080` (7 days) |

> For Supabase, use its connection string with the `postgresql+asyncpg://` scheme. SSL is turned on automatically for `supabase.co` hosts or when `ssl=require` is in the URL.

Seed a demo farmer and farm (`farm001`), then start the server:

```bash
python -m db.seed
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

Database tables are created automatically when the server starts.

### 2. Farm simulator (no hardware needed)

In a second terminal, with the virtualenv active:

```bash
cd jalmitra-backend
python simulator/farm_simulator.py
```

It posts a sensor reading for `farm001` every ~7 seconds to `http://localhost:8000/sensors/data` (override with the `BACKEND_URL` env var) and listens on MQTT for pump commands. If `DEVICE_API_KEY` is set, the simulator sends it automatically.

### 3. Mobile app

```bash
cd jalmitra-app
npm install
```

Set the backend address in `jalmitra-app/.env`:

```bash
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8000
```

Use your computer's LAN IP (`ipconfig` on Windows, `ifconfig` on macOS/Linux) when testing on a real phone. Use `http://10.0.2.2:8000` for the Android emulator or `http://localhost:8000` for the iOS simulator and web. If it isn't set, the app uses `http://localhost:8000`.

```bash
npx expo start          # then scan the QR code with Expo Go
npm run android         # or: npm run ios / npm run web
```

**Logging in during development:** enter any valid 10-digit Indian mobile number (starting with 6–9). With `DEBUG=true` the OTP is printed in the backend terminal and also returned as `debug_otp` in the `/auth/send-otp` response. The seed script creates a demo farmer, *Ramu Kumar* (`9876543210`), who owns `farm001`, the farm the simulator feeds. **Log in as this farmer to see live simulator data.** Other new farmers get their own empty farm. A farmer can only see and control farms they own.

### 4. Docker (backend)

```bash
cd jalmitra-backend
docker build -t jalmitra-backend .
docker run --env-file .env -p 8080:8080 jalmitra-backend
```

The container serves the API on port **8080**.

---

## 📡 API Reference

All responses are JSON with a `success` flag. User-facing messages are in Hinglish.

🔒 means the route needs `Authorization: Bearer <token>`. For routes that take a `farm_id`, the farm must belong to the logged-in farmer; otherwise the API returns `404 FARM_NOT_FOUND`.

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/send-otp` | `{ phone }` → sends an OTP (valid for 5 minutes) |
| POST | `/auth/verify-otp` | `{ phone, otp, name?, language? }` → JWT, farmer and farms |
| GET | `/auth/profile` | 🔒 Farmer profile and farms |
| PUT | `/auth/profile` | 🔒 Update `name` / `language` |

### Sensors — `/sensors`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sensors/data` | `{ farm_id, soil_moisture, temperature, humidity }`, called by the device or simulator. Needs an `X-Device-Key` header when `DEVICE_API_KEY` is set |
| GET | `/sensors/latest?farm_id=` 🔒 | Latest reading and online status |
| GET | `/sensors/history?farm_id=&from_date=&to_date=` 🔒 | Past readings (ISO dates) |

### Pump — `/pump`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/pump/status?farm_id=` 🔒 | Current state (live MQTT state first, then DB) and today's runtime |
| POST | `/pump/control` 🔒 | `{ farm_id, action: "ON"\|"OFF", duration_minutes: 1–180, triggered_by }` |
| GET | `/pump/history?farm_id=&limit=` 🔒 | Pump action log |

### Analytics — `/analytics`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/recommendation?farm_id=` 🔒 | Irrigation recommendation with confidence, reason and alert |
| GET | `/analytics/weekly?farm_id=` 🔒 | 7-day water and moisture summary with insight |

### Chat — `/chat`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/message` 🔒 | `{ farm_id, message (≤500 chars), language }` → Saathi's reply (the user comes from the token) |
| GET | `/chat/history?limit=` 🔒 | The logged-in farmer's chat history |
| DELETE | `/chat/history` 🔒 | Clear the logged-in farmer's chat history |
| GET | `/chat/suggestions?farm_id=` 🔒 | Quick-reply question suggestions |

---

## 🌾 How the Recommendation Engine Works

[ml/recommendation.py](jalmitra-backend/ml/recommendation.py) is a deliberately **rule-based** engine. It needs no training data, its decisions can be explained to farmers, and it can later be replaced by an ML model. Each crop profile sets a minimum moisture, an ideal moisture band, a maximum moisture, and heat/cold stress temperatures:

| Crop | Ideal moisture | Heat stress above |
|---|---|---|
| Wheat (गेहूँ) | 40–60 % | 35 °C |
| Rice (धान) | 60–80 % | 38 °C |
| Cotton (कपास) | 35–65 % | 40 °C |
| Sugarcane (गन्ना) | 55–75 % | 38 °C |
| Maize (मक्का) | 40–65 % | 37 °C |

Using the latest reading, whether the pump already ran today, and the hours since the last irrigation, the engine returns:

- **decision**: `irrigate`, `skip` or `monitor`
- **confidence** from 0 to 1 (higher the further moisture is from the ideal band)
- **reason** in Hindi for the farmer, plus an English version that is stored in the DB
- **alert** for heat/cold stress or overwatering
- **next_check_hours**

Unknown crops use the wheat profile.

---

## 🗄️ Data Model

| Table | Key fields |
|---|---|
| `users` | id (UUID), name, phone (unique), language |
| `farms` | id, user_id, name, crop_type, location, area_acres |
| `sensor_readings` | farm_id, soil_moisture, temperature, humidity, timestamp |
| `pump_logs` | farm_id, action, triggered_by, duration_minutes, water_used_liters |
| `chat_history` | user_id, role, message, input_type (text/voice), language |
| `recommendations` | farm_id, recommendation, reason, confidence, acted_upon |

---

## 🧪 Testing

```bash
cd jalmitra-backend
pytest -c tests/pytest.ini
```

The suite runs against an in-memory SQLite database (via `aiosqlite`) and covers auth, access control, sensors, pump control, the recommendation engine and the chatbot. The chatbot tests call the real Gemini API, so they need a valid `GEMINI_API_KEY`.

`tests/test_load.py` is a simple concurrency script that simulates many farmers calling a **running** server at `http://localhost:8000`:

```bash
python tests/test_load.py
```

---

## 🔐 Before Going to Production

The current code is set up for development and demos. Before deploying:

- Set `DEBUG=false`. This hides `debug_otp` and stops OTPs being printed.
- Set `DEVICE_API_KEY` so only your devices can post sensor data.
- Connect a real SMS provider (a Fast2SMS stub is in `services/otp_service.py`).
- OTPs and live pump state are kept **in memory**. Move them to Redis or the DB if you run more than one worker.
- Restrict CORS `allow_origins` in `main.py`.
- Use a strong `JWT_SECRET` and keep every secret in `.env` or your host's secret store, never in source code.

---

## 🗺️ Roadmap

- ESP32 firmware for real sensors and relay-controlled pumps
- Weather-forecast-aware recommendations (skip irrigation before rain)
- ML model trained on collected sensor and irrigation data
- Push notifications for alerts and when the pump turns off automatically
- Support for multiple farms per farmer and more regional languages

---

## 📄 License

No license has been specified yet. Add a `LICENSE` file before distributing.
