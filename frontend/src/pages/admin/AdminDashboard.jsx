import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Activity, AlertTriangle, ShieldCheck, ArrowUpRight, LogOut, RefreshCw, Loader } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      // Fetch stats and applications in parallel
      const [statsRes, appsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats', { credentials: 'include' }),
        fetch('http://localhost:8000/api/admin/applications', { credentials: 'include' })
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setRecentApps(appsData.slice(0, 10)); // Show latest 10
      }
    } catch (err) {
      console.warn("Failed to fetch admin data:", err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (ds) => {
    if (!ds) return '—';
    return new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="app-container">
      {/* Admin Sidebar */}
      <div style={{ width: '260px', borderRight: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', padding: '24px', backdropFilter: 'blur(20px)' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>CreditBridge</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '40px' }}>ADMIN CONTROL</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', background: 'var(--brand-primary-glow)', color: 'var(--brand-secondary)', fontWeight: '600' }}>
            <Activity size={20}/> Overview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            <Users size={20}/> User Management
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={20}/> ML Rule Settings
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--status-error)' }}>
            <AlertTriangle size={20}/> Fraud Alerts ({stats?.fraud_alerts_count || 0})
          </div>
        </div>
        
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>
          <LogOut size={20}/> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1>Admin Overview</h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={fetchAllData} disabled={refreshing} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <div style={{ background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid var(--brand-primary)' }}>
                🟢 System: {stats ? 'Connected' : 'Loading...'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
              <Loader size={36} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Connecting to database...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards — from real /api/admin/stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ borderTop: '4px solid var(--brand-primary)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Registered Workers</p>
                  <h2 style={{ fontSize: '2.5rem' }}>{stats?.total_users?.toLocaleString() || 0}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Active users on platform</p>
                </div>
                
                <div className="glass-card" style={{ borderTop: '4px solid var(--brand-secondary)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Applications</p>
                  <h2 style={{ fontSize: '2.5rem' }}>{stats?.total_applications?.toLocaleString() || 0}</h2>
                  <p style={{ color: 'var(--status-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    <ArrowUpRight size={16}/> {stats?.approval_rate || 0}% approval rate
                  </p>
                </div>

                <div className="glass-card" style={{ borderTop: '4px solid var(--status-success)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Average Credit Score</p>
                  <h2 style={{ fontSize: '2.5rem' }}>{stats?.average_score || 0}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Out of 100 points</p>
                </div>

                <div className="glass-card" style={{ borderTop: '4px solid var(--status-error)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Fraud Flags</p>
                  <h2 style={{ fontSize: '2.5rem', color: stats?.fraud_alerts_count > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>
                    {stats?.fraud_alerts_count || 0}
                  </h2>
                  <p style={{ color: stats?.fraud_alerts_count > 0 ? 'var(--status-error)' : 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                    {stats?.fraud_alerts_count > 0 ? <><AlertTriangle size={16} style={{marginRight:'4px'}}/> Action Required</> : 'No alerts'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                 
                 {/* Left - Real Application Pipeline */}
                 <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                   <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h3 style={{ margin: 0 }}>Recent Applications Pipeline</h3>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{recentApps.length} shown</span>
                   </div>
                   
                   {recentApps.length === 0 ? (
                     <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                       No applications in the system yet.
                     </div>
                   ) : (
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <thead>
                         <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>ID</th>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>User</th>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Score</th>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Risk</th>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                           <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Date</th>
                         </tr>
                       </thead>
                       <tbody>
                         {recentApps.map(app => (
                           <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                             <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>#{app.id}</td>
                             <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{app.user_name}</td>
                             <td style={{ padding: '16px 24px', color: app.score > 70 ? 'var(--status-success)' : app.score > 40 ? 'var(--status-warning)' : 'var(--status-error)', fontWeight: 'bold' }}>{app.score}</td>
                             <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{app.risk_level}</td>
                             <td style={{ padding: '16px 24px' }}>
                               <span style={{ 
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                  background: app.status === 'Approved' ? 'rgba(16,185,129,0.1)' : app.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: app.status === 'Approved' ? 'var(--status-success)' : app.status === 'Rejected' ? 'var(--status-error)' : 'var(--status-warning)'
                               }}>
                                 {app.is_flagged ? '⚠ Flagged' : app.status}
                               </span>
                             </td>
                             <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(app.date)}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   )}
                 </div>

                 {/* Right - ML Engine Controls */}
                 <div className="glass-card" style={{ height: 'fit-content' }}>
                   <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                     <ShieldCheck className="text-gradient" /> Engine Toggles
                   </h3>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                       <div>
                         <span style={{ fontWeight: 'bold', display: 'block' }}>Determinism Engine</span>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rule-based transparent scoring</span>
                       </div>
                       <input type="checkbox" checked={true} readOnly style={{ accentColor: 'var(--status-success)', width: '20px', height: '20px' }} />
                     </div>

                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                       <div>
                         <span style={{ fontWeight: 'bold', display: 'block' }}>XGBoost Override</span>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ML risk detection fallback layer</span>
                       </div>
                       <input type="checkbox" checked={true} readOnly style={{ accentColor: 'var(--status-success)', width: '20px', height: '20px' }} />
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                         <span style={{ fontWeight: 'bold', display: 'block' }}>Strict OTP Enforce</span>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Require 2FA on riskier logins</span>
                       </div>
                       <input type="checkbox" checked={false} readOnly style={{ accentColor: 'var(--brand-primary)', width: '20px', height: '20px' }} />
                     </div>
                     
                     <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Model</div>
                       <div style={{ fontWeight: 'bold' }}>XGBoost Pan-India v2</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>48 cities • 22 states • 10 job types</div>
                     </div>
                   </div>
                 </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
