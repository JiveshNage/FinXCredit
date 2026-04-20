import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConsentScreen from '../components/ConsentScreen';
import LoanApplicationForm from '../components/LoanApplicationForm';
import DecisionDashboard from '../components/DecisionDashboard';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const UserFlow = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Simulated Account Aggregator Auto-Fill Logic
  const [aaData, setAaData] = useState(null);

  const handleConsent = async (useAccountAggregator) => {
    if (useAccountAggregator) {
      setLoading(true);
      setStep(3); // Temporary loading overlay
      try {
        // Pseudo-random phone number to get pseudo-random AA data
        const pseudoPhone = "+9198765" + Math.floor(10000 + Math.random() * 90000);
        const response = await fetch(`${API_BASE_URL}/mock-account-aggregator/${pseudoPhone}`);
        const data = await response.json();
        setAaData(data); // Pass to LoanApplicationForm
        setLoading(false);
        setStep(2);
      } catch (error) {
        console.error("AA Fetch Error:", error);
        alert("Failed to connect to Setu AA Simulation.");
        setLoading(false);
        setStep(2); // Still proceed manually
      }
    } else {
      // Manual entry
      setStep(2);
    }
  };

  const handleApplicationSubmit = async (formData) => {
    setLoading(true);
    setStep(3); // Loading step overlay
    
    // Inject verification source
    const payload = {
      ...formData,
      verification_source: aaData ? "Setu Account Aggregator Framework" : "Manual KYC"
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
         if (response.status === 401) {
            alert("Session expired, please log in again.");
            logout();
            navigate('/login');
            return;
         }
         throw new Error("Failed to connect");
      }

      const data = await response.json();
      setResult(data);
      setLoading(false);
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to connect to Machine Learning Engine.");
      setStep(2);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAaData(null);
    setStep(1);
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      {/* Header Logo */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: '#047857', letterSpacing: '-1px', marginBottom: '2rem', cursor: 'pointer', fontWeight: 800, fontSize: '2rem' }}
        onClick={() => navigate('/')}
      >
        FinX <span style={{ color: '#f97316' }}>Credit</span>
      </motion.h1>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <ConsentScreen key="consent" onConsent={handleConsent} />
        )}
        
        {step === 2 && (
          <LoanApplicationForm key="form" onSubmit={handleApplicationSubmit} prefilledData={aaData} />
        )}

        {step === 3 && loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#1e293b', marginTop: '4rem' }}
          >
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 600 }}>{aaData ? "Setu Aggregator Syncing..." : "AI Engine Processing Footprint..."}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {step === 3 && !loading && result && (
          <DecisionDashboard key="dashboard" result={result} onReset={handleReset} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserFlow;
