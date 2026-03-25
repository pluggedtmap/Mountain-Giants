require('dotenv').config();
const path = require('path');

// --- SERVER ---
const PORT = process.env.PORT || 3018;

// --- DATABASE ---
const DATA_FILE = path.join(__dirname, 'data', 'data.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// --- JWT ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('⚠️  FATAL: JWT_SECRET manquant dans .env');
    process.exit(1);
}
const JWT_EXPIRY = '24h';

// --- GITHUB CONFIG (For Sync/Save) ---
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const GH_OWNER = process.env.GITHUB_OWNER || 'pluggedtmap';
const GH_REPO = process.env.GITHUB_REPO || 'Cryptogaz-save';
const GH_BRANCH = 'main';
const GH_UPLOAD_DIR = 'upload';

// --- GITHUB UPLOAD CONFIG (Separate Repo) ---
const GH_UPLOAD_TOKEN = process.env.GITHUB_UPLOAD_TOKEN || '';
const GH_UPLOAD_REPO = process.env.GITHUB_UPLOAD_REPO || 'Mountain-Giants';

// --- CORS ---
const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const ALLOWED_ORIGINS = [
    'https://fullterexotique.online',
    'https://www.fullterexotique.online',
    'http://localhost:3000',
    'http://localhost:3018',
    ...envOrigins
];

// --- UPLOAD ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const UPLOAD_MAX_SIZE = 95 * 1024 * 1024; // 95MB (GitHub API limit is 100MB)
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|webp|mp4|webm|mov|qt/;

module.exports = {
    PORT,
    DATA_FILE,
    ORDERS_FILE,
    JWT_SECRET,
    JWT_EXPIRY,
    GH_TOKEN,
    GH_OWNER,
    GH_REPO,
    GH_BRANCH,
    GH_UPLOAD_DIR,
    GH_UPLOAD_TOKEN,
    GH_UPLOAD_REPO,
    ALLOWED_ORIGINS,
    UPLOAD_DIR,
    UPLOAD_MAX_SIZE,
    ALLOWED_FILE_TYPES
};
