import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { LogOut, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const school = useSchool();
  const location = useLocation();

  const pathName = location.pathname === '/'
    ? 'Dashboard'
    : location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1);

  return (
    <header className="header">
      {/* Left — hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost hamburger-btn" onClick={onMenuClick}
          style={{ padding: '0.4rem', flexShrink: 0 }}>
          <Menu size={22} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{pathName}</h1>
          {school.school_name && (
            <div className="header-school-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {school.school_name}
              </span>
              {school.trust_name && (
                <>
                  <span style={{ fontSize: '0.65rem', color: 'var(--border-color)' }}>•</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {school.trust_name}
                  </span>
                </>
              )}
              {school.academic_year && (
                <>
                  <span style={{ fontSize: '0.65rem', color: 'var(--border-color)' }}>•</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    AY {school.academic_year}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right — bell + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost" style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%' }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px',
            backgroundColor: 'var(--danger)', borderRadius: '50%', border: '2px solid white'
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
            alt="Profile"
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="header-user-info">
            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user?.role}</div>
          </div>
          <button onClick={logout} className="btn btn-ghost"
            style={{ padding: '0.4rem', color: 'var(--text-secondary)', flexShrink: 0 }}
            title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
