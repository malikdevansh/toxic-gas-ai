import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping
import joblib

# Load dataset
df = pd.read_csv("Data/clean_air_quality.csv")

# Use CO column for forecasting
data = df["CO"].values.reshape(-1, 1)

# Scale data
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(data)

# Save scaler
joblib.dump(scaler, "backend/models/lstm_scaler.save")

# Create sequences
sequence_length = 24
X = []
y = []

for i in range(sequence_length, len(scaled_data)):
    X.append(scaled_data[i-sequence_length:i])
    y.append(scaled_data[i])

X = np.array(X)
y = np.array(y)

# Build model
model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(sequence_length, 1)))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mse')

# Train model
model.fit(X, y, epochs=20, batch_size=32, verbose=1)

# Save model
model.save("backend/models/lstm_model.h5")

print("✅ LSTM model trained and saved successfully.")