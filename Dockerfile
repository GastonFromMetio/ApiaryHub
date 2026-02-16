FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY vite.config.js ./vite.config.js
COPY public ./public
RUN npm run build

FROM php:8.3-cli-bookworm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    ca-certificates \
    && docker-php-ext-install pdo_mysql bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN cp .env.example .env \
    && mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache \
    && composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && php artisan key:generate --force --ansi \
    && chown -R www-data:www-data storage bootstrap/cache

COPY --from=frontend /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/apiaryhub-entrypoint
RUN chmod +x /usr/local/bin/apiaryhub-entrypoint

EXPOSE 8000

ENTRYPOINT ["apiaryhub-entrypoint"]
