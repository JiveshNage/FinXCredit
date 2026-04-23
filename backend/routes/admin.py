from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db
from utils.jwt_utils import get_admin_user

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
