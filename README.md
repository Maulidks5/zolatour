# Zola Tours & Safaris

Laravel and Inertia website for Zanzibar tours, Tanzania safaris, transfers, automatic booking confirmation, vouchers, testimonials, partners, and administration.

## Local development

Requirements: PHP 8.3+, Composer, Node.js, npm, MySQL, and `pdo_sqlite` for the automated test suite.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm ci
npm run build
composer run dev
```

## Verification

```bash
php artisan test
npm run build
composer validate --no-check-publish
```

Automated tests use an in-memory SQLite database and never modify the configured application database.

## Production deployment (cPanel)

1. Point the domain document root to the project's `public` directory.
2. Copy `deploy/env.production.example` to a secure file outside the public directory, normally `~/.zola-tours.env`, and replace all `CHANGE_ME`/cPanel placeholders.
3. Build frontend assets locally with `npm ci && npm run build`, then commit `public/build` together with the source changes.
4. Run `bash deploy/cpanel-deploy.sh` on the server. It uses the compiled frontend assets from Git, so Node.js/npm is not required on cPanel.
5. Configure a permanent queue worker. With cPanel cron, run every minute:

```cron
* * * * * cd /home/CPANEL_USER/path/to/zolatour && /usr/local/bin/php artisan queue:work --stop-when-empty --tries=3 --timeout=120 >> /dev/null 2>&1
```

6. Configure Laravel's scheduler:

```cron
* * * * * cd /home/CPANEL_USER/path/to/zolatour && /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1
```

7. Confirm HTTPS, SMTP delivery, booking emails, voucher links, storage uploads, and database backups on the live domain.

Static design images are tracked under `public/images` and deploy through Git. Admin-uploaded images live under `storage/app/public`; keep that directory during updates and include it with database backups. The deployment script creates the public `/storage` link automatically.

Never commit `.env`, mail passwords, database passwords, or production backups.
