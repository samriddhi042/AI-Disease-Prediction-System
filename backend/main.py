from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
from database import engine
from models import Base, PatientHistory, User
from sqlalchemy.orm import Session
from database import SessionLocal
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

# Load model
model = joblib.load("models/disease_prediction_model.pkl")

# Load encoder
disease_encoder = joblib.load("models/disease_encoder.pkl")

# Create database tables
Base.metadata.create_all(bind=engine)

# Create app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User signup schema
class UserSignup(BaseModel):

    username: str

    email: str

    password: str

# User login schema
class UserLogin(BaseModel):

    email: str

    password: str

# Input schema
class Symptoms(BaseModel):

    age: int
    gender: int
    temperature_f: float
    user_email: str

    fever: int
    headache: int
    joint_pain: int
    muscle_pain: int
    fatigue: int
    nausea: int
    vomiting: int
    rash: int
    chills: int
    sweating: int
    dehydration: int
    dizziness: int
    weakness: int
    cough: int
    sore_throat: int
    runny_nose: int
    sneezing: int
    confusion: int
    rapid_heartbeat: int
    dry_skin: int
    eye_pain: int
    travel_history: int

# Home route
@app.get("/")
def home():
    return {
        "message": "AI Disease Prediction API Running"
    }

# Prediction route
@app.post("/predict")
def predict_disease(symptoms: Symptoms):

    data = symptoms.dict()

    # Remove non-model fields
    data.pop("user_email", None)

    input_data = pd.DataFrame([data])

    # Predict probabilities
    probabilities = model.predict_proba(input_data)[0]

    # Top 3 indices
    top_indices = np.argsort(probabilities)[-3:][::-1]

    top_predictions = []

    for idx in top_indices:

        disease_name = disease_encoder.inverse_transform([idx])[0]

        confidence = round(probabilities[idx] * 100, 2)

        top_predictions.append({
            "disease": disease_name,
            "confidence": confidence
        })

    # Main prediction
    predicted_disease = top_predictions[0]["disease"]

    # Confidence score
    prediction_confidence = top_predictions[0]["confidence"]

    # Risk level logic
    risk_level = "Low"

    if prediction_confidence >= 70:
        risk_level = "High"

    elif prediction_confidence >= 40:
        risk_level = "Medium"

    # Create database session
    db: Session = SessionLocal()

    # Save prediction history
    history = PatientHistory(

        age=symptoms.age,

        gender=str(symptoms.gender),

        temperature=symptoms.temperature_f,

        symptoms=", ".join(
            [
                key for key, value in symptoms.dict().items()
                if value == 1
            ]
        ),

        predicted_disease=predicted_disease,

        confidence=prediction_confidence,

        risk_level=risk_level,

        user_email=symptoms.user_email,

        timestamp=datetime.now().strftime(
            "%d-%m-%Y %H:%M:%S"
        )
    )

    # Add to database
    db.add(history)

    # Commit changes
    db.commit()

    # Close session
    db.close()

    # Prevention tips
    prevention_tips = {

        "dengue": [
            "Drink plenty of fluids",
            "Avoid mosquito exposure",
            "Take proper rest"
        ],

        "malaria": [
            "Use mosquito nets",
            "Stay hydrated",
            "Avoid stagnant water"
        ],

        "chikungunya": [
            "Take rest",
            "Drink water regularly",
            "Avoid mosquito bites"
        ],

        "influenza": [
            "Wear masks",
            "Take rest",
            "Drink warm fluids"
        ],

        "cold": [
            "Drink warm water",
            "Take steam",
            "Get proper sleep"
        ],

        "heatstroke": [
            "Stay hydrated",
            "Avoid direct sunlight",
            "Stay in cool places"
        ],

        "viral": [
            "Take rest",
            "Drink fluids",
            "Monitor fever"
        ]
    }

    return {

        "predicted_disease": predicted_disease,

        "top_predictions": top_predictions,

        "prevention": prevention_tips.get(
            predicted_disease,
            []
        )
    }

# Get user-specific history
@app.get("/history/{email}")
def get_history(email: str):

    # Create DB session
    db: Session = SessionLocal()

    # Fetch only user's history
    history = db.query(
        PatientHistory
    ).filter(
        PatientHistory.user_email == email
    ).all()

    db.close()

    return history

# User signup API
@app.post("/signup")
def signup(user: UserSignup):

    # Create DB session
    db: Session = SessionLocal()

    # Check existing email
    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:

        db.close()

        return {
            "message": "Email already exists"
        }

    # Check existing username
    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:

        db.close()

        return {
            "message": "Username already exists"
        }

    # Create new user
    new_user = User(

        username=user.username,

        email=user.email,

        password=user.password
    )

    # Save user
    db.add(new_user)

    db.commit()

    db.close()

    return {
        "message": "Signup successful"
    }

# User login API
@app.post("/login")
def login(user: UserLogin):

    # Create DB session
    db: Session = SessionLocal()

    # Find user
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    # Check if user exists
    if not existing_user:

        db.close()

        return {
            "message": "User not found"
        }

    # Check password
    if existing_user.password != user.password:

        db.close()

        return {
            "message": "Incorrect password"
        }

    db.close()

    return {

        "message": "Login successful",

        "username": existing_user.username,

        "email": existing_user.email
    }