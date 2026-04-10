import React, { useState, useEffect, useCallback } from 'react';
import {
    BookOpen, Plus, Edit2, Trash2, X, Upload, FileText,
    ChevronLeft, ChevronRight, ClipboardList, Image as ImageIcon
} from 'lucide-react';
import { teachingPlanApi } from '../api/teachingPlanApi';
import { teacherApi } from '../api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(g => ['A', 'B', 'C', 'D'].map(s => `${g}${s}`));
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Computer Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Art', 'Physical Education'];

// Get Monday of a given date's week
const getMondayOf = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
};

const addWeeks = (mondayStr, n) => {
    const d = new Date(mondayStr);
    d.setDate(d.getDate() + n * 7);
    return d.toISOString().split('T')[0];
};

const formatWeekLabel = (mondayStr) => {
    const start = new Date(mondayStr);
    const end = new Date(mondayStr);
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const EMPTY = { class_name: '', day: 'Monday', subject: SUBJECTS[0], topic: '', description: '', homework: '', pdf: null, image: null };

export default function TeachingPlans() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'Teacher';
    const isAdmin = ['Principal', 'Admin'].includes(user?.role);

    const [teachers, setTeachers] = useState([]);
    const [selTeacher, setSelTeacher] = useState(null); // { id, name, classes[] }
    const [selClass, setSelClass] = useState('');
    const [weekStart, setWeekStart] = useState(getMondayOf(new Date()));
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', data }
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Load teachers list (admin view) or resolve own teacher record
    useEffect(() => {
        if (isAdmin) {
            teacherApi.getAll().then(setTeachers).catch(() => { });
        } else if (isTeacher) {
            teacherApi.getAll().then(all => {
                const mine = all.find(t => t.name === user.name);
                if (mine) setSelTeacher(mine);
            }).catch(() => { });
        }
    }, [isAdmin, isTeacher, user]);

    const loadPlans = useCallback(async () => {
        const tid = isAdmin ? selTeacher?.id : selTeacher?.id;
        if (!tid) return;
        setLoading(true);
        try {
            const data = await teachingPlanApi.getByTeacher(tid, selClass || undefined, weekStart);
            setPlans(data);
        } catch { setPlans([]); }
        setLoading(false);
    }, [selTeacher, selClass, weekStart]);

    useEffect(() => { loadPlans(); }, [loadPlans]);

    // Build weekly grid: day → plan (for selected class)
    const grid = DAYS.reduce((acc, d) => {
        acc[d] = plans.filter(p => p.day === d && (!selClass || p.class_name === selClass));
        return acc;
    }, {});

    const openAdd = (day) => {
        setForm({ ...EMPTY, day, class_name: selClass || (selTeacher?.classes?.[0] || '') });
        setModal({ mode: 'add' });
        setError('');
    };

    const openEdit = (plan) => {
        setForm({
            class_name: plan.class_name,
            day: plan.day,
            subject: plan.subject,
            topic: plan.topic,
            description: plan.description || '',
            homework: plan.homework || '',
            pdf: null,
            image: null,
            _id: plan.id,
            _existing_pdf: plan.pdf_path,
            _existing_image: plan.image_path,
        });
        setModal({ mode: 'edit', plan });
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.topic.trim()) { setError('Topic is required'); return; }
        if (!form.class_name) { setError('Select a class'); return; }

        setSaving(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('teacher_id', selTeacher.id);
            // resolve class_id from class name
            fd.append('class_name', form.class_name);
            fd.append('week_start', weekStart);
            fd.append('day', form.day);
            fd.append('subject', form.subject);
            fd.append('topic', form.topic);
            fd.append('description', form.description);
            fd.append('homework', form.homework);
            if (form.pdf) fd.append('pdf', form.pdf);
            if (form.image) fd.append('image', form.image);

            if (modal.mode === 'add') {
                await teachingPlanApi.create(fd);
            } else {
                await teachingPlanApi.update(form._id, fd);
            }
            setModal(null);
            loadPlans();
        } catch (err) {
            setError(err.message || 'Save failed');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this plan?')) return;
        await teachingPlanApi.delete(id);
        loadPlans();
    };

    const teacherClasses = selTeacher?.classes || [];

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <BookOpen size={24} color="var(--primary, #6366f1)" />
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Teaching Plans</h1>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                {isAdmin && (
                    <select
                        value={selTeacher?.id || ''}
                        onChange={e => {
                            const t = teachers.find(t => String(t.id) === e.target.value);
                            setSelTeacher(t || null);
                            setSelClass('');
                        }}
                        style={selectStyle}
                    >
                        <option value=''>— Select Teacher —</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                    </select>
                )}

                <select value={selClass} onChange={e => setSelClass(e.target.value)} style={selectStyle}>
                    <option value=''>All Classes</option>
                    {(teacherClasses.length ? teacherClasses : ALL_CLASSES).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* Week navigator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => setWeekStart(w => addWeeks(w, -1))} style={navBtn}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '180px', textAlign: 'center' }}>
                        {formatWeekLabel(weekStart)}
                    </span>
                    <button onClick={() => setWeekStart(w => addWeeks(w, 1))} style={navBtn}>
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={() => setWeekStart(getMondayOf(new Date()))} style={{ ...navBtn, fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        Today
                    </button>
                </div>
            </div>

            {/* Weekly Grid */}
            {loading ? (
                <p style={{ color: '#888' }}>Loading...</p>
            ) : !selTeacher ? (
                <div style={emptyBox}>
                    <ClipboardList size={40} color="#ccc" />
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>{isAdmin ? 'Select a teacher to view plans' : 'Loading your profile...'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {DAYS.map(day => (
                        <div key={day} style={dayCard}>
                            <div style={dayHeader}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{day}</span>
                                {(isTeacher || isAdmin) && (
                                    <button onClick={() => openAdd(day)} style={addBtn} title="Add plan">
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>
                            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {grid[day]?.length === 0 && (
                                    <p style={{ fontSize: '0.75rem', color: '#bbb', textAlign: 'center', padding: '0.5rem 0' }}>No plan</p>
                                )}
                                {grid[day]?.map(plan => (
                                    <PlanCard key={plan.id} plan={plan} onEdit={() => openEdit(plan)} onDelete={() => handleDelete(plan.id)} canEdit={isTeacher || isAdmin} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <PlanModal
                    mode={modal.mode}
                    form={form}
                    setForm={setForm}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    saving={saving}
                    error={error}
                    teacherClasses={teacherClasses}
                />
            )}
        </div>
    );
}

function PlanCard({ plan, onEdit, onDelete, canEdit }) {
    return (
        <div style={cardStyle}>
            {/* Image preview */}
            {plan.image_path && (
                <img
                    src={teachingPlanApi.fileUrl(plan.image_path)}
                    alt="plan"
                    style={{ width: '100%', borderRadius: '4px', marginBottom: '0.4rem', maxHeight: '120px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => window.open(teachingPlanApi.fileUrl(plan.image_path), '_blank')}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600, marginBottom: '0.2rem' }}>
                        {plan.class_name} · {plan.subject}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{plan.topic}</div>
                    {plan.description && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{plan.description}</div>
                    )}
                    {plan.homework && (
                        <div style={{ marginTop: '0.4rem', padding: '0.3rem 0.5rem', background: '#fef9c3', borderRadius: '4px', fontSize: '0.72rem', color: '#854d0e' }}>
                            📝 HW: {plan.homework}
                        </div>
                    )}
                    {plan.pdf_path && (
                        <a
                            href={teachingPlanApi.fileUrl(plan.pdf_path)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem', fontSize: '0.72rem', color: '#dc2626', textDecoration: 'none' }}
                        >
                            <FileText size={12} /> PDF Attachment
                        </a>
                    )}
                </div>
                {canEdit && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '0.4rem' }}>
                        <button onClick={onEdit} style={iconBtn('#6366f1')}><Edit2 size={12} /></button>
                        <button onClick={onDelete} style={iconBtn('#ef4444')}><Trash2 size={12} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlanModal({ mode, form, setForm, onClose, onSave, saving, error, teacherClasses }) {
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div style={overlay}>
            <div style={modalBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{mode === 'add' ? 'Add Plan' : 'Edit Plan'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={row2}>
                        <label style={labelStyle}>
                            Class
                            <select value={form.class_name} onChange={e => set('class_name', e.target.value)} style={inputStyle} required>
                                <option value=''>Select class</option>
                                {(teacherClasses.length ? teacherClasses : ALL_CLASSES).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                        <label style={labelStyle}>
                            Day
                            <select value={form.day} onChange={e => set('day', e.target.value)} style={inputStyle}>
                                {DAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </label>
                    </div>

                    <label style={labelStyle}>
                        Subject
                        <select value={form.subject} onChange={e => set('subject', e.target.value)} style={inputStyle}>
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </label>

                    <label style={labelStyle}>
                        Topic *
                        <input value={form.topic} onChange={e => set('topic', e.target.value)} style={inputStyle} placeholder="e.g. Fractions – Introduction" required />
                    </label>

                    <label style={labelStyle}>
                        Description
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="What will be covered..." />
                    </label>

                    <label style={labelStyle}>
                        Homework Instructions
                        <textarea value={form.homework} onChange={e => set('homework', e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="e.g. Solve Ex 3.1 Q1–Q5" />
                    </label>

                    {/* PDF Upload */}
                    <label style={labelStyle}>
                        Homework PDF (optional)
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}>
                                <Upload size={14} /> {form.pdf ? form.pdf.name : 'Choose PDF'}
                                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => set('pdf', e.target.files[0] || null)} />
                            </label>
                            {form._existing_pdf && !form.pdf && (
                                <a href={teachingPlanApi.pdfUrl(form._existing_pdf)} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FileText size={12} /> Current PDF
                                </a>
                            )}
                        </div>
                    </label>

                    {/* Image Upload */}
                    <label style={labelStyle}>
                        Homework Image (optional)
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}>
                                <ImageIcon size={14} /> {form.image ? form.image.name : 'Choose Image'}
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => set('image', e.target.files[0] || null)} />
                            </label>
                            {form.image && (
                                <img src={URL.createObjectURL(form.image)} alt="preview"
                                    style={{ height: '48px', borderRadius: '4px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
                            )}
                            {form._existing_image && !form.image && (
                                <img src={teachingPlanApi.fileUrl(form._existing_image)} alt="current"
                                    style={{ height: '48px', borderRadius: '4px', border: '1px solid #e2e8f0', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => window.open(teachingPlanApi.fileUrl(form._existing_image), '_blank')} />
                            )}
                        </div>
                    </label>

                    {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: 0 }}>{error}</p>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
                        <button type="submit" disabled={saving} style={saveBtn}>{saving ? 'Saving...' : 'Save Plan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const selectStyle = { padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#fff', cursor: 'pointer' };
const navBtn = { padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const dayCard = { background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: '120px' };
const dayHeader = { background: '#f8fafc', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' };
const addBtn = { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const cardStyle = { background: '#f8fafc', borderRadius: '6px', padding: '0.5rem', border: '1px solid #e2e8f0' };
const iconBtn = (color) => ({ background: 'none', border: 'none', cursor: 'pointer', color, padding: '0.15rem', display: 'flex', alignItems: 'center' });
const emptyBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalBox = { background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' };
const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, color: '#374151' };
const inputStyle = { padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
const cancelBtn = { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '0.875rem' };
const saveBtn = { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 };
