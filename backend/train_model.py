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
DATA_PATH = os.path.join(BASE_DIR, '..', 'realistic_chhattisgarh_loan_dataset.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Ensure models directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

print("Starting AI Model Training Pipeline...")

# 2. Load Dataset
print(f"Loading dataset from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)

# Drop user_id as it's not a predictive feature
X = df.drop(columns=['user_id', 'default'])
y = df['default']

# Define categorical and numerical columns
categorical_cols = ['city', 'job_type']
numerical_cols = ['income', 'expenses', 'savings', 'loan_amount', 
                  'txn_frequency', 'digital_ratio', 'income_volatility', 'late_night_ratio']

# 3. Create Preprocessing Pipeline
print("Building Column Transformer (Scaler + Encoder)...")
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_cols)
    ]
)

# 4. Create the final pipeline with XGBoost
# We use XGBClassifier because it handles tabular data exceptionally well.
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42, max_depth=4, learning_rate=0.1, n_estimators=100))
])

# 5. Split the Data
print("Splitting data into Training and Testing sets (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 6. Train the Model
print("Training XGBoost Model... This represents the AI learning from behavioral data.")
pipeline.fit(X_train, y_train)

# 7. Evaluate the Model
print("Evaluating Model Performance on Test Data...")
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print(f"\n--- MODEL METRICS ---")
print(f"Accuracy:  {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}% (When it says default, how often is it right?)")
print(f"Recall:    {recall * 100:.2f}% (Out of all real defaults, how many did it catch?)")
print(f"ROC-AUC:   {roc_auc:.4f}\n")

# 8. Save the Pipeline
model_path = os.path.join(MODEL_DIR, 'loan_model.pkl')
joblib.dump(pipeline, model_path)
print(f"Model pipeline successfully saved to: {model_path}")
print("Ready for production API integration!")
