import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, User, Phone, Mail, BookOpen, Calendar, MapPin, FileText } from 'lucide-react';
import { enquiryApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePhone, validateDOB } from '../utils/validators';

const STATUS_COLORS = {
    'New': { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    'Contacted': { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    'Visited': { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    'Admitted': { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
    'Not Interested': { bg: 'hsla(0,72%,51%,0.12)', color: 'hsl(0,72%,45%)' },
};

const STATUSES = Object.keys(STATUS_COLORS);

const EMPTY = {
    parent_name: '', phone: '', email: '', student_name: '', dob: '',
    gender: 'Male', applying_for_grade: '1', board_preference: 'Any',
    previous_school: '', address: '', status: 'New', notes: '', follow_up_date: '',
};

const Field = ({ label, icon, error, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{icon}{label}</label>
        {children}
        {error && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
);

const EnquiryModal = ({ initial, onClose, onSave }) => {
    const isEdit = !!initial;
    const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); };

    const inp = (field) => ({
        width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
        border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border-color)'}`,
        background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem',
        outline: 'none', boxSizing: 'border-box',
    });

    const validate = () => {
        const e = {};
        const nameErr = validateName(form.parent_name);
        if (nameErr) e.parent_name = nameErr;
        const phoneErr = validatePhone(form.phone);
        if (phoneErr) e.phone = phoneErr;
        if (form.email) {
            const emailErr = validateEmail(form.email);
            if (emailErr) e.email = emailErr;
        }
        const studentNameErr = validateName(form.student_name);
        if (studentNameErr) e.student_name = studentNameErr;
        if (form.dob) {
            const dobErr = validateDOB(form.dob);
            if (dobErr) e.dob = dobErr;
        }
        if (Object.keys(e).length) console.warn('[Validation] Enquiry form errors:', e);
        return e;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try { await onSave(form); } finally { setSaving(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column' }}>

                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{isEdit ? 'Edit Enquiry' : 'New Admission Enquiry'}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{isEdit ? initial.enquiry_no : 'Walk-in / Phone enquiry'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={18} /></button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Parent info */}
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Parent / Guardian</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Parent Name" icon={<User size={12} />} error={errors.parent_name}>
                                    <input required style={inp('parent_name')} value={form.parent_name} onChange={e => set('parent_name', e.target.value)} placeholder="e.g. Ramesh Verma" />
                                </Field>
                                <Field label="Phone" icon={<Phone size={12} />} error={errors.phone}>
                                    <input
                                        required
                                        style={inp('phone')}
                                        value={form.phone}
                                        inputMode="numeric"
                                        maxLength={10}
                                        onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10-digit mobile number"
                                    />
                                </Field>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Email (optional)" icon={<Mail size={12} />} error={errors.email}>
                                    <input type="email" style={inp('email')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="parent@gmail.com" />
                                </Field>
                                <Field label="Address" icon={<MapPin size={12} />}>
                                    <input style={inp('address')} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Area, City" />
                                </Field>
                            </div>

                            {/* Student info */}
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.25rem' }}>Student Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Student Name" icon={<User size={12} />} error={errors.student_name}>
                                    <input required style={inp('student_name')} value={form.student_name} onChange={e => set('student_name', e.target.value)} placeholder="e.g. Arjun Verma" />
                                </Field>
                                <Field label="Date of Birth" icon={<Calendar size={12} />} error={errors.dob}>
                                    <input type="date" style={inp('dob')} value={form.dob} onChange={e => set('dob', e.target.value)} />
                                </Field>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Gender">
                                    <select style={inp('gender')} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                        {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </Field>
                                <Field label="Applying for Class">
                                    <select style={inp('applying_for_grade')} value={form.applying_for_grade} onChange={e => set('applying_for_grade', e.target.value)}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => <option key={g} value={g}>Class {g}</option>)}
                                    </select>
                                </Field>
                                <Field label="Board Preference" icon={<BookOpen size={12} />}>
                                    <select style={inp('board_preference')} value={form.board_preference} onChange={e => set('board_preference', e.target.value)}>
                                        {['Any', 'CBSE', 'SSC'].map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Previous School (optional)">
                                <input style={inp('previous_school')} value={form.previous_school} onChange={e => set('previous_school', e.target.value)} placeholder="e.g. Sunrise Primary School" />
                            </Field>

                            {/* Follow-up */}
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.25rem' }}>Follow-up</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Status">
                                    <select style={inp('status')} value={form.status} onChange={e => set('status', e.target.value)}>
                                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="Follow-up Date" icon={<Calendar size={12} />}>
                                    <input type="date" style={inp('follow_up_date')} value={form.follow_up_date || ''} onChange={e => set('follow_up_date', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Notes">
                                <textarea style={{ ...inp('notes'), resize: 'vertical', minHeight: '70px' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any remarks..." />
                            </Field>
                        </div>

                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                            <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Enquiry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Admissions = () => {
    const { user } = useAuth();
    const isManagement = ['Principal', 'Admin'].includes(user?.role);

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modal, setModal] = useState(null);

    const load = () => {
        enquiryApi.getAll()
            .then(setEnquiries)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filtered = enquiries.filter(e => {
        const matchSearch = !search ||
            e.parent_name.toLowerCase().includes(search.toLowerCase()) ||
            e.student_name.toLowerCase().includes(search.toLowerCase()) ||
            e.phone.includes(search) ||
            e.enquiry_no.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || e.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Summary counts
    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = enquiries.filter(e => e.status === s).length;
        return acc;
    }, {});

    const handleSave = async form => {
        try {
            if (modal.mode === 'edit') {
                await enquiryApi.update(modal.enquiry.id, form);
                setEnquiries(prev => prev.map(e => e.id === modal.enquiry.id ? { ...e, ...form } : e));
            } else {
                const res = await enquiryApi.create(form);
                setEnquiries(prev => [{ ...form, id: Date.now(), enquiry_no: res.enquiry_no, enquiry_date: new Date().toISOString().split('T')[0] }, ...prev]);
            }
            setModal(null);
        } catch (e) {
            alert('Error: ' + e.message);
            throw e;
        }
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this enquiry?')) return;
        await enquiryApi.remove(id).catch(() => { });
        setEnquiries(prev => prev.filter(e => e.id !== id));
    };

    const handleStatusChange = async (id, status) => {
        await enquiryApi.update(id, { status }).catch(() => { });
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                {STATUSES.map(s => {
                    const sc = STATUS_COLORS[s];
                    return (
                        <div key={s} onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                            className="card" style={{ padding: '0.875rem 1rem', cursor: 'pointer', borderLeft: `4px solid ${sc.color}`, background: statusFilter === s ? sc.bg : 'var(--bg-surface)', transition: 'all 150ms' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sc.color, lineHeight: 1 }}>{counts[s] || 0}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s}</div>
                        </div>
                    );
                })}
            </div>

            {/* Search + Add */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '380px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Search by name, phone, enquiry no..." className="form-control"
                        value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{filtered.length} enquiries</span>
                    {isManagement && (
                        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
                            <Plus size={16} /> New Enquiry
                        </button>
                    )}
                </div>
            </div>

            {loading && <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>}
            {error && <div className="card" style={{ textAlign: 'center', padding: '1rem', color: 'var(--danger)' }}>Error: {error}</div>}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Enquiry No</th>
                                <th>Parent / Phone</th>
                                <th>Student</th>
                                <th>Class / Board</th>
                                <th>Date</th>
                                <th>Follow-up</th>
                                <th>Status</th>
                                {isManagement && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && !loading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No enquiries found.</td></tr>
                            ) : filtered.map(e => {
                                const sc = STATUS_COLORS[e.status] || STATUS_COLORS['New'];
                                return (
                                    <tr key={e.id}>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{e.enquiry_no}</td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{e.parent_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.phone}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{e.student_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.gender}{e.dob ? ` · ${new Date(e.dob).toLocaleDateString('en-IN')}` : ''}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary" style={{ marginRight: '0.3rem' }}>Class {e.applying_for_grade}</span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{e.board_preference}</span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {e.enquiry_date ? new Date(e.enquiry_date).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: e.follow_up_date ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {e.follow_up_date ? new Date(e.follow_up_date).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td>
                                            {isManagement ? (
                                                <select value={e.status} onChange={ev => handleStatusChange(e.id, ev.target.value)}
                                                    style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', border: `1px solid ${sc.color}`, background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{e.status}</span>
                                            )}
                                        </td>
                                        {isManagement && (
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--primary)' }} onClick={() => setModal({ mode: 'edit', enquiry: e })} title="Edit"><Edit2 size={15} /></button>
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(e.id)} title="Delete"><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <EnquiryModal
                    key={modal.mode === 'edit' ? modal.enquiry.id : 'add'}
                    initial={modal.mode === 'edit' ? modal.enquiry : null}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Admissions;
