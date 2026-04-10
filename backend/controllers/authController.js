const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const db = require('../db');
const ActivityLogModel = require('../models/ActivityLogModel');

// Register API
const register = async (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Name, email, role, and password are required' });
        }

        // Check if user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (using UserModel.create with hashed password)
        const code = await UserModel.create({
            name, email, phone, role, password: hashedPassword, status: 'Active'
        });

        res.status(201).json({ message: 'User registered successfully', user_code: code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login API
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // Find user by email and role
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
        if (rows.length === 0) {
            return res.status(401).json({ error: `Invalid credentials or role mismatch for ${role}` });
        }

        const user = rows[0];

        // Compare password. Handle plain text fallback for seeded DB passwords that aren't hashed.
        let validPassword = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
            validPassword = await bcrypt.compare(password, user.password);
        } else {
            validPassword = (password === user.password);
        }

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'edusync_secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                user_code: user.user_code,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Log the login event (fire-and-forget)
        ActivityLogModel.log({
            user_id: user.id, user_name: user.name, role: user.role,
            action: 'LOGIN', module: 'Auth', details: `Logged in as ${user.role}`,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };
