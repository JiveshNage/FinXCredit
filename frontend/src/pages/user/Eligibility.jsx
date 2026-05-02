import React, { useState, useEffect } from 'react';
import { Shield, Loader, CheckCircle, AlertTriangle, FileText, Info, TrendingUp, Wallet, Landmark } from 'lucide-react';
import { Sidebar } from './Dashboard';
import { API_BASE_URL } from '../../config';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const calculateLocalSimulation = (data) => {
  const income = Number(data.income || 0);
  const expenses = Number(data.expenses || 0);
  const savings = Number(data.savings || 0);
  const transactions = Number(data.transactions || 0);
  const upi_freq = Number(data.upi_freq || 0);
  const loan_history = Boolean(data.loan_history);
  const bill_regularity = data.bill_regularity || 'Always';

  const incomeRatio = income > 0 ? income / (income + expenses || 1) : 0;
  const incomeScore = clamp(incomeRatio * 100, 0, 100);

  const transactionScore = clamp(transactions / 150 * 100 + Math.min(upi_freq / 200 * 5, 5), 0, 100);

  const savingsRatio = income > 0 ? savings / income : 0;
  const savingsScore = clamp(savingsRatio * 200, 0, 100);

  const spendingScore = clamp((1 - Math.min(expenses / Math.max(income, 1), 1)) * 100, 0, 100);

  let discipline = 50 + (loan_history ? 20 : 0);
  const billMap = { Always: 30, Usually: 20, Sometimes: 10, Rarely: 0 };
  discipline += billMap[bill_regularity] ?? 0;
  const disciplineScore = clamp(discipline, 0, 100);

  const weights = {
    income: 0.25,
    transactions: 0.20,
    savings: 0.20,
    spending: 0.20,
    discipline: 0.15
  };

  const finalScore = clamp(
    Math.round(
      (incomeScore * weights.income + transactionScore * weights.transactions + savingsScore * weights.savings + spendingScore * weights.spending + disciplineScore * weights.discipline) * 10
    ) / 10,
    0,
    100
  );

  let decision = 'Rejected';
  let risk = 'High Risk';
  let loan = 'Not eligible currently';
  if (finalScore >= 80) {
    decision = 'Approved';
    risk = 'Low Risk';
    loan = '₹1,00,000 – ₹5,00,000';
  } else if (finalScore >= 60) {
    decision = 'Conditional';
    risk = 'Medium Risk';
    loan = '₹10,000 – ₹50,000';
  }

  const reasons = {
    positive: [],
    negative: []
  };

  if (incomeScore >= 70) {
    reasons.positive.push('Strong income cushion relative to expenses.');
  } else if (incomeScore < 40) {
    reasons.negative.push('Income is low compared to declared monthly expenses.');
  }

  if (transactionScore >= 60) {
    reasons.positive.push('Healthy digital transaction footprint.');
  } else {
    reasons.negative.push('Low transaction activity for a strong score.');
  }

  if (savingsScore >= 60) {
    reasons.positive.push('Good savings buffer for emergencies.');
  } else {
    reasons.negative.push('Savings are too thin relative to income.');
  }

  if (spendingScore >= 60) {
    reasons.positive.push('Spending is under control.');
  } else {
    reasons.negative.push('High expense ratio reduces your score.');
  }

  if (disciplineScore >= 70) {
    reasons.positive.push('Strong payment discipline and track record.');
  } else {
    reasons.negative.push('Bill payment regularity and credit history could improve.');
  }

  const tips = [];
  if (incomeScore < 50) {
    tips.push({ title: 'Increase Income Stability', description: 'Try increasing your monthly verified income or reducing expenses.', impact: '+8 points' });
  }
  if (savingsScore < 50) {
    tips.push({ title: 'Build Savings', description: 'Aim to save at least 20% of your monthly income.', impact: '+7 points' });
  }
  if (transactionScore < 50) {
    tips.push({ title: 'Boost Digital Activity', description: 'Use UPI and digital payments more regularly.', impact: '+5 points' });
  }
  if (spendingScore < 50) {
    tips.push({ title: 'Reduce Expenses', description: 'Lower discretionary spend to improve your ratio.', impact: '+6 points' });
  }
  if (disciplineScore < 60) {
    tips.push({ title: 'Pay Bills On Time', description: 'Maintain consistent bill payment behavior.', impact: '+6 points' });
  }
  if (tips.length === 0) {
    tips.push({ title: 'Keep the momentum', description: 'Your profile is in strong shape. Maintain these habits.', impact: 'Keeps score stable' });
  }

  return {
    score: finalScore,
    decision,
    risk,
    loan,
    reasons,
    tips,
    factors: {
      income_score: Math.round(incomeScore * 10) / 10,
      txn_score: Math.round(transactionScore * 10) / 10,
      savings_score: Math.round(savingsScore * 10) / 10,
      spending_score: Math.round(spendingScore * 10) / 10,
      discipline_score: Math.round(disciplineScore * 10) / 10
    }
  };
};

const Eligibility = () => {
  const [formData, setFormData] = useState({
    income: 25000,
    expenses: 12000,
    savings: 5000,
    transactions: 45,
    loan_history: false,
    upi_freq: 60,
    bill_regularity: 'Always'
  });
  const [result, setResult] = useState(calculateLocalSimulation({
    income: 25000,
    expenses: 12000,
    savings: 5000,
    transactions: 45,
    loan_history: false,
    upi_freq: 60,
    bill_regularity: 'Always'
  }));

  useEffect(() => {
    setResult(calculateLocalSimulation(formData));
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="eligibility" />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '8px' }}>Credit Simulator</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Slide the controls to see your score and tailored advice instantly.</p>
          </div>

          <div className="glass-card" style={{ marginBottom: '30px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Simulated Score</div>
                <h2 style={{ fontSize: '3rem', margin: '8px 0' }}>{result.score}</h2>
                <div style={{ color: result.score >= 80 ? 'var(--status-success)' : result.score >= 60 ? 'var(--status-warning)' : 'var(--status-error)', fontWeight: '700' }}>
                  {result.decision} · {result.risk}
                </div>
              </div>
              <div style={{ minWidth: '240px' }}>
                <div style={{ height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${result.score}%`, height: '100%', background: result.score >= 80 ? 'var(--status-success)' : result.score >= 60 ? 'var(--status-warning)' : 'var(--status-error)', transition: 'width 0.2s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Info size={20} />
                <h2 style={{ margin: 0 }}>Adjust Your Profile</h2>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Monthly Income (₹{formData.income.toLocaleString()})</label>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="1000"
                  value={formData.income}
                  onChange={(e) => handleChange('income', Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Monthly Expenses (₹{formData.expenses.toLocaleString()})</label>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="500"
                  value={formData.expenses}
                  onChange={(e) => handleChange('expenses', Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Savings Buffer (₹{formData.savings.toLocaleString()})</label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={formData.savings}
                  onChange={(e) => handleChange('savings', Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Monthly Transactions ({formData.transactions})</label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={formData.transactions}
                  onChange={(e) => handleChange('transactions', Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">UPI Frequency ({formData.upi_freq})</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={formData.upi_freq}
                  onChange={(e) => handleChange('upi_freq', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={20} />
                <h2 style={{ margin: 0 }}>Credit Behavior</h2>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label">Bill Payment Regularity</label>
                <select
                  className="input-field"
                  value={formData.bill_regularity}
                  onChange={(e) => handleChange('bill_regularity', e.target.value)}
                  style={{ background: 'var(--bg-elevated)', color: 'white' }}
                >
                  <option value="Always">Always on time</option>
                  <option value="Usually">Usually on time</option>
                  <option value="Sometimes">Sometimes late</option>
                  <option value="Rarely">Rarely on time</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '14px' }}>
                <input
                  type="checkbox"
                  id="loan_history"
                  checked={formData.loan_history}
                  onChange={(e) => handleChange('loan_history', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="loan_history" style={{ margin: 0, cursor: 'pointer' }}>
                  Previous loan/credit history present
                </label>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Income / Expense ratio</div>
                    <div style={{ fontWeight: 700 }}>{Math.round((formData.income / Math.max(formData.expenses + formData.income, 1)) * 100)}%</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Savings ratio</div>
                    <div style={{ fontWeight: 700 }}>{Math.round((formData.savings / Math.max(formData.income, 1)) * 100)}%</div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Score Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income</div>
                    <div style={{ fontWeight: '700', marginTop: '6px' }}>{result.factors.income_score}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transactions</div>
                    <div style={{ fontWeight: '700', marginTop: '6px' }}>{result.factors.txn_score}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Savings</div>
                    <div style={{ fontWeight: '700', marginTop: '6px' }}>{result.factors.savings_score}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spending</div>
                    <div style={{ fontWeight: '700', marginTop: '6px' }}>{result.factors.spending_score}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discipline</div>
                    <div style={{ fontWeight: '700', marginTop: '6px' }}>{result.factors.discipline_score}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '30px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Advice & Next Steps</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {result.tips.map((tip, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>{tip.title}</div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{tip.description}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tip.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
