from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import SessionLocal, engine

from routes import auth, applications, admin

# Create DB Tables
models.Base.metadata.create_all(bind=engine)

# Seed landing page trust people if none exist
try:
    with SessionLocal() as db:
        existing_people = db.query(models.TrustworthyPerson).count()
        if existing_people == 0:
            db.add_all([
                models.TrustworthyPerson(
                    name="Arjun Patel",
                    role="Delivery Partner",
                    location="Mumbai",
                    quote="No bank would give me a loan because I don't have a salary slip. CreditBridge looked at my UPI transactions and approved ₹50,000 for my new delivery bike in 5 minutes.",
                    rating=5.0,
                    badge="Verified User"
                ),
                models.TrustworthyPerson(
                    name="Meena Devi",
                    role="Street Vendor",
                    location="Delhi",
                    quote="The digital KYC was so easy. I just linked my bank account, and the AI calculated my score instantly. I got the working capital I needed to expand my street food stall.",
                    rating=4.9,
                    badge="Trusted Partner"
                ),
                models.TrustworthyPerson(
                    name="Priya Sharma",
                    role="Freelancer",
                    location="Bangalore",
                    quote="CreditBridge connected me to the right loan without waiting weeks. Their fintech engine made everything transparent and fast.",
                    rating=4.8,
                    badge="Customer Favorite"
                )
            ])
            db.commit()
except Exception as e:
    print(f"Warning: Could not seed trustworthy people (this is fine): {e}")

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter

app = FastAPI(
    title="FinX Credit API",
    description="Full-Stack AI-powered Loan System with OTP Auth & Secure Limiters"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "FinX Credit API is running. See /docs for Swagger UI."}
