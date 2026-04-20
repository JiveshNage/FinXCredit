from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
import random

# Internal imports
import models
from database import engine, get_db
import auth

# Create DB Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinX Credit API",
    description="Predicts and strictly monitors financial behavior of Gig Workers."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

# Load AI
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'loan_model.pkl')

try:
    model_pipeline = joblib.load(MODEL_PATH)
    print("AI Model Loaded Successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    model_pipeline = None

# Pydantic Schemas
class LoanApplication(BaseModel):
    city: str
    job_type: str
    income: float
    expenses: float
    savings: float
    loan_amount: float
    txn_frequency: int
    digital_ratio: float
    income_volatility: float
    late_night_ratio: float
    verification_source: str = "Manual"

# Core prediction
@app.post("/predict")
def predict_eligibility(application: LoanApplication, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if model_pipeline is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded.")
    
    try:
        import shap

        # Predict
        input_dict = application.model_dump(exclude={"verification_source"})
        input_data = pd.DataFrame([input_dict])
        
        probabilities = model_pipeline.predict_proba(input_data)[0]
        prob_default = float(probabilities[1])
        prob_repay = float(probabilities[0])
        
        # Model Explainability using SHAP
        insights = []
        try:
            preprocessor = model_pipeline.named_steps['preprocessor']
            classifier = model_pipeline.named_steps['classifier']
            
            # Scikit-learn >= 1.0 supports get_feature_names_out
            feature_names = preprocessor.get_feature_names_out()
            input_transformed = preprocessor.transform(input_data)
            
            # Explain the XGB model predictions
            explainer = shap.TreeExplainer(classifier)
            shap_values = explainer.shap_values(input_transformed)
            
            # For a single row, ensure we have a 1D array
            shap_vals = shap_values[0] if len(shap_values.shape) > 1 else shap_values
            
            feature_impacts = list(zip(feature_names, shap_vals))
            feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
            
            for fname, val in feature_impacts[:4]: # Send top 4 impactful features
                clean_name = fname.replace("num__", "").replace("cat__", "").replace("_", " ").title()
                original_value = input_dict.get(clean_name.lower().replace(" ", "_"), "N/A")
                
                # In XGBoost standard objectives, positive SHAP value = push towards class 1 (Default)
                if val > 0:
                    impact_type = "negative"
                    desc = f"{clean_name} (Value: {original_value}) significantly increased default risk."
                else:
                    impact_type = "positive"
                    desc = f"{clean_name} (Value: {original_value}) positively influenced your credit profile."
                    
                insights.append({
                    "feature": clean_name,
                    "impact": impact_type,
                    "description": desc
                })
        except Exception as e:
            print(f"SHAP Error: {e}")
            insights = [{"feature": "System", "impact": "neutral", "description": "AI Explainability is currently unavailable."}]

        alt_credit_score = int(300 + (prob_repay * 600))
        is_eligible = bool(alt_credit_score >= 500)
        
        # CONTINUOUS MONITORING: Save to Database
        db_app = models.LoanApplicationDB(
            **application.model_dump(),
            is_eligible=is_eligible,
            alt_credit_score=alt_credit_score,
            prob_default=prob_default,
            user_id=current_user.id
        )
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        
        return {
            "eligible": is_eligible,
            "alternative_credit_score": alt_credit_score,
            "probability_of_default": round(prob_default * 100, 2),
            "status_message": "Approved" if is_eligible else "Rejected due to risk",
            "application_id": db_app.id,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ADMIN RBAC ENDPOINT
@app.get("/applications")
def get_all_applications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized, admin only")
    return db.query(models.LoanApplicationDB).order_by(models.LoanApplicationDB.id.desc()).all()

# SETU ACCOUNT AGGREGATOR MOCK SIMULATION
@app.get("/mock-account-aggregator/{user_phone}")
def mock_aa_statement_fetch(user_phone: str):
    """
    Simulates fetching 6 months of Bank Statements and converting it directly
    into Model Features like Setu/Sahamati would.
    """
    if len(user_phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number.")
        
    random.seed(int(user_phone.replace("+", "")[-4:])) # Pseudo-consistent data based on phone
    income = random.randint(15000, 60000)
    expenses = income * random.uniform(0.3, 0.9)
    savings = income - expenses
    
    return {
        "status": "SUCCESS",
        "verification_source": "Setu Account Aggregator",
        "extracted_features": {
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "savings": round(savings, 2),
            "txn_frequency": random.randint(30, 200),
            "digital_ratio": round(random.uniform(0.4, 0.95), 2),
            "income_volatility": round(random.uniform(0.1, 0.4), 2),
            "late_night_ratio": round(random.uniform(0.05, 0.5), 2)
        }
    }
