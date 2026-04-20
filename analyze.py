import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

df = pd.read_csv('chhattisgarh_loan_dataset_20000.csv')

print("--- DATASET FLAWS AND VALIDITY ANALYSIS ---")

print("\n1. Missing Values:")
print(df.isnull().sum())

print("\n2. Unique values in categorical columns:")
print("City:", df['city'].unique())
print("Job Type:", df['job_type'].unique())

print("\n3. Negative Values Check (Should not have negative income or expenses):")
print("Negative Income:", (df['income'] < 0).sum())
print("Negative Expenses:", (df['expenses'] < 0).sum())

print("\n4. Consistency Check (Savings = Income - Expenses):")
derived_savings = df['income'] - df['expenses']
diff = np.abs(df['savings'] - derived_savings)
print("Max diff between Savings and (Income - Expenses):", diff.max())

print("\n5. Target Variable (default):")
print("Class Distribution:\n", df['default'].value_counts(normalize=True))

print("\n6. Correlations with 'default':")
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) > 0:
    correlations = df[numeric_cols].corr()['default'].sort_values(ascending=False)
    print(correlations)

print("\n7. Data Leakage / Synthetic Predictability Check:")
# Encoding categoricals for tree
df_encoded = pd.get_dummies(df.drop(['user_id'], axis=1), drop_first=True)
X = df_encoded.drop('default', axis=1)
y = df_encoded['default']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
clf = DecisionTreeClassifier(max_depth=3)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
print("Simple Decision Tree Accuracy (depth=3):", accuracy_score(y_test, y_pred))

# Let's see feature importances 
print("\nFeature Importances:")
importances = pd.Series(clf.feature_importances_, index=X.columns).sort_values(ascending=False)
print(importances[importances > 0])

# Let's check logic for default
# For gig workers, default usually happens when debt is high relative to income/savings
# If synthetic, it might be randomly generated
print("\n8. GroupBy checks on 'job_type' and 'default':")
print(df.groupby('job_type')['default'].mean())
