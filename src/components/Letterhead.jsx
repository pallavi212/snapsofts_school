import React from 'react';
import { useSchool } from '../context/SchoolContext';

/**
 * Reusable school letterhead component.
 * Props:
 *   - title: string  — document title shown below the header (optional)
 *   - children: content below the letterhead
 *   - printable: bool — if true, adds a Print button
 */
const Letterhead = ({ title, children, printable = false }) => {
    const school = useSchool();

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Print button — hidden when printing */}
            {printable && (
                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        🖨 Print / Save PDF
                    </button>
                </div>
            )}

            {/* Letterhead wrapper */}
            <div id="letterhead-root" style={{
                background: 'white', color: '#111', fontFamily: 'Georgia, serif',
                maxWidth: '800px', margin: '0 auto', padding: '0',
                border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden',
            }}>

                {/* Top color bar */}
                <div style={{ height: '8px', background: 'linear-gradient(90deg, #1a56db 0%, #0e9f6e 100%)' }} />

                {/* Header */}
                <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Logo placeholder */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #1a56db, #0e9f6e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.6rem', fontWeight: 800,
                    }}>
                        {(school.school_name || 'S').charAt(0)}
                    </div>

                    {/* School details */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            {school.trust_name || ''}
                            {school.trust_id ? ` · ${school.trust_id}` : ''}
                        </div>
                        <h1 style={{ margin: '0 0 0.2rem', fontSize: '1.6rem', fontWeight: 800, color: '#111', letterSpacing: '-0.01em' }}>
                            {school.school_name || 'School Name'}
                        </h1>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6 }}>
                            {[school.address_line1, school.address_line2, school.city, school.state, school.pincode]
                                .filter(Boolean).join(', ')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem', display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {school.phone && <span>📞 {school.phone}</span>}
                            {school.email && <span>✉ {school.email}</span>}
                            {school.website && <span>🌐 {school.website}</span>}
                        </div>
                    </div>

                    {/* Right meta */}
                    <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.8 }}>
                        {school.affiliation_no && <div>Affil. No: <strong>{school.affiliation_no}</strong></div>}
                        {school.board && <div>Board: <strong>{school.board}</strong></div>}
                        {school.academic_year && <div>AY: <strong>{school.academic_year}</strong></div>}
                    </div>
                </div>

                {/* Document title strip */}
                {title && (
                    <div style={{ background: '#f3f4f6', padding: '0.6rem 2rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {title}
                        </span>
                    </div>
                )}

                {/* Body content */}
                <div style={{ padding: '1.5rem 2rem' }}>
                    {children}
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {school.school_name} · {school.city}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        Powered by EduSync · {school.trust_name}
                    </span>
                </div>

                {/* Bottom color bar */}
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #0e9f6e 0%, #1a56db 100%)' }} />
            </div>
        </div>
    );
};

export default Letterhead;
