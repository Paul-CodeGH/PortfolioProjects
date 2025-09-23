// backend/routes/videos.js
const express      = require('express');
const fs           = require('fs');
const path         = require('path');
const multer       = require('multer');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const User         = require('../models/user');
const Video        = require('../models/video');
const router       = express.Router();

// Multer configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../videos'));
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, uuidv4() + ext);
        }
    }),
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Block users with role 'fined'
function checkNotFined(req, res, next) {
    User.findById(req.userId, (err, u) => {
        if (err || !u) return res.status(401).json({ error: 'No user' });
        if (u.role === 'fined') {
            return res.status(403).json({ error: 'Fined users cannot post videos' });
        }
        next();
    });
}

// Upload a new video
router.post(
    '/',
    authMiddleware,
    checkNotFined,
    upload.single('video'),
    (req, res) => {
        const { title, description, category } = req.body;
        if (!title || !description || !category || !req.file) {
            return res.status(400).json({ error: 'All fields and file are required' });
        }
        Video.create(
            title,
            description,
            category,
            req.file.filename,
            req.userId,
            (err, video) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(video);
            }
        );
    }
);

// List ALL videos
router.get('/', authMiddleware, (req, res) => {
    Video.getAll((err, videos) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(videos);
    });
});

// List only the logged-in user’s videos
router.get('/mine', authMiddleware, (req, res) => {
    Video.getByUser(req.userId, (err, videos) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(videos);
    });
});

// Fetch a single video by ID
router.get('/:id', authMiddleware, (req, res) => {
    const vid = parseInt(req.params.id, 10);
    Video.getById(vid, (err, video) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!video) return res.status(404).json({ error: 'Not found' });
        res.json(video);
    });
});

// Delete a video (and its file & comments)
router.delete('/:id', authMiddleware, (req, res) => {
    const vid = parseInt(req.params.id, 10);
    const db  = require('../db');

    db.query('SELECT filename, user_id FROM videosCCL WHERE id = ?', [vid], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ error: 'Not found' });

        const { filename, user_id } = rows[0];
        db.query('SELECT role FROM usersCCL WHERE id = ?', [req.userId], (err2, rows2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const role = rows2[0]?.role;
            if (req.userId !== user_id && role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // delete comments
            db.query('DELETE FROM commentsCCL WHERE video_id = ?', [vid], err3 => {
                if (err3) return res.status(500).json({ error: err3.message });
                // delete file
                fs.unlink(path.join(__dirname, '../videos', filename), () => {
                    // delete record
                    db.query('DELETE FROM videosCCL WHERE id = ?', [vid], err4 => {
                        if (err4) return res.status(500).json({ error: err4.message });
                        res.status(204).end();
                    });
                });
            });
        });
    });
});

module.exports = router;
