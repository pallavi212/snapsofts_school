import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Search, Save } from 'lucide-react';
import { attendanceApi, studentApi, classApi } from '../api';

const today = new Date().toISOString().split('T')[0];

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (cls, dt) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      // Load students for this class
      const allStudents = await studentApi.getAll();
      const grade = cls.replace(/[A-Z]/g, '');
      const section = cls.replace(/[0-9]/g, '');
      const classStudents = allStudents.filter(s =>
        String(s.grade) === grade && (s.class_name?.endsWith(section) || true)
      ).filter(s => s.class_name?.includes(cls) || s.class_name?.endsWith(section));

      // Fallback: filter by grade if class_name match fails
      const filtered = classStudents.length > 0
        ? classStudents
        : allStudents.filter(s => String(s.grade) === grade);

      setStudents(filtered);

      // Load existing attendance records
      try {
        const records = await attendanceApi.getByClassAndDate(cls, dt);
        const map = {};
        if (Array.isArray(records)) {
          records.forEach(r => { map[r.student_code || r.name] = r.status || 'Present'; });
        }
        // Default unrecorded students to Present
        const init = {};
        filtered.forEach(s => {
          init[s.student_code] = map[s.student_code] || 'Present';
        });
        setAttendance(init);
      } catch {
        // No records yet — default all to Present
        const init = {};
        filtered.forEach(s => { init[s.student_code] = 'Present'; });
        setAttendance(init);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    classApi.getAll().then(data => {
      setClasses(data);
      if (data.length) setSelectedClass(data[0].name);
    }).catch(() => { });
  }, []);

  useEffect(() => { if (selectedClass) loadData(selectedClass, date); }, [selectedClass, date, loadData]);

  const handleClassChange = cls => { setSelectedClass(cls); };
  const toggle = code => {
    setAttendance(prev => ({ ...prev, [code]: prev[code] === 'Present' ? 'Absent' : 'Present' }));
    setSaved(false);
  };
  const markAll = status => {
    setAttendance(Object.fromEntries(students.map(s => [s.student_code, status])));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await attendanceApi.save({
        class: selectedClass,
        date,
        records: Object.entries(attendance).map(([student_code, status]) => ({ student_code, status })),
      });
      setSaved(true);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const presentCount = students.filter(s => attendance[s.student_code] === 'Present').length;
  const absentCount = students.length - presentCount;
  const pct = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto' }} value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
            {classes.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="form-control" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: '200px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', color: 'var(--success)' }} onClick={() => markAll('Present')}>All Present</button>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => markAll('Absent')}>All Absent</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="card" style={{ padding: '1rem', color: 'var(--danger)', textAlign: 'center' }}>Error: {error}</div>}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Students', value: students.length, color: 'var(--primary)' },
          { label: 'Present', value: presentCount, color: 'var(--success)' },
          { label: 'Absent', value: absentCount, color: 'var(--danger)' },
          { label: 'Attendance %', value: `${pct}%`, color: pct >= 75 ? 'var(--success)' : 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'var(--success)' : 'var(--warning)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
      </div>

      {/* Student list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.95rem' }}>
          Class {selectedClass} — {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading students...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((s, i) => {
                  const isPresent = attendance[s.student_code] === 'Present';
                  return (
                    <tr key={s.student_code}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isPresent ? 'badge-success' : 'badge-danger'}`}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => toggle(s.student_code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPresent ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}>
                          {isPresent ? <CheckCircle size={22} /> : <XCircle size={22} />}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
