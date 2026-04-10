import React, { useState, useEffect } from 'react';
import { Users, Receipt, CalendarDays, Bell, BellDot, BookOpen, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { studentApi, feeApi, attendanceApi, calendarApi, notificationApi } from '../api';
import { teachingPlanApi } from '../api/teachingPlanApi';
import FeeReceipt from '../components/FeeReceipt';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const NOTIF_COLORS = {
    'Announcement': { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    'Homework': { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    'Notice': { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    'Fee Reminder': { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
    'Attendance Alert': { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
};

const EVENT_COLORS = {
    holiday: { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
    exam: { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    event: { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    ptm: { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    activity: { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
};

const getTotal = (grade) => {
    if (grade <= 4) return 30000;
    if (grade <= 8) return 35000;
    return 40000;
};

// ── Notifications Panel ───────────────────────────────────────────────────────
const NotificationsPanel = ({ parentUserId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        notificationApi.getForParent(parentUserId)
            .then(setNotifications).catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [parentUserId]);

    const handleMarkRead = async (id) => {
        await notificationApi.markRead(id, parentUserId).catch(() => { });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    };
    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <div className="card" data-testid="notifications-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {unread > 0 ? <BellDot size={16} color="var(--danger)" /> : <Bell size={16} color="var(--primary)" />}
                    School Messages
                    {unread > 0 && <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', background: 'var(--danger)', color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>{unread} new</span>}
                </span>
            </div>
            {loading ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
                : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
                        <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {notifications.map(n => {
                            const c = NOTIF_COLORS[n.type] || NOTIF_COLORS['Notice'];
                            return (
                                <div key={n.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: n.is_read ? 'var(--bg-main)' : 'var(--bg-surface)', border: `1px solid ${n.is_read ? 'var(--border-color)' : c.color + '44'}`, opacity: n.is_read ? 0.75 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: c.bg, color: c.color }}>{n.type}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</span>
                                        </div>
                                        {!n.is_read && <button onClick={() => handleMarkRead(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Mark read</button>}
                                    </div>
                                    <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.body}</p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.sent_by_name} &middot; {fmtDate(n.created_at)}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
};

// ── Attendance Panel ──────────────────────────────────────────────────────────
const AttendancePanel = ({ student }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        attendanceApi.getByStudent(student.id).then(setRecords).catch(() => setRecords([])).finally(() => setLoading(false));
    }, [student.id]);
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const total = records.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const icon = (s) => s === 'Present' ? <CheckCircle size={13} color="var(--success)" /> : s === 'Absent' ? <XCircle size={13} color="var(--danger)" /> : <Clock size={13} color="var(--warning)" />;
    return (
        <div>
            {loading ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
                : total === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No attendance records yet.</p>
                    : <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[{ label: 'Total Days', value: total, color: 'var(--text-primary)' }, { label: 'Present', value: present, color: 'var(--success)' }, { label: 'Absent', value: absent, color: 'var(--danger)' }, { label: 'Attendance %', value: `${pct}%`, color: pct >= 75 ? 'var(--success)' : 'var(--danger)' }].map(s => (
                                <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'var(--success)' : 'var(--danger)', borderRadius: '9999px', transition: 'width 600ms ease' }} />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {records.slice(0, 20).map((r, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{fmtDate(r.date)}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: r.status === 'Present' ? 'var(--success)' : r.status === 'Absent' ? 'var(--danger)' : 'var(--warning)' }}>{icon(r.status)} {r.status}</span>
                                </div>
                            ))}
                        </div>
                    </>}
        </div>
    );
};

// ── Fee Panel ─────────────────────────────────────────────────────────────────
const FeePanel = ({ student, feeData, onReceipt }) => {
    const total = getTotal(student.grade);
    const paid = Number(feeData?.total_paid || 0);
    const due = Math.max(0, total - paid);
    const pct = total > 0 ? (paid / total) * 100 : 0;
    const isFullyPaid = due === 0;
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[{ label: 'Annual Fee', value: fmt(total), color: 'var(--text-primary)' }, { label: 'Paid', value: fmt(paid), color: 'var(--success)' }, { label: 'Due', value: fmt(due), color: due > 0 ? 'var(--danger)' : 'var(--text-secondary)' }].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: isFullyPaid ? 'var(--success)' : 'var(--warning)', borderRadius: '9999px', transition: 'width 600ms ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '9999px', background: isFullyPaid ? 'hsla(152,69%,41%,0.12)' : due === total ? 'hsla(354,70%,54%,0.12)' : 'hsla(38,92%,50%,0.12)', color: isFullyPaid ? 'var(--success)' : due === total ? 'var(--danger)' : 'hsl(38,92%,35%)' }}>
                    {isFullyPaid ? '✓ Fully Paid' : due === total ? 'Pending' : 'Partial'}
                </span>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => onReceipt(student)}>
                    <Receipt size={13} /> View Receipt
                </button>
            </div>
        </div>
    );
};

// ── Homework Panel ────────────────────────────────────────────────────────────
const HomeworkPanel = ({ child }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        if (!child?.class_id) return;
        setLoading(true);
        teachingPlanApi.getHomework(child.class_id)
            .then(setItems).catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [child?.class_id]);

    if (loading) return <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>;
    if (items.length === 0) return (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
            <BookOpen size={32} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No homework assigned yet.</p>
        </div>
    );

    // Group by week_start
    const weeks = [...new Set(items.map(i => i.week_start))].sort().reverse();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {weeks.map(ws => {
                const weekItems = items.filter(i => i.week_start === ws);
                const weekLabel = (() => {
                    const d = new Date(ws);
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                })();
                return (
                    <div key={ws}>
                        {/* Week label */}
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-focus)', padding: '0.15rem 0.55rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.4rem' }}>
                            Week of {weekLabel}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {weekItems.map(hw => (
                                <div key={hw.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderLeft: '3px solid #f59e0b', borderRadius: '6px', padding: '0.65rem 0.75rem' }}>
                                    {/* Subject + day */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-focus)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>{hw.subject}</span>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{hw.day}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{hw.topic}</span>
                                    </div>

                                    {/* Homework text */}
                                    {hw.homework && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.35rem 0.5rem', background: '#fef9c3', borderRadius: '4px', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.82rem' }}>📝</span>
                                            <span style={{ fontSize: '0.78rem', color: '#854d0e', lineHeight: 1.5 }}>{hw.homework}</span>
                                        </div>
                                    )}

                                    {/* Image thumbnail */}
                                    {hw.image_path && (
                                        <img src={teachingPlanApi.fileUrl(hw.image_path)} alt="hw"
                                            onClick={() => setLightbox(teachingPlanApi.fileUrl(hw.image_path))}
                                            style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', marginBottom: '0.35rem', border: '1px solid var(--border-color)' }} />
                                    )}

                                    {/* Attachments row */}
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {hw.pdf_path && (
                                            <a href={teachingPlanApi.fileUrl(hw.pdf_path)} target="_blank" rel="noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#dc2626', textDecoration: 'none', padding: '0.2rem 0.5rem', background: '#fee2e2', borderRadius: '4px', fontWeight: 600 }}>
                                                <FileText size={11} /> Download PDF
                                            </a>
                                        )}
                                        {hw.image_path && (
                                            <button onClick={() => setLightbox(teachingPlanApi.fileUrl(hw.image_path))}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#0369a1', background: '#e0f2fe', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                                <ImageIcon size={11} /> View Image
                                            </button>
                                        )}
                                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>By {hw.teacher_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Lightbox */}
            {lightbox && (
                <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'zoom-out' }}>
                    <img src={lightbox} alt="full" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                </div>
            )}
        </div>
    );
};

// ── Teaching Plans helpers ────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const navBtnStyle = { padding: '0.25rem 0.4rem', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center' };

const getMondayOf = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d.toISOString().split('T')[0];
};
const addWeeks = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n * 7); return d.toISOString().split('T')[0]; };
const fmtWeek = (s) => {
    const start = new Date(s); const end = new Date(s); end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const PlanItem = ({ plan, onLightbox }) => (
    <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.75rem', marginBottom: '0.35rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            {plan.image_path && (
                <img src={teachingPlanApi.fileUrl(plan.image_path)} alt="plan" onClick={() => onLightbox(teachingPlanApi.fileUrl(plan.image_path))}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, cursor: 'pointer', border: '1px solid var(--border-color)' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-focus)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>{plan.subject}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{plan.topic}</span>
                </div>
                {plan.description && <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{plan.description}</p>}
                {plan.homework && <div style={{ padding: '0.3rem 0.5rem', background: '#fef9c3', borderRadius: '4px', fontSize: '0.75rem', color: '#854d0e', marginBottom: '0.3rem' }}>📝 Homework: {plan.homework}</div>}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {plan.pdf_path && (
                        <a href={teachingPlanApi.fileUrl(plan.pdf_path)} target="_blank" rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#dc2626', textDecoration: 'none', padding: '0.2rem 0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                            <FileText size={11} /> Download PDF
                        </a>
                    )}
                    {plan.image_path && (
                        <button onClick={() => onLightbox(teachingPlanApi.fileUrl(plan.image_path))}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#0369a1', background: '#e0f2fe', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                            <ImageIcon size={11} /> View Image
                        </button>
                    )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>By {plan.teacher_name}</div>
            </div>
        </div>
    </div>
);

// ── Teaching Plans Panel ──────────────────────────────────────────────────────
const TeachingPlansPanel = ({ child }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weekStart, setWeekStart] = useState(getMondayOf(new Date()));
    const [filterWeek, setFilterWeek] = useState(false); // default: show ALL plans
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        if (!child?.class_id) return;
        setLoading(true);
        teachingPlanApi.getByClass(child.class_id, filterWeek ? weekStart : undefined)
            .then(setPlans).catch(() => setPlans([]))
            .finally(() => setLoading(false));
    }, [child?.class_id, weekStart, filterWeek]);

    const byDay = DAYS.reduce((acc, d) => { acc[d] = plans.filter(p => p.day === d); return acc; }, {});

    return (
        <div className="card">
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--primary)" /> Teaching Plans
                    <span style={{ fontSize: '0.72rem', background: 'var(--primary-focus)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                        Class {child?.class_name}
                    </span>
                </span>
                <button onClick={() => setFilterWeek(v => !v)}
                    style={{ ...navBtnStyle, fontSize: '0.72rem', padding: '0.25rem 0.65rem', background: filterWeek ? 'var(--primary)' : 'var(--bg-surface)', color: filterWeek ? '#fff' : 'var(--text-primary)', border: '1px solid var(--primary)' }}>
                    {filterWeek ? 'This Week' : 'All Plans'}
                </button>
            </div>

            {/* Week navigator — only in week mode */}
            {filterWeek && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setWeekStart(w => addWeeks(w, -1))} style={navBtnStyle}><ChevronLeft size={14} /></button>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '160px', textAlign: 'center' }}>{fmtWeek(weekStart)}</span>
                    <button onClick={() => setWeekStart(w => addWeeks(w, 1))} style={navBtnStyle}><ChevronRight size={14} /></button>
                    <button onClick={() => setWeekStart(getMondayOf(new Date()))} style={{ ...navBtnStyle, fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Today</button>
                </div>
            )}

            {loading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
            ) : plans.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                    {filterWeek ? 'No plans posted for this week.' : 'No teaching plans posted yet.'}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* All-plans mode: group by week then day */}
                    {!filterWeek && (() => {
                        const weeks = [...new Set(plans.map(p => p.week_start))].sort();
                        return weeks.map(ws => (
                            <div key={ws} style={{ marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-focus)', padding: '0.2rem 0.6rem', borderRadius: '4px', marginBottom: '0.4rem', display: 'inline-block' }}>
                                    Week of {fmtWeek(ws)}
                                </div>
                                {DAYS.filter(d => plans.some(p => p.week_start === ws && p.day === d)).map(day => (
                                    <div key={day} style={{ marginBottom: '0.4rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', marginLeft: '0.25rem' }}>{day}</div>
                                        {plans.filter(p => p.week_start === ws && p.day === day).map(plan => (
                                            <PlanItem key={plan.id} plan={plan} onLightbox={setLightbox} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ));
                    })()}

                    {/* Week mode: group by day */}
                    {filterWeek && DAYS.filter(d => byDay[d].length > 0).map(day => (
                        <div key={day}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{day}</div>
                            {byDay[day].map(plan => <PlanItem key={plan.id} plan={plan} onLightbox={setLightbox} />)}
                        </div>
                    ))}
                </div>
            )}

            {lightbox && (
                <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'zoom-out' }}>
                    <img src={lightbox} alt="full" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                </div>
            )}
        </div>
    );
};

// ── Main Parent Dashboard ─────────────────────────────────────────────────────
const ParentDashboard = () => {
    const { user } = useAuth();
    const school = useSchool();

    const [children, setChildren] = useState([]);
    const [feeMap, setFeeMap] = useState({});
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChild, setActiveChild] = useState(0);
    const [activeTab, setActiveTab] = useState('attendance');
    const [receiptModal, setReceiptModal] = useState(null);

    useEffect(() => {
        Promise.allSettled([
            studentApi.getByParent(user.id),
            feeApi.getPaymentsByParent(user.id),
            calendarApi.getAll(),
        ]).then(([kids, fees, cal]) => {
            const c = kids.status === 'fulfilled' ? kids.value : [];
            const f = fees.status === 'fulfilled' ? fees.value : [];
            const ev = cal.status === 'fulfilled' ? cal.value : [];
            setChildren(c);
            const map = {};
            f.forEach(row => { map[row.student_db_id] = row; });
            setFeeMap(map);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
            setEvents(ev.filter(e => { const d = new Date(e.event_date); return d >= today && d <= in30; })
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).slice(0, 5));
        }).finally(() => setLoading(false));
    }, [user.id]);

    const handleReceipt = async (student) => {
        const payments = await feeApi.getStudentPayments(student.id).catch(() => []);
        const feeRow = feeMap[student.id] || {};
        setReceiptModal({ student: { name: student.name, student_code: student.student_code, class_name: student.class_name, grade: student.grade, parent_name: user.name, student_db_id: student.id, paid: Number(feeRow.total_paid || 0) }, payments });
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>Loading your dashboard...</div>;

    if (children.length === 0) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Users size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem' }}>No children linked</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please contact the school admin to link your child's account.</p>
        </div>
    );

    const child = children[activeChild];
    const feeRow = feeMap[child.id];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Welcome banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, hsl(271,81%,56%) 100%)', color: 'white', border: 'none', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem', fontWeight: 700 }}>Welcome, {user?.name} 👋</h2>
                        <p style={{ margin: 0, opacity: 0.88, fontSize: '0.875rem' }}>Here's your child's school overview.</p>
                    </div>
                    {school.school_name && (
                        <div style={{ textAlign: 'right', opacity: 0.9 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{school.school_name}</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{school.trust_name} · AY {school.academic_year}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Child selector */}
            {children.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {children.map((c, i) => (
                        <button key={c.id} onClick={() => setActiveChild(i)} className={activeChild === i ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>{c.name}</button>
                    ))}
                </div>
            )}

            {/* Child info card */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>{child.name?.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{child.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{child.student_code} · Class {child.class_name} · {child.board}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', background: child.board === 'CBSE' ? 'hsla(221,83%,53%,0.12)' : 'hsla(152,69%,41%,0.12)', color: child.board === 'CBSE' ? 'hsl(221,83%,45%)' : 'hsl(152,69%,30%)' }}>{child.board}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', background: child.status === 'Active' ? 'hsla(152,69%,41%,0.12)' : 'hsla(354,70%,54%,0.12)', color: child.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{child.status}</span>
                    </div>
                </div>
            </div>

            {/* Attendance + Fees / Events grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', gap: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        {[{ key: 'attendance', label: 'Attendance' }, { key: 'fees', label: 'Fees' }, { key: 'homework', label: '📝 Homework' }].map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '-1px', whiteSpace: 'nowrap' }}>{t.label}</button>
                        ))}
                    </div>
                    {activeTab === 'attendance' && <AttendancePanel student={child} />}
                    {activeTab === 'fees' && <FeePanel student={child} feeData={feeRow} onReceipt={handleReceipt} />}
                    {activeTab === 'homework' && <HomeworkPanel child={child} />}
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays size={16} color="var(--primary)" /> Upcoming Events</span>
                    </div>
                    {events.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No events in next 30 days.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {events.map(e => {
                                const ec = EVENT_COLORS[e.type] || EVENT_COLORS.event;
                                return (
                                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: ec.bg, color: ec.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.2 }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{new Date(e.event_date).getDate()}</span>
                                            <span>{new Date(e.event_date).toLocaleString('en-IN', { month: 'short' })}</span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: ec.bg, color: ec.color, textTransform: 'capitalize' }}>{e.type}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <NotificationsPanel parentUserId={user.id} />

            {receiptModal && <FeeReceipt student={receiptModal.student} payments={receiptModal.payments} onClose={() => setReceiptModal(null)} />}
        </div>
    );
};

export default ParentDashboard;
