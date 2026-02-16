#!/usr/bin/env sh

set -eu

cd /var/www/html

mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

if [ ! -f .env ]; then
  cp .env.example .env
fi

set_env_key() {
  key="$1"
  value="$2"
  if [ -z "$value" ]; then
    return 0
  fi

  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    printf '\n%s=%s\n' "$key" "$value" >> .env
  fi
}

# Keep runtime infra settings aligned with Docker Compose environment.
set_env_key DB_HOST "${DB_HOST:-}"
set_env_key DB_PORT "${DB_PORT:-}"
set_env_key DB_DATABASE "${DB_DATABASE:-}"
set_env_key DB_USERNAME "${DB_USERNAME:-}"
set_env_key DB_PASSWORD "${DB_PASSWORD:-}"
set_env_key CACHE_STORE "${CACHE_STORE:-}"
set_env_key SESSION_DRIVER "${SESSION_DRIVER:-}"
set_env_key QUEUE_CONNECTION "${QUEUE_CONNECTION:-}"
set_env_key REDIS_CLIENT "${REDIS_CLIENT:-}"
set_env_key REDIS_HOST "${REDIS_HOST:-}"
set_env_key REDIS_PORT "${REDIS_PORT:-}"

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --ansi
fi

echo "Waiting for database at ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
until php -r '
$host = getenv("DB_HOST") ?: "mysql";
$port = (int) (getenv("DB_PORT") ?: 3306);
$db = getenv("DB_DATABASE") ?: "apiaryhub";
$user = getenv("DB_USERNAME") ?: "apiaryhub";
$pass = getenv("DB_PASSWORD") ?: "apiaryhub";
try {
    new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [PDO::ATTR_TIMEOUT => 2]);
    exit(0);
} catch (Throwable $e) {
    exit(1);
}
'; do
  sleep 2
done

php artisan config:clear --ansi
php artisan migrate --force --ansi

if [ "${APP_AUTO_SEED:-true}" = "true" ]; then
  php artisan db:seed --force --ansi
fi

exec php artisan serve --host=0.0.0.0 --port=8000
