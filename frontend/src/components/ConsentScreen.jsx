import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';

const ConsentScreen = ({ onConsent }) => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);

  const canProceed = agreedTerms && agreedData;

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(6, 78, 59, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
          <Shield size={32} color="var(--accent-green)" />
        </div>
        <h2>Secure Loan Check</h2>
        <p>Before we analyze your alternative credit profile, we need your consent as per RBI Digital Lending Compliance.</p>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '1.5rem', borderRadius: '15px', marginBottom: '2rem' }}>
        <div className="checkbox-wrap">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
          />
          <label htmlFor="terms" style={{ fontSize: '0.875rem', color: 'var(--text-dark)' }}>
            I agree to the Terms of Service and declare that the financial information provided is accurate for KYC verification purposes.
          </label>
        </div>
        
        <div className="checkbox-wrap" style={{ marginBottom: 0 }}>
          <input 
            type="checkbox" 
            id="data" 
            checked={agreedData}
            onChange={(e) => setAgreedData(e.target.checked)}
          />
          <label htmlFor="data" style={{ fontSize: '0.875rem', color: 'var(--text-dark)' }}>
            I consent to the Account Aggregator fetching my simulated transaction history to generate an alternative credit profile.
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="btn-primary" 
          disabled={!canProceed}
          onClick={() => onConsent(false)}
          style={{ background: 'transparent', border: '2px solid var(--accent-orange)', color: 'var(--accent-orange)' }}
        >
          Manual Identity Verification
        </button>
        <button 
          className="btn-primary" 
          disabled={!canProceed}
          onClick={() => onConsent(true)}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: 0 }}
        >
          <span>Fetch via Setu AA</span>
          <CheckCircle2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default ConsentScreen;
