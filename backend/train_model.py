import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load master dataset
df = pd.read_csv("datasets/master_dataset.csv")

# Convert gender column to numeric
df["gender"] = LabelEncoder().fit_transform(df["gender"])

# Encode disease labels
disease_encoder = LabelEncoder()
df["disease"] = disease_encoder.fit_transform(df["disease"])

# Save disease label encoder
joblib.dump(disease_encoder, "models/disease_encoder.pkl")

# Features and target
X = df.drop("disease", axis=1)
y = df["disease"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Detailed report
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(model, "models/disease_prediction_model.pkl")

print("\nModel saved successfully!")