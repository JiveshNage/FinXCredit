import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Activity, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [trustworthyPeople, setTrustworthyPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Applications
      const appRes = await fetch(`${API_BASE_URL}/api/admin/applications`, {
        credentials: 'include'
      });
      // Fetch Stats
      const statRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: 'include'
      });
      // Fetch Trustworthy People
      const peopleRes = await fetch(`${API_BASE_URL}/api/admin/trustworthy-people`, {
        credentials: 'include'
      });
      
      if ([appRes, statRes, peopleRes].some((res) => res.status === 401 || res.status === 403)) {
        setError("Not authorized or session expired. Redirecting to login...");
        setTimeout(() => { logout(); navigate("/admin-login"); }, 2000);
        return;
      }
      if (!appRes.ok || !statRes.ok || !peopleRes.ok) {
        throw new Error('Failed to fetch');
      }
      setApplications(await appRes.json());
      setStats(await statRes.json());
      setTrustworthyPeople(await peopleRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', color: '#94a3b8' }} 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Back to Consumer App
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', margin: 0 }}>
            <Database size={32} color="#3b82f6" /> Central Admin Console
          </h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginTop: '10px' }}>
            <Activity size={16} /> Portfolio Management & Risk Underwriting
          </p>
        </div>
        
        <button 
          className="btn-primary" 
          style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }} 
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
          {loading ? 'Syncing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Portfolio Analytics Section */}
      {stats && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Total Portfolio Size</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.total_applications}</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Approval Rate</p>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>{stats.approval_rate}%</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Average Score</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.average_score}</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Fraud Alerts</p>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#ef4444' }}>{stats.fraud_alerts_count}</h3>
         </div>
      </div>
      )}

      {trustworthyPeople.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Verified Trustworthy Members</h3>
              <p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Shared from the landing page and stored in the credit database.</p>
            </div>
            <span style={{ color: '#c7d2fe', fontSize: '0.95rem' }}>{trustworthyPeople.length} profiles</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {trustworthyPeople.map((person) => (
              <div key={person.id} style={{ background: '#111827', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{person.name}</h4>
                    <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{person.role}{person.location ? ` · ${person.location}` : ''}</p>
                  </div>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{person.rating?.toFixed(1)}★</span>
                </div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.75, marginBottom: '1rem' }}>{person.quote}</p>
                {person.badge && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700 }}>{person.badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {loading && applications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <RefreshCw size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
             <p style={{ color: '#94a3b8' }}>Connecting to secure databases...</p>
             <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Ref ID</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>User Name</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>ML Score</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Risk Flags</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Decision</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      No verification logs available.
                    </td>
                  </tr>
                ) : applications.map((app) => (
                  <tr 
                    key={app.id} 
                    onClick={() => navigate(`/admin/application/${app.id}`)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      <span style={{ fontWeight: 700, display: 'block' }}>#{app.id}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 500 }}>{app.user_name}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: app.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                        {app.score}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: app.is_flagged ? '#ef4444' : '#94a3b8' }}>
                      {app.is_flagged ? "Fraud Risk Detected" : "Standard"}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.status === 'Approved' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <XCircle size={14} /> {app.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 500, color: '#3b82f6' }}>
                      View Deep Analytics &rarr;
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
