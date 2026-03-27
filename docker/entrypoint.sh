#!/usr/bin/env sh

set -eu

cd /var/www/html

mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

SYNC_ENV_FILE="${SYNC_ENV_FILE:-false}"

if [ ! -f .env ] && [ "$SYNC_ENV_FILE" != "true" ]; then
  cp .env.example .env
fi

if [ ! -f .env ]; then
  touch .env
fi

set_env_key() {
  key="$1"
  value="$2"
  if [ -z "$value" ]; then
    return 0
  fi

  php -r '
$file = ".env";
$key = $argv[1];
$value = $argv[2];
$lines = file_exists($file) ? file($file, FILE_IGNORE_NEW_LINES) : [];
$prefix = $key . "=";
$updated = false;

foreach ($lines as $index => $line) {
    if (str_starts_with($line, $prefix)) {
        $lines[$index] = $prefix . $value;
        $updated = true;
        break;
    }
}

if (! $updated) {
    $lines[] = $prefix . $value;
}

file_put_contents($file, implode(PHP_EOL, $lines) . PHP_EOL);
' "$key" "$value"
}

if [ "$SYNC_ENV_FILE" = "true" ]; then
  # Keep runtime infra settings aligned with Docker Compose environment.
  set_env_key APP_KEY "${APP_KEY:-}"
  set_env_key DB_HOST "${DB_HOST:-}"
  set_env_key DB_PORT "${DB_PORT:-}"
  set_env_key DB_DATABASE "${DB_DATABASE:-}"
  set_env_key DB_USERNAME "${DB_USERNAME:-}"
  set_env_key DB_PASSWORD "${DB_PASSWORD:-}"
  set_env_key APP_ENV "${APP_ENV:-}"
  set_env_key APP_DEBUG "${APP_DEBUG:-}"
  set_env_key APP_URL "${APP_URL:-}"
  set_env_key APP_AUTO_SEED "${APP_AUTO_SEED:-}"
  set_env_key SESSION_SECURE_COOKIE "${SESSION_SECURE_COOKIE:-}"
  set_env_key SESSION_DOMAIN "${SESSION_DOMAIN:-}"
  set_env_key SANCTUM_STATEFUL_DOMAINS "${SANCTUM_STATEFUL_DOMAINS:-}"
  set_env_key CACHE_STORE "${CACHE_STORE:-}"
  set_env_key SESSION_DRIVER "${SESSION_DRIVER:-}"
  set_env_key QUEUE_CONNECTION "${QUEUE_CONNECTION:-}"
  set_env_key REDIS_CLIENT "${REDIS_CLIENT:-}"
  set_env_key REDIS_HOST "${REDIS_HOST:-}"
  set_env_key REDIS_PORT "${REDIS_PORT:-}"
  set_env_key MAIL_QUEUE "${MAIL_QUEUE:-}"
  set_env_key MAIL_MAILER "${MAIL_MAILER:-}"
  set_env_key MAIL_SCHEME "${MAIL_SCHEME:-}"
  set_env_key MAIL_ENCRYPTION "${MAIL_ENCRYPTION:-}"
  set_env_key MAIL_HOST "${MAIL_HOST:-}"
  set_env_key MAIL_PORT "${MAIL_PORT:-}"
  set_env_key MAIL_USERNAME "${MAIL_USERNAME:-}"
  set_env_key MAIL_PASSWORD "${MAIL_PASSWORD:-}"
  set_env_key MAIL_EHLO_DOMAIN "${MAIL_EHLO_DOMAIN:-}"
  set_env_key MAIL_FROM_ADDRESS "${MAIL_FROM_ADDRESS:-}"
  set_env_key MAIL_FROM_NAME "${MAIL_FROM_NAME:-}"
  set_env_key FRONTEND_URL "${FRONTEND_URL:-}"
fi

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

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force --ansi

  if [ "${APP_AUTO_SEED:-true}" = "true" ]; then
    php artisan db:seed --force --ansi
  fi
fi

case "${APP_RUNTIME:-web}" in
  web)
    exec php artisan serve --host=0.0.0.0 --port=8000
    ;;
  worker)
    exec php artisan queue:work "${QUEUE_CONNECTION:-redis}" \
      --queue="${QUEUE_WORKER_QUEUE:-mail}" \
      --sleep="${QUEUE_WORKER_SLEEP:-3}" \
      --tries="${QUEUE_WORKER_TRIES:-3}" \
      --timeout="${QUEUE_WORKER_TIMEOUT:-120}" \
      --max-time="${QUEUE_WORKER_MAX_TIME:-3600}" \
      --no-interaction
    ;;
  *)
    echo "Unsupported APP_RUNTIME: ${APP_RUNTIME}" >&2
    exit 1
    ;;
esac
