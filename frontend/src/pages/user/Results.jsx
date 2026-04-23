import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Lightbulb, Download } from 'lucide-react';
import ScoreMeter from '../../components/user/ScoreMeter';

const Results = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data] = useState(() => {
    if (state?.result) {
      return state.result.score_results;
    } else if (state?.mock) {
      // Create mock data
      return {
        score: 75,
        decision: "Medium Risk",
        risk: "Medium Risk",
        loan: "₹10,000 – ₹50,000",
        tips: [
          { title: "Increase Savings", description: "Try to save an extra ₹2000 per month.", impact: "+5 points" },
          { title: "Pay Bills Early", description: "This creates trust.", impact: "+2 points" }
        ],
        reasons: {
          positive: ["Strong income stability.", "Good savings ratio."],
          negative: ["Expense ratio slightly high.", "Inconsistent bills."]
        },
        factors: {
          income_score: 25, txn_score: 15, savings_score: 18, spending_score: 10, discipline_score: 7
        }
      };
    }
    return null;
  });

  useEffect(() => {
    if (!data) {
      navigate('/dashboard'); // nothing to show
    }
  }, [data, navigate]);

  if (!data) return <div className="app-container"><Sidebar current="apply"/></div>;

  const barData = [
    { label: "Income Stability", val: data.factors?.income_score || 0, max: 30 },
    { label: "Transaction Activity", val: data.factors?.txn_score || 0, max: 20 },
    { label: "Savings Ratio", val: data.factors?.savings_score || 0, max: 20 },
    { label: "Spending Behavior", val: data.factors?.spending_score || 0, max: 15 },
    { label: "Financial Discipline", val: data.factors?.discipline_score || 0, max: 15 },
  ];

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="apply" />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '32px' }}>
            {/* Left Col - Score & Core Decision */}
            <div>
               <div className="glass-card" style={{ textAlign: 'center', marginBottom: '24px' }}>
                 <h3>Your Credit Score</h3>
                 <ScoreMeter score={data.score} />
                 
                 <h2 style={{ color: data.score >= 80 ? 'var(--status-success)' : data.score >= 60 ? 'var(--status-warning)' : 'var(--status-error)' }}>
                   {data.decision}
                 </h2>
                 <p style={{ color: 'var(--text-secondary)' }}>Risk Level: {data.risk}</p>
                 
               </div>

               <div className="glass-card" style={{ background: 'var(--brand-primary-glow)', borderColor: 'var(--brand-primary)' }}>
                 <h3 style={{ marginBottom: '8px' }}>Loan Recommendation</h3>
                 <h2 className="text-gradient" style={{ fontSize: '2rem' }}>{data.loan}</h2>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px' }}>
                   *Subject to final KYC verification automatically carried out by our partner NBFCs.
                 </p>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button className="btn-primary" style={{ flex: 1 }}><Download size={18}/> Download PDF</button>
                  <Link to="/simulator" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Simulator</Link>
               </div>
            </div>

            {/* Right Col - Explainability */}
            <div>
              <div className="glass-card" style={{ marginBottom: '24px' }}>
                 <h3 style={{ marginBottom: '24px' }}>Why did you get this score?</h3>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {barData.map(f => (
                     <div key={f.label}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                         <span>{f.label}</span>
                         <span style={{ color: 'var(--text-secondary)' }}>{f.val} / {f.max}</span>
                       </div>
                       <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${(f.val / f.max) * 100}%` }} 
                           transition={{ delay: 0.5, duration: 1 }}
                           style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))', borderRadius: '4px' }} 
                         />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="glass-card">
                   <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--status-success)' }}>
                     <CheckCircle size={18} /> Strengths
                   </h4>
                   <ul style={{ listStyle: 'none', padding: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                     {data.reasons?.positive?.map((r, i) => (
                       <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{r}</li>
                     ))}
                   </ul>
                </div>
                <div className="glass-card">
                   <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--status-warning)' }}>
                     <AlertTriangle size={18} /> Weaknesses
                   </h4>
                   <ul style={{ listStyle: 'none', padding: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                     {data.reasons?.negative?.map((r, i) => (
                       <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{r}</li>
                     ))}
                   </ul>
                </div>
              </div>

              {data.tips?.length > 0 && (
                <div className="glass-card" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'var(--brand-secondary)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Lightbulb className="text-gradient" size={24}/> Personalized Tips for You
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.tips.map((tip, i) => (
                      <div key={i} style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                        <h4 style={{ marginBottom: '4px' }}>{tip.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{tip.description}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                          {tip.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;
