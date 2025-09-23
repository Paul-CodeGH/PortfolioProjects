// backend/routes/comments.js
const express        = require('express');
const router         = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/authMiddleware');
const Comment        = require('../models/comment');

// GET  /api/videos/:videoId/comments
router.get('/', authMiddleware, (req, res) => {
    const videoId = parseInt(req.params.videoId, 10);
    Comment.getByVideo(videoId, (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comments);
    });
});

// POST /api/videos/:videoId/comments
router.post('/', authMiddleware, (req, res) => {
    const videoId = parseInt(req.params.videoId, 10);
    const content = req.body.content;
    if (!content) return res.status(400).json({ error: 'Content required' });

    Comment.create(content, req.userId, videoId, (err, comment) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comment);
    });
});

module.exports = router;
