const express = require('express');
const path = require('path');
const { PORT, UPLOAD_DIR } = require('./config');
const {
    helmetMiddleware,
    corsMiddleware,
    forbiddenPaths,
    requestLogger
} = require('./middleware/security');

// --- ROUTES ---
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const settingsRoutes = require('./routes/settings');
const githubRoutes = require('./routes/github');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(forbiddenPaths);
app.use(requestLogger);

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(UPLOAD_DIR));

// --- API ROUTES ---
app.use('/api', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', githubRoutes);

// --- FALLBACK ---
app.use((req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
    } else {
        res.status(404).end();
    }
});

// --- START ---
const server = app.listen(PORT, () => {
    console.log(`✅ Serveur Mountain Giants démarré sur http://localhost:${PORT}`);
});
server.setTimeout(10 * 60 * 1000); // 10 minutes timeout for large uploads
