# Zola Tours & Safaris — cPanel Git deployment

This project is deployed from `https://github.com/Maulidks5/zolatour.git`. The Laravel repository stays outside `public_html`; only its `public` directory is web-accessible. cPanel has no Node.js build tools, so frontend assets are built locally and committed under `public/build`.

## One-time cPanel setup

1. In **MultiPHP Manager**, select PHP 8.3 or newer for `zolatoursandsafaris.com`. Enable the `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `dom`, `curl`, and `zip` PHP extensions.
2. Create a MySQL database and user, grant the user **All Privileges**, and keep their full cPanel-prefixed names.
3. Clone the repository from cPanel Terminal into a directory outside `public_html`:

   ```bash
   cd /home/CPANEL_USER/repositories
   git clone https://github.com/Maulidks5/zolatour.git zola-tours
   cd zola-tours
   ```

4. Copy `deploy/env.production.example` to `/home/CPANEL_USER/.zola-tours.env`. Fill in the database password, mailbox password, admin password and the cPanel-prefixed database names. Keep this secrets file outside the Git repository. The deployment script copies it to `.env` automatically.
5. Install the secure environment file and run the first deployment:

   ```bash
   cd /home/CPANEL_USER/repositories/zola-tours
   cp /home/CPANEL_USER/.zola-tours.env .env
   chmod 600 .env
   bash deploy/cpanel-deploy.sh
   ```

6. In **Domains → Manage**, set the document root to:

   `/home/CPANEL_USER/repositories/zola-tours/public`

   cPanel may ask for a path relative to the home directory; use `repositories/zola-tours/public` in that case.

7. Enable **Force HTTPS Redirect** after the SSL certificate is active.
8. Verify `https://zolatoursandsafaris.com/up` returns HTTP 200.

The deployment script installs production Composer packages, verifies the compiled frontend assets, runs migrations, creates the storage link, builds Laravel caches, and restarts queue workers. Node.js/npm is not required on cPanel.

## Every later deployment

Before every push, build locally and commit the generated assets:

```bash
npm ci
npm run build
git add public/build
git add -A
git commit -m "Update Zola Tours website"
git push origin main
```

Then run on cPanel:

```bash
cd /home/CPANEL_USER/repositories/zola-tours
git pull --ff-only origin main
bash deploy/cpanel-deploy.sh
```

Do not replace the production `.env` or delete `storage/app/public` during an update.

## Database import and export

Export the local database before the first production deployment:

```bash
mysqldump --single-transaction --routines --triggers -u LOCAL_DB_USER -p LOCAL_DB_NAME > zola-production.sql
```

Upload the SQL file outside `public_html`, then import it once on cPanel:

```bash
mysql -u CPANEL_DATABASE_USER -p CPANEL_DATABASE_NAME < /home/CPANEL_USER/zola-production.sql
cd /home/CPANEL_USER/repositories/zola-tours
php artisan migrate --force
```

After confirming the import, remove the SQL file from the server. SQL files and backup archives are ignored by Git and must never be stored in the public repository.

For later code updates, normally do not export/import the database again; `php artisan migrate --force` applies only new schema changes while preserving bookings and admin content.

## Image files

- Design and seed images under `public/images`, `public/brand`, and `public/videos` are tracked by Git.
- Admin uploads are saved under `storage/app/public` and displayed through the `public/storage` symbolic link.
- A database export contains image paths, not the actual uploaded files. When moving an existing database, copy `storage/app/public` as well:

```bash
tar -czf zola-uploads.tar.gz -C storage/app public
```

Upload and extract that archive into the production project's `storage/app` directory, then run `php artisan storage:link`.

## Main-domain limitation

cPanel does not normally allow changing the document root of the account's main domain. If `zolatoursandsafaris.com` is the main domain and its root is locked to `public_html`, ask the hosting provider to point its Apache document root to the repository's `public` directory. Do not expose the entire Laravel repository inside `public_html`.

## Optional cron entries

Laravel scheduler (once per minute):

`* * * * * /opt/cpanel/ea-php83/root/usr/bin/php /home/CPANEL_USER/repositories/zola-tours/artisan schedule:run >> /dev/null 2>&1`

If queued jobs are enabled, use a supervised worker if the host provides one. Otherwise add a cron job every minute:

`* * * * * /opt/cpanel/ea-php83/root/usr/bin/php /home/CPANEL_USER/repositories/zola-tours/artisan queue:work --stop-when-empty --tries=3 --timeout=120 >> /dev/null 2>&1`

## Verification after deploy

- Open `/up` and confirm it returns HTTP 200.
- Test homepage, one tour page, transport request, contact form and admin login.
- Confirm new booking/transport/contact emails arrive at `info@zolatoursandsafaris.com`.
- Confirm uploaded media loads through `/storage/...`.
- Check `storage/logs/laravel.log` if deployment or forms fail.
