# Coolify — Deployer un nouveau site

Guide technique pour mettre en place un nouveau site/application sur une instance Coolify deja operationnelle.

---

## 1. Creer un projet

Un **Projet** dans Coolify est un conteneur logique qui regroupe les ressources liees a une meme application (frontend, backend, base de donnees, etc.).

1. Menu lateral → **Projects** → **+ Add**
2. Donner un nom (ex. `todo-app`, `portfolio`, `api-client`)
3. Un projet peut contenir plusieurs **Environments** (production, staging, dev)
   - Par defaut : un seul environment `production`
   - Pour ajouter un env : dans le projet → **+ Add Environment**
4. Cliquer sur l'environment pour y ajouter des ressources

---

## 2. Ajouter une ressource

Dans un environment, cliquer **+ Add New Resource**. Coolify propose plusieurs types :

| Type | Usage |
|---|---|
| **Application** | Site web, API, app Node/Python/Go/etc. |
| **Database** | PostgreSQL, MySQL, MariaDB, MongoDB, Redis |
| **Service** | Services preconfigures (Plausible, Gitea, WordPress, etc.) |

---

## 3. Deployer une Application

### 3.1 Choisir la source

| Source | Quand l'utiliser |
|---|---|
| **GitHub App** | Repo GitHub (recommande — auto-deploy via webhook) |
| **GitHub (PAT)** | Repo GitHub via Personal Access Token |
| **GitLab** | Repo GitLab |
| **Bitbucket** | Repo Bitbucket |
| **Public Repository** | Repo public sans authentification |
| **Docker Image** | Image deja construite sur Docker Hub / GHCR |
| **Docker Compose** | Deployer un fichier `docker-compose.yml` complet |

### 3.2 Configurer le repo (si source Git)

| Champ | Description |
|---|---|
| **Repository** | Selectionner le repo |
| **Branch** | Branche a deployer (`main`, `master`, `production`) |
| **Root Directory** | Sous-dossier du repo si monorepo (ex. `frontend`, `backend`) |
| **Build Pack** | Comment Coolify construit l'image (voir section 4) |

---

## 4. Build Packs — Comment Coolify construit votre app

### 4.1 Nixpacks (par defaut)

- **Quoi** : detection automatique du langage/framework, genere un Dockerfile en interne
- **Quand l'utiliser** : projets standards (Node.js, Python, Go, Rust, PHP, Ruby, etc.)
- **Avantage** : zero config, Coolify detecte `package.json`, `requirements.txt`, `go.mod`, etc.
- **Custom** : on peut ajouter des variables dans **Build Settings** :
  - `NIXPACKS_BUILD_CMD` : override la commande de build
  - `NIXPACKS_START_CMD` : override la commande de demarrage
  - `NIXPACKS_PKGS` : paquets systeme supplementaires

```
Exemple : projet Next.js
Coolify detecte package.json → installe Node → run build → start
Aucune config necessaire.
```

### 4.2 Dockerfile

- **Quoi** : Coolify utilise un `Dockerfile` present dans le repo
- **Quand l'utiliser** : besoin de controle fin sur le build (multi-stage, deps systeme specifiques, etc.)
- **Config** :
  - **Dockerfile Location** : chemin relatif au root directory (defaut : `Dockerfile`)
  - Les build args et variables d'env sont injectes automatiquement

```
Exemple : monorepo avec backend/Dockerfile
Root Directory = backend
Build Pack = Dockerfile
Coolify build depuis backend/Dockerfile
```

### 4.3 Docker Compose

- **Quoi** : deploie un fichier `docker-compose.yml` tel quel
- **Quand l'utiliser** :
  - Application multi-conteneurs dans un seul fichier (app + db + redis + worker)
  - Migration d'un setup Docker Compose existant
  - Besoin de networks/volumes partages entre services
- **Config** :
  - **Docker Compose Location** : chemin du fichier (defaut : `docker-compose.yml`)
  - Les services du compose deviennent des conteneurs dans Coolify
  - Definir quel service est le "principal" (celui qui recoit le domaine/port)

```yaml
# Exemple : docker-compose.yml pour une app full-stack
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/app
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 4.4 Docker Image

- **Quoi** : pull et run une image Docker deja construite
- **Quand l'utiliser** : image pre-built sur Docker Hub, GHCR, ou registry prive
- **Config** :
  - **Image** : `nginx:alpine`, `ghcr.io/user/app:latest`, etc.
  - **Registry** : Docker Hub (defaut), ou ajouter un registry custom dans Settings

### Comparatif rapide

| Critere | Nixpacks | Dockerfile | Docker Compose | Docker Image |
|---|---|---|---|---|
| Config necessaire | Aucune | Ecrire un Dockerfile | Ecrire un compose.yml | Aucune |
| Controle du build | Faible | Total | Total | N/A (pre-built) |
| Multi-service | Non | Non | Oui | Non |
| Ideal pour | Prototypes, projets standards | Prod, builds custom | Apps multi-containers | Services tiers, images pre-built |

---

## 5. Configuration de l'application

### 5.1 General

| Champ | Description |
|---|---|
| **Name** | Nom affiche dans Coolify |
| **Domain** | Domaine(s) associe(s) — ex. `app.mondomaine.fr` |
| **Port** | Port expose par le conteneur (3000, 8080, etc.) |

### 5.2 Environment Variables

- Onglet **Environment Variables** dans la ressource
- Ajouter les variables une par une ou coller en bulk (format `KEY=value`)
- Option **Build Variable** : disponible uniquement au build (ex. `NEXT_PUBLIC_API_URL`)
- Option **Preview** : uniquement pour les deployments de preview (pull requests)
- Les variables sont injectees dans le conteneur au runtime

### 5.3 Build Settings

| Champ | Description |
|---|---|
| **Base Directory** | Racine du projet dans le repo |
| **Build Command** | Override (sinon detecte par Nixpacks ou Dockerfile) |
| **Install Command** | Override la commande d'install des deps |
| **Start Command** | Override la commande de demarrage |

### 5.4 Network

- **Ports Exposes** : mapper les ports du conteneur vers l'exterieur
- Par defaut Coolify gere Traefik pour le routing HTTP/HTTPS
- Les services dans le meme projet partagent un reseau Docker interne
  → un backend peut appeler `http://db:5432` sans exposer le port publiquement

### 5.5 Persistent Storage (Volumes)

- Onglet **Storages** → **+ Add**
- Definir le chemin dans le conteneur (ex. `/data`, `/var/lib/postgresql/data`)
- Coolify cree un volume Docker nomme automatiquement
- Les donnees persistent entre les redeployments

---

## 6. Domaines et HTTPS

### 6.1 Pointer le DNS

Chez ton registrar (OVH, Cloudflare, Gandi...) :

```
Type    Nom                  Valeur
A       app.mondomaine.fr    <IP_DU_VPS>
A       api.mondomaine.fr    <IP_DU_VPS>
```

Ou avec un wildcard :
```
A       *.mondomaine.fr      <IP_DU_VPS>
```

### 6.2 Configurer dans Coolify

1. Dans la ressource → champ **Domain** → saisir `https://app.mondomaine.fr`
2. Coolify configure automatiquement Traefik + Let's Encrypt
3. Le certificat SSL est genere et renouvele automatiquement
4. Pour plusieurs domaines : separer par des virgules
   ```
   https://app.mondomaine.fr, https://www.app.mondomaine.fr
   ```

### 6.3 Redirection www

Coolify gere la redirection automatiquement si les deux domaines (avec et sans www) sont ajoutes.

---

## 7. Deploiement automatique (CI/CD)

### 7.1 Auto Deploy (recommande)

Dans la ressource → onglet **General** → activer **Auto Deploy**

Chaque push sur la branche configuree declenche un redeploiement automatique.
Coolify installe automatiquement le webhook sur GitHub via la GitHub App.

### 7.2 Webhook manuel

Si la GitHub App n'est pas utilisee :
1. Ressource → **Webhooks** → copier l'URL
2. GitHub → repo → **Settings** → **Webhooks** → **Add webhook**
   - Payload URL : URL copiee
   - Content type : `application/json`
   - Secret : fourni par Coolify
   - Events : `Push events`

### 7.3 Preview Deployments (Pull Requests)

- Activer dans la ressource → **Preview Deployments**
- Chaque PR ouverte genere un deploiement temporaire avec une URL unique
- Le deploiement est supprime automatiquement a la fermeture de la PR

---

## 8. Bases de donnees

### 8.1 Creer une base

1. Projet → Environment → **+ Add New Resource** → **Database**
2. Choisir le moteur : PostgreSQL, MySQL, MariaDB, MongoDB, Redis, etc.
3. Coolify genere automatiquement :
   - User / Password / Database name
   - **Internal URL** : accessible uniquement par les autres services du projet
   - **Public URL** : optionnelle, a activer si besoin d'acces externe

### 8.2 Connexion depuis une app

Utiliser l'**Internal URL** generee par Coolify dans les variables d'env de l'app :

```
DATABASE_URL=postgresql://USER:PASSWORD@nom-du-service:5432/nom_db
```

Le `nom-du-service` est le nom Docker du conteneur (visible dans Coolify).

### 8.3 Backups

- Onglet **Backups** dans la ressource database
- Configurer une frequence (toutes les heures, tous les jours, etc.)
- Destination : locale ou S3-compatible (Minio, AWS S3, Backblaze B2)

---

## 9. Cas courants

### Site statique (HTML/CSS/JS)

```
Source : GitHub repo
Build Pack : Nixpacks ou Dockerfile
Si Nixpacks : Coolify detecte et sert avec un serveur statique
Si Dockerfile :
  FROM nginx:alpine
  COPY . /usr/share/nginx/html
  EXPOSE 80
Port : 80
```

### API Node.js (Express / NestJS / Fastify)

```
Source : GitHub repo
Build Pack : Nixpacks (auto-detect package.json)
Port : celui defini dans votre app (3001, 8080, etc.)
Env vars : DATABASE_URL, JWT_SECRET, etc.
```

### Next.js / Nuxt.js

```
Source : GitHub repo
Build Pack : Nixpacks (detecte automatiquement)
Port : 3000
Si monorepo : Root Directory = frontend
Build vars : NEXT_PUBLIC_API_URL=https://api.mondomaine.fr
```

### WordPress

```
Source : ne pas utiliser un repo
Type : Service → WordPress (preconfigure)
Coolify installe WordPress + MySQL automatiquement
Configurer le domaine + HTTPS
```

### App multi-services (monorepo)

Creer **une ressource par service** dans le meme projet :

```
Projet: todo-app
├── Resource 1 : PostgreSQL (Database)
├── Resource 2 : Backend (Application, Root Dir: backend, Port: 3001)
└── Resource 3 : Frontend (Application, Root Dir: frontend, Port: 3000)
```

Chaque service a ses propres env vars, domaine, et build settings.
Ils partagent le meme reseau Docker interne.

---

## 10. Checklist nouveau site

- [ ] DNS : enregistrement A pointant sur l'IP du VPS
- [ ] Projet cree dans Coolify
- [ ] Source connectee (GitHub App ou PAT)
- [ ] Build Pack choisi (Nixpacks / Dockerfile / Compose)
- [ ] Root Directory configure (si monorepo)
- [ ] Port correct
- [ ] Variables d'environnement renseignees
- [ ] Domaine configure avec `https://`
- [ ] Premier deploy lance et reussi (verifier les logs)
- [ ] Auto Deploy active
- [ ] Backups DB configures (si applicable)
- [ ] Certificat SSL actif (verifier le cadenas dans le navigateur)
