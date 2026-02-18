# Apiaryhub V1 (Laravel API + React)

Apiaryhub V1 inclut:
- API REST Laravel avec auth Sanctum
- Gestion des ruchers (`apiaries`) et des ruches (`hives`)
- Releves capteurs et interventions
- Meteo par ruche (`/api/hives/{id}/weather`)
- Frontend React + Leaflet
- Stack Docker (app + MySQL + Redis)

## Demarrage
Depuis la racine du projet:

```bash
docker compose up --build -d
```

Puis ouvrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Credentials demo
- email: `demo@apiaryhub.local`
- password: `password123`

## Services Docker
- `apiaryhub-app` -> Laravel + frontend React, expose `8000`
- `apiaryhub-mysql` -> MySQL 8.4, expose `3306`
- `apiaryhub-redis` -> Redis 7, expose `6379`

## Nginx + Certbot (VPS Ubuntu)
Un template Nginx est disponible ici:

- `deploy/nginx/apiaryhub.conf`

Etapes rapides cote serveur:

```bash
sudo cp deploy/nginx/apiaryhub.conf /etc/nginx/sites-available/apiaryhub
sudo ln -s /etc/nginx/sites-available/apiaryhub /etc/nginx/sites-enabled/apiaryhub
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d apiaryhub.example.com -d www.apiaryhub.example.com --redirect
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
