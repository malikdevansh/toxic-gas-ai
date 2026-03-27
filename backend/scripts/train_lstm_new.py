# ---------------- IMPORTS ----------------
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import joblib

# ---------------- STEP 1: LOAD DATA ----------------
df = pd.read_csv("backend/data/Data/clean_air_quality_new.csv")

# ---------------- STEP 2: SELECT FEATURES ----------------
features = ["CO", "NO2", "Temperature", "Humidity"]
data = df[features].values

# ---------------- STEP 3: NORMALIZE ----------------
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(data)

# ---------------- STEP 4: CREATE SEQUENCES ----------------
sequence_length = 24

X = []
y = []

for i in range(sequence_length, len(scaled_data)):
    X.append(scaled_data[i-sequence_length:i])
    y.append(scaled_data[i][0])  # CO only

X = np.array(X)
y = np.array(y)

print("X shape:", X.shape)

# ---------------- STEP 5: BUILD MODEL ----------------
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(24, 4)),
    LSTM(32),
    Dense(1)
])

model.compile(
    optimizer='adam',
    loss='mean_squared_error'
)

# ---------------- STEP 6: TRAIN ----------------
model.fit(X, y, epochs=20, batch_size=32)

# ---------------- STEP 7: SAVE ----------------
model.save("backend/models/lstm_model_multi.keras")
joblib.dump(scaler, "backend/models/lstm_scaler_multi.save")

print("✅ Multivariate model trained successfully!")