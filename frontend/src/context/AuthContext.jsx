import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check backend for active cookie session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include' // This ensures HttpOnly Cookies are passed securely!
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If unauthorized (401), we just stay unauthenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (_) {
        console.warn("Backend not reachable or no active session.");
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Ping backend to clear HttpOnly Cookies
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch(_) {
      console.warn("Failed to ping logout correctly.");
    }
  };

  if (loading) {
     return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--brand-primary)' }}>Authenticating Secure Context...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
