// backend/index.js
require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcrypt');
const path    = require('path');
const db      = require('./db');
const authRoutes   = require('./routes/auth');
const adminRoutes  = require('./routes/admin');
const authMiddleware = require('./middleware/authMiddleware');
const app     = express();

// — Seed hard-coded admin if not exists —
;(async function seedAdmin(){
    const username = 'administrator';
    const password = 'admin';
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err,user) => {
        if (!user) {
            const hash = await bcrypt.hash(password, 10);
            db.run(
                'INSERT INTO users (username,password,role) VALUES (?,?,?)',
                [username, hash, 'admin']
            );
            console.log(`🛡️  Created admin: ${username}/${password}`);
        }
    });
})();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// protected example
app.get('/api/protected', authMiddleware, (req,res) => {
    res.json({ message: 'Protected data', userId: req.userId });
});

// serve the frontend (as before) …
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*path', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist','index.html'));
});

app.listen(process.env.PORT||4000, () =>
    console.log('Server running on', process.env.PORT||4000)
);
