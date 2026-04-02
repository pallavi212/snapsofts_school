require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/users', require('./routes/users'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/parents', require('./routes/parents'));
app.use('/api/school-info', require('./routes/schoolInfo'));
app.use('/api/enquiries', require('./routes/enquiry'));
app.use('/api/petty-cash', require('./routes/pettyCash'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check + DB test
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', db: process.env.DB_NAME });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`EduSync API running on http://localhost:${PORT}`);
    console.log(`DB: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
