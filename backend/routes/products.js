const express = require('express');
const { loadData, saveData } = require('../db');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', (req, res) => {
    const db = loadData();
    const sorted = Object.values(db.products).sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, data: sorted });
});

// Create/Update product
router.post('/', verifyAdmin, (req, res) => {
    const prod = req.body;
    if (!prod.id) return res.status(400).json({ success: false });

    const db = loadData();

    if (!db.products[prod.id]) {
        const minOrder = Math.min(...Object.values(db.products).map(p => p.order || 0), 0);
        prod.order = minOrder - 1;
    } else {
        prod.order = db.products[prod.id].order;
    }

    db.products[prod.id] = prod;
    saveData(db);
    res.json({ success: true });
});

// Reorder products
router.post('/reorder', verifyAdmin, (req, res) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ success: false });

    const db = loadData();
    productIds.forEach((id, index) => {
        if (db.products[id]) {
            db.products[id].order = index;
        }
    });
    saveData(db);
    res.json({ success: true });
});

// Delete product
router.delete('/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = loadData();
    delete db.products[id];
    saveData(db);
    res.json({ success: true });
});

module.exports = router;
