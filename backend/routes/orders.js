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
    const settings = db.settings || {};
    const minAmount = settings.minOrderAmount || 0;
    if (orderData.total < minAmount) {
        return res.status(400).json({ 
            success: false, 
            message: `Minimum de commande : ${minAmount}€` 
        });
    }

    // Set Order Number
    const orderNum = settings.nextOrderNumber || 1001;
    orderData.orderNumber = `MG-${orderNum}`;
    settings.nextOrderNumber = orderNum + 1;

    orderData.id = Date.now();
    db.orders.push(orderData);

    if (db.orders.length > 500) db.orders.shift();

    saveData(db);
    res.json({ success: true, orderId: orderData.id, orderNumber: orderData.orderNumber });
});

// Get all orders (admin)
router.get('/', verifyAdmin, (req, res) => {
    const db = loadData();
    const orders = db.orders || [];
    const reversed = [...orders].reverse();
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
