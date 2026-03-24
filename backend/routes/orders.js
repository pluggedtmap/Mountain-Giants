const express = require('express');
const { loadData, saveData } = require('../db');
const { verifyAdmin } = require('../middleware/auth');
const { publicLimiter } = require('../middleware/security');

const router = express.Router();

// Create order (public)
router.post('/', publicLimiter, (req, res) => {
    const orderData = req.body;
    if (!orderData || !orderData.items) return res.status(400).json({ success: false });

    const db = loadData();
    if (!db.orders) db.orders = [];

    // Check minimum order amount
    try {
        const fs = require('fs');
        const path = require('path');
        const settingsPath = path.join(__dirname, '../data/settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const minAmount = settings.minOrderAmount || 0;
        if (orderData.total < minAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum de commande : ${minAmount}€` 
            });
        }
    } catch (e) { console.error("Error checking minAmount", e); }

    orderData.id = Date.now();
    db.orders.push(orderData);

    if (db.orders.length > 100) db.orders.shift();

    saveData(db);
    res.json({ success: true, orderId: orderData.id });
});

// Get all orders (admin)
router.get('/', verifyAdmin, (req, res) => {
    const db = loadData();
    const reversed = [...(db.orders || [])].reverse();
    res.json({ success: true, data: reversed });
});

// Delete single order
router.delete('/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = loadData();
    if (!db.orders) return res.status(404).json({ success: false });

    const initLen = db.orders.length;
    db.orders = db.orders.filter(o => o.id.toString() !== id.toString());

    if (db.orders.length === initLen) return res.json({ success: false, message: "Commande introuvable" });

    saveData(db);
    res.json({ success: true });
});

// Delete all orders
router.delete('/', verifyAdmin, (req, res) => {
    const db = loadData();
    db.orders = [];
    saveData(db);
    res.json({ success: true });
});

module.exports = router;
