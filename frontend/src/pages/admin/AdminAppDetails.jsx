import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Send, Bell, User, Edit3 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminAppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Notification State
  const [notifyChannel, setNotifyChannel] = useState('email');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState('');
  const [notifyError, setNotifyError] = useState('');
  
  // Override State
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState('');
  const [overrideError, setOverrideError] = useState('');

  useEffect(() => {
    fetchAppDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAppDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/application/${id}`, {
        credentials: 'include'
      });
      if (res.status === 401 || res.status === 403) {
         logout(); navigate('/admin-login'); return;
      }
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setAppData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    setNotifyLoading(true); setNotifySuccess(''); setNotifyError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: appData.user_id, channel: notifyChannel, message: notifyMsg })
      });
      if (!res.ok) throw new Error('Notification failed');
      setNotifySuccess(`Notification sent via ${notifyChannel.toUpperCase()}`);
      setNotifyMsg('');
    } catch (err) {
      console.error(err);
      setNotifyError("Failed to send notification: " + err.message);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleOverride = async (newDecision) => {
    if (!overrideReason) { setOverrideError("Must provide a reason for the audit log."); return; }
    setOverrideLoading(true);
    setOverrideError('');
    setOverrideSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/application/${id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ new_decision: newDecision, reason: overrideReason })
      });
      if (!res.ok) throw new Error('Override failed');
      setOverrideSuccess(`Successfully forced decision to ${newDecision}`);
      fetchAppDetails();
      setOverrideReason('');
    } catch (err) {
      setOverrideError("Override failed: " + err.message);
    } finally {
      setOverrideLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading Data Vault...</div>;
  if (!appData) return <div style={{ padding: '2rem', color: '#fff' }}>Application not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
      <button 
        onClick={() => navigate('/admin')}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
         <div>
            <h1 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User color="#3b82f6" /> {appData.user_name}
            </h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Ref ID: #{appData.id} | Email: {appData.email} | Phone: {appData.phone}</p>
         </div>
         <div style={{ padding: '10px 20px', borderRadius: '8px', background: appData.decision === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${appData.decision === 'Approved' ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
             {appData.decision === 'Approved' ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />}
             <span style={{ fontWeight: 'bold', color: appData.decision === 'Approved' ? '#10b981' : '#ef4444' }}>Current Status: {appData.decision}</span>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* ML Score Card */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Financial Analysis</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Algorithmic Score</span>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{appData.score} / 100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Simulated CIBIL</span>
                <span style={{ fontWeight: 'bold' }}>{appData.cibil_equivalent}</span>
            </div>
            {appData.is_flagged && (
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', fontSize: '14px' }}>
                    <strong>Fraud Alert:</strong> {appData.fraud_reason}
                </div>
            )}
        </div>

        {/* Discrepancy Engine */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> Discrepancy Engine</h3>
            
            <table style={{ width: '100%', fontSize: '14px' }}>
               <thead>
                  <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                     <th>Metric</th>
                     <th>Declared</th>
                     <th>NLP Verified</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ padding: '8px 0' }}>Income</td>
                     <td>₹{appData.declared_income || 'N/A'}</td>
                     <td>₹{appData.verified_income}</td>
                  </tr>
                  <tr>
                     <td style={{ padding: '8px 0' }}>Expenses</td>
                     <td>₹{appData.declared_expenses || 'N/A'}</td>
                     <td>₹{appData.verified_expenses}</td>
                  </tr>
               </tbody>
            </table>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #334155', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Discrepancy Score (0-100)</span>
                <span style={{ fontWeight: 'bold', color: appData.discrepancy_score > 40 ? '#ef4444' : '#10b981' }}>{appData.discrepancy_score?.toFixed(1) || 0}</span>
            </div>
        </div>
        
        {/* Formal Loan Request (Fulfillment) */}
        {appData.requested_amount && (
          <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))', borderRadius: '12px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}><FileText size={18} /> Formal Loan Request</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Requested Amount</span>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>₹{appData.requested_amount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Tenure</span>
                  <span style={{ fontWeight: 'bold' }}>{appData.requested_tenure} Months</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Purpose</span>
                  <span style={{ fontWeight: 'bold' }}>{appData.loan_purpose}</span>
              </div>
              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6', marginTop: '4px' }}>{appData.fulfillment_status}</div>
              </div>
          </div>
        )}
        
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Action Center: Manual Override */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}><Edit3 size={18} /> Manual Underwriting Override</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>Warning: Overriding the ML engine will be permanently logged in the Regulatory Audit Trail.</p>
            
            <input 
              type="text" 
              placeholder="Reason for override (Required for Audit Log)"
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', marginBottom: '15px' }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleOverride("Approved")}
                  disabled={overrideLoading}
                  style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >Force Approve</button>
                <button 
                  onClick={() => handleOverride("Rejected")}
                  disabled={overrideLoading}
                  style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >Force Reject</button>
            </div>
        </div>

        {/* Action Center: Notifications */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #334155', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}><Bell size={18} /> Dispatch Notification</h3>
            
            <form onSubmit={handleNotify}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select 
                      value={notifyChannel} 
                      onChange={e => setNotifyChannel(e.target.value)}
                      style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                    >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="call">Robo-Call</option>
                    </select>
                    
                    <select 
                      onChange={e => setNotifyMsg(e.target.value)}
                      style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                    >
                        <option value="">-- Pre-written Templates --</option>
                        <option value="Your loan application has been approved! Funds will be disbursed shortly.">Approval Notice</option>
                        <option value="Action Required: Please upload clearer Bank Statements.">Doc Request</option>
                        <option value="Your application was rejected due to a Discrepancy Flag.">Fraud Alert</option>
                    </select>
                </div>
                
                <textarea 
                  placeholder="Or type a custom message..."
                  value={notifyMsg}
                  onChange={e => setNotifyMsg(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', height: '80px', resize: 'none', marginBottom: '10px' }}
                  required
                ></textarea>
                
                <button 
                  type="submit" 
                  disabled={notifyLoading}
                  style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={16} /> {notifyLoading ? 'Dispatching...' : 'Send Alert'}
                </button>
            </form>
            {notifySuccess && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '10px' }}>{notifySuccess}</p>}
        </div>

      </div>
    </div>
  );
};

export default AdminAppDetails;
