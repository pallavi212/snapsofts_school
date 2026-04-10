import React, { useState, useEffect, useRef } from 'react';
import {
    Save, Printer, Edit2, RotateCcw, School, MapPin,
    Phone, Mail, Globe, User, Hash, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import { schoolApi } from '../api';
import { useSchool } from '../context/SchoolContext';

// ── tiny helpers ──────────────────────────────────────────────────────────────
const inp = {
    width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px',
    border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
};
const label = (text) => (
    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>{text}</span>
);
const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <button onClick={() => setOpen(o => !o)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#f8fafc', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
                {title}
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {open && <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>{children}</div>}
        </div>
    );
};
const Row2 = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>{children}</div>;

// ── Live Letterhead Preview ───────────────────────────────────────────────────
const LetterheadDoc = ({ school, letter, logoPreview }) => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const logoSrc = logoPreview || school.logo_url || null;

    return (
        <div id="letterhead-print" style={{ background: 'white', color: '#111', fontFamily: 'Georgia, serif', width: '100%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ height: '8px', background: `linear-gradient(90deg, ${school.color1 || '#1a56db'} 0%, ${school.color2 || '#0e9f6e'} 100%)` }} />

            {/* Header */}
            <div style={{ padding: '1.25rem 1.75rem 0.85rem', borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* Logo */}
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: `linear-gradient(135deg, ${school.color1 || '#1a56db'}, ${school.color2 || '#0e9f6e'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                    {logoSrc
                        ? <img src={logoSrc} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (school.school_name || 'S').charAt(0)}
                </div>

                {/* Centre */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    {(school.trust_name || school.trust_id) && (
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                            {school.trust_name}{school.trust_id ? ` · ${school.trust_id}` : ''}
                        </div>
                    )}
                    <h1 style={{ margin: '0 0 0.15rem', fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
                        {school.school_name || 'School Name'}
                    </h1>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', lineHeight: 1.5 }}>
                        {[school.address_line1, school.address_line2, school.city, school.state, school.pincode].filter(Boolean).join(', ')}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '0.1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {school.phone && <span>📞 {school.phone}</span>}
                        {school.email && <span>✉ {school.email}</span>}
                        {school.website && <span>🌐 {school.website}</span>}
                    </div>
                </div>

                {/* Right meta */}
                <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '0.68rem', color: '#6b7280', lineHeight: 1.9 }}>
                    {school.affiliation_no && <div>Affil. No: <strong>{school.affiliation_no}</strong></div>}
                    {school.board && <div>Board: <strong>{school.board}</strong></div>}
                    {school.academic_year && <div>AY: <strong>{school.academic_year}</strong></div>}
                </div>
            </div>

            {/* Document title strip */}
            {letter.title && (
                <div style={{ background: '#f3f4f6', padding: '0.5rem 1.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{letter.title}</span>
                </div>
            )}

            {/* Body */}
            <div style={{ padding: '1.25rem 1.75rem', minHeight: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#6b7280' }}>
                    Date: {today}
                </div>
                {letter.toName && (
                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                        <div>To,</div>
                        <div style={{ fontWeight: 600, whiteSpace: 'pre-line' }}>{letter.toName}</div>
                    </div>
                )}
                {letter.subject && (
                    <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                        <strong>Subject:</strong> {letter.subject}
                    </div>
                )}
                {letter.salutation && <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>{letter.salutation}</div>}
                <div style={{ fontSize: '0.85rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: letter.body ? '#111' : '#9ca3af', fontStyle: letter.body ? 'normal' : 'italic', marginBottom: '2rem' }}>
                    {letter.body || '[Letter body goes here…]'}
                </div>
                {letter.closing && (
                    <div style={{ fontSize: '0.85rem', marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>{letter.closing}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #374151', width: '140px', paddingTop: '0.35rem', fontSize: '0.74rem', color: '#374151' }}>
                            {letter.sig1 || 'Class Teacher'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #374151', width: '140px', paddingTop: '0.35rem', fontSize: '0.74rem', color: '#374151' }}>
                            {letter.sig2 || school.principal_name || 'Principal'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e5e7eb', padding: '0.6rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
                <span style={{ fontSize: '0.66rem', color: '#9ca3af' }}>{school.school_name} · {school.city}</span>
                <span style={{ fontSize: '0.66rem', color: '#9ca3af' }}>Powered by EduSync · {school.trust_name}</span>
            </div>
            <div style={{ height: '5px', background: `linear-gradient(90deg, ${school.color2 || '#0e9f6e'} 0%, ${school.color1 || '#1a56db'} 100%)` }} />
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const DEFAULT_LETTER = {
    title: 'Official Letter',
    toName: 'The Parent / Guardian,\n[Student Name], Class [X-A]',
    subject: '[Subject of the letter]',
    salutation: 'Dear Parent / Guardian,',
    body: '[Letter body goes here. Replace this with the actual content.]',
    closing: 'Thanking you,\nYours faithfully,',
    sig1: 'Class Teacher',
    sig2: '',
};

const LetterheadPreview = () => {
    const schoolCtx = useSchool();

    const [school, setSchool] = useState({});
    const [letter, setLetter] = useState(DEFAULT_LETTER);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const logoRef = useRef();

    // Load school info into local editable state
    useEffect(() => {
        schoolApi.get().then(data => setSchool({ ...data, color1: data.color1 || '#1a56db', color2: data.color2 || '#0e9f6e' })).catch(() => { });
    }, []);

    const setS = (k, v) => setSchool(p => ({ ...p, [k]: v }));
    const setL = (k, v) => setLetter(p => ({ ...p, [k]: v }));

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSaveSchool = async () => {
        setSaving(true);
        try {
            await schoolApi.update(school);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Save failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        const content = document.getElementById('letterhead-print');
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Letterhead</title>
            <style>
                body { margin: 0; padding: 20px; font-family: Georgia, serif; }
                @media print { body { padding: 0; } }
            </style></head>
            <body>${content.outerHTML}</body></html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 300);
    };

    const handleReset = () => { setLetter(DEFAULT_LETTER); };

    return (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', minHeight: '80vh' }}>

            {/* ── LEFT: Edit Panel ── */}
            <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>

                {/* Action bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={handleSaveSchool} disabled={saving}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Save size={14} /> {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save School Info'}
                    </button>
                    <button onClick={handlePrint}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Printer size={14} /> Print
                    </button>
                    <button onClick={handleReset} title="Reset letter"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <RotateCcw size={14} />
                    </button>
                </div>

                {/* School Info */}
                <Section title="🏫 School Info">
                    <div>
                        {label('School Name')}
                        <input style={inp} value={school.school_name || ''} onChange={e => setS('school_name', e.target.value)} placeholder="School Name" />
                    </div>
                    <Row2>
                        <div>{label('Trust Name')}<input style={inp} value={school.trust_name || ''} onChange={e => setS('trust_name', e.target.value)} /></div>
                        <div>{label('Trust ID')}<input style={inp} value={school.trust_id || ''} onChange={e => setS('trust_id', e.target.value)} /></div>
                    </Row2>
                    <Row2>
                        <div>{label('Principal')}<input style={inp} value={school.principal_name || ''} onChange={e => setS('principal_name', e.target.value)} /></div>
                        <div>{label('Affil. No')}<input style={inp} value={school.affiliation_no || ''} onChange={e => setS('affiliation_no', e.target.value)} /></div>
                    </Row2>
                    <Row2>
                        <div>{label('Board')}<input style={inp} value={school.board || ''} onChange={e => setS('board', e.target.value)} /></div>
                        <div>{label('Academic Year')}<input style={inp} value={school.academic_year || ''} onChange={e => setS('academic_year', e.target.value)} /></div>
                    </Row2>
                </Section>

                {/* Address */}
                <Section title="📍 Address" defaultOpen={false}>
                    <div>{label('Address Line 1')}<input style={inp} value={school.address_line1 || ''} onChange={e => setS('address_line1', e.target.value)} /></div>
                    <div>{label('Address Line 2')}<input style={inp} value={school.address_line2 || ''} onChange={e => setS('address_line2', e.target.value)} /></div>
                    <Row2>
                        <div>{label('City')}<input style={inp} value={school.city || ''} onChange={e => setS('city', e.target.value)} /></div>
                        <div>{label('State')}<input style={inp} value={school.state || ''} onChange={e => setS('state', e.target.value)} /></div>
                    </Row2>
                    <div>{label('Pincode')}<input style={inp} value={school.pincode || ''} onChange={e => setS('pincode', e.target.value)} /></div>
                </Section>

                {/* Contact */}
                <Section title="📞 Contact" defaultOpen={false}>
                    <div>{label('Phone')}<input style={inp} value={school.phone || ''} onChange={e => setS('phone', e.target.value)} /></div>
                    <div>{label('Email')}<input style={inp} value={school.email || ''} onChange={e => setS('email', e.target.value)} /></div>
                    <div>{label('Website')}<input style={inp} value={school.website || ''} onChange={e => setS('website', e.target.value)} /></div>
                </Section>

                {/* Appearance */}
                <Section title="🎨 Appearance" defaultOpen={false}>
                    <Row2>
                        <div>
                            {label('Color 1')}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="color" value={school.color1 || '#1a56db'} onChange={e => setS('color1', e.target.value)} style={{ width: '36px', height: '32px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                <input style={{ ...inp, flex: 1 }} value={school.color1 || '#1a56db'} onChange={e => setS('color1', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            {label('Color 2')}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="color" value={school.color2 || '#0e9f6e'} onChange={e => setS('color2', e.target.value)} style={{ width: '36px', height: '32px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                                <input style={{ ...inp, flex: 1 }} value={school.color2 || '#0e9f6e'} onChange={e => setS('color2', e.target.value)} />
                            </div>
                        </div>
                    </Row2>
                    <div>
                        {label('Logo')}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {(logoPreview || school.logo_url) && (
                                <img src={logoPreview || school.logo_url} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                            )}
                            <label style={{ cursor: 'pointer', fontSize: '0.78rem', padding: '0.35rem 0.65rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                                Choose Logo
                                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                            </label>
                        </div>
                        <div style={{ marginTop: '0.35rem' }}>
                            {label('Logo URL (optional)')}
                            <input style={inp} value={school.logo_url || ''} onChange={e => setS('logo_url', e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                </Section>

                {/* Letter Content */}
                <Section title="✉ Letter Content">
                    <div>{label('Document Title')}<input style={inp} value={letter.title} onChange={e => setL('title', e.target.value)} placeholder="e.g. Official Letter" /></div>
                    <div>{label('To')}<textarea style={{ ...inp, minHeight: '52px', resize: 'vertical' }} value={letter.toName} onChange={e => setL('toName', e.target.value)} /></div>
                    <div>{label('Subject')}<input style={inp} value={letter.subject} onChange={e => setL('subject', e.target.value)} /></div>
                    <div>{label('Salutation')}<input style={inp} value={letter.salutation} onChange={e => setL('salutation', e.target.value)} /></div>
                    <div>{label('Body')}<textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={letter.body} onChange={e => setL('body', e.target.value)} /></div>
                    <div>{label('Closing')}<textarea style={{ ...inp, minHeight: '52px', resize: 'vertical' }} value={letter.closing} onChange={e => setL('closing', e.target.value)} /></div>
                    <Row2>
                        <div>{label('Signature 1')}<input style={inp} value={letter.sig1} onChange={e => setL('sig1', e.target.value)} /></div>
                        <div>{label('Signature 2')}<input style={inp} value={letter.sig2} onChange={e => setL('sig2', e.target.value)} placeholder={school.principal_name || 'Principal'} /></div>
                    </Row2>
                </Section>
            </div>

            {/* ── RIGHT: Live Preview ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <LetterheadDoc school={school} letter={letter} logoPreview={logoPreview} />
            </div>
        </div>
    );
};

export default LetterheadPreview;
