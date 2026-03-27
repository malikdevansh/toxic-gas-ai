# Toxic Gas Intelligence - Full Stack System

You have successfully upgraded your application into a production-level decoupled architecture with React, Next.js/Vite, TaildwindCSS, and FastApi with WebSockets.

## Requirements
- Python 3.10+
- Node.js & npm

## 1. Running the FastAPI Backend
The API serves the ML forecast output and real-time ECG WebSocket streams.
Navigate to the root directory `Toxic gas ai` and run:

```powershell
python -m venv backend/venv
.\backend\venv\Scripts\activate
pip install -r backend\requirements.txt
```
To launch the server on port `8000`:
```powershell
uvicorn backend.main:app --port 8000 --reload
```

## 2. Running the React Frontend
The frontend features glassmorphism, Recharts, and Mapbox integrations.
Open a new terminal, navigate to the `Toxic gas ai/frontend` directory, and run:

```powershell
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

## Architectural Notes
- The LSTM models and Data CSV processing logic should be safely isolated inside `backend/` and loaded dynamically via `joblib.load` as per standard machine learning enterprise deployment.
- Air Quality indices form OpenWeather are fully capable of passing lat/lon directly over the `api/pollution` endpoint.
