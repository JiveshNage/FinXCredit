import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Activity, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, logout, user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           alert("Not authorized or session expired.");
           logout();
           navigate("/login");
        }
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setApplications(data);
    } catch (e) {
      console.error(e);
      // Fallback or handle error quietly
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-muted)' }} 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
            <Database size={32} color="var(--accent-green)" /> Central Admin Console
          </h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Activity size={16} /> Real-time Audit & ML Decisions for {user?.username}
          </p>
        </div>
        
        <button 
          className="btn-primary" 
          style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 78, 59, 0.1)', color: 'var(--accent-green)', padding: '0.75rem 1.5rem', borderRadius: '12px' }} 
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
          {loading ? 'Syncing...' : 'Refresh Feed'}
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '100%', padding: '1.5rem', borderRadius: '24px' }}>
        {loading && applications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <RefreshCw size={40} color="var(--accent-green)" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
             <p style={{ color: 'var(--text-muted)' }}>Connecting to secure databases...</p>
             <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Ref ID</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Job Base</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Algorithmic Score</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Risk Vector</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>System Decision</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Source Route</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No verification logs available.
                    </td>
                  </tr>
                ) : applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      <span style={{ fontWeight: 700, display: 'block' }}>#{app.id}</span>
                      {app.user_id && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.user_id.substring(0, 13)}...</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 500 }}>{app.job_type}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.city}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: app.is_eligible ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                        {app.alt_credit_score}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-dark)' }}>
                      {(app.prob_default * 100).toFixed(1)}% <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>default</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.is_eligible ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(6, 78, 59, 0.1)', color: 'var(--accent-green)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(6, 78, 59, 0.2)' }}>
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(192, 72, 24, 0.1)', color: 'var(--accent-orange)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(192, 72, 24, 0.2)' }}>
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 500 }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '5px', background: app.verification_source.includes('Setu') ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)', color: app.verification_source.includes('Setu') ? '#4f46e5' : 'var(--text-muted)' }}>
                        {app.verification_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
