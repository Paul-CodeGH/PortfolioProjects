const jwt  = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Admin-only route guard.
 *
 * 1. Reads the Bearer token from `Authorization` header.
 * 2. Verifies the token using our JWT secret.
 * 3. Loads the user from the database.
 * 4. Allows the request to continue only if the user exists and has role “admin.”
 */

module.exports = (req, res, next) => {
    // Check for the Authorization header and extract the token
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) return res.status(401).json({ error: 'No token' });
    // No token provided, return 401 Unauthorized

    // Verify the token
    jwt.verify(auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        // If verification fails, return 401 Unauthorized

        // If verification succeeds, decoded contains the user ID
        User.findById(decoded.id, (err, user) => {
            // if there was an error or no user found, return 401 Unauthorized
            if (err || !user) return res.status(401).json({ error: 'No user' });
            if (user.role !== 'admin')
                // If the user is not an admin, return 403 Forbidden
                return res.status(403).json({ error: 'Admins only' });
            // If the user is an admin, attach their ID to the request object
            req.userId = decoded.id;
            next();
        });
    });
};
