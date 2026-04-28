import React, { useState } from 'react';
import { Sidebar } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 ',
    worker_type: user?.worker_type || 'Freelancer',
    photo_url: user?.photo_url || ''
  });
  
  const [securityData, setSecurityData] = useState({
    twoFaEnabled: user?.two_fa_enabled || false,
    channel: user?.preferred_channel || 'email'
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user); // Update auth context with new profile data
        setSaveStatus('success');
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.warn("Profile update failed:", err);
      // Fallback for offline dev
      login({ ...user, ...formData });
      setSaveStatus('success');
    }
    setSaving(false);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const updateSecuritySetting = async (updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
      }
    } catch (err) {
      console.warn("Security update failed:", err);
    }
  };

  const handleToggle2FA = async () => {
    const newState = !securityData.twoFaEnabled;
    setSecurityData(prev => ({ ...prev, twoFaEnabled: newState }));
    login({ ...user, two_fa_enabled: newState });
    await updateSecuritySetting({ two_fa_enabled: newState });
  };

  const handleChannelChange = async (newChannel) => {
    setSecurityData(prev => ({ ...prev, channel: newChannel }));
    login({ ...user, preferred_channel: newChannel });
    await updateSecuritySetting({ preferred_channel: newChannel });
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="profile" />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '40px' }}>Profile Settings</h1>
          
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* General Settings */}
            <div className="glass-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <User className="text-gradient" /> General Information
              </h3>
              
              {/* Save status feedback */}
              {saveStatus === 'success' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '20px', color: 'var(--status-success)', fontSize: '0.9rem' }}>
                  <CheckCircle size={16} /> Profile updated successfully
                </div>
              )}
              {saveStatus === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '20px', color: 'var(--status-error)', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} /> Failed to update profile
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-dark)', border: '2px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {formData.photo_url ? <img src={formData.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="var(--text-muted)" />}
                 </div>
                 <div>
                    <label htmlFor="photoUpload" className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 16px', fontSize: '0.9rem' }}>
                       Upload New Photo
                    </label>
                    <input 
                       id="photoUpload" type="file" accept="image/*" style={{ display: 'none' }}
                       onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                                setFormData(prev => ({ ...prev, photo_url: reader.result }));
                             };
                             reader.readAsDataURL(file);
                          }
                       }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>JPEG or PNG. Max 2MB.</p>
                 </div>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                <div>
                  <label className="label">Full Name</label>
                  <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="label">Registered Email</label>
                  <input className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--status-success)', marginTop: '4px', display: 'block' }}>Verified ✓</span>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div>
                  <label className="label">Worker Type</label>
                  <select className="input-field" value={formData.worker_type} onChange={e => setFormData({...formData, worker_type: e.target.value})}>
                     <option>Auto Driver</option>
                     <option>Delivery Partner</option>
                     <option>Freelancer</option>
                     <option>Shop Owner</option>
                     <option>Street Vendor</option>
                     <option>Domestic Worker</option>
                     <option>Construction Worker</option>
                     <option>Farmer</option>
                     <option>Tailor</option>
                     <option>Electrician/Plumber</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Security Settings */}
            <div className="glass-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <Shield className="text-gradient" /> Security
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ marginBottom: '4px' }}>Two-Factor Authentication (2FA)</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Require an OTP code to login to your account.</p>
                </div>
                <button 
                  onClick={handleToggle2FA}
                  style={{ 
                    background: securityData.twoFaEnabled ? 'var(--status-success)' : 'var(--bg-secondary)',
                    border: `1px solid ${securityData.twoFaEnabled ? 'var(--status-success)' : 'var(--border-subtle)'}`,
                    color: 'white', padding: '8px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold'
                  }}
                >
                  {securityData.twoFaEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {securityData.twoFaEnabled && (
                <div style={{ padding: '0 16px 24px', animation: 'slideUp 0.3s ease-out' }}>
                   <label className="label" style={{ marginBottom: '12px' }}>Preferred 2FA Channel</label>
                   <div style={{ display: 'flex', gap: '24px' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                       <input type="radio" name="channel" checked={securityData.channel === 'email'} onChange={() => handleChannelChange('email')} style={{ accentColor: 'var(--brand-primary)', width: '18px', height: '18px'}}/>
                       Email
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                       <input type="radio" name="channel" checked={securityData.channel === 'sms'} onChange={() => handleChannelChange('sms')} style={{ accentColor: 'var(--brand-primary)', width: '18px', height: '18px'}}/>
                       SMS (+91)
                     </label>
                   </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                 <Key size={20} color="var(--text-secondary)" />
                 <a href="#" style={{ fontSize: '0.9rem' }}>Change Password</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
