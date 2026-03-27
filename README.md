# ApiaryHub V1 (Laravel API + React)

ApiaryHub V1 inclut:
- API REST Laravel avec auth Sanctum (token Bearer)
- Gestion des ruchers (`apiaries`) et des ruches (`hives`)
- Releves capteurs et interventions
- Meteo par ruche (`/api/hives/{id}/weather`)
- Frontend React + Leaflet
- Stack Docker locale (app + worker + MySQL + Redis + Mailpit)

## Demarrage local
Depuis la racine du projet:

```bash
cp .env.example .env
docker compose up --build -d
```

Puis ouvrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

Config Nginx locale (optionnelle):
- `deploy/nginx/apiaryhub.local.conf`

## Services Docker
- `apiaryhub-app` -> Laravel + frontend React, expose `8000`
- `apiaryhub-worker` -> worker Laravel pour les emails et jobs asynchrones
- `apiaryhub-mysql` -> MySQL 8.4
- `apiaryhub-redis` -> Redis 7
- `apiaryhub-mailpit` -> SMTP local + interface web sur [http://127.0.0.1:8025](http://127.0.0.1:8025)

## Deploiement Dokploy

Le deploiement cible est Dokploy via `docker-compose.dokploy.yml`.
Le fichier `deploy/nginx/apiaryhub.server.conf` n'est pas necessaire dans ce mode.

Variables principales a fournir dans Dokploy:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://apiaryhub.fr
APP_AUTO_SEED=false
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=apiaryhub.fr
SANCTUM_STATEFUL_DOMAINS=apiaryhub.fr,www.apiaryhub.fr
TRUSTED_PROXIES=*
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=apiaryhub
DB_USERNAME=apiaryhub
DB_PASSWORD=mot_de_passe_fort
MYSQL_ROOT_PASSWORD=mot_de_passe_root_fort
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
MAIL_QUEUE=mail
QUEUE_WORKER_QUEUE=mail,default
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379
```

Note importante:
- la stack Docker utilise toujours MySQL et Redis dans les conteneurs, meme si ton `.env` local hors Docker est configure autrement
- en local, le compose reutilise aussi `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` pour rester compatible avec les volumes deja initialises
- si tu veux separer completement les identifiants Docker de ton `.env` local, utilise `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

DNS attendu:
- `apiaryhub.fr` -> IP publique du VPS
- `www.apiaryhub.fr` -> IP publique du VPS

Recommandations:
- utiliser des mots de passe forts (DB, root DB)
- laisser l'app uniquement derriere le proxy Dokploy
- ne pas exposer MySQL/Redis publiquement
- garder `APP_DEBUG=false`
- configurer SMTP/Brevo dans Dokploy si tu actives les emails publics
- garder `TRUSTED_PROXIES=*` uniquement dans le compose Dokploy

## Endpoints API principaux
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/resend-verification`
- `GET /api/auth/verify-email/{id}/{hash}`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET|POST|PUT|DELETE /api/apiaries...`
- `GET|POST|PUT|DELETE /api/hives...`
- `GET /api/hives/{hive}/weather`
- `GET|POST|PUT|DELETE /api/readings...`
- `GET|POST|PUT|DELETE /api/actions...`
- `GET /api/admin/dashboard` (admin uniquement)

## Flux email securite compte
- A l'inscription, un email de verification est envoye.
- Tant que l'email n'est pas verifie, la connexion reste possible mais un rappel utilisateur est affiche pour finaliser la verification.
- Le flux `mot de passe oublie` envoie un lien de reinitialisation par email.
- En local, les emails passent par Mailpit.
- Interface Mailpit: [http://127.0.0.1:8025](http://127.0.0.1:8025)

## Configuration Brevo (SMTP)
Pour envoyer les emails de verification et de reset via Brevo:

```env
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your-brevo-login
MAIL_PASSWORD=your-brevo-smtp-key
MAIL_QUEUE=mail
QUEUE_WORKER_QUEUE=mail,default
MAIL_FROM_ADDRESS=noreply@apiaryhub.fr
MAIL_FROM_NAME=ApiaryHub
APP_URL=https://apiaryhub.fr
```

Notes:
- `MAIL_PASSWORD` doit etre la cle SMTP Brevo (pas ton mot de passe de connexion Brevo).
- `MAIL_FROM_ADDRESS` doit etre une adresse expediteur validee dans Brevo.
- `APP_URL` doit pointer vers l'URL publique de ton application pour que les liens email soient corrects.
- Apres modification des variables: `docker compose up -d --build app worker`.
