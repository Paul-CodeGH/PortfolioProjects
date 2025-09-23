const jwt = require('jsonwebtoken');

// Middleware to protect routes by verifying JWT tokens

module.exports = (req, res, next) => {
    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    // No token provided, return 401 Unauthorized

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        // If verification fails, return 401 Unauthorized
        // If verification succeeds, decoded contains the user ID
        req.userId = decoded.id;
        next();
    });
};