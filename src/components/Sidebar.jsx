import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck,
  IndianRupee, Calendar, Settings, School, CalendarDays,
  SlidersHorizontal, FileText, ClipboardList, X, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    const role = user?.role || 'Guest';

    if (role === 'Parent') {
      return [
        { name: 'My Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> },
      ];
    }

    if (role === 'Student') {
      return [
        { name: 'My Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> },
      ];
    }

    const links = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Students', path: '/students', icon: <Users size={20} /> },
      { name: 'Teachers', path: '/teachers', icon: <GraduationCap size={20} /> },
    ];

    if (['Principal', 'Admin'].includes(role)) {
      links.push(
        { name: 'User Management', path: '/users', icon: <Settings size={20} /> },
        { name: 'Admissions', path: '/admissions', icon: <ClipboardList size={20} /> },
        { name: 'Letterhead', path: '/letterhead', icon: <FileText size={20} /> },
        { name: 'Settings', path: '/settings', icon: <SlidersHorizontal size={20} /> }
      );
    }

    if (['Principal', 'Admin', 'Teacher'].includes(role)) {
      links.push(
        { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={20} /> },
        { name: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> }
      );
    }

    links.push({ name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> });

    if (['Principal', 'Admin', 'Accountant'].includes(role)) {
      links.push(
        { name: 'Fees Management', path: '/fees', icon: <IndianRupee size={20} /> },
        { name: 'Petty Cash', path: '/petty-cash', icon: <Wallet size={20} /> }
      );
    }

    return links;
  };

  const links = getNavLinks();

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <School size={28} />
        </div>
        <h2 className="sidebar-title">EduSync</h2>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'hsla(0,0%,100%,0.7)', display: 'none', padding: '0.25rem' }}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {links.map((link) => {
            const isActive = location.pathname === link.path ||
              (location.pathname.startsWith(link.path) && link.path !== '/');
            return (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-item-icon">{link.icon}</span>
                  <span>{link.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid hsla(0,0%,100%,0.1)' }}>
        <div style={{ fontSize: '0.75rem', color: 'hsla(0,0%,100%,0.5)', textAlign: 'center' }}>
          Role: <strong style={{ color: 'white' }}>{user?.role}</strong>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
