import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, CheckCircle, Lock, Smartphone, LogOut, LayoutDashboard } from 'lucide-react';
import heroGraphic from '../assets/hero_graphic.png';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleApplyClick = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/apply');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar with Credibility Badge */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h2 style={{ color: 'var(--accent-green)', letterSpacing: '-1px', margin: 0 }}>
          FinX <span style={{ color: 'var(--accent-orange)' }}>Credit</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6,78,59,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.875rem' }}>
            <ShieldCheck size={16} /> <span className="hide-on-mobile">RBI Compliant AI Architecture</span>
          </div>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Hi, {user.username} 
                <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', background: 'rgba(0,0,0,0.1)', padding: '0.2rem 0.4rem', borderRadius: '5px', marginLeft: '0.5rem' }}>
                  {user.role}
                </span>
              </span>
              <button 
                onClick={logout}
                style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '12px', background: 'var(--text-dark)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* HERO SECTION */}
        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', marginBottom: '6rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ flex: '1 1 400px' }}
          >
            <div style={{ display: 'inline-block', background: 'var(--text-dark)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              V2.0 LIVE: SECURE AUTHENTICATION
            </div>
            <h1 style={{ color: 'var(--text-dark)', fontSize: '3.5rem', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '1.5rem' }}>
              Fair Credit for the <br/><span style={{ color: 'var(--accent-orange)' }}>Gig Economy.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Leveraging Account Aggregators (AA) and Alternative Machine Learning pipelines to instantly verify income and deliver loans without traditional salary slips.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                onClick={handleApplyClick} 
                style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem', padding: '1rem' }}
              >
                {user ? (user.role === 'admin' ? <><LayoutDashboard size={20} /> Go to Dashboard</> : <><Smartphone size={20} /> Apply for Loan</>) : <><Lock size={20} /> Get Started</>}
              </button>
              
              {!user && (
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/register')} 
                  style={{ flex: 1, minWidth: '220px', margin: 0, background: 'transparent', border: '2px solid var(--text-dark)', color: 'var(--text-dark)' }}
                >
                  Create Account
                </button>
              )}
            </div>
          </motion.div>

          {/* HERO IMAGE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            {/* Soft glowing orb behind image */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'var(--accent-orange)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%', zIndex: 0 }} />
            <img 
              src={heroGraphic} 
              alt="Isometric AI Mobile FinTech App" 
              style={{ width: '100%', maxWidth: '500px', zIndex: 1, borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
            />
          </motion.div>
        </section>

        {/* CREDIBILITY / FEATURES SECTION */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Enterprise-Grade Lending Core</h2>
            <p style={{ color: 'var(--text-muted)' }}>Built securely for modern Indian financial ecosystems.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'rgba(192, 72, 24, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
                <TrendingUp size={32} />
              </div>
              <h3>Algorithmic Scoring</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Our XGBoost AI strictly evaluates transaction behaviors to generate an alternative FICO-style credit score, bypassing CIBIL dependencies.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'rgba(6, 78, 59, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent-green)' }}>
                <CheckCircle size={32} />
              </div>
              <h3>RBAC & JWT Security</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Implemented strict Role-Based Access Controls with JWT authenticated pipelines to secure applicant data explicitly tied to verified Unique IDs.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'rgba(31, 41, 55, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
                <Lock size={32} />
              </div>
              <h3>Continuous Monitoring</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>A hardened Admin Dashboard ensuring compliance via continuous oversight. Every AI choice is backed up into a secure queryable vault.</p>
            </motion.div>

          </div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;
