# Apiaryhub (projet Web Services) — Plan de mise en route + roadmap

> Objectif: livrer une application **Laravel (API)** + **Front (React ou Blade/Livewire)** respectant l’énoncé:  
> - **REST** avec **GET/POST/PUT/DELETE** sur **≥ 3 controllers** (≥ 12 endpoints)  
> - Consommation de **vos propres services** (au moins 1 de chaque verbe)  
> - Consommation d’**une API externe** côté **backend**  
> - Authentification (recommandé: **JWT Bearer**)  
> - README clair + Git propre (commits par membre)

---

## 1) Périmètre V1 (suffisant pour valider le module)

### Entités
- **Hive** (ruche): nom, rucher, localisation (lat/lon), statut, notes
- **Reading** (relevé): poids/temp/humidité/activité, date
- **Action** (intervention): type (visite, traitement, nourrissement…), description, date

### Controllers REST (minimum requis)
1. `HivesController`  
2. `ReadingsController`  
3. `ActionsController`  

Chaque controller expose:
- `GET /api/...`
- `POST /api/...`
- `PUT /api/.../{id}`
- `DELETE /api/.../{id}`

✅ 3 controllers x 4 verbes = **12 endpoints**.

---

## 2) Stack recommandée

### Backend
- Laravel 11/12 (selon version dispo)
- JWT: `tymon/jwt-auth` **ou** Laravel Sanctum + tokens (mais JWT colle mieux à l’énoncé “Bearer”)
- Base: SQLite (dev) / MySQL ou Postgres (prod)

### Front
- React + Vite (recommandé si vous voulez séparer clean)
- (Option alternative) Blade/Livewire si vous préférez aller vite

---

## 3) Étapes pour obtenir une base “fonctionnelle” rapidement (V1)

### Étape A — Bootstrapping
1. Créer repo Git + règles (branch main + PR + conventions de commit)
2. `laravel new apiaryhub-api`
3. Config `.env`, DB, migrations de base
4. Installer JWT (ou Sanctum) + routes `auth/login`, `auth/register`

**Definition of Done**
- Vous pouvez: register, login, recevoir un **token Bearer**, appeler un endpoint protégé.

### Étape B — Modèle de données (migrations + relations)
- `hives` (belongsTo user)
- `readings` (belongsTo hive)
- `actions` (belongsTo hive)

**Definition of Done**
- Migrations OK + seed minimal (1 user + 2 ruches + readings).

### Étape C — API REST (12 endpoints)
Pour chaque controller:
- `index` (GET)
- `store` (POST)
- `update` (PUT)
- `destroy` (DELETE)

Ajoutez validation (`FormRequest`) + Policies/guards basiques (un user ne voit que ses ruches).

**Definition of Done**
- Postman/Insomnia collection OK (tests manuels)  
- 12 endpoints répondent, auth requise.

### Étape D — Consommation de VOS services (Front)
Implémenter 4 appels minimum depuis l’UI:
- GET list ruches
- POST create ruche
- PUT update ruche
- DELETE delete ruche

**Definition of Done**
- UI simple CRUD ruches.
- Token stocké (localStorage ou cookie httpOnly si vous durcissez).

### Étape E — API externe côté backend (obligatoire)
Choisir un provider météo (ex: OpenWeather/WeatherAPI/MeteoConcept).
- Créer `WeatherService` (client HTTP via Laravel `Http::`)
- Endpoint backend: `GET /api/hives/{id}/weather`
  - récupère lat/lon ruche
  - appelle API externe
  - renvoie un JSON propre (temp, pluie, vent, prévision courte)

**Definition of Done**
- 1 appel externe fonctionnel côté backend, testé.

---

## 4) Étapes “pour aller plus loin” (V2 → vers un projet fini)

### V2 — Alertes & règles
- Nouvelle entité `alerts`:
  - level (info/warn/critical), message, resolved_at
- Job planifié (scheduler) qui:
  - appelle météo
  - détecte conditions (pluie forte, froid, vent)
  - crée alertes

### V2 — Import capteurs DIY (API-first)
- Endpoint: `POST /api/hives/{id}/readings`
  - clé device (token) par ruche
  - permet envoi depuis Raspberry/ESP32

### V2 — Multi-ruchers + carte
- Entité `apiaries` (ruchers) + relation `apiaries -> hives`
- Carte (Leaflet) pour voir les emplacements

### V2 — Communautaire (option)
- Mode “public observations” anonymisées:
  - floraisons, frelons signalés, pertes hivernales (agrégé)
- Modération (admin)

### V3 — Produit “fini”
- Docker compose (api + db + front)
- Export CSV/JSON
- Documentation API (OpenAPI/Swagger)
- Tests (Feature tests Laravel) + CI GitHub Actions

---

## 5) Checklist conformité à l’énoncé

- [ ] **≥ 3 controllers REST** exposant **GET/POST/PUT/DELETE**
- [ ] Interface consomme au moins **1 GET, 1 POST, 1 PUT, 1 DELETE**
- [ ] **1 API externe** appelée côté **backend**
- [ ] Auth Bearer (**JWT** recommandé)
- [ ] README complet (setup, endpoints, auth, API externe, captures)
- [ ] Git: commits signés, auteurs distincts, historique lisible

---

## 6) Idées d’API externe faciles (au choix)
- Météo (recommandé) → alertes + planification visites
- Discord webhook → notifier une alerte dans un channel
- Google Calendar → créer un rappel “traitement varroa” (plus lourd)

---

## 7) Livrables
- Repo GitHub/GitLab
- README.md
- (optionnel) URL déployée

---

### Prochaine action “terrain”
Quand tu as le retour de tes parents, listez 5 besoins concrets (ex: “suivre poids”, “planifier traitement varroa”, “historique interventions”, “cartographie ruchers”, “alertes météo”).  
On ajuste V1 pour coller à l’usage réel tout en restant simple.
