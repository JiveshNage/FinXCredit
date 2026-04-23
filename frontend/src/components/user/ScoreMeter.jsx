import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScoreMeter = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current >= score) {
        clearInterval(interval);
        return;
      }
      current += 1;
      setDisplayScore(current);
    }, 15);
    return () => clearInterval(interval);
  }, [score]);

  const color = score >= 80 ? 'var(--status-success)' : score >= 60 ? 'var(--status-warning)' : 'var(--status-error)';
  
  return (
    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 24px' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
        <motion.circle 
          cx="100" cy="100" r="90" fill="none" 
          stroke={color} strokeWidth="12"
          strokeDasharray="565.48"
          strokeDashoffset={565.48 - (565.48 * displayScore) / 100}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          initial={{ strokeDashoffset: 565.48 }}
          animate={{ strokeDashoffset: 565.48 - (565.48 * score) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
         <h1 style={{ fontSize: '3rem', margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>{displayScore}</h1>
      </div>
    </div>
  );
};

export default ScoreMeter;
