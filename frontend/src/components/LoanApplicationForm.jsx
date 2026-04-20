import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserCircle } from 'lucide-react';

const LoanApplicationForm = ({ onSubmit, prefilledData }) => {
  const [formData, setFormData] = useState({
    city: 'Raipur',
    job_type: 'Delivery Partner',
    income: 25000,
    expenses: 12000,
    savings: 5000,
    loan_amount: 50000,
    txn_frequency: 150,
    digital_ratio: 0.8,
    income_volatility: 0.2,
    late_night_ratio: 0.3
  });

  // Inject AA Data if present
  React.useEffect(() => {
    if (prefilledData && prefilledData.extracted_features) {
      setFormData(prev => ({
        ...prev,
        ...prefilledData.extracted_features
      }));
    }
  }, [prefilledData]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' || type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate short ML processing delay
    setTimeout(() => {
      onSubmit(formData);
    }, 1500);
  };

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: '600px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(192, 72, 24, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
          <UserCircle size={32} color="var(--accent-orange)" />
        </div>
        <h2>Gig Worker Profile</h2>
        <p>Your simulated alternative data has been aggregated.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">City Base</label>
            <select name="city" value={formData.city} onChange={handleChange} className="form-input">
              <option value="Raipur">Raipur</option>
              <option value="Durg">Durg</option>
              <option value="Bhilai">Bhilai</option>
              <option value="Bilaspur">Bilaspur</option>
              <option value="Korba">Korba</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-input">
              <option value="Delivery Partner">Delivery Partner</option>
              <option value="Auto Driver">Auto Driver</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Shop Owner">Shop Owner</option>
              <option value="Street Vendor">Street Vendor</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Monthly Income</span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{formData.income.toLocaleString()}</span>
          </label>
          <input 
            type="range" name="income" min="5000" max="80000" step="1000"
            value={formData.income} onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Monthly Expenses</span>
            <span style={{ color: 'var(--accent-orange)' }}>₹{formData.expenses.toLocaleString()}</span>
          </label>
          <input 
            type="range" name="expenses" min="1000" max="60000" step="500"
            value={formData.expenses} onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Calculated Savings (₹)</label>
          <input 
            type="number" name="savings" value={formData.savings} onChange={handleChange} className="form-input" 
          />
        </div>

        <div className="form-group" style={{ background: 'rgba(6, 78, 59, 0.05)', padding: '1rem', borderRadius: '10px', marginTop: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(6, 78, 59, 0.2)' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Requested Loan Amount</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>₹{formData.loan_amount.toLocaleString()}</span>
          </label>
          <input 
            type="range" name="loan_amount" min="10000" max="300000" step="5000"
            value={formData.loan_amount} onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Digital Ratio: {(formData.digital_ratio * 100).toFixed(0)}%</label>
            <input type="range" name="digital_ratio" min="0" max="1" step="0.05" value={formData.digital_ratio} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Late Night %: {(formData.late_night_ratio * 100).toFixed(0)}%</label>
            <input type="range" name="late_night_ratio" min="0" max="1" step="0.05" value={formData.late_night_ratio} onChange={handleChange} />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {isSubmitting ? 'ML Engine Analyzing...' : 'Generate AI Loan Decision'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>
    </motion.div>
  );
};

export default LoanApplicationForm;
