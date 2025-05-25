// backend/models/user.js
const db = require('../db');

const User = {
    create: (username, hash, cb) => {
        db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hash, 'normal'],
            function(err) {
                cb(err, this && this.lastID);
            }
        );
    },

    findByUsername: (username, cb) => {
        db.get(
            'SELECT * FROM users WHERE username = ?',
            [username],
            cb
        );
    },

    findById: (id, cb) => {
        db.get(
            'SELECT * FROM users WHERE id = ?',
            [id],
            cb
        );
    },

    getAll: (cb) => {
        db.all(
            'SELECT id, username, role FROM users',
            [],
            cb
        );
    },

    updateRole: (id, role, cb) => {
        db.run(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id],
            function(err) {
                cb(err);
            }
        );
    },

    // Add this at the bottom, before module.exports
    deleteById: (id, cb) => {
        db.run(
            'DELETE FROM users WHERE id = ?',
            [id],
            function(err) { cb(err); }
        );
    },
};

module.exports = User;
