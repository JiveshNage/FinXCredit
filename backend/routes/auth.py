from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from datetime import timedelta
from passlib.context import CryptContext
import re

import models
from database import get_db
from utils.jwt_utils import create_access_token, create_refresh_token, get_current_user
from services.otp_service import generate_and_send_otp, verify_otp
from utils.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -----------------
# Pydantic Schemas
# -----------------

class SignupInitiate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    place: str
    password: str
    worker_type: str = "salaried"

    @validator('password')
    def validate_password_strength(cls, v):
        pattern = r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
        if not re.match(pattern, v):
            raise ValueError('Password must be at least 8 characters and contain a letter, a number, and a special character.')
        return v

class VerifyOTPRequest(BaseModel):
    identifier: str # email or phone
    otp: str
    purpose: str

class SigninRequest(BaseModel):
    email: EmailStr
    password: str

class ResendOTPRequest(BaseModel):
    identifier: str
    purpose: str
    channel: str = "email"

# -----------------
# Endpoints
# -----------------

@router.post("/signup/initiate")
@limiter.limit("5/minute")
def signup_initiate(request: Request, req: SignupInitiate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(models.User).filter(
        (models.User.email == req.email) | (models.User.phone == req.phone)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email or phone already registered")
        
    password_hash = pwd_context.hash(req.password)
    
    new_user = models.User(
        name=req.name,
        email=req.email,
        phone=req.phone,
        place=req.place,
        password_hash=password_hash,
        worker_type=req.worker_type,
        status="pending_verification"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate and send OTP via email
    res = generate_and_send_otp(db, identifier=req.email, purpose="signup", channel="email", user_id=new_user.id)
    return {"message": "OTP sent", "channel": "email"}

@router.post("/signup/verify-otp")
@limiter.limit("5/minute")
def signup_verify_otp(request: Request, response: Response, req: VerifyOTPRequest, db: Session = Depends(get_db)):
    success, msg = verify_otp(db, identifier=req.identifier, purpose=req.purpose, plain_otp=req.otp)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
        
    user = db.query(models.User).filter(
        (models.User.email == req.identifier) | (models.User.phone == req.identifier)
    ).first()
    
    if user:
        user.status = "active"
        if "email" in req.identifier:
            user.email_verified = True
        db.commit()
        
        access_token = create_access_token({"id": user.id, "role": user.role})
        refresh_token = create_refresh_token({"id": user.id})
        
        # Set HttpOnly Cookies
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax")
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax")
        
        return {
            "message": "Verified successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "place": user.place,
                "role": user.role,
                "worker_type": user.worker_type
            }
        }
    return {"message": "Verified but user not found"}

@router.post("/signin")
@limiter.limit("5/minute")
def signin(request: Request, response: Response, req: SigninRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user or not pwd_context.verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if user.status == "pending_verification":
        raise HTTPException(status_code=403, detail="Account not verified. Please verify OTP.")
        
    if user.two_fa_enabled:
        generate_and_send_otp(db, identifier=user.email, purpose="login_2fa", channel=user.preferred_channel, user_id=user.id)
        return {"requires2FA": True, "message": "OTP sent for 2FA"}
        
    # Standard Login
    access_token = create_access_token({"id": user.id, "role": user.role})
    refresh_token = create_refresh_token({"id": user.id})
    
    # Set HttpOnly Cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax")
    
    return {
        "message": "Sign In successful",
        "user": {
             "id": user.id,
             "name": user.name,
             "email": user.email,
             "place": user.place,
             "role": user.role,
             "worker_type": user.worker_type
         }
    }

class GoogleSigninRequest(BaseModel):
    email: str
    name: str

@router.post("/google")
@limiter.limit("5/minute")
def signin_google(request: Request, response: Response, req: GoogleSigninRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user:
        # Auto-register google users
        user = models.User(
            name=req.name,
            email=req.email,
            phone="G_" + req.email, # Mock unique phone
            password_hash=pwd_context.hash("google_oauth_placeholder"),
            worker_type="salaried",
            status="active",
            email_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token = create_access_token({"id": user.id, "role": user.role})
    refresh_token = create_refresh_token({"id": user.id})
    
    # Set HttpOnly Cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax")
    
    return {
        "message": "Google Sign In successful",
        "user": {
             "id": user.id,
             "name": user.name,
             "email": user.email,
             "place": user.place,
             "role": user.role,
             "worker_type": user.worker_type
         }
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_user_profile(user: models.User = Depends(get_current_user)):
    return {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "worker_type": user.worker_type,
        "two_fa_enabled": user.two_fa_enabled
    }

class ProfileUpdate(BaseModel):
    name: str = None
    phone: str = None
    worker_type: str = None

@router.put("/profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if data.name:
        user.name = data.name
    if data.phone:
        user.phone = data.phone
    if data.worker_type:
        user.worker_type = data.worker_type
    db.commit()
    db.refresh(user)
    return {
        "message": "Profile updated",
        "user": {
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "worker_type": user.worker_type,
            "two_fa_enabled": user.two_fa_enabled
        }
    }
