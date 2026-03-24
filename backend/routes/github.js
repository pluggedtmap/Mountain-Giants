const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const https = require('https');
const { execFile } = require('child_process');
const { loadData } = require('../db');
const { verifyAdmin } = require('../middleware/auth');
const {
    GH_TOKEN, GH_OWNER, GH_REPO, GH_BRANCH,
    GH_UPLOAD_DIR, GH_UPLOAD_TOKEN, GH_UPLOAD_REPO,
    UPLOAD_DIR, UPLOAD_MAX_SIZE, ALLOWED_FILE_TYPES
} = require('../config');
const { publicLimiter } = require('../middleware/security');

// --- PATH SAFETY ---
function safePath(filePath) {
    const resolved = path.resolve(filePath);
    const uploadBase = path.resolve(UPLOAD_DIR);
    if (!resolved.startsWith(uploadBase + path.sep) && resolved !== uploadBase) {
        throw new Error('Path traversal détecté');
    }
    return resolved;
}

const router = express.Router();

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'hf-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: UPLOAD_MAX_SIZE },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_FILE_TYPES.test(ext)) {
            return cb(null, true);
        }
        cb(new Error('Format non autorisé (Images ou Vidéos uniquement)'));
    }
});

// --- GITHUB API HELPER ---
function githubRequest(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const db = loadData();
        const settings = db.settings.github || {};

        const token = (settings.token || GH_UPLOAD_TOKEN || GH_TOKEN || '').trim();
        const owner = settings.owner || GH_OWNER;
        const repo = (endpoint.includes('/contents/') && !endpoint.includes('data.json'))
            ? (settings.repo || GH_UPLOAD_REPO)
            : (settings.repo || GH_REPO);

        console.log(`[GitHub Debug] Uploading to: ${owner}/${repo} (Token starts with ${token ? token.substring(0, 4) : 'NULL'})`);

        if (!token) return reject(new Error('GITHUB_TOKEN manquant (Admin > Réglages ou .env)'));

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}${endpoint}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Mountain Giants-App',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            const bodyStr = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
            console.log(`[GitHub Req] ${method} ${endpoint} (Size: ${options.headers['Content-Length']})`);

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
                    } else {
                        console.error(`[GitHub Error] ${res.statusCode}: ${data}`);
                        reject(new Error(`GitHub Error ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.write(bodyStr);
            req.end();
        } else {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
                    } else {
                        reject(new Error(`GitHub Error ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.end();
        }
    });
}

// --- UPLOAD HANDLER ---
const handleGithubUpload = async (req, res) => {
    console.log("UPLOAD_HIT", req.path, req.file?.filename);
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    const db = loadData();
    const settings = db.settings.github || {};

    let filePath = safePath(req.file.path);
    let fileName = req.file.filename;
    let fileExt = path.extname(fileName).toLowerCase();
    let cleanupFiles = [filePath];

    try {
        // Video conversion (.mov → .mp4)
        if (fileExt === '.mov' || fileExt === '.qt' || (fileExt !== '.mp4' && fileExt.match(/\.(avi|mkv|flv|wmv)$/i))) {
            console.log(`[Conversion] Detected ${fileExt} video. Converting to .mp4...`);
            const newFileName = fileName.replace(fileExt, '.mp4');
            const newFilePath = safePath(path.join(path.dirname(filePath), newFileName));

            await new Promise((resolve, reject) => {
                // Use execFile (no shell) to prevent command injection
                execFile('ffmpeg', [
                    '-i', filePath,
                    '-vcodec', 'libx264', '-preset', 'ultrafast',
                    '-crf', '28', '-acodec', 'aac',
                    '-movflags', '+faststart', newFilePath
                ], (error) => {
                    if (error) {
                        console.error(`[Conversion Error] ${error.message}`);
                        return reject(error);
                    }
                    resolve();
                });
            });

            filePath = newFilePath;
            fileName = newFileName;
            cleanupFiles.push(newFilePath);
            console.log(`[Conversion] Success: ${fileName}`);
        }

        const content = fs.readFileSync(safePath(filePath), { encoding: 'base64' });
        const pathInRepo = `${GH_UPLOAD_DIR}/${fileName}`;

        const body = {
            message: `Upload ${fileName} via Admin`,
            content: content,
            branch: GH_BRANCH
        };

        const result = await githubRequest(`/contents/${pathInRepo}`, 'PUT', body);

        // Cleanup local files
        cleanupFiles.forEach(f => { const sf = safePath(f); if (fs.existsSync(sf)) fs.unlinkSync(sf); });

        const rawUrl = `https://raw.githubusercontent.com/${settings.owner || GH_OWNER}/${settings.repo || GH_UPLOAD_REPO}/${GH_BRANCH}/${pathInRepo}`;
        res.json({ success: true, url: rawUrl, githubData: result });
    } catch (e) {
        console.error("Upload Error", e);
        cleanupFiles.forEach(f => { try { const sf = safePath(f); if (fs.existsSync(sf)) fs.unlinkSync(sf); } catch(_) {} });
        res.status(500).json({ success: false, message: e.message });
    }
};

// Upload routes
router.post('/upload-github', verifyAdmin, publicLimiter, upload.single('file'), handleGithubUpload);
router.post('/upload', verifyAdmin, publicLimiter, upload.single('file'), handleGithubUpload); // Legacy alias

// List GitHub files
router.get('/github-files', verifyAdmin, async (req, res) => {
    try {
        const files = await githubRequest(`/contents/${GH_UPLOAD_DIR}`);
        const db = loadData();
        const settings = db.settings.github || {};

        const cleanList = Array.isArray(files) ? files.map(f => ({
            name: f.name,
            path: f.path,
            sha: f.sha,
            url: f.download_url,
            raw_url: `https://raw.githubusercontent.com/${settings.owner || GH_OWNER}/${settings.repo || GH_UPLOAD_REPO}/${GH_BRANCH}/${f.path}`
        })) : [];
        res.json({ success: true, data: cleanList });
    } catch (e) {
        if (e.message.includes('404')) return res.json({ success: true, data: [] });
        res.status(500).json({ success: false, message: e.message });
    }
});

// Delete GitHub file
router.post('/github-delete', verifyAdmin, async (req, res) => {
    const { path: filePath, sha } = req.body;
    if (!filePath || !sha) return res.status(400).json({ success: false, message: "Path et SHA requis" });

    try {
        const body = {
            message: `Delete ${filePath} via Admin`,
            sha: sha,
            branch: GH_BRANCH
        };
        await githubRequest(`/contents/${filePath}`, 'DELETE', body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
