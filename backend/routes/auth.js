const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');
const { loadData, saveData } = require('../db');
const { loginLimiter } = require('../middleware/security');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Login — returns a JWT token
router.post('/login', loginLimiter, (req, res) => {
    try {
        const { password } = req.body;
        const db = loadData();

        if (db.admin.passwordHash && bcrypt.compareSync(password, db.admin.passwordHash)) {
            // Generate JWT token
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
            res.json({ success: true, token: token });
        } else {
            res.status(401).json({ success: false, message: "Incorrect" });
        }
    } catch (e) {
        console.error("LOGIN ERROR:", e);
        res.status(500).json({ success: false, message: "Server Error: " + e.message });
    }
});

// Change Password
router.post('/change-password', verifyAdmin, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ success: false, message: "Trop court" });
    }

    const db = loadData();
    const salt = bcrypt.genSaltSync(10);
    db.admin.passwordHash = bcrypt.hashSync(newPassword, salt);
    saveData(db);
    res.json({ success: true });
});

module.exports = router;
