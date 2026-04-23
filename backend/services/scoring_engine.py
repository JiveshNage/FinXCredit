import json

def clamp(value, min_val, max_val):
    return max(min_val, min(value, max_val))

def generate_reasons(income_score, txn_score, savings_score, spending_score, discipline_score):
    reasons = {"positive": [], "negative": []}
    
    # Analyze Income
    if income_score >= 25:
        reasons["positive"].append("Aapki income stability bahut achhi hai (Strong income stability).")
    elif income_score < 15:
        reasons["negative"].append("Income to expense ratio thoda low hai (Income margin is tight).")
        
    # Analyze Transactions
    if txn_score >= 15:
        reasons["positive"].append("Active transaction history shows good financial presence.")
    elif txn_score < 10:
        reasons["negative"].append("Digital transactions count kafi kam hai (Low digital footprint).")

    # Analyze Savings
    if savings_score >= 15:
        reasons["positive"].append("Excellent savings habit demonstrated.")
    elif savings_score < 10:
        reasons["negative"].append("Aapki savings thodi kam hai (Savings buffer is low).")

    # Analyze Spending
    if spending_score >= 12:
        reasons["positive"].append("Spending is well within safe limits.")
    elif spending_score < 8:
        reasons["negative"].append("Expenses zyada hain income ke muqable (High proportional spending).")

    # Analyze Discipline
    if discipline_score >= 12:
        reasons["positive"].append("Good financial discipline and bill payments.")
    elif discipline_score < 8:
        reasons["negative"].append("Irregular bill payments impact your score negatively.")

    return reasons

def generate_tips(data, reasons):
    tips = []
    
    # Provide tips based on weak areas
    if len(reasons.get("negative", [])) > 0:
        for reason in reasons["negative"]:
            if "savings" in reason.lower():
                tips.append({
                    "title": "Increase Monthly Savings",
                    "description": "Try to save an additional ₹1000 - ₹2000 per month.",
                    "impact": "Can boost score by +8 points"
                })
            elif "transactions" in reason.lower():
                tips.append({
                    "title": "Boost Digital Transactions",
                    "description": "Use UPI for daily payments and mobile recharges.",
                    "impact": "Can boost score by +5 points"
                })
            elif "bill" in reason.lower() or "irregular" in reason.lower():
                tips.append({
                    "title": "Pay Bills Promptly",
                    "description": "Ensure your utility bills are paid on or before the due date.",
                    "impact": "Can boost score by +6 points"
                })
    
    if len(tips) == 0:
        tips.append({
            "title": "Maintain Good Habits",
            "description": "Keep up the excellent financial discipline to maintain your high score.",
            "impact": "Keeps your profile in top condition"
        })
        
    return tips

def calculate_score(data_dict):
    """
    Implements the heuristics described in the master prompt.
    """
    income = float(data_dict.get('income', 0))
    expenses = float(data_dict.get('expenses', 0))
    transactions = int(data_dict.get('transactions', 0))
    savings = float(data_dict.get('savings', 0))
    loan_history = bool(data_dict.get('loan_history', False))
    upi_freq = int(data_dict.get('upi_freq', 0) or 0)
    bill_regularity = data_dict.get('bill_regularity', "Unknown")
    
    # 1. INCOME STABILITY (30 points)
    total_in_out = income + expenses
    income_ratio = income / total_in_out if total_in_out > 0 else 0
    income_score = clamp(income_ratio * 100, 0, 100) * 0.30

    # 2. TRANSACTION ACTIVITY (20 points)  
    txn_score = clamp(transactions / 150 * 100, 0, 100) * 0.20
    # Boost if UPI transactions provided
    if upi_freq: 
        txn_score += min(upi_freq / 200 * 5, 5)

    # 3. SAVINGS RATIO (20 points)
    savings_ratio = savings / max(income, 1)
    savings_score = clamp(savings_ratio * 200, 0, 100) * 0.20

    # 4. SPENDING BEHAVIOR (15 points)
    expense_ratio = expenses / max(income, 1)
    spending_score = clamp((1 - expense_ratio) * 100, 0, 100) * 0.15

    # 5. FINANCIAL DISCIPLINE (15 points)
    discipline = 50  # base
    if loan_history:
        discipline += 20
    bill_map = {"Always": 30, "Usually": 20, "Sometimes": 10, "Rarely": 0}
    discipline += bill_map.get(bill_regularity, 0)
    discipline_score = clamp(discipline, 0, 100) * 0.15

    final_score = income_score + txn_score + savings_score + spending_score + discipline_score
    final_score = round(clamp(final_score, 0, 100), 1)

    # DECISION
    if final_score >= 80:
        decision = "Approved"
        risk = "Low Risk"
        loan = "₹1,00,000 – ₹5,00,000"
    elif final_score >= 60:
        decision = "Medium Risk"
        risk = "Medium Risk"  
        loan = "₹10,000 – ₹50,000"
    else:
        decision = "Rejected"
        risk = "High Risk"
        loan = "Not eligible currently"

    # FRAUD DETECTION
    flags = []
    if income > 100000 and transactions < 5:
        flags.append("High income but very low transactions")
    if savings > income:
        flags.append("Savings exceed declared income")
    
    # EXPLAINABILITY
    reasons = generate_reasons(income_score, txn_score, savings_score, spending_score, discipline_score)
    tips = generate_tips(data_dict, reasons)
    
    factors_breakdown = {
        "income_score": round(income_score, 1),
        "txn_score": round(txn_score, 1),
        "savings_score": round(savings_score, 1),
        "spending_score": round(spending_score, 1),
        "discipline_score": round(discipline_score, 1)
    }

    return {
        "score": final_score,
        "decision": decision,
        "risk": risk,
        "loan": loan,
        "reasons": reasons,
        "tips": tips,
        "flags": flags,
        "factors": factors_breakdown
    }
