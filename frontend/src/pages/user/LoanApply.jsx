import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { Landmark, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const LoanApply = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestAppId, setLatestAppId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: 10000,
    tenure: 6,
    purpose: 'Business Expansion'
  });

  useEffect(() => {
    const fetchLatestApp = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/applications/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const apps = await res.json();
          // Find the most recent approved application
          const approvedApp = apps.find(a => a.decision === 'Approved');
          if (approvedApp) {
            setLatestAppId(approvedApp.id);
          } else {
             setError("You do not have an approved credit assessment yet. Please complete an assessment first.");
          }
        }
      } catch (err) {
        setError("Failed to fetch application data.");
      }
      setLoading(false);
    };
    fetchLatestApp();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latestAppId) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/fulfill`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: latestAppId,
          amount: formData.amount,
          tenure: formData.tenure,
          purpose: formData.purpose
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to submit loan request");
      }
      
      setStep(2); // Move to success screen
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="dashboard" />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          {loading ? (
             <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
               <Loader size={36} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
               <p style={{ color: 'var(--text-secondary)' }}>Checking eligibility records...</p>
             </div>
          ) : error ? (
             <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
               <h3 style={{ color: 'var(--status-error)', marginBottom: '16px' }}>Not Eligible Yet</h3>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
               <button onClick={() => navigate('/apply')} className="btn-primary" style={{ padding: '12px 32px' }}>
                 Take Assessment
               </button>
             </div>
          ) : step === 1 ? (
            <>
              <h1 style={{ marginBottom: '8px' }}>Apply for a Loan</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                Fill in the details below to formally apply for your approved loan amount.
              </p>

              <div className="glass-card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  <div>
                    <label className="label">Requested Loan Amount</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0 16px' }}>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>₹</span>
                      <input 
                        type="number" 
                        min="1000" 
                        max="500000" 
                        step="1000"
                        value={formData.amount} 
                        onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                        style={{ background: 'transparent', border: 'none', color: 'white', padding: '16px', width: '100%', fontSize: '1.2rem', outline: 'none' }} 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Preferred Repayment Tenure (Months)</label>
                    <select 
                      value={formData.tenure} 
                      onChange={e => setFormData({...formData, tenure: Number(e.target.value)})}
                      className="input-field"
                    >
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={24}>24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Loan Purpose</label>
                    <select 
                      value={formData.purpose} 
                      onChange={e => setFormData({...formData, purpose: e.target.value})}
                      className="input-field"
                    >
                      <option>Business Expansion</option>
                      <option>Inventory Purchase</option>
                      <option>Vehicle Repair</option>
                      <option>Medical Emergency</option>
                      <option>Education</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', fontSize: '1.1rem', marginTop: '16px', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? (
                      <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                    ) : (
                      <>Submit Application <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <CheckCircle size={64} color="var(--status-success)" />
              </div>
              <h2 style={{ marginBottom: '16px' }}>Application Submitted!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Your loan application for <strong>₹{formData.amount.toLocaleString()}</strong> has been successfully submitted to our partner NBFCs. You will be notified of the final status shortly.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ padding: '12px 32px' }}>
                Return to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoanApply;
