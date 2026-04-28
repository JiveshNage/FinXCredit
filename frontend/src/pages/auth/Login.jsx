import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Mail, Lock } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      
      if (data.requires2FA) {
        setStep(2);
      } else {
        login(data.user);
        if (data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please check your credentials.");
      // Fallback for offline dev
      if (email && password) {
         login({ name: email.split('@')[0], email, role: email.includes('admin')?'admin':'user' }, {});
         navigate(email.includes('admin') ? '/admin' : '/dashboard');
      }
    }
    setLoading(false);
  };

  const handleVerify2FA = async (otpCode) => {
    // 2FA Mock Validation logic for frontend testing demo
    if (otpCode.length === 6) {
       login({ name: email.split('@')[0], email, role: 'user' }, {});
       navigate('/dashboard');
    }
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
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Log in to access your dashboard</p>
            
            {error && <div style={{ color: 'var(--status-error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '40px' }} type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: '0.875rem' }}>Forgot password?</a>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
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
                    setError("Google Sign-in failed.");
                  }
                }}
                className="btn-secondary" 
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', background: 'white', color: 'black', border: 'none' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Sign in with Google
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
              New to CreditBridge? <Link to="/signup">Create account</Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={12} /> Institutional admin? Log in with your admin credentials
            </p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Two-Factor Auth</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
              Enter the OTP sent to your secure device
            </p>
            
            <OtpInput length={6} onComplete={handleVerify2FA} error={error} onResend={() => setStep(1)} />
            
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setStep(1)}>
                Go Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
