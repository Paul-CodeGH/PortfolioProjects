// backend/models/comment.js
const db = require('../db');

const Comment = {
    // Insert a new comment, then fetch it (with user info)
    create: (content, userId, videoId, cb) => {
        const sql = `
      INSERT INTO commentsCCL (content, user_id, video_id)
      VALUES (?, ?, ?)
    `;
        db.query(sql, [content, userId, videoId], (err, result) => {
            if (err) return cb(err);
            const id = result.insertId;
            const fetch = `
        SELECT
          c.comment_id,
          c.content,
          c.created_at,
          u.id   AS user_id,
          u.username,
          u.picture
        FROM commentsCCL c
        JOIN usersCCL   u ON c.user_id = u.id
        WHERE c.comment_id = ?
      `;
            db.query(fetch, [id], (err2, rows) => cb(err2, rows[0]));
        });
    },

    // Get all comments for a given video, oldest first
    getByVideo: (videoId, cb) => {
        const sql = `
      SELECT
        c.comment_id,
        c.content,
        c.created_at,
        u.id   AS user_id,
        u.username,
        u.picture
      FROM commentsCCL c
      JOIN usersCCL   u ON c.user_id = u.id
      WHERE c.video_id = ?
      ORDER BY c.created_at ASC
    `;
        db.query(sql, [videoId], (err, rows) => cb(err, rows));
    }
};

module.exports = Comment;
