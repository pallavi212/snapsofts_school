import React, { useRef } from 'react';
import { X, Printer, MessageCircle, Mail } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const getTotal = (grade) => {
    if (grade <= 4) return 30000;
    if (grade <= 8) return 35000;
    return 40000;
};

/**
 * FeeReceipt modal
 * Props:
 *   student   — { name, student_code, class_name, grade, parent_name, student_db_id, paid }
 *   payments  — array from getStudentPayments()
 *   onClose   — fn
 */
const FeeReceipt = ({ student, payments, onClose }) => {
    const school = useSchool();
    const receiptRef = useRef();

    const total = getTotal(student.grade);
    const paid = student.paid;
    const due = Math.max(0, total - paid);
    const isFullyPaid = due === 0;
    const lastPayment = payments[payments.length - 1];

    // ── Print ──────────────────────────────────────────────
    const handlePrint = () => {
        const content = receiptRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=800,height=600');
        win.document.write(`
            <html><head><title>Fee Receipt</title>
            <style>
                body { font-family: Georgia, serif; color: #111; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
                th { background: #f3f4f6; font-weight: 700; }
                .badge-paid { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; }
                .badge-partial { background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; }
                .badge-pending { background: #fee2e2; color: #991b1b; padding: 2px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; }
                .header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 12px; margin-bottom: 16px; }
                .bar { height: 6px; background: linear-gradient(90deg,#1a56db,#0e9f6e); margin-bottom: 16px; }
                .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
                .summary { display: flex; gap: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 16px 0; }
                .summary-cell { flex: 1; padding: 10px 14px; text-align: center; border-right: 1px solid #e5e7eb; }
                .summary-cell:last-child { border-right: none; }
                .summary-label { font-size: 11px; color: #6b7280; }
                .summary-value { font-size: 16px; font-weight: 800; }
            </style></head><body>
            ${content}
            </body></html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 400);
    };

    // ── WhatsApp ───────────────────────────────────────────
    const handleWhatsApp = () => {
        const lines = [
            `*Fee Receipt — ${school.school_name || 'EduSync School'}*`,
            `Trust: ${school.trust_name || ''}`,
            ``,
            `*Student:* ${student.name} (${student.student_code})`,
            `*Class:* ${student.class_name}`,
            `*Parent:* ${student.parent_name || '—'}`,
            ``,
            `*Annual Fee:* ${fmt(total)}`,
            `*Total Paid:* ${fmt(paid)}`,
            `*Balance Due:* ${fmt(due)}`,
            `*Status:* ${isFullyPaid ? '✅ FULLY PAID' : due === total ? '❌ PENDING' : '⚠️ PARTIAL'}`,
            ``,
            payments.length > 0 ? `*Payment History:*` : '',
            ...payments.map((p, i) =>
                `${i + 1}. ${fmtDate(p.payment_date)} — ${fmt(p.amount_paid)} (${p.payment_mode}) | Receipt: ${p.receipt_no}`
            ),
            ``,
            `Academic Year: ${lastPayment?.academic_year || '2025-26'}`,
            `${school.phone ? '📞 ' + school.phone : ''}`,
        ].filter(l => l !== undefined).join('\n');

        const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
        window.open(url, '_blank');
    };

    // ── Email ──────────────────────────────────────────────
    const handleEmail = () => {
        const subject = `Fee Receipt — ${student.name} | ${school.school_name || 'EduSync'}`;
        const body = [
            `Dear ${student.parent_name || 'Parent/Guardian'},`,
            ``,
            `Please find below the fee receipt for ${student.name} (${student.student_code}), Class ${student.class_name}.`,
            ``,
            `Annual Fee   : ${fmt(total)}`,
            `Total Paid   : ${fmt(paid)}`,
            `Balance Due  : ${fmt(due)}`,
            `Status       : ${isFullyPaid ? 'FULLY PAID' : due === total ? 'PENDING' : 'PARTIAL'}`,
            ``,
            `Payment History:`,
            ...payments.map((p, i) =>
                `  ${i + 1}. Date: ${fmtDate(p.payment_date)} | Amount: ${fmt(p.amount_paid)} | Mode: ${p.payment_mode} | Receipt No: ${p.receipt_no}`
            ),
            ``,
            `Academic Year: ${lastPayment?.academic_year || '2025-26'}`,
            ``,
            `Regards,`,
            `${school.school_name || 'EduSync School'}`,
            `${school.phone || ''}`,
        ].join('\n');

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const statusBadge = isFullyPaid
        ? { label: 'FULLY PAID', bg: '#d1fae5', color: '#065f46' }
        : due === total
            ? { label: 'PENDING', bg: '#fee2e2', color: '#991b1b' }
            : { label: 'PARTIAL', bg: '#fef3c7', color: '#92400e' };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 1rem', overflowY: 'auto' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '620px', display: 'flex', flexDirection: 'column' }}>

                {/* Modal header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Fee Receipt</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={handlePrint} className="btn btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Printer size={14} /> Print
                        </button>
                        <button onClick={handleWhatsApp} style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-md)', border: 'none', background: '#25D366', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                            <MessageCircle size={14} /> WhatsApp
                        </button>
                        <button onClick={handleEmail} style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-md)', border: 'none', background: '#EA4335', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                            <Mail size={14} /> Email
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', marginLeft: '0.25rem' }}><X size={18} /></button>
                    </div>
                </div>

                {/* Receipt content */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
                    <div ref={receiptRef}>
                        {/* Top gradient bar */}
                        <div style={{ height: '6px', background: 'linear-gradient(90deg,#1a56db,#0e9f6e)', borderRadius: '4px 4px 0 0', marginBottom: '1rem' }} />

                        {/* School header */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {school.trust_name}{school.trust_id ? ` · ${school.trust_id}` : ''}
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', margin: '0.2rem 0' }}>{school.school_name || 'EduSync School'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {[school.address_line1, school.city, school.state].filter(Boolean).join(', ')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                                {school.phone && `📞 ${school.phone}`}{school.email && `  ✉ ${school.email}`}
                            </div>
                        </div>

                        {/* Receipt title + status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>FEE RECEIPT</div>
                                {lastPayment && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Receipt No: {lastPayment.receipt_no}</div>}
                                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Date: {fmtDate(lastPayment?.payment_date || new Date())}</div>
                                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>AY: {lastPayment?.academic_year || '2025-26'}</div>
                            </div>
                            <div style={{ padding: '0.4rem 1rem', borderRadius: '9999px', fontWeight: 800, fontSize: '0.85rem', background: statusBadge.bg, color: statusBadge.color }}>
                                {statusBadge.label}
                            </div>
                        </div>

                        {/* Student info */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.85rem' }}>
                            <tbody>
                                {[
                                    ['Student Name', student.name],
                                    ['Student ID', student.student_code],
                                    ['Class', student.class_name],
                                    ['Parent / Guardian', student.parent_name || '—'],
                                ].map(([label, value]) => (
                                    <tr key={label}>
                                        <td style={{ padding: '6px 12px', background: '#f9fafb', fontWeight: 600, width: '40%', border: '1px solid #e5e7eb', color: '#374151' }}>{label}</td>
                                        <td style={{ padding: '6px 12px', border: '1px solid #e5e7eb', color: '#111' }}>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Fee summary */}
                        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                            {[
                                { label: 'Annual Fee', value: fmt(total), color: '#1a56db' },
                                { label: 'Total Paid', value: fmt(paid), color: '#059669' },
                                { label: 'Balance Due', value: fmt(due), color: due > 0 ? '#dc2626' : '#6b7280' },
                            ].map((s, i) => (
                                <div key={s.label} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Payment history table */}
                        {payments.length > 0 && (
                            <>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Payment History</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f3f4f6' }}>
                                            {['#', 'Date', 'Amount', 'Mode', 'Cumulative Paid', 'Balance', 'Receipt No'].map(h => (
                                                <th key={h} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p, i) => {
                                            const balance = Math.max(0, total - Number(p.cumulative_paid));
                                            return (
                                                <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', color: '#6b7280' }}>{i + 1}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>{fmtDate(p.payment_date)}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#059669' }}>{fmt(p.amount_paid)}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>{p.payment_mode}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', fontWeight: 600 }}>{fmt(p.cumulative_paid)}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', color: balance > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>{fmt(balance)}</td>
                                                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', fontSize: '0.72rem', color: '#6b7280' }}>{p.receipt_no}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {payments.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280', fontSize: '0.85rem', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                                No payments recorded yet.
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af' }}>
                            <span>{school.school_name} · {school.city}</span>
                            <span>Generated: {new Date().toLocaleDateString('en-IN')}</span>
                        </div>

                        {/* Bottom bar */}
                        <div style={{ height: '4px', background: 'linear-gradient(90deg,#0e9f6e,#1a56db)', borderRadius: '0 0 4px 4px', marginTop: '0.75rem' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeReceipt;
