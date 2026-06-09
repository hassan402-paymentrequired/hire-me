# Proxideck — Category Verticals & Templates

**Version:** Draft 1  
**Date:** May 2026  
**Purpose:** Align on how **category grouping** drives what providers and clients see, how they interact, and how escrow fits — before we plug templates into code.

**Related:** [PRODUCT_THESIS](./PRODUCT_THESIS.md) · [V1_SCOPE](./V1_SCOPE.md) · [FIX_PLAN](./FIX_PLAN.md)

---

## One sentence

**Parent category = shared playbook (booking rules, delivery, escrow story). Subcategory = what clients search for (Salon, Barbing, Plumbing).**

We launch **deep in a few subcategories**, not wide across every trade in Nigeria.

---

## Why we’re doing this

| Problem today | After vertical templates |
|---------------|-------------------------|
| Category is only a marketplace filter tag | Category loads a **template** at onboarding |
| Salon, plumber, MUA all feel like “appointment app” | Each **parent** gets the right words and flow |
| We try to serve everyone at once | v1 = **Beauty** only; Home Services waits |
| Escrow feels generic | Escrow copy matches **why that hire is risky** |

---

## Category tree (target)

### v1 — launch now

```
Beauty & Personal Care          ← parent template (in-shop beauty playbook)
├── Salon
├── Barbing
├── Spa & Massage
├── Makeup
├── Nails
└── Lashes
```

**v1 rule:** Only these subcategories are **onboarded, marketed, and supported** at launch. Marketplace may hide or de-emphasize everything else until we expand.

### v2+ — reserved (design now, build later)

```
Home Services                   ← parent template (on-site / pro visits client)
├── Plumbing
├── Electrical Repairs
├── Cleaning
├── Carpentry
└── …
```

**Do not mix** Beauty and Home Services in one template. Different visit model, different escrow pitch, different client fear.

---

## What a vertical template controls

When a provider picks a **subcategory** at onboarding, the system loads the **parent template** and applies:

| Layer | Provider sees | Client sees |
|-------|---------------|-------------|
| **Delivery mode default** | Pre-set (e.g. visit us vs we come to you) | Address required or skipped accordingly |
| **Onboarding** | Suggested services, duration hints, optional fields | — |
| **Profile / marketplace** | Badge, CTA label, location copy | Same + trust line |
| **Booking flow** | Slot picker, service menu, payment rules | Pick service → time → pay (escrow) |
| **Language** | “Appointment” vs “Service visit” vs “Booking” | Same |
| **Escrow story** | Why hold payment, when payout releases | Why pay on platform vs cash/WhatsApp |
| **Completion loop** | Confirm done → review | Confirm done → release funds |

Subcategory can **override small things** (icon, example services, search keywords) but **inherits** parent rules unless we explicitly document an exception.

---

## v1 template: Beauty & Personal Care

### Parent defaults (all beauty subs)

| Setting | Value | Why |
|---------|--------|-----|
| Default delivery mode | `client_visits_provider` | Most salon/barber/spa/MUA work is in-shop |
| Allow `both` | Yes (optional) | Mobile barber, home-service spa, MUA at client location |
| Booking model | Fixed service + time slot | v1 — not job board, not open-ended quotes |
| Payment | Escrow at booking (when online pay on) | Client pays; funds held until visit confirmed |
| Client trust line | “Pay safely — money is held until your visit is complete” | Beauty fear = no-show, bad service, no refund path |
| Provider trust line | “Get paid after the client confirms the visit” | Reduces “will I get my money?” |

### Per subcategory (search + examples only)

| Subcategory | Client searches for | Suggested services (onboarding hints) | Notes |
|-------------|---------------------|----------------------------------------|-------|
| **Salon** | Hair, braids, treatments | Cut, wash, colour, braids | May use provider menu groups (Hair, Treatments) |
| **Barbing** | Barber, fade, beard | Cut, shave, beard trim | Often faster slots, shorter durations |
| **Spa & Massage** | Massage, spa day | Swedish massage, deep tissue, facial | Longer durations common |
| **Makeup** | MUA, glam, bridal | Bridal, soft glam, event makeup | Often `both` if mobile for events |
| **Nails** | Manicure, pedicure, gel | Gel nails, pedicure, acrylics | — |
| **Lashes** | Lash extensions, lift | Classic set, volume, lash lift | New subcategory to add in seed data |

**Your sister:** Pick **Makeup**, **Nails**, or **Lashes** based on what clients search for most — not every skill listed on one profile.

---

## Reserved template: Home Services (not v1)

Documented so we don’t paint ourselves into a corner.

| Setting | Value | Why |
|---------|--------|-----|
| Default delivery mode | `provider_visits_client` | Plumber/electrician comes to client |
| Booking model | Fixed service + slot (v1-style) or job/quote (v2) | Plumber may need “describe problem” later |
| Escrow story | “Don’t pay cash upfront and get ghosted — pay on Proxideck, release when job is done” | Main Jiji/WhatsApp pain |
| Language | “Service visit”, “Book a visit” | Not “salon appointment” |

**Plumber** lives under **Home Services → Plumbing**, not under Beauty.

---

## Escrow’s role in each parent

| Parent | Client fear | Escrow message (simple) |
|--------|-------------|-------------------------|
| **Beauty** | Paid, service was bad / no-show | Pay online; funds held until you confirm the visit |
| **Home Services** | Paid, worker never came or job half-done | Pay on platform; money releases when you confirm the job is done |

Same **mechanism** (hold → dual confirm → release). Different **words** on booking summary, emails, and profile.

---

## User journeys (same parent = same shape)

### Beauty — client

1. Browse marketplace → filter **Barbing** (or Salon, etc.)
2. Open profile → see **Visit us** badge + address
3. Pick service + time → pay (escrow)
4. Attend visit → confirm complete → review

### Beauty — provider

1. Onboarding → pick subcategory → template sets delivery + suggested services
2. Set hours + menu → go live
3. Calendar booking → complete visit → client confirms → wallet payout

### Home Services — client (future)

1. Filter **Plumbing**
2. Profile → **We come to you**
3. Add **service address** → pick service/slot → pay (escrow)
4. Job done → confirm → review

---

## Implementation plan (phased)

Do **not** rewrite the whole app. Plug templates in layers.

### Phase 0 — Align (this doc)

- [ ] Agree on v1 subcategories: Salon, Barbing, Spa & Massage, Makeup, Nails, Lashes
- [ ] Agree Home Services is documented but **not** launched in v1
- [ ] Agree parent = playbook, sub = search filter

### Phase 1 — Data model

- [ ] Add `parent_id` (nullable) to `categories` table
- [ ] Reseed categories as tree (Beauty parent + subs; Home Services parent + subs **inactive** for marketplace)
- [ ] Store `category_id` on `business_profiles` (FK) instead of free string slug only — migrate existing rows
- [ ] Add **Lashes** subcategory

**Key files:** migration, `CategorySeeder.php`, `Category.php` (parent/children relations)

### Phase 2 — Vertical config (template manifest)

- [ ] Add config e.g. `config/verticals.php` or DB `vertical_templates` keyed by **parent slug**
- [ ] Fields per parent: `default_delivery_mode`, `allows_both`, `booking_model`, `client_cta`, `escrow_copy`, `terminology`

**Key files:** new config, `ServiceDeliveryMode` / onboarding hooks read parent template

### Phase 3 — Onboarding

- [ ] Provider picks **subcategory** only (not parent alone)
- [ ] Apply parent template: delivery mode, suggested services, copy
- [ ] Hide or grey out non-v1 subcategories until we open them

**Key files:** `OnboardingController`, `business-profile.tsx`, `business-policy-modal.tsx`

### Phase 4 — Client surfaces

- [ ] Marketplace filters: parent group + subcategory chips
- [ ] Provider profile + booking use template labels and escrow line
- [ ] Homepage / landing: “Beauty in Lagos” not “every service in Nigeria”

**Key files:** `GuestController`, `MarketplaceController`, `provider.tsx`, `booking/**`, `landing-page.tsx`

### Phase 5 — Expand

- [ ] Turn on Home Services parent when ready (Plumbing first?)
- [ ] New parent = new template block in manifest — beauty unchanged

---

## v1 marketplace scope (product rule)

| Show at launch | Hide or “coming soon” |
|----------------|------------------------|
| Beauty subs (6 above) | Home Services subs |
| Lagos / early access geography | Nationwide empty categories |
| Book + escrow flow | Job board, widget ([V1_SCOPE](./V1_SCOPE.md)) |

---

## Alignment checklist (review together)

Use this when reading the doc — we’re aligned if you agree with each line:

- [ ] **Focus:** v1 is beauty (salon, barber, spa, makeup, nails, lashes) — not plumbers yet
- [ ] **Grouping:** Parent = how the product works; sub = what people search for
- [ ] **Templates:** One beauty playbook plugged in for all six subs; plumber uses a **different** playbook later
- [ ] **Escrow:** Same engine, different message per parent
- [ ] **Sister:** She picks one subcategory (Makeup / Nails / Lashes), not “everything”
- [ ] **Scale:** Add Home Services when beauty has real bookings — not before
- [ ] **No rewrite:** Phased plug-in (data → config → onboarding → UI)

---

## Open decisions (fill in after review)

| Question | Decision |
|----------|----------|
| Launch geography | e.g. Lagos only? |
| Mobile beauty (MUA at client home) | Default `both` for Makeup/Lashes? |
| Hide non-beauty categories in onboarding? | Yes / show but disabled |
| When to open Plumbing | After X providers or Y beauty bookings |

---

## Related fix plan items

| Fix ID | Link to this doc |
|--------|------------------|
| P0.4–P0.6 Delivery mode | Phase 1 output of beauty template (partially shipped) |
| P2.4 Category defaults | Phase 2–3 — template sets delivery mode from parent |
| P2.6 Honest landing stats | Phase 4 — “Early access beauty in Lagos” |
| P0.8 Landing client vs provider | Phase 4 |

---

*After you review: note changes in “Open decisions” or tell engineering which phase to start (recommend **Phase 1 + 2** first).*
