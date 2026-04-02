import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarApi } from '../api';

const EVENT_TYPES = {
    holiday: { label: 'Holiday', bg: 'hsla(354,70%,54%,0.12)', color: 'hsl(354,70%,48%)', dot: 'hsl(354,70%,48%)' },
    exam: { label: 'Exam', bg: 'hsla(221,83%,53%,0.12)', color: 'hsl(221,83%,45%)', dot: 'hsl(221,83%,45%)' },
    event: { label: 'School Event', bg: 'hsla(270,70%,55%,0.12)', color: 'hsl(270,70%,45%)', dot: 'hsl(270,70%,45%)' },
    ptm: { label: 'PTM', bg: 'hsla(38,92%,50%,0.12)', color: 'hsl(38,92%,35%)', dot: 'hsl(38,92%,35%)' },
    activity: { label: 'Activity', bg: 'hsla(152,69%,41%,0.12)', color: 'hsl(152,69%,35%)', dot: 'hsl(152,69%,35%)' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


const Calendar = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selected, setSelected] = useState(null);
    const [typeFilter, setTypeFilter] = useState('All');
    const [events, setEvents] = useState([]);

    useEffect(() => {
        calendarApi.getAll().then(data => {
            if (data.length) setEvents(data.map(e => ({ date: e.event_date?.split('T')[0] || e.event_date, title: e.title, type: e.type })));
        }).catch(() => { });
    }, []);

    const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = now.toISOString().split('T')[0];

    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

    const selectedEvents = selected ? getEventsForDate(selected) : [];

    const upcomingEvents = events
        .filter(e => e.date >= todayStr && (typeFilter === 'All' || e.type === typeFilter))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Calendar grid */}
                <div className="card" style={{ flex: '1 1 380px', padding: '1.25rem' }}>
                    {/* Month nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={prevMonth}><ChevronLeft size={20} /></button>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{MONTHS[month]} {year}</h3>
                        <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={nextMonth}><ChevronRight size={20} /></button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                        {DAYS.map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0.25rem 0' }}>{d}</div>
                        ))}
                    </div>

                    {/* Date cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const d = i + 1;
                            const ds = dateStr(d);
                            const evts = getEventsForDate(ds);
                            const isToday = ds === todayStr;
                            const isSelected = ds === selected;
                            const isSunday = new Date(year, month, d).getDay() === 0;

                            return (
                                <div key={d} onClick={() => setSelected(isSelected ? null : ds)}
                                    style={{
                                        position: 'relative', textAlign: 'center', padding: '0.4rem 0.2rem',
                                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        background: isSelected ? 'var(--primary)' : isToday ? 'var(--primary-focus)' : 'transparent',
                                        color: isSelected ? 'white' : isSunday ? 'var(--danger)' : 'var(--text-primary)',
                                        fontWeight: isToday ? 700 : 400,
                                        transition: 'background 150ms',
                                    }}>
                                    <span style={{ fontSize: '0.8rem' }}>{d}</span>
                                    {evts.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', flexWrap: 'wrap' }}>
                                            {evts.slice(0, 3).map((ev, ei) => (
                                                <span key={ei} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? 'white' : EVENT_TYPES[ev.type]?.dot, display: 'inline-block' }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected day events */}
                    {selected && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            {selectedEvents.length === 0
                                ? <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No events</p>
                                : selectedEvents.map((ev, i) => {
                                    const t = EVENT_TYPES[ev.type];
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: t.bg, marginBottom: '0.4rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: t.color }}>{ev.title}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: t.color, opacity: 0.8 }}>{t.label}</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}
                </div>

                {/* Upcoming events panel */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Legend */}
                    <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {Object.entries(EVENT_TYPES).map(([key, t]) => (
                            <span key={key} onClick={() => setTypeFilter(typeFilter === key ? 'All' : key)}
                                style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: typeFilter === key || typeFilter === 'All' ? t.bg : 'var(--bg-main)', color: t.color, border: `1px solid ${typeFilter === key ? t.dot : 'transparent'}`, transition: 'all 150ms' }}>
                                {t.label}
                            </span>
                        ))}
                    </div>

                    {/* Upcoming list */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.9rem' }}>
                            Upcoming Events
                        </div>
                        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            {upcomingEvents.length === 0
                                ? <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No upcoming events</p>
                                : upcomingEvents.map((ev, i) => {
                                    const t = EVENT_TYPES[ev.type];
                                    const d = new Date(ev.date + 'T00:00:00');
                                    return (
                                        <div key={i} onClick={() => { setMonth(d.getMonth()); setYear(d.getFullYear()); setSelected(ev.date); }}
                                            style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 150ms' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ minWidth: '42px', textAlign: 'center', background: t.bg, borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.4rem' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: t.color, lineHeight: 1 }}>{d.getDate()}</div>
                                                <div style={{ fontSize: '0.65rem', color: t.color, fontWeight: 600 }}>{MONTHS[d.getMonth()].slice(0, 3).toUpperCase()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ev.title}</div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: t.color }}>{t.label}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
