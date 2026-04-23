import React, { useState, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import ScoreMeter from '../../components/user/ScoreMeter';

// Deterministic JS replica of scoring_engine.py
const calculateScoreSimulation = (data) => {
  const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

  const income = data.income;
  const expenses = data.expenses;
  const transactions = data.transactions;
  const savings = data.savings;
  const loan_history = data.loan_history;
  const upi_freq = data.upi_freq;
  
  const total_in_out = income + expenses;
  const income_ratio = total_in_out > 0 ? income / total_in_out : 0;
  const income_score = clamp(income_ratio * 100, 0, 100) * 0.30;

  let txn_score = clamp((transactions / 150) * 100, 0, 100) * 0.20;
  if (upi_freq > 0) {
      txn_score += Math.min((upi_freq / 200) * 5, 5);
  }

  const savings_ratio = savings / Math.max(income, 1);
  const savings_score = clamp(savings_ratio * 200, 0, 100) * 0.20;

  const expense_ratio = expenses / Math.max(income, 1);
  const spending_score = clamp((1 - expense_ratio) * 100, 0, 100) * 0.15;

  let discipline = 50;
  if (loan_history) discipline += 20;
  const bill_map = {"Always": 30, "Usually": 20, "Sometimes": 10, "Rarely": 0};
  discipline += bill_map[data.bill_regularity] || 0;
  const discipline_score = clamp(discipline, 0, 100) * 0.15;

  let final_score = income_score + txn_score + savings_score + spending_score + discipline_score;
  return Math.round(clamp(final_score, 0, 100));
};

const Simulator = () => {
  const [formData, setFormData] = useState({
    income: 20000,
    expenses: 12000,
    savings: 3000,
    transactions: 50,
    loan_history: false,
    upi_freq: 80,
    bill_regularity: "Usually"
  });

  const currentScore = useMemo(() => calculateScoreSimulation(formData), [formData]);
  const baselineScore = useMemo(() => calculateScoreSimulation({
    income: 20000, expenses: 12000, savings: 3000, transactions: 50, loan_history: false, upi_freq: 80, bill_regularity: "Usually"
  }), []);

  const pointDelta = currentScore - baselineScore;

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="simulator" />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '8px' }}>What-If Score Simulator</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Adjust the sliders below to see how changes in your financial behavior impact your credit score instantly.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
             
             {/* Left - Sliders */}
             <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="label">Monthly Income</label>
                    <span style={{ fontWeight: 'bold' }}>₹{formData.income.toLocaleString()}</span>
                  </div>
                  <input type="range" min="1000" max="150000" step="500" 
                         value={formData.income} onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                         style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="label">Monthly Expenses</label>
                    <span style={{ fontWeight: 'bold' }}>₹{formData.expenses.toLocaleString()}</span>
                  </div>
                  <input type="range" min="0" max="150000" step="500" 
                         value={formData.expenses} onChange={e => setFormData({...formData, expenses: Number(e.target.value)})}
                         style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="label">Monthly Savings</label>
                    <span style={{ fontWeight: 'bold' }}>₹{formData.savings.toLocaleString()}</span>
                  </div>
                  <input type="range" min="0" max="50000" step="500" 
                         value={formData.savings} onChange={e => setFormData({...formData, savings: Number(e.target.value)})}
                         style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="label">Total Transactions</label>
                    <span style={{ fontWeight: 'bold' }}>{formData.transactions} / mo</span>
                  </div>
                  <input type="range" min="0" max="300" step="5" 
                         value={formData.transactions} onChange={e => setFormData({...formData, transactions: Number(e.target.value)})}
                         style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="label">UPI Transactions</label>
                    <span style={{ fontWeight: 'bold' }}>{formData.upi_freq} / mo</span>
                  </div>
                  <input type="range" min="0" max="300" step="5" 
                         value={formData.upi_freq} onChange={e => setFormData({...formData, upi_freq: Number(e.target.value)})}
                         style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                   <div style={{ flex: 1 }}>
                     <label className="label">Bill Regularity</label>
                     <select className="input-field" value={formData.bill_regularity} onChange={e => setFormData({...formData, bill_regularity: e.target.value})}>
                       <option>Always</option><option>Usually</option><option>Sometimes</option><option>Rarely</option>
                     </select>
                   </div>
                   <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                     <input type="checkbox" checked={formData.loan_history} onChange={e => setFormData({...formData, loan_history: e.target.checked})}
                            style={{ accentColor: 'var(--brand-primary)', width: '20px', height: '20px' }} />
                     <label className="label" style={{ margin: 0 }}>Has Loan History</label>
                   </div>
                </div>
             </div>

             {/* Right - Live Output */}
             <div>
               <div className="glass-card" style={{ position: 'sticky', top: '40px', textAlign: 'center' }}>
                 <h3>Simulated Score</h3>
                 <div style={{ marginTop: '24px' }}>
                   <ScoreMeter score={currentScore} />
                 </div>
                 
                 {pointDelta !== 0 && (
                   <div style={{ 
                     background: pointDelta > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                     color: pointDelta > 0 ? 'var(--status-success)' : 'var(--status-error)',
                     padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '16px'
                   }}>
                     Your score went {pointDelta > 0 ? 'up' : 'down'} by {pointDelta > 0 ? '+' : ''}{pointDelta} points
                   </div>
                 )}
                 <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                   This is an estimated score based purely on your inputs and is not recorded in our database.
                 </p>
               </div>
             </div>
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
