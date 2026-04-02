﻿import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Wallet, TrendingDown, TrendingUp, IndianRupee, RefreshCw, Search } from 'lucide-react';
import { pettyCashApi } from '../api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => `\u20B9${Number(n).toLocaleString('en-IN')}`;
const today = new Date().toISOString().split('T')[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const CATEGORIES = [
    'Stationery', 'Cleaning & Supplies', 'Repairs & Maintenance',
    'Courier & Postage', 'Refreshments', 'Printing', 'Transport', 'Miscellaneous'
];

const CAT_COLORS = {
    'Stationery': { bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)' },
    'Cleaning & Supplies': { bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,30%)' },
    'Repairs & Maintenance': { bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,45%)' },
    'Courier & Postage': { bg: 'hsla(271,81%,56%,0.12)', color: 'hsl(271,81%,45%)' },
    'Refreshments': { bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)' },
    'Printing': { bg: 'hsla(190,80%,45%,0.12)', color: 'hsl(190,80%,35%)' },
    'Transport': { bg: 'hsla(270,70%,55%,0.12)', color: 'hsl(270,70%,45%)' },
    'Miscellaneous': { bg: 'hsla(215,16%,47%,0.12)', color: 'hsl(215,16%,40%)' },
};

// â”€â”€ Add Expense Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ExpenseModal = ({ onClose, onSave, userId }) => {
    const [form, setForm] = useState({ date: today, category: 'Stationery', description: '', amount: '', paid_to: '', receipt_no: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.description.trim()) { setError('Description is required'); return; }
        if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
        setSaving(true);
        try {
            await onSave({ ...form, amount: Number(form.amount), recorded_by: userId });
        } catch (err) { setError(err.message); setSaving(false); }
    };

    const inp = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '460px' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'hsla(354,70%,54%,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={18} color="var(--danger)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Add Expense</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Record a petty cash payment</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem', background: 'hsla(354,70%,54%,0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>{error}</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Date</label>
                            <input type="date" style={inp} value={form.date} onChange={e => set('date', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Amount (â‚¹)</label>
                            <input type="number" style={inp} min="1" placeholder="0.00" value={form.amount} onChange={e => { set('amount', e.target.value); setError(''); }} />
                        </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Category</label>
                        <select style={inp} value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Description</label>
                        <input style={inp} placeholder="What was purchased / paid for?" value={form.description} onChange={e => { set('description', e.target.value); setError(''); }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Paid To (optional)</label>
                            <input style={inp} placeholder="Vendor / person" value={form.paid_to} onChange={e => set('paid_to', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Receipt No (optional)</label>
                            <input style={inp} placeholder="Physical receipt #" value={form.receipt_no} onChange={e => set('receipt_no', e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : <><Plus size={15} /> Record Expense</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// â”€â”€ Top-up Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TopUpModal = ({ onClose, onSave, userId, currentBalance }) => {
    const [form, setForm] = useState({ amount: '', type: 'Top-up', note: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
    const inp = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
        setSaving(true);
        try { await onSave({ ...form, amount: Number(form.amount), added_by: userId }); }
        catch (err) { setError(err.message); setSaving(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'hsla(152,69%,41%,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color="var(--success)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Add Funds</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Current balance: {fmt(currentBalance)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem', background: 'hsla(354,70%,54%,0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>{error}</p>}
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Amount (â‚¹)</label>
                        <input type="number" style={inp} min="1" placeholder="0.00" value={form.amount} onChange={e => { set('amount', e.target.value); setError(''); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Type</label>
                        <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
                            <option value="Top-up">Top-up</option>
                            <option value="Adjustment">Adjustment</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Note (optional)</label>
                        <input style={inp} placeholder="e.g. Monthly replenishment" value={form.note} onChange={e => set('note', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : <><TrendingUp size={15} /> Add Funds</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PettyCash = () => {
    const { user } = useAuth();
    const isAdmin = ['Principal', 'Admin'].includes(user?.role);
    const canAdd = ['Principal', 'Admin', 'Accountant'].includes(user?.role);

    const [summary, setSummary] = useState({ total_funded: 0, total_spent: 0, current_balance: 0 });
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [view, setView] = useState('table'); // 'table' | 'history'

    const [expenseModal, setExpenseModal] = useState(false);
    const [topUpModal, setTopUpModal] = useState(false);

    const load = () => {
        Promise.all([
            pettyCashApi.getSummary(),
            pettyCashApi.getExpenses(),
            pettyCashApi.getCategories(),
        ]).then(([s, e, c]) => {
            setSummary(s);
            setExpenses(e);
            setCategories(c);
        }).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    // Quick date presets
    const applyPreset = (preset) => {
        const now = new Date();
        const pad = (d) => d.toISOString().split('T')[0];
        if (preset === 'today') {
            setDateFrom(pad(now)); setDateTo(pad(now));
        } else if (preset === 'week') {
            const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
            setDateFrom(pad(mon)); setDateTo(pad(now));
        } else if (preset === 'month') {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            setDateFrom(pad(first)); setDateTo(pad(now));
        } else if (preset === 'last30') {
            const d = new Date(now); d.setDate(d.getDate() - 30);
            setDateFrom(pad(d)); setDateTo(pad(now));
        } else {
            setDateFrom(''); setDateTo('');
        }
    };

    const handleAddExpense = async (form) => { await pettyCashApi.addExpense(form); setExpenseModal(false); load(); };
    const handleTopUp = async (form) => { await pettyCashApi.addTopUp(form); setTopUpModal(false); load(); };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        await pettyCashApi.deleteExpense(id); load();
    };

    // Apply all filters
    const filtered = expenses.filter(e => {
        if (catFilter !== 'All' && e.category !== catFilter) return false;
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!e.description?.toLowerCase().includes(q) &&
                !e.paid_to?.toLowerCase().includes(q) &&
                !e.expense_no?.toLowerCase().includes(q) &&
                !e.category?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const filteredTotal = filtered.reduce((s, e) => s + Number(e.amount), 0);
    const hasFilters = search || catFilter !== 'All' || dateFrom || dateTo;

    // Group by date for history view
    const byDate = filtered.reduce((acc, e) => {
        const d = e.date?.split('T')[0] || e.date;
        if (!acc[d]) acc[d] = [];
        acc[d].push(e);
        return acc;
    }, {});
    const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    const balance = Number(summary.current_balance);
    const balancePct = summary.total_funded > 0 ? (balance / Number(summary.total_funded)) * 100 : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ borderTop: `3px solid ${balance < 500 ? 'var(--danger)' : 'var(--success)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Current Balance</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: balance < 500 ? 'var(--danger)' : 'var(--success)' }}>{loading ? '...' : fmt(balance)}</h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsla(152,69%,41%,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={20} color="var(--success)" />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', height: '5px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(balancePct, 100)}%`, background: balance < 500 ? 'var(--danger)' : 'var(--success)', borderRadius: '9999px', transition: 'width 600ms ease' }} />
                    </div>
                    {balance < 500 && <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600 }}>âš  Low balance â€” top up needed</p>}
                </div>
                <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Funded</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>{loading ? '...' : fmt(summary.total_funded)}</h3>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All top-ups + opening</p>
                </div>
                <div className="card" style={{ borderTop: '3px solid var(--danger)' }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Spent</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--danger)' }}>{loading ? '...' : fmt(summary.total_spent)}</h3>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
                </div>
            </div>

            {/* Category breakdown */}
            {categories.length > 0 && (
                <div className="card" style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Spending by Category</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {categories.map(c => {
                            const col = CAT_COLORS[c.category] || CAT_COLORS['Miscellaneous'];
                            return (
                                <div key={c.category}
                                    style={{ padding: '0.4rem 0.85rem', borderRadius: '9999px', background: col.bg, color: col.color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: catFilter === c.category ? `2px solid ${col.color}` : '2px solid transparent' }}
                                    onClick={() => setCatFilter(catFilter === c.category ? 'All' : c.category)}>
                                    {c.category} {'\u00B7'} {fmt(c.total)}
                                </div>
                            );
                        })}
                        {catFilter !== 'All' && (
                            <button onClick={() => setCatFilter('All')} style={{ padding: '0.4rem 0.85rem', borderRadius: '9999px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                Clear Ã—
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Search + Date filters + View toggle */}
            <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                {/* Text search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    <input className="form-control" placeholder="Search description, vendor, category..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.1rem' }} />
                </div>

                {/* Date from */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From</label>
                    <input type="date" className="form-control" style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>

                {/* Date to */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To</label>
                    <input type="date" className="form-control" style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>

                {/* Quick presets */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['last30', 'Last 30 Days']].map(([k, label]) => (
                        <button key={k} onClick={() => applyPreset(k)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                            {label}
                        </button>
                    ))}
                    {hasFilters && (
                        <button onClick={() => { setSearch(''); setCatFilter('All'); setDateFrom(''); setDateTo(''); }}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--danger)' }}>
                            Clear All Ã—
                        </button>
                    )}
                </div>

                {/* View toggle */}
                <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '0.2rem', border: '1px solid var(--border-color)' }}>
                    {[['table', 'Table'], ['history', 'History']].map(([k, label]) => (
                        <button key={k} onClick={() => setView(k)}
                            style={{ padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: view === k ? 'var(--primary)' : 'transparent', color: view === k ? 'white' : 'var(--text-secondary)', transition: 'all 150ms' }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtered summary strip */}
            {hasFilters && (
                <div style={{ padding: '0.6rem 1rem', background: 'var(--primary-focus)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</span>
                    <span>Total: {fmt(filteredTotal)}</span>
                </div>
            )}

            {/* â”€â”€ TABLE VIEW â”€â”€ */}
            {view === 'table' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingDown size={16} color="var(--danger)" /> Expense Records
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isAdmin && (
                                <button className="btn btn-outline" onClick={() => setTopUpModal(true)} style={{ fontSize: '0.8rem', color: 'var(--success)', borderColor: 'var(--success)' }}>
                                    <TrendingUp size={14} /> Add Funds
                                </button>
                            )}
                            {canAdd && (
                                <button className="btn btn-primary" onClick={() => setExpenseModal(true)} style={{ fontSize: '0.8rem' }}>
                                    <Plus size={14} /> Add Expense
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Expense No</th><th>Date</th><th>Category</th>
                                    <th>Description</th><th>Paid To</th><th>Amount</th>
                                    <th>Recorded By</th>
                                    {isAdmin && <th style={{ textAlign: 'center' }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No expenses match your filters.</td></tr>
                                ) : filtered.map(e => {
                                    const col = CAT_COLORS[e.category] || CAT_COLORS['Miscellaneous'];
                                    return (
                                        <tr key={e.id}>
                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{e.expense_no}</td>
                                            <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                                            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: col.bg, color: col.color, whiteSpace: 'nowrap' }}>{e.category}</span></td>
                                            <td style={{ fontSize: '0.875rem' }}>{e.description}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.paid_to || 'â€”'}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>{fmt(e.amount)}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.recorded_by_name}</td>
                                            {isAdmin && (
                                                <td style={{ textAlign: 'center' }}>
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(e.id)}><Trash2 size={15} /></button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Showing {filtered.length} of {expenses.length} expenses</span>
                        {filtered.length > 0 && <span style={{ fontWeight: 600 }}>Filtered total: {fmt(filteredTotal)}</span>}
                    </div>
                </div>
            )}

            {/* â”€â”€ HISTORY VIEW â”€â”€ */}
            {view === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Daily History</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isAdmin && <button className="btn btn-outline" onClick={() => setTopUpModal(true)} style={{ fontSize: '0.8rem', color: 'var(--success)', borderColor: 'var(--success)' }}><TrendingUp size={14} /> Add Funds</button>}
                            {canAdd && <button className="btn btn-primary" onClick={() => setExpenseModal(true)} style={{ fontSize: '0.8rem' }}><Plus size={14} /> Add Expense</button>}
                        </div>
                    </div>

                    {loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                    ) : sortedDates.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No expenses match your filters.</div>
                    ) : sortedDates.map(date => {
                        const dayExpenses = byDate[date];
                        const dayTotal = dayExpenses.reduce((s, e) => s + Number(e.amount), 0);
                        return (
                            <div key={date} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Day header */}
                                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{new Date(date + 'T00:00:00').getDate()}</span>
                                            <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>{new Date(date + 'T00:00:00').toLocaleString('en-IN', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                                {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{dayExpenses.length} expense{dayExpenses.length !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)' }}>{fmt(dayTotal)}</span>
                                </div>

                                {/* Day expenses */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {dayExpenses.map((e, i) => {
                                        const col = CAT_COLORS[e.category] || CAT_COLORS['Miscellaneous'];
                                        return (
                                            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: i < dayExpenses.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: col.bg, color: col.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{e.category}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                                                    {e.paid_to && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Paid to: {e.paid_to}</div>}
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>{fmt(e.amount)}</div>
                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{e.expense_no}</div>
                                                </div>
                                                {isAdmin && (
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--danger)', flexShrink: 0 }} onClick={() => handleDelete(e.id)}><Trash2 size={14} /></button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {sortedDates.length > 0 && (
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{filtered.length} expenses across {sortedDates.length} day{sortedDates.length !== 1 ? 's' : ''}</span>
                            <span style={{ color: 'var(--danger)' }}>Total: {fmt(filteredTotal)}</span>
                        </div>
                    )}
                </div>
            )}

            {expenseModal && <ExpenseModal onClose={() => setExpenseModal(false)} onSave={handleAddExpense} userId={user.id} />}
            {topUpModal && <TopUpModal onClose={() => setTopUpModal(false)} onSave={handleTopUp} userId={user.id} currentBalance={balance} />}
        </div>
    );
};

export default PettyCash;
