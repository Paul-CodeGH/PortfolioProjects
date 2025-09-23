// backend/models/video.js
const db = require('../db');

const Video = {
    // Create a new video record
    create: (title, description, category, filename, userId, cb) => {
        const sql = `
            INSERT INTO videosCCL
                (title, description, category, filename, user_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [title, description, category, filename, userId], (err, result) => {
            if (err) return cb(err);
            cb(null, {
                id: result.insertId,
                title,
                description,
                category,
                filename,
                user_id: userId
            });
        });
    },

    // Fetch all videos, newest first
    getAll: (cb) => {
        const sql = `
            SELECT
                v.id,
                v.title,
                v.description,
                v.category,
                v.filename,
                v.uploaded_at,
                u.id   AS user_id,
                u.username,
                u.picture      AS picture
            FROM videosCCL v
                     JOIN usersCCL u ON v.user_id = u.id
            ORDER BY v.uploaded_at DESC
        `;
        db.query(sql, [], (err, rows) => {
            if (err) return cb(err);
            cb(null, rows || []);
        });
    },

    // Fetch only this user's videos
    getByUser: (userId, cb) => {
        const sql = `
            SELECT
                v.id,
                v.title,
                v.description,
                v.category,
                v.filename,
                v.uploaded_at,
                u.id   AS user_id,
                u.username,
                u.picture      AS picture
            FROM videosCCL v
                     JOIN usersCCL u ON v.user_id = u.id
            WHERE v.user_id = ?
            ORDER BY v.uploaded_at DESC
        `;
        db.query(sql, [userId], (err, rows) => {
            if (err) return cb(err);
            cb(null, rows || []);
        });
    },

    // Fetch a single video by ID
    getById: (id, cb) => {
        const sql = `
            SELECT
                v.id,
                v.title,
                v.description,
                v.category,
                v.filename,
                v.uploaded_at,
                u.id   AS user_id,
                u.username,
                u.picture      AS picture
            FROM videosCCL v
                     JOIN usersCCL u ON v.user_id = u.id
            WHERE v.id = ?
        `;
        db.query(sql, [id], (err, rows) => {
            if (err) return cb(err);
            if (!rows || rows.length === 0) {
                return cb(null, null);
            }
            cb(null, rows[0]);
        });
    }
};

module.exports = Video;
