#!/bin/bash
# Script à exécuter UNE SEULE FOIS lors de l'installation initiale sur le VPS

PERSISTENT_ROOT="/var/www/mg-persistent"
APP_ROOT="/var/www/mountain-giants"

echo "📂 Création de la structure persistante dans $PERSISTENT_ROOT..."
mkdir -p "$PERSISTENT_ROOT/data"
mkdir -p "$PERSISTENT_ROOT/uploads"

echo "💾 Migration des données initiales (si présentes)..."
if [ -d "$APP_ROOT/backend/data" ]; then
    cp -r "$APP_ROOT/backend/data/"* "$PERSISTENT_ROOT/data/" 2>/dev/null
    rm -rf "$APP_ROOT/backend/data"
fi

if [ -d "$APP_ROOT/backend/uploads" ]; then
    cp -r "$APP_ROOT/backend/uploads/"* "$PERSISTENT_ROOT/uploads/" 2>/dev/null
    rm -rf "$APP_ROOT/backend/uploads"
fi

echo "🔗 Création des liens symboliques..."
ln -sf "$PERSISTENT_ROOT/data" "$APP_ROOT/backend/data"
ln -sf "$PERSISTENT_ROOT/uploads" "$APP_ROOT/backend/uploads"

echo "✅ Persistance configurée !"
echo "⚠️  Vos données sont maintenant dans $PERSISTENT_ROOT et ne seront pas écrasées par 'git pull'."
