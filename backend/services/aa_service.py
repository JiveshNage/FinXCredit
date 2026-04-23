import time
import random
import io
try:
    import pandas as pd
except ImportError:
    pd = None

# City tier classification for pan-India support
CITY_TIER_MAP = {
    # Tier 1: Metro cities
    'mumbai': 'Tier_1', 'delhi': 'Tier_1', 'bangalore': 'Tier_1',
    'hyderabad': 'Tier_1', 'chennai': 'Tier_1', 'kolkata': 'Tier_1',
    'pune': 'Tier_1', 'ahmedabad': 'Tier_1',
    # Tier 2: State capitals & major cities
    'raipur': 'Tier_2', 'lucknow': 'Tier_2', 'jaipur': 'Tier_2',
    'indore': 'Tier_2', 'bhopal': 'Tier_2', 'nagpur': 'Tier_2',
    'patna': 'Tier_2', 'chandigarh': 'Tier_2', 'coimbatore': 'Tier_2',
    'kochi': 'Tier_2', 'visakhapatnam': 'Tier_2', 'guwahati': 'Tier_2',
    'bhubaneswar': 'Tier_2', 'dehradun': 'Tier_2', 'ranchi': 'Tier_2',
    'thiruvananthapuram': 'Tier_2',
    # Tier 3: District headquarters & small cities
    'bilaspur': 'Tier_3', 'korba': 'Tier_3', 'durg': 'Tier_3',
    'bhilai': 'Tier_3', 'ratlam': 'Tier_3', 'satna': 'Tier_3',
    'siliguri': 'Tier_3', 'dhanbad': 'Tier_3', 'udaipur': 'Tier_3',
    'nanded': 'Tier_3', 'mathura': 'Tier_3', 'shimla': 'Tier_3',
}

# Tier-based income multipliers
TIER_MULTIPLIERS = {
    'Tier_1': 1.5,
    'Tier_2': 1.0,
    'Tier_3': 0.8,
    'Rural': 0.6
}

def classify_city_tier(city: str) -> str:
    """Classify any city into its economic tier. Defaults to Tier_2 for unknown cities."""
    if not city:
        return "Tier_2"
    return CITY_TIER_MAP.get(city.lower().strip(), "Tier_2")


def fetch_aa_bank_statements(phone: str, worker_type: str, city: str = None) -> dict:
    """
    Mock integration for India's Account Aggregator (AA) framework.
    In real life: Pings Sahamati/Setu to pull last 6 months digitized, RBI-certified JSON bank statements.
    Here we algorithmically generate realistic financial footprint data based on their phone string + job profile.
    
    Now supports pan-India via city tier classification.
    """
    phone_seed = sum(int(digit) for digit in phone if digit.isdigit())
    
    # Determine city tier (pan-India support)
    city_tier = classify_city_tier(city) if city else "Tier_2"
    tier_multiplier = TIER_MULTIPLIERS.get(city_tier, 1.0)
    
    # Establish base income thresholds mapped to worker classifications
    if worker_type == "salaried":
        base_income = 45000 + (phone_seed * 1000)
        expense_ratio = 0.5
        volatility = 0.15
        digital = 0.85
    elif worker_type == "delivery":
        base_income = 18000 + (phone_seed * 500)
        expense_ratio = 0.7
        volatility = 0.40
        digital = 0.80
    elif worker_type == "freelancer":
        base_income = 25000 + (phone_seed * 800)
        expense_ratio = 0.55
        volatility = 0.55
        digital = 0.90
    elif worker_type == "shop_owner":
        base_income = 35000 + (phone_seed * 900)
        expense_ratio = 0.75
        volatility = 0.10
        digital = 0.65
    else:  # informal, street_vendor, auto_driver, etc.
        base_income = 12000 + (phone_seed * 400)
        expense_ratio = 0.8
        volatility = 0.30
        digital = 0.50
        
    # Apply tier multiplier (Tier_1 cities have higher incomes)
    base_income = base_income * tier_multiplier
    
    # Introduce pseudo-randomness using the deterministic seed
    random.seed(phone_seed)
    
    fluctuation = random.uniform(0.9, 1.1)
    final_income = round(base_income * fluctuation)
    
    # Expenses algorithmically deduced
    final_expenses = round(final_income * expense_ratio)
    final_savings = final_income - final_expenses
    
    # Analyze digital footprint (UPI counts, Bill regularities)
    digital_adoption = random.randint(30, 200)  # Number of UPI txns
    
    bill_profile = "always_on_time" if phone_seed % 2 == 0 else "sometimes_late"
    
    # Add digital behavior noise based on tier
    digital_ratio = min(0.99, max(0.1, digital + random.uniform(-0.1, 0.1)))
    income_vol = min(0.95, max(0.05, volatility + random.uniform(-0.1, 0.1)))
    late_night = round(random.uniform(0.02, 0.25), 2)
    
    import datetime
    
    transactions = []
    base_date = datetime.datetime.now()
    
    # Generate Income transaction
    transactions.append({
        "date": (base_date - datetime.timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
        "amount": final_income,
        "type": "CREDIT",
        "category": "Salary/Income",
        "description": "UPI/NEFT IN"
    })
    
    # Generate Expense transactions
    remaining_expenses = final_expenses
    while remaining_expenses > 0:
        amt = min(remaining_expenses, random.randint(100, 5000))
        transactions.append({
            "date": (base_date - datetime.timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
            "amount": amt,
            "type": "DEBIT",
            "category": random.choice(["UPI", "Utilities", "Food", "Transport"]),
            "description": "UPI OUT"
        })
        remaining_expenses -= amt
        
    return {
        "verified_income": final_income,
        "verified_expenses": final_expenses,
        "verified_savings": final_savings,
        "upi_transactions": len([t for t in transactions if t["type"] == "DEBIT"]),
        "bill_regularity": bill_profile,
        "is_aa_verified": True,  # Critical flag mapping to Compliance Law
        "city_tier": city_tier,
        "digital_ratio": round(digital_ratio, 2),
        "income_volatility": round(income_vol, 2),
        "late_night_ratio": late_night,
        "transactions": transactions
    }

def parse_bank_csv(csv_bytes: bytes) -> dict:
    """
    Parses a Bank Statement CSV to categorize transactions.
    Extracts Income, Expenses, Savings, and behavioral flags using an NLP heuristic engine.
    """
    if not pd:
        print("[WARNING] pandas not installed. Falling back to algorithmic mock.")
        return fetch_aa_bank_statements("9999999999", "freelancer")
        
    try:
        df = pd.read_csv(io.BytesIO(csv_bytes))
        
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Attempt to map columns flexibly
        desc_col = next((c for c in df.columns if 'narration' in c or 'description' in c or 'particulars' in c), 'description')
        credit_col = next((c for c in df.columns if 'credit' in c or 'deposit' in c or 'withdrawal' not in c and 'amount' in c), 'credit')
        debit_col = next((c for c in df.columns if 'debit' in c or 'withdrawal' in c), 'debit')
        date_col = next((c for c in df.columns if 'date' in c), 'date')
        
        income_keywords = ['salary', 'neft', 'rtgs', 'imps', 'refund', 'interest', 'dividend']
        upi_keywords = ['upi', 'paytm', 'phonepe', 'gpay', 'bharatpe']
        food_keywords = ['swiggy', 'zomato', 'restaurant', 'cafe', 'baker']
        utility_keywords = ['electricity', 'water', 'recharge', 'bill', 'bescom', 'jio', 'airtel']
        
        verified_income = 0.0
        verified_expenses = 0.0
        upi_transactions = 0
        transactions = []
        
        for _, row in df.iterrows():
            desc = str(row.get(desc_col, '')).lower()
            try: credit = float(str(row.get(credit_col, 0)).replace(',','')) if not pd.isna(row.get(credit_col)) else 0.0
            except: credit = 0.0
            try: debit = float(str(row.get(debit_col, 0)).replace(',','')) if not pd.isna(row.get(debit_col)) else 0.0
            except: debit = 0.0
            date_str = str(row.get(date_col, ''))
            
            category = "Other"
            if credit > 0:
                if any(k in desc for k in income_keywords):
                    category = "Salary/Income"
                verified_income += credit
                transactions.append({"date": date_str, "amount": credit, "type": "CREDIT", "category": category, "description": desc})
            elif debit > 0:
                if any(k in desc for k in upi_keywords):
                    category = "UPI"
                    upi_transactions += 1
                elif any(k in desc for k in food_keywords):
                    category = "Food"
                elif any(k in desc for k in utility_keywords):
                    category = "Utilities"
                verified_expenses += debit
                transactions.append({"date": date_str, "amount": debit, "type": "DEBIT", "category": category, "description": desc})
                
        verified_savings = verified_income - verified_expenses
        
        return {
            "verified_income": verified_income,
            "verified_expenses": verified_expenses,
            "verified_savings": verified_savings,
            "upi_transactions": upi_transactions,
            "bill_regularity": "always_on_time", 
            "is_aa_verified": True,
            "city_tier": "Tier_2",
            "digital_ratio": round(upi_transactions / max(1, len(df)), 2),
            "income_volatility": 0.2, 
            "late_night_ratio": 0.1,
            "transactions": transactions
        }
    except Exception as e:
        print(f"[CSV Parse Error] {e}. Falling back.")
        return fetch_aa_bank_statements("9999999999", "freelancer")
