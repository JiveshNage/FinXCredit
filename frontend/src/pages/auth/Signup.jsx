import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OtpInput from '../../components/auth/OtpInput';
import { useAuth } from '../../context/AuthContext';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Mail, User, Lock, Briefcase, CheckCircle, Clock, ChevronRight } from 'lucide-react';
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
    password: '',
    confirmPassword: '',
    worker_type: 'Freelancer'
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({...formData, password});
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwordStrength < 3) {
      setError("Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          worker_type: formData.worker_type
        })
      });
      if (!res.ok) throw new Error(await res.text());
      nextStep();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (otpCode) => {
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
      nextStep(); // Move to profile completion
    } catch (err) {
      console.error(err);
      setError("Incorrect code. Please try again.");
    }
    setLoading(false);
  };

  const handleProfileComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // User is already logged in from OTP verification, just navigate
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Failed to complete profile. Please try again.");
    }
    setLoading(false);
  };

  const renderStepper = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: step === stepNum ? 'var(--brand-primary)' :
                       step > stepNum ? 'var(--status-success)' : 'rgba(255,255,255,0.1)',
            color: step >= stepNum ? 'white' : 'var(--text-muted)',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            {step > stepNum ? <CheckCircle size={20} /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div style={{
              width: '60px',
              height: '2px',
              background: step > stepNum ? 'var(--status-success)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s ease'
            }} />
          )}
        </div>
      ))}
    </div>
  );

  const renderPasswordStrength = () => {
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              style={{
                flex: 1,
                height: '4px',
                background: level <= passwordStrength ? colors[passwordStrength - 1] || colors[0] : 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
        <p style={{
          fontSize: '0.8rem',
          color: passwordStrength > 0 ? colors[passwordStrength - 1] : 'var(--text-muted)',
          margin: 0
        }}>
          {passwordStrength > 0 ? levels[passwordStrength - 1] : 'Password strength'}
        </p>
      </div>
    );
  };

  return (
    <div className="auth-container">
      {/* Background Atmosphere */}
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '-10%' }}></div>
      <div className="grid-bg"></div>

      <div className="auth-box glass-card" style={{ maxWidth: '500px' }}>
        {renderStepper()}

        {step === 1 && (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Join CreditBridge AI to check your eligibility</p>

            {error && <div style={{ color: 'var(--status-error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    type="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                  />
                </div>
                {renderPasswordStrength()}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                  <input
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '20px', background: '#7C5CFC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Continue'} <ChevronRight size={16} />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Verify Email</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>
              We've sent a verification code to<br/>
              <strong style={{color:'var(--text-primary)'}}>{formData.email}</strong>
            </p>

            <OtpInput
              length={6}
              onComplete={handleVerifyOtp}
              error={error}
              onResend={() => handleStep1Submit({preventDefault:()=>null})}
              timer={30}
            />

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              {loading && <p style={{ color: 'var(--text-muted)' }}>Verifying...</p>}
              <button
                className="btn-secondary"
                style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.9rem' }}
                onClick={prevStep}
              >
                Go Back
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Complete Profile</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Tell us about your work to personalize your experience</p>

            {error && <div style={{ color: 'var(--status-error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleProfileComplete} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="label">Worker Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { value: 'Freelancer', label: 'Freelancer' },
                    { value: 'Delivery Partner', label: 'Delivery Partner' },
                    { value: 'Street Vendor', label: 'Street Vendor' },
                    { value: 'Shop Owner', label: 'Shop Owner' },
                    { value: 'Auto Driver', label: 'Auto Driver' },
                    { value: 'Domestic Worker', label: 'Domestic Worker' }
                  ].map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setFormData({...formData, worker_type: type.value})}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${formData.worker_type === type.value ? '#7C5CFC' : 'rgba(255,255,255,0.1)'}`,
                        background: formData.worker_type === type.value ? 'rgba(124, 92, 252, 0.1)' : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: formData.worker_type === type.value ? '600' : '400'
                      }}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <div style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: '#10b981'
                }}>
                  <CheckCircle size={16} />
                  Identity Verified
                </div>
                <div style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: '#6b7280'
                }}>
                  <Clock size={16} />
                  Account Aggregator (Connect later)
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '10px', background: '#7C5CFC' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                onClick={prevStep}
              >
                Go Back
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
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
          </>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
