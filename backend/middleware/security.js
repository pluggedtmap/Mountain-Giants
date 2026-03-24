const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ALLOWED_ORIGINS } = require('../config');

// --- HELMET (Security Headers) ---
const helmetMiddleware = helmet({
    contentSecurityPolicy: false, // Disabled: inline scripts in admin.html/index.html
    crossOriginEmbedderPolicy: false // Needed for GitHub-hosted media
});

// --- CORS ---
const corsMiddleware = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, same-origin)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
});

// --- FORBIDDEN PATHS ---
function forbiddenPaths(req, res, next) {
    const forbidden = ['.env', '.sqlite', 'package.json', 'ecosystem.config.js', 'server.js', 'data.json', 'orders.json', '.bat', '.sh', '.git'];
    const p = req.path.toLowerCase();
    if (forbidden.some(f => p.includes(f))) {
        return res.status(403).send('Forbidden');
    }
    next();
}

// --- RATE LIMITERS ---
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Trop de tentatives." }
});

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Trop de requêtes, calmez-vous." }
});

// --- REQUEST LOGGER ---
function requestLogger(req, res, next) {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
}

module.exports = {
    helmetMiddleware,
    corsMiddleware,
    forbiddenPaths,
    loginLimiter,
    publicLimiter,
    requestLogger
};
