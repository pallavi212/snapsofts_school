const router = require('express').Router();
const db = require('../db');

// GET all enquiries
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM admission_enquiries ORDER BY enquiry_date DESC'
        );
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create enquiry
router.post('/', async (req, res) => {
    try {
        const [[{ max_id }]] = await db.query('SELECT MAX(id) AS max_id FROM admission_enquiries');
        const enquiry_no = `ENQ${new Date().getFullYear()}${String((max_id || 0) + 1).padStart(3, '0')}`;
        const {
            parent_name, phone, email, student_name, dob, gender,
            applying_for_grade, board_preference, previous_school,
            address, status, notes, follow_up_date
        } = req.body;
        await db.query(
            `INSERT INTO admission_enquiries
             (enquiry_no, parent_name, phone, email, student_name, dob, gender,
              applying_for_grade, board_preference, previous_school, address, status, notes, follow_up_date)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [enquiry_no, parent_name, phone, email || null, student_name, dob || null,
                gender || 'Male', applying_for_grade, board_preference || 'Any',
                previous_school || null, address || null, status || 'New', notes || null, follow_up_date || null]
        );
        res.status(201).json({ enquiry_no });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update status / notes
router.put('/:id', async (req, res) => {
    try {
        const fields = ['parent_name', 'phone', 'email', 'student_name', 'dob', 'gender',
            'applying_for_grade', 'board_preference', 'previous_school',
            'address', 'status', 'notes', 'follow_up_date'];
        const updates = fields.filter(f => req.body[f] !== undefined);
        if (!updates.length) return res.json({ success: true });
        await db.query(
            `UPDATE admission_enquiries SET ${updates.map(f => `${f}=?`).join(',')} WHERE id=?`,
            [...updates.map(f => req.body[f]), req.params.id]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admission_enquiries WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
