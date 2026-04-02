import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, CheckCircle, XCircle, Clock, AlertCircle, Receipt, CalendarDays, Bell, BellDot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { studentApi, feeApi, attendanceApi, calendarApi, notificationApi } from '../api';
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
                    {unread > 0
                        ? <BellDot size={16} color="var(--danger)" />
                        : <Bell size={16} color="var(--primary)" />}
                    School Messages
                    {unread > 0 && (
                        <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', background: 'var(--danger)', color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>
                            {unread} new
                        </span>
                    )}
                </span>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
            ) : notifications.length === 0 ? (
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
                                    {!n.is_read && (
                                        <button onClick={() => handleMarkRead(n.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            Mark read
                                        </button>
                                    )}
                                </div>
                                <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.body}</p>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    {n.sent_by_name} &middot; {fmtDate(n.created_at)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const getTotal = (grade) => {
    if (grade <= 4) return 30000;
    if (grade <= 8) return 35000;
    return 40000;
};

const EVENT_COLORS = {
    holiday: { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
    exam: { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    event: { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    ptm: { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    activity: { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
};

// ── Attendance mini-calendar for one student ──────────────────────────────────
const AttendancePanel = ({ student }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        attendanceApi.getByStudent(student.id)
            .then(setRecords)
            .catch(() => setRecords([]))
            .finally(() => setLoading(false));
    }, [student.id]);

    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;
    const total = records.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    const statusIcon = (s) => {
        if (s === 'Present') return <CheckCircle size={13} color="var(--success)" />;
        if (s === 'Absent') return <XCircle size={13} color="var(--danger)" />;
        return <Clock size={13} color="var(--warning)" />;
    };

    return (
        <div>
            {loading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
            ) : total === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No attendance records yet.</p>
            ) : (
                <>
                    {/* Summary strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Total Days', value: total, color: 'var(--text-primary)' },
                            { label: 'Present', value: present, color: 'var(--success)' },
                            { label: 'Absent', value: absent, color: 'var(--danger)' },
                            { label: 'Attendance %', value: `${pct}%`, color: pct >= 75 ? 'var(--success)' : 'var(--danger)' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'var(--success)' : 'var(--danger)', borderRadius: '9999px', transition: 'width 600ms ease' }} />
                    </div>
                    {/* Recent records */}
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {records.slice(0, 20).map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{fmtDate(r.date)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: r.status === 'Present' ? 'var(--success)' : r.status === 'Absent' ? 'var(--danger)' : 'var(--warning)' }}>
                                    {statusIcon(r.status)} {r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ── Fee panel for one student ─────────────────────────────────────────────────
const FeePanel = ({ student, feeData, onReceipt }) => {
    const total = getTotal(student.grade);
    const paid = Number(feeData?.total_paid || 0);
    const due = Math.max(0, total - paid);
    const pct = total > 0 ? (paid / total) * 100 : 0;
    const isFullyPaid = due === 0;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                    { label: 'Annual Fee', value: fmt(total), color: 'var(--text-primary)' },
                    { label: 'Paid', value: fmt(paid), color: 'var(--success)' },
                    { label: 'Due', value: fmt(due), color: due > 0 ? 'var(--danger)' : 'var(--text-secondary)' },
                ].map(s => (
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
                <span style={{
                    fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '9999px',
                    background: isFullyPaid ? 'hsla(152,69%,41%,0.12)' : due === total ? 'hsla(354,70%,54%,0.12)' : 'hsla(38,92%,50%,0.12)',
                    color: isFullyPaid ? 'var(--success)' : due === total ? 'var(--danger)' : 'hsl(38,92%,35%)'
                }}>
                    {isFullyPaid ? '✓ Fully Paid' : due === total ? 'Pending' : 'Partial'}
                </span>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => onReceipt(student)}>
                    <Receipt size={13} /> View Receipt
                </button>
            </div>
        </div>
    );
};

// ── Main Parent Dashboard ─────────────────────────────────────────────────────
const ParentDashboard = () => {
    const { user } = useAuth();
    const school = useSchool();

    const [children, setChildren] = useState([]);
    const [feeMap, setFeeMap] = useState({});   // student_db_id → fee row
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChild, setActiveChild] = useState(0);
    const [activeTab, setActiveTab] = useState('attendance'); // attendance | fees
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

            // Build fee map keyed by student_db_id
            const map = {};
            f.forEach(row => { map[row.student_db_id] = row; });
            setFeeMap(map);

            // Upcoming events next 30 days
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
            setEvents(ev.filter(e => {
                const d = new Date(e.event_date);
                return d >= today && d <= in30;
            }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).slice(0, 5));
        }).finally(() => setLoading(false));
    }, [user.id]);

    const handleReceipt = async (student) => {
        const payments = await feeApi.getStudentPayments(student.id).catch(() => []);
        const feeRow = feeMap[student.id] || {};
        setReceiptModal({
            student: {
                name: student.name,
                student_code: student.student_code,
                class_name: student.class_name,
                grade: student.grade,
                parent_name: user.name,
                student_db_id: student.id,
                paid: Number(feeRow.total_paid || 0),
            },
            payments,
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
                Loading your dashboard...
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Users size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem' }}>No children linked</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please contact the school admin to link your child's account.</p>
            </div>
        );
    }

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

            {/* Child selector tabs (if multiple children) */}
            {children.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {children.map((c, i) => (
                        <button key={c.id} onClick={() => setActiveChild(i)}
                            className={activeChild === i ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            {c.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Child info card */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                        {child.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{child.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {child.student_code} · Class {child.class_name} · {child.board}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px',
                            background: child.board === 'CBSE' ? 'hsla(221,83%,53%,0.12)' : 'hsla(152,69%,41%,0.12)',
                            color: child.board === 'CBSE' ? 'hsl(221,83%,45%)' : 'hsl(152,69%,30%)'
                        }}>
                            {child.board}
                        </span>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px',
                            background: child.status === 'Active' ? 'hsla(152,69%,41%,0.12)' : 'hsla(354,70%,54%,0.12)',
                            color: child.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                        }}>
                            {child.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

                {/* Attendance + Fees tabs */}
                <div className="card">
                    {/* Tab switcher */}
                    <div style={{ display: 'flex', gap: '0', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
                        {[
                            { key: 'attendance', label: 'Attendance' },
                            { key: 'fees', label: 'Fees' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                style={{
                                    padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                                    borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                                    marginBottom: '-1px'
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'attendance' && <AttendancePanel student={child} />}
                    {activeTab === 'fees' && <FeePanel student={child} feeData={feeRow} onReceipt={handleReceipt} />}
                </div>

                {/* Upcoming Events */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CalendarDays size={16} color="var(--primary)" /> Upcoming Events
                        </span>
                    </div>
                    {events.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No events in next 30 days.</p>
                    ) : (
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

            {/* Notifications Panel — full width below the grid */}
            <NotificationsPanel parentUserId={user.id} />

            {receiptModal && (
                <FeeReceipt
                    student={receiptModal.student}
                    payments={receiptModal.payments}
                    onClose={() => setReceiptModal(null)}
                />
            )}
        </div>
    );
};

export default ParentDashboard;
