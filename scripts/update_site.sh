#!/bin/bash
# Script de mise à jour sur le VPS (Modèle CryptoGaz)
# Usage: ./scripts/update_site.sh "Message du commit"

MSG="$1"
if [ -z "$MSG" ]; then
  MSG="🚀 Update site Mountain Giants"
fi

# 1. Se placer à la racine du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR" || exit 1

echo "📦 git add/commit/push..."
git add -A
git commit -m "$MSG"
git push origin main || git push origin master

echo ""
echo "☁️  Connexion VPS pour mise à jour..."
# On appelle le script vps_update.sh sur le serveur
ssh root@168.231.109.179 -t "cd /var/www/mountain-giants && ./scripts/vps_update.sh"

echo "✅ Script terminé localement."
