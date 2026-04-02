import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, GraduationCap } from 'lucide-react';
import { classApi } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CBSE_PERIODS = [
    { time: '8:30 – 9:15', label: 'Period 1' },
    { time: '9:15 – 10:00', label: 'Period 2' },
    { time: '10:00 – 10:45', label: 'Period 3' },
    { time: '10:45 – 11:00', label: 'Break', isBreak: true },
    { time: '11:00 – 11:45', label: 'Period 4' },
    { time: '11:45 – 12:30', label: 'Period 5' },
    { time: '12:30 – 1:10', label: 'Lunch', isBreak: true },
    { time: '1:10 – 1:55', label: 'Period 6' },
    { time: '1:55 – 2:40', label: 'Period 7' },
    { time: '2:40 – 3:25', label: 'Period 8' },
];

const SSC_PERIODS = [
    { time: '8:30 – 9:15', label: 'Period 1' },
    { time: '9:15 – 10:00', label: 'Period 2' },
    { time: '10:00 – 10:45', label: 'Period 3' },
    { time: '10:45 – 11:00', label: 'Break', isBreak: true },
    { time: '11:00 – 11:45', label: 'Period 4' },
    { time: '11:45 – 12:30', label: 'Lunch', isBreak: true },
    { time: '12:30 – 1:15', label: 'Period 5' },
    { time: '1:15 – 2:00', label: 'Period 6' },
    { time: '2:00 – 2:45', label: 'Period 7' },
];

const CBSE_SCHEDULE = {
    Monday: ['Mathematics', 'English', 'Science', '', 'Hindi', 'Social Studies', '', 'Computer Science', 'Mathematics', 'English'],
    Tuesday: ['Science', 'Mathematics', 'English', '', 'Computer Science', 'Hindi', '', 'Social Studies', 'Science', 'Mathematics'],
    Wednesday: ['Hindi', 'Science', 'Mathematics', '', 'English', 'Computer Science', '', 'Hindi', 'Social Studies', 'Science'],
    Thursday: ['English', 'Hindi', 'Social Studies', '', 'Mathematics', 'Science', '', 'English', 'Computer Science', 'Hindi'],
    Friday: ['Social Studies', 'Computer Science', 'Hindi', '', 'Science', 'Mathematics', '', 'English', 'Hindi', 'Social Studies'],
    Saturday: ['Computer Science', 'Social Studies', 'Science', '', 'Mathematics', 'English', '', 'Science', 'Mathematics', 'Computer Science'],
};

const SSC_SCHEDULE = {
    Monday: ['Mathematics', 'Marathi', 'English', '', 'Science', '', 'Social Studies', 'Hindi', 'Mathematics'],
    Tuesday: ['Science', 'Mathematics', 'Marathi', '', 'English', '', 'Hindi', 'Science', 'Social Studies'],
    Wednesday: ['Marathi', 'Science', 'Mathematics', '', 'Hindi', '', 'English', 'Social Studies', 'Science'],
    Thursday: ['English', 'Hindi', 'Social Studies', '', 'Mathematics', '', 'Marathi', 'English', 'Hindi'],
    Friday: ['Social Studies', 'English', 'Hindi', '', 'Marathi', '', 'Mathematics', 'Science', 'Marathi'],
    Saturday: ['Hindi', 'Social Studies', 'Science', '', 'Mathematics', '', 'Marathi', 'Mathematics', 'English'],
};

const SUBJECT_COLORS = {
    'Mathematics': { bg: 'hsla(221,83%,53%,0.1)', color: 'hsl(221,83%,45%)' },
    'Science': { bg: 'hsla(152,69%,41%,0.1)', color: 'hsl(152,69%,35%)' },
    'English': { bg: 'hsla(270,70%,55%,0.1)', color: 'hsl(270,70%,45%)' },
    'Hindi': { bg: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,35%)' },
    'Marathi': { bg: 'hsla(38,92%,50%,0.1)', color: 'hsl(38,92%,35%)' },
    'Social Studies': { bg: 'hsla(354,70%,54%,0.1)', color: 'hsl(354,70%,45%)' },
    'Computer Science': { bg: 'hsla(190,80%,45%,0.1)', color: 'hsl(190,80%,35%)' },
    'Physics': { bg: 'hsla(200,80%,50%,0.1)', color: 'hsl(200,80%,40%)' },
};

const SubjectCell = ({ subject }) => {
    if (!subject) return <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</td>;
    const c = SUBJECT_COLORS[subject] || { bg: 'var(--bg-main)', color: 'var(--text-secondary)' };
    return (
        <td style={{ padding: '0.5rem 0.75rem' }}>
            <span style={{
                display: 'inline-block', padding: '0.25rem 0.6rem',
                borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                background: c.bg, color: c.color, whiteSpace: 'nowrap',
            }}>{subject}</span>
        </td>
    );
};

const TimetableGrid = ({ periods, schedule }) => (
    <div className="table-container">
        <table className="table" style={{ minWidth: '700px' }}>
            <thead>
                <tr>
                    <th style={{ minWidth: '110px' }}>Day</th>
                    {periods.map((p, i) => (
                        <th key={i} style={{
                            textAlign: 'center', minWidth: p.isBreak ? '80px' : '110px',
                            background: p.isBreak ? 'hsla(38,92%,50%,0.08)' : '',
                            color: p.isBreak ? 'hsl(38,92%,35%)' : '',
                        }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{p.label}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>{p.time}</div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {DAYS.map(day => {
                    const subjects = schedule[day] || [];
                    let subIdx = 0;
                    return (
                        <tr key={day}>
                            <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{day}</td>
                            {periods.map((p, i) => {
                                if (p.isBreak) return (
                                    <td key={i} style={{
                                        textAlign: 'center', fontSize: '0.7rem',
                                        color: 'hsl(38,92%,35%)', fontWeight: 500,
                                        background: 'hsla(38,92%,50%,0.05)',
                                    }}>{p.label}</td>
                                );
                                const subject = subjects[subIdx++] || '';
                                return <SubjectCell key={i} subject={subject} />;
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const Timetable = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [board, setBoard] = useState('CBSE');

    useEffect(() => {
        classApi.getAll()
            .then(data => {
                // Sort: grade desc, section asc
                const sorted = [...data].sort((a, b) =>
                    b.grade !== a.grade ? b.grade - a.grade : a.section.localeCompare(b.section)
                );
                setClasses(sorted);
                if (sorted.length) {
                    setSelectedClass(sorted[0].name);
                    setBoard(sorted[0].board || 'CBSE');
                }
            })
            .catch(() => setSelectedClass(''));
    }, []);

    // When class changes, update board from class data
    const handleClassChange = (className) => {
        setSelectedClass(className);
        const cls = classes.find(c => c.name === className);
        if (cls) setBoard(cls.board || 'CBSE');
    };

    const periods = board === 'CBSE' ? CBSE_PERIODS : SSC_PERIODS;
    const schedule = board === 'CBSE' ? CBSE_SCHEDULE : SSC_SCHEDULE;
    const totalPeriods = periods.filter(p => !p.isBreak).length;
    const endTime = board === 'CBSE' ? '3:25 PM' : '2:45 PM';

    // Group classes by grade for the dropdown
    const grades = [...new Set(classes.map(c => c.grade))].sort((a, b) => b - a);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Controls row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

                {/* Left — info chips */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="card" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={15} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>8:30 AM – {endTime}</span>
                    </div>
                    <div className="card" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={15} color="var(--success)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{totalPeriods} Periods · 45 min each</span>
                    </div>
                </div>

                {/* Right — class selector + board badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Class dropdown */}
                    <div style={{ position: 'relative' }}>
                        <GraduationCap size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        <select
                            className="form-control"
                            value={selectedClass}
                            onChange={e => handleClassChange(e.target.value)}
                            style={{ paddingLeft: '2.25rem', minWidth: '160px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {classes.length === 0 && <option value="">Loading...</option>}
                            {grades.map(g => (
                                <optgroup key={g} label={`Standard ${g}`}>
                                    {classes.filter(c => c.grade === g).map(c => (
                                        <option key={c.id} value={c.name}>
                                            Class {c.name} ({c.board})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Board badge — auto-set from class */}
                    <span style={{
                        padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                        fontWeight: 700, fontSize: '0.85rem',
                        background: board === 'CBSE' ? 'var(--primary-focus)' : 'hsla(152,69%,41%,0.12)',
                        color: board === 'CBSE' ? 'var(--primary)' : 'var(--success)',
                        border: `1px solid ${board === 'CBSE' ? 'hsla(221,83%,53%,0.3)' : 'hsla(152,69%,41%,0.3)'}`,
                    }}>{board}</span>
                </div>
            </div>

            {/* Timetable card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                        background: board === 'CBSE' ? 'var(--primary-focus)' : 'hsla(152,69%,41%,0.1)',
                        color: board === 'CBSE' ? 'var(--primary)' : 'var(--success)',
                    }}>{board}</span>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {selectedClass ? `Class ${selectedClass}` : 'Select a class'} — Weekly Timetable
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>School starts at 8:30 AM</span>
                </div>
                {selectedClass
                    ? <TimetableGrid periods={periods} schedule={schedule} />
                    : <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Select a class to view its timetable.</div>
                }
            </div>

            {/* Subject legend */}
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Subjects:</span>
                {Object.entries(SUBJECT_COLORS).map(([sub, c]) => (
                    <span key={sub} style={{
                        padding: '0.2rem 0.65rem', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 500,
                        background: c.bg, color: c.color,
                    }}>{sub}</span>
                ))}
            </div>
        </div>
    );
};

export default Timetable;
