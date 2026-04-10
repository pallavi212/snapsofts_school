import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, User, Lock } from 'lucide-react';

const ROLES = ['Principal', 'Admin', 'Teacher', 'Accountant', 'Student', 'Parent'];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('Principal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(selectedRole, email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '1rem',
      backgroundImage: 'radial-gradient(at 0% 0%, hsla(221,83%,53%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(270,70%,55%,0.15) 0px, transparent 50%)'
    }}>
      <div className="card animate-fade-in glass" style={{ width: '100%', maxWidth: '400px', border: '1px solid hsla(221,83%,53%,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-focus)',
            color: 'var(--primary)', marginBottom: '1rem'
          }}>
            <School size={32} />
          </div>
          <h1>EduSync System</h1>
          <p className="text-muted">Sign in to manage your school</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ appearance: 'none' }}
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                ▼
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder={`demo@${selectedRole.toLowerCase()}.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', marginTop: '1rem', backgroundColor: 'hsla(354, 70%, 54%, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In Securely'}
          </button>
        </form>

        {/* Quick login hints */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Demo Credentials</p>
          {[
            { role: 'Principal', email: 'principal@edusync.edu', pass: '1' },
            { role: 'Admin', email: 'admin@edusync.edu', pass: '1' },
            { role: 'Teacher', email: 'r.mehra@edusync.edu', pass: '1' },
            { role: 'Accountant', email: 'accounts@edusync.edu', pass: '1' },
            { role: 'Parent', email: 'parent1@edusync.edu', pass: '1' },
            { role: 'Student', email: 'aarav@edusync.edu', pass: '1' },
          ].map(c => (
            <div key={c.role}
              onClick={() => { setSelectedRole(c.role); setEmail(c.email); setPassword(c.pass); setError(''); }}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: '0.2rem', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', minWidth: '80px' }}>{c.role}</span>
              <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{c.email}</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>pw: {c.pass}</span>
            </div>
          ))}
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Click any row to auto-fill</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
