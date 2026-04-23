import React, { useState } from 'react';
import { Shield, Loader, CheckCircle, AlertTriangle, FileText, Info, TrendingUp, Wallet, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Dashboard';
import { API_BASE_URL } from '../../config';

const Eligibility = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    income: 25000,
    expenses: 12000,
    savings: 5000,
    transactions: 45,
    loan_history: false,
    upi_freq: 60,
    bill_regularity: 'Always'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Simulation failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Input your financial data to see how our AI scores you instantly.</p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: 'var(--status-error)', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={20} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Simulation Error</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: result ? '1.2fr 1fr' : '1fr', gap: '30px' }}>
            
            <div className="glass-card">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                <div className="input-group">
                  <label className="label">Monthly Income (₹)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Monthly Expenses (₹)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={formData.expenses}
                    onChange={(e) => setFormData({ ...formData, expenses: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Total Savings (₹)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Digital Txn Count (Monthly)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={formData.transactions}
                    onChange={(e) => setFormData({ ...formData, transactions: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">UPI Frequency (Aggregator Data)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={formData.upi_freq}
                    onChange={(e) => setFormData({ ...formData, upi_freq: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Bill Payment Regularity</label>
                  <select
                    className="input-field"
                    value={formData.bill_regularity}
                    onChange={(e) => setFormData({ ...formData, bill_regularity: e.target.value })}
                    style={{ background: 'var(--bg-elevated)', color: 'white' }}
                  >
                    <option value="Always">Always on time</option>
                    <option value="Usually">Usually on time</option>
                    <option value="Sometimes">Sometimes late</option>
                    <option value="Rarely">Rarely on time</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input 
                        type="checkbox" 
                        id="loan_history" 
                        checked={formData.loan_history} 
                        onChange={e => setFormData({...formData, loan_history: e.target.checked})}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="loan_history" style={{ margin: 0, cursor: 'pointer' }}>
                        I have a previous loan/credit history (CIBIL Footprint)
                    </label>
                </div>

                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '10px' }} disabled={loading}>
                  {loading ? 'Calculating Score...' : 'Run Simulation'}
                </button>
              </form>
            </div>

            {/* Result Section */}
            {result && (
              <div className="glass-card" style={{ 
                animation: 'slideInRight 0.4s ease-out',
                border: `1px solid ${result.score >= 60 ? 'var(--status-success)' : 'var(--status-error)'}33`
              }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <div style={{ 
                    width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    border: '4px solid var(--brand-primary)'
                  }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{result.score}</span>
                  </div>
                  <h2 style={{ color: result.score >= 80 ? 'var(--status-success)' : result.score >= 60 ? 'var(--status-warning)' : 'var(--status-error)' }}>
                    {result.decision}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Risk Level: {result.risk}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    {Object.entries(result.factors).map(([key, val]) => (
                        <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key.replace('_score', '')}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{val}</div>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ background: 'var(--brand-primary-glow)', borderColor: 'var(--brand-primary)', padding: '15px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suggested Credit Limit</div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{result.loan}</h3>
                </div>

                <div style={{ marginTop: '24px' }}>
                   <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18}/> Insights</h4>
                   <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {result.reasons.positive.slice(0,2).map((r, i) => <li key={i} style={{ color: 'var(--status-success)', marginBottom: '4px' }}>{r}</li>)}
                      {result.reasons.negative.slice(0,2).map((r, i) => <li key={i} style={{ color: 'var(--status-warning)', marginBottom: '4px' }}>{r}</li>)}
                   </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Eligibility;
