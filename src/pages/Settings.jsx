import React, { useState, useEffect } from 'react';
import { School, MapPin, Phone, Mail, Globe, User, Hash, BookOpen, Save, Edit2, X } from 'lucide-react';
import { schoolApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Field = ({ label, icon, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {icon}{label}
        </label>
        {children}
    </div>
);

const inp = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)', background: 'var(--bg-main)',
    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const inpReadonly = {
    ...inp, background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'default',
};

const Settings = () => {
    const { user } = useAuth();
    const isAdmin = ['Principal', 'Admin'].includes(user?.role);

    const [info, setInfo] = useState(null);
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        schoolApi.get().then(data => {
            setInfo(data);
            setForm(data);
        }).catch(e => setFetchError(e.message));
    }, []);

    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await schoolApi.update(form);
            setInfo(form);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm(info);
        setEditing(false);
    };

    if (fetchError) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
            Failed to load school info: {fetchError}<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Make sure the backend is running on port 5001.</span>
        </div>
    );

    if (!info) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading school info...
        </div>
    );

    const s = editing ? form : info;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px' }}>

            {/* Header card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <School size={26} color="var(--primary)" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{info.school_name || 'School Info'}</h2>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {info.trust_name && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{info.trust_name}</span>}
                            {info.trust_id && <span style={{ color: 'var(--text-secondary)' }}> · {info.trust_id}</span>}
                        </p>
                    </div>
                </div>
                {isAdmin && !editing && (
                    <button className="btn btn-primary" onClick={() => setEditing(true)}>
                        <Edit2 size={15} /> Edit Info
                    </button>
                )}
                {editing && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-outline" onClick={handleCancel}><X size={15} /> Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
                {saved && <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>✓ Saved successfully</span>}
            </div>

            {/* School Identity */}
            <div className="card">
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>School Identity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="School Name" icon={<School size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.school_name || ''} onChange={e => set('school_name', e.target.value)} />
                    </Field>
                    <Field label="Trust Name" icon={<School size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.trust_name || ''} onChange={e => set('trust_name', e.target.value)} />
                    </Field>
                    <Field label="Trust ID / Reg No" icon={<Hash size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.trust_id || ''} onChange={e => set('trust_id', e.target.value)} />
                    </Field>
                    <Field label="Affiliation No" icon={<Hash size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.affiliation_no || ''} onChange={e => set('affiliation_no', e.target.value)} />
                    </Field>
                    <Field label="Principal Name" icon={<User size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.principal_name || ''} onChange={e => set('principal_name', e.target.value)} />
                    </Field>
                    <Field label="Academic Year" icon={<BookOpen size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.academic_year || ''} onChange={e => set('academic_year', e.target.value)} />
                    </Field>
                    <Field label="Board" icon={<BookOpen size={12} />}>
                        {editing ? (
                            <select style={inp} value={s.board || ''} onChange={e => set('board', e.target.value)}>
                                <option value="">Select Board</option>
                                <option value="CBSE">CBSE</option>
                                <option value="SSC">SSC</option>
                                <option value="CBSE & SSC">CBSE & SSC</option>
                            </select>
                        ) : (
                            <input style={inpReadonly} readOnly value={s.board || '—'} />
                        )}
                    </Field>
                </div>
            </div>

            {/* Address */}
            <div className="card">
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Address Line 1" icon={<MapPin size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.address_line1 || ''} onChange={e => set('address_line1', e.target.value)} />
                    </Field>
                    <Field label="Address Line 2" icon={<MapPin size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.address_line2 || ''} onChange={e => set('address_line2', e.target.value)} />
                    </Field>
                    <Field label="City">
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.city || ''} onChange={e => set('city', e.target.value)} />
                    </Field>
                    <Field label="State">
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.state || ''} onChange={e => set('state', e.target.value)} />
                    </Field>
                    <Field label="Pincode">
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.pincode || ''} onChange={e => set('pincode', e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Contact */}
            <div className="card">
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Phone" icon={<Phone size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.phone || ''} onChange={e => set('phone', e.target.value)} />
                    </Field>
                    <Field label="Email" icon={<Mail size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.email || ''} onChange={e => set('email', e.target.value)} />
                    </Field>
                    <Field label="Website" icon={<Globe size={12} />}>
                        <input style={editing ? inp : inpReadonly} readOnly={!editing} value={s.website || ''} onChange={e => set('website', e.target.value)} />
                    </Field>
                </div>
            </div>

        </div>
    );
};

export default Settings;
