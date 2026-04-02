import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Plus, X, IndianRupee, Receipt } from 'lucide-react';
import { feeApi } from '../api';
import FeeReceipt from '../components/FeeReceipt';

const FEE_STRUCTURE = [
    { classes: 'Class 1 – 4', range: '1-4', amount: 30000, color: 'var(--primary)' },
    { classes: 'Class 5 – 8', range: '5-8', amount: 35000, color: 'var(--secondary)' },
    { classes: 'Class 9 – 10', range: '9-10', amount: 40000, color: 'var(--success)' },
];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const today = new Date().toISOString().split('T')[0];

const getTotal = (grade) => {
    if (grade <= 4) return 30000;
    if (grade <= 8) return 35000;
    return 40000;
};

const getStatus = (paid, total) => {
    if (paid >= total) return { label: 'Paid', cls: 'badge-success', icon: <CheckCircle size={12} /> };
    if (paid > 0) return { label: 'Partial', cls: 'badge-warning', icon: <Clock size={12} /> };
    return { label: 'Pending', cls: 'badge-danger', icon: <AlertCircle size={12} /> };
};

// ── Payment Modal ──────────────────────────────────────────────────────────────
const PaymentModal = ({ student, onClose, onSave }) => {
    const total = getTotal(student.grade);
    const remaining = Math.max(0, total - student.paid);

    const [form, setForm] = useState({
        amount: remaining,
        payment_date: today,
        payment_mode: 'Cash',
        remarks: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
        if (Number(form.amount) > remaining) { setError(`Amount cannot exceed due amount ${fmt(remaining)}`); return; }
        setSaving(true);
        try {
            await onSave({ ...form, amount: Number(form.amount) });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'hsla(152,69%,41%,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IndianRupee size={18} color="var(--success)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Add Payment</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.name} — {student.class}</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.3rem' }}><X size={18} /></button>
                </div>

                {/* Fee summary strip */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
                    {[
                        { label: 'Annual Fee', value: fmt(total), color: 'var(--text-primary)' },
                        { label: 'Paid', value: fmt(student.paid), color: 'var(--success)' },
                        { label: 'Due', value: fmt(remaining), color: remaining > 0 ? 'var(--danger)' : 'var(--text-secondary)' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '0.75rem 1rem', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem', background: 'hsla(354,70%,54%,0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>{error}</p>}

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Amount (₹)</label>
                        <input type="number" className="form-control" min="1" max={remaining} value={form.amount}
                            onChange={e => { set('amount', e.target.value); setError(''); }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Payment Date</label>
                            <input type="date" className="form-control" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Mode</label>
                            <select className="form-control" value={form.payment_mode} onChange={e => set('payment_mode', e.target.value)}>
                                {['Cash', 'Online', 'Cheque', 'DD'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Remarks (optional)</label>
                        <input type="text" className="form-control" placeholder="e.g. Term 1 payment" value={form.remarks} onChange={e => set('remarks', e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving || remaining === 0}>
                            {saving ? 'Saving...' : <><Plus size={15} /> Record Payment</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const Fees = () => {
    const [feeStructure, setFeeStructure] = useState(FEE_STRUCTURE);
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState('All');
    const [payModal, setPayModal] = useState(null);
    const [receiptModal, setReceiptModal] = useState(null); // { student, payments }

    const loadPayments = () => {
        feeApi.getPayments().then(data => {
            if (data.length) setStudents(data.map(s => ({
                id: s.student_code,
                student_db_id: s.student_db_id,
                name: s.name,
                class: s.class_name,
                grade: Number(s.grade),
                paid: Number(s.total_paid),
                due: Math.max(0, getTotal(Number(s.grade)) - Number(s.total_paid)),
            })));
        }).catch(() => { });
    };

    useEffect(() => {
        feeApi.getStructure().then(data => {
            if (data.length) setFeeStructure(data.map(f => ({
                classes: `Class ${f.grade_from} – ${f.grade_to}`,
                range: `${f.grade_from}-${f.grade_to}`,
                amount: Number(f.amount),
                color: f.grade_to <= 4 ? 'var(--primary)' : f.grade_to <= 8 ? 'var(--secondary)' : 'var(--success)',
            })));
        }).catch(() => { });

        loadPayments();
    }, []);

    const handlePaymentSave = async (form) => {
        const receipt_no = `RCP${Date.now()}`;
        await feeApi.addPayment({
            student_db_id: payModal.student_db_id,
            amount_paid: form.amount,
            payment_date: form.payment_date,
            payment_mode: form.payment_mode,
            receipt_no,
            academic_year: '2025-2026',
            remarks: form.remarks,
        });
        setPayModal(null);
        loadPayments();
        // Auto-open receipt after payment
        const payments = await feeApi.getStudentPayments(payModal.student_db_id).catch(() => []);
        const updatedPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        setReceiptModal({ student: { ...payModal, paid: updatedPaid }, payments });
    };

    const handleViewReceipt = async (student) => {
        const payments = await feeApi.getStudentPayments(student.student_db_id).catch(() => []);
        setReceiptModal({ student, payments });
    };

    const totalCollected = students.reduce((s, st) => s + st.paid, 0);
    const totalDue = students.reduce((s, st) => s + st.due, 0);
    const paidCount = students.filter(s => s.due === 0).length;

    const filtered = filter === 'All' ? students : students.filter(s =>
        getStatus(s.paid, getTotal(s.grade)).label === filter
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Fee Structure Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {feeStructure.map(f => (
                    <div key={f.range} className="card" style={{ borderTop: `3px solid ${f.color}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>{f.classes}</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: f.color }}>{fmt(f.amount)}</p>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Annual Fee</p>
                    </div>
                ))}
                <div className="card" style={{ borderTop: '3px solid var(--warning)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>Total Collected</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{fmt(totalCollected)}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>{fmt(totalDue)} pending</p>
                </div>
            </div>

            {/* Filter + Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Student Fee Records</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['All', 'Paid', 'Partial', 'Pending'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={filter === f ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>{f}</button>
                        ))}
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Annual Fee</th>
                                <th>Paid</th>
                                <th>Due</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Pay</th>
                                <th style={{ textAlign: 'center' }}>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(s => {
                                const total = getTotal(s.grade);
                                const status = getStatus(s.paid, total);
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.id}</div>
                                        </td>
                                        <td><span className="badge" style={{ background: 'var(--bg-main)' }}>{s.class}</span></td>
                                        <td style={{ fontWeight: 500 }}>{fmt(total)}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>{fmt(s.paid)}</td>
                                        <td style={{ color: s.due > 0 ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 500 }}>{fmt(s.due)}</td>
                                        <td>
                                            <span className={`badge ${status.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem', color: s.due === 0 ? 'var(--text-secondary)' : 'var(--success)', borderColor: s.due === 0 ? 'var(--border-color)' : 'var(--success)' }}
                                                disabled={s.due === 0}
                                                onClick={() => setPayModal(s)}
                                                title={s.due === 0 ? 'Fully paid' : 'Add payment'}
                                            >
                                                <Plus size={13} /> Pay
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem', color: 'var(--primary)' }}
                                                onClick={() => handleViewReceipt(s)}
                                                title="View / Share Receipt"
                                            >
                                                <Receipt size={13} /> Receipt
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Showing {filtered.length} of {students.length} students • {paidCount} fully paid
                </div>
            </div>

            {payModal && (
                <PaymentModal
                    student={payModal}
                    onClose={() => setPayModal(null)}
                    onSave={handlePaymentSave}
                />
            )}

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

export default Fees;
