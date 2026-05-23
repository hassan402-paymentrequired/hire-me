# Proxideck — Fix Plan (Post-CTO Feedback)

**Version:** Draft 1  
**Date:** May 2026  
**Source:** CTO demo feedback + codebase analysis  

**Related docs:** [README](./README.md) · [PRODUCT_THESIS](./PRODUCT_THESIS.md) · [CTO_FEEDBACK](./CTO_FEEDBACK.md) · [DEMO_SCRIPT](./DEMO_SCRIPT.md)

This plan addresses: positioning clarity, on-site vs in-shop UX, Jiji/WhatsApp competition narrative, trust loop visibility, and gaps that undermine demos.

**Release scope:** See [V1_SCOPE.md](./V1_SCOPE.md). Items tagged **v2** are intentionally deferred (job board, widget unlock, WhatsApp).

---

## How to read this doc

| Priority | Meaning |
|----------|---------|
| **P0** | Blocks credible demos and strategic clarity — do first |
| **P1** | Core product gaps that contradict the thesis |
| **P2** | Important for market fit (channels, polish) |
| **P3** | Nice-to-have / longer horizon |

Each item includes **problem**, **fix**, **key files**, and **acceptance criteria**.

---

## P0 — Strategic clarity & demo narrative

### P0.1 — Publish and align on product thesis

**Problem:** Team pitches “hire handyman” while product demos as “book appointment at vendor.”  
**Fix:** Adopt `docs/PRODUCT_THESIS.md`; use it in demos, onboarding copy, and investor conversations.  
**Acceptance:** Everyone can answer in one sentence: discovery or distribution first, and why.

---

### P0.2 — Restructure demo script (trust loop first)

**Problem:** CTO saw marketplace + vendor address + appointments; missed escrow and resolution.  
**Fix:** Use [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) as the standard demo.  

**Acceptance:** 5-minute demo never opens with marketplace scroll unless explicitly showing “discovery channel.”

---

### P0.3 — Brand and messaging consistency

**Problem:** Repo `clockra`, docs “HireMe”, product “Proxideck”, mixed SEO (“global reputation” vs Nigeria-local).  
**Fix:**

- Single customer-facing name: **Proxideck**  
- Align `site.webmanifest`, meta descriptions, internal docs  
- Remove or archive stale “HireMe” references in active docs  

**Key files:**

- `public/logo/site.webmanifest`, `public/site.webmanifest`  
- `resources/views/app.blade.php`  
- `STRATEGIC_FEATURE_ROADMAP.md` (rename or archive)  

**Acceptance:** No conflicting product names in user-facing surfaces.

---

### P0.8 — Split landing messaging (client vs provider)

**Problem:** Homepage sells “find providers near you”; auth pages sell “built for service professionals” — mixed first impression.  
**Fix:**

- Landing: lead with **trust + hire safely** OR **provider distribution** — pick one hero, secondary CTA for the other  
- Add clear “For professionals” / “For clients” paths above the fold  
- Align footer and `about.tsx` with thesis (remove “global reputation” overreach in manifest if still present)  

**Key files:**

- `resources/js/pages/guest/components/landing-page.tsx`  
- `resources/js/layouts/auth/auth-split-layout.tsx`  
- `resources/js/pages/guest/pages/about.tsx`  
- `public/logo/site.webmanifest`  

**Acceptance:** First-time visitor understands two-sided platform without contradictory hero copy.

---

## P0 — Service delivery model (addresses & “who goes where”)

### P0.4 — Introduce explicit service delivery mode per provider

**Problem:** Provider business address dominates UI; on-site jobs read as “client visits vendor.”  
**Fix:** Add provider-level setting (extend or replace `offers_home_service`):

| Mode | Label (client-facing) | Address behavior |
|------|----------------------|------------------|
| `client_visits_provider` | “Visit us” | Show provider address; client address optional/hidden |
| `provider_visits_client` | “We come to you” | Require client service address; de-emphasize provider street address on booking |
| `both` | “At your location or ours” | Let client choose per booking |

**Key files:**

- `config/provider_settings.php`  
- `app/Support/ProviderSettings.php`  
- `resources/js/pages/provider/business/components/advance-setting.tsx`  
- `app/Http/Controllers/Client/MarketplaceController.php`  
- `resources/js/pages/marketplace/booking.tsx`  
- `resources/js/pages/marketplace/provider.tsx`  
- `resources/js/pages/marketplace/booking/components/booking-header.tsx`  
- `resources/js/pages/marketplace/booking/components/booking-summary.tsx`  
- `resources/js/pages/guest/components/business-card.tsx`  

**Acceptance:**

- Plumber with `provider_visits_client`: booking requires client address; header does not imply client travels to shop.  
- Salon with `client_visits_provider`: provider address shown; client address not required.

---

### P0.5 — Wire `offers_home_service` into booking flow (interim or merge into P0.4)

**Problem:** Setting exists, passed to FE, never gates UX (`offers_home_service` unused in `booking.tsx`).  
**Fix:** Until P0.4 ships, at minimum:

- If `offers_home_service === true`: require client address before confirm; copy says “Service at your location”  
- If false: hide client address section; copy says “Visit [Business name] at [address]”  

**Key files:**

- `resources/js/pages/marketplace/booking.tsx`  
- `app/Http/Controllers/Client/AppointmentController.php` (validate address required when home service)  

**Acceptance:** Provider toggle visibly changes booking UI and validation.

---

### P0.6 — Marketplace & profile copy by delivery mode

**Problem:** “Book Appointment” everywhere; map pins always provider location.  
**Fix:**

- `client_visits_provider` → CTA: “Book appointment” / “Visit us”  
- `provider_visits_client` → CTA: “Request service” / “Book a visit”  
- Profile hero: show “Comes to you” badge when on-site; don’t lead with shop address for on-site-only pros  

**Key files:**

- `resources/js/pages/marketplace/provider.tsx`  
- `resources/js/pages/marketplace/components/service-modal.tsx`  
- `resources/js/pages/guest/components/business-card.tsx`  

**Acceptance:** CTO scenario (handyman) shows on-site language and client address, not shop visit.

---

### P0.7 — Map and discovery UX for on-site providers

**Problem:** `/find-on-map` and marketplace cards pin **provider business address** only — reinforces “go to them.”  
**Fix:**

- On-site providers: show “Serves your area” / service radius instead of shop pin as primary (or hide street address on cards)  
- Map: optional layer for “home service available” vs “visit location”  
- Distance sort remains client-centric  

**Key files:**

- `resources/js/pages/guest/find-on-map.tsx`  
- `resources/js/pages/marketplace/components/map-view.tsx`  
- `app/Http/Controllers/Guest/GuestController.php` (or marketplace query layer)  

**Acceptance:** Map browse for plumbers doesn’t imply visiting a shop address.

---

## P1 — Job board vs appointment (generality of work) — **v2**

> **Not v1.** Code exists; do not expose or finish for launch unless v2 scope is opened. Keeps app from bloating v1.

### P1.1 — Complete job → hire flow `v2`

**Problem:** “Post a Job” fits handyman/plumber (describe problem, your address, budget) but bid acceptance stops at `TODO: Convert to Appointment logic`.  
**Fix:**

- On bid accept: create appointment or new `ServiceRequest` with client address, agreed price, status workflow  
- Notify both parties; optional escrow on accept  
- Show active job in client “My jobs” and provider schedule  

**Key files:**

- `app/Http/Controllers/JobBidController.php`  
- `app/Http/Controllers/JobPostController.php`  
- `resources/js/pages/client/jobs/index.tsx`  
- `resources/js/pages/provider/jobs/board.tsx`  

**Acceptance:** Client posts “fix leaking pipe” → provider bids → client accepts → trackable hired job with location and payment path.

---

### P1.2 — Promote “Request a pro” path for on-site categories `v2`

**Problem:** Job board buried; marketplace appointment is default for all categories.  
**Fix:**

- Homepage / category UX: Home Services, Plumbing, Electrical → primary CTA “Post a job” or “Get quotes”  
- Beauty/Salon → “Book appointment”  
- Nav: expose “Post a job” in client header (currently minimal vs bookings)  

**Key files:**

- `resources/js/components/app-header.tsx`  
- `resources/js/pages/guest/welcome.tsx`  
- `resources/js/pages/guest/components/landing-page.tsx`  

**Acceptance:** User hiring a plumber is guided to job/request flow, not slot picker with fixed services.

---

### P1.3 — Support non-slot / quote-based services (medium term) `v2`

**Problem:** Every service requires `duration_minutes` + fixed `price` — wrong for many handyman jobs.  
**Fix (phased):**

- **Phase A:** Service flag `pricing_type: fixed | quote` — quote services skip slot duration or use “inspection window”  
- **Phase B:** Provider sends quote after client request; client pays via escrow when accepting quote  

**Key files:**

- `database/migrations/*_create_services_table.php` (new migration)  
- Provider service CRUD pages  
- Booking + appointment controllers  

**Acceptance:** Provider can list “Plumbing inspection — price on visit” without fake 60-min SKU.

---

## P1 — Trust loop visibility

### P1.4 — Client-facing “how payment works” on booking path

**Problem:** Escrow exists but feels hidden until payment confirm dialog.  
**Fix:**

- Persistent explainer on booking summary: “Paid upfront → held securely → released when you confirm completion”  
- Link to FAQ / cancellation policy  

**Key files:**

- `resources/js/pages/marketplace/booking/components/booking-summary.tsx`  
- `resources/js/pages/marketplace/booking/components/payment-section.tsx`  
- `resources/js/pages/guest/pages/faqs.tsx`  

**Acceptance:** New user understands why Proxideck ≠ Jiji before paying.

---

### P1.9 — Reduce wallet friction (pay-at-book narrative)

**Problem:** Client must register, top up wallet, then book — heavier than Jiji → WhatsApp → transfer. CTO’s “how money is made” includes **why this friction is worth it**.  
**Fix (phased):**

- **Phase A (copy):** Explain wallet as “secure holding account”; show exact steps; link to trust FAQ  
- **Phase B (product):** Paystack pay-at-book (charge card for booking amount without manual top-up) while still routing through escrow ledger  
- **Phase C:** Optional saved balance for repeat clients  

**Key files:**

- `resources/js/pages/marketplace/booking/components/payment-section.tsx`  
- Client wallet pages  
- Paystack initialize flows in appointment/widget controllers  

**Acceptance:** New user can complete first booking without confusion about why wallet exists; long-term, one-click pay path documented or shipped.

---

### P1.5 — Post-service confirmation UX polish

**Problem:** CTO asked for clean feedback loop after delivery.  
**Fix:** Audit and surface:

- Client confirmation prompt (email/push/in-app)  
- Clear states: pending confirmation → confirmed → reviewed  
- Dispute/report entry point from booking detail  

**Key files:**

- `resources/js/pages/client/bookings/show.tsx`  
- `resources/views/emails/client/await-client-confirmation.blade.php`  
- Notification classes under `app/Notifications/`  

**Acceptance:** After demo service, client can confirm, review, or report in ≤3 clicks from notification.

---

### P1.6 — Admin resolution playbook (process + UI)

**Problem:** “Responsible resolution” needs human process, not only code.  
**Fix:**

- Document refund/dispute SOP for support/admin  
- Ensure admin can: view escrow state, force refund, suspend user, resolve report  

**Key files:**

- `app/Http/Controllers/Admin/*`  
- Admin moderation/support pages  

**Acceptance:** Written SOP exists ([DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md)); admin demo shows dispute → refund path. Remaining engineering: one-click “Apply refund” from report screen (see SOP § Product gaps).

---

### P1.10 — Provider ops: prioritize service location in UI

**Problem:** Provider appointment detail falls back to business `location` when no service address — reinforces wrong model for on-site jobs.  
**Fix:**

- When `service_location` present: show prominently (“Go to client”); map link to client coordinates  
- When in-shop: show “Client visits you” + business address  
- Calendar/list views: icon/badge for on-site vs in-shop  

**Key files:**

- `resources/js/pages/provider/schedule/appointment-details.tsx`  
- Provider calendar / appointments list pages  
- `app/Http/Controllers/Provider/Schedule/ScheduleController.php`  

**Acceptance:** Plumber’s next job shows client address first, not shop address.

---

## P1 — Widget & distribution — **v2**

### P1.7 — Widget: home service / address support `v2`

**Problem:** Widget is Calendly-style; team booking address out of scope per `plan.md`; no on-site address in embed.  
**Fix:** Pass delivery mode to widget; collect client address when `provider_visits_client`.  

**Key files:**

- `resources/js/widgets/booking-widget.tsx`  
- `app/Http/Controllers/Api/WidgetController.php`  
- `WIDGET_IMPLEMENTATION.md`  

**Acceptance:** Embedded widget supports on-site booking with address capture.

---

### P1.8 — Guest booking friction (widget + marketplace)

**Problem:** Widget requires login; extra steps vs WhatsApp.  
**Fix (phased):** Evaluate guest checkout (email/phone + Paystack) per `WIDGET_IMPLEMENTATION.md` future enhancement.  

**Acceptance:** Document decision; implement or defer with timeline.

---

## P2 — Channels (WhatsApp & notifications)

### P2.1 — WhatsApp integration strategy

**Problem:** CTO: “Don’t lock yourself into the website”; WhatsApp is primary in Nigeria.  
**Fix (phased):**

- **Phase A:** WhatsApp Business API or deep links — booking confirmation, reminders, “confirm completion” links  
- **Phase B:** Provider receives new booking / job bid alerts on WhatsApp  
- **Phase C:** Optional two-way status bot (scope carefully)  

**Acceptance:** At least Phase A spec + one shipped notification type (e.g. booking confirmed link).

---

### P2.2 — In-app messaging (from roadmap)

**Problem:** Users fall back to WhatsApp for coordination; platform loses loop.  
**Fix:** Implement messaging per `STRATEGIC_FEATURE_ROADMAP.md` or integrate “open WhatsApp” with structured context (booking ID, address).  

**Acceptance:** Client and provider can coordinate without losing booking context.

---

## P2 — Language & taxonomy

### P2.3 — Replace generic “appointment” where inappropriate

**Problem:** “Appointment” everywhere reads salon-only.  
**Fix:** Context-aware copy:

| Context | Term |
|---------|------|
| In-shop | Appointment, booking |
| On-site | Service visit, request, job |
| Job board | Job, quote, bid |

**Key files:** Grep `appointment` in `resources/js/pages/client/**`, `marketplace/**`, emails.  

**Acceptance:** Client booking list titled “Bookings” with type badge (Appointment / Service visit / Job).

---

### P2.4 — Category defaults for delivery mode

**Problem:** New providers default to in-shop mental model.  
**Fix:** On onboarding, set suggested delivery mode by category (Plumbing → on-site; Salon → in-shop).  

**Key files:**

- `resources/js/pages/provider/onboarding/business-profile.tsx`  
- `app/Http/Controllers/Provider/Onboarding/OnboardingController.php`  

**Acceptance:** Plumber onboarding nudges “We come to you” without manual discovery of advanced settings.

---

## P2 — Discovery (secondary channel)

### P2.5 — Marketplace only after trust story is clear

**Problem:** Empty or sparse marketplace weakens discovery pitch.  
**Fix:** Seed verified providers in target city/category OR narrow launch geography on homepage (“Lagos plumbers”) until density exists.  

**Acceptance:** Homepage does not over-promise nationwide supply.

---

### P2.6 — Remove or replace placeholder marketplace stats

**Problem:** Landing page shows hardcoded stats (“2,000+ verified providers”, “4.9”, “1,951+ searches”) — credibility risk if marketplace is empty or early-stage.  
**Fix:**

- Replace with real metrics from DB **or** remove until launch threshold met  
- Use honest copy: “Early access in Lagos” / “Join as a founding provider”  

**Key files:**

- `resources/js/pages/guest/components/landing-page.tsx`  

**Acceptance:** No fabricated numbers on production unless backed by data.

---

## P3 — Technical debt & completeness

### P3.1 — Team booking (per `plan.md`)

Finish team member selection in booking, slots, schedule display.

---

### P3.2 — Recurring appointments UX

Roadmap said “no recurring”; codebase has recurrence — ensure copy and demo align.

---

### P3.3 — Job post provider notifications

**Problem:** `JobPostController`: `TODO: Fire Event to notify nearby providers`.  
**Fix:** Notify matching providers by category + location.

---

### P3.4 — Reschedule / edit booking address flow

**Problem:** Reschedule updates service address via `resolveAppointmentServiceAddressData`, but booking UI may not re-prompt for address on edit — on-site jobs can lose location context.  
**Fix:** Audit client reschedule/edit flows; require address confirmation when delivery mode is on-site.  

**Key files:**

- `resources/js/pages/client/bookings/show.tsx`  
- `app/Http/Controllers/Client/AppointmentController.php` (update/reschedule actions)  
- Marketplace booking when `reschedule_id` query param present  

**Acceptance:** Rescheduled on-site booking retains or re-confirms client service address.

---

### P3.5 — Team invite / acceptance bugs (from `plan.md`)

**Problem:** Team module partially broken (invite accept typos, wrong routes) — blocks multi-staff salons.  
**Fix:** Complete Phase 1 of `plan.md` before marketing team features.  

**Key files:** See `plan.md` § Phase 1  

**Acceptance:** Provider can invite and activate team members without broken flows.

---

## Suggested execution order

### Now — V1 launch focus (2–3 weeks)

Ship a credible **trust + appointment booking** story. Do **not** finish job board or unlock widget for users.

| Priority | Item | Why |
|----------|------|-----|
| 1 | **Align with CTO** — share [V1_SCOPE.md](./V1_SCOPE.md) + [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Stops “hire handyman” mismatch |
| 2 | P0.2 Demo script | Lead with escrow loop |
| 3 | P0.4 or P0.5 Delivery mode / wire `offers_home_service` | On-site pros via **booking**, not job board |
| 4 | P1.4 Escrow explainer on booking | Answers “why not Jiji?” |
| 5 | P0.8 + P2.6 Landing + honest stats | First impression matches v1 |
| 6 | P0.6 Copy by delivery mode | “Visit us” vs “We come to you” |
| 7 | P0.3 Brand consistency | Proxideck everywhere |
| 8 | P1.5 Confirmation UX polish | Post-service feedback loop |
| 9 | **Gate v2 surfaces** | Ensure job routes / widget not promoted; widget stays locked |

Optional v1 if capacity: P2.4 category defaults on onboarding, P0.7 map UX for on-site.

### Sprint 2 — Trust ops + on-site polish (2–3 weeks)

- P1.10 Provider sees client address first on on-site jobs  
- P1.6 Admin “Apply refund” from report (optional engineering)  
- P3.4 Reschedule address audit  
- P1.9 Phase A — explain wallet; Phase B pay-at-book if prioritized  

### V2 — After v1 proves retention (job board, widget, channels)

- P1.1, P1.2, P1.3 — job board + quotes  
- P1.7 — unlock widget in provider dashboard  
- P2.1 — WhatsApp notifications  
- P1.8 guest checkout, P2.2 messaging  

### Backlog

- P3.1 team booking, P3.3 job notifications, P3.5 team invite fixes  

---

## Definition of done (overall)

The CTO feedback is addressed when:

1. We state **distribution-first** and demo the **trust loop**, not directory browsing.  
2. On-site hire shows **client location** and “pro comes to you” — not vendor address as hero.  
3. Handyman/plumber path uses **job or request flow**, not only fixed slot + salon services.  
4. We articulate **why not Jiji** in product UI, not only in conversation.  
5. **WhatsApp** is on the roadmap with at least one concrete integration shipped or spec’d.  
6. Post-service **confirm → pay → review → dispute** is obvious to a first-time user.  

---

## References

### In `docs/`

- [PRODUCT_THESIS.md](./PRODUCT_THESIS.md)  
- [CTO_FEEDBACK.md](./CTO_FEEDBACK.md)  
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)  

### Repo root (implementation)

- `Readme.md` — feature inventory  
- `WALLET_ESCROW_IMPLEMENTATION.md` — trust/payment mechanics  
- `WIDGET_IMPLEMENTATION.md` — embed channel  
- `ROLE_SYSTEM_UPDATE.md` — dual client/provider model  
- `plan.md` — team booking scope  
- `STRATEGIC_FEATURE_ROADMAP.md` — messaging, notifications (archive/rename after thesis adopted)  

- [DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md) — admin/support playbook for refunds and disputes  