# ApiaryHub V1 (Laravel API + React)

ApiaryHub V1 inclut:
- API REST Laravel avec auth Sanctum (token Bearer)
- Gestion des ruchers (`apiaries`) et des ruches (`hives`)
- Releves capteurs et interventions
- Meteo par ruche (`/api/hives/{id}/weather`)
- Frontend React + Leaflet
- Stack Docker (app + MySQL + Redis)

## Demarrage local
Depuis la racine du projet:

```bash
docker compose up --build -d
```

Puis ouvrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

Config Nginx locale (optionnelle):
- `deploy/nginx/apiaryhub.local.conf`

## Credentials demo
- email: `demo@apiaryhub.local`
- password: `password123`

## Credentials admin
- email: `gastonolonde@gmail.com`
- password: `password123`

## Services Docker
- `apiaryhub-app` -> Laravel + frontend React, expose `8000`
- `apiaryhub-mysql` -> MySQL 8.4
- `apiaryhub-redis` -> Redis 7

## Mise en production sur `apiaryhub.fr` (Ubuntu VPS)

### 1) Prerequis serveur

Installer Docker Engine + Compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Installer Nginx + Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Verifier:

```bash
docker --version
docker compose version
nginx -v
certbot --version
```

### 2) DNS

Creer des enregistrements `A`:
- `apiaryhub.fr` -> IP publique du VPS
- `www.apiaryhub.fr` -> IP publique du VPS

Validation:

```bash
dig +short apiaryhub.fr
```

### 3) Configuration applicative Docker/Laravel

Dans `docker-compose.yml`, configurer le service `app` en mode production:

```yaml
environment:
  APP_ENV: production
  APP_DEBUG: "false"
  APP_URL: https://apiaryhub.fr
  APP_AUTO_SEED: "false"
  SESSION_SECURE_COOKIE: "true"
  SESSION_DOMAIN: apiaryhub.fr
  SANCTUM_STATEFUL_DOMAINS: apiaryhub.fr,www.apiaryhub.fr
  DB_CONNECTION: mysql
  DB_HOST: mysql
  DB_PORT: 3306
  DB_DATABASE: apiaryhub
  DB_USERNAME: apiaryhub
  DB_PASSWORD: "mot_de_passe_fort"
  MYSQL_ROOT_PASSWORD: "mot_de_passe_root_fort"
  CACHE_STORE: redis
  SESSION_DRIVER: redis
  QUEUE_CONNECTION: redis
  REDIS_CLIENT: phpredis
  REDIS_HOST: redis
  REDIS_PORT: 6379
```

Recommandations:
- utiliser des mots de passe forts (DB, root DB)
- ne pas exposer MySQL/Redis publiquement en prod
- garder `APP_DEBUG=false`

### 4) Configuration Nginx serveur

Fichier serveur:
- `deploy/nginx/apiaryhub.server.conf`

Installation:

```bash
cd ~/ApiaryHub
sudo cp deploy/nginx/apiaryhub.server.conf /etc/nginx/conf.d/apiaryhub.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 5) Certificat TLS Let’s Encrypt

```bash
sudo certbot --nginx -d apiaryhub.fr -d www.apiaryhub.fr --redirect
```

### 6) Lancement en production

```bash
cd ~/ApiaryHub
docker compose up --build -d
docker compose ps
docker compose logs --tail=100
```

### 7) Commandes utiles de maintenance

```bash
# Redemarrer les services
docker compose restart

# Voir les logs en continu
docker compose logs -f

# Mettre a jour le code puis reconstruire
git pull
docker compose up --build -d

# Etat certificat
sudo certbot certificates
```

## Endpoints API principaux
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|POST|PUT|DELETE /api/apiaries...`
- `GET|POST|PUT|DELETE /api/hives...`
- `GET /api/hives/{hive}/weather`
- `GET|POST|PUT|DELETE /api/readings...`
- `GET|POST|PUT|DELETE /api/actions...`
- `GET /api/admin/dashboard` (admin uniquement)
