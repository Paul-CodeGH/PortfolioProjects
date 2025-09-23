// backend/db.js
// This file establishes our MySQL connection pool, runs a migration to add the
// `role` column if needed, and seeds a default admin user on startup.

require('dotenv').config();
const mysql  = require('mysql2');
const bcrypt = require('bcrypt');

// Create a connection pool
const db = mysql.createPool({
    host:            'atp.fhstp.ac.at',
    port:            8007,
    user:            process.env.DB_USERNAME,
    password:        process.env.DB_PASSWORD,
    database:        'cc241003',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:      0
});

// Test a connection, then run migrations & seed
db.getConnection((err, connection) => {
    if (err) throw err;
    console.log('🗄️  Connected to MySQL database');
    connection.release();

    // 1) Add role column if it doesn't exist (default 'normal'). This will not run if the column already exists.
    db.query(
        `ALTER TABLE usersCCL
            ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'normal'`,
        err => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.error('Migration error adding role column:', err);
            }
        }
    );

    // 2) Seed default admin user if missing. This will only run if the admin user does not already exist.
    const adminUser  = process.env.ADMIN_USERNAME;
    const adminPass  = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    db.query(
        'SELECT * FROM usersCCL WHERE username = ?',
        [adminUser],
        async (err, results) => {
            if (err) {
                console.error('Seed admin lookup failed:', err);
                return;
            }
            if (results.length === 0) {
                try {
                    const hash = await bcrypt.hash(adminPass, 10);
                    db.query(
                        'INSERT INTO usersCCL (username, password, email, role, picture) VALUES (?, ?, ?, ?, ?)',
                        [adminUser, hash, adminEmail, 'admin', ''],
                        insertErr => {
                            if (insertErr) {
                                console.error('Seed admin insert failed:', insertErr);
                            } else {
                                console.log(`🛡️  Created admin: ${adminUser}/${adminPass}`);
                            }
                        }
                    );
                } catch (hashErr) {
                    console.error('Admin password hash failed:', hashErr);
                }
            }
        }
    );
});

module.exports = db;
