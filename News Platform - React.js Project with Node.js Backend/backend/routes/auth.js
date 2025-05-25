const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    User.create(username, hash, (err, id) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id, username });
    });
});

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findByUsername(username, async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
        // inside router.post('/login', …)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            username: user.username,
            role:     user.role
        });

    });
});

module.exports = router;