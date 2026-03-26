#!/bin/bash
# Script de mise à jour SUR LE VPS (Mountain Giants)
# Ce script doit rester dans /scripts/vps_update.sh

PROJECT_ROOT="/var/www/mountain-giants"

echo "📂 Passage dans $PROJECT_ROOT"
cd "$PROJECT_ROOT" || exit 1

echo "⬇️  Pulling latest changes from MGBESAVE..."
git pull origin main || git pull origin master

echo "🛠️  Installing nodes_modules..."
npm install --production

echo "🔄 Restarting application with PM2..."
pm2 restart mountain-giants || pm2 start server.js --name mountain-giants

echo "✅ VPS mis à jour avec succès !"
