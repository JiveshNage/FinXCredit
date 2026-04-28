from fastapi import APIRouter, Depends, HTTPException, Request, File, UploadFile, Form
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
from services.kyc_service import simulate_pan_verification, simulate_aadhaar_verification, hash_kyc_data, extract_pan_ocr, parse_aadhaar_xml
from services.aa_service import fetch_aa_bank_statements, parse_bank_csv
from services.aa_service import fetch_aa_bank_statements
from services.bureau_service import fetch_cibil_report
from models import AadhaarData, PanData, BankStatement, BankTransaction

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
    consent_aa: bool
    consent_cibil: bool
    declared_income: float = None
    declared_expenses: float = None

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
class PanSubmit(BaseModel):
    pan_number: str

class AadhaarSubmit(BaseModel):
    aadhaar_number: str
    otp: str

@router.post("/verify/pan")
def verify_pan(data: PanSubmit, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = simulate_pan_verification(data.pan_number)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
        
    pan_data = PanData(
        user_id=current_user.id,
        pan_number=res["data"]["pan_number"],
        name=res["data"]["name"],
        verified=True
    )
    db.add(pan_data)
    current_user.pan_number = res["data"]["pan_number"]
    db.commit()
    return res["data"]

@router.post("/upload/pan")
async def upload_pan_ocr(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    contents = await file.read()
    res = extract_pan_ocr(contents)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
        
    pan_data = PanData(
        user_id=current_user.id,
        pan_number=res["data"]["pan_number"],
        name=res["data"]["name"],
        verified=True
    )
    db.add(pan_data)
    current_user.pan_number = res["data"]["pan_number"]
    db.commit()
    return res["data"]

@router.post("/verify/aadhaar")
def verify_aadhaar(data: AadhaarSubmit, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = simulate_aadhaar_verification(data.aadhaar_number, data.otp)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
        
    aadhaar_hash = hash_kyc_data(data.aadhaar_number)
    aadhaar_data = AadhaarData(
        user_id=current_user.id,
        aadhaar_number_hash=aadhaar_hash,
        name=current_user.name,
        verified=True
    )
    db.add(aadhaar_data)
    current_user.aadhaar_hash = aadhaar_hash
    current_user.kyc_verified = True
    db.commit()
    return res["data"]

@router.post("/upload/aadhaar")
async def upload_aadhaar_xml(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    contents = await file.read()
    res = parse_aadhaar_xml(contents)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
        
    # We use a mock hash since XML doesn't explicitly expose the full Aadhaar number easily
    aadhaar_hash = hash_kyc_data(res["data"]["name"]) 
    aadhaar_data = AadhaarData(
        user_id=current_user.id,
        aadhaar_number_hash=aadhaar_hash,
        name=res["data"]["name"],
        dob=res["data"].get("dob", "Unknown"),
        verified=True
    )
    db.add(aadhaar_data)
    current_user.aadhaar_hash = aadhaar_hash
    current_user.kyc_verified = True
    db.commit()
    return res["data"]

@router.post("/bank/fetch")
def fetch_bank_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    aa_data = fetch_aa_bank_statements(current_user.phone, current_user.worker_type)
    return _save_bank_data(db, current_user, aa_data)

@router.post("/upload/bank")
async def upload_bank_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    contents = await file.read()
    aa_data = parse_bank_csv(contents)
    return _save_bank_data(db, current_user, aa_data)

def _save_bank_data(db, current_user, aa_data):
    bank_statement = BankStatement(
        user_id=current_user.id,
        account_number="XXXX-Uploaded",
        bank_name="Simulated/Uploaded Bank",
        statement_data=json.dumps(aa_data),
        verified_income=aa_data["verified_income"],
        verified_expenses=aa_data["verified_expenses"],
        verified_savings=aa_data["verified_savings"],
        upi_transactions=aa_data["upi_transactions"]
    )
    db.add(bank_statement)
    
    # Store transactions
    for txn in aa_data.get("transactions", []):
        db_txn = BankTransaction(
            user_id=current_user.id,
            date=txn["date"],
            amount=txn["amount"],
            type=txn["type"],
            category=txn["category"],
            description=txn["description"]
        )
        db.add(db_txn)
        
    db.commit()
    return aa_data

@router.post("/calculate")
def submit_application(data: ApplicationSubmit, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not data.consent_aa or not data.consent_cibil:
        raise HTTPException(status_code=400, detail="Missing explicit user consent under Data Protection Laws")
        
    new_consent = models.ConsentLog(
        user_id=current_user.id,
        purpose="AA_AND_CIBIL_FETCH",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(new_consent)
    db.commit()

    cibil_score = fetch_cibil_report(current_user.pan_number)
    aa_data = fetch_aa_bank_statements(current_user.phone, current_user.worker_type)

    if cibil_score == -1:
         cibil_score = None 
         
    score_inputs = {
        "income": aa_data["verified_income"],
        "expenses": aa_data["verified_expenses"],
        "savings": aa_data["verified_savings"],
        "transactions": aa_data["upi_transactions"],
        "loan_history": cibil_score is not None and cibil_score > 600,
        "upi_freq": aa_data["upi_transactions"],
        "bill_regularity": aa_data.get("bill_regularity", "always_on_time"),
        "worker_type": current_user.worker_type,
        "declared_income": data.declared_income if hasattr(data, 'declared_income') else None,
        "declared_expenses": data.declared_expenses if hasattr(data, 'declared_expenses') else None
    }
    score_data = calculate_score(score_inputs)
    
    prob_default = 0.0
    if ml_model:
        try:
            _income = aa_data["verified_income"]
            _expenses = aa_data["verified_expenses"]
            _savings = aa_data["verified_savings"]
            _loan_amount = _income * 3
            _txn_freq = aa_data["upi_transactions"]

            ml_input = pd.DataFrame([{
                "city_tier": aa_data.get("city_tier", "Tier_2"),
                "job_type": current_user.worker_type,
                "income": _income,
                "expenses": _expenses,
                "savings": _savings,
                "loan_amount": _loan_amount,
                "txn_frequency": _txn_freq,
                "digital_ratio": aa_data.get("digital_ratio", 0.6),
                "income_volatility": aa_data.get("income_volatility", 0.3),
                "late_night_ratio": aa_data.get("late_night_ratio", 0.1),
                "savings_ratio": round(_savings / (_income + 1), 4),
                "expense_ratio": round(_expenses / (_income + 1), 4),
                "loan_to_income_ratio": round(_loan_amount / (_income * 12 + 1), 4),
            }])
            probabilities = ml_model.predict_proba(ml_input)[0]
            prob_default = float(probabilities[1])
            
            threshold = 0.55 if current_user.worker_type == "salaried" else 0.70
            
            if prob_default > threshold and score_data["decision"] == "Approved":
                score_data["decision"] = "Medium Risk"
                score_data["risk"] = "Medium Risk"
                score_data["flags"].append(f"ML Override: Risk exceeds dynamic threshold {threshold} for segment")
        except Exception as e:
            print("ML Error:", e)

    if cibil_score and cibil_score < 600:
         score_data["decision"] = "Rejected"
         score_data["risk"] = "High Risk"
         score_data["flags"].append(f"CIBIL Score Alert: {cibil_score}")

    cibil_final = score_data.get("cibil_equivalent") if cibil_score is None else cibil_score

    new_app = models.LoanApplicationDB(
        user_id=current_user.id,
        income=aa_data["verified_income"],
        expenses=aa_data["verified_expenses"],
        savings=aa_data["verified_savings"],
        transactions=aa_data["upi_transactions"],
        loan_history=score_inputs["loan_history"],
        cibil_score=cibil_final,
        is_aa_verified=True,
        declared_income=getattr(data, 'declared_income', None),
        declared_expenses=getattr(data, 'declared_expenses', None),
        discrepancy_score=score_data.get('discrepancy_score', 0),
        
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
    
    with open(os.path.join(BASE_DIR, "decision_audit.log"), "a") as f:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": current_user.id,
            "cibil": cibil_final,
            "ml_default_prob": prob_default,
            "decision": score_data["decision"]
        }
        f.write(json.dumps(log_entry) + "\n")
    
    return {
        "application_id": new_app.id,
        "score_results": score_data
    }

class FulfillSubmit(BaseModel):
    application_id: str
    amount: float
    tenure: int
    purpose: str

@router.post("/fulfill")
def fulfill_loan(data: FulfillSubmit, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify the application exists and belongs to the user
    app = db.query(models.LoanApplicationDB).filter(
        models.LoanApplicationDB.id == data.application_id,
        models.LoanApplicationDB.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app.decision != "Approved":
        raise HTTPException(status_code=400, detail="Cannot fulfill a loan that is not Approved")

    # Update app decision
    app.decision = "Offer Accepted"
    
    # Create Fulfillment Record
    fulfillment = models.LoanFulfillment(
        application_id=app.id,
        user_id=current_user.id,
        amount=data.amount,
        tenure=data.tenure,
        purpose=data.purpose
    )
    db.add(fulfillment)
    db.commit()
    db.refresh(fulfillment)
    
    return {
        "success": True,
        "message": "Loan application formally submitted for disbursement.",
        "fulfillment_id": fulfillment.id
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

@router.get("/latest-tips")
def get_latest_tips(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.user_id == current_user.id).order_by(models.LoanApplicationDB.created_at.desc()).first()
    
    if not app or not app.tips_json:
        return {"tips": []}
        
    try:
        tips = json.loads(app.tips_json)
        return {"tips": tips}
    except:
        return {"tips": []}

@router.get("/notifications")
def get_user_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    apps = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.user_id == current_user.id).order_by(models.LoanApplicationDB.created_at.desc()).all()
    
    notifications = []
    
    if not apps:
        notifications.append({
            "id": "welcome",
            "type": "info",
            "title": "Welcome to CreditBridge",
            "message": "Complete your profile and submit your first loan application to get started.",
            "time": "Just now",
            "is_read": False
        })
    else:
        for idx, app in enumerate(apps):
            if idx >= 5: break
            time_str = app.created_at.strftime("%b %d, %Y") if app.created_at else "Recently"
            
            if app.decision == "Approved":
                notifications.append({
                    "id": f"app_{app.id}_success",
                    "type": "success",
                    "title": "Loan Application Approved",
                    "message": f"Good news! Your application (Score: {app.score}) was approved. {app.loan_suggestion}",
                    "time": time_str,
                    "is_read": False
                })
            elif app.decision == "Rejected":
                notifications.append({
                    "id": f"app_{app.id}_reject",
                    "type": "error",
                    "title": "Application Rejected",
                    "message": "Your application was unfortunately rejected. Please check your Financial Tips to improve your score.",
                    "time": time_str,
                    "is_read": False
                })
            else:
                notifications.append({
                    "id": f"app_{app.id}_review",
                    "type": "warning",
                    "title": "Application Under Review",
                    "message": f"Your application is currently flagged as {app.risk_level}. We will notify you once a final decision is made.",
                    "time": time_str,
                    "is_read": False
                })
                
    notifications.append({
        "id": "system_sec",
        "type": "info",
        "title": "Security Update",
        "message": "We have updated our privacy policy and security measures. Your data is encrypted.",
        "time": "System",
        "is_read": True
    })
    
    return notifications

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
        "is_aa_verified": app.is_aa_verified,
        "income": app.income,
        "expenses": app.expenses,
        "savings": app.savings
    }
