import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)
num_records = 20000

# Base Data Definitions
cities = ['Raipur', 'Bhilai', 'Durg', 'Bilaspur', 'Korba']
job_types = ['Auto Driver', 'Delivery Partner', 'Freelancer', 'Shop Owner', 'Street Vendor']

# Generate random cities and job types
df = pd.DataFrame({
    'user_id': np.arange(1, num_records + 1),
    'city': np.random.choice(cities, size=num_records, p=[0.3, 0.2, 0.2, 0.2, 0.1]),
    'job_type': np.random.choice(job_types, size=num_records, p=[0.2, 0.25, 0.15, 0.15, 0.25])
})

# Job specific parameters (Income mean, Income std, Expense ratio mean)
job_params = {
    'Auto Driver': {'inc_mean': 18000, 'inc_std': 4000, 'exp_ratio': 0.65, 'volatility_mean': 0.3},
    'Delivery Partner': {'inc_mean': 22000, 'inc_std': 5000, 'exp_ratio': 0.60, 'volatility_mean': 0.4},
    'Freelancer': {'inc_mean': 25000, 'inc_std': 10000, 'exp_ratio': 0.50, 'volatility_mean': 0.6},
    'Shop Owner': {'inc_mean': 35000, 'inc_std': 12000, 'exp_ratio': 0.75, 'volatility_mean': 0.1},
    'Street Vendor': {'inc_mean': 15000, 'inc_std': 3500, 'exp_ratio': 0.70, 'volatility_mean': 0.25}
}

# Generate numerical features vectorized
income = []
expenses = []
income_volatility = []
digital_ratio = []
txn_frequency = []
late_night_ratio = []

for job in df['job_type']:
    params = job_params[job]
    
    # Income
    inc = np.random.normal(params['inc_mean'], params['inc_std'])
    inc = max(5000, inc) # Minimum realistic income
    income.append(inc)
    
    # Expenses with random variation
    exp_r = np.random.normal(params['exp_ratio'], 0.1)
    exp_r = np.clip(exp_r, 0.3, 0.95)
    expenses.append(inc * exp_r)
    
    # Volatility
    vol = np.random.normal(params['volatility_mean'], 0.1)
    income_volatility.append(np.clip(vol, 0.05, 0.95))
    
    # Specific trait logic
    if job == 'Delivery Partner':
        digital_ratio.append(np.random.uniform(0.7, 0.99))
        txn_frequency.append(int(np.random.normal(150, 40)))
        late_night_ratio.append(np.random.uniform(0.2, 0.6))
    elif job == 'Street Vendor':
        digital_ratio.append(np.random.uniform(0.3, 0.7))
        txn_frequency.append(int(np.random.normal(200, 60)))
        late_night_ratio.append(np.random.uniform(0.01, 0.15))
    elif job == 'Freelancer':
        digital_ratio.append(np.random.uniform(0.8, 0.99))
        txn_frequency.append(int(np.random.normal(30, 15)))
        late_night_ratio.append(np.random.uniform(0.3, 0.8))
    elif job == 'Shop Owner':
        digital_ratio.append(np.random.uniform(0.5, 0.85))
        txn_frequency.append(int(np.random.normal(300, 100)))
        late_night_ratio.append(np.random.uniform(0.0, 0.1))
    else: # Auto Driver
        digital_ratio.append(np.random.uniform(0.4, 0.8))
        txn_frequency.append(int(np.random.normal(120, 30)))
        late_night_ratio.append(np.random.uniform(0.05, 0.25))

df['income'] = np.round(income, 2)
df['expenses'] = np.round(expenses, 2)

# Introduce realistic variance to Savings (Breaking Perfect collinearity)
# Actual capacity = income - expenses, but recorded savings vary due to cash usage, family emergencies, etc.
capacity = df['income'] - df['expenses']
df['savings'] = np.round(capacity * np.random.uniform(0.4, 1.3, size=num_records), 2)

# Ensure no negative savings or bizarre minimums (cap at -5000 max debt/overdraft)
df['savings'] = df['savings'].apply(lambda x: max(-5000, x))

df['income_volatility'] = np.round(income_volatility, 2)
df['digital_ratio'] = np.round(digital_ratio, 2)
df['txn_frequency'] = np.clip(txn_frequency, 5, 1000).astype(int)
df['late_night_ratio'] = np.round(late_night_ratio, 2)

# Loan Amount requested (Typically 1x to 5x of monthly income)
loan_multipliers = np.random.uniform(1.0, 5.0, size=num_records)
df['loan_amount'] = np.round(df['income'] * loan_multipliers / 1000) * 1000 # round to nearest 1000

# ==========================================
# PROBABILISTIC DEFAULT CALCULATION
# ==========================================
# We create a hidden risk score combining features with varying weights.
# A higher score means higher chance of default.

# 1. Debt-to-Income (higher is riskier)
dti = df['loan_amount'] / (df['income'] * 12 + 1) # annualized income approx

# 2. Savings Ratio (lower is riskier)
savings_ratio = df['savings'] / (df['income'] + 1)

base_risk_score = (dti * 3.0) - (savings_ratio * 4.0) + (df['income_volatility'] * 2.5) 

# Job profile risk adjustments
job_risk_modifiers = {
    'Auto Driver': 0.2,
    'Delivery Partner': 0.1,
    'Freelancer': 0.5, # Freelancers have high volatility
    'Shop Owner': -0.4, # Shop owners generally safer
    'Street Vendor': 0.3
}
df['job_risk'] = df['job_type'].map(job_risk_modifiers)

# Calculate final log-odds score with some random noise to represent unobservable life events (medical emergency etc)
risk_score = base_risk_score + df['job_risk'] - (df['digital_ratio'] * 1.5) + np.random.normal(0, 1.5, size=num_records)

# Convert log odds to probability using sigmoid function
probability_of_default = 1 / (1 + np.exp(-risk_score))

# Set default threshold probabilistically using a binomial generator
df['default'] = np.random.binomial(1, probability_of_default)

# Drop hidden columns used for generation
df = df.drop(columns=['job_risk'])

# Save to CSV
output_path = 'realistic_chhattisgarh_loan_dataset.csv'
df.to_csv(output_path, index=False)

print(f"✅ Successfully generated realistic dataset: {output_path}")

# Run a quick check to prove it's fixed
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

df_encoded = pd.get_dummies(df.drop(['user_id'], axis=1), drop_first=True)
X = df_encoded.drop('default', axis=1)
y = df_encoded['default']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(max_depth=3)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"✅ Sanity Check Completed. Decision Tree Model Accuracy: {acc*100:.2f}% (Should be 65-80%, NOT 99%)")
print("\nDefault Distribution:")
print(df['default'].value_counts(normalize=True))
