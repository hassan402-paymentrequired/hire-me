# In-App Notifications, Promotions & Messaging Plan

## Implemented: In-browser / in-app notifications

### What’s done

- **Database channel**  
  All app notifications (welcome, appointment urgent/delayed/cancelled, verification, team invite, recurring, etc.) are stored in the database and still sent by email.

- **Notifications table**  
  Migration: `database/migrations/2026_02_05_012231_create_notifications_table.php`.  
  Run: `php artisan migrate`

- **API (for the bell)**  
  - `GET /notifications` – paginated list + `unread_count`  
  - `POST /notifications/read-all` – mark all as read  
  - `POST /notifications/{id}/read` – mark one as read  

- **UI**  
  - **NotificationBell** component: bell icon, unread badge, dropdown with list, “Mark all read”, links to `action_url` from each notification.  
  - Shown in:  
    - **Provider layout**: header of the sidebar layout (`app-sidebar-header.tsx`)  
    - **Client layout**: main app header (`app-header.tsx`)  
  - Polling every 60s when the dropdown is open.

### Implemented: Browser push (notify when user is not in the app)

- **Web Push** is implemented so users can receive system notifications when the browser is closed or the tab is in the background.
- **Backend:** `laravel-notification-channels/webpush`, VAPID keys in config, `push_subscriptions` table, `PushSubscriptionController` to store subscriptions. All notifications that use the database channel also send via Web Push.
- **Frontend:** Service worker `public/sw.js` handles push and notification click (opens `data.url`). `usePushNotifications` hook registers the SW, requests permission, subscribes, and POSTs the subscription to `/push-subscription`. Mounted in provider and client layouts.
- **Setup:** Run `composer update`, then `php artisan webpush:vapid` (adds VAPID keys to `.env`), then `php artisan migrate`. Ensure `APP_URL` is correct (HTTPS in production; push requires a secure context).

### Optional next steps for notifications

- **Real-time**  
  Add Laravel Echo + Reverb and a `broadcast` channel so new notifications appear without polling (good base for messaging later).

---

## Next: Promotions

### Goal

- Providers (and optionally admins) can create promotions (e.g. first-time discount, seasonal offer).  
- Clients can enter a **promo code** at checkout and see the discount.  
- Platform can run site-wide promos.

### Backend

1. **Migration: `promotions` table**  
   - `id`, `provider_id` (nullable = platform-wide), `code` (unique per provider or global), `type` (`percent` | `fixed`), `value`, `min_booking_amount` (nullable), `valid_from`, `valid_until`, `usage_limit` (nullable), `used_count`, `active` (boolean).  
   - Optional: `applicable_services` (JSON or pivot) to limit to certain services.

2. **Model**  
   - `Promotion` with casts, scopes (e.g. `active()`, `validNow()`), and relation to `User` (provider).

3. **Validation at booking**  
   - New endpoint or existing booking flow: accept `promo_code` (and optionally `provider_id`), resolve one matching promotion, validate (dates, usage limit, min amount), return discount (amount or percent) and updated total.  
   - Store on the appointment: e.g. `promotion_id` (nullable), `discount_amount` so escrow and receipts use the discounted price.

4. **Provider (and optional admin) UI**  
   - CRUD for promotions: create/edit promo, set code, type, value, dates, usage limit, optional min booking.  
   - List active/expired promos.

### Frontend

1. **Booking flow**  
   - On the booking page (and widget if desired): “Promo code” input, “Apply” button.  
   - Call backend to validate code; show discount line and new total.  
   - Send `promo_code` (or `promotion_id`) with the create-booking request.

2. **Provider dashboard**  
   - Section “Promotions” with list + “Create promotion” (form: code, type, value, dates, limits).  
   - Simple list view: code, type, value, validity, usage, status (active/expired).

3. **Marketplace / provider page**  
   - Optional: show “Use code X for Y% off” (or “Z off”) for active promos.

### Order of work (suggested)

1. Migration + model + validation helper (check code, return discount).  
2. Apply discount in existing booking flow (backend) and add `promotion_id` / `discount_amount` to appointment.  
3. Booking page: promo input + apply + display discount.  
4. Provider: create/list promotions (simple CRUD).  
5. Optional: admin platform-wide promos, and show promos on provider/marketplace.

---

## Later: Messaging

- **When**  
  After promotions (and optionally after browser push / real-time notifications).

- **What**  
  In-app chat between client and provider (per booking or per provider):  
  - Real-time (Echo + Reverb or similar).  
  - Message history, optional file sharing, read/typing indicators.  
  - Notifications for new messages (reuse the in-app notification bell and, if you add it, push).

- **Why this order**  
  Notifications (and promo) improve engagement and bookings with less scope than full messaging. Messaging can then build on the same real-time and notification stack.

---

## Summary

| Feature              | Status      | Notes                                               |
|----------------------|------------|-----------------------------------------------------|
| In-app notifications| Implemented| Bell in header/sidebar, DB + API, polling          |
| Browser push         | Implemented| Web Push when user is not in the app; VAPID + SW   |
| Promotions           | Planned    | Follow the backend + booking + provider UI steps   |
| Messaging            | Later      | After promotions; reuse real-time/notification UX  |
