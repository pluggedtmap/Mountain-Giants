# Utiliser une image Node.js légère et sécurisée (Alpine Linux)
FROM node:18-alpine

# Dossier global pour l'application
WORKDIR /app

# Copier et installer les dépendances du backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copier le reste du code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Se placer dans le dossier backend pour le runtime
WORKDIR /app/backend

# Créer les dossiers pour les volumes
RUN mkdir -p data uploads

# Exposer le port (doit correspondre au port dans server.js)
EXPOSE 3018

# Définir l'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "server.js"]
