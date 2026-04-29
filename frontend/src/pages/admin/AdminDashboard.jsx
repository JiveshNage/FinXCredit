import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Activity, RefreshCw, CheckCircle, XCircle, Users, Star, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trustworthyPeople, setTrustworthyPeople] = useState([]);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personForm, setPersonForm] = useState({
    name: '',
    occupation: '',
    location: '',
    testimonial: '',
    rating: 5,
    is_featured: true
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Applications
      const appRes = await fetch(`${API_BASE_URL}/api/admin/applications`, {
        credentials: 'include'
      });
      // Fetch Stats
      const statRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: 'include'
      });
      // Fetch Trustworthy People
      const peopleRes = await fetch(`${API_BASE_URL}/api/admin/trustworthy-people`, {
        credentials: 'include'
      });
      
      if (!appRes.ok || !statRes.ok || !peopleRes.ok) {
        if (appRes.status === 401 || appRes.status === 403) {
           setError("Not authorized or session expired. Redirecting to login...");
           setTimeout(() => { logout(); navigate("/admin-login"); }, 2000);
           return;
        }
        throw new Error('Failed to fetch');
      }
      setApplications(await appRes.json());
      setStats(await statRes.json());
      setTrustworthyPeople(await peopleRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddPerson = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/trustworthy-people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(personForm)
      });
      if (res.ok) {
        setShowAddPerson(false);
        setPersonForm({ name: '', occupation: '', location: '', testimonial: '', rating: 5, is_featured: true });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleEditPerson = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/trustworthy-people/${editingPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(personForm)
      });
      if (res.ok) {
        setEditingPerson(null);
        setPersonForm({ name: '', occupation: '', location: '', testimonial: '', rating: 5, is_featured: true });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeletePerson = async (personId) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/trustworthy-people/${personId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          fetchData();
        }
      } catch (e) { console.error(e); }
    }
  };

  const startEdit = (person) => {
    setEditingPerson(person);
    setPersonForm({
      name: person.name,
      occupation: person.occupation,
      location: person.location,
      testimonial: person.testimonial,
      rating: person.rating,
      is_featured: person.is_featured
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', color: '#94a3b8' }} 
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Back to Consumer App
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', margin: 0 }}>
            <Database size={32} color="#3b82f6" /> Central Admin Console
          </h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginTop: '10px' }}>
            <Activity size={16} /> Portfolio Management & Risk Underwriting
          </p>
        </div>
        
        <button 
          className="btn-primary" 
          style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }} 
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
          {loading ? 'Syncing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Portfolio Analytics Section */}
      {stats && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Total Portfolio Size</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.total_applications}</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Approval Rate</p>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>{stats.approval_rate}%</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Average Score</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.average_score}</h3>
         </div>
         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Fraud Alerts</p>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#ef4444' }}>{stats.fraud_alerts_count}</h3>
         </div>
      </div>
      )}

      <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {loading && applications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <RefreshCw size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
             <p style={{ color: '#94a3b8' }}>Connecting to secure databases...</p>
             <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Ref ID</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>User Name</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>ML Score</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Risk Flags</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Decision</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      No verification logs available.
                    </td>
                  </tr>
                ) : applications.map((app) => (
                  <tr 
                    key={app.id} 
                    onClick={() => navigate(`/admin/application/${app.id}`)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      <span style={{ fontWeight: 700, display: 'block' }}>#{app.id}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 500 }}>{app.user_name}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: app.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                        {app.score}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: app.is_flagged ? '#ef4444' : '#94a3b8' }}>
                      {app.is_flagged ? "Fraud Risk Detected" : "Standard"}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.status === 'Approved' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <XCircle size={14} /> {app.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 500, color: '#3b82f6' }}>
                      View Deep Analytics &rarr;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trustworthy People Management Section */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', margin: 0 }}>
            <Users size={32} color="#10b981" /> Trustworthy People Management
          </h2>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setShowAddPerson(true)}
          >
            <Plus size={18} /> Add Testimonial
          </button>
        </div>

        {/* Add/Edit Person Modal */}
        {(showAddPerson || editingPerson) && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', zIndex: 1000, padding: '2rem'
          }}>
            <div style={{ 
              background: '#1e293b', padding: '2rem', borderRadius: '16px', 
              width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#f8fafc' }}>
                {editingPerson ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={personForm.name}
                  onChange={(e) => setPersonForm({...personForm, name: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #374151', background: '#0f172a', color: '#f8fafc' }}
                />
                <input
                  type="text"
                  placeholder="Occupation"
                  value={personForm.occupation}
                  onChange={(e) => setPersonForm({...personForm, occupation: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #374151', background: '#0f172a', color: '#f8fafc' }}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={personForm.location}
                  onChange={(e) => setPersonForm({...personForm, location: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #374151', background: '#0f172a', color: '#f8fafc' }}
                />
                <textarea
                  placeholder="Testimonial"
                  value={personForm.testimonial}
                  onChange={(e) => setPersonForm({...personForm, testimonial: e.target.value})}
                  rows={4}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #374151', background: '#0f172a', color: '#f8fafc', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={personForm.is_featured}
                      onChange={(e) => setPersonForm({...personForm, is_featured: e.target.checked})}
                    />
                    Featured
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#f8fafc' }}>Rating:</span>
                    <select
                      value={personForm.rating}
                      onChange={(e) => setPersonForm({...personForm, rating: parseInt(e.target.value)})}
                      style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #374151', background: '#0f172a', color: '#f8fafc' }}
                    >
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} stars</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={editingPerson ? handleEditPerson : handleAddPerson}
                  style={{ flex: 1 }}
                >
                  {editingPerson ? 'Update' : 'Add'} Testimonial
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowAddPerson(false);
                    setEditingPerson(null);
                    setPersonForm({ name: '', occupation: '', location: '', testimonial: '', rating: 5, is_featured: true });
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trustworthy People Table */}
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Occupation</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Rating</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Featured</th>
                  <th style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trustworthyPeople.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      No testimonials available. Add some to showcase on the landing page.
                    </td>
                  </tr>
                ) : trustworthyPeople.map((person) => (
                  <tr 
                    key={person.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{person.name}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                      {person.occupation}
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                      {person.location}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < person.rating ? '#f59e0b' : 'none'} 
                            color={i < person.rating ? '#f59e0b' : '#374151'} 
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {person.is_featured ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <CheckCircle size={12} /> Yes
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <XCircle size={12} /> No
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => startEdit(person)}
                        style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#3b82f6' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePerson(person.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
