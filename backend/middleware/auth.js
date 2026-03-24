const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Middleware to verify admin JWT token.
 * Expects: Authorization: Bearer <jwt_token>
 */
function verifyAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Non autorisé" });
    }

    // Support both "Bearer <token>" and raw token for backward compatibility
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded; // Attach decoded data to request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré" });
    }
}

module.exports = { verifyAdmin };
