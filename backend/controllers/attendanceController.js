const AttendanceModel = require('../models/AttendanceModel');
const db = require('../db');

const getAttendance = async (req, res) => {
    const { class_id, date } = req.query;
    if (!class_id || !date)
        return res.status(400).json({ error: 'class_id and date are required' });
    try {
        // class_id may be a class name (e.g. "1A") or numeric id — resolve to numeric
        let resolvedClassId = class_id;
        if (isNaN(class_id)) {
            const [[cls]] = await db.query('SELECT id FROM classes WHERE name = ? LIMIT 1', [class_id]);
            if (!cls) return res.json([]);
            resolvedClassId = cls.id;
        }
        const records = await AttendanceModel.getByClassAndDate(resolvedClassId, date);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const saveAttendance = async (req, res) => {
    // Accept either class_id (numeric) or class (name like "1A")
    const { class_id, class: className, date, records, marked_by } = req.body;
    const classRef = class_id || className;
    if (!classRef || !date || !Array.isArray(records))
        return res.status(400).json({ error: 'class_id, date and records[] are required' });
    try {
        // Resolve class name → numeric id if needed
        let resolvedClassId = classRef;
        if (isNaN(classRef)) {
            const [[cls]] = await db.query('SELECT id FROM classes WHERE name = ? LIMIT 1', [classRef]);
            if (!cls) return res.status(404).json({ error: `Class "${classRef}" not found` });
            resolvedClassId = cls.id;
        }

        // Resolve student_code → student_id for each record
        const resolvedRecords = await Promise.all(records.map(async r => {
            if (r.student_id) return r;
            const [[stu]] = await db.query('SELECT id FROM students WHERE student_code = ? LIMIT 1', [r.student_code]);
            return { student_id: stu?.id, status: r.status };
        }));

        const validRecords = resolvedRecords.filter(r => r.student_id);
        if (validRecords.length === 0)
            return res.status(400).json({ error: 'No valid student records found' });

        await AttendanceModel.save(resolvedClassId, date, validRecords, marked_by);
        res.json({ message: 'Attendance saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const records = await AttendanceModel.getByStudentId(req.params.studentId);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAttendance, saveAttendance, getStudentAttendance };
