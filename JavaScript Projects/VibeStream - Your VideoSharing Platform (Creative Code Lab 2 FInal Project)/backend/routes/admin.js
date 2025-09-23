// backend/routes/admin.js
const express         = require('express');
const fs              = require('fs');
const path            = require('path');
const router          = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const db              = require('../db');
const User            = require('../models/user');

// GET /api/admin/users to list all users
router.get('/users', adminMiddleware, (req, res) => {
    User.getAll((err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

// PUT /api/admin/users/:id/role to update a user's role
router.put('/users/:id/role', adminMiddleware, (req, res) => {
    const { id }   = req.params;
    const { role } = req.body;
    if (!['normal','fined'].includes(role))
        return res.status(400).json({ error: 'Invalid role' });

    User.updateRole(id, role, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, role });
    });
});

// DELETE /api/admin/users/:id to delete a user
// Deletes comments, messages, videos (and their comments & files), then the user
router.delete('/users/:id', adminMiddleware, (req, res) => {
    const { id } = req.params;

    // 1) delete comments by this user
    db.query(
        'DELETE FROM commentsCCL WHERE user_id = ?',
        [id],
        err => {
            if (err) return res.status(500).json({ error: err.message });

            // 2) delete messages sent or received by this user
            db.query(
                'DELETE FROM messagesCCL WHERE sender_id = ? OR receiver_id = ?',
                [id, id],
                err => {
                    if (err) return res.status(500).json({ error: err.message });

                    // 3) find this user's videos
                    db.query(
                        'SELECT id, filename FROM videosCCL WHERE user_id = ?',
                        [id],
                        (err, videos) => {
                            if (err) return res.status(500).json({ error: err.message });

                            const videoIds = videos.map(v => v.id);

                            // helper to remove video files then records
                            function removeVideos() {
                                // delete files
                                videos.forEach(v => {
                                    fs.unlink(
                                        path.join(__dirname, '../videos', v.filename),
                                        () => {}
                                    );
                                });
                                // delete video records
                                db.query(
                                    'DELETE FROM videosCCL WHERE user_id = ?',
                                    [id],
                                    err => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        // finally delete user
                                        User.deleteById(id, err => {
                                            if (err) return res.status(500).json({ error: err.message });
                                            res.status(204).end();
                                        });
                                    }
                                );
                            }

                            if (videoIds.length) {
                                // 4) delete comments on those videos
                                db.query(
                                    'DELETE FROM commentsCCL WHERE video_id IN (?)',
                                    [videoIds],
                                    err => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        removeVideos();
                                    }
                                );
                            } else {
                                removeVideos();
                            }
                        }
                    );
                }
            );
        }
    );
});

// GET /api/admin/reports — list all reports
router.get(
    '/reports',
    adminMiddleware,
    (req, res) => {
        const Report = require('../models/report');
        Report.getAll((err, reports) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(reports);
        });
    }
);

module.exports = router;


module.exports = router;
