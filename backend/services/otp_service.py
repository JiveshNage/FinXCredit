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

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_otp(email: str, otp_code: str):
    """
    Real Email Delivery via Brevo SMTP
    """
    print(f"\n[EMAIL OTP] Sending real OTP to {email}")
    
    sender_email = os.getenv("BREVO_SMTP_USER", "a919cd001@smtp-brevo.com")  # Using the Brevo login as sender
    receiver_email = email
    
    message = MIMEMultipart("alternative")
    message["Subject"] = f"Your CreditBridge Verification Code: {otp_code}"
    message["From"] = f"CreditBridge AI <{sender_email}>"
    message["To"] = receiver_email
    
    text = f"Welcome to CreditBridge!\n\nYour verification code is: {otp_code}\n\nThis code is valid for 10 minutes. Do not share this with anyone."
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">CreditBridge Verification</h2>
          <p style="font-size: 16px; margin-bottom: 30px;">Your secure verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
            {otp_code}
          </div>
          <p style="font-size: 14px; color: #64748b;">This code expires in 10 minutes. Please do not share it with anyone.</p>
        </div>
      </body>
    </html>
    """
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)
    
    try:
        # Create secure connection with server and send email
        with smtplib.SMTP("smtp-relay.brevo.com", 587) as server:
            server.starttls()
            smtp_user = os.getenv("BREVO_SMTP_USER")
            smtp_key = os.getenv("BREVO_SMTP_KEY")
            if smtp_user and smtp_key and smtp_key != "YOUR_BREVO_SMTP_KEY_HERE":
                server.login(smtp_user, smtp_key)
            else:
                print("WARNING: Using unauthenticated SMTP. Please set BREVO_SMTP_KEY in .env")
            server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"Successfully sent OTP to {email}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

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
