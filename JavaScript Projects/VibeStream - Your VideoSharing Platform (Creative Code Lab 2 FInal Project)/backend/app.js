// backend/app.js
// This is the main entry point for our Express server setup.
// It configures middleware, seeds a default admin user if needed,
// mounts API routes, serves uploaded files, and hosts the frontend application.

require('dotenv').config();
// Load environment variables from a .env file into process.env,
// so sensitive information like database credentials and secrets stay out of source code.

const express = require('express');
// Import Express, a web framework for Node.js, to create our server and define routes.

const cors    = require('cors');
// Import the CORS middleware, which allows us to accept requests from different origins,
// useful during development when the frontend and backend run on separate ports.

const bcrypt  = require('bcrypt');
// Import bcrypt to hash the default admin password securely if we need to seed an admin user.

const path    = require('path');
// Import Node’s path module to handle directory and file paths in a reliable, cross-platform way.

const db      = require('./db');
// Import our configured database connection so we can run queries directly in this file.

const authRoutes     = require('./routes/auth');
// Import the authentication routes to handle user registration and login under /api/auth.

const adminRoutes    = require('./routes/admin');
// Import the admin-only routes for managing users under /api/admin.
const reportsRoutes  = require('./routes/reports');

const messagesRoutes = require('./routes/messages');
const videosRoutes   = require('./routes/videos');
const commentsRoutes = require('./routes/comments');

const authMiddleware = require('./middleware/authMiddleware');
// Import middleware that protects routes by verifying JSON Web Tokens.

const app = express();
// Create an instance of an Express application, which we will configure below.

// Enable CORS for all routes. This is especially useful in development
// when our frontend might be served from a different origin than the backend.
app.use(cors());

// Parse incoming JSON request bodies and make them available on req.body.
app.use(express.json());

// Mount authentication routes at the path /api/auth
app.use('/api/auth', authRoutes);

// Mount admin-only routes at the path /api/admin
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/api/messages', messagesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/videos/:videoId/comments', commentsRoutes);

// Serve uploaded user pictures and other files from the 'uploads' directory
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

// — Serve videos WITHOUT Accept-Ranges to avoid 416 errors —
app.use(
    '/videos',
    express.static(path.join(__dirname, 'videos'), {
        index: false,
        acceptRanges: false
    })
);

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ ok: true, userId: req.userId });
});

// — Serve frontend build —
app.use(
    express.static(path.join(__dirname, '../frontend/dist'))
);

// — Swallow any leftover 416 Range errors from send/static —
app.use((err, req, res, next) => {
    if (err.status === 416) {
        return res.status(200).end();
    }
    next(err);
});

// SPA fallback: serve index.html for unmatched routes to support client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start the server, listening on the port defined in the environment or default to 3000.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));

// Exporting `app` is optional here, but can be useful for testing frameworks.
module.exports = app;
