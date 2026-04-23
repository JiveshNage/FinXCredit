import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileCheck, Landmark, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Dashboard';

const Apply = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();  // Assuming useAuth provides token
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  
  // KYC State
  const [kycData, setKycData] = useState({
    pan_number: '',
    aadhaar_number: ''
  });
  
  // Consent State
  const [conAA, setConAA] = useState(false);
  const [conCibil, setConCibil] = useState(false);
  
  // Submission
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to proceed. Please log in and try again.");
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingText("Verifying Identity with UIDAI & NSDL...");
    
    try {
      const res = await fetch('http://localhost:8000/api/applications/kyc-submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Add JWT token
        },
        credentials: 'include',
        body: JSON.stringify(kycData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "KYC Failed: Could not validate credentials. Please check your login status.");
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to proceed. Please log in and try again.");
      return;
    }
    if (!conAA || !conCibil) {
      setError("Explicit consent is required by Law to proceed.");
      return;
    }
    setError(null);
    setLoading(true);
    
    // Simulate complex pipeline loading visuals
    setLoadingText("Initializing Account Aggregator Framework...");
    setTimeout(() => setLoadingText("Fetching Digitally Signed Bank Statements..."), 2000);
    setTimeout(() => setLoadingText("Running CIBIL Bureau Diagnostics..."), 4000);
    setTimeout(() => setLoadingText("Running Heuristics & XGBoost ML Override..."), 6000);
    
    try {
      const res = await fetch('http://localhost:8000/api/applications/calculate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Add JWT token
        },
        credentials: 'include',
        body: JSON.stringify({ consent_aa: conAA, consent_cibil: conCibil })
      });
      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.detail || "Eligibility Check Failed: Could not validate credentials. Please check your login status.");
      }
      const data = await res.json();
      
      setTimeout(() => navigate(`/results/${data.application_id}`), 7000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="apply" />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px', marginTop: '10vh', maxWidth: '600px', margin: '10vh auto 0' }}>
            <Loader size={48} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Processing Eligibility Check</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{loadingText}</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Eligibility Check</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>RBI Compliant e-KYC Verification Process</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
               <div style={{ flex: 1, textAlign: 'center', opacity: step === 1 ? 1 : 0.4 }}>
                  <div style={{ background: step === 1 ? 'var(--brand-gradient)' : 'var(--bg-elevated)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>1</div>
                  <div style={{ fontWeight: 600 }}>e-KYC Verification</div>
               </div>
               <div style={{ flex: 1, textAlign: 'center', opacity: step === 2 ? 1 : 0.4 }}>
                  <div style={{ background: step === 2 ? 'var(--brand-gradient)' : 'var(--bg-elevated', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>2</div>
                  <div style={{ fontWeight: 600 }}>Consent for Eligibility</div>
               </div>
            </div>

            <div className="glass-card">
        {error && <div className="error-box" style={{ marginBottom: '20px', color: 'red' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleKYCSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Shield color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Government ID Verification</h3>
            </div>
            
            <div className="input-group">
              <label>PAN Card Number (10 Alphanumeric)</label>
              <input 
                type="text" 
                placeholder="ABCDE1234F"
                value={kycData.pan_number}
                onChange={e => setKycData({...kycData, pan_number: e.target.value})}
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="input-group">
              <label>Aadhaar Number (12 Digits)</label>
              <input 
                type="text" 
                placeholder="XXXX-XXXX-XXXX"
                value={kycData.aadhaar_number}
                onChange={e => setKycData({...kycData, aadhaar_number: e.target.value})}
                maxLength={12}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Verify Identity</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleDecisionSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FileCheck color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Data Sharing Consent for Eligibility</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               As per RBI DPDP framework, you must authorize us to securely pull your financial data for eligibility assessment.
            </p>

            <div className="input-group" style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-dark)', padding: '15px', borderRadius: '8px' }}>
              <input 
                 type="checkbox" 
                 id="cibil" 
                 checked={conCibil} 
                 onChange={e => setConCibil(e.target.checked)} 
                 style={{ transform: 'scale(1.5)' }} 
              />
              <label htmlFor="cibil" style={{ margin: 0, cursor: 'pointer' }}>
                 <strong>Credit Bureau Ping</strong><br/>
                 <small style={{ color: 'var(--text-secondary)'}}>I authorize a soft-pull of my CIBIL risk score.</small>
              </label>
            </div>

            <div className="input-group" style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-dark)', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <input 
                 type="checkbox" 
                 id="aa" 
                 checked={conAA} 
                 onChange={e => setConAA(e.target.checked)} 
                 style={{ transform: 'scale(1.5)' }} 
              />
              <label htmlFor="aa" style={{ margin: 0, cursor: 'pointer' }}>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <Landmark size={16} /> <strong>Account Aggregator Link</strong>
                 </div>
                 <small style={{ color: 'var(--text-secondary)'}}>Securely transmit JSON bank statements for Income Verification.</small>
              </label>
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '30px' }}>Check Eligibility</button>
            <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Back to e-KYC</button>
          </form>
        )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Apply;