# Proxideck

Booking and operations platform for service professionals and their clients: public discovery, online booking, payments (Paystack), provider dashboards, subscriptions, embeddable widgets, and admin tools.

## Stack

- **Backend:** PHP 8.2+, Laravel 12, Laravel Fortify (auth), Inertia Laravel
- **Frontend:** React 19 (Inertia), Vite 7, Tailwind CSS 4, TypeScript
- **Extras:** Laravel Web Push, Redis (Predis), queues (database-backed in the example env)
- **Payments:** Paystack (webhooks and callbacks)
- **Integrations:** Google OAuth; optional Google Calendar sync in user settings

Default app timezone is `Africa/Lagos` (`config/app.php`).

## Roles and access

| Area | Notes |
|------|------|
| **Guest** | Marketplace home, provider profiles, map search, widget embed, static pages |
| **Authenticated user** | Acts as a **client** for bookings, wallet, favorites, reviews, and jobs. Email verification uses **OTP** endpoints compatible with Fortify. |
| **Provider** | Users with a **`BusinessProfile`**. Middleware `provider` guards business and scheduling routes. |
| **Admin** | Session under **`/admin`** (`EnsureAdmin`). |

Roles use `users.role` via `App\Enum\UserRoleEnum`. Provider capability is modeled as `User::hasProviderSetup()` / `businessProfile` presence.

## Guest and public

- Marketplace **home**, **search/filter** providers (`GuestController` + marketplace pages).
- **Provider pages:** `/provider/{slug}`, gallery at `/provider/{slug}/gallery`.
- **Map:** `/find-on-map`.
- **Widget:** `/widget/{slug}` embed; **`/widget/{slug}/payment/callback/{reference}`** for payments.
- **Static / support:** about, history, team, FAQs, privacy, terms; **contact** forms.
- **Reviews** via authenticated `reviews` routes.

## Clients

- **Bookings:** `/provider/{slug}/book`; **My bookings** CRUD-ish flows; reschedule, edit, cancel, report; **slots** JSON for availability.
- **Addresses:** routes + `settings/addresses`.
- **Wallet:** Paystack **top-up** (initialize + verify), **client withdraw** endpoints.
- **Favorites** for businesses.
- **Jobs:** list, **post** jobs, **accept bids** on provider offers.
- **Support** help center when logged in.

## Providers

**Onboarding:** business profile, work hours, services/categories, verification step, success (with optional skips).

**Business:** dashboard, services and categories, hours and holidays, gallery, analytics, **billing** (subscribe/cancel vs plans), general/location/advanced/**appearance** settings, **widget integration** and settings.

**Schedule:** calendar and appointments list; **confirm / cancel / complete / report** on provider appointments.

**Team:** members, invites, public accept links (`/team/...`).

**Wallet:** **provider withdrawals** (`wallet/withdraw`).

**Jobs:** **job board** and **place bids** on client posts.

**Verification:** additional submission after onboarding (`/verification/submit`).

## Widget API

Public JSON under **`/api/widget/{slug}/`**: info, availability, wallet checks, Paystack payment init, book. Used by the embed and external sites.

## Payments and appointments

- **Paystack:** `POST /paystack/webhook`, `GET /paystack/callback` (plus legacy-style notification URL registered in `web.php`).
- **Appointments** include client/provider **approval**, **escrow** fields, **platform fee** and **payout** amounts, optional **recurrence**, **service address** capture, **team member** assignment, and optional **Google Calendar** event linkage.

## Notifications

Many Laravel notification classes cover booking lifecycle, recurring edge cases, team and verification events, subscription reminders, support, and onboarding. **Mail** and **Web Push** are used where configured. In-app **notification bell** API and **push subscription** register/unregister routes exist under `notifications` and `push-subscription`.

## Settings

`routes/settings.php`: profile, password (throttled), appearance (provider vs client page), two-factor, Google Calendar OAuth, client addresses index.

## Admin (`/admin`)

Login for guests; then dashboard, **users** (wallet, suspend, delete), **financial** view, **subscription plans** CRUD, **moderation** (reports, reviews), **support** tickets, **provider verifications** (approve/reject, documents).

## Local development

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
npm install
npm run dev
```

Combined dev server + queue + Vite:

```bash
composer run dev
```

Production frontend build:

```bash
npm run build
```

Configure **APP_URL**, database, **Paystack**, **VAPID** keys for push (`php artisan webpush:vapid`), and Google credentials as needed.

## Tests

```bash
composer run test
```

---

This README summarizes the current `routes/` surface, key `app/Models/`, and Inertia pages under `resources/js/pages/`. For production, keep **APP_URL** aligned with your public domain so links, widgets, and Paystack callbacks stay correct.
