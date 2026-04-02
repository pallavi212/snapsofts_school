import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, X, User, Mail, Phone, Lock } from 'lucide-react';
import { userApi } from '../api';

const ROLE_COLORS = {
  Principal: { bg: 'hsla(221,83%,53%,0.1)', color: 'hsl(221,83%,45%)' },
  Admin: { bg: 'hsla(270,70%,55%,0.1)', color: 'hsl(270,70%,45%)' },
  Teacher: { bg: 'hsla(152,69%,41%,0.1)', color: 'hsl(152,69%,35%)' },
  Accountant: { bg: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,35%)' },
  Student: { bg: 'hsla(190,80%,45%,0.1)', color: 'hsl(190,80%,35%)' },
  Parent: { bg: 'hsla(354,70%,54%,0.1)', color: 'hsl(354,70%,45%)' },
};

const ROLES = ['Principal', 'Admin', 'Teacher', 'Accountant', 'Student', 'Parent'];

const UserModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial
    ? { name: initial.name, email: initial.email, phone: initial.phone, role: initial.role, status: initial.status, password: '' }
    : { name: '', email: '', phone: '', role: 'Teacher', status: 'Active', password: '' });
  const [errors, setErrors] = useState({});
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!isEdit && !form.password.trim()) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '480px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: isEdit ? 'hsla(38,92%,50%,0.12)' : 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color={isEdit ? 'hsl(38,92%,35%)' : 'var(--primary)'} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{isEdit ? 'Edit User' : 'Add New User'}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isEdit ? `Editing ${initial.id}` : 'Fill in user details'}</p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.3rem' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={13} /> Full Name</label>
            <input type="text" className="form-control" value={form.name} onChange={e => set('name', e.target.value)} style={{ borderColor: errors.name ? 'var(--danger)' : '' }} />
            {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} /> Email</label>
            <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} style={{ borderColor: errors.email ? 'var(--danger)' : '' }} />
            {errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={13} /> Phone</label>
            <input type="text" className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} style={{ borderColor: errors.phone ? 'var(--danger)' : '' }} />
            {errors.phone && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone}</p>}
          </div>
          {!isEdit && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={13} /> Password</label>
              <input type="password" placeholder="Set initial password" title="Set initial password" name="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} style={{ borderColor: errors.password ? 'var(--danger)' : '' }} />
              {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={13} /> Role</label>
              <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={13} /> Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Active', 'Inactive', 'On Leave'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? <><Edit2 size={15} /> Save Changes</> : <><Plus size={15} /> Add User</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    userApi.getAll()
      .then(data => setUsers(data.map(u => ({ ...u, id: u.user_code || String(u.id), joined: u.created_at || u.joined_date || u.joined }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (roleFilter === 'All' || u.role === roleFilter);
  });

  const handleSave = async form => {
    try {
      if (modal.mode === 'edit') {
        await userApi.update(modal.user.id, form);
        setUsers(prev => prev.map(u => u.id === modal.user.id ? { ...u, ...form } : u));
      } else {
        const res = await userApi.create(form);
        setUsers(prev => [{ ...form, id: res.user_code, joined: new Date().toISOString().split('T')[0] }, ...prev]);
      }
      setModal(null);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async id => {
    try {
      await userApi.remove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {loading && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading users...</div>}
      {error && <div className="card" style={{ textAlign: 'center', padding: '1rem', color: 'var(--danger)' }}>Error: {error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {ROLES.map(r => {
          const c = ROLE_COLORS[r];
          return (
            <div key={r} className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderTop: `3px solid ${c.color}` }}
              onClick={() => setRoleFilter(roleFilter === r ? 'All' : r)}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: c.color }}>{roleCounts[r] || 0}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{r}s</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="form-control" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: '240px' }} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}><Plus size={16} /> Add User</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Contact</th><th>Joined</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rc = ROLE_COLORS[u.role] || {};
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: rc.bg, color: rc.color }}>{u.role}</span></td>
                    <td><div style={{ fontSize: '0.8rem' }}>{u.email}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.phone}</div></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(u.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge ${u.status === 'Active' ? 'badge-success' : u.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`}>{u.status}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.3rem', color: 'var(--primary)' }} onClick={() => setModal({ mode: 'edit', user: u })} title="Edit"><Edit2 size={15} /></button>
                        <button className="btn btn-ghost" style={{ padding: '0.3rem', color: 'var(--danger)' }} onClick={() => handleDelete(u.id)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {modal && <UserModal initial={modal.mode === 'edit' ? modal.user : null} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
};

export default UserManagement;
