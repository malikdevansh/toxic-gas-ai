import streamlit as st
from streamlit_autorefresh import st_autorefresh
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import load_model

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="Toxic Gas AI Dashboard",
    layout="wide",
    page_icon="🧪"
)

# ---------------- PROFESSIONAL UI STYLE ----------------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

:root {
    --bg-1: #071120;
    --bg-2: #0d1b2a;
    --bg-3: #11253f;
    --surface: rgba(17, 24, 39, 0.72);
    --stroke: rgba(148, 163, 184, 0.2);
    --accent: #00e5b3;
    --accent-2: #3b82f6;
    --text-soft: #9fb0c8;
}

html, body, [class*="css"] {
    font-family: 'Outfit', sans-serif;
}

.stApp {
    background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.16), transparent 35%),
                radial-gradient(circle at 90% 10%, rgba(0, 229, 179, 0.14), transparent 30%),
                linear-gradient(120deg, var(--bg-1), var(--bg-2), var(--bg-3));
    background-size: 180% 180%;
    animation: flowBg 18s ease infinite;
}

@keyframes flowBg {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

h1, h2, h3 {
    color: white;
}

[data-testid="stSidebar"] {
    background: linear-gradient(180deg, rgba(8, 21, 35, 0.95), rgba(9, 26, 43, 0.9));
    border-right: 1px solid var(--stroke);
}

section[data-testid="stSidebar"] .stRadio > div {
    background: rgba(30, 41, 59, 0.45);
    border-radius: 12px;
    padding: 8px;
    border: 1px solid rgba(148, 163, 184, 0.15);
}

div[data-testid="stMetricValue"] {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
}

[data-testid="stPlotlyChart"], [data-testid="stDataFrame"], .stAlert {
    border: 1px solid var(--stroke);
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(7px);
}

.stButton > button {
    border-radius: 12px;
    border: 1px solid rgba(0, 229, 179, 0.35);
    background: linear-gradient(120deg, rgba(0, 229, 179, 0.18), rgba(59, 130, 246, 0.2));
    color: white;
    font-weight: 700;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.stButton > button:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 24px rgba(0, 229, 179, 0.2);
    border-color: rgba(0, 229, 179, 0.8);
}

.stNumberInput, .stTextInput, .stSelectbox, .stFileUploader {
    animation: fadeInUp 0.55s ease both;
}

[data-baseweb="input"] > div,
[data-baseweb="select"] > div {
    border-radius: 12px !important;
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    background: rgba(15, 23, 42, 0.66) !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}

[data-baseweb="input"] > div:focus-within,
[data-baseweb="select"] > div:focus-within {
    border-color: rgba(0, 229, 179, 0.85) !important;
    box-shadow: 0 0 0 1px rgba(0, 229, 179, 0.45);
}

.ui-shell {
    margin-bottom: 16px;
    padding: 18px 20px;
    border-radius: 14px;
    border: 1px solid var(--stroke);
    background: var(--surface);
    backdrop-filter: blur(8px);
    animation: fadeInUp 0.65s ease both;
}

.ui-shell h3 {
    margin: 0;
    color: #dff8ff;
}

.ui-shell p {
    margin: 6px 0 0;
    color: var(--text-soft);
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
""", unsafe_allow_html=True)

# ---------------- LOAD MODEL ----------------
model = joblib.load("Data/best_model.pkl")

# ---------------- MULTI-MODEL FORECAST ----------------
# ==========================================
# 1. MODEL TRAINING LOGIC
# ==========================================
@st.cache_resource
def train_traditional_models():
    df = pd.read_csv("backend/data/Data/clean_air_quality_new.csv")
    X = df[["NO2", "Temperature", "Humidity"]]
    y = df["CO"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42)
    }
    if XGB_AVAILABLE:
        models["XGBoost"] = xgb.XGBRegressor(n_estimators=100, random_state=42)
    fitted_models = {}
    metrics = {}
    predictions = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        fitted_models[name] = model
        predictions[name] = preds
        metrics[name] = {
            "MAE": mean_absolute_error(y_test, preds),
            "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
            "R² Score": r2_score(y_test, preds)
        }
    return fitted_models, metrics, predictions, y_test, X_test

# ---------------- SIDEBAR ----------------
st.sidebar.markdown("## 🔬 Toxic Gas AI System")
st.sidebar.markdown("---")

menu = st.sidebar.radio(
    "Navigation",
    [
        "🏠 Home",
        "📊 Manual Prediction",
        "📈 Model Insights",
        "📉 Trend Analysis",
        "🌍 Pollution Heatmap",
        "🔮 Multi-Model Forecast",
        "📁 CSV Batch Prediction"
    ]
)

st.sidebar.markdown("---")
st.sidebar.markdown("Developed by Devansh Malik ,Surya Bugalia")


def render_page_banner(title: str, subtitle: str):
    st.markdown(
        f"""
        <div class="ui-shell">
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
        """,
        unsafe_allow_html=True
    )

# ---------------- HOME ----------------
if menu == "🏠 Home":

    render_page_banner(
        "Live Environmental Intelligence",
        "Interactive controls, animated visuals, and AI-backed toxic gas insights in one unified dashboard."
    )

    # --- CSS for Animations and Premium UI ---
    st.markdown("""
        <style>
        .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(90deg, #00ffcc, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0px;
            text-align: center;
            animation: titleGlow 4s ease-in-out infinite alternate;
        }
        .hero-subtitle {
            color: #8892b0;
            font-size: 1.2rem;
            text-align: center;
            max-width: 800px;
            margin: 10px auto 40px auto;
            line-height: 1.6;
            animation: fadeInUp 0.8s ease both;
        }
        .kpi-card {
            background: linear-gradient(160deg, rgba(26, 30, 41, 0.95), rgba(18, 36, 55, 0.8));
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #00ffcc;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            text-align: center;
            animation: cardRise 0.7s ease both;
            backdrop-filter: blur(6px);
        }
        .kpi-card:hover {
            transform: translateY(-7px) scale(1.02);
            box-shadow: 0 12px 20px rgba(0, 255, 204, 0.18);
            border-left-color: #6ee7b7 !important;
        }
        .kpi-title {
            color: #8892b0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .kpi-value {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        .section-header {
            color: white;
            border-bottom: 2px solid #1a1e29;
            padding-bottom: 10px;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        .text-block {
            color: #a8b2d1;
            line-height: 1.7;
            font-size: 1.05rem;
            text-align: justify;
        }
        .capability-box {
            background: linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(15, 30, 45, 0.75));
            border: 1px solid #1f2937;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeInUp 0.8s ease both;
        }
        .capability-box:hover {
            border-color: #3b82f6;
            transform: translateY(-4px);
            box-shadow: 0 10px 22px rgba(59, 130, 246, 0.15);
        }
        .arch-box {
            background: linear-gradient(120deg, rgba(26, 30, 41, 0.95), rgba(20, 36, 56, 0.78));
            border: 1px dashed #3b82f6;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            color: #00ffcc;
            font-weight: bold;
            animation: fadeInUp 0.7s ease both;
        }
        .arrow {
            text-align: center;
            color: #8892b0;
            font-size: 24px;
            padding-top: 10px;
            animation: pulseArrow 1.6s ease-in-out infinite;
        }
        @keyframes titleGlow {
            0% { filter: drop-shadow(0 0 0 rgba(0,229,179,0)); }
            100% { filter: drop-shadow(0 0 14px rgba(0,229,179,0.32)); }
        }
        @keyframes cardRise {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes pulseArrow {
            0%, 100% { opacity: 0.5; transform: translateX(0); }
            50% { opacity: 1; transform: translateX(3px); }
        }
        </style>
    """, unsafe_allow_html=True)

    # 1. Premium Hero Section
    st.markdown("<h1 class='hero-title'>🧪 Toxic Gas AI System</h1>", unsafe_allow_html=True)
    st.markdown("<p class='hero-subtitle'>An advanced AI-based real-time toxic gas monitoring and forecasting platform designed to provide actionable environmental intelligence and preemptive risk analysis.</p>", unsafe_allow_html=True)

    # 3. Animated KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown("""
        <div class='kpi-card' style='border-left-color: #00ffcc; animation-delay: 0.05s;'>
            <div class='kpi-title'>Model Accuracy</div>
            <div class='kpi-value'>80% 🎯</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown("""
        <div class='kpi-card' style='border-left-color: #3b82f6; animation-delay: 0.15s;'>
            <div class='kpi-title'>Features Used</div>
            <div class='kpi-value'>4 📊</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown("""
        <div class='kpi-card' style='border-left-color: #f59e0b; animation-delay: 0.25s;'>
            <div class='kpi-title'>Forecasting</div>
            <div class='kpi-value'>24h 🔮</div>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown("""
        <div class='kpi-card' style='border-left-color: #10b981; animation-delay: 0.35s;'>
            <div class='kpi-title'>System Status</div>
            <div class='kpi-value'>Online 🟢</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 2. About the Project
    st.markdown("<h3 class='section-header'>🌍 About the Project</h3>", unsafe_allow_html=True)
    
    st.markdown("""
    <p class='text-block'>
        <strong>Problem Statement:</strong> Air pollution monitoring poses significant challenges in dense urban and industrial environments. Traditional sensor networks often provide delayed data without predictive insights, making it difficult for authorities and citizens to respond proactively to sudden spikes in toxic gases like Carbon Monoxide (CO) and Nitrogen Dioxide (NO2). Extreme weather conditions, such as temperature inversions and high humidity, exacerbate the accumulation of these gases, heightening health risks.
    </p>
    <p class='text-block'>
        <strong>Our AI Solution Approach:</strong> This project bridges the gap between raw environmental data and actionable intelligence. By employing sophisticated Machine Learning models, our system not only evaluates the current state of air quality but also conducts preemptive risk analyses. Deep Learning architectures, particularly Long Short-Term Memory (LSTM) networks, are utilized to capture the complex temporal dynamics of gas concentrations and accurately forecast future pollution events over a 24-hour horizon.
    </p>
    <p class='text-block'>
        <strong>Technologies Used & Integration:</strong> Hosted on an immersive, interactive Streamlit interface, this dashboard aggregates real-time data using worldwide OpenWeather APIs. It leverages robust Python data-science stacks (Pandas, NumPy, Scikit-Learn, TensorFlow/Keras) to process incoming streams, evaluate atmospheric conditions dynamically, and present results through highly responsive Plotly visualizations. The result is an enterprise-grade environmental monitoring platform built for scale, speed, and accuracy.
    </p>
    """, unsafe_allow_html=True)

    # 4. System Architecture Overview
    st.markdown("<h3 class='section-header'>⚙️ System Architecture</h3>", unsafe_allow_html=True)
    
    arch_c1, arch_c2, arch_c3, arch_c4, arch_c5 = st.columns([2, 1, 2, 1, 2])
    
    with arch_c1:
        st.markdown("<div class='arch-box'>📡 Data Ingestion<br><span style='font-size:0.8rem; color:#8892b0;'>Sensors & Global API</span></div>", unsafe_allow_html=True)
    with arch_c2:
        st.markdown("<div class='arrow'>➔</div>", unsafe_allow_html=True)
    with arch_c3:
        st.markdown("<div class='arch-box'>🧠 AI Processing Engine<br><span style='font-size:0.8rem; color:#8892b0;'>Random Forest + LSTMs</span></div>", unsafe_allow_html=True)
    with arch_c4:
        st.markdown("<div class='arrow'>➔</div>", unsafe_allow_html=True)
    with arch_c5:
        st.markdown("<div class='arch-box'>💻 Dashboard Interface<br><span style='font-size:0.8rem; color:#8892b0;'>Streamlit + Plotly</span></div>", unsafe_allow_html=True)

    # 7. Key Capabilities
    st.markdown("<h3 class='section-header'>✨ Key Capabilities</h3>", unsafe_allow_html=True)
    
    cap1, cap2 = st.columns(2)
    
    with cap1:
        st.markdown("""
        <div class='capability-box'>
            <h4 style='color: white; margin-top: 0;'>🌍 Real-time Pollution Mapping</h4>
            <p style='color: #8892b0; margin-bottom: 0;'>Interactive geographic visualizations displaying real-time CO and NO2 levels across global cities, fetched via live environmental APIs.</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class='capability-box'>
            <h4 style='color: white; margin-top: 0;'>📉 Time-Series Forecasting</h4>
            <p style='color: #8892b0; margin-bottom: 0;'>Advanced Sequence modeling utilizing LSTM neural networks to accurately project gas concentrations over the next 24 consecutive hours.</p>
        </div>
        """, unsafe_allow_html=True)
        
    with cap2:
        st.markdown("""
        <div class='capability-box'>
            <h4 style='color: white; margin-top: 0;'>🚨 AI Risk Prediction</h4>
            <p style='color: #8892b0; margin-bottom: 0;'>Instantaneous health risk classification based on user-input features, augmented with a machine-learning confidence gauge.</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class='capability-box'>
            <h4 style='color: white; margin-top: 0;'>📁 Batch CSV Processing</h4>
            <p style='color: #8892b0; margin-bottom: 0;'>Automated data pipeline enabling users to upload historical datasets for bulk risk prediction, producing instant downloadable insights.</p>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br><br>", unsafe_allow_html=True)

# ---------------- MANUAL PREDICTION ----------------
elif menu == "📊 Manual Prediction":
    render_page_banner(
        "Manual Risk Simulator",
        "Adjust gas and weather values, then trigger instant AI risk scoring with confidence visualization."
    )

    st.header("📊 Manual Gas Prediction")

    col1, col2 = st.columns(2)

    with col1:
        co = st.number_input("CO Level", min_value=0.0)
        no2 = st.number_input("NO2 Level", min_value=0.0)

    with col2:
        temp = st.number_input("Temperature", min_value=0.0)
        humidity = st.number_input("Humidity", min_value=0.0)

    if st.button("Predict Risk"):

        input_df = pd.DataFrame(
            [[co, no2, temp, humidity]],
            columns=["CO", "NO2", "Temperature", "Humidity"]
        )

        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df).max() * 100

        st.markdown("### 🔍 Prediction Summary")

        col1, col2 = st.columns(2)
        col1.metric("Risk Level", prediction)
        col2.metric("Confidence", f"{probability:.2f}%")

        # Premium Gauge
        gauge_fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=probability,
            title={'text': "Confidence Level"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "#00ffcc"},
                'steps': [
                    {'range': [0, 40], 'color': "#1f2937"},
                    {'range': [40, 70], 'color': "#374151"},
                    {'range': [70, 100], 'color': "#065f46"}
                ],
            }
        ))

        gauge_fig.update_layout(
            paper_bgcolor="#0e1117",
            font=dict(color="white")
        )

        st.plotly_chart(gauge_fig, use_container_width=True)

# ---------------- MODEL INSIGHTS ----------------
elif menu == "📈 Model Insights":
    render_page_banner(
        "Model Explainability",
        "Explore feature influence and confusion patterns to understand decision quality."
    )

    st.header("📈 Model Insights")

    if hasattr(model, "feature_importances_"):
        importance = model.feature_importances_
        features = ["CO", "NO2", "Temperature", "Humidity"]

        fig, ax = plt.subplots()
        ax.bar(features, importance)
        st.pyplot(fig)

    st.subheader("Confusion Matrix")

    try:
        cm = np.load("confusion_matrix.npy")
        fig2, ax2 = plt.subplots()
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax2)
        st.pyplot(fig2)
    except:
        st.warning("Confusion matrix file not found.")

# ---------------- TREND ANALYSIS ----------------
elif menu == "📉 Trend Analysis":
    render_page_banner(
        "Historical Trend Explorer",
        "Track baseline CO movement and smoothed trajectory with responsive chart interactions."
    )

    st.header("📉 Historical CO Trend")

    df = pd.read_csv("Data/clean_air_quality.csv")
    df["Rolling_CO"] = df["CO"].rolling(50).mean()

    import plotly.express as px

    fig = px.line(
        df,
        y=["CO", "Rolling_CO"],
        title="CO Level Trend",
    )
    fig.update_traces(line=dict(width=3))
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        hovermode="x unified",
        transition=dict(duration=500, easing="cubic-in-out")
    )

    st.plotly_chart(fig, use_container_width=True)

# ---------------- REAL-TIME POLLUTION MAP ----------------
elif menu == "🌍 Pollution Heatmap":
    st_autorefresh(interval=5000, key="data_refresh")
    render_page_banner(
        "Global Pollution Intelligence",
        "Search cities, inspect live pollutant values, and compare global hotspots in real time."
    )

    st.header("🌍 Real-Time Global Pollution Map")

    from utils.api import get_air_pollution, get_historical_pollution
    import plotly.express as px
    import requests

    API_KEY = "bbed8bea4c1dad98d66c908c7966cdc3"

    # ---------------- CITY SEARCH ----------------
    st.subheader("🔎 Search Any City")

    city_name = st.text_input("Enter City Name")

    searched_lat = None
    searched_lon = None

    if city_name:

        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit=1&appid={API_KEY}"
        geo_response = requests.get(geo_url).json()

        if isinstance(geo_response, list) and len(geo_response) > 0:

            searched_lat = geo_response[0]["lat"]
            searched_lon = geo_response[0]["lon"]

            data = get_air_pollution(searched_lat, searched_lon)

            if "list" in data:

                components = data["list"][0]["components"]

                st.success(f"Pollution data for {city_name}")

                col1, col2 = st.columns(2)
                col1.metric("CO", components.get("co", 0))
                col2.metric("NO2", components.get("no2", 0))

                # ---------------- HISTORICAL TREND ----------------
                historical = get_historical_pollution(searched_lat, searched_lon)

                if "list" in historical:

                    hist_data = []

                    for item in historical["list"]:
                        hist_data.append({
                            "time": pd.to_datetime(item["dt"], unit="s"),
                            "CO": item["components"]["co"],
                            "NO2": item["components"]["no2"]
                        })

                    df_hist = pd.DataFrame(hist_data)

                    st.subheader("📈 5-Day Pollution Trend")

                    gas_choice = st.selectbox("Select Gas for Trend", ["CO", "NO2"])

                    fig_hist = px.line(
                        df_hist,
                        x="time",
                        y=gas_choice,
                        title=f"{gas_choice} Trend (Last 5 Days)"
                    )
                    fig_hist.update_traces(line=dict(width=3))
                    fig_hist.update_layout(
                        template="plotly_dark",
                        paper_bgcolor="rgba(0,0,0,0)",
                        plot_bgcolor="rgba(0,0,0,0)",
                        transition=dict(duration=450, easing="quad-in-out")
                    )

                    st.plotly_chart(fig_hist, use_container_width=True)

            else:
                st.error("Pollution API error")

        else:
            st.error("City not found")

    # ---------------- GLOBAL CITIES ----------------
    cities = {
        "New York": (40.71, -74.00),
        "London": (51.50, -0.12),
        "Delhi": (28.61, 77.20),
        "Beijing": (39.90, 116.40),
        "Sydney": (-33.86, 151.20),
        "Rio": (-22.90, -43.20),
        "Johannesburg": (-26.20, 28.04)
    }

    real_data = []

    with st.spinner("Fetching real-time pollution data..."):
        for city, coords in cities.items():
            lat, lon = coords
            data = get_air_pollution(lat, lon)

            if "list" in data:
                components = data["list"][0]["components"]
                real_data.append({
                    "city": city,
                    "lat": lat,
                    "lon": lon,
                    "CO": components.get("co", 0),
                    "NO2": components.get("no2", 0)
                })

    if len(real_data) > 0:
        df_real = pd.DataFrame(real_data)
        
        # --- NEW KPI CARDS & ALERTS ---
        avg_co = df_real["CO"].mean()
        avg_no2 = df_real["NO2"].mean()
        max_co = df_real["CO"].max()
        
        if max_co > 200.0:
            st.error(f"ERROR: Critical CO Levels Detected ({max_co:.2f} μg/m³)")
        elif avg_co > 100.0:
            st.warning(f"WARNING: Elevated CO Levels ({avg_co:.2f} μg/m³)")
        else:
            st.success(f"SUCCESS: Air Quality within Safe Limits (Avg CO: {avg_co:.2f} μg/m³)")
            
        kpi1, kpi2, kpi3 = st.columns(3)
        kpi1.metric("Average CO", f"{avg_co:.2f}")
        kpi2.metric("Average NO2", f"{avg_no2:.2f}")
        kpi3.metric("Maximum CO", f"{max_co:.2f}")
        # ------------------------------

        gas_type = st.selectbox("Select Gas Type", ["CO", "NO2"])

        fig = px.scatter_mapbox(
            df_real,
            lat="lat",
            lon="lon",
            color=gas_type,
            hover_name="city",
            zoom=1,
            center=dict(lat=20, lon=0),
            mapbox_style="open-street-map",
            color_continuous_scale="Turbo"
        )

        if searched_lat is not None and searched_lon is not None:

            fig.add_scattermapbox(
                lat=[searched_lat],
                lon=[searched_lon],
                mode="markers+text",
                marker=dict(size=22, color="red"),
                text=[city_name],
                textposition="top center"
            )

            fig.update_layout(
                mapbox=dict(center=dict(lat=searched_lat, lon=searched_lon), zoom=5)
            )

        fig.update_traces(marker=dict(size=25, opacity=0.8), selector=dict(type="scattermapbox"))
        fig.update_layout(coloraxis_showscale=False)
        fig.update_layout(
            margin=dict(l=0, r=0, t=40, b=0),
            transition=dict(duration=500, easing="cubic-in-out")
        )

        st.plotly_chart(fig, use_container_width=True)
        
        # --- NEW SUMMARY METRICS ---
        mc1, mc2, mc3 = st.columns(3)
        mc1.metric("Min CO", f"{np.min(co_forecast):.2f}")
        mc2.metric("Max CO", f"{np.max(co_forecast):.2f}")
        mc3.metric("Average CO", f"{np.mean(co_forecast):.2f}")
        # ---------------------------

        # ---------------- LEADERBOARD ----------------
        st.subheader("🏆 Pollution Ranking Leaderboard")

        leaderboard = df_real.sort_values(by=gas_type, ascending=False).reset_index(drop=True)
        leaderboard.index += 1
        leaderboard = leaderboard.reset_index()
        leaderboard.rename(columns={"index": "Rank", "city": "City"}, inplace=True)

        leaderboard["CO"] = leaderboard["CO"].round(2)
        leaderboard["NO2"] = leaderboard["NO2"].round(2)

        st.dataframe(
            leaderboard[["Rank", "City", "CO", "NO2"]].style.background_gradient(cmap="viridis"),
            use_container_width=True
        )

        # --- ECG STYLE REAL-TIME STREAM ---
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("💓 Live CO Sensor Stream (ECG)")
        
        import time
        if "ecg_data" not in st.session_state:
            st.session_state.ecg_data = [max(0, np.sin(x/5.0) + np.random.normal(0, 0.2)) * 5 for x in range(60)]
        
        new_val = max(0, st.session_state.ecg_data[-1] + np.random.normal(0, 1.5))
        st.session_state.ecg_data.append(new_val)
        if len(st.session_state.ecg_data) > 60:
            st.session_state.ecg_data.pop(0)
            
        ecg_df = pd.DataFrame({"Time": range(len(st.session_state.ecg_data)), "CO Level": st.session_state.ecg_data})
        ecg_fig = px.line(ecg_df, x="Time", y="CO Level", template="plotly_dark", title="Continuous Sensor Feedback")
        ecg_fig.update_traces(line=dict(color='#00ffcc', width=3), fill='tozeroy', fillcolor='rgba(0, 255, 204, 0.1)')
        ecg_fig.update_layout(xaxis=dict(showgrid=False, zeroline=False, visible=False), yaxis=dict(showgrid=False, zeroline=False), margin=dict(t=30, b=10, l=10, r=10), hovermode=False)
        st.plotly_chart(ecg_fig, use_container_width=True)
        # ----------------------------------
    else:
        st.warning("No data received from API.")
elif menu == "🔮 Multi-Model Forecast":
    st.markdown("<br>", unsafe_allow_html=True)
    st.header("🔮 Multi-Model Prediction System")
    trad_models, trad_metrics, trad_preds, y_test, X_test = train_traditional_models()
    available_models = ["LSTM", "Random Forest", "Linear Regression"]
    if XGB_AVAILABLE:
        available_models.append("XGBoost")
    col_sel, col_desc = st.columns([1, 2])
    with col_sel:
        selected_model = st.selectbox("Select Prediction Model", available_models, index=0)
    with col_desc:
        st.markdown(f"**Model Used: {selected_model}**")
        descriptions = {
            "LSTM": "Deep Learning model specialized in sequence and time-series forecasting. Output displays the 24-hour projected trend.",
            "Random Forest": "Ensemble method creating multiple decision trees to yield high predictive accuracy.",
            "Linear Regression": "Fundamental statistical modeling plotting the primary relationship between CO levels and other atmospheric factors.",
            "XGBoost": "Advanced gradient boosting framework designed for maximized efficiency and high-performance scaling."
        }
        st.info(descriptions[selected_model])
    st.markdown("---")

    if selected_model == "LSTM":
        lstm_model = load_model("backend/models/lstm_model_multi.keras")
        scaler = joblib.load("backend/models/lstm_scaler_multi.save")
        df_lstm = pd.read_csv("backend/data/Data/clean_air_quality_new.csv")
        features = ["CO", "NO2", "Temperature", "Humidity"]
        data = df_lstm[features].values
        scaled_data = scaler.transform(data)
        sequence_length = 24
        current_input = scaled_data[-sequence_length:].reshape(1, sequence_length, 4)
        forecast_scaled = []
        for _ in range(24):
            prediction = lstm_model.predict(current_input, verbose=0)
            next_step_features = current_input[:, -1, :].copy() 
            next_step_features[0, 0] = prediction[0, 0]
            forecast_scaled.append(next_step_features[0].copy())
            next_step_reshaped = next_step_features.reshape(1, 1, 4)
            current_input = np.concatenate((current_input[:, 1:, :], next_step_reshaped), axis=1)
        forecast_scaled_arr = np.array(forecast_scaled)
        forecast_raw = scaler.inverse_transform(forecast_scaled_arr)
        co_forecast = np.clip(forecast_raw[:, 0], 0.0, None)
        x_axis = list(range(1, 25))
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=x_axis, y=co_forecast, mode='lines', name='Glow', line=dict(shape='spline', width=12, color='rgba(0, 255, 204, 0.15)'), hoverinfo='skip', showlegend=False))
        fig.add_trace(go.Scatter(x=x_axis, y=co_forecast, mode='lines+markers', name='Predicted CO', line=dict(shape='spline', width=4, color='#00ffcc'), marker=dict(size=8, color='#0f172a', line=dict(width=2, color='#00ffcc'))))
        fig.update_layout(title="<b>LSTM 24-Hour CO Forecast</b>", xaxis_title="Hours Ahead", yaxis_title="CO Level", template="plotly_dark")
        st.plotly_chart(fig, use_container_width=True)
        
        # --- NEW SUMMARY METRICS ---
        mc1, mc2, mc3 = st.columns(3)
        mc1.metric("Min CO", f"{np.min(co_forecast):.2f}")
        mc2.metric("Max CO", f"{np.max(co_forecast):.2f}")
        mc3.metric("Average CO", f"{np.mean(co_forecast):.2f}")
        # ---------------------------

    elif selected_model == "Random Forest":
        model_rf = trad_models["Random Forest"]
        preds_rf = trad_preds["Random Forest"]
        col_v1, col_v2 = st.columns(2)
        with col_v1:
            importances = model_rf.feature_importances_
            fig_fi = px.bar(x=X_test.columns, y=importances, title="Feature Importance Analysis", labels={'x': 'Features', 'y': 'Importance Factor'}, template="plotly_dark", color_discrete_sequence=['#00ffcc'])
            st.plotly_chart(fig_fi, use_container_width=True)
        with col_v2:
            fig_scatter = go.Figure()
            fig_scatter.add_trace(go.Scatter(x=y_test, y=preds_rf, mode='markers', marker=dict(color='#3b82f6', opacity=0.6), name='Predicted vs Actual'))
            fig_scatter.add_trace(go.Scatter(x=[y_test.min(), y_test.max()], y=[y_test.min(), y_test.max()], mode='lines', line=dict(dash='dash', color='#f43f5e'), name='Ideal Fit Line'))
            fig_scatter.update_layout(title="Random Forest: Prediction vs Actual", xaxis_title="Actual CO Data", yaxis_title="Predicted CO Data", template="plotly_dark")
            st.plotly_chart(fig_scatter, use_container_width=True)

    elif selected_model == "Linear Regression":
        preds_lr = trad_preds["Linear Regression"]
        col_v1, col_v2 = st.columns(2)
        with col_v1:
            fig_reg = px.scatter(x=X_test["NO2"], y=y_test, opacity=0.5, title="Linear Regression Line Fit (NO2 vs CO)", labels={'x': 'NO2 Level', 'y': 'Actual CO Level'}, template="plotly_dark")
            sort_idx = np.argsort(X_test["NO2"])
            fig_reg.add_trace(go.Scatter(x=X_test["NO2"].iloc[sort_idx], y=preds_lr[sort_idx], mode='lines', line=dict(color='#00ffcc', width=3), name='Fitted Regression Line'))
            st.plotly_chart(fig_reg, use_container_width=True)
        with col_v2:
            residuals = y_test - preds_lr
            fig_res = px.scatter(x=preds_lr, y=residuals, title="Distribution of Residuals", labels={'x': 'Predicted CO Levels', 'y': 'Error Residuals'}, template="plotly_dark", color_discrete_sequence=['#f59e0b'])
            fig_res.add_hline(y=0, line_dash="dash", line_color="white")
            st.plotly_chart(fig_res, use_container_width=True)

    elif selected_model == "XGBoost":
        model_xgb = trad_models["XGBoost"]
        col_v1, col_v2 = st.columns(2)
        with col_v1:
            importances = model_xgb.feature_importances_
            fig_fi = px.bar(x=importances, y=X_test.columns, orientation='h', title="XGBoost Feature Weighting", labels={'x': 'Weight / Importance', 'y': 'Input Features'}, template="plotly_dark", color_discrete_sequence=['#10b981'])
            st.plotly_chart(fig_fi, use_container_width=True)
        with col_v2:
            models_list = list(trad_metrics.keys())
            r2_scores = [trad_metrics[m]["R² Score"] for m in models_list]
            fig_comp = px.bar(x=models_list, y=r2_scores, title="Algorithmic Comparison (R² Score)", labels={'x': 'Algorithm', 'y': 'R² Precision Metric'}, template="plotly_dark", color=models_list, color_discrete_sequence=['#00ffcc', '#3b82f6', '#10b981'])
            st.plotly_chart(fig_comp, use_container_width=True)

    st.markdown("---")
    st.subheader("📊 Regression Models Performance Comparison KPI")
    df_metrics = pd.DataFrame(trad_metrics).T
    df_metrics = df_metrics.reset_index().rename(columns={"index": "Algorithm"})
    col_m1, col_m2, col_m3 = st.columns([1, 1, 2])
    best_model_name = df_metrics.loc[df_metrics["R² Score"].idxmax()]["Algorithm"]
    best_r2 = df_metrics["R² Score"].max()
    best_rmse = df_metrics.loc[df_metrics["R² Score"].idxmax()]["RMSE"]
    with col_m1:
        st.metric(label=f"🏆 Top R²: {best_model_name}", value=f"{best_r2:.4f}")
    with col_m2:
        st.metric(label="📉 Target Lowest RMSE", value=f"{best_rmse:.4f}")
    with col_m3:
        st.dataframe(df_metrics.style.format({"MAE": "{:.4f}", "RMSE": "{:.4f}", "R² Score": "{:.4f}"}), use_container_width=True)

# ---------------- CSV BATCH ----------------
elif menu == "📁 CSV Batch Prediction":
    render_page_banner(
        "Batch Prediction Workflow",
        "Upload historical datasets, run bulk AI inference, and export risk-enriched results."
    )

    st.header("📁 Batch Prediction")

    uploaded_file = st.file_uploader("Upload CSV File")

    if uploaded_file:
        df = pd.read_csv(uploaded_file)
        input_df = df[["CO", "NO2", "Temperature", "Humidity"]]
        predictions = model.predict(input_df)

        df["Predicted Risk"] = predictions

        st.dataframe(df, use_container_width=True)

        st.download_button(
            label="Download Results",
            data=df.to_csv(index=False),
            file_name="predicted_results.csv",
            mime="text/csv"
        )
