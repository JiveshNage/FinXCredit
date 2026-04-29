import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, FileText, CheckCircle, Sliders, User as UserIcon, LogOut, 
  Search, Bell, Plus, TrendingUp, TrendingDown, Activity, ArrowRight, Loader, Lightbulb, Menu, X, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../../config';

const Sidebar = ({ current }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navs = [
    { label: 'Dashboard Overview', icon: <LayoutDashboard size={20}/>, path: '/dashboard', id: 'dashboard' },
    { label: 'Check Eligibility', icon: <CheckCircle size={20}/>, path: '/apply', id: 'apply' },
    { label: 'Loan Application', icon: <Wallet size={20}/>, path: '/loan-apply', id: 'loan-apply' },
    { label: 'Score Simulator', icon: <TrendingUp size={20}/>, path: '/eligibility', id: 'eligibility' },
    { label: 'My Applications', icon: <FileText size={20}/>, path: '/history', id: 'history' },
    { label: 'Financial Tips', icon: <Lightbulb size={20}/>, path: '/tips', id: 'tips' },
    { label: 'Profile Settings', icon: <UserIcon size={20}/>, path: '/profile', id: 'profile' },
  ];

  return (
    <>
      {isMobile && !isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
             position: 'absolute', top: '20px', left: '20px', zIndex: 100,
             background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', 
             color: 'white', borderRadius: '8px', padding: '8px', cursor: 'pointer',
             backdropFilter: 'blur(10px)'
          }}
        >
          <Menu size={24} />
        </button>
      )}

      <div style={{ 
        width: isOpen ? (isMobile ? '100%' : '260px') : (isMobile ? '0px' : '80px'), 
        borderRight: '1px solid var(--border-subtle)', 
        background: isMobile ? 'rgba(11,12,22,0.98)' : 'rgba(0,0,0,0.2)', 
        backdropFilter: 'blur(20px)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: (isOpen || !isMobile) ? '24px 16px' : '0px',
        position: isMobile ? 'absolute' : 'relative',
        zIndex: 99,
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.3s ease-in-out, padding 0.3s ease-in-out'
      }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
             position: 'absolute', top: '24px', right: isOpen ? '16px' : '24px', 
             background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
             transition: 'right 0.3s'
          }}
        >
          {isOpen ? <X size={20} /> : <Menu size={24} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px', marginTop: isOpen ? '0' : '40px', transition: 'all 0.3s' }}>
           <div style={{ background: 'var(--brand-gradient)', minWidth: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
           </div>
           {isOpen && <h2 style={{ fontSize: '1.4rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>CreditBridge</h2>}
        </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {isOpen && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>MAIN MENU</div>}
        {navs.map(nav => (
          <Link key={nav.id} to={nav.path} title={!isOpen ? nav.label : ''} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px',
            background: current === nav.id ? 'var(--brand-primary-glow)' : 'transparent',
            color: current === nav.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: current === nav.id ? '1px solid var(--border-focus)' : '1px solid transparent',
            fontWeight: current === nav.id ? '600' : '500',
            transition: 'all var(--transition-fast)',
            justifyContent: isOpen ? 'flex-start' : 'center'
          }}>
            <div style={{ color: current === nav.id ? 'var(--brand-secondary)' : 'inherit' }}>
              {nav.icon}
            </div>
            {isOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{nav.label}</span>}
          </Link>
        ))}
      </div>
      
      <button onClick={handleLogout} title={!isOpen ? "Logout" : ""} style={{
        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px',
        background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', border: '1px solid rgba(239, 68, 68, 0.2)', 
        cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 'bold', transition: 'all 0.2s',
        justifyContent: isOpen ? 'flex-start' : 'center'
      }}>
        <LogOut size={20}/> {isOpen && <span>Logout</span>}
      </button>
    </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [latestApp, setLatestApp] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/applications/`, {
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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = [];
    
    // Quick links
    const quickLinks = [
      { type: 'Page', title: 'Profile Settings', subtitle: 'Manage your account', path: '/profile', keywords: ['profile', 'account', 'settings'] },
      { type: 'Page', title: 'Check Eligibility', subtitle: 'Apply for a new loan', path: '/apply', keywords: ['apply', 'loan', 'eligibility', 'new'] },
      { type: 'Page', title: 'Score Simulator', subtitle: 'What-if scenarios', path: '/simulator', keywords: ['simulator', 'score', 'what if'] },
      { type: 'Page', title: 'Financial Tips', subtitle: 'Improve your credit', path: '/tips', keywords: ['tips', 'financial', 'improve'] }
    ];
    
    quickLinks.forEach(link => {
      if (link.title.toLowerCase().includes(term) || link.keywords.some(k => k.includes(term))) {
        results.push({ ...link });
      }
    });

    // Search applications
    allApps.forEach(app => {
      if (
        (app.decision && app.decision.toLowerCase().includes(term)) ||
        (app.risk_level && app.risk_level.toLowerCase().includes(term)) ||
        (app.score && app.score.toString().includes(term))
      ) {
        results.push({
          type: 'Application',
          title: `Application - ${app.decision}`,
          subtitle: `Score: ${app.score} | Risk: ${app.risk_level}`,
          path: `/results/${app.id}`
        });
      }
    });
    
    setSearchResults(results.slice(0, 6));
    setShowSearch(true);
  }, [searchTerm, allApps]);

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
  let estimatedEligibility = '—';
  let loanRecText = '';
  let tenureRec = '';
  let emiRec = '';
  let eligibilityPercent = 0;

  if (currentScore >= 80) {
    estimatedEligibility = '₹1,00,000 – ₹5,00,000';
    loanRecText = 'Eligible for ₹1,00,000 – ₹5,00,000';
    tenureRec = '12 - 24 months';
    emiRec = '₹4,500 - ₹22,000 / month';
    eligibilityPercent = 100;
  } else if (currentScore >= 60) {
    estimatedEligibility = '₹10,000 – ₹50,000';
    loanRecText = 'Eligible for ₹10,000 – ₹50,000';
    tenureRec = '3 - 6 months';
    emiRec = '₹1,800 - ₹8,500 / month';
    eligibilityPercent = 10;
  } else if (currentScore > 0) {
    estimatedEligibility = '—';
    loanRecText = 'Currently not eligible. See tips below.';
    tenureRec = 'N/A';
    emiRec = 'N/A';
    eligibilityPercent = 0;
  }

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
            <Link to="/loan-apply" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', position: 'relative' }}>
             <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '100px', border: '1px solid var(--border-subtle)', flex: 1, marginRight: '16px', position: 'relative' }}>
               <Search size={16} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onFocus={() => searchTerm.trim() && setShowSearch(true)}
                 onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                 style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
               />
               
               {/* Search Results Dropdown */}
               {showSearch && (
                 <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'rgba(11, 12, 22, 0.95)', border: '1px solid var(--border-subtle)', borderRadius: '12px', backdropFilter: 'blur(10px)', padding: '8px 0', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                   {searchResults.length > 0 ? (
                     searchResults.map((res, i) => (
                       <Link 
                         key={i} 
                         to={res.path} 
                         style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', color: 'white', transition: 'background 0.2s' }}
                         onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                         onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                       >
                         <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                           {res.type === 'Page' ? <Search size={16} color="var(--brand-secondary)" /> : <FileText size={16} color="var(--status-success)" />}
                         </div>
                         <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{res.title}</div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.subtitle}</div>
                         </div>
                       </Link>
                     ))
                   ) : (
                     <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No results found</div>
                   )}
                 </div>
               )}
             </div>
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/notifications" style={{ position: 'relative', cursor: 'pointer' }} title="Notifications">
                  <Bell size={20} color="var(--text-secondary)" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--brand-secondary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'} />
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)', border: '2px solid var(--bg-primary)' }}></div>
                </Link>
                <Link to="/profile" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, transform 0.2s', overflow: 'hidden' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-secondary)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  {user?.photo_url ? <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={20} />}
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

          {/* Loan Recommendation Box */}
          {latestApp && (
            <div className="glass-card" style={{ 
              background: currentScore >= 60 
                ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.4))'
                : 'linear-gradient(180deg, rgba(239, 68, 68, 0.15), rgba(153, 27, 27, 0.4))',
              padding: '30px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden',
              marginTop: '16px'
            }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <span style={{ fontWeight: 600 }}>Loan Recommendation</span>
               </div>
               <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', position: 'relative', zIndex: 2, color: currentScore >= 60 ? 'var(--status-success)' : 'var(--status-error)' }}>
                 {loanRecText}
               </h2>
               
               {currentScore >= 60 && (
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 2, marginBottom: '20px' }}>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suggested Tenure</div>
                     <div style={{ fontWeight: 'bold' }}>{tenureRec}</div>
                   </div>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated EMI</div>
                     <div style={{ fontWeight: 'bold' }}>{emiRec}</div>
                   </div>
                 </div>
               )}

               <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '0.9rem', position: 'relative', zIndex: 2 }}>
                  View All Applications <ArrowRight size={16} />
               </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
export { Sidebar };
