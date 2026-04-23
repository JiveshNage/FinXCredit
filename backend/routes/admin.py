from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import models
from database import get_db
from utils.jwt_utils import get_admin_user
from services.notification_service import send_notification_email, simulate_sms_call

class NotifyRequest(BaseModel):
    user_id: str
    channel: str
    message: str

class OverrideRequest(BaseModel):
    new_decision: str # "Approved" or "Rejected"
    reason: str

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    total_users = db.query(models.User).filter(models.User.role == "user").count()
    total_apps = db.query(models.LoanApplicationDB).count()
    approved_apps = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.decision == "Approved").count()
    
    fraud_flags = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.is_flagged == True).count()
    
    avg_score = db.query(func.avg(models.LoanApplicationDB.score)).scalar() or 0
    
    approval_rate = (approved_apps / total_apps * 100) if total_apps > 0 else 0
    
    return {
        "total_users": total_users,
        "total_applications": total_apps,
        "approval_rate": round(approval_rate, 2),
        "rejection_rate": round(100 - approval_rate, 2) if total_apps > 0 else 0,
        "average_score": round(avg_score, 1),
        "fraud_alerts_count": fraud_flags
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    users = db.query(models.User).filter(models.User.role == "user").all()
    
    # We could optimize this by joining, but for simple list:
    res = []
    for u in users:
        apps_count = len(u.applications)
        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "worker_type": u.worker_type,
            "status": u.status,
            "joined_date": u.created_at,
            "total_applications": apps_count
        })
    return res

@router.get("/applications")
def get_all_applications(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    apps = db.query(models.LoanApplicationDB).order_by(models.LoanApplicationDB.created_at.desc()).all()
    res = []
    for a in apps:
        res.append({
            "id": a.id,
            "user_name": a.user.name if a.user else "Unknown",
            "score": a.score,
            "risk_level": a.risk_level,
            "status": a.decision,
            "is_flagged": a.is_flagged,
            "date": a.created_at
        })
    return res

@router.get("/fraud-alerts")
def get_fraud_alerts(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    apps = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.is_flagged == True).order_by(models.LoanApplicationDB.created_at.desc()).all()
    res = []
    for a in apps:
        res.append({
            "id": a.id,
            "user_name": a.user.name if a.user else "Unknown",
            "score": a.score,
            "flag_reason": a.fraud_reason,
            "date": a.created_at
        })
    return res

@router.get("/application/{app_id}")
def get_application_details(app_id: int, db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    app = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    user = app.user
    
    return {
        "id": app.id,
        "user_id": user.id,
        "user_name": user.name,
        "email": user.email,
        "phone": user.phone,
        "declared_income": app.declared_income,
        "declared_expenses": app.declared_expenses,
        "verified_income": app.income,
        "verified_expenses": app.expenses,
        "discrepancy_score": app.discrepancy_score,
        "is_flagged": app.is_flagged,
        "fraud_reason": app.fraud_reason,
        "score": app.score,
        "decision": app.decision,
        "cibil_equivalent": app.cibil_score,
        "factors_json": app.factors_json,
        "date": app.created_at
    }

@router.post("/notify-user")
def notify_user(req: NotifyRequest, db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = False
    if req.channel == "email":
        success = send_notification_email(target_user.email, "Important Update from FinX Credit", req.message)
    elif req.channel in ["sms", "call"]:
        success = simulate_sms_call(target_user.phone, req.channel, req.message)
    else:
        raise HTTPException(status_code=400, detail="Invalid channel")
        
    if not success:
        raise HTTPException(status_code=500, detail="Failed to dispatch notification")
        
    # Log Audit Trail
    audit = models.AuditLog(
        admin_id=admin.id,
        target_user_id=target_user.id,
        action_type="NOTIFICATION_SENT",
        details=f"Sent {req.channel} notification. Message: {req.message}"
    )
    db.add(audit)
    db.commit()
    
    return {"success": True, "message": f"Notification sent via {req.channel}"}

@router.post("/application/{app_id}/override")
def override_decision(app_id: int, req: OverrideRequest, db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    app = db.query(models.LoanApplicationDB).filter(models.LoanApplicationDB.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    old_decision = app.decision
    app.decision = req.new_decision
    
    # Log Audit Trail
    audit = models.AuditLog(
        admin_id=admin.id,
        target_user_id=app.user_id,
        target_app_id=app.id,
        action_type="MANUAL_OVERRIDE",
        details=f"Overrode decision from {old_decision} to {req.new_decision}. Reason: {req.reason}"
    )
    db.add(audit)
    db.commit()
    
    return {"success": True, "message": "Application decision overridden successfully"}
