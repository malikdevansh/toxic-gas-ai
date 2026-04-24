<div align="center">

<br/>

# ☣️ Toxic Gas AI

**Production-grade AI + IoT gas monitoring system**  
Real-time sensor ingestion · Single-load ML inference · WebSocket-driven live dashboards

<br/>

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-Simulator-E7352C?style=flat-square&logo=espressif&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

**Toxic Gas AI** is a full-stack monitoring platform that ingests live sensor readings from ESP32-style IoT devices, runs machine learning inference on every payload, and streams hazard assessments to a Next.js dashboard in real time via WebSocket.

The system is designed for production deployments: the model loads once at startup, inference is synchronous and low-latency, and all live data flows through a single authoritative WebSocket channel. An optional OpenWeatherMap integration augments IoT readings with ambient air-quality context, and a Telegram alert bridge can notify operators on anomaly detection.

---

## Architecture

```
toxic-gas-ai/
├── backend/
│   ├── core/          # App config, WebSocket manager, global state
│   ├── models/        # Production model artifact (best_model.pkl)
│   ├── routers/       # REST and WebSocket route handlers
│   ├── schemas/       # Pydantic request/response models
│   ├── utils/         # Response shaping and live-data helpers
│   └── main.py        # FastAPI application entrypoint
├── frontend/          # Next.js real-time dashboard
├── simulator/         # ESP32-style sensor data emulator
├── legacy/            # Archived Streamlit prototype (reference only)
├── docs/              # Project documentation
├── .env.example
├── docker-compose.yml
└── requirements.txt
```

### Data Flow

```
ESP32 Simulator
      │
      │  POST /iot/predict  (sensor readings)
      ▼
 FastAPI Backend  ──►  ML Model (best_model.pkl)
      │                    (loaded once at startup)
      │
      ├──►  WS /ws/iot  ──►  Next.js Dashboard
      │
      └──►  Telegram Alert  (on anomaly)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Uvicorn |
| ML Inference | Scikit-learn (`.pkl` artifact) |
| Real-time Transport | WebSocket (native FastAPI) |
| Frontend Dashboard | Next.js 14 |
| IoT Simulation | Python ESP32 emulator |
| Air Quality Data | OpenWeatherMap API |
| Alerting | Telegram Bot API |
| Containerization | Docker + Docker Compose |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) Docker

---

### 1 — Backend

```powershell
# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI server will be available at `http://127.0.0.1:8000`.  
Interactive API docs: `http://127.0.0.1:8000/docs`.

---

### 2 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to access the live dashboard.

---

### 3 — Simulator

```powershell
.venv\Scripts\python.exe simulator\esp32_iot.py
```

The simulator sends periodic sensor payloads to the backend, transitioning the dashboard from `WAITING` to live updates.

---

### Environment Variables

Copy `.env.example` to `.env` and populate the required values:

```env
# Air quality enrichment (optional)
OPENWEATHER_API_KEY=

# Telegram alert bridge (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Service URLs
API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

### Docker (Full Stack)

```powershell
docker-compose up --build
```

---

## API Reference

### Core

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/iot/predict` | Ingest sensor readings and run ML inference |
| `GET` | `/iot/latest` | Fetch the most recent live sensor payload |

### WebSocket Streams

| Protocol | Endpoint | Description |
|---|---|---|
| `WS` | `/ws/iot` | Primary live stream for the dashboard |
| `WS` | `/realtime` | Compatibility alias for the live stream |

### Analytics & Enrichment

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/pollution/live` | Air-quality lookup with IoT fallback |
| `GET` | `/api/forecast` | Forecast derived from recent IoT readings |
| `GET` | `/api/history` | Historical trend from buffered IoT data |
| `GET` | `/api/rankings` | Current deployment ranking view |
| `GET` | `/api/models` | Model metadata for the dashboard |

---

## Demo Flow

1. Start the **backend** (`uvicorn backend.main:app --reload`)
2. Start the **frontend** (`npm run dev` inside `/frontend`)
3. Start the **simulator** (`simulator\esp32_iot.py`)
4. Watch the dashboard transition from `WAITING` → live hazard readings
5. Trigger edge cases via the FastAPI interactive docs at `/docs`

---

## Design Decisions

**Single model load at startup.** `best_model.pkl` is loaded once when the FastAPI application initializes. This eliminates per-request I/O overhead and keeps inference latency predictable under sustained sensor throughput.

**WebSocket-first for the dashboard.** All live data flows through `/ws/iot`. The REST endpoints (`/iot/latest`, `/api/pollution/live`) are provided for polling clients and integrations that cannot maintain a persistent connection.

**Legacy code preserved, not deleted.** The original Streamlit prototype lives under `legacy/` for reference. It is entirely excluded from the production runtime path and from Docker builds.

---

## Project Structure Notes

- Training experiments and stale model artifacts were intentionally removed from the production tree to keep the repository focused and auditable.
- The `legacy/` directory is reference-only; no production code depends on it.
- All configuration is externalized via environment variables — no secrets are committed to the repository.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: describe your change'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with FastAPI · Next.js · Scikit-learn · ☣️

</div>
