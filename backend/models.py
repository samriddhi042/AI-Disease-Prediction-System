from sqlalchemy import Column, Integer, String, Float

from database import Base


class PatientHistory(Base):

    __tablename__ = "patient_history"

    id = Column(Integer, primary_key=True, index=True)

    age = Column(Integer)

    gender = Column(String)

    temperature = Column(Float)

    symptoms = Column(String)

    predicted_disease = Column(String)

    confidence = Column(Float)

    user_email = Column(String)

    risk_level = Column(String)

    timestamp = Column(String)

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True
    )

    password = Column(String)