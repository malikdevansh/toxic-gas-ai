import pandas as pd

# Load dataset
df = pd.read_csv("Data/global_air_quality_data_10000.csv")

# Keep only important columns (EDIT BASED ON YOUR DATA)
df = df[["CO", "NO2", "Temperature", "Humidity"]]

# Convert everything to numeric
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Remove missing values
df = df.dropna()

# Remove negative values (IMPORTANT FIX)
df = df[(df >= 0).all(axis=1)]

# Save cleaned dataset
df.to_csv("backend/data/Data/clean_air_quality_new.csv", index=False)

print("✅ Clean dataset ready!")
print(df.head())