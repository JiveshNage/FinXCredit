import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check backend for active cookie/session token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
          headers
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          if (token) {
            localStorage.removeItem('access_token');
            setToken(null);
          }
        }
      } catch (_) {
        console.warn("Backend not reachable or no active session.");
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, [token]);

  const login = (userData, accessToken = null) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem('access_token', accessToken);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('access_token');
    
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
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
