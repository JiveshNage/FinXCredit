import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier
import joblib

# 1. Define Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'pan_india_loan_dataset.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'ml_models')

# Ensure models directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

print("Starting AI Model Training Pipeline (Pan-India)...")

# 2. Load Dataset
print(f"Loading dataset from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Cities: {df['city'].nunique()} | States: {df['state'].nunique()} | Tiers: {df['city_tier'].nunique()}")
print(f"Job types: {df['job_type'].nunique()}")

# Drop columns that should NOT be model features
# - user_id: identifier, not predictive
# - city: replaced by city_tier (generalizes to unseen cities)
# - state: too many categories, optional (can add back if needed)
X = df.drop(columns=['user_id', 'city', 'state', 'default'])
y = df['default']

# Define categorical and numerical columns
# KEY CHANGE: 'city_tier' instead of 'city' — only 4 categories, works for any Indian city
categorical_cols = ['city_tier', 'job_type']
numerical_cols = [
    'income', 'expenses', 'savings', 'loan_amount',
    'txn_frequency', 'digital_ratio', 'income_volatility', 'late_night_ratio',
    # NEW: Ratio features that generalize across regions
    'savings_ratio',           # savings / income (region-agnostic)
    'expense_ratio',           # expenses / income (region-agnostic)
    'loan_to_income_ratio',    # loan_amount / annual_income (region-agnostic)
]

# 3. Create Preprocessing Pipeline
print("Building Column Transformer (Scaler + Encoder)...")
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        # KEY CHANGE: handle_unknown='ignore' — safely handles unseen categories at inference time
        ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ]
)

# 4. Create the final pipeline with XGBoost
# XGBClassifier handles tabular data exceptionally well for credit risk
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', XGBClassifier(
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42,
        max_depth=4,
        learning_rate=0.1,
        n_estimators=150,       # Slightly more trees for larger feature space
        scale_pos_weight=1.0,   # Adjust if class imbalance is significant
    ))
])

# 5. Split the Data
print("Splitting data into Training and Testing sets (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 6. Train the Model
print("Training XGBoost Model on Pan-India behavioral data...")
pipeline.fit(X_train, y_train)

# 7. Evaluate the Model
print("Evaluating Model Performance on Test Data...")
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print(f"\n--- MODEL METRICS (Pan-India) ---")
print(f"Accuracy:  {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}% (When it says default, how often is it right?)")
print(f"Recall:    {recall * 100:.2f}% (Out of all real defaults, how many did it catch?)")
print(f"ROC-AUC:   {roc_auc:.4f}")
print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}\n")

# 8. Feature Importance Analysis
feature_names = (
    numerical_cols + 
    list(pipeline.named_steps['preprocessor']
         .named_transformers_['cat']
         .get_feature_names_out(categorical_cols))
)
importances = pipeline.named_steps['classifier'].feature_importances_
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values('importance', ascending=False)

print("--- TOP FEATURES ---")
print(importance_df.head(15).to_string(index=False))

# 9. Save the Pipeline
model_path = os.path.join(MODEL_DIR, 'loan_model.pkl')
joblib.dump(pipeline, model_path)
print(f"\n✅ Model pipeline saved to: {model_path}")
print("Ready for production API integration!")
