import React, { useState, useEffect } from 'react';
import {
    User, BookOpen, ClipboardCheck, Bell, Phone, Mail,
    CheckCircle, XCircle, Clock, Calendar, GraduationCap,
    Hash, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { studentApi, attendanceApi, calendarApi } from '../api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Board-based subject list
const CBSE_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
const SSC_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Marathi', 'Social Studies'];

const EVENT_COLORS = {
    holiday: { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
    exam: { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    event: { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    ptm: { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    activity: { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon, title, color = 'var(--primary)', children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div onClick={() => setOpen(o => !o)}
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderBottom: open ? '1px solid var(--border-color)' : 'none', background: open ? 'var(--bg-surface)' : 'var(--bg-main)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {icon}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{title}</span>
                {open ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
            </div>
            {open && <div style={{ padding: '1.25rem' }}>{children}</div>}
        </div>
    );
};

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
        {icon && <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{icon}</span>}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '130px', flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{value || '—'}</span>
    </div>
);

// ── Attendance panel ──────────────────────────────────────────────────────────
const AttendanceSection = ({ studentId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        if (!studentId) return;
        attendanceApi.getByStudent(studentId)
            .then(setRecords).catch(() => setRecords([]))
            .finally(() => setLoading(false));
    }, [studentId]);

    const filtered = records.filter(r => r.date?.slice(0, 7) === month);
    const present = filtered.filter(r => r.status === 'Present').length;
    const absent = filtered.filter(r => r.status === 'Absent').length;
    const late = filtered.filter(r => r.status === 'Late').length;
    const total = filtered.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    // All months available
    const months = [...new Set(records.map(r => r.date?.slice(0, 7)).filter(Boolean))].sort().reverse();

    const statusIcon = (s) => {
        if (s === 'Present') return <CheckCircle size={14} color="var(--success)" />;
        if (s === 'Absent') return <XCircle size={14} color="var(--danger)" />;
        return <Clock size={14} color="var(--warning)" />;
    };

    if (loading) return <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Month picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Month:</label>
                <select className="form-control" style={{ width: 'auto' }} value={month} onChange={e => setMonth(e.target.value)}>
                    {months.length === 0 && <option value={month}>{month}</option>}
                    {months.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>)}
                </select>
            </div>

            {/* Summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                    { label: 'Total Days', value: total, color: 'var(--text-primary)' },
                    { label: 'Present', value: present, color: 'var(--success)' },
                    { label: 'Absent', value: absent, color: 'var(--danger)' },
                    { label: 'Attendance %', value: `${pct}%`, color: pct >= 75 ? 'var(--success)' : 'var(--danger)' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.1rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'var(--success)' : 'var(--danger)', borderRadius: '9999px', transition: 'width 600ms ease' }} />
            </div>

            {/* Daily records */}
            {filtered.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No records for this month.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
                    {filtered.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                            {statusIcon(r.status)}
                            <span style={{ color: 'var(--text-secondary)' }}>{fmtDate(r.date)}</span>
                            <span style={{
                                marginLeft: 'auto', fontWeight: 600, fontSize: '0.72rem',
                                color: r.status === 'Present' ? 'var(--success)' : r.status === 'Absent' ? 'var(--danger)' : 'var(--warning)'
                            }}>
                                {r.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Student Dashboard ────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useAuth();
    const school = useSchool();

    const [profile, setProfile] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            studentApi.getProfile(user.id),
            calendarApi.getAll(),
        ]).then(([prof, cal]) => {
            if (prof.status === 'fulfilled') setProfile(prof.value);
            if (cal.status === 'fulfilled') {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const in60 = new Date(today); in60.setDate(in60.getDate() + 60);
                setEvents(
                    cal.value
                        .filter(e => { const d = new Date(e.event_date); return d >= today && d <= in60; })
                        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                        .slice(0, 8)
                );
            }
        }).finally(() => setLoading(false));
    }, [user.id]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
            Loading your dashboard...
        </div>
    );

    if (!profile) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <GraduationCap size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem' }}>Profile not found</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please contact the school admin to set up your student account.</p>
        </div>
    );

    const subjects = profile.board === 'SSC' ? SSC_SUBJECTS : CBSE_SUBJECTS;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Welcome banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, hsl(271,81%,56%) 100%)', color: 'white', border: 'none', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
                            {profile.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.15rem', fontWeight: 700 }}>Welcome, {profile.name} 👋</h2>
                            <p style={{ margin: 0, opacity: 0.88, fontSize: '0.85rem' }}>
                                Class {profile.class_name} · {profile.board} · Roll No. {profile.roll_no}
                            </p>
                        </div>
                    </div>
                    {school.school_name && (
                        <div style={{ textAlign: 'right', opacity: 0.9 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{school.school_name}</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{school.trust_name} · AY {school.academic_year}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Two-column grid on wider screens */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

                {/* 👤 My Profile */}
                <Section icon={<User size={16} />} title="My Profile" color="hsl(221,83%,53%)">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <InfoRow label="Student Name" value={profile.name} icon={<User size={14} />} />
                        <InfoRow label="Student ID" value={profile.student_code} icon={<Hash size={14} />} />
                        <InfoRow label="Class & Section" value={`Class ${profile.class_name} (${profile.board})`} icon={<GraduationCap size={14} />} />
                        <InfoRow label="Roll Number" value={profile.roll_no} icon={<Hash size={14} />} />
                        <InfoRow label="Date of Birth" value={fmtDate(profile.dob)} icon={<Calendar size={14} />} />
                        <InfoRow label="Gender" value={profile.gender} icon={<User size={14} />} />
                        <InfoRow label="Email" value={profile.email} icon={<Mail size={14} />} />
                        <InfoRow label="Phone" value={profile.phone} icon={<Phone size={14} />} />
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Users size={13} /> Parent / Guardian
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{profile.parent_name || profile.parent_user_name || '—'}</div>
                            {profile.parent_phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{profile.parent_phone}</div>}
                            {profile.parent_email && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{profile.parent_email}</div>}
                        </div>
                    </div>
                </Section>

                {/* 📚 My Subjects */}
                <Section icon={<BookOpen size={16} />} title="My Subjects" color="hsl(270,70%,55%)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {subjects.map((sub, i) => {
                            const colors = {
                                'Mathematics': { bg: 'hsla(221,83%,53%,0.1)', color: 'hsl(221,83%,45%)' },
                                'Science': { bg: 'hsla(152,69%,41%,0.1)', color: 'hsl(152,69%,35%)' },
                                'English': { bg: 'hsla(270,70%,55%,0.1)', color: 'hsl(270,70%,45%)' },
                                'Hindi': { bg: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,35%)' },
                                'Marathi': { bg: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,35%)' },
                                'Social Studies': { bg: 'hsla(354,70%,54%,0.1)', color: 'hsl(354,70%,45%)' },
                                'Computer Science': { bg: 'hsla(190,80%,45%,0.1)', color: 'hsl(190,80%,35%)' },
                            }[sub] || { bg: 'var(--bg-main)', color: 'var(--text-secondary)' };
                            return (
                                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                        {i + 1}
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: colors.bg, color: colors.color }}>
                                        {profile.board}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                {/* 📅 Attendance */}
                <Section icon={<ClipboardCheck size={16} />} title="My Attendance" color="hsl(152,69%,41%)">
                    <AttendanceSection studentId={profile.id} />
                </Section>

                {/* 📢 School Notices / Upcoming Events */}
                <Section icon={<Bell size={16} />} title="School Notices & Events" color="hsl(38,92%,35%)">
                    {events.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No upcoming events.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {events.map(e => {
                                const ec = EVENT_COLORS[e.type] || EVENT_COLORS.event;
                                return (
                                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: ec.bg, color: ec.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1.2 }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{new Date(e.event_date).getDate()}</span>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{new Date(e.event_date).toLocaleString('en-IN', { month: 'short' })}</span>
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
                </Section>

            </div>
        </div>
    );
};

export default StudentDashboard;
