# Déploiement avec Coolify + GitHub

Coolify est une plateforme d'hébergement self-hosted (alternative open-source à Heroku / Railway). Ce guide couvre l'installation de Coolify sur un VPS et le déploiement de l'application Todo App depuis GitHub.

---

## 1. Prérequis

| Élément | Minimum recommandé |
|---|---|
| VPS / serveur | Ubuntu 22.04 LTS, 2 vCPU, 2 Go RAM |
| Accès | SSH root ou sudo |
| Domaine | Un domaine pointant sur l'IP du VPS (ex. `todo.mondomaine.fr`) |
| GitHub | Repo public ou accès token pour repo privé |

---

## 2. Installation de Coolify

### 2.1 Sur le VPS (via SSH)

```bash
# Se connecter au VPS
ssh root@<IP_DU_VPS>

# Lancer le script d'installation officiel
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

L'installation prend 2 à 5 minutes et installe Docker, Docker Compose, et Coolify.

### 2.2 Accéder à l'interface

Coolify expose son interface sur le port **8000** par défaut :

```
http://<IP_DU_VPS>:8000
```

Créer un compte admin lors du premier accès.

> **Conseil sécurité** : configurer un reverse proxy (Traefik, fourni par Coolify) et activer HTTPS dès que possible.

---

## 3. Connecter GitHub à Coolify

### 3.1 Créer une GitHub App (recommandé)

1. Dans Coolify → **Settings** → **Source** → **+ Add** → choisir **GitHub App**
2. Suivre le flux OAuth : Coolify crée automatiquement une GitHub App sur ton compte
3. Sélectionner les repos à autoriser (ou "All repositories")

### 3.2 Alternative : Personal Access Token

1. Sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Permissions nécessaires : `Contents: Read`, `Webhooks: Read & Write`
3. Dans Coolify → **Settings** → **Source** → **+ Add** → **GitHub** → coller le token

---

## 4. Créer les services dans Coolify

L'application est un monorepo avec 3 services :
- **PostgreSQL** (base de données)
- **Backend** (NestJS — API)
- **Frontend** (Next.js)

### 4.1 Base de données PostgreSQL

1. **Projects** → **+ New Project** → nommer le projet (ex. `todo-app`)
2. Dans le projet → **+ New Resource** → **Database** → **PostgreSQL**
3. Configurer :
   - **Name** : `todo-db`
   - **Version** : 16
   - **User / Password / Database** : noter les valeurs générées
4. Cliquer **Start** — Coolify crée le conteneur PostgreSQL

Coolify génère une **Internal URL** de connexion (accessible uniquement entre services sur le même réseau) :
```
postgresql://USER:PASSWORD@todo-db:5432/todo_db
```

### 4.2 Backend NestJS

1. **+ New Resource** → **Application** → **GitHub** → sélectionner le repo `todo-app`
2. Configuration :
   - **Branch** : `master` (ou `main`)
   - **Build Pack** : `Dockerfile` (voir section 5) ou **Nixpacks** (détection automatique)
   - **Root Directory** : `backend`
   - **Port** : `3001`
3. **Environment Variables** → ajouter :
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@todo-db:5432/todo_db
   JWT_ACCESS_SECRET=<valeur_securisee>
   JWT_REFRESH_SECRET=<valeur_securisee>
   GOOGLE_CLIENT_ID=<ton_client_id>
   GOOGLE_CLIENT_SECRET=<ton_client_secret>
   GOOGLE_CALLBACK_URL=https://api.todo.mondomaine.fr/auth/google/callback
   PORT=3001
   NODE_ENV=production
   ```
4. **Domain** : `api.todo.mondomaine.fr`
5. Cliquer **Save** puis **Deploy**

### 4.3 Frontend Next.js

1. **+ New Resource** → **Application** → **GitHub** → même repo
2. Configuration :
   - **Branch** : `master`
   - **Root Directory** : `frontend`
   - **Port** : `3000`
3. **Environment Variables** :
   ```
   NEXT_PUBLIC_API_URL=https://api.todo.mondomaine.fr
   NODE_ENV=production
   ```
4. **Domain** : `todo.mondomaine.fr`
5. Cliquer **Save** puis **Deploy**

---

## 5. Dockerfiles de production (optionnel mais recommandé)

Si Nixpacks ne fonctionne pas correctement, ajouter des Dockerfiles manuels.

### `backend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
```

### `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> Pour le standalone mode Next.js, ajouter dans `frontend/next.config.mjs` :
> ```js
> output: 'standalone'
> ```

---

## 6. Migrations Prisma au démarrage

Ajouter un script de démarrage dans le backend pour lancer les migrations automatiquement :

### `backend/start.sh`

```bash
#!/bin/sh
npx prisma migrate deploy
node dist/main
```

Dans le Dockerfile, remplacer le `CMD` final :
```dockerfile
COPY start.sh ./
RUN chmod +x start.sh
CMD ["./start.sh"]
```

---

## 7. Déploiement continu (CI/CD)

Coolify supporte les **webhooks GitHub** pour redéployer automatiquement à chaque push.

### Activer le webhook automatique

Dans chaque service Coolify :
1. Aller dans l'onglet **Webhooks**
2. Copier l'URL du webhook Coolify
3. Sur GitHub → repo → **Settings** → **Webhooks** → **Add webhook**
   - **Payload URL** : URL copiée depuis Coolify
   - **Content type** : `application/json`
   - **Events** : `Just the push event`

Ou activer directement depuis Coolify → **Settings** → **Auto Deploy** → ✅

---

## 8. HTTPS / SSL

Coolify intègre **Traefik** comme reverse proxy avec **Let's Encrypt** pour le SSL.

1. S'assurer que le domaine pointe sur l'IP du VPS (DNS A record)
2. Dans chaque service Coolify → **Domain** → activer **HTTPS**
3. Coolify génère et renouvelle le certificat automatiquement

---

## 9. Vérification du déploiement

```bash
# Vérifier les logs du backend
# Coolify → Backend service → Logs

# Tester l'API
curl https://api.todo.mondomaine.fr/api/auth/me

# Tester le frontend
open https://todo.mondomaine.fr
```

---

## 10. Récapitulatif des URLs

| Service | URL locale (dev) | URL production |
|---|---|---|
| Frontend | `http://localhost:3000` | `https://todo.mondomaine.fr` |
| Backend API | `http://localhost:3001/api` | `https://api.todo.mondomaine.fr/api` |
| PostgreSQL | `localhost:5432` | Interne Coolify uniquement |
| Coolify UI | — | `http://<IP>:8000` |

---

## Ressources

- [Documentation Coolify](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#migrate-deploy)
