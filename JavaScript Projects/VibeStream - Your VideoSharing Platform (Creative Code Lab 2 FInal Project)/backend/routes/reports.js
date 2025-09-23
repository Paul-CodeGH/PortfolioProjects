// backend/routes/reports.js
const express        = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Report         = require('../models/report');

const router = express.Router();

// POST /api/reports — create a new report
router.post(
    '/',
    authMiddleware,
    (req, res) => {
        const { videoId, feedback } = req.body;
        if (!videoId || !feedback) {
            return res.status(400).json({ error: 'videoId and feedback are required' });
        }
        Report.create(req.userId, videoId, feedback, (err, report_id) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ report_id, reporter_id: req.userId, video_id: videoId, feedback });
        });
    }
);

module.exports = router;
