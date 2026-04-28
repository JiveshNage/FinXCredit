import React, { useState, useEffect } from 'react';
import { Sidebar } from './Dashboard';
import { Lightbulb, TrendingUp, Wallet, ShieldAlert, ArrowRight, FileText, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const getIconForTip = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('saving')) return <Wallet color="var(--brand-primary)" size={24} />;
  if (lowerTitle.includes('transaction') || lowerTitle.includes('digital')) return <TrendingUp color="var(--status-success)" size={24} />;
  if (lowerTitle.includes('bill') || lowerTitle.includes('pay')) return <FileText color="var(--brand-secondary)" size={24} />;
  if (lowerTitle.includes('habit') || lowerTitle.includes('discipline')) return <ShieldAlert color="var(--status-warning)" size={24} />;
  return <Lightbulb color="var(--accent-orange)" size={24} />;
};

const Tips = () => {
  const [tipsData, setTipsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackTips = [
    {
      title: "Maintain a Healthy Savings Ratio",
      description: "Try to save at least 20% of your monthly income. Keeping a consistent balance in your account shows lenders that you have a safety net, significantly boosting your Trust Score.",
      impact: "High Impact"
    },
    {
      title: "Diversify Your Digital Transactions",
      description: "Regular use of UPI for both receiving and making payments creates a robust digital footprint. This is especially helpful if you don't have a traditional CIBIL score.",
      impact: "Medium Impact"
    },
    {
      title: "Avoid Over-Leveraging",
      description: "Ensure that your total monthly EMI obligations do not exceed 40% of your total income. Too many active loans can negatively flag your risk profile.",
      impact: "High Impact"
    }
  ];

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/applications/latest-tips`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tips && data.tips.length > 0) {
            setTipsData(data.tips);
          } else {
            setTipsData(fallbackTips);
          }
        } else {
          setTipsData(fallbackTips);
        }
      } catch (err) {
        setTipsData(fallbackTips);
      }
      setLoading(false);
    };
    fetchTips();
  }, []);

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="tips" />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
             <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <Lightbulb size={32} className="text-gradient" color="var(--brand-secondary)" />
             </div>
             <h1 style={{ margin: 0 }}>Financial Tips</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
            Actionable advice to improve your credit health and increase your loan eligibility.
          </p>

          {loading ? (
             <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
               <Loader size={36} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
               <p style={{ color: 'var(--text-secondary)' }}>Analyzing your financial profile...</p>
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {tipsData.map((tip, idx) => (
                 <div key={idx} className="glass-card" style={{ display: 'flex', gap: '20px', padding: '30px' }}>
                   <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', height: 'fit-content' }}>
                      {getIconForTip(tip.title)}
                   </div>
                   <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{tip.title}</h3>
                        <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                           {tip.impact}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {tip.description}
                      </p>
                   </div>
                 </div>
               ))}
             </div>
          )}

          <div className="glass-card" style={{ marginTop: '40px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))', textAlign: 'center', padding: '40px' }}>
             <h3 style={{ marginBottom: '16px' }}>Ready to see how these impact your score?</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Use our interactive simulator to adjust your financial behaviors and see your estimated score change in real-time.</p>
             <Link to="/simulator" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Try Score Simulator <ArrowRight size={18} />
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tips;
