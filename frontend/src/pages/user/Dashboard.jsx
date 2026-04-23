import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, FileText, CheckCircle, Sliders, User as UserIcon, LogOut, 
  Search, Bell, Plus, TrendingUp, TrendingDown, Activity, ArrowRight, Loader
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Sidebar = ({ current }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navs = [
    { label: 'Overview', icon: <LayoutDashboard size={20}/>, path: '/dashboard', id: 'dashboard' },
    { label: 'Apply Now', icon: <CheckCircle size={20}/>, path: '/apply', id: 'apply' },
    { label: 'My Loans', icon: <FileText size={20}/>, path: '/history', id: 'history' },
    { label: 'Credit Simulator', icon: <Sliders size={20}/>, path: '/eligibility', id: 'eligibility' },
    { label: 'Profile', icon: <UserIcon size={20}/>, path: '/profile', id: 'profile' },
  ];

  return (
    <div style={{ 
      width: '260px', 
      borderRight: '1px solid var(--border-subtle)', 
      background: 'rgba(0,0,0,0.2)', 
      backdropFilter: 'blur(20px)',
      display: 'flex', 
      flexDirection: 'column', 
      padding: '24px',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' }}>
         <div style={{ background: 'var(--brand-gradient)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
         </div>
         <h2 style={{ fontSize: '1.4rem', margin: 0 }}>CreditBridge</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>MAIN MENU</div>
        {navs.map(nav => (
          <Link key={nav.id} to={nav.path} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px',
            background: current === nav.id ? 'var(--brand-primary-glow)' : 'transparent',
            color: current === nav.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: current === nav.id ? '1px solid var(--border-focus)' : '1px solid transparent',
            fontWeight: current === nav.id ? '600' : '500',
            transition: 'all var(--transition-fast)'
          }}>
            <div style={{ color: current === nav.id ? 'var(--brand-secondary)' : 'inherit' }}>
              {nav.icon}
            </div>
            {nav.label}
          </Link>
        ))}
      </div>
      
      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px',
        background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', border: '1px solid rgba(239, 68, 68, 0.2)', 
        cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit', fontWeight: 'bold', transition: 'all 0.2s'
      }}>
        <LogOut size={20}/> Logout
      </button>
    </div>
  );
};

// SVG component to bypass missing Zap import in Sidebar
const Zap = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [latestApp, setLatestApp] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/applications/', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setAllApps(data);
          if (data.length > 0) {
            setLatestApp(data[0]); // Most recent application
          }
        }
      } catch (err) {
        console.warn("Could not fetch dashboard data:", err);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // Build chart from real application history
  const chartData = allApps.slice(0, 6).reverse().map((app, i) => ({
    name: app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short' }) : `App ${i+1}`,
    value: app.score || 0
  }));

  // Derive dashboard values from real data
  const currentScore = latestApp?.score || 0;
  const riskLevel = latestApp?.risk_level || 'No Data';
  const decision = latestApp?.decision || 'No Application Yet';
  const cibilScore = latestApp?.cibil_score;
  const loanSuggestion = latestApp?.loan_suggestion || '—';
  const isAAVerified = latestApp?.is_aa_verified || false;

  // Estimate eligibility from score (simple mapping)
  const estimatedEligibility = currentScore >= 80 ? '₹3,00,000' 
    : currentScore >= 60 ? '₹1,50,000' 
    : currentScore >= 40 ? '₹50,000'
    : currentScore > 0 ? '₹25,000' : '—';

  const eligibilityPercent = Math.min(currentScore, 100);

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Atmosphere */}
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="dashboard" />
      
      {/* Main Dashboard Layout (3 Columns) */}
      <div style={{ flex: 1, display: 'flex', height: '100vh', overflow: 'hidden' }}>
        
        {/* Center Column: Primary Metrics & Charts */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', borderRight: '1px solid var(--border-subtle)', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.2rem' }}>Dashboard</h1>
            <Link to="/apply" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              <Plus size={18} /> New Loan
            </Link>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
              <Loader size={36} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Loading your financial data...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Large Hero Widget (Purple Banner) */}
              <div className="glass-card" style={{ 
                background: decision === 'Approved' 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(59, 130, 246, 0.4))'
                  : decision === 'Rejected'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(139, 92, 246, 0.4))'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(59, 130, 246, 0.4))', 
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '40px', 
                borderRadius: '24px',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative background shapes for the card */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.8rem', marginBottom: '20px' }}>
                    <Activity size={14} color="var(--brand-secondary)" /> 
                    {isAAVerified ? 'Account Aggregator Verified' : 'AI Risk Assessment Active'}
                  </div>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'white' }}>
                    {latestApp 
                      ? decision === 'Approved' ? 'Your Credit Health is Strong.' 
                        : decision === 'Rejected' ? 'Credit Needs Improvement.'
                        : 'Credit Under Review.'
                      : `Welcome, ${user?.name || 'User'}!`
                    }
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '24px' }}>
                    {latestApp 
                      ? `Your latest assessment scored ${currentScore}/100 — ${decision}.`
                      : 'Complete your first loan application to see your credit insights.'
                    }
                  </p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {cibilScore && (
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 24px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>CIBIL Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cibilScore}</div>
                      </div>
                    )}
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 24px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Trust Score</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentScore >= 60 ? 'var(--status-success)' : currentScore > 0 ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                        {currentScore > 0 ? `${currentScore}/100` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              {chartData.length > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.3rem' }}>Score History</h3>
                    <div className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      {allApps.length} Application{allApps.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="glass-card" style={{ height: '300px', padding: '24px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="url(#colorGradiant)" radius={[4, 4, 0, 0]} barSize={40} />
                        <defs>
                          <linearGradient id="colorGradiant" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand-secondary)" stopOpacity={1} />
                            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {!latestApp && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px', marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '12px' }}>No Applications Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start by applying for a credit assessment to see your dashboard come alive.</p>
                  <Link to="/apply" className="btn-primary">Apply Now</Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Stats Side Panel */}
        <div style={{ width: '380px', padding: '40px 30px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10 }}>
          
          {/* Top Bar (Search & Profile) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
             <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '100px', border: '1px solid var(--border-subtle)', flex: 1, marginRight: '16px' }}>
               <Search size={16} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
               <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
             </div>
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} title="No new notifications">
                  <Bell size={20} color="var(--text-secondary)" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--brand-secondary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'} />
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)', border: '2px solid var(--bg-primary)' }}></div>
                </div>
                <Link to="/profile" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, transform 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-secondary)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  <UserIcon size={20} />
                </Link>
             </div>
          </div>

          {/* Calculator Widget */}
          <div className="glass-card" style={{ marginBottom: '32px', padding: '30px' }}>
             <h4 style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '16px' }}>Estimated Eligibility</h4>
             <h2 style={{ fontSize: '3rem', marginBottom: '8px', lineHeight: 1 }}>{estimatedEligibility}</h2>
             
             <div style={{ marginTop: '24px', marginBottom: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                  <span>₹0</span>
                  <span>₹5L</span>
               </div>
               {/* Eligibility progress bar */}
               <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative' }}>
                  <div style={{ width: `${eligibilityPercent}%`, height: '100%', background: 'var(--brand-gradient)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                  <div style={{ position: 'absolute', left: `${eligibilityPercent}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', background: 'white', borderRadius: '50%', border: '4px solid var(--brand-primary)', boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}></div>
               </div>
             </div>

             <Link to="/apply" className="btn-primary" style={{ width: '100%', padding: '16px', textAlign: 'center' }}>
               {latestApp ? 'Apply Again' : 'Check Eligibility'}
             </Link>
          </div>

          {/* Mini Stat Cards - from real data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
             <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Latest Decision</div>
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: decision === 'Approved' ? 'var(--status-success)' : decision === 'Rejected' ? 'var(--status-error)' : 'var(--status-warning)' }}>
                     {decision}
                   </div>
                </div>
                {decision === 'Approved' ? <TrendingUp color="var(--status-success)" /> : <TrendingDown color="var(--status-error)" />}
             </div>
             
             <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Risk Level</div>
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{riskLevel}</div>
                </div>
                <Activity color="var(--brand-primary)" />
             </div>
          </div>

          {/* Loan Suggestion Card */}
          <div className="glass-card" style={{ 
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.4))',
            padding: '30px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden'
          }}>
             <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%238b5cf6\' fill-opacity=\'0.5\' d=\'M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,170.7C672,171,768,117,864,106.7C960,96,1056,128,1152,144C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: 'cover' }}></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <span style={{ fontWeight: 600 }}>Loan Suggestion</span>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem' }}>
                  {allApps.length} App{allApps.length !== 1 ? 's' : ''}
                </div>
             </div>
             <h2 style={{ fontSize: '2rem', marginBottom: '8px', position: 'relative', zIndex: 2 }}>{loanSuggestion}</h2>
             <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '0.9rem', position: 'relative', zIndex: 2 }}>
                View All Applications <ArrowRight size={16} />
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
export { Sidebar };
