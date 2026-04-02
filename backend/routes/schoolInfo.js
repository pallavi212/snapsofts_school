const router = require('express').Router();
const db = require('../db');

// GET school info
router.get('/', async (req, res) => {
    try {
        const [[info]] = await db.query('SELECT * FROM school_info LIMIT 1');
        res.json(info || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update school info
router.put('/', async (req, res) => {
    try {
        const fields = [
            'school_name', 'trust_name', 'trust_id', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'phone', 'email', 'website',
            'principal_name', 'academic_year', 'affiliation_no', 'logo_url', 'board'
        ];
        const updates = fields.filter(f => req.body[f] !== undefined);
        if (!updates.length) return res.json({ success: true });
        await db.query(
            `UPDATE school_info SET ${updates.map(f => `${f} = ?`).join(', ')} LIMIT 1`,
            updates.map(f => req.body[f])
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
