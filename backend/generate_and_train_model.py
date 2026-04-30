"""
Quick script to generate synthetic loan data and train ML model
This creates a basic but functional model for loan default prediction
"""
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
import joblib

# Set random seed for reproducibility
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("Generating synthetic loan dataset...")

# Generate synthetic loan data (500 samples)
n_samples = 500
data = {
    'city_tier': np.random.choice(['Tier_1', 'Tier_2', 'Tier_3', 'Rural'], n_samples),
    'job_type': np.random.choice(['salaried', 'delivery', 'freelancer', 'shop_owner', 'auto_driver'], n_samples),
    'income': np.random.uniform(10000, 100000, n_samples),
    'expenses': np.random.uniform(5000, 80000, n_samples),
    'savings': np.random.uniform(0, 50000, n_samples),
    'loan_amount': np.random.uniform(10000, 300000, n_samples),
    'txn_frequency': np.random.randint(10, 500, n_samples),
    'digital_ratio': np.random.uniform(0.1, 1.0, n_samples),
    'income_volatility': np.random.uniform(0.05, 0.95, n_samples),
    'late_night_ratio': np.random.uniform(0.0, 0.3, n_samples),
    'savings_ratio': np.random.uniform(0.0, 0.8, n_samples),
    'expense_ratio': np.random.uniform(0.3, 0.95, n_samples),
    'loan_to_income_ratio': np.random.uniform(0.5, 5.0, n_samples),
}

df = pd.DataFrame(data)

# Generate target: default probability based on features
# Higher expense ratio, higher volatility → higher default risk
df['default'] = (
    (df['expense_ratio'] > 0.7).astype(int) * 0.6 +
    (df['income_volatility'] > 0.6).astype(int) * 0.5 +
    (df['loan_to_income_ratio'] > 3).astype(int) * 0.4 +
    (df['digital_ratio'] < 0.3).astype(int) * 0.3
) > 0.5

print(f"Generated {len(df)} samples with {df['default'].sum()} defaults")

# Split data
X = df.drop(columns=['default'])
y = df['default']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create preprocessing pipeline
categorical_cols = ['city_tier', 'job_type']
numerical_cols = [
    'income', 'expenses', 'savings', 'loan_amount',
    'txn_frequency', 'digital_ratio', 'income_volatility', 'late_night_ratio',
    'savings_ratio', 'expense_ratio', 'loan_to_income_ratio'
]

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ]
)

# Create full pipeline
print("Training XGBClassifier...")
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss',
        verbosity=0
    ))
])

# Train model
pipeline.fit(X_train, y_train)

# Evaluate
train_score = pipeline.score(X_train, y_train)
test_score = pipeline.score(X_test, y_test)

print(f"Training Accuracy: {train_score:.4f}")
print(f"Testing Accuracy: {test_score:.4f}")

# Save model
model_path = os.path.join(MODEL_DIR, 'loan_model.pkl')
joblib.dump(pipeline, model_path)
print(f"Model saved to {model_path}")

print("✓ ML Model training complete!")
