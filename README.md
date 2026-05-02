<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/XGBoost-2.0-FF6600?style=for-the-badge&logo=xgboost&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

<h1 align="center">⚡ FinXCredit — CreditBridge AI</h1>

<p align="center">
  <b>AI-Powered Loan Eligibility & Decision-Support Platform for India's Gig & Informal Workers</b>
</p>

<p align="center">
  <i>No CIBIL? No salary slip? No problem. CreditBridge analyzes your digital financial footprint to unlock the credit you deserve.</i>
</p>

---

## 🎯 The Problem

Over **400 million** informal and gig economy workers in India — delivery drivers, freelancers, street vendors, auto-rickshaw drivers — are systematically excluded from formal credit systems. Traditional banks require salary slips, ITR filings, and CIBIL scores that these workers simply don't have, despite demonstrating strong financial discipline through their digital transactions.

**FinXCredit (CreditBridge AI)** bridges this gap by building an intelligent, explainable loan eligibility system that evaluates creditworthiness using **alternative financial data** — UPI transactions, bank statement patterns, savings behavior, and digital footprints.

---

## ✨ Key Features

### 🤖 AI-Powered Credit Scoring Engine
- **XGBoost ML Model** trained on a **100K+ Pan-India dataset** spanning all 28 states and 8 UTs
- **Gig-Worker-Sensitive Weights** — dynamically adjusts scoring parameters (income stability, transaction activity, savings ratio, spending behavior, financial discipline) based on worker type (delivery, freelancer, street vendor, salaried)
- **CIBIL-Equivalent Score Mapping** — internal 0–100 score mapped to standard 300–900 range
- **Fraud & Discrepancy Detection** — flags inconsistencies between declared and verified financials

### 🔐 Secure Authentication System
- **Real OTP Delivery** via Brevo SMTP (production email OTPs, not mock)
- **Firebase Google Sign-In** for seamless social login
- **JWT + Refresh Token** architecture with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — separate User and Admin portals
- **Rate Limiting** via SlowAPI to prevent brute-force attacks

### 📄 KYC & Identity Verification
- **PAN Validation** with regex-based format verification + OCR extraction via Tesseract
- **Aadhaar Verification** with Offline XML parsing and simulated UIDAI ping
- **Hashed PII Storage** — Aadhaar numbers are SHA-256 hashed, never stored raw (RBI compliant)

### 🏦 Account Aggregator (AA) Framework Simulation
- Simulates India's **RBI-regulated Account Aggregator** network (Sahamati/Setu)
- **Pan-India City Tier Classification** — Tier 1 (Mumbai, Delhi, Bangalore) to Tier 3 (Bilaspur, Korba)
- **Bank Statement CSV Parsing** with NLP-based transaction categorization (UPI, Salary, Utilities, Food)
- Generates realistic financial footprints based on worker type and geographic location

### 📊 Explainable Analytics Dashboard
- **Score Breakdown** with 5-factor radar visualization (Income, Transactions, Savings, Spending, Discipline)
- **Personalized Improvement Tips** — actionable advice with predicted score impact
- **Credit Simulator** — interactive "what-if" tool to model different financial scenarios
- **Transaction History Visualization** using Recharts

### 🛡️ Admin Operations Portal
- **Real-time Dashboard** with platform statistics and KPIs
- **Application Review** with detailed financial breakdown per user
- **Fraud Alert Monitoring** and user management
- **Loan Fulfillment Tracking** — end-to-end disbursement pipeline

### 🎨 Premium UI/UX
- **Dark-mode Glassmorphic Design** with floating 3D elements and animated orbs
- **Framer Motion Animations** — page transitions, hover effects, floating credit card mockup
- **Live Activity Ticker** on landing page showing real-time loan approvals
- **Mobile-responsive** layout with hamburger navigation
- **Trusted Customer Stories** dynamically loaded from the backend

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.110.0 | High-performance async REST API framework |
| **Python** | 3.10+ | Core business logic and ML pipeline |
| **PostgreSQL** | 16+ | Persistent relational database |
| **SQLAlchemy** | 2.0+ | ORM with 11 relational models |
| **XGBoost** | 2.0.3 | Gradient boosting classifier for credit risk |
| **Scikit-Learn** | 1.4.1 | Preprocessing pipeline (StandardScaler, OneHotEncoder) |
| **SHAP** | 0.45+ | Model explainability and feature importance |
| **Firebase Admin SDK** | 6.5+ | Google Sign-In token verification |
| **Pytesseract + OpenCV** | Latest | OCR-based PAN card extraction |
| **Passlib + bcrypt** | Latest | Password & OTP hashing |
| **python-jose** | 3.3+ | JWT token creation and validation |
| **SlowAPI** | 0.1.9 | API rate limiting |
| **Brevo SMTP** | — | Production email OTP delivery |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.4 | Component-based SPA framework |
| **Vite** | 8.0.4 | Lightning-fast build tool and dev server |
| **React Router DOM** | 7.14.0 | Client-side routing with protected routes |
| **Framer Motion** | 12.38.0 | Smooth animations and page transitions |
| **Recharts** | 3.8.1 | Interactive financial data visualizations |
| **Lucide React** | 1.8.0 | Premium SVG icon library |
| **Firebase SDK** | 12.12.1 | Google OAuth client integration |
| **Vanilla CSS** | — | Custom dark-mode glassmorphic design system |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| **Render** | Cloud deployment (Backend + Frontend static) |
| **Git** | Version control |
| **Uvicorn** | ASGI server for FastAPI |
| **ESLint** | Frontend code quality |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19 + Vite)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Landing  │ │  Auth    │ │  User    │ │   Admin Portal     │  │
│  │  Page    │ │ (Login/  │ │Dashboard │ │ (Stats, Reviews,   │  │
│  │          │ │ Signup)  │ │Simulator │ │  Fraud Alerts)     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
│                    │ Firebase Auth │ JWT Tokens                  │
└────────────────────┼───────────────┼────────────────────────────┘
                     │               │
                     ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (FastAPI)                          │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────────────┐ │
│  │ Auth     │ │ Applications │ │ Admin                        │ │
│  │ Router   │ │ Router       │ │ Router                       │ │
│  │ /api/auth│ │ /api/apps    │ │ /api/admin                   │ │
│  └────┬─────┘ └──────┬───────┘ └──────────────┬───────────────┘ │
│       │              │                         │                 │
│  ┌────▼─────┐ ┌──────▼───────┐ ┌──────────────▼───────────────┐ │
│  │OTP       │ │ Scoring      │ │ Dashboard                    │ │
│  │Service   │ │ Engine       │ │ Analytics                    │ │
│  │KYC       │ │ AA Service   │ │ Fraud Detection              │ │
│  │Service   │ │ Bureau       │ │ User Management              │ │
│  └────┬─────┘ └──────┬───────┘ └──────────────┬───────────────┘ │
└───────┼──────────────┼────────────────────────┼─────────────────┘
        │              │                         │
        ▼              ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   PostgreSQL     │  │  XGBoost Model   │  │  Brevo SMTP   │  │
│  │  (11 Tables)     │  │  (loan_model.pkl)│  │  (Email OTP)  │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
FinXCredit/
├── backend/
│   ├── main.py                    # FastAPI app entry point + DB seeding
│   ├── database.py                # SQLAlchemy engine & session config
│   ├── models.py                  # 11 database models (User, LoanApplication, OTP, KYC, etc.)
│   ├── config.py                  # Environment variable configuration
│   ├── routes/
│   │   ├── auth.py                # Signup, Login, OTP verification, Google Sign-In
│   │   ├── applications.py        # Loan simulation, KYC, AA integration, results
│   │   └── admin.py               # Admin dashboard, stats, fraud alerts
│   ├── services/
│   │   ├── scoring_engine.py      # 5-factor heuristic credit scoring + fraud detection
│   │   ├── aa_service.py          # Account Aggregator simulation + CSV parser
│   │   ├── kyc_service.py         # PAN/Aadhaar validation, OCR, XML parsing
│   │   ├── otp_service.py         # Secure OTP generation, hashing & email delivery
│   │   ├── notification_service.py # Notification logging
│   │   └── bureau_service.py      # Credit bureau simulation
│   ├── utils/
│   │   ├── jwt_utils.py           # JWT creation, validation & refresh logic
│   │   └── limiter.py             # SlowAPI rate limiter config
│   ├── ml_models/                 # Trained XGBoost pipeline (.pkl)
│   ├── train_model.py             # ML training script (Pan-India dataset)
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Environment variable template
│
├── frontend/
│   ├── index.html                 # HTML entry point
│   ├── vite.config.js             # Vite configuration
│   ├── src/
│   │   ├── App.jsx                # Root component with routing & RBAC
│   │   ├── main.jsx               # React DOM entry
│   │   ├── firebase.js            # Firebase client SDK initialization
│   │   ├── config.js              # API base URL configuration
│   │   ├── index.css              # Global CSS design system (glassmorphism)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # React Context for auth state management
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Premium animated landing page
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx      # Login with OTP + Google Sign-In
│   │   │   │   └── Signup.jsx     # Multi-step signup with OTP verification
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx  # Personalized financial dashboard
│   │   │   │   ├── Apply.jsx      # Multi-step loan application wizard
│   │   │   │   ├── Results.jsx    # AI decision results with explainability
│   │   │   │   ├── Simulator.jsx  # Interactive credit score simulator
│   │   │   │   ├── Eligibility.jsx # Eligibility check interface
│   │   │   │   ├── Profile.jsx    # User profile management
│   │   │   │   ├── History.jsx    # Loan application history
│   │   │   │   ├── Tips.jsx       # AI-generated financial improvement tips
│   │   │   │   ├── LoanApply.jsx  # Loan request submission
│   │   │   │   └── Notifications.jsx # Notification center
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx  # Admin overview with stats
│   │   │       └── AdminAppDetails.jsx # Detailed application review
│   │   └── components/
│   │       ├── ConsentScreen.jsx       # AA consent flow
│   │       ├── DecisionDashboard.jsx   # Score visualization
│   │       ├── LoanApplicationForm.jsx # Application form component
│   │       ├── auth/
│   │       │   └── OtpInput.jsx        # 6-digit OTP input component
│   │       └── user/
│   │           └── ScoreMeter.jsx      # Animated credit score gauge
│   └── package.json
│
├── pan_india_loan_dataset.csv     # 100K+ training records across India
├── generate_dataset.py            # Dataset generation script
├── render.yaml                    # Render.com deployment blueprint
├── Project_Report.md              # Academic project report
└── .gitignore
```

---

## 🧠 ML Model Details

### Training Pipeline
- **Dataset**: 100,000+ synthetic records representing Pan-India financial profiles across 28 states, multiple city tiers (Tier 1/2/3), and 5 worker categories
- **Algorithm**: XGBoost Gradient Boosting Classifier with 150 estimators, max depth 4, learning rate 0.1
- **Preprocessing**: StandardScaler for numerical features + OneHotEncoder for categorical features (city_tier, job_type), with `handle_unknown='ignore'` for production safety
- **Key Features**: income, expenses, savings, loan_amount, txn_frequency, digital_ratio, income_volatility, savings_ratio, expense_ratio, loan_to_income_ratio

### Scoring Engine (5-Factor Heuristic)
| Factor | Weight (Gig) | Weight (Salaried) |
|---|---|---|
| Income Stability | 15% | 30% |
| Transaction Activity | 35% | 20% |
| Savings Ratio | 20% | 20% |
| Spending Behavior | 15% | 15% |
| Financial Discipline | 15% | 15% |

> Gig workers are evaluated with **2.3× more weight on transaction activity** than salaried workers — because consistent transactions are a stronger creditworthiness signal than volatile income for this demographic.

### Decision Thresholds
| Score Range | Decision | Risk Level | Loan Range |
|---|---|---|---|
| ≥ 80 | ✅ Approved | Low Risk | ₹1,00,000 – ₹5,00,000 |
| 60 – 79 | ⚠️ Medium Risk | Medium Risk | ₹10,000 – ₹50,000 |
| < 60 | ❌ Rejected | High Risk | Not eligible currently |

---

## 🗄️ Database Schema

11 interconnected tables built with SQLAlchemy ORM:

| Model | Purpose |
|---|---|
| `User` | Core user profile with KYC flags, RBAC roles, and OTP state |
| `LoanApplicationDB` | Complete application with financial inputs, AI scores, and fraud flags |
| `LoanFulfillment` | Loan disbursement tracking (amount, tenure, purpose, status) |
| `OtpRecord` | Secure OTP storage with bcrypt hashing, expiry, and attempt limits |
| `ConsentLog` | RBI-compliant consent audit trail for data access |
| `BankStatement` | Parsed bank statement data with verified financials |
| `BankTransaction` | Individual transaction records (CREDIT/DEBIT with categories) |
| `AadhaarData` | Hashed Aadhaar data for identity verification |
| `PanData` | PAN card verification records |
| `TrustworthyPerson` | Landing page testimonial data (seeded from backend) |
| `NotificationLog` | Email/SMS delivery audit log |
| `RefreshToken` | JWT refresh token management |

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL (local or cloud — Supabase, Neon, Render, etc.)

### 1. Clone the Repository
```bash
git clone https://github.com/JiveshNage/FinXCredit.git
cd FinXCredit
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure environment variables** — copy `.env.example` to `.env` and fill in:
```env
DATABASE_URL=postgresql://user:password@host:5432/finx_db
JWT_SECRET_KEY=your-secret-key
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_KEY=your-brevo-smtp-key
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure API URL
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 4. Train the ML Model (Optional)
```bash
cd ../backend
python train_model.py
```
This trains the XGBoost model on the Pan-India dataset and saves the pipeline to `ml_models/loan_model.pkl`.

---

## ▶️ Running the Application

Open **two terminal windows**:

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
venv\Scripts\activate        # or: source venv/bin/activate
uvicorn main:app --reload
```
> 🌐 API: `http://localhost:8000` &nbsp;|&nbsp; 📖 Swagger Docs: `http://localhost:8000/docs`

**Terminal 2 — Frontend (Vite):**
```bash
cd frontend
npm run dev
```
> 🌐 App: `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup/initiate` | Start signup with OTP delivery |
| `POST` | `/api/auth/signup/verify-otp` | Verify OTP and complete registration |
| `POST` | `/api/auth/signin` | Login with email + password |
| `POST` | `/api/auth/google` | Firebase Google Sign-In |

### Loan Applications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/applications/simulate` | Run AI credit scoring simulation |
| `POST` | `/api/applications/verify/pan` | PAN card verification |
| `POST` | `/api/applications/verify/aadhaar` | Aadhaar verification with OTP |
| `POST` | `/api/applications/kyc-submit` | Submit complete KYC package |
| `GET` | `/api/applications/trustworthy-people` | Fetch landing page testimonials |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide statistics |
| `GET` | `/api/admin/users` | All registered users |
| `GET` | `/api/admin/applications` | All loan applications |
| `GET` | `/api/admin/fraud-alerts` | Flagged applications |

---

## 🚀 Deployment

The project includes a `render.yaml` blueprint for one-click deployment to [Render](https://render.com):

```yaml
# Backend: Python web service (Uvicorn)
# Frontend: Static site (Vite build output)
```

```bash
# Production build (frontend)
cd frontend && npm run build
```

---

## 👥 Authors

- **Jivesh Nage** — Full-Stack Development, ML Engineering, System Design

---

## 📄 License

This project is developed for academic and demonstration purposes. All rights reserved.

---

<p align="center">
  <b>Built with ❤️ for India's 400M+ informal workers who deserve fair credit access.</b>
</p>
