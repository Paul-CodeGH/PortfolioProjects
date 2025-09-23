// backend/routes/auth.js
// This file sets up the authentication-related HTTP routes for our Express server.
// It handles user registration (including password hashing and optional profile picture upload)
// and user login (verifying credentials and issuing JSON Web Tokens for authenticated sessions).

const express  = require('express');
// Import the Express framework so we can create a router to define specific endpoints

const bcrypt   = require('bcrypt');
// Import bcrypt, a library that securely hashes plain-text passwords and verifies them

const jwt      = require('jsonwebtoken');
// Import jsonwebtoken, a library that generates and verifies tokens used for stateless authentication

const multer   = require('multer');
// Import multer, a middleware for Express that processes multipart/form-data requests, allowing file uploads

const fs             = require('fs');           // ← Added this
const path           = require('path');         // ← Ensure this is here

const { v4: uuidv4 } = require('uuid');
// Import the v4 function from the uuid library (renamed to uuidv4) to generate random unique identifiers

const authMiddleware = require('../middleware/authMiddleware'); // ← import it

const User     = require('../models/user');
// Import our User model which provides functions to create and find users in the database

const router = express.Router();
// Create an Express Router object. This allows us to define routes in this file
// and then mount them under a specific path in our main application file.

// Configure multer storage so that uploaded files are saved in the "uploads" directory
// with a unique filename based on a UUID and the original file extension.
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // Specify that uploaded files should go into the "uploads" folder at the project root
            cb(null, path.join(__dirname, '../uploads'));
        },
        filename: (req, file, cb) => {
            // Generate a new filename by combining a UUID with the file’s original extension
            const ext = path.extname(file.originalname);
            cb(null, uuidv4() + ext);
        }
    })
});

// Define a POST route at /register to handle new user sign-ups.
// We use the `upload.single('picture')` middleware to process
// an optional file field named "picture" in the form data.
router.post(
    '/register',
    upload.single('picture'),
    async (req, res) => {
        // Extract the username, password, and email values sent in the form body
        const { username, password, email } = req.body;

        // Check that the client provided all required fields
        if (!username || !password || !email) {
            // If any required field is missing, respond with status 400 (Bad Request)
            // and include an error message in the JSON response.
            return res.status(400).json({ error: 'Username, password and email are required' });
        }

        try {
            // Generate a salt using bcrypt to strengthen the password hash
            const salt = await bcrypt.genSalt(10);
            // Hash the user’s plain-text password with the generated salt
            const hash = await bcrypt.hash(password, salt);

            // If the user uploaded a profile picture, multer puts file info on req.file
            // We store the filename; if no picture was uploaded, we default to an empty string.
            const picture = req.file ? req.file.filename : '';

            // Create the new user record in the database.
            // The `create` function takes the username, hashed password, email, and picture filename,
            // and calls a callback with an error (if any) or the new user’s database ID.
            User.create(username, hash, email, picture, (err, id) => {
                if (err) {
                    // If the database operation fails (for example, due to duplicate username),
                    // respond with status 400 and include the database error message.
                    return res.status(400).json({ error: err.message });
                }
                // On successful creation, send back the new user’s id, username, email, and picture filename.
                res.json({ id, username, email, picture });
            });
        } catch (err) {
            // If any unexpected error occurs (hashing or database interaction),
            // respond with status 500 (Internal Server Error) and a generic message.
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Define a POST route at /login to handle user authentication.
// This endpoint does not accept file uploads and remains unchanged from before.
router.post('/login', (req, res) => {
    // Extract username and password from the JSON body of the request
    const { username, password } = req.body;

    // Use the User model to find a user record matching the given username.
    User.findByUsername(username, async (err, user) => {
        // If there is a database error or the user does not exist,
        // respond with status 400 and a generic "Invalid credentials" message.
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the provided plain-text password with the stored hash using bcrypt.
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            // If the password comparison fails, respond with status 400 and "Invalid credentials".
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // If credentials are valid, generate a JSON Web Token containing the user’s ID.
        // The token is signed using the secret from our environment variables and expires in one hour.
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1y' });

        // Send back a JSON response that includes the token for authenticated requests
        // and the user’s basic information (excluding the password hash).
        res.json({
            token,
            username: user.username,
            email:    user.email,
            role:     user.role,
            picture:  user.picture
        });
    });
});

// ← NEW: Update password
router.put(
    '/password',
    authMiddleware,
    async (req, res) => {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        try {
            const hash = await bcrypt.hash(password, 10);
            User.updatePassword(req.userId, hash, err => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Password updated' });
            });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// ← NEW: update profile picture
router.put(
    '/picture',
    authMiddleware,
    upload.single('picture'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Look up the old picture
        User.findById(req.userId, (err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const oldPic = user.picture;
            const newPic = req.file.filename;
            // Update DB
            User.updatePicture(req.userId, newPic, updateErr => {
                if (updateErr) {
                    return res.status(500).json({ error: updateErr.message });
                }
                // Delete old file if it existed
                if (oldPic) {
                    fs.unlink(
                        path.join(__dirname, '../uploads', oldPic),
                        () => { /* ignore errors */ }
                    );
                }
                // Return the new filename
                res.json({ picture: newPic });
            });
        });
    }
);

// Export the configured router so that our main server file can mount
// these authentication routes under a path such as '/auth'.
module.exports = router;
