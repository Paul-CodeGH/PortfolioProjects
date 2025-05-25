// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_FILE);

db.serialize(() => {
    // (Re)create table if missing
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
                                             id       INTEGER PRIMARY KEY AUTOINCREMENT,
                                             username TEXT    UNIQUE,
                                             password TEXT,
                                             role     TEXT    DEFAULT 'normal'
        )
    `);

    // Add role column if it doesn’t exist yet
    db.run(
        `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'normal'`,
        err => {
            // Ignore “duplicate column” errors
            if (err && !/duplicate column name/.test(err.message)) {
                console.error('Migration error:', err);
            }
        }
    );
});

module.exports = db;
