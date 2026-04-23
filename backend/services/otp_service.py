import secrets
import random
import os
import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Config from env
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "3"))

def generate_otp_code():
    """Generates a secure 6-digit OTP code."""
    # secrets.randbelow is cryptographically secure
    # Add 100000 to ensure it's always 6 digits (if randbelow gives < 100000, 
    # it could be up to 899999 + 100000 = 999999)
    return str(secrets.randbelow(900000) + 100000)

def hash_otp(otp_code: str):
    return pwd_context.hash(otp_code)

def verify_otp_hash(plain_otp: str, hashed_otp: str):
    return pwd_context.verify(plain_otp, hashed_otp)

def send_email_otp(email: str, otp_code: str):
    """
    Mock Email Delivery via SendGrid or SMTP
    In production, use Sendgrid/AWS SES.
    """
    print(f"\n[EMAIL OTP SIMULATION] Sending OTP to {email}")
    print(f"Subject: Your CreditBridge Verification Code: {otp_code}")
    print(f"Body: Use {otp_code} to verify your action. Expires in 10 minutes.\n")
    return True

def send_sms_otp(phone: str, otp_code: str):
    """
    Mock SMS Delivery via Twilio/MSG91
    """
    print(f"\n[SMS OTP SIMULATION] Sending OTP to {phone}")
    print(f"Message: Your CreditBridge OTP is: {otp_code}. Valid for 10 mins. Do NOT share with anyone.\n")
    return True

def generate_and_send_otp(db: Session, identifier: str, purpose: str, channel: str="email", user_id: str=None):
    """
    Creates an OTP record and sends it via selected channel.
    Invalidates any previous pending OTP for this purpose.
    """
    # Invalidate previous unused ones
    db.query(models.OtpRecord).filter(
        models.OtpRecord.identifier == identifier,
        models.OtpRecord.purpose == purpose,
        models.OtpRecord.is_used == False
    ).update({"is_used": True})
    
    otp_code = generate_otp_code()
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    new_otp = models.OtpRecord(
        user_id=user_id,
        identifier=identifier,
        otp_hash=hash_otp(otp_code),
        purpose=purpose,
        channel=channel,
        expires_at=expiration
    )
    
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)
    
    # Send
    if channel == "sms":
        send_sms_otp(identifier, otp_code)
    else:  # email fallback or default
        send_email_otp(identifier, otp_code)
        
    return {"message": f"OTP sent to {channel}", "expires_in": OTP_EXPIRY_MINUTES * 60}

def verify_otp(db: Session, identifier: str, purpose: str, plain_otp: str):
    """
    Validates an OTP submitted by the user.
    """
    # Fetch latest active OTP for this identifier + purpose
    otp_record = db.query(models.OtpRecord).filter(
        models.OtpRecord.identifier == identifier,
        models.OtpRecord.purpose == purpose,
        models.OtpRecord.is_used == False
    ).order_by(models.OtpRecord.created_at.desc()).first()
    
    if not otp_record:
        return False, "OTP not found or already used."
        
    if otp_record.expires_at < datetime.datetime.utcnow():
        return False, "Code expired. Please request a new one."
        
    if otp_record.attempts >= OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        db.commit()
        return False, "Too many wrong attempts. Please resend."
        
    if not verify_otp_hash(plain_otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()
        return False, f"Incorrect code. {OTP_MAX_ATTEMPTS - otp_record.attempts} attempts remaining."
        
    # Success
    otp_record.is_used = True
    db.commit()
    return True, "Verified Successfully."
