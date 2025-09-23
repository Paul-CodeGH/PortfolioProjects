// backend/routes/messages.js
const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User           = require('../models/user');
const Messages        = require('../models/message');

// GET /api/messages/users
// List all other users to chat with
router.get('/users', authMiddleware, (req, res) => {
    User.getAll((err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        const others = users.filter(u => u.id !== req.userId);
        res.json(others);
    });
});

// GET /api/messages/:userId
// Fetch the conversation with userId
router.get('/:userId', authMiddleware, (req, res) => {
    const otherId = parseInt(req.params.userId, 10);
    Messages.getConversation(req.userId, otherId, (err, msgs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(msgs);
    });
});

// POST /api/messages/:userId
// Send a new message to userId
router.post('/:userId', authMiddleware, (req, res) => {
    const otherId = parseInt(req.params.userId, 10);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    Messages.sendMessage(req.userId, otherId, content, (err, msg) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(msg);
    });
});

module.exports = router;
