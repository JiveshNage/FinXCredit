import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Brain, Zap, Clock, TrendingUp, ChevronRight, Activity, CreditCard, User, CheckCircle, Lock, Smartphone, LineChart, Users, Award, PhoneCall, Mail } from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Deep Space Background Atmosphere */}
      <div className="bg-orb bg-orb-1" style={{ top: '-15%', left: '-10%', background: 'var(--brand-primary)' }}></div>
      <div className="bg-orb bg-orb-2" style={{ top: '20%', right: '-5%', background: 'var(--brand-secondary)', width: '600px', height: '600px', opacity: 0.3 }}></div>
      <div className="bg-orb" style={{ bottom: '-20%', left: '20%', background: '#c026d3', width: '500px', height: '500px', opacity: 0.4 }}></div>
      <div className="grid-bg"></div>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 5%', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--brand-gradient)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '1.6rem', margin: 0 }}>CreditBridge</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }} className="nav-links">
             <a href="#how-it-works" style={{cursor: 'pointer', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s'}} onMouseOver={e => e.target.style.color='var(--text-primary)'} onMouseOut={e => e.target.style.color='var(--text-secondary)'}>Products</a>
             <a href="#trust" style={{cursor: 'pointer', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s'}} onMouseOver={e => e.target.style.color='var(--text-primary)'} onMouseOut={e => e.target.style.color='var(--text-secondary)'}>Security</a>
             <a href="#contact" style={{cursor: 'pointer', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s'}} onMouseOver={e => e.target.style.color='var(--text-primary)'} onMouseOut={e => e.target.style.color='var(--text-secondary)'}>API & Support</a>
           </div>
           <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '10px 24px' }}>Log In</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '10px 24px' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '100px 5%', position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Left Typography */}
        <motion.div
           initial={{ opacity: 0, x: -40 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', border: '1px solid var(--border-subtle)', marginBottom: '32px', fontSize: '0.85rem', color: 'var(--brand-secondary)', fontWeight: 600 }}>
             <Clock size={16} /> Instant Underwriting Engine Live
          </div>
          
          <h1 style={{ fontSize: '5rem', marginBottom: '24px', lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Credit <span className="text-gradient">Access</span><br/>
            Redefined.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '85%', lineHeight: 1.6 }}>
            No CIBIL? No problem. Our AI-driven engine analyzes your digital footprint to unlock the credit you deserve. Built natively for gig workers and freelancers.
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/signup" className="btn-primary" style={{ padding: '18px 36px', fontSize: '1.1rem' }}>
              Check Eligibility <ChevronRight size={20} />
            </Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <ShieldCheck size={16} /> Bank-level encryption
            </span>
          </div>
        </motion.div>

        {/* Right Floating 3D Assets Mockup */}
        <div style={{ position: 'relative', height: '600px', width: '100%' }}>
           
           {/* Back Dashboard Widget */}
           <motion.div 
             className="glass-card"
             initial={{ opacity: 0, y: 50, rotateX: 10, rotateY: -10 }}
             animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', padding: '24px', background: 'rgba(26, 27, 54, 0.6)' }}
           >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Risk Score AI</span>
                <Activity size={18} color="var(--brand-primary)" />
              </div>
              <h2 style={{ fontSize: '3rem', margin: 0, display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                 82 <span style={{ fontSize: '1rem', color: 'var(--status-success)', fontWeight: 'normal' }}>+12 pts</span>
              </h2>
              <div style={{ height: '60px', width: '100%', marginTop: '20px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                 {[40, 50, 30, 60, 40, 70, 80].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 6 ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.1)', height: `${h}%`, borderRadius: '4px' }}></div>
                 ))}
              </div>
           </motion.div>

           {/* Front Credit Card Mockup */}
           <motion.div 
             className="glass-card"
             animate={{ y: [0, -15, 0] }}
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             style={{ 
                position: 'absolute', top: '40%', left: '0', width: '380px', height: '240px', 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.1))',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 20px rgba(255,255,255,0.2)',
                borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
             }}
           >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CreditCard size={32} color="white" />
                <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>VISA</span>
             </div>
             
             <div style={{ fontSize: '1.5rem', letterSpacing: '4px', fontFamily: 'monospace' }}>
                4000 1234 5678 9010
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
               <div>
                 <div style={{ marginBottom: '4px', fontSize: '0.65rem' }}>Card Holder</div>
                 <div style={{ color: 'white', fontWeight: 600 }}>Rakesh Kumar</div>
               </div>
               <div>
                 <div style={{ marginBottom: '4px', fontSize: '0.65rem' }}>Expires</div>
                 <div style={{ color: 'white', fontWeight: 600 }}>12/28</div>
               </div>
             </div>
           </motion.div>

           {/* Small Verification Bubble */}
           <motion.div 
             className="glass-card"
             animate={{ y: [0, 10, 0] }}
             transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }}
             style={{ position: 'absolute', bottom: '15%', right: '5%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '100px' }}
           >
             <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--status-success)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <CheckCircle size={20} />
             </div>
             <div>
               <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Identity Verified</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Account Aggregator Synced</div>
             </div>
           </motion.div>
        </div>

      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: '100px 5%', position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.2)', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '16px' }}>How CreditBridge <span className="text-gradient">Works</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Three simple steps to unlock your financial potential without visiting a bank.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--brand-primary)' }}>
              <Smartphone size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>1. E-KYC & Profile</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Complete a quick 2-minute digital KYC using your Aadhaar or PAN. No paperwork required.</p>
          </div>
          
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--brand-secondary)' }}>
              <Lock size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>2. Secure Data Sync</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We securely analyze your SMS and bank statements via the RBI-regulated Account Aggregator network.</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--status-success)' }}>
              <Zap size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>3. Instant Approval</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Our AI Engine instantly scores your alternate data and disburses funds directly to your bank.</p>
          </div>
        </div>
      </section>

      {/* Credibility & Trust Section */}
      <section id="trust" style={{ padding: '100px 5%', position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', scrollMarginTop: '80px' }}>
        <div className="glass-card" style={{ padding: '60px', background: 'linear-gradient(135deg, rgba(26,27,54,0.8), rgba(0,0,0,0.4))' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
            <div>
              <Users size={40} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>50K+</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Active Users</p>
            </div>
            <div>
              <LineChart size={40} color="var(--brand-secondary)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>₹120Cr</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loans Disbursed</p>
            </div>
            <div>
              <ShieldCheck size={40} color="var(--status-success)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>100%</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>RBI Compliant</p>
            </div>
            <div>
              <Award size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>4.8/5</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>App Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Help & Contact Section */}
      <section id="contact" style={{ padding: '80px 5%', position: 'relative', zIndex: 10, textAlign: 'center', scrollMarginTop: '80px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Need Assistance?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>Our dedicated support team is available 24/7 to help you navigate your financial journey.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={20} />
            +91 1800-123-4567
          </div>
          <div className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={20} />
            support@creditbridge.ai
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 5%', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', position: 'relative', zIndex: 10, marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <p style={{ margin: 0 }}>© 2026 CreditBridge AI. Advancing Financial Inclusion in India.</p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '6px 16px', border: '1px solid var(--border-subtle)', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor='var(--brand-primary)'; e.currentTarget.style.color='var(--brand-primary)'; }} onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            <Lock size={14} /> Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
