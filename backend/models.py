from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user") # 'user' or 'admin'

    applications = relationship("LoanApplicationDB", back_populates="user")

class LoanApplicationDB(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    city = Column(String, index=True)
    job_type = Column(String)
    income = Column(Float)
    expenses = Column(Float)
    savings = Column(Float)
    loan_amount = Column(Float)
    txn_frequency = Column(Integer)
    digital_ratio = Column(Float)
    income_volatility = Column(Float)
    late_night_ratio = Column(Float)
    
    # Decisions (what the AI predicted)
    is_eligible = Column(Boolean)
    alt_credit_score = Column(Integer)
    prob_default = Column(Float)
    verification_source = Column(String, default="Manual") # Can be "Setu Account Aggregator" or "Manual"

    user = relationship("User", back_populates="applications")
