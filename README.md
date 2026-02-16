# Apiarihub V1 (Laravel API + React)

Apiarihub V1 inclut:
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
- email: `demo@apiarihub.local`
- password: `password123`

## Services Docker
- `apiarihub-app` -> Laravel + frontend React, expose `8000`
- `apiarihub-mysql` -> MySQL 8.4, expose `3306`
- `apiarihub-redis` -> Redis 7, expose `6379`

## Endpoints API principaux
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|POST|PUT|DELETE /api/apiaries...`
- `GET|POST|PUT|DELETE /api/hives...`
- `GET /api/hives/{hive}/weather`
- `GET|POST|PUT|DELETE /api/readings...`
- `GET|POST|PUT|DELETE /api/actions...`
