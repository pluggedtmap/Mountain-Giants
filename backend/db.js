const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DATA_FILE, ORDERS_FILE } = require('./config');
const path = require('path');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function loadData() {
    let data = { admin: {}, settings: {}, products: {}, orders: [] };

    // Load Core Data (Products, Settings)
    if (fs.existsSync(DATA_FILE)) {
        try {
            const loaded = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            data = { ...data, ...loaded };
        } catch (e) {
            console.error("ERREUR LECTURE DATA.JSON:", e);
        }
    }

    // Load Orders Separately
    if (fs.existsSync(ORDERS_FILE)) {
        try {
            data.orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        } catch (e) {
            console.error("ERREUR LECTURE ORDERS.JSON:", e);
            data.orders = [];
        }
    }

    // Ensure structure integrity
    if (!data.admin) data.admin = {};
    if (!data.admin.passwordHash) {
        // Initial password is 'adminMGBE' - SHOULD BE CHANGED IMMEDIATELY
        const initialPass = process.env.INITIAL_ADMIN_PASSWORD || 'adminMGBE';
        const salt = bcrypt.genSaltSync(10);
        data.admin.passwordHash = bcrypt.hashSync(initialPass, salt);
    }
    if (!data.settings) data.settings = {};
    if (!data.settings.categories) data.settings.categories = ['WEED', 'HASH', 'VAPE', 'AUTRE'];
    if (!data.settings.bannerText) data.settings.bannerText = "Bienvenue Chez Mountain Giants ! Premium Dispensary in Belgium !";
    if (!data.products) data.products = {};

    // Initialize order if missing
    Object.values(data.products).forEach((p, index) => {
        if (typeof p.order === 'undefined') p.order = index;
    });

    if (!data.settings.contact) {
        data.settings.contact = {
            telegramPrivate: "https://t.me/MGBELGIUM",
            telegramChannel: "",
            instagram: "https://www.instagram.com/mgbelgium_?igsh=YjJnNjcxNGg0MG5q",
            signal: "https://signal.me/#eu/KLe61c2AX0CDPUtqAAeH7tdaQCZbhiUczbUMQUhOF-4DvmD0DZJMrrpr9nVLUaPu",
            whatsapp: ""
        };
    }
    if (!data.settings.github) data.settings.github = {};
    
    let structureUpdated = false;
    if (!data.settings.nextOrderNumber) {
        data.settings.nextOrderNumber = 1001;
        structureUpdated = true;
    }
    if (!data.orders) {
        data.orders = [];
        structureUpdated = true;
    }

    // Save back if we had to fix it or it doesn't exist
    if (structureUpdated || !fs.existsSync(DATA_FILE)) saveData(data);

    return data;
}

function saveData(data) {
    // 1. Save Orders to orders.json
    try {
        const orders = data.orders || [];
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    } catch (e) { console.error("ERREUR ECRITURE ORDERS.JSON", e); }

    // 2. Save Rest to data.json (excluding orders)
    try {
        // Save orders separately
        if (data.orders) {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(data.orders, null, 2));
        }
        
        // Create a copy without orders for data.json
        const dataToSave = { ...data };
        delete dataToSave.orders;
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (e) { console.error("ERREUR ECRITURE DATA.JSON", e); }
}

// Ensure DB init on first load
loadData();

module.exports = { loadData, saveData };
