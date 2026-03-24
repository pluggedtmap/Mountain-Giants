const express = require('express');
const { loadData, saveData } = require('../db');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get settings (public)
router.get('/', (req, res) => {
    const db = loadData();
    res.json({ success: true, data: db.settings });
});

// Update settings (admin)
router.post('/', verifyAdmin, (req, res) => {
    const db = loadData();
    db.settings = { ...db.settings, ...req.body };
    saveData(db);
    res.json({ success: true });
});

module.exports = router;
