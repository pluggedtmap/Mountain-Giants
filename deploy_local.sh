#!/bin/bash
# Script de sauvegarde pour Mountain Giants
# Usage: ./deploy_local.sh "Message du commit"

MSG="$1"
if [ -z "$MSG" ]; then
  MSG="🚀 Sauvegarde Mountain Giants"
fi

echo "📦 git add/commit/push sur GitHub (MGBESAVE)..."
git add -A
git commit -m "$MSG"
git push origin main || git push origin master

echo ""
echo "🔥 SAUVEGARDE TERMINEE LOCALEMENT ! 🔥"
echo "---------------------------------------------------------"
echo "📋 COPIEZ-COLLEZ CETTE COMMANDE POUR METTRE A JOUR LE VPS :"
echo "---------------------------------------------------------"
echo "ssh root@168.231.109.179 -t \"cd /var/www/mountain-giants && ./scripts/vps_update.sh\""
echo "---------------------------------------------------------"
