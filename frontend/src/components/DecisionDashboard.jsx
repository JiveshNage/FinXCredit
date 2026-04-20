import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { CheckCircle, AlertOctagon, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

const DecisionDashboard = ({ result, onReset }) => {
  if (!result) return null;

  const isApproved = result.eligible;
  const score = result.alternative_credit_score;
  
  // Recharts tricky data mapping for gauge chart
  const data = [
    {
      name: 'Score',
      value: score,
      fill: isApproved ? '#064e3b' : '#c04818',
    }
  ];

  // Dynamic Explainability Gen
  const getExplainabilityText = () => {
    if (isApproved) {
      return "✅ Your alternative credit profile shows strong repayment capability. Your digital footprint and consistent earnings offset any traditional credit history gaps.";
    } else {
      return "❌ High Default Risk detected. The AI identified concerning patterns in your income volatility or a low savings-to-expense ratio compared to your requested loan amount.";
    }
  };

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{ maxWidth: '500px', textAlign: 'center' }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Eligibility Verdict</h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.5rem', 
            borderRadius: '30px',
            background: isApproved ? 'rgba(6, 78, 59, 0.1)' : 'rgba(192, 72, 24, 0.1)',
            color: isApproved ? 'var(--accent-green)' : 'var(--accent-orange)',
            fontWeight: 700,
            fontSize: '1.25rem',
            marginTop: '1rem'
          }}
        >
          {isApproved ? <CheckCircle size={28} /> : <AlertOctagon size={28} />}
          {isApproved ? 'LOAN APPROVED' : 'APPLICATION REJECTED'}
        </motion.div>
      </div>

      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="80%" 
            innerRadius="70%" outerRadius="100%" 
            barSize={20} data={data} 
            startAngle={180} endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[300, 900]} angleAxisId={0} tick={false} />
            <RadialBar
              minAngle={15}
              background={{ fill: 'rgba(0,0,0,0.05)' }}
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Alt-Credit Score
          </div>
        </div>
      </div>

      <motion.div 
        className="form-group" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        style={{ 
          background: 'rgba(255,255,255,0.7)', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          textAlign: 'left',
          borderLeft: `4px solid ${isApproved ? 'var(--accent-green)' : 'var(--accent-orange)'}`
        }}
      >
        <h4 style={{ color: 'var(--text-dark)', marginBottom: '1rem', fontSize: '0.9rem' }}>Key Data Factors (AI Explainability)</h4>
        
        {result.insights && result.insights.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.insights.map((insight, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                padding: '0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px'
              }}>
                <div style={{
                  color: insight.impact === 'positive' ? 'var(--accent-green)' : '#c04818',
                  marginTop: '0.1rem'
                }}>
                  {insight.impact === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{insight.feature}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {getExplainabilityText()}
          </p>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span>Risk Probability:</span>
          <strong>{result.probability_of_default}% Default Risk</strong>
        </div>
      </motion.div>

      <button 
        className="btn-primary" 
        onClick={onReset}
        style={{ 
          background: 'transparent', 
          border: '2px solid rgba(0,0,0,0.1)', 
          color: 'var(--text-dark)', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        <RotateCcw size={16} /> Validate Another User
      </button>
    </motion.div>
  );
};

export default DecisionDashboard;
