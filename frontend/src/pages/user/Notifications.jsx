import React, { useState, useEffect } from 'react';
import { Sidebar } from './Dashboard';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/applications/notifications`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setNotifs(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle color="var(--status-success)" />;
      case 'error': return <AlertTriangle color="var(--status-error)" />;
      case 'warning': return <AlertTriangle color="var(--status-warning)" />;
      case 'info': default: return <Info color="var(--brand-secondary)" />;
    }
  };

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1" style={{ top: '-10%', left: '20%' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="grid-bg"></div>

      <Sidebar current="notifications" />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
             <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <Bell size={24} color="var(--text-primary)" />
             </div>
             <h1 style={{ margin: 0 }}>Notifications</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading notifications...</div>
            ) : notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No notifications yet.</div>
            ) : (
              notifs.map(notif => (
                <div key={notif.id} className="glass-card" style={{ display: 'flex', gap: '20px', padding: '24px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '50%' }}>
                     {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                       <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{notif.title}</h4>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                     </div>
                     <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                       {notif.message}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Notifications;
