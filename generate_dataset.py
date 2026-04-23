import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)
num_records = 200000

# ============================================================
# PAN-INDIA CITY TIER SYSTEM
# Instead of individual city names (which don't scale),
# we use economic tiers that capture the real signal:
# cost of living, digital infrastructure, financial inclusion
# ============================================================

city_tiers = {
    'Tier_1': {
        'cities': [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
            'Kolkata', 'Pune', 'Ahmedabad'
        ],
        'income_multiplier': 1.5,    # Higher cost of living = higher nominal income
        'digital_boost': 0.15,       # Better digital infrastructure
        'weight': 0.20               # 20% of dataset
    },
    'Tier_2': {
        'cities': [
            'Raipur', 'Lucknow', 'Jaipur', 'Indore', 'Bhopal',
            'Nagpur', 'Patna', 'Chandigarh', 'Coimbatore', 'Kochi',
            'Visakhapatnam', 'Guwahati', 'Bhubaneswar', 'Dehradun',
            'Ranchi', 'Thiruvananthapuram'
        ],
        'income_multiplier': 1.0,    # Baseline
        'digital_boost': 0.0,
        'weight': 0.35               # 35% of dataset
    },
    'Tier_3': {
        'cities': [
            'Bilaspur', 'Korba', 'Durg', 'Bhilai', 'Ratlam',
            'Satna', 'Siliguri', 'Dhanbad', 'Udaipur', 'Nanded',
            'Mathura', 'Shimla', 'Agartala', 'Imphal'
        ],
        'income_multiplier': 0.8,    # Lower cost of living
        'digital_boost': -0.10,      # Less digital infra
        'weight': 0.25               # 25% of dataset
    },
    'Rural': {
        'cities': [
            'Rural_CG', 'Rural_UP', 'Rural_MP', 'Rural_RJ',
            'Rural_MH', 'Rural_Bihar', 'Rural_WB', 'Rural_TN',
            'Rural_AP', 'Rural_KA'
        ],
        'income_multiplier': 0.6,    # Lowest nominal income
        'digital_boost': -0.20,      # Cash-heavy economy
        'weight': 0.20               # 20% of dataset
    }
}

# Map city to state for additional geographic signal
city_to_state = {
    'Mumbai': 'Maharashtra', 'Delhi': 'Delhi', 'Bangalore': 'Karnataka',
    'Hyderabad': 'Telangana', 'Chennai': 'Tamil Nadu', 'Kolkata': 'West Bengal',
    'Pune': 'Maharashtra', 'Ahmedabad': 'Gujarat', 'Raipur': 'Chhattisgarh',
    'Lucknow': 'Uttar Pradesh', 'Jaipur': 'Rajasthan', 'Indore': 'Madhya Pradesh',
    'Bhopal': 'Madhya Pradesh', 'Nagpur': 'Maharashtra', 'Patna': 'Bihar',
    'Chandigarh': 'Chandigarh', 'Coimbatore': 'Tamil Nadu', 'Kochi': 'Kerala',
    'Visakhapatnam': 'Andhra Pradesh', 'Guwahati': 'Assam',
    'Bhubaneswar': 'Odisha', 'Dehradun': 'Uttarakhand', 'Ranchi': 'Jharkhand',
    'Thiruvananthapuram': 'Kerala', 'Bilaspur': 'Chhattisgarh',
    'Korba': 'Chhattisgarh', 'Durg': 'Chhattisgarh', 'Bhilai': 'Chhattisgarh',
    'Ratlam': 'Madhya Pradesh', 'Satna': 'Madhya Pradesh', 'Siliguri': 'West Bengal',
    'Dhanbad': 'Jharkhand', 'Udaipur': 'Rajasthan', 'Nanded': 'Maharashtra',
    'Mathura': 'Uttar Pradesh', 'Shimla': 'Himachal Pradesh',
    'Agartala': 'Tripura', 'Imphal': 'Manipur',
    'Rural_CG': 'Chhattisgarh', 'Rural_UP': 'Uttar Pradesh',
    'Rural_MP': 'Madhya Pradesh', 'Rural_RJ': 'Rajasthan',
    'Rural_MH': 'Maharashtra', 'Rural_Bihar': 'Bihar',
    'Rural_WB': 'West Bengal', 'Rural_TN': 'Tamil Nadu',
    'Rural_AP': 'Andhra Pradesh', 'Rural_KA': 'Karnataka'
}

# ============================================================
# EXPANDED JOB TYPES (India's informal economy)
# ============================================================

job_types = [
    'Auto Driver', 'Delivery Partner', 'Freelancer', 'Shop Owner',
    'Street Vendor', 'Domestic Worker', 'Construction Worker',
    'Farmer', 'Tailor', 'Electrician/Plumber'
]

job_weights = [0.12, 0.15, 0.10, 0.10, 0.13, 0.10, 0.10, 0.08, 0.06, 0.06]

# Job specific parameters (base income, std, expense ratio, volatility)
job_params = {
    'Auto Driver':          {'inc_mean': 18000, 'inc_std': 4000,  'exp_ratio': 0.65, 'volatility_mean': 0.30},
    'Delivery Partner':     {'inc_mean': 22000, 'inc_std': 5000,  'exp_ratio': 0.60, 'volatility_mean': 0.40},
    'Freelancer':           {'inc_mean': 25000, 'inc_std': 10000, 'exp_ratio': 0.50, 'volatility_mean': 0.60},
    'Shop Owner':           {'inc_mean': 35000, 'inc_std': 12000, 'exp_ratio': 0.75, 'volatility_mean': 0.10},
    'Street Vendor':        {'inc_mean': 15000, 'inc_std': 3500,  'exp_ratio': 0.70, 'volatility_mean': 0.25},
    'Domestic Worker':      {'inc_mean': 12000, 'inc_std': 2500,  'exp_ratio': 0.80, 'volatility_mean': 0.15},
    'Construction Worker':  {'inc_mean': 16000, 'inc_std': 5000,  'exp_ratio': 0.75, 'volatility_mean': 0.50},
    'Farmer':               {'inc_mean': 14000, 'inc_std': 6000,  'exp_ratio': 0.70, 'volatility_mean': 0.70},
    'Tailor':               {'inc_mean': 13000, 'inc_std': 3000,  'exp_ratio': 0.65, 'volatility_mean': 0.20},
    'Electrician/Plumber':  {'inc_mean': 20000, 'inc_std': 5000,  'exp_ratio': 0.60, 'volatility_mean': 0.35},
}

# Digital behavior by job type
job_digital_profile = {
    'Auto Driver':          {'digital_range': (0.40, 0.80), 'txn_mean': 120, 'txn_std': 30,  'latenight_range': (0.05, 0.25)},
    'Delivery Partner':     {'digital_range': (0.70, 0.99), 'txn_mean': 150, 'txn_std': 40,  'latenight_range': (0.20, 0.60)},
    'Freelancer':           {'digital_range': (0.80, 0.99), 'txn_mean': 30,  'txn_std': 15,  'latenight_range': (0.30, 0.80)},
    'Shop Owner':           {'digital_range': (0.50, 0.85), 'txn_mean': 300, 'txn_std': 100, 'latenight_range': (0.00, 0.10)},
    'Street Vendor':        {'digital_range': (0.30, 0.70), 'txn_mean': 200, 'txn_std': 60,  'latenight_range': (0.01, 0.15)},
    'Domestic Worker':      {'digital_range': (0.20, 0.55), 'txn_mean': 15,  'txn_std': 8,   'latenight_range': (0.00, 0.05)},
    'Construction Worker':  {'digital_range': (0.25, 0.60), 'txn_mean': 25,  'txn_std': 12,  'latenight_range': (0.02, 0.15)},
    'Farmer':               {'digital_range': (0.15, 0.50), 'txn_mean': 10,  'txn_std': 5,   'latenight_range': (0.00, 0.05)},
    'Tailor':               {'digital_range': (0.35, 0.70), 'txn_mean': 80,  'txn_std': 30,  'latenight_range': (0.00, 0.10)},
    'Electrician/Plumber':  {'digital_range': (0.40, 0.75), 'txn_mean': 50,  'txn_std': 20,  'latenight_range': (0.05, 0.20)},
}

# ============================================================
# GENERATE RECORDS
# ============================================================

# 1. Assign city tier, city, and state
tier_labels = []
city_names = []
state_names = []

for tier_name, tier_info in city_tiers.items():
    n = int(num_records * tier_info['weight'])
    tier_labels.extend([tier_name] * n)
    selected_cities = np.random.choice(tier_info['cities'], size=n)
    city_names.extend(selected_cities)
    state_names.extend([city_to_state[c] for c in selected_cities])

# Handle rounding (ensure we hit exactly num_records)
remaining = num_records - len(tier_labels)
if remaining > 0:
    tier_labels.extend(['Tier_2'] * remaining)
    extra_cities = np.random.choice(city_tiers['Tier_2']['cities'], size=remaining)
    city_names.extend(extra_cities)
    state_names.extend([city_to_state[c] for c in extra_cities])

# Shuffle
indices = np.random.permutation(num_records)
tier_labels = [tier_labels[i] for i in indices]
city_names = [city_names[i] for i in indices]
state_names = [state_names[i] for i in indices]

# 2. Assign job types
job_assignments = np.random.choice(job_types, size=num_records, p=job_weights)

# 3. Build DataFrame
df = pd.DataFrame({
    'user_id': np.arange(1, num_records + 1),
    'city': city_names,
    'city_tier': tier_labels,
    'state': state_names,
    'job_type': job_assignments.tolist()
})

# 4. Generate features (income adjusted by city tier)
tier_multipliers = {t: info['income_multiplier'] for t, info in city_tiers.items()}
tier_digital_boost = {t: info['digital_boost'] for t, info in city_tiers.items()}

income = []
expenses = []
income_volatility = []
digital_ratio = []
txn_frequency = []
late_night_ratio = []

for idx, row in df.iterrows():
    job = row['job_type']
    tier = row['city_tier']
    params = job_params[job]
    digi_profile = job_digital_profile[job]
    
    multiplier = tier_multipliers[tier]
    d_boost = tier_digital_boost[tier]
    
    # Income: base × tier multiplier + noise
    inc = np.random.normal(params['inc_mean'] * multiplier, params['inc_std'] * multiplier)
    inc = max(3000, inc)  # Minimum realistic income (even rural)
    income.append(inc)
    
    # Expenses
    exp_r = np.random.normal(params['exp_ratio'], 0.1)
    exp_r = np.clip(exp_r, 0.3, 0.95)
    expenses.append(inc * exp_r)
    
    # Income volatility
    vol = np.random.normal(params['volatility_mean'], 0.1)
    income_volatility.append(np.clip(vol, 0.05, 0.95))
    
    # Digital ratio (boosted/reduced by tier)
    d_low, d_high = digi_profile['digital_range']
    d_low_adj = np.clip(d_low + d_boost, 0.05, 0.95)
    d_high_adj = np.clip(d_high + d_boost, 0.10, 0.99)
    digital_ratio.append(np.random.uniform(d_low_adj, d_high_adj))
    
    # Transaction frequency (slightly higher in Tier 1)
    txn_mult = 1.0 + (d_boost * 0.5)  # Tier 1 gets ~7.5% more txns
    txn = int(np.random.normal(digi_profile['txn_mean'] * txn_mult, digi_profile['txn_std']))
    txn_frequency.append(max(2, txn))
    
    # Late night ratio
    ln_low, ln_high = digi_profile['latenight_range']
    late_night_ratio.append(np.random.uniform(ln_low, ln_high))

df['income'] = np.round(income, 2)
df['expenses'] = np.round(expenses, 2)

# Savings with realistic variance (not perfectly income - expenses)
capacity = df['income'] - df['expenses']
df['savings'] = np.round(capacity * np.random.uniform(0.4, 1.3, size=num_records), 2)
df['savings'] = df['savings'].apply(lambda x: max(-5000, x))

df['income_volatility'] = np.round(income_volatility, 2)
df['digital_ratio'] = np.round(digital_ratio, 2)
df['txn_frequency'] = np.clip(txn_frequency, 2, 1000).astype(int)
df['late_night_ratio'] = np.round(late_night_ratio, 2)

# ============================================================
# NEW: RATIO FEATURES (Region-agnostic, scale everywhere)
# These are the KEY to pan-India generalization
# ============================================================

df['savings_ratio'] = np.round(df['savings'] / (df['income'] + 1), 4)
df['expense_ratio'] = np.round(df['expenses'] / (df['income'] + 1), 4)

# Loan amount requested (1x to 5x monthly income)
loan_multipliers = np.random.uniform(1.0, 5.0, size=num_records)
df['loan_amount'] = np.round(df['income'] * loan_multipliers / 1000) * 1000

df['loan_to_income_ratio'] = np.round(df['loan_amount'] / (df['income'] * 12 + 1), 4)

# ============================================================
# PROBABILISTIC DEFAULT CALCULATION
# ============================================================

# Debt-to-Income (higher is riskier)
dti = df['loan_amount'] / (df['income'] * 12 + 1)

# Savings ratio (lower is riskier)
savings_ratio_val = df['savings'] / (df['income'] + 1)

base_risk_score = (dti * 3.0) - (savings_ratio_val * 4.0) + (df['income_volatility'] * 2.5)

# Job profile risk adjustments
job_risk_modifiers = {
    'Auto Driver': 0.2,
    'Delivery Partner': 0.1,
    'Freelancer': 0.5,
    'Shop Owner': -0.4,
    'Street Vendor': 0.3,
    'Domestic Worker': 0.15,
    'Construction Worker': 0.4,
    'Farmer': 0.55,        # High volatility = higher risk
    'Tailor': 0.0,
    'Electrician/Plumber': -0.1,
}
df['job_risk'] = df['job_type'].map(job_risk_modifiers)

# Tier risk adjustment (rural = slightly higher risk due to less financial infra)
tier_risk_modifiers = {
    'Tier_1': -0.3,
    'Tier_2': 0.0,
    'Tier_3': 0.2,
    'Rural': 0.4
}
df['tier_risk'] = df['city_tier'].map(tier_risk_modifiers)

# Final risk: behavioral + job profile + tier + digital adoption + noise
risk_score = (
    base_risk_score 
    + df['job_risk'] 
    + df['tier_risk']
    - (df['digital_ratio'] * 1.5) 
    + np.random.normal(0, 1.5, size=num_records)
)

probability_of_default = 1 / (1 + np.exp(-risk_score))
df['default'] = np.random.binomial(1, probability_of_default)

# Drop hidden columns
df = df.drop(columns=['job_risk', 'tier_risk'])

# ============================================================
# SAVE
# ============================================================

output_path = 'pan_india_loan_dataset.csv'
df.to_csv(output_path, index=False)

print(f"✅ Generated pan-India dataset: {output_path}")
print(f"   Records: {len(df)}")
print(f"   Cities: {df['city'].nunique()} across {df['state'].nunique()} states")
print(f"   Job types: {df['job_type'].nunique()}")
print(f"   City tiers: {df['city_tier'].value_counts().to_dict()}")

# ============================================================
# SANITY CHECK
# ============================================================
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

df_check = df.drop(['user_id', 'city', 'state'], axis=1)  # Drop non-features
df_encoded = pd.get_dummies(df_check, drop_first=True)
X = df_encoded.drop('default', axis=1)
y = df_encoded['default']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(max_depth=3)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\n✅ Sanity Check: Decision Tree Accuracy: {acc*100:.2f}% (Target: 65-80%)")
print("\nDefault Distribution:")
print(df['default'].value_counts(normalize=True))
print("\nDefault Rate by Tier:")
print(df.groupby('city_tier')['default'].mean().round(3))
print("\nDefault Rate by Job Type:")
print(df.groupby('job_type')['default'].mean().round(3).sort_values())
