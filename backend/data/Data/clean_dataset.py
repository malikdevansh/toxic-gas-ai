import pandas as pd

# Load dataset with correct separator
data = pd.read_csv("Data/AirQualityUCI.csv", sep=';')

# Remove last empty column if exists
data = data.loc[:, ~data.columns.str.contains('^Unnamed')]

# Replace -200 with NaN
data = data.replace(-200, pd.NA)

# Rename columns
data = data.rename(columns={
    "CO(GT)": "CO",
    "NO2(GT)": "NO2",
    "T": "Temperature",
    "RH": "Humidity"
})

# Keep only required columns
df = data[["CO", "NO2", "Temperature", "Humidity"]]

# Convert commas to dots and convert to numeric
for col in df.columns:
    df[col] = df[col].astype(str).str.replace(',', '.')
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop missing values
df = df.dropna()

# Save cleaned dataset
df.to_csv("clean_air_quality.csv", index=False)

print("Clean dataset created successfully!")
print(df.head())