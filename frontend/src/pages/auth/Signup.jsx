import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import { useAuth } from '../../context/AuthContext';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Mail, Phone, User, Lock, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    worker_type: 'Freelancer'
  });

  const handleInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(await res.text());
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerify = async (otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: formData.email, otp: otpCode, purpose: 'signup' })
      });
      if (!res.ok) throw new Error("Invalid OTP");
      const data = await res.json();
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Incorrect code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* Background Atmosphere */}
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '-10%' }}></div>
      <div className="grid-bg"></div>

      <div className="auth-box glass-card">
        {step === 1 ? (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Join CreditBridge AI to check your eligibility</p>
            
            {error && <div style={{ color: 'var(--status-error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
            
            <form onSubmit={handleInitiate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="text"
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="email"
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Phone Number (+91)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="tel"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="password"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Worker Type</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <select className="input-field" style={{ paddingLeft: '40px', appearance: 'none' }}
                    onChange={(e) => setFormData({...formData, worker_type: e.target.value})}>
                    <option>Auto Driver</option>
                    <option>Delivery Partner</option>
                    <option>Freelancer</option>
                    <option>Shop Owner</option>
                    <option>Street Vendor</option>
                    <option>Domestic Worker</option>
                    <option>Construction Worker</option>
                    <option>Farmer</option>
                    <option>Tailor</option>
                    <option>Electrician/Plumber</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <span style={{ margin: '0 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>

              <button 
                type="button" 
                onClick={async () => {
                  try {
                    const result = await signInWithPopup(auth, googleProvider);
                    const idToken = await result.user.getIdToken();
                    
                    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ token: idToken })
                    });
                    
                    if (!res.ok) throw new Error("Sign in failed");
                    const data = await res.json();
                    login(data.user);
                    navigate('/dashboard');
                  } catch (err) {
                    console.error(err);
                    setError("Google Sign-up failed.");
                  }
                }}
                className="btn-secondary" 
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', background: 'white', color: 'black', border: 'none' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Sign up with Google
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Verify Identity</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
              We sent a 6-digit code to <br/><strong style={{color:'var(--text-primary)'}}>{formData.email}</strong>
            </p>
            
            <OtpInput 
              length={6} 
              onComplete={handleVerify} 
              error={error} 
              onResend={() => handleInitiate({preventDefault:()=>null})} 
            />
            
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              {loading && <p style={{ color: 'var(--text-muted)' }}>Verifying...</p>}
              <button 
                className="btn-secondary" 
                style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.9rem' }} 
                onClick={() => setStep(1)}
              >
                Go Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
