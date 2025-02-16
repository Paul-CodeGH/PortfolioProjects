// server.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 3600000, // 1 hour in milliseconds
    cookie: { secure: false } // Set to true if using HTTPS
}));

const users = []; // In-memory user storage for demo purposes

// Serve the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    //check if user is logged in
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'loginpic.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Register User Route
app.post('/register',
    body('username').isLength({ min: 3 }),
    body('password').isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({ username, password: hashedPassword });
        res.json({ message: 'User registered' });
    }
);

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Store user info in session
    req.session.userId = user.username; // You can store user id or any user-related info
    res.sendFile(path.join(__dirname, 'public', 'loginpic.html')); // Adjust the path as needed
});

// Middleware to protect routes
const authenticateSession = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(403).json({ message: 'Access denied.' });
    }
    next();
};

// Protected Route (example: dashboard)
app.get('/dashboard', authenticateSession, (req, res) => {
    res.json({ message: `Welcome, ${req.session.userId}!` });
});

// Logout Route
app.all('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.' });
        }
        res.json({ message: 'Logged out!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(process.env.JWT_SECRET);
});
