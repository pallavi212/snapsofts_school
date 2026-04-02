import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, X, Users, GraduationCap, User, Phone, Calendar, BookOpen, Shield, Link2, CheckCircle } from 'lucide-react';
import { studentApi, userApi } from '../api';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  name: '', board: 'CBSE', class: '10', section: 'A',
  gender: 'Male', dob: '', status: 'Active',
  parent: '', contact: '', parentEmail: '', parentRelation: 'Father',
  parent_user_id: null,
};

const BOARD_SECTIONS = { CBSE: ['A', 'B'], SSC: ['C', 'D'] };

const boardColor = (board) => board === 'CBSE'
  ? { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' }
  : { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,35%)' };

const Field = ({ label, icon, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      {icon}{label}
    </label>
    {children}
    {error && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ── Parent Account Link Field ─────────────────────────────────────────────────
const ParentLinkField = ({ value, parentName, onChange }) => {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  // Load parents once on mount
  useEffect(() => {
    setLoading(true);
    userApi.getParents()
      .then(setParents)
      .catch(() => setParents([]))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = parents.find(p => p.id === value);
  const filtered = parents.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }} ref={ref}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Link2 size={12} /> Link Parent Login Account
      </label>

      {/* Selected parent badge */}
      {selected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'hsla(152,69%,41%,0.08)', border: '1px solid hsla(152,69%,41%,0.3)' }}>
          <CheckCircle size={15} color="var(--success)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selected.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{selected.email || selected.phone || 'No email'}</div>
          </div>
          <button type="button" onClick={() => onChange(null, '')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.1rem', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            placeholder={loading ? 'Loading parents...' : 'Search parent by name or email...'}
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', maxHeight: '180px', overflowY: 'auto', marginTop: '2px' }}>
              {filtered.map(p => (
                <div key={p.id}
                  onClick={() => { onChange(p.id, p.name); setSearch(''); setOpen(false); }}
                  style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.1rem', borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.email || p.phone || p.user_code}</span>
                </div>
              ))}
            </div>
          )}
          {open && !loading && filtered.length === 0 && search && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              No parent accounts found for "{search}"
            </div>
          )}
        </div>
      )}
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        Link a parent login so they can view this student's data in the parent portal.
      </span>
    </div>
  );
};

const StudentModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial ? {
    name: initial.name || '', board: initial.board || 'CBSE',
    class: initial.class || '10', section: initial.section || 'A',
    gender: initial.gender || 'Male', dob: initial.dob || '',
    status: initial.status || 'Active', parent: initial.parent || '',
    contact: initial.contact || '', parentEmail: initial.parentEmail || '',
    parentRelation: initial.parentRelation || 'Father',
    parent_user_id: initial.parent_user_id || null,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (f, v) => {
    setForm(p => {
      const next = { ...p, [f]: v };
      if (f === 'board') next.section = BOARD_SECTIONS[v]?.[0] || 'A';
      return next;
    });
    setErrors(p => ({ ...p, [f]: '' }));
  };

  const sections = BOARD_SECTIONS[form.board] || ['A', 'B'];

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.dob) e.dob = 'Required';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.parent.trim()) e.parent = 'Required';
    if (!form.contact.trim()) e.contact = 'Required';
    else if (!/^\+?[\d\s-]{8,}$/.test(form.contact)) e.contact = 'Invalid number';
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const e2 = validateStep2();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inp = (field) => ({
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
    border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border-color)'}`,
    background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: isEdit ? 'hsla(38,92%,50%,0.12)' : 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color={isEdit ? 'hsl(38,92%,35%)' : 'var(--primary)'} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{isEdit ? 'Edit Student' : 'Add New Student'}</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {isEdit ? `Editing ${initial.id}` : `Step ${step} of 2 — ${step === 1 ? 'Student Details' : 'Parent / Contact'}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}><X size={18} /></button>
        </div>

        {/* Step indicator */}
        {!isEdit && (
          <div style={{ display: 'flex', padding: '0.75rem 1.5rem', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, background: step >= s ? 'var(--primary)' : 'var(--bg-main)', color: step >= s ? 'white' : 'var(--text-secondary)', border: `2px solid ${step >= s ? 'var(--primary)' : 'var(--border-color)'}`, transition: 'all 200ms' }}>{s}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: step >= s ? 'var(--primary)' : 'var(--text-secondary)' }}>{s === 1 ? 'Student Info' : 'Parent Info'}</span>
                {s < 2 && <div style={{ flex: 1, height: '2px', background: step > s ? 'var(--primary)' : 'var(--border-color)', borderRadius: '9999px', transition: 'background 200ms' }} />}
              </div>
            ))}
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            {(step === 1 || isEdit) && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Board" icon={<BookOpen size={12} />}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['CBSE', 'SSC'].map(b => (
                      <button key={b} type="button" onClick={() => set('board', b)}
                        style={{ flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-md)', border: `2px solid ${form.board === b ? 'var(--primary)' : 'var(--border-color)'}`, background: form.board === b ? 'var(--primary)' : 'transparent', color: form.board === b ? 'white' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 150ms' }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Full Name" icon={<User size={12} />} error={errors.name}>
                  <input style={inp('name')} placeholder="e.g. Aarav Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Class">
                    <select style={inp('class')} value={form.class} onChange={e => set('class', e.target.value)}>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(i => <option key={i} value={String(i)}>Class {i}</option>)}
                    </select>
                  </Field>
                  <Field label="Section">
                    <select style={inp('section')} value={form.section} onChange={e => set('section', e.target.value)}>
                      {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select style={inp('status')} value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Date of Birth" icon={<Calendar size={12} />} error={errors.dob}>
                    <input type="date" style={inp('dob')} value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </Field>
                  <Field label="Gender" icon={<User size={12} />}>
                    <select style={inp('gender')} value={form.gender} onChange={e => set('gender', e.target.value)}>
                      {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {(step === 2 || isEdit) && (
              <div style={{ padding: isEdit ? '0 1.5rem 1.25rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isEdit && <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />}
                <Field label="Parent / Guardian Name" icon={<User size={12} />} error={errors.parent}>
                  <input style={inp('parent')} placeholder="e.g. Rajesh Sharma" value={form.parent} onChange={e => set('parent', e.target.value)} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Relation" icon={<Shield size={12} />}>
                    <select style={inp('parentRelation')} value={form.parentRelation} onChange={e => set('parentRelation', e.target.value)}>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </Field>
                  <Field label="Contact Number" icon={<Phone size={12} />} error={errors.contact}>
                    <input style={inp('contact')} placeholder="+91 XXXXX XXXXX" value={form.contact} onChange={e => set('contact', e.target.value)} />
                  </Field>
                </div>
                <Field label="Parent Email (optional)">
                  <input type="email" style={inp('parentEmail')} placeholder="parent@example.com" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
                </Field>
                {/* Parent Account Link */}
                <ParentLinkField
                  value={form.parent_user_id}
                  parentName={form.parent}
                  onChange={(id, name) => setForm(p => ({ ...p, parent_user_id: id, parent: name || p.parent }))}
                />
              </div>
            )}

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              {!isEdit && step === 2
                ? <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>← Back</button>
                : <span />}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Cancel</button>
                {!isEdit && step === 1
                  ? <button type="button" onClick={handleNext} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Next →</button>
                  : <button type="submit" disabled={saving} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Student'}
                  </button>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classCounts, setClassCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [divFilter, setDivFilter] = useState('All');
  const [openGrades, setOpenGrades] = useState({ 10: true });
  const [modal, setModal] = useState(null);

  const { user } = useAuth();
  const isManagement = ['Principal', 'Admin'].includes(user?.role);

  const loadData = () => {
    Promise.all([studentApi.getAll(), studentApi.countByClass()])
      .then(([data, counts]) => {
        setStudents(data.map(s => {
          const sec = s.class_name ? s.class_name.replace(/[0-9]/g, '').trim() : 'A';
          return {
            ...s,
            id: s.student_code,
            class: String(s.grade),
            section: sec,
            board: s.board || (['A', 'B'].includes(sec) ? 'CBSE' : 'SSC'),
            parent: s.parent_name || '',
            contact: s.phone || '',
            roll: s.roll_no,
            dob: s.dob ? new Date(s.dob).toISOString().split('T')[0] : '',
            gender: s.gender || 'Male',
            parent_user_id: s.parent_user_id || null,
          };
        }));
        setClassCounts(counts);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggleGrade = (g) => setOpenGrades(p => ({ ...p, [g]: !p[g] }));

  // Grade totals from classCounts
  const gradeTotals = {};
  classCounts.forEach(c => {
    const g = String(c.grade);
    gradeTotals[g] = (gradeTotals[g] || 0) + Number(c.count);
  });

  const allFiltered = students.filter(s => {
    const matchSearch = !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = gradeFilter === 'All' || s.class === gradeFilter;
    const matchDiv = divFilter === 'All' || s.section === divFilter;
    return matchSearch && matchGrade && matchDiv;
  });

  const grades = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const byGrade = {};
  grades.forEach(g => { byGrade[g] = allFiltered.filter(s => s.class === String(g)); });

  const handleSave = async form => {
    try {
      if (modal.mode === 'edit') {
        await studentApi.update(modal.student.id, form);
        setStudents(prev => prev.map(s => s.id === modal.student.id ? { ...s, ...form } : s));
      } else {
        const res = await studentApi.create(form);
        const newId = res.student_code || `STU${String(students.length + 1).padStart(3, '0')}`;
        setStudents(prev => [{ ...form, id: newId, roll: students.length + 1 }, ...prev]);
        studentApi.countByClass().then(setClassCounts).catch(() => { });
      }
      setModal(null);
    } catch (e) {
      alert('Error: ' + e.message);
      throw e;
    }
  };

  const handleDelete = id => setStudents(prev => prev.filter(s => s.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {loading && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading students...</div>}
      {error && <div className="card" style={{ textAlign: 'center', padding: '1rem', color: 'var(--danger)' }}>Error: {error}</div>}

      {/* Search + Filters + Add */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search by name or ID..." className="form-control"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
        </div>

        {/* Class dropdown */}
        <div style={{ position: 'relative', minWidth: '140px' }}>
          <GraduationCap size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <select className="form-control" value={gradeFilter}
            onChange={e => { setGradeFilter(e.target.value); setDivFilter('All'); }}
            style={{ paddingLeft: '2.25rem', cursor: 'pointer' }}>
            <option value="All">All Classes</option>
            {grades.map(g => (
              <option key={g} value={String(g)}>
                Class {g} ({gradeTotals[String(g)] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Division dropdown */}
        <div style={{ position: 'relative', minWidth: '150px' }}>
          <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <select className="form-control" value={divFilter}
            onChange={e => setDivFilter(e.target.value)}
            style={{ paddingLeft: '2.25rem', cursor: 'pointer' }}>
            <option value="All">All Divisions</option>
            <option value="A">Div A (CBSE)</option>
            <option value="B">Div B (CBSE)</option>
            <option value="C">Div C (SSC)</option>
            <option value="D">Div D (SSC)</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {allFiltered.length} of {students.length} students
          </span>
          {isManagement && (
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
              <Plus size={16} /> Add Student
            </button>
          )}
        </div>
      </div>

      {/* Grade-grouped sections */}
      {grades.map(g => {
        const gradeStudents = byGrade[g];
        if (gradeStudents.length === 0) return null;
        const isOpen = !!openGrades[g];
        const cbseCount = gradeStudents.filter(s => ['A', 'B'].includes(s.section)).length;
        const sscCount = gradeStudents.filter(s => ['C', 'D'].includes(s.section)).length;

        return (
          <div key={g} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Grade header */}
            <div onClick={() => toggleGrade(g)}
              style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isOpen ? 'var(--primary-focus)' : 'var(--bg-surface)', borderBottom: isOpen ? '1px solid var(--border-color)' : 'none', transition: 'background 150ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{g}</div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Standard {g}</span>
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{gradeStudents.length} student{gradeStudents.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {cbseCount > 0 && <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, ...boardColor('CBSE') }}>CBSE {cbseCount}</span>}
                  {sscCount > 0 && <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, ...boardColor('SSC') }}>SSC {sscCount}</span>}
                </div>
              </div>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>▾</span>
            </div>

            {/* Division sub-sections */}
            {isOpen && (
              <div>
                {['A', 'B', 'C', 'D'].map(div => {
                  const divStudents = gradeStudents.filter(s => s.section === div);
                  if (divStudents.length === 0) return null;
                  const divBoard = ['A', 'B'].includes(div) ? 'CBSE' : 'SSC';
                  const bc = boardColor(divBoard);
                  return (
                    <div key={div} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-main)' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', background: bc.bg, color: bc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>{div}</div>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Division {div}</span>
                        <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: bc.bg, color: bc.color }}>{divBoard}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{divStudents.length} student{divStudents.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th><th>Student</th><th>ID</th><th>Roll</th><th>Gender</th><th>Parent / Contact</th><th>Status</th>
                              {isManagement && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {divStudents.map((s, idx) => (
                              <tr key={s.id}>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', width: '36px' }}>{idx + 1}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: bc.bg, color: bc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
                                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</span>
                                  </div>
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.id}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.roll || '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{s.gender || '—'}</td>
                                <td>
                                  <div style={{ fontSize: '0.85rem' }}>{s.parent || '—'}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.contact}</div>
                                </td>
                                <td><span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                                {isManagement && (
                                  <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                      <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--primary)' }} onClick={() => setModal({ mode: 'edit', student: s })} title="Edit"><Edit2 size={15} /></button>
                                      <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={15} /></button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {allFiltered.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No students found.</div>
      )}

      {modal && <StudentModal initial={modal.mode === 'edit' ? modal.student : null} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
};

export default Students;
