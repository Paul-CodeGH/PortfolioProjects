// backend/models/report.js
const db = require('../db');

// Report model for handling video reports
// Create is used to insert a new report into the database
// GetAll retrieves all reports with associated user and video information

const Report = {
    create: (reporterId, videoId, feedback, cb) => {
        const sql = `
      INSERT INTO reportsCCL
        (reporter_id, video_id, feedback)
      VALUES (?, ?, ?)
    `;
        db.query(sql, [reporterId, videoId, feedback], (err, result) => {
            if (err) return cb(err);
            cb(null, result.insertId);
        });
    },

    getAll: (cb) => {
        const sql = `
      SELECT
        r.report_id,
        r.feedback,
        r.created_at,
        u.id   AS reporter_id,
        u.username AS reporter_username,
        u.picture  AS reporter_picture,
        v.id   AS video_id,
        v.title    AS video_title
      FROM reportsCCL r
      JOIN usersCCL  u ON r.reporter_id = u.id
      JOIN videosCCL v ON r.video_id    = v.id
      ORDER BY r.created_at DESC
    `;
        db.query(sql, [], (err, rows) => {
            if (err) return cb(err);
            cb(null, rows || []);
        });
    }
};

module.exports = Report;
