import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, BadgeCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to 'user'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      login(data.user, data.access_token);
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/apply');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ position: 'relative', overflow: 'hidden', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(6, 78, 59, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BadgeCheck size={32} color="var(--accent-green)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: 0 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Join FinX to secure AI-backed loans.</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(192, 72, 24, 0.1)', border: '1px solid rgba(192, 72, 24, 0.3)', borderRadius: '10px', color: 'var(--accent-orange)', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label text-sm font-medium text-gray-300 mb-1">Username</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }}>
                <User size={20} color="var(--text-muted)" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label text-sm font-medium text-gray-300 mb-1">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }}>
                <Lock size={20} color="var(--text-muted)" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Account Type</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRole('user')}
                className="form-input"
                style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: role === 'user' ? 'rgba(6, 78, 59, 0.1)' : 'transparent',
                  borderColor: role === 'user' ? 'var(--accent-green)' : 'rgba(0,0,0,0.1)',
                  color: role === 'user' ? 'var(--accent-green)' : 'var(--text-muted)',
                  fontWeight: role === 'user' ? 600 : 400
                }}
              >
                End User
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className="form-input"
                style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: role === 'admin' ? 'rgba(6, 78, 59, 0.1)' : 'transparent',
                  borderColor: role === 'admin' ? 'var(--accent-green)' : 'rgba(0,0,0,0.1)',
                  color: role === 'admin' ? 'var(--accent-green)' : 'var(--text-muted)',
                  fontWeight: role === 'admin' ? 600 : 400
                }}
              >
                Administrator
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent-green)', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
