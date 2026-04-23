import time
import random

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
    
    return {
        "verified_income": final_income,
        "verified_expenses": final_expenses,
        "verified_savings": final_savings,
        "upi_transactions": digital_adoption,
        "bill_regularity": bill_profile,
        "is_aa_verified": True,  # Critical flag mapping to Compliance Law
        # Pan-India ML features
        "city_tier": city_tier,
        "digital_ratio": round(digital_ratio, 2),
        "income_volatility": round(income_vol, 2),
        "late_night_ratio": late_night,
    }
