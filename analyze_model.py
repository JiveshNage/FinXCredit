import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, RocCurveDisplay, accuracy_score
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

# 1. Load the real dataset we generated
DATA_PATH = 'pan_india_loan_dataset.csv'
if not os.path.exists(DATA_PATH):
    print(f"Error: {DATA_PATH} not found. Please run generate_dataset.py first.")
    exit()

df = pd.read_csv(DATA_PATH)

# 2. Setup Features
X = df.drop(columns=['user_id', 'city', 'state', 'default'])
y = df['default']

categorical_cols = ['city_tier', 'job_type']
numerical_cols = [c for c in X.columns if c not in categorical_cols]

# 3. Build a quick pipeline for evaluation
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numerical_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
])

model = Pipeline([
    ('prep', preprocessor),
    ('clf', XGBClassifier(eval_metric='logloss'))
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# --- GENERATE PLOTS ---

# Plot 1: Confusion Matrix
plt.figure(figsize=(8, 6))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.title('Confusion Matrix: Predicting Defaults')
plt.ylabel('Actual Label')
plt.xlabel('Predicted Label')
plt.savefig('confusion_matrix.png')
print("✅ Saved confusion_matrix.png")

# Plot 2: ROC Curve
plt.figure(figsize=(8, 6))
RocCurveDisplay.from_estimator(model, X_test, y_test)
plt.title('ROC-AUC Curve Performance')
plt.grid(True, linestyle='--', alpha=0.6)
plt.savefig('roc_curve.png')
print("✅ Saved roc_curve.png")

# Plot 3: Feature Importance
plt.figure(figsize=(10, 6))
# Get feature names from encoder
cat_features = model.named_steps['prep'].named_transformers_['cat'].get_feature_names_out(categorical_cols)
all_features = numerical_cols + list(cat_features)

importances = pd.Series(model.named_steps['clf'].feature_importances_, index=all_features)
importances.nlargest(10).plot(kind='barh', color='steelblue')
plt.title('Top 10 Drivers of Credit Score')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('feature_importance.png')
print("✅ Saved feature_importance.png")

print("\n--- Summary Metrics ---")
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
