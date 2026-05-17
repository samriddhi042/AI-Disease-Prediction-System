import pandas as pd
import os

# Dataset folder path
DATASET_PATH = "datasets"

# Disease files
files = [
    "chikungunya.xlsx",
    "cold.xlsx",
    "dengue.xlsx",
    "heatstroke.xlsx",
    "influenza.xlsx",
    "malaria.xlsx",
    "viral.xlsx"
]

# Standard columns
STANDARD_COLUMNS = [
    "age",
    "gender",
    "temperature_f",
    "fever",
    "headache",
    "joint_pain",
    "muscle_pain",
    "fatigue",
    "nausea",
    "vomiting",
    "rash",
    "chills",
    "sweating",
    "dehydration",
    "dizziness",
    "weakness",
    "cough",
    "sore_throat",
    "runny_nose",
    "sneezing",
    "confusion",
    "rapid_heartbeat",
    "dry_skin",
    "eye_pain",
    "travel_history",
    "disease"
]

all_dataframes = []

for file in files:

    file_path = os.path.join(DATASET_PATH, file)

    df = pd.read_excel(file_path)

    # Lowercase column names
    df.columns = df.columns.str.lower()

    # Rename inconsistent columns
    rename_dict = {
        "fever_fahrenheit": "temperature_f",
        "body_ache": "muscle_pain"
    }

    df.rename(columns=rename_dict, inplace=True)

    # Add missing columns
    for col in STANDARD_COLUMNS:
        if col not in df.columns:
            df[col] = 0

    # Convert Yes/No to 1/0
    df.replace({
        "Yes": 1,
        "No": 0,
        "yes": 1,
        "no": 0,
        "Male": 1,
        "Female": 0,
        "male": 1,
        "female": 0
    }, inplace=True)

    # Fill missing values
    df.fillna(0, inplace=True)

    # Disease name from filename
    disease_name = file.replace(".xlsx", "")

    # Add disease column
    df["disease"] = disease_name

    # Keep only standard columns
    df = df[STANDARD_COLUMNS]

    all_dataframes.append(df)

# Merge all datasets
master_df = pd.concat(all_dataframes, ignore_index=True)

# Save master dataset
master_df.to_csv("datasets/master_dataset.csv", index=False)

print("Master dataset created successfully!")
print(master_df.head())