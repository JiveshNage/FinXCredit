import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileCheck, Landmark, UploadCloud, UserCircle, Loader } from 'lucide-react';
import { Sidebar } from './Dashboard';
import { API_BASE_URL } from '../../config';

const Apply = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  // KYC Files
  const [panFile, setPanFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);
  
  // Self Declaration
  const [declaredIncome, setDeclaredIncome] = useState("");
  const [declaredExpenses, setDeclaredExpenses] = useState("");

  const handlePanUpload = async (e) => {
    e.preventDefault();
    if (!panFile) { setError("Please upload a PAN card image."); return; }
    
    setError(null); setLoading(true); setLoadingText("Running OCR on PAN Image...");
    const formData = new FormData();
    formData.append("file", panFile);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/upload/pan`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) throw new Error((await res.json()).detail || "PAN OCR Verification Failed");
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAadhaarUpload = async (e) => {
    e.preventDefault();
    if (!aadhaarFile) { setError("Please upload Aadhaar Offline XML zip."); return; }

    setError(null); setLoading(true); setLoadingText("Parsing Aadhaar XML & Verifying Signature...");
    const formData = new FormData();
    formData.append("file", aadhaarFile);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/upload/aadhaar`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Aadhaar XML Verification Failed");
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  
  const handleDeclarationSubmit = (e) => {
    e.preventDefault();
    if (!declaredIncome || !declaredExpenses) {
        setError("Please declare your financials."); return;
    }
    setStep(4);
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!bankFile) {
      setError("Please upload your bank statement CSV.");
      return;
    }
    setError(null); setLoading(true);
    setLoadingText("Parsing Bank CSV and Running NLP Transaction Categorizer...");
    
    try {
      // 1. Upload Bank CSV
      const formData = new FormData();
      formData.append("file", bankFile);
      
      let res = await fetch(`${API_BASE_URL}/api/applications/upload/bank`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Bank statement parsing failed");
      
      setLoadingText("Running ML Discrepancy & Eligibility Models...");
      
      // 2. Submit Application (with declared financials)
      res = await fetch(`${API_BASE_URL}/api/applications/calculate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            consent_aa: true, 
            consent_cibil: true,
            declared_income: parseFloat(declaredIncome),
            declared_expenses: parseFloat(declaredExpenses)
        })
      });
      
      if (!res.ok) throw new Error((await res.json()).detail || "Eligibility Check Failed");
      
      const data = await res.json();
      setTimeout(() => navigate(`/results/${data.application_id}`), 2000);
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
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Processing Details</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{loadingText}</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>New Loan Application</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Advanced Document ML Verification</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
               {[1, 2, 3, 4].map(s => (
                   <div key={s} style={{ flex: 1, textAlign: 'center', opacity: step >= s ? 1 : 0.4 }}>
                      <div style={{ background: step >= s ? 'var(--brand-gradient)' : 'var(--bg-dark)', borderRadius: '50%', width: '30px', height: '30px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>{s}</div>
                   </div>
               ))}
            </div>

            <div className="glass-card">
        {error && <div className="error-box" style={{ marginBottom: '20px', color: 'red' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handlePanUpload}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Shield color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Step 1: PAN OCR Verification</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               Upload an image of your PAN Card. Our Optical Character Recognition (OCR) engine will automatically extract and validate your details.
            </p>
            
            <div className="input-group" style={{ border: '2px dashed var(--border-subtle)', padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
              <UploadCloud size={32} color="var(--brand-primary)" style={{ margin: '0 auto 10px' }} />
              <label htmlFor="panFile" style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>Click to Upload PAN Image (JPG/PNG)</label>
              <input 
                id="panFile"
                type="file" 
                accept="image/*"
                onChange={e => setPanFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {panFile && <div style={{ marginTop: '10px', color: 'var(--status-success)', fontSize: '14px' }}>Selected: {panFile.name}</div>}
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Run PAN OCR</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAadhaarUpload}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Shield color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Step 2: Aadhaar XML Verification</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               Upload your Offline Aadhaar XML file. We will parse the XML and verify the UIDAI digital signature.
            </p>

            <div className="input-group" style={{ border: '2px dashed var(--border-subtle)', padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
              <UploadCloud size={32} color="var(--brand-primary)" style={{ margin: '0 auto 10px' }} />
              <label htmlFor="aadhaarFile" style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>Click to Upload Aadhaar XML (.zip/.xml)</label>
              <input 
                id="aadhaarFile"
                type="file" 
                accept=".xml,.zip"
                onChange={e => setAadhaarFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {aadhaarFile && <div style={{ marginTop: '10px', color: 'var(--status-success)', fontSize: '14px' }}>Selected: {aadhaarFile.name}</div>}
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Parse Aadhaar XML</button>
            <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Back</button>
          </form>
        )}
        
        {step === 3 && (
          <form onSubmit={handleDeclarationSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <UserCircle color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Step 3: Self-Declared Financials</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               Please estimate your average monthly income and expenses. Our ML engine will later cross-verify this with your bank statements to generate a Discrepancy Score.
            </p>

            <div className="input-group">
              <label>Declared Monthly Income (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 25000"
                value={declaredIncome}
                onChange={e => setDeclaredIncome(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Declared Monthly Expenses (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 15000"
                value={declaredExpenses}
                onChange={e => setDeclaredExpenses(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Continue</button>
            <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Back</button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleFinalSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Landmark color="var(--brand-primary)" />
                <h3 style={{ margin: 0 }}>Step 4: Bank Statement NLP</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               Upload your last 6 months Bank Statement (CSV format). Our NLP Categorizer will extract your true income and behavioral data.
            </p>

            <div className="input-group" style={{ border: '2px dashed var(--border-subtle)', padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
              <UploadCloud size={32} color="var(--brand-primary)" style={{ margin: '0 auto 10px' }} />
              <label htmlFor="bankFile" style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>Click to Upload Bank CSV</label>
              <input 
                id="bankFile"
                type="file" 
                accept=".csv"
                onChange={e => setBankFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {bankFile && <div style={{ marginTop: '10px', color: 'var(--status-success)', fontSize: '14px' }}>Selected: {bankFile.name}</div>}
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '30px' }}>Run Full ML Pipeline</button>
            <button type="button" onClick={() => setStep(3)} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Back</button>
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
