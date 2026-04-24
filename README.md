# FinXCredit (GigCredit)

FinXCredit is a full-stack, AI-driven loan eligibility and decision-support platform designed specifically for informal and gig workers in India. Traditional credit scoring systems (like CIBIL) often fail to accurately assess the creditworthiness of this demographic. FinXCredit bridges this gap by leveraging alternative data sources and machine learning (XGBoost) to evaluate loan applications fairly and transparently.

## 🚀 Key Features

*   **Multi-Step Onboarding Pipeline:** Seamlessly integrates Know Your Customer (KYC) and Account Aggregator (AA) workflows to fetch and validate user data securely.
*   **AI-Powered Loan Eligibility Engine:** Uses an advanced XGBoost machine learning model trained on localized datasets to assess loan eligibility based on gig-worker-sensitive features.
*   **Secure Authentication & RBAC:** Implements a robust JWT-based authentication system with Role-Based Access Control, ensuring that sensitive financial data and admin features are strictly protected.
*   **Explainable Analytics Dashboard:** Features a premium, dark-mode, glassmorphic UI. Includes a "Credit Simulator" and interactive transaction visualizations (using Recharts) to help users understand their financial standing.
*   **Production-Ready Backend:** Built on FastAPI and PostgreSQL, ensuring high performance, data integrity, and scalability.

## 🛠️ Technology Stack

### Backend
*   **Framework:** FastAPI
*   **Language:** Python 3.x
*   **Database:** PostgreSQL (via SQLAlchemy ORM)
*   **Machine Learning:** Scikit-Learn, XGBoost, Pandas, Numpy, SHAP
*   **Security:** PyJWT, Passlib (bcrypt), python-multipart

### Frontend
*   **Framework:** React 19 (via Vite)
*   **Language:** JavaScript (ES6+)
*   **Styling:** Vanilla CSS (Premium Dark Mode / Glassmorphic UI)
*   **Routing:** React Router DOM
*   **Icons & Animations:** Lucide React, Framer Motion
*   **Charts:** Recharts

## 📁 Project Structure

```
FinXCredit/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # SQLAlchemy database configuration
│   ├── models/              # Database schema definitions
│   ├── routes/              # API endpoints (Auth, Loans, Admin, etc.)
│   ├── services/            # Business logic (ML prediction, OTP, AA, Bureau)
│   ├── utils/               # Helper functions
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── index.html           # HTML entry point
    ├── src/
    │   ├── components/      # Reusable React components (Auth, UI elements)
    │   ├── pages/           # Route views (Dashboard, Simulator, Apply, etc.)
    │   ├── App.jsx          # Root React component
    │   └── index.css        # Global CSS variables and glassmorphism styles
    ├── package.json         # Node dependencies
    └── vite.config.js       # Vite configuration
```

## ⚙️ Setup and Installation

### Prerequisites
*   Python 3.10+
*   Node.js 18+ and npm
*   PostgreSQL (Running locally or via a cloud provider)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd "Major Project"
```

### 2. Backend Setup
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file based on .env.example
# Ensure you set your DATABASE_URL, SECRET_KEY, etc.
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file and set your backend API URL
# VITE_API_URL=http://localhost:8000
```

## ▶️ Running the Application

To run the application locally, you will need two terminal windows.

**Terminal 1: Start the Backend (FastAPI)**
```bash
cd backend
venv\Scripts\activate # (or source venv/bin/activate on Mac/Linux)
uvicorn main:app --reload
```
*The backend API will be available at `http://localhost:8000`*
*API Documentation (Swagger UI) is available at `http://localhost:8000/docs`*

**Terminal 2: Start the Frontend (Vite)**
```bash
cd frontend
npm run dev
```
*The frontend application will be available at `http://localhost:5173`*

## 🧪 Testing & Debugging

For testing and debugging, a dedicated prompt for AI assistants (like Jules or ChatGPT) is recommended to provide context. The prompt outlines the stack, the objectives, and the expected format for code fixes. See the internal documentation or your AI assistant's context history for the specific prompt template.
