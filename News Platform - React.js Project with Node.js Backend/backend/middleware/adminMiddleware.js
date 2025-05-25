const jwt  = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) return res.status(401).json({ error: 'No token' });

    jwt.verify(auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        User.findById(decoded.id, (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'No user' });
            if (user.role !== 'admin')
                return res.status(403).json({ error: 'Admins only' });
            req.userId = decoded.id;
            next();
        });
    });
};
