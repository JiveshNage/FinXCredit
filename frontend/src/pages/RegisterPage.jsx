import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, BadgeCheck, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  
  // Step 1: Details
  const [formData, setFormData] = useState({
    name: '',
    place: '',
    phone: '',
    email: '',
    password: ''
  });
  
  // Step 2: OTP
  const [otp, setOtp] = useState('');
  
  // Step 3: Success
  const [uniqueId, setUniqueId] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      setStep(2); // Move to OTP
    } catch (err) {
      setError(err.message || 'Failed to initiate registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.email, otp: otp, purpose: "signup" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      const data = await response.json();
      setUniqueId(data.user.id);
      setStep(3); // Move to Success Screen
      
      // Auto login in the background
      // Note: We don't have access_token returned in standard signup_verify_otp unless backend was updated to return it.
      // Assuming backend sets HttpOnly cookies, we might not need to manually call `login(data.user, token)` if we rely on cookies, 
      // but let's call context login with user data.
      if (data.user) {
         login(data.user, null);
      }
    } catch (err) {
      setError(err.message || 'OTP Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Elements */}
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '10%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ position: 'relative', zIndex: 10, overflow: 'hidden', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', padding: '40px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(6, 78, 59, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <BadgeCheck size={32} color="var(--status-success)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: 0, marginBottom: '8px' }}>Join CreditBridge</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>Create your digital financial identity.</p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleInitiate} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input
                    type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ paddingLeft: '2.5rem', width: '100%' }} placeholder="Rakesh Kumar"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>City / Place</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input
                    type="text" required value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})}
                    style={{ paddingLeft: '2.5rem', width: '100%' }} placeholder="Mumbai, Maharashtra"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    style={{ paddingLeft: '2.5rem', width: '100%' }} placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input
                    type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ paddingLeft: '2.5rem', width: '100%' }} placeholder="rakesh@example.com"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Create Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input
                    type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    style={{ paddingLeft: '2.5rem', width: '100%' }} placeholder="Minimum 8 characters"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', width: '100%' }}>
                {loading ? 'Processing...' : 'Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerify} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}
            >
              <div>
                <h3 style={{ marginBottom: '8px' }}>Verify Your Email</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We've sent a 6-digit code to <strong>{formData.email}</strong></p>
              </div>

              <div className="input-group">
                <input
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.5rem', fontWeight: 'bold' }} 
                  placeholder="------" maxLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ width: '100%' }} disabled={loading}>
                Back
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle size={64} color="var(--status-success)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Registration Complete!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Welcome to CreditBridge. Your account has been securely provisioned.</p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--brand-primary)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Unique User ID</div>
                 <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'white', wordBreak: 'break-all' }}>{uniqueId}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)', marginTop: '8px' }}>Please save this ID for admin support.</div>
              </div>

              <button onClick={() => navigate('/apply')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                Go to Dashboard <ArrowRight size={18}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--brand-primary)', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default RegisterPage;
