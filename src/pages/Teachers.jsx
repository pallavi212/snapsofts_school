import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Mail, Phone, X, User, BookOpen, Clock, AtSign, PhoneCall, GraduationCap } from 'lucide-react';
import { teacherApi } from '../api';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Computer Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
const EXPERIENCES = ['< 1 Year', '1 Year', '2 Years', '3 Years', '5 Years', '8 Years', '10+ Years', '15+ Years', '20+ Years'];
// Grades 1–10, sections A B (CBSE) and C D (SSC)
const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(g => ['A', 'B', 'C', 'D'].map(s => `${g}${s}`));
const EMPTY_FORM = { name: '', subject: 'Mathematics', experience: '1 Year', phone: '', email: '', status: 'Active', qualification: '', classes: [] };

const TeacherModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    subject: initial.subject || 'Mathematics',
    experience: initial.experience || '1 Year',
    phone: initial.phone || '',
    email: initial.email || '',
    status: initial.status || 'Active',
    qualification: initial.qualification || '',
    classes: Array.isArray(initial.classes) ? initial.classes : (initial.classes ? String(initial.classes).split(',').map(c => c.trim()).filter(Boolean) : []),
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };
  const toggleClass = cls => set('classes', form.classes.includes(cls) ? form.classes.filter(c => c !== cls) : [...form.classes, cls]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.qualification.trim()) e.qualification = 'Qualification is required';
    if (form.classes.length === 0) e.classes = 'Select at least one class';
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
      <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '560px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: isEdit ? 'hsla(38,92%,50%,0.12)' : 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color={isEdit ? 'hsl(38,92%,35%)' : 'var(--primary)'} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isEdit ? `Editing ${initial.id}` : 'Fill in the details below'}</p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.3rem' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={13} /> Full Name</label>
            <input type="text" className="form-control" placeholder="e.g. Dr. Rakesh Mehra" value={form.name} onChange={e => set('name', e.target.value)} style={{ borderColor: errors.name ? 'var(--danger)' : '' }} />
            {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><GraduationCap size={13} /> Qualification</label>
            <input type="text" className="form-control" placeholder="e.g. M.Sc Mathematics, B.Ed" value={form.qualification} onChange={e => set('qualification', e.target.value)} style={{ borderColor: errors.qualification ? 'var(--danger)' : '' }} />
            {errors.qualification && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.qualification}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={13} /> Subject</label>
              <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={13} /> Experience</label>
              <select className="form-control" value={form.experience} onChange={e => set('experience', e.target.value)}>
                {EXPERIENCES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AtSign size={13} /> Email</label>
              <input type="email" className="form-control" placeholder="name@edusync.edu" value={form.email} onChange={e => set('email', e.target.value)} style={{ borderColor: errors.email ? 'var(--danger)' : '' }} />
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><PhoneCall size={13} /> Phone</label>
              <input type="text" className="form-control" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} style={{ borderColor: errors.phone ? 'var(--danger)' : '' }} />
              {errors.phone && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone}</p>}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Status</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Active', 'On Leave', 'Inactive'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)', border: `1px solid ${form.status === s ? 'var(--primary)' : 'var(--border-color)'}`, background: form.status === s ? 'var(--primary-focus)' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: form.status === s ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 150ms' }}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status', s)} style={{ display: 'none' }} />{s}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Assigned Classes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {ALL_CLASSES.map(cls => (
                <button key={cls} type="button" onClick={() => toggleClass(cls)} style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', border: `1px solid ${form.classes.includes(cls) ? 'var(--primary)' : 'var(--border-color)'}`, background: form.classes.includes(cls) ? 'var(--primary)' : 'transparent', color: form.classes.includes(cls) ? 'white' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms' }}>{cls}</button>
              ))}
            </div>
            {errors.classes && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.classes}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? <><Edit2 size={15} /> Save Changes</> : <><Plus size={15} /> Add Teacher</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(null);

  const { user } = useAuth();
  const isManagement = ['Principal', 'Admin'].includes(user?.role);

  useEffect(() => {
    teacherApi.getAll()
      .then(data => setTeachers(data.map(t => ({
        ...t,
        id: t.teacher_code,
        classes: Array.isArray(t.classes) ? t.classes : [],
      }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async form => {
    try {
      if (modal.mode === 'edit') {
        await teacherApi.update(modal.teacher.teacher_code || modal.teacher.id, form);
        setTeachers(prev => prev.map(t => (t.teacher_code || t.id) === (modal.teacher.teacher_code || modal.teacher.id) ? { ...t, ...form } : t));
      } else {
        const res = await teacherApi.create(form);
        setTeachers(prev => [{ ...form, teacher_code: res.teacher_code, id: res.teacher_code }, ...prev]);
      }
      setModal(null);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search by name or subject..." className="form-control" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        {isManagement && <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}><Plus size={18} /> Add Teacher</button>}
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading teachers...</div>}
      {error && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>Error: {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.length > 0 ? filtered.map(teacher => (
          <div key={teacher.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`} alt={teacher.name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{teacher.name}</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>{teacher.id} • {teacher.experience}</p>
                </div>
              </div>
              {isManagement && <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--primary)' }} onClick={() => setModal({ mode: 'edit', teacher })} title="Edit"><Edit2 size={16} /></button>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Subject:</span><span style={{ fontWeight: 500, color: 'var(--primary)' }}>{teacher.subject}</span></div>
              {teacher.qualification && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Qualification:</span><span style={{ fontWeight: 500 }}>{teacher.qualification}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted">Classes:</span>
                <span style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {teacher.classes.map(c => <span key={c} className="badge" style={{ backgroundColor: 'var(--bg-main)' }}>{c}</span>)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Status:</span><span className={`badge ${teacher.status === 'Active' ? 'badge-success' : teacher.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`}>{teacher.status}</span></div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
              <a href={`mailto:${teacher.email}`} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}><Mail size={16} /> Email</a>
              <a href={`tel:${teacher.phone}`} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}><Phone size={16} /> Call</a>
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No teachers found.</div>
        )}
      </div>

      {modal && (
        <TeacherModal
          key={modal.mode === 'edit' ? (modal.teacher.teacher_code || modal.teacher.id) : 'add'}
          initial={modal.mode === 'edit' ? modal.teacher : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Teachers;
