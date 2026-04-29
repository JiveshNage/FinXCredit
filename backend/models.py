from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String)
    place = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String)
    worker_type = Column(String) # delivery/freelancer/street_vendor
    role = Column(String, default="user") # 'user' or 'admin'
    photo_url = Column(Text, nullable=True)
    
    # OTP/2FA specifics
    status = Column(String, default="pending_verification") # pending_verification, active, suspended
    two_fa_enabled = Column(Boolean, default=False)
    preferred_channel = Column(String, default="email")
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    
    # KYC Specifics (RBI Compliance)
    aadhaar_hash = Column(String, nullable=True) # Hashed to prevent raw storage of PII
    pan_number = Column(String, nullable=True)
    kyc_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    applications = relationship("LoanApplicationDB", back_populates="user", cascade="all, delete-orphan")
    otp_records = relationship("OtpRecord", back_populates="user", cascade="all, delete-orphan")
    consent_logs = relationship("ConsentLog", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("BankTransaction", back_populates="user", cascade="all, delete-orphan")

class ConsentLog(Base):
    __tablename__ = "consent_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    purpose = Column(String) # e.g. 'account_aggregator', 'cibil_fetch'
    consent_status = Column(Boolean, default=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="consent_logs")

class LoanApplicationDB(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    
    # Financial Inputs (ML Extracted)
    income = Column(Float)
    expenses = Column(Float)
    savings = Column(Float)
    transactions = Column(Integer)
    loan_history = Column(Boolean)
    
    # Self-Declared Financials
    declared_income = Column(Float, nullable=True)
    declared_expenses = Column(Float, nullable=True)
    discrepancy_score = Column(Float, nullable=True) # 0 to 100 (higher = more discrepancy)
    
    # Optional / Alternative Data (Fallbacks)
    upi_freq = Column(Integer, nullable=True)
    bill_regularity = Column(String, nullable=True)
    mobile_recharge = Column(String, nullable=True)

    # Compliance API Aggregation Results
    cibil_score = Column(Integer, nullable=True)
    is_aa_verified = Column(Boolean, default=False)
    
    # AI Scoring Results
    score = Column(Float)
    decision = Column(String)
    risk_level = Column(String)
    loan_suggestion = Column(String)
    
    # Explainability Data (Stored as JSON Strings)
    factors_json = Column(String)
    tips_json = Column(String)
    
    # Fraud Flags
    is_flagged = Column(Boolean, default=False)
    fraud_reason = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="applications")


class LoanFulfillment(Base):
    __tablename__ = "loan_fulfillments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    application_id = Column(Integer, ForeignKey("loan_applications.id"))
    user_id = Column(String, ForeignKey("users.id"))
    amount = Column(Float)
    tenure = Column(Integer)
    purpose = Column(String)
    status = Column(String, default="Pending Disbursement")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OtpRecord(Base):
    __tablename__ = "otp_records"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    identifier = Column(String) # email or phone
    otp_hash = Column(String)
    purpose = Column(String) # signup, login_2fa, password_reset, etc.
    channel = Column(String) # email or sms
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="otp_records")


class NotificationLog(Base):
    __tablename__ = "notifications_log"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    channel = Column(String)
    purpose = Column(String)
    status = Column(String) # sent, failed, delivered
    provider = Column(String)
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    token_hash = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AadhaarData(Base):
    __tablename__ = "aadhaar_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    aadhaar_number_hash = Column(String(255), unique=True)
    name = Column(String(255))
    dob = Column(String(50))
    address = Column(Text)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PanData(Base):
    __tablename__ = "pan_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    pan_number = Column(String(10), unique=True)
    name = Column(String(255))
    dob = Column(String(50))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BankStatement(Base):
    __tablename__ = "bank_statements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    account_number = Column(String(20))
    bank_name = Column(String(100))
    statement_data = Column(Text)  # JSON string of transactions
    verified_income = Column(Integer)
    verified_expenses = Column(Integer)
    verified_savings = Column(Integer)
    upi_transactions = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(DateTime)  # Fixed: Changed from String to DateTime for data integrity
    amount = Column(Float)
    type = Column(String) # 'CREDIT' or 'DEBIT'
    category = Column(String) # 'Salary', 'UPI', 'Utilities', etc.
    description = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")

class TrustworthyPerson(Base):
    __tablename__ = "trustworthy_people"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    occupation = Column(String, nullable=False)
    location = Column(String, nullable=False)
    testimonial = Column(Text, nullable=False)
    rating = Column(Integer, default=5)  # 1-5 stars
    is_featured = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    admin_id = Column(String, ForeignKey("users.id"))
    target_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    target_app_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=True)
    action_type = Column(String)  # NOTIFICATION_SENT, MANUAL_OVERRIDE, etc.
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")
