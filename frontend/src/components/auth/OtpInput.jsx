import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OtpInput = ({ length = 6, onComplete, error, timer = 600, onResend }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [timeLeft, setTimeLeft] = useState(timer);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // allow only one character
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // trigger complete if all filled
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }

    // focus next input
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // move focus to previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length).split('');
    if (pasteData.some(isNaN)) return;
    
    const newOtp = [...otp];
    pasteData.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);
    
    if (pasteData.length === length) {
      onComplete(newOtp.join(""));
      inputRefs.current[length - 1].focus();
    } else {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {otp.map((data, index) => (
          <motion.input
            key={index}
            ref={(ref) => inputRefs.current[index] = ref}
            type="text"
            inputMode="numeric"
            value={data}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            animate={{ 
              borderColor: error ? 'var(--status-error)' : (data ? 'var(--brand-primary)' : 'var(--border-subtle)'),
              x: error ? [0, -5, 5, -5, 5, 0] : 0 
            }}
            transition={{ duration: 0.3 }}
            style={{
              width: '45px',
              height: '55px',
              fontSize: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'Outfit, sans-serif'
            }}
          />
        ))}
      </div>
      
      {error && <p style={{ color: 'var(--status-error)', fontSize: '0.9rem' }}>{error}</p>}
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {timeLeft > 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Resend in <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <button 
            type="button" 
            onClick={() => { setTimeLeft(600); onResend(); }}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpInput;
