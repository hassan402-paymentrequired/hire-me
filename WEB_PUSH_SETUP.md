# Web Push Setup (notifications when user is not in the app)

Users can receive **browser (system) notifications** when they are not in the app—e.g. browser in the background or closed.

## 1. Install the package

```bash
composer update
```

This installs `laravel-notification-channels/webpush` (added to `composer.json`).

## 2. Generate VAPID keys

```bash
php artisan webpush:vapid
```

This adds `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to your `.env`. **Keep these secret and do not change them** once you have real subscribers.

If the command is not available, you can generate keys with:

```bash
php artisan vendor:publish --provider="NotificationChannels\WebPush\WebPushServiceProvider" --tag="config"
```

Then use an online VAPID key generator or the minishlink/web-push library to generate a key pair and put the public key in `VAPID_PUBLIC_KEY` and the private key in `VAPID_PRIVATE_KEY` in `.env`.

## 3. Run migrations

```bash
php artisan migrate
```

This creates the `push_subscriptions` table (and `notifications` if not already run).

**Note:** If the webpush package publishes its own migration when you run `vendor:publish --tag=migrations`, you can use that instead. If you get a duplicate table error, drop the `push_subscriptions` table and run the package’s migration only.

## 4. HTTPS in production

Web Push requires a **secure context**: use HTTPS in production. Localhost is treated as secure for development.

## 5. Queue worker

Notifications are queued. Ensure your queue worker is running so push messages are sent:

```bash
php artisan queue:work
```

## Flow

1. **First visit (logged in):** The app registers the service worker (`/sw.js`), asks for notification permission, subscribes with the VAPID public key, and sends the subscription to `POST /push-subscription`.
2. **When a notification is sent:** Laravel sends it via mail, database (in-app bell), and **Web Push**. The push is delivered by the browser’s push service; the service worker shows a system notification.
3. **User clicks the notification:** The service worker opens the URL from the notification payload (e.g. `/bookings` or `/business/schedule/appointments`).

## Optional: disable Web Push for a notification

In any notification class, remove `WebPushChannel::class` from `via()` and remove the `SendsWebPush` trait if you don’t want that notification to be sent as a browser push.
