import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, IndianRupee, AlertCircle,
  CalendarDays, ClipboardCheck, TrendingUp, BookOpen,
  ClipboardList, School
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { studentApi, teacherApi, userApi, feeApi, calendarApi, enquiryApi, notificationApi } from '../api';
import { Link } from 'react-router-dom';

const fmt = (n) => n >= 100000
  ? `₹${(n / 100000).toFixed(1)}L`
  : `₹${Number(n).toLocaleString('en-IN')}`;

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const EVENT_COLORS = {
  holiday: { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
  exam: { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
  event: { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
  ptm: { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
  activity: { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
};

const ENQUIRY_COLORS = {
  'New': 'hsl(221,83%,45%)',
  'Contacted': 'hsl(38,92%,35%)',
  'Visited': 'hsl(271,81%,45%)',
  'Admitted': 'hsl(152,69%,30%)',
  'Not Interested': 'hsl(354,70%,45%)',
};

const StatCard = ({ title, value, icon, hsl, sub, to }) => {
  const inner = (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: to ? 'pointer' : 'default', transition: 'box-shadow 150ms' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{value}</h3>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `hsla(${hsl},0.15)`, color: `hsl(${hsl})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><TrendingUp size={12} color="var(--success)" />{sub}</p>}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
};

// ── Send Notification Form (staff only) ───────────────────────────────────────
const NOTIF_TYPES = ['Announcement', 'Homework', 'Notice', 'Fee Reminder', 'Attendance Alert'];

const SendNotificationForm = ({ senderId }) => {
  const [form, setForm] = useState({ type: 'Announcement', title: '', body: '', target_type: 'all' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setSent(false); setError(''); };

  const handleSend = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { setError('Title and message are required'); return; }
    setSending(true);
    try {
      await notificationApi.send({ ...form, sent_by: senderId });
      setSent(true);
      setForm({ type: 'Announcement', title: '', body: '', target_type: 'all' });
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const inp = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <ClipboardList size={16} color="var(--primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Send Message to Parents</span>
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {error && <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</p>}
        {sent && <p style={{ margin: 0, color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>✓ Message sent to all parents!</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Type</label>
            <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
              {NOTIF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Send To</label>
            <select style={inp} value={form.target_type} onChange={e => set('target_type', e.target.value)}>
              <option value="all">All Parents</option>
              <option value="class">Specific Class</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Title</label>
          <input style={inp} placeholder="e.g. PTM Scheduled on 14th July" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Message</label>
          <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="Write your message here..." value={form.body} onChange={e => set('body', e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={sending} style={{ fontSize: '0.85rem' }}>
            {sending ? 'Sending...' : <><ClipboardList size={14} /> Send Message</>}
          </button>
        </div>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const school = useSchool();
  const isManagement = ['Principal', 'Admin'].includes(user?.role);
  const isFinance = ['Principal', 'Admin', 'Accountant'].includes(user?.role);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, teachers: 0, users: 0, collected: 0, pending: 0, activeTeachers: 0, onLeave: 0 });
  const [classCounts, setClassCounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [boardSplit, setBoardSplit] = useState({ CBSE: 0, SSC: 0 });

  useEffect(() => {
    Promise.allSettled([
      studentApi.getAll(),
      studentApi.countByClass(),
      teacherApi.getAll(),
      userApi.getAll(),
      feeApi.getPayments(),
      calendarApi.getAll(),
      enquiryApi.getAll(),
    ]).then(([students, counts, teachers, users, payments, calendar, enqs]) => {
      const s = students.status === 'fulfilled' ? students.value : [];
      const cc = counts.status === 'fulfilled' ? counts.value : [];
      const t = teachers.status === 'fulfilled' ? teachers.value : [];
      const u = users.status === 'fulfilled' ? users.value : [];
      const p = payments.status === 'fulfilled' ? payments.value : [];
      const ev = calendar.status === 'fulfilled' ? calendar.value : [];
      const eq = enqs.status === 'fulfilled' ? enqs.value : [];

      const collected = p.reduce((sum, r) => sum + Number(r.total_paid || 0), 0);
      const pending = p.reduce((sum, r) => {
        const g = Number(r.grade);
        const total = g <= 4 ? 30000 : g <= 8 ? 35000 : 40000;
        return sum + Math.max(0, total - Number(r.total_paid || 0));
      }, 0);

      // Board split from class counts
      let cbse = 0, ssc = 0;
      cc.forEach(c => {
        if (c.board === 'CBSE') cbse += Number(c.count);
        else ssc += Number(c.count);
      });

      // Upcoming events (next 30 days)
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
      const upcoming = ev
        .filter(e => { const d = new Date(e.event_date); return d >= today && d <= in30; })
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 6);

      setStats({
        students: s.length,
        teachers: t.length,
        users: u.length,
        collected,
        pending,
        activeTeachers: t.filter(x => x.status === 'Active').length,
        onLeave: t.filter(x => x.status === 'On Leave').length,
      });
      setClassCounts(cc);
      setBoardSplit({ CBSE: cbse, SSC: ssc });
      setEvents(upcoming);
      setEnquiries(eq.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  // Grade totals for the strip
  const gradeTotals = {};
  classCounts.forEach(c => {
    const g = String(c.grade);
    gradeTotals[g] = (gradeTotals[g] || 0) + Number(c.count);
  });
  const totalStudents = Object.values(gradeTotals).reduce((a, b) => a + b, 0);

  const getWelcome = () => {
    switch (user?.role) {
      case 'Principal': return 'Full school overview below.';
      case 'Admin': return 'Manage daily operations from here.';
      case 'Teacher': return 'Your classes and schedule at a glance.';
      case 'Accountant': return 'Fee collection and pending dues overview.';
      case 'Student': return 'Your attendance and timetable.';
      case 'Parent': return "Your child's performance and fee status.";
      default: return 'Welcome to EduSync.';
    }
  };

  const L = loading ? '...' : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, hsl(271,81%,56%) 100%)', color: 'white', border: 'none', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem', fontWeight: 700 }}>Welcome back, {user?.name} 👋</h2>
            <p style={{ margin: 0, opacity: 0.88, fontSize: '0.875rem' }}>{getWelcome()}</p>
          </div>
          {school.school_name && (
            <div style={{ textAlign: 'right', opacity: 0.9 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{school.school_name}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{school.trust_name} · AY {school.academic_year}</div>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard title="Total Students" value={L || stats.students} icon={<Users size={20} />} hsl="221,83%,53%" sub={`CBSE ${boardSplit.CBSE} · SSC ${boardSplit.SSC}`} to="/students" />
        <StatCard title="Total Teachers" value={L || stats.teachers} icon={<GraduationCap size={20} />} hsl="270,70%,55%" sub={`${stats.activeTeachers} active · ${stats.onLeave} on leave`} to="/teachers" />
        {isManagement && <StatCard title="Total Users" value={L || stats.users} icon={<School size={20} />} hsl="152,69%,41%" sub="All roles" to="/users" />}
        {isFinance && <StatCard title="Fee Collected" value={L || fmt(stats.collected)} icon={<IndianRupee size={20} />} hsl="38,92%,50%" sub="This academic year" to="/fees" />}
        {isFinance && <StatCard title="Pending Fees" value={L || fmt(stats.pending)} icon={<AlertCircle size={20} />} hsl="354,70%,54%" sub="Total outstanding" to="/fees" />}
        {isManagement && <StatCard title="Enquiries" value={L || enquiries.length} icon={<ClipboardList size={20} />} hsl="221,83%,53%" sub="Admission leads" to="/admissions" />}
      </div>

      {/* Class-wise student strip */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Students by Class</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total: {totalStudents}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.4rem' }}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(g => {
            const count = gradeTotals[String(g)] || 0;
            const pct = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
            return (
              <Link key={g} to="/students" style={{ textDecoration: 'none' }}>
                <div style={{ textAlign: 'center', padding: '0.5rem 0.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', transition: 'all 150ms', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: 600 }}>Std {g}</div>
                  <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '9999px', marginTop: '0.35rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 3}%`, maxWidth: '100%', background: 'var(--primary)', borderRadius: '9999px' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* Upcoming Events */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays size={16} color="var(--primary)" /> Upcoming Events</span>
            <Link to="/calendar" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
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

        {/* Admission Enquiries */}
        {isManagement && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClipboardList size={16} color="var(--primary)" /> Recent Enquiries</span>
              <Link to="/admissions" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
            </div>
            {enquiries.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No enquiries yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {enquiries.map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                      {e.student_name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.student_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Class {e.applying_for_grade} · {e.parent_name}</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: `${ENQUIRY_COLORS[e.status]}22`, color: ENQUIRY_COLORS[e.status], whiteSpace: 'nowrap', flexShrink: 0 }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fee Summary */}
        {isFinance && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IndianRupee size={16} color="var(--primary)" /> Fee Summary</span>
              <Link to="/fees" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Manage →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Collected', value: fmt(stats.collected), color: 'var(--success)', pct: stats.collected + stats.pending > 0 ? (stats.collected / (stats.collected + stats.pending)) * 100 : 0 },
                { label: 'Pending', value: fmt(stats.pending), color: 'var(--danger)', pct: stats.collected + stats.pending > 0 ? (stats.pending / (stats.collected + stats.pending)) * 100 : 0 },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: f.color }}>{loading ? '...' : f.value}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: '9999px', transition: 'width 600ms ease' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.25rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Annual Target</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{loading ? '...' : fmt(stats.collected + stats.pending)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Teachers overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={16} color="var(--primary)" /> Teachers Overview</span>
            <Link to="/teachers" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Total', value: stats.teachers, color: 'var(--primary)' },
              { label: 'Active', value: stats.activeTeachers, color: 'var(--success)' },
              { label: 'On Leave', value: stats.onLeave, color: 'var(--warning)' },
            ].map(t => (
              <div key={t.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.color }}>{loading ? '...' : t.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Board Coverage</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' }}>CBSE</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' }}>SSC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Send Notification — staff only */}
      {['Principal', 'Admin', 'Teacher'].includes(user?.role) && (
        <SendNotificationForm senderId={user.id} />
      )}
    </div>
  );
};

export default Dashboard;
