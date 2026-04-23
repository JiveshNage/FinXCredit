from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class AadhaarData(Base):
    __tablename__ = "aadhaar_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    aadhaar_number_hash = Column(String(255), unique=True)
    name = Column(String(255))
    dob = Column(String(50))
    address = Column(Text)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PanData(Base):
    __tablename__ = "pan_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pan_number = Column(String(10), unique=True)
    name = Column(String(255))
    dob = Column(String(50))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankStatement(Base):
    __tablename__ = "bank_statements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_number = Column(String(20))
    bank_name = Column(String(100))
    statement_data = Column(Text)  # JSON string of transactions
    verified_income = Column(Integer)
    verified_expenses = Column(Integer)
    verified_savings = Column(Integer)
    upi_transactions = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
