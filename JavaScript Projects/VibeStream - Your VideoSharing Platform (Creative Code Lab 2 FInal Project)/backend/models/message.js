// backend/models/messages.js
const db = require('../db');

const Message = {
    // Fetch the conversation between userId1 and userId2
    getConversation: (userId1, userId2, cb) => {
        const sql = `
      SELECT *
      FROM messagesCCL
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY sent_at ASC
    `;
        db.query(sql, [userId1, userId2, userId2, userId1], (err, results) => {
            cb(err, results);
        });
    },

    // Insert a new message, then retrieve and return it
    sendMessage: (senderId, receiverId, content, cb) => {
        const insertSql = `
      INSERT INTO messagesCCL (content, sender_id, receiver_id)
      VALUES (?, ?, ?)
    `;
        db.query(insertSql, [content, senderId, receiverId], (err, result) => {
            if (err) return cb(err);
            const id = result.insertId;
            db.query(
                'SELECT * FROM messagesCCL WHERE messages_id = ?',
                [id],
                (err2, rows) => cb(err2, rows[0])
            );
        });
    }
};

module.exports = Message;
