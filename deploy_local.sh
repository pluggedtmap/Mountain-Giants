#!/bin/bash

# Script de mise à jour locale (Push vers GitHub)
echo "📦 Analyse des changements..."
git add .

# Demande un message de commit (ou en utilise un par défaut)
COMMIT_MSG=${1:-"Update: fix order count and telegram mobile links"}

echo "💾 Création du commit : $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "📤 Envoi vers GitHub (branche main)..."
git push origin main

echo "✅ Terminé localement ! Vous pouvez maintenant lancer la commande de mise à jour sur votre VPS."
