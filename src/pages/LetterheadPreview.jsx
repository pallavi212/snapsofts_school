import React from 'react';
import Letterhead from '../components/Letterhead';
import { useSchool } from '../context/SchoolContext';

const LetterheadPreview = () => {
    const school = useSchool();
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Letterhead title="Official Letter" printable>
                {/* Sample letter body */}
                <div style={{ fontFamily: 'Georgia, serif', color: '#111', fontSize: '0.9rem', lineHeight: 1.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#6b7280' }}>
                        Date: {today}
                    </div>

                    <p style={{ margin: '0 0 1rem' }}>To,</p>
                    <p style={{ margin: '0 0 1.5rem', fontWeight: 600 }}>
                        The Parent / Guardian,<br />
                        [Student Name], Class [X-A]
                    </p>

                    <p style={{ margin: '0 0 0.75rem' }}>
                        <strong>Subject:</strong> [Subject of the letter]
                    </p>

                    <p style={{ margin: '0 0 1rem' }}>Dear Parent / Guardian,</p>

                    <p style={{ margin: '0 0 1rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        [Letter body goes here. This is a sample letterhead preview. Replace this content with the actual letter content when using this component in fee receipts, notices, certificates, etc.]
                    </p>

                    <p style={{ margin: '0 0 2.5rem' }}>
                        Thanking you,<br />
                        Yours faithfully,
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #374151', width: '160px', paddingTop: '0.4rem', fontSize: '0.78rem', color: '#374151' }}>
                                Class Teacher
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #374151', width: '160px', paddingTop: '0.4rem', fontSize: '0.78rem', color: '#374151' }}>
                                {school.principal_name || 'Principal'}
                            </div>
                        </div>
                    </div>
                </div>
            </Letterhead>
        </div>
    );
};

export default LetterheadPreview;
