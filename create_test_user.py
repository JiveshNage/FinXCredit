from backend.database import SessionLocal
from backend.models import User
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

# Check if user already exists
existing = db.query(User).filter(User.email == "demo@finx.com").first()

if existing:
    print("ℹ️ Demo user already exists.")
else:
    test_user = User(
        name="Test Demo User",
        email="demo@finx.com",
        phone="9876543210",
        password_hash=pwd_context.hash("demo123"),
        worker_type="delivery",
        role="user",
        kyc_verified=True,
        email_verified=True,
        phone_verified=True,
        status="active"
    )

    try:
        db.add(test_user)
        db.commit()
        print("✅ Successfully created Demo User!")
        print("📧 Email: demo@finx.com")
        print("🔑 Password: demo123")
    except Exception as e:
        print(f"❌ Error creating user: {e}")
    finally:
        db.close()
