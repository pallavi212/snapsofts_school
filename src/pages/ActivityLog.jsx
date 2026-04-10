import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, Filter } from 'lucide-react';
import { activityLogApi } from '../api/activityLogApi';

const MODULES = ['All', 'Auth', 'Users', 'Students', 'Teachers', 'Fees', 'Attendance', 'Teaching Plans'];
const ACTIONS = ['All', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE'];

const ACTION_STYLE = {
    LOGIN: { bg: '#dbeafe', color: '#1d4ed8' },
    CREATE: { bg: '#dcfce7', color: '#15803d' },
    UPDATE: { bg: '#fef9c3', color: '#854d0e' },
    DELETE: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modFilter, setMod] = useState('All');
    const [actFilter, setAct] = useState('All');

    const load = () => {
        setLoading(true);
        activityLogApi.getAll({ limit: 500 })
            .then(setLogs)
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filtered = logs.filter(l => {
        const matchSearch = !search ||
            l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            l.details?.toLowerCase().includes(search.toLowerCase()) ||
            l.module?.toLowerCase().includes(search.toLowerCase());
        const matchMod = modFilter === 'All' || l.module === modFilter;
        const matchAct = actFilter === 'All' || l.action === actFilter;
        return matchSearch && matchMod && matchAct;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={22} color="var(--primary, #6366f1)" />
                    <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Activity Log</h1>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                        {filtered.length} records
                    </span>
                </div>
                <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search user, module, details..."
                        style={{ paddingLeft: '2rem', padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', width: '240px' }}
                    />
                </div>
                <select value={modFilter} onChange={e => setMod(e.target.value)} style={selStyle}>
                    {MODULES.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={actFilter} onChange={e => setAct(e.target.value)} style={selStyle}>
                    {ACTIONS.map(a => <option key={a}>{a}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    {['Time', 'User', 'Role', 'Action', 'Module', 'Details'].map(h => (
                                        <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No activity found.</td></tr>
                                )}
                                {filtered.map(log => {
                                    const as = ACTION_STYLE[log.action] || { bg: '#f1f5f9', color: '#475569' };
                                    return (
                                        <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.6rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#1e293b' }}>{log.user_name}</td>
                                            <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>{log.role || '—'}</td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <span style={{ padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: as.bg, color: as.color }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', color: '#6366f1', fontWeight: 500 }}>{log.module}</td>
                                            <td style={{ padding: '0.6rem 1rem', color: '#475569', maxWidth: '320px' }}>{log.details || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const selStyle = { padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#fff', cursor: 'pointer' };
