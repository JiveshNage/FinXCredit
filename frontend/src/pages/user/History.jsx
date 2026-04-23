import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const History = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/applications/', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else {
          // Add mock data for demonstration if backend isn't linked
          setApplications([
            { id: 1, score: 82, risk_level: 'Low Risk', decision: 'Approved', created_at: '2025-10-12T10:00:00Z' },
            { id: 2, score: 65, risk_level: 'Medium Risk', decision: 'Medium Risk', created_at: '2025-08-01T14:30:00Z' },
            { id: 3, score: 45, risk_level: 'High Risk', decision: 'Rejected', created_at: '2025-01-15T09:15:00Z' }
          ]);
        }
      } catch (_) {
        setApplications([
          { id: 1, score: 82, risk_level: 'Low Risk', decision: 'Approved', created_at: '2025-10-12T10:00:00Z' },
          { id: 2, score: 65, risk_level: 'Medium Risk', decision: 'Medium Risk', created_at: '2025-08-01T14:30:00Z' }
        ]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const formatDate = (ds) => {
    return new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (decision) => {
    if (decision === 'Approved') return 'var(--status-success)';
    if (decision === 'Rejected') return 'var(--status-error)';
    return 'var(--status-warning)';
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="history" />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileText size={32} className="text-gradient" /> My Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
             Review your historical application results and access full explainability reports.
          </p>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading history...</div>
            ) : applications.length === 0 ? (
               <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                 You haven't applied for any loans yet.
                 <div style={{ marginTop: '16px' }}><Link to="/apply" className="btn-primary">Check Eligibility</Link></div>
               </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>APP_ID</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Score</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Risk Level</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', ':hover': { background: 'var(--bg-elevated)' } }}>
                      <td style={{ padding: '20px', color: 'var(--text-muted)' }}>#{app.id.toString().padStart(4, '0')}</td>
                      <td style={{ padding: '20px' }}>{formatDate(app.created_at)}</td>
                      <td style={{ padding: '20px', fontWeight: 'bold' }}>{app.score} / 100</td>
                      <td style={{ padding: '20px', color: 'var(--text-secondary)' }}>{app.risk_level}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600',
                          background: `${getStatusColor(app.decision)}20`, color: getStatusColor(app.decision)
                        }}>
                          {app.decision}
                        </span>
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        <Link to={`/results/${app.id}`} className="btn-secondary" style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          View Report <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
