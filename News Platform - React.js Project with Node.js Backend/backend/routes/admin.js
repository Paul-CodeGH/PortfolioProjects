const express = require('express');
const router  = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const User    = require('../models/user');

// GET /api/admin/users
router.get('/users', adminMiddleware, (req, res) => {
    User.getAll((err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminMiddleware, (req, res) => {
    const { id }   = req.params;
    const { role } = req.body;
    if (!['normal','creator'].includes(role))
        return res.status(400).json({ error: 'Invalid role' });

    User.updateRole(id, role, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, role });
    });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminMiddleware, (req, res) => {
    const { id } = req.params;
    User.deleteById(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).end(); // 204 No Content
    });
});

module.exports = router;
