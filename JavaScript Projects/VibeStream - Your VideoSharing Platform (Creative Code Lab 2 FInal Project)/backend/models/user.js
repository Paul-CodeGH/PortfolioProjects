// backend/models/user.js
const db = require('../db');

// User model for handling user-related operations

const User = {
    // Create a new user with username, password hash, email, and picture
    create: (username, hash, email, picture, cb) => {
        db.query(
            'INSERT INTO usersCCL (username, password, email, picture) VALUES (?, ?, ?, ?)',
            [username, hash, email, picture],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results.insertId);
            }
        );
    },
    // Find a user by username
    findByUsername: (username, cb) => {
        db.query(
            'SELECT * FROM usersCCL WHERE username = ?',
            [username],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results[0]);
            }
        );
    },
    // Find a user by id
    findById: (id, cb) => {
        db.query(
            'SELECT * FROM usersCCL WHERE id = ?',
            [id],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results[0]);
            }
        );
    },
    // Get all users from the database
    getAll: (cb) => {
        db.query(
            'SELECT id, username, email, role, picture FROM usersCCL',
            [],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results);
            }
        );
    },
    //Update a user's role (normal, fined)
    updateRole: (id, role, cb) => {
        db.query(
            'UPDATE usersCCL SET role = ? WHERE id = ?',
            [role, id],
            (err) => cb(err)
        );
    },
    // Update user's password hash
    updatePassword: (id, hash, cb) => {
        db.query(
            'UPDATE usersCCL SET password = ? WHERE id = ?',
            [hash, id],
            (err) => cb(err)
        );
    },
    // Delete a user by specifying their id
    deleteById: (id, cb) => {
        db.query(
            'DELETE FROM usersCCL WHERE id = ?',
            [id],
            (err) => cb(err)
        );
    },
    // Update the picture filename for a user
    updatePicture: (id, pictureFilename, cb) => {
        db.query(
            'UPDATE usersCCL SET picture = ? WHERE id = ?',
            [pictureFilename, id],
            (err) => cb(err)
        );
    },
};

module.exports = User;
