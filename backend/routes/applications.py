from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import joblib
import pandas as pd
import json
from datetime import datetime

import models
from database import get_db
from utils.jwt_utils import get_current_user, get_admin_user
from services.scoring_engine import calculate_score
from services.kyc_service import validate_pan, mock_uidai_ping, hash_kyc_data
from services.aa_service import fetch_aa_bank_statements
from services.bureau_service import fetch_cibil_report
from models import AadhaarData, PanData, BankStatement  # Updated import

router = APIRouter(prefix="/api/applications", tags=["applications"])

# Load ML Model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'ml_models', 'loan_model.pkl')
try:
    ml_model = joblib.load(MODEL_PATH)
except:
    ml_model = None

class KYCSubmit(BaseModel):
    pan_number: str
    aadhaar_number: str

class ApplicationSubmit(BaseModel):
    # Notice: NO MORE INCOME/TXN/SAVINGS!
    # RBI regulations dictate this comes via Account Aggregator.
    consent_aa: bool
    consent_cibil: bool

class EligibilityCheck(BaseModel):
    pan_number: str
    aadhaar_number: str

class SimulationInput(BaseModel):
    income: float
    expenses: float
    savings: float
    transactions: int
    loan_history: bool
    upi_freq: int
    bill_regularity: str

@router.post("/simulate")
def simulate_scoring(data: SimulationInput):
    """A bypass endpoint to test the scoring engine with manual inputs"""
    score_inputs = {
        "income": data.income,
        "expenses": data.expenses,
        "savings": data.savings,
        "transactions": data.transactions,
        "loan_history": data.loan_history,
        "upi_freq": data.upi_freq,
        "bill_regularity": data.bill_regularity,
    }
    score_results = calculate_score(score_inputs)
    return score_results
@router.post("/kyc-submit")
def submit_kyc(data: KYCSubmit, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Step 1: Save User's KYC data (Simulated Aadhaar/PAN validation)"""
    if not validate_pan(data.pan_number):
        raise HTTPException(status_code=400, detail="Invalid PAN format")
        
    if not mock_uidai_ping(data.aadhaar_number, current_user.name):
        raise HTTPException(status_code=400, detail="Aadhaar matching failed or blocked UID")
        
    # Update DB User
    current_user.pan_number = data.pan_number
    current_user.aadhaar_hash = hash_kyc_data(data.aadhaar_number)
    current_user.kyc_verified = True
    db.commit()
    return {"message": "KYC Verified Successfully"}

@router.post("/calculate")
def submit_application(data: ApplicationSubmit, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # if not current_user.kyc_verified:
    #     raise HTTPException(status_code=403, detail="Complete KYC before loan application")
        
    if not data.consent_aa or not data.consent_cibil:
        raise HTTPException(status_code=400, detail="Missing explicit user consent under Data Protection Laws")
        
    # LOG CONSENT AUDIT TRAIL
    new_consent = models.ConsentLog(
        user_id=current_user.id,
        purpose="AA_AND_CIBIL_FETCH",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(new_consent)
    db.commit()

    # 1. Fetch Trusted Data (MOCKED API Calls to Sahamati / CIBIL)
    cibil_score = fetch_cibil_report(current_user.pan_number)
    aa_data = fetch_aa_bank_statements(current_user.phone, current_user.worker_type)

    if cibil_score == -1: # NTC (New To Credit)
         # In India, NTC relies purely on AA data
         cibil_score = None 
         
    # 2. Run Determinisitic Explainability Engine
    score_inputs = {
        "income": aa_data["verified_income"],
        "expenses": aa_data["verified_expenses"],
        "savings": aa_data["verified_savings"],
        "transactions": aa_data["upi_transactions"],
        "loan_history": cibil_score is not None and cibil_score > 600,
        "upi_freq": aa_data["upi_transactions"],
        "bill_regularity": aa_data["bill_regularity"],
    }
    score_data = calculate_score(score_inputs)
    
    # 3. Dynamic ML Risk Override (Pan-India model)
    prob_default = 0.0
    if ml_model:
        try:
            # Compute derived features for the ML model
            _income = aa_data["verified_income"]
            _expenses = aa_data["verified_expenses"]
            _savings = aa_data["verified_savings"]
            _loan_amount = _income * 3
            _txn_freq = aa_data["upi_transactions"]

            ml_input = pd.DataFrame([{
                "city_tier": aa_data.get("city_tier", "Tier_2"),  # Default Tier_2 if unknown
                "job_type": current_user.worker_type,
                "income": _income,
                "expenses": _expenses,
                "savings": _savings,
                "loan_amount": _loan_amount,
                "txn_frequency": _txn_freq,
                "digital_ratio": aa_data.get("digital_ratio", 0.6),
                "income_volatility": aa_data.get("income_volatility", 0.3),
                "late_night_ratio": aa_data.get("late_night_ratio", 0.1),
                # Ratio features (region-agnostic, key to pan-India generalization)
                "savings_ratio": round(_savings / (_income + 1), 4),
                "expense_ratio": round(_expenses / (_income + 1), 4),
                "loan_to_income_ratio": round(_loan_amount / (_income * 12 + 1), 4),
            }])
            probabilities = ml_model.predict_proba(ml_input)[0]
            prob_default = float(probabilities[1])
            
            # Dynamic Threshold mapped to worker_type (RBI standard custom segmenting)
            threshold = 0.55 if current_user.worker_type == "salaried" else 0.70
            
            if prob_default > threshold and score_data["decision"] == "Approved":
                score_data["decision"] = "Medium Risk"
                score_data["risk"] = "Medium Risk"
                score_data["flags"].append(f"ML Override: Risk exceeds dynamic threshold {threshold} for segment")
        except Exception as e:
            print("ML Error:", e)

    # Modify Score Heavily based on CIBIL if it exists
    if cibil_score and cibil_score < 600:
         score_data["decision"] = "Rejected"
         score_data["risk"] = "High Risk"
         score_data["flags"].append(f"CIBIL Score Alert: {cibil_score}")

    # 4. Write to Application DB
    new_app = models.LoanApplicationDB(
        user_id=current_user.id,
        income=aa_data["verified_income"],
        expenses=aa_data["verified_expenses"],
        savings=aa_data["verified_savings"],
        transactions=aa_data["upi_transactions"],
        loan_history=score_inputs["loan_history"],
        cibil_score=cibil_score,
        is_aa_verified=True,
        
        score=score_data["score"],
        decision=score_data["decision"],
        risk_level=score_data["risk"],
        loan_suggestion=score_data["loan"],
        
        factors_json=json.dumps(score_data["factors"]),
        tips_json=json.dumps(score_data["tips"]),
        is_flagged=len(score_data["flags"]) > 0,
        fraud_reason=" | ".join(score_data["flags"]) if score_data["flags"] else None
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Write synchronous AUDIT LOG
    with open(os.path.join(BASE_DIR, "decision_audit.log"), "a") as f:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": current_user.id,
            "cibil": cibil_score,
            "ml_default_prob": prob_default,
            "decision": score_data["decision"]
        }
        f.write(json.dumps(log_entry) + "\n")
    
    return {
        "application_id": new_app.id,
        "score_results": score_data
    }

@router.post("/eligibility-check")
def check_eligibility(data: EligibilityCheck, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Fetch data from fake APIs, store in DB, and check eligibility"""
    # Validate and fetch Aadhaar data (fake API)
    if not mock_uidai_ping(data.aadhaar_number, current_user.name):
        raise HTTPException(status_code=400, detail="Aadhaar verification failed")
    aadhaar_hash = hash_kyc_data(data.aadhaar_number)
    aadhaar_data = AadhaarData(
        user_id=current_user.id,
        aadhaar_number_hash=aadhaar_hash,
        name=current_user.name,
        dob="1990-01-01",  # Mocked
        address="Mock Address",
        verified=True
    )
    db.add(aadhaar_data)

    # Validate and fetch PAN data (fake API)
    if not validate_pan(data.pan_number):
        raise HTTPException(status_code=400, detail="Invalid PAN")
    pan_data = PanData(
        user_id=current_user.id,
        pan_number=data.pan_number,
        name=current_user.name,
        dob="1990-01-01",  # Mocked
        verified=True
    )
    db.add(pan_data)

    # Fetch bank statements (fake API)
    aa_data = fetch_aa_bank_statements(current_user.phone, current_user.worker_type)
    bank_statement = BankStatement(
        user_id=current_user.id,
        account_number="1234567890",  # Mocked
        bank_name="Mock Bank",
        statement_data=json.dumps(aa_data),
        verified_income=aa_data["verified_income"],
        verified_expenses=aa_data["verified_expenses"],
        verified_savings=aa_data["verified_savings"],
        upi_transactions=aa_data["upi_transactions"]
    )
    db.add(bank_statement)
    db.commit()

    # Fetch CIBIL (fake API)
    cibil_score = fetch_cibil_report(data.pan_number)

    # Run scoring
    score_inputs = {
        "income": aa_data["verified_income"],
        "expenses": aa_data["verified_expenses"],
        "savings": aa_data["verified_savings"],
        "transactions": aa_data["upi_transactions"],
        "loan_history": cibil_score is not None and cibil_score > 600,
        "upi_freq": aa_data["upi_transactions"],
        "bill_regularity": aa_data["bill_regularity"],
    }
    score_data = calculate_score(score_inputs)

    # ML model check (similar to existing)
    prob_default = 0.0
    if ml_model:
        try:
            ml_input = pd.DataFrame([{
                "city_tier": aa_data.get("city_tier", "Tier_2"),
                "job_type": current_user.worker_type,
                "income": aa_data["verified_income"],
                "expenses": aa_data["verified_expenses"],
                "savings": aa_data["verified_savings"],
                "loan_amount": aa_data["verified_income"] * 3,
                "txn_frequency": aa_data["upi_transactions"],
                "digital_ratio": aa_data.get("digital_ratio", 0.6),
                "income_volatility": aa_data.get("income_volatility", 0.3),
                "late_night_ratio": aa_data.get("late_night_ratio", 0.1),
                "savings_ratio": round(aa_data["verified_savings"] / (aa_data["verified_income"] + 1), 4),
                "expense_ratio": round(aa_data["verified_expenses"] / (aa_data["verified_income"] + 1), 4),
                "loan_to_income_ratio": round((aa_data["verified_income"] * 3) / (aa_data["verified_income"] * 12 + 1), 4),
            }])
            probabilities = ml_model.predict_proba(ml_input)[0]
            prob_default = float(probabilities[1])
            threshold = 0.55 if current_user.worker_type == "salaried" else 0.70
            if prob_default > threshold and score_data["decision"] == "Approved":
                score_data["decision"] = "Medium Risk"
        except Exception as e:
            print("ML Error:", e)

    if cibil_score and cibil_score < 600:
        score_data["decision"] = "Rejected"

    return {
        "eligible": score_data["decision"] == "Approved",
        "score": score_data["score"],
        "risk_level": score_data["risk"],
        "details": score_data
    }

@router.get("/")
def get_my_applications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    apps = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.user_id == current_user.id).order_by(models.LoanApplicationDB.created_at.desc()).all()
    
    return [{
        "id": a.id,
        "score": a.score,
        "decision": a.decision,
        "risk_level": a.risk_level,
        "created_at": a.created_at,
        "loan_suggestion": a.loan_suggestion,
        "cibil_score": a.cibil_score,
        "is_aa_verified": a.is_aa_verified
    } for a in apps]

@router.get("/{app_id}")
def get_application_details(app_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return {
        "id": app.id,
        "score": app.score,
        "decision": app.decision,
        "risk_level": app.risk_level,
        "loan_suggestion": app.loan_suggestion,
        "factors": json.loads(app.factors_json) if app.factors_json else {},
        "tips": json.loads(app.tips_json) if app.tips_json else [],
        "flags": app.fraud_reason,
        "created_at": app.created_at,
        "cibil_score": app.cibil_score,
        "is_aa_verified": app.is_aa_verified
    }
