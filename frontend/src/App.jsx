import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/user/Dashboard';
import Apply from './pages/user/Apply';
import Results from './pages/user/Results';
import Simulator from './pages/user/Simulator'; // We will create this as a separate file
import Profile from './pages/user/Profile'; // Same
import { History } from './pages/user/History';
import Eligibility from './pages/user/Eligibility';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminAppDetails from './pages/admin/AdminAppDetails';

// Mock Auth Context (we will implement properly in contexts/)
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user?.role === 'admin') return <Navigate to="/admin" replace />;
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/eligibility" element={<ProtectedRoute><Eligibility /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/application/:id" element={<ProtectedRoute adminOnly={true}><AdminAppDetails /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
