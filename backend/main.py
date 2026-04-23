from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine

from routes import auth, applications, admin

# Create DB Tables
models.Base.metadata.create_all(bind=engine)

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
