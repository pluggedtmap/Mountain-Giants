#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   Mountain Giants - DÉMARRAGE LOCAL       ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Se placer dans le dossier du projet (parent du dossier scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR/backend" || { echo -e "${RED}Impossible d'accéder au dossier backend${NC}"; exit 1; }
echo -e "${GREEN}Dossier backend : $(pwd)${NC}"

# 1. Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERREUR: Node.js n'est pas installé.${NC}"
    echo "Installer avec : sudo apt install nodejs npm"
    echo "Appuyez sur Entrée pour fermer."
    read -r
    exit 1
fi
echo -e "${GREEN}Node.js $(node -v) détecté.${NC}"

# 2. Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Fichier .env manquant !${NC}"
    echo -e "${YELLOW}  Vous devez créer un fichier .env dans le dossier backend avec :${NC}"
    echo -e "${YELLOW}  GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, JWT_SECRET, et PORT=3018${NC}"
    echo ""
else
    echo -e "${GREEN}.env présent.${NC}"
fi

# 3. Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Dossier node_modules manquant. Installation...${NC}"

    if command -v npm &> /dev/null; then
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Erreur lors de l'installation des dépendances.${NC}"
            echo "Appuyez sur Entrée pour fermer."
            read -r
            exit 1
        fi
    else
        echo -e "${RED}ERREUR: npm est introuvable.${NC}"
        echo "Installer avec : sudo apt install nodejs npm"
        echo "Appuyez sur Entrée pour fermer."
        read -r
        exit 1
    fi
else
    echo -e "${GREEN}Dépendances présentes.${NC}"
fi

# 4. Démarrer le serveur
echo ""
echo -e "${BLUE}Lancement du serveur...${NC}"
echo -e "${GREEN}Le site sera accessible sur : http://localhost:3018${NC}"
echo -e "${GREEN}Admin : http://localhost:3018/admin.html${NC}"
echo ""

node server.js

# Empêcher la fenêtre de se fermer
echo ""
echo -e "${BLUE}Serveur arrêté. Appuyez sur Entrée pour fermer.${NC}"
read -r
