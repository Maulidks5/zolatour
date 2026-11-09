#!/usr/bin/env bash

set -Eeuo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_ROOT"

log() {
    printf '[Zola deploy] %s\n' "$1"
}

fail() {
    printf '[Zola deploy] ERROR: %s\n' "$1" >&2
    exit 1
}

if [[ -n "${CPANEL_PHP_BIN:-}" ]]; then
    PHP_BIN="$CPANEL_PHP_BIN"
elif [[ -x /opt/cpanel/ea-php83/root/usr/bin/php ]]; then
    PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
else
    PHP_BIN="$(command -v php || true)"
fi

if [[ -n "${CPANEL_COMPOSER_BIN:-}" ]]; then
    COMPOSER_BIN="$CPANEL_COMPOSER_BIN"
elif [[ -x /opt/cpanel/composer/bin/composer ]]; then
    COMPOSER_BIN=/opt/cpanel/composer/bin/composer
else
    COMPOSER_BIN="$(command -v composer || true)"
fi

[[ -n "$PHP_BIN" && -x "$PHP_BIN" ]] || fail "PHP CLI was not found. Set CPANEL_PHP_BIN to the PHP 8.3+ binary."
[[ -n "$COMPOSER_BIN" && -x "$COMPOSER_BIN" ]] || fail "Composer was not found. Set CPANEL_COMPOSER_BIN to the Composer binary."

ENV_SOURCE="${CPANEL_ENV_FILE:-${HOME}/.zola-tours.env}"
if [[ ! -f .env && -f "$ENV_SOURCE" ]]; then
    log "Installing the production environment file from $ENV_SOURCE"
    cp "$ENV_SOURCE" .env
    chmod 600 .env
fi

[[ -f .env ]] || fail "Create $ENV_SOURCE with the production environment values before the first deployment."
[[ -d public/images ]] || fail "The tracked public/images directory is missing."

APP_ENV_VALUE="$(sed -n 's/^APP_ENV=//p' .env | tail -1 | tr -d '\r\"')"
APP_DEBUG_VALUE="$(sed -n 's/^APP_DEBUG=//p' .env | tail -1 | tr -d '\r\"')"
APP_URL_VALUE="$(sed -n 's/^APP_URL=//p' .env | tail -1 | tr -d '\r\"')"
SESSION_SECURE_VALUE="$(sed -n 's/^SESSION_SECURE_COOKIE=//p' .env | tail -1 | tr -d '\r\"')"

[[ "$APP_ENV_VALUE" == "production" ]] || fail "APP_ENV must be production."
[[ "$APP_DEBUG_VALUE" == "false" ]] || fail "APP_DEBUG must be false."
[[ "$APP_URL_VALUE" == https://* ]] || fail "APP_URL must use HTTPS."
[[ "$SESSION_SECURE_VALUE" == "true" ]] || fail "SESSION_SECURE_COOKIE must be true."

if grep -Eq '=(CHANGE_ME|CPANEL_DATABASE_NAME|CPANEL_DATABASE_USER)$' .env; then
    fail "Replace every CHANGE_ME and cPanel database placeholder in .env."
fi

PHP_VERSION="$($PHP_BIN -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
if ! "$PHP_BIN" -r 'exit(version_compare(PHP_VERSION, "8.3.0", ">=") ? 0 : 1);'; then
    fail "PHP 8.3+ is required; the selected CLI is PHP $PHP_VERSION."
fi

for extension in pdo_mysql mbstring openssl fileinfo dom curl; do
    "$PHP_BIN" -r "exit(extension_loaded('$extension') ? 0 : 1);" || fail "Required PHP extension is missing: $extension"
done

log "Installing production PHP dependencies with PHP $PHP_VERSION"
"$PHP_BIN" "$COMPOSER_BIN" install --no-dev --prefer-dist --no-interaction --optimize-autoloader

[[ -f public/build/manifest.json ]] || fail "Compiled frontend assets are missing. Run npm ci && npm run build locally and commit public/build before deploying."

APP_KEY_VALUE="$(sed -n 's/^APP_KEY=//p' .env | tail -1 | tr -d '\r\"')"
if [[ -z "$APP_KEY_VALUE" ]]; then
    log "Generating the application key for this first deployment"
    "$PHP_BIN" artisan key:generate --force
fi

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

MAINTENANCE_STARTED=0
finish() {
    if [[ "$MAINTENANCE_STARTED" == "1" ]]; then
        "$PHP_BIN" artisan up >/dev/null 2>&1 || true
    fi
}
trap finish EXIT

log "Enabling maintenance mode"
"$PHP_BIN" artisan down --retry=60 || true
MAINTENANCE_STARTED=1

log "Clearing stale caches"
"$PHP_BIN" artisan optimize:clear

log "Running database migrations"
"$PHP_BIN" artisan migrate --force

log "Creating the public storage link"
"$PHP_BIN" artisan storage:link --relative || "$PHP_BIN" artisan storage:link

log "Caching production configuration and routes"
"$PHP_BIN" artisan optimize

log "Restarting queue workers"
"$PHP_BIN" artisan queue:restart

"$PHP_BIN" artisan up
MAINTENANCE_STARTED=0
trap - EXIT

log "Deployment completed successfully"
