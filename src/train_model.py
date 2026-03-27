import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import joblib

# Load cleaned dataset
data = pd.read_csv("Data/clean_air_quality.csv")

# Create Risk category
data["Risk"] = data["CO"].apply(
    lambda x: 2 if x > 15 else (1 if x > 8 else 0)
)

# Features and target
X = data[["CO", "NO2", "Temperature", "Humidity"]]
y = data["Risk"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Models to compare
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(),
    "SVM": SVC()
}

best_model = None
best_score = 0

for name, model in models.items():
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"{name} Accuracy: {score}")

    if score > best_score:
        best_score = score
        best_model = model

# Save best model
joblib.dump(best_model, "best_model.pkl")
# Save confusion matrix
from sklearn.metrics import confusion_matrix
import numpy as np

y_pred = best_model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)

np.save("confusion_matrix.npy", cm)

print("Confusion matrix saved successfully!")

print("Best model saved successfully!")